import React from 'react';
import { FileUploadArea } from '../components/FileUploadArea';
import { ProcessedInvoiceCard } from '../components/ProcessedInvoiceCard';
import { ProcessedInvoice } from '../types';

interface UploadPageProps {
    invoices: ProcessedInvoice[];
    onFileSubmit: (files: File[]) => void;
    onViewDetails: (invoiceId: string) => void;
    onDeleteInvoice: (invoiceId: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ invoices, onFileSubmit, onViewDetails, onDeleteInvoice }) => {
    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">Faturaları Yükleyin ve Verileri Çıkarın</h2>
            
            <FileUploadArea onSubmit={onFileSubmit} />

            {invoices.length > 0 ? (
              <div className="mt-12">
                <h3 className="text-2xl font-semibold mb-6 text-indigo-300">İşlem Geçmişi (Tümü)</h3>
                <div className="space-y-6">
                  {invoices.map(invoice => (
                    <ProcessedInvoiceCard 
                      key={invoice.id} 
                      invoice={invoice}
                      onViewDetails={onViewDetails}
                      onDelete={onDeleteInvoice}
                    />
                  ))}
                </div>
              </div>
            ) : (
               <div className="mt-12 text-center text-slate-400">
                 <p>Henüz işlenmiş fatura yok. Lütfen bir veya daha fazla dosya yükleyin.</p>
               </div>
            )}
        </>
    );
};
