import { create } from 'zustand'

export interface Reactions {
  [emoji: string]: number
}

export interface Message {
  id: string
  content: string
  user_id: string
  username?: string
  message_type: string
  created_at: string
  parent_id?: string | null
  file_url?: string | null
  file_name?: string | null
  file_type?: string | null
  reactions?: Reactions
  reply_count?: number
}

interface ChatState {
  messages: Message[]
  activeChannelId: string | null
  activeThread: Message | null  // message whose thread is open
  onlineUsers: string[]
  typingUsers: string[]
  addMessage: (msg: Message) => void
  setChannel: (id: string) => void
  setMessages: (msgs: Message[]) => void
  setOnlineUsers: (users: string[]) => void
  addTypingUser: (userId: string) => void
  removeTypingUser: (userId: string) => void
  updateReactions: (messageId: string, reactions: Reactions) => void
  openThread: (msg: Message) => void
  closeThread: () => void
  incrementReplyCount: (parentId: string) => void
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  activeChannelId: null,
  activeThread: null,
  onlineUsers: [],
  typingUsers: [],
  addMessage: (msg) =>
    set((s) => ({
      messages: msg.parent_id
        ? s.messages  // thread replies don't go into main feed
        : [...s.messages, msg],
    })),
  setChannel: (id) =>
    set({ activeChannelId: id, messages: [], onlineUsers: [], typingUsers: [], activeThread: null }),
  setMessages: (msgs) => set({ messages: msgs }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addTypingUser: (userId) =>
    set((s) => ({
      typingUsers: s.typingUsers.includes(userId) ? s.typingUsers : [...s.typingUsers, userId],
    })),
  removeTypingUser: (userId) =>
    set((s) => ({ typingUsers: s.typingUsers.filter((u) => u !== userId) })),
  updateReactions: (messageId, reactions) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, reactions } : m
      ),
    })),
  openThread: (msg) => set({ activeThread: msg }),
  closeThread: () => set({ activeThread: null }),
  incrementReplyCount: (parentId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === parentId ? { ...m, reply_count: (m.reply_count || 0) + 1 } : m
      ),
    })),
}))
