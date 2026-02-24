import { useState, KeyboardEvent, useRef, useCallback } from 'react'
import api from '../../api/client'

interface Props {
  channelId: string
  onSend: (data: object) => void
  onTyping: () => void
}

export default function MessageInput({ channelId, onSend, onTyping }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const typingRef = useRef<NodeJS.Timeout | null>(null)

  const handleTyping = useCallback(() => {
    onTyping()
  }, [onTyping])

  const handleSend = async () => {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText('')
    try {
      await api.post('/api/messages/', { channel_id: channelId, content })
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else {
      handleTyping()
    }
  }

  const isAI = text.startsWith('@ai')
  const isCode = text.startsWith('/run')

  return (
    <div className="p-4 border-t border-gray-700">
      {/* Command hint */}
      {(isAI || isCode) && (
        <div className={`text-xs mb-1.5 px-1 ${
          isAI ? 'text-purple-400' : 'text-green-400'
        }`}>
          {isAI ? '🤖 IA vai responder' : '💻 Código será executado'}
        </div>
      )}
      <div className={`flex gap-2 rounded-xl p-2 border ${
        isAI ? 'bg-gray-700 border-purple-500/50' :
        isCode ? 'bg-gray-700 border-green-500/50' :
        'bg-gray-700 border-transparent'
      }`}>
        <textarea
          className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[36px] max-h-40 placeholder-gray-500"
          placeholder="Mensagem... @ai para IA, /run python para código (Shift+Enter = nova linha)"
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
