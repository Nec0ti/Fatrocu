
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUploadArea } from './components/FileUploadArea';
import { ProcessedInvoiceCard } from './components/ProcessedInvoiceCard';
import { CheckView } from './components/CheckView';
import { ReviewedView } from './components/ReviewedView';
import { ProcessedInvoice, FileProcessingStatus } from './types';
import { uploadAndProcessInvoice, RateLimitError } from './services/apiService';
import { createFileDataUrl, fileToBase64, base64ToBlobUrl } from './utils';
import { Spinner } from './components/Spinner';
import { ConfirmationModal } from './components/ConfirmationModal';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<ProcessedInvoice[]>([]);
  const [view, setView] = useState<'main' | 'check' | 'reviewed'>('main');
  const [debugMode, setDebugMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ action: 'delete' | 'revert', invoiceId: string } | null>(null);
  
  // State for queue management
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPausedForRateLimit, setIsPausedForRateLimit] = useState(false);


  // Load invoices from localStorage on initial render and regenerate preview URLs
  useEffect(() => {
    console.log("[App] Component mounting. Loading invoices from localStorage.");
    try {
      const savedInvoicesRaw = localStorage.getItem('invoices');
      if (savedInvoicesRaw) {
        const savedInvoices: ProcessedInvoice[] = JSON.parse(savedInvoicesRaw);
        console.log(`[App] Loaded ${savedInvoices.length} invoices. Regenerating preview URLs...`);
        
        const invoicesWithUrls = savedInvoices.map(invoice => {
          if (invoice.fileContentBase64) {
            try {
              const newUrl = base64ToBlobUrl(invoice.fileContentBase64, invoice.fileType);
              return { ...invoice, fileDataUrl: newUrl };
            } catch (urlError) {
              console.error(`[App] Could not create blob URL for ${invoice.fileName}`, urlError);
              return invoice;
            }
          }
          return invoice;
        });

        setInvoices(invoicesWithUrls);
        console.log("[App] Finished regenerating URLs for previews.");
      } else {
        console.log("[App] No invoices found in localStorage.");
      }
    } catch (error) {
      console.error("[App] Failed to load or process invoices from localStorage", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Save invoices to localStorage whenever they change
  const updateAndSaveInvoices = useCallback((updater: ProcessedInvoice[] | ((prev: ProcessedInvoice[]) => ProcessedInvoice[])) => {
    setInvoices(prev => {
        const newInvoices = typeof updater === 'function' ? updater(prev) : updater;
        try {
            const storableInvoices = newInvoices.map(({ fileDataUrl, ...rest }) => rest);
            localStorage.setItem('invoices', JSON.stringify(storableInvoices));
        } catch (error) {
            console.error("[App] Failed to save invoices to localStorage", error);
        }
        if (debugMode) {
          console.log('[App Debug] New state:', newInvoices);
        }
        return newInvoices;
    });
  }, [debugMode]);

  // Adds a file to the processing queue
  const handleFileSubmit = useCallback(async (file: File) => {
    const tempId = `temp-${Date.now()}-${file.name}`;
    console.log(`[App] Queuing file ${file.name} with temp ID: ${tempId}`);
    
    const fileDataUrl = await createFileDataUrl(file);
    const fileContentBase64 = await fileToBase64(file);

    const newInvoiceEntry: ProcessedInvoice = {
      id: tempId,
      fileName: file.name,
      fileType: file.type,
      status: FileProcessingStatus.QUEUED,
      isReviewed: false,
      fileDataUrl,
      fileContentBase64,
    };

    updateAndSaveInvoices(currentInvoices => [newInvoiceEntry, ...currentInvoices]);
  }, [updateAndSaveInvoices]);

  // Effect to manage and process the queue
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing || isPausedForRateLimit) {
        return; // Don't process if already busy or paused
      }

      const nextInvoice = invoices.find(inv => inv.status === FileProcessingStatus.QUEUED);
      if (!nextInvoice) {
        return; // No items in queue
      }
      
      setIsProcessing(true);
      console.log(`[App Queue] Processing next invoice: ${nextInvoice.id}`);

      // Update status to PROCESSING
      updateAndSaveInvoices(currentInvoices =>
        currentInvoices.map(inv =>
          inv.id === nextInvoice.id ? { ...inv, status: FileProcessingStatus.PROCESSING } : inv
        )
      );
      
      try {
        if (!nextInvoice.fileDataUrl) throw new Error("File data URL is missing.");

        // Reconstruct the file object from the blob URL
        const fileBlob = await (await fetch(nextInvoice.fileDataUrl)).blob();
        const file = new File([fileBlob], nextInvoice.fileName, { type: nextInvoice.fileType });
        
        const result = await uploadAndProcessInvoice(file);
        
        console.log(`[App Queue] API call successful for ${nextInvoice.id}`);
        const finalInvoice: Partial<ProcessedInvoice> = {
            status: result.status || FileProcessingStatus.AWAITING_REVIEW,
            extractedData: result.extractedData,
            errorMessage: result.errorMessage,
        };
        updateAndSaveInvoices(currentInvoices =>
          currentInvoices.map(inv => (inv.id === nextInvoice.id ? { ...inv, ...finalInvoice } : inv))
        );
        
      } catch (error) {
        console.error(`[App Queue] Processing error for ${nextInvoice.id}:`, error);
        
        if (error instanceof RateLimitError) {
          console.warn("[App Queue] Rate limit detected. Pausing for 60 seconds.");
          setIsPausedForRateLimit(true);
          // Set invoice status back to QUEUED to be re-processed
          updateAndSaveInvoices(currentInvoices =>
              currentInvoices.map(inv => (inv.id === nextInvoice.id ? { ...inv, status: FileProcessingStatus.QUEUED } : inv))
          );
          setTimeout(() => {
              console.log("[App Queue] Resuming queue processing.");
              setIsPausedForRateLimit(false);
          }, 60000);
        } else {
          // Handle other, non-retriable errors
          const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
          const errorInvoice: Partial<ProcessedInvoice> = {
            status: FileProcessingStatus.ERROR,
            errorMessage: `İşleme hatası: ${errorMessage}`,
          };
          updateAndSaveInvoices(currentInvoices =>
            currentInvoices.map(inv => (inv.id === nextInvoice.id ? { ...inv, ...errorInvoice } : inv))
          );
        }
      } finally {
        setIsProcessing(false);
      }
    };
    
    processQueue();
  }, [invoices, isProcessing, isPausedForRateLimit, updateAndSaveInvoices]);
  
  // Handlers for the confirmation modal flow
  const handleRequestDelete = (invoiceId: string) => {
    setPendingAction({ action: 'delete', invoiceId });
  };
  
  const handleRequestRevert = (invoiceId: string) => {
    setPendingAction({ action: 'revert', invoiceId });
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    const { action, invoiceId } = pendingAction;

    if (action === 'delete') {
      updateAndSaveInvoices(prevInvoices => 
        prevInvoices.filter(inv => inv.id !== invoiceId)
      );
    } else if (action === 'revert') {
      updateAndSaveInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoiceId 
              ? { ...inv, isReviewed: false, status: FileProcessingStatus.AWAITING_REVIEW } 
              : inv
        )
      );
    }
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setPendingAction(null);
  };

  const unreviewedCount = invoices.filter(inv => inv.status === FileProcessingStatus.AWAITING_REVIEW && !inv.isReviewed).length;
  const reviewedCount = invoices.filter(inv => inv.isReviewed).length;
  
  const renderContent = () => {
      if (!isLoaded) {
          return <div className="flex justify-center items-center h-64"><Spinner /></div>;
      }
      switch(view) {
          case 'check':
              return <CheckView invoices={invoices} onUpdateInvoices={updateAndSaveInvoices} />;
          case 'reviewed':
              return <ReviewedView invoices={invoices} onRequestDelete={handleRequestDelete} onRequestRevert={handleRequestRevert} />;
          case 'main':
          default:
              return (
                  <>
                    <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">Fatura Yükleyin ve Verileri Çıkarın</h2>
                    <FileUploadArea onSubmit={handleFileSubmit} />
                    {invoices.length > 0 && (
                      <div className="mt-12">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-semibold text-indigo-300">İşlem Geçmişi</h3>
                            <button 
                                onClick={() => setDebugMode(!debugMode)}
                                className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
                            >
                                {debugMode ? 'Hide' : 'Show'} Debug
                            </button>
                        </div>
                        {debugMode && (
                            <div className="bg-black/50 p-4 rounded-lg mb-4 max-h-96 overflow-auto border border-slate-700">
                                <h4 className="font-bold text-lg text-yellow-400 mb-2">Invoice State</h4>
                                <pre className="text-xs text-slate-300">{JSON.stringify(invoices, null, 2)}</pre>
                            </div>
                        )}
                        <div className="space-y-6">
                          {invoices.map(invoice => (
                            <ProcessedInvoiceCard key={invoice.id} invoice={invoice} />
                          ))}
                        </div>
                      </div>
                    )}
                    {invoices.length === 0 && (
                      <div className="mt-12 text-center text-slate-500">
                        <p>Henüz işlenmiş fatura yok. Lütfen bir dosya yükleyin.</p>
                        <img src="https://picsum.photos/seed/fatrocu/400/200" alt="Placeholder" className="mt-4 mx-auto rounded-lg shadow-lg opacity-30" />
                      </div>
                    )}
                  </>
              );
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-indigo-950 text-slate-200">
      <Header onNavigate={setView} reviewCount={unreviewedCount} reviewedCount={reviewedCount} isQueuePaused={isPausedForRateLimit} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      {pendingAction && (
        <ConfirmationModal 
          message={
            pendingAction.action === 'delete' 
              ? "Bu faturayı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
              : "Bu faturayı tekrar kontrol etmek için 'Kontrol & Dışa Aktar' listesine taşımak istediğinizden emin misiniz?"
          }
          confirmText={pendingAction.action === 'delete' ? 'Sil' : 'Evet, Geri Al'}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
};

export default App;