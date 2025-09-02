import React, { useState, useCallback, useRef } from 'react';

interface FileUploadAreaProps {
  onSubmit: (files: File[]) => void;
}

const ALLOWED_MIME_TYPES = [
  'application/xml', 'text/xml', 
  'application/pdf', 
  'image/png', 'image/jpeg', 'image/jpg'
];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onSubmit }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const validFiles: File[] = [];
    setError(null);

    for (const file of Array.from(files)) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError(`'${file.name}' desteklenmeyen bir dosya türü. İzin verilenler: XML, PDF, PNG, JPG/JPEG.`);
        setSelectedFiles([]); // Invalidate selection on any error
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`'${file.name}' dosya boyutu çok büyük. Maksimum: ${MAX_FILE_SIZE_MB}MB.`);
        setSelectedFiles([]); // Invalidate selection on any error
        return;
      }
      validFiles.push(file);
    }
    
    setSelectedFiles(validFiles);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    validateAndSetFiles(e.dataTransfer.files);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    validateAndSetFiles(e.target.files);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length > 0) {
      onSubmit(selectedFiles);
      setSelectedFiles([]); // Reset after submit
      if(inputRef.current) inputRef.current.value = ""; // Clear file input
    } else {
      setError("Lütfen işlemek için bir veya daha fazla dosya seçin.");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      onDragEnter={handleDrag}
      className="bg-slate-800/70 border-2 border-dashed border-indigo-400 rounded-xl p-8 text-center transition-all duration-300 ease-in-out hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/30"
    >
      <input
        ref={inputRef}
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        accept={ALLOWED_MIME_TYPES.join(',')}
        multiple
      />
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center cursor-pointer ${dragActive ? "opacity-70" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mb-2 text-lg font-semibold text-slate-200">
          Dosyaları sürükleyip bırakın veya <span className="text-indigo-400 hover:text-indigo-300">seçin</span>
        </p>
        <p className="text-xs text-slate-400">XML, PDF, PNG, JPG/JPEG (Maks. {MAX_FILE_SIZE_MB}MB)</p>
      </label>
      
      {selectedFiles.length > 0 && (
        <div className="mt-4 text-sm text-slate-300">
          Seçilen {selectedFiles.length} dosya: <span className="font-semibold text-indigo-300">{selectedFiles.map(f => f.name).join(', ')}</span>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={selectedFiles.length === 0}
        className="mt-6 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Yükle ve İşle
      </button>
      {dragActive && <div className="absolute inset-0 bg-slate-900/50 rounded-xl" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
    </form>
  );
};