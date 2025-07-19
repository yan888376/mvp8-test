"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Crown, Chrome, Facebook, Mail } from "lucide-react"
import { GuestTimer } from "@/components/guest-timer"

export function Header({ user, setUser, onGuestTimeExpired, onUpgradeClick }) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState("login")

  const handleAuth = (provider) => {
    // Simulate authentication
    setUser({
      type: "authenticated",
      name: "John Doe",
      email: "john@example.com",
      customCount: 3,
      pro: provider === "pro",
    })
    setShowAuthModal(false)
  }

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">SiteHub</h1>
              <Badge variant="secondary" className="text-xs bg-white/10 text-white/80">
                300+ Sites
              </Badge>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <GuestTimer user={user} onTimeExpired={onGuestTimeExpired} onUpgradeClick={onUpgradeClick} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                  <User className="w-4 h-4" />
                  {user.type === "guest" ? "Guest User" : user.name}
                  {user.pro && <Crown className="w-4 h-4 text-yellow-400" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                {user.type === "guest" ? (
                  <>
                    <DropdownMenuItem onClick={onUpgradeClick} className="text-white hover:bg-slate-700">
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-slate-700">
                      <div className="flex flex-col">
                        <span>Guest Account</span>
                        <span className="text-xs text-slate-400">Limited features</span>
                      </div>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="text-white hover:bg-slate-700">
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs text-slate-400">{user.email}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="text-white hover:bg-slate-700">
                      <div className="flex items-center justify-between w-full">
                        <span>{user.pro ? "Pro Account" : "Free Account"}</span>
                        {user.pro && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                    </DropdownMenuItem>
                    {!user.pro && (
                      <DropdownMenuItem
                        onClick={() => handleAuth("pro")}
                        className="text-yellow-400 hover:bg-slate-700"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem
                      onClick={() => {
                        localStorage.removeItem("guest-start-time")
                        setUser({ type: "guest", customCount: 0, pro: false })
                      }}
                      className="text-white hover:bg-slate-700"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{authMode === "login" ? "Welcome Back" : "Create Account"}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {authMode === "login"
                ? "Sign in to sync your sites across devices"
                : "Join thousands of users organizing their web"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Button
                variant="outline"
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => handleAuth("google")}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => handleAuth("facebook")}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Continue with Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="bg-slate-700 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" className="bg-slate-700 border-slate-600" />
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleAuth("email")}>
              <Mail className="w-4 h-4 mr-2" />
              {authMode === "login" ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center text-sm">
              <button
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-blue-400 hover:underline"
              >
                {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
