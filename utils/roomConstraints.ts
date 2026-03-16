// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Room editor constraint system - defines valid placement
//          zones for each furniture type and the lion sprite
// ============================================================

export const ROOM_LAYERS = ['wall', 'floor', 'mat', 'table', 'chair', 'bed', 'lamp', 'picture', 'window'] as const
export type RoomLayer = typeof ROOM_LAYERS[number]

export const CANVAS_SIZE = 200
export const DISPLAY_SCALE = 4
export const DISPLAY_SIZE = CANVAS_SIZE * DISPLAY_SCALE

export const DEFAULT_LION_POSITION: [number, number] = [60, 105]
export const LION_SPRITE_SIZE = 64
export const LION_DISPLAY_SIZE = 80

export type ConstraintCategory = 'BACKGROUND' | 'FLOOR_SURFACE' | 'FLOOR_ITEMS' | 'WALL_ITEMS' | 'LION'

interface ConstraintZone {
  category: ConstraintCategory
  yRange: [number, number]
  xRange: [number, number]
  movable: boolean
  flippable: boolean
}

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Tightened constraints to prevent items from leaving the room.
//          Offsets are relative to each item's default position within the
//          200x200 canvas. Keeping ranges small ensures items stay visible.
export const LAYER_CONSTRAINTS: Record<string, ConstraintZone> = {
  wall:    { category: 'BACKGROUND',    yRange: [0, 0],     xRange: [0, 0],     movable: false, flippable: false },
  floor:   { category: 'BACKGROUND',    yRange: [0, 0],     xRange: [0, 0],     movable: false, flippable: false },
  mat:     { category: 'FLOOR_SURFACE', yRange: [-10, 15],  xRange: [-25, 25],  movable: true,  flippable: true },
  table:   { category: 'FLOOR_ITEMS',   yRange: [-15, 20],  xRange: [-30, 30],  movable: true,  flippable: true },
  chair:   { category: 'FLOOR_ITEMS',   yRange: [-15, 20],  xRange: [-30, 30],  movable: true,  flippable: true },
  bed:     { category: 'FLOOR_ITEMS',   yRange: [-15, 20],  xRange: [-30, 30],  movable: true,  flippable: true },
  lamp:    { category: 'FLOOR_ITEMS',   yRange: [-15, 20],  xRange: [-30, 30],  movable: true,  flippable: true },
  picture: { category: 'WALL_ITEMS',    yRange: [-15, 15],  xRange: [-30, 30],  movable: true,  flippable: true },
  window:  { category: 'WALL_ITEMS',    yRange: [-15, 15],  xRange: [-30, 30],  movable: true,  flippable: true },
}

export const LION_CONSTRAINTS: ConstraintZone = {
  category: 'LION',
  yRange: [-20, 15],
  xRange: [-50, 50],
  movable: true,
  flippable: true,
}
// --- END AI-MODIFIED ---

export function clampOffset(
  offset: [number, number],
  layer: string
): [number, number] {
  const constraint = layer === 'lion' ? LION_CONSTRAINTS : LAYER_CONSTRAINTS[layer]
  if (!constraint || !constraint.movable) return [0, 0]
  return [
    Math.max(constraint.xRange[0], Math.min(constraint.xRange[1], offset[0])),
    Math.max(constraint.yRange[0], Math.min(constraint.yRange[1], offset[1])),
  ]
}

export function isMovable(layer: string): boolean {
  if (layer === 'lion') return true
  return LAYER_CONSTRAINTS[layer]?.movable ?? false
}

export function isFlippable(layer: string): boolean {
  if (layer === 'lion') return true
  return LAYER_CONSTRAINTS[layer]?.flippable ?? false
}

export function getConstraintCategory(layer: string): ConstraintCategory | null {
  if (layer === 'lion') return 'LION'
  return LAYER_CONSTRAINTS[layer]?.category ?? null
}

export interface RoomLayout {
  furnitureOffsets: Record<string, [number, number]>
  furnitureFlips: Record<string, boolean>
  lionPosition: [number, number]
  layerOrder: string[]
  equipmentOrder: string[]
  activeSlot: number
}

export const DEFAULT_LAYOUT: RoomLayout = {
  furnitureOffsets: {},
  furnitureFlips: {},
  lionPosition: [...DEFAULT_LION_POSITION],
  layerOrder: [...ROOM_LAYERS],
  equipmentOrder: ['body', 'face', 'head'],
  activeSlot: 0,
}

export function mergeLayout(saved: Partial<RoomLayout>): RoomLayout {
  return {
    furnitureOffsets: saved.furnitureOffsets ?? {},
    furnitureFlips: saved.furnitureFlips ?? {},
    lionPosition: saved.lionPosition ?? [...DEFAULT_LION_POSITION],
    layerOrder: saved.layerOrder ?? [...ROOM_LAYERS],
    equipmentOrder: saved.equipmentOrder ?? ['body', 'face', 'head'],
    activeSlot: saved.activeSlot ?? 0,
  }
}
