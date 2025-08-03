'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Correspondence } from '@/types/correspondence'
import { getCategoryIcon, getPropertyColor, formatPropertyName } from '@/lib/utils/correspondence-utils'
import { Star, Eye, Lock, ExternalLink } from 'lucide-react'

interface VirtualCorrespondenceListProps {
  correspondences: Correspondence[]
  onItemClick?: (correspondence: Correspondence) => void
  onItemSelect?: (correspondence: Correspondence, selected: boolean) => void
  selectedItems?: Set<string>
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  showActions?: boolean
  className?: string
}

interface VirtualItem {
  index: number
  offset: number
  height: number
}

/**
 * Virtual scrolling list component for large correspondence datasets
 * Renders only visible items for optimal performance
 */
export function VirtualCorrespondenceList({
  correspondences,
  onItemClick,
  onItemSelect,
  selectedItems = new Set(),
  itemHeight = 120,
  containerHeight = 600,
  overscan = 5,
  showActions = true,
  className = ''
}: VirtualCorrespondenceListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(correspondences.length, start + visibleCount + overscan * 2)
    
    return { start, end }
  }, [scrollTop, itemHeight, containerHeight, overscan, correspondences.length])

  // Generate virtual items for visible range
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = []
    
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      items.push({
        index: i,
        offset: i * itemHeight,
        height: itemHeight
      })
    }
    
    return items
  }, [visibleRange, itemHeight])

  // Total height for scrollbar
  const totalHeight = correspondences.length * itemHeight

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Handle item selection
  const handleItemSelect = useCallback((correspondence: Correspondence, selected: boolean) => {
    onItemSelect?.(correspondence, selected)
  }, [onItemSelect])

  // Handle item click
  const handleItemClick = useCallback((correspondence: Correspondence) => {
    onItemClick?.(correspondence)
  }, [onItemClick])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef) return

      const currentFocus = document.activeElement
      const items = containerRef.querySelectorAll('[data-correspondence-item]')
      const currentIndex = Array.from(items).findIndex(item => item === currentFocus)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (currentIndex < items.length - 1) {
            (items[currentIndex + 1] as HTMLElement).focus()
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (currentIndex > 0) {
            (items[currentIndex - 1] as HTMLElement).focus()
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (currentIndex >= 0) {
            const correspondence = correspondences[visibleRange.start + currentIndex]
            if (correspondence) {
              handleItemClick(correspondence)
            }
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, correspondences, visibleRange.start, handleItemClick])

  return (
    <div 
      className={`virtual-correspondence-list ${className}`}
      style={{ height: containerHeight }}
    >
      <div
        ref={(ref) => {
          setContainerRef(ref)
          scrollElementRef.current = ref
        }}
        className="h-full overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {virtualItems.map((virtualItem) => {
            const correspondence = correspondences[virtualItem.index]
            if (!correspondence) return null

            return (
              <CorrespondenceItem
                key={correspondence.id}
                correspondence={correspondence}
                style={{
                  position: 'absolute',
                  top: virtualItem.offset,
                  height: virtualItem.height,
                  width: '100%'
                }}
                isSelected={selectedItems.has(correspondence.id)}
                onSelect={handleItemSelect}
                onClick={handleItemClick}
                showActions={showActions}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface CorrespondenceItemProps {
  correspondence: Correspondence
  style: React.CSSProperties
  isSelected: boolean
  onSelect: (correspondence: Correspondence, selected: boolean) => void
  onClick: (correspondence: Correspondence) => void
  showActions: boolean
}

function CorrespondenceItem({
  correspondence,
  style,
  isSelected,
  onSelect,
  onClick,
  showActions
}: CorrespondenceItemProps) {
  return (
    <div
      style={style}
      data-correspondence-item
      tabIndex={0}
      className={`
        card-mystical p-4 mx-2 mb-2 cursor-pointer transition-all duration-200
        hover:shadow-lg hover:shadow-purple-500/25 focus:shadow-lg focus:shadow-purple-500/25
        focus:outline-none focus:ring-2 focus:ring-purple-400/50
        ${isSelected ? 'ring-2 ring-purple-400 bg-purple-900/20' : ''}
      `}
      onClick={() => onClick(correspondence)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(correspondence)
        }
      }}
    >
      <div className="flex items-start justify-between h-full">
        {/* Left side - Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {/* Category icon */}
            <span className="text-lg">{getCategoryIcon(correspondence.category)}</span>
            
            {/* Name */}
            <h3 className="text-lg font-semibold text-gray-100 truncate">
              {correspondence.name}
            </h3>
            
            {/* Status indicators */}
            <div className="flex items-center space-x-1">
              {correspondence.is_favorited && (
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              )}
              {correspondence.is_personal && (
                <Lock className="w-4 h-4 text-blue-400" />
              )}
              {correspondence.verified && (
                <div className="w-2 h-2 bg-green-400 rounded-full" title="Verified" />
              )}
            </div>
          </div>

          {/* Botanical name */}
          {correspondence.botanical_name && (
            <p className="text-sm text-gray-400 italic mb-1">
              {correspondence.botanical_name}
            </p>
          )}

          {/* Description preview */}
          {correspondence.description && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-2">
              {correspondence.description}
            </p>
          )}

          {/* Magical properties */}
          <div className="flex flex-wrap gap-1 mb-2">
            {correspondence.magical_properties.slice(0, 4).map((property) => (
              <span
                key={property}
                className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getPropertyColor(property)}
                `}
              >
                {formatPropertyName(property)}
              </span>
            ))}
            {correspondence.magical_properties.length > 4 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-800">
                +{correspondence.magical_properties.length - 4} more
              </span>
            )}
          </div>

          {/* Element and planet */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {correspondence.element && (
              <span>Element: {correspondence.element}</span>
            )}
            {correspondence.planet && (
              <span>Planet: {correspondence.planet}</span>
            )}
            {correspondence.energy_type && (
              <span>Energy: {correspondence.energy_type}</span>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        {showActions && (
          <div className="flex flex-col items-end space-y-2 ml-4">
            {/* Selection checkbox */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation()
                  onSelect(correspondence, e.target.checked)
                }}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="sr-only">Select {correspondence.name}</span>
            </label>

            {/* Quick actions */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle view action
                }}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle external link action
                }}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook for managing virtual list state
export function useVirtualCorrespondenceList(
  correspondences: Correspondence[],
  options: {
    itemHeight?: number
    containerHeight?: number
    overscan?: number
  } = {}
) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [scrollPosition, setScrollPosition] = useState(0)

  const {
    itemHeight = 120,
    containerHeight = 600,
    overscan = 5
  } = options

  const handleItemSelect = useCallback((correspondence: Correspondence, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(correspondence.id)
      } else {
        newSet.delete(correspondence.id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(correspondences.map(c => c.id)))
  }, [correspondences])

  const selectNone = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  const getSelectedCorrespondences = useCallback(() => {
    return correspondences.filter(c => selectedItems.has(c.id))
  }, [correspondences, selectedItems])

  return {
    selectedItems,
    handleItemSelect,
    selectAll,
    selectNone,
    getSelectedCorrespondences,
    scrollPosition,
    setScrollPosition,
    listProps: {
      itemHeight,
      containerHeight,
      overscan
    }
  }
}