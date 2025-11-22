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

// Type for creating a new service
export interface CreateServiceInput {
  name: string;
  description: string;
  extended_description?: string;
  full_description?: string;
  image_url?: string;
  image2_url?: string;
  image3_url?: string;
  back_image_url?: string;
  price: number;
  duration_minutes: number;
  category_id?: number;
  category?: string;
  slug?: string;
  symptoms?: string[];
  diseases?: string[];
  is_active?: boolean;
}

// Type for updating a service
export interface UpdateServiceInput extends Partial<CreateServiceInput> {
  id: number;
}
