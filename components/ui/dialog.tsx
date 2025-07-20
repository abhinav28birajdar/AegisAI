"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

const DialogContext = React.createContext<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}>({
  isOpen: false,
  onOpenChange: () => {},
})

const Dialog = ({ children, open, onOpenChange }: DialogProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const contextValue = {
    isOpen,
    onOpenChange: handleOpenChange
  }

  return (
    <DialogContext.Provider value={contextValue}>
      <div className="relative">
        {children}
      </div>
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild }: DialogTriggerProps) => {
  const { onOpenChange } = React.useContext(DialogContext)
  
  const handleClick = () => {
    onOpenChange(true)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick
    } as any)
  }

  return (
    <button onClick={handleClick}>
      {children}
    </button>
  )
}

const DialogContent = ({ children, className }: DialogContentProps) => {
  const { isOpen, onOpenChange } = React.useContext(DialogContext)

  if (!isOpen) return null

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  )
}

const DialogTitle = ({ children, className }: DialogTitleProps) => {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger }
