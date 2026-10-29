import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import CharacterListPage from './features/characters/CharacterListPage'
import NewCharacterPage from './features/characters/NewCharacterPage'
import SheetPage from './features/sheet/SheetPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CharacterListPage />} />
        <Route path="/personagem/novo" element={<NewCharacterPage />} />
        <Route path="/personagem/:id" element={<SheetPage />} />
        <Route path="/personagem/:id/:tab" element={<SheetPage />} />
        {/* rotas do v1 */}
        <Route path="/personagens" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
