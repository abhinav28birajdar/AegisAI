import React from "react"
import { cn } from "@/lib/utils"

const variantClasses = {
  primary: "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500",
  secondary: "bg-transparent border border-violet-600 text-violet-600 hover:bg-violet-50 focus:ring-violet-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  default: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2",
  lg: "px-6 py-3 text-lg",
}

export const buttonVariants = (options?: {variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "default" | "destructive", size?: "sm" | "md" | "lg"}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
  
  return cn(
    baseClasses,
    variantClasses[options?.variant || "primary"],
    sizeClasses[options?.size || "md"]
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "default" | "destructive"
  size?: "sm" | "md" | "lg"
  icon?: React.ElementType
  isLoading?: boolean
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", icon: Icon, isLoading, asChild, className, disabled, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"

    const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className)

    if (asChild) {
      return (
        <span className={classes} {...props}>
          {children}
        </span>
      )
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : Icon ? (
          <Icon className="w-4 h-4 mr-2" />
        ) : null}
        {!isLoading && children}
      </button>
    )
  },
)

Button.displayName = "Button"
