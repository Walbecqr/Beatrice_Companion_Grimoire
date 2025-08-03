'use client'

import Link, { LinkProps } from 'next/link'
import { useSmartPrefetch } from '@/lib/hooks/use-smart-prefetch'
import { ReactNode, MouseEvent, TouchEvent } from 'react'

interface SmartLinkProps extends LinkProps {
  children: ReactNode
  className?: string
  onMouseEnter?: (e: MouseEvent<HTMLAnchorElement>) => void
  onTouchStart?: (e: TouchEvent<HTMLAnchorElement>) => void
  prefetchOnHover?: boolean
  prefetchDelay?: number
}

/**
 * Enhanced Link component with smart prefetching capabilities
 */
export function SmartLink({ 
  children, 
  className, 
  onMouseEnter, 
  onTouchStart,
  prefetchOnHover = true,
  prefetchDelay = 100,
  ...linkProps 
}: SmartLinkProps) {
  const { handleLinkHover } = useSmartPrefetch()
  
  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    if (prefetchOnHover && typeof linkProps.href === 'string') {
      // Add a small delay to avoid prefetching on accidental hovers
      setTimeout(() => {
        handleLinkHover(linkProps.href as string)
      }, prefetchDelay)
    }
    
    onMouseEnter?.(e)
  }

  const handleTouchStart = (e: TouchEvent<HTMLAnchorElement>) => {
    // On touch devices, prefetch immediately on touch
    if (prefetchOnHover && typeof linkProps.href === 'string') {
      handleLinkHover(linkProps.href as string)
    }
    
    onTouchStart?.(e)
  }

  return (
    <Link
      {...linkProps}
      className={className}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
    >
      {children}
    </Link>
  )
}

/**
 * Smart navigation card component for dashboard
 */
interface SmartNavCardProps {
  href: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  className?: string
}

export function SmartNavCard({
  href,
  title,
  description,
  icon: Icon,
  gradient,
  className = ''
}: SmartNavCardProps) {
  return (
    <SmartLink 
      href={href}
      className={`card-mystical p-6 hover:bg-gray-800/70 transition-colors group ${className}`}
      prefetchDelay={50} // Faster prefetch for nav cards
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </SmartLink>
  )
}

/**
 * Smart sidebar navigation link
 */
interface SmartSidebarLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive?: boolean
}

export function SmartSidebarLink({ href, icon: Icon, label, isActive }: SmartSidebarLinkProps) {
  return (
    <SmartLink
      href={href}
      className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
        }
      `}
      prefetchDelay={200} // Slightly longer delay for sidebar
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </SmartLink>
  )
}

/**
 * Smart list item link (for correspondence lists, journal entries, etc.)
 */
interface SmartListLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function SmartListLink({ href, children, className = '' }: SmartListLinkProps) {
  return (
    <SmartLink
      href={href}
      className={`block hover:bg-gray-800/50 transition-colors ${className}`}
      prefetchDelay={150}
    >
      {children}
    </SmartLink>
  )
}

/**
 * Prefetch provider that initializes smart prefetching
 */
interface PrefetchProviderProps {
  children: ReactNode
}

export function PrefetchProvider({ children }: PrefetchProviderProps) {
  const { isEnabled } = useSmartPrefetch()
  
  return (
    <div data-prefetch-enabled={isEnabled}>
      {children}
    </div>
  )
}