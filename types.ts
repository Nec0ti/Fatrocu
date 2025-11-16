
export enum FileProcessingStatus {
  IDLE = 'idle',
  QUEUED = 'queued', // Waiting in the upload queue
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type ReviewStatus = 'pending' | 'reviewed';

// A value with its location data
export interface GroundedValue {
  value?: string;
  // Normalized coordinates of the bounding polygon
  boundingPoly?: Array<{ x: number; y: number; }>;
}

// A single field definition in a configuration
export interface FieldConfig {
  key: string; // e.g., faturaNumarasi
  label: string; // e.g., Fatura Numarası
}

// Configuration for a document type
export interface InvoiceConfig {
  id: string;
  name: string;
  isPredefined: boolean; // Cannot be deleted if true
  fields: FieldConfig[]; // Main fields
  lineItemFields?: FieldConfig[]; // Fields for line items/KDV details
}

// The data extracted for an invoice. A flexible key-value store.
export interface ExtractedInvoiceFields {
  [key: string]: GroundedValue | undefined;
}

// The processed invoice object
export interface ProcessedInvoice {
  id: string;
  fileName: string;
  fileType: string;
  status: FileProcessingStatus;
  reviewStatus?: ReviewStatus;
  extractedData?: ExtractedInvoiceFields;
  lineItems?: Array<{ [key: string]: GroundedValue | undefined }>; // For KDV details or other line items
  errorMessage?: string;
  configId: string; // Which configuration was used
  customFields?: FieldConfig[]; // User-added fields during review
  customLineItemFields?: FieldConfig[]; // User-added line item fields
}

export type AlertType = 'success' | 'error' | 'info' | 'warning';