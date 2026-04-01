import { MapNode, MapEdge, NodeType } from '@/lib/graph/types'

export const NODE_RADIUS = 20
export const GRID_SIZE = 20

export const NODE_COLORS: Record<NodeType, { fill: string; stroke: string; text: string }> = {
  room:      { fill: '#1e3a5f', stroke: '#3B82F6', text: '#93C5FD' },
  corridor:  { fill: '#1f2937', stroke: '#6B7280', text: '#9CA3AF' },
  stair:     { fill: '#431407', stroke: '#F97316', text: '#FED7AA' },
  elevator:  { fill: '#3b0764', stroke: '#A855F7', text: '#D8B4FE' },
  entry:     { fill: '#14532d', stroke: '#22C55E', text: '#86EFAC' },
  exit:      { fill: '#450a0a', stroke: '#EF4444', text: '#FCA5A5' },
  door:      { fill: '#422006', stroke: '#EAB308', text: '#FDE047' },
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  offsetX: number,
  offsetY: number
) {
  const startX = (offsetX % GRID_SIZE + GRID_SIZE) % GRID_SIZE
  const startY = (offsetY % GRID_SIZE + GRID_SIZE) % GRID_SIZE

  ctx.save()
  for (let x = startX; x < width; x += GRID_SIZE) {
    const isMajor = Math.round((x - startX) / GRID_SIZE + Math.floor(offsetX / GRID_SIZE)) % 5 === 0
    ctx.strokeStyle = isMajor ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.07)'
    ctx.lineWidth = isMajor ? 1 : 0.5
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = startY; y < height; y += GRID_SIZE) {
    const isMajor = Math.round((y - startY) / GRID_SIZE + Math.floor(offsetY / GRID_SIZE)) % 5 === 0
    ctx.strokeStyle = isMajor ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.07)'
    ctx.lineWidth = isMajor ? 1 : 0.5
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
  ctx.restore()
}

export function drawEdge(
  ctx: CanvasRenderingContext2D,
  from: MapNode,
  to: MapNode,
  edge: MapEdge,
  selected: boolean,
  hovered: boolean,
  pathHighlight: boolean,
  animOffset: number,
  ox: number,
  oy: number
) {
  const fx = from.x + ox, fy = from.y + oy
  const tx = to.x + ox, ty = to.y + oy
  const mx = (fx + tx) / 2, my = (fy + ty) / 2

  ctx.save()
  if (edge.blocked) {
    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
  } else if (pathHighlight) {
    ctx.strokeStyle = '#6366F1'; ctx.lineWidth = 4; ctx.setLineDash([8, 4])
    ctx.lineDashOffset = -animOffset
    ctx.shadowColor = '#818CF8'; ctx.shadowBlur = 8
  } else if (edge.danger) {
    ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
  } else if (selected) {
    ctx.strokeStyle = '#6366F1'; ctx.lineWidth = 3; ctx.setLineDash([])
  } else if (hovered) {
    ctx.strokeStyle = '#818CF8'; ctx.lineWidth = 2; ctx.setLineDash([])
  } else {
    ctx.strokeStyle = 'rgba(148,163,184,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([])
  }
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke()
  ctx.setLineDash([])

  // Weight label
  if (!pathHighlight) {
    ctx.font = '10px Inter, sans-serif'
    ctx.fillStyle = edge.blocked ? '#EF4444' : edge.danger ? '#F59E0B' : 'rgba(148,163,184,0.5)'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText(String(edge.weight), mx, my - 3)
  }
  ctx.restore()
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: MapNode,
  selected: boolean,
  hovered: boolean,
  pathHighlight: boolean,
  pathIndex: number | null,
  ox: number,
  oy: number
) {
  const cx = node.x + ox, cy = node.y + oy
  const colors = NODE_COLORS[node.type]

  ctx.save()

  if (node.danger) {
    ctx.shadowColor = '#F59E0B'; ctx.shadowBlur = 12
  } else if (node.blocked) {
    ctx.shadowColor = '#EF4444'; ctx.shadowBlur = 12
  } else if (pathHighlight) {
    ctx.shadowColor = '#6366F1'; ctx.shadowBlur = 16
  } else if (selected) {
    ctx.shadowColor = colors.stroke; ctx.shadowBlur = 14
  }

  // Selection ring
  if (selected || pathHighlight) {
    ctx.beginPath()
    ctx.arc(cx, cy, NODE_RADIUS + 5, 0, Math.PI * 2)
    ctx.strokeStyle = pathHighlight ? '#6366F1' : colors.stroke
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Node circle fill
  ctx.beginPath()
  ctx.arc(cx, cy, NODE_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = node.blocked ? '#450a0a' : node.danger ? '#422006' : colors.fill
  ctx.fill()
  ctx.strokeStyle = node.blocked ? '#EF4444' : node.danger ? '#F59E0B' : colors.stroke
  ctx.lineWidth = hovered ? 2.5 : 1.5
  ctx.stroke()

  // Path index bubble
  if (pathIndex !== null) {
    ctx.beginPath()
    ctx.arc(cx + NODE_RADIUS - 6, cy - NODE_RADIUS + 6, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#6366F1'
    ctx.fill()
    ctx.font = 'bold 9px Inter, sans-serif'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(String(pathIndex + 1), cx + NODE_RADIUS - 6, cy - NODE_RADIUS + 6)
  }

  // Icon
  ctx.font = '13px serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(getNodeIcon(node.type), cx, cy)

  // Label
  ctx.font = '10px Inter, sans-serif'
  ctx.fillStyle = node.blocked ? '#FCA5A5' : node.danger ? '#FDE047' : colors.text
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  const maxLen = 12
  const label = node.label.length > maxLen ? node.label.slice(0, maxLen) + '…' : node.label
  ctx.fillText(label, cx, cy + NODE_RADIUS + 4)

  ctx.restore()
}

function getNodeIcon(type: NodeType): string {
  const icons: Record<NodeType, string> = {
    room: '🚪', corridor: '⬛', stair: '🪜', elevator: '🛗',
    entry: '➡️', exit: '🚪', door: '🔒',
  }
  return icons[type] ?? '●'
}

export function hitNode(node: MapNode, mx: number, my: number, ox: number, oy: number): boolean {
  const dx = node.x + ox - mx
  const dy = node.y + oy - my
  return Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS + 6
}

export function hitEdge(
  from: MapNode, to: MapNode, mx: number, my: number, ox: number, oy: number
): boolean {
  const fx = from.x + ox, fy = from.y + oy
  const tx = to.x + ox, ty = to.y + oy
  const dx = tx - fx, dy = ty - fy
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return false
  const t = Math.max(0, Math.min(1, ((mx - fx) * dx + (my - fy) * dy) / len2))
  const px = fx + t * dx, py = fy + t * dy
  return Math.sqrt((mx - px) ** 2 + (my - py) ** 2) <= 8
}
