import { Building, GraphEntry, MapNode } from './types'

export function buildUnifiedGraph(
  building: Building,
  avoidDanger: boolean,
  avoidNodeIds: Set<string> = new Set(),
  preferStairsOnFire: boolean = false
): Map<string, GraphEntry> {
  const graph = new Map<string, GraphEntry>()
  const allNodes = getAllNodes(building)

  // Add all nodes from all floors
  for (const floor of building.floors) {
    for (const node of floor.nodes) {
      if (avoidNodeIds.has(node.id)) continue
      if (node.blocked && avoidDanger) continue
      graph.set(node.id, { node, neighbors: [] })
    }
  }

  // Add intra-floor edges
  for (const floor of building.floors) {
    for (const edge of floor.edges) {
      if (avoidNodeIds.has(edge.from) || avoidNodeIds.has(edge.to)) continue
      if (edge.blocked && avoidDanger) continue
      const effectiveWeight = edge.weight + (edge.danger && avoidDanger ? (edge.penalty ?? 50) : 0)

      const fromEntry = graph.get(edge.from)
      const toEntry = graph.get(edge.to)
      if (fromEntry && graph.has(edge.to)) {
        fromEntry.neighbors.push({ id: edge.to, weight: effectiveWeight })
      }
      if (toEntry && graph.has(edge.from)) {
        toEntry.neighbors.push({ id: edge.from, weight: effectiveWeight })
      }
    }
  }

  // Add cross-floor edges
  for (const edge of building.crossFloorEdges) {
    if (avoidNodeIds.has(edge.from) || avoidNodeIds.has(edge.to)) continue
    if (edge.blocked && avoidDanger) continue
    const fromNode = allNodes.get(edge.from)
    const toNode = allNodes.get(edge.to)
    const elevatorTransfer = fromNode?.type === 'elevator' || toNode?.type === 'elevator'

    let effectiveWeight = edge.weight + (edge.danger && avoidDanger ? (edge.penalty ?? 50) : 0)

    // During fire incidents we prefer stairs, but still allow lifts if no good alternative exists.
    if (preferStairsOnFire && elevatorTransfer) {
      effectiveWeight += 120
    }

    const fromEntry = graph.get(edge.from)
    const toEntry = graph.get(edge.to)
    if (fromEntry && graph.has(edge.to)) {
      fromEntry.neighbors.push({ id: edge.to, weight: effectiveWeight })
    }
    if (toEntry && graph.has(edge.from)) {
      toEntry.neighbors.push({ id: edge.from, weight: effectiveWeight })
    }
  }

  return graph
}

export function getAllNodes(building: Building): Map<string, MapNode> {
  const map = new Map<string, MapNode>()
  for (const floor of building.floors) {
    for (const node of floor.nodes) {
      map.set(node.id, node)
    }
  }
  return map
}
