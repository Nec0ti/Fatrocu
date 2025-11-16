
import { ProcessedInvoice, FileProcessingStatus, ExtractedInvoiceFields, InvoiceConfig } from '../types';
import { extractInvoiceData } from './geminiService';
import * as XLSX from 'xlsx';

export const uploadInvoiceFile = async (file: File, tempId: string, config: InvoiceConfig): Promise<Partial<ProcessedInvoice>> => {
  console.log(`[API Service] Uploading file to Gemini with config "${config.name}": ${file.name}`);
  
  try {
    const { extractedData, lineItems } = await extractInvoiceData(file, config);
    
    const processedInvoice: Partial<ProcessedInvoice> = {
      id: tempId,
      fileName: file.name,
      fileType: file.type,
      status: FileProcessingStatus.SUCCESS,
      extractedData: extractedData,
      lineItems: lineItems,
    };
    console.log('[API Service] Gemini processing complete:', processedInvoice);
    return processedInvoice;

  } catch (error) {
    console.error('[API Service] Error during Gemini processing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir yapay zeka hatası oluştu.';
    
    const errorInvoice: Partial<ProcessedInvoice> = {
        id: tempId,
        fileName: file.name,
        fileType: file.type,
        status: FileProcessingStatus.ERROR,
        errorMessage: errorMessage,
    };
    return errorInvoice;
  }
};


export const downloadInvoicesAsExcel = (invoices: ProcessedInvoice[], configs: InvoiceConfig[]): void => {
  console.log(`[API Service] Requesting Excel download for ${invoices.length} invoices.`);

  const configMap = new Map(configs.map(c => [c.id, c]));

  const allMainFieldKeys = new Set<string>(['Dosya Adı']);
  const allLineItemFieldKeys = new Set<string>();
  const invoiceDataForSheet: any[] = [];
  
  const mainFieldLabels = new Map<string, string>();
  const lineItemFieldLabels = new Map<string, string>();


  // First pass: collect all possible headers from configs and custom fields
  invoices.forEach(invoice => {
    const config = configMap.get(invoice.configId);
    if(config) {
        config.fields.forEach(f => {
            if (!mainFieldLabels.has(f.key)) mainFieldLabels.set(f.key, f.label)
        });
        config.lineItemFields?.forEach(f => {
            if (!lineItemFieldLabels.has(f.key)) lineItemFieldLabels.set(f.key, f.label)
        });
    }
    invoice.customFields?.forEach(f => {
        if (!mainFieldLabels.has(f.key)) mainFieldLabels.set(f.key, f.label)
    });
    invoice.customLineItemFields?.forEach(f => {
        if (!lineItemFieldLabels.has(f.key)) lineItemFieldLabels.set(f.key, f.label)
    });
  });

  const mainHeaders = ['Dosya Adı', ...Array.from(mainFieldLabels.values())];
  const lineItemHeaders = Array.from(lineItemFieldLabels.values());
  const finalHeaders = [...mainHeaders, ...lineItemHeaders];

  // Second pass: build the data rows
  invoices.forEach(invoice => {
    if (!invoice.extractedData) return;

    const commonData: { [key: string]: any } = { 'Dosya Adı': invoice.fileName };
    mainFieldLabels.forEach((label, key) => {
        commonData[label] = invoice.extractedData?.[key]?.value || '';
    });
    
    if (invoice.lineItems && invoice.lineItems.length > 0) {
       invoice.lineItems.forEach(lineItem => {
         const lineData: { [key: string]: any } = {};
         lineItemFieldLabels.forEach((label, key) => {
            lineData[label] = lineItem[key]?.value || '';
         });
         invoiceDataForSheet.push({ ...commonData, ...lineData });
       });
    } else {
        invoiceDataForSheet.push(commonData);
    }
  });
  
  const worksheet = XLSX.utils.json_to_sheet(invoiceDataForSheet, { header: finalHeaders });
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Faturalar");

  // Set column widths dynamically for better readability
  worksheet["!cols"] = finalHeaders.map(header => ({ wch: Math.max(header.length, 15) }));

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Fatrocu_Raporu_${today}.xlsx`);
};