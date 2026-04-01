import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IndoorNav — Floor Map Maker & Pathfinder',
  description: 'Create multi-floor indoor maps, connect nodes, and compute shortest paths with Dijkstra and A* algorithms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <body style={{ height: '100%', overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  )
}
