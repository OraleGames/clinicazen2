'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface LoginFormProps {
  onToggleMode?: () => void
  onSuccess?: () => void
}

export default function LoginForm({ onToggleMode, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await signIn(email, password)

    if (result.success) {
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/dashboard')
      }
    } else {
      setError(result.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto text-white">
      <h2 className="text-3xl font-semibold mb-6 text-center">Entrar</h2>
      {error && <p className="text-red-200 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-transparent border-b border-white/60 p-2 placeholder-white/70 focus:outline-none focus:border-white"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-transparent border-b border-white/60 p-2 placeholder-white/70 focus:outline-none focus:border-white"
          disabled={loading}
        />

        <button
          type="submit"
          className="w-full bg-white text-pink-500 py-2 rounded-lg font-semibold hover:bg-pink-100 transition duration-300 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
              Iniciando...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {onToggleMode && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="bg-white text-pink-500 border border-pink-200 px-6 py-2 rounded-lg font-semibold hover:bg-pink-500 hover:text-white transition duration-300"
          >
            Crear Cuenta
          </button>
        </div>
      )}
    </div>
  )
}