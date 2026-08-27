import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[120px] w-full rounded-[5px] border border-[#CEC5B0] bg-white px-4 py-3 text-base text-[#1C1A17] transition-all duration-200 placeholder:text-[#6B6460] focus:border-[#3B6D11] focus:outline-none focus:ring-2 focus:ring-[#1C1A17] focus:ring-opacity-15 disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#F5F1ED] ${className || ''}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
