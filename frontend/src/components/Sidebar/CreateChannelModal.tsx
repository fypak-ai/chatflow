import { useState } from 'react'
import api from '../../api/client'

interface Props {
  workspaceId: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateChannelModal({ workspaceId, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      await api.post('/api/channels/', { workspace_id: workspaceId, name: name.trim() })
      onCreated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl p-6 w-80 space-y-4 shadow-2xl"
      >
        <h3 className="font-semibold text-lg">Criar canal</h3>
        <input
          autoFocus
          className="w-full bg-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="nome-do-canal"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, '-'))}
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-semibold"
          >
            Criar
          </button>
        </div>
      </form>
    </div>
  )
}
