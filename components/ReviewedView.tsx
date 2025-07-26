
import React from 'react';
import { ProcessedInvoice, FileProcessingStatus } from '../types';
import { ProcessedInvoiceCard } from './ProcessedInvoiceCard';

interface ReviewedViewProps {
  invoices: ProcessedInvoice[];
  onRequestDelete: (invoiceId: string) => void;
  onRequestRevert: (invoiceId: string) => void;
}

export const ReviewedView: React.FC<ReviewedViewProps> = ({ invoices, onRequestDelete, onRequestRevert }) => {

  const reviewedInvoices = invoices.filter(
    (inv) => inv.isReviewed && inv.status === FileProcessingStatus.SUCCESS
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">Onaylanmış Faturalar</h2>
      {reviewedInvoices.length > 0 ? (
        <div className="space-y-6">
          {reviewedInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center gap-4">
              <div className="flex-grow">
                <ProcessedInvoiceCard invoice={invoice} />
              </div>
              <div className="flex flex-col gap-2">
                 <button 
                  type="button"
                  onClick={() => onRequestRevert(invoice.id)}
                  className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-colors text-sm whitespace-nowrap"
                  aria-label={`${invoice.fileName} için kontrol aşamasına geri al`}
                >
                  Kontrole Geri Al
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDelete(invoice.id)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors text-sm"
                  aria-label={`${invoice.fileName} için sil`}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 text-center text-slate-500">
          <p>Henüz onaylanmış fatura yok.</p>
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mt-4 h-24 w-24 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};
