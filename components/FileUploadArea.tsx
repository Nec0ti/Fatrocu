import React, { useState, useCallback, useRef } from 'react';

interface FileUploadAreaProps {
  onSubmit: (file: File) => void;
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

  const validateAndAddFiles = (files: FileList) => {
    setError(null);
    const newFiles = Array.from(files);
    let validationError = '';
    const validFiles = newFiles.filter(file => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        validationError += `${file.name}: Desteklenmeyen dosya türü. `;
        return false;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        validationError += `${file.name}: Dosya boyutu çok büyük. `;
        return false;
      }
      return true;
    });

    if (validationError) {
      setError(validationError.trim());
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length > 0) {
      selectedFiles.forEach(file => onSubmit(file));
      setSelectedFiles([]); // Reset after submit
      if(inputRef.current) inputRef.current.value = ""; // Clear file input
    } else {
      setError("Lütfen işlemek için bir veya daha fazla dosya seçin.");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <form 
      onSubmit={handleSubmit}
      onDragEnter={handleDrag}
      className="bg-gray-900/50 border-2 border-dashed border-indigo-600 rounded-xl p-8 text-center transition-all duration-300 ease-in-out hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20"
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
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mb-2 text-lg font-semibold text-slate-300">
          Dosyaları sürükleyip bırakın veya <span className="text-indigo-400 hover:text-indigo-300 font-bold" onClick={onButtonClick}>seçin</span>
        </p>
        <p className="text-xs text-slate-500">XML, PDF, PNG, JPG/JPEG (Maks. {MAX_FILE_SIZE_MB}MB)</p>
      </label>
      
      {selectedFiles.length > 0 && (
        <div className="mt-4 text-sm text-slate-300 text-left max-h-32 overflow-y-auto p-2 bg-gray-900/80 rounded-md border border-slate-700">
          <h4 className="font-semibold text-indigo-400 mb-2">Seçilen dosyalar:</h4>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className="truncate">
                {file.name} ({(file.size / (1024*1024)).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={selectedFiles.length === 0}
        className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold rounded-lg shadow-md hover:from-indigo-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedFiles.length > 0 ? `${selectedFiles.length} Dosyayı Yükle ve İşle` : 'Yükle ve İşle'}
      </button>
      {dragActive && <div className="absolute inset-0 bg-slate-900/50 rounded-xl" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
    </form>
  );
};