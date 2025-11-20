"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Textarea from '@/components/ui/textarea'
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  CheckCircle2,
  ArrowLeft,
  Star,
  MapPin,
  Award,
  Heart
} from 'lucide-react'
import Link from 'next/link'

interface Service {
  id: number
  name: string
  description: string
  extended_description?: string
  full_description?: string
  image_url?: string
  image_url_2?: string
  image_url_3?: string
  video_url?: string
  price: number
  duration_minutes: number
  category?: { name: string }
  symptoms?: Array<{ symptom: { name: string } }>
  diseases?: Array<{ disease: { name: string } }>
}

interface Therapist {
  id: string
  name: string
  email: string
  bio?: string
  avatar_url?: string
  phone?: string
  rating?: number
  reviews_count?: number
  specialties?: string[]
  experience_years?: number
}

interface Testimonial {
  id: number
  author: string
  avatar?: string
  rating: number
  comment: string
  date: string
}

interface TimeSlot {
  date: string
  time: string
  available: boolean
}

export default function TherapyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select-therapist' | 'select-time' | 'confirm'>('select-therapist')
  const [activeTab, setActiveTab] = useState<'overview' | 'therapists' | 'testimonials'>('overview')
  const [showTherapistCalendar, setShowTherapistCalendar] = useState(false)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingTestimonials, setLoadingTestimonials] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadServiceAndTherapists()
    }
  }, [params.id])

  useEffect(() => {
    if (selectedTherapist && selectedDate) {
      loadAvailability()
    }
  }, [selectedTherapist, selectedDate])

  useEffect(() => {
    if (activeTab === 'testimonials' && params.id && testimonials.length === 0) {
      loadTestimonials()
    }
  }, [activeTab, params.id])

  // Generate next 14 days
  const getAvailableDates = (): string[] => {
    const dates: string[] = []
    for (let i = 0; i < 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  async function loadServiceAndTherapists() {
    try {
      setLoading(true)
      setError(null)

      // Load service details
      const serviceRes = await fetch(`/api/therapies/${params.id}`)
      if (!serviceRes.ok) throw new Error('Service not found')
      const serviceData = await serviceRes.json()
      setService(serviceData.service)

      // Load therapists offering this service
      const therapistsRes = await fetch(`/api/therapies/${params.id}/therapists`)
      if (!therapistsRes.ok) throw new Error('Failed to load therapists')
      const therapistsData = await therapistsRes.json()
      setTherapists(therapistsData.therapists || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadAvailability() {
    if (!selectedTherapist || !selectedDate) return
    
    try {
      const res = await fetch(`/api/availability/slots?therapistId=${selectedTherapist.id}&date=${selectedDate}`)
      if (!res.ok) throw new Error('Failed to load availability')
      const data = await res.json()
      setAvailableSlots(data.slots || [])
    } catch (err) {
      console.error('Error loading availability:', err)
      setAvailableSlots([])
    }
  }

  async function loadTestimonials() {
    if (!params.id) return
    
    try {
      setLoadingTestimonials(true)
      const res = await fetch(`/api/testimonials?therapy_id=${params.id}`)
      if (!res.ok) throw new Error('Failed to load testimonials')
      const data = await res.json()
      setTestimonials(data.testimonials || [])
    } catch (err) {
      console.error('Error loading testimonials:', err)
      setTestimonials([])
    } finally {
      setLoadingTestimonials(false)
    }
  }

  async function handleBooking() {
    if (!user) {
      router.push('/login?redirect=/terapias/' + params.id)
      return
    }

    if (!selectedTherapist || !selectedDate || !selectedTime || !service) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setBooking(true)
      setError(null)

      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`)

      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          therapist_id: selectedTherapist.id,
          service_id: service.id,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: service.duration_minutes,
          price: service.price,
          notes
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Error al reservar')
      }

      // Redirect to payment or success page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (data.redirectUrl) {
        router.push(data.redirectUrl)
      } else {
        router.push('/booking-success?success=true')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/terapias')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Terapias
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/terapias">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Terapias
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Hero */}
            <Card className="overflow-hidden">
              {service?.image_url && (
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <h1 className="text-4xl font-bold text-white mb-2">{service.name}</h1>
                    {service?.category && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                        {service.category.name}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {!service?.image_url && (
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl mb-2">{service?.name}</CardTitle>
                      {service?.category && (
                        <Badge variant="secondary">{service.category.name}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              )}
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      ${service?.price}
                    </div>
                    <div className="text-sm text-gray-500">Precio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600 flex items-center gap-1">
                      <Clock className="h-6 w-6" />
                      {service?.duration_minutes}
                    </div>
                    <div className="text-sm text-gray-500">Minutos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 flex items-center gap-1">
                      <Star className="h-6 w-6 fill-current" />
                      4.8
                    </div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </div>

                {/* Benefits & Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {service?.symptoms && service.symptoms.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Beneficios
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {service.symptoms.map((item: any, idx) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 border-green-200">
                            {item.symptom?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {service?.diseases && service.diseases.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-500" />
                        Indicado para
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {service.diseases.map((item: any, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50 border-blue-200">
                            {item.disease?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  onClick={() => setActiveTab('therapists')}
                >
                  Reservar Ahora
                </Button>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader>
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Descripción
                  </button>
                  <button
                    onClick={() => setActiveTab('therapists')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'therapists'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Terapeutas ({therapists.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('testimonials')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === 'testimonials'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Testimonios
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">¿Qué es {service?.name}?</h3>
                      <p className="text-gray-700 leading-relaxed">{service?.description}</p>
                      {service?.extended_description && (
                        <p className="text-gray-600 mt-4 leading-relaxed">{service.extended_description}</p>
                      )}
                    </div>

                    {/* Image Gallery */}
                    {(service?.image_url_2 || service?.image_url_3) && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Galería</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {service?.image_url_2 && (
                            <img
                              src={service.image_url_2}
                              alt={`${service.name} 2`}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          )}
                          {service?.image_url_3 && (
                            <img
                              src={service.image_url_3}
                              alt={`${service.name} 3`}
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Video */}
                    {service?.video_url && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Video Informativo</h3>
                        <div className="aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={service.video_url}
                            className="w-full h-full"
                            allowFullScreen
                            title={`Video sobre ${service.name}`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Full Description */}
                    {service?.full_description && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Información Detallada</h3>
                        <div 
                          className="prose max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: service.full_description }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Therapists Tab */}
                {activeTab === 'therapists' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Nuestros Terapeutas</h3>
                      <p className="text-gray-600 mb-6">
                        {therapists.length} profesional{therapists.length !== 1 ? 'es' : ''} especializado{therapists.length !== 1 ? 's' : ''} en {service?.name}
                      </p>
                    </div>

                    {therapists.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p>No hay terapeutas disponibles para esta terapia en este momento</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {therapists.map(therapist => (
                          <Card 
                            key={therapist.id} 
                            className={`overflow-hidden transition-all hover:shadow-lg ${
                              selectedTherapist?.id === therapist.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row gap-6">
                                {/* Therapist Avatar */}
                                <div className="flex-shrink-0">
                                  <Avatar className="h-32 w-32 border-4 border-gray-100">
                                    <AvatarImage src={therapist.avatar_url} />
                                    <AvatarFallback className="text-2xl">
                                      {therapist.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                </div>

                                {/* Therapist Info */}
                                <div className="flex-1">
                                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                    <div>
                                      <h4 className="text-2xl font-bold mb-2">{therapist.name}</h4>
                                      {therapist.bio && (
                                        <p className="text-gray-600 text-sm leading-relaxed">{therapist.bio}</p>
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                      {therapist.rating && (
                                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                          <span className="font-bold text-yellow-700">{therapist.rating}</span>
                                          {therapist.reviews_count && (
                                            <span className="text-sm text-gray-600">({therapist.reviews_count})</span>
                                          )}
                                        </div>
                                      )}
                                      {therapist.experience_years && (
                                        <div className="text-sm text-gray-600 text-center">
                                          <Award className="h-4 w-4 inline mr-1" />
                                          {therapist.experience_years} años exp.
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {therapist.specialties && therapist.specialties.length > 0 && (
                                    <div className="mb-4">
                                      <p className="text-sm text-gray-500 mb-2">Especialidades:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {therapist.specialties.map((specialty, idx) => (
                                          <Badge key={idx} variant="outline" className="bg-purple-50 border-purple-200">
                                            {specialty}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => {
                                        setSelectedTherapist(therapist)
                                        setShowTherapistCalendar(true)
                                        setStep('select-time')
                                      }}
                                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                    >
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Ver Disponibilidad
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTherapist(therapist)
                                        setStep('select-time')
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                      }}
                                    >
                                      Seleccionar
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Testimonials Tab */}
                {activeTab === 'testimonials' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Lo que dicen nuestros pacientes</h3>
                      <p className="text-gray-600 mb-6">Testimonios reales de personas que han experimentado {service?.name}</p>
                    </div>

                    {loadingTestimonials ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando testimonios...</p>
                      </div>
                    ) : testimonials.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Star className="h-16 w-16 mx-auto" />
                        </div>
                        <h4 className="font-semibold mb-2">Aún no hay testimonios</h4>
                        <p className="text-gray-600 mb-4">Sé el primero en compartir tu experiencia</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {testimonials.map(testimonial => (
                          <Card key={testimonial.id} className="overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                  {testimonial.avatar && <AvatarImage src={testimonial.avatar} />}
                                  <AvatarFallback>
                                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">{testimonial.author}</h4>
                                    <div className="flex items-center gap-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < testimonial.rating
                                              ? 'fill-yellow-400 text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed mb-2">"{testimonial.comment}"</p>
                                  <p className="text-sm text-gray-500">
                                    {new Date(testimonial.date).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Add Review CTA */}
                    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                      <CardContent className="p-6 text-center">
                        <h4 className="font-semibold mb-2">¿Ya has probado esta terapia?</h4>
                        <p className="text-sm text-gray-600 mb-4">Comparte tu experiencia con otros</p>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            if (!user) {
                              router.push('/login?redirect=/terapias/' + params.id)
                            } else {
                              // TODO: Open testimonial form modal
                              alert('Función de escribir testimonio próximamente')
                            }
                          }}
                        >
                          Escribir Testimonio
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time Selection (when therapist selected) */}
            {showTherapistCalendar && step === 'select-time' && selectedTherapist && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Selecciona Fecha y Hora
                  </CardTitle>
                  <CardDescription>
                    Reservando con {selectedTherapist.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <h4 className="font-medium mb-3">Selecciona una fecha</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {getAvailableDates().map(date => {
                        const dateObj = new Date(date)
                        const isSelected = selectedDate === date
                        const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' })
                        const dayNum = dateObj.getDate()

                        return (
                          <button
                            key={date}
                            onClick={() => {
                              setSelectedDate(date)
                              setSelectedTime('')
                            }}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="text-xs font-medium">{dayName}</div>
                            <div className="text-lg font-bold">{dayNum}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <h4 className="font-medium mb-3">Selecciona un horario</h4>
                      {availableSlots.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">
                          No hay horarios disponibles para esta fecha
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {availableSlots.map(slot => (
                            <button
                              key={slot.time}
                              onClick={() => {
                                if (slot.available) {
                                  setSelectedTime(slot.time)
                                  setStep('confirm')
                                }
                              }}
                              disabled={!slot.available}
                              className={`p-3 rounded-lg border-2 text-center transition-all ${
                                !slot.available
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : selectedTime === slot.time
                                  ? 'border-blue-500 bg-blue-500 text-white'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="text-sm font-medium">{slot.time}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep('select-therapist')
                      setSelectedTherapist(null)
                      setShowTherapistCalendar(false)
                      setSelectedDate('')
                      setSelectedTime('')
                      setActiveTab('therapists')
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Cambiar Terapeuta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumen de Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Service */}
                <div className="pb-4 border-b">
                  <div className="text-sm text-gray-500">Terapia</div>
                  <div className="font-medium">{service?.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {service?.duration_minutes} minutos
                  </div>
                </div>

                {/* Therapist */}
                {selectedTherapist && (
                  <div className="pb-4 border-b">
                    <div className="text-sm text-gray-500">Terapeuta</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedTherapist.avatar_url} />
                        <AvatarFallback>
                          {selectedTherapist.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{selectedTherapist.name}</div>
                    </div>
                  </div>
                )}

                {/* Date & Time */}
                {selectedDate && (
                  <div className="pb-4 border-b">
                    <div className="text-sm text-gray-500">Fecha y Hora</div>
                    <div className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {selectedTime && (
                      <div className="text-sm text-gray-600 mt-1">{selectedTime}</div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {step === 'confirm' && (
                  <div className="pb-4 border-b">
                    <label className="text-sm text-gray-500 block mb-2">
                      Notas (opcional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Menciona algo importante..."
                      rows={3}
                    />
                  </div>
                )}

                {/* Price */}
                <div className="pb-4 border-b">
                  <div className="text-sm text-gray-500">Total a pagar</div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${service?.price}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Action Button */}
                {step === 'confirm' && (
                  <Button
                    onClick={handleBooking}
                    disabled={booking || !selectedTherapist || !selectedDate || !selectedTime}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    size="lg"
                  >
                    {booking ? (
                      <>Procesando...</>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Confirmar y Pagar
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
