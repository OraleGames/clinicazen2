"use client"

import React, { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BarChart2, Star, Tag, FileText, Settings, Calendar, Users, MessageSquare, CreditCard, LogOut, Menu, X, Home, User, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
  role?: string
}

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      router.push('/')
    }
  }

  // Role-specific navigation items
  const getNavigationItems = (userRole: string) => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', href: `/dashboard/${userRole.toLowerCase()}`, active: pathname === `/dashboard/${userRole.toLowerCase()}` },
    ]

    const roleItems = {
      admin: [
        { icon: Users, label: 'Usuarios', href: `/dashboard/admin/users`, active: pathname.includes('/users') },
        { icon: Calendar, label: 'Citas', href: `/dashboard/admin/appointments`, active: pathname.includes('/appointments') },
        { icon: CreditCard, label: 'Pagos', href: `/dashboard/admin/payments`, active: pathname.includes('/payments') },
        { icon: FileText, label: 'Terapias', href: `/dashboard/admin/services`, active: pathname.includes('/services') },
        { icon: Tag, label: 'Categorías', href: `/dashboard/admin/categories`, active: pathname.includes('/categories') },
        { icon: BarChart2, label: 'Análisis', href: `/dashboard/admin/analytics`, active: pathname.includes('/analytics') },
        { icon: CheckCircle, label: 'Check-in', href: `/dashboard/admin/checkin`, active: pathname.includes('/checkin') },
        { icon: MessageSquare, label: 'Notificaciones', href: `/dashboard/admin/notifications`, active: pathname.includes('/notifications') },
      ],
      therapist: [
        { icon: Calendar, label: 'Mi Calendario', href: `/dashboard/therapist/calendar`, active: pathname.includes('/calendar') },
        { icon: Users, label: 'Pacientes', href: `/dashboard/therapist/patients`, active: pathname.includes('/patients') },
        { icon: MessageSquare, label: 'Mensajes', href: `/dashboard/therapist/chat`, active: pathname.includes('/chat') },
        { icon: Star, label: 'Reseñas', href: `/dashboard/therapist/reviews`, active: pathname.includes('/reviews') },
        { icon: Settings, label: 'Perfil', href: `/dashboard/therapist/profile`, active: pathname.includes('/profile') },
      ],
      patient: [
        { icon: Calendar, label: 'Mis Citas', href: `/dashboard/patient/appointments`, active: pathname.includes('/appointments') },
        { icon: Users, label: 'Buscar Terapeutas', href: '/terapias', active: pathname === '/terapias' },
        { icon: Star, label: 'Reseñas', href: `/dashboard/patient/reviews`, active: pathname.includes('/reviews') },
        { icon: FileText, label: 'Historial', href: `/dashboard/patient/history`, active: pathname.includes('/history') },
        { icon: Settings, label: 'Perfil', href: `/dashboard/patient/profile`, active: pathname.includes('/profile') },
      ]
    }

    return [...baseItems, ...(roleItems[userRole as keyof typeof roleItems] || roleItems.patient)]
  }

  const navigationItems = getNavigationItems(user?.role?.toLowerCase() || 'patient')

  return (
    <div className="min-h-screen bg-slate-500 p-2 sm:p-4">
      <div className="mx-auto max-w-[95%] rounded-3xl backdrop-blur-xl border border-white/20 p-2 sm:p-6 flex flex-col sm:flex-row gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-white/10 to-teal-200/30 rounded-3xl"></div>

        {/* Mobile Menu Toggle */}
        <button
          className="sm:hidden fixed top-4 right-4 z-50 bg-slate-700/80 rounded-lg p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
        </button>

        {/* Sidebar Navigation */}
        <div
          className={`${isMobileMenuOpen ? "fixed inset-0 bg-slate-700 z-40" : "hidden"} sm:flex w-40 flex-col justify-between p-3 rounded-2xl relative z-10 min-h-[600px]`}
        >
          {/* Logo */}
          <div className="text-white mb-4">
            <Link href="/" className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors mx-auto">
              <div className="flex -space-x-1">
                <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-4">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-2 p-2 transition-all duration-300 group relative`}
                style={{
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={item.label}
              >
                <item.icon className={`h-8 w-8 ${item.active ? 'text-white drop-shadow-lg' : 'text-white/70 group-hover:text-white group-hover:drop-shadow-lg'} transition-all duration-300`} />
                <span className={`text-xs font-semibold text-center leading-tight ${item.active ? 'text-white drop-shadow-md' : 'text-white/70 group-hover:text-white group-hover:drop-shadow-md'} transition-all duration-300`}>
                  {item.label}
                </span>
                {item.active && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-full shadow-lg"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="text-white space-y-4">
            {/* User Avatar */}
            <div className="relative group">
              <div 
                className="flex flex-col items-center gap-2 p-2 transition-all duration-300 cursor-pointer"
                style={{ transform: 'scale(1)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shadow-lg transition-all duration-300">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center w-full">
                  <div className="text-xs font-semibold truncate text-white drop-shadow-md">{user?.name || 'Usuario'}</div>
                  <div className="text-[11px] text-white/70 truncate drop-shadow-sm">{user?.role}</div>
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex flex-col items-center gap-2 p-2 transition-all duration-300"
              style={{ transform: 'scale(1)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Cerrar Sesión"
            >
              <div className="h-10 w-10 rounded-full bg-red-500/30 hover:bg-red-500/40 transition-all duration-300 flex items-center justify-center shadow-md">
                <LogOut className="h-5 w-5 text-white transition-all duration-300" />
              </div>
              <span className="text-xs font-semibold text-white drop-shadow-md transition-all duration-300">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 relative z-10">
          {/* Top Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 p-2">
            {/* Back Button */}
            <Link 
              href="/" 
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white text-sm flex items-center gap-2"
            >
              ← Volver al Inicio
            </Link>

            {/* Tab Navigation */}
            <div className="flex gap-4 sm:gap-8 px-4 overflow-x-auto whitespace-nowrap">
              <button className="text-white font-medium hover:text-white/80 transition-colors">DASHBOARD</button>
              <button className="text-white/60 hover:text-white/80 transition-colors">INSIGHTS</button>
              <button className="text-white/60 hover:text-white/80 transition-colors">CHANNELS</button>
            </div>

            {/* Team Members (for admin/therapist) */}
            {(user?.role === 'ADMIN' || user?.role === 'THERAPIST') && (
              <div className="flex items-center gap-2 px-4">
                <div className="flex -space-x-1">
                  <div className="h-8 w-8 rounded-full bg-teal-200 border-2 border-white/20"></div>
                  <div className="h-8 w-8 rounded-full bg-blue-200 border-2 border-white/20"></div>
                  <div className="h-8 w-8 rounded-full bg-cyan-200 border-2 border-white/20"></div>
                </div>
                <span className="text-white text-sm">Equipo</span>
              </div>
            )}
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 min-h-[85vh] overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout