import { supabase } from '@/lib/supabase'

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
  symptoms?: Symptom[]
  diseases?: Disease[]
  therapists?: Profile[]
}

export interface Category {
  id: number
  name: string
  description?: string
  icon?: string
}

export interface Symptom {
  id: number
  name: string
  description?: string
}

export interface Disease {
  id: number
  name: string
  description?: string
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

class ServicesService {
  // Get all services with optional filtering
  async getServices(filters?: {
    category_id?: number
    symptom_id?: number
    disease_id?: number
    search?: string
    min_price?: number
    max_price?: number
  }): Promise<Service[]> {
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          category:categories (
            id, name, description, icon
          ),
          symptoms:service_symptoms (
            symptom:symptoms (
              id, name, description
            )
          ),
          diseases:service_diseases (
            disease:diseases (
              id, name, description
            )
          )
        `)

      // Apply filters
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.min_price) {
        query = query.gte('price', filters.min_price)
      }

      if (filters?.max_price) {
        query = query.lte('price', filters.max_price)
      }

      const { data, error } = await query.order('name')

      if (error) throw error

      // Filter by symptoms or diseases if specified (client-side filtering)
      let filteredData = data || []
      
      if (filters?.symptom_id) {
        filteredData = filteredData.filter(service => 
          service.symptoms?.some(symptom => symptom.symptom.id === filters.symptom_id)
        )
      }

      if (filters?.disease_id) {
        filteredData = filteredData.filter(service => 
          service.diseases?.some(disease => disease.disease.id === filters.disease_id)
        )
      }

      return filteredData
    } catch (error) {
      console.error('Error fetching services:', error)
      return []
    }
  }

  // Get single service
  async getService(serviceId: number): Promise<Service | null> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories (
            id, name, description, icon
          ),
          symptoms:service_symptoms (
            symptom:symptoms (
              id, name, description
            )
          ),
          diseases:service_diseases (
            disease:diseases (
              id, name, description
            )
          )
        `)
        .eq('id', serviceId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching service:', error)
      return null
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Get all symptoms
  async getSymptoms(): Promise<Symptom[]> {
    try {
      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching symptoms:', error)
      return []
    }
  }

  // Get all diseases
  async getDiseases(): Promise<Disease[]> {
    try {
      const { data, error } = await supabase
        .from('diseases')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching diseases:', error)
      return []
    }
  }

  // Get therapists for a specific service
  async getTherapistsForService(serviceId: number): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('therapist_services')
        .select(`
          therapist:profiles (
            id, name, email, avatar_url, phone, bio
          )
        `)
        .eq('service_id', serviceId)

      if (error) throw error
      
      const therapists = data?.map((ts: any) => ts.therapist).filter(Boolean) || []
      return therapists as Profile[]
    } catch (error) {
      console.error('Error fetching therapists for service:', error)
      return []
    }
  }

  // Get services offered by a therapist
  async getTherapistServices(therapistId: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('therapist_services')
        .select(`
          service:services (
            id, name, description, image_url, price, duration_minutes,
            category:categories (
              id, name, description, icon
            )
          )
        `)
        .eq('therapist_id', therapistId)

      if (error) throw error
      
      const services = data?.map((ts: any) => ts.service).filter(Boolean) || []
      return services as Service[]
    } catch (error) {
      console.error('Error fetching therapist services:', error)
      return []
    }
  }

  // Add service to therapist's offerings
  async addServiceToTherapist(therapistId: string, serviceId: number, price?: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('therapist_services')
        .insert({
          therapist_id: therapistId,
          service_id: serviceId,
          price: price
        })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Remove service from therapist's offerings
  async removeServiceFromTherapist(therapistId: string, serviceId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('therapist_services')
        .delete()
        .eq('therapist_id', therapistId)
        .eq('service_id', serviceId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Search services by name or description
  async searchServices(query: string): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories (
            id, name, description, icon
          )
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching services:', error)
      return []
    }
  }

  // Get featured services (for homepage)
  async getFeaturedServices(limit: number = 6): Promise<Service[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          category:categories (
            id, name, description, icon
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching featured services:', error)
      return []
    }
  }

  // Subscribe to real-time service updates (for admin)
  subscribeToServices(callback: (service: Service) => void) {
    return supabase
      .channel('services')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'services' 
        }, 
        async (payload: { new: { id: number } | Record<string, any> }) => {
          if (payload.new && 'id' in payload.new) {
            const service = await this.getService(payload.new.id)
            if (service) {
              callback(service)
            }
          }
        }
      )
      .subscribe()
  }
}

export const servicesService = new ServicesService()