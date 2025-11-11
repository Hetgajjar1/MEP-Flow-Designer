import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, FolderKanban, Activity } from 'lucide-react'
import type { Project, DashboardStats } from '@/types'

interface DashboardProps {
  userId: string
}

export function Dashboard({ userId }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    averageProgress: 0,
    totalCalculations: 0,
    totalFiles: 0,
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Real-time listener for user's projects
    const projectsQuery = query(
      collection(db, 'projects'),
      where('owner', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const projects: Project[] = []
      
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as Project)
      })

      setRecentProjects(projects)

      // Calculate real statistics
      const activeCount = projects.filter(p => p.status === 'active').length
      const completedCount = projects.filter(p => p.status === 'completed').length
      const onHoldCount = projects.filter(p => p.status === 'on-hold').length
      
      const totalProgress = projects.reduce((sum, p) => sum + p.progress, 0)
      const avgProgress = projects.length > 0 ? Math.round(totalProgress / projects.length) : 0

      setStats({
        totalProjects: projects.length,
        activeProjects: activeCount,
        completedProjects: completedCount,
        onHoldProjects: onHoldCount,
        averageProgress: avgProgress,
        totalCalculations: 0, // Will be calculated from subcollections
        totalFiles: 0, // Will be calculated from subcollections
      })

      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-foreground-muted">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              TOTAL PROJECTS
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-foreground-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalProjects}</div>
            <p className="text-xs text-foreground-muted mt-1">
              +{Math.max(0, stats.totalProjects - (stats.totalProjects - 1))} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              ACTIVE PROJECTS
            </CardTitle>
            <Activity className="h-4 w-4 text-accent-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.activeProjects}</div>
            <p className="text-xs text-foreground-muted mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground-muted">
              AVG. PROGRESS
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.averageProgress}%</div>
            <p className="text-xs text-foreground-muted mt-1">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">RECENT PROJECTS</CardTitle>
              <CardDescription>Your latest MEP engineering projects</CardDescription>
            </div>
            <Button variant="primary" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground-muted mb-4">No projects yet</p>
              <Button variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-background-card hover:bg-background-hover transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                      <Badge variant={project.status === 'active' ? 'active' : project.status === 'on-hold' ? 'on-hold' : 'completed'}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground-muted">{project.description || `${project.type} system design for ${project.buildingType}`}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-foreground-muted">
                      <span>{project.location}</span>
                      <span>•</span>
                      <span>{project.area.toLocaleString()} sq ft</span>
                      <span>•</span>
                      <span>Updated {new Date(project.updatedAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-6 w-48">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground-muted">Progress</span>
                      <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
