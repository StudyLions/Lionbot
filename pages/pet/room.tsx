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
import FurniturePanel from "@/components/pet/room/FurniturePanel"
// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Import render stack editor for interleaved equipment layer control
import EquipmentOrder from "@/components/pet/room/EquipmentOrder"
// --- END AI-MODIFIED ---
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
  isResizable,
  clampOffset,
  CANVAS_SIZE,
  DISPLAY_SCALE,
  MIN_SCALE,
  MAX_SCALE,
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
  availableItems?: Array<{
    itemId: number
    name: string
    assetPath: string
    goldPrice: number | null
    gemPrice: number | null
    rarity: string
    owned: boolean
  }>
}

const TOOLS: { id: EditorTool; label: string; icon: string }[] = [
  { id: "move", label: "Move", icon: "✥" },
  { id: "select", label: "Select", icon: "◎" },
  { id: "resize", label: "Resize", icon: "⤡" },
  { id: "flip", label: "Flip", icon: "⇔" },
  { id: "color", label: "Color", icon: "◐" },
  { id: "remove", label: "Remove", icon: "✕" },
  { id: "zoom", label: "Zoom", icon: "⊕" },
  { id: "layers", label: "Layers", icon: "☰" },
  { id: "grid", label: "Grid", icon: "⊞" },
]


// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Color variant lists for cycling through furniture colors with the Color tool
const DEFAULT_VARIANTS: Record<string, string[]> = {
  wall: ['wall_checker_blue', 'wall_checker_green', 'wall_checker_grey', 'wall_checker_pink', 'wall_checker_yellow', 'walldots_blue', 'walldots_green', 'walldots_grey', 'walldots_pink', 'walldots_yellow', 'wall_stripe_green', 'wall_stripe_grey', 'wall_stripe_light_blue', 'wall_stripe_pink', 'wall_stripe_yellow'],
  floor: ['floor_blue', 'floor_brown', 'floor_green', 'floor_orange', 'floor_purple'],
  mat: ['mat_blue', 'mat_green', 'mat_red', 'mat_silver', 'mat_yellow'],
  table: ['table_blue', 'table_brown', 'table_green', 'table_pink', 'table_white'],
  chair: ['chair_blue', 'chair_brown', 'chair_green', 'chair_pink', 'chair_white'],
  bed: ['bed_blueyellow', 'bed_orange', 'bed_pinkpurple', 'bed_red', 'bed_redgreen'],
  lamp: ['lamp_blue', 'lamp_green', 'lamp_purple', 'lamp_red', 'lamp_yellow'],
  picture: ['picture_blue', 'picture_brown', 'picture_grey', 'picture_orange', 'picture_red'],
  window: ['window_blue', 'window_green', 'window_purple_pink', 'window_red_blue', 'window_yellow'],
}
// --- END AI-MODIFIED ---

