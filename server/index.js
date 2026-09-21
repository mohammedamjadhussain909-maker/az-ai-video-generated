import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import Stripe from 'stripe'

const app = express()
const port = process.env.PORT || 8787
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, provider: Boolean(process.env.REPLICATE_API_TOKEN) ? 'replicate' : 'not-configured' }))

app.post('/api/videos', async (req, res) => {
  const { prompt, aspectRatio = '16:9', duration = '8 seconds', quality = '1080p', style = 'Cinematic', contentType = 'Long story', voice = 'No voiceover', music = 'No background music', language = 'English', scriptMode = 'Auto script', scenes = 'Auto scenes', captions = 'Burn-in captions', camera = 'Dynamic camera', platform = 'YouTube' } = req.body
  if (!prompt?.trim()) return res.status(400).json({ error: 'A prompt is required.' })
  if (!process.env.REPLICATE_API_TOKEN) return res.status(503).json({ error: 'Replicate is not configured. Add REPLICATE_API_TOKEN to server/.env.' })
  if (!process.env.REPLICATE_MODEL) return res.status(503).json({ error: 'Add REPLICATE_MODEL to server/.env.' })

  try {
    const [owner, name] = process.env.REPLICATE_MODEL.split('/')
    const response = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { prompt: `${contentType}, ${style} style, language: ${language}, voice: ${voice}, background music: ${music}, ${scriptMode}, ${scenes}, ${captions}, ${camera}, optimized for ${platform}. ${prompt.trim()}`, aspect_ratio: aspectRatio, duration, quality } }),
    })
    const prediction = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: prediction.detail || 'Replicate could not start the video.' })
    res.status(202).json({ id: prediction.id, status: prediction.status, pollUrl: `/api/videos/${prediction.id}` })
  } catch (error) {
    res.status(502).json({ error: error.message })
  }
})

app.get('/api/videos/:id', async (req, res) => {
  if (!process.env.REPLICATE_API_TOKEN) return res.status(503).json({ error: 'Replicate is not configured.' })
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, { headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` } })
    const prediction = await response.json()
    res.status(response.status).json({ id: prediction.id, status: prediction.status, videoUrl: Array.isArray(prediction.output) ? prediction.output[0] : prediction.output, error: prediction.error })
  } catch (error) {
    res.status(502).json({ error: error.message })
  }
})

app.post('/api/billing/checkout', async (req, res) => {
  const { plan = 'Creator' } = req.body
  const priceId = plan === 'Studio' ? process.env.STRIPE_STUDIO_PRICE_ID : process.env.STRIPE_CREATOR_PRICE_ID
  if (!stripe || !priceId) return res.status(503).json({ error: 'Stripe is not configured. Add Stripe secret and price IDs to server/.env.' })
  const session = await stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }], success_url: `${process.env.CLIENT_ORIGIN}/?payment=success`, cancel_url: `${process.env.CLIENT_ORIGIN}/?payment=cancelled` })
  res.json({ url: session.url })
})

app.listen(port, () => console.log(`AZ AI backend listening on http://localhost:${port}`))
