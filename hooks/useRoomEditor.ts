// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Core state management hook for the pet room editor.
//          Manages undo/redo, layout state, dirty tracking,
//          save/load via API, and constraint validation.
// ============================================================

import { useState, useCallback, useRef } from 'react'
import { RoomLayout, DEFAULT_LAYOUT, mergeLayout, clampOffset, isMovable, clampScale, isResizable, clampEquipOffset, type RenderStep } from '@/utils/roomConstraints'

// --- AI-REPLACED (2026-03-17) ---
// Reason: Removed EditorTool type -- the new UX uses click-to-select + contextual actions
// What the new code does better: No tool switching needed; kept type for backwards compat
// --- Original code (commented out for rollback) ---
// type EditorTool = 'move' | 'select' | 'resize' | 'flip' | 'color' | 'remove' | 'zoom' | 'layers' | 'grid'
// --- End original code ---
type EditorTool = string
// --- END AI-REPLACED ---

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
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)

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

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Replace flat equipmentOrder with full renderSequence + per-slot offsets
  const setRenderSequence = useCallback((newSequence: RenderStep[]) => {
    updateLayout(prev => ({ ...prev, renderSequence: newSequence }))
  }, [updateLayout])

  const setEquipmentOffset = useCallback((slot: string, offset: [number, number]) => {
    const clamped = clampEquipOffset(offset)
    updateLayout(prev => ({
      ...prev,
      equipmentOffsets: { ...prev.equipmentOffsets, [slot]: clamped },
    }))
  }, [updateLayout])
  // --- END AI-MODIFIED ---

  // --- AI-REPLACED (2026-03-22) ---
  // Reason: Only removed offsets/flips/scales but left layer in layerOrder,
  //         so the bot still rendered the room theme default on Discord
  // What the new code does better: Also removes from layerOrder so both
  //         website and Discord stop rendering the layer
  // --- Original code (commented out for rollback) ---
  // const removeLayer = useCallback((layer: string) => {
  //   if (layer === 'lion') return
  //   updateLayout(prev => {
  //     const newOffsets = { ...prev.furnitureOffsets }
  //     const newFlips = { ...prev.furnitureFlips }
  //     const newScales = { ...prev.furnitureScales }
  //     delete newOffsets[layer]
  //     delete newFlips[layer]
  //     delete newScales[layer]
  //     return { ...prev, furnitureOffsets: newOffsets, furnitureFlips: newFlips, furnitureScales: newScales }
  //   })
  // }, [updateLayout])
  // --- End original code ---
  const removeLayer = useCallback((layer: string) => {
    if (layer === 'lion') return
    updateLayout(prev => {
      const newOffsets = { ...prev.furnitureOffsets }
      const newFlips = { ...prev.furnitureFlips }
      const newScales = { ...prev.furnitureScales }
      delete newOffsets[layer]
      delete newFlips[layer]
      delete newScales[layer]
      return {
        ...prev,
        furnitureOffsets: newOffsets,
        furnitureFlips: newFlips,
        furnitureScales: newScales,
        layerOrder: prev.layerOrder.filter(l => l !== layer),
      }
    })
  }, [updateLayout])
  // --- END AI-REPLACED ---

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

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Return boolean for success/failure so callers can show toast feedback
  const saveLayout = useCallback(async (): Promise<boolean> => {
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
      return true
    } catch {
      return false
    } finally {
      setIsSaving(false)
    }
  }, [layout])
  // --- END AI-MODIFIED ---

  const zoomIn = useCallback(() => setZoom(z => Math.min(4, z + 0.5)), [])
  const zoomOut = useCallback(() => setZoom(z => Math.max(0.5, z - 0.5)), [])
  const resetZoom = useCallback(() => setZoom(1), [])

  return {
    layout,
    isDirty,
    isSaving,
    selectedLayer,
    setSelectedLayer,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    showGrid,
    setShowGrid,
    undoCount: undoStack.length,
    redoCount: redoStack.length,

    moveLayer,
    flipLayer,
    scaleLayer,
    reorderLayers,
    removeLayer,
    setRenderSequence,
    setEquipmentOffset,
    undo,
    redo,
    resetLayout,
    saveLayout,
    updateLayout,
  }
}

export type { EditorTool, CartItem }
