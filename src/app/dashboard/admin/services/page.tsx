"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  DollarSign,
  Clock,
  Tag,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'
import { t } from '@/lib/i18n'
import type { Service } from '@/types/therapy'
import { 
  useServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService,
  useToggleServiceStatus
} from '@/lib/hooks/useServices'
import { toast } from 'sonner'

interface DatabaseService extends Service {
  created_at?: string
  updated_at?: string
}

export default function AdminServicesDashboard() {
  const { user } = useAuth()
  
  // TanStack Query hooks
  const { data: services = [], isLoading, error: queryError } = useServices(false)
  const createMutation = useCreateService()
  const updateMutation = useUpdateService()
  const deleteMutation = useDeleteService()
  const toggleStatusMutation = useToggleServiceStatus()
  
  const [selectedService, setSelectedService] = useState<DatabaseService | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    extended_description: '',
    full_description: '',
    price: 0,
    duration_minutes: 60,
    category: '',
    image_url: '',
    image2_url: '',
    image3_url: '',
    back_image_url: '',
    slug: '',
    symptoms: [] as string[],
    diseases: [] as string[],
    is_active: true
  })

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreating(false)
        setIsEditing(false)
        setShowDeleteConfirm(null)
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Memoized filtered services
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || service.category === filterCategory
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && service.is_active) ||
                           (filterStatus === 'inactive' && !service.is_active)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [services, searchTerm, filterCategory, filterStatus])

  // Memoized stats
  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.is_active).length,
    inactive: services.filter(s => !s.is_active).length,
    categories: new Set(services.map(s => s.category).filter(Boolean)).size,
    avgPrice: services.length > 0 
      ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) 
      : 0
  }), [services])

  const handleEditService = (service: DatabaseService) => {
    setSelectedService(service)
    setFormData({
      name: service.name || '',
      description: service.description || '',
      extended_description: service.extended_description || '',
      full_description: service.full_description || '',
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 60,
      category: service.category || '',
      image_url: service.image_url || '',
      image2_url: service.image2_url || '',
      image3_url: service.image3_url || '',
      back_image_url: service.back_image_url || '',
      slug: service.slug || '',
      symptoms: service.symptoms || [],
      diseases: service.diseases || [],
      is_active: service.is_active !== false
    })
    setIsEditing(true)
  }

  const handleCreateService = () => {
    setSelectedService(null)
    setFormData({
      name: '',
      description: '',
      extended_description: '',
      full_description: '',
      price: 0,
      duration_minutes: 60,
      category: '',
      image_url: '',
      image2_url: '',
      image3_url: '',
      back_image_url: '',
      slug: '',
      symptoms: [],
      diseases: [],
      is_active: true
    })
    setIsCreating(true)
  }

  const handleSaveService = async () => {
    try {
      // Auto-generate slug if empty
      const slug = formData.slug || formData.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const serviceData = {
        ...formData,
        slug,
        price: Number(formData.price),
        duration_minutes: Number(formData.duration_minutes)
      }

      if (isCreating) {
        await createMutation.mutateAsync(serviceData)
        toast.success(t('services.successCreated'))
        setIsCreating(false)
      } else if (isEditing && selectedService) {
        await updateMutation.mutateAsync({
          id: selectedService.id,
          ...serviceData
        })
        toast.success(t('services.successUpdated'))
        setIsEditing(false)
      }
    } catch (error: any) {
      toast.error(error.message || (isCreating ? t('services.errorCreating') : t('services.errorUpdating')))
    }
  }

  const handleDeleteService = async (serviceId: number) => {
    try {
      await deleteMutation.mutateAsync(serviceId)
      toast.success(t('services.successDeleted'))
      setShowDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error.message || t('services.errorDeleting'))
    }
  }

  const handleToggleServiceStatus = async (serviceId: number) => {
    try {
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      await toggleStatusMutation.mutateAsync({ 
        id: serviceId, 
        isActive: service.is_active || false 
      })
      toast.success('Estado actualizado')
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar el estado')
    }
  }

  const uniqueCategories = Array.from(new Set(services.map(s => s.category).filter(Boolean)))

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout role={user?.role || 'ADMIN'}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Show error state
  if (queryError) {
    return (
      <DashboardLayout role={user?.role || 'ADMIN'}>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{t('services.errorLoading')}</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={user?.role || 'ADMIN'}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
            {t('services.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('services.description')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">{t('services.totalServices')}</CardTitle>
              <Heart className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900">{stats.total}</div>
              <p className="text-xs text-teal-600 mt-1">{t('services.totalServicesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">{t('services.active')}</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.active}</div>
              <p className="text-xs text-green-600 mt-1">{t('services.activeDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">{t('services.inactive')}</CardTitle>
              <EyeOff className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
              <p className="text-xs text-gray-600 mt-1">{t('services.inactiveDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">{t('services.categories')}</CardTitle>
              <Tag className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.categories}</div>
              <p className="text-xs text-purple-600 mt-1">{t('services.categoriesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">{t('services.avgPrice')}</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">${stats.avgPrice}</div>
              <p className="text-xs text-amber-600 mt-1">{t('services.avgPriceDesc')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('services.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">{t('services.allCategories')}</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">{t('services.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>

          <Button 
            onClick={handleCreateService}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('services.newService')}
          </Button>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('services.noServices')}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-teal-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-teal-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                        {service.name || t('services.noName')}
                      </CardTitle>
                      {service.category && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {service.category}
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={service.is_active ? 'default' : 'secondary'}
                      className={service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {service.is_active ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-teal-700">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">${service.price}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration_minutes} {t('services.durationMinutes')}</span>
                    </div>
                  </div>

                  {service.symptoms && service.symptoms.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">{t('services.symptoms')}:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.symptoms.slice(0, 3).map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                            {symptom}
                          </Badge>
                        ))}
                        {service.symptoms.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            +{service.symptoms.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300"
                      disabled={updateMutation.isPending}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('services.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleServiceStatus(service.id)}
                      className={service.is_active ? 'hover:bg-gray-50' : 'hover:bg-green-50'}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {service.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          {t('services.disable')}
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          {t('services.enable')}
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(service.id)}
                    className="w-full hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('services.delete')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isCreating ? t('services.createService') : t('services.editService')}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Ej: Biomagnetismo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.serviceDescription')} *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Descripción breve del servicio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.extendedDescription')}
                    </label>
                    <textarea
                      value={formData.extended_description}
                      onChange={(e) => setFormData({ ...formData, extended_description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Descripción extendida"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('services.price')} * ($)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('services.duration')} * ({t('services.durationMinutes')})
                      </label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="1"
                        step="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.category')}
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Ej: Terapia Alternativa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.slug')}
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="biomagnetismo (se genera automáticamente si está vacío)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.imageUrl')}
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="/images/services/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.symptoms')}
                    </label>
                    <input
                      type="text"
                      value={formData.symptoms.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        symptoms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder={t('services.symptomsPlaceholder')}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.diseases')}
                    </label>
                    <input
                      type="text"
                      value={formData.diseases.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        diseases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder={t('services.diseasesPlaceholder')}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separar con comas</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      {t('services.isActive')}
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setIsEditing(false)
                    }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {t('services.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveService}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? 'Guardando...' : t('services.saveChanges')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('services.confirmDelete')}</h3>
                  <p className="text-sm text-gray-600">{t('services.confirmDeleteMessage')}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deleteMutation.isPending}
                >
                  {t('services.cancel')}
                </Button>
                <Button
                  onClick={() => handleDeleteService(showDeleteConfirm)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Eliminando...' : t('services.deleteService')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
