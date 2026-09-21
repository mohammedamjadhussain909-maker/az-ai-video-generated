# AZ AI Generated

A responsive React/Vite MVP for an AI video generation service. Users can write a prompt, choose an aspect ratio, browse templates, review generated videos, and see the free-trial upgrade path.

## Run locally

```bash
npm install
npm run dev
```

## Current MVP

- Prompt-based creation flow with a local mock generation result
- 16:9, 9:16, and 1:1 formats
- Free trial usage indicator
- Creator and Studio pricing modal
- Video library and starter templates
- Responsive desktop and mobile layouts

## Production integration

The mock `generateVideo` action in `src/App.jsx` should be replaced with a backend request such as `POST /api/videos`. Keep AI provider keys on the server, track asynchronous job status, store finished files in object storage, and connect subscription billing through a payment provider.
