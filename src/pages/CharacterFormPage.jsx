import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Layout/Header'
import {
  CLASSES_DND, TENDENCIAS, RACAS, TAMANHOS, GENEROS
} from '../services/dnd35Tables'

const CAMPOS_ATRIBUTOS = [
  { key: 'for', label: 'For' },
  { key: 'des', label: 'Des' },
  { key: 'con', label: 'Con' },
  { key: 'int', label: 'Int' },
  { key: 'sab', label: 'Sab' },
  { key: 'car', label: 'Car' },
]

function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

export default function CharacterFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { db, criarPersonagem, editarPersonagem, setPersonagemAtivo } = useApp()

  const isEditing = Boolean(id)
  const personagemExistente = isEditing ? db?.personagens?.find(p => p.id === Number(id)) : null

  const [form, setForm] = useState({
    nome: '',
    classe: 'Clérigo', dominio: '',
    divindade: '', raca: 'Humano',
    idade: '', sexo: 'Masculino',
    tamanho: 'Médio', deslocamento: '30',
    for: 10, des: 10, con: 10, int: 10, sab: 10, car: 10,
    pv: 0, ca: 10,
    tendencia: 'Neutro', falha: '', personalidade: '',
    foto_base64: '',
    moeda_cobre: 0, moeda_prata: 0, moeda_ouro: 0, moeda_platina: 0,
  })

  // Lista de classes para multiclasse: [{ classe, nivel }]
  const [classes, setClasses] = useState([{ classe: 'Clérigo', nivel: 1 }])

  useEffect(() => {
    if (personagemExistente) {
      setForm({ ...form, ...personagemExistente })
      try {
        const mc = personagemExistente.multiclasses
          ? JSON.parse(personagemExistente.multiclasses)
          : [{ classe: personagemExistente.classe || 'Clérigo', nivel: personagemExistente.level || 1 }]
        setClasses(mc)
      } catch {
        setClasses([{ classe: personagemExistente.classe || 'Clérigo', nivel: personagemExistente.level || 1 }])
      }
    }
  }, [])

  const nivelTotal = classes.reduce((acc, c) => acc + (Number(c.nivel) || 0), 0)

  function setClasse(idx, key, val) {
    setClasses(prev => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c))
  }

  function adicionarClasse() {
    setClasses(prev => [...prev, { classe: 'Guerreiro', nivel: 1 }])
  }

  function removerClasse(idx) {
    setClasses(prev => prev.filter((_, i) => i !== idx))
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    set('foto_base64', b64)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const dados = {
      ...form,
      classe: classes[0]?.classe || 'Guerreiro',
      level: nivelTotal,
      multiclasses: JSON.stringify(classes),
    }
    for (const { key } of CAMPOS_ATRIBUTOS) {
      dados[key] = Number(dados[key])
    }
    dados.pv = Number(dados.pv)
    dados.ca = Number(dados.ca)

    try {
      if (isEditing) {
        await editarPersonagem(Number(id), dados)
        const atualizado = { ...personagemExistente, ...dados }
        setPersonagemAtivo(atualizado)
        navigate(`/personagem/${id}`)
      } else {
        const novo = await criarPersonagem(dados)
        setPersonagemAtivo(novo)
        navigate(`/personagem/${novo.id}`)
      }
    } catch (err) {
      console.error('Erro ao salvar personagem:', err)
      alert('Erro ao salvar. Verifique o servidor e tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0902' }}>
      <Header mostrarAcoes={false} />

      <main className="flex-1 flex flex-col items-center justify-center py-8 px-8">
        <div className="panel w-full max-w-5xl" style={{ padding: '3rem' }}>
          <h2 className="font-medieval text-2xl text-center" style={{ color: '#c9a84c', marginBottom: '2.5rem' }}>
            {isEditing ? 'Editar Personagem' : 'Criação de Personagem'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-8">

              {/* ── Coluna esquerda — Identidade ── */}
              <div className="flex flex-col gap-5" style={{ width: '42%', flexShrink: 0 }}>

                {/* Foto */}
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-sm overflow-hidden"
                    style={{ width: '140px', height: '190px', border: '2px solid #6b4a1a', background: '#0d0902' }}>
                    {form.foto_base64
                      ? <img src={form.foto_base64} alt="Perfil" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-5xl">⚔️</div>
                    }
                  </div>
                  <label className="btn-ghost text-xs cursor-pointer">
                    Escolher Foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                  </label>
                </div>

                <div className="divider-gold" />

                {/* Nome + Raça */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-medieval">Nome</label>
                    <input className="input-medieval" required value={form.nome} onChange={e => set('nome', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-medieval">Raça</label>
                    <select className="input-medieval" value={form.raca} onChange={e => set('raca', e.target.value)}>
                      {RACAS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Classes */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="label-medieval">Classe{classes.length > 1 ? 's' : ''}</label>
                    <div className="flex items-center gap-3">
                      <span className="label-medieval" style={{ color: '#9b8a6a' }}>
                        Nível Total: <span style={{ color: '#c9a84c' }}>{nivelTotal}</span>
                      </span>
                      <button type="button" onClick={adicionarClasse}
                        className="font-medieval text-xs px-2 py-0.5 rounded-sm"
                        style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid #6b4a1a', color: '#c9a84c' }}>
                        + Multiclasse
                      </button>
                    </div>
                  </div>
                  {classes.map((c, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select className="input-medieval" style={{ flex: 1, minWidth: 0, width: 'auto' }} value={c.classe}
                        onChange={e => setClasse(idx, 'classe', e.target.value)}>
                        {CLASSES_DND.map(cl => <option key={cl} value={cl}>{cl}</option>)}
                      </select>
                      <input className="input-medieval text-center" style={{ width: '64px', flexShrink: 0 }} type="number" min={1} max={20}
                        value={c.nivel} onChange={e => setClasse(idx, 'nivel', e.target.value)} />
                      {classes.length > 1 && (
                        <button type="button" onClick={() => removerClasse(idx)}
                          className="text-xs px-2 py-1 rounded-sm shrink-0"
                          style={{ background: 'rgba(180,60,60,0.15)', border: '1px solid #7a2020', color: '#e07070' }}>
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Domínio + Divindade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-medieval">Domínio</label>
                    <input className="input-medieval" placeholder="Ex: Vida, Guerra..." value={form.dominio} onChange={e => set('dominio', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-medieval">Divindade</label>
                    <input className="input-medieval" value={form.divindade} onChange={e => set('divindade', e.target.value)} />
                  </div>
                </div>

                {/* Idade + Sexo + Tamanho + Desloc */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="label-medieval">Idade</label>
                    <input className="input-medieval" type="number" min={0} value={form.idade} onChange={e => set('idade', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-medieval">Sexo</label>
                    <select className="input-medieval" value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                      {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-medieval">Tamanho</label>
                    <select className="input-medieval" value={form.tamanho} onChange={e => set('tamanho', e.target.value)}>
                      {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-medieval">Desloc.</label>
                    <input className="input-medieval" type="number" min={0} value={form.deslocamento} onChange={e => set('deslocamento', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Divisor vertical */}
              <div className="shrink-0" style={{ width: '1px', background: '#6b4a1a' }} />

              {/* ── Coluna direita — Stats & Personalidade ── */}
              <div className="flex flex-col gap-5 flex-1">

                {/* Atributos */}
                <div>
                  <label className="label-medieval mb-3 block">Atributos</label>
                  <div className="grid grid-cols-6 gap-3">
                    {CAMPOS_ATRIBUTOS.map(({ key, label }) => (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <span className="label-medieval text-center">{label}</span>
                        <input className="input-medieval text-center" type="number" min={1} max={30}
                          value={form[key]} onChange={e => set(key, e.target.value)} />
                        <span className="text-xs" style={{ color: '#9b8a6a' }}>
                          {Math.floor((Number(form[key]) - 10) / 2) >= 0 ? '+' : ''}
                          {Math.floor((Number(form[key]) - 10) / 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PV + CA */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-medieval">PV (Pontos de Vida)</label>
                    <input className="input-medieval" type="number" min={1} value={form.pv} onChange={e => set('pv', e.target.value)} />
                  </div>
                  <div>
                    <label className="label-medieval">CA (Classe de Armadura)</label>
                    <input className="input-medieval" type="number" min={0} value={form.ca} onChange={e => set('ca', e.target.value)} />
                  </div>
                </div>

                <div className="divider-gold" />

                {/* Tendência + Falha */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-medieval">Tendência</label>
                    <select className="input-medieval" value={form.tendencia} onChange={e => set('tendencia', e.target.value)}>
                      {TENDENCIAS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-medieval">Falha / Fraqueza</label>
                    <input className="input-medieval" placeholder="Ex: Ganância, Arrogância..." value={form.falha} onChange={e => set('falha', e.target.value)} />
                  </div>
                </div>

                {/* Personalidade */}
                <div className="flex-1 flex flex-col">
                  <label className="label-medieval">Personalidade</label>
                  <textarea className="input-medieval resize-none flex-1" style={{ minHeight: '120px' }}
                    placeholder="Descreva a personalidade do personagem..."
                    value={form.personalidade} onChange={e => set('personalidade', e.target.value)} />
                </div>

                {/* Botões */}
                <div className="flex gap-4 justify-end pt-2">
                  <button type="button" className="btn-ghost"
                    onClick={() => navigate(isEditing ? `/personagem/${id}` : '/personagens')}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-gold">
                    {isEditing ? 'Salvar Alterações' : 'Criar Personagem'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
