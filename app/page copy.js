// handle here the cancel the node button x when click on it delete this node
// write on every Head this should like with what ( input , output) like this 
// show the msgs errro on react-toast not throw new error 
// and don't user ( confirm , alert) make custom modal and use it in the all cases
// the parse of the pdf is not working check form it


'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { Handle, Position, addEdge, Background, Controls, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useDropzone } from 'react-dropzone';
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { AlignJustify, FileText, Info, MessageSquareText, Play, Repeat, RotateCcw, Save, Settings, Share2, UserRound, X } from 'lucide-react';
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Custom node types with better styling
const InputNode = ({ id, data, selected }) => {
  // You'll need to pass the onDelete function from the parent component
  const onDelete = data.onDelete || (() => {});

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
      <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
        <img src='/download.png' className='w-[16px] h-[16px]' />
        <span className='font-medium'>Input</span>
        <button
          onClick={e => {
            e.stopPropagation(); 
            onDelete(id);
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-0.5  cursor-pointer hover:text-red-500 text-gray-900 '>
          <X size={14} />
        </button>
      </div>
      <textarea value={data.question || ''} onChange={e => data.onChange(e.target.value)} placeholder='What is this PDF about?' className='bg-[#f5f5f5] outline-none border border-gray-200 w-[calc(100%-10px)] ml-[5px] mt-[5px] p-2 rounded text-xs min-h-[10px] focus:outline-none focus:ring-2 focus:ring-blue-200' />
      {/* Add source handle (output) */}
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

const RagNode = ({ id, data, selected }) => {
  const [status, setStatus] = useState('');

  const onDrop = useCallback(
    async acceptedFiles => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      data.onUpload(file.name, '');
      setStatus(`Extracting text from ${file.name}...`);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(it => it.str);
          fullText += strings.join(' ') + '\n\n';
        }
        data.onUpload(file.name, fullText);
        setStatus(`Loaded PDF: ${file.name}`);
      } catch (e) {
        console.error('PDF parse error', e);
        setStatus('Failed to extract PDF text');
      }
    },
    [data],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop,
    multiple: false,
  });

  return (
    // <div className='bg-white p-4 rounded-lg shadow-md w-64 border border-purple-100'>
    <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
      <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
        <img src='/folder (1).png' className='w-[16px] h-[16px]' />
        <span className='font-medium'>RAG/Multi Rag</span>
        <button
          onClick={e => {
            e.stopPropagation(); // Prevent node selection when clicking delete
            onDelete(id);
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-0.5  cursor-pointer hover:text-red-500 text-gray-900 '>
          <X size={14} />
        </button>
      </div>

      <Handle
        type='target'
        position={Position.Left}
        style={{
          transform: 'translateX(-3px)',
          width: '12px',
          height: '12px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          border: '2px solid #aaa',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      />

      <Handle
        type='source'
        position={Position.Right}
        style={{
          transform: 'translateX(3px)',
          width: '12px',
          height: '12px',
          backgroundColor: '#fff',
          borderRadius: '50%',
          border: '2px solid #aaa',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      />

      <div {...getRootProps()} className={` w-[calc(100%-10px)] ml-[5px] my-[5px] border-2 border-dashed p-4 rounded-lg cursor-pointer text-sm max-h-[50px] bg-gray-100 flex flex-col justify-center items-center transition-colors ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-300'}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className='text-purple-600 font-medium'>Drop PDF here...</div>
        ) : (
          <div className="flex items-center gap-2 " >
            <img src="/cloud-computing.png" className=" opacity-50 w-8 h-fit  " />
            <div className='text-xs text-gray-500 mt-1 '>Click to upload</div>
          </div>
        )}
      </div>
      {data.fileName && (
        <div className='mt-3 text-xs w-[calc(100%-10px)] ml-[5px] my-[5px] '>
          <div className='font-medium text-gray-600'>Docs: <span className="opacity-50 !text-[10px] " > ( 1000MB limit per file) </span> </div>
          <div className='truncate px-2 py-1 text-xs bg-green-100 opacity-80 rounded flex items-center gap-2 mt-1'>
            {data.fileName}
          </div>
        </div>
      )}

    </div>
  );
};

const OutputNode = ({ id, data , selected }) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
      <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
        <img src='/download.png' className=' rotate-180 w-[16px] h-[16px]' />
        <span className='font-medium'>Output</span>
        <button
          onClick={e => {
            e.stopPropagation(); 
            onDelete(id);
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-0.5  cursor-pointer hover:text-red-500 text-gray-900 '>
          <X size={14} />
        </button>
      </div>
      <textarea value={data.question || ''} onChange={e => data.onChange(e.target.value)} placeholder='What is this PDF about?' className='bg-[#f5f5f5] outline-none border border-gray-200 w-[calc(100%-10px)] ml-[5px] mt-[5px] p-2 rounded text-xs min-h-[10px] focus:outline-none focus:ring-2 focus:ring-blue-200' />
      {/* Add source handle (output) */}
      <Handle
        type='target'
        position={Position.Bottom}
        style={{
          transform: 'translateY(2px)',
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

const nodeTypes = {
  inputNode: InputNode,
  ragNode: RagNode,
  outputNode: OutputNode,
};

export default function Page() {
  // Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [running, setRunning] = useState(false);
  const [loop, setLoop] = useState(false);
  const loopRef = useRef(null);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('');
  const [activeMenu, setActiveMenu] = useState('fetch-data');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper to update node data
  const updateNodeData = (id, newData) => {
    setNodes(nds =>
      nds.map(n => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              ...newData,
              onChange: n.type === 'inputNode' ? v => updateNodeData(id, { question: v }) : n.data?.onChange,
              onUpload: n.type === 'ragNode' ? (name, text) => updateNodeData(id, { fileName: name, pdfText: text }) : n.data?.onUpload,
            },
          };
        }
        return n;
      }),
    );
  };

  // Attach missing handlers after loading from storage
  const attachHandlers = loadedNodes => {
    return loadedNodes.map(n => {
      if (n.type === 'inputNode') {
        return {
          ...n,
          data: {
            question: n.data?.question || '',
            onChange: v => updateNodeData(n.id, { question: v }),
          },
        };
      }
      if (n.type === 'ragNode') {
        return {
          ...n,
          data: {
            fileName: n.data?.fileName || '',
            pdfText: n.data?.pdfText || '',
            onUpload: (name, text) => updateNodeData(n.id, { fileName: name, pdfText: text }),
          },
        };
      }
      if (n.type === 'outputNode') {
        return {
          ...n,
          data: {
            output: n.data?.output || '',
          },
        };
      }
      return n;
    });
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cloudilic_flow');
      if (saved) {
        const { nodes: ln, edges: le } = JSON.parse(saved);
        const fixed = attachHandlers(ln);
        setNodes(fixed);
        setEdges(le || []);
      }
    } catch (e) {
      console.warn('Failed to load saved flow', e);
    }
    return () => clearInterval(loopRef.current);
  }, []);

  // Loop runner
  useEffect(() => {
    if (loop) {
      loopRef.current = setInterval(() => {
        runWorkflow();
      }, 30000);
    } else {
      clearInterval(loopRef.current);
    }
    return () => clearInterval(loopRef.current);
  }, [loop, nodes, apiKey]);

  // Connect handler
  const onConnect = useCallback(
    params =>
      setEdges(eds =>
        addEdge(
          {
            ...params,
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
            },
            style: {
              stroke: '#888',
              strokeWidth: 2,
            },
          },
          eds,
        ),
      ),
    [],
  );

  // Add new node
  const addNode = type => {
    const base = {
      id: `${type}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      position: { x: 250, y: 100 + nodes.length * 80 },
      data: {},
    };

    if (type === 'inputNode') {
      base.data = {
        question: '',
        onChange: v => updateNodeData(base.id, { question: v }),
      };
    } else if (type === 'ragNode') {
      base.data = {
        fileName: '',
        pdfText: '',
        onUpload: (name, text) => updateNodeData(base.id, { fileName: name, pdfText: text }),
      };
    } else if (type === 'outputNode') {
      base.data = {
        output: '',
      };
    }

    setNodes(nds => nds.concat(base));
  };

  // Run the workflow
  const runWorkflow = async () => {
    if (running) return;
    setRunning(true);
    setStatus('Running workflow...');

    try {
      const inputNode = nodes.find(n => n.type === 'inputNode');
      const ragNode = nodes.find(n => n.type === 'ragNode');
      const outputNode = nodes.find(n => n.type === 'outputNode');

      // Validate nodes
      if (!inputNode || !ragNode || !outputNode) {
        throw new Error('You need Input, RAG and Output nodes connected.');
      }

      const question = inputNode.data?.question?.trim() || '';
      const pdfContent = ragNode.data?.pdfText?.trim() || '';

      // Validate inputs
      if (!question) {
        throw new Error('Please enter a question in the Input node.');
      }
      if (!pdfContent) {
        throw new Error('Please upload and wait for PDF text extraction in RAG node.');
      }
      if (!apiKey.trim()) {
        throw new Error('Please provide your OpenAI API Key in the top bar.');
      }

      // Prepare the prompt
      let useContent = pdfContent;
      if (useContent.length > 7000) {
        useContent = useContent.slice(0, 7000) + '\n\n[Truncated]';
      }

      const prompt = `You are a helpful assistant. Given the following PDF content, please answer the question concisely and accurately. If the answer cannot be found in the content, say "The answer is not available in the provided document."

PDF Content:
${useContent}

Question: ${question}

Answer:`;

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
      }

      const data = await response.json();
      const answer = data?.choices?.[0]?.message?.content || 'No answer returned from AI.';

      // Update output node
      updateNodeData(outputNode.id, { output: answer });
      setStatus('Workflow completed successfully.');
    } catch (error) {
      console.error('Workflow error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setRunning(false);
    }
  };

  // Save workflow to localStorage
  const saveFlow = () => {
    try {
      const sanitizedNodes = nodes.map(n => {
        const d = { ...(n.data || {}) };
        delete d.onChange;
        delete d.onUpload;
        return { ...n, data: d };
      });

      localStorage.setItem(
        'cloudilic_flow',
        JSON.stringify({
          nodes: sanitizedNodes,
          edges,
          timestamp: new Date().toISOString(),
        }),
      );

      setStatus('Workflow saved successfully.');
    } catch (e) {
      console.error('Save error:', e);
      setStatus('Failed to save workflow.');
    }
  };

  const resetFlow = () => {
    if (confirm('Are you sure you want to reset the workflow? This cannot be undone.')) {
      setNodes([]);
      setEdges([]);
      localStorage.removeItem('cloudilic_flow');
      setStatus('Workflow reset.');
    }
  };

  const exportFlow = () => {
    try {
      const sanitizedNodes = nodes.map(n => {
        const d = { ...(n.data || {}) };
        delete d.onChange;
        delete d.onUpload;
        return { ...n, data: d };
      });

      const blob = new Blob(
        [
          JSON.stringify(
            {
              nodes: sanitizedNodes,
              edges,
              metadata: {
                exportedAt: new Date().toISOString(),
                version: '1.0',
              },
            },
            null,
            2,
          ),
        ],
        { type: 'application/json' },
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus('Workflow exported successfully.');
    } catch (e) {
      console.error('Export error:', e);
      setStatus('Failed to export workflow.');
    }
  };

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

  const handleMenuToggle = id => {
    setActiveMenu(prev => (prev === id ? null : id));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='h-screen text-black flex flex-col bg-gray-50'>
      {/* Top bar */}
      <div className={`grid ${sidebarOpen ? 'grid-cols-[280px_1fr]' : 'grid-cols-[0px_1fr]'} transition-all duration-300`}>
        {/* Sidebar */}
        <div className={`h-screen bg-[#1e232d] text-white flex flex-col overflow-hidden ${sidebarOpen ? 'w-[280px]' : 'w-0'}`}>
          <div className='p-4 space-y-6'>
            {/* Logo */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-2xl font-bold'>
                <span className='text-[#1691f1]'>Dragi</span>
                <span className='text-[#eb9c1c]'>fy</span>
              </div>
              <button onClick={toggleSidebar} className='p-1 rounded hover:bg-gray-700 transition-colors'>
                <AlignJustify size={20} />
              </button>
            </div>

            {/* Search */}
            <div className='relative'>
              <input type='text' placeholder='Search blocks...' className='w-full p-2 pl-8 bg-gray-800 text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500' />
              <svg className='absolute left-2 top-2.5 text-gray-400 h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>

            {/* Node Palette */}
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>Workflow Nodes</h3>
              <div className='space-y-2'>
                <button onClick={() => addNode('inputNode')} className='w-full flex items-center gap-2 p-2 text-sm rounded bg-gray-800 hover:bg-gray-700 transition-colors'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='11' cy='11' r='8'></circle>
                    <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                  </svg>
                  Input Node
                </button>
                <button onClick={() => addNode('ragNode')} className='w-full flex items-center gap-2 p-2 text-sm rounded bg-gray-800 hover:bg-gray-700 transition-colors'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path>
                  </svg>
                  RAG Node
                </button>
                <button onClick={() => addNode('outputNode')} className='w-full flex items-center gap-2 p-2 text-sm rounded bg-gray-800 hover:bg-gray-700 transition-colors'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='4 17 10 11 4 5'></polyline>
                    <line x1='12' y1='19' x2='20' y2='19'></line>
                  </svg>
                  Output Node
                </button>
              </div>
            </div>

            {/* Menu Sections */}
            <div className='space-y-4'>
              {menuItems.map(item => (
                <div key={item.id} className='space-y-1'>
                  <button onClick={() => handleMenuToggle(item.id)} className={`w-full flex items-center justify-between p-2 text-sm rounded ${activeMenu === item.id ? 'bg-[#28323c]' : 'hover:bg-gray-700'} transition-colors`}>
                    <div className='flex items-center gap-2'>
                      <img src={item.icon} alt={item.title} className='w-5 h-5' />
                      <span>{item.title}</span>
                    </div>
                    <svg className={`h-4 w-4 transform ${activeMenu === item.id ? 'rotate-90' : ''} transition-transform`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                    </svg>
                  </button>

                  {activeMenu === item.id && item.subItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='pl-8 space-y-1 overflow-hidden'>
                      {item.subItems.map((subItem, index) => (
                        <div key={index} className={`p-2 text-sm rounded ${subItem.head ? 'text-gray-400 font-medium pt-4' : 'hover:bg-gray-700 cursor-pointer'}`}>
                          {subItem.head ? (
                            <div className='flex justify-between items-center'>
                              <span>{subItem.head}</span>
                              {subItem.button && <button className='text-xs text-blue-400 hover:text-blue-300'>{subItem.button}</button>}
                            </div>
                          ) : (
                            <div className='flex items-center gap-2'>
                              {subItem.icon && <img src={subItem.icon} alt={subItem.title} className='w-4 h-4' />}
                              <span>{subItem.title}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className='flex flex-col h-screen'>
          {/* Toolbar */}
          <div className='bg-white border-b flex items-center justify-between p-3'>
            <div className='flex items-center gap-4'>
              <button onClick={toggleSidebar} className='p-1 rounded hover:bg-gray-100'>
                <AlignJustify size={20} />
              </button>
              <h2 className='font-semibold'>Workflow Builder</h2>
            </div>

            <div className='flex items-center gap-4'>
              <div className='relative'>
                <input type='password' value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder='OpenAI API Key' className='border rounded p-1.5 text-sm pl-8 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500' />
                <svg className='absolute left-2 top-2.5 text-gray-400 h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
                </svg>
              </div>

              <div className='flex items-center gap-2'>
                <button onClick={runWorkflow} disabled={running} className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${running ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}>
                  <Play size={16} />
                  {running ? 'Running...' : 'Run'}
                </button>

                <button onClick={() => setLoop(!loop)} className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${loop ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                  <Repeat size={16} />
                  Loop
                </button>

                <div className='relative group'>
                  <button className='p-1.5 rounded hover:bg-gray-100'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <circle cx='12' cy='12' r='1'></circle>
                      <circle cx='12' cy='5' r='1'></circle>
                      <circle cx='12' cy='19' r='1'></circle>
                    </svg>
                  </button>
                  <div className='absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block'>
                    <button onClick={saveFlow} className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2'>
                      <Save size={14} />
                      Save
                    </button>
                    <button onClick={resetFlow} className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2'>
                      <RotateCcw size={14} />
                      Reset
                    </button>
                    <button onClick={exportFlow} className='w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2'>
                      <Share2 size={14} />
                      Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className='flex-1 relative bg-gray-50'>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{
                animated: true,
                style: {
                  stroke: '#888',
                  strokeWidth: 2,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                },
              }}
              attributionPosition='bottom-right'>
              <Background color='#aaa' gap={16} />
              <Controls
                position='bottom-left'
                showInteractive={false}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              />
            </ReactFlow>

            {nodes.length === 0 && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <div className='text-center p-6 bg-white bg-opacity-80 rounded-lg shadow-sm max-w-md'>
                  <h3 className='text-lg font-medium mb-2'>Welcome to Dragify</h3>
                  <p className='text-gray-600 mb-4'>Drag nodes from the sidebar to start building your workflow. Connect Input → RAG → Output nodes to process PDFs with AI.</p>
                  <div className='flex justify-center gap-2'>
                    <div className='p-2 bg-blue-50 rounded text-blue-600 text-sm'>Input → Question</div>
                    <div className='p-2 bg-purple-50 rounded text-purple-600 text-sm'>RAG → PDF Upload</div>
                    <div className='p-2 bg-green-50 rounded text-green-600 text-sm'>Output → AI Response</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className='bg-white border-t p-2 text-sm flex items-center justify-between'>
            <div className='text-gray-600'>{status || <span>Ready. {nodes.length > 0 ? `${nodes.length} node${nodes.length !== 1 ? 's' : ''} in workflow` : 'No nodes added yet'}</span>}</div>
            <div className='text-gray-500 text-xs'>{apiKey ? <span className='text-green-600'>OpenAI API Key: •••••••••</span> : <span className='text-red-500'>Please add OpenAI API Key to run workflow</span>}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
