
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AlertMessage } from './components/AlertMessage';
import { CheckInvoicePage } from './pages/CheckInvoicePage';
import { UploadPage } from './pages/UploadPage';
import { ReviewPage } from './pages/ReviewPage';
import { ApprovedPage } from './pages/ApprovedPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProcessedInvoice, FileProcessingStatus, ExtractedInvoiceFields, ReviewStatus, InvoiceConfig, FieldConfig } from './types';
import { uploadInvoiceFile, downloadInvoicesAsExcel } from './services/apiService';
import { PREDEFINED_CONFIGS } from './services/configService';

// Constants for Local Storage keys
const LOCAL_STORAGE_KEYS = {
  INVOICES: 'fatrocu_v2_invoices',
  FILE_CACHE: 'fatrocu_v2_fileCache',
  CONFIGS: 'fatrocu_v2_configs',
};

// Helper to convert dataUrl back to a File object for previewing and reprocessing
const dataUrlToFile = (dataUrl: string, filename: string, mimeType: string): File => {
  const arr = dataUrl.split(',');
  const byteString = atob(arr[1]);
  let n = byteString.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = byteString.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};

// Main App Component
const App: React.FC = () => {
  const [processedInvoices, setProcessedInvoices] = useState<ProcessedInvoice[]>([]);
  const [fileCache, setFileCache] = useState<Map<string, string>>(new Map()); // Caches file data URLs
  const [configs, setConfigs] = useState<InvoiceConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string>('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'upload' | 'review' | 'settings' | 'approved'>('upload');
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]); // Queue of invoice IDs
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const deletedInvoiceIds = useRef(new Set<string>()); // Tracks IDs deleted during the session

  // Effect to load state from localStorage on initial mount
  useEffect(() => {
    try {
      // Load or initialize configs
      const storedConfigsJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.CONFIGS);
      const userConfigs: InvoiceConfig[] = storedConfigsJSON ? JSON.parse(storedConfigsJSON) : [];
      const allConfigs = [...PREDEFINED_CONFIGS, ...userConfigs];
      setConfigs(allConfigs);
      setActiveConfigId(allConfigs[0]?.id || '');

      // Load invoices
      const storedInvoicesJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
      const invoicesFromStorage: ProcessedInvoice[] = storedInvoicesJSON ? JSON.parse(storedInvoicesJSON) : [];
      
      const storedCacheJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.FILE_CACHE);
      const newFileCache = new Map<string, string>(storedCacheJSON ? JSON.parse(storedCacheJSON) : []);
      
      const newUploadQueue: string[] = [];
      const updatedInvoices = invoicesFromStorage.map(invoice => {
        if (invoice.status === FileProcessingStatus.PROCESSING || invoice.status === FileProcessingStatus.QUEUED) {
          if (newFileCache.has(invoice.id)) {
            newUploadQueue.push(invoice.id);
            return { ...invoice, status: FileProcessingStatus.QUEUED };
          }
          return { ...invoice, status: FileProcessingStatus.ERROR, errorMessage: "Tarayıcı belleği temizlendiği için dosya verisi kayboldu. Lütfen tekrar yükleyin."};
        }
        return invoice;
      });

      setProcessedInvoices(updatedInvoices);
      setFileCache(newFileCache);
      setUploadQueue(prev => [...prev, ...newUploadQueue]);
    } catch (error) {
      console.error("Yerel depodan veri yüklenirken hata oluştu:", error);
      setGlobalError("Uygulama verileri yüklenemedi. Tarayıcı ayarlarınızı kontrol edin.");
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Effect to save invoices to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(processedInvoices));
  }, [processedInvoices, isInitialized]);

  // Effect to save file cache to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    const cacheArray = Array.from(fileCache.entries());
    localStorage.setItem(LOCAL_STORAGE_KEYS.FILE_CACHE, JSON.stringify(cacheArray));
  }, [fileCache, isInitialized]);
  
  // Effect to save configs to localStorage
  useEffect(() => {
      if (!isInitialized) return;
      const userConfigs = configs.filter(c => !c.isPredefined);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CONFIGS, JSON.stringify(userConfigs));
  }, [configs, isInitialized]);


  const clearAlerts = () => {
    setGlobalError(null);
    setGlobalSuccess(null);
  };

  const handleFileSubmit = useCallback((files: File[]) => {
    clearAlerts();
    if (!activeConfigId) {
        setGlobalError("Lütfen dosya yüklemeden önce bir yapılandırma seçin.");
        return;
    }

    const newInvoiceEntries: ProcessedInvoice[] = [];
    const newQueueIds: string[] = [];

    const filePromises = files.map(file => {
      const tempId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newInvoiceEntries.push({
        id: tempId,
        fileName: file.name,
        fileType: file.type,
        status: FileProcessingStatus.QUEUED,
        configId: activeConfigId,
      });
      newQueueIds.push(tempId);
      
      return new Promise<[string, string]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve([tempId, reader.result as string]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(cachedFiles => {
      setFileCache(prev => new Map([...prev, ...cachedFiles]));
      setProcessedInvoices(prev => [...newInvoiceEntries, ...prev]);
      setUploadQueue(prev => [...prev, ...newQueueIds]);
    }).catch(err => {
        console.error("Dosya okunurken hata:", err);
        setGlobalError("Bazı dosyalar okunurken bir hata oluştu ve işleme alınamadı.");
    });
  }, [activeConfigId]);

  const processFile = async (invoiceId: string, file: File, config: InvoiceConfig) => {
    setProcessedInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status: FileProcessingStatus.PROCESSING } : inv
      )
    );

    let result: Partial<ProcessedInvoice>;

    // Handle Manual Entry mode
    if (config.id === 'predefined-manual') {
        result = {
            id: invoiceId,
            status: FileProcessingStatus.SUCCESS,
            extractedData: {},
            lineItems: [],
        };
    } else {
        result = await uploadInvoiceFile(file, invoiceId, config);
    }

    const finalResult =
      result.status === FileProcessingStatus.SUCCESS
        ? { ...result, reviewStatus: 'pending' as ReviewStatus }
        : result;

    if (deletedInvoiceIds.current.has(invoiceId)) {
        console.warn(`YARIŞ DURUMU ENGELLENDİ: Fatura ${invoiceId} işlenirken silindi.`);
    } else {
        setProcessedInvoices(prevInvoices => {
            if (!prevInvoices.some(inv => inv.id === invoiceId)) return prevInvoices; 

            if (result.status === FileProcessingStatus.SUCCESS) {
                setGlobalSuccess(`'${file.name}' başarıyla işlendi. Kontrol bekleniyor.`);
            } else {
                setGlobalError(result.errorMessage || `'${file.name}' işlenirken bir hata oluştu.`);
            }
            return prevInvoices.map(inv => (inv.id === invoiceId ? { ...inv, ...finalResult } : inv));
        });
    }

    setTimeout(() => {
        setUploadQueue(prevQueue => prevQueue.filter(id => id !== invoiceId));
        setIsProcessingQueue(false);
    }, 500);
  };

  useEffect(() => {
    if (uploadQueue.length > 0 && !isProcessingQueue && isInitialized) {
      const invoiceIdToProcess = uploadQueue[0];
      
      if (deletedInvoiceIds.current.has(invoiceIdToProcess)) {
        setUploadQueue(prevQueue => prevQueue.filter(id => id !== invoiceIdToProcess));
        return;
      }
      
      setIsProcessingQueue(true);

      const invoiceInfo = processedInvoices.find(inv => inv.id === invoiceIdToProcess);
      const configToUse = configs.find(c => c.id === invoiceInfo?.configId);
      const dataUrl = fileCache.get(invoiceIdToProcess);

      if (dataUrl && invoiceInfo && configToUse) {
        const fileToProcess = dataUrlToFile(dataUrl, invoiceInfo.fileName, invoiceInfo.fileType);
        processFile(invoiceIdToProcess, fileToProcess, configToUse);
      } else {
        const errorMessage = !configToUse ? "İlişkili yapılandırma bulunamadı." : "Dosya verisi bulunamadı.";
        setProcessedInvoices(prevInvoices =>
          prevInvoices.map(inv =>
            inv.id === invoiceIdToProcess
              ? { ...inv, status: FileProcessingStatus.ERROR, errorMessage }
              : inv
          )
        );
        setUploadQueue(prevQueue => prevQueue.filter(id => id !== invoiceIdToProcess));
        setIsProcessingQueue(false);
      }
    }
  }, [uploadQueue, isProcessingQueue, fileCache, processedInvoices, isInitialized, configs]);

  const handleBulkExport = useCallback(() => {
    clearAlerts();
    const reviewedInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'reviewed');
    if (reviewedInvoices.length === 0) {
      setGlobalError("Excel'e aktarılacak, kontrolü tamamlanmış fatura bulunmuyor.");
      return;
    }
    try {
      downloadInvoicesAsExcel(reviewedInvoices, configs);
      setGlobalSuccess(`${reviewedInvoices.length} adet fatura başarıyla Excel'e aktarıldı.`);
    } catch (error) {
      console.error("Toplu indirme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : 'Excel dosyası oluşturulamadı.';
      setGlobalError(errorMessage);
    }
  }, [processedInvoices, configs]);
  
  const handleClearApproved = () => {
    clearAlerts();
    const reviewedInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'reviewed');
    if (reviewedInvoices.length === 0) {
        setGlobalError("Temizlenecek onaylanmış fatura bulunmuyor.");
        return;
    }
    if(window.confirm(`${reviewedInvoices.length} adet onaylanmış faturayı ve ilişkili dosyaları kalıcı olarak silmek istediğinizden emin misiniz?`)) {
        const reviewedInvoiceIds = new Set(reviewedInvoices.map(inv => inv.id));
        setProcessedInvoices(prev => prev.filter(inv => !reviewedInvoiceIds.has(inv.id)));
        setFileCache(prev => {
            const newCache = new Map(prev);
            reviewedInvoiceIds.forEach(id => newCache.delete(id));
            return newCache;
        });
        setGlobalSuccess("Onaylanmış tüm faturalar başarıyla temizlendi.");
    }
  };


  const handleDeleteInvoice = (invoiceId: string) => {
    clearAlerts();
    deletedInvoiceIds.current.add(invoiceId); 
    setProcessedInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
    setFileCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(invoiceId);
      return newCache;
    });
    setUploadQueue(prev => prev.filter(id => id !== invoiceId));
    setGlobalSuccess("Fatura başarıyla silindi.");
  };

  const handleViewDetails = (invoiceId: string) => {
    setCurrentInvoiceId(invoiceId);
  };

  const handleReturnToList = () => {
    setCurrentInvoiceId(null);
  };

  const handleSaveCorrections = (invoiceId: string, updatedData: ExtractedInvoiceFields, updatedLineItems: any[], customFields: FieldConfig[], customLineItemFields: FieldConfig[]) => {
    setProcessedInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { 
        ...inv, 
        extractedData: updatedData, 
        lineItems: updatedLineItems,
        customFields,
        customLineItemFields,
        reviewStatus: 'reviewed' as ReviewStatus, 
        status: FileProcessingStatus.SUCCESS 
      } : inv
    ));
    setGlobalSuccess("Düzeltmeler kaydedildi ve fatura onaylandı!");
  };

  const handleSaveAndNext = (invoiceId: string, updatedData: ExtractedInvoiceFields, updatedLineItems: any[], customFields: FieldConfig[], customLineItemFields: FieldConfig[]) => {
    handleSaveCorrections(invoiceId, updatedData, updatedLineItems, customFields, customLineItemFields);
    const pendingInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'pending');
    const currentIndex = pendingInvoices.findIndex(inv => inv.id === invoiceId);
    if (currentIndex > -1 && currentIndex < pendingInvoices.length - 1) {
      setCurrentInvoiceId(pendingInvoices[currentIndex + 1].id);
    } else {
      setCurrentInvoiceId(null); // No more pending invoices, go back to list
    }
  };
  
  const handleNavigate = (page: 'upload' | 'review' | 'settings' | 'approved') => {
    setCurrentPage(page);
    setCurrentInvoiceId(null);
  };
    
  const reviewedInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'reviewed');
  const pendingReviewInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'pending');

  const currentInvoiceForCheck = processedInvoices.find(inv => inv.id === currentInvoiceId);
  const currentConfigForCheck = configs.find(c => c.id === currentInvoiceForCheck?.configId);
  const currentFileDataUrl = currentInvoiceId ? fileCache.get(currentInvoiceId) : undefined;
  
  const renderPage = () => {
    if (currentInvoiceForCheck && currentFileDataUrl && currentConfigForCheck) {
      const currentFileForCheck = dataUrlToFile(currentFileDataUrl, currentInvoiceForCheck.fileName, currentInvoiceForCheck.fileType);
      const pendingIds = pendingReviewInvoices.map(i => i.id);
      return (
        <CheckInvoicePage 
          invoice={currentInvoiceForCheck}
          file={currentFileForCheck}
          config={currentConfigForCheck}
          onBack={handleReturnToList}
          onSave={handleSaveCorrections}
          onSaveAndNext={handleSaveAndNext}
          pendingReviewIds={pendingIds}
          onNavigateToInvoice={(id) => setCurrentInvoiceId(id)}
        />
      );
    }
    if (currentPage === 'review') {
      return (
        <ReviewPage 
          invoices={pendingReviewInvoices}
          configs={configs}
          onViewDetails={handleViewDetails}
          onDeleteInvoice={handleDeleteInvoice}
        />
      );
    }
    if (currentPage === 'approved') {
        return (
          <ApprovedPage 
            invoices={reviewedInvoices}
            configs={configs}
            onViewDetails={handleViewDetails}
            onDeleteInvoice={handleDeleteInvoice}
            onClearApproved={handleClearApproved}
          />
        );
    }
    if (currentPage === 'settings') {
      return <SettingsPage configs={configs} setConfigs={setConfigs} />;
    }
    return (
      <UploadPage 
        invoices={processedInvoices}
        configs={configs}
        activeConfigId={activeConfigId}
        onActiveConfigChange={setActiveConfigId}
        onFileSubmit={handleFileSubmit}
        onViewDetails={handleViewDetails}
        onDeleteInvoice={handleDeleteInvoice}
      />
    );
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <h2 className="text-2xl text-slate-300 font-semibold">Uygulama Yükleniyor...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Header 
        onBulkExport={handleBulkExport} 
        reviewedInvoicesCount={reviewedInvoices.length}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pendingReviewCount={pendingReviewInvoices.length}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        {globalError && <AlertMessage type="error" message={globalError} onClose={clearAlerts} />}
        {globalSuccess && <AlertMessage type="success" message={globalSuccess} onClose={clearAlerts} />}
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;