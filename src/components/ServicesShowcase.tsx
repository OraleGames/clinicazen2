'use client'

import React, { useState, useEffect } from 'react'
import { servicesService, type Service, type Category, type Symptom, type Disease } from '@/lib/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Clock, DollarSign, Star } from 'lucide-react'
import Link from 'next/link'

export default function ServicesShowcase() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [diseases, setDiseases] = useState<Disease[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    symptom_id: '',
    disease_id: '',
    min_price: '',
    max_price: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadServices()
  }, [filters])

  const loadData = async () => {
    try {
      const [categoriesData, symptomsData, diseasesData] = await Promise.all([
        servicesService.getCategories(),
        servicesService.getSymptoms(),
        servicesService.getDiseases()
      ])
      
      setCategories(categoriesData)
      setSymptoms(symptomsData)
      setDiseases(diseasesData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadServices = async () => {
    try {
      setLoading(true)
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      )
      
      const servicesData = await servicesService.getServices(activeFilters)
      setServices(servicesData)
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      symptom_id: '',
      disease_id: '',
      min_price: '',
      max_price: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-12">
        {/* Medical-themed Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl shadow-2xl mb-6">
            <span className="text-4xl">🩺</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Nuestras Terapias
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Descubre una amplia gama de terapias holísticas para mejorar tu bienestar físico, mental y emocional
          </p>
        </div>

        {/* Medical-styled Filters */}
        <Card className="mb-10 border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 pb-8">
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Filter className="h-6 w-6" />
              </div>
              Filtrar Terapias
            </CardTitle>
            <p className="text-blue-50 mt-2">Encuentra la terapia perfecta para tus necesidades</p>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 group-focus-within:text-cyan-600 transition-colors" />
                <Input
                  placeholder="Buscar terapias..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all"
                />
              </div>

              {/* Category */}
              <Select value={filters.category_id || 'all'} onValueChange={(value) => handleFilterChange('category_id', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-cyan-400 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <SelectValue placeholder="🏥 Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="💰 Min $"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-teal-400 rounded-xl shadow-sm hover:shadow-md transition-all"
                />
                <Input
                  type="number"
                  placeholder="💰 Max $"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="h-12 border-2 border-gray-200 focus:border-teal-400 rounded-xl shadow-sm hover:shadow-md transition-all"
                />
              </div>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="h-12 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
              >
                ✕ Limpiar Filtros
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              <Select value={filters.symptom_id || 'all'} onValueChange={(value) => handleFilterChange('symptom_id', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <SelectValue placeholder="🤕 Síntomas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los síntomas</SelectItem>
                  {symptoms.map(symptom => (
                    <SelectItem key={symptom.id} value={symptom.id.toString()}>
                      {symptom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.disease_id || 'all'} onValueChange={(value) => handleFilterChange('disease_id', value === 'all' ? '' : value)}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-cyan-400 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <SelectValue placeholder="🏥 Condiciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las condiciones</SelectItem>
                  {diseases.map(disease => (
                    <SelectItem key={disease.id} value={disease.id.toString()}>
                      {disease.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Medical Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-xl rounded-2xl overflow-hidden">
                <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <CardHeader className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded-lg"></div>
                    <div className="h-3 bg-gray-200 rounded-lg w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : services.length === 0 ? (
          <Card className="text-center py-20 border-0 shadow-2xl rounded-3xl bg-white">
            <CardContent>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">No se encontraron terapias</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Intenta ajustar los filtros para encontrar lo que buscas
              </p>
              <Button 
                onClick={clearFilters}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg"
              >
                Limpiar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <Card key={service.id} className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white transform hover:-translate-y-2">
                {service.image_url && (
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </CardTitle>
                    {service.category && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md px-3 py-1">
                        {service.category.name}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 text-gray-600 mt-2 text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold">{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <DollarSign className="h-5 w-5 font-bold" />
                      <span className="text-2xl font-bold">{service.price}</span>
                    </div>
                  </div>

                  {service.symptoms && service.symptoms.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <span className="text-lg">💊</span> Ayuda con:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {service.symptoms.slice(0, 3).map((item: any) => (
                          <Badge key={item.symptom?.id || item.id} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 font-medium px-3 py-1">
                            {item.symptom?.name || item.name}
                          </Badge>
                        ))}
                        {service.symptoms.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700 font-medium px-3 py-1">
                            +{service.symptoms.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href={`/terapias/${service.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Button variant="outline" size="lg" className="px-4 border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 rounded-xl">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}