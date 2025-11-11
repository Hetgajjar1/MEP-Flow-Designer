import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit2, Trash2, FolderKanban, Building2, MapPin, User } from 'lucide-react'
import type { Project, ProjectType, ProjectStatus } from '@/types'

interface ProjectsProps {
  userId: string
}

export function Projects({ userId }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'HVAC' as ProjectType,
    location: '',
    buildingType: '',
    area: 0,
    floors: 1,
    status: 'active' as ProjectStatus,
  })

  useEffect(() => {
    // Real-time listener for user's projects
    const projectsQuery = query(
      collection(db, 'projects'),
      where('owner', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projectsList: Project[] = []
      
      snapshot.forEach((doc) => {
        projectsList.push({ id: doc.id, ...doc.data() } as Project)
      })

      setProjects(projectsList)
      setFilteredProjects(projectsList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.buildingType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus)
    }

    setFilteredProjects(filtered)
  }, [searchTerm, filterType, filterStatus, projects])

  const handleCreateProject = async () => {
    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        owner: userId,
        ownerName: 'Demo User', // Will be replaced with real user name in Phase 7
        progress: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        type: 'HVAC',
        location: '',
        buildingType: '',
        area: 0,
        floors: 1,
        status: 'active',
      })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject) return

    try {
      await updateDoc(doc(db, 'projects', editingProject.id), {
        ...formData,
        updatedAt: serverTimestamp(),
      })

      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        type: 'HVAC',
        location: '',
        buildingType: '',
        area: 0,
        floors: 1,
        status: 'active',
      })
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId))
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      type: project.type,
      location: project.location,
      buildingType: project.buildingType,
      area: project.area,
      floors: project.floors,
      status: project.status,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground-muted">Loading projects...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PROJECTS</h1>
          <p className="text-sm text-foreground-muted mt-1">Manage your MEP engineering projects</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search projects by name, location, or building type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-background-card border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Types</option>
          <option value="HVAC">HVAC</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Fire Protection">Fire Protection</option>
          <option value="Integrated">Integrated</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-background-card border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Projects grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-foreground-muted mb-4" />
            <p className="text-foreground-muted mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No projects match your filters' 
                : 'No projects yet'}
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground mb-2">{project.name}</CardTitle>
                    <div className="flex gap-2 mb-3">
                      <Badge variant="default">{project.type}</Badge>
                      <Badge variant={project.status === 'active' ? 'active' : project.status === 'on-hold' ? 'on-hold' : 'completed'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(project)}
                      className="p-2 hover:bg-background-hover rounded-md transition-colors"
                      title="Edit project"
                    >
                      <Edit2 className="h-4 w-4 text-foreground-muted hover:text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 hover:bg-background-hover rounded-md transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4 text-foreground-muted hover:text-accent-red" />
                    </button>
                  </div>
                </div>
                <CardDescription className="text-sm text-foreground-muted line-clamp-2">
                  {project.description || `${project.type} system design for ${project.buildingType}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{project.buildingType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{project.location}</span>
                  </div>
                </div>
                <div className="text-xs text-foreground-muted">
                  {project.area.toLocaleString()} sq ft • {project.floors} floor{project.floors > 1 ? 's' : ''}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground-muted">Progress</span>
                    <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
                <div className="flex items-center gap-2 text-xs text-foreground-muted pt-2 border-t border-border">
                  <User className="h-3 w-3" />
                  <span>Updated {new Date(project.updatedAt.seconds * 1000).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-foreground">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </CardTitle>
              <CardDescription>
                {editingProject ? 'Update project details' : 'Enter project information to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Name *</label>
                <Input
                  placeholder="e.g., Downtown Office Building HVAC"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  placeholder="Brief project description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-background-card border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">System Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background-card border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Fire Protection">Fire Protection</option>
                    <option value="Integrated">Integrated</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background-card border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location *</label>
                <Input
                  placeholder="e.g., 123 Main St, New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Building Type *</label>
                <Input
                  placeholder="e.g., Office, Hospital, School"
                  value={formData.buildingType}
                  onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Area (sq ft) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Number of Floors *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.floors || ''}
                    onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={editingProject ? handleUpdateProject : handleCreateProject}
                  disabled={!formData.name || !formData.location || !formData.buildingType || formData.area <= 0}
                  className="flex-1"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingProject(null)
                    setFormData({
                      name: '',
                      description: '',
                      type: 'HVAC',
                      location: '',
                      buildingType: '',
                      area: 0,
                      floors: 1,
                      status: 'active',
                    })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
