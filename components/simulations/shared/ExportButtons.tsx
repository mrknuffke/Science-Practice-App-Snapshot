import React from 'react';
import { FileImage, FileSpreadsheet } from 'lucide-react';
import { exportToCsv, exportElementToPng } from '../../../utils/dataExport';

interface ExportButtonsProps {
  csvData?: Record<string, unknown>[];
  csvFilename?: string;
  csvHeaders?: string[];
  graphRef?: React.RefObject<HTMLElement>;
  pngFilename?: string;
  label?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  csvData,
  csvFilename = 'simulation-data',
  csvHeaders,
  graphRef,
  pngFilename = 'simulation-graph',
  label,
}) => {
  const hasCsv = csvData && csvData.length > 0;
  const hasPng = !!graphRef;

  if (!hasCsv && !hasPng) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {label && <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">{label}</span>}

      {hasPng && (
        <button
          onClick={() => graphRef.current && exportElementToPng(graphRef.current, pngFilename)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
          title="Export graph as PNG"
        >
          <FileImage className="w-3.5 h-3.5" />
          PNG
        </button>
      )}

      {hasCsv && (
        <button
          onClick={() => exportToCsv(csvData, csvFilename, csvHeaders)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
          title="Export data as CSV"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          CSV
        </button>
      )}
    </div>
  );
};
