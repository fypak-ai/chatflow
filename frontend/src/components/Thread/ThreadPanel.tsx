import { useEffect, useState } from 'react'
import { useChatStore, Message } from '../../store/chat'
import api from '../../api/client'
import MessageInput from '../Chat/MessageInput'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuthStore } from '../../store/auth'

function ThreadMessage({ msg }: { msg: Message }) {
  const myUserId = useAuthStore((s) => s.userId)
  const isAI = msg.user_id === 'ai'
  const isMe = msg.user_id === myUserId
  let timeAgo = ''
  try { timeAgo = formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR }) } catch {}

  return (
    <div className="flex gap-2 px-3 py-1.5 hover:bg-gray-800/50 rounded">
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isAI ? 'bg-purple-600' : isMe ? 'bg-indigo-600' : 'bg-blue-600'
      }`}>
        {isAI ? 'AI' : (msg.username || msg.user_id).slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className={`font-semibold text-xs ${isAI ? 'text-purple-400' : 'text-white'}`}>
            {isAI ? '@ai' : msg.username || msg.user_id.slice(0, 8)}
          </span>
          {timeAgo && <span className="text-xs text-gray-500">{timeAgo}</span>}
        </div>
        <div className="text-sm text-gray-200 prose prose-invert prose-sm max-w-none break-words">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default function ThreadPanel() {
  const activeThread = useChatStore((s) => s.activeThread)
  const activeChannelId = useChatStore((s) => s.activeChannelId)
  const closeThread = useChatStore((s) => s.closeThread)
  const [replies, setReplies] = useState<Message[]>([])

  useEffect(() => {
    if (!activeThread) return
    api.get(`/api/threads/${activeThread.id}`)
      .then((r) => setReplies(r.data))
      .catch(() => {})
  }, [activeThread])

  if (!activeThread) return null

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="font-semibold text-sm">Thread</h3>
        <button onClick={closeThread} className="text-gray-400 hover:text-white text-lg">&times;</button>
      </div>

      {/* Original message */}
      <div className="px-3 py-3 border-b border-gray-700/50">
        <ThreadMessage msg={activeThread} />
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto py-2">
        {replies.length === 0 ? (
          <p className="text-xs text-gray-500 px-4 py-2">Sem respostas ainda</p>
        ) : (
          replies.map((r) => <ThreadMessage key={r.id} msg={r} />)
        )}
      </div>

      {/* Reply input */}
      <MessageInput
        channelId={activeChannelId!}
        onSend={() => {}}
        onTyping={() => {}}
        parentId={activeThread.id}
      />
    </div>
  )
}
