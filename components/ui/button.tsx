import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

// Phase 0.2. The previous default was bg-[#3B6D11] with white text — 4.37:1, which
// fails WCAG AA on its own label. It was also the source of the "slate button" look
// across create-trip, settings and the financials panels; those screens were never
// using Tailwind slate classes, they were using this variant.
//
// Primary is now the near-black fill already used by Invite crew / Start a round /
// Log the first match (17.36:1 under white).
//
// Focus ring is ink rather than the old low-contrast accent, since a focus ring that
// cannot be seen does not satisfy the keyboard-navigation requirement.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[5px] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1A17] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1ED] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default: "bg-[#1C1A17] text-white hover:bg-[#2C2A26] active:bg-[#3A3733]",
        outline: "border border-[#1C1A17] bg-transparent text-[#1C1A17] hover:bg-[#F5F1ED]",
        secondary: "border border-[#1C1A17] bg-transparent text-[#1C1A17] hover:bg-[#F5F1ED]",
        ghost: "text-[#1C1A17] hover:bg-[#F5F1ED]",
        link: "text-[#1C1A17] underline-offset-4 hover:underline",
        // Clay text, no fill — a destructive action should read as a warning rather
        // than compete with the primary action for visual weight.
        destructive: "text-[#8B4444] hover:bg-[#FEF2F2]",
        // Retained for the rare case a filled destructive is genuinely correct.
        destructiveFilled: "bg-[#8B4444] text-white hover:bg-[#734040]",
      },
      size: {
        // Every size clears the 44px minimum tap target. "sm" differs by padding,
        // not by height — a 36px control is not reliably tappable.
        default: "h-11 px-6 py-2.5",
        sm: "h-11 px-4 py-2",
        lg: "h-13 px-8 py-3 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
