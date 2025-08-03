const API_BASE_URL = process.env.NEXT_PUBLIC_API 

export const workflowService = {
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