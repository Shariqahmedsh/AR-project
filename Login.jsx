import React, { useState, useMemo } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { toast } from '../components/ui/use-toast'
import API_CONFIG from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminMode = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return (params.get('type') || '').toLowerCase() === 'admin'
  }, [location.search])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'destructive' })
      return
    }
    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.login), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      console.group('API Login Response')
      console.log('Status:', res.status, res.statusText)
      console.log('URL:', API_CONFIG.getUrl(API_CONFIG.endpoints.auth.login))
      console.log('Body:', { username })
      console.log('Response:', data)
      console.groupEnd()
      // If phone not verified, route to signup page for verification
      if (res.status === 403 && data?.requiresPhoneVerification) {
        toast({ title: 'Phone Verification Required', description: 'Please verify your phone number to continue.' })
        navigate('/signup', { state: { mode: 'verify', phoneNumber: data.phoneNumber, username } })
        return
      }
      if (!res.ok) throw new Error(data.error || 'Authentication failed')
      
      // Check if user needs verification
      // Legacy email verification (kept for safety)
      if (data.requiresVerification) {
        toast({ title: 'Verification Required', description: 'Please verify your account to continue.' })
        navigate('/signup', { state: { mode: 'verify', email: data.user?.email, username: data.user?.username } })
        return
      }
      
      localStorage.setItem('userData', JSON.stringify({ ...data.user, token: data.token, loginTime: new Date().toISOString(), loginType: 'user' }))
      toast({ title: 'Login Successful!', description: 'Welcome to the AR Cybersecurity Platform.' })
      if ((data.user?.role || '').toLowerCase() === 'admin' || isAdminMode) {
        navigate('/admin')
      } else {
        navigate('/introduction')
      }
    } catch (e) {
      toast({ title: 'Authentication Failed', description: e.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 glow-effect overflow-hidden"
          >
            <img src="/models/cyberLogo.png" alt="Cyber Logo" className="w-14 h-14 object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold cyber-text mb-2"
          >
            AR CyberGuard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground"
          >
            Empowering Digital Citizens Through AR
          </motion.p>
        </div>
        <Card className="glass-effect cyber-border w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl flex items-center justify-center gap-2"><Users className="w-5 h-5" />User Login</CardTitle>
          <CardDescription>Sign in to continue your cybersecurity journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e=>setUsername(e.target.value)} className="glass-effect" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} className="glass-effect pr-10" />
                <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isSubmitting}>
              {isSubmitting ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing In...</span>) : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="underline text-muted-foreground hover:text-foreground">Forgot password?</Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <span className="text-muted-foreground mr-1">Don’t have an account?</span>
            <Link to="/signup" className="underline">Sign up</Link>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <span className="text-muted-foreground mr-1">Authorized access. Click here to login as admin. </span>
            <Link to="/admin-login" className="underline">Admin login</Link>
          </div>
        </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


