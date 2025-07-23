'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export interface NavigationItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  disabled?: boolean
  external?: boolean
  items?: NavigationItem[]
}

interface NavigationProps {
  items: NavigationItem[]
  className?: string
  collapsed?: boolean
  onItemClick?: (item: NavigationItem) => void
}

export function Navigation({
  items,
  className,
  collapsed = false,
  onItemClick,
}: NavigationProps) {
  const pathname = usePathname()

  return (
    <ScrollArea className={cn('h-full', className)}>
      <nav className="space-y-2 p-2">
        {items.map((item, index) => (
          <NavigationGroup
            key={index}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </ScrollArea>
  )
}

interface NavigationGroupProps {
  item: NavigationItem
  pathname: string
  collapsed: boolean
  onItemClick?: (item: NavigationItem) => void
  level?: number
}

function NavigationGroup({
  item,
  pathname,
  collapsed,
  onItemClick,
  level = 0,
}: NavigationGroupProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href ? pathname === item.href : false
  const isChildActive = hasChildren && item.items!.some(child => 
    child.href === pathname || (child.items && child.items.some(grandchild => grandchild.href === pathname))
  )

  // Auto-expand if child is active
  React.useEffect(() => {
    if (isChildActive && !collapsed) {
      setIsOpen(true)
    }
  }, [isChildActive, collapsed])

  const handleClick = () => {
    if (hasChildren && !collapsed) {
      setIsOpen(!isOpen)
    }
    onItemClick?.(item)
  }

  if (hasChildren) {
    return (
      <Collapsible open={isOpen && !collapsed} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant={isActive || isChildActive ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              level > 0 && 'ml-4',
              collapsed && 'justify-center px-2'
            )}
            onClick={handleClick}
            disabled={item.disabled}
          >
            {item.icon && (
              <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
            )}
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isOpen && 'rotate-90'
                  )}
                />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        
        {!collapsed && (
          <CollapsibleContent className="space-y-1">
            {item.items!.map((child, index) => (
              <NavigationGroup
                key={index}
                item={child}
                pathname={pathname}
                collapsed={collapsed}
                onItemClick={onItemClick}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    )
  }

  if (item.href) {
    const LinkComponent = item.external ? 'a' : Link
    const linkProps = item.external 
      ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
      : { href: item.href }

    return (
      <LinkComponent {...linkProps}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start',
            level > 0 && 'ml-4',
            collapsed && 'justify-center px-2'
          )}
          disabled={item.disabled}
          onClick={() => onItemClick?.(item)}
        >
          {item.icon && (
            <item.icon className={cn('h-4 w-4', !collapsed && 'mr-2')} />
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Button>
      </LinkComponent>
    )
  }

  // Section header
  return (
    <div className={cn('px-3 py-2', level > 0 && 'ml-4')}>
      {!collapsed && (
        <>
          <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
            {item.title}
          </h4>
          <Separator className="my-2" />
        </>
      )}
    </div>
  )
}

// Horizontal Navigation (Tabs)
interface HorizontalNavigationProps {
  items: NavigationItem[]
  className?: string
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
}

export function HorizontalNavigation({
  items,
  className,
  variant = 'default',
  size = 'md',
}: HorizontalNavigationProps) {
  const pathname = usePathname()

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  }

  const getVariantClasses = (isActive: boolean) => {
    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted'
      case 'underline':
        return cn(
          'border-b-2 rounded-none',
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent hover:border-muted-foreground/50'
        )
      default:
        return isActive
          ? 'bg-secondary text-secondary-foreground'
          : 'hover:bg-muted'
    }
  }

  return (
    <nav className={cn('flex items-center space-x-1', className)}>
      {items.map((item, index) => {
        const isActive = item.href === pathname

        if (item.href) {
          const LinkComponent = item.external ? 'a' : Link
          const linkProps = item.external 
            ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
            : { href: item.href }

          return (
            <LinkComponent key={index} {...linkProps}>
              <Button
                variant="ghost"
                className={cn(
                  sizeClasses[size],
                  getVariantClasses(isActive)
                )}
                disabled={item.disabled}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.title}
                {item.badge && (
                  <Badge variant="secondary" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </LinkComponent>
          )
        }

        return (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              sizeClasses[size],
              getVariantClasses(isActive)
            )}
            disabled={item.disabled}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {item.title}
            {item.badge && (
              <Badge variant="secondary" className="ml-2">
                {item.badge}
              </Badge>
            )}
          </Button>
        )
      })}
    </nav>
  )
}

// Breadcrumb Navigation
interface BreadcrumbNavigationProps {
  items: { label: string; href?: string }[]
  separator?: React.ReactNode
  className?: string
}

export function BreadcrumbNavigation({
  items,
  separator = '/',
  className,
}: BreadcrumbNavigationProps) {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground mx-1">{separator}</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

// Mobile Navigation
interface MobileNavigationProps {
  items: NavigationItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function MobileNavigation({
  items,
  open,
  onOpenChange,
  className,
}: MobileNavigationProps) {
  const pathname = usePathname()

  // Close navigation when route changes
  React.useEffect(() => {
    onOpenChange(false)
  }, [pathname, onOpenChange])

  if (!open) return null

  return (
    <div className={cn('fixed inset-0 z-50 md:hidden', className)}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Navigation panel */}
      <div className="fixed left-0 top-0 h-full w-72 border-r bg-background p-4">
        <ScrollArea className="h-full">
          <Navigation
            items={items}
            onItemClick={() => onOpenChange(false)}
          />
        </ScrollArea>
      </div>
    </div>
  )
}