'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { MapNode, MapEdge, NodeType } from '@/lib/graph/types'
import {
  drawGrid, drawEdge, drawNode, hitNode, hitEdge,
  NODE_RADIUS, GRID_SIZE
} from '@/lib/canvas/renderer'

function getDefaultLabel(type: NodeType, count: number): string {
  const map: Record<NodeType, string> = {
    room: `Room ${100 + count}`, corridor: `Corridor ${String.fromCharCode(65 + (count % 26))}`,
    stair: 'Stairs', elevator: 'Elevator', entry: 'Entry', exit: 'Exit', door: `Door ${count + 1}`,
  }
  return map[type]
}

function getCursor(tool: string): string {
  if (tool === 'pan') return 'grab'
  if (tool === 'delete') return 'crosshair'
  if (tool.startsWith('place-')) return 'copy'
  if (tool === 'draw-edge') return 'cell'
  return 'default'
}

export default function FloorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const animOffset = useRef<number>(0)

  const stateRef = useRef({
    isDragging: false, dragNodeId: null as string | null,
    dragOffsetX: 0, dragOffsetY: 0,
    edgeStartNodeId: null as string | null,
    panOffsetX: 60, panOffsetY: 60,
    isPanning: false, panStartX: 0, panStartY: 0, panStartOX: 0, panStartOY: 0,
    mouseX: 0, mouseY: 0,
    hoverNodeId: null as string | null,
    hoverEdgeId: null as string | null,
  })

  const store = useEditorStore()
  const {
    building, activeFloorId, activeTool, selectedNodeId, selectedEdgeId,
    snapToGrid, addNode, updateNode, deleteNode, addEdge, deleteEdge,
    setSelectedNode, setSelectedEdge, edgeStartNodeId, setEdgeStartNode,
  } = store

  const activeFloor = building.floors.find(f => f.id === activeFloorId)

  const snap = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y }
    return { x: Math.round(x / GRID_SIZE) * GRID_SIZE, y: Math.round(y / GRID_SIZE) * GRID_SIZE }
  }, [snapToGrid])

  const getNodeMap = useCallback(() => new Map(activeFloor?.nodes.map(n => [n.id, n]) ?? []), [activeFloor])

  const findNodeAt = useCallback((mapX: number, mapY: number) => {
    if (!activeFloor) return null
    return activeFloor.nodes.slice().reverse().find(n => hitNode(n, mapX, mapY, 0, 0)) ?? null
  }, [activeFloor])

  const findEdgeAt = useCallback((mapX: number, mapY: number) => {
    if (!activeFloor) return null
    const nm = getNodeMap()
    return activeFloor.edges.find(e => {
      const f = nm.get(e.from); const t = nm.get(e.to)
      return f && t && hitEdge(f, t, mapX, mapY, 0, 0)
    }) ?? null
  }, [activeFloor, getNodeMap])

  // ─── Draw loop ───────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { panOffsetX, panOffsetY, edgeStartNodeId: esn, mouseX, mouseY, hoverNodeId, hoverEdgeId } = stateRef.current
    const w = canvas.width, h = canvas.height

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0D1526'
    ctx.fillRect(0, 0, w, h)

    drawGrid(ctx, w, h, panOffsetX, panOffsetY)

    if (!activeFloor) return

    ctx.save()
    ctx.translate(panOffsetX, panOffsetY)

    const nm = new Map(activeFloor.nodes.map(n => [n.id, n]))
    const anim = animOffset.current

    // Draw edges
    for (const edge of activeFloor.edges) {
      const f = nm.get(edge.from); const t = nm.get(edge.to)
      if (!f || !t) continue
      drawEdge(ctx, f, t, edge,
        edge.id === selectedEdgeId,
        edge.id === hoverEdgeId,
        false, anim, 0, 0
      )
    }

    // Edge being drawn
    if (esn && activeTool === 'draw-edge') {
      const startNode = nm.get(esn)
      if (startNode) {
        ctx.save()
        ctx.strokeStyle = 'rgba(99,102,241,0.8)'
        ctx.lineWidth = 2; ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.moveTo(startNode.x, startNode.y)
        ctx.lineTo(mouseX - panOffsetX, mouseY - panOffsetY)
        ctx.stroke(); ctx.setLineDash([])
        ctx.restore()
      }
    }

    // Draw nodes
    for (const node of activeFloor.nodes) {
      drawNode(ctx, node, node.id === selectedNodeId, node.id === hoverNodeId, false, null, 0, 0)
    }

    // Edge start indicator
    if (esn) {
      const sn = nm.get(esn)
      if (sn) {
        ctx.save()
        ctx.beginPath(); ctx.arc(sn.x, sn.y, NODE_RADIUS + 8, 0, Math.PI * 2)
        ctx.strokeStyle = '#6366F1'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 3])
        ctx.stroke(); ctx.setLineDash([])
        ctx.restore()
      }
    }

    ctx.restore()
  }, [activeFloor, activeTool, selectedNodeId, selectedEdgeId])

  useEffect(() => {
    const loop = () => {
      animOffset.current = (animOffset.current + 0.5) % 20
      draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  // ─── Resize observer ─────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current; const canvas = canvasRef.current
    if (!container || !canvas) return
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        canvas.width = e.contentRect.width; canvas.height = e.contentRect.height
      }
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // ─── Mouse handlers ───────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent
    const s = stateRef.current
    const mapX = offsetX - s.panOffsetX; const mapY = offsetY - s.panOffsetY

    const clickedNode = findNodeAt(mapX, mapY)
    const clickedEdge = clickedNode ? null : findEdgeAt(mapX, mapY)

    if (activeTool === 'select') {
      if (clickedNode) {
        setSelectedNode(clickedNode.id); setSelectedEdge(null)
        s.isDragging = true; s.dragNodeId = clickedNode.id
        s.dragOffsetX = mapX - clickedNode.x; s.dragOffsetY = mapY - clickedNode.y
      } else if (clickedEdge) {
        setSelectedEdge(clickedEdge.id); setSelectedNode(null)
      } else {
        setSelectedNode(null); setSelectedEdge(null)
      }
    } else if (activeTool === 'pan') {
      s.isPanning = true; s.panStartX = offsetX; s.panStartY = offsetY
      s.panStartOX = s.panOffsetX; s.panStartOY = s.panOffsetY
    } else if (activeTool === 'draw-edge') {
      if (clickedNode) {
        const esn = stateRef.current.edgeStartNodeId ?? edgeStartNodeId
        if (!esn) {
          s.edgeStartNodeId = clickedNode.id
          setEdgeStartNode(clickedNode.id)
        } else if (esn !== clickedNode.id) {
          const fromNode = activeFloor?.nodes.find(n => n.id === esn)
          if (fromNode) {
            const dx = clickedNode.x - fromNode.x; const dy = clickedNode.y - fromNode.y
            addEdge({ from: esn, to: clickedNode.id, weight: Math.max(1, Math.round(Math.sqrt(dx*dx + dy*dy) / 10)) })
          }
          s.edgeStartNodeId = null; setEdgeStartNode(null)
        }
      } else {
        s.edgeStartNodeId = null; setEdgeStartNode(null)
      }
    } else if (activeTool === 'delete') {
      if (clickedNode) deleteNode(clickedNode.id)
      else if (clickedEdge) deleteEdge(clickedEdge.id)
    } else if (activeTool.startsWith('place-')) {
      const type = activeTool.replace('place-', '') as NodeType
      const snapped = snap(mapX, mapY)
      addNode({ type, label: getDefaultLabel(type, activeFloor?.nodes.length ?? 0), x: snapped.x, y: snapped.y, floorId: activeFloorId })
    }
  }, [activeTool, activeFloor, activeFloorId, edgeStartNodeId, addNode, addEdge, deleteNode, deleteEdge, setSelectedNode, setSelectedEdge, setEdgeStartNode, findNodeAt, findEdgeAt, snap])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent
    const s = stateRef.current
    s.mouseX = offsetX; s.mouseY = offsetY

    if (s.isPanning) {
      s.panOffsetX = s.panStartOX + (offsetX - s.panStartX)
      s.panOffsetY = s.panStartOY + (offsetY - s.panStartY)
      return
    }

    if (s.isDragging && s.dragNodeId) {
      const mapX = offsetX - s.panOffsetX; const mapY = offsetY - s.panOffsetY
      const snapped = snap(mapX - s.dragOffsetX, mapY - s.dragOffsetY)
      updateNode(s.dragNodeId, { x: snapped.x, y: snapped.y })
      return
    }

    const mapX = offsetX - s.panOffsetX; const mapY = offsetY - s.panOffsetY
    const hn = findNodeAt(mapX, mapY)
    s.hoverNodeId = hn?.id ?? null
    if (!hn) {
      const he = findEdgeAt(mapX, mapY)
      s.hoverEdgeId = he?.id ?? null
    } else {
      s.hoverEdgeId = null
    }
  }, [updateNode, findNodeAt, findEdgeAt, snap])

  const onMouseUp = useCallback(() => {
    stateRef.current.isDragging = false
    stateRef.current.dragNodeId = null
    stateRef.current.isPanning = false
  }, [])

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    stateRef.current.edgeStartNodeId = null
    setEdgeStartNode(null)
  }, [setEdgeStartNode])

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: getCursor(activeTool) }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onContextMenu={onContextMenu}
      />
      {/* Status bar */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12,
        fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
        background: 'rgba(13,21,38,0.8)', padding: '4px 10px', borderRadius: 5,
        border: '1px solid var(--border)',
      }}>
        {activeFloor?.nodes.length ?? 0} nodes · {activeFloor?.edges.length ?? 0} edges
        {edgeStartNodeId && <span style={{ marginLeft: 8, color: 'var(--primary-light)' }}>● Connecting…</span>}
      </div>
      {/* Tool hint */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        fontSize: 11, color: 'var(--text-muted)',
        background: 'rgba(13,21,38,0.8)', padding: '4px 12px', borderRadius: 5,
        border: '1px solid var(--border)', pointerEvents: 'none',
      }}>
        {activeTool === 'select' && 'Click to select · Drag to move'}
        {activeTool === 'pan' && 'Drag to pan canvas'}
        {activeTool === 'draw-edge' && (!edgeStartNodeId ? 'Click first node…' : 'Click second node to connect')}
        {activeTool === 'delete' && 'Click node or edge to delete'}
        {activeTool.startsWith('place-') && `Click to place ${activeTool.replace('place-', '')}`}
      </div>
    </div>
  )
}
