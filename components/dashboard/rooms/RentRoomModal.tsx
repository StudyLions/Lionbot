// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Informational modal for renting a private room.
//          Shows which servers support rooms, costs, balances,
//          and the /room rent command to use in Discord.
// ============================================================
import { useState, useCallback } from "react"
import { DoorOpen, Copy, Check, ExternalLink, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ServerGroup, RoomsData } from "./types"

export default function RentRoomModal({
  open,
  onClose,
  walletBalanceByGuild,
  servers,
}: {
  open: boolean
  onClose: () => void
  walletBalanceByGuild: Record<string, number>
  servers: ServerGroup[]
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("/room rent")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  if (!open) return null

  const allGuildIds = new Set(servers.map((s) => s.guildId))
  const balanceEntries = Object.entries(walletBalanceByGuild)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <DoorOpen size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Rent a Private Room</h2>
              <p className="text-sm text-muted-foreground">
                Create your own voice channel in Discord
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Private rooms are created through Discord. Use the command below
              in any server that has rooms enabled:
            </p>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
              <code className="flex-1 text-sm text-blue-300 font-mono">/room rent</code>
              <button
                onClick={handleCopy}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  copied
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1.5">
              <p className="font-medium text-foreground">Options:</p>
              <p>
                <code className="text-blue-300 bg-blue-500/10 px-1 rounded">days</code>{" "}
                &mdash; how many days to rent (1&ndash;30)
              </p>
              <p>
                <code className="text-blue-300 bg-blue-500/10 px-1 rounded">name</code>{" "}
                &mdash; custom room name
              </p>
              <p>
                <code className="text-blue-300 bg-blue-500/10 px-1 rounded">members</code>{" "}
                &mdash; @mention users to invite
              </p>
            </div>
          </div>

          {/* Wallet balances */}
          {balanceEntries.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Wallet
              </h3>
              <div className="space-y-1">
                {balanceEntries.map(([guildId, balance]) => {
                  const server = servers.find((s) => s.guildId === guildId)
                  return (
                    <div
                      key={guildId}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
                    >
                      <span className="text-foreground truncate">
                        {server?.guildName || "Unknown Server"}
                      </span>
                      <span className="flex items-center gap-1 text-amber-300 font-medium flex-shrink-0">
                        <Coins size={12} /> {balance.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-xl bg-muted text-foreground hover:bg-accent transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
