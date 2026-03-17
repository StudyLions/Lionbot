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

// Lion uses ABSOLUTE position in the 200x200 canvas, not offsets.
// The sprite renders at 80x80, so max x = 200-80=120, max y = 200-80=120.
// Keep lion on the "floor" area (bottom portion of room).
export const LION_CONSTRAINTS: ConstraintZone = {
  category: 'LION',
  yRange: [75, 115],
  xRange: [0, 120],
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

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Add furnitureScales and lionScale for per-item resizing (25%-300%)
export const MIN_SCALE = 0.25
export const MAX_SCALE = 3.0
export const DEFAULT_SCALE = 1.0

export function clampScale(scale: number): number {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.round(scale * 100) / 100))
}

export function isResizable(layer: string): boolean {
  if (layer === 'lion') return true
  const c = LAYER_CONSTRAINTS[layer]
  return c ? c.movable : false
}

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Interleaved render sequence system -- equipment is drawn between
//          lion body layers instead of all on top, with per-slot position offsets
//          and full user control over layer ordering.

export interface RenderStep {
  type: 'lion' | 'equip'
  key: string
}

export const LION_LAYER_KEYS = ['body', 'head', 'expression', 'hair'] as const

export const DEFAULT_RENDER_SEQUENCE: RenderStep[] = [
  { type: 'lion', key: 'body' },
  { type: 'equip', key: 'FEET' },
  { type: 'equip', key: 'BODY' },
  { type: 'lion', key: 'head' },
  { type: 'lion', key: 'expression' },
  { type: 'equip', key: 'FACE' },
  { type: 'lion', key: 'hair' },
  { type: 'equip', key: 'HEAD' },
]

export function buildRenderSequence(
  equippedSlots: string[],
  savedSequence?: RenderStep[],
): RenderStep[] {
  const equipped = new Set(equippedSlots.map(s => s.toUpperCase()).filter(s => s !== 'BACK'))

  if (savedSequence && savedSequence.length > 0) {
    const result: RenderStep[] = []
    const placed = new Set<string>()

    for (const step of savedSequence) {
      if (step.type === 'lion') {
        result.push(step)
      } else {
        const slot = step.key.toUpperCase()
        if (equipped.has(slot)) {
          result.push({ type: 'equip', key: slot })
          placed.add(slot)
        }
      }
    }

    const lionKeys = new Set(LION_LAYER_KEYS as readonly string[])
    const hasAllLionLayers = (LION_LAYER_KEYS as readonly string[]).every(
      k => result.some(s => s.type === 'lion' && s.key === k)
    )
    if (!hasAllLionLayers) {
      for (const k of LION_LAYER_KEYS) {
        if (!result.some(s => s.type === 'lion' && s.key === k)) {
          const defaultIdx = DEFAULT_RENDER_SEQUENCE.findIndex(
            s => s.type === 'lion' && s.key === k
          )
          let insertAt = result.length
          for (let i = defaultIdx + 1; i < DEFAULT_RENDER_SEQUENCE.length; i++) {
            const after = DEFAULT_RENDER_SEQUENCE[i]
            const found = result.findIndex(
              s => s.type === after.type && s.key === after.key
            )
            if (found !== -1) { insertAt = found; break }
          }
          result.splice(insertAt, 0, { type: 'lion', key: k })
        }
      }
    }

    for (const slot of equipped) {
      if (!placed.has(slot)) {
        const defaultIdx = DEFAULT_RENDER_SEQUENCE.findIndex(
          s => s.type === 'equip' && s.key === slot
        )
        if (defaultIdx !== -1) {
          const beforeLion = DEFAULT_RENDER_SEQUENCE.slice(0, defaultIdx)
            .filter(s => s.type === 'lion').pop()
          if (beforeLion) {
            const anchorIdx = result.findIndex(
              s => s.type === 'lion' && s.key === beforeLion.key
            )
            if (anchorIdx !== -1) {
              result.splice(anchorIdx + 1, 0, { type: 'equip', key: slot })
              continue
            }
          }
        }
        result.push({ type: 'equip', key: slot })
      }
    }

    return result
  }

  return DEFAULT_RENDER_SEQUENCE.filter(
    step => step.type === 'lion' || equipped.has(step.key)
  )
}

export const EQUIP_OFFSET_RANGE = 16

export function clampEquipOffset(offset: [number, number]): [number, number] {
  return [
    Math.max(-EQUIP_OFFSET_RANGE, Math.min(EQUIP_OFFSET_RANGE, Math.round(offset[0]))),
    Math.max(-EQUIP_OFFSET_RANGE, Math.min(EQUIP_OFFSET_RANGE, Math.round(offset[1]))),
  ]
}
// --- END AI-MODIFIED ---

export interface RoomLayout {
  furnitureOffsets: Record<string, [number, number]>
  furnitureFlips: Record<string, boolean>
  furnitureScales: Record<string, number>
  lionPosition: [number, number]
  lionScale: number
  layerOrder: string[]
  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Replace flat equipmentOrder with full render sequence + per-slot offsets
  renderSequence: RenderStep[]
  equipmentOffsets: Record<string, [number, number]>
  // --- END AI-MODIFIED ---
  activeSlot: number
}

export const DEFAULT_LAYOUT: RoomLayout = {
  furnitureOffsets: {},
  furnitureFlips: {},
  furnitureScales: {},
  lionPosition: [...DEFAULT_LION_POSITION],
  lionScale: DEFAULT_SCALE,
  layerOrder: [...ROOM_LAYERS],
  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Default interleaved render sequence with empty offsets
  renderSequence: [...DEFAULT_RENDER_SEQUENCE],
  equipmentOffsets: {},
  // --- END AI-MODIFIED ---
  activeSlot: 0,
}

export function mergeLayout(saved: Partial<RoomLayout> & { equipmentOrder?: string[] }): RoomLayout {
  return {
    furnitureOffsets: saved.furnitureOffsets ?? {},
    furnitureFlips: saved.furnitureFlips ?? {},
    furnitureScales: saved.furnitureScales ?? {},
    lionPosition: saved.lionPosition ?? [...DEFAULT_LION_POSITION],
    lionScale: saved.lionScale ?? DEFAULT_SCALE,
    layerOrder: saved.layerOrder ?? [...ROOM_LAYERS],
    // --- AI-MODIFIED (2026-03-17) ---
    // Purpose: Migrate old equipmentOrder to renderSequence if present
    renderSequence: saved.renderSequence ?? [...DEFAULT_RENDER_SEQUENCE],
    equipmentOffsets: saved.equipmentOffsets ?? {},
    // --- END AI-MODIFIED ---
    activeSlot: saved.activeSlot ?? 0,
  }
}
// --- END AI-MODIFIED ---
