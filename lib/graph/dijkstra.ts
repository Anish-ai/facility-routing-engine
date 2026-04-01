import { GraphEntry } from './types'

export function dijkstra(
  graph: Map<string, GraphEntry>,
  startId: string,
  endId: string
): { path: string[]; cost: number } | null {
  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()

  for (const id of graph.keys()) {
    dist.set(id, Infinity)
    prev.set(id, null)
  }
  dist.set(startId, 0)

  // Array-based min priority queue
  const pq: [number, string][] = [[0, startId]]

  while (pq.length > 0) {
    let minIdx = 0
    for (let i = 1; i < pq.length; i++) {
      if (pq[i][0] < pq[minIdx][0]) minIdx = i
    }
    const [cost, u] = pq.splice(minIdx, 1)[0]

    if (u === endId) break
    if (visited.has(u)) continue
    visited.add(u)

    const entry = graph.get(u)
    if (!entry) continue

    for (const { id: v, weight } of entry.neighbors) {
      if (visited.has(v)) continue
      const newDist = cost + weight
      if (newDist < (dist.get(v) ?? Infinity)) {
        dist.set(v, newDist)
        prev.set(v, u)
        pq.push([newDist, v])
      }
    }
  }

  if ((dist.get(endId) ?? Infinity) === Infinity) return null

  const path: string[] = []
  let current: string | null = endId
  while (current !== null) {
    path.unshift(current)
    current = prev.get(current) ?? null
  }

  return { path, cost: dist.get(endId)! }
}
