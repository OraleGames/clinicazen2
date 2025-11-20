"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getRoleFromSegment, getDashboardPathForRole } from '@/lib/dashboard'

interface DashboardGateProps {
  children: React.ReactNode
}

export default function DashboardGate({ children }: DashboardGateProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    const segment = pathname?.split('/')[2] || ''
    const roleFromPath = getRoleFromSegment(segment)

    if (!segment) {
      router.replace(getDashboardPathForRole(user.role))
      return
    }

    if (!roleFromPath || roleFromPath !== user.role) {
      router.replace(getDashboardPathForRole(user.role))
      return
    }
  }, [loading, pathname, router, user])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  return <>{children}</>
}
