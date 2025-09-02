
import { ProcessedInvoice, FileProcessingStatus, ExtractedInvoiceFields } from '../types';
import { extractInvoiceData } from './geminiService';
import * as XLSX from 'xlsx';

export const uploadInvoiceFile = async (file: File, tempId: string): Promise<ProcessedInvoice> => {
  console.log(`[API Service] Uploading file to Gemini: ${file.name}`);
  
  try {
    const extractedData = await extractInvoiceData(file);
    
    const processedInvoice: ProcessedInvoice = {
      id: tempId,
      fileName: file.name,
      fileType: file.type,
      status: FileProcessingStatus.SUCCESS,
      extractedData: extractedData,
    };
    console.log('[API Service] Gemini processing complete:', processedInvoice);
    return processedInvoice;

  } catch (error) {
    console.error('[API Service] Error during Gemini processing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir yapay zeka hatası oluştu.';
    
    const errorInvoice: ProcessedInvoice = {
        id: tempId,
        fileName: file.name,
        fileType: file.type,
        status: FileProcessingStatus.ERROR,
        errorMessage: errorMessage,
    };
    return errorInvoice;
  }
};


export const downloadInvoicesAsExcel = (invoices: ProcessedInvoice[]): void => {
  console.log(`[API Service] Requesting Excel download for ${invoices.length} invoices.`);

  const dataForSheet = invoices.flatMap(invoice => {
    const commonData = {
      "Fatura Numarası": invoice.extractedData?.faturaNumarasi?.value || '',
      "Fatura Tarihi": invoice.extractedData?.faturaTarihi?.value || '',
      "Fatura Türü": invoice.extractedData?.faturaTuru?.value || '',
      "Satıcı VKN/TCKN": invoice.extractedData?.saticiVknTckn?.value || '',
      "Satıcı Ünvan": invoice.extractedData?.saticiUnvan?.value || '',
      "Alıcı VKN/TCKN": invoice.extractedData?.aliciVknTckn?.value || '',
      "Alıcı Ünvan": invoice.extractedData?.aliciUnvan?.value || '',
      "Genel Toplam": invoice.extractedData?.genelToplam?.value || '',
    };

    if (invoice.extractedData?.kdvDetails && invoice.extractedData.kdvDetails.length > 0) {
      return invoice.extractedData.kdvDetails.map(detail => ({
        ...commonData,
        "KDV Oranı (%)": detail.orani?.value || '',
        "KDV Matrahı": detail.matrahi?.value || '',
        "KDV Tutarı": detail.tutari?.value || '',
      }));
    }

    // Return one row with empty KDV fields if none exist
    return [{
      ...commonData,
      "KDV Oranı (%)": '',
      "KDV Matrahı": '',
      "KDV Tutarı": '',
    }];
  });

  const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Faturalar");

  // Set column widths for better readability
  worksheet["!cols"] = [
    { wch: 20 }, // Fatura Numarası
    { wch: 15 }, // Fatura Tarihi
    { wch: 15 }, // Fatura Türü
    { wch: 20 }, // Satıcı VKN/TCKN
    { wch: 30 }, // Satıcı Ünvan
    { wch: 20 }, // Alıcı VKN/TCKN
    { wch: 30 }, // Alıcı Ünvan
    { wch: 15 }, // Genel Toplam
    { wch: 15 }, // KDV Oranı
    { wch: 15 }, // KDV Matrahı
    { wch: 15 }, // KDV Tutarı
  ];

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Fatrocu_Raporu_${today}.xlsx`);
};
