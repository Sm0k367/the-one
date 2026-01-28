import { useState, useRef, useEffect } from 'react'
import Groq from 'groq-sdk'

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  // Chat state
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory')
    return saved ? JSON.parse(saved) : [
      { text: '💯 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot', timestamp: Date.now() }
    ]
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef(null)
  const synthRef = useRef(window.speechSynthesis)

  // Image generation state
  const [showImageGen, setShowImageGen] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // History sidebar state
  const [showHistory, setShowHistory] = useState(false)

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages))
  }, [messages])

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  // Initialize speech recognition
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
      
      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
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
    if (isSpeaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onend = () => setIsSpeaking(false)
    synthRef.current.speak(utterance)
    setIsSpeaking(true)
  }

  const clearHistory = () => {
    if (confirm('Clear all chat history?')) {
      setMessages([
        { text: '💯 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot', timestamp: Date.now() }
      ])
    }
  }

  const exportChat = () => {
    const chatText = messages.map(m => `[${m.sender}]: ${m.text}`).join('\n\n')
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `epic-tech-ai-chat-${Date.now()}.txt`
    a.click()
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = { text: input, sender: 'user', timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      })

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

  const generateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return
    
    setIsGeneratingImage(true)
    
    try {
      const response = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true`)
      const imageUrl = response.url
      
      setMessages(prev => [...prev, {
        text: `🎨 Generated image for: "${imagePrompt}"`,
        sender: 'bot',
        timestamp: Date.now(),
        image: imageUrl
      }])
      
      setImagePrompt('')
      setShowImageGen(false)
    } catch (error) {
      console.error('Image generation error:', error)
      setMessages(prev => [...prev, {
        text: '⚠️ Image generation failed. Try again!',
        sender: 'bot',
        timestamp: Date.now()
      }])
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Theme colors
  const colors = theme === 'dark' ? {
    bg: 'linear-gradient(135deg, #0a0015 0%, #1a0033 100%)',
    text: '#e0f7ff',
    headerBg: 'linear-gradient(90deg, #00f0ff 0%, #ff00aa 100%)',
    headerText: '#000',
    messageBg: 'rgba(26, 0, 51, 0.5)',
    userBubble: 'linear-gradient(135deg, #00f0ff, #00c0ff)',
    botBubble: 'rgba(0, 240, 255, 0.15)',
    inputBg: 'rgba(10, 0, 21, 0.7)',
    border: 'rgba(0, 240, 255, 0.2)'
  } : {
    bg: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
    text: '#1a1a2e',
    headerBg: 'linear-gradient(90deg, #00d4ff 0%, #ff0080 100%)',
    headerText: '#fff',
    messageBg: 'rgba(255, 255, 255, 0.8)',
    userBubble: 'linear-gradient(135deg, #00d4ff, #0099ff)',
    botBubble: 'rgba(0, 212, 255, 0.1)',
    inputBg: 'rgba(255, 255, 255, 0.9)',
    border: 'rgba(0, 212, 255, 0.3)'
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: colors.bg,
      color: colors.text,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '1.5rem',
        background: colors.headerBg,
        borderRadius: '12px',
        marginBottom: '1rem',
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
        position: 'relative'
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
          color: colors.headerText,
          fontWeight: '600'
        }}>
          @Sm0ken42O • Fueled by Cannabis & Caffeine ☕🌿
        </p>
        
        {/* Control buttons */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button onClick={toggleTheme} style={buttonStyle}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowHistory(!showHistory)} style={buttonStyle}>
            📜
          </button>
          <button onClick={() => setShowImageGen(!showImageGen)} style={buttonStyle}>
            🎨
          </button>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '300px',
          maxHeight: '80vh',
          background: colors.messageBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '1rem',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Chat History</h3>
            <button onClick={() => setShowHistory(false)} style={buttonStyle}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={clearHistory} style={{...buttonStyle, flex: 1}}>Clear</button>
            <button onClick={exportChat} style={{...buttonStyle, flex: 1}}>Export</button>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            {messages.length} messages
          </div>
        </div>
      )}

      {/* Image Generation Modal */}
      {showImageGen && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '500px',
          background: colors.messageBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '2rem',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>🎨 Generate Image</h3>
            <button onClick={() => setShowImageGen(false)} style={buttonStyle}>✕</button>
          </div>
          <input
            type="text"
            value={imagePrompt}
            onChange={e => setImagePrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateImage()}
            placeholder="Describe the image you want..."
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              fontSize: '1rem',
              marginBottom: '1rem',
              outline: 'none'
            }}
          />
          <button
            onClick={generateImage}
            disabled={isGeneratingImage || !imagePrompt.trim()}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '8px',
              background: isGeneratingImage || !imagePrompt.trim()
                ? 'rgba(100, 100, 100, 0.5)'
                : 'linear-gradient(135deg, #00f0ff, #ff00aa)',
              color: isGeneratingImage || !imagePrompt.trim() ? '#666' : '#000',
              border: 'none',
              fontWeight: 'bold',
              cursor: isGeneratingImage || !imagePrompt.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isGeneratingImage ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        background: colors.messageBg,
        borderRadius: '12px',
        marginBottom: '1rem',
        border: `1px solid ${colors.border}`
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              padding: '1rem 1.5rem',
              borderRadius: '18px',
              background: msg.sender === 'user' ? colors.userBubble : colors.botBubble,
              border: msg.sender === 'bot' ? `1px solid ${colors.border}` : 'none',
              color: msg.sender === 'user' ? '#000' : colors.text,
              maxWidth: '75%',
              boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(0, 240, 255, 0.4)' : 'none',
              fontSize: '1rem',
              lineHeight: '1.5',
              position: 'relative'
            }}>
              {msg.text}
              {msg.sender === 'bot' && (
                <button
                  onClick={() => speakText(msg.text)}
                  style={{
                    ...buttonStyle,
                    position: 'absolute',
                    bottom: '0.5rem',
                    right: '0.5rem',
                    fontSize: '0.8rem'
                  }}
                >
                  {isSpeaking ? '🔇' : '🔊'}
                </button>
              )}
            </div>
            {msg.image && (
              <img
                src={msg.image}
                alt="Generated"
                style={{
                  maxWidth: '75%',
                  borderRadius: '12px',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              />
            )}
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
              background: colors.botBubble,
              border: `1px solid ${colors.border}`,
              color: colors.text
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
        gap: '0.5rem',
        background: colors.messageBg,
        padding: '1rem',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`
      }}>
        <button
          onClick={toggleVoiceInput}
          style={{
            ...buttonStyle,
            background: isListening ? 'linear-gradient(135deg, #ff0080, #ff00aa)' : colors.inputBg,
            animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none'
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
            padding: '1rem 1.5rem',
            borderRadius: '999px',
            border: `1px solid ${colors.border}`,
            background: colors.inputBg,
            color: colors.text,
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
            boxShadow: !isLoading && input.trim() ? '0 0 20px rgba(0, 240, 255, 0.5)' : 'none'
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

const buttonStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  background: 'rgba(0, 240, 255, 0.2)',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'all 0.3s'
}
