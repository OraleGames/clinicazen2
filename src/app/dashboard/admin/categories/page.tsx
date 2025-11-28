'use client';

import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tag, Plus, Edit, Trash2, Search, AlertCircle, Grid3x3, List } from 'lucide-react'
import { t } from '@/lib/i18n'
import { useServiceCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/useServiceCategories'
import type { ServiceCategory } from '@/types/therapy'
import { toast } from 'sonner'

export default function AdminCategoriesPage() {
  const { user } = useAuth()

  // Query hooks
  const { data: categories = [], isLoading, error } = useServiceCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  // Local state
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreating(false)
        setIsEditing(false)
        setShowDeleteConfirm(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const filtered = useMemo(() => {
    return categories.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || (cat.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [categories, searchTerm])

  function startCreate() {
    setFormData({ name: '', description: '', icon: '' })
    setSelectedCategory(null)
    setIsCreating(true)
  }

  function startEdit(cat: ServiceCategory) {
    setSelectedCategory(cat)
    setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '' })
    setIsEditing(true)
  }

  async function saveCategory() {
    try {
      if (!formData.name.trim()) {
        toast.error('El nombre es requerido')
        return
      }
      if (isCreating) {
        await createMutation.mutateAsync({ name: formData.name, description: formData.description || undefined, icon: formData.icon || undefined })
        toast.success('Categoría creada')
        setIsCreating(false)
      } else if (isEditing && selectedCategory) {
        await updateMutation.mutateAsync({ id: selectedCategory.id, name: formData.name, description: formData.description || undefined, icon: formData.icon || undefined })
        toast.success('Categoría actualizada')
        setIsEditing(false)
      }
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar la categoría')
    }
  }

  async function deleteCategory(id: number) {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Categoría eliminada')
      setShowDeleteConfirm(null)
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar la categoría')
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role={user?.role || 'ADMIN'}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role={user?.role || 'ADMIN'}>
        <div className="p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span> Error al cargar categorías </span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role={user?.role || 'ADMIN'}>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('categories.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('categories.description')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-1 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">{t('categories.total')}</CardTitle>
              <Tag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{categories.length}</div>
              <p className="text-xs text-blue-600 mt-1">{t('categories.totalDesc')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={t('categories.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>

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
            onClick={startCreate}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t('categories.newCategory')}
          </Button>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('categories.noCategories')}</p>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cat => (
              <Card key={cat.id} className="group hover:shadow-xl transition-all duration-300 border hover:border-cyan-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-cyan-700 transition-colors line-clamp-1">
                        {cat.name}
                      </CardTitle>
                      {cat.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(cat)}
                      className="hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300"
                      disabled={updateMutation.isPending}
                    >
                      <Edit className="h-4 w-4 mr-1" /> {t('categories.edit')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(cat.id)}
                      className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> {t('categories.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(cat => (
              <Card key={cat.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{cat.description || 'Sin descripción'}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(cat)}
                        className="hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300"
                        disabled={updateMutation.isPending}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(cat.id)}
                        className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {cat.description && (
                    <div className="pt-2 border-t border-gray-100 text-sm text-gray-600 line-clamp-2">{cat.description}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-xl w-full shadow-2xl border border-gray-200">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isCreating ? t('categories.createCategory') : t('categories.editCategory')}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.name')} *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
                      placeholder="Ej: Terapias Energéticas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.descriptionField')}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
                      placeholder="Descripción breve de la categoría"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('categories.icon')}</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-500"
                      placeholder="Nombre del icono (opcional)"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => { setIsCreating(false); setIsEditing(false) }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {t('categories.cancel')}
                  </Button>
                  <Button
                    onClick={saveCategory}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? t('common.loading') : t('categories.saveChanges')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-gray-900/20 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('categories.confirmDelete')}</h3>
                  <p className="text-sm text-gray-600">{t('categories.confirmDeleteMessage')}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={deleteMutation.isPending}
                  className="text-gray-700 hover:text-gray-900"
                >
                  {t('categories.cancel')}
                </Button>
                <Button
                  onClick={() => deleteCategory(showDeleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteMutation.isPending ? 'Eliminando...' : t('categories.deleteCategory')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
