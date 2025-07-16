// Enhanced CARV Authentication Page
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCarvAuth } from '@/lib/carv-sdk'
import { 
  Shield, 
  Wallet, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Lock,
  Fingerprint,
  Key
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Self-Sovereign Identity',
    description: 'Your identity, your data, your control with CARV Protocol'
  },
  {
    icon: Lock,
    title: 'Privacy by Design',
    description: 'Zero-knowledge proofs protect your sensitive information'
  },
  {
    icon: Fingerprint,
    title: 'Verifiable Credentials',
    description: 'Cryptographically secure proof of your civic contributions'
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'One-click authentication across all civic services'
  }
]

export default function SignInPage() {
  const { login, isAuthenticated, loading, initialized, hydrated } = useCarvAuth()
  const [authMethod, setAuthMethod] = useState<'carv' | 'email'>('carv')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // DISABLED: Only check for redirect after hydration and authentication check is complete
  // useEffect(() => {
  //   if (hydrated && initialized && !loading && isAuthenticated) {
  //     console.log('✅ User already authenticated, preparing redirect')
  //     const redirectTimer = setTimeout(() => {
  //       setShouldRedirect(true)
  //     }, 1000) // 1 second delay
      
  //     return () => clearTimeout(redirectTimer)
  //   }
  // }, [hydrated, initialized, loading, isAuthenticated])

  // // Separate effect for actual redirect
  // useEffect(() => {
  //   if (shouldRedirect) {
  //     console.log('✅ Redirecting to dashboard')
  //     window.location.href = '/dashboard'
  //   }
  // }, [shouldRedirect])

  // DISABLED: Show redirect message if already authenticated
  // if (hydrated && initialized && isAuthenticated && !loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-4">Already Signed In!</h1>
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">
  //           {shouldRedirect ? 'Redirecting to dashboard...' : 'Preparing dashboard...'}
  //         </p>
  //         <div className="mt-4">
  //           <Link href="/dashboard">
  //             <Button>Go to Dashboard</Button>
  //           </Link>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  const handleCarvAuth = async () => {
    try {
      setError('')
      const result = await login()
      
      if (result.success) {
        setSuccess('Successfully authenticated with CARV ID!')
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        setError(result.error || 'Authentication failed')
      }
    } catch {
      setError('Failed to connect with CARV. Please try again.')
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setError('')

    try {
      // For demo purposes, call the same login function for email auth
      if (email && password) {
        const result = await login()
        if (result.success) {
          setSuccess('Email authentication successful! Redirecting...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        } else {
          setError('Authentication failed. Please try again.')
        }
      } else {
        setError('Please enter both email and password')
      }
    } catch {
      setError('Email authentication failed. Please try again.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    try {
      setError('')
      setSuccess('Demo login successful! Redirecting...')
      const result = await login()
      
      if (result.success) {
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      }
    } catch {
      setError('Demo login failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AegisAI
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>                <Button variant="secondary" size="sm" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left side - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                <Zap className="w-3 h-3 mr-1" />
                Powered by CARV Protocol
              </Badge>
              <h1 className="text-4xl font-bold mb-4">
                Welcome to the Future of Civic Engagement
              </h1>
              <p className="text-xl text-blue-100">
                Secure, transparent, and user-controlled governance platform
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="font-semibold">Trusted by 15,000+ Citizens</span>
              </div>
              <p className="text-blue-100 text-sm">
                Join thousands of engaged citizens already using AegisAI to build better communities.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Authentication */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">
                Access your civic engagement dashboard
              </p>
            </div>

            {/* Authentication Method Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setAuthMethod('carv')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === 'carv'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                CARV ID
              </button>
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                Email
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* CARV Authentication */}
            {authMethod === 'carv' && (
              <Card>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle>Sign in with CARV ID</CardTitle>
                  <CardDescription>
                    Use your self-sovereign identity for secure, privacy-preserving authentication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleCarvAuth}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet & CARV ID
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Connect your Web3 wallet (MetaMask, etc.)</li>
                      <li>• Sign a message to verify ownership</li>
                      <li>• Your CARV ID will be automatically created</li>
                      <li>• Access full AegisAI features instantly</li>
                    </ul>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      By signing in, you agree to our{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>

                  {/* Demo Login for Testing */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button 
                      onClick={handleDemoLogin}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      🚀 Quick Demo Login (No Wallet Required)
                    </Button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Skip wallet setup and explore AegisAI features instantly
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Email Authentication */}
            {authMethod === 'email' && (
              <Card>
                <CardHeader>
                  <CardTitle>Sign in with Email</CardTitle>
                  <CardDescription>
                    Use your email address to access AegisAI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={emailLoading}
                      className="w-full"
                      size="lg"
                    >
                      {emailLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  <div className="mt-4">
                    <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                      Forgot your password?
                    </Link>
                  </div>

                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Upgrade to CARV ID</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Link your CARV ID</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Get enhanced security, privacy, and full platform features
                          </p>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setAuthMethod('carv')}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Learn More
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up for AegisAI
                </Link>
              </p>
            </div>

            {/* Support */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-2">Need help?</p>
              <div className="flex justify-center space-x-4 text-sm">
                <Link href="/help" className="text-blue-600 hover:underline">
                  Help Center
                </Link>
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
