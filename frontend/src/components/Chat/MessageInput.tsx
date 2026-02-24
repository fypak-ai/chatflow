import { useState, KeyboardEvent } from 'react'
import api from '../../api/client'

interface Props {
  channelId: string
  onSend: (data: object) => void
}

export default function MessageInput({ channelId, onSend }: Props) {
  const [text, setText] = useState('')

  const handleSend = async () => {
    const content = text.trim()
    if (!content) return
    setText('')
    try {
      const { data } = await api.post('/api/messages/', { channel_id: channelId, content })
      onSend(data)
    } catch {}
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-gray-700">
      <div className="flex gap-2 bg-gray-700 rounded-lg p-2">
        <textarea
          className="flex-1 bg-transparent resize-none outline-none text-sm min-h-[36px] max-h-32"
          placeholder="Mensagem... (use @ai para acionar IA, /run python para executar código)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-sm font-semibold"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
