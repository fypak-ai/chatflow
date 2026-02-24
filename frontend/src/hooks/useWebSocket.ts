import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '../store/chat'
import { useAuthStore } from '../store/auth'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export function useWebSocket(channelId: string | null) {
  const ws = useRef<WebSocket | null>(null)
  const { addMessage, setOnlineUsers, addTypingUser, removeTypingUser } = useChatStore()
  const token = useAuthStore((s) => s.token)
  const typingTimeout = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    if (!channelId || !token) return

    // Attach JWT token as query param
    ws.current = new WebSocket(`${WS_URL}/ws/${channelId}?token=${token}`)

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'init') {
        setOnlineUsers(data.online_users || [])
        return
      }

      if (data.type === 'presence') {
        // Update online users list
        const store = useChatStore.getState()
        if (data.status === 'online') {
          setOnlineUsers([...new Set([...store.onlineUsers, data.user_id])])
        } else {
          setOnlineUsers(store.onlineUsers.filter((u) => u !== data.user_id))
        }
        return
      }

      if (data.type === 'typing') {
        addTypingUser(data.user_id)
        clearTimeout(typingTimeout.current[data.user_id])
        typingTimeout.current[data.user_id] = setTimeout(() => {
          removeTypingUser(data.user_id)
        }, 3000)
        return
      }

      if (data.type === 'message') {
        addMessage(data)
      }
    }

    ws.current.onerror = (e) => console.error('WS error', e)

    return () => {
      ws.current?.close()
    }
  }, [channelId, token])

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const sendTyping = useCallback(() => {
    send({ type: 'typing' })
  }, [send])

  return { send, sendTyping }
}
