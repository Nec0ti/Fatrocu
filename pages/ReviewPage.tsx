import React from 'react';
import { ProcessedInvoiceCard } from '../components/ProcessedInvoiceCard';
import { ProcessedInvoice } from '../types';

interface ReviewPageProps {
    invoices: ProcessedInvoice[];
    onViewDetails: (invoiceId: string) => void;
    onDeleteInvoice: (invoiceId: string) => void;
}

export const ReviewPage: React.FC<ReviewPageProps> = ({ invoices, onViewDetails, onDeleteInvoice }) => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-center mb-8 text-yellow-400">Kontrol Bekleyen Faturalar</h2>
            {invoices.length > 0 ? (
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
            ) : (
                <div className="mt-12 text-center text-slate-400 bg-slate-800/50 rounded-lg py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-slate-200">Harika İş!</h3>
                    <p className="mt-2 text-slate-300">Kontrol edilecek fatura kalmadı.</p>
                </div>
            )}
        </div>
    );
};
