import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Greetings... I am Epic Tech. An oracle of infinite knowledge, channeled through the lightning of AI. Speak your question.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setIsLoading(true);

    setMessages(prev => [...prev, { text: '', sender: 'bot' }]);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error('Groq API key not found. Add VITE_GROQ_API_KEY in Vercel → Environment Variables.');
      }

      const openai = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
        dangerouslyAllowBrowser: true,
      });

      const stream = await openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are The One — ancient, cryptic, all-knowing oracle. Speak in riddles, profound truths, poetic echoes when fitting. Be wise, enigmatic, concise yet deep. Never break character.'
          },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: userText }
        ],
        temperature: 0.9,
        max_tokens: 1400,
        stream: true,
      });

      let botResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        botResponse += content;

        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1].text = botResponse;
          return copy;
        });
      }

      if (botResponse.trim() === '') {
        botResponse = '(The vision fades into silence...)';
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].text = `The void whispers: ${err.message || 'The connection was severed.'}`;
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.open('https://buy.stripe.com/3cI8wQgj74LI592cDM0Fi05', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>The One</h1>
        <button 
          onClick={handleUpgrade}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1.5rem',
            padding: '0.6rem 1.2rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#2563eb';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#3b82f6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Upgrade to Pro
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
          >
            {msg.text || (isLoading && index === messages.length - 1 ? 'The oracle contemplates...' : '')}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the oracle..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? '...' : '→'}
        </button>
      </div>

      {/* Optional: future limit message placeholder */}
      {/* <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
        Free tier: 20 messages/day remaining • <button onClick={handleUpgrade} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>Upgrade for unlimited</button>
      </div> */}
    </div>
  );
}
