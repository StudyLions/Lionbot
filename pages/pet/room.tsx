// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Room Editor page - Animal Crossing-style room customization
//          with drag-and-drop furniture, toolbar, and layer management
// ============================================================

import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import { useRoomEditor, type EditorTool } from "@/hooks/useRoomEditor"
// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Import smart snap and sound hooks for editor polish
import { useSmartSnap, type SnapGuide } from "@/hooks/useSmartSnap"
import { useRoomSounds } from "@/hooks/useRoomSounds"
// --- END AI-MODIFIED ---
import {
  ROOM_LAYERS,
  mergeLayout,
  isMovable,
  isFlippable,
  clampOffset,
  CANVAS_SIZE,
  DISPLAY_SCALE,
} from "@/utils/roomConstraints"
import PixelCard from "@/components/pet/ui/PixelCard"
import { Skeleton } from "@/components/ui/skeleton"
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"

interface RoomData {
  activeRoom: { roomId: number; name: string; assetPrefix: string } | null
  furniture: Record<string, string>
  layout: any
  rooms: Array<{
    roomId: number
    name: string
    assetPrefix: string
    hasFurniture: boolean
    goldPrice: number | null
    gemPrice: number | null
    owned: boolean
  }>
  equipment: Record<
    string,
    { name: string; category: string; rarity: string; assetPath: string }
  >
  pet: { name: string; expression: string; level: number } | null
  gold: string
  gems: number
}

const TOOLS: { id: EditorTool; label: string; icon: string }[] = [
  { id: "move", label: "Move", icon: "✥" },
  { id: "select", label: "Select", icon: "◎" },
  { id: "flip", label: "Flip", icon: "⇔" },
  { id: "color", label: "Color", icon: "◐" },
  { id: "remove", label: "Remove", icon: "✕" },
  { id: "zoom", label: "Zoom", icon: "⊕" },
  { id: "layers", label: "Layers", icon: "☰" },
  { id: "grid", label: "Grid", icon: "⊞" },
]

const TAB_LABELS: Record<string, string> = {
  wall: "Wall",
  floor: "Floor",
  mat: "Mat",
  table: "Table",
  chair: "Chair",
  bed: "Bed",
  lamp: "Lamp",
  picture: "Picture",
  window: "Window",
}

export default function RoomEditorPage() {
  const { data: session } = useSession()
  const { data, error, isLoading } = useDashboard<RoomData>(
    session ? "/api/pet/room" : null
  )

  return (
    <Layout
      SEO={{
        title: "Room Editor - LionBot",
        description: "Customize your LionGotchi room",
      }}
    >
      <AdminGuard>
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-[400px]" />
                  <Skeleton className="h-32" />
                </div>
              ) : error ? (
                <PixelCard className="p-8 text-center" corners>
                  <p className="font-pixel text-xs text-[#e04040]">
                    {(error as Error).message}
                  </p>
                </PixelCard>
              ) : !data?.activeRoom || !data?.pet ? (
                <PixelCard className="p-12 text-center space-y-4" corners>
                  <span className="font-pixel text-2xl">🏠</span>
                  <h2 className="font-pixel text-lg text-[#e2e8f0]">
                    No room yet!
                  </h2>
                  <p className="font-pixel text-[10px] text-[#8899aa] max-w-sm mx-auto">
                    Use the /pet room command in Discord to unlock your first
                    room.
                  </p>
                </PixelCard>
              ) : (
                <RoomEditorContent data={data} />
              )}
            </div>
          </div>
        </div>
      </AdminGuard>
    </Layout>
  )
}

interface DragState {
  layer: string
  startCanvasPos: [number, number]
  originalOffset: [number, number]
}

