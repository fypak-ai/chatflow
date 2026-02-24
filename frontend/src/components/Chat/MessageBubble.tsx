import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  user_id: string
  type: string
  created_at: string
}

export default function MessageBubble({ message }: { message: Message }) {
  const isAI = message.type === 'ai'
  const isBot = message.type === 'bot'

  return (
    <div className="flex gap-3 px-2 py-1 hover:bg-gray-800 rounded group">
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isAI ? 'bg-purple-600' : isBot ? 'bg-green-600' : 'bg-indigo-600'
      }`}>
        {isAI ? 'AI' : isBot ? 'B' : message.user_id.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm">
            {isAI ? '@ai' : isBot ? 'bot' : message.user_id.slice(0, 8)}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        <div className="text-sm text-gray-200 prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
