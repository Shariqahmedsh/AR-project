import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Loader2, Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { toast } from '../components/ui/use-toast'
import API_CONFIG from '../lib/api'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState(location.state?.username || '')
  const [email, setEmail] = useState(location.state?.email || '')
  const [password, setPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(location.state?.phoneNumber || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(location.state?.mode === 'verify' ? 'code' : 'form') // 'form' | 'code'
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationId, setVerificationId] = useState(localStorage.getItem('verificationId') || '')

  // Signup - create account and send SMS code
  const handleSignup = async (e) => {
    e.preventDefault()
    if (!username || !email || !password || !phoneNumber) {
      toast({ title: 'Missing Information', description: 'Please fill in all fields.', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Weak Password', description: 'Password must be at least 6 characters.', variant: 'destructive' })
      return
    }
    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.register), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify({ username, email, password, name: username, phoneNumber })
      })
      const data = await res.json()
      console.group('API Register Response')
      console.log('Status:', res.status, res.statusText)
      console.log('URL:', API_CONFIG.getUrl(API_CONFIG.endpoints.auth.register))
      console.log('Body:', { username, email, phoneNumber })
      console.log('Response:', data)
      console.groupEnd()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      toast({ title: 'Code Sent', description: 'We sent a verification code via SMS.' })
      if (data.verificationId) {
        const id = String(data.verificationId)
        setVerificationId(id)
        localStorage.setItem('verificationId', id)
      }
      setStep('code')
    } catch (e) {
      toast({ title: 'Registration Failed', description: e.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyPhone = async (e) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length < 4) {
      toast({ title: 'Enter Code', description: 'Please enter the verification code.', variant: 'destructive' })
      return
    }
    try {
      setIsSubmitting(true)
      const requestBody = { phoneNumber, code: verificationCode, verificationId }
      console.log('📤 Verification Request Body:', requestBody)
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.verifyPhone), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(requestBody)
      })
      const data = await res.json()
      console.group('API Verify Phone Response')
      console.log('Status:', res.status, res.statusText)
      console.log('URL:', API_CONFIG.getUrl(API_CONFIG.endpoints.auth.verifyPhone))
      console.log('Body:', requestBody)
      console.log('Response:', data)
      console.groupEnd()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      localStorage.removeItem('verificationId')
      toast({ title: 'Phone Verified', description: 'You can now sign in.' })
      navigate('/login')
    } catch (e) {
      toast({ title: 'Verification failed', description: e.message, variant: 'destructive' })
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
          <CardTitle className="text-xl flex items-center justify-center gap-2"><Users className="w-5 h-5" />Create Account</CardTitle>
          <CardDescription>Join the future of cybersecurity awareness</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'form' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="glass-effect" 
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input 
                id="phoneNumber" 
                type="tel" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                className="glass-effect" 
                placeholder="Enter your phone (without country code)"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="glass-effect" 
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="glass-effect pr-10" 
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyPhone} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input id="code" value={verificationCode} onChange={e=>setVerificationCode(e.target.value)} className="glass-effect" placeholder="Enter 4-digit code" />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" className="w-1/2" disabled={isSubmitting} onClick={async ()=>{
                  try{
                    setIsSubmitting(true)
                    const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resendPhoneCode), { method: 'POST', headers: API_CONFIG.getDefaultHeaders(), body: JSON.stringify({ phoneNumber }) })
                    const data = await res.json()
                    console.group('API Resend Phone Code Response')
                    console.log('Status:', res.status, res.statusText)
                    console.log('URL:', API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resendPhoneCode))
                    console.log('Body:', { phoneNumber })
                    console.log('Response:', data)
                    console.groupEnd()
                    if(!res.ok) throw new Error(data.error || 'Unable to resend code')
                    if (data.verificationId) {
                      const id = String(data.verificationId)
                      setVerificationId(id)
                      localStorage.setItem('verificationId', id)
                    }
                    toast({ title: 'Code resent', description: 'Check your SMS again.' })
                  }catch(e){
                    toast({ title: 'Resend failed', description: e.message, variant: 'destructive' })
                  }finally{
                    setIsSubmitting(false)
                  }
                }}>Resend Code</Button>
                <Button type="submit" className="w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={isSubmitting}>
                  {isSubmitting ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verifying...</span>) : 'Verify'}
                </Button>
              </div>
          </form>
          )}
          <div className="mt-2 text-center text-sm">
            <span className="text-muted-foreground mr-1">Already have an account?</span>
            <Link to="/login" className="underline">Sign in</Link>
          </div>
        </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


