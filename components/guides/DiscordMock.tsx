// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Mock Discord UI components for guide articles.
//          Renders realistic-looking Discord messages, embeds,
//          and bot interactions without needing screenshots.
// ============================================================
import React from "react"
import { cn } from "@/lib/utils"

interface DiscordMessageProps {
  botName?: string
  botAvatar?: string
  children: React.ReactNode
  timestamp?: string
}

export function DiscordMessage({
  botName = "Leo",
  botAvatar = "/images/lionbot-avatar.png",
  children,
  timestamp = "Today at 3:42 PM",
}: DiscordMessageProps) {
  return (
    <div className="not-prose my-6 rounded-lg border border-[#2b2d31] bg-[#313338] overflow-hidden font-sans">
      <div className="px-4 py-3 flex gap-3">
        <img
          src={botAvatar}
          alt={botName}
          className="w-10 h-10 rounded-full flex-shrink-0 mt-0.5"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[#f2f3f5]">{botName}</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-[#5865f2] text-white font-medium leading-none">
              BOT
            </span>
            <span className="text-[11px] text-[#949ba4]">{timestamp}</span>
          </div>
          <div className="text-sm text-[#dbdee1]">{children}</div>
        </div>
      </div>
    </div>
  )
}

interface DiscordEmbedProps {
  color?: string
  title?: string
  description?: string
  fields?: { name: string; value: string; inline?: boolean }[]
  footer?: string
  children?: React.ReactNode
}

export function DiscordEmbed({
  color = "#3b82f6",
  title,
  description,
  fields,
  footer,
  children,
}: DiscordEmbedProps) {
  return (
    <div
      className="mt-1 rounded border-l-4 bg-[#2b2d31] max-w-[520px] overflow-hidden"
      style={{ borderLeftColor: color }}
    >
      <div className="p-3">
        {title && (
          <div className="text-sm font-semibold text-white mb-1">{title}</div>
        )}
        {description && (
          <div className="text-[13px] text-[#dbdee1] leading-relaxed whitespace-pre-line">
            {description}
          </div>
        )}
        {fields && fields.length > 0 && (
          <div className={cn("mt-2 gap-2", fields.some((f) => f.inline) ? "grid grid-cols-3" : "flex flex-col gap-1")}>
            {fields.map((field, i) => (
              <div key={i} className={field.inline ? "" : "col-span-3"}>
                <div className="text-xs font-semibold text-[#dbdee1] mb-0.5">
                  {field.name}
                </div>
                <div className="text-[13px] text-[#b5bac1]">{field.value}</div>
              </div>
            ))}
          </div>
        )}
        {children}
        {footer && (
          <div className="mt-2 pt-2 border-t border-[#3f4147] text-[11px] text-[#949ba4]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

interface DiscordButtonProps {
  label: string
  variant?: "primary" | "success" | "danger" | "secondary"
  disabled?: boolean
}

const buttonColors = {
  primary: "bg-[#5865f2] text-white",
  success: "bg-[#248046] text-white",
  danger: "bg-[#da373c] text-white",
  secondary: "bg-[#4e5058] text-white",
}

export function DiscordButton({ label, variant = "secondary", disabled }: DiscordButtonProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded text-[13px] font-medium",
        buttonColors[variant],
        disabled && "opacity-50"
      )}
    >
      {label}
    </span>
  )
}

export function DiscordButtonRow({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
}
