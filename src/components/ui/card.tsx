import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-[#e0e5ec] dark:bg-[#1e2227] text-[#2d3436] dark:text-[#f0f2f5] flex flex-col gap-5 rounded-2xl neu-card border-0 p-6 transition-all duration-300 hover:-translate-y-1 hover:neu-floating relative overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-tight font-bold text-lg text-[#2d3436] dark:text-[#f0f2f5]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[#4a5568] dark:text-[#a0aec0] text-sm font-medium", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-2", className)}
      {...props}
    />
  )
}

/**
 * Manufacturing signature detail: Vent slots (3 pill vertical grooves)
 */
function VentSlots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="h-5 w-1 rounded-full bg-[#d1d9e6] dark:bg-[#15181c] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" />
      <div className="h-5 w-1 rounded-full bg-[#d1d9e6] dark:bg-[#15181c] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" />
      <div className="h-5 w-1 rounded-full bg-[#d1d9e6] dark:bg-[#15181c] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]" />
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  VentSlots,
}
