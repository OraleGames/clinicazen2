"use client"

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, Home } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

function BookingSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  useEffect(() => {
    if (success === 'true') {
      // Trigger confetti animation
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [success])

  useEffect(() => {
    if (success !== 'true') {
      router.push('/dashboard/patient/appointments')
    }
  }, [success, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-teal-500 rounded-full p-6">
                <CheckCircle2 className="h-20 w-20 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            ¡Reserva Exitosa!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-xl text-gray-700">
              Tu cita ha sido creada con éxito
            </p>
            <p className="text-gray-600">
              El terapeuta recibirá una notificación y confirmará tu cita en breve.
              Recibirás una notificación cuando la cita sea confirmada.
            </p>
          </div>

          {/* Info Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-500 rounded-lg p-2">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Estado Actual</h3>
              </div>
              <p className="text-sm text-gray-600">
                Tu cita está <span className="font-semibold text-yellow-600">PENDIENTE</span> de confirmación
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-500 rounded-lg p-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Próximos Pasos</h3>
              </div>
              <p className="text-sm text-gray-600">
                Espera la confirmación del terapeuta
              </p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mt-6">
            <h3 className="font-semibold text-amber-900 mb-2">📌 Importante</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Revisa tus notificaciones para ver cuando tu cita sea confirmada</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Puedes ver y gestionar tus citas en el panel de paciente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>Si cancelas con menos de 24 horas de anticipación, se aplicará una tarifa del 50%</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Link href="/dashboard/patient/appointments" className="flex-1">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                size="lg"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Ver Mis Citas
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button 
                variant="outline"
                className="w-full border-2"
                size="lg"
              >
                <Home className="h-5 w-5 mr-2" />
                Ir al Inicio
              </Button>
            </Link>
          </div>

          {/* Additional Action */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              ¿Necesitas reservar otra cita?
            </p>
            <Link href="/terapias">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                Explorar más terapias →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
