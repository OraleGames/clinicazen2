'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, type AuthUser, type AuthState } from '@/lib/auth'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, name: string, role?: AuthUser['role']) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Subscribe to auth changes
    authService.onAuthChange((state) => {
      setAuthState(state)
    })
  }, [])

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    const result = await authService.signIn(email, password)
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
    }
    
    return result
  }

  const signUp = async (email: string, password: string, name: string, role: AuthUser['role'] = 'PATIENT') => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    const result = await authService.signUp(email, password, name, role)
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
    }
    
    return result
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    const result = await authService.signOut()
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
    }
    
    return result
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    const result = await authService.updateProfile(updates)
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
    }
    
    return result
  }

  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    const result = await authService.resetPassword(email)
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error }))
    }
    
    return result
  }

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hooks for role checking
export function useIsAdmin() {
  const { user } = useAuth()
  return user?.role === 'ADMIN'
}

export function useIsTherapist() {
  const { user } = useAuth()
  return user?.role === 'THERAPIST'
}

export function useIsPatient() {
  const { user } = useAuth()
  return user?.role === 'PATIENT'
}