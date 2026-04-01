export type NodeType = 'room' | 'corridor' | 'stair' | 'elevator' | 'entry' | 'exit' | 'door'
export type EmergencyType = 'fire' | 'medical' | 'security' | 'smoke' | 'hazmat'

export type Tool =
  | 'select'
  | 'place-room'
  | 'place-corridor'
  | 'place-stair'
  | 'place-elevator'
  | 'place-entry'
  | 'place-exit'
  | 'place-door'
  | 'draw-edge'
  | 'delete'
  | 'pan'

export interface MapNode {
  id: string
  type: NodeType
  label: string
  x: number
  y: number
  floorId: number
  linkId?: string      // matches stairs/elevators across floors
  danger?: boolean
  blocked?: boolean
}

export interface MapEdge {
  id: string
  from: string
  to: string
  weight: number
  crossFloor?: boolean
  danger?: boolean
  blocked?: boolean
  penalty?: number
}

export interface Floor {
  id: number
  name: string
  nodes: MapNode[]
  edges: MapEdge[]
}

export interface Building {
  id: string
  name: string
  floors: Floor[]
  crossFloorEdges: MapEdge[]
}

export interface PathStep {
  type: 'walk' | 'floor_change'
  fromNode?: MapNode
  toNode?: MapNode
  method?: 'stair' | 'elevator'
  fromFloorId?: number
  toFloorId?: number
  fromFloorName?: string
  toFloorName?: string
  floorId?: number
  description: string
}

export interface PathResult {
  nodeIds: string[]
  steps: PathStep[]
  totalCost: number
  algorithm: 'dijkstra' | 'astar'
  computeTimeMs: number
}

export interface Scenario {
  id: string
  name: string
  description: string
  icon: string
  building: Building
}

export type GraphEntry = {
  node: MapNode
  neighbors: { id: string; weight: number }[]
}
