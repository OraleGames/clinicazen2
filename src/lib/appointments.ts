import { supabase } from '@/lib/supabase'

export interface Appointment {
  id: number
  client_id: string
  therapist_id: string
  service_id: number
  scheduled_at: string
  duration_minutes: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  price: number
  notes?: string
  created_at: string
  updated_at: string
  // Join data
  client?: Profile
  therapist?: Profile
  service?: Service
}

export interface Profile {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'PATIENT' | 'THERAPIST' | 'RECEPTIONIST'
  avatar_url?: string
  phone?: string
  bio?: string
}

export interface Service {
  id: number
  name: string
  description: string
  extended_description?: string
  image_url?: string
  price: number
  duration_minutes: number
  category_id?: number
  category?: Category
}

export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
}

export interface TimeSlot {
  date: string
  time: string
  available: boolean
  therapist_id: string
}

export interface TherapistAvailability {
  id: number
  therapist_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

class AppointmentService {
  // Get appointments for current user
  async getAppointments(userId: string, userRole: string): Promise<Appointment[]> {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey (
            id, name, email, avatar_url, phone
          ),
          therapist:profiles!appointments_therapist_id_fkey (
            id, name, email, avatar_url, phone, bio
          ),
          service:services (
            id, name, description, image_url, price, duration_minutes
          )
        `)

      // Filter based on user role
      if (userRole === 'PATIENT') {
        query = query.eq('client_id', userId)
      } else if (userRole === 'THERAPIST') {
        query = query.eq('therapist_id', userId)
      }
      // Admin can see all appointments

      const { data, error } = await query.order('scheduled_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
  }

  // Get single appointment
  async getAppointment(appointmentId: number): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey (
            id, name, email, avatar_url, phone
          ),
          therapist:profiles!appointments_therapist_id_fkey (
            id, name, email, avatar_url, phone, bio
          ),
          service:services (
            id, name, description, image_url, price, duration_minutes
          )
        `)
        .eq('id', appointmentId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching appointment:', error)
      return null
    }
  }

  // Create new appointment
  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; data?: Appointment }> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Update appointment
  async updateAppointment(appointmentId: number, updates: Partial<Appointment>): Promise<{ success: boolean; error?: string; data?: Appointment }> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: number, userId: string, userRole: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if user can cancel this appointment
      const appointment = await this.getAppointment(appointmentId)
      if (!appointment) {
        return { success: false, error: 'Appointment not found' }
      }

      if (userRole === 'PATIENT' && appointment.client_id !== userId) {
        return { success: false, error: 'Unauthorized to cancel this appointment' }
      }

      if (userRole === 'THERAPIST' && appointment.therapist_id !== userId) {
        return { success: false, error: 'Unauthorized to cancel this appointment' }
      }

      // Cancel the appointment
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'CANCELLED' })
        .eq('id', appointmentId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get available time slots for a therapist on a specific date
  async getAvailableTimeSlots(therapistId: string, date: string): Promise<TimeSlot[]> {
    try {
      // Get therapist availability for the day of week
      const dayOfWeek = new Date(date).getDay()
      const { data: availability, error: availabilityError } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', therapistId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)
        .single()

      if (availabilityError || !availability) {
        return []
      }

      // Get existing appointments for that date
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const { data: existingAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('scheduled_at, duration_minutes')
        .eq('therapist_id', therapistId)
        .eq('status', 'CONFIRMED')
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())

      if (appointmentsError) throw appointmentsError

      // Generate time slots
      const timeSlots: TimeSlot[] = []
      const startTime = this.timeStringToMinutes(availability.start_time)
      const endTime = this.timeStringToMinutes(availability.end_time)
      const slotDuration = 60 // 1 hour slots

      // Mark occupied slots
      const occupiedSlots = new Set<string>()
      existingAppointments?.forEach(appointment => {
        const appointmentDate = new Date(appointment.scheduled_at)
        const timeSlot = `${appointmentDate.getHours().toString().padStart(2, '0')}:00`
        occupiedSlots.add(timeSlot)
      })

      // Generate available slots
      for (let time = startTime; time < endTime; time += slotDuration) {
        const timeString = `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`
        timeSlots.push({
          date,
          time: timeString,
          available: !occupiedSlots.has(timeString),
          therapist_id: therapistId
        })
      }

      return timeSlots
    } catch (error) {
      console.error('Error fetching available time slots:', error)
      return []
    }
  }

  // Set therapist availability
  async setTherapistAvailability(therapistId: string, availability: Omit<TherapistAvailability, 'id' | 'therapist_id'>[]): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete existing availability
      await supabase
        .from('therapist_availability')
        .delete()
        .eq('therapist_id', therapistId)

      // Insert new availability
      const availabilityWithTherapistId = availability.map(avail => ({
        ...avail,
        therapist_id: therapistId
      }))

      const { error } = await supabase
        .from('therapist_availability')
        .insert(availabilityWithTherapistId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get therapist availability
  async getTherapistAvailability(therapistId: string): Promise<TherapistAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('day_of_week')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching therapist availability:', error)
      return []
    }
  }

  // Subscribe to real-time appointment updates
  subscribeToAppointments(userId: string, userRole: string, callback: (appointment: Appointment) => void) {
    let query = supabase
      .channel('appointments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments' 
        }, 
        async (payload: { new: { id: number } | Record<string, any> }) => {
          // Get full appointment details
          if (payload.new && 'id' in payload.new) {
            const appointment = await this.getAppointment(payload.new.id)
            if (appointment) {
              // Check if user should receive this update
              if (userRole === 'PATIENT' && appointment.client_id === userId) {
                callback(appointment)
              } else if (userRole === 'THERAPIST' && appointment.therapist_id === userId) {
                callback(appointment)
              } else if (userRole === 'ADMIN') {
                callback(appointment)
              }
            }
          }
        }
      )
      .subscribe()

    return query
  }

  // Helper method to convert time string to minutes
  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }
}

export const appointmentService = new AppointmentService()