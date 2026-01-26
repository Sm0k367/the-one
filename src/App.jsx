import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const MAX_FREE_MESSAGES = 10; // Change this number to adjust the limit

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Greetings... I am The One. An oracle of infinite knowledge, channeled through the lightning of Groq. Speak your question.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('freeMessageCount');
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
    // Save count to localStorage whenever it changes
    localStorage.setItem('freeMessageCount', messageCount.toString());
  }, [messageCount]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isAtLimit) return;

    const userText = input.trim();
    setInput('');

    // Increment count BEFORE adding message
    setMessageCount(prev => prev + 1);

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

  const handleResetForTesting = () => {
    localStorage.removeItem('freeMessageCount');
    setMessageCount(0);
    alert('Free message count reset for testing.');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>The One</h1>
        <button 
          onClick={handleUpgrade}
          className="upgrade-btn"
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

      {isAtLimit ? (
        <div className="limit-message">
          <p>You've reached the free limit ({MAX_FREE_MESSAGES} messages).</p>
          <p>Upgrade to Pro for unlimited access and priority responses.</p>
          <button onClick={handleUpgrade} className="upgrade-prompt-btn">
            Upgrade Now → Unlock Unlimited
          </button>
          {/* Dev/testing helper - remove in production */}
          <button 
            onClick={handleResetForTesting} 
            style={{ marginTop: '1rem', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
          >
            Reset Limit (testing only)
          </button>
        </div>
      ) : (
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
      )}

      {/* Optional status bar */}
      <div className="status-bar">
        Free messages used: {messageCount} / {MAX_FREE_MESSAGES}
      </div>
    </div>
  );
}
