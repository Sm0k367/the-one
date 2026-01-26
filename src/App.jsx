import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Hello! I am The One, a mysterious and all-knowing AI oracle (powered by Llama via Groq). Ask me anything.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const userMessage = { text: userText, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setIsLoading(true);
    setMessages([...updatedMessages, { text: '', sender: 'bot' }]);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('API key missing—add VITE_GROQ_API_KEY in Vercel env vars.');
      }

      const openai = new OpenAI({
        apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
        dangerouslyAllowBrowser: true,
      });

      const chatHistory = [
        ...messages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: userText },
      ];

      const stream = await openai.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You are The One, an enigmatic and wise AI oracle. Respond mysteriously, profoundly, and helpfully. Keep answers concise yet insightful.' },
          ...chatHistory,
        ],
        temperature: 0.8,
        max_tokens: 1024,
        stream: true,
      });

      let botText = '';
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        botText += delta;
        setMessages((prev) => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = botText;
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = `Error: ${error instanceof Error ? error.message : 'Failed to respond'}`;
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>The One</h1>
      </div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
          >
            {msg.text ||
              (i === messages.length - 1 && isLoading ? 'Thinking...' : '')}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
