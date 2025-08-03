import { Play, Repeat, Save, RotateCcw, Share2 } from 'lucide-react';

export const Toolbar = ({ running, loop, setLoop, runWorkflow, saveFlow, resetFlow, exportFlow }) => {
  return (
    <div className='absolute top-full z-[10] left-1/2 -translate-x-1/2  overflow-hidden w-fit rounded-[0_0_15px_15px] flex items-center gap-2 bg-[#cde1fa]'>
      <button onClick={runWorkflow} disabled={running} className={`py-[5px] px-[10px] duration-300 text-base font-[600] flex items-center gap-[4px] ${running ? 'cursor-wait' : 'cursor-pointer hover:bg-[#a6c4f8]'}`}>
        {running ? <div className='w-4 h-4 border-2 border-t-2 border-t-blue-500 border-gray-200 rounded-full animate-spin'></div> : <Play size={16} />}
        {running ? 'Running...' : 'Run'}
      </button>

      <button onClick={() => setLoop(!loop)} className={`py-[5px] px-[10px] duration-300 text-base cursor-pointer font-[600] flex items-center gap-[4px] ${loop ? 'bg-[#a6c4f8] hover:bg-[#8bb4f6]' : 'bg-[#cde1fa] hover:bg-[#c8d9f3]'}`}>
        <Repeat size={16} /> Loop
      </button>

      <button onClick={saveFlow} className='py-[5px] px-[10px] duration-300 text-base cursor-pointer font-[600] flex items-center gap-[4px] hover:bg-[#a6c4f8]'>
        <Save size={16} /> Save
      </button>

      <button onClick={resetFlow} className='py-[5px] px-[10px] duration-300 text-base cursor-pointer font-[600] flex items-center gap-[4px] hover:bg-[#a6c4f8]'>
        <RotateCcw size={16} /> Reset
      </button>

      <button onClick={exportFlow} className='py-[5px] px-[10px] duration-300 text-base cursor-pointer font-[600] flex items-center gap-[4px] hover:bg-[#a6c4f8]'>
        <Share2 size={16} /> Export
      </button>
    </div>
  );
};