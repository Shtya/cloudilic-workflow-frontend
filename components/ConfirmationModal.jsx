export const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full'>
        <h3 className='text-lg font-medium mb-2'>{title}</h3>
        <p className='text-gray-600 mb-4'>{message}</p>
        <div className='flex justify-end gap-2'>
          <button onClick={onCancel} className='px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded'>
            Cancel
          </button>
          <button onClick={onConfirm} className='px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded'>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};