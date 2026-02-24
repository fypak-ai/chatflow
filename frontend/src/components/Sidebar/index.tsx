import { useEffect, useState } from 'react'
import api from '../../api/client'
import { useChatStore } from '../../store/chat'

interface Channel {
  id: string
  name: string
  type: string
}

export default function Sidebar({ workspaceId }: { workspaceId: string }) {
  const [channels, setChannels] = useState<Channel[]>([])
  const setChannel = useChatStore((s) => s.setChannel)
  const activeChannelId = useChatStore((s) => s.activeChannelId)

  useEffect(() => {
    api.get(`/api/channels/workspace/${workspaceId}`)
      .then((r) => setChannels(r.data))
      .catch(() => {})
  }, [workspaceId])

  return (
    <aside className="w-64 bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="font-bold text-lg">ChatFlow</h2>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-1">Canais</p>
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className={`w-full text-left px-3 py-1.5 rounded text-sm transition ${
              activeChannelId === ch.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            # {ch.name}
          </button>
        ))}
      </nav>
    </aside>
  )
}
