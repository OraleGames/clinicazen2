"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Github, Facebook, Mail } from 'lucide-react'
import LoginForm from '@/components/LoginForm'
import RegisterForm from '@/components/RegisterForm'

interface LoginRegisterModalProps {
  isOpen: boolean
  togglePopup: () => void
}

export default function LoginRegisterModal({ isOpen, togglePopup }: LoginRegisterModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true)
    }
  }, [isOpen])

  const handleToggleMode = () => setIsLogin(prev => !prev)

  const handleAuthSuccess = () => {
    togglePopup()
    router.push('/dashboard')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={togglePopup}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white w-full max-w-[900px] h-full max-h-[560px] rounded-2xl shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={togglePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-20"
              aria-label="Cerrar"
            >
              <X size={28} />
            </button>

            <div className="flex flex-col md:flex-row h-full">
              {/* Branding & toggles */}
              <div className="relative md:w-1/2 min-h-[260px] md:h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-pink-400 via-orange-300 to-amber-200 text-white p-8">
                <div className="text-center">
                  <p className="uppercase tracking-[0.3em] text-sm">Clinica Zen</p>
                  <h2 className="text-4xl font-semibold leading-tight mt-3">
                    Bienestar <br />
                    <span className="text-white/80">a un clic</span>
                  </h2>
                </div>

                <p className="max-w-xs text-center text-white/90">
                  {isLogin
                    ? 'Accede para gestionar tus terapias, citas y mensajes en tiempo real.'
                    : 'Crea tu cuenta y empieza a recibir la mejor atención personalizada.'}
                </p>

                <div className="flex gap-4">
                  {[Github, Mail, Facebook].map((Icon, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="rounded-full border border-white/40 p-3 text-white transition hover:bg-white/20"
                      aria-label="Iniciar sesión con red social"
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleToggleMode}
                  className="rounded-full border border-white/80 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-pink-500"
                >
                  {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
                </button>
              </div>

              {/* Forms */}
              <div className="md:w-1/2 flex-1 flex items-center justify-center bg-gradient-to-br from-[#8E9AAF] to-[#6C7DAB] text-white p-6">
                {isLogin ? (
                  <LoginForm onToggleMode={handleToggleMode} onSuccess={handleAuthSuccess} />
                ) : (
                  <RegisterForm onToggleMode={handleToggleMode} onSuccess={handleAuthSuccess} />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
