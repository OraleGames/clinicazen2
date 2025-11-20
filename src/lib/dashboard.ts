import type { AuthUser } from '@/lib/auth'

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  THERAPIST: 'Terapeuta', 
  PATIENT: 'Paciente'
} as const

export const ROLE_SEGMENTS = {
  ADMIN: 'admin',
  THERAPIST: 'therapist',
  PATIENT: 'patient'
} as const

export function getRoleFromSegment(segment: string): AuthUser['role'] | null {
  const roleMap = {
    'admin': 'ADMIN' as const,
    'therapist': 'THERAPIST' as const,
    'patient': 'PATIENT' as const
  }
  
  return roleMap[segment as keyof typeof roleMap] || null
}

export function getDashboardPathForRole(role: AuthUser['role']): string {
  const segment = ROLE_SEGMENTS[role]
  return `/dashboard/${segment}`
}

export function getRoleDisplayName(role: AuthUser['role']): string {
  return ROLE_LABELS[role]
}