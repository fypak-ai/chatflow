import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Message } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import { useChatStore } from '../../store/chat'
import ReactionBar from './ReactionBar'
import api from '../../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Avatar({ label, color }: { label: string; color: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${color}`}>
      {label}
    </div>
  )
}

export default function MessageBubble({ message }: { message: Message }) {
  const myUserId = useAuthStore((s) => s.userId)
  const openThread = useChatStore((s) => s.openThread)
  const isAI = message.message_type === 'ai' || message.user_id === 'ai'
  const isBot = message.message_type === 'bot' || message.user_id === 'bot'
  const isMe = message.user_id === myUserId

  const avatarColor = isAI ? 'bg-purple-600' : isBot ? 'bg-green-600' : isMe ? 'bg-indigo-600' : 'bg-blue-600'
  const avatarLabel = isAI ? 'AI' : isBot ? 'BOT' : (message.username || message.user_id).slice(0, 2).toUpperCase()
  const displayName = isAI ? '@ai' : isBot ? 'bot' : message.username || message.user_id.slice(0, 8)

  let timeAgo = ''
  try { timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR }) } catch {}

  const isImage = message.file_type?.startsWith('image/')
  const isVideo = message.file_type?.startsWith('video/')

  return (
    <div className="group flex gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-800/50">
      <Avatar label={avatarLabel} color={avatarColor} />
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2">
          <span className={`font-semibold text-sm ${isAI ? 'text-purple-400' : isBot ? 'text-green-400' : 'text-white'}`}>
            {displayName}
          </span>
          {timeAgo && <span className="text-xs text-gray-500">{timeAgo}</span>}
        </div>

        {/* Content */}
        {message.content && (
          <div className="text-sm text-gray-200 prose prose-invert prose-sm max-w-none break-words">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* File attachment */}
        {message.file_url && (
          <div className="mt-1">
            {isImage && (
              <img
                src={`${API_URL}${message.file_url}`}
                alt={message.file_name || 'imagem'}
                className="max-w-xs max-h-48 rounded-lg object-cover cursor-pointer hover:opacity-90"
                onClick={() => window.open(`${API_URL}${message.file_url}`, '_blank')}
              />
            )}
            {isVideo && (
              <video
                src={`${API_URL}${message.file_url}`}
                controls
                className="max-w-xs rounded-lg"
              />
            )}
            {!isImage && !isVideo && (
              <a
                href={`${API_URL}${message.file_url}`}
                download={message.file_name}
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-3 py-2 text-sm transition"
              >
                <span>📎</span>
                <span className="truncate max-w-xs">{message.file_name}</span>
              </a>
            )}
          </div>
        )}

        {/* Reactions */}
        <ReactionBar message={message} />

        {/* Thread reply count */}
        {(message.reply_count ?? 0) > 0 && (
          <button
            onClick={() => openThread(message)}
            className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            {message.reply_count} resposta{message.reply_count !== 1 ? 's' : ''} →
          </button>
        )}
      </div>

      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1 flex-shrink-0 pt-1 transition">
        <button
          onClick={() => openThread(message)}
          className="text-gray-400 hover:text-white text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
          title="Responder em thread"
        >
          💬
        </button>
      </div>
    </div>
  )
}
