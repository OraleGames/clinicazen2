"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users,
  Star,
  Filter,
  Search,
  ChevronRight,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  X,
  Check,
  Eye,
  UserCheck,
  CalendarClock,
  TrendingUp,
  DollarSign
} from 'lucide-react'
import { t } from '@/lib/i18n'
import { Calendar as DayPicker } from '@/components/ui/calendar'

interface Appointment {
  id: number
  client_id: string
  therapist_id: string
  service_id: number
  scheduled_at: string
  duration_minutes: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  price: number
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIAL_REFUND'
  payment_method?: string
  total_amount: number
  notes?: string
  cancellation_reason?: string
  cancellation_fee: number
  created_at: string
  client?: { name: string; email: string; phone?: string }
  therapist?: { name: string; email: string; avatar_url?: string }
  therapy?: { name: string; description: string }
}

interface Therapist {
  id: string
  name: string
  email: string
  avatar_url?: string
  specialization?: string[]
}

export default function AdminAppointmentsView() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTherapist, setFilterTherapist] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDateCalendar, setSelectedDateCalendar] = useState<Date | undefined>(new Date())
  
  // Selected appointment for actions
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load all appointments (admin view)
      const appointmentsRes = await fetch('/api/appointments/all')
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        setAppointments(appointmentsData.appointments || [])
      }

      // Load therapists for filtering
      const therapistsRes = await fetch('/api/users?role=THERAPIST')
      if (therapistsRes.ok) {
        const therapistsData = await therapistsRes.json()
        setTherapists(therapistsData.users || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.therapist?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.therapy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTherapist = filterTherapist === 'all' || apt.therapist_id === filterTherapist
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus
    const matchesDate = !filterDate || apt.scheduled_at.startsWith(filterDate)
    
    return matchesSearch && matchesTherapist && matchesStatus && matchesDate
  })

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    revenue: appointments
      .filter(a => a.payment_status === 'PAID')
      .reduce((sum, a) => sum + a.total_amount, 0),
    todayAppointments: appointments.filter(a => 
      new Date(a.scheduled_at).toDateString() === new Date().toDateString()
    ).length
  }

  const handleConfirmAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })

      if (response.ok) {
        loadData()
        setShowConfirmModal(false)
        setSelectedAppointment(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al confirmar la cita')
      }
    } catch (error) {
      console.error('Error confirming appointment:', error)
      setError('Error al confirmar la cita')
    }
  }

  const handleCancelAppointment = async (appointmentId: number, reason: string) => {
    try {
      const response = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, reason })
      })

      if (response.ok) {
        loadData()
        setShowCancelModal(false)
        setSelectedAppointment(null)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al cancelar la cita')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setError('Error al cancelar la cita')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-300'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-300'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'REFUNDED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading && appointments.length === 0) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando citas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-teal-600" />
            Gestión de Citas
            {loading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            Administrar todas las citas, calendarios de terapeutas y confirmaciones
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

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
              <Calendar className="h-4 w-4 text-teal-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600 transition-all duration-300 hover:scale-110">{stats.total}</div>
              <p className="text-xs text-gray-600">Todas las citas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 transition-all duration-300 hover:scale-110">{stats.pending}</div>
              <p className="text-xs text-gray-600">Por confirmar</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 transition-all duration-300 hover:scale-110">{stats.confirmed}</div>
              <p className="text-xs text-gray-600">Activas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <Star className="h-4 w-4 text-blue-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 transition-all duration-300 hover:scale-110">{stats.completed}</div>
              <p className="text-xs text-gray-600">Finalizadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoy</CardTitle>
              <CalendarClock className="h-4 w-4 text-cyan-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600 transition-all duration-300 hover:scale-110">{stats.todayAppointments}</div>
              <p className="text-xs text-gray-600">Citas de hoy</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-600 transition-transform duration-300 hover:scale-125 hover:rotate-12" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600 transition-all duration-300 hover:scale-110">${stats.revenue.toFixed(2)}</div>
              <p className="text-xs text-gray-600">Pagado</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-2 border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Filter className="h-5 w-5 text-teal-600" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
                <input
                  type="text"
                  placeholder="Buscar paciente, terapeuta o terapia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 hover:border-teal-300"
                />
              </div>

              <select
                value={filterTherapist}
                onChange={(e) => setFilterTherapist(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 hover:border-teal-300 bg-white text-gray-900"
              >
                <option value="all">Todos los Terapeutas</option>
                {therapists.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 hover:border-teal-300 bg-white text-gray-900"
              >
                <option value="all">Todos los Estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="COMPLETED">Completada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="NO_SHOW">No Asistió</option>
              </select>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all duration-200 hover:border-teal-300 bg-white text-gray-900"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="bg-white border-2 border-gray-200 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5 text-teal-600" />
                Lista de Citas
                <span className="ml-2 text-sm font-normal text-gray-500">({filteredAppointments.length})</span>
              </CardTitle>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105' 
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105'}
                >
                  Lista
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className={viewMode === 'calendar' 
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105' 
                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105'}
                >
                  Calendario
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'list' ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
                      <Calendar className="h-16 w-16 text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">No se encontraron citas</p>
                    <p className="text-sm text-gray-600">Prueba ajustando los filtros</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <Card 
                      key={appointment.id} 
                      className="relative bg-white border-2 border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{ transform: 'scale(1)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      }}
                    >
                      {/* Gradient accent bar */}
                      <div className="h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-t-lg" />
                      
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          {/* Date & Time */}
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg">
                              <Calendar className="h-7 w-7 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(appointment.scheduled_at)}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(appointment.scheduled_at)} ({appointment.duration_minutes} min)
                              </p>
                            </div>
                          </div>

                          {/* Client & Therapist */}
                          <div className="col-span-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Paciente:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.client?.name || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Terapeuta:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.therapist?.name || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Terapia:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.therapy?.name || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Status & Payment */}
                          <div className="space-y-2">
                            <Badge className={`${getStatusColor(appointment.status)} border`}>
                              {appointment.status}
                            </Badge>
                            <Badge className={getPaymentStatusColor(appointment.payment_status)}>
                              {appointment.payment_status} - ${appointment.total_amount}
                            </Badge>
                            {appointment.payment_method && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <CreditCard className="h-3 w-3" />
                                {appointment.payment_method}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {appointment.status === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowConfirmModal(true)
                                }}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAppointment(appointment)
                                  setShowCancelModal(true)
                                }}
                                className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-xs transition-all duration-200 hover:scale-105"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancelar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 text-xs transition-all duration-200 hover:scale-105"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Detalles
                            </Button>
                          </div>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                              <strong className="text-gray-900">Notas:</strong> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Month picker */}
                <div className="col-span-1 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border-2 border-teal-200">
                  <DayPicker
                    mode="single"
                    selected={selectedDateCalendar}
                    onSelect={(date: Date | undefined) => setSelectedDateCalendar(date)}
                    className="w-full"
                  />
                </div>

                {/* Day agenda */}
                <div className="col-span-2">
                  <div className="mb-4 flex items-center justify-between pb-4 border-b-2 border-gray-200">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-teal-600" />
                        Agenda del día
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedDateCalendar ? selectedDateCalendar.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Selecciona una fecha'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={filterTherapist}
                        onChange={(e) => setFilterTherapist(e.target.value)}
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm transition-all duration-200 hover:border-teal-300 bg-white text-gray-900"
                      >
                        <option value="all">Mostrar todos los terapeutas</option>
                        {therapists.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {(!selectedDateCalendar) && (
                      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                        <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
                          <Calendar className="h-16 w-16 text-gray-300" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900">Selecciona una fecha en el calendario para ver la agenda del día.</p>
                      </div>
                    )}

                    {selectedDateCalendar && (() => {
                      const dayISO = selectedDateCalendar.toISOString().slice(0,10)
                      const dayAppointments = appointments.filter(a => a.scheduled_at.startsWith(dayISO) && (filterTherapist === 'all' || a.therapist_id === filterTherapist))

                      if (dayAppointments.length === 0) {
                        return (
                          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
                              <Calendar className="h-16 w-16 text-gray-300" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900">No hay citas para este día.</p>
                          </div>
                        )
                      }

                      return dayAppointments.map(appointment => (
                        <Card key={appointment.id} className="relative bg-white border-2 border-gray-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300 cursor-pointer">
                          <div className="h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 rounded-t-lg" />
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-teal-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{formatTime(appointment.scheduled_at)} • {appointment.duration_minutes} min</p>
                                    <p className="text-xs text-gray-500">{appointment.therapy?.name || ''}</p>
                                  </div>
                                </div>
                                <div className="ml-12 space-y-1">
                                  <p className="text-sm text-gray-700 flex items-center gap-1">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <strong>Paciente:</strong> {appointment.client?.name || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <UserCheck className="h-3 w-3 text-gray-400" />
                                    Terapeuta: {appointment.therapist?.name || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <Badge className={`${getStatusColor(appointment.status)} border text-xs`}>{appointment.status}</Badge>
                                <div className="flex gap-2">
                                  {appointment.status === 'PENDING' && (
                                    <Button size="sm" onClick={() => { setSelectedAppointment(appointment); setShowConfirmModal(true) }} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                                      <Check className="h-3 w-3 mr-1" />Confirmar
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => { setSelectedAppointment(appointment); setShowCancelModal(true) }} className="border-2 border-red-300 text-red-600 hover:bg-red-50 text-xs transition-all duration-200 hover:scale-105">
                                    <X className="h-3 w-3 mr-1" />Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    })()}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirm Modal */}
        {showConfirmModal && selectedAppointment && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setShowConfirmModal(false)}
          >
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-200 overflow-hidden animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 absolute top-0 left-0 right-0 rounded-t-xl" />
              
              <div className="mt-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Confirmar Cita
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 mb-2 text-center">
                    ¿Confirmar la cita con <strong className="text-gray-900">{selectedAppointment.client?.name}</strong>?
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    {formatDate(selectedAppointment.scheduled_at)} • {formatTime(selectedAppointment.scheduled_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 text-gray-700 border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleConfirmAppointment(selectedAppointment.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Confirmar Cita
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && selectedAppointment && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
            onClick={() => setShowCancelModal(false)}
          >
            <div 
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-200 overflow-hidden animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 absolute top-0 left-0 right-0 rounded-t-xl" />
              
              <div className="mt-2">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-lg">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  Cancelar Cita
                </h2>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 text-center mb-2">
                    ¿Cancelar la cita con <strong className="text-gray-900">{selectedAppointment.client?.name}</strong>?
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    {formatDate(selectedAppointment.scheduled_at)} • {formatTime(selectedAppointment.scheduled_at)}
                  </div>
                </div>
                
                <textarea
                  id="cancel-reason"
                  placeholder="Motivo de cancelación (opcional)"
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-gray-900 bg-white mb-4 transition-all duration-200 hover:border-gray-400"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 text-gray-700 border-2 border-gray-300 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                >
                  Volver
                </Button>
                <Button
                  onClick={() => {
                    const reason = (document.getElementById('cancel-reason') as HTMLTextAreaElement)?.value || 'Cancelado por administrador'
                    handleCancelAppointment(selectedAppointment.id, reason)
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Cancelar Cita
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}