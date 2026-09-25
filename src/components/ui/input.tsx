import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full min-w-0 rounded-lg bg-[#e0e5ec] dark:bg-[#15181c] text-[#2d3436] dark:text-[#f0f2f5] placeholder:text-[#4a5568]/60 neu-recessed focus:neu-glow-orange focus:ring-2 focus:ring-[#ff4757] focus:ring-offset-2 focus:ring-offset-[#e0e5ec] dark:focus:ring-offset-[#1e2227] px-5 py-3 text-sm font-mono font-medium transition-all duration-200 outline-none border-0 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
