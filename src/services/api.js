const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8787'

async function request(path, options) {
  const response = await fetch(`${apiBase}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'The request failed.')
  return data
}

export async function createVideo(input) {
  const job = await request('/api/videos', { method: 'POST', body: JSON.stringify(input) })
  let result = job
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 2500))
    result = await request(`/api/videos/${job.id}`)
  }
  if (result.status !== 'succeeded' || !result.videoUrl) throw new Error(result.error || 'Video generation did not complete.')
  return result.videoUrl
}

export async function createCheckout(plan) {
  return request('/api/billing/checkout', { method: 'POST', body: JSON.stringify({ plan }) })
}
