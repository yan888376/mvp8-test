"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Chrome, Mail, Eye, EyeOff, Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
// import { PhoneAuthModal } from "@/components/phone-auth-modal"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuth: (userData: any) => void
  authMode?: "login" | "signup"
}

export function AuthModal({ open, onOpenChange, onAuth, authMode = "login" }: AuthModalProps) {
  const { signIn } = useAuth()
  const [mode, setMode] = useState(authMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showBenefits, setShowBenefits] = useState(true)
  // const [showPhoneAuth, setShowPhoneAuth] = useState(false)

  // Update mode when authMode prop changes
  useEffect(() => {
    setMode(authMode)
  }, [authMode])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setEmail("")
      setPassword("")
      setError("")
      setSuccess("")
      setShowPassword(false)
      setLoading(false)
      setShowBenefits(true)
    }
  }, [open])

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      if (mode === "signup") {
        // Sign up
        const { data, error } = await auth.signUp(email, password)
        if (error) {
          setError(error.message)
          return
        }
        
        if (data.user) {
          // Check if email confirmation is required
          if (!data.user.email_confirmed_at) {
            setSuccess("Account created successfully! Please check your email to confirm your account.")
            return
          }
          
          const userData = {
            type: "authenticated" as const,
            name: data.user.user_metadata?.full_name || email.split("@")[0],
            email: data.user.email || email,
            customCount: 0,
            pro: false,
            id: data.user.id
          }
          signIn(userData)
          onAuth(userData)
          onOpenChange(false)
        } else {
          setSuccess("Account created! Please check your email to confirm your account.")
        }
      } else {
        // Sign in
        const { data, error } = await auth.signIn(email, password)
        if (error) {
          setError(error.message)
          return
        }
        
        if (data.user) {
          const userData = {
            type: "authenticated" as const,
            name: data.user.user_metadata?.full_name || email.split("@")[0],
            email: data.user.email || email,
            customCount: 0,
            pro: false,
            id: data.user.id
          }
          signIn(userData)
          onAuth(userData)
          onOpenChange(false)
        }
      }
      
      // Reset form
      setEmail("")
      setPassword("")
      setError("")
    } catch (err) {
      setError("Authentication failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialAuth = async (provider: string) => {
    setLoading(true)
    setError("")

    try {
      if (provider === "google") {
        const { data, error } = await auth.signInWithGoogle()
        if (error) {
          setError(error.message)
          return
        }
        // OAuth redirects to callback, so we don't need to handle the user data here
      } 
      else {
        setError(`${provider} authentication is temporarily disabled. Please use Google or email login.`)
        return
      }
      
      // Close modal - user will be redirected for OAuth
      onOpenChange(false)
    } catch (err) {
      setError(`${provider} authentication failed. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login")
    setError("")
    setSuccess("")
    setShowBenefits(true) // Reset benefits when switching modes
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={`auth-modal-${mode}`}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "login" ? "Welcome Back to SiteHub" : "Join SiteHub - Your Personal Web Dashboard"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {mode === "login"
              ? "Sign in to sync your sites across all devices and keep your favorites safe"
              : "Create your account to organize 300+ sites, save favorites, and access from anywhere"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social Login Buttons */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => handleSocialAuth("google")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Chrome className="w-4 h-4 mr-2" />
              )}
              Continue with Google
            </Button>
            {/* Phone Auth - Temporarily Disabled
            <Button
              variant="outline"
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => setShowPhoneAuth(true)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              Continue with Phone
            </Button>
            */}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-400">Or create account with email</span>
            </div>
          </div>

          {/* Email Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                disabled={loading}
              />
              <p className="text-xs text-slate-400 mt-1">
                We'll send you a confirmation email
              </p>
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                At least 6 characters for security
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            {mode === "login" ? "Sign In & Continue" : "Create Account & Start Organizing"}
          </Button>

          {/* Mode Toggle */}
          <div className="text-center text-sm space-y-2">
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:underline block"
              disabled={loading}
            >
              {mode === "login" ? "Don't have an account? Sign up to save your favorites" : "Already have an account? Sign in to continue"}
            </button>
            
            {/* Forgot Password Link - Only show in login mode */}
            {mode === "login" && (
              <button
                onClick={() => window.open('/auth/forgot-password', '_blank')}
                className="text-slate-400 hover:text-slate-300 text-xs block"
                disabled={loading}
              >
                Forgot your password?
              </button>
            )}
          </div>

          {/* Benefits - Collapsible */}
          {showBenefits ? (
            <div className="bg-slate-700/50 rounded-lg p-3 space-y-2 relative">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">What you get:</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBenefits(false)}
                  className="h-6 w-6 p-0 hover:bg-slate-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  <span>Unlimited custom sites & favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  <span>Sync across all your devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  <span>Organize 300+ sites in one place</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                  <span>Never lose your data again</span>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBenefits(true)}
              className="text-xs text-slate-400 hover:text-slate-300"
            >
              Show benefits
            </Button>
          )}
        </div>
      </DialogContent>
      
      {/* Phone Auth Modal */}
      {/* <PhoneAuthModal
        open={showPhoneAuth}
        onOpenChange={setShowPhoneAuth}
        onAuth={onAuth}
      /> */}
    </Dialog>
  )
} 