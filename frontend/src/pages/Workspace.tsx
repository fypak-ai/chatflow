import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/Chat/ChatPanel'
import { useChatStore } from '../store/chat'

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const activeChannelId = useChatStore((s) => s.activeChannelId)

  return (
    <div className="flex h-screen">
      <Sidebar workspaceId={workspaceId!} />
      <main className="flex-1 flex flex-col">
        {activeChannelId
          ? <ChatPanel channelId={activeChannelId} />
          : <div className="flex-1 flex items-center justify-center text-gray-500">Selecione um canal</div>
        }
      </main>
    </div>
  )
}
