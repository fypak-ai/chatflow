import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)
      const { data } = await api.post('/api/auth/login', form)
      setToken(data.access_token)
      navigate('/w/default')
    } catch {
      setError('Email ou senha inválidos')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={submit} className="bg-gray-800 p-8 rounded-xl w-96 space-y-4">
        <h1 className="text-2xl font-bold">ChatFlow</h1>
        <input
          className="w-full bg-gray-700 rounded px-3 py-2"
          type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full bg-gray-700 rounded px-3 py-2"
          type="password" placeholder="Senha"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 rounded py-2 font-semibold">
          Entrar
        </button>
      </form>
    </div>
  )
}
