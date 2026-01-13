"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsible() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("Collapsible components must be used within a Collapsible")
  }
  return context
}

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ className, open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }, ref) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    
    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [isControlled, onOpenChange])

    return (
      <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
        <div ref={ref} data-state={open ? 'open' : 'closed'} className={cn(className)} {...props}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, onClick, children, asChild, ...props }, ref) => {
  const { open, onOpenChange } = useCollapsible()

  const handleClick = (e: React.MouseEvent) => {
    onOpenChange(!open)
    onClick?.(e as React.MouseEvent<HTMLButtonElement>)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
      onClick: handleClick,
    })
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(className)}
      onClick={handleClick}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  )
})
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useCollapsible()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number | undefined>(open ? undefined : 0)

  React.useEffect(() => {
    if (contentRef.current) {
      if (open) {
        const scrollHeight = contentRef.current.scrollHeight
        setHeight(scrollHeight)
        // After animation, set to auto for dynamic content
        const timer = setTimeout(() => setHeight(undefined), 150)
        return () => clearTimeout(timer)
      } else {
        // First set explicit height, then animate to 0
        setHeight(contentRef.current.scrollHeight)
        requestAnimationFrame(() => {
          setHeight(0)
        })
      }
    }
  }, [open])

  return (
    <div
      ref={contentRef}
      className={cn(
        "overflow-hidden transition-[height] duration-150 ease-out",
        className
      )}
      style={{ height: height === undefined ? 'auto' : height }}
      aria-hidden={!open}
      {...props}
    >
      {children}
    </div>
  )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
