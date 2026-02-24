import { create } from 'zustand'

export interface Message {
  id: string
  content: string
  user_id: string
  username?: string
  message_type: string
  created_at: string
}

interface ChatState {
  messages: Message[]
  activeChannelId: string | null
  onlineUsers: string[]
  typingUsers: string[]
  addMessage: (msg: Message) => void
  setChannel: (id: string) => void
  setMessages: (msgs: Message[]) => void
  setOnlineUsers: (users: string[]) => void
  addTypingUser: (userId: string) => void
  removeTypingUser: (userId: string) => void
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  activeChannelId: null,
  onlineUsers: [],
  typingUsers: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setChannel: (id) => set({ activeChannelId: id, messages: [], onlineUsers: [], typingUsers: [] }),
  setMessages: (msgs) => set({ messages: msgs }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addTypingUser: (userId) =>
    set((s) => ({
      typingUsers: s.typingUsers.includes(userId) ? s.typingUsers : [...s.typingUsers, userId],
    })),
  removeTypingUser: (userId) =>
    set((s) => ({ typingUsers: s.typingUsers.filter((u) => u !== userId) })),
}))
