# Statewide Cleaning Booking Site

This starter project was created from your current booking-site structure and adapted for **Statewide Cleaning**.

## Included
- `frontend/` — Vite + React booking form
- `backend/` — Express API for booking, best-fit suggestions, Google Calendar, Google Sheets, geocoding, and Apps Script email forwarding
- `frontend/src/assets/statewide-logo.png` — your uploaded Statewide logo

## Branding already updated
- Statewide logo added in the hero/header
- Business email set to `cmejia@statewidecleaning.com`
- Website references set to `statewidecleaning.com`
- Frontend API base changed to `VITE_API_BASE_URL`

## Local setup

### 1) Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2) Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

## Deployment notes
- Host the frontend on Vercel or Netlify
- Host the backend on Render
- After deployment, set:
  - `VITE_API_BASE_URL` to your live backend URL
- Since your domain is at GoDaddy and the website is currently managed by Hibu, you can send them the built frontend files or the live hosted link and ask them to add a **Book Online / Request Service** button that opens this app

## Important
I kept the backend structure based on your uploaded booking API. Before going live, you should still test:
- booking submission
- best-fit suggestions
- Apps Script email sending
- Google Calendar event creation
- Google Sheets logging
