
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractedInvoiceFields, InvoiceConfig, GroundedValue } from '../types';

// NOTE: Replace with your actual API key mechanism in a real app
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = (file: File): Promise<{ inlineData: { data: string; mimeType: string; }; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                const result = reader.result as string;
                const base64String = result.split(',')[1];
                if (!base64String) {
                    reject(new Error("Dosya okunurken Base64 verisi oluşturulamadı."));
                    return;
                }
                resolve({
                    inlineData: {
                        data: base64String,
                        mimeType: file.type,
                    },
                });
            } catch (e) {
                reject(e instanceof Error ? e : new Error('Dosya verisi işlenirken bir hata oluştu.'));
            }
        };
        reader.onerror = () => reject(new Error(`'${file.name}' dosyası okunurken bir hata oluştu.`));
        reader.readAsDataURL(file);
    });
};

const groundedValueSchema = {
    type: Type.OBJECT,
    properties: {
        value: { type: Type.STRING, description: "The extracted text value." },
        boundingPoly: {
            type: Type.ARRAY,
            description: "An array of normalized vertices [{x, y}, ...] describing the bounding polygon of the extracted text on the document. Coordinates normalized to [0,1].",
            items: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                },
                required: ["x", "y"]
            }
        }
    }
};

const buildSchemaFromConfig = (config: InvoiceConfig) => {
    const schema: any = {
        type: Type.OBJECT,
        properties: {},
        required: []
    };

    config.fields.forEach(field => {
        schema.properties[field.key] = {
            ...groundedValueSchema,
            description: `Belgeden çıkarılan '${field.label}' değeri.`
        };
    });

    if (config.lineItemFields && config.lineItemFields.length > 0) {
        const lineItemProperties: { [key: string]: any } = {};
        config.lineItemFields.forEach(field => {
            lineItemProperties[field.key] = {
                ...groundedValueSchema,
                description: `Satır kaleminden çıkarılan '${field.label}' değeri.`
            };
        });

        schema.properties['lineItems'] = {
            type: Type.ARRAY,
            description: "Belgedeki tüm satır kalemlerinin (KDV, vergi detayları vb.) listesi.",
            items: {
                type: Type.OBJECT,
                properties: lineItemProperties,
            },
        };
    }

    return schema;
};

export const extractInvoiceData = async (file: File, config: InvoiceConfig): Promise<{ extractedData: ExtractedInvoiceFields, lineItems: any[] }> => {
    console.log("[Gemini Service] Converting file to Base64...");
    const imagePart = await fileToGenerativePart(file);
    console.log("[Gemini Service] File conversion successful.");
    
    const responseSchema = buildSchemaFromConfig(config);

    const textPart = {
        text: `Bu bir "${config.name}" belgesidir. Lütfen dosyadaki bilgileri analiz ederek JSON şemasına uygun olarak verileri çıkar. Her bir alan için hem metin değerini ('value') hem de bu metnin doküman üzerindeki yerini belirten sınırlayıcı poligonu ('boundingPoly') döndür. Poligon koordinatları, sol üst köşe (0,0) ve sağ alt köşe (1,1) olacak şekilde normalleştirilmelidir. Eğer bir alanı veya onun konumunu bulamazsan, ilgili alanı boş bırak veya null olarak ayarla.`
    };

    try {
        console.log("[Gemini Service] Sending request to Gemini API...");
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            }
        });
        console.log("[Gemini Service] Received response from Gemini API.");

        const jsonString = response.text;
        const parsedData = JSON.parse(jsonString);

        const processGroundedValue = (data: any): GroundedValue | undefined => {
            if (!data || typeof data !== 'object') return undefined;
            const value = data.value ? String(data.value) : undefined;
            const boundingPoly = Array.isArray(data.boundingPoly) 
                ? data.boundingPoly.filter((p: any) => p && typeof p.x === 'number' && typeof p.y === 'number') 
                : undefined;
            if (value === undefined && boundingPoly === undefined) return undefined;
            return { value, boundingPoly };
        };

        const validatedData: ExtractedInvoiceFields = {};
        config.fields.forEach(field => {
            validatedData[field.key] = processGroundedValue(parsedData[field.key]);
        });

        let validatedLineItems: any[] = [];
        if (config.lineItemFields && parsedData.lineItems && Array.isArray(parsedData.lineItems)) {
            validatedLineItems = parsedData.lineItems.map((item: any) => {
                const lineItem: { [key: string]: GroundedValue | undefined } = {};
                config.lineItemFields!.forEach(field => {
                    lineItem[field.key] = processGroundedValue(item[field.key]);
                });
                return lineItem;
            });
        }

        return { extractedData: validatedData, lineItems: validatedLineItems };

    } catch (error) {
        console.error("Gemini API error:", error);
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Gemini API anahtarı geçersiz veya eksik. Lütfen yapılandırmanızı kontrol edin.");
        }
        throw new Error("Veriler yapay zeka tarafından işlenirken bir hata oluştu. Lütfen dosyanın okunabilir olduğundan emin olun.");
    }
};