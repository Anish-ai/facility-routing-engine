'use client'
import { create } from 'zustand'
import { EmergencyType, PathResult } from '@/lib/graph/types'
import { useEditorStore } from './editorStore'
import { findPath } from '@/lib/graph/pathfinder'

interface NavigationState {
  startNodeId: string | null
  endNodeId: string | null
  algorithm: 'dijkstra' | 'astar'
  avoidDanger: boolean
  avoidEmergencyZones: boolean
  emergencyByNodeId: Record<string, EmergencyType>
  path: PathResult | null
  isComputing: boolean
  activeViewFloor: number
  error: string | null

  setStart: (id: string | null) => void
  setEnd: (id: string | null) => void
  setAlgorithm: (algo: 'dijkstra' | 'astar') => void
  toggleAvoidDanger: () => void
  toggleAvoidEmergencyZones: () => void
  setNodeEmergency: (nodeId: string, emergency: EmergencyType) => void
  clearNodeEmergency: (nodeId: string) => void
  clearAllEmergencies: () => void
  computePath: () => void
  setActiveViewFloor: (id: number) => void
  clearPath: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  startNodeId: null,
  endNodeId: null,
  algorithm: 'astar',
  avoidDanger: false,
  avoidEmergencyZones: true,
  emergencyByNodeId: {},
  path: null,
  isComputing: false,
  activeViewFloor: 1,
  error: null,

  setStart: (id) => set({ startNodeId: id, path: null, error: null }),
  setEnd: (id) => set({ endNodeId: id, path: null, error: null }),
  setAlgorithm: (algo) => set({ algorithm: algo, path: null }),
  toggleAvoidDanger: () => set(s => ({ avoidDanger: !s.avoidDanger, path: null })),
  toggleAvoidEmergencyZones: () => set(s => ({ avoidEmergencyZones: !s.avoidEmergencyZones, path: null })),
  setNodeEmergency: (nodeId, emergency) => set((s) => ({
    emergencyByNodeId: { ...s.emergencyByNodeId, [nodeId]: emergency },
    path: null,
    error: null,
  })),
  clearNodeEmergency: (nodeId) => set((s) => {
    const next = { ...s.emergencyByNodeId }
    delete next[nodeId]
    return { emergencyByNodeId: next, path: null, error: null }
  }),
  clearAllEmergencies: () => set({ emergencyByNodeId: {}, path: null, error: null }),
  setActiveViewFloor: (id) => set({ activeViewFloor: id }),
  clearPath: () => set({ path: null, error: null, startNodeId: null, endNodeId: null }),

  computePath: () => {
    const { startNodeId, endNodeId, algorithm, avoidDanger, avoidEmergencyZones, emergencyByNodeId } = get()
    const building = useEditorStore.getState().building
    const incidentNodeIds = avoidEmergencyZones ? new Set(Object.keys(emergencyByNodeId)) : new Set<string>()
    const hasFireIncident = Object.values(emergencyByNodeId).includes('fire')
    const preferStairsOnFire = avoidEmergencyZones && hasFireIncident

    if (!startNodeId || !endNodeId) {
      set({ error: 'Please select both start and end locations.' }); return
    }
    if (startNodeId === endNodeId) {
      set({ error: 'Start and end must be different nodes.' }); return
    }
    if (avoidEmergencyZones && incidentNodeIds.has(startNodeId)) {
      set({ error: 'Start node has an active emergency. Select a different start location.' }); return
    }
    if (avoidEmergencyZones && incidentNodeIds.has(endNodeId)) {
      set({ error: 'Destination has an active emergency. Select a different destination.' }); return
    }

    set({ isComputing: true, error: null })

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const result = findPath(building, startNodeId, endNodeId, algorithm, avoidDanger, incidentNodeIds, preferStairsOnFire)
      if (!result) {
        set({ path: null, isComputing: false, error: 'No path found. The route may be blocked by hazards or emergency incidents.' })
      } else {
        // Set active view floor to the floor of the start node
        const allNodes = building.floors.flatMap(f => f.nodes)
        const startNode = allNodes.find(n => n.id === startNodeId)
        set({ path: result, isComputing: false, error: null, activeViewFloor: startNode?.floorId ?? 1 })
      }
    }, 10)
  },
}))
