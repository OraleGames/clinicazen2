"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Star, 
  Settings, 
  MessageSquare,
  Search,
  Activity,
  HeartPulse,
  Sparkles,
  FileText
} from 'lucide-react'
import Link from 'next/link'

export default function PatientDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Próxima Cita",
      value: "Hoy, 3:00 PM",
      icon: Calendar,
      color: "text-teal-600",
      bg: "bg-teal-500",
      cardBg: "bg-gradient-to-br from-teal-50 to-teal-100",
      border: "border-teal-200"
    },
    {
      title: "Terapias Completadas",
      value: "12",
      change: "+3",
      icon: Star,
      color: "text-cyan-600",
      bg: "bg-cyan-500",
      cardBg: "bg-gradient-to-br from-cyan-50 to-cyan-100",
      border: "border-cyan-200"
    },
    {
      title: "Mensajes",
      value: "3",
      change: "+2",
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-500",
      cardBg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200"
    },
    {
      title: "Salud Wellness",
      value: "85%",
      change: "+5%",
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-500",
      cardBg: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      border: "border-indigo-200"
    }
  ]

  const upcomingAppointments = [
    {
      id: 1,
      therapistName: "Dra. María López",
      service: "Biomagnetismo",
      date: "Hoy",
      time: "3:00 PM",
      status: "confirmed"
    },
    {
      id: 2,
      therapistName: "Dr. Carlos Ruiz",
      service: "Acupuntura",
      date: "Mañana",
      time: "10:00 AM",
      status: "confirmed"
    },
    {
      id: 3,
      therapistName: "Lic. Ana Martínez",
      service: "Psicología Clínica",
      date: "Viernes",
      time: "2:00 PM",
      status: "confirmed"
    }
  ]

  return (
    <DashboardLayout role="patient">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Hola, <span className="text-teal-600">{user?.name?.split(' ')[0] || 'Paciente'}</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Bienvenido a tu espacio de bienestar.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/patient/terapias">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200">
                <Search className="mr-2 h-4 w-4" />
                Buscar Terapeuta
              </Button>
            </Link>
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
                  {stat.change && <span className={`${stat.color} font-bold`}>{stat.change}</span>}
                  {stat.change && <span className="ml-1">este mes</span>}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Quick Actions */}
          <div className="space-y-8">
             <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-teal-100">
              <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 rounded-t-xl border-b border-teal-100">
                <CardTitle className="flex items-center gap-2 text-teal-900">
                  <div className="bg-cyan-500 p-2 rounded-lg shadow-md">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  Acciones Rápidas
                </CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Gestiona tu bienestar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Link href="/dashboard/patient/terapias">
                  <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transition-all">
                    <Search className="mr-2 h-4 w-4" />
                    Buscar Terapeutas
                  </Button>
                </Link>
                <Link href="/dashboard/patient/appointments">
                  <Button variant="outline" className="w-full justify-start border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                    Ver Todas mis Citas
                  </Button>
                </Link>
                <Link href="/dashboard/patient/history">
                  <Button variant="outline" className="w-full justify-start border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all">
                    <FileText className="mr-2 h-4 w-4 text-cyan-600" />
                    Historial de Terapias
                  </Button>
                </Link>
                <Link href="/dashboard/patient/profile">
                  <Button variant="outline" className="w-full justify-start border-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                    <Settings className="mr-2 h-4 w-4 text-emerald-600" />
                    Mi Perfil
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 rounded-t-xl border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <div className="bg-purple-500 p-2 rounded-lg shadow-md">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  Tu Progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 shadow-sm">
                    <div>
                      <div className="font-bold text-emerald-900 text-sm">Reducción de Estrés</div>
                      <div className="text-xs text-emerald-700 font-semibold mt-1">Mejora del 40%</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 shadow-inner">
                      <Activity className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-sm">
                    <div>
                      <div className="font-bold text-blue-900 text-sm">Calidad del Sueño</div>
                      <div className="text-xs text-blue-700 font-semibold mt-1">Mejora del 25%</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 shadow-inner">
                      <HeartPulse className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Upcoming Appointments (Takes up 2 columns) */}
          <Card className="lg:col-span-2 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-teal-100">
            <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 rounded-t-xl border-b border-teal-100">
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <div className="bg-cyan-500 p-2 rounded-lg shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                Próximas Citas
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Tu agenda de terapias
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, idx) => {
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
                          <p className="text-sm font-bold text-slate-800">{appointment.date}</p>
                          <p className="text-xs text-slate-500">{appointment.time}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{appointment.therapistName}</h4>
                          <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Activity className="h-3 w-3" />
                            {appointment.service}
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
        </div>
      </div>
    </DashboardLayout>
  )
}