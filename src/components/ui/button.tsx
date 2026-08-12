import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#DD0200]/40 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#DD0200] via-[#8B0000] to-[#55100D] text-white font-bold shadow-lg shadow-[#DD0200]/25 backdrop-blur-md hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-[#55100D] text-white font-bold shadow-md hover:bg-[#DD0200] hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-[#D9D9D9] bg-white/40 dark:bg-black/30 backdrop-blur-md text-foreground font-semibold hover:border-[#DD0200] hover:text-[#DD0200] hover:bg-[#DD0200]/10 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-[#DD0200]/15 text-[#DD0200] border border-[#DD0200]/30 font-bold backdrop-blur-md hover:bg-[#DD0200]/25 hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-foreground hover:bg-[#DD0200]/10 hover:text-[#DD0200] font-semibold backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]",
        link: "text-[#DD0200] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-8.5 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-11 rounded-xl px-6 text-base has-[>svg]:px-4",
        icon: "size-9.5 rounded-xl",
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
