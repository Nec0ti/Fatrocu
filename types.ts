
export enum FileProcessingStatus {
  IDLE = 'idle',
  QUEUED = 'queued', // Waiting in the upload queue
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type ReviewStatus = 'pending' | 'reviewed';

// New type for a value with its location data
export interface GroundedValue {
  value?: string;
  // Normalized coordinates of the bounding polygon
  boundingPoly?: Array<{ x: number; y: number; }>;
}


export interface KdvDetail {
  orani?: GroundedValue;
  matrahi?: GroundedValue;
  tutari?: GroundedValue;
}

export interface ExtractedInvoiceFields {
  faturaNumarasi?: GroundedValue;
  faturaTarihi?: GroundedValue;
  faturaTuru?: GroundedValue; // 'Alış Faturası' veya 'Satış Faturası'
  saticiVknTckn?: GroundedValue;
  saticiUnvan?: GroundedValue;
  aliciVknTckn?: GroundedValue;
  aliciUnvan?: GroundedValue;
  kdvDetails?: KdvDetail[];
  genelToplam?: GroundedValue;
}

export interface ProcessedInvoice {
  id: string;
  fileName: string;
  fileType: string;
  status: FileProcessingStatus;
  reviewStatus?: ReviewStatus;
  extractedData?: ExtractedInvoiceFields;
  errorMessage?: string;
}

export type AlertType = 'success' | 'error' | 'info' | 'warning';
