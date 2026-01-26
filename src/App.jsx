import { useState } from 'react'

export default function App() {
  const [messages, setMessages] = useState([
    { text: 'Hello! Epic Tech AI is alive. Type something to test.', sender: 'bot' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { text: input, sender: 'user' }
    setMessages(prev => [...prev, userMsg])

    // Simple echo for testing
    setTimeout(() => {
      setMessages(prev => [...prev, { text: `Echo: ${input}`, sender: 'bot' }])
    }, 500)

    setInput('')
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0a0015',
      color: '#e0f7ff',
      fontFamily: 'system-ui, sans-serif',
      padding: '1rem'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Epic Tech AI</h1>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        background: 'rgba(26, 0, 51, 0.5)',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '0.8rem',
              textAlign: msg.sender === 'user' ? 'right' : 'left'
            }}
          >
            <span style={{
              padding: '0.8rem 1.2rem',
              borderRadius: '18px',
              background: msg.sender === 'user' ? '#00f0ff' : '#ff00aa',
              color: msg.sender === 'user' ? '#000' : '#fff',
              display: 'inline-block',
              maxWidth: '80%'
            }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '0.9rem',
            borderRadius: '999px',
            border: '1px solid #00f0ff',
            background: 'rgba(10, 0, 21, 0.7)',
            color: '#e0f7ff'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: '0.9rem 1.5rem',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #00f0ff, #ff00aa)',
            color: '#000',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
