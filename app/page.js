/* 

Hi [Interviewer’s Name],
I hope you're doing well! I wanted to share a link to my latest project with you. It’s a web application that combines React, Node.js, and OpenAI API to deliver an interactive experience. I’d love to hear your thoughts on it!
Here are the details:

🔗 Live Preview
Frontend: https://dragify-workflow.vercel.app/
Backend : https://cloudilic-workflow-backend.vercel.app

💻 GitHub Repository: [GitHub Repo Link]
Frontend: https://github.com/Shtya/cloudilic-workflow-frontend
Backend : https://github.com/Shtya/cloudilic-workflow-backend

🎥 Project Walkthrough Video: [Video Link]

Feel free to explore the app, and don’t hesitate to reach out with any questions. Looking forward to hearing your feedback!

Best regards,
[Your Name]




fav
sidebar
*/
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { Handle, Position, addEdge, Background, Controls, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useDropzone } from 'react-dropzone';
import { AlignJustify, FileIcon, FileText, Info, MessageSquareText, Play, Repeat, RotateCcw, Save, Settings, Share2, UploadIcon, UserRound, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API;

const workflowService = {
  create: async () => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },
  get: async id => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Workflow not found');
    return response.json();
  },
  save: async (id, nodes, edges) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nodes, edges }),
    });
    return response.json();
  },
  reset: async id => {
    const response = await fetch(`${API_BASE_URL}/${id}/reset`, {
      method: 'POST',
    });
    return response.json();
  },
  delete: async id => {
    await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
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

const TextPreviewModal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed h-[400px] inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg max-w-2xl h-[500px] w-[400px] max-h-[80vh] flex flex-col'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h3 className='text-lg font-medium'>PDF Text Preview</h3>
          <button onClick={onClose} className=' cursor-pointer p-1 rounded-full hover:bg-gray-100'>
            <X size={20} />
          </button>
        </div>
        <div className='p-4 flex-1 overflow-auto h-full '>
          <pre className='whitespace-pre-wrap text-sm'>{content}</pre>
        </div>
      </div>
    </div>
  );
};

