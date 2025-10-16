"use client"

import { useEffect, useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useDroppable, useSensor, useSensors, pointerWithin, rectIntersection, getFirstCollision } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Heart, Trash2, ExternalLink, GripVertical } from "lucide-react"

function UltraCompactSiteCard({ site, onRemove, favorites, onToggleFavorite, isDragDisabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: site.id })
  const isFavorite = favorites.includes(site.id)

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

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(site.id)
            }}
            className={`absolute -top-0.5 -left-0.5 flex items-center justify-center rounded-full p-[1px] transition-colors ${
              isFavorite ? "bg-red-500/90 hover:bg-red-500" : "bg-white/10 hover:bg-red-400/40"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={`w-3 h-3 ${
                isFavorite ? "text-white fill-white" : "text-white/70"
              }`}
            />
          </button>

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
  const favoritesDrop = useDroppable({
    id: "favorites-drop-zone"
  })
  const showFavoritesDropZone = Boolean(onToggleFavorite)
  const [dropFeedback, setDropFeedback] = useState<{ visible: boolean; label: string }>(() => ({
    visible: false,
    label: ""
  }))

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

  // 自定义碰撞检测：优先检测 drop zone，然后检测卡片
  const customCollisionDetection = (args) => {
    // 首先检查是否与 favorites-drop-zone 碰撞
    const pointerCollisions = pointerWithin(args)
    const intersectingCollisions = rectIntersection(args)
    
    // 合并两种检测结果
    const collisions = [...pointerCollisions, ...intersectingCollisions]
    
    // 优先返回 drop zone
    const dropZoneCollision = collisions.find(({ id }) => id === "favorites-drop-zone")
    if (dropZoneCollision) {
      return [dropZoneCollision]
    }
    
    // 否则使用 closestCenter 检测卡片
    return closestCenter(args)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    
    console.log('🎯 Drag ended:', { activeId: active.id, overId: over?.id })

    if (over?.id === "favorites-drop-zone") {
      console.log('✨ Dropped on favorites zone, current favorites:', favorites)
      if (onToggleFavorite && !favorites.includes(active.id)) {
        onToggleFavorite(active.id)
        const droppedSite = sites.find((site) => site.id === active.id)
        setDropFeedback({
          visible: true,
          label: droppedSite?.name || "Added to favorites"
        })
        console.log('✅ Added to favorites:', active.id)
      } else {
        console.log('⚠️ Already in favorites or no toggle function')
      }
      return
    }

    if (active.id !== over?.id) {
      const oldIndex = sites.findIndex((site) => site.id === active.id)
      const newIndex = sites.findIndex((site) => site.id === over.id)

      const newSites = arrayMove(sites, oldIndex, newIndex)
      onReorder(newSites)
    }
  }

  useEffect(() => {
    if (!dropFeedback.visible) return

    const timer = setTimeout(() => {
      setDropFeedback({ visible: false, label: "" })
    }, 1400)

    return () => clearTimeout(timer)
  }, [dropFeedback])

  return (
    <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragEnd={handleDragEnd}>
      {showFavoritesDropZone && (
        <div
          ref={favoritesDrop.setNodeRef}
          className={`mb-4 flex items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-6 text-sm font-medium transition-all duration-200 ${
            favoritesDrop.isOver
              ? "border-red-400 bg-red-500/30 text-red-100 shadow-lg shadow-red-500/20 scale-105"
              : "border-white/30 bg-white/10 text-white/70 hover:border-white/50 hover:bg-white/15"
          }`}
        >
          <Heart className={`w-6 h-6 ${favoritesDrop.isOver ? "animate-pulse" : ""}`} />
          <span className="text-base">{favoritesDrop.isOver ? "🎯 松开鼠标添加到收藏" : "⭐ 拖拽到这里添加收藏"}</span>
        </div>
      )}

      {dropFeedback.visible && (
        <div className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-green-500/25 border-2 border-green-400 text-green-100 text-base font-medium px-6 py-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-lg shadow-green-500/20">
          <Heart className="w-6 h-6 fill-green-300 text-green-300" />
          <span>✅ {dropFeedback.label}</span>
        </div>
      )}

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
