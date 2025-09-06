import React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const DrawerContext = React.createContext()

const Drawer = ({ open, onOpenChange, children, side = 'right' }) => {
  React.useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onOpenChange?.(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <DrawerContext.Provider value={{ onOpenChange, side }}>
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => onOpenChange?.(false)}
        />
        {children}
      </div>
    </DrawerContext.Provider>
  )
}

const DrawerContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(DrawerContext)
    const { side } = context || {}

    const sideClasses = {
      right: 'right-0 h-full w-80 animate-slide-in',
      left: 'left-0 h-full w-80 animate-slide-in',
      top: 'top-0 w-full h-80 animate-slide-in',
      bottom: 'bottom-0 w-full h-80 animate-slide-in',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 bg-background p-6 shadow-lg border',
          sideClasses[side],
          className
        )}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2', className)} {...props} />
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerFooter = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6',
      className
    )}
    {...props}
  />
)
DrawerFooter.displayName = 'DrawerFooter'

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
DrawerTitle.displayName = 'DrawerTitle'

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DrawerDescription.displayName = 'DrawerDescription'

const DrawerClose = React.forwardRef(({ className, ...props }, ref) => {
  const context = React.useContext(DrawerContext)

  return (
    <button
      ref={ref}
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
        className,
      )}
      onClick={() => context?.onOpenChange(false)}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
})
DrawerClose.displayName = 'DrawerClose'

export {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
}
