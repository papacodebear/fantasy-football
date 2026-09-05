import { Route, Routes } from 'react-router-dom'
import DraftRoomPage from '@/pages/DraftRoomPage'
import LandingPage from '@/pages/LandingPage'
import LeaguePage from '@/pages/LeaguePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/league/:leagueId" element={<LeaguePage />} />
      <Route path="/draft/:draftId" element={<DraftRoomPage />} />
    </Routes>
  )
}
