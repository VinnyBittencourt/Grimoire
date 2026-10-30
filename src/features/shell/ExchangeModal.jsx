import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { useToast } from '../../ui/Toast'
import { useImport } from '../../queries/characters'
import { api, downloadJson } from '../../api/client'

/**
 * Import/export de personagens. characterId presente → mostra também as opções de export.
 */
export function ExchangeModal({ open, onClose, characterId }) {
  const { t } = useLang()
  const toast = useToast()
  const navigate = useNavigate()
  const importer = useImport()
  const fileRef = useRef(null)
  const [kind, setKind] = useState('grimoire')
  const [report, setReport] = useState(null)

  async function run(fn) {
    try { await fn() } catch (e) { toast.error(e.message) }
  }

  function pick(k) {
    setKind(k)
    fileRef.current.value = ''
    fileRef.current.click()
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    let data
    try { data = JSON.parse(await file.text()) } catch { toast.error(t('exchange.invalidFile')); return }
    run(async () => {
      const sheet = await importer.mutateAsync({ kind, data })
      toast.success(t('exchange.imported', { name: sheet.name }))
      const notes = sheet._import
      if (notes && (notes.report.length || notes.extraCount || notes.counts)) {
        setReport({ id: sheet.id, ...notes })
      } else {
        onClose()
        navigate(`/personagem/${sheet.id}`)
      }
    })
  }

  return (
    <Modal open={open} onClose={() => { setReport(null); onClose() }} title={t('exchange.title')} width={520} closeOnBackdrop>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      {report ? (
        <div className="flex flex-col gap-3">
          <h3 className="section-title m-0">{t('exchange.importReport')}</h3>
          <ul className="text-body text-xs list-disc pl-5 m-0">
            {report.counts && <li>{t('exchange.importCounts', report.counts)}</li>}
            {report.report.map(line => <li key={line}>{line}</li>)}
            {report.extraCount > 0 && <li>{t('exchange.unknownKept', { n: report.extraCount })}</li>}
          </ul>
          <Button variant="gold" onClick={() => { const rid = report.id; setReport(null); onClose(); navigate(`/personagem/${rid}`) }}>
            {t('common.confirm')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {characterId && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => run(() => downloadJson(`/api/characters/${characterId}/export`))}>{t('exchange.exportGrimoire')}</Button>
                <Button className="flex-1" onClick={() => run(() => downloadJson(`/api/characters/${characterId}/export/roll20`))}>{t('exchange.exportRoll20')}</Button>
              </div>
              <div className="divider-gold my-2" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Button onClick={() => pick('grimoire')} disabled={importer.isPending}>{t('exchange.importGrimoire')}</Button>
            <p className="text-dim text-[11px] m-0">{t('exchange.grimoireHint')}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button onClick={() => pick('roll20')} disabled={importer.isPending}>{t('exchange.importRoll20')}</Button>
            <p className="text-dim text-[11px] m-0">{t('exchange.roll20Hint')}</p>
          </div>
          <div className="divider-gold" />
          <Button variant="subtle" size="sm" onClick={() => run(async () => {
            const { file } = await api.post('/api/backup')
            toast.success(t('exchange.backupDone', { file: file.split(/[\\/]/).pop() }))
          })}>{t('exchange.backup')}</Button>
        </div>
      )}
    </Modal>
  )
}
