import React from 'react'
import { cn } from '../../lib/utils'

const DropdownContext = React.createContext()

const Dropdown = ({ children, onOpenChange }) => {
  const [open, setOpen] = React.useState(false)

  const handleOpenChange = newOpen => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  React.useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        handleOpenChange(false)
      }
    }

    const handleClickOutside = e => {
      if (open && !e.target.closest('[data-dropdown]')) {
        handleOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div className="relative" data-dropdown>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

const DropdownTrigger = React.forwardRef(
  ({ className, children, asChild, ...props }, ref) => {
    const context = React.useContext(DropdownContext)

    const handleClick = () => {
      context?.onOpenChange(!context.open)
    }

    if (asChild) {
      return React.cloneElement(children, {
        ref,
        onClick: handleClick,
        'aria-expanded': context?.open,
        'aria-haspopup': true,
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        className={cn('outline-none', className)}
        onClick={handleClick}
        aria-expanded={context?.open}
        aria-haspopup={true}
        {...props}
      >
        {children}
      </button>
    )
  },
)
DropdownTrigger.displayName = 'DropdownTrigger'

const DropdownContent = React.forwardRef(
  (
    {
      className,
      align = 'center',
      side = 'bottom',
      sideOffset = 4,
      children,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(DropdownContext)

    if (!context?.open) return null

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: 'right-0',
    }

    const sideClasses = {
      top: 'bottom-full mb-2',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2',
      right: 'left-full ml-2',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in',
          alignClasses[align],
          sideClasses[side],
          className
        )}
        style={{ marginTop: side === 'bottom' ? sideOffset : undefined }}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownContent.displayName = 'DropdownContent'

const DropdownItem = React.forwardRef(
  ({ className, inset, children, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownContext)

    const handleClick = e => {
      onClick?.(e)
      context?.onOpenChange(false)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          inset && 'pl-8',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    )
  },
)
DropdownItem.displayName = 'DropdownItem'

const DropdownSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
DropdownSeparator.displayName = 'DropdownSeparator'

const DropdownLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  ),
)
DropdownLabel.displayName = 'DropdownLabel'

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
}
