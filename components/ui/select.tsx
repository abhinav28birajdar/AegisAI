"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
  className?: string
}

interface SelectItemProps {
  children: React.ReactNode
  value: string
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

interface SelectLabelProps {
  children: React.ReactNode
  className?: string
}

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
})

const Select = ({ children, value, onValueChange }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = ({ children, className }: SelectTriggerProps) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
    </button>
  )
}

const SelectValue = ({ placeholder, className }: SelectValueProps) => {
  const { value } = React.useContext(SelectContext)

  return (
    <span className={cn("block truncate", className)}>
      {value || placeholder}
    </span>
  )
}

const SelectContent = ({ children, className }: SelectContentProps) => {
  const { isOpen } = React.useContext(SelectContext)

  if (!isOpen) return null

  return (
    <div className={cn(
      "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto",
      className
    )}>
      {children}
    </div>
  )
}

const SelectItem = ({ children, value, className }: SelectItemProps) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext)

  const handleSelect = () => {
    onValueChange?.(value)
    setIsOpen(false)
  }

  return (
    <div
      className={cn(
        "relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100 text-sm",
        className
      )}
      onClick={handleSelect}
    >
      {children}
    </div>
  )
}

const SelectLabel = ({ children, className }: SelectLabelProps) => {
  return (
    <div className={cn("py-1.5 px-3 text-sm font-semibold text-gray-600", className)}>
      {children}
    </div>
  )
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

const SelectSeparator = ({ className }: { className?: string }) => {
  return <div className={cn("h-px bg-gray-200 my-1", className)} />
}

const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
