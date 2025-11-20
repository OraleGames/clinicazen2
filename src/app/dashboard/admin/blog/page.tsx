"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Search,
  Save,
  Image as ImageIcon,
  Bold,
  Italic,
  List
} from 'lucide-react'
import Link from 'next/link'
import { BlogPost } from '@/types/BlogPost'

// Mock blog posts - replace with real data from Supabase
const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Los Beneficios del Biomagnetismo",
    slug: "los-beneficios-del-biomagnetismo",
    excerpt: "Descubre cómo el biomagnetismo puede mejorar tu salud",
    content: "El biomagnetismo es una terapia alternativa que utiliza imanes para equilibrar el pH del cuerpo...",
    image_url: "/images/biomagnetismo.jpg",
    published: true,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
    author_id: "admin",
    author: { id: "admin", name: "Admin", avatar_url: null }
  },
  {
    id: 2,
    title: "Cómo Superar la Ansiedad con Terapias Holísticas",
    slug: "como-superar-la-ansiedad-con-terapias-holisticas",
    excerpt: "Aprende técnicas naturales para manejar la ansiedad",
    content: "La ansiedad es uno de los problemas más comunes en la sociedad moderna...",
    image_url: "/images/psicologia-clinica.jpg",
    published: true,
    created_at: "2025-01-14T15:30:00Z",
    updated_at: "2025-01-14T15:30:00Z",
    author_id: "admin",
    author: { id: "admin", name: "Admin", avatar_url: null }
  },
  {
    id: 3,
    title: "La Acupuntura y sus Beneficios Comprobados",
    slug: "la-acupuntura-y-sus-beneficios-comprobados",
    excerpt: "Conoce los beneficios científicamente comprobados de la acupuntura",
    content: "La acupuntura ha sido utilizada por miles de años...",
    image_url: "/images/acupuntura.jpg",
    published: true,
    created_at: "2025-01-13T14:20:00Z",
    updated_at: "2025-01-13T14:20:00Z",
    author_id: "admin",
    author: { id: "admin", name: "Admin", avatar_url: null }
  }
]

export default function AdminBlogDashboard() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && post.published) ||
                         (filterStatus === 'draft' && !post.published)
    return matchesSearch && matchesStatus
  })

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post)
    setIsEditing(true)
  }

  const handleSavePost = () => {
    // Here you would save to Supabase
    console.log('Saving post:', selectedPost)
    setIsEditing(false)
    setSelectedPost(null)
  }

  const handleDeletePost = (postId) => {
    // Here you would delete from Supabase
    console.log('Deleting post:', postId)
    setPosts(posts.filter(p => p.id !== postId))
  }

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.published).length,
    draftPosts: posts.filter(p => !p.published).length
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión del Blog
          </h1>
          <p className="text-gray-600">
            Crea y edita artículos informativos sobre terapias
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artículos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">En el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicados</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedPosts}</div>
              <p className="text-xs text-muted-foreground">Visibles para usuarios</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Borradores</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftPosts}</div>
              <p className="text-xs text-muted-foreground">En edición</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Lectura</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">Promedio de engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Artículo
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="published">Publicados</option>
              <option value="draft">Borradores</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posts List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Artículos del Blog</h2>
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <CardDescription className="mt-2">{post.excerpt}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={post.published ? 'default' : 'secondary'}>
                          {post.published ? 'Publicado' : 'Borrador'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-600">
                        Por: {post.author?.name || 'Desconocido'} • {new Date(post.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {post.image_url && (
                      <div className="mt-4">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Editor */}
          {isEditing && selectedPost && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Editar Artículo</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Editor de Contenido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del Artículo
                    </label>
                    <input
                      type="text"
                      value={selectedPost.title}
                      onChange={(e) => setSelectedPost({...selectedPost, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Amigable (Slug)
                    </label>
                    <input
                      type="text"
                      value={selectedPost.slug}
                      onChange={(e) => setSelectedPost({...selectedPost, slug: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracto
                    </label>
                    <textarea
                      value={selectedPost.excerpt || ''}
                      onChange={(e) => setSelectedPost({...selectedPost, excerpt: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido del Artículo
                    </label>
                    <div className="border border-gray-300 rounded-lg">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                        <button className="p-1 hover:bg-gray-100">
                          <Bold className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100">
                          <Italic className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100">
                          <List className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100">
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea
                        value={selectedPost.content || ''}
                        onChange={(e) => setSelectedPost({...selectedPost, content: e.target.value})}
                        rows={12}
                        className="w-full px-3 py-2 border-0 focus:ring-0 focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <Button onClick={handleSavePost}>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Artículo
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard/admin">
            <Button variant="outline">
              ← Volver al Panel Principal
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}