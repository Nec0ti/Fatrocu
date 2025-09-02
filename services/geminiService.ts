
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractedInvoiceFields, KdvDetail, GroundedValue } from '../types';

const ai = new GoogleGenAI({ apiKey: "AIzaSyA17cwo1GjF2aasi7odKwrrb6oFQH308iM" });

const fileToGenerativePart = (file: File): Promise<{ inlineData: { data: string; mimeType: string; }; }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            try {
                const result = reader.result as string;
                // result is a data URL like "data:image/png;base64,iVBORw0KGgo..."
                // We need to extract the base64 part after the comma.
                const base64String = result.split(',')[1];
                if (!base64String) {
                    reject(new Error("Dosya okunurken Base64 verisi oluşturulamadı. Dosya formatı bozuk olabilir."));
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

        reader.onerror = () => {
            reject(new Error(`'${file.name}' dosyası okunurken bir hata oluştu.`));
        };
        
        reader.readAsDataURL(file);
    });
};

// Schema for a value with its bounding polygon
const groundedValueSchema = {
    type: Type.OBJECT,
    properties: {
        value: { type: Type.STRING, description: "The extracted text value." },
        boundingPoly: {
            type: Type.ARRAY,
            description: "An array of normalized vertices [{x, y}, ...] describing the bounding polygon of the extracted text on the document. The coordinates should be normalized between 0 and 1, with (0,0) being the top-left corner.",
            items: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER, description: "Normalized horizontal coordinate." },
                    y: { type: Type.NUMBER, description: "Normalized vertical coordinate." },
                },
                required: ["x", "y"]
            }
        }
    }
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        faturaNumarasi: { ...groundedValueSchema, description: "Faturanın benzersiz numarası." },
        faturaTarihi: { ...groundedValueSchema, description: "Faturanın düzenlendiği tarih (GG.AA.YYYY formatında)." },
        faturaTuru: { ...groundedValueSchema, description: "Faturanın türünü 'Alış Faturası' veya 'Satış Faturası' olarak belirle. Bu, alıcı ve satıcı bilgilerine göre anlaşılır." },
        saticiVknTckn: { ...groundedValueSchema, description: "Satıcı firmanın Vergi Kimlik Numarası veya T.C. Kimlik Numarası." },
        saticiUnvan: { ...groundedValueSchema, description: "Satıcı firmanın tam ticari ünvanı." },
        aliciVknTckn: { ...groundedValueSchema, description: "Alıcı firmanın Vergi Kimlik Numarası veya T.C. Kimlik Numarası." },
        aliciUnvan: { ...groundedValueSchema, description: "Alıcı firmanın tam ticari ünvanı." },
        kdvDetails: {
            type: Type.ARRAY,
            description: "Faturadaki tüm Katma Değer Vergisi kalemlerinin listesi. Her KDV oranı için ayrı bir nesne olmalıdır.",
            items: {
                type: Type.OBJECT,
                properties: {
                    orani: { ...groundedValueSchema, description: "Uygulanan KDV oranı (örneğin '18', '20'). Sadece rakam." },
                    matrahi: { ...groundedValueSchema, description: "Bu KDV oranına tabi olan tutarların toplamı (vergisiz tutar)." },
                    tutari: { ...groundedValueSchema, description: "Bu KDV oranı için hesaplanan vergi tutarı." },
                },
            },
        },
        genelToplam: { ...groundedValueSchema, description: "Faturanın KDV dahil ödenecek toplam tutarı." },
    },
    required: ["faturaNumarasi", "faturaTarihi", "saticiUnvan", "aliciUnvan", "genelToplam", "faturaTuru"]
};


export const extractInvoiceData = async (file: File): Promise<ExtractedInvoiceFields> => {
    console.log("[Gemini Service] Converting file to Base64...");
    const imagePart = await fileToGenerativePart(file);
    console.log("[Gemini Service] File conversion successful.");
    
    const textPart = {
        text: "Bu bir fatura dosyasıdır. Lütfen dosyadaki bilgileri analiz ederek JSON şemasına uygun olarak fatura verilerini çıkar. Her bir alan için hem metin değerini ('value') hem de bu metnin doküman üzerindeki yerini belirten sınırlayıcı poligonu ('boundingPoly') döndür. Poligon koordinatları, sol üst köşe (0,0) ve sağ alt köşe (1,1) olacak şekilde normalleştirilmelidir. Faturanın alıcı ve satıcı bilgilerine bakarak 'Alış Faturası' mı yoksa 'Satış Faturası' mı olduğunu belirle ve 'faturaTuru' alanına yaz. Faturada birden fazla KDV oranı varsa, her birini 'kdvDetails' listesine ayrı birer öğe olarak ekle. Eğer bir alanı veya onun konumunu bulamazsan, ilgili alanı boş bırak veya `null` olarak ayarla."
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

        // Helper to process a grounded value object from the parsed JSON
        const processGroundedValue = (data: any): GroundedValue => {
            if (!data || typeof data !== 'object') {
                return { value: undefined, boundingPoly: undefined };
            }
            const value = data.value ? String(data.value) : undefined;
            const boundingPoly = Array.isArray(data.boundingPoly) 
                ? data.boundingPoly.filter((p: any) => p && typeof p.x === 'number' && typeof p.y === 'number') 
                : undefined;
            return { value, boundingPoly };
        };

        const validatedData: ExtractedInvoiceFields = {
            faturaNumarasi: processGroundedValue(parsedData.faturaNumarasi),
            faturaTarihi: processGroundedValue(parsedData.faturaTarihi),
            faturaTuru: processGroundedValue(parsedData.faturaTuru),
            saticiVknTckn: processGroundedValue(parsedData.saticiVknTckn),
            saticiUnvan: processGroundedValue(parsedData.saticiUnvan),
            aliciVknTckn: processGroundedValue(parsedData.aliciVknTckn),
            aliciUnvan: processGroundedValue(parsedData.aliciUnvan),
            genelToplam: processGroundedValue(parsedData.genelToplam),
            kdvDetails: [],
        };
        
        if (parsedData.kdvDetails && Array.isArray(parsedData.kdvDetails)) {
            validatedData.kdvDetails = parsedData.kdvDetails.map((detail: any): KdvDetail => ({
                orani: processGroundedValue(detail.orani),
                matrahi: processGroundedValue(detail.matrahi),
                tutari: processGroundedValue(detail.tutari),
            }));
        }

        return validatedData;

    } catch (error) {
        console.error("Gemini API error:", error);
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Gemini API anahtarı geçersiz veya eksik. Lütfen yapılandırmanızı kontrol edin.");
        }
        throw new Error("Fatura verileri yapay zeka tarafından işlenirken bir hata oluştu. Lütfen dosyanın okunabilir olduğundan veya API anahtarınızın doğru olduğundan emin olun.");
    }
};
