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

// Database service category type (Supabase)
export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
}

export interface DatabaseService {
  id: number;
  name: string;
  description: string;
  extended_description?: string;
  image_url?: string;
  price: number;
  duration_minutes: number;
  category_id?: number; // optional to match DB schema
  created_at?: string;
  updated_at?: string;
}

// Extended service type with relationships
export interface Service extends DatabaseService {
  // Joined category record from Supabase
  category?: ServiceCategory;
  category_name?: string; // convenience when only name is needed
  categories?: string[]; // legacy static data compatibility
  symptoms?: string[];
  diseases?: string[];
  slug?: string;
  is_active?: boolean;
  image2_url?: string;
  image3_url?: string;
  back_image_url?: string;
  full_description?: string;
}

// Zod validation schemas - only fields that exist in database
export const createServiceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  extended_description: z.string().optional(),
  image_url: z.union([z.url('URL inválida'), z.literal('')]).optional(),
  price: z.number().positive('El precio debe ser mayor a 0'),
  duration_minutes: z.number().int().positive('La duración debe ser mayor a 0'),
  category_id: z.number().int().positive('La categoría es requerida'),
  is_active: z.boolean().default(true),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.number().int().positive(),
})

// Type inference from Zod schemas
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
