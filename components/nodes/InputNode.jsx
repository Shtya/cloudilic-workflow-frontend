import { Handle, Position } from 'reactflow';
import { X } from 'lucide-react';

export const InputNode = ({ id, data, selected, onDelete }) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
      <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
        <img src='/download.png' className='w-[16px] h-[16px]' alt='Input' />
        <span className='font-medium'>Input</span>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(id);
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer hover:text-red-500 text-gray-900'>
          <X size={14} />
        </button>
      </div>
      <textarea 
        value={data.question || ''} 
        onChange={e => data.onChange(e.target.value)} 
        placeholder='What is this PDF about?' 
        className='bg-[#f5f5f5] outline-none border border-gray-200 w-[calc(100%-10px)] ml-[5px] mt-[5px] p-2 rounded text-xs min-h-[10px] focus:outline-none focus:ring-2 focus:ring-blue-200' 
      />
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
    </div>
  );
};