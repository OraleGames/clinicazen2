import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Service, CreateServiceInput, UpdateServiceInput } from '@/types/therapy'
import { 
  fetchServices, 
  createService, 
  updateService, 
  deleteService,
  toggleServiceStatus 
} from '@/lib/api'

export const SERVICES_QUERY_KEY = ['services'] as const

// Fetch all services
export function useServices(activeOnly = false) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, { activeOnly }],
    queryFn: () => fetchServices(activeOnly),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Create service mutation
export function useCreateService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      // Invalidate all services queries
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY })
    },
  })
}

// Update service mutation
export function useUpdateService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateService,
    onSuccess: (updatedService) => {
      // Optimistically update the cache
      queryClient.setQueryData<Service[]>(
        [...SERVICES_QUERY_KEY, { activeOnly: false }],
        (old) => old?.map((service) => 
          service.id === updatedService.id ? updatedService : service
        )
      )
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY })
    },
  })
}

// Delete service mutation
export function useDeleteService() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteService,
    onSuccess: (_, deletedId) => {
      // Optimistically remove from cache
      queryClient.setQueryData<Service[]>(
        [...SERVICES_QUERY_KEY, { activeOnly: false }],
        (old) => old?.filter((service) => service.id !== deletedId)
      )
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY })
    },
  })
}

// Toggle service status mutation
export function useToggleServiceStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      toggleServiceStatus(id, isActive),
    onSuccess: (updatedService) => {
      // Optimistically update the cache
      queryClient.setQueryData<Service[]>(
        [...SERVICES_QUERY_KEY, { activeOnly: false }],
        (old) => old?.map((service) => 
          service.id === updatedService.id ? updatedService : service
        )
      )
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY })
    },
  })
}
