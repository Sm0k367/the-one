import { useState, useRef, useEffect } from 'react'
import Groq from 'groq-sdk'

export default function App() {
  const [messages, setMessages] = useState([
    { text: '💯 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = { text: input, sender: 'user' }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Initialize Groq client with API key from environment variable
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      })

      // Create chat completion
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are Epic Tech AI, a creative multimedia artist who makes music, videos, and AI art. You are fueled by cannabis and caffeine. You are friendly, creative, and enthusiastic about technology, AI, music production (especially DJ Smoke Stream), and digital art. Keep responses conversational and engaging.'
          },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          {
            role: 'user',
            content: input
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })

      const botResponse = completion.choices[0]?.message?.content || 'Sorry, I had trouble processing that.'
      
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }])
    } catch (error) {
      console.error('Groq API Error:', error)
      setMessages(prev => [...prev, { 
        text: '⚠️ Oops! Something went wrong. The AI is taking a coffee break ☕', 
        sender: 'bot' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0015 0%, #1a0033 100%)',
      color: '#e0f7ff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '1.5rem',
        background: 'linear-gradient(90deg, #00f0ff 0%, #ff00aa 100%)',
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          letterSpacing: '2px',
          background: 'linear-gradient(90deg, #ffffff, #00f0ff, #ff00aa)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0
        }}>
          💯 EPIC TECH AI 🔥
        </h1>
        <p style={{ 
          margin: '0.5rem 0 0 0', 
          fontSize: '0.9rem',
          color: '#000',
          fontWeight: '600'
        }}>
          @Sm0ken42O • Fueled by Cannabis & Caffeine ☕🌿
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        background: 'rgba(26, 0, 51, 0.5)',
        borderRadius: '12px',
        marginBottom: '1rem',
        border: '1px solid rgba(0, 240, 255, 0.2)'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              padding: '1rem 1.5rem',
              borderRadius: '18px',
              background: msg.sender === 'user' 
                ? 'linear-gradient(135deg, #00f0ff, #00c0ff)' 
                : 'rgba(0, 240, 255, 0.15)',
              border: msg.sender === 'bot' ? '1px solid rgba(0, 240, 255, 0.35)' : 'none',
              color: msg.sender === 'user' ? '#000' : '#e0f7ff',
              maxWidth: '75%',
              boxShadow: msg.sender === 'user' 
                ? '0 4px 15px rgba(0, 240, 255, 0.4)' 
                : 'none',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderRadius: '18px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#e0f7ff'
            }}>
              <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                Thinking... 🤔
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        background: 'rgba(26, 0, 51, 0.5)',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid rgba(0, 240, 255, 0.2)'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '1rem 1.5rem',
            borderRadius: '999px',
            border: '1px solid rgba(0, 240, 255, 0.45)',
            background: 'rgba(10, 0, 21, 0.7)',
            color: '#e0f7ff',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '1rem 2rem',
            borderRadius: '999px',
            background: isLoading || !input.trim()
              ? 'rgba(100, 100, 100, 0.5)'
              : 'linear-gradient(135deg, #00f0ff, #ff00aa)',
            color: isLoading || !input.trim() ? '#666' : '#000',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            boxShadow: !isLoading && input.trim() 
              ? '0 0 20px rgba(0, 240, 255, 0.5)' 
              : 'none'
          }}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
