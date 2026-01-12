import { Routes, Route } from 'react-router-dom'
import { OverlayProvider } from '@/components/ui/overlay'
import { HomePage } from './routes'
import { OnboardingPage } from './routes/onboarding'
import { CallPage } from './routes/training/call'
import { DebriefPage } from './routes/training/debrief'

function App() {
  return (
    <OverlayProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/training/call" element={<CallPage />} />
        <Route path="/training/debrief" element={<DebriefPage />} />
      </Routes>
    </OverlayProvider>
  )
}

export default App
