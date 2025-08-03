import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { UploadIcon, FileIcon, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { TextPreviewModal } from '../TextPreviewModal';

export const RagNode = ({ id, data, selected, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTextModal, setShowTextModal] = useState(false);

  const handleFileUpload = async file => {
    setIsLoading(true);
    setError('');

    if (!file) return;

    data.onUpload(file.name, '');

    try {
      const formData = new FormData();
      formData.append('FILE', file);

      const response = await fetch('https://nextjs-pdf-parser1.vercel.app/api/parse-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return toast.warn(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      data.onUpload(file.name, text);
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Failed to extract text from PDF. Please try again.');
      toast.error('Failed to process PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback(
    async acceptedFiles => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      await handleFileUpload(acceptedFiles[0]);
    },
    [data],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    onDrop,
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading,
  });

  return (
    <>
      <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
        <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
          <img src='/file.png' className='w-[16px] h-[16px]' alt='RAG' />
          <span className='font-medium'>RAG</span>
          {data.pdfText && (
            <button
              onClick={e => {
                e.stopPropagation();
                setShowTextModal(true);
              }}
              className='ml-auto p-1 text-xs bg-blue-100 hover:bg-blue-200 rounded'>
              Show Text
            </button>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              onDelete(id);
            }}
            className='p-0.5 cursor-pointer hover:text-red-500 text-gray-900'>
            <X size={14} />
          </button>
        </div>

        <div {...getRootProps()} className={`m-1 p-4 border-2 border-dashed rounded-md text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'} ${isLoading ? 'pointer-events-none opacity-70' : ''}`}>
          <input {...getInputProps()} />
          {isLoading ? (
            <div className='flex flex-col items-center justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2'></div>
              <p className='text-sm text-gray-600'>Processing PDF...</p>
            </div>
          ) : (
            <>
              <div className='flex flex-col items-center justify-center'>
                <UploadIcon className='w-6 h-6 text-gray-500 mb-2' />
                <p className='text-sm text-gray-700'>{isDragActive ? 'Drop PDF here' : 'Drag & drop PDF or click to browse'}</p>
                <p className='text-xs text-gray-500 mt-1'>(Max 10MB)</p>
              </div>
            </>
          )}
        </div>

        {data.fileName && (
          <div className='m-1 p-2 bg-gray-100 rounded-md text-xs flex items-center'>
            <FileIcon className='w-4 h-4 mr-2 text-gray-600' />
            <span className='truncate'>{data.fileName}</span>
          </div>
        )}

        {error && <div className='m-1 p-2 bg-red-50 text-red-600 text-xs rounded-md'>{error}</div>}

        <Handle
          type='source'
          position={Position.Bottom}
          style={{
            transform: 'translateY(1px)',
            width: '12px',
            height: '12px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            border: '2px solid #aaa',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Handle
          type='target'
          position={Position.Top}
          style={{
            transform: 'translateY(-2px)',
            width: '12px',
            height: '12px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            border: '2px solid #aaa',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
      </div>

      <TextPreviewModal isOpen={showTextModal} onClose={() => setShowTextModal(false)} content={data.pdfText} />
    </>
  );
};