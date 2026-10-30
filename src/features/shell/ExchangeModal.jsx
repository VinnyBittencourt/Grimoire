import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { useImport } from '../../queries/characters'
import { api, downloadJson } from '../../api/client'

/**
 * Arquivos: exportar esta ficha (Grimoire / Roll20), importar (cria personagem novo) e backup.
 * characterId presente → mostra também as opções de export. Depois de um import com observações,
 * mostra o relatório em três grupos (importado / revise à mão / guardado).
 */
export function ExchangeModal({ open, onClose, characterId }) {
  const { t } = useLang()
  const toast = useToast()
  const navigate = useNavigate()
  const importer = useImport()
  const fileRef = useRef(null)
  const [kind, setKind] = useState('grimoire')
  const [report, setReport] = useState(null)
  const [fileName, setFileName] = useState('')

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
    setFileName(file.name)
    let data
    try { data = JSON.parse(await file.text()) } catch { toast.error(t('exchange.invalidFile')); return }
    run(async () => {
      const sheet = await importer.mutateAsync({ kind, data })
      toast.success(t('exchange.imported', { name: sheet.name }))
      const notes = sheet._import
      if (notes && (notes.report.length || notes.extraCount || notes.counts)) {
        setReport({ id: sheet.id, name: sheet.name, ...notes })
      } else {
        onClose()
        navigate(`/personagem/${sheet.id}`)
      }
    })
  }

  const close = () => { setReport(null); onClose() }
  const openImported = () => { const rid = report.id; close(); navigate(`/personagem/${rid}`) }
  const download = (url, label) => run(async () => { await downloadJson(url); toast.success(t('exchange.downloaded', { name: label })) })

  return (
    <Modal open={open} onClose={close} closeOnBackdrop={!report} width={600}
      title={report ? t('exchange.reportTitle', { name: report.name }) : t('exchange.title')}
      footer={report && <>
        <Button variant="subtle" onClick={close}>{t('common.close')}</Button>
        <Button variant="gold" data-autofocus onClick={openImported}><Icon name="chevronRight" size={15} />{t('exchange.openSheet')}</Button>
      </>}>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" tabIndex={-1} aria-hidden onChange={onFile} />
      {report ? <ImportReport report={report} /> : (
        <div className="flex flex-col gap-5">
          {characterId && (
            <section aria-labelledby="exchange-export">
              <h3 id="exchange-export" className="section-title mt-0 mb-2">{t('exchange.exportTitle')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <ExportCard icon="scroll" title={t('exchange.grimoireFile')} text={t('exchange.grimoireExportHint')}
                  onClick={() => download(`/api/characters/${characterId}/export`, 'Grimoire')} />
                <ExportCard icon="dice" title={t('exchange.roll20File')} text={t('exchange.roll20Missing')}
                  warn={t('exchange.roll20Untested')} onClick={() => download(`/api/characters/${characterId}/export/roll20`, 'Roll20')} />
              </div>
            </section>
          )}
          <section aria-labelledby="exchange-import">
            <h3 id="exchange-import" className="section-title mt-0 mb-1">{t('exchange.importTitle')}</h3>
            <p className="caption mt-0 mb-2">{t('exchange.importNew')}</p>
            {importer.isPending ? (
              <p className="flex items-center gap-2 text-sm text-gold m-0 py-2" role="status"><Icon name="hourglass" className="animate-pulse" />{t('exchange.importing', { file: fileName })}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => pick('grimoire')} className="flex flex-col items-start gap-1 rounded-sm border border-wood bg-sunken p-3 text-left cursor-pointer hover:border-gold hover:bg-gold-faint">
                  <span className="inline-flex items-center gap-2 font-display text-gold text-sm"><Icon name="upload" size={15} />{t('exchange.importGrimoire')}</span>
                  <span className="caption">{t('exchange.grimoireHint')}</span>
                </button>
                <button type="button" onClick={() => pick('roll20')} className="flex flex-col items-start gap-1 rounded-sm border border-wood bg-sunken p-3 text-left cursor-pointer hover:border-gold hover:bg-gold-faint">
                  <span className="inline-flex items-center gap-2 font-display text-gold text-sm"><Icon name="upload" size={15} />{t('exchange.importRoll20')}</span>
                  <span className="caption">{t('exchange.roll20Hint')}</span>
                </button>
              </div>
            )}
          </section>
          <section aria-labelledby="exchange-safety" className="pt-4 border-t border-subtle">
            <h3 id="exchange-safety" className="section-title mt-0 mb-2">{t('exchange.safetyTitle')}</h3>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => run(async () => {
                const { file } = await api.post('/api/backup')
                toast.success(t('exchange.backupDone', { file: file.split(/[\\/]/).pop() }))
              })}><Icon name="shield" size={14} />{t('exchange.backup')}</Button>
              <span className="caption">{t('exchange.backupHint')}</span>
            </div>
          </section>
        </div>
      )}
    </Modal>
  )
}

function ExportCard({ icon, title, text, warn, onClick }) {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-2 rounded-sm border border-wood bg-sunken p-3">
      <span className="inline-flex items-center gap-2 font-display text-gold text-sm"><Icon name={icon} size={16} />{title}</span>
      <p className="caption m-0 flex-1">{text}</p>
      {warn && <Notice tone="warn" compact>{warn}</Notice>}
      <Button size="sm" onClick={onClick} className="self-start"><Icon name="download" size={14} />{t('exchange.download')}</Button>
    </div>
  )
}

// Relatório do import em três grupos, a partir das contagens que o servidor já devolve
function ImportReport({ report }) {
  const { t } = useLang()
  const c = report.counts
  return (
    <div className="flex flex-col gap-3">
      <Notice tone="success" title={t('exchange.groupImported')}>
        {c ? t('exchange.importedCounts', { read: c.read, derived: c.derived, total: c.total }) : t('exchange.importedPlain')}
      </Notice>
      {report.report.length > 0 && (
        <Notice tone="warn" title={t('exchange.groupReview', { n: report.report.length })}>
          <ul className="m-0 mt-1 pl-4 list-disc flex flex-col gap-1">
            {report.report.map(line => <li key={line}>{line}</li>)}
          </ul>
        </Notice>
      )}
      {(report.extraCount > 0 || c?.preserved > 0) && (
        <Notice tone="info" title={t('exchange.groupKept')}>
          {t('exchange.keptCounts', { n: c?.preserved ?? report.extraCount })}
          {c?.empty > 0 && <span className="block mt-1 text-muted">{t('exchange.emptyCounts', { n: c.empty })}</span>}
        </Notice>
      )}
    </div>
  )
}
