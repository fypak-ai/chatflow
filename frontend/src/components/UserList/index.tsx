import { useChatStore } from '../../store/chat'

export default function UserList({ channelId }: { channelId: string }) {
  const onlineUsers = useChatStore((s) => s.onlineUsers)

  return (
    <aside className="w-52 bg-gray-800 border-l border-gray-700 flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Online</h3>
      </div>
      <div className="p-2 space-y-1 overflow-y-auto flex-1">
        {onlineUsers.length === 0 ? (
          <p className="text-xs text-gray-500 px-2">Nenhum usuário</p>
        ) : (
          onlineUsers.map((userId) => (
            <div key={userId} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700">
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 truncate">{userId.slice(0, 12)}</span>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Comandos</h3>
        <div className="space-y-1 text-xs text-gray-500">
          <p><kbd className="bg-gray-700 px-1 rounded">@ai</kbd> Ativa IA</p>
          <p><kbd className="bg-gray-700 px-1 rounded">/run python</kbd></p>
          <p><kbd className="bg-gray-700 px-1 rounded">/run javascript</kbd></p>
          <p><kbd className="bg-gray-700 px-1 rounded">/run bash</kbd></p>
        </div>
      </div>
    </aside>
  )
}
