'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { appointmentService, type Appointment } from '@/lib/appointments'
import { servicesService, type Service } from '@/lib/services'
import { Calendar, Users, DollarSign, Star, Clock, MessageSquare, Settings, LogOut, Shield } from 'lucide-react'
import Link from 'next/link'
import { getRoleFromSegment, getDashboardPathForRole, ROLE_LABELS, ROLE_SEGMENTS } from '@/lib/dashboard'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalServices: 0,
    totalRevenue: 0
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const segment = pathname?.split('/')[2] || ''
    const roleFromPath = getRoleFromSegment(segment)

    if (segment === undefined || segment === '') {
      router.replace(getDashboardPathForRole(user.role))
      return
    }

    if (roleFromPath && roleFromPath !== user.role) {
      router.replace(getDashboardPathForRole(user.role))
      return
    }

    if (!roleFromPath) {
      router.replace(getDashboardPathForRole(user.role))
      return
    }

    loadDashboardData()
  }, [user, pathname])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setDataLoading(true)
      
      // Load appointments
      const appointmentsData = await appointmentService.getAppointments(user.id, user.role)
      setAppointments(appointmentsData)

      // Load services for therapists
      if (user.role === 'THERAPIST') {
        const servicesData = await servicesService.getTherapistServices(user.id)
        setServices(servicesData)
      }

      // Calculate stats
      const upcomingAppointments = appointmentsData.filter(apt => 
        apt.status === 'CONFIRMED' && new Date(apt.scheduled_at) > new Date()
      ).length

      const totalRevenue = appointmentsData
        .filter(apt => apt.status === 'COMPLETED')
        .reduce((sum, apt) => sum + apt.price, 0)

      setStats({
        totalAppointments: appointmentsData.length,
        upcomingAppointments,
        totalServices: user.role === 'THERAPIST' ? services.length : 0,
        totalRevenue
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      router.push('/')
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getWelcomeMessage = () => `Bienvenido${user.name ? ', ' + user.name : ''} - ${ROLE_LABELS[user.role]}`

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case 'ADMIN':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Totales</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">+8% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">+15% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Terapias Activas</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 nuevas este mes</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/usuarios">
                    <Button className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Gestionar Usuarios
                    </Button>
                  </Link>
                  <Link href="/dashboard/terapias">
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Administrar Terapias
                    </Button>
                  </Link>
                  <Link href="/dashboard/reportes">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Ver Reportes
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )

      case 'THERAPIST':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Próxima en 30 min</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">+10% del mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Servicios Ofrecidos</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalServices}</div>
                  <p className="text-xs text-muted-foreground">Terapias activas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8/5</div>
                  <p className="text-xs text-muted-foreground">Basado en 50 reseñas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/calendario">
                    <Button className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver Calendario
                    </Button>
                  </Link>
                  <Link href="/dashboard/servicios">
                    <Button variant="outline" className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Mis Servicios
                    </Button>
                  </Link>
                  <Link href="/dashboard/ingresos">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Ver Ingresos
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.client?.name} - {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )

      case 'PATIENT':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {new Date(appointments[0].scheduled_at).toLocaleDateString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointments[0].scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {appointments[0].therapist?.name ? ` con ${appointments[0].therapist?.name}` : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tienes citas programadas</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Terapias Recibidas</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAppointments}</div>
                  <p className="text-xs text-muted-foreground">En los últimos 3 meses</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Nuevos mensajes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notificaciones</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/terapias">
                    <Button className="w-full justify-start">
                      <Star className="mr-2 h-4 w-4" />
                      Explorar Terapias
                    </Button>
                  </Link>
                  <Link href="/dashboard/citas">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Mis Citas
                    </Button>
                  </Link>
                  <Link href="/dashboard/perfil">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.therapist?.name} - {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No tienes citas programadas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )

      case 'RECEPTIONIST':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas de Hoy</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments.filter(apt => new Date(apt.scheduled_at).toDateString() === new Date().toDateString()).length}</div>
                  <p className="text-xs text-muted-foreground">Pendientes de confirmar</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Confirmadas</CardTitle>
                  <Badge variant="secondary">Hoy</Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'CONFIRMED').length}</div>
                  <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'PENDING').length}</div>
                  <p className="text-xs text-muted-foreground">Requieren seguimiento</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Chats activos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/dashboard/citas">
                    <Button className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Administrar Citas
                    </Button>
                  </Link>
                  <Link href="/dashboard/pacientes">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Ver Pacientes
                    </Button>
                  </Link>
                  <Link href="/dashboard/notificaciones">
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Notificaciones
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.slice(0, 5).map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.client?.name} - {new Date(appointment.scheduled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={appointment.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No hay citas registradas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {ROLE_LABELS[user.role]}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {dataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          getRoleSpecificContent()
        )}
      </main>
    </div>
  )
}