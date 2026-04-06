# DJS05: React Podcast App (Detail View + Genre API + Responsive UX)

## Author
Developed by Brooklyn Treasurer

## Project Overview
DJS05 is a React + Vite podcast discovery app that integrates with:

- `https://podcast-api.netlify.app/shows`
- `https://podcast-api.netlify.app/id/<ID>`
- `https://podcast-api.netlify.app/genre/<ID>`

The app supports browsing podcasts on the home page and viewing a full podcast detail page with seasons and episodes.

## What Was Added In DJS05
- Dynamic show detail route: `/show/:id`
- Show detail data fetching via `fetchPodcastDetails`
- Genre resolution improvements via `fetchGenreNames`:
  - Handles both numeric genre IDs and inline genre names from API payloads
  - Removes noisy labels like `All` and `Featured`
  - Cleans `Genre ...` prefixes
  - Caches genre endpoint responses in-memory
- Custom season selector in detail view (styled dropdown)
- Season-based episode rendering (selected season only)
- Episode description visual improvements
- Additional responsiveness improvements for:
  - Detail hero section
  - Season selector/menu
  - Season cards
  - Episode list layout on tablet/mobile
- JSDoc added/expanded in newly added modules and helper logic

## Current Features
- Fetches podcast list on home page
- Loading and error states for API requests
- Search by podcast title
- Genre filtering
- Sorting (title/date, asc/desc)
- Pagination
- Podcast card grid with links to detail pages
- Show detail view with:
  - Podcast metadata
  - Resolved genres
  - Seasons summary
  - Custom season dropdown
  - Episode list with descriptions
- Theme toggle in header

## Routes
- `/` -> Home page
- `/show/:id` -> Podcast detail page

## Key Files
- `src/pages/Home.jsx` - list page: fetch, search, filter, sort, pagination
- `src/pages/ShowDetail.jsx` - detail page data orchestration
- `src/components/Podcasts/PodcastCardDetail.jsx` - detail UI (hero, seasons, episodes)
- `src/api/fetchPodcast.js` - fetches show previews
- `src/api/fetchPodcastDetails.js` - fetches single show details
- `src/api/fetchGenre.js` - genre endpoint fetch + genre name normalization
- `src/utils/genreService.js` - local genre map used by home filter UI

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
