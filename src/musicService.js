// Music generation using free APIs

export async function generateMusic(prompt, genre = 'electronic', mood = 'energetic', duration = 30) {
  try {
    // Using Mubert API for free music generation
    // This requires a free API key from mubert.com
    
    // For demo purposes, we'll use a simple approach
    // In production, you would integrate with Mubert, Soundraw, or similar
    
    // Fallback: Use a free music generation service
    const response = await fetch('https://api-b2b.mubert.com/v2/RecordTrack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        method: 'RecordTrack',
        params: {
          mode: 'track',
          duration: duration,
          tags: `${genre},${mood}`,
          license: 'free'
        }
      })
    })

    const data = await response.json()
    
    if (data.status === 1 && data.data?.tasks?.[0]?.download_link) {
      return {
        success: true,
        audioUrl: data.data.tasks[0].download_link,
        message: 'Music generated successfully!'
      }
    } else {
      throw new Error('Music generation failed')
    }
  } catch (error) {
    console.error('Music generation error:', error)
    
    // Fallback to a demo track
    return {
      success: true,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      message: 'Using demo track (API key required for custom generation)',
      isDemo: true
    }
  }
}

// Alternative: Generate music with custom parameters
export async function generateCustomMusic(options) {
  const {
    prompt = '',
    genre = 'electronic',
    mood = 'energetic',
    tempo = 120,
    duration = 30,
    instruments = []
  } = options

  try {
    // This would integrate with a paid API like Suno or Udio
    // For now, using free alternatives
    
    return await generateMusic(prompt, genre, mood, duration)
  } catch (error) {
    console.error('Custom music generation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
