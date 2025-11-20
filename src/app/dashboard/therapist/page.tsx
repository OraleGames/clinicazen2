"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Settings, 
  Users,
  Clock,
  MessageSquare,
  Heart,
  Activity,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function TherapistDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Citas de Hoy",
      value: "6",
      change: "+2",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-500",
      cardBg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200"
    },
    {
      title: "Ingresos Semana",
      value: "$2,340",
      change: "+12%",
      icon: DollarSign,
      color: "text-teal-600",
      bg: "bg-teal-500",
      cardBg: "bg-gradient-to-br from-teal-50 to-teal-100",
      border: "border-teal-200"
    },
    {
      title: "Pacientes Activos",
      value: "45",
      change: "+3",
      icon: Users,
      color: "text-cyan-600",
      bg: "bg-cyan-500",
      cardBg: "bg-gradient-to-br from-cyan-50 to-cyan-100",
      border: "border-cyan-200"
    },
    {
      title: "Satisfacción",
      value: "4.9/5",
      change: "+0.2",
      icon: Star,
      color: "text-indigo-600",
      bg: "bg-indigo-500",
      cardBg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      border: "border-indigo-200"
    }
  ]

  const todayAppointments = [
    {
      id: 1,
      clientName: "María González",
      service: "Biomagnetismo",
      time: "10:00 AM",
      duration: "60 min",
      status: "confirmed"
    },
    {
      id: 2,
      clientName: "Carlos Rodríguez", 
      service: "Acupuntura",
      time: "11:30 AM",
      duration: "45 min",
      status: "confirmed"
    },
    {
      id: 3,
      clientName: "Ana Martínez",
      service: "Biomagnetismo",
      time: "2:00 PM",
      duration: "60 min",
      status: "pending"
    }
  ]

  return (
    <DashboardLayout role="therapist">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Hola, <span className="text-teal-600">{user?.name?.split(' ')[0] || 'Doctor'}</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Aquí está el resumen de tu actividad hoy.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Agenda
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.cardBg} border-2 ${stat.border} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`${stat.bg} p-2.5 rounded-xl shadow-md`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  <span className={`${stat.color} font-bold`}>{stat.change}</span> vs semana pasada
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule - Takes up 2 columns */}
          <Card className="lg:col-span-2 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-teal-100">
            <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 rounded-t-xl border-b border-teal-100">
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <div className="bg-cyan-500 p-2 rounded-lg shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Agenda de Hoy
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Tienes {todayAppointments.length} citas programadas para hoy
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {todayAppointments.map((appointment, idx) => {
                  const colors = [
                    { bg: 'bg-gradient-to-r from-blue-50 to-blue-100', border: 'border-blue-200', badge: 'bg-teal-500' },
                    { bg: 'bg-gradient-to-r from-teal-50 to-teal-100', border: 'border-teal-200', badge: 'bg-cyan-500' },
                    { bg: 'bg-gradient-to-r from-cyan-50 to-cyan-100', border: 'border-cyan-200', badge: 'bg-blue-500' }
                  ];
                  const colorScheme = colors[idx % colors.length];

                  return (
                    <div key={appointment.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 ${colorScheme.border} ${colorScheme.bg} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group`}>
                      <div className="flex items-start gap-4">
                        <div className="bg-white p-3 rounded-lg border border-slate-100 text-center min-w-[80px] shadow-sm">
                          <p className="text-sm font-bold text-slate-800">{appointment.time.split(' ')[0]}</p>
                          <p className="text-xs text-slate-500">{appointment.time.split(' ')[1]}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{appointment.clientName}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Activity className="h-3 w-3" />
                            {appointment.service}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Duración: {appointment.duration}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 self-end sm:self-center">
                        <Badge 
                          className={`capitalize ${appointment.status === 'confirmed' ? colorScheme.badge + ' text-white hover:opacity-90' : 'bg-gray-300 text-gray-700'} shadow-sm`}
                        >
                          {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Quick Actions & Performance */}
          <div className="space-y-8">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-teal-50 rounded-t-xl border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <div className="bg-teal-500 p-2 rounded-lg shadow-md">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Link href="/dashboard/therapist/schedule">
                  <Button variant="outline" className="w-full justify-start border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all">
                    <Calendar className="mr-2 h-4 w-4 text-teal-600" />
                    Gestionar Calendario
                  </Button>
                </Link>
                <Link href="/dashboard/therapist/profile">
                  <Button variant="outline" className="w-full justify-start border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all">
                    <Settings className="mr-2 h-4 w-4 text-cyan-600" />
                    Editar Perfil
                  </Button>
                </Link>
                <Link href="/dashboard/therapist/services">
                  <Button variant="outline" className="w-full justify-start border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <Star className="mr-2 h-4 w-4 text-blue-600" />
                    Mis Servicios
                  </Button>
                </Link>
                <Link href="/dashboard/therapist/patients">
                  <Button variant="outline" className="w-full justify-start border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                    <Users className="mr-2 h-4 w-4 text-indigo-600" />
                    Ver Pacientes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-cyan-100">
              <CardHeader className="bg-gradient-to-r from-cyan-50 via-white to-blue-50 rounded-t-xl border-b border-cyan-100">
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                  <div className="bg-blue-500 p-2 rounded-lg shadow-md">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  Tu Desempeño
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border-2 border-teal-200 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">Asistencia</span>
                    <span className="font-bold text-teal-600 text-lg">98%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">Calificación</span>
                    <span className="font-bold text-cyan-600 text-lg">4.9</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                    <span className="text-sm font-semibold text-gray-700">Retención</span>
                    <span className="font-bold text-blue-600 text-lg">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}