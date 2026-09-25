import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-2xl bg-[#E0E5EC] dark:bg-[#181C24] text-[#3D4852] dark:text-[#E2E8F0] placeholder:text-[#6B7280] dark:placeholder:text-[#94A3B8] neu-inset focus:neu-inset-deep focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 focus:ring-offset-[#E0E5EC] dark:focus:ring-offset-[#181C24] px-4 py-2 text-sm font-medium transition-all duration-300 outline-none border-0 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
