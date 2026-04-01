import { Building, PathResult, PathStep, MapNode } from './types'
import { buildUnifiedGraph, getAllNodes } from './buildGraph'
import { dijkstra } from './dijkstra'
import { astar } from './astar'

export function findPath(
  building: Building,
  startNodeId: string,
  endNodeId: string,
  algorithm: 'dijkstra' | 'astar',
  avoidDanger: boolean
): PathResult | null {
  const t0 = performance.now()
  const graph = buildUnifiedGraph(building, avoidDanger)

  if (!graph.has(startNodeId) || !graph.has(endNodeId)) return null

  const result = algorithm === 'astar'
    ? astar(graph, startNodeId, endNodeId)
    : dijkstra(graph, startNodeId, endNodeId)

  if (!result) return null

  const allNodes = getAllNodes(building)
  const floorMap = new Map(building.floors.map(f => [f.id, f]))
  const steps = buildSteps(result.path, allNodes, floorMap)

  return {
    nodeIds: result.path,
    steps,
    totalCost: result.cost,
    algorithm,
    computeTimeMs: performance.now() - t0,
  }
}

function buildSteps(
  nodeIds: string[],
  allNodes: Map<string, MapNode>,
  floorMap: Map<number, { name: string }>
): PathStep[] {
  const steps: PathStep[] = []
  for (let i = 0; i < nodeIds.length - 1; i++) {
    const fromNode = allNodes.get(nodeIds[i])!
    const toNode = allNodes.get(nodeIds[i + 1])!

    if (fromNode.floorId !== toNode.floorId) {
      const isStair = fromNode.type === 'stair' || toNode.type === 'stair'
      steps.push({
        type: 'floor_change',
        fromNode,
        toNode,
        method: isStair ? 'stair' : 'elevator',
        fromFloorId: fromNode.floorId,
        toFloorId: toNode.floorId,
        fromFloorName: floorMap.get(fromNode.floorId)?.name,
        toFloorName: floorMap.get(toNode.floorId)?.name,
        description: `Take ${isStair ? 'stairs' : 'elevator'} from ${floorMap.get(fromNode.floorId)?.name ?? 'Floor ' + fromNode.floorId} to ${floorMap.get(toNode.floorId)?.name ?? 'Floor ' + toNode.floorId}`,
      })
    } else {
      const dx = toNode.x - fromNode.x
      const dy = toNode.y - fromNode.y
      steps.push({
        type: 'walk',
        fromNode,
        toNode,
        floorId: fromNode.floorId,
        description: `Walk from ${fromNode.label} to ${toNode.label}`,
      })
    }
  }
  return steps
}
