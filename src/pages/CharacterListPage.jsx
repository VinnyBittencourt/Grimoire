import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Layout/Header'

export default function CharacterListPage() {
  const navigate = useNavigate()
  const { db, setPersonagemAtivo, excluirPersonagem } = useApp()
  const personagens = db?.personagens || []

  function handleSelecionar(p) {
    setPersonagemAtivo(p)
    navigate(`/personagem/${p.id}`)
  }

  async function handleExcluir(e, id) {
    e.stopPropagation()
    if (confirm('Excluir este personagem permanentemente?')) {
      await excluirPersonagem(id)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0902' }}>
      <Header mostrarAcoes={false} />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Painel principal */}
        <div className="panel w-full max-w-2xl p-8">
          <h2 className="font-medieval text-3xl text-center mb-8" style={{ color: '#c9a84c' }}>
            Personagens
          </h2>

          {/* Lista */}
          <div className="flex flex-col gap-4 mb-8">
            {personagens.length === 0 ? (
              <p className="text-center text-sm" style={{ color: '#6b5a3a' }}>
                Nenhum personagem criado ainda.
              </p>
            ) : (
              personagens.map(p => (
                <div key={p.id}
                  className="character-card flex items-center gap-4 p-4 cursor-pointer rounded-sm"
                  onClick={() => handleSelecionar(p)}>
                  {/* Foto */}
                  <div className="shrink-0 rounded-sm overflow-hidden"
                    style={{ width: '80px', height: '112px', border: '1px solid #6b4a1a', background: '#0d0902' }}>
                    {p.foto_base64
                      ? <img src={p.foto_base64} alt={p.nome} className="w-full h-full object-cover object-top" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">⚔️</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medieval text-base font-bold truncate" style={{ color: '#f0e6c8', letterSpacing: '0.02em' }}>
                      {p.nome}
                    </p>
                    <p className="font-medieval text-xs mt-1" style={{ color: '#c9a84c' }}>
                      Nível {p.level}
                    </p>
                    <p className="text-xs mt-1 truncate" style={{ color: '#9b8a6a' }}>
                      {(() => {
                        try {
                          const mc = p.multiclasses ? JSON.parse(p.multiclasses) : null
                          if (mc && mc.length > 1) return mc.map(c => `${c.classe} ${c.nivel}`).join(' / ')
                        } catch {}
                        return p.classe
                      })()}

                    </p>
                  </div>

                  {/* Lixeira */}
                  <button
                    className="btn-danger shrink-0 text-lg px-2"
                    onClick={(e) => handleExcluir(e, p.id)}
                    title="Excluir personagem">
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Botão criar */}
          <div className="flex justify-center">
            <button className="btn-gold" onClick={() => navigate('/personagem/novo')}>
              + Criar Novo Personagem
            </button>
          </div>
        </div>
      </main>

      <footer className="pb-4 text-center">
        <p className="font-medieval text-s tracking-widest" style={{ color: '#6b5a3a' }}>
          Criado por Vinny Bittencourt
        </p>
      </footer>
    </div>
  )
}
