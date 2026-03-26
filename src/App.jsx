import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import IntroPage from './pages/IntroPage'
import CharacterListPage from './pages/CharacterListPage'
import CharacterFormPage from './pages/CharacterFormPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/personagens" element={<CharacterListPage />} />
          <Route path="/personagem/novo" element={<CharacterFormPage />} />
          <Route path="/personagem/:id" element={<DashboardPage />} />
          <Route path="/personagem/:id/editar" element={<CharacterFormPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
