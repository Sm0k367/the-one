import { useState } from 'react'
import { generateMusic } from './musicService'
import { generateVideo } from './videoService'

export default function MediaGenModal({ colors, onClose, onMediaGenerated }) {
  const [activeTab, setActiveTab] = useState('image') // image, video, music
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Music-specific options
  const [genre, setGenre] = useState('electronic')
  const [mood, setMood] = useState('energetic')
  const [duration, setDuration] = useState(30)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    
    try {
      if (activeTab === 'image') {
        // Image generation (existing functionality)
        const response = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`)
        const imageUrl = response.url
        
        onMediaGenerated({
          type: 'image',
          url: imageUrl,
          prompt: prompt
        })
      } else if (activeTab === 'video') {
        // Video generation
        const result = await generateVideo(prompt)
        
        if (result.success) {
          onMediaGenerated({
            type: 'video',
            url: result.videoUrl,
            prompt: prompt
          })
        } else {
          throw new Error(result.error || 'Video generation failed')
        }
      } else if (activeTab === 'music') {
        // Music generation
        const result = await generateMusic(prompt, genre, mood, duration)
        
        if (result.success) {
          onMediaGenerated({
            type: 'music',
            url: result.audioUrl,
            prompt: prompt,
            isDemo: result.isDemo
          })
        } else {
          throw new Error(result.error || 'Music generation failed')
        }
      }
      
      setPrompt('')
      onClose()
    } catch (error) {
      console.error('Media generation error:', error)
      alert(`Generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    background: isActive ? 'linear-gradient(135deg, #00f0ff, #ff00aa)' : 'rgba(0, 240, 255, 0.1)',
    border: `1px solid ${isActive ? 'transparent' : colors.border}`,
    color: isActive ? '#000' : colors.text,
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  })

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '600px',
      background: colors.messageBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '20px',
      padding: '32px',
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      boxShadow: `0 8px 32px ${colors.shadow}`
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.5rem' }}>
          AI Media Generator
        </h3>
        <button onClick={onClose} style={{
          padding: '8px',
          borderRadius: '12px',
          background: 'rgba(0, 240, 255, 0.15)',
          border: `1px solid ${colors.border}`,
          color: colors.text,
          cursor: 'pointer',
          fontSize: '1.25rem',
          minWidth: '40px',
          minHeight: '40px',
          fontWeight: '600',
          backdropFilter: 'blur(10px)'
        }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setActiveTab('image')} style={tabStyle(activeTab === 'image')}>
          🎨 Image
        </button>
        <button onClick={() => setActiveTab('video')} style={tabStyle(activeTab === 'video')}>
          🎬 Video
        </button>
        <button onClick={() => setActiveTab('music')} style={tabStyle(activeTab === 'music')}>
          🎵 Music
        </button>
      </div>

      {/* Prompt Input */}
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleGenerate()}
        placeholder={
          activeTab === 'image' ? 'Describe the image you want...' :
          activeTab === 'video' ? 'Describe the video scene...' :
          'Describe the music style...'
        }
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

      {/* Music-specific controls */}
      {activeTab === 'music' && (
        <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
                Genre
              </label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg,
                  color: colors.text,
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                <option value="electronic">Electronic</option>
                <option value="ambient">Ambient</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
                <option value="hiphop">Hip Hop</option>
                <option value="lofi">Lo-Fi</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
                Mood
              </label>
              <select
                value={mood}
                onChange={e => setMood(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBg,
                  color: colors.text,
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                <option value="energetic">Energetic</option>
                <option value="calm">Calm</option>
                <option value="dark">Dark</option>
                <option value="uplifting">Uplifting</option>
                <option value="melancholic">Melancholic</option>
                <option value="epic">Epic</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: '600' }}>
              Duration: {duration}s
            </label>
            <input
              type="range"
              min="15"
              max="60"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: '#00f0ff'
              }}
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '12px',
          background: isGenerating || !prompt.trim()
            ? 'rgba(100, 100, 100, 0.5)'
            : 'linear-gradient(135deg, #00f0ff, #ff00aa)',
          color: isGenerating || !prompt.trim() ? '#666' : '#000',
          border: 'none',
          fontWeight: '700',
          fontSize: '1rem',
          cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: !isGenerating && prompt.trim() ? `0 4px 16px ${colors.shadow}` : 'none'
        }}
      >
        {isGenerating ? 'Generating...' : `Generate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
      </button>

      {/* Info text */}
      <p style={{
        marginTop: '16px',
        fontSize: '0.75rem',
        opacity: 0.7,
        textAlign: 'center',
        fontWeight: '400'
      }}>
        {activeTab === 'video' && 'Video generation may take 30-60 seconds'}
        {activeTab === 'music' && 'Music generation creates 15-60 second tracks'}
        {activeTab === 'image' && 'Images are generated instantly'}
      </p>
    </div>
  )
}
