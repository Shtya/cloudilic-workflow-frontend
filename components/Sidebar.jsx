import { useState } from 'react';
import { motion } from 'framer-motion';

const menuItems = [
  {
    id: 'fetch-data',
    title: 'Fetch Data',
    icon: '/cloud-service.png',
    subItems: [{ head: 'Emails' }, { icon: '/mail.png', title: 'Gmail' }, { icon: '/outlook.png', title: 'Outlook' }, { head: 'Knowledge Bases', button: 'See all' }, { icon: '/open-file.png', title: 'Knowledge Bases' }, { icon: '/folder.png', title: 'RAG/MultiRag' }, { icon: '/file-rounded-empty-sheet.png', title: 'Spreadsheet' }, { head: 'Cloud Storages' }, { icon: '/google-drive.png', title: 'Google Drive' }, { icon: '/azure.png', title: 'Azure Storage' }, { head: 'Management Tools', button: 'See all' }, { icon: '/settings.png', title: 'Tools' }, { icon: '/work.png', title: 'Docs' }],
  },
  {
    id: 'process',
    title: 'Process',
    icon: '/automation.png',
    subItems: [],
  },
  {
    id: 'actions',
    title: 'Actions',
    icon: '/corrective.png',
    subItems: [],
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: '/layout.png',
    subItems: [],
  },
];

export const Sidebar = ({ sidebarOpen, toggleSidebar, activeMenu, setActiveMenu, addNode }) => {
  const handleMenuToggle = id => {
    setActiveMenu(prev => (prev === id ? null : id));
  };

  return (
    <div className={`h-screen bg-[#1e232d] text-white flex flex-col overflow-hidden ${sidebarOpen ? 'w-[500px]' : 'w-0'}`}>
      <div className='p-4 space-y-6'>
        <div className='flex items-center justify-between px-4 text-2xl font-bold text-blue-500'>
          <div className='flex items-center gap-0 text-4xl'>
            <span className='text-[#1691f1]'>Dragi</span> <span className='text-[#eb9c1c]'>fy</span>
          </div>
          <button onClick={toggleSidebar} className='space-y-[7px] cursor-pointer group flex flex-col items-end w-8 h-fit bg-gray-800 rounded-md'>
            <div className='w-full h-[2px] block bg-white'></div>
            <div className='w-[80%] h-[2px] block bg-white duration-300 group-hover:w-full '></div>
            <div className='w-[60%] h-[2px] block bg-white duration-300 group-hover:w-full'></div>
          </button>
        </div>

        <div className='relative'>
          <input type='text' placeholder='Search blocks...' className='w-full p-2 pl-8 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500' />
          <svg className='absolute left-2 top-2.5 text-gray-400 h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
          </svg>
        </div>

        <div className='space-y-2'>
          <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>Workflow Nodes</h3>
          <div className='space-y-2'>
            <button onClick={() => addNode('inputNode')} className=' cursor-pointer duration-300 w-full flex items-center gap-2 p-2 text-sm rounded bg-gray-800 hover:bg-gray-700 transition-colors'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='11' cy='11' r='8'></circle>
                <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
              </svg>
              Input Node
            </button>
            <button onClick={() => addNode('ragNode')} className=' cursor-pointer duration-300 w-full flex items-center gap-2 p-2 text-sm rounded bg-gray-800 hover:bg-gray-700 transition-colors'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
              </svg>
              RAG Node
            </button>
            <button onClick={() => addNode('outputNode')} className=' cursor-pointer duration-300 w-full flex items-center gap-2 p-2 text-sm rounded bg-gray-800 hover:bg-gray-700 transition-colors'>
              <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <polyline points='4 17 10 11 4 5'></polyline>
                <line x1='12' y1='19' x2='20' y2='19'></line>
              </svg>
              Output Node
            </button>
          </div>
        </div>

        {/* Menu Sections */}
        <div className='relative w-full'>
          {menuItems.map(item => (
            <div className='w-[100px] space-y-1 mt-2' key={item.id}>
              <div onClick={() => handleMenuToggle(item.id)} className='cursor-pointer flex flex-col justify-center items-center text-center space-x-2 text-lg hover:!bg-[#28323c] py-3 px-4 rounded-md' style={{ backgroundColor: activeMenu === item.id ? '#28323c' : 'transparent' }}>
                <img src={item.icon} alt={item.title} className='w-8 h-8' />
                <span className='text-base mt-1'>{item.title}</span>
              </div>

              {activeMenu === item.id ? (
                <motion.div className='px-4 border-l  border-gray-100/10 absolute w-[calc(100%-110px)] top-0 right-0 space-y-2' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  {item.subItems.length > 0 ? (
                    item.subItems.map((subItem, index) => (
                      <div key={index} className={`  ${subItem?.head ? 'block' : 'cursor-pointer hover:bg-[#28323c] rounded-md duration-300 p-1 inline-flex flex-col items-center justify-center gap-1 mr-5'} space-x-2 text-sm py-1 `}>
                        {subItem.icon && <img src={subItem.icon} alt={subItem.title} className='w-10 h-10' />}
                        <span className={`${subItem?.head ? `text-lg font-[500] opacity-60 block ${index !== 0 && 'mt-6'}` : 'text-sm w-[80px] !block text-center '}`}>{subItem.title || subItem.head || subItem.button}</span>
                      </div>
                    ))
                  ) : (
                    <div className='h-full text-sm py-2 text-center text-gray-500 flex items-center justify-center space-x-2'>
                      <span>No sub-items available</span>
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' className='w-5 h-5 text-gray-400'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 8v4m0 4h.01m2.293-4.293a1 1 0 00-1.414 1.414L12 13.586l-2.293-2.293a1 1 0 10-1.414 1.414L10.586 15l-2.293 2.293a1 1 0 101.414 1.414L12 16.414l2.293 2.293a1 1 0 001.414-1.414L13.414 15l2.293-2.293a1 1 0 000-1.414z' />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};