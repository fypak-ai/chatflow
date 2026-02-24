import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Message } from '../../store/chat'
import { useAuthStore } from '../../store/auth'

function Avatar({ label, color }: { label: string; color: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${color}`}>
      {label}
    </div>
  )
}

export default function MessageBubble({ message }: { message: Message }) {
  const myUserId = useAuthStore((s) => s.userId)
  const isAI = message.message_type === 'ai' || message.user_id === 'ai'
  const isBot = message.message_type === 'bot' || message.user_id === 'bot'
  const isCode = message.message_type === 'code'
  const isMe = message.user_id === myUserId

  const avatarColor = isAI
    ? 'bg-purple-600'
    : isBot
    ? 'bg-green-600'
    : isMe
    ? 'bg-indigo-600'
    : 'bg-blue-600'

  const avatarLabel = isAI ? 'AI' : isBot ? 'BOT' : (message.username || message.user_id).slice(0, 2).toUpperCase()
  const displayName = isAI ? '@ai' : isBot ? 'bot' : message.username || message.user_id.slice(0, 8)

  let timeAgo = ''
  try {
    timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })
  } catch {}

  return (
    <div className={`flex gap-3 px-2 py-1.5 rounded-lg group hover:bg-gray-800/50 ${
      isMe ? 'flex-row' : ''
    }`}>
      <Avatar label={avatarLabel} color={avatarColor} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`font-semibold text-sm ${isAI ? 'text-purple-400' : isBot ? 'text-green-400' : 'text-white'}`}>
            {displayName}
          </span>
          {timeAgo && <span className="text-xs text-gray-500">{timeAgo}</span>}
        </div>
        <div className="text-sm text-gray-200 prose prose-invert prose-sm max-w-none break-words">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
