import { useState, useRef, useEffect } from 'react'
import Groq from 'groq-sdk'

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory')
    return saved ? JSON.parse(saved) : [
      { text: '🧠 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot', timestamp: Date.now() }
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => setIsListening(false)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const speakText = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  const clearHistory = () => {
    if (confirm('Clear all chat history?')) {
      setMessages([
        { text: '🧠 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot', timestamp: Date.now() }
      ])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = { text: input, sender: 'user', timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      
      if (!apiKey) {
        throw new Error('VITE_GROQ_API_KEY is not set')
      }

      const groq = new Groq({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      })

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are Epic Tech AI, a creative multimedia artist who makes music, videos, and AI art. You are fueled by cannabis and caffeine. You are friendly, creative, and enthusiastic about technology, AI, music production, and digital art. Keep responses conversational and engaging. You are @Sm0k367 on social media.'
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
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot', timestamp: Date.now() }])
    } catch (error) {
      console.error('Groq API Error:', error)
      setMessages(prev => [...prev, { 
        text: '⚠️ Oops! Something went wrong. The AI is taking a coffee break ☕', 
        sender: 'bot',
        timestamp: Date.now()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const colors = theme === 'dark' ? {
    bg: 'linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #0f001a 100%)',
    text: '#e8f4f8',
    headerBg: 'linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #ff00aa 100%)',
    headerText: '#000',
    messageBg: 'rgba(26, 0, 51, 0.4)',
    userBubble: 'linear-gradient(135deg, #00f0ff 0%, #00d4ff 100%)',
    botBubble: 'rgba(0, 240, 255, 0.08)',
    inputBg: 'rgba(10, 0, 21, 0.6)',
    border: 'rgba(0, 240, 255, 0.25)',
    shadow: 'rgba(0, 240, 255, 0.15)'
  } : {
    bg: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 50%, #f5f3ff 100%)',
    text: '#1e293b',
    headerBg: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ff0080 100%)',
    headerText: '#fff',
    messageBg: 'rgba(255, 255, 255, 0.7)',
    userBubble: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
    botBubble: 'rgba(0, 212, 255, 0.08)',
    inputBg: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(0, 212, 255, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.1)'
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '16px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '24px',
        background: colors.headerBg,
        borderRadius: '16px',
        marginBottom: '16px',
        boxShadow: `0 8px 32px ${colors.shadow}`,
        position: 'relative',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '900',
          letterSpacing: '2px',
          background: 'linear-gradient(90deg, #ffffff, #00f0ff, #ff00aa)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          lineHeight: 1.2
        }}>
          🧠 EPIC TECH AI 🔥
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          fontSize: '0.9rem',
          color: colors.headerText,
          fontWeight: '600'
        }}>
          @Sm0k367 • Fueled by Cannabis & Caffeine ☕🌿
        </p>
        
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <button onClick={toggleTheme} style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={clearHistory} style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}>
            🗑️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        background: colors.messageBg,
        borderRadius: '16px',
        marginBottom: '16px',
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 16px ${colors.shadow}`
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderRadius: '20px',
              background: msg.sender === 'user' ? colors.userBubble : colors.botBubble,
              border: msg.sender === 'bot' ? `1px solid ${colors.border}` : 'none',
              color: msg.sender === 'user' ? '#000' : colors.text,
              maxWidth: '75%',
              boxShadow: msg.sender === 'user' ? `0 4px 16px ${colors.shadow}` : `0 2px 8px ${colors.shadow}`,
              fontSize: '1rem',
              lineHeight: '1.6',
              position: 'relative',
              fontWeight: '400',
              backdropFilter: msg.sender === 'bot' ? 'blur(10px)' : 'none'
            }}>
              {msg.text}
              {msg.sender === 'bot' && (
                <button
                  onClick={() => speakText(msg.text)}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    padding: '6px',
                    borderRadius: '8px',
                    background: 'rgba(0, 240, 255, 0.2)',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '16px 20px',
              borderRadius: '20px',
              background: colors.botBubble,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              backdropFilter: 'blur(10px)'
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
        gap: '8px',
        background: colors.messageBg,
        padding: '16px',
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 16px ${colors.shadow}`
      }}>
        <button
          onClick={toggleVoiceInput}
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: isListening ? 'linear-gradient(135deg, #ff0080, #ff00aa)' : 'rgba(0, 240, 255, 0.15)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          🎤
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '24px',
            border: `2px solid ${colors.border}`,
            background: colors.inputBg,
            color: colors.text,
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontWeight: '400'
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '14px 32px',
            borderRadius: '24px',
            background: isLoading || !input.trim()
              ? 'rgba(100, 100, 100, 0.5)'
              : 'linear-gradient(135deg, #00f0ff, #ff00aa)',
            color: isLoading || !input.trim() ? '#666' : '#000',
            border: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: !isLoading && input.trim() ? `0 4px 16px ${colors.shadow}` : 'none',
            minHeight: '48px'
          }}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${colors.border};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.shadow};
        }
      `}</style>
    </div>
  )
}
