import { Handle, Position } from 'reactflow';
import { X } from 'lucide-react';

export const OutputNode = ({ id, data, selected, onDelete }) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
      <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
        <img src='/download.png' className='rotate-180 w-[16px] h-[16px]' alt='Output' />
        <span className='font-medium'>Output</span>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(id);
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer hover:text-red-500 text-gray-900'>
          <X size={14} />
        </button>
      </div>
      <div className='text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-[250px] overflow-auto'>{data.output || <div className='text-gray-400 italic'>AI response will appear here after running the workflow...</div>}</div>
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
  );
};