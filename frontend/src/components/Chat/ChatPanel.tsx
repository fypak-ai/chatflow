import { useEffect, useRef } from 'react'
import api from '../../api/client'
import { useChatStore } from '../../store/chat'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function ChatPanel({ channelId }: { channelId: string }) {
  const messages = useChatStore((s) => s.messages)
  const typingUsers = useChatStore((s) => s.typingUsers)
  const setMessages = useChatStore((s) => s.setMessages)
  const { send, sendTyping } = useWebSocket(channelId)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get(`/api/messages/channel/${channelId}`)
      .then((r) => setMessages(r.data.reverse()))
      .catch(() => {})
  }, [channelId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-3 py-1 text-xs text-gray-400 italic">
            {typingUsers.join(', ')} está digitando...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <MessageInput channelId={channelId} onSend={send} onTyping={sendTyping} />
    </div>
  )
}
