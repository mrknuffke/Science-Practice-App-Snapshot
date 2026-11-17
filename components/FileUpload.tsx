import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    accept?: string;
    allowMultiple?: boolean;
    label?: string;
    subLabel?: string;
    className?: string; // Allow custom styling override
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFilesSelected,
    maxFiles = 3,
    accept = ".pdf,.txt,.md,.csv,image/*",
    allowMultiple = true,
    label = "Click to Upload or Drag & Drop",
    subLabel = "PDF, TXT, Images",
    className
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedModels = Array.from(e.target.files).slice(0, maxFiles);
            onFilesSelected(selectedModels);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles);
            onFilesSelected(droppedFiles);
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple={allowMultiple}
                className="hidden"
                accept={accept}
            />
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${isDragging
                        ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-500'
                    } ${className || ''}`}
            >
                <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-indigo-600' : 'text-current'}`} />
                <span className={`text-sm font-bold ${isDragging ? 'text-indigo-700' : ''}`}>
                    {isDragging ? 'Drop files here!' : label}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {subLabel}
                </span>
            </div>
        </>
    );
};

export default FileUpload;
