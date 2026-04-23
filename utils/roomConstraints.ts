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

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Removed tight placement constraints. All furniture and lion
// can be placed anywhere on the canvas — users have full creative freedom.
// Wall and floor stay fixed (they're full-canvas backgrounds).
export const LAYER_CONSTRAINTS: Record<string, ConstraintZone> = {
  wall:    { category: 'BACKGROUND',    yRange: [0, 0],     xRange: [0, 0],     movable: false, flippable: false },
  floor:   { category: 'BACKGROUND',    yRange: [0, 0],     xRange: [0, 0],     movable: false, flippable: false },
  mat:     { category: 'FLOOR_SURFACE', yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
  table:   { category: 'FLOOR_ITEMS',   yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
  chair:   { category: 'FLOOR_ITEMS',   yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
  bed:     { category: 'FLOOR_ITEMS',   yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
  lamp:    { category: 'FLOOR_ITEMS',   yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
  picture: { category: 'WALL_ITEMS',    yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
  window:  { category: 'WALL_ITEMS',    yRange: [-999, 999], xRange: [-999, 999], movable: true, flippable: true },
}

export const LION_CONSTRAINTS: ConstraintZone = {
  category: 'LION',
  yRange: [-999, 999],
  xRange: [-999, 999],
  movable: true,
  flippable: true,
}

// --- AI-REPLACED (2026-04-21) ---
// Reason: clampOffset only rounded — items could be dragged completely off the
//         canvas and "disappear", forcing users to use undo to recover them.
// What the new code does better: Keeps at least ~20px of every furniture item
//         on the visible canvas, while still allowing generous off-canvas drift
//         for creative compositions. Lion has its own bounds (smaller sprite).
// --- Original code (commented out for rollback) ---
// export function clampOffset(
//   offset: [number, number],
//   _layer: string
// ): [number, number] {
//   return [Math.round(offset[0]), Math.round(offset[1])]
// }
// --- End original code ---
const LION_MAX_X = CANVAS_SIZE - 20
const LION_MAX_Y = CANVAS_SIZE - 20
const LION_MIN_X = -(LION_DISPLAY_SIZE - 20)
const LION_MIN_Y = -(LION_DISPLAY_SIZE - 20)

// --- AI-MODIFIED (2026-04-23) ---
// Purpose: Approximate opaque content bounds for each furniture sprite (in 200x200
//          image-local coordinates). Used by clampOffset so users can never drag
//          an item to a position where its visible content is fully off-canvas
//          and the item appears "transparent / lost". Keep MIN_CONTENT_VISIBLE
//          of the content rect on-canvas at all times.
//
//          Same numbers used by useSmartSnap.ITEM_CONTENT_BOUNDS — moved here so
//          both modules stay in sync. If you tweak a sprite's content bounds,
//          adjust the corresponding snap entry too.
export const FURNITURE_CONTENT_BOUNDS: Record<string, { x: number; y: number; w: number; h: number }> = {
  mat:     { x: 40, y: 140, w: 120, h: 40 },
  table:   { x: 50, y: 100, w: 100, h: 50 },
  chair:   { x: 70, y: 110, w: 60, h: 60 },
  bed:     { x: 20, y: 100, w: 80, h: 70 },
  lamp:    { x: 140, y: 60,  w: 40,  h: 120 },
  picture: { x: 50, y: 10,   w: 60,  h: 50 },
  window:  { x: 70, y: 5,    w: 60,  h: 55 },
}

const MIN_CONTENT_VISIBLE = 24
const FURNITURE_OFFSET_FALLBACK = CANVAS_SIZE - 20

export function clampOffset(
  offset: [number, number],
  layer: string
): [number, number] {
  const x = Math.round(offset[0])
  const y = Math.round(offset[1])
  if (layer === 'lion') {
    return [
      Math.max(LION_MIN_X, Math.min(LION_MAX_X, x)),
      Math.max(LION_MIN_Y, Math.min(LION_MAX_Y, y)),
    ]
  }
  const bounds = FURNITURE_CONTENT_BOUNDS[layer]
  if (bounds) {
    const minX = MIN_CONTENT_VISIBLE - bounds.x - bounds.w
    const maxX = CANVAS_SIZE - MIN_CONTENT_VISIBLE - bounds.x
    const minY = MIN_CONTENT_VISIBLE - bounds.y - bounds.h
    const maxY = CANVAS_SIZE - MIN_CONTENT_VISIBLE - bounds.y
    return [
      Math.max(minX, Math.min(maxX, x)),
      Math.max(minY, Math.min(maxY, y)),
    ]
  }
  const min = -FURNITURE_OFFSET_FALLBACK
  const max = FURNITURE_OFFSET_FALLBACK
  return [
    Math.max(min, Math.min(max, x)),
    Math.max(min, Math.min(max, y)),
  ]
}
// --- END AI-MODIFIED ---
// --- END AI-REPLACED ---
// --- END AI-MODIFIED ---

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

    for (const slot of Array.from(equipped)) {
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

// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Expanded equipment offset range for full positioning freedom
export const EQUIP_OFFSET_RANGE = 64

export function clampEquipOffset(offset: [number, number]): [number, number] {
  return [Math.round(offset[0]), Math.round(offset[1])]
}
// --- END AI-MODIFIED ---
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

// --- AI-MODIFIED (2026-04-21) ---
// Purpose: Compute the "effective" draw order that includes any furniture keys
//          missing from layoutOrder, inserted at their default ROOM_LAYERS
//          position. This guarantees that newly equipped or previewed items
//          render immediately even if the saved layoutOrder hasn't caught up
//          (which previously caused the "click twice to see it" bug).
export function buildEffectiveLayerOrder(
  baseOrder: string[],
  furnitureKeys: string[],
): string[] {
  const order = [...baseOrder]
  const seen = new Set(order)
  const ROOM_LAYERS_ARR = ROOM_LAYERS as unknown as string[]
  for (const key of furnitureKeys) {
    if (seen.has(key)) continue
    const defaultIdx = ROOM_LAYERS_ARR.indexOf(key)
    if (defaultIdx === -1) {
      order.push(key)
    } else {
      let insertAt = order.length
      for (let i = defaultIdx + 1; i < ROOM_LAYERS_ARR.length; i++) {
        const pos = order.indexOf(ROOM_LAYERS_ARR[i])
        if (pos !== -1) { insertAt = pos; break }
      }
      order.splice(insertAt, 0, key)
    }
    seen.add(key)
  }
  return order
}
// --- END AI-MODIFIED ---

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
