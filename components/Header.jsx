import { AlignJustify, MessageSquareText, FileText, Settings, Info, UserRound } from 'lucide-react';
import { Toolbar } from './Toolbar';

export const Header = ({ sidebarOpen, toggleSidebar, running, loop, setLoop, runWorkflow, saveFlow, resetFlow, exportFlow }) => {
  return (
    <div className='relative py-4 bg-[#f0f5fa] text-black justify-between flex items-center gap-2 border-b border-gray-200 p-3'>
      <div className='flex items-center gap-4'>
        {!sidebarOpen && (
          <button onClick={toggleSidebar} className='p-1 rounded hover:bg-gray-100'>
            <AlignJustify size={28} />
          </button>
        )}
        <h2 className='font-semibold text-xl '>Assessment</h2>
      </div>

      <ul className='w-full flex justify-end gap-3 items-center '>
        <li className='cursor-pointer  '>
          <MessageSquareText size={24} />
        </li>
        <li className='cursor-pointer  '>
          <FileText size={24} />
        </li>
        <li className='cursor-pointer  '>
          <Settings size={24} />
        </li>
        <li className='cursor-pointer  '>
          <Info size={24} />
        </li>
        <button className='px-4 rounded-sm bg-[#3c82f5] text-white cursor-pointer text-md py-1 '> INVITE </button>
        <li className='cursor-pointer  '>
          <UserRound size={24} />
        </li>
      </ul>

      <Toolbar 
        running={running} 
        loop={loop} 
        setLoop={setLoop} 
        runWorkflow={runWorkflow} 
        saveFlow={saveFlow} 
        resetFlow={resetFlow} 
        exportFlow={exportFlow} 
      />
    </div>
  );
};