import React from 'react';

interface HeaderProps {
    onBulkExport: () => void;
    reviewedInvoicesCount: number;
    currentPage: 'upload' | 'review';
    onNavigate: (page: 'upload' | 'review') => void;
    pendingReviewCount: number;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => {
    const baseClasses = "px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 relative";
    const activeClasses = "bg-indigo-600 text-white shadow-lg";
    const inactiveClasses = "text-slate-300 hover:bg-slate-700/50";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};


export const Header: React.FC<HeaderProps> = ({ onBulkExport, reviewedInvoicesCount, currentPage, onNavigate, pendingReviewCount }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                className="inline-block mr-2 -mt-1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    className="stroke-cyan-500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M14 2V8H20"
                    className="stroke-cyan-500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 18L12 12"
                    className="stroke-blue-500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M9 15L12 12L15 15"
                    className="stroke-blue-500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            Fatrocu v2
            </h1>
        </div>

        <nav className="flex items-center space-x-2 bg-slate-800/60 p-1.5 rounded-lg">
            <NavButton onClick={() => onNavigate('upload')} isActive={currentPage === 'upload'}>
                Fatura Yükle
            </NavButton>
            <NavButton onClick={() => onNavigate('review')} isActive={currentPage === 'review'}>
                Kontrol Et
                {pendingReviewCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{pendingReviewCount}</span>
                    </span>
                )}
            </NavButton>
        </nav>

        <div>
            <button
                onClick={onBulkExport}
                disabled={reviewedInvoicesCount === 0}
                className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                aria-label={`Onaylanmış ${reviewedInvoicesCount} faturayı Excel'e aktar`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 -mt-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Toplu Aktar ({reviewedInvoicesCount})
            </button>
        </div>
      </div>
    </header>
  );
};