import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, LogIn } from 'lucide-react'

export function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        if (!name) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: name })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      const firebaseError = err as { code?: string; message?: string }
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('No account found with this email')
          break
        case 'auth/wrong-password':
          setError('Incorrect password')
          break
        case 'auth/email-already-in-use':
          setError('An account with this email already exists')
          break
        case 'auth/weak-password':
          setError('Password should be at least 6 characters')
          break
        case 'auth/invalid-email':
          setError('Invalid email address')
          break
        default:
          setError(firebaseError.message || 'An error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-card flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />
            {isSignup ? 'Create Account' : 'MEP Flow Designer'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex gap-2 p-3 rounded-md bg-red-900/20 border border-red-700/50 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Log In'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-foreground-muted">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup)
                  setError('')
                  setEmail('')
                  setPassword('')
                  setName('')
                }}
                className="text-primary hover:text-primary-hover font-medium"
              >
                {isSignup ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-foreground-muted text-center mb-3">
              Demo Mode: Use any email/password to continue
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setEmail('demo@mepflow.com')
                setPassword('demo123')
                setIsSignup(false)
              }}
              disabled={loading}
            >
              Try Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
