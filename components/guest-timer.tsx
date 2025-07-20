"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Crown } from "lucide-react"

interface GuestTimerProps {
  user: any
  onTimeExpired: () => void
  onUpgradeClick: () => void
}

export function GuestTimer({ user, onTimeExpired, onUpgradeClick }: GuestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (user.type !== "guest") return

    // Get start time from localStorage or set it now
    const startTime = localStorage.getItem("guest-start-time")
    const now = Date.now()

    if (!startTime) {
      localStorage.setItem("guest-start-time", now.toString())
    } else {
      const elapsed = Math.floor((now - Number.parseInt(startTime)) / 1000)
      const remaining = Math.max(0, 600 - elapsed)
      setTimeRemaining(remaining)

      if (remaining === 0) {
        setIsExpired(true)
        onTimeExpired()
      }
    }

    const interval = setInterval(() => {
      const startTime = localStorage.getItem("guest-start-time")
      if (!startTime) return

      const elapsed = Math.floor((Date.now() - Number.parseInt(startTime)) / 1000)
      const remaining = Math.max(0, 600 - elapsed)
      setTimeRemaining(remaining)

      if (remaining === 0 && !isExpired) {
        setIsExpired(true)
        onTimeExpired()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [user.type, isExpired, onTimeExpired])

  if (user.type !== "guest") return null

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const getTimerColor = () => {
    if (timeRemaining > 300) return "bg-green-600" // > 5 minutes
    if (timeRemaining > 120) return "bg-yellow-600" // > 2 minutes
    return "bg-red-600" // < 2 minutes
  }

  const getWarningMessage = () => {
    if (timeRemaining > 300) return null
    if (timeRemaining > 120) return "⚠️ Your favorites & custom sites will be lost soon!"
    if (timeRemaining > 60) return "🚨 Sign up now to save your data!"
    return "💥 Session expired! Your data will be lost!"
  }

  return (
    <div className="flex items-center gap-3">
      <Badge className={`${getTimerColor()} text-white animate-pulse`}>
        <Clock className="w-3 h-3 mr-1" />
        {isExpired ? "Expired" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
      </Badge>

      {getWarningMessage() && (
        <div className="text-xs text-red-400 animate-pulse">
          {getWarningMessage()}
        </div>
      )}

      {(timeRemaining < 120 || isExpired) && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            {isExpired ? "Sign Up to Continue" : "Save My Data"}
          </Button>
          <span className="text-xs text-yellow-300">
            {isExpired ? "✨ Keep your favorites forever!" : "💾 Don't lose your data!"}
          </span>
        </div>
      )}
    </div>
  )
}
