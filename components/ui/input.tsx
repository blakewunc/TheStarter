import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-2.5 text-base text-[#1C1A17] transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#F5F1ED]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
