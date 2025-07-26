
import { ProcessedInvoice, FileProcessingStatus, ExtractedInvoiceFields } from '../types';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { fileToBase64 } from '../utils';

// Custom error for handling specific API responses like rate limiting
export class RateLimitError extends Error {
  constructor(message = "API rate limit reached. Please wait a moment.") {
    super(message);
    this.name = "RateLimitError";
  }
}

// This should be managed via environment variables in a real production setup.
// The user of this app must have `process.env.API_KEY` configured.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const BoundingBoxSchema = {
  type: Type.OBJECT,
  description: "Normalized coordinates of the text (values between 0 and 1).",
  properties: {
    x_min: { type: Type.NUMBER },
    y_min: { type: Type.NUMBER },
    x_max: { type: Type.NUMBER },
    y_max: { type: Type.NUMBER },
  },
  required: ["x_min", "y_min", "x_max", "y_max"],
};

const FieldWithBoxSchema = (description: string) => ({
  type: Type.OBJECT,
  description,
  properties: {
    value: { type: Type.STRING, description: "The extracted text value." },
    boundingBox: BoundingBoxSchema,
  },
});

const INVOICE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    faturaTuru: FieldWithBoxSchema('Faturanın türü ("Alış Faturası" veya "Satış Faturası") ve konumu. Faturanın başlığına veya içeriğine göre belirle.'),
    faturaNumarasi: FieldWithBoxSchema('Faturanın eşsiz numarası ve konumu'),
    faturaTarihi: FieldWithBoxSchema('Fatura tarihi (GG.AA.YYYY formatında) ve konumu'),
    saticiVknTckn: FieldWithBoxSchema('Satıcı firmanın Vergi Kimlik Numarası veya TCKNsi ve konumu'),
    saticiUnvan: FieldWithBoxSchema('Satıcı firmanın tam ünvanı ve konumu'),
    aliciVknTckn: FieldWithBoxSchema('Alıcı firmanın Vergi Kimlik Numarası veya TCKNsi ve konumu'),
    aliciUnvan: FieldWithBoxSchema('Alıcı firmanın tam ünvanı ve konumu'),
    kdvMatrahi: FieldWithBoxSchema('KDV hariç vergilendirilebilir tutar ve konumu'),
    kdvOrani: FieldWithBoxSchema('Uygulanan KDV oranı (sadece rakam, örn: "18") ve konumu'),
    kdvTutari: FieldWithBoxSchema('Hesaplanan KDV tutarı ve konumu'),
    genelToplam: FieldWithBoxSchema('Tüm vergiler dahil faturanın genel toplamı ve konumu'),
  },
  required: ["faturaNumarasi", "faturaTarihi", "saticiUnvan", "aliciUnvan", "genelToplam"],
};

export const uploadAndProcessInvoice = async (file: File): Promise<Partial<ProcessedInvoice>> => {
  console.log(`[API Service] Processing file: ${file.name}, MIME type: ${file.type}`);

  try {
    const base64Data = await fileToBase64(file);
    const filePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };
    
    const textPart = {
        text: `Lütfen bu fatura belgesinden verileri ve her bir verinin konumunu (bounding box) çıkarın. Yanıtınız yalnızca istenen şemayla eşleşen bir JSON nesnesi olmalıdır.`
    };
    
    console.log('[API Service] Sending request to Gemini API...');
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [filePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: INVOICE_SCHEMA,
        systemInstruction: "You are an expert OCR and data extraction assistant specializing in Turkish invoices. Your task is to accurately extract specific fields, including the invoice type (Purchase or Sales invoice), and their corresponding normalized bounding box coordinates (from 0 to 1) from the provided document (image, PDF, or XML). Respond only with the JSON object matching the requested schema. Ensure dates are in DD.MM.YYYY format and monetary values are extracted precisely. If a field's location cannot be determined, provide a null boundingBox.",
      },
    });
    
    const jsonText = response.text;
    const extractedData = JSON.parse(jsonText) as ExtractedInvoiceFields;

    return {
      status: FileProcessingStatus.AWAITING_REVIEW,
      extractedData: extractedData,
    };
  } catch (error) {
    console.error('[API Service] Error processing file:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI tarafından işlenirken bilinmeyen bir hata oluştu.';
    
    // Check for specific rate limit/quota error messages from the API
    if (errorMessage.includes('429') || errorMessage.toUpperCase().includes('RESOURCE_EXHAUSTED') || errorMessage.toLowerCase().includes('rate limit')) {
      console.warn('[API Service] Rate limit error detected.');
      throw new RateLimitError(errorMessage);
    }
    // For any other error, throw a generic error
    throw new Error(errorMessage);
  }
};

export const downloadInvoicesAsCsv = (invoices: ProcessedInvoice[], suggestedFileName: string): Promise<void> => {
  console.log(`[API Service] Requesting CSV download for ${invoices.length} invoices. Filename: ${suggestedFileName}`);
  
  return new Promise((resolve, reject) => {
    try {
      const headers = [
          "Fatura Türü", "Fatura Numarası", "Fatura Tarihi", "Satıcı VKN/TCKN", "Satıcı Ünvan", 
          "Alıcı VKN/TCKN", "Alıcı Ünvan", "KDV Matrahı", "KDV Oranı (%)", 
          "KDV Tutarı", "Genel Toplam"
      ];
      
      const rows = invoices.map(inv => {
          const data = inv.extractedData || {};
          return [
              `"${data.faturaTuru?.value || ''}"`,
              `"${data.faturaNumarasi?.value || ''}"`,
              `"${data.faturaTarihi?.value || ''}"`,
              `"${data.saticiVknTckn?.value || ''}"`,
              `"${data.saticiUnvan?.value || ''}"`,
              `"${data.aliciVknTckn?.value || ''}"`,
              `"${data.aliciUnvan?.value || ''}"`,
              `"${data.kdvMatrahi?.value || ''}"`,
              `"${data.kdvOrani?.value || ''}"`,
              `"${data.kdvTutari?.value || ''}"`,
              `"${data.genelToplam?.value || ''}"`
          ].join(';');
      });

      const csvContent = [headers.join(';'), ...rows].join('\r\n');
      console.log(`[API Service] CSV content generated with ${rows.length} rows.`);
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = suggestedFileName;
      document.body.appendChild(a);
      a.click();
      
      console.log(`[API Service] Download triggered for ${suggestedFileName}.`);
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      resolve();
    } catch (error) {
      console.error('[API Service] Error creating CSV:', error);
      reject(error);
    }
  });
};