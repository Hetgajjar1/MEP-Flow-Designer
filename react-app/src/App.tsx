import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Sidebar } from '@/components/Sidebar'
import { TopBar } from '@/components/TopBar'
import { Dashboard } from '@/components/Dashboard'
import { Projects } from '@/components/Projects'
import { Calculations } from '@/components/Calculations'
import type { User as UserType } from '@/types'

function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Real-time authentication state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: userData.role || 'engineer',
              createdAt: userData.createdAt,
            } as UserType)
          } else {
            // User document doesn't exist, create basic profile
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.email?.split('@')[0] || 'User',
              role: 'engineer',
            } as UserType)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground-muted">Loading MEP Flow Designer...</div>
      </div>
    )
  }

  // For now, allow access without authentication (add login later in Phase 7)
  const mockUser = currentUser || {
    uid: 'demo-user',
    email: 'demo@mepflow.com',
    displayName: 'Demo User',
    role: 'engineer' as const,
  }

  return (
    <Router>
      <div className="flex h-screen bg-background">
        <Sidebar 
          user={{
            name: mockUser.displayName,
            email: mockUser.email,
            role: mockUser.role,
          }} 
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar 
            title="MEP Flow Designer" 
            subtitle="Building Information Modeling & Engineering Calculations"
          />
          
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard userId={mockUser.uid} />} />
              <Route path="/projects" element={<Projects userId={mockUser.uid} />} />
              <Route path="/calculations" element={<Calculations userId={mockUser.uid} />} />
              <Route path="/files" element={<div className="text-foreground">Files Page (Coming in Phase 6)</div>} />
              <Route path="/settings" element={<div className="text-foreground">Settings Page (Coming in Phase 7)</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
