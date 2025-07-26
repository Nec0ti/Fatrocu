
import React from 'react';

interface HeaderProps {
  onNavigate: (view: 'main' | 'check' | 'reviewed') => void;
  reviewCount: number;
  reviewedCount: number;
  isQueuePaused?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, reviewCount, reviewedCount, isQueuePaused }) => {
  return (
    <header className="bg-black/50 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative">
        <button onClick={() => onNavigate('main')} className="text-left group">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 group-hover:from-indigo-300 group-hover:to-pink-400 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 inline-block mr-2 -mt-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Fatrocu v2
          </h1>
          <p className="text-sm text-indigo-400 ml-12 group-hover:text-indigo-300 transition-all">Akıllı Fatura İşleme Asistanınız</p>
        </button>

        <nav className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('check')}
            className="relative px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out"
          >
            Kontrol & Dışa Aktar
            {reviewCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white ring-2 ring-slate-800">
                {reviewCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => onNavigate('reviewed')}
            className="relative px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out"
          >
            Onaylananlar
            {reviewedCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white ring-2 ring-slate-800">
                {reviewedCount}
              </span>
            )}
          </button>
        </nav>
        
        {isQueuePaused && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-b-lg shadow-lg animate-pulse">
            API Limiti Bekleniyor...
          </div>
        )}
      </div>
    </header>
  );
};