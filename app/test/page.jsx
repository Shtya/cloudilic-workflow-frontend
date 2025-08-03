'use client';
import { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

    const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // ⚠️ خطر في الإنتاج

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!message.trim()) return;

  setLoading(true);
  setResponse('');

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // You can change the model based on your need
        messages: [{ role: 'user', content: message }],
        temperature: 1.0,
        max_tokens: 100,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch response');
    }

    const data = await res.json();
    setResponse(data.choices[0].message.content); // Display response
  } catch (error) {
    console.error(error);
    setResponse(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6'>
      <h1 className='text-2xl font-bold mb-6'>ChatGPT 4 API Test</h1>

      <form onSubmit={handleSubmit} className='bg-white p-6 rounded-xl shadow-lg w-full max-w-lg'>
        <label htmlFor='mytext' className='block mb-2 font-semibold'>
          Enter your message:
        </label>
        <input id='mytext' type='text' value={message} onChange={e => setMessage(e.target.value)} className='w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500' required />

        <button type='submit' disabled={loading} className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400'>
          {loading ? 'Sending...' : 'Submit'}
        </button>

        <div className='mt-6'>
          <h2 className='text-xl font-semibold mb-2'>Response:</h2>
          <textarea value={response} readOnly rows='10' className='w-full p-3 border rounded-lg bg-gray-50' />
        </div>
      </form>
    </div>
  );
}
