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
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Package,
  FileText,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user } = useAuth()

  const stats = [
    {
      title: "Usuarios Totales",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Citas Hoy",
      value: "24",
      change: "+8%",
      icon: Calendar,
      color: "from-teal-500 to-teal-600"
    },
    {
      title: "Ingresos Mensuales",
      value: "$12,450",
      change: "+15%",
      icon: DollarSign,
      color: "from-cyan-500 to-cyan-600"
    },
    {
      title: "Terapias Activas",
      value: "8",
      change: "+3",
      icon: Star,
      color: "from-indigo-500 to-indigo-600"
    }
  ]

  const recentAppointments = [
    {
      id: 1,
      clientName: "María González",
      service: "Biomagnetismo",
      time: "10:00 AM",
      status: "confirmed"
    },
    {
      id: 2,
      clientName: "Carlos Rodríguez",
      service: "Acupuntura",
      time: "11:30 AM",
      status: "pending"
    },
    {
      id: 3,
      clientName: "Ana Martínez",
      service: "Psicología Clínica",
      time: "2:00 PM",
      status: "confirmed"
    }
  ]

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona usuarios, citas y servicios de la clínica
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const colors = [
              { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', icon: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200' },
              { bg: 'bg-gradient-to-br from-teal-50 to-teal-100', icon: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200' },
              { bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100', icon: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200' },
              { bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', icon: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200' }
            ];
            const colorScheme = colors[index % colors.length];
            
            return (
              <Card key={index} className={`${colorScheme.bg} border-2 ${colorScheme.border} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                  <div className={`${colorScheme.icon} p-2.5 rounded-xl shadow-md`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${colorScheme.text}`}>{stat.value}</div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    <span className={`${colorScheme.text} font-bold`}>{stat.change}</span> desde el mes pasado
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-teal-50 rounded-t-xl border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <div className="bg-teal-500 p-2 rounded-lg shadow-md">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Acciones Rápidas
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Gestión administrativa del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <Link href="/dashboard/admin/users">
                <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-md hover:shadow-lg transition-all">
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Button>
              </Link>
              <Link href="/dashboard/admin/management">
                <Button variant="outline" className="w-full justify-start border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <Package className="mr-2 h-4 w-4 text-blue-600" />
                  Gestión de Contenido
                </Button>
              </Link>
              <Link href="/dashboard/admin/blog">
                <Button variant="outline" className="w-full justify-start border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all">
                  <FileText className="mr-2 h-4 w-4 text-teal-600" />
                  Blog
                </Button>
              </Link>
              <Link href="/dashboard/admin/appointment-management">
                <Button variant="outline" className="w-full justify-start border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all">
                  <Calendar className="mr-2 h-4 w-4 text-cyan-600" />
                  Gestión de Citas y Calendarios
                </Button>
              </Link>
              <Link href="/dashboard/admin/analytics">
                <Button variant="outline" className="w-full justify-start border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                  <TrendingUp className="mr-2 h-4 w-4 text-indigo-600" />
                  Ver Análisis
                </Button>
              </Link>
              <Link href="/dashboard/admin/checkin">
                <Button variant="outline" className="w-full justify-start border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                  Check-in de Pacientes
                </Button>
              </Link>
              <Link href="/dashboard/admin/notifications">
                <Button variant="outline" className="w-full justify-start border-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all">
                  <MessageSquare className="mr-2 h-4 w-4 text-teal-600" />
                  Enviar Notificaciones
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-teal-100">
            <CardHeader className="bg-gradient-to-r from-teal-50 via-white to-cyan-50 rounded-t-xl border-b border-teal-100">
              <CardTitle className="flex items-center gap-2 text-teal-900">
                <div className="bg-cyan-500 p-2 rounded-lg shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Citas Recientes
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Últimas citas programadas en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentAppointments.map((appointment, idx) => {
                  const appointmentColors = [
                    { bg: 'bg-gradient-to-r from-blue-50 to-blue-100', border: 'border-blue-200', badge: 'bg-teal-500' },
                    { bg: 'bg-gradient-to-r from-teal-50 to-teal-100', border: 'border-teal-200', badge: 'bg-cyan-500' },
                    { bg: 'bg-gradient-to-r from-cyan-50 to-cyan-100', border: 'border-cyan-200', badge: 'bg-blue-500' }
                  ];
                  const colorScheme = appointmentColors[idx % appointmentColors.length];
                  
                  return (
                    <div key={appointment.id} className={`flex items-center justify-between p-4 border-2 ${colorScheme.border} ${colorScheme.bg} rounded-xl shadow-md hover:shadow-lg transition-all duration-300`}>
                      <div>
                        <p className="font-bold text-gray-900">{appointment.clientName}</p>
                        <p className="text-sm text-gray-700 font-medium">{appointment.service}</p>
                        <p className="text-xs text-teal-600 font-semibold mt-1">{appointment.time}</p>
                      </div>
                      <Badge 
                        className={`capitalize ${appointment.status === 'confirmed' ? colorScheme.badge + ' text-white hover:opacity-90' : 'bg-gray-300 text-gray-700'} shadow-sm`}
                      >
                        {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-cyan-100">
          <CardHeader className="bg-gradient-to-r from-cyan-50 via-white to-blue-50 rounded-t-xl border-b border-cyan-100">
            <CardTitle className="text-cyan-900 font-bold">Estado del Sistema</CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Visión general del funcionamiento de la clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-teal-200">
                <div className="text-4xl font-bold text-teal-600">98%</div>
                <div className="text-sm text-gray-700 font-semibold mt-2">Tasa de Confirmación</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-200">
                <div className="text-4xl font-bold text-blue-600">4.8</div>
                <div className="text-sm text-gray-700 font-semibold mt-2">Satisfacción Promedio</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-cyan-200">
                <div className="text-4xl font-bold text-cyan-600">+23%</div>
                <div className="text-sm text-gray-700 font-semibold mt-2">Crecimiento Mensual</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}