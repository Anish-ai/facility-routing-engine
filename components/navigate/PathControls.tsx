'use client'
import { useEditorStore } from '@/stores/editorStore'
import { useNavigationStore } from '@/stores/navigationStore'
import { HOTEL_SCENARIOS } from '@/lib/graph/hotelExample'

export default function PathControls() {
  const { building, setBuilding } = useEditorStore()
  const {
    startNodeId, endNodeId, algorithm, avoidDanger,
    path, isComputing, error,
    setStart, setEnd, setAlgorithm, toggleAvoidDanger,
    computePath, clearPath, activeViewFloor, setActiveViewFloor,
  } = useNavigationStore()

  const allNodes = building.floors.flatMap(f =>
    f.nodes.map(n => ({ ...n, floorName: building.floors.find(fl => fl.id === n.floorId)?.name ?? '' }))
  )

  const nodesByFloor = building.floors.map(floor => ({
    floor,
    nodes: allNodes.filter(n => n.floorId === floor.id),
  }))

  return (
    <div className="panel" style={{ width: 240, display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>

      {/* Scrollable top section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Scenario loader */}
      <div>
        <div className="label">Scenario</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {HOTEL_SCENARIOS.map(s => (
            <div
              key={s.id}
              className={`scenario-card ${building.id === s.building.id ? 'active' : ''}`}
              style={{ padding: '7px 10px', fontSize: 12 }}
              onClick={() => { setBuilding(s.building); clearPath() }}
            >
              <div style={{ fontWeight: 600 }}>{s.icon} {s.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{s.description}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* Start node */}
      <div>
        <div className="label">🟢 Start Location</div>
        <select className="select" value={startNodeId ?? ''} onChange={e => setStart(e.target.value || null)}>
          <option value="">— Select start —</option>
          {nodesByFloor.map(({ floor, nodes }) => (
            <optgroup key={floor.id} label={floor.name}>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* End node */}
      <div>
        <div className="label">🔴 Destination</div>
        <select className="select" value={endNodeId ?? ''} onChange={e => setEnd(e.target.value || null)}>
          <option value="">— Select destination —</option>
          {nodesByFloor.map(({ floor, nodes }) => (
            <optgroup key={floor.id} label={floor.name}>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.label}{n.blocked ? ' 🚫' : n.danger ? ' ⚠️' : ''}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Algorithm toggle */}
      <div>
        <div className="label">Algorithm</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['astar', 'dijkstra'] as const).map(algo => (
            <button
              key={algo}
              className={`btn btn-sm ${algorithm === algo ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setAlgorithm(algo)}
            >
              {algo === 'astar' ? '⚡ A*' : '🔄 Dijkstra'}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.5 }}>
          {algorithm === 'astar' ? 'A* uses a heuristic for faster results (default).' : 'Dijkstra explores all paths — baseline comparison.'}
        </div>
      </div>

      {/* Avoid danger toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <div style={{
          width: 36, height: 20, borderRadius: 10, transition: 'background 0.2s',
          background: avoidDanger ? 'var(--primary)' : 'var(--bg-surface)',
          border: '1px solid var(--border)', position: 'relative', flexShrink: 0,
        }} onClick={toggleAvoidDanger}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 2, transition: 'left 0.2s',
            left: avoidDanger ? 18 : 2,
          }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          ⚠️ Avoid danger zones
        </div>
      </label>

      <hr className="divider" />

      {/* Floor view tabs */}
      <div>
        <div className="label">Viewing Floor</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {building.floors.map(floor => (
            <button
              key={floor.id}
              className={`floor-tab ${activeViewFloor === floor.id ? 'active' : ''}`}
              style={{ textAlign: 'left' }}
              onClick={() => setActiveViewFloor(floor.id)}
            >
              {floor.name}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>
                ({floor.nodes.length} nodes)
              </span>
            </button>
          ))}
        </div>
      </div>

      </div>{/* end scrollable */}

      {/* Sticky bottom action area */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg-card)', flexShrink: 0 }}>
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', justifyContent: 'center', padding: '7px 12px', borderRadius: 7, fontSize: 12 }}>
            {error}
          </div>
        )}
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          onClick={computePath}
          disabled={isComputing || !startNodeId || !endNodeId}
        >
          {isComputing ? '⏳ Computing…' : '🔍 Find Shortest Path'}
        </button>
        {path && (
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={clearPath}>
            ✕ Clear Path
          </button>
        )}
      </div>
    </div>
  )
}
