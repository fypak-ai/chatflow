import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/Chat/ChatPanel'
import UserList from '../components/UserList'
import { useChatStore } from '../store/chat'

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const activeChannelId = useChatStore((s) => s.activeChannelId)

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <Sidebar workspaceId={workspaceId!} />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeChannelId ? (
          <ChatPanel channelId={activeChannelId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Selecione um canal para começar</p>
          </div>
        )}
      </main>

      {/* Online users panel */}
      {activeChannelId && <UserList channelId={activeChannelId} />}
    </div>
  )
}
