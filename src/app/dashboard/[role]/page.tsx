"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { getDashboardPathForRole } from '@/lib/dashboard'

export default function RoleDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Extract role from URL
  const roleFromPath = pathname?.split('/')[2]?.toLowerCase()

  // If user is not logged in, redirect to login
  if (!user && !loading) {
    router.push('/login')
    return null
  }

  // If user is logged in but trying to access wrong role, redirect to correct dashboard
  if (user && roleFromPath && roleFromPath !== user.role.toLowerCase()) {
    router.replace(getDashboardPathForRole(user.role))
    return null
  }

  // If user is logged in but no role specified, redirect to correct dashboard
  if (user && !roleFromPath) {
    router.replace(getDashboardPathForRole(user.role))
    return null
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show role-specific content
  const getRoleContent = () => {
    switch (user?.role) {
      case 'ADMIN':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>
            <p className="text-gray-600 mb-6">Gestiona usuarios, citas y servicios de la clínica</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">👥 Usuarios</h3>
                <p className="text-blue-600">Gestionar todos los usuarios del sistema</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">📅 Citas</h3>
                <p className="text-green-600">Ver y gestionar todas las citas</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">💰 Finanzas</h3>
                <p className="text-purple-600">Reportes de ingresos y pagos</p>
              </div>
            </div>
          </div>
        )
      
      case 'THERAPIST':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Panel del Terapeuta</h1>
            <p className="text-gray-600 mb-6">Gestiona tu calendario, pacientes y servicios</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📅 Calendario</h3>
                <p className="text-blue-600">Gestiona tu disponibilidad</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">👥 Pacientes</h3>
                <p className="text-green-600">Ver tu lista de pacientes</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">⭐ Reseñas</h3>
                <p className="text-purple-600">Ver calificaciones recibidas</p>
              </div>
            </div>
          </div>
        )
      
      case 'PATIENT':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Panel del Paciente</h1>
            <p className="text-gray-600 mb-6">Gestiona tus citas, historial y bienestar</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">📅 Mis Citas</h3>
                <p className="text-blue-600">Ver próximas y pasadas</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">🔍 Buscar Terapeutas</h3>
                <p className="text-green-600">Explorar terapias disponibles</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">📊 Progreso</h3>
                <p className="text-purple-600">Seguimiento de bienestar</p>
              </div>
            </div>
          </div>
        )
      
      case 'RECEPTIONIST':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Rol no Disponible</h1>
            <p className="text-gray-600 mb-6">
              El rol de recepcionista ha sido integrado en el rol de Administrador.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Funciones de Recepción</h3>
              <p className="text-yellow-700">
                Las funciones de recepción ahora están disponibles en el panel de administración.
              </p>
              <ul className="list-disc list-inside text-yellow-700 space-y-2 mt-4">
                <li>Check-in de pacientes</li>
                <li>Gestión de citas</li>
                <li>Envío de notificaciones</li>
                <li>Reportes diarios</li>
              </ul>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Panel Principal</h1>
            <p className="text-gray-600">Bienvenido al sistema</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6">
        {getRoleContent()}
      </div>
    </div>
  )
}