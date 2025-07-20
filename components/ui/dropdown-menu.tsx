"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  asChild?: boolean
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            isOpen, 
            onOpenChange: setIsOpen 
          } as any)
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children }: DropdownMenuTriggerProps) => {
  return (
    <div>
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, className, align }: DropdownMenuContentProps) => {
  return (
    <div className={cn(
      "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50",
      align === "end" ? "right-0" : "left-0",
      className
    )}>
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ children, className, onClick, asChild }: DropdownMenuItemProps) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer w-full",
        className,
        (children.props as any).className
      ),
      onClick
    } as any)
  }

  return (
    <div 
      className={cn(
        "px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const DropdownMenuLabel = ({ children, className }: DropdownMenuLabelProps) => {
  return (
    <div className={cn("px-4 py-2 text-sm font-medium text-gray-500", className)}>
      {children}
    </div>
  )
}

const DropdownMenuSeparator = ({ className }: DropdownMenuSeparatorProps) => {
  return <div className={cn("h-px bg-gray-200 my-1", className)} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
