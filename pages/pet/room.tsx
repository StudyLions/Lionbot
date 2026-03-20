// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Room Editor page - Animal Crossing-style room customization
//          with click-to-select, drag-to-move, and contextual actions
// ============================================================

import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout/Layout"
import PetNav from "@/components/pet/PetNav"
import AdminGuard from "@/components/dashboard/AdminGuard"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/hooks/useDashboard"
import RoomCanvas from "@/components/pet/room/RoomCanvas"
import FurniturePanel from "@/components/pet/room/FurniturePanel"
// --- AI-REPLACED (2026-03-20) ---
// Reason: Layers tab now shows room furniture layers instead of lion render stack
// What the new code does better: Users can reorder, position, and scale room items
// --- Original code (commented out for rollback) ---
// import EquipmentOrder from "@/components/pet/room/EquipmentOrder"
// --- End original code ---
import RoomLayersPanel from "@/components/pet/room/RoomLayersPanel"
// --- END AI-REPLACED ---
import UnsavedModal from "@/components/pet/room/UnsavedModal"
import { useRoomEditor } from "@/hooks/useRoomEditor"
import { useSmartSnap, type SnapGuide } from "@/hooks/useSmartSnap"
import { useRoomSounds } from "@/hooks/useRoomSounds"
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
import { Toaster, toast } from "react-hot-toast"
import ArtistAttribution from "@/components/pet/ui/ArtistAttribution"

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
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f1628',
              color: '#e2e8f0',
              border: '2px solid #3a4a6c',
              fontFamily: 'var(--font-pixel, monospace)',
              fontSize: '18px',
            },
          }}
        />
        <div className="pet-section pet-scanline min-h-screen pt-6 pb-20 px-4">
          <div className="max-w-7xl mx-auto flex gap-6">
            <PetNav />
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12" />
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
                  <span className="font-pixel text-2xl">{'🏠'}</span>
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
  const router = useRouter()
  const room = data.activeRoom!
  const pet = data.pet!
  const furniture = data.furniture ?? {}
  const equipment = data.equipment ?? {}

  const [furnitureOverrides, setFurnitureOverrides] = useState<Record<string, string>>({})
  const mergedFurniture = { ...furniture, ...furnitureOverrides }

  const editor = useRoomEditor(
    data.layout ? mergeLayout(data.layout) : undefined
  )
  const {
    layout,
    isDirty,
    isSaving,
    selectedLayer,
    setSelectedLayer,
    zoom,
    showGrid,
    setShowGrid,
    undoCount,
    redoCount,
    moveLayer,
    flipLayer,
    scaleLayer,
    removeLayer,
    reorderLayers,
    undo,
    redo,
    saveLayout,
    zoomIn,
    zoomOut,
  } = editor

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Snap is always enabled; grid overlay is a separate visual toggle
  const { getSnapResult } = useSmartSnap(layout, true)
  // --- END AI-MODIFIED ---
  const { play: playSound } = useRoomSounds()

  const [activeTab, setActiveTab] = useState<string>("wall")
  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Sidebar tabs unify Shop + Layers into one panel
  const [sidebarTab, setSidebarTab] = useState<'shop' | 'layers'>('shop')
  // --- END AI-MODIFIED ---
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const hoverPosRef = useRef({ x: 0, y: 0 })
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  const [dragState, setDragState] = useState<DragState | null>(null)
  const [dragCurrentPos, setDragCurrentPos] = useState<[number, number]>([0, 0])
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const pendingNavRef = useRef<string | null>(null)
  const skipNavGuardRef = useRef(false)

  const clientToCanvas = useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const canvas = canvasWrapperRef.current?.querySelector("canvas")
      if (!canvas) return [0, 0]
      const rect = canvas.getBoundingClientRect()
      return [
        (clientX - rect.left) * (CANVAS_SIZE / rect.width),
        (clientY - rect.top) * (CANVAS_SIZE / rect.height),
      ]
    },
    []
  )

  const mouseToCanvas = useCallback(
    (e: MouseEvent | React.MouseEvent): [number, number] => {
      return clientToCanvas(e.clientX, e.clientY)
    },
    [clientToCanvas]
  )

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

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Unified drag finalization for both mouse and touch
  const finalizeDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState) return
      const pos = clientToCanvas(clientX, clientY)
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
      justDroppedRef.current = true
      requestAnimationFrame(() => { justDroppedRef.current = false })
    },
    [dragState, clientToCanvas, moveLayer, getSnapResult, playSound]
  )

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      setDragCurrentPos(mouseToCanvas(e))
    }
    const handleMouseUp = (e: MouseEvent) => {
      finalizeDrag(e.clientX, e.clientY)
    }
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        setDragCurrentPos(clientToCanvas(e.touches[0].clientX, e.touches[0].clientY))
      }
    }
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      if (touch) finalizeDrag(touch.clientX, touch.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [dragState, mouseToCanvas, clientToCanvas, finalizeDrag])
  // --- END AI-MODIFIED ---

  const justDroppedRef = useRef(false)

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Click-to-select is the default. No tool switching needed.
  //          Clicking a layer selects it, clicking empty space deselects.
  const startDrag = useCallback(
    (layer: string, x: number, y: number) => {
      if (!isMovable(layer) || dragState) return
      const origOffset: [number, number] =
        layer === "lion"
          ? ([...layout.lionPosition] as [number, number])
          : ([...(layout.furnitureOffsets[layer] ?? [0, 0])] as [number, number])
      setDragState({ layer, startCanvasPos: [x, y], originalOffset: origOffset })
      setDragCurrentPos([x, y])
      setSelectedLayer(layer)
      playSound('pickup')
    },
    [layout, dragState, setSelectedLayer, playSound]
  )

  const handleLayerMouseDown = useCallback(
    (layer: string, x: number, y: number) => {
      startDrag(layer, x, y)
    },
    [startDrag]
  )

  const handleTouchLayerStart = useCallback(
    (layer: string, x: number, y: number) => {
      startDrag(layer, x, y)
    },
    [startDrag]
  )

  const handleLayerClick = useCallback(
    (layer: string | null, _x: number, _y: number) => {
      if (justDroppedRef.current) return
      if (layer === null) {
        setSelectedLayer(null)
      } else {
        setSelectedLayer(selectedLayer === layer ? null : layer)
      }
    },
    [selectedLayer, setSelectedLayer]
  )
  // --- END AI-MODIFIED ---

  const handleLayerHover = useCallback((layer: string | null) => {
    setHoveredLayer(layer)
  }, [])

  const hoverRafRef = useRef(0)
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    hoverPosRef.current = { x: e.clientX, y: e.clientY }
    if (hoverRafRef.current) return
    hoverRafRef.current = requestAnimationFrame(() => {
      hoverRafRef.current = 0
      setHoverPos(hoverPosRef.current)
    })
  }, [])

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Contextual actions called from the ContextualBar
  const handleFlip = useCallback(() => {
    if (!selectedLayer || !isFlippable(selectedLayer)) return
    flipLayer(selectedLayer)
    playSound('flip')
  }, [selectedLayer, flipLayer, playSound])

  const handleColorCycle = useCallback(() => {
    if (!selectedLayer || selectedLayer === 'lion') return
    const currentPath = mergedFurniture[selectedLayer]
    if (!currentPath) return
    const fileName = currentPath.split('/').pop()?.replace('.png', '') ?? ''
    const variants = DEFAULT_VARIANTS[selectedLayer]
    if (!variants) return
    const currentIdx = variants.indexOf(fileName)
    const nextIdx = (currentIdx + 1) % variants.length
    const roomPrefix = data.activeRoom?.assetPrefix ?? 'rooms/default'
    const nextPath = `${roomPrefix}/${variants[nextIdx]}.png`
    setFurnitureOverrides(prev => ({ ...prev, [selectedLayer]: nextPath }))
    fetch('/api/pet/room/furniture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: selectedLayer, assetPath: nextPath }),
    })
    playSound('colorCycle')
  }, [selectedLayer, mergedFurniture, data.activeRoom, playSound])

  const handleRemove = useCallback(() => {
    if (!selectedLayer || selectedLayer === 'lion') return
    removeLayer(selectedLayer)
    setFurnitureOverrides(prev => {
      const next = { ...prev }
      delete next[selectedLayer]
      return next
    })
    fetch('/api/pet/room/furniture', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: selectedLayer }),
    })
    setSelectedLayer(null)
    playSound('place')
  }, [selectedLayer, removeLayer, setSelectedLayer, playSound])

  const handleScale = useCallback(
    (scale: number) => {
      if (!selectedLayer) return
      scaleLayer(selectedLayer, scale)
    },
    [selectedLayer, scaleLayer]
  )

  const handleSave = useCallback(async () => {
    const ok = await saveLayout()
    playSound(ok ? 'save' : 'error')
    if (ok) {
      toast.success('Room layout saved!')
    } else {
      toast.error('Failed to save layout')
    }
  }, [saveLayout, playSound])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Keyboard shortcuts -- Delete/Backspace=remove, Escape=deselect,
  //          Ctrl+Z=undo, Ctrl+Shift+Z=redo, G=toggle grid
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      if (e.key === 'Escape') {
        setSelectedLayer(null)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayer) {
        e.preventDefault()
        handleRemove()
      } else if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        playSound('undo')
      } else if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault()
        redo()
        playSound('undo')
      } else if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        setShowGrid(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedLayer, handleRemove, undo, redo, setSelectedLayer, setShowGrid, playSound])
  // --- END AI-MODIFIED ---

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: beforeunload warning for unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => {
    if (!isDirty) return
    const handler = (url: string) => {
      if (skipNavGuardRef.current) return
      pendingNavRef.current = url
      setShowUnsavedModal(true)
      router.events.emit('routeChangeError')
      throw 'Route change aborted due to unsaved changes'
    }
    router.events.on('routeChangeStart', handler)
    return () => {
      router.events.off('routeChangeStart', handler)
    }
  }, [isDirty, router])

  const handleSaveAndLeave = useCallback(async () => {
    const ok = await saveLayout()
    setShowUnsavedModal(false)
    skipNavGuardRef.current = true
    if (ok && pendingNavRef.current) {
      router.push(pendingNavRef.current)
    }
  }, [saveLayout, router])

  const handleLeaveWithout = useCallback(() => {
    setShowUnsavedModal(false)
    skipNavGuardRef.current = true
    if (pendingNavRef.current) {
      router.push(pendingNavRef.current)
    }
  }, [router])
  // --- END AI-MODIFIED ---

  const displaySize = CANVAS_SIZE * DISPLAY_SCALE * zoom

  const selectedScale = selectedLayer
    ? selectedLayer === 'lion'
      ? layout.lionScale
      : (layout.furnitureScales[selectedLayer] ?? 1)
    : 1

  const hasColorVariants = selectedLayer
    ? selectedLayer !== 'lion' && !!DEFAULT_VARIANTS[selectedLayer]
    : false

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Redesigned layout — canvas-first with unified tabbed sidebar
  // containing Shop + Layers tabs and inline selection controls
  return (
    <>
      {/* Header toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="font-pixel text-2xl text-[#e2e8f0]">{room.name}</h1>
          <div className="mt-1.5 flex items-center gap-1">
            <span className="block h-[3px] w-8 bg-[#f0c040]" />
            <span className="block h-[3px] w-4 bg-[#f0c040]/60" />
            <span className="block h-[3px] w-2 bg-[#f0c040]/30" />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => { undo(); playSound('undo') }}
            disabled={undoCount === 0}
            className="font-pixel text-[13px] px-2.5 py-1.5 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] disabled:opacity-30 hover:bg-[#1a2438] hover:text-[#e2e8f0] transition-colors"
            title="Undo (Ctrl+Z)"
          >
            {'↩'}{undoCount > 0 && <span className="text-[11px] ml-0.5">({undoCount})</span>}
          </button>
          <button
            onClick={() => { redo(); playSound('undo') }}
            disabled={redoCount === 0}
            className="font-pixel text-[13px] px-2.5 py-1.5 border-2 border-[#3a4a6c] bg-[#111828] text-[#8899aa] disabled:opacity-30 hover:bg-[#1a2438] hover:text-[#e2e8f0] transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            {'↪'}{redoCount > 0 && <span className="text-[11px] ml-0.5">({redoCount})</span>}
          </button>

          <div className="w-px h-6 bg-[#2a3a5c]" />

          <button
            onClick={() => setShowGrid(!showGrid)}
            className="font-pixel text-[13px] px-2.5 py-1.5 border-2 transition-colors"
            style={{
              borderColor: showGrid ? '#4080f0' : '#3a4a6c',
              backgroundColor: showGrid ? '#1a2850' : '#111828',
              color: showGrid ? '#93c5fd' : '#8899aa',
            }}
            title="Toggle grid (G)"
          >
            {'⊞'}
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              className="font-pixel text-sm px-1.5 py-1 border border-[#3a4a6c] bg-[#111828] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
              title="Zoom out"
            >{'−'}</button>
            <span className="font-pixel text-[13px] text-[#8899aa] min-w-[3ch] text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="font-pixel text-sm px-1.5 py-1 border border-[#3a4a6c] bg-[#111828] text-[#8899aa] hover:text-[#e2e8f0] transition-colors"
              title="Zoom in"
            >{'+'}</button>
          </div>

          <div className="w-px h-6 bg-[#2a3a5c]" />

          <button
            onClick={handleSave}
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

      {/* Main content: canvas + sidebar */}
      <div className="flex gap-5 md:flex-col items-start">
        {/* Canvas area */}
        <div className="flex-1 min-w-0 space-y-2">
          <PixelCard
            className="p-3 overflow-auto flex items-center justify-center"
            corners
          >
            <div
              ref={canvasWrapperRef}
              className="relative"
              style={{ cursor: dragState ? "grabbing" : "default" }}
              onMouseMove={handleCanvasMouseMove}
            >
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
                onTouchLayerStart={handleTouchLayerStart}
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
                      <line key={i} x1={g.position} y1={g.from} x2={g.position} y2={g.to}
                        stroke={g.color} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.8} />
                    ) : (
                      <line key={i} x1={g.from} y1={g.position} x2={g.to} y2={g.position}
                        stroke={g.color} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.8} />
                    )
                  )}
                </svg>
              )}
            </div>
          </PixelCard>

          <div className="flex items-center justify-between px-1">
            <p className="font-pixel text-[11px] text-[#5a6a7c]">
              Click to select {'·'} Drag to move {'·'} Esc to deselect {'·'} Del to remove
            </p>
            <p className="font-pixel text-[11px] text-[#5a6a7c]">G for grid</p>
          </div>
          <ArtistAttribution />
        </div>

        {/* Right sidebar */}
        <div className="w-[400px] md:w-full flex-shrink-0 space-y-3 sticky top-6 md:static">
          {/* Selection controls */}
          {selectedLayer && (
            <PixelCard className="p-3 space-y-2.5" corners borderColor="#4080f0">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-sm text-[#93c5fd] capitalize font-bold tracking-wide">
                  {selectedLayer === 'lion' ? `${pet.name} (Lion)` : selectedLayer}
                </span>
                <button
                  onClick={() => setSelectedLayer(null)}
                  className="font-pixel text-[13px] w-6 h-6 flex items-center justify-center text-[#6b7fa0] hover:text-[#e2e8f0] hover:bg-[#1a2438] rounded transition-colors"
                  title="Deselect (Esc)"
                >{'✕'}</button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {isFlippable(selectedLayer) && (
                  <button
                    onClick={handleFlip}
                    className="font-pixel text-[13px] px-3 py-1.5 border border-[#3a4a6c] bg-[#111828] text-[#c8d4e8] hover:border-[#5a6a8c] hover:text-[#e2e8f0] transition-colors"
                    title="Flip"
                  >{'⇔ Flip'}</button>
                )}
                {hasColorVariants && (
                  <button
                    onClick={handleColorCycle}
                    className="font-pixel text-[13px] px-3 py-1.5 border border-[#3a4a6c] bg-[#111828] text-[#c8d4e8] hover:border-[#5a6a8c] hover:text-[#e2e8f0] transition-colors"
                    title="Cycle color variant"
                  >{'◐ Color'}</button>
                )}
                {selectedLayer !== 'lion' && (
                  <button
                    onClick={handleRemove}
                    className="font-pixel text-[13px] px-3 py-1.5 border border-[#5a2020] bg-[#1a0808] text-[#e05050] hover:border-[#804040] hover:text-[#ff7070] transition-colors"
                    title="Remove furniture (Del)"
                  >{'🗑 Remove'}</button>
                )}
              </div>

              {isResizable(selectedLayer) && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-pixel text-[12px] text-[#6b7fa0]">Scale</span>
                  <input
                    type="range"
                    min={MIN_SCALE * 100}
                    max={MAX_SCALE * 100}
                    value={Math.round(selectedScale * 100)}
                    onChange={(e) => handleScale(Number(e.target.value) / 100)}
                    className="flex-1 h-1 appearance-none bg-[#2a3a5c] rounded cursor-pointer accent-[#4080f0]"
                  />
                  <span className="font-pixel text-[12px] text-[#e2e8f0] min-w-[3.5ch] text-right tabular-nums">
                    {Math.round(selectedScale * 100)}%
                  </span>
                  {selectedScale !== 1 && (
                    <button
                      onClick={() => handleScale(1)}
                      className="font-pixel text-[11px] px-1 py-0.5 text-[#6b7fa0] hover:text-[#e2e8f0] transition-colors"
                      title="Reset size"
                    >{'↺'}</button>
                  )}
                </div>
              )}
            </PixelCard>
          )}

          {/* Tabbed panel: Shop + Layers */}
          <PixelCard className="flex flex-col overflow-hidden" corners>
            <div className="flex border-b-2 border-[#2a3a5c]">
              <button
                onClick={() => setSidebarTab('shop')}
                className={`flex-1 font-pixel text-sm py-2.5 px-4 transition-colors ${
                  sidebarTab === 'shop'
                    ? 'text-[#f0c040] bg-[#111828] border-b-2 border-[#f0c040] -mb-[2px]'
                    : 'text-[#6b7fa0] hover:text-[#c8d4e8] hover:bg-[#0c1020]'
                }`}
              >
                {'🛒 Shop'}
              </button>
              <button
                onClick={() => setSidebarTab('layers')}
                className={`flex-1 font-pixel text-sm py-2.5 px-4 transition-colors ${
                  sidebarTab === 'layers'
                    ? 'text-[#f0c040] bg-[#111828] border-b-2 border-[#f0c040] -mb-[2px]'
                    : 'text-[#6b7fa0] hover:text-[#c8d4e8] hover:bg-[#0c1020]'
                }`}
              >
                {'📑 Layers'}
                {Object.keys(mergedFurniture).length > 0 && (
                  <span className="text-[11px] ml-1 opacity-60">({Object.keys(mergedFurniture).length})</span>
                )}
              </button>
            </div>

            <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-[#3a4a6c] scrollbar-track-transparent">
              {sidebarTab === 'shop' ? (
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
                      toast.success('Item purchased!')
                      mutate()
                    } else {
                      playSound('error')
                      toast.error('Purchase failed')
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
                      toast.success('Room unlocked!')
                      mutate()
                      return true
                    }
                    playSound('error')
                    toast.error('Failed to unlock room')
                    return false
                  }}
                />
              ) : (
                // --- AI-REPLACED (2026-03-20) ---
                // Reason: Layers tab now shows room furniture layers instead of lion render stack
                // What the new code does better: Users can reorder, position, and scale room items
                <div className="p-3">
                  <div className="mb-3 px-2.5 py-2 border border-[#4080f0]/20 bg-[#4080f0]/5 rounded">
                    <p className="font-pixel text-[12px] text-[#80b0ff] leading-relaxed">
                      Drag items to change their layer order. Click any item to adjust its position and scale on the canvas.
                    </p>
                    <p className="font-pixel text-[11px] text-[#6090c0] mt-1">
                      Changes are saved when you click Save.
                    </p>
                  </div>
                  <RoomLayersPanel
                    layerOrder={layout.layerOrder}
                    furniture={mergedFurniture}
                    furnitureOffsets={layout.furnitureOffsets}
                    furnitureScales={layout.furnitureScales}
                    lionPosition={layout.lionPosition}
                    lionScale={layout.lionScale}
                    selectedLayer={selectedLayer}
                    onSelectLayer={setSelectedLayer}
                    onReorder={(newOrder) => { reorderLayers(newOrder); playSound('place') }}
                    onMoveLayer={moveLayer}
                    onScaleLayer={scaleLayer}
                  />
                </div>
                // --- END AI-REPLACED ---
              )}
            </div>
          </PixelCard>
        </div>
      </div>

      {/* Floating hover tooltip */}
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
            <p className="font-pixel text-[11px] text-[#5a7a9c] mt-0.5">
              Click + drag to move
            </p>
          </PixelCard>
        </div>
      )}

      {/* Unsaved changes modal */}
      <UnsavedModal
        open={showUnsavedModal}
        onSaveAndLeave={handleSaveAndLeave}
        onLeaveWithout={handleLeaveWithout}
        onStay={() => setShowUnsavedModal(false)}
        isSaving={isSaving}
      />
    </>
  )
  // --- END AI-MODIFIED ---
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
