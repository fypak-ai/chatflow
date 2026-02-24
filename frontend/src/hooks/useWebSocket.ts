import { useEffect, useRef } from 'react'
import { useChatStore } from '../store/chat'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export function useWebSocket(channelId: string | null) {
  const ws = useRef<WebSocket | null>(null)
  const addMessage = useChatStore((s) => s.addMessage)

  useEffect(() => {
    if (!channelId) return

    ws.current = new WebSocket(`${WS_URL}/ws/${channelId}`)

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      addMessage(data)
    }

    return () => {
      ws.current?.close()
    }
  }, [channelId])

  const send = (data: object) => {
    ws.current?.send(JSON.stringify(data))
  }

  return { send }
}
