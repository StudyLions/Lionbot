// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Core state management hook for the pet room editor.
//          Manages undo/redo, layout state, dirty tracking,
//          save/load via API, and constraint validation.
// ============================================================

import { useState, useCallback, useRef } from 'react'
import { RoomLayout, DEFAULT_LAYOUT, mergeLayout, clampOffset, isMovable, clampScale, isResizable } from '@/utils/roomConstraints'

interface RoomEditorState {
  layout: RoomLayout
  undoStack: RoomLayout[]
  redoStack: RoomLayout[]
  isDirty: boolean
  isSaving: boolean
  selectedLayer: string | null
  activeTool: EditorTool
  zoom: number
  showGrid: boolean
  showLayers: boolean
  cart: CartItem[]
}

type EditorTool = 'move' | 'select' | 'resize' | 'flip' | 'color' | 'remove' | 'zoom' | 'layers' | 'grid'

interface CartItem {
  slot: string
  assetPath: string
  name: string
  price: number
  currency: 'gold' | 'gems'
}

export function useRoomEditor(initialLayout?: Partial<RoomLayout>) {
  const [layout, setLayoutInternal] = useState<RoomLayout>(() => mergeLayout(initialLayout ?? {}))
  const [undoStack, setUndoStack] = useState<RoomLayout[]>([])
  const [redoStack, setRedoStack] = useState<RoomLayout[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<EditorTool>('move')
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  const savedLayoutRef = useRef<RoomLayout>(layout)

  const pushUndo = useCallback(() => {
    setUndoStack(prev => [...prev, structuredClone(layout)])
    setRedoStack([])
    setIsDirty(true)
  }, [layout])

  const updateLayout = useCallback((updater: (prev: RoomLayout) => RoomLayout) => {
    pushUndo()
    setLayoutInternal(prev => updater(prev))
  }, [pushUndo])

  const moveLayer = useCallback((layer: string, offset: [number, number]) => {
    if (!isMovable(layer)) return
    const clamped = clampOffset(offset, layer)
    updateLayout(prev => {
      if (layer === 'lion') {
        return { ...prev, lionPosition: clamped }
      }
      return {
        ...prev,
        furnitureOffsets: { ...prev.furnitureOffsets, [layer]: clamped },
      }
    })
  }, [updateLayout])

  const flipLayer = useCallback((layer: string) => {
    updateLayout(prev => ({
      ...prev,
      furnitureFlips: {
        ...prev.furnitureFlips,
        [layer]: !prev.furnitureFlips[layer],
      },
    }))
  }, [updateLayout])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Scale a layer (furniture or lion) by a given factor (0.25 to 3.0)
  const scaleLayer = useCallback((layer: string, scale: number) => {
    if (!isResizable(layer)) return
    const clamped = clampScale(scale)
    updateLayout(prev => {
      if (layer === 'lion') {
        return { ...prev, lionScale: clamped }
      }
      return {
        ...prev,
        furnitureScales: { ...prev.furnitureScales, [layer]: clamped },
      }
    })
  }, [updateLayout])
  // --- END AI-MODIFIED ---

  const reorderLayers = useCallback((newOrder: string[]) => {
    updateLayout(prev => ({ ...prev, layerOrder: newOrder }))
  }, [updateLayout])

  const reorderEquipment = useCallback((newOrder: string[]) => {
    updateLayout(prev => ({ ...prev, equipmentOrder: newOrder }))
  }, [updateLayout])

  const undo = useCallback(() => {
    if (undoStack.length === 0) return
    setRedoStack(prev => [...prev, structuredClone(layout)])
    const previous = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    setLayoutInternal(previous)
    setIsDirty(true)
  }, [undoStack, layout])

  const redo = useCallback(() => {
    if (redoStack.length === 0) return
    setUndoStack(prev => [...prev, structuredClone(layout)])
    const next = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))
    setLayoutInternal(next)
    setIsDirty(true)
  }, [redoStack, layout])

  const resetLayout = useCallback(() => {
    pushUndo()
    setLayoutInternal({ ...DEFAULT_LAYOUT })
  }, [pushUndo])

  const saveLayout = useCallback(async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/pet/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout }),
      })
      if (!res.ok) throw new Error('Save failed')
      savedLayoutRef.current = structuredClone(layout)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }, [layout])

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => {
      if (prev.some(c => c.slot === item.slot && c.assetPath === item.assetPath)) return prev
      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const zoomIn = useCallback(() => setZoom(z => Math.min(4, z + 0.5)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(0.5, z - 0.5)), [])
  const resetZoom = useCallback(() => setZoom(1), [])

  return {
    layout,
    isDirty,
    isSaving,
    selectedLayer,
    setSelectedLayer,
    activeTool,
    setActiveTool,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    showGrid,
    setShowGrid,
    showLayers,
    setShowLayers,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    undoCount: undoStack.length,
    redoCount: redoStack.length,

    moveLayer,
    flipLayer,
    scaleLayer,
    reorderLayers,
    reorderEquipment,
    undo,
    redo,
    resetLayout,
    saveLayout,
    updateLayout,
  }
}

export type { EditorTool, CartItem, RoomEditorState }
