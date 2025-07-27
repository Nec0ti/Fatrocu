
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/50 border-t border-slate-800 mt-12 py-6 text-center">
      <p className="text-sm text-slate-500">
        &copy; {new Date().getFullYear()} Fatrocu v2. Tüm hakları saklıdır.
      </p>
      <p className="text-xs text-slate-600 mt-1">
        React + TypeScript + Tailwind CSS ile güçlendirilmiştir.
      </p>
    </footer>
  );
};