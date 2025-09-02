
import React from 'react';
import { AlertType } from '../types';

interface AlertMessageProps {
  message: string;
  type: AlertType;
  onClose?: () => void;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ message, type, onClose }) => {
  const baseClasses = "p-4 mb-4 text-sm rounded-lg shadow-md flex items-center justify-between";
  let specificClasses = "";
  let Icon: React.ReactNode;

  switch (type) {
    case 'success':
      specificClasses = "bg-green-700/30 text-green-300 border border-green-600";
      Icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'error':
      specificClasses = "bg-red-700/30 text-red-300 border border-red-600";
       Icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
      break;
    case 'info':
      specificClasses = "bg-blue-700/30 text-blue-300 border border-blue-600";
      Icon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
      break;
    default: // warning
      specificClasses = "bg-yellow-700/30 text-yellow-300 border border-yellow-600";
      Icon = (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.636-1.179 2.251-1.179 2.887 0l6.764 12.51c.54.996-.037 2.25-.99 2.25H2.483c-.953 0-1.53-1.254-.99-2.25L8.257 3.099zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
      break;
  }

  return (
    <div className={`${baseClasses} ${specificClasses}`} role="alert">
      <div className="flex items-center">
        {Icon}
        <span className="font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="-mx-1.5 -my-1.5 ml-auto p-1.5 rounded-lg focus:ring-2 inline-flex h-8 w-8"
          aria-label="Kapat"
        >
          <span className="sr-only">Kapat</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};
