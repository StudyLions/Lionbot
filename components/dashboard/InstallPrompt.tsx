// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: PWA install prompt - shows "Install LionBot" banner when
//          the browser supports installation (beforeinstallprompt event)
// ============================================================
import { useState, useEffect, useRef } from "react"
import { Download, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPrompt({ className }: { className?: string }) {
  const [show, setShow] = useState(false)
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(display-mode: standalone)").matches) return

    const dismissed = sessionStorage.getItem("pwa-install-dismissed")
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      deferredRef.current = e as BeforeInstallPromptEvent
      setShow(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredRef.current) return
    await deferredRef.current.prompt()
    const { outcome } = await deferredRef.current.userChoice
    if (outcome === "accepted") {
      setShow(false)
    }
    deferredRef.current = null
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem("pwa-install-dismissed", "true")
  }

  if (!show) return null

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl",
      "bg-gray-800/80 backdrop-blur-sm border border-gray-700/50",
      "animate-in slide-in-from-bottom-2 duration-300",
      className
    )}>
      <div className="p-2 rounded-lg bg-primary/15 text-primary flex-shrink-0">
        <Download size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100">Install LionBot</p>
        <p className="text-xs text-gray-400 leading-tight">
          Full-screen timer, no browser bar
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-1"
      >
        <X size={14} />
      </button>
    </div>
  )
}
