import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '../store/chat'
import { useAuthStore } from '../store/auth'

// Derive WS URL from API URL: https://... -> wss://..., http://... -> ws://...
function getWsUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return apiUrl.replace(/^https/, 'wss').replace(/^http/, 'ws')
}

export function useWebSocket(channelId: string | null) {
  const ws = useRef<WebSocket | null>(null)
  const {
    addMessage, setOnlineUsers, addTypingUser, removeTypingUser,
    updateReactions, incrementReplyCount,
  } = useChatStore()
  const token = useAuthStore((s) => s.token)
  const typingTimeout = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    if (!channelId || !token) return

    const wsUrl = getWsUrl()
    ws.current = new WebSocket(`${wsUrl}/ws/${channelId}?token=${token}`)

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'init':
          setOnlineUsers(data.online_users || [])
          break
        case 'presence': {
          const store = useChatStore.getState()
          if (data.status === 'online') {
            setOnlineUsers([...new Set([...store.onlineUsers, data.user_id])])
          } else {
            setOnlineUsers(store.onlineUsers.filter((u: string) => u !== data.user_id))
          }
          break
        }
        case 'typing':
          addTypingUser(data.user_id)
          clearTimeout(typingTimeout.current[data.user_id])
          typingTimeout.current[data.user_id] = setTimeout(
            () => removeTypingUser(data.user_id), 3000,
          )
          break
        case 'message':
          addMessage(data)
          if (data.parent_id) incrementReplyCount(data.parent_id)
          break
        case 'thread_reply':
          incrementReplyCount(data.parent_id)
          break
        case 'reaction_update':
          updateReactions(data.message_id, data.reactions)
          break
      }
    }

    ws.current.onerror = (e) => console.error('WS error', e)
    return () => ws.current?.close()
  }, [channelId, token])

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  const sendTyping = useCallback(() => send({ type: 'typing' }), [send])

  return { send, sendTyping }
}
