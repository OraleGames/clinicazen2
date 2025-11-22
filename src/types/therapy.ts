import { z } from 'zod'

// Frontend therapy type (static data)
export interface Therapy {
  id: string;  // Changed from number to string
  name: string;
  description: string;
  image: string;
  image2: string;
  image3: string;
  backImage: string;
  categories: string[];
  symptoms: string[];
  extendedDescription: string;
  enfermedades: string[];
  slug: string;
  fullDescription: string;
}

// Database service type (Supabase)
export interface DatabaseService {
  id: number;
  name: string;
  description: string;
  extended_description?: string;
  image_url?: string;
  price: number;
  duration_minutes: number;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
}

// Extended service type with relationships
export interface Service extends DatabaseService {
  category?: string;
  categories?: string[];
  symptoms?: string[];
  diseases?: string[];
  slug?: string;
  is_active?: boolean;
  image2_url?: string;
  image3_url?: string;
  back_image_url?: string;
  full_description?: string;
}

// Zod validation schemas
export const createServiceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  extended_description: z.string().optional(),
  full_description: z.string().optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  image2_url: z.string().url('URL inválida').optional().or(z.literal('')),
  image3_url: z.string().url('URL inválida').optional().or(z.literal('')),
  back_image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  price: z.number().positive('El precio debe ser mayor a 0'),
  duration_minutes: z.number().int().positive('La duración debe ser mayor a 0'),
  category_id: z.number().int().positive().optional(),
  category: z.string().optional(),
  slug: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  diseases: z.array(z.string()).optional(),
  is_active: z.boolean().optional().default(true),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.number().int().positive(),
})

// Type inference from Zod schemas
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
