import { GraphEntry, MapNode } from './types'

function heuristic(a: MapNode, b: MapNode): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const floorPenalty = Math.abs(a.floorId - b.floorId) * 15
  return Math.sqrt(dx * dx + dy * dy) / 10 + floorPenalty
}

export function astar(
  graph: Map<string, GraphEntry>,
  startId: string,
  endId: string
): { path: string[]; cost: number } | null {
  const gScore = new Map<string, number>()
  const fScore = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const openSet = new Set<string>()

  for (const id of graph.keys()) {
    gScore.set(id, Infinity)
    fScore.set(id, Infinity)
    prev.set(id, null)
  }

  const endNode = graph.get(endId)?.node
  if (!endNode) return null

  gScore.set(startId, 0)
  const startNode = graph.get(startId)?.node
  if (!startNode) return null
  fScore.set(startId, heuristic(startNode, endNode))
  openSet.add(startId)

  while (openSet.size > 0) {
    let current = ''
    let minF = Infinity
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity
      if (f < minF) { minF = f; current = id }
    }

    if (current === endId) {
      const path: string[] = []
      let c: string | null = endId
      while (c !== null) {
        path.unshift(c)
        c = prev.get(c) ?? null
      }
      return { path, cost: gScore.get(endId)! }
    }

    openSet.delete(current)
    const entry = graph.get(current)
    if (!entry) continue

    for (const { id: neighbor, weight } of entry.neighbors) {
      const tentativeG = (gScore.get(current) ?? Infinity) + weight
      if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
        prev.set(neighbor, current)
        gScore.set(neighbor, tentativeG)
        const neighborNode = graph.get(neighbor)?.node
        if (neighborNode) {
          fScore.set(neighbor, tentativeG + heuristic(neighborNode, endNode))
        }
        openSet.add(neighbor)
      }
    }
  }

  return null
}
