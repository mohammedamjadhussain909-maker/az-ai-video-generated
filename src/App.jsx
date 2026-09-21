import { useState } from 'react'
import { createCheckout, createVideo } from './services/api.js'

const starterVideos = [
  { title: 'Morning in Kyoto', meta: 'Cinematic travel film · 12 sec', color: 'sunrise', state: 'Ready' },
  { title: 'Neon after rain', meta: 'Product moodboard · 8 sec', color: 'neon', state: 'Ready' },
]

function Sparkle({ small = false }) {
  return <span className={small ? 'sparkle small' : 'sparkle'}>✦</span>
}

function App() {
  const [activeTab, setActiveTab] = useState('Create')
  const [prompt, setPrompt] = useState('')
  const [videos, setVideos] = useState(starterVideos)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aspect, setAspect] = useState('16:9')
  const [duration, setDuration] = useState('8 seconds')
  const [showPricing, setShowPricing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [generationError, setGenerationError] = useState('')
  const [billingError, setBillingError] = useState('')

  const activatePlan = async (plan) => {
    setBillingError('')
    try {
      const checkout = await createCheckout(plan)
      window.location.href = checkout.url
    } catch (error) {
      setBillingError(error.message)
    }
  }

  const generateVideo = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    setGenerationError('')
    try {
      const videoUrl = await createVideo({ prompt, aspectRatio: aspect, duration })
      setVideos([{ title: prompt.trim().slice(0, 32), meta: `AI video · ${aspect} · ${duration}`, color: 'aurora', state: 'Ready', videoUrl }, ...videos])
      setPrompt('')
      setActiveTab('Library')
    } catch (error) {
      setGenerationError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Sparkle /></span><span>AZ <em>AI</em> GENERATED</span></div>
        <nav className="nav" aria-label="Main navigation">
          {['Create', 'Library', 'Templates', 'Publish'].map(item => <button key={item} className={activeTab === item ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab(item)}><span className={`nav-icon ${item.toLowerCase()}`} />{item}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className={`trial-card ${selectedPlan ? 'paid-card' : ''}`}><div className="trial-top"><span>{selectedPlan ? `${selectedPlan} plan` : 'Free trial'}</span><strong>{selectedPlan ? 'Active' : '2 / 3'}</strong></div><div className="progress"><i className={selectedPlan ? 'full-progress' : ''} /></div><p>{selectedPlan ? 'Your paid plan is ready for more videos' : '1 generation left this month'}</p><button onClick={() => setShowPricing(true)}>{selectedPlan ? 'Change plan' : 'Upgrade plan'} <span>→</span></button></div>
          <button className="help"><span>?</span> Help center</button>
          <div className="profile"><div className="avatar">AM</div><div><strong>Amjad</strong><small>{selectedPlan ? `${selectedPlan} account` : 'Free account'}</small></div><span className="dots">•••</span></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark"><Sparkle /></span> AZ AI</div><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{activeTab}</strong></div><div className="top-actions"><button className="icon-button">⌘ K</button><button className="notification">♢<i /></button><div className="mini-avatar">AM</div></div></header>
        {activeTab === 'Create' && <section className="create-view"><div className="eyebrow"><Sparkle small /> AI VIDEO STUDIO</div><h1>Turn your ideas<br /><span>into motion.</span></h1><p className="intro">Describe a scene, a feeling, or a story. AZ brings it to life in seconds.</p>
          <div className="generator"><div className="prompt-wrap"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="A slow aerial shot of a quiet coastal town at golden hour..." /><div className="prompt-footer"><span className="prompt-hint"><Sparkle small /> Tip: be descriptive about movement, mood, and light</span><span className="char-count">{prompt.length} / 500</span></div></div><div className="generator-options"><div className="option-group"><label>Format</label><div className="segmented">{['16:9', '9:16', '1:1'].map(value => <button key={value} onClick={() => setAspect(value)} className={aspect === value ? 'selected' : ''}>{value}</button>)}</div></div><div className="option-group"><label>Duration</label><select className="select" value={duration} onChange={e => setDuration(e.target.value)}>{['8 seconds', '30 seconds', '1 minute', '5 minutes', '10 minutes', '20 minutes'].map(value => <option key={value}>{value}</option>)}</select></div><button className="generate" onClick={generateVideo} disabled={!prompt.trim() || isGenerating}>{isGenerating ? 'Creating...' : <><Sparkle small /> Generate video</>}</button></div>{generationError && <p className="generation-error">{generationError}</p>}</div>
          <div className="examples"><span>Try an idea</span>{['A paper city unfolding', 'Dolphins under moonlight', 'A chef in zero gravity'].map(example => <button key={example} onClick={() => setPrompt(example)}>{example} <span>↗</span></button>)}</div>
          <div className="recent-heading"><h2>Recent creations</h2><button onClick={() => setActiveTab('Library')}>View library <span>→</span></button></div><div className="video-grid">{videos.slice(0, 2).map(video => <VideoCard key={video.title} video={video} />)}</div>
        </section>}
        {activeTab === 'Library' && <Library videos={videos} onCreate={() => setActiveTab('Create')} />}
        {activeTab === 'Templates' && <Templates onUse={setPrompt} onCreate={() => setActiveTab('Create')} />}
        {activeTab === 'Publish' && <Publish />}
      </main>
      {showPricing && <Pricing onClose={() => setShowPricing(false)} onActivate={activatePlan} currentPlan={selectedPlan} billingError={billingError} />}
    </div>
  )
}

function VideoCard({ video }) { return <article className="video-card"><div className={`video-thumb ${video.color}`}><span className="play">▶</span><span className="video-status">{video.state}</span><span className="duration">0:08</span></div><div className="video-info"><div><h3>{video.title}</h3><p>{video.meta}</p></div><button className="more">•••</button></div></article> }
function Library({ videos, onCreate }) { return <section className="sub-view"><div className="sub-head"><div><div className="eyebrow">YOUR WORKSPACE</div><h1>Video library</h1><p>Every idea you have brought to life, in one place.</p></div><button className="generate small-button" onClick={onCreate}><Sparkle small /> New video</button></div><div className="filter-row"><button className="filter active">All videos</button><button className="filter">Favorites</button><span className="library-count">{videos.length} videos</span></div><div className="video-grid library-grid">{videos.map(video => <VideoCard key={video.title} video={video} />)}</div></section> }
function Templates({ onUse, onCreate }) { const items = ['A dreamy fashion editorial in soft morning light', 'A cinematic product reveal on black glass', 'A cozy animated coffee shop in the rain', 'A drone flight through a futuristic city']; return <section className="sub-view"><div className="sub-head"><div><div className="eyebrow">START WITH A SPARK</div><h1>Templates</h1><p>Jumpstart your next video with a proven creative direction.</p></div><button className="generate small-button" onClick={onCreate}><Sparkle small /> Blank canvas</button></div><div className="template-grid">{items.map((item, i) => <button className={`template-card template-${i}`} key={item} onClick={() => { onUse(item); onCreate() }}><span className="template-number">0{i + 1}</span><strong>{item}</strong><span className="use-template">Use template ↗</span></button>)}</div></section> }
function Publish() { const platforms = [['YouTube', 'Upload 4K video, title, thumbnail, and captions'], ['TikTok', 'Export vertical 9:16 with a short caption'], ['Instagram', 'Export Reel or landscape video for your audience'], ['Facebook', 'Share a horizontal or vertical video to your page']]; return <section className="sub-view"><div className="sub-head"><div><div className="eyebrow"><Sparkle small /> PUBLISH EVERYWHERE</div><h1>Grow your audience.</h1><p>Prepare one video for every platform from a single workspace.</p></div><button className="generate small-button"><span>↓</span> Export video</button></div><div className="publish-banner"><div><strong>Monetization checklist</strong><p>AZ can prepare your files and metadata for publishing. Each platform makes the final monetization decision.</p></div><span className="check-icon">✓</span></div><div className="platform-list">{platforms.map(([name, detail]) => <div className="platform-row" key={name}><div className="platform-logo">{name[0]}</div><div><strong>{name}</strong><p>{detail}</p></div><button className="connect-button">Prepare upload ↗</button></div>)}</div><div className="eligibility"><div className="eyebrow">IMPORTANT</div><h2>Free tools, platform approval.</h2><p>There is no guaranteed free monetization. YouTube, TikTok, Instagram, and Facebook require an eligible account, original content, policy compliance, and sometimes audience or watch-time thresholds. AZ has no publishing fees in this demo.</p></div></section> }
function Pricing({ onClose, onActivate, currentPlan, billingError }) { return <div className="modal-backdrop"><div className="pricing-modal"><button className="close" onClick={onClose}>×</button><div className="eyebrow">MAKE MORE MAGIC</div><h2>Choose your creative pace.</h2><p>Start free, upgrade when your ideas need more room.</p><div className="plans"><div className="plan"><small>CREATOR</small><strong>$19<em>/ month</em></strong><p>50 videos per month</p><button onClick={() => onActivate('Creator')}>{currentPlan === 'Creator' ? 'Current plan' : 'Choose Creator'}</button></div><div className="plan featured"><span className="popular">MOST POPULAR</span><small>STUDIO</small><strong>$49<em>/ month</em></strong><p>200 videos per month</p><button onClick={() => onActivate('Studio')}>{currentPlan === 'Studio' ? 'Current plan' : 'Choose Studio'}</button></div></div>{billingError && <p className="generation-error">{billingError}</p>}<p className="checkout-note">Secure checkout opens through Stripe. Add your Stripe keys to enable payments.</p></div></div> }

export default App
