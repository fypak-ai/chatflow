import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import { useChatStore } from '../../store/chat'
import { useAuthStore } from '../../store/auth'
import CreateChannelModal from './CreateChannelModal'

interface Channel {
  id: string
  name: string
  type: string
}

export default function Sidebar({ workspaceId }: { workspaceId: string }) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [dms, setDms] = useState<Channel[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const setChannel = useChatStore((s) => s.setChannel)
  const activeChannelId = useChatStore((s) => s.activeChannelId)
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()

  const fetchChannels = () => {
    api.get(`/api/channels/workspace/${workspaceId}`)
      .then((r) => setChannels(r.data.filter((c: Channel) => c.type !== 'dm')))
      .catch(() => {})
    api.get(`/api/dm/workspace/${workspaceId}`)
      .then((r) => setDms(r.data))
      .catch(() => {})
  }

  useEffect(() => { fetchChannels() }, [workspaceId])

  return (
    <>
      <aside className="w-64 bg-gray-800 flex flex-col border-r border-gray-700 flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">ChatFlow</h2>
          <p className="text-xs text-gray-400 truncate">@{username}</p>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {/* Channels */}
          <div className="flex items-center justify-between px-2 mb-1 mt-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Canais</span>
            <button onClick={() => setShowCreate(true)} className="text-gray-400 hover:text-white text-lg leading-none" title="Criar canal">+</button>
          </div>
          {channels.map((ch) => (
            <button key={ch.id} onClick={() => setChannel(ch.id)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition flex items-center gap-1.5 ${
                activeChannelId === ch.id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="opacity-60">#</span>{ch.name}
            </button>
          ))}
          {channels.length === 0 && <p className="text-xs text-gray-500 px-2 py-1">Nenhum canal</p>}

          {/* DMs */}
          <div className="px-2 mb-1 mt-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Mensagens diretas</span>
          </div>
          {dms.map((dm) => (
            <button key={dm.id} onClick={() => setChannel(dm.id)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition flex items-center gap-1.5 ${
                activeChannelId === dm.id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="opacity-60">@</span>{dm.name.replace('dm-', '')}
            </button>
          ))}
          {dms.length === 0 && <p className="text-xs text-gray-500 px-2 py-1">Nenhum DM</p>}
        </nav>

        {/* Hints */}
        <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-700">
          <p><kbd className="bg-gray-700 px-1 rounded">@ai</kbd> para IA &nbsp; <kbd className="bg-gray-700 px-1 rounded">/run py</kbd> código</p>
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
              {username?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm truncate">{username}</span>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} className="text-gray-400 hover:text-white text-xs">Sair</button>
        </div>
      </aside>

      {showCreate && (
        <CreateChannelModal
          workspaceId={workspaceId}
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchChannels(); setShowCreate(false) }}
        />
      )}
    </>
  )
}
