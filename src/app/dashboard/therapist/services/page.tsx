"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Save,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string
  image_url?: string
  price: number // suggested price
  duration_minutes: number
  category?: { name: string }
}

interface TherapistService {
  service_id: number
  price: number
  enabled: boolean
}

export default function TherapistServicesPage() {
  const { user } = useAuth()
  const [allServices, setAllServices] = useState<Service[]>([])
  const [therapistServices, setTherapistServices] = useState<Map<number, TherapistService>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  async function loadData() {
    try {
      setLoading(true)

      // Load all available services
      const servicesRes = await fetch('/api/therapies')
      if (servicesRes.ok) {
        const data = await servicesRes.json()
        setAllServices(data.services || [])
      }

      // Load therapist's current services
      if (user?.id) {
        const myServicesRes = await fetch(`/api/therapist/services?therapistId=${user.id}`)
        if (myServicesRes.ok) {
          const data = await myServicesRes.json()
          const servicesMap = new Map<number, TherapistService>()
          data.services?.forEach((service: any) => {
            servicesMap.set(service.service_id, {
              service_id: service.service_id,
              price: service.price,
              enabled: true
            })
          })
          setTherapistServices(servicesMap)
        }
      }
    } catch (err) {
      console.error('Error loading services:', err)
    } finally {
      setLoading(false)
    }
  }

  function toggleService(serviceId: number, suggestedPrice: number) {
    const newMap = new Map(therapistServices)
    
    if (newMap.has(serviceId)) {
      // Remove service
      newMap.delete(serviceId)
    } else {
      // Add service with suggested price
      newMap.set(serviceId, {
        service_id: serviceId,
        price: suggestedPrice,
        enabled: true
      })
    }
    
    setTherapistServices(newMap)
    setHasChanges(true)
  }

  function updatePrice(serviceId: number, newPrice: number) {
    const service = therapistServices.get(serviceId)
    if (service) {
      const newMap = new Map(therapistServices)
      newMap.set(serviceId, { ...service, price: newPrice })
      setTherapistServices(newMap)
      setHasChanges(true)
    }
  }

  async function saveServices() {
    if (!user?.id) return

    try {
      setSaving(true)
      setSuccessMessage('')

      // Convert map to array
      const services = Array.from(therapistServices.values())

      const res = await fetch('/api/therapist/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapistId: user.id,
          services
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error saving services')
      }

      setHasChanges(false)
      setSuccessMessage('¡Servicios guardados exitosamente!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      console.error('Error saving services:', err)
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const enabledCount = therapistServices.size
  const totalRevenue = Array.from(therapistServices.values()).reduce((sum, s) => sum + s.price, 0)

  return (
    <DashboardLayout role="therapist">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
              Mis Servicios
            </h1>
            <p className="text-gray-600 mt-2">
              Selecciona las terapias que ofreces y establece tus precios
            </p>
          </div>
          {hasChanges && (
            <Button
              onClick={saveServices}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              size="lg"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                Servicios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{enabledCount}</div>
              <p className="text-xs text-gray-600 mt-1">terapias ofrecidas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                Precio Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${enabledCount > 0 ? Math.round(totalRevenue / enabledCount) : 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">por sesión</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                Disponibles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {allServices.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">terapias en catálogo</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Catálogo de Terapias
            </CardTitle>
            <CardDescription>
              Activa las terapias que deseas ofrecer y establece tu precio
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando servicios...</p>
              </div>
            ) : allServices.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900">No hay terapias disponibles</p>
                <p className="text-sm text-gray-600">Contacta al administrador para agregar terapias</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allServices.map(service => {
                  const isEnabled = therapistServices.has(service.id)
                  const therapistService = therapistServices.get(service.id)

                  return (
                    <Card 
                      key={service.id}
                      className={`overflow-hidden transition-all duration-200 ${
                        isEnabled 
                          ? 'border-2 border-blue-500 shadow-lg' 
                          : 'border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {service.image_url && (
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {service.name}
                            </h3>
                            {service.category && (
                              <Badge variant="secondary" className="text-xs">
                                {service.category.name}
                              </Badge>
                            )}
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => toggleService(service.id, service.price)}
                          />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {service.description}
                        </p>

                        {/* Details */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>Sugerido: ${service.price}</span>
                          </div>
                        </div>

                        {/* Price Input (only when enabled) */}
                        {isEnabled && (
                          <div className="pt-3 border-t">
                            <label className="text-xs font-medium text-gray-700 block mb-2">
                              Tu Precio
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="number"
                                  value={therapistService?.price || service.price}
                                  onChange={(e) => updatePrice(service.id, parseFloat(e.target.value) || 0)}
                                  className="pl-8"
                                  min="0"
                                  step="5"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
