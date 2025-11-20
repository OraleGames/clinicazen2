'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SuccessMessage from '@/components/SuccessMessage'
import type { AuthUser } from '@/lib/auth'

interface RegisterFormProps {
  onToggleMode?: () => void
  onSuccess?: () => void
}

type RegisterFormState = {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: AuthUser['role']
}

export default function RegisterForm({ onToggleMode, onSuccess }: RegisterFormProps) {
  const roleOptions: { value: AuthUser['role']; label: string }[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'THERAPIST', label: 'Terapeuta' },
    { value: 'PATIENT', label: 'Paciente' },
    { value: 'RECEPTIONIST', label: 'Recepcionista' }
  ]

  const [formData, setFormData] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PATIENT'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp, loading } = useAuth()
  const router = useRouter()

  const handleChange = <K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const result = await signUp(formData.email, formData.password, formData.name, formData.role)

    if (result.success) {
      if (onSuccess) {
        onSuccess()
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 1200)
      }
    } else {
      setError(result.error || 'Error al crear cuenta')
    }
  }

  if (success && !onSuccess) {
    return <SuccessMessage message="Usuario creado exitosamente. Redirigiendo..." />
  }

  return (
    <div className="w-full max-w-sm mx-auto text-white">
      <h2 className="text-3xl font-semibold mb-6 text-center">Crear Cuenta</h2>
      {error && <p className="text-red-200 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre Completo"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          className="w-full bg-transparent border-b border-white/60 p-2 placeholder-white/70 focus:outline-none focus:border-white"
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          className="w-full bg-transparent border-b border-white/60 p-2 placeholder-white/70 focus:outline-none focus:border-white"
          disabled={loading}
        />
        <div>
          <label className="sr-only" htmlFor="role">
            Tipo de cuenta
          </label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value as AuthUser['role'])}
            className="w-full bg-transparent border-b border-white/60 p-2 text-white focus:outline-none"
            disabled={loading}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value} className="text-black">
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-white/70">
            Selecciona el tipo de cuenta para mostrar el dashboard correcto (elige Administrador para acceder al panel admin).
          </p>
        </div>
        <input
          type="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required
          className="w-full bg-transparent border-b border-white/60 p-2 placeholder-white/70 focus:outline-none focus:border-white"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirmar Contraseña"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
              Creando cuenta...
            </>
          ) : (
            'Registrar'
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
            Iniciar Sesión
          </button>
        </div>
      )}
    </div>
  )
}