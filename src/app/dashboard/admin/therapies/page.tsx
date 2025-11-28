'use client';

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
  AlertCircle,
  Grid3x3,
  List
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
import { useServiceCategories } from '@/lib/hooks/useServiceCategories'
import { toast } from 'sonner'

interface DatabaseService extends Service {
  created_at?: string
  updated_at?: string
}

export default function AdminServicesDashboard() {
  const { user } = useAuth()
  
  // TanStack Query hooks
  const { data: services = [], isLoading, error: queryError } = useServices(false)
  const { data: categories = [] } = useServiceCategories()
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Form state - only include fields that exist in the database schema
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    extended_description: '',
    price: 0,
    duration_minutes: 60,
    image_url: '',
    category_id: 0
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
      const categoryName = service.category?.name || (service as any).category_name || ''
      const matchesCategory = filterCategory === 'all' || categoryName === filterCategory
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
    categories: new Set(services.map(s => s.category?.name || (s as any).category_name).filter(Boolean)).size,
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
      price: service.price || 0,
      duration_minutes: service.duration_minutes || 60,
      image_url: service.image_url || '',
      category_id: service.category_id || 0
    })
    setIsEditing(true)
  }

  const handleCreateService = () => {
    setSelectedService(null)
    setFormData({
      name: '',
      description: '',
      extended_description: '',
      price: 0,
      duration_minutes: 60,
      image_url: '',
      category_id: 0
    })
    setIsCreating(true)
  }

  const handleSaveService = async () => {
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        extended_description: formData.extended_description,
        image_url: formData.image_url,
        price: Number(formData.price),
        duration_minutes: Number(formData.duration_minutes),
        category_id: Number(formData.category_id),
        is_active: true
      }

      if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0 || formData.duration_minutes <= 0 || !formData.category_id) {
        toast.error(t('services.requiredFields'))
        return
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

  const uniqueCategories = Array.from(
    new Set(
      services
        .map(s => s.category?.name)
        .filter((name): name is string => Boolean(name))
    )
  )

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('services.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('services.description')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">{t('services.totalServices')}</CardTitle>
              <Heart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-600 mt-1">{t('services.totalServicesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">{t('services.active')}</CardTitle>
              <Eye className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-900">{stats.active}</div>
              <p className="text-xs text-cyan-600 mt-1">{t('services.activeDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">{t('services.inactive')}</CardTitle>
              <EyeOff className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.inactive}</div>
              <p className="text-xs text-slate-600 mt-1">{t('services.inactiveDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">{t('services.categories')}</CardTitle>
              <Tag className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-900">{stats.categories}</div>
              <p className="text-xs text-teal-600 mt-1">{t('services.categoriesDesc')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">{t('services.avgPrice')}</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.avgPrice}</div>
              <p className="text-xs text-blue-600 mt-1">{t('services.avgPriceDesc')}</p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="all">{t('services.allCategories')}</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
          >
            <option value="all">{t('services.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="inactive">{t('common.inactive')}</option>
          </select>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              <Grid3x3 className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>

          <Button 
            onClick={handleCreateService}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('services.newService')}
          </Button>
        </div>

        {/* Services Display */}
        {filteredServices.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('services.noServices')}</p>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-xl transition-all duration-300 border hover:border-cyan-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                        {service.name || t('services.noName')}
                      </CardTitle>
                      {(service.category?.name || (service as any).category_name) && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {service.category?.name || (service as any).category_name}
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      variant={service.is_active ? 'default' : 'secondary'}
                      className={service.is_active ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-800'}
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
                    <div className="flex items-center gap-1 text-blue-700">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{service.price}</span>
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
                      className="hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300"
                      disabled={updateMutation.isPending}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('services.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleServiceStatus(service.id)}
                      className={service.is_active ? 'hover:bg-slate-50' : 'hover:bg-cyan-50'}
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
        ) : (
          // List View
          <div className="space-y-3">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* First Row: Main Info & Actions */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Left side: Name & Status */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{service.name || t('services.noName')}</h3>
                        <Badge 
                          variant={service.is_active ? 'default' : 'secondary'}
                          className={service.is_active ? 'bg-cyan-100 text-cyan-800 flex-shrink-0' : 'bg-slate-100 text-slate-800 flex-shrink-0'}
                        >
                          {service.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </div>

                      {/* Right side: Category, Price, Duration & Actions */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        {/* Category */}
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{service.category?.name || (service as any).category_name || 'Sin categoría'}</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-700">{service.price}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{service.duration_minutes} min</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                            className="hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300"
                            disabled={updateMutation.isPending}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleServiceStatus(service.id)}
                            className={service.is_active ? 'hover:bg-slate-50' : 'hover:bg-cyan-50'}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {service.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(service.id)}
                            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Second Row: Description */}
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl border border-gray-200">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
                        min="1"
                        step="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.category')} *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value={0}>{t('services.selectCategory')}</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image URL field - temporarily disabled
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('services.imageUrl')}
                    </label>
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
                      placeholder="/images/services/..."
                    />
                  </div>
                  */}
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setIsEditing(false)
                    }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {t('services.cancel')}
                  </Button>
                  <Button
                    onClick={handleSaveService}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) ?  t('common.saving') : t('services.saveChanges')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-gray-900/20 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200">
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
                  className="text-gray-700 hover:text-gray-900"
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
