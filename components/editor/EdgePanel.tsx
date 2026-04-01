'use client'
import { useEditorStore } from '@/stores/editorStore'

export default function EdgePanel() {
  const { building, selectedEdgeId, updateEdge, deleteEdge } = useEditorStore()

  const allEdges = building.floors.flatMap(f => f.edges)
  const allNodes = building.floors.flatMap(f => f.nodes)
  const edge = allEdges.find(e => e.id === selectedEdgeId)

  if (!edge) return null

  const fromNode = allNodes.find(n => n.id === edge.from)
  const toNode = allNodes.find(n => n.id === edge.to)

  return (
    <div className="animate-fade-in" style={{
      position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 16, alignItems: 'center',
      backdropFilter: 'blur(12px)', zIndex: 10, minWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#93C5FD' }}>{fromNode?.label ?? edge.from}</span>
        {' ↔ '}
        <span style={{ color: '#93C5FD' }}>{toNode?.label ?? edge.to}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="label" style={{ margin: 0 }}>Weight</div>
        <input
          className="input"
          type="number"
          min={1}
          value={edge.weight}
          onChange={e => updateEdge(edge.id, { weight: Math.max(1, Number(e.target.value)) })}
          style={{ width: 70 }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        <input type="checkbox" checked={!!edge.danger} onChange={e => updateEdge(edge.id, { danger: e.target.checked || undefined })} />
        ⚠️ Danger
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        <input type="checkbox" checked={!!edge.blocked} onChange={e => updateEdge(edge.id, { blocked: e.target.checked || undefined })} />
        🚫 Blocked
      </label>

      {edge.danger && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="label" style={{ margin: 0 }}>Penalty</div>
          <input
            className="input"
            type="number"
            min={0}
            value={edge.penalty ?? 50}
            onChange={e => updateEdge(edge.id, { penalty: Number(e.target.value) })}
            style={{ width: 60 }}
          />
        </div>
      )}

      <button className="btn btn-danger btn-sm" onClick={() => deleteEdge(edge.id)}>Delete</button>
    </div>
  )
}
