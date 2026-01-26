import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const MAX_FREE_MESSAGES = 10;

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Welcome to Epic Tech AI. I am your ultimate oracle — powered by bleeding-edge Groq inference. Drop your query, legend.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(() => {
    const saved = localStorage.getItem('epicMessageCount');
    return saved ? parseInt(saved, 10) : 0;
  });
  const messagesEndRef = useRef(null);

  const isAtLimit = messageCount >= MAX_FREE_MESSAGES;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('epicMessageCount', messageCount.toString());
  }, [messageCount]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isAtLimit) return;

    const userText = input.trim();
    setInput('');

    setMessageCount(prev => prev + 1);

    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setIsLoading(true);

    setMessages(prev => [...prev, { text: '', sender: 'bot' }]);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) throw new Error('API key missing — check Vercel env vars.');

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
            content: 'You are Epic Tech AI — the pinnacle of next-gen intelligence. Respond with high-energy confidence, futuristic flair, bold insights, and occasional hype. Use terms like "legend", "unlock", "next level". Stay epic, concise, powerful. Never break character.'
          },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content: userText }
        ],
        temperature: 0.85,
        max_tokens: 1200,
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
      if (botResponse.trim() === '') botResponse = '(Signal interrupted — retry, legend?)';
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1].text = `System alert: ${err.message || 'Connection spike — hold tight.'}`;
        return copy;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    window.open('https://buy.stripe.com/3cI8wQgj74LI592cDM0Fi05', '_blank', 'noopener,noreferrer');
  };

  const resetTest = () => {
    localStorage.removeItem('epicMessageCount');
    setMessageCount(0);
    alert('Epic reset — test mode cleared.');
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Epic Tech AI</h1>
      </header>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text || (isLoading && i === messages.length - 1 ? 'Processing at light speed...' : '')}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isAtLimit ? (
        <div className="limit-message">
          <p>Free tier maxed: {MAX_FREE_MESSAGES} messages used.</p>
          <p>Level up to Pro for unlimited power.</p>
          <button onClick={handleUpgrade} className="upgrade-prompt-btn">
            Upgrade Now – Become Legendary
          </button>
          <button onClick={resetTest} className="reset-btn">
            Reset (test only)
          </button>
        </div>
      ) : (
        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Drop your query, legend..."
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading}>
            {isLoading ? '⚡' : '→'}
          </button>
        </div>
      )}

      <div className="status-bar">
        Power used: {messageCount} / {MAX_FREE_MESSAGES} (free tier)
      </div>

      {/* Floating Upgrade Button */}
      <button onClick={handleUpgrade} className="fab-upgrade">
        Go Pro<br />Unlock ∞
      </button>
    </div>
  );
}
