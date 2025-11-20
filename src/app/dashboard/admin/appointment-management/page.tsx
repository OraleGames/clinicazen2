"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Eye,
  EyeOff
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

interface DatabaseAppointment {
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
  cancellation_deadline_hours: number
  google_calendar_event_id?: string
  created_at: string
  updated_at: string
  client?: {
    name: string
    email: string
  }
  therapist?: {
    name: string
    email: string
  }
  therapy?: {
    name: string
    duration_minutes: number
    price: number
  }
}

interface DatabaseTherapistAvailability {
  id: string
  therapist_id: string
  day_of_week?: number
  start_time: string
  end_time: string
  is_available: boolean
  date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export default function AdminAppointmentsManagement() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<DatabaseAppointment[]>([])
  const [therapists, setTherapists] = useState<DatabaseUser[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [availability, setAvailability] = useState<DatabaseTherapistAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Load appointments when therapist or date changes
  useEffect(() => {
    if (selectedTherapist) {
      loadAppointments()
      loadAvailability()
    }
  }, [selectedTherapist, selectedDate])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load therapists
      const therapistsResponse = await fetch('/api/users?role=THERAPIST')
      if (therapistsResponse.ok) {
        const therapistsData = await therapistsResponse.json()
        setTherapists(therapistsData.users)
      }

      // Load all appointments
      const appointmentsResponse = await fetch('/api/appointments')
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData.appointments)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    if (!selectedTherapist) return

    try {
      const response = await fetch(`/api/appointments?role=THERAPIST`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    }
  }

  const loadAvailability = async () => {
    if (!selectedTherapist || !selectedDate) return

    try {
      const response = await fetch(`/api/availability?therapistId=${selectedTherapist}&date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailability(data.availability)
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    }
  }

  const filteredAppointments = appointments.filter(apt => 
    apt.therapist_id === selectedTherapist &&
    new Date(apt.scheduled_at).toDateString() === new Date(selectedDate).toDateString()
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'NO_SHOW': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmada'
      case 'PENDING': return 'Pendiente'
      case 'CANCELLED': return 'Cancelada'
      case 'COMPLETED': return 'Completada'
      case 'NO_SHOW': return 'No asistió'
      default: return status
    }
  }

  const handleAppointmentAction = async (appointmentId: number, action: string) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          action
        })
      })

      if (response.ok) {
        // Reload appointments
        loadAppointments()
      } else {
        setError('Error al actualizar la cita')
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      setError('Error al actualizar la cita')
    }
  }

  const handleAvailabilityToggle = async (availabilityId: string) => {
    try {
      const response = await fetch('/api/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availabilityId,
          is_available: !availability.find(a => a.id === availabilityId)?.is_available
        })
      })

      if (response.ok) {
        // Reload availability
        loadAvailability()
      } else {
        setError('Error al actualizar disponibilidad')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      setError('Error al actualizar disponibilidad')
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Citas y Calendarios
          </h1>
          <p className="text-gray-600">
            Visualiza y gestiona las citas de todos los terapeutas
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

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Therapist Selection */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Seleccionar Terapeuta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <select
                  value={selectedTherapist || ''}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
                >
                  <option value="">Todos los terapeutas</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name || therapist.email}
                    </option>
                  ))}
                </select>

                {selectedTherapist && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Terapeuta seleccionado:</strong> {therapists.find(t => t.id === selectedTherapist)?.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seleccionar Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* View Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Vista</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={view === 'calendar' ? 'default' : 'outline'}
                  onClick={() => setView('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendario
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  onClick={() => setView('list')}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Lista
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && selectedTherapist && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Calendario de Citas</CardTitle>
                <CardDescription>
                  Citas para {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay citas programadas para este día
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {appointment.client?.name || 'Cliente'}
                              </h4>
                              <Badge className={getStatusColor(appointment.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(appointment.status)}
                                  {getStatusText(appointment.status)}
                                </div>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {appointment.therapy?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(appointment.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {appointment.duration_minutes} min
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 mt-2">
                                Notas: {appointment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {appointment.status === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidad</CardTitle>
                <CardDescription>
                  Gestiona la disponibilidad del terapeuta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availability.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay disponibilidad configurada para este día
                    </div>
                  ) : (
                    availability.map((slot) => (
                      <div key={slot.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {slot.start_time} - {slot.end_time}
                              </h4>
                              <Badge variant={slot.is_available ? 'default' : 'secondary'}>
                                {slot.is_available ? 'Disponible' : 'No disponible'}
                              </Badge>
                            </div>
                            {slot.notes && (
                              <p className="text-sm text-gray-600">
                                Notas: {slot.notes}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAvailabilityToggle(slot.id)}
                          >
                            {slot.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Todas las Citas
                <span className="ml-2 text-sm text-gray-500">({appointments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay citas programadas
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {appointment.client?.name || 'Cliente'}
                            </h4>
                            <Badge className={getStatusColor(appointment.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(appointment.status)}
                                {getStatusText(appointment.status)}
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Terapeuta:</strong> {appointment.therapist?.name}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Servicio:</strong> {appointment.therapy?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Fecha y hora:</strong> {new Date(appointment.scheduled_at).toLocaleString('es-ES')}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Duración:</strong> {appointment.duration_minutes} minutos
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Precio:</strong> ${appointment.price}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              <strong>Notas:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'confirm')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'cancel')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}