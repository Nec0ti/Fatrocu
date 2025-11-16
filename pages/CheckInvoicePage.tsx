import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProcessedInvoice, ExtractedInvoiceFields, GroundedValue, InvoiceConfig, FieldConfig } from '../types';

interface CheckInvoicePageProps {
  invoice: ProcessedInvoice;
  file: File;
  config: InvoiceConfig;
  onSave: (invoiceId: string, updatedData: ExtractedInvoiceFields, updatedLineItems: any[], customFields: FieldConfig[], customLineItemFields: FieldConfig[]) => void;
  onSaveAndNext: (invoiceId: string, updatedData: ExtractedInvoiceFields, updatedLineItems: any[], customFields: FieldConfig[], customLineItemFields: FieldConfig[]) => void;
  onBack: () => void;
  pendingReviewIds: string[];
  onNavigateToInvoice: (id: string) => void;
}

// Helper to generate a camelCase key from a label
const generateKeyFromLabel = (label: string): string => {
    return label
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .replace(/[^a-zA-Z0-9\s]/g, '') // remove special chars
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((word, index) => 
            index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('');
};

const DynamicField: React.FC<{
    field: FieldConfig,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove?: () => void
}> = ({ field, value, onChange, onRemove }) => (
    <div className="flex items-center gap-2">
        <div className="flex-grow">
            <label htmlFor={field.key} className="block text-sm font-medium text-slate-300 mb-1">{field.label}</label>
            <input
                type="text"
                id={field.key}
                name={field.key}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        {onRemove && (
            <button onClick={onRemove} className="p-2 text-slate-400 hover:text-red-400 self-end mb-1" aria-label={`'${field.label}' alanını sil`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
            </button>
        )}
    </div>
);


export const CheckInvoicePage: React.FC<CheckInvoicePageProps> = ({ invoice, file, config, onSave, onSaveAndNext, onBack, pendingReviewIds, onNavigateToInvoice }) => {
    const [formData, setFormData] = useState<ExtractedInvoiceFields>(invoice.extractedData || {});
    const [lineItems, setLineItems] = useState<any[]>(invoice.lineItems || []);
    const [customFields, setCustomFields] = useState<FieldConfig[]>(invoice.customFields || []);
    const [customLineItemFields, setCustomLineItemFields] = useState<FieldConfig[]>(invoice.customLineItemFields || []);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    
    const previewContentRef = useRef<HTMLImageElement & HTMLIFrameElement>(null);

    useEffect(() => {
        setFormData(invoice.extractedData || {});
        setLineItems(invoice.lineItems || []);
        setCustomFields(invoice.customFields || []);
        setCustomLineItemFields(invoice.customLineItemFields || []);
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [invoice, file]);

    const allMainFields = useMemo(() => [...config.fields, ...customFields], [config.fields, customFields]);
    const allLineItemFields = useMemo(() => [...(config.lineItemFields || []), ...customLineItemFields], [config.lineItemFields, customLineItemFields]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: { ...(prev[name] as GroundedValue || {}), value: value }
        }));
    };

    const handleLineItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLineItems(prev => {
            const newLineItems = [...prev];
            const itemToUpdate = { ...newLineItems[index] };
            itemToUpdate[name] = { ...(itemToUpdate[name] as GroundedValue || {}), value: value };
            newLineItems[index] = itemToUpdate;
            return newLineItems;
        });
    };
    
    const addField = (type: 'main' | 'lineItem') => {
        const label = window.prompt(`Yeni alanın adını girin:`);
        if (!label) return;

        const key = generateKeyFromLabel(label);
        const newField: FieldConfig = { key, label };

        if (type === 'main') {
             if (allMainFields.some(f => f.key === key)) {
                alert("Bu anahtar zaten kullanımda. Lütfen farklı bir ad seçin.");
                return;
            }
            setCustomFields(prev => [...prev, newField]);
        } else {
             if (allLineItemFields.some(f => f.key === key)) {
                alert("Bu anahtar zaten kullanımda. Lütfen farklı bir ad seçin.");
                return;
            }
            setCustomLineItemFields(prev => [...prev, newField]);
        }
    };

    const removeCustomField = (key: string, type: 'main' | 'lineItem') => {
        if (type === 'main') {
            setCustomFields(prev => prev.filter(f => f.key !== key));
            setFormData(prev => {
                const newData = {...prev};
                delete newData[key];
                return newData;
            });
        } else {
            setCustomLineItemFields(prev => prev.filter(f => f.key !== key));
            setLineItems(prev => prev.map(item => {
                const newItem = {...item};
                delete newItem[key];
                return newItem;
            }));
        }
    };


    const addLineItem = () => {
        const newLine = allLineItemFields.reduce((acc, field) => ({ ...acc, [field.key]: { value: '' } }), {}) || {};
        setLineItems(prev => [...prev, newLine]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveClick = () => onSave(invoice.id, formData, lineItems, customFields, customLineItemFields);
    const handleSaveAndNextClick = () => onSaveAndNext(invoice.id, formData, lineItems, customFields, customLineItemFields);

    const currentIndex = pendingReviewIds.indexOf(invoice.id);
    const hasNext = currentIndex !== -1 && currentIndex < pendingReviewIds.length - 1;
    const hasPrev = currentIndex !== -1 && currentIndex > 0;

    const navigate = (direction: 'next' | 'prev') => {
        if (direction === 'next' && hasNext) onNavigateToInvoice(pendingReviewIds[currentIndex + 1]);
        if (direction === 'prev' && hasPrev) onNavigateToInvoice(pendingReviewIds[currentIndex - 1]);
    };

    const filePreview = useMemo(() => {
        if (!filePreviewUrl) return <div className="flex items-center justify-center h-full bg-slate-900 rounded-lg"><p className="text-slate-400">Önizleme yükleniyor...</p></div>;
        if (file.type.startsWith('image/')) {
            return <img ref={previewContentRef} src={filePreviewUrl} alt="Fatura Önizlemesi" className="max-w-full max-h-full object-contain" />;
        }
        return <iframe ref={previewContentRef} src={filePreviewUrl} title="Fatura Önizlemesi" className="w-full h-full border-0 rounded-lg bg-white" />;
    }, [filePreviewUrl, file.type]);

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
                <button onClick={onBack} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Listeye Geri Dön
                </button>
                {currentIndex !== -1 && (
                     <div className="flex items-center space-x-2">
                        <button onClick={() => navigate('prev')} disabled={!hasPrev} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </button>
                        <span className="text-sm font-semibold text-slate-300 px-2">
                            {currentIndex + 1} / {pendingReviewIds.length}
                        </span>
                        <button onClick={() => navigate('next')} disabled={!hasNext} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        </button>
                     </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/80 shadow-xl rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-indigo-300 mb-4">Verileri Kontrol Et ve Düzelt</h3>
                    <p className="text-sm text-slate-400 mb-6">Yapay zeka tarafından çıkarılan verileri kontrol edin veya manuel olarak verileri girin.</p>
                    
                    <div className="space-y-4">
                        {allMainFields.map(field => {
                           const isCustom = !config.fields.find(f => f.key === field.key);
                           return <DynamicField key={field.key} field={field} value={formData[field.key]?.value || ''} onChange={handleInputChange} onRemove={isCustom ? () => removeCustomField(field.key, 'main') : undefined} />
                        })}
                    </div>
                    <button onClick={() => addField('main')} className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-semibold">+ Ana Alan Ekle</button>
                    
                    <div className="mt-6 border-t border-slate-600 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-indigo-300">Satır Kalemleri</h4>
                            <div className="flex items-center gap-4">
                                <button onClick={() => addField('lineItem')} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">+ Sütun Ekle</button>
                                <button onClick={addLineItem} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    Satır Ekle
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {allLineItemFields.length > 0 && lineItems.length > 0 && (
                                <div className={`hidden md:grid gap-3 px-3`} style={{ gridTemplateColumns: `repeat(${allLineItemFields.length}, 1fr) auto`}}>
                                    {allLineItemFields.map(field => {
                                        const isCustom = !config.lineItemFields?.find(f => f.key === field.key);
                                        return (
                                            <div key={field.key} className="flex items-center gap-1 group relative">
                                                <label className="text-xs font-semibold text-slate-400">{field.label}</label>
                                                {isCustom && (
                                                    <button
                                                        onClick={() => removeCustomField(field.key, 'lineItem')}
                                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        aria-label={`'${field.label}' sütununu sil`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                            {lineItems.map((item, index) => (
                              <div key={index} className={`grid gap-3 items-center bg-slate-700/50 p-3 rounded-md`} style={{ gridTemplateColumns: allLineItemFields.length > 0 ? `repeat(${allLineItemFields.length}, 1fr) auto` : 'auto'}}>
                                {allLineItemFields.map(field => (
                                    <input key={field.key} type="text" name={field.key} placeholder={field.label} value={item[field.key]?.value || ''} onChange={e => handleLineItemChange(index, e)} className="md:col-span-1 w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                ))}
                                {allLineItemFields.length > 0 &&
                                    <button onClick={() => removeLineItem(index)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full justify-self-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                    </button>
                                }
                              </div>
                            ))}
                            {allLineItemFields.length > 0 && lineItems.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Satır kalemi bulunamadı. Eklemek için 'Satır Ekle'yi kullanın.</p>}
                            {allLineItemFields.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Bu tabloya veri eklemek için önce "Sütun Ekle" ile bir sütun oluşturun.</p>}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-4">
                        <button onClick={handleSaveClick} className="px-6 py-2.5 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 transition-all">
                            Kaydet
                        </button>
                        <button onClick={handleSaveAndNextClick} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all">
                            Kaydet ve Onayla
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800/80 shadow-xl rounded-lg p-4 flex items-center justify-center h-[85vh] sticky top-24">
                   <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                       {filePreview}
                   </div>
                </div>
            </div>
        </div>
    );
};