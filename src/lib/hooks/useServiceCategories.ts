import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ServiceCategory } from '@/types/therapy'

export const CATEGORIES_QUERY_KEY = ['service-categories'] as const

async function fetchCategories(): Promise<ServiceCategory[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw new Error(error.message || 'Error al cargar categorías')
  return data || []
}

async function createCategory(input: { name: string; description?: string; icon?: string }): Promise<ServiceCategory> {
  const { data, error } = await supabase.from('categories').insert({ ...input }).select().single()
  if (error) throw new Error(error.message || 'Error al crear la categoría')
  return data as ServiceCategory
}

async function updateCategory(input: { id: number; name?: string; description?: string; icon?: string }): Promise<ServiceCategory> {
  const { id, ...updates } = input
  const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()
  if (error) throw new Error(error.message || 'Error al actualizar la categoría')
  return data as ServiceCategory
}

async function deleteCategory(id: number): Promise<number> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Error al eliminar la categoría')
  return id
}

export function useServiceCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (updated) => {
      queryClient.setQueryData<ServiceCategory[]>(CATEGORIES_QUERY_KEY, old => old?.map(c => c.id === updated.id ? updated : c))
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (deletedId) => {
      queryClient.setQueryData<ServiceCategory[]>(CATEGORIES_QUERY_KEY, old => old?.filter(c => c.id !== deletedId))
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    }
  })
}
