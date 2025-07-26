export enum FileProcessingStatus {
  IDLE = 'idle', // Initial state before any action
  QUEUED = 'queued', // Waiting in line for processing
  UPLOADING = 'uploading', // File is being sent to backend
  PROCESSING = 'processing', // Backend is working on the file
  AWAITING_REVIEW = 'awaiting_review', // AI processing is done, waiting for user check
  SUCCESS = 'success', // Backend processed successfully and user approved
  ERROR = 'error', // An error occurred
}

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface FieldWithBox {
  value?: string;
  boundingBox?: BoundingBox;
}

export interface ExtractedInvoiceFields {
  faturaTuru?: FieldWithBox;
  faturaNumarasi?: FieldWithBox;
  faturaTarihi?: FieldWithBox;
  saticiVknTckn?: FieldWithBox;
  saticiUnvan?: FieldWithBox;
  aliciVknTckn?: FieldWithBox;
  aliciUnvan?: FieldWithBox;
  kdvOrani?: FieldWithBox;
  kdvTutari?: FieldWithBox;
  kdvMatrahi?: FieldWithBox;
  genelToplam?: FieldWithBox;
}

export interface ProcessedInvoice {
  id: string; // Unique ID for this processed file instance
  fileName: string;
  fileType: string; // MIME type
  status: FileProcessingStatus;
  isReviewed: boolean; // Has the user checked and approved this?
  fileDataUrl?: string; // Object URL for preview (transient, for current session)
  fileContentBase64: string; // Base64 content for persistence
  extractedData?: ExtractedInvoiceFields;
  errorMessage?: string;
}

export type AlertType = 'success' | 'error' | 'info' | 'warning';