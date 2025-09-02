import React from 'react';

export const ProgressBar: React.FC = () => (
  <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
    <div 
      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2.5 rounded-full"
      style={{
        width: '100%',
        animation: 'progressBarAnimation 2s linear infinite',
        backgroundSize: '200% 100%',
      }}
    ></div>
    <style>{`
      @keyframes progressBarAnimation {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);