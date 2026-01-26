import React, { useState } from 'react';

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Hello! I am The One. Ask me anything.', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    // Dummy bot response (echo with prefix)
    setTimeout(() => {
      const botMessage = { text: `Bot echoes: ${input}`, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInput('');
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
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
