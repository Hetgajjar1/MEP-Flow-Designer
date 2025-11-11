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
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-background to-[#1a1f2e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-green/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      <Card className="w-full max-w-md relative z-10 glass border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent-green rounded-xl flex items-center justify-center shadow-lg shadow-primary/50 mb-2">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            {isSignup ? 'Create Account' : 'MEP Flow Designer'}
          </CardTitle>
          <p className="text-sm text-foreground-muted">
            {isSignup ? 'Start designing MEP systems today' : 'Sign in to your account'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex gap-2 p-3 rounded-lg bg-accent-red/10 border border-accent-red/30 text-red-300 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isSignup && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={loading}
                  required
                  className="h-11 bg-background-card/50 border-border/50 focus:border-primary focus:bg-background-card transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                required
                className="h-11 bg-background-card/50 border-border/50 focus:border-primary focus:bg-background-card transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                required
                className="h-11 bg-background-card/50 border-border/50 focus:border-primary focus:bg-background-card transition-all"
              />
              {!isSignup && (
                <p className="text-xs text-foreground-muted">
                  At least 6 characters
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg hover:shadow-primary/50 transition-all duration-200 font-semibold text-base"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background-card px-2 text-foreground-muted">
                  {isSignup ? 'Already have an account?' : 'Need an account?'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
                setEmail('')
                setPassword('')
                setName('')
              }}
              className="w-full text-center text-sm text-primary hover:text-primary-hover font-semibold transition-colors"
            >
              {isSignup ? 'Sign In Instead' : 'Create New Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-foreground-muted text-center mb-3 font-medium">
              Quick Demo Access
            </p>
            <Button
              variant="outline"
              className="w-full h-11 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all font-medium"
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
