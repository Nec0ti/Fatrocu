import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AlertMessage } from './components/AlertMessage';
import { CheckInvoicePage } from './pages/CheckInvoicePage';
import { UploadPage } from './pages/UploadPage';
import { ReviewPage } from './pages/ReviewPage';
import { ProcessedInvoice, FileProcessingStatus, ExtractedInvoiceFields, ReviewStatus } from './types';
import { uploadInvoiceFile, downloadInvoicesAsExcel } from './services/apiService';

// Constants for Local Storage keys
const LOCAL_STORAGE_KEYS = {
  INVOICES: 'fatrocu_v2_invoices',
  FILE_CACHE: 'fatrocu_v2_fileCache',
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
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'upload' | 'review'>('upload');
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]); // Queue of invoice IDs
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const deletedInvoiceIds = useRef(new Set<string>()); // Tracks IDs deleted during the session to solve race conditions

  // Effect to load state from localStorage on initial mount
  useEffect(() => {
    try {
      const storedInvoicesJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
      const invoicesFromStorage: ProcessedInvoice[] = storedInvoicesJSON ? JSON.parse(storedInvoicesJSON) : [];
      
      const storedCacheJSON = localStorage.getItem(LOCAL_STORAGE_KEYS.FILE_CACHE);
      const newFileCache = new Map<string, string>(storedCacheJSON ? JSON.parse(storedCacheJSON) : []);
      
      const newUploadQueue: string[] = [];
      const updatedInvoices = invoicesFromStorage.map(invoice => {
        if (invoice.status === FileProcessingStatus.PROCESSING || invoice.status === FileProcessingStatus.QUEUED) {
          if (newFileCache.has(invoice.id)) { // Only queue if file data exists
            newUploadQueue.push(invoice.id);
            return { ...invoice, status: FileProcessingStatus.QUEUED };
          }
          // If file data is missing, mark as error
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
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(processedInvoices));
    } catch (error) {
      console.error("Faturalar yerel depoya kaydedilirken hata oluştu:", error);
    }
  }, [processedInvoices, isInitialized]);

  // Effect to save file cache to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const cacheArray = Array.from(fileCache.entries());
      localStorage.setItem(LOCAL_STORAGE_KEYS.FILE_CACHE, JSON.stringify(cacheArray));
    } catch (error) {
      console.error("Dosya önbelleği yerel depoya kaydedilirken hata oluştu:", error);
    }
  }, [fileCache, isInitialized]);

  const clearAlerts = () => {
    setGlobalError(null);
    setGlobalSuccess(null);
  };

  const handleFileSubmit = useCallback((files: File[]) => {
    clearAlerts();
    const newInvoiceEntries: ProcessedInvoice[] = [];
    const newQueueIds: string[] = [];

    const filePromises = files.map(file => {
      const tempId = `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newInvoiceEntries.push({
        id: tempId,
        fileName: file.name,
        fileType: file.type,
        status: FileProcessingStatus.QUEUED,
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
  }, []);

  const processFile = async (invoiceId: string, file: File) => {
    // Set status to PROCESSING
    setProcessedInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status: FileProcessingStatus.PROCESSING } : inv
      )
    );

    const result = await uploadInvoiceFile(file, invoiceId);

    const finalResult =
      result.status === FileProcessingStatus.SUCCESS
        ? { ...result, reviewStatus: 'pending' as ReviewStatus }
        : result;

    if (deletedInvoiceIds.current.has(invoiceId)) {
        console.warn(`YARIŞ DURUMU ENGELLENDİ: Fatura ${invoiceId} işlenirken silindi. Durum güncellemesi iptal edildi.`);
    } else {
        setProcessedInvoices(prevInvoices => {
            // Check if the invoice still exists before updating, as another process might have removed it.
            if (!prevInvoices.some(inv => inv.id === invoiceId)) {
                return prevInvoices; 
            }

            if (result.status === FileProcessingStatus.SUCCESS) {
                setGlobalSuccess(`'${file.name}' başarıyla işlendi. Kontrol bekleniyor.`);
            } else {
                setGlobalError(result.errorMessage || `'${file.name}' işlenirken bir hata oluştu.`);
            }
            return prevInvoices.map(inv => (inv.id === invoiceId ? finalResult : inv));
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
        // Skip processing if the invoice has been deleted.
        setUploadQueue(prevQueue => prevQueue.filter(id => id !== invoiceIdToProcess));
        return;
      }
      
      setIsProcessingQueue(true);

      const invoiceInfo = processedInvoices.find(inv => inv.id === invoiceIdToProcess);
      const dataUrl = fileCache.get(invoiceIdToProcess);

      if (dataUrl && invoiceInfo) {
        const fileToProcess = dataUrlToFile(dataUrl, invoiceInfo.fileName, invoiceInfo.fileType);
        processFile(invoiceIdToProcess, fileToProcess);
      } else {
        setProcessedInvoices(prevInvoices =>
          prevInvoices.map(inv =>
            inv.id === invoiceIdToProcess
              ? { ...inv, status: FileProcessingStatus.ERROR, errorMessage: "Dosya verisi bulunamadı." }
              : inv
          )
        );
        setUploadQueue(prevQueue => prevQueue.filter(id => id !== invoiceIdToProcess));
        setIsProcessingQueue(false);
      }
    }
  }, [uploadQueue, isProcessingQueue, fileCache, processedInvoices, isInitialized]);

  const handleBulkExport = useCallback(() => {
    clearAlerts();
    const reviewedInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'reviewed');
    if (reviewedInvoices.length === 0) {
      setGlobalError("Excel'e aktarılacak, kontrolü tamamlanmış fatura bulunmuyor.");
      return;
    }
    try {
      downloadInvoicesAsExcel(reviewedInvoices);
      setGlobalSuccess(`${reviewedInvoices.length} adet fatura Excel'e aktarıldı. Liste temizleniyor.`);
      
      const reviewedInvoiceIds = new Set(reviewedInvoices.map(inv => inv.id));
      
      setProcessedInvoices(prev => prev.filter(inv => !reviewedInvoiceIds.has(inv.id)));
      setFileCache(prev => {
        const newCache = new Map(prev);
        reviewedInvoiceIds.forEach(id => newCache.delete(id));
        return newCache;
      });

    } catch (error) {
      console.error("Toplu indirme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : 'Excel dosyası oluşturulamadı.';
      setGlobalError(errorMessage);
    }
  }, [processedInvoices]);

  const handleDeleteInvoice = (invoiceId: string) => {
    // The problematic confirmation dialog has been removed to ensure deletion works consistently.
    // The action is now immediate.
    clearAlerts();
    
    // Add to a ref set to prevent race conditions with async processing.
    // If a file is being processed, this ensures its result won't be added back to state.
    deletedInvoiceIds.current.add(invoiceId); 
    
    // 1. Remove from the main invoices list
    setProcessedInvoices(prev => prev.filter(inv => inv.id !== invoiceId));

    // 2. Remove from the file cache
    setFileCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(invoiceId);
      return newCache;
    });

    // 3. Remove from the processing queue if it's there
    setUploadQueue(prev => prev.filter(id => id !== invoiceId));
    
    setGlobalSuccess("Fatura başarıyla silindi.");
  };

  const handleViewDetails = (invoiceId: string) => {
    setCurrentInvoiceId(invoiceId);
  };

  const handleReturnToList = () => {
    setCurrentInvoiceId(null);
  };

  const handleSaveCorrections = (invoiceId: string, updatedData: ExtractedInvoiceFields) => {
    setProcessedInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, extractedData: updatedData, reviewStatus: 'reviewed' as ReviewStatus, status: FileProcessingStatus.SUCCESS } : inv
    ));
    setGlobalSuccess("Düzeltmeler kaydedildi ve fatura onaylandı!");
    setCurrentInvoiceId(null);
  };
  
  const handleNavigate = (page: 'upload' | 'review') => {
    setCurrentPage(page);
    setCurrentInvoiceId(null);
  };
    
  const reviewedCount = processedInvoices.filter(inv => inv.reviewStatus === 'reviewed').length;
  const pendingReviewCount = processedInvoices.filter(inv => inv.reviewStatus === 'pending').length;
  const pendingReviewInvoices = processedInvoices.filter(inv => inv.reviewStatus === 'pending');

  const currentInvoiceForCheck = processedInvoices.find(inv => inv.id === currentInvoiceId);
  const currentFileDataUrl = currentInvoiceId ? fileCache.get(currentInvoiceId) : undefined;
  
  const renderPage = () => {
    if (currentInvoiceForCheck && currentFileDataUrl) {
      const currentFileForCheck = dataUrlToFile(currentFileDataUrl, currentInvoiceForCheck.fileName, currentInvoiceForCheck.fileType);
      return (
        <CheckInvoicePage 
          invoice={currentInvoiceForCheck}
          file={currentFileForCheck}
          onBack={handleReturnToList}
          onSave={handleSaveCorrections}
          isReadOnly={currentInvoiceForCheck.reviewStatus === 'reviewed'}
        />
      );
    }
    if (currentPage === 'review') {
      return (
        <ReviewPage 
          invoices={pendingReviewInvoices}
          onViewDetails={handleViewDetails}
          onDeleteInvoice={handleDeleteInvoice}
        />
      );
    }
    return (
      <UploadPage 
        invoices={processedInvoices}
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
        reviewedInvoicesCount={reviewedCount}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        pendingReviewCount={pendingReviewCount}
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