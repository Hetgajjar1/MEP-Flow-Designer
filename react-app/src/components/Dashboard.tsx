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
      <div className="flex flex-col items-center justify-center h-full">
        <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <div className="text-foreground-muted font-medium">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 bg-gradient-to-br from-background-card to-background hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Total Projects
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground bg-gradient-to-r from-foreground to-foreground-muted bg-clip-text">{stats.totalProjects}</div>
            <p className="text-xs text-accent-green mt-2 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{Math.max(0, stats.totalProjects - (stats.totalProjects - 1))} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-background-card to-background hover:shadow-xl hover:border-accent-green/30 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Active Projects
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-accent-green/10 flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
              <Activity className="h-5 w-5 text-accent-green" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{stats.activeProjects}</div>
            <p className="text-xs text-foreground-muted mt-2 font-medium">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-background-card to-background hover:shadow-xl hover:border-primary/30 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
              Avg. Progress
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-foreground">{stats.averageProgress}%</div>
            <p className="text-xs text-foreground-muted mt-2 font-medium">Across all projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-background-card to-background border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Recent Projects</CardTitle>
              <CardDescription className="text-foreground-muted font-medium">Your latest MEP engineering projects</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {recentProjects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground-muted mb-6 font-medium text-lg">No projects yet</p>
              <Button className="bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/30">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="group flex items-center justify-between p-5 rounded-xl border border-border/50 bg-gradient-to-r from-background-card to-background hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">{project.name}</h3>
                      <Badge 
                        variant={project.status === 'active' ? 'active' : project.status === 'on-hold' ? 'on-hold' : 'completed'}
                        className="px-3 py-1 text-xs font-semibold"
                      >
                        {project.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground-muted font-medium mb-2">{project.description || `${project.type} system design for ${project.buildingType}`}</p>
                    <div className="flex items-center gap-4 text-xs text-foreground-muted font-medium">
                      <span className="flex items-center gap-1">
                        📍 {project.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        📐 {project.area.toLocaleString()} sq ft
                      </span>
                      <span>•</span>
                      <span>🕒 {new Date(project.updatedAt.seconds * 1000).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-6 w-52">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-foreground-muted font-semibold uppercase tracking-wide">Progress</span>
                      <span className="text-sm font-black text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
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
