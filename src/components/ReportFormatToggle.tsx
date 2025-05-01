
import { useState } from 'react';
import { FileText, FileType } from 'lucide-react';

interface ReportFormatToggleProps {
  value: 'pdf' | 'csv';
  onChange: (format: 'pdf' | 'csv') => void;
}

const ReportFormatToggle = ({ value, onChange }: ReportFormatToggleProps) => {
  return (
    <div className="flex space-x-3">
      <button 
        className={`flex-1 py-3 ${value === 'pdf' ? 'bg-nestor-blue text-white' : 'bg-white text-gray-700 border border-gray-300'} font-medium rounded-lg flex items-center justify-center`}
        onClick={() => onChange('pdf')}
      >
        <FileText className="mr-2" size={18} />
        PDF
      </button>
      <button 
        className={`flex-1 py-3 ${value === 'csv' ? 'bg-nestor-blue text-white' : 'bg-white text-gray-700 border border-gray-300'} font-medium rounded-lg flex items-center justify-center`}
        onClick={() => onChange('csv')}
      >
        <FileType className="mr-2" size={18} />
        CSV
      </button>
    </div>
  );
};

export default ReportFormatToggle;
