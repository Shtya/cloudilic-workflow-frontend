export const TextPreviewModal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed h-[400px] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h3 className='text-lg font-medium'>PDF Text Preview</h3>
          <button onClick={onClose} className='p-1 rounded-full hover:bg-gray-100'>
            <X size={20} />
          </button>
        </div>
        <div className='p-4 flex-1 overflow-auto h-full '>
          <pre className='whitespace-pre-wrap text-sm'>{content}</pre>
        </div>
        <div className='p-4 border-t flex justify-end'>
          <button onClick={onClose} className='px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded'>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

