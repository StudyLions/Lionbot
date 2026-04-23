// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Smart snap alignment guides for the room editor -
//          calculates Figma-style snap lines when dragging items
// ============================================================

import { useCallback } from 'react'
import { ROOM_LAYERS, CANVAS_SIZE, FURNITURE_CONTENT_BOUNDS, type RoomLayout } from '@/utils/roomConstraints'

const SNAP_THRESHOLD = 5 // pixels in 200x200 space

interface SnapGuide {
  type: 'vertical' | 'horizontal'
  position: number  // x or y in canvas coordinates
  from: number      // start of the guide line
  to: number        // end of the guide line
  color: string     // guide color
}

interface SnapResult {
  snappedX: number
  snappedY: number
  guides: SnapGuide[]
}

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Re-use FURNITURE_CONTENT_BOUNDS from roomConstraints so snap and
//          clamp share a single source of truth. Lion content is its full sprite.
const ITEM_CONTENT_BOUNDS: Record<string, { x: number; y: number; w: number; h: number }> = {
  ...FURNITURE_CONTENT_BOUNDS,
  lion: { x: 0, y: 0, w: 80, h: 80 },
}
// --- END AI-MODIFIED ---

function getItemBounds(layer: string, offset: [number, number]): { cx: number; cy: number; left: number; right: number; top: number; bottom: number } | null {
  const bounds = ITEM_CONTENT_BOUNDS[layer]
  if (!bounds) return null
  const left = bounds.x + offset[0]
  const top = bounds.y + offset[1]
  return {
    cx: left + bounds.w / 2,
    cy: top + bounds.h / 2,
    left,
    right: left + bounds.w,
    top,
    bottom: top + bounds.h,
  }
}

export function useSmartSnap(layout: RoomLayout, enabled: boolean) {
  const getSnapResult = useCallback((
    dragLayer: string,
    proposedOffset: [number, number]
  ): SnapResult => {
    if (!enabled) {
      return { snappedX: proposedOffset[0], snappedY: proposedOffset[1], guides: [] }
    }

    const guides: SnapGuide[] = []
    let snappedX = proposedOffset[0]
    let snappedY = proposedOffset[1]

    const dragBounds = getItemBounds(dragLayer, proposedOffset)
    if (!dragBounds) {
      return { snappedX, snappedY, guides: [] }
    }

    const otherBounds: { layer: string; bounds: NonNullable<ReturnType<typeof getItemBounds>> }[] = []
    for (const layer of [...ROOM_LAYERS, 'lion'] as string[]) {
      if (layer === dragLayer) continue
      if (layer === 'wall' || layer === 'floor') continue
      const offset = layer === 'lion'
        ? layout.lionPosition
        : (layout.furnitureOffsets[layer] ?? [0, 0])
      const bounds = getItemBounds(layer, offset as [number, number])
      if (bounds) otherBounds.push({ layer, bounds })
    }

    const canvasCenter = CANVAS_SIZE / 2
    otherBounds.push({
      layer: 'canvas-center',
      bounds: { cx: canvasCenter, cy: canvasCenter, left: canvasCenter, right: canvasCenter, top: canvasCenter, bottom: canvasCenter }
    })

    // Check vertical alignment (x-axis)
    let bestDx = SNAP_THRESHOLD + 1
    for (const other of otherBounds) {
      const dxCenter = Math.abs(dragBounds.cx - other.bounds.cx)
      if (dxCenter < bestDx) {
        bestDx = dxCenter
        snappedX = proposedOffset[0] + (other.bounds.cx - dragBounds.cx)
        guides.push({
          type: 'vertical',
          position: other.bounds.cx,
          from: Math.min(dragBounds.top, other.bounds.top),
          to: Math.max(dragBounds.bottom, other.bounds.bottom),
          color: '#4080f0',
        })
      }
      const dxLeft = Math.abs(dragBounds.left - other.bounds.left)
      if (dxLeft < bestDx) {
        bestDx = dxLeft
        snappedX = proposedOffset[0] + (other.bounds.left - dragBounds.left)
        guides.push({
          type: 'vertical',
          position: other.bounds.left,
          from: Math.min(dragBounds.top, other.bounds.top),
          to: Math.max(dragBounds.bottom, other.bounds.bottom),
          color: '#40d870',
        })
      }
      const dxRight = Math.abs(dragBounds.right - other.bounds.right)
      if (dxRight < bestDx) {
        bestDx = dxRight
        snappedX = proposedOffset[0] + (other.bounds.right - dragBounds.right)
        guides.push({
          type: 'vertical',
          position: other.bounds.right,
          from: Math.min(dragBounds.top, other.bounds.top),
          to: Math.max(dragBounds.bottom, other.bounds.bottom),
          color: '#40d870',
        })
      }
    }

    // Check horizontal alignment (y-axis)
    let bestDy = SNAP_THRESHOLD + 1
    for (const other of otherBounds) {
      const dyCenter = Math.abs(dragBounds.cy - other.bounds.cy)
      if (dyCenter < bestDy) {
        bestDy = dyCenter
        snappedY = proposedOffset[1] + (other.bounds.cy - dragBounds.cy)
        guides.push({
          type: 'horizontal',
          position: other.bounds.cy,
          from: Math.min(dragBounds.left, other.bounds.left),
          to: Math.max(dragBounds.right, other.bounds.right),
          color: '#4080f0',
        })
      }
      const dyTop = Math.abs(dragBounds.top - other.bounds.top)
      if (dyTop < bestDy) {
        bestDy = dyTop
        snappedY = proposedOffset[1] + (other.bounds.top - dragBounds.top)
        guides.push({
          type: 'horizontal',
          position: other.bounds.top,
          from: Math.min(dragBounds.left, other.bounds.left),
          to: Math.max(dragBounds.right, other.bounds.right),
          color: '#40d870',
        })
      }
      const dyBottom = Math.abs(dragBounds.bottom - other.bounds.bottom)
      if (dyBottom < bestDy) {
        bestDy = dyBottom
        snappedY = proposedOffset[1] + (other.bounds.bottom - dragBounds.bottom)
        guides.push({
          type: 'horizontal',
          position: other.bounds.bottom,
          from: Math.min(dragBounds.left, other.bounds.left),
          to: Math.max(dragBounds.right, other.bounds.right),
          color: '#40d870',
        })
      }
    }

    const finalGuides = guides.filter((g) => {
      if (g.type === 'vertical') return bestDx <= SNAP_THRESHOLD
      return bestDy <= SNAP_THRESHOLD
    })

    return { snappedX, snappedY, guides: finalGuides }
  }, [layout, enabled])

  return { getSnapResult }
}

export type { SnapGuide, SnapResult }
