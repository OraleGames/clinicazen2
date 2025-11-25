import { supabase, supabaseAdmin } from '@/lib/supabase'
import type { AuthUser } from '@/lib/auth'

// Helper to check if admin client is available
function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error('Admin client is not available. SUPABASE_SERVICE_ROLE_KEY is required.')
  }
  return supabaseAdmin
}

// Database Types
export interface DatabaseUser {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'PATIENT' | 'THERAPIST'
  avatar_url?: string
  phone?: string
  bio?: string
  specialization?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseTherapy {
  id: number
  name: string
  description: string
  extended_description?: string
  full_description?: string
  image_url?: string
  image2_url?: string
  image3_url?: string
  back_image_url?: string
  price: number
  duration_minutes: number
  category_id?: number
  category?: string
  slug?: string
  symptoms?: string[]
  diseases?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseProduct {
  id: string
  name: string
  description?: string
  price: number
  stock_quantity: number
  category?: string
  is_active: boolean
  image_url?: string
  created_at: string
  updated_at: string
}

export interface DatabaseAppointment {
  id: number
  client_id: string
  therapist_id: string
  service_id: number
  scheduled_at: string
  duration_minutes: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  price: number
  payment_status: 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIAL_REFUND'
  payment_method?: string
  total_amount: number
  notes?: string
  cancellation_reason?: string
  cancellation_fee: number
  cancellation_deadline_hours: number
  google_calendar_event_id?: string
  created_at: string
  updated_at: string
}

export interface DatabaseTherapistAvailability {
  id: string
  therapist_id: string
  day_of_week?: number
  start_time: string
  end_time: string
  is_available: boolean
  date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface DatabaseBlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  image_url?: string
  author_id?: string
  published: boolean
  language: 'es' | 'en'
  tags?: string[]
  seo_title?: string
  seo_description?: string
  view_count: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface DatabasePaymentMethod {
  id: string
  user_id: string
  type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER'
  provider: string
  provider_payment_method_id: string
  last_four?: string
  expiry_month?: number
  expiry_year?: number
  brand?: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// User Management Service
export class UserService {
  // Get all users (admin only) - optimized to select only needed fields
  static async getAllUsers(): Promise<DatabaseUser[]> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('id, email, name, role, avatar_url, phone, bio, specialization, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(500) // Limit for performance

    if (error) throw error
    return data || []
  }

  // Get user by ID
  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Update user
  static async updateUser(id: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('profiles')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete user (admin only)
  static async deleteUser(id: string): Promise<void> {
    const admin = requireAdminClient()
    const { error } = await admin
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Get therapists
  static async getTherapists(): Promise<DatabaseUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'THERAPIST')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get clients
  static async getClients(): Promise<DatabaseUser[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'PATIENT')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// Therapy Service
export class TherapyService {
  // Get all therapies with optional relationships
  static async getAllTherapies(includeRelations: boolean = false): Promise<DatabaseTherapy[]> {
    let query = supabase
      .from('therapies')
      .select('*')

    if (includeRelations) {
      query = supabase
        .from('therapies')
        .select(`
          *,
          category:categories(name),
          symptoms:service_symptoms(symptom:symptoms(name)),
          diseases:service_diseases(disease:diseases(name))
        `)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) throw error

    // Transform data to flatten relationships if included
    if (includeRelations && data) {
      return data.map((therapy: any) => ({
        ...therapy,
        category: therapy.category?.name,
        symptoms: therapy.symptoms?.map((s: any) => s.symptom?.name).filter(Boolean) || [],
        diseases: therapy.diseases?.map((d: any) => d.disease?.name).filter(Boolean) || []
      }))
    }

    return data || []
  }

  // Get active therapies with optional relationships
  static async getActiveTherapies(includeRelations: boolean = false): Promise<DatabaseTherapy[]> {
    let query = supabase
      .from('therapies')
      .select('*')
      .eq('is_active', true)

    if (includeRelations) {
      query = supabase
        .from('therapies')
        .select(`
          *,
          category:categories(name),
          symptoms:service_symptoms(symptom:symptoms(name)),
          diseases:service_diseases(disease:diseases(name))
        `)
        .eq('is_active', true)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) throw error

    // Transform data to flatten relationships if included
    if (includeRelations && data) {
      return data.map((therapy: any) => ({
        ...therapy,
        category: therapy.category?.name,
        symptoms: therapy.symptoms?.map((s: any) => s.symptom?.name).filter(Boolean) || [],
        diseases: therapy.diseases?.map((d: any) => d.disease?.name).filter(Boolean) || []
      }))
    }

    return data || []
  }

  // Get therapy by ID with relationships
  static async getTherapyById(id: number): Promise<DatabaseTherapy | null> {
    const { data, error } = await supabase
      .from('therapies')
      .select(`
        *,
        category:categories(name),
        symptoms:service_symptoms(symptom:symptoms(name)),
        diseases:service_diseases(disease:diseases(name))
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (data) {
      return {
        ...data,
        category: data.category?.name,
        symptoms: data.symptoms?.map((s: any) => s.symptom?.name).filter(Boolean) || [],
        diseases: data.diseases?.map((d: any) => d.disease?.name).filter(Boolean) || []
      }
    }

    return data
  }

  // Create therapy with relationships
  static async createTherapy(therapy: Omit<DatabaseTherapy, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseTherapy> {
    const admin = requireAdminClient()

    // Extract relationship data
    const { symptoms, diseases, ...therapyData } = therapy

    // Create the therapy first
    const { data: newTherapy, error: therapyError } = await admin
      .from('therapies')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .insert({
        name: therapyData.name,
        description: therapyData.description,
        extended_description: therapyData.extended_description,
        full_description: therapyData.full_description,
        image_url: therapyData.image_url,
        image2_url: therapyData.image2_url,
        image3_url: therapyData.image3_url,
        back_image_url: therapyData.back_image_url,
        price: therapyData.price,
        duration_minutes: therapyData.duration_minutes,
        category_id: therapyData.category_id,
        slug: therapyData.slug,
        is_active: therapyData.is_active
      } as Record<string, unknown>)
      .select()
      .single()

    if (therapyError) throw therapyError

    // Handle symptoms relationships
    if (symptoms && symptoms.length > 0) {
      // @ts-expect-error - Checked above
      await this.updateSymptoms(newTherapy.id, symptoms)
    }

    // Handle diseases relationships
    if (diseases && diseases.length > 0) {
      // @ts-expect-error - Checked above
      await this.updateDiseases(newTherapy.id, diseases)
    }

    return newTherapy
  }

  // Update therapy with relationships
  static async updateTherapy(id: number, updates: Partial<DatabaseTherapy>): Promise<DatabaseTherapy> {
    const admin = requireAdminClient()

    // Extract relationship data
    const { symptoms, diseases, ...therapyUpdates } = updates

    // Update the therapy
    const { data, error } = await admin
      .from('therapies')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .update(therapyUpdates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update symptoms if provided
    if (symptoms !== undefined) {
      await this.updateSymptoms(id, symptoms)
    }

    // Update diseases if provided
    if (diseases !== undefined) {
      await this.updateDiseases(id, diseases)
    }

    return data
  }

  // Delete therapy
  static async deleteTherapy(id: number): Promise<void> {
    const admin = requireAdminClient()

    // Delete relationships first (cascade should handle this, but being explicit)
    await admin.from('service_symptoms').delete().eq('service_id', id)
    await admin.from('service_diseases').delete().eq('service_id', id)

    // Delete the therapy
    const { error } = await admin
      .from('therapies')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Helper: Update symptoms relationships
  private static async updateSymptoms(therapyId: number, symptomNames: string[]): Promise<void> {
    const admin = requireAdminClient()

    // Remove existing relationships
    await admin.from('service_symptoms').delete().eq('service_id', therapyId)

    if (symptomNames.length === 0) return

    // Batch approach to avoid N+1 queries
    const trimmedNames = symptomNames.map(n => n.trim()).filter(Boolean)
    if (trimmedNames.length === 0) return

    // Fetch all existing symptoms in one query
    const { data: existingSymptoms, error: existingError } = await admin
      .from('symptoms')
      .select('id, name')
      .in('name', trimmedNames)
    if (existingError) throw existingError

    type SymptomRecord = { id: number; name: string }
    const existingArray: SymptomRecord[] = (existingSymptoms as SymptomRecord[] | null) ?? []
    const existingMap = new Map<string, number>(existingArray.map(s => [s.name, s.id]))

    const newNames = trimmedNames.filter(name => !existingMap.has(name))

    if (newNames.length > 0) {
      const { data: createdSymptoms, error: createError } = await admin
        .from('symptoms')
        // @ts-expect-error - Supabase type inference issue
        .insert(newNames.map(name => ({ name })))
        .select('id, name')
      if (createError) throw createError
      const createdArray: SymptomRecord[] = (createdSymptoms as SymptomRecord[] | null) ?? []
      createdArray.forEach(s => existingMap.set(s.name, s.id))
    }

    const symptomIds = trimmedNames
      .map(name => existingMap.get(name))
      .filter((id): id is number => typeof id === 'number')

    if (symptomIds.length > 0) {
      const relationships = symptomIds.map(symptomId => ({ service_id: therapyId, symptom_id: symptomId }))
      // @ts-expect-error - Supabase type inference issue
      await admin.from('service_symptoms').insert(relationships)
    }
  }

  // Helper: Update diseases relationships
  private static async updateDiseases(therapyId: number, diseaseNames: string[]): Promise<void> {
    const admin = requireAdminClient()

    // Remove existing relationships
    await admin.from('service_diseases').delete().eq('service_id', therapyId)

    if (diseaseNames.length === 0) return

    // Get or create diseases
    const diseaseIds: number[] = []
    for (const name of diseaseNames) {
      const trimmedName = name.trim()
      if (!trimmedName) continue

      // Try to find existing disease
      const { data: existing } = await admin
        .from('diseases')
        .select('id')
        .eq('name', trimmedName)
        .single()

      if (existing) {
        // @ts-expect-error - Supabase type inference issue
        diseaseIds.push(existing.id)
      } else {
        // Create new disease
        const { data: newDisease } = await admin
          .from('diseases')
          // @ts-expect-error - Supabase type inference issue
          .insert({ name: trimmedName })
          .select('id')
          .single()

        if (newDisease) {
          // @ts-expect-error - Supabase type inference issue
          diseaseIds.push(newDisease.id)
        }
      }
    }

    // Create relationships
    if (diseaseIds.length > 0) {
      const relationships = diseaseIds.map(diseaseId => ({
        service_id: therapyId,
        disease_id: diseaseId
      }))

      // @ts-expect-error - Supabase type inference issue
      await admin.from('service_diseases').insert(relationships)
    }
  }
}

// Product Service
export class ProductService {
  // Get all products
  static async getAllProducts(): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get active products
  static async getActiveProducts(): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Create product
  static async createProduct(product: Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProduct> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('products')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .insert(product as Record<string, unknown>)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update product
  static async updateProduct(id: string, updates: Partial<DatabaseProduct>): Promise<DatabaseProduct> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('products')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete product
  static async deleteProduct(id: string): Promise<void> {
    const admin = requireAdminClient()
    const { error } = await admin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Appointment Service
export class AppointmentService {
  // Get all appointments (admin view)
  static async getAllAppointments(): Promise<DatabaseAppointment[]> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('appointments')
      .select(`
        *,
        client:profiles!appointments_client_id_fkey (name, email),
        therapist:profiles!appointments_therapist_id_fkey (name, email),
        therapy:therapies (name, duration_minutes, price)
      `)
      .order('scheduled_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get appointments for a user (client or therapist)
  static async getUserAppointments(userId: string, role: 'CLIENT' | 'THERAPIST'): Promise<DatabaseAppointment[]> {
    const column = role === 'CLIENT' ? 'client_id' : 'therapist_id'

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:profiles!appointments_client_id_fkey (name, email),
        therapist:profiles!appointments_therapist_id_fkey (name, email),
        therapy:therapies (name, duration_minutes, price)
      `)
      .eq(column, userId)
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Create appointment
  static async createAppointment(appointment: Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseAppointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update appointment
  static async updateAppointment(id: number, updates: Partial<DatabaseAppointment>): Promise<DatabaseAppointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Cancel appointment
  static async cancelAppointment(id: number, reason: string, cancellationFee: number = 0): Promise<DatabaseAppointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'CANCELLED',
        cancellation_reason: reason,
        cancellation_fee: cancellationFee
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Confirm appointment
  static async confirmAppointment(id: number): Promise<DatabaseAppointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'CONFIRMED',
        payment_status: 'PAID'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Therapist Availability Service
export class AvailabilityService {
  // Get therapist availability
  static async getTherapistAvailability(therapistId: string): Promise<DatabaseTherapistAvailability[]> {
    const { data, error } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get specific date availability
  static async getSpecificAvailability(therapistId: string, date: string): Promise<DatabaseTherapistAvailability[]> {
    const { data, error } = await supabase
      .from('therapist_specific_availability')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('date', date)
      .eq('is_available', true)
      .order('start_time', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Set availability
  static async setAvailability(availability: Omit<DatabaseTherapistAvailability, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseTherapistAvailability> {
    const { data, error } = await supabase
      .from('therapist_specific_availability')
      .upsert(availability, {
        onConflict: 'therapist_id,date,start_time'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Remove availability
  static async removeAvailability(therapistId: string, date: string, startTime: string): Promise<void> {
    const { error } = await supabase
      .from('therapist_specific_availability')
      .delete()
      .eq('therapist_id', therapistId)
      .eq('date', date)
      .eq('start_time', startTime)

    if (error) throw error
  }
}

// Blog Service
export class BlogService {
  // Get all blog posts
  static async getAllBlogPosts(): Promise<DatabaseBlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get published blog posts
  static async getPublishedBlogPosts(language: 'es' | 'en' = 'es'): Promise<DatabaseBlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .eq('language', language)
      .order('published_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get blog post by slug
  static async getBlogPostBySlug(slug: string): Promise<DatabaseBlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }

  // Create blog post
  static async createBlogPost(post: Omit<DatabaseBlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseBlogPost> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('blog_posts')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .insert(post as Record<string, unknown>)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Update blog post
  static async updateBlogPost(id: number, updates: Partial<DatabaseBlogPost>): Promise<DatabaseBlogPost> {
    const admin = requireAdminClient()
    const { data, error } = await admin
      .from('blog_posts')
      // @ts-expect-error - Supabase type inference issue with dynamic table schemas
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete blog post
  static async deleteBlogPost(id: number): Promise<void> {
    const admin = requireAdminClient()
    const { error } = await admin
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Increment view count
  static async incrementViewCount(id: number): Promise<void> {
    const { error } = await supabase.rpc('increment_blog_view_count', { post_id: id })
    if (error) throw error
  }
}

// Payment Method Service
export class PaymentMethodService {
  // Get user payment methods
  static async getUserPaymentMethods(userId: string): Promise<DatabasePaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Create payment method
  static async createPaymentMethod(method: Omit<DatabasePaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<DatabasePaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(method)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Set default payment method
  static async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // First, unset all existing defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)

    // Then set the new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId)

    if (error) throw error
  }

  // Delete payment method
  static async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: false })
      .eq('id', paymentMethodId)
      .eq('user_id', userId)

    if (error) throw error
  }
}