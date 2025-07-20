"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Crown, Settings, LogOut } from "lucide-react"
import { GuestTimer } from "@/components/guest-timer"
import { AuthModal } from "@/components/auth-modal"
import { PaymentModal } from "@/components/payment-modal"
import { SettingsModal } from "@/components/settings-modal"
import { useAuth } from "@/contexts/auth-context"

interface HeaderProps {
  onGuestTimeExpired: () => void
  onUpgradeClick: () => void
}

export function Header({ onGuestTimeExpired, onUpgradeClick }: HeaderProps) {
  const { user, signOut, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")

  // Listen for custom events to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      setAuthMode(event.detail.mode || "login")
      setShowAuthModal(true)
    }

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener)
    
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener)
    }
  }, [])

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-4">
              <div className="h-8 w-24 bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  const handleAuth = (userData: any) => {
    // Auth is now handled by the context
    setShowAuthModal(false)
  }

  const handleSignOut = async () => {
    await signOut()
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
                  {user?.type === "guest" ? "Guest User" : user?.name || "Loading..."}
                  {user?.pro && <Crown className="w-4 h-4 text-yellow-400" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                {user?.type === "guest" ? (
                  <>
                    <DropdownMenuItem 
                      onClick={() => {
                        setAuthMode("signup")
                        setShowAuthModal(true)
                      }} 
                      className="text-white hover:bg-slate-700"
                    >
                      Sign Up
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
                        <span>{user?.name || "User"}</span>
                        <span className="text-xs text-slate-400">{user?.email || ""}</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem className="text-white hover:bg-slate-700">
                      <div className="flex items-center justify-between w-full">
                        <span>{user?.pro ? "Pro Account" : "Free Account"}</span>
                        {user?.pro && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                    </DropdownMenuItem>
                    {!user?.pro && (
                      <DropdownMenuItem
                        onClick={onUpgradeClick}
                        className="text-yellow-400 hover:bg-slate-700"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem 
                      onClick={() => setShowSettingsModal(true)}
                      className="text-white hover:bg-slate-700"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-400 hover:bg-slate-700"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
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
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onAuth={handleAuth}
        authMode={authMode}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={() => {
          console.log("Payment successful!")
          // Update user pro status
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        user={user}
      />
    </header>
  )
}
