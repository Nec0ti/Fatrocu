
import React, { useState } from 'react';
import { InvoiceConfig, FieldConfig } from '../types';

interface SettingsPageProps {
    configs: InvoiceConfig[];
    setConfigs: React.Dispatch<React.SetStateAction<InvoiceConfig[]>>;
}

const ConfigEditor: React.FC<{
    config: InvoiceConfig,
    onSave: (config: InvoiceConfig) => void,
    onCancel: () => void,
}> = ({ config, onSave, onCancel }) => {
    const [editedConfig, setEditedConfig] = useState<InvoiceConfig>(config);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedConfig(prev => ({...prev, name: e.target.value}));
    };

    const handleFieldChange = (index: number, type: 'fields' | 'lineItemFields', e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedConfig(prev => {
            const newFields = [...(prev[type] || [])];
            newFields[index] = { ...newFields[index], [name]: value };
            return {...prev, [type]: newFields };
        });
    };

    const addField = (type: 'fields' | 'lineItemFields') => {
        const newField: FieldConfig = { key: `yeniAlan${Date.now()}`, label: 'Yeni Alan' };
        setEditedConfig(prev => ({...prev, [type]: [...(prev[type] || []), newField] }));
    };

    const removeField = (index: number, type: 'fields' | 'lineItemFields') => {
        setEditedConfig(prev => {
            const newFields = [...(prev[type] || [])];
            newFields.splice(index, 1);
            return {...prev, [type]: newFields };
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedConfig);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSave} className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-indigo-300 mb-6">{config.id.startsWith('predefined') ? 'Ön Tanımlı Yapılandırmayı Görüntüle' : 'Yapılandırmayı Düzenle'}</h3>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Yapılandırma Adı</label>
                    <input type="text" value={editedConfig.name} onChange={handleNameChange} disabled={editedConfig.isPredefined} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-100 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60"/>
                </div>

                {/* Main Fields */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">Ana Alanlar</h4>
                        {!editedConfig.isPredefined && <button type="button" onClick={() => addField('fields')} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">+ Alan Ekle</button>}
                    </div>
                    {editedConfig.fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-md">
                            <input type="text" name="label" placeholder="Etiket (örn: Fatura No)" value={field.label} onChange={e => handleFieldChange(index, 'fields', e)} disabled={editedConfig.isPredefined} className="flex-1 bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-sm disabled:opacity-60"/>
                            <input type="text" name="key" placeholder="Anahtar (örn: faturaNo)" value={field.key} onChange={e => handleFieldChange(index, 'fields', e)} disabled={editedConfig.isPredefined} className="flex-1 bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-sm disabled:opacity-60"/>
                            {!editedConfig.isPredefined && <button type="button" onClick={() => removeField(index, 'fields')} className="p-1 text-slate-400 hover:text-red-400">&times;</button>}
                        </div>
                    ))}
                </div>

                {/* Line Item Fields */}
                 <div className="space-y-4 mt-6 border-t border-slate-700 pt-6">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">Satır Kalemleri (KDV vb.)</h4>
                        {!editedConfig.isPredefined && <button type="button" onClick={() => addField('lineItemFields')} className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold">+ Alan Ekle</button>}
                    </div>
                     {(editedConfig.lineItemFields || []).map((field, index) => (
                         <div key={index} className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-md">
                             <input type="text" name="label" placeholder="Etiket (örn: KDV Oranı)" value={field.label} onChange={e => handleFieldChange(index, 'lineItemFields', e)} disabled={editedConfig.isPredefined} className="flex-1 bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-sm disabled:opacity-60"/>
                             <input type="text" name="key" placeholder="Anahtar (örn: kdvOrani)" value={field.key} onChange={e => handleFieldChange(index, 'lineItemFields', e)} disabled={editedConfig.isPredefined} className="flex-1 bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-sm disabled:opacity-60"/>
                             {!editedConfig.isPredefined && <button type="button" onClick={() => removeField(index, 'lineItemFields')} className="p-1 text-slate-400 hover:text-red-400">&times;</button>}
                         </div>
                     ))}
                </div>


                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-md hover:bg-slate-700">Kapat</button>
                    {!editedConfig.isPredefined && <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Kaydet</button>}
                </div>
            </form>
        </div>
    );
};


export const SettingsPage: React.FC<SettingsPageProps> = ({ configs, setConfigs }) => {
    const [editingConfig, setEditingConfig] = useState<InvoiceConfig | null>(null);

    const handleAddNew = () => {
        const newConfig: InvoiceConfig = {
            id: `custom-${Date.now()}`,
            name: 'Yeni Yapılandırma',
            isPredefined: false,
            fields: [{ key: 'alan1', label: 'Alan 1'}],
            lineItemFields: [],
        };
        setEditingConfig(newConfig);
    };

    const handleEdit = (config: InvoiceConfig) => {
        setEditingConfig(JSON.parse(JSON.stringify(config))); // Deep copy to avoid mutation
    };

    const handleDelete = (configId: string) => {
        if (window.confirm("Bu yapılandırmayı silmek istediğinizden emin misiniz?")) {
            setConfigs(prev => prev.filter(c => c.id !== configId));
        }
    };
    
    const handleSave = (configToSave: InvoiceConfig) => {
        setConfigs(prev => {
            const index = prev.findIndex(c => c.id === configToSave.id);
            if (index > -1) {
                const newConfigs = [...prev];
                newConfigs[index] = configToSave;
                return newConfigs;
            }
            return [...prev, configToSave];
        });
        setEditingConfig(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-indigo-400">Ayarlar: Fatura Yapılandırmaları</h2>
                <button onClick={handleAddNew} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700">
                    + Yeni Yapılandırma Ekle
                </button>
            </div>
            
            <div className="space-y-4">
                {configs.map(config => (
                    <div key={config.id} className="bg-slate-800/70 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-slate-100">{config.name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${config.isPredefined ? 'bg-cyan-800 text-cyan-200' : 'bg-slate-700 text-slate-300'}`}>
                                {config.isPredefined ? 'Ön Tanımlı' : 'Özel'}
                            </span>
                        </div>
                        <div className="space-x-2">
                             <button onClick={() => handleEdit(config)} className="px-3 py-1.5 text-sm font-medium bg-slate-700 hover:bg-slate-600 rounded-md">
                                {config.isPredefined ? 'Görüntüle' : 'Düzenle'}
                            </button>
                            {!config.isPredefined && (
                                <button onClick={() => handleDelete(config.id)} className="px-3 py-1.5 text-sm font-medium bg-red-800/50 text-red-300 hover:bg-red-700/50 rounded-md">
                                    Sil
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {editingConfig && (
                <ConfigEditor 
                    config={editingConfig} 
                    onSave={handleSave} 
                    onCancel={() => setEditingConfig(null)}
                />
            )}
        </div>
    );
};