const InputNode = ({ id, data, selected, onDelete }) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md w-64 border-sm border-blue-100 ${selected ? 'ring-1 ring-blue-400' : ''}`}>
      <div className='relative font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 flex items-center gap-2'>
        <img src='/download.png' className='w-[16px] h-[16px]' alt='Input' />
        <span className='font-medium'>Input</span>
        <button
          onClick={e => {
            e.stopPropagation();
            if (typeof onDelete === 'function') {
              onDelete(id);
            } else {
              console.error('onDelete is not a function');
            }
          }}
          className='absolute right-1 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer hover:text-red-500 text-gray-900'>
          <X size={14} />
        </button>
      </div>
      <textarea value={data.question || ''} onChange={e => data.onChange(e.target.value)} placeholder='What is this PDF about?' className='bg-[#f5f5f5] outline-none border border-gray-200 w-[calc(100%-10px)] ml-[5px] mt-[5px] p-2 rounded text-xs min-h-[10px] focus:outline-none focus:ring-2 focus:ring-blue-200' />
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

const RagNode = ({ id, data, selected, onDelete }) => {
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

      const response = await fetch('api/parse-data', {
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
        <div className='relative flex justify-between font-normal text-sm px-2 py-1 bg-[#cde1fa] text-black/80 items-center gap-2'>
          <div className='flex items-center gap-2'>
            <img src='/folder (1).png' className='w-[16px] h-[16px]' alt='RAG' />
            <span className='font-medium mt-[2px] '>RAG/Multi Rag</span>
          </div>
          {data.pdfText && (
            <button
              onClick={e => {
                e.stopPropagation();
                setShowTextModal(true);
              }}
              className=' cursor-pointer ml-auto p-1 text-xs bg-blue-100 hover:bg-blue-200 rounded'>
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
              <div className='flex gap-2 opacity-70 items-center justify-center'>
                <img className='w-8' src='/cloud-computing.png' />
                <p className='text-sm text-gray-700'>{isDragActive ? 'Drop PDF here' : 'Click to upload'}</p>
                {/* <p className='text-xs text-gray-500 mt-1'>(Max 10MB)</p> */}
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

const OutputNode = ({ id, data, selected, onDelete }) => {
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

const nodeTypes = {
  inputNode: InputNode,
  ragNode: RagNode,
  outputNode: OutputNode,
};

export default function Page() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [running, setRunning] = useState(false);
  const [loop, setLoop] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [workflowId, setWorkflowId] = useState('9213d643-37f3-4daa-a077-ecd1f2958187');
  const loopRef = useRef(null);
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const [status, setStatus] = useState('');
  const [activeMenu, setActiveMenu] = useState('fetch-data');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const initializeWorkflow = async () => {
      try {
        const savedWorkflowId = localStorage.getItem('workflowId');

        if (savedWorkflowId && savedWorkflowId != 'undefined') {
          const workflow = await workflowService.get(savedWorkflowId);
          setWorkflowId(workflow.id);

          const nodesWithHandlers = attachHandlers(workflow.nodes);
          setNodes(nodesWithHandlers);
          setEdges(workflow.edges || []);
        } else {
          const newWorkflow = await workflowService.create();
          setWorkflowId(newWorkflow.id);
          localStorage.setItem('workflowId', newWorkflow.id);
        }
      } catch (error) {
        console.error('Failed to initialize workflow:', error);
      }
    };

    initializeWorkflow();

    return () => clearInterval(loopRef.current);
  }, []);

  const showConfirmation = (title, message, onConfirm) => {
    setModalConfig({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setShowConfirmModal(false);
      },
    });
    setShowConfirmModal(true);
  };

  const deleteNode = useCallback(
    async id => {
      showConfirmation('Delete Node', 'Are you sure you want to delete this node?', async () => {
        try {
          setNodes(nds => nds.filter(node => node.id !== id));
          setEdges(eds => eds.filter(edge => edge.source !== id && edge.target !== id));

          if (workflowId) {
            await workflowService.save(
              workflowId,
              nodes.filter(n => n.id !== id),
              edges.filter(e => e.source !== id && e.target !== id),
            );
          }

          toast.success('Node deleted successfully');
        } catch (error) {
          console.error('Failed to delete node:', error);
          toast.error('Failed to delete node');
        }
      });
    },
    [workflowId, nodes, edges],
  );

  const updateNodeData = (id, newData) => {
    setNodes(nds =>
      nds.map(n => {
        if (n.id === id) {
          return {
            ...n,
            data: {
              ...n.data,
              ...newData,
              onDelete: deleteNode,
              onChange: n.type === 'inputNode' ? v => updateNodeData(id, { question: v }) : n.data?.onChange,
              onUpload: n.type === 'ragNode' ? (name, text) => updateNodeData(id, { fileName: name, pdfText: text }) : n.data?.onUpload,
            },
          };
        }
        return n;
      }),
    );
  };

  const attachHandlers = loadedNodes => {
    return loadedNodes.map(n => {
      const node = {
        ...n,
        data: {
          ...n.data,
          onDelete: deleteNode,
        },
      };

      if (n.type === 'inputNode') {
        node.data.onChange = v => updateNodeData(n.id, { question: v });
      } else if (n.type === 'ragNode') {
        node.data.onUpload = (name, text) => updateNodeData(n.id, { fileName: name, pdfText: text });
      }

      return node;
    });
  };

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

  const addNode = type => {
    const base = {
      id: `${type}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      position: { x: 250 + Math.random() * 100, y: 100 + Math.random() * 100 },
      data: {
        onDelete: deleteNode,
      },
    };

    if (type === 'inputNode') {
      base.data = {
        ...base.data,
        question: '',
        onChange: v => updateNodeData(base.id, { question: v }),
      };
    } else if (type === 'ragNode') {
      base.data = {
        ...base.data,
        fileName: '',
        pdfText: '',
        onUpload: (name, text) => updateNodeData(base.id, { fileName: name, pdfText: text }),
      };
    } else if (type === 'outputNode') {
      base.data = {
        ...base.data,
        output: '',
      };
    }

    setNodes(nds => nds.concat(base));
  };

  const runWorkflow = async () => {
    if (running) return;
    setRunning(true);
    setStatus('Running workflow...');

    try {
      const inputNodes = nodes.filter(n => n.type === 'inputNode');
      const ragNodes = nodes.filter(n => n.type === 'ragNode');
      const outputNodes = nodes.filter(n => n.type === 'outputNode');

      if (inputNodes.length === 0 || ragNodes.length === 0 || outputNodes.length === 0) {
        return toast.warn('You need at least one Input, RAG and Output node connected.');
      }

      for (const outputNode of outputNodes) {
        const connectedRagEdges = edges.filter(e => e.target === outputNode.id);
        const connectedRagNodes = ragNodes.filter(r => connectedRagEdges.some(e => e.source === r.id));

        for (const ragNode of connectedRagNodes) {
          const connectedInputEdges = edges.filter(e => e.target === ragNode.id);
          const connectedInputNodes = inputNodes.filter(i => connectedInputEdges.some(e => e.source === i.id));

          for (const inputNode of connectedInputNodes) {
            const question = inputNode.data?.question?.trim() || '';
            const pdfContent = ragNode.data?.pdfText?.trim() || '';

            if (!question) {
              return toast.warn(`Input node ${inputNode.id} has no question.`);
              continue;
            }
            if (!pdfContent) {
              return toast.warn(`RAG node ${ragNode.id} has no PDF content.`);
              continue;
            }

            let useContent = pdfContent;

            const prompt = `You are a helpful assistant. Given the following PDF content, please answer the question concisely and accurately."\n Question: ${question} \n PDF Content:\n${useContent} \nAnswer:`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 1.0,
                max_tokens: 100,
              }),
            });

            if (!response.ok) {
              return toast.warn(`Failed to get response from OpenAI for node chain ${inputNode.id} → ${ragNode.id} → ${outputNode.id}`);
            }

            const data = await response.json();
            const answer = data?.choices?.[0]?.message?.content || 'No answer returned from AI.';

            updateNodeData(outputNode.id, {
              output: (outputNode.data?.output || '') + `\n\n--- Response for "${question}" ---\n${answer}`,
            });
          }
        }
      }

      setStatus('Workflow completed successfully.');
      toast.success('Workflow completed successfully');
    } catch (error) {
      console.error('Workflow error:', error);
      setStatus(`Error: ${error.message}`);
      toast.error(error.message);
    } finally {
      setRunning(false);
    }
  };

  const saveFlow = async () => {
    try {
      if (!workflowId) return;
      toast.success('Workflow saved successfully');

      const sanitizedNodes = nodes.map(n => {
        const d = { ...(n.data || {}) };

        delete d.onChange;
        delete d.onUpload;

        return { ...n, data: d };
      });

      await workflowService.save(workflowId, sanitizedNodes, edges);
    } catch (error) {
      console.error('Save error:', error);
      setStatus('Failed to save workflow.');
      toast.error('Failed to save workflow');
    }
  };

  const resetFlow = async () => {
    showConfirmation('Reset Workflow', 'Are you sure you want to reset the workflow? This cannot be undone.', async () => {
      try {
        if (workflowId) {
          await workflowService.reset(workflowId);
          const workflow = await workflowService.get(workflowId);
          setNodes([]);
          setEdges([]);
        }
        setStatus('Workflow reset.');
        toast.success('Workflow reset successfully');
      } catch (error) {
        console.error('Reset error:', error);
        toast.error('Failed to reset workflow');
      }
    });
  };

  const exportFlow = () => {
    try {
      const sanitizedNodes = nodes.map(n => {
        const d = { ...(n.data || {}) };
        delete d.onChange;
        delete d.onUpload;
        delete d.onDelete;
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
      toast.success('Workflow exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      setStatus('Failed to export workflow.');
      toast.error('Failed to export workflow');
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
      <ConfirmationModal isOpen={showConfirmModal} onConfirm={modalConfig.onConfirm} onCancel={() => setShowConfirmModal(false)} title={modalConfig.title} message={modalConfig.message} />

      <div className={`grid ${sidebarOpen ? 'grid-cols-[500px_1fr]' : 'grid-cols-[0px_1fr]'} transition-all duration-300`}>
        <div className={`h-screen overflow-auto bg-[#1e232d] text-white flex flex-col   ${sidebarOpen ? 'w-[500px]' : 'w-0'}`}>
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

        <div className='flex flex-col h-screen'>
          <div className='relative py-4 bg-[#f0f5fa] text-black justify-between flex items-center gap-2   border-b border-gray-200   p-3'>
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
          </div>

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
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center p-6 bg-white bg-opacity-80 rounded-lg shadow-sm max-w-md'>
                  <h3 className='text-lg font-medium mb-2'>Welcome to Dragify</h3>
                  <p className='text-gray-600 mb-4'>Drag nodes from the sidebar to start building your workflow. Connect Input → RAG → Output nodes to process PDFs with AI.</p>
                  <div className='flex justify-center gap-2 mb-4'>
                    <div className='p-2 bg-blue-50 rounded text-blue-600 text-sm'>Input → Question</div>
                    <div className='p-2 bg-purple-50 rounded text-purple-600 text-sm'>RAG → PDF Upload</div>
                    <div className='p-2 bg-green-50 rounded text-green-600 text-sm'>Output → AI Response</div>
                  </div>
                  <button
                    onClick={() => {
                      const inputNode = {
                        id: 'inputNode-1',
                        type: 'inputNode',
                        position: { x: 250, y: 100 },
                        data: {
                          question: 'What is this PDF about?',
                          onChange: v => updateNodeData('inputNode-1', { question: v }),
                          onDelete: deleteNode,
                        },
                      };

                      const ragNode = {
                        id: 'ragNode-1',
                        type: 'ragNode',
                        position: { x: 250, y: 250 },
                        data: {
                          fileName: '',
                          pdfText: '',
                          onUpload: (name, text) => updateNodeData('ragNode-1', { fileName: name, pdfText: text }),
                          onDelete: deleteNode,
                        },
                      };

                      const outputNode = {
                        id: 'outputNode-1',
                        type: 'outputNode',
                        position: { x: 250, y: 500 },
                        data: {
                          output: '',
                          onDelete: deleteNode,
                        },
                      };

                      const edge1 = {
                        id: 'edge-1',
                        source: 'inputNode-1',
                        target: 'ragNode-1',
                        animated: true,
                        markerEnd: { type: MarkerType.Arrow },
                        style: { stroke: '#888', strokeWidth: 2 },
                      };

                      const edge2 = {
                        id: 'edge-2',
                        source: 'ragNode-1',
                        target: 'outputNode-1',
                        animated: true,
                        markerEnd: { type: MarkerType.Arrow },
                        style: { stroke: '#888', strokeWidth: 2 },
                      };

                      setNodes([inputNode, ragNode, outputNode]);
                      setEdges([edge1, edge2]);
                    }}
                    className='cursor-pointer duration-300s px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm'>
                    Create Starter Workflow
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className='bg-white border-t p-2 text-sm flex items-center justify-between'>
            <div className='text-gray-600'>{status || <span>Ready. {nodes.length > 0 ? `${nodes.length} node${nodes.length !== 1 ? 's' : ''} in workflow` : 'No nodes added yet'}</span>}</div>
            <div className='text-gray-500 text-xs'>{apiKey ? <span className='text-green-600'>OpenAI API Key: •••••••••</span> : <span className='text-red-500'>Please add OpenAI API Key to run workflow</span>}</div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
