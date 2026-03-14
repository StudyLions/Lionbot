// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Live Discord embed preview for welcome/returning messages
// ============================================================

interface DiscordEmbedPreviewProps {
  message: string
  serverName: string
  userName?: string
}

export default function DiscordEmbedPreview({ message, serverName, userName = "NewMember" }: DiscordEmbedPreviewProps) {
  if (!message) return null

  const rendered = message
    .replace(/\{mention\}/g, `@${userName}`)
    .replace(/\{user_name\}/g, userName)
    .replace(/\{server_name\}/g, serverName)

  return (
    <div className="mt-2 rounded-md overflow-hidden max-w-md">
      <div className="flex gap-3 bg-[#2f3136] rounded p-3">
        <div className="w-1 flex-shrink-0 rounded-full bg-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-full bg-[#5865F2] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-[#00b0f4]">LionBot</span>
            <span className="text-[9px] bg-[#5865F2] text-white px-1 py-0.5 rounded font-medium uppercase">Bot</span>
          </div>
          <p className="text-[#dcddde] text-xs leading-relaxed whitespace-pre-wrap break-words">
            {rendered}
          </p>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 italic">Preview -- actual appearance may vary</p>
    </div>
  )
}
