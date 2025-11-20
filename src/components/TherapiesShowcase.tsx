'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Clock, DollarSign, Star } from 'lucide-react'
import Link from 'next/link'

interface Therapy {
  id: number
  name: string
  description: string
  image_url?: string
  price: number
  duration_minutes: number
  category?: string
}

interface TherapiesShowcaseProps {
  embedded?: boolean
}

export default function TherapiesShowcase({ embedded = false }: TherapiesShowcaseProps) {
  const [therapies, setTherapies] = useState<Therapy[]>([])
  const [filteredTherapies, setFilteredTherapies] = useState<Therapy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  useEffect(() => {
    loadTherapies()
  }, [])

  useEffect(() => {
    filterTherapies()
  }, [therapies, searchTerm, minPrice, maxPrice])

  const loadTherapies = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/therapies')
      if (!res.ok) throw new Error('Failed to load therapies')
      const data = await res.json()
      setTherapies(data.therapies || [])
    } catch (error) {
      console.error('Error loading therapies:', error)
      setTherapies([])
    } finally {
      setLoading(false)
    }
  }

  const filterTherapies = () => {
    let filtered = [...therapies]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(therapy =>
        therapy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        therapy.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filters
    if (minPrice) {
      filtered = filtered.filter(therapy => therapy.price >= Number(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(therapy => therapy.price <= Number(maxPrice))
    }

    setFilteredTherapies(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setMinPrice('')
    setMaxPrice('')
  }

  const containerClass = embedded 
    ? "space-y-6" 
    : "min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50"

  const innerContainerClass = embedded 
    ? "" 
    : "container mx-auto px-4 py-12"

  return (
    <div className={containerClass}>
      <div className={innerContainerClass}>
        {/* Header */}
        {!embedded && (
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
        )}

        {embedded && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Buscar Terapias</h1>
            <p className="text-gray-600">Encuentra la terapia perfecta para tus necesidades</p>
          </div>
        )}

        {/* Filters */}
        <Card className={`mb-10 border-0 ${embedded ? 'shadow-lg' : 'shadow-2xl'} rounded-3xl overflow-hidden`}>
          <CardHeader className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 pb-8">
            <CardTitle className="flex items-center gap-3 text-white text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Filter className="h-6 w-6" />
              </div>
              Filtrar Terapias
            </CardTitle>
            <p className="text-blue-50 mt-2">Encuentra la terapia perfecta para ti</p>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 group-focus-within:text-cyan-600 transition-colors" />
                <Input
                  placeholder="Buscar terapias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all"
                />
              </div>

              {/* Price Range */}
              <Input
                type="number"
                placeholder="💰 Precio mínimo $"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-teal-400 rounded-xl shadow-sm hover:shadow-md transition-all"
              />
              <Input
                type="number"
                placeholder="💰 Precio máximo $"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-teal-400 rounded-xl shadow-sm hover:shadow-md transition-all"
              />
            </div>

            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="h-10 border-2 border-gray-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all"
              >
                ✕ Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Therapies Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-xl font-medium">Cargando terapias...</p>
          </div>
        ) : filteredTherapies.length === 0 ? (
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
            {filteredTherapies.map(therapy => (
              <Card key={therapy.id} className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl bg-white transform hover:-translate-y-2">
                {therapy.image_url && (
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={therapy.image_url}
                      alt={therapy.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
                <CardHeader className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {therapy.name}
                    </CardTitle>
                    {therapy.category && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md px-3 py-1">
                        {therapy.category}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2 text-gray-600 mt-2 text-base">
                    {therapy.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-700">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold">{therapy.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <DollarSign className="h-5 w-5 font-bold" />
                      <span className="text-2xl font-bold">{therapy.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/terapias/${therapy.id}`} className="flex-1">
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
