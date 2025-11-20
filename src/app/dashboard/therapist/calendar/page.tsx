"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Save,
  Clock, 
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { t } from '@/lib/i18n'

// Time slots from 9 AM to 8 PM (hour slots)
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
]

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface AvailabilitySlot {
  day: number // 0-6
  hour: string // '09:00'
  available: boolean
}

export default function TherapistCalendarDashboard() {
  const { user } = useAuth()
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadAvailability()
      loadAppointments()
    }
  }, [user])

  async function loadAvailability() {
    if (!user?.id) return
    try {
      setLoading(true)
      const res = await fetch(`/api/availability?therapistId=${user.id}`)
      if (!res.ok) {
        console.error('Failed to load availability')
        return
      }
      const data = await res.json()
      
      // Convert DB format to grid format
      const slots: AvailabilitySlot[] = []
      if (data.availability && Array.isArray(data.availability)) {
        data.availability.forEach((slot: any) => {
          // Parse time range and create hourly slots
          const startHour = parseInt(slot.start_time.split(':')[0])
          const endHour = parseInt(slot.end_time.split(':')[0])
          
          for (let hour = startHour; hour < endHour; hour++) {
            slots.push({
              day: slot.day_of_week,
              hour: `${hour.toString().padStart(2, '0')}:00`,
              available: slot.is_available
            })
          }
        })
      }
      setAvailability(slots)
    } catch (err) {
      console.error('Error loading availability', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadAppointments() {
    if (!user?.id) return
    try {
      const res = await fetch('/api/appointments?role=THERAPIST')
      if (!res.ok) return
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error('Error loading appointments', err)
    }
  }

  function isSlotAvailable(day: number, hour: string): boolean {
    return availability.some(slot => 
      slot.day === day && slot.hour === hour && slot.available
    )
  }

  function toggleSlot(day: number, hour: string) {
    const exists = availability.find(s => s.day === day && s.hour === hour)
    
    if (exists) {
      setAvailability(prev => 
        prev.map(s => 
          s.day === day && s.hour === hour 
            ? { ...s, available: !s.available }
            : s
        )
      )
    } else {
      setAvailability(prev => [...prev, { day, hour, available: true }])
    }
    setHasChanges(true)
  }

  async function saveAvailability() {
    if (!user?.id) return
    try {
      setSaving(true)
      
      // Group slots by day and create time ranges
      const slotsByDay: Record<number, string[]> = {}
      availability.filter(s => s.available).forEach(slot => {
        if (!slotsByDay[slot.day]) slotsByDay[slot.day] = []
        slotsByDay[slot.day].push(slot.hour)
      })

      // Convert to DB format (start_time, end_time per day)
      const dbSlots = Object.entries(slotsByDay).map(([day, hours]) => {
        hours.sort()
        const startTime = hours[0]
        const lastHour = hours[hours.length - 1]
        const endHour = parseInt(lastHour.split(':')[0]) + 1
        const endTime = `${endHour.toString().padStart(2, '0')}:00`
        
        return {
          therapist_id: user.id,
          day_of_week: parseInt(day),
          start_time: startTime,
          end_time: endTime,
          is_available: true
        }
      })

      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          therapistId: user.id, 
          slots: dbSlots 
        })
      })

      if (!res.ok) {
        console.error('Failed to save availability')
        return
      }

      setHasChanges(false)
      await loadAvailability()
    } catch (err) {
      console.error('Error saving availability', err)
    } finally {
      setSaving(false)
    }
  }

  async function confirmAppointment(appointmentId: number) {
    try {
      const res = await fetch('/api/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Error confirming appointment:', data.error)
        return
      }

      // Reload appointments to reflect the change
      await loadAppointments()
    } catch (err) {
      console.error('Error confirming appointment:', err)
    }
  }

  const stats = {
    today: appointments.filter(a => 
      (a.scheduled_at || a.date || '').startsWith(new Date().toISOString().slice(0,10))
    ).length,
    week: appointments.filter(a => {
      const aptDate = new Date(a.scheduled_at || a.date)
      const today = new Date()
      const day = today.getDay()
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - day)
      weekStart.setHours(0,0,0,0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23,59,59,999)
      return aptDate >= weekStart && aptDate <= weekEnd
    }).length,
    confirmed: appointments.filter(a => 
      (a.status || '').toString().toUpperCase() === 'CONFIRMED'
    ).length,
    revenue: appointments
      .filter(a => (a.status || '').toString().toUpperCase() === 'CONFIRMED')
      .reduce((sum, a) => sum + ((a.total_amount ?? a.price ?? 0) as number), 0)
  }

  return (
    <DashboardLayout role="therapist">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
        {/* Medical-themed Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl shadow-xl">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Mi Disponibilidad
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Selecciona los horarios en los que estás disponible para sesiones
              </p>
            </div>
          </div>
          {hasChanges && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="animate-pulse h-3 w-3 bg-white rounded-full"></div>
                <span className="font-medium">Tienes cambios sin guardar</span>
              </div>
              <Button
                onClick={saveAvailability}
                disabled={saving}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md"
                size="lg"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          )}
        </div>

        {/* Medical Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Hoy</CardTitle>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {stats.today}
              </div>
              <p className="text-sm text-gray-500 mt-1">citas programadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Esta Semana</CardTitle>
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-md">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                {stats.week}
              </div>
              <p className="text-sm text-gray-500 mt-1">citas en total</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Confirmadas</CardTitle>
              <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                {stats.confirmed}
              </div>
              <p className="text-sm text-gray-500 mt-1">citas confirmadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Ingresos</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                ${stats.revenue}
              </div>
              <p className="text-sm text-gray-500 mt-1">este mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Medical Calendar Grid */}
        <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800">
                  Calendario Semanal
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  🩺 Haz clic en las celdas para marcar/desmarcar tu disponibilidad médica
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-500 font-medium">Cargando disponibilidad...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header Row with Medical Theme */}
                  <div className="grid grid-cols-8 gap-3 mb-4">
                    <div className="text-xs font-bold text-gray-500 text-center py-3 px-2 bg-gray-50 rounded-xl">
                      ⏰ HORA
                    </div>
                    {DAY_NAMES_FULL.map((day, idx) => (
                      <div 
                        key={idx}
                        className="text-sm font-bold text-center py-3 px-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white rounded-xl shadow-md"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots Grid with Medical Styling */}
                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid grid-cols-8 gap-3 mb-3">
                      <div className="text-sm font-bold text-gray-700 flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl py-4 shadow-sm border border-gray-200">
                        {time}
                      </div>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                        const available = isSlotAvailable(day, time)
                        return (
                          <button
                            key={day}
                            onClick={() => toggleSlot(day, time)}
                            className={`
                              py-4 rounded-xl transition-all duration-300 border-2 relative overflow-hidden group
                              ${available 
                                ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 border-emerald-500 shadow-lg hover:shadow-xl hover:scale-105' 
                                : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 shadow-sm hover:shadow-md'
                              }
                            `}
                            title={available ? 'Disponible - Click para desmarcar' : 'No disponible - Click para marcar'}
                          >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                            {available ? (
                              <div className="flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-white drop-shadow-md" />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                                <XCircle className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments with Medical Theme */}
        {appointments.length > 0 && (
          <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Próximas Citas Médicas
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    📋 Gestiona tus consultas programadas
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {appointments.slice(0, 5).map((apt) => (
                  <div 
                    key={apt.id}
                    className="group relative flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                    <div className="flex items-center gap-4 flex-1 relative">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {apt.client_name?.charAt(0) || 'P'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg">
                          {apt.client_name || 'Cliente'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <p className="text-sm text-gray-600 font-medium">
                            {new Date(apt.scheduled_at || apt.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {apt.service_name && (
                          <p className="text-sm text-gray-500 mt-1">
                            🩺 {apt.service_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 relative">
                      <Badge 
                        className={`
                          px-4 py-2 font-semibold shadow-md
                          ${apt.status === 'CONFIRMED' || apt.status === 'confirmed'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                            : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          }
                        `}
                      >
                        {apt.status === 'CONFIRMED' || apt.status === 'confirmed' ? '✓ Confirmada' : '⏳ Pendiente'}
                      </Badge>
                      {(apt.status === 'PENDING' || apt.status === 'pending') && (
                        <Button
                          size="lg"
                          onClick={() => confirmAppointment(apt.id)}
                          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Confirmar Cita
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-md flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Horario Disponible</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-gray-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Horario No Disponible</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}