"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Heart, Trash2, ExternalLink, GripVertical } from "lucide-react"

function UltraCompactSiteCard({ site, onRemove, favorites, onToggleFavorite, isDragDisabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: site.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  const handleSiteClick = (e, url) => {
    if (isDragging) return
    e.stopPropagation()
    window.open(url, "_blank")
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...(isDragDisabled ? {} : { ...attributes, ...listeners })}
          className={`group relative ${isDragDisabled ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} p-1 bg-white/8 backdrop-blur-sm rounded-md border border-white/10 hover:border-blue-400/50 hover:bg-white/15 transition-all duration-200 hover:shadow-[0_0_8px_rgba(59,130,246,0.3)] hover:scale-105 ${
            isDragging ? "shadow-lg border-blue-500 bg-white/20 scale-110" : ""
          } ${isDragDisabled ? "opacity-60" : ""}`}
        >
          {/* Drag indicator */}
          {!isDragDisabled && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-2 h-2 text-white/60" />
            </div>
          )}

          <div onClick={(e) => handleSiteClick(e, site.url)} className="relative text-center space-y-0.5">
            <div className="text-sm group-hover:scale-110 transition-transform duration-200">{site.logo}</div>
            <div className="text-xs text-white/80 group-hover:text-white font-medium truncate leading-tight px-0.5">
              {site.name}
            </div>
          </div>

          {/* Custom site indicator */}
          {site.custom && (
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full border border-slate-800" />
          )}

          {/* Favorite indicator */}
          {favorites.includes(site.id) ? (
            <div className="absolute -top-0.5 -left-0.5">
              <Heart className="w-3 h-3 text-red-500 fill-red-500 drop-shadow-sm" />
            </div>
          ) : (
            <div className="absolute -top-0.5 -left-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="w-3 h-3 text-white/40 hover:text-red-400 transition-colors" />
            </div>
          )}

          {/* Minimal tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {isDragDisabled ? "Sign up" : "Drag • Click"}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="bg-slate-800 border-slate-700">
        <ContextMenuItem
          onClick={() => handleSiteClick({ stopPropagation: () => {} }, site.url)}
          className="text-white hover:bg-slate-700"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onToggleFavorite(site.id)} className="text-white hover:bg-slate-700">
          <Heart className={`w-4 h-4 mr-2 ${favorites.includes(site.id) ? "fill-red-500 text-red-500" : ""}`} />
          {favorites.includes(site.id) ? "Remove from Favorites" : "Add to Favorites"}
        </ContextMenuItem>
        {site.custom && (
          <ContextMenuItem onClick={() => onRemove(site.id)} className="text-red-400 hover:bg-slate-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Remove Site
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function UltraCompactSiteGrid({ sites, onRemove, onReorder, onToggleFavorite, favorites = [], isDragDisabled = false }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isDragDisabled ? 999999 : 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = sites.findIndex((site) => site.id === active.id)
      const newIndex = sites.findIndex((site) => site.id === over.id)

      const newSites = arrayMove(sites, oldIndex, newIndex)
      onReorder(newSites)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sites.map((site) => site.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-18 2xl:grid-cols-20 gap-1">
          {sites.map((site) => (
            <UltraCompactSiteCard
              key={site.id}
              site={site}
              onRemove={onRemove}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              isDragDisabled={isDragDisabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
