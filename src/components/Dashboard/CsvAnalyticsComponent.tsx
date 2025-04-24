import React, { useState, useRef } from 'react';
import { FileArrowUp, Upload } from '@phosphor-icons/react';
import { analyzeLocalCsvFile, CsvSummary } from '@/services/csvAnalyticsService';

interface CsvAnalyticsComponentProps {
  onAnalysisComplete: (summary: CsvSummary) => void;
}

const CsvAnalyticsComponent: React.FC<CsvAnalyticsComponentProps> = ({ onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileAnalysis(file);
    }
  };

  const handleFileAnalysis = async (file: File) => {
    if (!file) {
      setError("Please select a CSV file to analyze");
      return;
    }

    // Verify file is a CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError("Please select a CSV file");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const summary = await analyzeLocalCsvFile(file);
      setSuccess(`File "${file.name}" analyzed successfully!`);
      
      // Call the callback with the summary data
      onAnalysisComplete(summary);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error analyzing CSV file:', error);
      setError("Failed to analyze CSV file. Please check the format and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileAnalysis(files[0]);
    }
  };

  return (
    <div className="bg-[#161A1F] p-6 rounded-lg">
      <h3 className="text-lg font-medium text-white mb-4">Analyze CSV Without Uploading</h3>
      
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="w-12 h-12 mb-3 flex items-center justify-center">
          <Upload size={32} weight="thin" className="text-[#A365FF]" />
        </div>
        
        <p className="text-gray-300 mb-2 text-sm text-center">
          Browse or drag and drop a CSV file to analyze<br />
          <span className="text-gray-500 text-xs">Your file remains local and won't be uploaded</span>
        </p>
        
        {error && (
          <div className="text-red-500 mb-2 text-center text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-green-500 mb-2 text-center text-sm">
            {success}
          </div>
        )}

        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
          ref={fileInputRef}
          disabled={isAnalyzing}
        />

        <button 
          className={`mt-3 px-4 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors flex items-center ${isAnalyzing ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <FileArrowUp size={16} className="mr-2" />
              Analyze CSV
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CsvAnalyticsComponent; 