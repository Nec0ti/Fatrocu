
import React from 'react';
import { ProcessedInvoice, FileProcessingStatus, InvoiceConfig, FieldConfig } from '../types';
import { ProgressBar } from './ProgressBar';

interface ProcessedInvoiceCardProps {
  invoice: ProcessedInvoice;
  config: InvoiceConfig | undefined;
  onViewDetails: (invoiceId: string) => void;
  onDelete: (invoiceId: string) => void;
}

const DataRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-slate-400">{label}</dt>
    <dd className="mt-1 text-sm text-slate-200 sm:mt-0 sm:col-span-2 break-words">
      {value || <span className="italic text-slate-500">Veri yok</span>}
    </dd>
  </div>
);

export const ProcessedInvoiceCard: React.FC<ProcessedInvoiceCardProps> = ({ invoice, config, onViewDetails, onDelete }) => {
  const getStatusColor = () => {
     if (invoice.reviewStatus === 'reviewed') return 'border-green-500';
     if (invoice.status === FileProcessingStatus.SUCCESS) return 'border-yellow-500';
     if (invoice.status === FileProcessingStatus.ERROR) return 'border-red-500';
     return 'border-indigo-500';
  };

  const getStatusText = () => {
    switch (invoice.status) {
      case FileProcessingStatus.QUEUED: return "Sırada";
      case FileProcessingStatus.PROCESSING: return "Yapay Zeka İşliyor...";
      case FileProcessingStatus.SUCCESS:
        return invoice.reviewStatus === 'reviewed' ? "Onaylandı" : "Kontrol Bekliyor";
      case FileProcessingStatus.ERROR: return "Hata";
      default: return "Beklemede";
    }
  }

  const renderContent = () => {
    if (invoice.status === FileProcessingStatus.QUEUED || invoice.status === FileProcessingStatus.PROCESSING) {
      return (
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <p className="text-slate-300 font-medium">{getStatusText()}</p>
          <ProgressBar />
        </div>
      );
    }

    if (invoice.status === FileProcessingStatus.ERROR) {
      return (
        <div className="py-4 px-2 text-center text-red-400">
          <p className="font-semibold">Bir hata oluştu:</p>
          <p className="text-sm">{invoice.errorMessage || 'Bilinmeyen hata.'}</p>
        </div>
      );
    }

    if (invoice.status === FileProcessingStatus.SUCCESS && invoice.extractedData && config) {
      const data = invoice.extractedData;
      const combinedFields: FieldConfig[] = [...(config.fields || []), ...(invoice.customFields || [])];
      const fieldsToDisplay = combinedFields.slice(0, 4);

      if(fieldsToDisplay.length === 0) {
        return <p className="text-slate-400 py-4 text-center italic">Bu belge için henüz bir alan tanımlanmadı. Kontrol ekranından ekleyebilirsiniz.</p>;
      }

      return (
        <dl className="divide-y divide-slate-700">
          {fieldsToDisplay.map(field => (
             <DataRow key={field.key} label={field.label} value={data[field.key]?.value} />
          ))}
        </dl>
      );
    }
    return <p className="text-slate-400 py-4 text-center">İşlem tamamlandı, ancak gösterilecek veri yok veya yapılandırma bulunamadı.</p>;
  };
  
  const isClickable = invoice.status === FileProcessingStatus.SUCCESS || invoice.reviewStatus === 'reviewed';

  return (
    <div className={`bg-slate-800/80 shadow-xl rounded-lg overflow-hidden border-l-4 ${getStatusColor()} transition-all duration-300`}>
      <div 
        className={`px-4 py-3 sm:px-6 bg-slate-700/50 flex flex-wrap justify-between items-center gap-4 ${isClickable ? 'cursor-pointer' : ''}`}
        onClick={() => isClickable && onViewDetails(invoice.id)}
      >
        <div className="flex-grow">
          <h3 className="text-lg leading-6 font-medium text-indigo-300 break-all">{invoice.fileName}</h3>
          <p className="mt-1 max-w-2xl text-xs text-slate-400">{config?.name || 'Bilinmeyen Tip'} - {getStatusText()}</p>
        </div>
        <div className="flex items-center space-x-2">
            {invoice.reviewStatus === 'reviewed' && (
                <span className="flex items-center text-green-400 text-sm font-bold bg-green-900/50 px-3 py-1 rounded-full pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Onaylandı
                </span>
            )}
            <button
                onClick={(e) => { 
                    e.stopPropagation(); 
                    onDelete(invoice.id); 
                }}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Faturayı Sil"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>
      <div 
        className={`border-t border-slate-700 px-4 py-5 sm:p-6 ${isClickable ? 'cursor-pointer hover:bg-slate-700/30' : ''}`}
        onClick={() => isClickable && onViewDetails(invoice.id)}
      >
        {renderContent()}
      </div>
    </div>
  );
};