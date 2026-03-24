// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Tutorial Step 2 -- Room system with live RoomCanvas
//          demo inside GameboyFrame, furniture explanation,
//          and room theme previews
// ============================================================
import { motion } from "framer-motion"
import PixelCard from "@/components/pet/ui/PixelCard"
import GameboyFrame from "@/components/pet/GameboyFrame"
import { ROOM_THEMES } from "../tutorialMockData"
import { getRoomPreviewUrl } from "@/utils/petAssets"
import Link from "next/link"
import { ArrowRight, Move, Layers, ShoppingBag } from "lucide-react"

export default function StepRoom() {
  return (
    <div className="space-y-6">
      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">What Is a Room?</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-4">
          Every pet has a room — think of it like decorating a bedroom. You choose the walls,
          floor, and furniture, then arrange everything by dragging things around. Your pet
          hangs out in the room, and friends can visit to see your decorating skills.
        </p>

        <div className="flex justify-center">
          <div className="relative" style={{ width: 340, maxWidth: "100%" }}>
            <GameboyFrame isFullscreen={false} width={340}>
              <img
                src={getRoomPreviewUrl("rooms/castle")}
                alt="Example room"
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </GameboyFrame>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="hidden sm:block absolute top-[8%] right-[-60px]"
            >
              <div className="bg-[var(--pet-card,#0f1628)] border border-[var(--pet-border,#2a3a5c)] rounded px-2 py-1 font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] whitespace-nowrap">
                ← Walls
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="hidden sm:block absolute bottom-[28%] right-[-80px]"
            >
              <div className="bg-[var(--pet-card,#0f1628)] border border-[var(--pet-border,#2a3a5c)] rounded px-2 py-1 font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] whitespace-nowrap">
                ← Furniture
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="hidden sm:block absolute bottom-[18%] left-[-70px]"
            >
              <div className="bg-[var(--pet-card,#0f1628)] border border-[var(--pet-border,#2a3a5c)] rounded px-2 py-1 font-pixel text-[9px] text-[var(--pet-text-dim,#8899aa)] whitespace-nowrap">
                Your pet →
              </div>
            </motion.div>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-1">How the Room Editor Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3">
            <Move className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Drag & Drop</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Click any piece of furniture and drag it wherever you want. Resize items with the slider.
            </p>
          </div>
          <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3">
            <Layers className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Layers</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Choose different wall styles, floor patterns, and furniture pieces. Swap variants with one click.
            </p>
          </div>
          <div className="bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded p-3">
            <ShoppingBag className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="font-pixel text-[11px] text-[var(--pet-text,#e2e8f0)] mb-1">Buy Rooms</h4>
            <p className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed">
              Unlock new room themes with gold. Each theme has unique walls, floors, and furniture.
            </p>
          </div>
        </div>
      </PixelCard>

      <PixelCard className="p-5" corners>
        <h3 className="font-pixel text-sm text-[var(--pet-gold,#f0c040)] mb-3">Room Themes</h3>
        <p className="font-pixel text-[11px] text-[var(--pet-text-dim,#8899aa)] leading-relaxed mb-3">
          There are multiple room themes to unlock. Each one completely changes how your room looks.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROOM_THEMES.map((theme) => (
            <div key={theme.name} className="text-center">
              <div className="w-full aspect-square bg-[var(--pet-bg,#0a0e1a)] border border-[var(--pet-border,#2a3a5c)] rounded overflow-hidden mb-1">
                <img
                  src={getRoomPreviewUrl(theme.prefix)}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                  style={{ imageRendering: "pixelated" }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              </div>
              <span className="font-pixel text-[10px] text-[var(--pet-text-dim,#8899aa)]">{theme.name}</span>
            </div>
          ))}
        </div>
      </PixelCard>

      <div className="flex justify-center">
        <Link href="/pet/room">
          <a className="flex items-center gap-2 px-4 py-2 font-pixel text-[11px] text-[var(--pet-gold,#f0c040)] border border-[var(--pet-gold,#f0c040)]/30 rounded hover:bg-[var(--pet-gold,#f0c040)]/10 transition-colors">
            Visit Your Room
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </Link>
      </div>
    </div>
  )
}
