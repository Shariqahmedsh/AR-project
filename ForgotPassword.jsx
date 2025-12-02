import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone, Key, Lock, Loader2, Shield } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { toast } from '../components/ui/use-toast'
import API_CONFIG from '../lib/api'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: enter phone, 2: enter code + new password
  const [phoneNumber, setPhoneNumber] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verificationId, setVerificationId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendCode = async () => {
    if (!phoneNumber) { toast({ title: 'Missing phone number', description: 'Enter your phone number first.', variant: 'destructive' }); return }
    try {
      setIsSubmitting(true)
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.forgotPassword), {
        method: 'POST', headers: API_CONFIG.getDefaultHeaders(), body: JSON.stringify({ phoneNumber })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Request failed')
      
      // Store verificationId if provided (for MessageCentral VerifyNow)
      if (data.verificationId) {
        setVerificationId(data.verificationId)
      }
      
      toast({ title: 'Code sent', description: 'If the phone number exists, a code has been sent via SMS.' })
      setStep(2)
    } catch (e) {
      toast({ title: 'Request failed', description: e.message || 'Please try again later.', variant: 'destructive' })
    } finally { setIsSubmitting(false) }
  }

  const reset = async () => {
    if (!code || !newPassword) { toast({ title: 'Missing fields', description: 'Enter code and new password.', variant: 'destructive' }); return }
    if (code.length < 4) { toast({ title: 'Invalid code', description: 'Please enter the verification code.', variant: 'destructive' }); return }
    if (newPassword.length < 6) { toast({ title: 'Weak password', description: 'Password must be at least 6 characters.', variant: 'destructive' }); return }
    try {
      setIsSubmitting(true)
      
      // Use the same verification approach as signup (MessageCentral VerifyNow)
      const requestBody = { phoneNumber, code, newPassword, verificationId }
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resetPassword), {
        method: 'POST', headers: API_CONFIG.getDefaultHeaders(), body: JSON.stringify(requestBody)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Unable to reset')
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' })
      navigate('/login')
    } catch (e) {
      toast({ title: 'Reset failed', description: e.message, variant: 'destructive' })
    } finally { setIsSubmitting(false) }
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
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>{step===1 ? 'Enter your registered phone number and we\'ll send a verification code via SMS.' : 'Enter the code and your new password.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {step===1 ? (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="phoneNumber"><Phone className="inline w-4 h-4 mr-1"/>Registered Phone Number</Label><Input id="phoneNumber" type="tel" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} className="glass-effect" placeholder="Enter your phone number" /></div>
              <div className="flex gap-2">
                <Button onClick={sendCode} disabled={isSubmitting || !phoneNumber} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">{isSubmitting ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Sending...</span>):'Send Code'}</Button>
                <Button onClick={()=>navigate('/login')} variant="outline" className="w-full glass-effect" disabled={isSubmitting}>Back</Button>
              </div>
              <div className="text-center text-sm"><Link to="/login" className="underline">Back to login</Link></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="code"><Key className="inline w-4 h-4 mr-1"/>Verification Code</Label><Input id="code" value={code} onChange={e=>setCode(e.target.value)} className="glass-effect" placeholder="Enter 4-digit code" /></div>
              <div className="space-y-2"><Label htmlFor="newpass"><Lock className="inline w-4 h-4 mr-1"/>New Password</Label><Input id="newpass" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="glass-effect" placeholder="Enter new password" /></div>
              <div className="flex gap-2">
                <Button onClick={reset} disabled={isSubmitting || !code || !newPassword} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">{isSubmitting ? (<span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/>Updating...</span>):'Update Password'}</Button>
                <Button onClick={()=>setStep(1)} variant="outline" className="w-full glass-effect" disabled={isSubmitting}>Back</Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    try {
                      setIsSubmitting(true)
                      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.forgotPassword), {
                        method: 'POST', 
                        headers: API_CONFIG.getDefaultHeaders(), 
                        body: JSON.stringify({ phoneNumber })
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.message || 'Request failed')
                      
                      // Update verificationId if provided
                      if (data.verificationId) {
                        setVerificationId(data.verificationId)
                      }
                      
                      toast({ title: 'Code resent', description: 'A new verification code has been sent via SMS.' })
                    } catch (e) {
                      toast({ title: 'Resend failed', description: e.message || 'Please try again later.', variant: 'destructive' })
                    } finally { 
                      setIsSubmitting(false) 
                    }
                  }}
                  disabled={isSubmitting || !phoneNumber} 
                  variant="outline" 
                  className="w-full glass-effect"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin"/>
                      Resending...
                    </span>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


