'use client'
import { Tool, NodeType } from '@/lib/graph/types'
import { useEditorStore } from '@/stores/editorStore'

type ToolDef = { tool: Tool; icon: string; label: string; tip: string }

const TOOLS: ToolDef[] = [
  { tool: 'select', icon: '↖️', label: 'Select', tip: 'Select & drag nodes' },
  { tool: 'pan', icon: '✋', label: 'Pan', tip: 'Pan the canvas' },
  { tool: 'draw-edge', icon: '🔗', label: 'Edge', tip: 'Click two nodes to connect' },
  { tool: 'delete', icon: '🗑️', label: 'Delete', tip: 'Click to delete' },
]

const NODES: ToolDef[] = [
  { tool: 'place-room', icon: '🚪', label: 'Room', tip: 'Place a room' },
  { tool: 'place-corridor', icon: '⬛', label: 'Corridor', tip: 'Place a corridor junction' },
  { tool: 'place-stair', icon: '🪜', label: 'Stair', tip: 'Place a staircase (links floors)' },
  { tool: 'place-elevator', icon: '🛗', label: 'Elevator', tip: 'Place an elevator (links floors)' },
  { tool: 'place-entry', icon: '➡️', label: 'Entry', tip: 'Place an entry point' },
  { tool: 'place-exit', icon: '🚪', label: 'Exit', tip: 'Place an exit point' },
  { tool: 'place-door', icon: '🔒', label: 'Door', tip: 'Place a door' },
]

export default function Toolbar() {
  const { activeTool, snapToGrid, setTool, toggleSnapToGrid } = useEditorStore()

  return (
    <div style={{
      width: 72, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', padding: '10px 6px', gap: 4,
      flexShrink: 0, overflowY: 'auto',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', padding: '4px 0', marginBottom: 2 }}>Tools</div>
      {TOOLS.map(t => (
        <button
          key={t.tool}
          className={`tool-btn tooltip ${activeTool === t.tool ? 'active' : ''}`}
          data-tip={t.tip}
          onClick={() => setTool(t.tool)}
          title={t.tip}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}

      <hr className="divider" style={{ margin: '6px 0' }} />
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', padding: '4px 0', marginBottom: 2 }}>Nodes</div>
      {NODES.map(t => (
        <button
          key={t.tool}
          className={`tool-btn tooltip ${activeTool === t.tool ? 'active' : ''}`}
          data-tip={t.tip}
          onClick={() => setTool(t.tool)}
          title={t.tip}
        >
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}

      <hr className="divider" style={{ margin: '6px 0' }} />
      <button
        className={`tool-btn ${snapToGrid ? 'active' : ''}`}
        onClick={toggleSnapToGrid}
        title="Toggle snap to grid"
      >
        <span style={{ fontSize: 16 }}>⊞</span>
        <span>Snap</span>
      </button>
    </div>
  )
}