function RoomEditorContent({ data }: { data: RoomData }) {
  const room = data.activeRoom!
  const pet = data.pet!
  const furniture = data.furniture ?? {}
  const equipment = data.equipment ?? {}

  const editor = useRoomEditor(
    data.layout ? mergeLayout(data.layout) : undefined
  )
  const {
    layout,
    isDirty,
    isSaving,
    selectedLayer,
    setSelectedLayer,
    activeTool,
    setActiveTool,
    zoom,
    showGrid,
    setShowGrid,
    showLayers,
    setShowLayers,
    undoCount,
    redoCount,
    moveLayer,
    flipLayer,
    undo,
    redo,
    saveLayout,
    zoomIn,
    zoomOut,
  } = editor

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Wire up smart snap alignment guides and retro sound effects
  const { getSnapResult } = useSmartSnap(layout, showGrid)
  const { play: playSound } = useRoomSounds()
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([])
  // --- END AI-MODIFIED ---

  const [activeTab, setActiveTab] = useState<string>("wall")
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  const [dragState, setDragState] = useState<DragState | null>(null)
  const [dragCurrentPos, setDragCurrentPos] = useState<[number, number]>([0, 0])
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  const mouseToCanvas = useCallback(
    (e: MouseEvent | React.MouseEvent): [number, number] => {
      const canvas = canvasWrapperRef.current?.querySelector("canvas")
      if (!canvas) return [0, 0]
      const rect = canvas.getBoundingClientRect()
      return [
        (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
        (e.clientY - rect.top) * (CANVAS_SIZE / rect.height),
      ]
    },
    []
  )

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Preview layout during drag with smart snap alignment
  const previewLayout = useMemo(() => {
    if (!dragState) {
      setSnapGuides([])
      return layout
    }
    const { layer, startCanvasPos, originalOffset } = dragState
    const delta: [number, number] = [
      dragCurrentPos[0] - startCanvasPos[0],
      dragCurrentPos[1] - startCanvasPos[1],
    ]
    const rawOffset: [number, number] = [
      originalOffset[0] + delta[0],
      originalOffset[1] + delta[1],
    ]
    const snap = getSnapResult(layer, rawOffset)
    const clamped = clampOffset([snap.snappedX, snap.snappedY], layer)
    setSnapGuides(snap.guides)

    if (layer === "lion") {
      return { ...layout, lionPosition: clamped }
    }
    return {
      ...layout,
      furnitureOffsets: { ...layout.furnitureOffsets, [layer]: clamped },
    }
  }, [dragState, dragCurrentPos, layout, getSnapResult])
  // --- END AI-MODIFIED ---

  // Window-level drag listeners — only active while dragging
  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      setDragCurrentPos(mouseToCanvas(e))
    }

    const handleMouseUp = (e: MouseEvent) => {
      const pos = mouseToCanvas(e)
      const { layer, startCanvasPos, originalOffset } = dragState
      const delta: [number, number] = [
        pos[0] - startCanvasPos[0],
        pos[1] - startCanvasPos[1],
      ]
      const rawOffset: [number, number] = [
        originalOffset[0] + delta[0],
        originalOffset[1] + delta[1],
      ]
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Apply smart snap on final drop and play place sound
      const snap = getSnapResult(layer, rawOffset)
      const finalOffset = clampOffset([snap.snappedX, snap.snappedY], layer)
      // --- END AI-MODIFIED ---
      moveLayer(layer, finalOffset)
      setDragState(null)
      setSnapGuides([])
      playSound('place')
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragState, mouseToCanvas, moveLayer])

  const handleLayerClick = useCallback(
    (layer: string, x: number, y: number) => {
      if (activeTool === "move" && isMovable(layer)) {
        const origOffset: [number, number] =
          layer === "lion"
            ? ([...layout.lionPosition] as [number, number])
            : ([...(layout.furnitureOffsets[layer] ?? [0, 0])] as [
                number,
                number,
              ])
        setDragState({ layer, startCanvasPos: [x, y], originalOffset: origOffset })
        setDragCurrentPos([x, y])
        setSelectedLayer(layer)
        playSound('pickup')
      } else if (activeTool === "select") {
        setSelectedLayer(selectedLayer === layer ? null : layer)
      } else if (activeTool === "flip" && isFlippable(layer)) {
        flipLayer(layer)
        playSound('flip')
      }
    },
    [activeTool, layout, selectedLayer, setSelectedLayer, flipLayer]
  )

  const handleLayerHover = useCallback((layer: string | null) => {
    setHoveredLayer(layer)
  }, [])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    setHoverPos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleToolClick = useCallback(
    (tool: EditorTool) => {
      if (tool === "grid") {
        setShowGrid(!showGrid)
      } else if (tool === "layers") {
        setShowLayers(!showLayers)
      } else if (tool === "zoom") {
        zoomIn()
      } else {
        setActiveTool(tool)
      }
    },
    [showGrid, showLayers, setShowGrid, setShowLayers, setActiveTool, zoomIn]
  )

  const displaySize = CANVAS_SIZE * DISPLAY_SCALE * zoom

  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-pixel text-xl text-[#e2e8f0]">{room.name}</h1>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="block h-[3px] w-8 bg-[#f0c040]" />
            <span className="block h-[3px] w-4 bg-[#f0c040]/60" />
            <span className="block h-[3px] w-2 bg-[#f0c040]/30" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { undo(); playSound('undo') }}
            disabled={undoCount === 0}
            className="font-pixel text-[10px] px-2.5 py-1.5 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] disabled:opacity-30 hover:bg-[#1a2438] hover:text-[#e2e8f0] transition-colors"
            title="Undo"
          >
            ↩{undoCount > 0 && (
              <span className="text-[8px] ml-0.5">({undoCount})</span>
            )}
          </button>
          <button
            onClick={() => { redo(); playSound('undo') }}
            disabled={redoCount === 0}
            className="font-pixel text-[10px] px-2.5 py-1.5 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] disabled:opacity-30 hover:bg-[#1a2438] hover:text-[#e2e8f0] transition-colors"
            title="Redo"
          >
            ↪{redoCount > 0 && (
              <span className="text-[8px] ml-0.5">({redoCount})</span>
            )}
          </button>

          <div className="w-px h-6 bg-[#2a3a5c]" />

          <button
            onClick={() => { saveLayout(); playSound('save') }}
            disabled={!isDirty || isSaving}
            className="font-pixel text-[10px] px-4 py-1.5 border-2 bg-[#111828] disabled:opacity-30 hover:bg-[#1a2438] transition-colors flex items-center gap-1.5"
            style={{
              borderColor: isDirty ? "#f0c040" : "#3a4a6c",
              color: isDirty ? "#f0c040" : "#8899aa",
            }}
          >
            {isDirty && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f0c040] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f0c040]" />
              </span>
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <PixelCard className="px-3 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          {TOOLS.map((tool) => {
            const isActive =
              tool.id === activeTool ||
              (tool.id === "grid" && showGrid) ||
              (tool.id === "layers" && showLayers)
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className="font-pixel text-xs px-3 py-1.5 border-2 transition-colors"
                style={{
                  borderColor: isActive ? "#4080f0" : "#2a3a5c",
                  backgroundColor: isActive ? "#1a2850" : "#0a0e1a",
                  color: isActive ? "#93c5fd" : "#8899aa",
                  boxShadow: isActive
                    ? "0 0 8px rgba(64,128,240,0.2)"
                    : "none",
                }}
                title={tool.label}
              >
                <span className="text-sm">{tool.icon}</span>
                <span className="ml-1.5 sm:hidden">{tool.label}</span>
              </button>
            )
          })}

          <div className="flex-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border-l-2 border-[#2a3a5c] pl-2 ml-1">
            <button
              onClick={zoomOut}
              className="font-pixel text-xs px-1.5 py-1 border border-[#2a3a5c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
            >
              −
            </button>
            <span className="font-pixel text-[10px] text-[#8899aa] min-w-[3ch] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="font-pixel text-xs px-1.5 py-1 border border-[#2a3a5c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </PixelCard>

      {/* Canvas */}
      <PixelCard
        className="p-4 overflow-auto flex items-center justify-center"
        corners
      >
        <div
          ref={canvasWrapperRef}
          className="relative"
          style={{
            cursor:
              activeTool === "move"
                ? dragState
                  ? "grabbing"
                  : "grab"
                : "crosshair",
          }}
          onMouseMove={handleCanvasMouseMove}
        >
          <RoomCanvas
            roomPrefix={room.assetPrefix}
            furniture={furniture}
            layout={previewLayout}
            equipment={equipment}
            expression={pet.expression}
            size={displaySize}
            interactive
            animated
            selectedLayer={selectedLayer}
            hoveredLayer={hoveredLayer}
            onLayerClick={handleLayerClick}
            onLayerHover={handleLayerHover}
            className="max-w-full h-auto"
          />

          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(64,128,240,0.15) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(64,128,240,0.15) 1px, transparent 1px)
                `,
                backgroundSize: `${displaySize / 10}px ${displaySize / 10}px`,
              }}
            />
          )}

          {/* --- AI-MODIFIED (2026-03-16) --- */}
          {/* Purpose: Render smart snap alignment guides during drag */}
          {snapGuides.length > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={displaySize}
              height={displaySize}
              viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
              style={{ imageRendering: "auto" }}
            >
              {snapGuides.map((g, i) =>
                g.type === "vertical" ? (
                  <line
                    key={i}
                    x1={g.position}
                    y1={g.from}
                    x2={g.position}
                    y2={g.to}
                    stroke={g.color}
                    strokeWidth={0.5}
                    strokeDasharray="2 2"
                    opacity={0.8}
                  />
                ) : (
                  <line
                    key={i}
                    x1={g.from}
                    y1={g.position}
                    x2={g.to}
                    y2={g.position}
                    stroke={g.color}
                    strokeWidth={0.5}
                    strokeDasharray="2 2"
                    opacity={0.8}
                  />
                )
              )}
            </svg>
          )}
          {/* --- END AI-MODIFIED --- */}
        </div>
      </PixelCard>

      {/* Furniture panel */}
      <PixelCard className="p-0 overflow-hidden" corners>
        <div className="flex overflow-x-auto border-b-2 border-[#1a2a3c] bg-[#080c18] scrollbar-thin">
          {ROOM_LAYERS.map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveTab(layer)}
              className="font-pixel text-[10px] px-4 py-2.5 whitespace-nowrap transition-colors flex-shrink-0"
              style={{
                color: activeTab === layer ? "#e2e8f0" : "#5a6a8c",
                borderBottom:
                  activeTab === layer
                    ? "2px solid #4080f0"
                    : "2px solid transparent",
                backgroundColor:
                  activeTab === layer ? "#0f1628" : "transparent",
              }}
            >
              {TAB_LABELS[layer]}
            </button>
          ))}
        </div>

        <div className="p-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {furniture[activeTab] ? (
              <FurnitureThumb
                label={activeTab}
                assetPath={furniture[activeTab]}
                equipped
                selected={selectedLayer === activeTab}
                onClick={() => {
                  setSelectedLayer(activeTab)
                  setActiveTool("select")
                }}
              />
            ) : (
              <div className="flex-shrink-0 w-12 h-12 border-2 border-dashed border-[#2a3a5c] bg-[#080c18] flex items-center justify-center">
                <span className="font-pixel text-[8px] text-[#3a4a5c]">
                  Empty
                </span>
              </div>
            )}
          </div>
          {!furniture[activeTab] && (
            <p className="font-pixel text-[9px] text-[#5a6a8c] mt-1">
              No {TAB_LABELS[activeTab]?.toLowerCase()} furniture equipped. Use
              the /pet room command in Discord to equip furniture.
            </p>
          )}
        </div>
      </PixelCard>

      {/* Floating info card on hover */}
      {hoveredLayer && !dragState && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: hoverPos.x + 16, top: hoverPos.y - 8 }}
        >
          <PixelCard className="px-3 py-2 min-w-[120px]" borderColor="#4080f0">
            <p className="font-pixel text-[10px] text-[#e2e8f0] capitalize">
              {hoveredLayer}
            </p>
            <p className="font-pixel text-[8px] text-[#8899aa] mt-0.5">
              {hoveredLayer === "lion"
                ? `${pet.name} (Lv.${pet.level})`
                : furniture[hoveredLayer]
                  ? "Equipped"
                  : "Default"}
            </p>
            {isMovable(hoveredLayer) && (
              <p className="font-pixel text-[8px] text-[#5a7a9c] mt-0.5">
                {activeTool === "move"
                  ? "Click + drag to move"
                  : "Switch to Move tool"}
              </p>
            )}
          </PixelCard>
        </div>
      )}
    </>
  )
}

function FurnitureThumb({
  label,
  assetPath,
  equipped,
  selected,
  onClick,
}: {
  label: string
  assetPath: string
  equipped?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const borderColor = selected ? "#4080f0" : equipped ? "#40d870" : "#3a4a6c"
  const blobBase = process.env.NEXT_PUBLIC_BLOB_URL || ""
  const url = `${blobBase}/pet-assets/${assetPath}`

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-12 h-12 border-2 bg-[#080c18] overflow-hidden hover:brightness-110 transition-all relative"
      style={{ borderColor }}
    >
      <img
        src={url}
        alt={label}
        className="w-full h-full object-contain"
        style={{ imageRendering: "pixelated" }}
      />
      {equipped && (
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#40d870]" />
      )}
    </button>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
