# Epic Tech AI 🧠🔥

A sleek, modern AI chat application powered by Groq's LLaMA 3.3 70B model. Built with React, Vite, and glassmorphism design.

## Features

✨ **AI Chat** - Powered by Groq's LLaMA 3.3 70B model
🎨 **Image Generation** - Generate images using Pollinations API
🎤 **Voice Input** - Speak to the AI using Web Speech API
🔊 **Voice Output** - Listen to AI responses
🌓 **Dark/Light Theme** - Toggle between themes
💾 **Chat History** - Automatic localStorage persistence
📥 **Export Chat** - Download your conversations as text
🎯 **Responsive Design** - Works on desktop and mobile

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/Sm0k367/the-one.git
cd the-one
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Then edit `.env` and add your Groq API key:
```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get your free API key from: https://console.groq.com

### 4. Run the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for production
```bash
npm run build
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Add environment variable `VITE_GROQ_API_KEY` in Vercel settings
6. Click "Deploy"

The app will be live at your Vercel URL!

## How It Works

- **Chat**: Type messages and get responses from the AI
- **Voice Input**: Click the 🎤 button to speak
- **Voice Output**: Click 🔊 on any bot message to hear it read aloud
- **Image Generation**: Click 🎨 to generate images
- **Theme Toggle**: Click ☀️/🌙 to switch themes
- **Chat History**: Click 📝 to view and manage your chat history

## Tech Stack

- **Frontend**: React 18 + Vite
- **AI**: Groq SDK (LLaMA 3.3 70B)
- **Images**: Pollinations API
- **Voice**: Web Speech API
- **Storage**: localStorage
- **Styling**: CSS-in-JS with glassmorphism

## No Backend Required

This app runs entirely in the browser:
- Chat history is stored in localStorage
- No database needed
- No authentication required
- All processing happens client-side

## License

MIT

## Author

@Sm0ken42O - Fueled by Cannabis & Caffeine ☕🌿
