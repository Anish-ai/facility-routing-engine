'use client'
import TopBar from '@/components/shared/TopBar'
import PathControls from '@/components/navigate/PathControls'
import MapViewer from '@/components/navigate/MapViewer'
import StepList from '@/components/navigate/StepList'

export default function NavigatePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar title="Navigation" />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <PathControls />
        <MapViewer />
        <StepList />
      </div>
    </div>
  )
}
