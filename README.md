# AZ AI Generated

A responsive React/Vite MVP for an AI video generation service. Users can write a prompt, choose an aspect ratio, browse templates, review generated videos, and see the free-trial upgrade path.

## Run locally

```bash
npm install
npm run dev
```

## Enable real generation and payments

Run the frontend and backend in separate terminals:

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Edit `server/.env` with a Replicate token and a video model whose input schema supports the prompt, aspect ratio, and duration fields used by `server/index.js`. Then restart the backend. The frontend calls `http://localhost:8787` by default; set `VITE_API_URL` if the backend runs elsewhere.

For paid plans, add Stripe secret and recurring price IDs to `server/.env`. The plan buttons then open Stripe Checkout. Do not commit `.env` or expose provider keys in the frontend.

## Current MVP

- Prompt-based creation flow with a local mock generation result
- 16:9, 9:16, and 1:1 formats
- Free trial usage indicator
- Creator and Studio pricing modal
- Video library and starter templates
- Responsive desktop and mobile layouts

## Production notes

The current backend uses Replicate prediction polling and Stripe Checkout. For production, add authentication, a database for users/jobs, object storage for generated files, webhooks for Stripe and Replicate, rate limits, content moderation, and a queue for long videos. A 20-minute output depends on the selected model; many providers require stitching shorter clips rather than generating 20 minutes in one request.
