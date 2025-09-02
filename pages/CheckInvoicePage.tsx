import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProcessedInvoice, ExtractedInvoiceFields, KdvDetail, GroundedValue } from '../types';

interface CheckInvoicePageProps {
  invoice: ProcessedInvoice;
  file: File;
  onSave: (invoiceId: string, updatedData: ExtractedInvoiceFields) => void;
  onBack: () => void;
  isReadOnly: boolean;
}

const InputField: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    isReadOnly: boolean; 
}> = ({ label, name, value, onChange, isReadOnly }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={isReadOnly}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm read-only:bg-slate-800 read-only:cursor-not-allowed"
        />
    </div>
);

const SelectField: React.FC<{ 
    label: string; 
    name: string; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
    isReadOnly: boolean; 
    children: React.ReactNode;
}> = ({ label, name, value, onChange, isReadOnly, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={isReadOnly}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm read-only:bg-slate-800 read-only:cursor-not-allowed"
        >
            {children}
        </select>
    </div>
);

export const CheckInvoicePage: React.FC<CheckInvoicePageProps> = ({ invoice, file, onSave, onBack, isReadOnly }) => {
    const [formData, setFormData] = useState<ExtractedInvoiceFields>(
      invoice.extractedData || {}
    );
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    
    const previewContentRef = useRef<HTMLImageElement & HTMLIFrameElement>(null);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof Omit<ExtractedInvoiceFields, 'kdvDetails'>;
        setFormData(prev => ({
            ...prev,
            [fieldName]: {
                ...(prev[fieldName] as GroundedValue || {}),
                value: value,
            }
        }));
    };

    const handleKdvChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof KdvDetail;
        setFormData(prev => {
            const newKdvDetails = [...(prev.kdvDetails || [])];
            const detailToUpdate = { ...newKdvDetails[index] };
            detailToUpdate[fieldName] = {
                ...(detailToUpdate[fieldName] as GroundedValue || {}),
                value: value,
            };
            newKdvDetails[index] = detailToUpdate;
            return { ...prev, kdvDetails: newKdvDetails };
        });
    };

    const addKdvLine = () => {
        const newKdvLine: KdvDetail = { orani: {value: ''}, matrahi: {value: ''}, tutari: {value: ''} };
        const newKdvDetails = [...(formData.kdvDetails || []), newKdvLine];
        setFormData(prev => ({ ...prev, kdvDetails: newKdvDetails }));
    };

    const removeKdvLine = (index: number) => {
        const newKdvDetails = [...(formData.kdvDetails || [])];
        newKdvDetails.splice(index, 1);
        setFormData(prev => ({ ...prev, kdvDetails: newKdvDetails }));
    };

    const handleSaveClick = () => {
        onSave(invoice.id, formData);
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
            <button onClick={onBack} className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Listeye Geri Dön
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/80 shadow-xl rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-indigo-300 mb-4">{isReadOnly ? 'Onaylanmış Fatura Detayları' : 'AI Verilerini Kontrol Et ve Düzelt'}</h3>
                    <p className="text-sm text-slate-400 mb-6">
                        {isReadOnly ? 'Bu fatura zaten onaylanmıştır ve düzenlenemez.' : 'Yapay zeka tarafından çıkarılan verileri kontrol edin ve gerekirse düzeltin.'}
                    </p>
                    <div className="space-y-4">
                        <InputField label="Fatura Numarası" name="faturaNumarasi" value={formData.faturaNumarasi?.value || ''} onChange={handleInputChange} isReadOnly={isReadOnly} />
                        <InputField label="Fatura Tarihi" name="faturaTarihi" value={formData.faturaTarihi?.value || ''} onChange={handleInputChange} isReadOnly={isReadOnly} />
                        <SelectField label="Fatura Türü" name="faturaTuru" value={formData.faturaTuru?.value || ''} onChange={handleInputChange} isReadOnly={isReadOnly}>
                            <option value="">Seçiniz...</option>
                            <option value="Alış Faturası">Alış Faturası</option>
                            <option value="Satış Faturası">Satış Faturası</option>
                        </SelectField>
                        <InputField label="Satıcı Ünvan" name="saticiUnvan" value={formData.saticiUnvan?.value || ''} onChange={handleInputChange} isReadOnly={isReadOnly} />
                        <InputField label="Alıcı Ünvan" name="aliciUnvan" value={formData.aliciUnvan?.value || ''} onChange={handleInputChange} isReadOnly={isReadOnly} />
                        <InputField label="Genel Toplam" name="genelToplam" value={formData.genelToplam?.value || ''} onChange={handleInputChange} isReadOnly={isReadOnly} />
                    </div>

                    <div className="mt-6 border-t border-slate-600 pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-indigo-300">KDV Detayları</h4>
                        {!isReadOnly && (
                            <button onClick={addKdvLine} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                KDV Satırı Ekle
                            </button>
                        )}
                      </div>
                      <div className="space-y-4">
                         {(formData.kdvDetails?.length || 0) > 0 && (
                            <div className="hidden md:grid grid-cols-4 gap-3 px-3">
                                <label className="text-xs font-semibold text-slate-400">KDV Oranı (%)</label>
                                <label className="text-xs font-semibold text-slate-400">KDV Matrahı</label>
                                <label className="text-xs font-semibold text-slate-400">KDV Tutarı</label>
                            </div>
                         )}
                        {(formData.kdvDetails || []).map((detail, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center bg-slate-700/50 p-3 rounded-md">
                            <input type="text" name="orani" placeholder="KDV Oranı (%)" value={detail.orani?.value || ''} onChange={e => handleKdvChange(index, e)} disabled={isReadOnly} className="md:col-span-1 w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 text-sm focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-800 read-only:cursor-not-allowed" />
                            <input type="text" name="matrahi" placeholder="KDV Matrahı" value={detail.matrahi?.value || ''} onChange={e => handleKdvChange(index, e)} disabled={isReadOnly} className="md:col-span-1 w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 text-sm focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-800 read-only:cursor-not-allowed" />
                            <input type="text" name="tutari" placeholder="KDV Tutarı" value={detail.tutari?.value || ''} onChange={e => handleKdvChange(index, e)} disabled={isReadOnly} className="md:col-span-1 w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 text-sm focus:ring-indigo-500 focus:border-indigo-500 read-only:bg-slate-800 read-only:cursor-not-allowed" />
                            {!isReadOnly && (
                                <button onClick={() => removeKdvLine(index)} className="md:col-span-1 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-full justify-self-center md:justify-self-end">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                          </div>
                        ))}
                         {(formData.kdvDetails?.length === 0) && <p className="text-slate-500 text-sm text-center py-4">KDV detayı bulunamadı. {isReadOnly ? '' : 'Eklemek için butonu kullanın.'}</p>}
                      </div>
                    </div>

                    {!isReadOnly && (
                        <div className="mt-8 flex items-center justify-end">
                            <button onClick={handleSaveClick} className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out">
                                Kaydet ve Onayla
                            </button>
                        </div>
                    )}
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