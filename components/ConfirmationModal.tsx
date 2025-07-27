
import React from 'react';

interface ConfirmationModalProps {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Onayla",
  cancelText = "İptal"
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onCancel} // Close on backdrop click
    >
      <div 
        className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-md flex flex-col border border-slate-700"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="p-6">
            <h2 id="modal-title" className="text-xl font-bold text-indigo-400 mb-4">Emin misiniz?</h2>
            <p className="text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end items-center p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-lg">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 mr-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};
