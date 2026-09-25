import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#ff4757] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e0e5ec] cursor-pointer select-none border-0 font-mono",
  {
    variants: {
      variant: {
        default:
          "neu-button-primary",
        destructive:
          "bg-[#ff4757] text-white neu-card hover:brightness-110 active:translate-y-[2px] active:neu-pressed",
        outline:
          "bg-[#e0e5ec] text-[#2d3436] dark:text-[#f0f2f5] neu-card hover:text-[#ff4757] hover:neu-floating active:translate-y-[2px] active:neu-pressed",
        secondary:
          "bg-[#e0e5ec] text-[#ff4757] neu-pressed hover:brightness-95 active:translate-y-[2px]",
        ghost:
          "text-[#2d3436] dark:text-[#f0f2f5] hover:bg-[#d1d9e6] hover:text-[#ff4757] hover:neu-recessed active:translate-y-[2px]",
        link: "text-[#ff4757] underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-12 px-6 py-3 min-h-[48px] has-[>svg]:px-4",
        sm: "h-10 rounded-md gap-1.5 px-4 text-xs min-h-[40px] has-[>svg]:px-3",
        lg: "h-14 rounded-xl px-8 text-base min-h-[56px] has-[>svg]:px-6",
        icon: "size-12 rounded-lg min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
