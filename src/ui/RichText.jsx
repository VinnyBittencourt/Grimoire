import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import DOMPurify from 'dompurify'
import { useLang } from '../i18n'

const COLORS = ['#f0e6c8', '#c9a84c', '#e74c3c', '#e67e22', '#27ae60', '#5a9ad9', '#a07ad9', '#9b8a6a']
const AUTOSAVE_MS = 1500
// DOMPurify só funciona com DOM (no Node, ex. testes de renderização, `sanitize` não existe)
const clean = html => (typeof DOMPurify.sanitize === 'function' ? DOMPurify.sanitize(html ?? '') : html ?? '')

/**
 * Editor de texto rico (TipTap) para notas de sessão e história.
 * Salva sozinho 1,5 s após parar de digitar, ao sair do editor e com Ctrl+S.
 * O HTML vindo do banco é sanitizado (DOMPurify) antes de entrar no editor.
 * `docKey` troca o documento editado (ex.: ao selecionar outra nota).
 * Só salva se houve edição: o getHTML() do TipTap normaliza o HTML, e sem essa checagem um
 * simples foco/blur regravaria notas antigas (v1) com outro markup.
 */
export function RichText({ value, onSave, docKey, placeholder, className = '' }) {
  const { t } = useLang()
  const last = useRef(value ?? '')
  const timer = useRef(null)
  const onSaveRef = useRef(onSave)
  useEffect(() => { onSaveRef.current = onSave })
  const dirty = useRef(false)
  // onSave do documento que foi editado: ao trocar de nota, a edição pendente vai para a nota certa
  const saveTarget = useRef(null)

  const flush = editor => {
    clearTimeout(timer.current)
    if (!dirty.current) return
    dirty.current = false
    const html = editor.isEmpty ? '' : editor.getHTML()
    if (html !== last.current) {
      last.current = html
      saveTarget.current?.(html || null)
    }
  }

  const editor = useEditor({
    // v3 não re-renderiza por transação por padrão: sem isso a barra (negrito ativo etc.) congela
    shouldRerenderOnTransaction: true,
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), TextStyle, Color],
    content: clean(value),
    editorProps: {
      attributes: { class: 'ProseMirror min-h-[240px] px-1', 'aria-label': placeholder ?? '', role: 'textbox', 'aria-multiline': 'true' },
      handleKeyDown: (view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault()
          if (editorRef.current) flush(editorRef.current)
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      dirty.current = true
      saveTarget.current = onSaveRef.current
      clearTimeout(timer.current)
      timer.current = setTimeout(() => flush(ed), AUTOSAVE_MS)
    },
    onBlur: ({ editor: ed }) => flush(ed),
  })
  const editorRef = useRef(null)
  useEffect(() => { editorRef.current = editor }, [editor])

  // Troca de documento: salva o anterior (ainda está no editor) e carrega o novo
  useEffect(() => {
    if (!editor) return
    flush(editor)
    last.current = value ?? ''
    editor.commands.setContent(clean(value), { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, docKey])

  useEffect(() => () => { if (editorRef.current) flush(editorRef.current) }, []) // salva ao desmontar

  if (!editor) return null
  const btn = (label, active, run, glyph) => (
    <button type="button" title={label} aria-label={label} aria-pressed={active} onMouseDown={e => e.preventDefault()} onClick={run}
      className={`min-w-7 h-7 px-1.5 rounded-sm text-xs cursor-pointer ${active ? 'bg-gold-faint text-gold' : 'text-muted hover:text-parchment'}`}>{glyph}</button>
  )
  const chain = () => editor.chain().focus()

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-subtle pb-1 mb-2" role="toolbar">
        {btn(t('editor.bold'), editor.isActive('bold'), () => chain().toggleBold().run(), <b>B</b>)}
        {btn(t('editor.italic'), editor.isActive('italic'), () => chain().toggleItalic().run(), <i>I</i>)}
        {btn(t('editor.underline'), editor.isActive('underline'), () => chain().toggleUnderline().run(), <u>U</u>)}
        {btn(t('editor.strike'), editor.isActive('strike'), () => chain().toggleStrike().run(), <s>S</s>)}
        <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
        {btn(t('editor.h2'), editor.isActive('heading', { level: 2 }), () => chain().toggleHeading({ level: 2 }).run(), 'H2')}
        {btn(t('editor.h3'), editor.isActive('heading', { level: 3 }), () => chain().toggleHeading({ level: 3 }).run(), 'H3')}
        {btn(t('editor.bullet'), editor.isActive('bulletList'), () => chain().toggleBulletList().run(), '•')}
        {btn(t('editor.ordered'), editor.isActive('orderedList'), () => chain().toggleOrderedList().run(), '1.')}
        {btn(t('editor.quote'), editor.isActive('blockquote'), () => chain().toggleBlockquote().run(), '❝')}
        {btn(t('editor.hr'), false, () => chain().setHorizontalRule().run(), '―')}
        <span className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
        {COLORS.map(c => (
          <button key={c} type="button" title={`${t('editor.color')} ${c}`} aria-label={`${t('editor.color')} ${c}`}
            onMouseDown={e => e.preventDefault()} onClick={() => chain().setColor(c).run()}
            className="w-4 h-4 rounded-full border border-subtle cursor-pointer mx-0.5" style={{ background: c }} />
        ))}
        {btn(t('editor.clear'), false, () => chain().unsetAllMarks().clearNodes().run(), '⌫')}
        <span className="flex-1" />
        <span className="text-dim text-[10px]">{t('editor.saveHint')}</span>
      </div>
      <div className="prose-grimoire flex-1 min-h-0 overflow-y-auto relative">
        {editor.isEmpty && placeholder && <span className="absolute top-0 left-1 text-dim pointer-events-none">{placeholder}</span>}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
