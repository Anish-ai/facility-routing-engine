'use client'
import Link from 'next/link'

const features = [
  { icon: '🗺️', title: 'Visual Map Editor', desc: 'Drag-and-drop node placement on a snappable grid canvas. Draw rooms, corridors, stairs, and elevators.' },
  { icon: '🔗', title: 'Graph Engine', desc: 'Connect nodes with weighted edges. Auto-calculates distances. Supports multi-floor cross-connections.' },
  { icon: '⚡', title: 'A* Pathfinding', desc: 'Industry-grade A* (default) and Dijkstra algorithms. Toggle between them for comparison.' },
  { icon: '🏢', title: 'Multi-Floor Support', desc: 'Navigate across floors via stairs or elevators. Steps guide you through every floor change.' },
  { icon: '🔥', title: 'Hazard Scenarios', desc: 'Mark nodes/edges as dangerous or blocked. The system dynamically reroutes around hazards.' },
  { icon: '💾', title: 'JSON Export/Import', desc: 'Save your building as JSON. Import any building definition to instantly navigate it.' },
]

const steps = [
  { n: '01', title: 'Load or Create a Map', desc: 'Start with our preloaded 3-floor hotel or build your own.' },
  { n: '02', title: 'Place Nodes & Edges', desc: 'Use the editor toolbar to place rooms, corridors, stairs. Connect them with edges.' },
  { n: '03', title: 'Select Start & Destination', desc: 'Switch to Navigate mode. Pick any two nodes in the building.' },
  { n: '04', title: 'Find Shortest Path', desc: 'Click Find Path — A* computes the optimal route in milliseconds.' },
]

export default function HomePage() {
  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        background: 'rgba(7,13,26,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🏢</span>
          <span style={{ fontWeight: 700, fontSize: 18, background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            IndoorNav
          </span>
          <span className="badge badge-primary" style={{ marginLeft: 4 }}>v1.0</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/editor"><button className="btn btn-secondary">✏️ Map Editor</button></Link>
          <Link href="/navigate"><button className="btn btn-primary">🧭 Navigate</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 32px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-primary" style={{ marginBottom: 20, fontSize: 12 }}>
            🚀 Dijkstra + A* · Multi-Floor · Live Hazard Routing
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #F1F5F9 0%, #818CF8 50%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 20,
          }}>
            Indoor Floor Map Maker<br />& Shortest Path Navigator
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.65 }}>
            Design multi-floor building maps visually. Define rooms, corridors, stairs.
            Compute optimal paths with A* — even across floors and around hazards.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/navigate">
              <button className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
                🧭 Start Navigating
              </button>
            </Link>
            <Link href="/editor">
              <button className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
                ✏️ Open Map Editor
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '0 32px 60px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 36, color: 'var(--text-primary)' }}>
          Everything You Need
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} className="scenario-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 28 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '0 32px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 36 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {steps.map(s => (
            <div key={s.n} style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: '0 32px 60px', padding: '40px 32px', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        borderRadius: 16, border: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Ready to Navigate?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          A 3-floor hotel map is preloaded — jump straight in.
        </p>
        <Link href="/navigate">
          <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            🚀 Launch Navigator →
          </button>
        </Link>
      </section>
    </div>
  )
}
