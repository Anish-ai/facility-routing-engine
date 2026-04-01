'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function TopBar({ title }: { title: string }) {
  const path = usePathname()
  return (
    <div className="topbar">
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <span style={{ fontSize: 20 }}>🏢</span>
        <span style={{ fontWeight: 700, fontSize: 15, background: 'linear-gradient(135deg, #818CF8, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          IndoorNav
        </span>
      </Link>
      <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
      <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</span>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <Link href="/editor">
          <button className={`btn btn-sm ${path === '/editor' ? 'btn-primary' : 'btn-secondary'}`}>
            ✏️ Editor
          </button>
        </Link>
        <Link href="/navigate">
          <button className={`btn btn-sm ${path === '/navigate' ? 'btn-primary' : 'btn-secondary'}`}>
            🧭 Navigate
          </button>
        </Link>
      </div>
    </div>
  )
}
