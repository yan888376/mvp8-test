"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Crown, Plus } from "lucide-react"

export function AddSiteModal({ isOpen, onClose, onAdd, user }) {
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [logo, setLogo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const extractDomain = (url) => {
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      return domain.replace("www.", "")
    } catch {
      return ""
    }
  }

  const generateLogo = (url) => {
    const domain = extractDomain(url)
    const logoMap = {
      "google.com": "🔍",
      "youtube.com": "📺",
      "facebook.com": "👥",
      "twitter.com": "🐦",
      "instagram.com": "📸",
      "linkedin.com": "💼",
      "github.com": "🐙",
      "stackoverflow.com": "📚",
      "medium.com": "📝",
      "dev.to": "👨‍💻",
    }
    return logoMap[domain] || "🌐"
  }

  const handleUrlChange = (value) => {
    setUrl(value)
    if (value) {
      const domain = extractDomain(value)
      setName(domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1))
      setLogo(generateLogo(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!url || !name) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const finalUrl = url.startsWith("http") ? url : `https://${url}`

    onAdd({
      name,
      url: finalUrl,
      logo: logo || "🌐",
    })

    setUrl("")
    setName("")
    setLogo("")
    setIsLoading(false)
    onClose()
  }

  const canAddSite = user.pro || user.customCount < 10

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Custom Site
          </DialogTitle>
          <DialogDescription className="text-slate-400">Add your favorite websites to quick access</DialogDescription>
        </DialogHeader>

        {!canAddSite ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">🚫</div>
            <h3 className="text-lg font-semibold">Free Limit Reached</h3>
            <p className="text-slate-400">You've added the maximum of 10 custom sites for free users.</p>
            <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-slate-300 border-slate-600">
                {user.pro ? "Unlimited" : `${user.customCount}/10 sites used`}
              </Badge>
              {user.pro && <Crown className="w-4 h-4 text-yellow-400" />}
            </div>

            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="example.com or https://example.com"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Site Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Site name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-700 border-slate-600"
                required
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo (Emoji)</Label>
              <div className="flex gap-2">
                <Input
                  id="logo"
                  type="text"
                  placeholder="🌐"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="bg-slate-700 border-slate-600 w-20 text-center text-xl"
                />
                <div className="flex-1 flex items-center justify-center bg-slate-700 rounded-md border border-slate-600">
                  <span className="text-2xl">{logo || "🌐"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !url || !name}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Adding..." : "Add Site"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
