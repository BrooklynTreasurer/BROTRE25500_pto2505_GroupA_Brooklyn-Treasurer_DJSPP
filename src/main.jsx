import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AudioPlayerProvider from './components/Podcasts/AudioPlayerProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AudioPlayerProvider>
        <App />
      </AudioPlayerProvider>
    </BrowserRouter>
  </StrictMode>,
)
