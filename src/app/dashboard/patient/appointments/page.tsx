"use client"

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, UserCheck, X, Eye } from 'lucide-react'

interface Appointment {
  id: number
  scheduled_at: string
  duration_minutes: number
  status: string
  total_amount: number
  payment_status: string
  notes?: string
  client?: { name: string; email?: string }
  therapist?: { id?: string; name?: string }
  therapy?: { name?: string }
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => { loadAppointments() }, [])

  async function loadAppointments() {
    try {
      setLoading(true)
      const res = await fetch('/api/appointments?role=CLIENT')
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error cargando citas')
        return
      }
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      console.error(err)
      setError('Error cargando citas')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const handleCancel = async (appointmentId: number, reason = 'Cancelado por paciente') => {
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, reason })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al cancelar')
        return
      }
      await loadAppointments()
      setShowCancelModal(false)
      setSelected(null)
    } catch (err) {
      console.error(err)
      setError('Error al cancelar la cita')
    }
  }

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-teal-600" />
            Mis Citas
          </h1>
          <p className="text-gray-600 mt-1">Aquí puedes ver y gestionar tus citas</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">{error}</div>
        )}

        <Card className="bg-white border-2 border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">Lista de Citas ({appointments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
                  <Calendar className="h-16 w-16 text-gray-300" />
                </div>
                <p className="text-lg font-semibold text-gray-900">No tienes citas programadas</p>
                <p className="text-sm text-gray-600">Visita terapias para agendar una sesión</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(apt => (
                  <div key={apt.id} className="p-4 border rounded-lg bg-white flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{apt.therapy?.name || 'Terapia'}</div>
                          <div className="text-xs text-gray-600">{apt.therapist?.name || 'Terapeuta'} • {formatDate(apt.scheduled_at)} • {formatTime(apt.scheduled_at)}</div>
                        </div>
                      </div>
                      {apt.notes && <div className="text-xs text-gray-600">Notas: {apt.notes}</div>}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-blue-100 text-blue-700">{apt.status}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelected(apt); }} className="border-2 border-blue-300 text-blue-600">
                          <Eye className="h-4 w-4 mr-1" />Ver
                        </Button>
                        <Button size="sm" onClick={() => { setSelected(apt); setShowCancelModal(true) }} className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                          <X className="h-4 w-4 mr-1" />Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Modal */}
        {showCancelModal && selected && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCancelModal(false)}>
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-200" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cancelar cita</h3>
              <p className="text-sm text-gray-600 mb-4">¿Deseas cancelar la cita con <strong>{selected.therapist?.name}</strong>?</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)}>Volver</Button>
                <Button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white" onClick={() => handleCancel(selected.id)}>Confirmar Cancelación</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
