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
  const [showCreate, setShowCreate] = useState(false)
  const setChannel = useChatStore((s) => s.setChannel)
  const activeChannelId = useChatStore((s) => s.activeChannelId)
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()

  const fetchChannels = () =>
    api.get(`/api/channels/workspace/${workspaceId}`)
      .then((r) => setChannels(r.data))
      .catch(() => {})

  useEffect(() => { fetchChannels() }, [workspaceId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <aside className="w-64 bg-gray-800 flex flex-col border-r border-gray-700 flex-shrink-0">
        {/* Workspace header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-lg">ChatFlow</h2>
          <p className="text-xs text-gray-400 truncate">@{username}</p>
        </div>

        {/* Channels */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Canais</span>
            <button
              onClick={() => setShowCreate(true)}
              className="text-gray-400 hover:text-white text-lg leading-none"
              title="Criar canal"
            >
              +
            </button>
          </div>

          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannel(ch.id)}
              className={`w-full text-left px-3 py-1.5 rounded text-sm transition flex items-center gap-1.5 ${
                activeChannelId === ch.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="opacity-60">{ch.type === 'dm' ? '@' : '#'}</span>
              {ch.name}
            </button>
          ))}

          {channels.length === 0 && (
            <p className="text-xs text-gray-500 px-2 py-2">Nenhum canal ainda</p>
          )}
        </nav>

        {/* Hint */}
        <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-700">
          <p><kbd className="bg-gray-700 px-1 rounded">@ai</kbd> para IA</p>
          <p><kbd className="bg-gray-700 px-1 rounded">/run py</kbd> para código</p>
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
              {username?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm truncate">{username}</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-xs">
            Sair
          </button>
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
