import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC] cursor-pointer select-none border-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#6C63FF] text-white neu-extruded hover:bg-[#8B84FF] hover:-translate-y-0.5 active:translate-y-0.5 active:neu-inset-sm",
        destructive:
          "bg-[#E53E3E] text-white neu-extruded hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0.5 active:neu-inset-sm",
        outline:
          "bg-[#E0E5EC] text-[#3D4852] dark:text-[#E2E8F0] neu-extruded hover:-translate-y-0.5 hover:neu-extruded-hover active:translate-y-0.5 active:neu-inset-sm",
        secondary:
          "bg-[#E0E5EC] text-[#6C63FF] neu-inset hover:neu-inset-deep active:translate-y-0.5",
        ghost:
          "text-[#3D4852] dark:text-[#E2E8F0] hover:bg-[#6C63FF]/15 hover:text-[#6C63FF] hover:-translate-y-0.5 active:translate-y-0.5",
        link: "text-[#6C63FF] underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 rounded-xl gap-1.5 px-3.5 text-xs has-[>svg]:px-3",
        lg: "h-12 rounded-2xl px-7 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-2xl min-h-[44px] min-w-[44px]",
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