export default function RoomEditorPage() {
  const { data: session } = useSession()
  const { data, error, isLoading, mutate } = useDashboard<RoomData>(
    session ? "/api/pet/room" : null
  )

  return (
    <Layout
      SEO={{
        title: "Room Editor - LionBot",
        description: "Customize your LionGotchi room",
      }}
    >
      <AdminGuard variant="pet">
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
                  <p className="font-pixel text-sm text-[#e04040]">
                    {(error as Error).message}
                  </p>
                </PixelCard>
              ) : !data?.activeRoom || !data?.pet ? (
                <PixelCard className="p-12 text-center space-y-4" corners>
                  <span className="font-pixel text-2xl">🏠</span>
                  <h2 className="font-pixel text-xl text-[#e2e8f0]">
                    No room yet!
                  </h2>
                  <p className="font-pixel text-[13px] text-[#8899aa] max-w-sm mx-auto">
                    Use the /pet room command in Discord to unlock your first
                    room.
                  </p>
                </PixelCard>
              ) : (
                <RoomEditorContent data={data} mutate={mutate} />
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

function RoomEditorContent({ data, mutate }: { data: RoomData; mutate: () => void }) {
  const room = data.activeRoom!
  const pet = data.pet!
  const furniture = data.furniture ?? {}
  const equipment = data.equipment ?? {}

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Local overrides for immediate color cycling preview without waiting for API
  const [furnitureOverrides, setFurnitureOverrides] = useState<Record<string, string>>({})
  const mergedFurniture = { ...furniture, ...furnitureOverrides }
  // --- END AI-MODIFIED ---

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
    scaleLayer,
    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Destructure render sequence and equipment offset controls
    setRenderSequence,
    setEquipmentOffset,
    // --- END AI-MODIFIED ---
    undo,
    redo,
    saveLayout,
    zoomIn,
    zoomOut,
  } = editor

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Wire up smart snap and sounds. Snap guides are computed alongside
  //          the preview layout in a single useMemo (no setState inside useMemo).
  const { getSnapResult } = useSmartSnap(layout, showGrid)
  const { play: playSound } = useRoomSounds()
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Track selected equipment slot for offset controls in EquipmentOrder
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<string | null>(null)
  // --- END AI-MODIFIED ---

  const [activeTab, setActiveTab] = useState<string>("wall")
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const hoverPosRef = useRef({ x: 0, y: 0 })
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
  // Purpose: Compute preview layout AND snap guides together in a single useMemo.
  //          No setState calls inside -- returns a tuple { layout, guides }.
  const dragPreview = useMemo(() => {
    if (!dragState) {
      return { layout, guides: [] as SnapGuide[] }
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

    const previewLayout = layer === "lion"
      ? { ...layout, lionPosition: clamped }
      : { ...layout, furnitureOffsets: { ...layout.furnitureOffsets, [layer]: clamped } }

    return { layout: previewLayout, guides: snap.guides }
  }, [dragState, dragCurrentPos, layout, getSnapResult])

  const previewLayout = dragPreview.layout
  const snapGuides = dragPreview.guides
  // --- END AI-MODIFIED ---

  // Window-level drag listeners -- only active while dragging
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
      const snap = getSnapResult(layer, rawOffset)
      const finalOffset = clampOffset([snap.snappedX, snap.snappedY], layer)
      moveLayer(layer, finalOffset)
      setDragState(null)
      playSound('place')
      // Prevent the click event (which fires after mouseup) from starting a new drag
      justDroppedRef.current = true
      requestAnimationFrame(() => { justDroppedRef.current = false })
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragState, mouseToCanvas, moveLayer, getSnapResult, playSound])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Drag initiation moved to onMouseDown so mouseup can cleanly
  //          end the drag without click re-triggering a new drag.
  //          onClick only handles non-drag tools (select, flip, etc.).
  const justDroppedRef = useRef(false)

  const handleLayerMouseDown = useCallback(
    (layer: string, x: number, y: number) => {
      if (activeTool === "move" && isMovable(layer) && !dragState) {
        const origOffset: [number, number] =
          layer === "lion"
            ? ([...layout.lionPosition] as [number, number])
            : ([...(layout.furnitureOffsets[layer] ?? [0, 0])] as [number, number])
        setDragState({ layer, startCanvasPos: [x, y], originalOffset: origOffset })
        setDragCurrentPos([x, y])
        setSelectedLayer(layer)
        playSound('pickup')
      }
    },
    [activeTool, layout, dragState, setSelectedLayer, playSound]
  )

  const handleLayerClick = useCallback(
    (layer: string, _x: number, _y: number) => {
      if (justDroppedRef.current) return
      if (activeTool === "move") return
      if (activeTool === "select") {
        setSelectedLayer(selectedLayer === layer ? null : layer)
      } else if (activeTool === "flip" && isFlippable(layer)) {
        flipLayer(layer)
        playSound('flip')
      // --- AI-MODIFIED (2026-03-16) ---
      // Purpose: Color tool cycles through variant colors for furniture items
      } else if (activeTool === "color" && layer !== "lion") {
        const currentPath = mergedFurniture[layer]
        if (!currentPath) return
        const fileName = currentPath.split('/').pop()?.replace('.png', '') ?? ''
        const variants = DEFAULT_VARIANTS[layer]
        if (!variants) return
        const currentIdx = variants.indexOf(fileName)
        const nextIdx = (currentIdx + 1) % variants.length
        const roomPrefix = data.activeRoom?.assetPrefix ?? 'rooms/default'
        const nextPath = `${roomPrefix}/${variants[nextIdx]}.png`
        setFurnitureOverrides(prev => ({ ...prev, [layer]: nextPath }))
        fetch('/api/pet/room/furniture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slot: layer, assetPath: nextPath }),
        })
        playSound('colorCycle')
      // --- END AI-MODIFIED ---
      }
    },
    [activeTool, selectedLayer, setSelectedLayer, flipLayer, playSound, mergedFurniture, data.activeRoom, setFurnitureOverrides]
  )
  // --- END AI-MODIFIED ---

  const handleLayerHover = useCallback((layer: string | null) => {
    setHoveredLayer(layer)
  }, [])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Throttle hover position updates to prevent re-renders on every mouse pixel
  const hoverRafRef = useRef(0)
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    hoverPosRef.current = { x: e.clientX, y: e.clientY }
    if (hoverRafRef.current) return
    hoverRafRef.current = requestAnimationFrame(() => {
      hoverRafRef.current = 0
      setHoverPos(hoverPosRef.current)
    })
  }, [])
  // --- END AI-MODIFIED ---

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
          <h1 className="font-pixel text-2xl text-[#e2e8f0]">{room.name}</h1>
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
            className="font-pixel text-[13px] px-2.5 py-1.5 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] disabled:opacity-30 hover:bg-[#1a2438] hover:text-[#e2e8f0] transition-colors"
            title="Undo"
          >
            ↩{undoCount > 0 && (
              <span className="text-[11px] ml-0.5">({undoCount})</span>
            )}
          </button>
          <button
            onClick={() => { redo(); playSound('undo') }}
            disabled={redoCount === 0}
            className="font-pixel text-[13px] px-2.5 py-1.5 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] disabled:opacity-30 hover:bg-[#1a2438] hover:text-[#e2e8f0] transition-colors"
            title="Redo"
          >
            ↪{redoCount > 0 && (
              <span className="text-[11px] ml-0.5">({redoCount})</span>
            )}
          </button>

          <div className="w-px h-6 bg-[#2a3a5c]" />

          <button
            onClick={() => { saveLayout(); playSound('save') }}
            disabled={!isDirty || isSaving}
            className="font-pixel text-[13px] px-4 py-1.5 border-2 bg-[#111828] disabled:opacity-30 hover:bg-[#1a2438] transition-colors flex items-center gap-1.5"
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
                className="font-pixel text-sm px-3 py-1.5 border-2 transition-colors"
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
              className="font-pixel text-sm px-1.5 py-1 border border-[#2a3a5c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
            >
              −
            </button>
            <span className="font-pixel text-[13px] text-[#8899aa] min-w-[3ch] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="font-pixel text-sm px-1.5 py-1 border border-[#2a3a5c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </PixelCard>

      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Scale slider bar -- visible when resize tool is active and a resizable layer is selected */}
      {activeTool === "resize" && selectedLayer && isResizable(selectedLayer) && (
        <PixelCard className="px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[13px] text-[#8899aa] whitespace-nowrap capitalize">
              {selectedLayer} size
            </span>
            <input
              type="range"
              min={MIN_SCALE * 100}
              max={MAX_SCALE * 100}
              value={Math.round(
                (selectedLayer === "lion"
                  ? layout.lionScale
                  : (layout.furnitureScales[selectedLayer] ?? 1)) * 100
              )}
              onChange={(e) => {
                scaleLayer(selectedLayer, Number(e.target.value) / 100)
              }}
              className="flex-1 h-1.5 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
              style={{ accentColor: "#4080f0" }}
            />
            <span className="font-pixel text-[13px] text-[#e2e8f0] min-w-[4ch] text-right tabular-nums">
              {Math.round(
                (selectedLayer === "lion"
                  ? layout.lionScale
                  : (layout.furnitureScales[selectedLayer] ?? 1)) * 100
              )}%
            </span>
            <button
              onClick={() => scaleLayer(selectedLayer, 1)}
              className="font-pixel text-[11px] px-2 py-1 border border-[#3a4a6c] bg-[#0a0e1a] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
              title="Reset to 100%"
            >
              Reset
            </button>
          </div>
        </PixelCard>
      )}
      {/* --- END AI-MODIFIED --- */}

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
          {/* --- AI-MODIFIED (2026-03-16) --- */}
          {/* Purpose: Use mergedFurniture for immediate color cycling preview */}
          <RoomCanvas
            roomPrefix={room.assetPrefix}
            furniture={mergedFurniture}
            layout={previewLayout}
            equipment={equipment}
            expression={pet.expression}
            size={displaySize}
            interactive
            animated
            selectedLayer={selectedLayer}
            hoveredLayer={hoveredLayer}
            onLayerClick={handleLayerClick}
            onLayerMouseDown={handleLayerMouseDown}
            onLayerHover={handleLayerHover}
            className="max-w-full h-auto"
          />
          {/* --- END AI-MODIFIED --- */}

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

      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Replace inline furniture panel with full item shop component */}
      {/* --- AI-MODIFIED (2026-03-16) --- */}
      {/* Purpose: Pass roomPrefix for room-theme variants, normalize asset paths,
          send itemId with purchases for inventory tracking, add preview support */}
      <FurniturePanel
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        furniture={mergedFurniture}
        availableItems={data.availableItems ?? []}
        gold={data.gold}
        gems={data.gems}
        rooms={data.rooms}
        activeRoomPrefix={room.assetPrefix}
        onPreviewItem={(slot, assetPath) => {
          setFurnitureOverrides(prev => ({ ...prev, [slot]: assetPath }))
        }}
        onCancelPreview={(slot) => {
          setFurnitureOverrides(prev => {
            const next = { ...prev }
            delete next[slot]
            return next
          })
        }}
        onEquipItem={(slot, assetPath) => {
          setFurnitureOverrides(prev => ({ ...prev, [slot]: assetPath }))
          fetch('/api/pet/room/furniture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slot, assetPath }),
          })
          setSelectedLayer(slot)
          playSound('place')
        }}
        onPurchaseItem={async (itemId, slot, assetPath, price, currency) => {
          const res = await fetch('/api/pet/room/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: [{ itemId, slot, assetPath, price, currency }] }),
          })
          if (res.ok) {
            setFurnitureOverrides(prev => ({ ...prev, [slot]: assetPath }))
            playSound('purchase')
          } else {
            playSound('error')
          }
        }}
        onPurchaseRoom={async (roomId) => {
          const res = await fetch('/api/pet/room/purchase-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId }),
          })
          if (res.ok) {
            playSound('purchase')
            mutate()
            return true
          }
          playSound('error')
          return false
        }}
      />
      {/* --- END AI-MODIFIED --- */}
      {/* --- END AI-MODIFIED --- */}

      {/* --- AI-MODIFIED (2026-03-17) --- */}
      {/* Purpose: Render stack editor for interleaved equipment layer ordering and offset control */}
      {Object.keys(equipment).length > 0 && (
        <EquipmentOrder
          equipment={equipment}
          renderSequence={layout.renderSequence}
          equipmentOffsets={layout.equipmentOffsets}
          selectedSlot={selectedEquipSlot}
          onReorder={(seq) => { setRenderSequence(seq); playSound('place') }}
          onSelectSlot={setSelectedEquipSlot}
          onOffsetChange={(slot, offset) => setEquipmentOffset(slot, offset)}
        />
      )}
      {/* --- END AI-MODIFIED --- */}

      {/* Floating info card on hover */}
      {hoveredLayer && !dragState && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: hoverPos.x + 16, top: hoverPos.y - 8 }}
        >
          <PixelCard className="px-3 py-2 min-w-[120px]" borderColor="#4080f0">
            <p className="font-pixel text-[13px] text-[#e2e8f0] capitalize">
              {hoveredLayer}
            </p>
            <p className="font-pixel text-[11px] text-[#8899aa] mt-0.5">
              {hoveredLayer === "lion"
                ? `${pet.name} (Lv.${pet.level})`
                : mergedFurniture[hoveredLayer]
                  ? "Equipped"
                  : "Default"}
            </p>
            {isMovable(hoveredLayer) && (
              <p className="font-pixel text-sm text-[#5a7a9c] mt-0.5">
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


export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
