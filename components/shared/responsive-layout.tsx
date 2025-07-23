'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-mobile'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  sidebar?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  sidebarWidth?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function ResponsiveLayout({
  children,
  className,
  sidebar,
  header,
  footer,
  sidebarWidth = '280px',
  collapsible = true,
  defaultCollapsed = false,
}: ResponsiveLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  // Auto-collapse on mobile
  React.useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true)
    }
  }, [isMobile, collapsed])

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile overlay */}
            {isMobile && !collapsed && (
              <div
                className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                onClick={() => setCollapsed(true)}
              />
            )}
            
            {/* Sidebar */}
            <aside
              className={cn(
                'fixed left-0 top-0 z-50 h-full border-r bg-background transition-transform duration-300 ease-in-out',
                header && 'top-16', // Adjust for header height
                collapsed && '-translate-x-full',
                !isMobile && 'relative translate-x-0',
                !isMobile && collapsed && 'w-16',
                !isMobile && !collapsed && `w-[${sidebarWidth}]`
              )}
              style={{
                width: isMobile ? sidebarWidth : collapsed ? '64px' : sidebarWidth,
              }}
            >
              {sidebar}
            </aside>
          </>
        )}

        {/* Main content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            sidebar && !isMobile && !collapsed && `ml-[${sidebarWidth}]`,
            sidebar && !isMobile && collapsed && 'ml-16'
          )}
          style={{
            marginLeft: sidebar && !isMobile ? (collapsed ? '64px' : sidebarWidth) : '0',
          }}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer className="border-t bg-background">
          {footer}
        </footer>
      )}
    </div>
  )
}

// Page Container
interface PageContainerProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function PageContainer({
  children,
  title,
  description,
  actions,
  breadcrumbs,
  className,
  maxWidth = 'full',
  padding = 'md',
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  }

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div className={cn('w-full', maxWidthClasses[maxWidth], paddingClasses[padding], className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <div className="mb-4">
          {breadcrumbs}
        </div>
      )}

      {/* Page Header */}
      {(title || description || actions) && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              )}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      {children}
    </div>
  )
}

// Grid Layout
interface GridLayoutProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 6 | 12
  }
}

export function GridLayout({
  children,
  columns = 1,
  gap = 'md',
  className,
  responsive,
}: GridLayoutProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  }

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const responsiveClasses = responsive ? [
    responsive.sm && `sm:grid-cols-${responsive.sm}`,
    responsive.md && `md:grid-cols-${responsive.md}`,
    responsive.lg && `lg:grid-cols-${responsive.lg}`,
    responsive.xl && `xl:grid-cols-${responsive.xl}`,
  ].filter(Boolean).join(' ') : ''

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        responsiveClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

// Flex Layout
interface FlexLayoutProps {
  children: React.ReactNode
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function FlexLayout({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className,
}: FlexLayoutProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        wrap && 'flex-wrap',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

// Stack Layout (vertical spacing)
interface StackLayoutProps {
  children: React.ReactNode
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function StackLayout({
  children,
  spacing = 'md',
  className,
}: StackLayoutProps) {
  const spacingClasses = {
    none: 'space-y-0',
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  }

  return (
    <div className={cn('flex flex-col', spacingClasses[spacing], className)}>
      {children}
    </div>
  )
}

// Section Layout
interface SectionLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
}

export function SectionLayout({
  children,
  title,
  description,
  actions,
  className,
  contentClassName,
  headerClassName,
}: SectionLayoutProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || actions) && (
        <div className={cn('flex items-center justify-between', headerClassName)}>
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={contentClassName}>
        {children}
      </div>
    </section>
  )
}