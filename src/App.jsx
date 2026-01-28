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
      { text: '🧠 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot', timestamp: Date.now() }
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
        { text: '🧠 Epic Tech AI is online! Fueled by cannabis & caffeine ☕🌿', sender: 'bot', timestamp: Date.now() }
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
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      
      if (!apiKey) {
        throw new Error('VITE_GROQ_API_KEY is not set. Please add it to your .env file.')
      }

      const groq = new Groq({
        apiKey: apiKey,
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

  // Enhanced theme colors with glassmorphism
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
    glass: 'rgba(255, 255, 255, 0.05)',
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
    glass: 'rgba(255, 255, 255, 0.6)',
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
      fontWeight: '400',
      padding: '16px',
      position: 'relative',
      letterSpacing: '-0.01em'
    }}>
      {/* Header with glassmorphism */}
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
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          @Sm0ken42O • Fueled by Cannabis & Caffeine ☕🌿
        </p>
        
        {/* Control buttons with better touch targets */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <button onClick={toggleTheme} style={{
            ...buttonStyle,
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowHistory(!showHistory)} style={{
            ...buttonStyle,
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📝
          </button>
          <button onClick={() => setShowImageGen(!showImageGen)} style={{
            ...buttonStyle,
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🎨
          </button>
        </div>
      </div>

      {/* History Sidebar with glassmorphism */}
      {showHistory && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '320px',
          maxHeight: '80vh',
          background: colors.messageBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '24px',
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px ${colors.shadow}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.25rem' }}>Chat History</h3>
            <button onClick={() => setShowHistory(false)} style={{
              ...buttonStyle,
              minWidth: '40px',
              minHeight: '40px',
              padding: '8px'
            }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button onClick={clearHistory} style={{...buttonStyle, flex: 1, fontWeight: '600'}}>Clear</button>
            <button onClick={exportChat} style={{...buttonStyle, flex: 1, fontWeight: '600'}}>Export</button>
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8, fontWeight: '500' }}>
            {messages.length} messages
          </div>
        </div>
      )}

      {/* Image Generation Modal with glassmorphism */}
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
          borderRadius: '20px',
          padding: '32px',
          zIndex: 1000,
          backdropFilter: 'blur(20px)',
          boxShadow: `0 8px 32px ${colors.shadow}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.5rem' }}>🎨 Generate Image</h3>
            <button onClick={() => setShowImageGen(false)} style={{
              ...buttonStyle,
              minWidth: '40px',
              minHeight: '40px',
              padding: '8px'
            }}>✕</button>
          </div>
          <input
            type="text"
            value={imagePrompt}
            onChange={e => setImagePrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generateImage()}
            placeholder="Describe the image you want..."
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: `2px solid ${colors.border}`,
              background: colors.inputBg,
              color: colors.text,
              fontSize: '1rem',
              marginBottom: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              fontWeight: '400'
            }}
          />
          <button
            onClick={generateImage}
            disabled={isGeneratingImage || !imagePrompt.trim()}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: isGeneratingImage || !imagePrompt.trim()
                ? 'rgba(100, 100, 100, 0.5)'
                : 'linear-gradient(135deg, #00f0ff, #ff00aa)',
              color: isGeneratingImage || !imagePrompt.trim() ? '#666' : '#000',
              border: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: isGeneratingImage || !imagePrompt.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !isGeneratingImage && imagePrompt.trim() ? `0 4px 16px ${colors.shadow}` : 'none'
            }}
          >
            {isGeneratingImage ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      )}

      {/* Messages with enhanced styling */}
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
                    ...buttonStyle,
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    fontSize: '0.875rem',
                    minWidth: '32px',
                    minHeight: '32px',
                    padding: '6px'
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
                  borderRadius: '16px',
                  marginTop: '8px',
                  boxShadow: `0 4px 16px ${colors.shadow}`
                }}
              />
            )}
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

      {/* Input Area with enhanced styling */}
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
            ...buttonStyle,
            minWidth: '48px',
            minHeight: '48px',
            background: isListening ? 'linear-gradient(135deg, #ff0080, #ff00aa)' : colors.inputBg,
            animation: isListening ? 'pulse 1s ease-in-out infinite' : 'none',
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
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${colors.glass};
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

const buttonStyle = {
  padding: '12px 16px',
  borderRadius: '12px',
  background: 'rgba(0, 240, 255, 0.15)',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  fontWeight: '600',
  backdropFilter: 'blur(10px)'
}
