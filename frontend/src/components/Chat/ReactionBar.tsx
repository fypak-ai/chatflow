import { useState } from 'react'
import api from '../../api/client'
import { useChatStore, Message } from '../../store/chat'

const EMOJI_LIST = ['👍','👎','❤️','😂','😮','😢','🎉','🔥','👀','✅','🚀','💯']

export default function ReactionBar({ message }: { message: Message }) {
  const [showPicker, setShowPicker] = useState(false)
  const activeChannelId = useChatStore((s) => s.activeChannelId)
  const updateReactions = useChatStore((s) => s.updateReactions)

  const toggleReaction = async (emoji: string) => {
    setShowPicker(false)
    try {
      const { data } = await api.post('/api/reactions/toggle', {
        message_id: message.id,
        emoji,
        channel_id: activeChannelId,
      })
      updateReactions(message.id, data.reactions)
    } catch {}
  }

  const reactions = message.reactions || {}
  const hasReactions = Object.keys(reactions).length > 0

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {/* Existing reactions */}
      {Object.entries(reactions).map(([emoji, count]) =>
        count > 0 ? (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            className="inline-flex items-center gap-1 bg-gray-700 hover:bg-gray-600 rounded-full px-2 py-0.5 text-sm transition"
          >
            <span>{emoji}</span>
            <span className="text-xs text-gray-300">{count}</span>
          </button>
        ) : null
      )}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full w-7 h-7 flex items-center justify-center text-sm transition"
        >
          +
        </button>

        {showPicker && (
          <div className="absolute bottom-8 left-0 z-10 bg-gray-800 border border-gray-700 rounded-xl p-2 shadow-xl">
            <div className="grid grid-cols-6 gap-1">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  onClick={() => toggleReaction(e)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded text-lg"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
