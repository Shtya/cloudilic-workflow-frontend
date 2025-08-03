'use client';

import { useState } from 'react';

export default function PDFUploader() {
  const [fileName, setFileName] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setExtractedText('');
    setError('');
    console.log(e.target.files[0]);
    
    const file = e.target.files[0]
    if (!file) return;

    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('FILE', file);

      const response = await fetch('https://nextjs-pdf-parser1.vercel.app/api/parse-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      setExtractedText(text);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Failed to extract text from PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">PDF Text Extractor</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isLoading}
          />
        </div>

        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-blue-700 flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing PDF...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {fileName && !isLoading && !error && (
          <div className="mb-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-700 font-medium">Successfully processed: {fileName}</p>
          </div>
        )}

        {extractedText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-800">Extracted Text:</h2>
              <button 
                onClick={() => navigator.clipboard.writeText(extractedText)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Copy Text
              </button>
            </div>
            <div className="p-4 bg-gray-100 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{extractedText}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}