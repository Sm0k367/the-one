# 💯 Epic Tech AI 🔥

A modern AI-powered chat application built with React and Groq API.

**Created by:** @Sm0ken42O  
**Powered by:** Cannabis & Caffeine ☕🌿

## Features

- 🤖 **AI Chat Interface** - Powered by Groq's Llama 3.3 70B model
- 🎨 **Stunning UI** - Purple/cyan gradient theme with neon effects
- ⚡ **Fast Responses** - Lightning-fast AI responses via Groq
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎭 **Personality** - Creative AI assistant for music, videos, and digital art

## Tech Stack

- **Frontend:** React 18 + Vite
- **AI:** Groq SDK (Llama 3.3 70B Versatile)
- **Styling:** Inline CSS with gradient effects
- **Build Tool:** Vite

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Groq API key (get one at [console.groq.com](https://console.groq.com))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sm0k367/the-one.git
cd the-one
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Configuration

The Groq API key is currently hardcoded in `src/App.jsx` for simplicity. For production:

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Add your Groq API key:
```
VITE_GROQ_API_KEY=your_actual_key_here
```

3. Update `src/App.jsx` to use the environment variable:
```javascript
apiKey: import.meta.env.VITE_GROQ_API_KEY
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
the-one/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.jsx          # Main chat component with Groq integration
│   ├── main.jsx         # React entry point
│   └── style.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md           # This file
```

## Features Breakdown

### AI Integration
- Uses Groq's Llama 3.3 70B Versatile model
- System prompt defines Epic Tech AI personality
- Conversation history maintained for context
- Error handling with user-friendly messages

### UI/UX
- Gradient backgrounds (purple/cyan theme)
- Smooth animations and transitions
- Auto-scroll to latest messages
- Loading states with pulse animation
- Disabled states for better UX

### Performance
- Vite for fast development and builds
- React 18 with modern hooks
- Optimized bundle size
- ESBuild minification

## Customization

### Change AI Model
Edit `src/App.jsx` line with `model:`:
```javascript
model: 'llama-3.3-70b-versatile', // or 'mixtral-8x7b-32768', etc.
```

### Modify Personality
Edit the system prompt in `src/App.jsx`:
```javascript
content: 'You are Epic Tech AI, a creative multimedia artist...'
```

### Update Theme Colors
Modify the gradient colors in `src/App.jsx`:
```javascript
background: 'linear-gradient(135deg, #0a0015 0%, #1a0033 100%)'
```

## Troubleshooting

### API Key Issues
- Ensure your Groq API key is valid
- Check console for error messages
- Verify `dangerouslyAllowBrowser: true` is set

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
npm run dev -- --port 3000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project however you want!

## Credits

**Epic Tech AI** by @Sm0ken42O  
- 🎵 Music: DJ Smoke Stream on Suno AI
- 🎬 Videos: AI Lounge After Dark™
- 🤖 AI Art: Generative digital art
- 🌐 Web: [intercom-bay.vercel.app](https://intercom-bay.vercel.app)

---

**Fueled by Cannabis & Caffeine ☕🌿**  
*"Atmosphere of Your Thoughts"*
