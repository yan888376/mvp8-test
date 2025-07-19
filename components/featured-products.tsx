"use client"

import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export function FeaturedProducts({ sites }) {
  const handleSiteClick = (url) => {
    window.open(url, "_blank")
  }

  return (
    <section className="mb-2">
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white animate-pulse text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          MornHub Products
        </Badge>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {sites.map((site) => (
          <div
            key={site.id}
            onClick={() => handleSiteClick(site.url)}
            className="group cursor-pointer p-1.5 bg-white/5 backdrop-blur-sm rounded-md border border-white/10 hover:border-blue-400/50 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:scale-105 flex-shrink-0"
          >
            <div className="text-center space-y-0.5 w-14">
              <div className="text-sm group-hover:scale-110 transition-transform duration-300">{site.logo}</div>
              <h3 className="font-medium text-xs text-white group-hover:text-blue-300 transition-colors truncate">
                {site.name}
              </h3>
              <div className="w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
