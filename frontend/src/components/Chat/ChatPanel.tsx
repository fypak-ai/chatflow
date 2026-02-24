import { useEffect, useRef } from 'react'
import api from '../../api/client'
import { useChatStore } from '../../store/chat'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import { useWebSocket } from '../../hooks/useWebSocket'

export default function ChatPanel({ channelId }: { channelId: string }) {
  const messages = useChatStore((s) => s.messages)
  const setMessages = useChatStore((s) => s.setMessages)
  const { send } = useWebSocket(channelId)
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
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput channelId={channelId} onSend={send} />
    </div>
  )
}
