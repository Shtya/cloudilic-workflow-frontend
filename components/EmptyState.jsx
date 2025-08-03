export const EmptyState = ({ addNode, updateNodeData, deleteNode }) => {
  return (
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
            // Create nodes
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

            // Create edges
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
  );
};