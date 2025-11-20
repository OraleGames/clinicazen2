"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Calendar,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { t } from '@/lib/i18n'

interface DatabaseUser {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'PATIENT' | 'THERAPIST'
  avatar_url?: string
  phone?: string
  bio?: string
  specialization?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminUsersDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<DatabaseUser[]>([])
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreating(false)
        setIsEditing(false)
        setShowDeleteConfirm(null)
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError(t('users.errorLoading'))
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setError(t('users.errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active)
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    therapists: users.filter(u => u.role === 'THERAPIST').length,
    patients: users.filter(u => u.role === 'PATIENT').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  }

  const handleEditUser = (user: DatabaseUser) => {
    setSelectedUser(user)
    setIsEditing(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        setShowDeleteConfirm(null)
      } else {
        setError('Error al eliminar el usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Error al eliminar el usuario')
    }
  }

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { is_active: !user.is_active }
        })
      })
      
      if (response.ok) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, is_active: !u.is_active } : u
        ))
      } else {
        setError('Error al cambiar el estado del usuario')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      setError('Error al cambiar el estado del usuario')
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          updates: {
            name: selectedUser.name,
            email: selectedUser.email,
            role: selectedUser.role,
            phone: selectedUser.phone,
            bio: selectedUser.bio,
            specialization: selectedUser.specialization
          }
        })
      })
      
      if (response.ok) {
        setUsers(users.map(u => 
          u.id === selectedUser.id ? selectedUser : u
        ))
        setIsEditing(false)
        setSelectedUser(null)
      } else {
        setError('Error al actualizar el usuario')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Error al actualizar el usuario')
    }
  }

  const handleSendNotification = (userId: string) => {
    // TODO: Implement notification system
    console.log('Sending notification to user:', userId)
  }

  if (loading && users.length === 0) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {t('users.title')}
            {loading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            )}
          </h1>
          <p className="text-gray-600">
            {t('users.description')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('users.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-teal-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600 transition-all duration-300 hover:scale-110">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{t('users.totalUsersDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('users.active')}</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 transition-all duration-300 hover:scale-110">{stats.active}</div>
              <p className="text-xs text-muted-foreground">{t('users.activeDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('users.therapists')}</CardTitle>
              <Users className="h-4 w-4 text-blue-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 transition-all duration-300 hover:scale-110">{stats.therapists}</div>
              <p className="text-xs text-muted-foreground">{t('users.therapistsDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('users.patients')}</CardTitle>
              <Users className="h-4 w-4 text-cyan-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 transition-all duration-300 hover:scale-110">{stats.patients}</div>
              <p className="text-xs text-muted-foreground">{t('users.patientsDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('users.admins')}</CardTitle>
              <Shield className="h-4 w-4 text-indigo-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 transition-all duration-300 hover:scale-110">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">{t('users.adminsDesc')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              {t('users.newUser')}
            </Button>
            <Button variant="outline" className="border-2 border-teal-300 text-teal-600 hover:bg-teal-50 hover:border-teal-400 transition-all duration-300 hover:scale-105 active:scale-95">
              <Mail className="h-4 w-4 mr-2" />
              {t('users.notifyAll')}
            </Button>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
              <input
                type="text"
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            >
              <option value="all">{t('users.allRoles')}</option>
              <option value="ADMIN">{t('roles.admin')}</option>
              <option value="THERAPIST">{t('roles.therapist')}</option>
              <option value="PATIENT">{t('roles.patient')}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
            >
              <option value="all">{t('users.allStatus')}</option>
              <option value="active">{t('users.active')}</option>
              <option value="inactive">{t('users.inactive')}</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Users className="h-5 w-5" />
            {t('users.usersList')}
            <span className="ml-2 text-sm text-gray-500">({filteredUsers.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredUsers.map((user) => {
              const roleColor = user.role === 'ADMIN' ? 'indigo' : user.role === 'THERAPIST' ? 'blue' : 'cyan'
              return (
                <Card 
                  key={user.id} 
                  className={`relative bg-white border-2 border-${roleColor}-200 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                  style={{ transform: 'scale(1)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  }}
                >
                  {/* Gradient Accent Bar */}
                  <div className={`h-2 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-t-lg transition-all duration-300`} />
                  
                  <CardContent className="p-5">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-4">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name || user.email}
                          className="h-20 w-20 rounded-full object-cover border-4 border-gray-100 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-teal-200 group-hover:shadow-2xl"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-gray-100 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-teal-200 group-hover:from-teal-50 group-hover:to-cyan-50 group-hover:shadow-2xl">
                          <Users className="h-10 w-10 text-gray-400 transition-colors duration-300 group-hover:text-teal-500" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <Badge 
                        variant={user.is_active ? 'default' : 'secondary'}
                        className={`mt-2 transition-all duration-300 group-hover:scale-110 ${user.is_active ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {user.is_active ? t('users.active') : t('users.inactive')}
                      </Badge>
                    </div>

                    {/* User Info */}
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg truncate transition-colors duration-300 group-hover:text-teal-600">
                        {user.name || t('users.noName')}
                      </h3>
                      <p className="text-sm text-gray-600 truncate transition-colors duration-300 group-hover:text-gray-700">{user.email}</p>
                      <Badge 
                        variant="outline" 
                        className={`mt-2 border-2 border-${roleColor}-300 text-${roleColor}-700 bg-${roleColor}-50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}
                      >
                        {user.role === 'ADMIN' ? t('roles.admin') : user.role === 'THERAPIST' ? t('roles.therapist') : t('roles.patient')}
                      </Badge>
                    </div>

                    {/* Specialization */}
                    {user.specialization && user.specialization.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 text-center mb-1">{t('users.specializations')}:</p>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {user.specialization.map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Member Since */}
                    <div className="text-center text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {t('users.memberSince')} {new Date(user.created_at).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        className="border-teal-300 text-teal-600 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all duration-200 hover:shadow-md"
                        style={{ transform: 'scale(1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {t('users.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendNotification(user.id)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 hover:shadow-md"
                        style={{ transform: 'scale(1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {t('users.mail')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="border-cyan-300 text-cyan-600 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 transition-all duration-200 hover:shadow-md"
                        style={{ transform: 'scale(1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        {user.is_active ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                        {user.is_active ? t('users.disable') : t('users.enable')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="border-red-300 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 hover:shadow-md"
                        style={{ transform: 'scale(1)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t('users.delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Create User Modal */}
        {isCreating && (
          <div 
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setIsCreating(false)}
          >
            <div 
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-300 border-2 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('users.newUser')}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-90"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.name')} *
                  </label>
                  <input
                    type="text"
                    id="new-user-name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="Nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.email')} *
                  </label>
                  <input
                    type="email"
                    id="new-user-email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Email *
                  </label>
                  <input
                    type="email"
                    id="new-user-email-confirm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.password')} *
                  </label>
                  <input
                    type="password"
                    id="new-user-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El usuario no necesitará verificar su email
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.role')} *
                  </label>
                  <select
                    id="new-user-role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  >
                    <option value="PATIENT">{t('roles.patient')}</option>
                    <option value="THERAPIST">{t('roles.therapist')}</option>
                    <option value="ADMIN">{t('roles.admin')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.phone')}
                  </label>
                  <input
                    type="tel"
                    id="new-user-phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.specializationsLabel')}
                  </label>
                  <input
                    type="text"
                    id="new-user-specialization"
                    placeholder={t('users.specializationsPlaceholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo para terapeutas, separar con comas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.bio')}
                  </label>
                  <textarea
                    id="new-user-bio"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="Biografía del usuario"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  className="transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-gray-100 text-gray-700 border-gray-300"
                >
                  {t('users.cancel')}
                </Button>
                <Button 
                  onClick={async () => {
                    const name = (document.getElementById('new-user-name') as HTMLInputElement).value
                    const email = (document.getElementById('new-user-email') as HTMLInputElement).value
                    const emailConfirm = (document.getElementById('new-user-email-confirm') as HTMLInputElement).value
                    const password = (document.getElementById('new-user-password') as HTMLInputElement).value
                    const role = (document.getElementById('new-user-role') as HTMLSelectElement).value
                    const phone = (document.getElementById('new-user-phone') as HTMLInputElement).value
                    const bio = (document.getElementById('new-user-bio') as HTMLTextAreaElement).value
                    const specializationStr = (document.getElementById('new-user-specialization') as HTMLInputElement).value
                    const specialization = specializationStr ? specializationStr.split(',').map(s => s.trim()).filter(s => s) : []

                    if (!name || !email || !emailConfirm || !password) {
                      setError('Por favor, completa todos los campos obligatorios')
                      return
                    }

                    if (email !== emailConfirm) {
                      setError('Los emails no coinciden')
                      return
                    }

                    if (password.length < 6) {
                      setError('La contraseña debe tener al menos 6 caracteres')
                      return
                    }

                    try {
                      const response = await fetch('/api/users/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name,
                          email,
                          password,
                          role,
                          phone: phone || undefined,
                          bio: bio || undefined,
                          specialization: specialization.length > 0 ? specialization : undefined
                        })
                      })
                      
                      if (response.ok) {
                        loadUsers() // Refresh the list
                        setIsCreating(false)
                        // Clear form
                        ;(document.getElementById('new-user-name') as HTMLInputElement).value = ''
                        ;(document.getElementById('new-user-email') as HTMLInputElement).value = ''
                        ;(document.getElementById('new-user-email-confirm') as HTMLInputElement).value = ''
                        ;(document.getElementById('new-user-password') as HTMLInputElement).value = ''
                        ;(document.getElementById('new-user-phone') as HTMLInputElement).value = ''
                        ;(document.getElementById('new-user-bio') as HTMLTextAreaElement).value = ''
                        ;(document.getElementById('new-user-specialization') as HTMLInputElement).value = ''
                      } else {
                        const data = await response.json()
                        setError(data.error || 'Error al crear el usuario')
                      }
                    } catch (error) {
                      console.error('Error creating user:', error)
                      setError('Error al crear el usuario')
                    }
                  }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('users.createUser')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {isEditing && selectedUser && (
          <div 
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setIsEditing(false)}
          >
            <div 
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in duration-300 border-2 border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('users.editUser')}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="hover:bg-gray-100 transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-90"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.name')}
                  </label>
                  <input
                    type="text"
                    value={selectedUser.name || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.email')}
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.newPassword')}
                  </label>
                  <input
                    type="password"
                    id="edit-user-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    placeholder="Dejar vacío para no cambiar"
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo completar si desea cambiar la contraseña</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.role')}
                  </label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  >
                    <option value="PATIENT">{t('roles.patient')}</option>
                    <option value="THERAPIST">{t('roles.therapist')}</option>
                    <option value="ADMIN">{t('roles.admin')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.phone')}
                  </label>
                  <input
                    type="tel"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  />
                </div>

                {selectedUser.role === 'THERAPIST' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('users.specializationsLabel')}
                    </label>
                    <input
                      type="text"
                      value={selectedUser.specialization?.join(', ') || ''}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser, 
                        specialization: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                      placeholder={t('users.specializationsPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('users.bio')}
                  </label>
                  <textarea
                    value={selectedUser.bio || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, bio: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-gray-900 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-gray-100 text-gray-700 border-gray-300"
                >
                  {t('users.cancel')}
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const password = (document.getElementById('edit-user-password') as HTMLInputElement)?.value
                      const updates: any = {
                        name: selectedUser.name,
                        email: selectedUser.email,
                        role: selectedUser.role,
                        phone: selectedUser.phone,
                        bio: selectedUser.bio,
                        specialization: selectedUser.specialization
                      }
                      
                      // Add password to updates if provided
                      if (password && password.trim()) {
                        updates.password = password
                      }

                      const response = await fetch('/api/users', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userId: selectedUser.id,
                          updates
                        })
                      })
                      
                      if (response.ok) {
                        setUsers(users.map(u => 
                          u.id === selectedUser.id ? selectedUser : u
                        ))
                        setIsEditing(false)
                        setSelectedUser(null)
                        loadUsers() // Refresh the list
                      } else {
                        const data = await response.json()
                        setError(data.error || 'Error al actualizar el usuario')
                      }
                    } catch (error) {
                      console.error('Error updating user:', error)
                      setError('Error al actualizar el usuario')
                    }
                  }}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  {t('users.saveChanges')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div 
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div 
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in duration-300 border-2 border-gray-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gradient Header */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400"></div>
              
              <div className="mt-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {t('users.confirmDelete')}
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                  {t('users.confirmDeleteMessage')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-gray-100 text-gray-700 border-gray-300"
                >
                  {t('users.cancel')}
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/users?userId=${showDeleteConfirm}`, {
                        method: 'DELETE'
                      })
                      
                      if (response.ok) {
                        setUsers(users.filter(u => u.id !== showDeleteConfirm))
                        setShowDeleteConfirm(null)
                      } else {
                        const data = await response.json()
                        setError(data.error || 'Error al eliminar el usuario')
                        setShowDeleteConfirm(null)
                      }
                    } catch (error) {
                      console.error('Error deleting user:', error)
                      setError('Error al eliminar el usuario')
                      setShowDeleteConfirm(null)
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl"
                >
                  {t('users.deleteUser')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}