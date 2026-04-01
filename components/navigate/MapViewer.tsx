'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { drawGrid, drawEdge, drawNode, NODE_RADIUS } from '@/lib/canvas/renderer'

export default function MapViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const animOffset = useRef<number>(0)
  const panRef = useRef({ ox: 60, oy: 60 })

  const { building } = useEditorStore()
  const { path, activeViewFloor } = useNavigationStore()

  const activeFloor = building.floors.find(f => f.id === activeViewFloor)

  const pathNodeSet = new Set(path?.nodeIds ?? [])
  const pathEdgeSet = new Set<string>()

  // Build path edge set
  if (path && activeFloor) {
    const nm = new Map(activeFloor.nodes.map(n => [n.id, n]))
    const ids = path.nodeIds
    for (let i = 0; i < ids.length - 1; i++) {
      const f = nm.get(ids[i]); const t = nm.get(ids[i + 1])
      if (f && t) {
        activeFloor.edges.forEach(e => {
          if ((e.from === ids[i] && e.to === ids[i + 1]) || (e.from === ids[i + 1] && e.to === ids[i]))
            pathEdgeSet.add(e.id)
        })
      }
    }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { ox, oy } = panRef.current
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0D1526'
    ctx.fillRect(0, 0, w, h)
    drawGrid(ctx, w, h, ox, oy)

    if (!activeFloor) return

    ctx.save()
    ctx.translate(ox, oy)

    const nm = new Map(activeFloor.nodes.map(n => [n.id, n]))
    const anim = animOffset.current
    const hasPath = path !== null

    // Draw edges
    for (const edge of activeFloor.edges) {
      const f = nm.get(edge.from); const t = nm.get(edge.to)
      if (!f || !t) continue
      const highlight = pathEdgeSet.has(edge.id)
      if (hasPath && !highlight) {
        ctx.save()
        ctx.globalAlpha = 0.2
        drawEdge(ctx, f, t, edge, false, false, false, anim, 0, 0)
        ctx.restore()
      } else {
        drawEdge(ctx, f, t, edge, false, false, highlight, anim, 0, 0)
      }
    }

    // Draw nodes
    const pathIds = path?.nodeIds ?? []
    for (const node of activeFloor.nodes) {
      const inPath = pathNodeSet.has(node.id)
      const pathIndex = inPath ? pathIds.indexOf(node.id) : null
      if (hasPath && !inPath) {
        ctx.save()
        ctx.globalAlpha = 0.25
        drawNode(ctx, node, false, false, false, null, 0, 0)
        ctx.restore()
      } else {
        drawNode(ctx, node, false, false, inPath, pathIndex, 0, 0)
      }
    }

    ctx.restore()
  }, [activeFloor, path, pathEdgeSet, pathNodeSet])

  useEffect(() => {
    const loop = () => {
      animOffset.current = (animOffset.current + 0.4) % 20
      draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        canvas.width = e.contentRect.width
        canvas.height = e.contentRect.height
      }
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // Pan support
  const panState = useRef({ panning: false, sx: 0, sy: 0 })
  const onMouseDown = (e: React.MouseEvent) => {
    panState.current = { panning: true, sx: e.clientX - panRef.current.ox, sy: e.clientY - panRef.current.oy }
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!panState.current.panning) return
    panRef.current.ox = e.clientX - panState.current.sx
    panRef.current.oy = e.clientY - panState.current.sy
  }
  const onMouseUp = () => { panState.current.panning = false }

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative', cursor: 'grab' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      />
      {path && (
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(13,21,38,0.85)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 12px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-secondary)',
        }}>
          Total: <span style={{ color: '#818CF8' }}>{path.totalCost.toFixed(1)}</span> units ·
          {' '}<span style={{ color: '#34D399' }}>{path.algorithm.toUpperCase()}</span> ·
          {' '}{path.computeTimeMs.toFixed(2)}ms
        </div>
      )}
    </div>
  )
}
