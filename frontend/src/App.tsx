import { useEffect, useState } from 'react'

import './App.css'

type HealthState = 'idle' | 'loading' | 'online' | 'offline'

type HealthResponse = {
  status: string
  message: string
}

const highlights = [
  'Featured collections',
  'Persistent carts',
  'Secure checkout flow',
]

const metrics = [
  { label: 'Catalog sync', value: '12k SKUs' },
  { label: 'Orders processed', value: '1.2k / day' },
  { label: 'Customer rating', value: '4.9 / 5' },
]

function App() {
  const [healthState, setHealthState] = useState<HealthState>('loading')
  const [healthMessage, setHealthMessage] = useState('Checking backend status...')

  useEffect(() => {
    const controller = new AbortController()

    async function loadHealth() {
      try {
        const response = await fetch('/api/health', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`)
        }

        const payload = (await response.json()) as HealthResponse

        setHealthState(payload.status === 'ok' ? 'online' : 'offline')
        setHealthMessage(payload.message)
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setHealthState('offline')
        setHealthMessage('Backend is unavailable. Start the API to enable live data.')
      }
    }

    void loadHealth()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Mini E-Commerce Platform</p>
          <h1>Storefront foundations with a backend that is easy to grow.</h1>
          <p className="hero-text">
            This starter pairs a React storefront with an Express API so we can
            layer in catalog, cart, checkout, and account flows without
            reworking the foundation.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#platform-overview">
              Explore the platform
            </a>
            <a className="secondary-action" href="/api/health" target="_blank" rel="noreferrer">
              Open API health check
            </a>
          </div>
        </div>

        <aside className="status-card" aria-live="polite">
          <div className="status-header">
            <span className={`status-dot status-${healthState}`} />
            <p className="status-label">Backend status</p>
          </div>
          <p className="status-message">{healthMessage}</p>
          <dl className="metric-grid">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section id="platform-overview" className="content-grid">
        <article className="overview-card">
          <p className="section-label">Why this setup works</p>
          <h2>Clear boundaries between the client and server.</h2>
          <p>
            The frontend focuses on product discovery and customer experience,
            while the backend owns configuration, API delivery, and future data
            access concerns.
          </p>
        </article>

        <article className="overview-card">
          <p className="section-label">What comes next</p>
          <ul className="feature-list">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App
