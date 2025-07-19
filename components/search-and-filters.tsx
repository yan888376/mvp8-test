"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

const categories = [
  { id: "favorites", name: "Favorites", icon: "⭐" },
  { id: "all", name: "All Sites", icon: "🌐" },
  { id: "custom", name: "Custom Sites", icon: "➕" },
  { id: "social", name: "Social Media", icon: "👥" },
  { id: "video", name: "Video & Streaming", icon: "📺" },
  { id: "shopping", name: "Shopping", icon: "🛒" },
  { id: "tools", name: "Dev Tools", icon: "🛠️" },
  { id: "news", name: "News & Media", icon: "📰" },
  { id: "finance", name: "Finance", icon: "💰" },
  { id: "education", name: "Education", icon: "🎓" },
  { id: "productivity", name: "Productivity", icon: "📊" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "gaming", name: "Gaming", icon: "🎮" },
  { id: "travel", name: "Travel", icon: "✈️" },
  { id: "food", name: "Food & Delivery", icon: "🍔" },
  { id: "health", name: "Health & Fitness", icon: "💪" },
  { id: "music", name: "Music", icon: "🎵" },
]

export function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredCount,
}) {
  const [showAllCategories, setShowAllCategories] = useState(false)

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8)

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search 300+ websites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/80">Categories</span>
          {filteredCount > 0 && (
            <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
              {filteredCount} sites
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`text-xs ${
                selectedCategory === category.id
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-blue-400"
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}

          {!showAllCategories && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllCategories(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              +{categories.length - 8} more
            </Button>
          )}

          {showAllCategories && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllCategories(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
            >
              Show less
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
