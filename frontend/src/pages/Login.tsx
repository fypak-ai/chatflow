import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/auth'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const form = new FormData()
        form.append('username', email)
        form.append('password', password)
        const { data } = await api.post('/api/auth/login', form)
        setAuth(data.access_token, data.user_id, data.username)
      } else {
        const { data } = await api.post('/api/auth/register', { email, username, password })
        setAuth(data.access_token, data.user_id, data.username)
      }
      navigate('/w/default')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">ChatFlow</h1>
          <p className="text-gray-400 mt-2">Sua plataforma de comunicação</p>
        </div>
        <form onSubmit={submit} className="bg-gray-800 p-8 rounded-2xl shadow-xl space-y-4">
          <h2 className="text-xl font-semibold">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          <input
            className="w-full bg-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            type="email" placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />

          {mode === 'register' && (
            <input
              className="w-full bg-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              type="text" placeholder="Username"
              value={username} onChange={(e) => setUsername(e.target.value)} required
            />
          )}

          <input
            className="w-full bg-gray-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            type="password" placeholder="Senha"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-2.5 font-semibold transition"
          >
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-gray-400">
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-indigo-400 hover:underline"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
