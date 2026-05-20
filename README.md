# Memory Store

A surreal full-stack interactive website displaying memories from 2014-2026.

## Project Structure

```
memory-store/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   │   ├── games/    # Mini-game components
│   │   │   ├── MiniGame.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── pages/        # Page components
│   │   │   ├── Home.jsx
│   │   │   └── Product.jsx
│   │   ├── services/     # API service layer
│   │   │   └── api.js
│   │   ├── hooks/        # Custom React hooks
│   │   │   └── usePolling.js
│   │   ├── utils/        # Utility functions
│   │   │   └── brightness.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── backend/           # Node.js + Express
    ├── server.js     # Main Express server
    ├── data/
    │   └── store.json # JSON persistence
    └── package.json
```

## Quick Start

### Backend
```bash
cd memory-store/backend
npm install
npm start
```

### Frontend
```bash
cd memory-store/frontend
npm install
npm run dev
```

## Features

- 13 products (2014-2026) representing Zhou Shen's journey
- Mobile-optimized responsive design
- 4 mini-game types: scratch, drag, hold, hidden object
- Light contribution system with 10-minute cooldown per IP
- 20-second polling for real-time light updates
- Dynamic brightness based on collective light contributions
- Dreamlike, surreal visual aesthetic

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express
- Storage: JSON file (no database)