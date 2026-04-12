# DJSPP: React Podcast App

## Author
Developed by Brooklyn Treasurer

## Live Demo
- `https://audio-banks.vercel.app`

## Project Overview
DJSPP is a production-ready React + Vite podcast app with polished UX, full audio controls, and session persistence.

## Core Features
- global audio player with full playback controls
- favourite episodes with persistent local storage
- recommended shows carousel on the landing page
- light/dark theme toggle
- robust routing with `/show/:id` podcast detail pages
- episode listening progress tracking across sessions
- finished episode tracking and reset history support

## What Makes DJSPP Stand Out
- persistent playback state even when navigating across pages
- a clean, responsive detail page for each podcast
- listen/resume state shown on episodes
- favourite episode management with save/restore
- theme switching for light and dark modes
- professional polish for production deployment

## Routes
- `/` -> Home page
- `/show/:id` -> Podcast detail page

## Key Files
- `src/components/Podcasts/AudioPlayerProvider.jsx` - handles global audio state and unload confirmation
- `src/components/Podcasts/AudioPlayer.jsx` - audio playback controls and progress handling
- `src/components/Podcasts/PodcastCardDetail.jsx` - show detail UI, episode actions, and progress display
- `src/components/Podcasts/Favourites.jsx` - favourites list and reset history support
- `src/store/audioPlayerStore.js` - audio session persistence and current track data
- `src/store/favouritesStore.js` - favourite episodes, progress, and finished state persistence

## Scripts
- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run preview` - preview production build
- `npm run lint` - run lint checks

## Setup
1. Install dependencies:
   - `npm install`
2. Start the app:
   - `npm run dev`
3. Open:
   - `http://localhost:5173`
