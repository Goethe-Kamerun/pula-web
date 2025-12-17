"use client"

import * as React from "react"
import { CircleHelp } from "lucide-react"
import { Tooltip as TooltipRoot, TooltipTrigger, TooltipContent } from "./tooltip"

interface TooltipProps {
  description: string
}

export function Tooltip({ description }: TooltipProps) {
  return (
    <TooltipRoot delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-muted cursor-help transition-colors"
          aria-label="More information"
        >
          <CircleHelp className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p className="text-sm font-medium">{description}</p>
      </TooltipContent>
    </TooltipRoot>
  )
}
