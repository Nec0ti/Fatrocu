
import React from 'react';
import { ProcessedInvoiceCard } from '../components/ProcessedInvoiceCard';
import { ProcessedInvoice, InvoiceConfig } from '../types';

interface ApprovedPageProps {
    invoices: ProcessedInvoice[];
    configs: InvoiceConfig[];
    onViewDetails: (invoiceId: string) => void;
    onDeleteInvoice: (invoiceId: string) => void;
    onClearApproved: () => void;
}

export const ApprovedPage: React.FC<ApprovedPageProps> = ({ invoices, configs, onViewDetails, onDeleteInvoice, onClearApproved }) => {
    const configMap = new Map(configs.map(c => [c.id, c]));
    
    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h2 className="text-3xl font-bold text-green-400">Onaylanmış & Arşivlenmiş Faturalar</h2>
                {invoices.length > 0 && (
                     <button
                        onClick={onClearApproved}
                        className="px-4 py-2 bg-red-800/60 text-red-200 font-semibold rounded-lg shadow-md hover:bg-red-700/60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-colors"
                        aria-label={`Tüm ${invoices.length} onaylanmış faturayı temizle`}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                        Onaylanmışları Temizle ({invoices.length})
                    </button>
                )}
            </div>

            {invoices.length > 0 ? (
                <div className="space-y-6">
                    {invoices.map(invoice => (
                        <ProcessedInvoiceCard 
                            key={invoice.id} 
                            invoice={invoice}
                            config={configMap.get(invoice.configId)}
                            onViewDetails={onViewDetails}
                            onDelete={onDeleteInvoice}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-12 text-center text-slate-400 bg-slate-800/50 rounded-lg py-12">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-slate-200">Arşiv Boş</h3>
                    <p className="mt-2 text-slate-300">Henüz onaylanmış bir fatura bulunmuyor.</p>
                </div>
            )}
        </div>
    );
};
