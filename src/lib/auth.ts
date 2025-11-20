import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'PATIENT' | 'THERAPIST' | 'RECEPTIONIST'
  avatar_url?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

class AuthService {
  private currentUser: AuthUser | null = null
  private listeners: ((state: AuthState) => void)[] = []

  // Subscribe to auth changes
  onAuthChange(callback: (state: AuthState) => void) {
    this.listeners.push(callback)
    
    // Initial auth state
    this.notifyListeners()
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.loadUserProfile(session.user)
      } else {
        this.currentUser = null
        this.notifyListeners()
      }
    })
  }

  // Load user profile from database
  private async loadUserProfile(authUser: User) {
    try {
      // Use maybeSingle() instead of single() to avoid 406 errors
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.error('Error loading user profile:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        this.currentUser = null
      } else if (!profile) {
        console.error('No profile found for user:', authUser.id)
        this.currentUser = null
      } else {
        this.currentUser = {
          id: authUser.id,
          email: authUser.email!,
          name: profile.name,
          role: profile.role,
          avatar_url: profile.avatar_url
        }
        console.log('User profile loaded successfully:', {
          id: this.currentUser.id,
          email: this.currentUser.email,
          role: this.currentUser.role
        })
      }
    } catch (error) {
      console.error('Unexpected error loading user profile:', error)
      this.currentUser = null
    }
    
    this.notifyListeners()
  }

  // Notify all listeners
  private notifyListeners() {
    const state: AuthState = {
      user: this.currentUser,
      loading: false,
      error: null
    }
    
    this.listeners.forEach(callback => callback(state))
  }

  // Sign up new user
  async signUp(email: string, password: string, name: string, role: AuthUser['role'] = 'PATIENT') {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            name,
            role
          })

        if (profileError) throw profileError
      }

      return { success: true, data: authData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Sign in user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      this.currentUser = null
      this.notifyListeners()
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  // Check if user has specific role
  hasRole(role: AuthUser['role']): boolean {
    return this.currentUser?.role === role
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN')
  }

  // Check if user is therapist
  isTherapist(): boolean {
    return this.hasRole('THERAPIST')
  }

  // Check if user is patient
  isPatient(): boolean {
    return this.hasRole('PATIENT')
  }

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>) {
    try {
      if (!this.currentUser) throw new Error('No user logged in')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id)

      if (error) throw error

      // Update local user data
      this.currentUser = { ...this.currentUser, ...updates }
      this.notifyListeners()

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}

export const authService = new AuthService()