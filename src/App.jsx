import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Greetings... I am The One. An oracle of infinite knowledge, channeled through the lightning of Groq. Speak your question.', sender: 'bot' }
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

      // Ensure final message is set even if stream ends abruptly
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

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>The One</h1>
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
    </div>
  );
}
