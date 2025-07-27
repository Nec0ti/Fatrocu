import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ProcessedInvoice, ExtractedInvoiceFields, FileProcessingStatus, AlertType, BoundingBox } from '../types';
import { downloadInvoicesAsCsv } from '../services/apiService';
import { AlertMessage } from './AlertMessage';

interface FilePreviewWithHighlightProps {
  invoice: ProcessedInvoice;
  editedData?: ExtractedInvoiceFields | null;
  hoveredFieldKey?: keyof ExtractedInvoiceFields | null;
}

const FilePreviewWithHighlight: React.FC<FilePreviewWithHighlightProps> = ({ invoice, editedData, hoveredFieldKey }) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [renderedImgPos, setRenderedImgPos] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const getPreviewSrc = () => {
    // Prefer the transient, efficient Object URL if it's available from the current session
    if (invoice.fileDataUrl) {
      return invoice.fileDataUrl;
    }
    // Otherwise, reconstruct the Data URI from the persisted base64 content
    if (invoice.fileContentBase64) {
      return `data:${invoice.fileType};base64,${invoice.fileContentBase64}`;
    }
    return ''; // Return empty if no viewable source is found
  };
  
  const previewSrc = getPreviewSrc();

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    
    const calculateSizes = () => {
        const image = imageRef.current;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        setContainerSize({ width: containerWidth, height: containerHeight });

        if (image && image.naturalWidth > 0 && invoice.fileType.startsWith('image/')) {
            const imgNaturalWidth = image.naturalWidth;
            const imgNaturalHeight = image.naturalHeight;
            const containerRatio = containerWidth / containerHeight;
            const imgRatio = imgNaturalWidth / imgNaturalHeight;

            let renderedWidth, renderedHeight, x, y;
            if (imgRatio > containerRatio) { // Image is wider than container, letterboxed
                renderedWidth = containerWidth;
                renderedHeight = renderedWidth / imgRatio;
                x = 0;
                y = (containerHeight - renderedHeight) / 2;
            } else { // Image is taller or same ratio, pillarboxed
                renderedHeight = containerHeight;
                renderedWidth = renderedHeight * imgRatio;
                y = 0;
                x = (containerWidth - renderedWidth) / 2;
            }
            setRenderedImgPos({ width: renderedWidth, height: renderedHeight, x, y });
        } else {
            // For iframes/other, assume it fills the container
            setRenderedImgPos({ width: containerWidth, height: containerHeight, x: 0, y: 0 });
        }
    };
    
    const image = imageRef.current;
    if (image) {
        image.onload = calculateSizes;
        if(image.complete) calculateSizes();
    } else {
        calculateSizes();
    }
    
    const resizeObserver = new ResizeObserver(calculateSizes);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [previewSrc, invoice.fileType]);

  if (!previewSrc) return <p className="text-slate-500">Önizleme mevcut değil.</p>;

  const getHighlightBox = () => {
    if (!hoveredFieldKey || !editedData?.[hoveredFieldKey]?.boundingBox || containerSize.width === 0) {
      return null;
    }
    const box = editedData[hoveredFieldKey]!.boundingBox as BoundingBox;
    
    const basePos = invoice.fileType.startsWith('image/') ? renderedImgPos : { width: containerSize.width, height: containerSize.height, x: 0, y: 0 };

    const left = (box.x_min * basePos.width) + basePos.x;
    const top = (box.y_min * basePos.height) + basePos.y;
    const width = (box.x_max - box.x_min) * basePos.width;
    const height = (box.y_max - box.y_min) * basePos.height;
    
    return (
        <div
            className="absolute bg-pink-500/50 border-2 border-pink-300 rounded shadow-lg transition-all duration-100 pointer-events-none"
            style={{ left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` }}
        />
    );
  };
  
  const Previewer = () => {
    if (invoice.fileType.startsWith('image/')) {
        return <img ref={imageRef} src={previewSrc} alt={`Önizleme: ${invoice.fileName}`} className="w-full h-full object-contain" />;
    }
    if (invoice.fileType === 'application/pdf' || invoice.fileType.includes('xml')) {
        const bgClass = invoice.fileType.includes('xml') ? 'bg-white' : '';
        return <iframe src={previewSrc} title={invoice.fileName} className={`w-full h-full border-0 ${bgClass}`} />;
    }
    return <p className="text-slate-500">Bu dosya türü için önizleme desteklenmiyor: {invoice.fileType}</p>;
  }

  return (
    <div ref={previewContainerRef} className="w-full h-full relative overflow-hidden">
        <Previewer />
        {getHighlightBox()}
    </div>
  );
};

interface CheckViewProps {
  invoices: ProcessedInvoice[];
  onUpdateInvoices: (updater: (prev: ProcessedInvoice[]) => ProcessedInvoice[]) => void;
}

export const CheckView: React.FC<CheckViewProps> = ({ invoices, onUpdateInvoices }) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<ExtractedInvoiceFields | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);
  const [hoveredField, setHoveredField] = useState<keyof ExtractedInvoiceFields | null>(null);

  const unreviewedInvoices = useMemo(() => 
    invoices.filter(inv => inv.status === FileProcessingStatus.AWAITING_REVIEW && !inv.isReviewed)
  , [invoices]);
  
  const selectedInvoice = useMemo(() => 
    invoices.find(inv => inv.id === selectedInvoiceId)
  , [invoices, selectedInvoiceId]);

  useEffect(() => {
    if (selectedInvoice) {
      setEditedData(JSON.parse(JSON.stringify(selectedInvoice.extractedData || {})));
    } else {
      setEditedData(null);
    }
  }, [selectedInvoice]);
  
  // Select the first unreviewed invoice by default
  useEffect(() => {
    if (!selectedInvoiceId && unreviewedInvoices.length > 0) {
        setSelectedInvoiceId(unreviewedInvoices[0].id);
    }
     if (unreviewedInvoices.length === 0) {
        setSelectedInvoiceId(null);
    }
  }, [unreviewedInvoices, selectedInvoiceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedData) return;
    const { name, value } = e.target as { name: keyof ExtractedInvoiceFields, value: string };
    setEditedData({ 
        ...editedData, 
        [name]: {
            ...editedData[name],
            value: value 
        }
    });
  };
  
  const handleApprove = () => {
    if (!selectedInvoiceId) return;
    setAlert(null);

    const dateStr = editedData?.faturaTarihi?.value?.match(/\d{2}.\d{2}.\d{4}/) 
        ? editedData.faturaTarihi.value.split('.').reverse().join('-') 
        : new Date().toISOString().split('T')[0];
    
    const invoiceNoStr = (editedData?.faturaNumarasi?.value || `INV_${Date.now()}`).replace(/[^a-zA-Z0-9.-]/g, '_');
    const newFileName = `${dateStr}_${invoiceNoStr}`;
    
    onUpdateInvoices(currentInvoices => 
        currentInvoices.map(inv => 
          inv.id === selectedInvoiceId 
            ? { 
                ...inv, 
                fileName: newFileName,
                extractedData: editedData || inv.extractedData, 
                status: FileProcessingStatus.SUCCESS, 
                isReviewed: true 
              } 
            : inv
        )
    );
    console.log(`[CheckView] Approved invoice ${selectedInvoiceId}, new filename: ${newFileName}`);
    
    const currentIndex = unreviewedInvoices.findIndex(inv => inv.id === selectedInvoiceId);
    if(currentIndex !== -1 && currentIndex + 1 < unreviewedInvoices.length){
        setSelectedInvoiceId(unreviewedInvoices[currentIndex + 1].id);
    } else {
        setSelectedInvoiceId(null);
    }
  };
  
  const handleExport = () => {
      setAlert(null);
      const approvedInvoices = invoices.filter(inv => inv.isReviewed);
      if(approvedInvoices.length > 0) {
          const today = new Date();
          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const filename = `${dateStr}_onaylanan_faturalar.csv`;

          downloadInvoicesAsCsv(approvedInvoices, filename)
            .then(() => {
                setAlert({ message: `${approvedInvoices.length} fatura başarıyla dışa aktarıldı ve listeden kaldırıldı.`, type: 'success' });
                const exportedIds = new Set(approvedInvoices.map(inv => inv.id));
                onUpdateInvoices(currentInvoices => currentInvoices.filter(inv => !exportedIds.has(inv.id)));
            })
            .catch((err) => {
                console.error("Export failed:", err);
                setAlert({ message: 'Dışa aktarma sırasında bir hata oluştu.', type: 'error' });
            });
      } else {
          setAlert({ message: "Dışa aktarılacak onaylanmış fatura bulunmuyor.", type: 'warning' });
      }
  };

  const formFields: { key: keyof ExtractedInvoiceFields; label: string }[] = [
      { key: 'faturaTuru', label: 'Fatura Türü' },
      { key: 'faturaNumarasi', label: 'Fatura Numarası' },
      { key: 'faturaTarihi', label: 'Fatura Tarihi' },
      { key: 'saticiVknTckn', label: 'Satıcı VKN/TCKN' },
      { key: 'saticiUnvan', label: 'Satıcı Ünvan' },
      { key: 'aliciVknTckn', label: 'Alıcı VKN/TCKN' },
      { key: 'aliciUnvan', label: 'Alıcı Ünvan' },
      { key: 'kdvMatrahi', label: 'KDV Matrahı' },
      { key: 'kdvOrani', label: 'KDV Oranı (%)' },
      { key: 'kdvTutari', label: 'KDV Tutarı' },
      { key: 'genelToplam', label: 'Genel Toplam' },
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
        {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-indigo-400">Kontrol & Dışa Aktar</h2>
            <button
                onClick={handleExport}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={invoices.filter(i => i.isReviewed).length === 0}
            >
                Onaylananları CSV'e Aktar
            </button>
        </div>

        <div className="flex-grow flex gap-6 min-h-0">
            {/* Left Panel: Unreviewed Invoices */}
            <div className="w-3/12 bg-gray-900/50 rounded-lg p-4 overflow-y-auto border border-slate-800">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Onay Bekleyenler ({unreviewedInvoices.length})</h3>
                {unreviewedInvoices.length === 0 ? (
                    <p className="text-slate-500 text-sm mt-4">Onay bekleyen fatura yok.</p>
                ) : (
                <ul className="space-y-2">
                    {unreviewedInvoices.map(inv => (
                    <li key={inv.id}>
                        <button 
                            onClick={() => setSelectedInvoiceId(inv.id)}
                            className={`w-full text-left p-3 rounded-md text-sm transition-colors ${selectedInvoiceId === inv.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                        >
                        <span className="font-semibold break-all">{inv.fileName}</span>
                        </button>
                    </li>
                    ))}
                </ul>
                )}
            </div>

            {/* Middle Panel: Edit Form */}
            <div className="w-4/12 bg-gray-900/50 rounded-lg p-6 flex flex-col overflow-y-auto border border-slate-800">
                {selectedInvoice && editedData ? (
                <>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-indigo-300 mb-4 truncate" title={selectedInvoice.fileName}>{selectedInvoice.fileName}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {formFields.map(({ key, label }) => (
                            <div key={key} onMouseEnter={() => setHoveredField(key)} onMouseLeave={() => setHoveredField(null)}>
                                <label htmlFor={key} className="block text-sm font-medium text-slate-400">{label}</label>
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    value={editedData[key]?.value || ''}
                                    onChange={handleInputChange}
                                    onFocus={() => setHoveredField(key)}
                                    className="mt-1 block w-full bg-slate-800 border-slate-700 rounded-md shadow-sm py-2 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700">
                    <button 
                    onClick={handleApprove}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700"
                    >
                        Onayla ve Sonrakine Geç
                    </button>
                </div>
                </>
                ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">İncelemek için soldaki listeden bir fatura seçin.</p>
                </div>
                )}
            </div>

            {/* Right Panel: Preview */}
            <div className="w-5/12 bg-gray-900/50 rounded-lg p-2 border border-slate-800 flex items-center justify-center">
                {selectedInvoice ? (
                    <FilePreviewWithHighlight invoice={selectedInvoice} editedData={editedData} hoveredFieldKey={hoveredField} />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500">Dosya önizlemesi burada görünecek.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};