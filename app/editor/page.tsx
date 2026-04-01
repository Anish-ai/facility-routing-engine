'use client'
import TopBar from '@/components/shared/TopBar'
import Toolbar from '@/components/editor/Toolbar'
import FloorManager from '@/components/editor/FloorManager'
import FloorCanvas from '@/components/editor/FloorCanvas'
import NodePanel from '@/components/editor/NodePanel'
import EdgePanel from '@/components/editor/EdgePanel'

export default function EditorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar title="Map Editor" />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <FloorManager />
        <Toolbar />
        <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
          <FloorCanvas />
          <EdgePanel />
        </div>
        <NodePanel />
      </div>
    </div>
  )
}
