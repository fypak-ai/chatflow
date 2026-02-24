import { create } from 'zustand'

interface Message {
  id: string
  content: string
  user_id: string
  type: string
  created_at: string
}

interface ChatState {
  messages: Message[]
  activeChannelId: string | null
  addMessage: (msg: Message) => void
  setChannel: (id: string) => void
  setMessages: (msgs: Message[]) => void
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  activeChannelId: null,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setChannel: (id) => set({ activeChannelId: id, messages: [] }),
  setMessages: (msgs) => set({ messages: msgs }),
}))
