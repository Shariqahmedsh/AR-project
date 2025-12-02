import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { toast } from '../components/ui/use-toast'
import API_CONFIG from '../lib/api'

export default function AdminLogin() {
  const navigate = useNavigate()
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
        method: 'POST', headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')

      const role = (data.user?.role || '').toLowerCase()
      if (role !== 'admin') {
        toast({ title: 'Admin Access Only', description: 'This account does not have admin privileges.', variant: 'destructive' })
        return
      }

      localStorage.setItem('userData', JSON.stringify({ ...data.user, token: data.token, loginTime: new Date().toISOString(), loginType: 'admin' }))
      toast({ title: 'Welcome Admin', description: 'Redirecting to the Admin Panel.' })
      navigate('/admin')
    } catch (e) {
      toast({ title: 'Authentication Failed', description: e.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 mb-4 glow-effect">
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-3xl font-bold cyber-text mb-2">
            Admin Login
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-muted-foreground">
            Authorized personnel only
          </motion.p>
        </div>

        <Card className="glass-effect cyber-border w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center gap-2"><Crown className="w-5 h-5" />Administrator</CardTitle>
            <CardDescription>Access the administrative panel</CardDescription>
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
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} className="glass-effect pr-10" />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700" disabled={isSubmitting}>
                {isSubmitting ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing In...</span>) : 'Sign In'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="underline text-muted-foreground hover:text-foreground">Back to user login</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


