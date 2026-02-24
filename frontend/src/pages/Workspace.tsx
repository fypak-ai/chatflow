import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/Chat/ChatPanel'
import UserList from '../components/UserList'
import ThreadPanel from '../components/Thread/ThreadPanel'
import { useChatStore } from '../store/chat'

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const activeChannelId = useChatStore((s) => s.activeChannelId)
  const activeThread = useChatStore((s) => s.activeThread)

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar workspaceId={workspaceId!} />

      <main className="flex-1 flex min-w-0">
        {/* Main chat */}
        <div className={`flex flex-col ${activeThread ? 'flex-1' : 'flex-1'}`}>
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
        </div>

        {/* Thread panel */}
        {activeThread && (
          <div className="w-80 border-l border-gray-700 flex-shrink-0">
            <ThreadPanel />
          </div>
        )}
      </main>

      {!activeThread && activeChannelId && <UserList channelId={activeChannelId} />}
    </div>
  )
}
