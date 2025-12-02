import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, User, Mail, Lock, Crown, Users, Loader2, Key } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import API_CONFIG from '../lib/api';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [forgotStage, setForgotStage] = useState(false);
  const [resetStage, setResetStage] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  // Single-view controller to avoid UI conflicts: 'form' | 'verify' | 'forgot' | 'reset'
  const [currentView, setCurrentView] = useState('form');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (isLogin) {
      if (!formData.username || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        toast({
          title: "Missing Information", 
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);
      let endpoint, requestData;
      
      if (loginType === 'admin') {
        // Admin login - use regular login endpoint but check for admin role
        if (!isLogin) {
          toast({
            title: "Admin Registration Not Allowed",
            description: "Admin accounts can only be created by system administrators.",
            variant: "destructive"
          });
          return;
        }
        endpoint = API_CONFIG.endpoints.auth.login;
        requestData = { username: formData.username, password: formData.password };
      } else {
        // User login/registration
        endpoint = isLogin ? API_CONFIG.endpoints.auth.login : API_CONFIG.endpoints.auth.register;
        requestData = isLogin 
          ? { username: formData.username, password: formData.password }
          : { 
              username: formData.username, 
              email: formData.email, 
              password: formData.password,
              name: formData.username
            };
      }

      console.log('API URL:', API_CONFIG.baseURL);
      console.log('Full endpoint:', API_CONFIG.getUrl(endpoint));
      
      const response = await fetch(API_CONFIG.getUrl(endpoint), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.group('API Auth Response')
      console.log('Status:', response.status, response.statusText)
      console.log('URL:', API_CONFIG.getUrl(endpoint))
      console.log('Body:', requestData)
      console.log('Response:', data)
      console.groupEnd()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Check if admin login was attempted but user is not admin
      if (loginType === 'admin') {
        // Check if the user has admin role from the backend response
        const isAdmin = data.user.role === 'admin' || data.user.username === 'admin' || data.user.email === 'admin@arcyberguard.com';
        
        if (!isAdmin) {
          toast({
            title: "Admin Access Denied",
            description: "This account does not have admin privileges.",
            variant: "destructive"
          });
          return;
        }
      }

      if (!isLogin) {
        // After registration, prompt for verification
        setAwaitingVerification(true);
        setCurrentView('verify');
        if (data.verificationId) setVerificationId(String(data.verificationId));
      }

      // Store user data and token in localStorage
      const userData = {
        ...data.user,
        token: data.token,
        loginTime: new Date().toISOString(),
        loginType: loginType,
        role: data.user.role || (loginType === 'admin' ? 'admin' : 'user')
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      toast({
        title: isLogin ? "Login Successful!" : "Account Created!",
        description: loginType === 'admin' 
          ? "Welcome to the Admin Panel." 
          : "Welcome to the AR Cybersecurity Platform."
      });

      setTimeout(() => {
        if (loginType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/introduction');
        }
      }, 1000);

    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!formData.email || !verificationCode) {
      toast({ title: 'Missing code', description: 'Enter the code sent to your email.', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.verifyEmail), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify({ email: formData.email, code: verificationCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      toast({ title: 'Verified', description: 'Your email has been verified.' });
      setAwaitingVerification(false);
      setCurrentView('form');
      setVerificationCode('');
    } catch (e) {
      toast({ title: 'Verification Failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      toast({ title: 'Missing email', description: 'Enter your email first.', variant: 'destructive' });
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resendCode), {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend code');
      toast({ title: 'Code Sent', description: 'A new verification code has been sent.' });
    } catch (e) {
      toast({ title: 'Resend Failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestAccess = () => {
    const guestData = {
      username: 'Guest User',
      email: 'guest@example.com',
      loginTime: new Date().toISOString(),
      isGuest: true,
      loginType: 'user'
    };
    localStorage.setItem('userData', JSON.stringify(guestData));
    
    toast({
      title: "Guest Access Granted",
      description: "Welcome! You can explore the platform as a guest."
    });

    setTimeout(() => {
      navigate('/introduction');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4 glow-effect"
          >
            <Shield className="w-8 h-8 text-white" />
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

        {/* Login Type Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-muted/20 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginType('user')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                loginType === 'user'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              User Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                loginType === 'admin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Crown className="w-4 h-4" />
              Admin Login
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Login Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${loginType === 'user' ? 'block' : 'hidden md:block'}`}
          >
            <Card className="glass-effect cyber-border h-full">
              <CardHeader className="text-center">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  {isLogin ? 'User Login' : 'Create Account'}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? 'Sign in to continue your cybersecurity journey'
                    : 'Join the future of cybersecurity awareness'
                  }
                </CardDescription>
              </CardHeader>
            <CardContent>
                {currentView==='verify' ? (
                  <div className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                      {formData.email
                        ? <>We sent a 6-digit verification code to {formData.email}. Enter it below to verify your email.</>
                        : <>Enter your registered email and the 6-digit code you received to verify your account.</>
                      }
                    </div>
                    {!formData.email && (
                      <div className="space-y-2">
                        <Label htmlFor="verify-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                      <Input
                          id="verify-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="glass-effect"
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Verification Code
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="glass-effect"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleVerify} disabled={isSubmitting} className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                        Verify
                      </Button>
                      <Button onClick={handleResend} variant="outline" disabled={isSubmitting} className="w-full glass-effect">
                        Resend Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                      {formData.email
                        ? <>We sent a 6-digit verification code to {formData.email}. Enter it below to verify your email.</>
                        : <>Enter your registered email and the 6-digit code you received to verify your account.</>
                      }
                    </div>
                    {!formData.email && (
                      <div className="space-y-2">
                        <Label htmlFor="verify-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          id="verify-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="glass-effect"
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="glass-effect pr-10"
                          required
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 glow-effect"
                      disabled={loginType !== 'user' || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isLogin ? 'Signing In...' : 'Creating Account...'}
                        </span>
                      ) : (
                        isLogin ? 'Sign In' : 'Create Account'
                      )}
                    </Button>
                  </form>
                )}

                {currentView==='forgot' && (
                  <div className="space-y-4 mt-4">
                    <div className="text-center text-sm text-muted-foreground">
                      Enter your registered email and we'll send a verification code.
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Registered Email
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="glass-effect"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            setIsSubmitting(true);
                      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.forgotPassword), {
                              method: 'POST',
                              headers: API_CONFIG.getDefaultHeaders(),
                              body: JSON.stringify({ email: formData.email })
                            });
                            await res.json();
                            toast({ title: 'Check your inbox', description: 'If the email exists, a code has been sent.' });
                            setResetStage(true);
                          } catch (e) {
                            toast({ title: 'Request failed', description: 'Please try again later.', variant: 'destructive' });
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting || !formData.email}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        Send Code
                      </Button>
                      <Button onClick={() => { setForgotStage(false); setResetStage(false); setAwaitingVerification(false); setCurrentView('form'); }} variant="outline" className="w-full glass-effect" disabled={isSubmitting}>
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {currentView==='reset' && (
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-code" className="flex items-center gap-2">
                        <Key className="w-4 h-4" />
                        Verification Code
                      </Label>
                      <Input id="reset-code" type="text" inputMode="numeric" value={resetCode} onChange={(e) => setResetCode(e.target.value)} className="glass-effect" disabled={isSubmitting} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        New Password
                      </Label>
                      <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="glass-effect" disabled={isSubmitting} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          try {
                            setIsSubmitting(true);
                            const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resetPassword), {
                              method: 'POST',
                              headers: API_CONFIG.getDefaultHeaders(),
                              body: JSON.stringify({ email: formData.email, code: resetCode, newPassword })
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || 'Unable to reset');
                            toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
                            setForgotStage(false);
                            setResetStage(false);
                            setResetCode('');
                            setNewPassword('');
                            setIsLogin(true);
                          } catch (e) {
                            toast({ title: 'Reset failed', description: e.message, variant: 'destructive' });
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        disabled={isSubmitting || !resetCode || !newPassword}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        Update Password
                      </Button>
                      <Button onClick={() => { setResetStage(false); setAwaitingVerification(false); setCurrentView('form'); }} variant="outline" className="w-full glass-effect" disabled={isSubmitting}>
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full glass-effect hover:bg-muted/50"
                    onClick={handleGuestAccess}
                    disabled={isSubmitting}
                  >
                    Continue as Guest
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      {isLogin 
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"
                      }
                    </button>
                    {!isLogin && currentView==='form' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => { setAwaitingVerification(true); setCurrentView('verify'); }}
                          className="text-sm text-muted-foreground hover:text-foreground underline"
                        >
                          Have a verification code?
                        </button>
                      </div>
                    )}
                    {isLogin && currentView==='form' && (
                      <div>
                        <button
                          type="button"
                          onClick={() => { setForgotStage(true); setResetStage(false); setAwaitingVerification(false); setCurrentView('forgot'); }}
                          className="text-sm text-muted-foreground hover:text-foreground underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`${loginType === 'admin' ? 'block' : 'hidden md:block'}`}
          >
            <Card className="glass-effect cyber-border h-full border-amber-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-xl flex items-center justify-center gap-2 text-amber-500">
                  <Crown className="w-5 h-5" />
                  Admin Login
                </CardTitle>
                <CardDescription>
                  Access the administrative panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Admin Username
                    </Label>
                      <Input
                      id="admin-username"
                      name="username"
                      type="text"
                      placeholder="Enter admin username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="glass-effect"
                        required
                        disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Admin Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter admin password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="glass-effect pr-10"
                        required
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 glow-effect"
                    disabled={loginType !== 'admin' || isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Admin Signing In...
                      </span>
                    ) : (
                      'Admin Sign In'
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <strong>Default Admin Credentials:</strong><br />
                    Username: <code className="bg-amber-500/20 px-1 rounded">admin</code><br />
                    Password: <code className="bg-amber-500/20 px-1 rounded">AdminSecure123!</code>
                  </p>
                  <p className="text-xs text-amber-500/70 mt-2">
                    Please change the default password after first login.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;