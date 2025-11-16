
import React from 'react';
import { FileUploadArea } from '../components/FileUploadArea';
import { ProcessedInvoiceCard } from '../components/ProcessedInvoiceCard';
import { ProcessedInvoice, InvoiceConfig } from '../types';

interface UploadPageProps {
    invoices: ProcessedInvoice[];
    configs: InvoiceConfig[];
    activeConfigId: string;
    onActiveConfigChange: (id: string) => void;
    onFileSubmit: (files: File[]) => void;
    onViewDetails: (invoiceId: string) => void;
    onDeleteInvoice: (invoiceId: string) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ invoices, configs, activeConfigId, onActiveConfigChange, onFileSubmit, onViewDetails, onDeleteInvoice }) => {
    const configMap = new Map(configs.map(c => [c.id, c]));

    return (
        <>
            <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">Faturaları Yükleyin ve Verileri Çıkarın</h2>
            
            <div className="max-w-xl mx-auto mb-6">
                <label htmlFor="config-select" className="block text-sm font-medium text-slate-300 mb-2">
                    İşlem Yapılandırması Seçin:
                </label>
                <select
                    id="config-select"
                    value={activeConfigId}
                    onChange={(e) => onActiveConfigChange(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {configs.map(config => (
                        <option key={config.id} value={config.id}>
                            {config.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <FileUploadArea onSubmit={onFileSubmit} />

            {invoices.length > 0 ? (
              <div className="mt-12">
                <h3 className="text-2xl font-semibold mb-6 text-indigo-300">İşlem Geçmişi (Tümü)</h3>
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
              </div>
            ) : (
               <div className="mt-12 text-center text-slate-400">
                 <p>Henüz işlenmiş fatura yok. Lütfen bir veya daha fazla dosya yükleyin.</p>
               </div>
            )}
        </>
    );
};
