import React from 'react';
import { ProcessedInvoice, FileProcessingStatus, ExtractedInvoiceFields } from '../types';
import { Spinner } from './Spinner';

interface ProcessedInvoiceCardProps {
  invoice: ProcessedInvoice;
}

export const ProcessedInvoiceCard: React.FC<ProcessedInvoiceCardProps> = ({ invoice }) => {
  const getStatusColor = (status: FileProcessingStatus) => {
    switch (status) {
      case FileProcessingStatus.QUEUED:
        return 'border-slate-500';
      case FileProcessingStatus.PROCESSING:
        return 'border-blue-500';
      case FileProcessingStatus.AWAITING_REVIEW:
        return 'border-yellow-500';
      case FileProcessingStatus.SUCCESS:
        return 'border-green-500';
      case FileProcessingStatus.ERROR:
        return 'border-red-500';
      default:
        return 'border-slate-700';
    }
  };

  const getStatusText = (status: FileProcessingStatus) => {
    switch (status) {
      case FileProcessingStatus.QUEUED: return "Sırada Bekliyor";
      case FileProcessingStatus.PROCESSING: return "İşleniyor...";
      case FileProcessingStatus.AWAITING_REVIEW: return "Gözden Geçirilmeyi Bekliyor";
      case FileProcessingStatus.SUCCESS: return "Onaylandı";
      case FileProcessingStatus.ERROR: return "Hata";
      default: return "Beklemede";
    }
  }

  const renderContent = () => {
    if (invoice.status === FileProcessingStatus.PROCESSING) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner />
          <p className="mt-2 text-slate-400">{getStatusText(invoice.status)}</p>
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
    
    const messageMap: { [key in FileProcessingStatus]?: string } = {
      [FileProcessingStatus.QUEUED]: 'Bu fatura işlenmek üzere sırada bekliyor.',
      [FileProcessingStatus.AWAITING_REVIEW]: 'Veriler başarıyla çıkarıldı. Onay için "Kontrol & Dışa Aktar" sayfasına gidin.',
      [FileProcessingStatus.SUCCESS]: 'Bu fatura onaylandı ve dışa aktarılmaya hazır.',
    }

    const message = messageMap[invoice.status];

    if(message){
        return (
            <div className="py-4 px-2 text-center text-slate-400">
                <p>{message}</p>
            </div>
        );
    }

    return <p className="text-slate-500 py-4 text-center">İşlem tamamlandı, ancak gösterilecek bir durum yok.</p>;
  };

  return (
    <div className={`bg-gray-900/70 shadow-xl rounded-lg overflow-hidden border-l-4 ${getStatusColor(invoice.status)} transition-all duration-300`}>
      <div className="px-4 py-3 sm:px-6 bg-slate-800/50">
        <h3 className="text-lg leading-6 font-medium text-indigo-400 break-all">{invoice.fileName}</h3>
        <p className="mt-1 max-w-2xl text-xs text-slate-400">{invoice.fileType} - {getStatusText(invoice.status)}</p>
      </div>
      <div className="border-t border-slate-800">
        {renderContent()}
      </div>
    </div>
  );
};