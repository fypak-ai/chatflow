import { useState, KeyboardEvent, useRef, useCallback } from 'react'
import api from '../../api/client'

interface Props {
  channelId: string
  onSend: (data: object) => void
  onTyping: () => void
  parentId?: string  // if set, this is a thread reply input
}

export default function MessageInput({ channelId, onSend, onTyping, parentId }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText('')
    try {
      if (parentId) {
        await api.post('/api/threads/reply', { parent_id: parentId, channel_id: channelId, content })
      } else {
        await api.post('/api/messages/', { channel_id: channelId, content })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadProgress('Enviando...')
    try {
      const form = new FormData()
      form.append('file', file)
      const { data: upload } = await api.post('/api/upload/', form)
      // Send message with file attachment
      await api.post('/api/messages/', {
        channel_id: channelId,
        content: '',
        file_url: upload.file_url,
        file_name: upload.file_name,
        file_type: upload.file_type,
      })
      setUploadProgress(null)
    } catch (err: any) {
      setUploadProgress(`Erro: ${err.response?.data?.detail || err.message}`)
      setTimeout(() => setUploadProgress(null), 3000)
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else {
      onTyping()
    }
  }

  const isAI = text.startsWith('@ai')
  const isCode = text.startsWith('/run')

  return (
    <div className="p-4 border-t border-gray-700">
      {uploadProgress && (
        <div className="text-xs mb-1.5 text-yellow-400 px-1">{uploadProgress}</div>
      )}
      {(isAI || isCode) && (
        <div className={`text-xs mb-1.5 px-1 ${isAI ? 'text-purple-400' : 'text-green-400'}`}>
          {isAI ? '🤖 IA vai responder' : '💻 Código será executado'}
        </div>
      )}
      <div className={`flex gap-2 rounded-xl p-2 border ${
        isAI ? 'bg-gray-700 border-purple-500/50' :
        isCode ? 'bg-gray-700 border-green-500/50' :
        'bg-gray-700 border-transparent'
      }`}>
        {!parentId && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-gray-400 hover:text-white self-end pb-1 text-lg"
            title="Anexar arquivo"
          >
            📎
          </button>
        )}
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        <textarea
          className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[36px] max-h-40 placeholder-gray-500"
          placeholder={parentId ? 'Responder na thread...' : 'Mensagem... @ai para IA, /run python para código'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-3 py-1 rounded-lg text-sm font-semibold self-end transition"
        >
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
