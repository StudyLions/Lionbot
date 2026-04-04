// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-03
// Purpose: Room list panel (left side of two-panel layout).
//          Groups rooms by server with expandable server sections,
//          includes expired rooms toggle and rent button.
// ============================================================
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  DoorOpen, MessageCircle, Plus, History, ChevronDown, ChevronRight, Calendar,
} from "lucide-react"
import RoomCardComponent from "./RoomCard"
import { formatDate } from "./types"
import type { RoomCard, ServerGroup } from "./types"

export default function RoomList({
  servers,
  expiredRooms,
  selectedRoom,
  onSelectRoom,
  onRentClick,
}: {
  servers: ServerGroup[]
  expiredRooms: RoomCard[]
  selectedRoom: string | null
  onSelectRoom: (channelId: string) => void
  onRentClick: () => void
}) {
  const [showExpired, setShowExpired] = useState(false)

  return (
    <div className="space-y-4">
      {/* Rent button */}
      <button
        onClick={onRentClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} /> Rent a Room
      </button>

      {/* Server groups */}
      {servers.map((server) => (
        <ServerGroupSection
          key={server.guildId}
          server={server}
          selectedRoom={selectedRoom}
          onSelectRoom={onSelectRoom}
        />
      ))}

      {servers.length === 0 && expiredRooms.length === 0 && (
        <EmptyRoomList />
      )}

      {/* Expired rooms */}
      {expiredRooms.length > 0 && (
        <div>
          <button
            onClick={() => setShowExpired(!showExpired)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showExpired ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <History size={12} />
            Expired rooms ({expiredRooms.length})
          </button>
          {showExpired && (
            <div className="mt-2 space-y-1">
              {expiredRooms.map((room) => (
                <div
                  key={room.channelId}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-card/30 text-xs text-muted-foreground"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <DoorOpen size={12} className="flex-shrink-0 opacity-50" />
                    <span className="truncate">{room.name || "Unnamed Room"}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Calendar size={10} />
                    {formatDate(room.deletedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ServerGroupSection({
  server,
  selectedRoom,
  onSelectRoom,
}: {
  server: ServerGroup
  selectedRoom: string | null
  onSelectRoom: (channelId: string) => void
}) {
  return (
    <div>
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1">
        <MessageCircle size={12} />
        {server.guildName}
      </h2>
      <div className="space-y-2">
        {server.rooms.map((room) => (
          <RoomCardComponent
            key={room.channelId}
            room={room}
            selected={selectedRoom === room.channelId}
            onClick={() => onSelectRoom(room.channelId)}
          />
        ))}
      </div>
    </div>
  )
}

function EmptyRoomList() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
        <DoorOpen size={32} className="text-blue-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">No Rooms Yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Private rooms are personal voice channels you rent in a server. Use{" "}
        <code className="text-blue-300 bg-blue-500/10 px-1 rounded text-xs">/room rent</code>{" "}
        in Discord to get started.
      </p>
    </div>
  )
}
