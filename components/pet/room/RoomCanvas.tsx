// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: HTML5 Canvas component for rendering the LionGotchi
//          room scene with pixel-art scaling and lion animation
// ============================================================

'use client'

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
} from 'react'
import {
  getRoomLayerUrl,
  getLionSpriteUrl,
  getLionExpressionUrl,
  getItemImageUrl,
} from '@/utils/petAssets'
import {
  ROOM_LAYERS,
  CANVAS_SIZE,
  DISPLAY_SCALE,
  LION_SPRITE_SIZE,
  LION_DISPLAY_SIZE,
  type RoomLayout,
} from '@/utils/roomConstraints'

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ''
const DEFAULT_DISPLAY_SIZE = CANVAS_SIZE * DISPLAY_SCALE
const FRAME_COUNT = 4
const FRAME_INTERVAL_MS = 250
const LION_PARTS = ['body', 'head', 'hair'] as const

interface RoomCanvasProps {
  roomPrefix: string
  furniture: Record<string, string>
  layout: RoomLayout
  equipment: Record<string, { assetPath: string; category: string }>
  expression: string
  size?: number
  animated?: boolean
  interactive?: boolean
  selectedLayer?: string | null
  hoveredLayer?: string | null
  onLayerClick?: (layer: string, x: number, y: number) => void
  onLayerHover?: (layer: string | null) => void
  className?: string
}

function petAssetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  offset: [number, number],
  flip: boolean,
): void {
  ctx.save()
  if (flip) {
    ctx.translate(offset[0] + CANVAS_SIZE, offset[1])
    ctx.scale(-1, 1)
  } else {
    ctx.translate(offset[0], offset[1])
  }
  ctx.drawImage(img, 0, 0)
  ctx.restore()
}

function drawHighlight(
  ctx: CanvasRenderingContext2D,
  tmpCanvas: HTMLCanvasElement,
  cache: Map<string, HTMLImageElement>,
  layout: RoomLayout,
  layer: string | null,
  color: string,
): void {
  if (!layer) return

  if (layer === 'lion') {
    const [lx, ly] = layout.lionPosition
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(
      lx - 0.5,
      ly - 0.5,
      LION_DISPLAY_SIZE + 1,
      LION_DISPLAY_SIZE + 1,
    )
    ctx.restore()
    return
  }

  const img = cache.get(`room_${layer}`)
  if (!img) return

  const tmpCtx = tmpCanvas.getContext('2d')
  if (!tmpCtx) return

  const offset: [number, number] = layout.furnitureOffsets[layer] ?? [0, 0]
  const flip = layout.furnitureFlips[layer] ?? false

  tmpCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawLayer(tmpCtx, img, offset, flip)

  // Tint only non-transparent pixels via source-atop composite
  tmpCtx.globalCompositeOperation = 'source-atop'
  tmpCtx.fillStyle = color
  tmpCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  tmpCtx.globalCompositeOperation = 'source-over'

  ctx.drawImage(tmpCanvas, 0, 0)
}

export default function RoomCanvas({
  roomPrefix,
  furniture,
  layout,
  equipment,
  expression,
  size,
  animated = true,
  interactive = false,
  selectedLayer = null,
  hoveredLayer = null,
  onLayerClick,
  onLayerHover,
  className,
}: RoomCanvasProps) {
  const displaySize = size ?? DEFAULT_DISPLAY_SIZE

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const lionOffscreenRef = useRef<HTMLCanvasElement | null>(null)
  const highlightRef = useRef<HTMLCanvasElement | null>(null)
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>())
  const alphaCacheRef = useRef(new Map<string, Uint8ClampedArray>())
  const frameRef = useRef(0)
  const rafIdRef = useRef(0)

  const [initialLoaded, setInitialLoaded] = useState(false)
  const [, bumpRender] = useReducer((x: number) => x + 1, 0)

  // ---- Collect every image URL the scene needs ----

  const imageUrls = useMemo(() => {
    const urls: Record<string, string> = {}

    // --- AI-MODIFIED (2026-03-16) ---
    // Purpose: Load all room layers from furniture map (API now includes defaults)
    for (const layer of ROOM_LAYERS) {
      if (furniture[layer]) {
        urls[`room_${layer}`] = petAssetUrl(furniture[layer])
      }
    }
    // --- END AI-MODIFIED ---

    for (let f = 0; f < FRAME_COUNT; f++) {
      for (const part of LION_PARTS) {
        urls[`lion_${part}_${f}`] = getLionSpriteUrl(part, f)
      }
      urls[`lion_expr_${f}`] = getLionExpressionUrl(expression, f)
    }

    for (const [slot, eq] of Object.entries(equipment)) {
      const url = getItemImageUrl(eq.assetPath, eq.category)
      if (url) urls[`equip_${slot}`] = url
    }

    return urls
  }, [roomPrefix, furniture, expression, equipment])

  // ---- Load images into cache, bump render on each load ----

  useEffect(() => {
    let active = true
    const cache = new Map<string, HTMLImageElement>()
    imageCacheRef.current = cache
    alphaCacheRef.current = new Map()
    setInitialLoaded(false)

    const entries = Object.entries(imageUrls)
    if (entries.length === 0) {
      setInitialLoaded(true)
      return
    }

    let remaining = entries.length
    for (const [key, url] of entries) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (!active) return
        cache.set(key, img)
        remaining--
        bumpRender()
        if (remaining <= 0) setInitialLoaded(true)
      }
      img.onerror = () => {
        if (!active) return
        remaining--
        if (remaining <= 0) setInitialLoaded(true)
      }
      img.src = url
    }

    return () => { active = false }
  }, [imageUrls])

  // ---- Create offscreen canvases once ----

  useEffect(() => {
    const os = document.createElement('canvas')
    os.width = CANVAS_SIZE
    os.height = CANVAS_SIZE
    offscreenRef.current = os

    const lion = document.createElement('canvas')
    lion.width = LION_SPRITE_SIZE
    lion.height = LION_SPRITE_SIZE
    lionOffscreenRef.current = lion

    const hl = document.createElement('canvas')
    hl.width = CANVAS_SIZE
    hl.height = CANVAS_SIZE
    highlightRef.current = hl
  }, [])

  // ---- Core scene renderer ----

  const renderScene = useCallback(() => {
    const canvas = canvasRef.current
    const offscreen = offscreenRef.current
    const lionOffscreen = lionOffscreenRef.current
    const hl = highlightRef.current
    if (!canvas || !offscreen || !lionOffscreen || !hl) return

    const ctx = canvas.getContext('2d')
    const osCtx = offscreen.getContext('2d')
    const lionCtx = lionOffscreen.getContext('2d')
    if (!ctx || !osCtx || !lionCtx) return

    const cache = imageCacheRef.current
    const frame = frameRef.current

    // --- Room layers ---
    osCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    for (const layer of ROOM_LAYERS) {
      const img = cache.get(`room_${layer}`)
      if (!img) continue
      const offset: [number, number] = layout.furnitureOffsets[layer] ?? [0, 0]
      const flip = layout.furnitureFlips[layer] ?? false
      drawLayer(osCtx, img, offset, flip)
    }

    // --- Back equipment (behind the lion) ---
    const backEquip = equipment['back']
    if (backEquip) {
      const backImg = cache.get('equip_back')
      if (backImg) {
        const [lx, ly] = layout.lionPosition
        osCtx.drawImage(
          backImg,
          0, 0, backImg.naturalWidth, backImg.naturalHeight,
          lx, ly, LION_DISPLAY_SIZE, LION_DISPLAY_SIZE,
        )
      }
    }

    // --- Composite lion on its own 64x64 canvas ---
    lionCtx.clearRect(0, 0, LION_SPRITE_SIZE, LION_SPRITE_SIZE)

    for (const part of LION_PARTS) {
      const img = cache.get(`lion_${part}_${frame}`)
      if (img) lionCtx.drawImage(img, 0, 0)
    }

    const exprImg = cache.get(`lion_expr_${frame}`)
    if (exprImg) lionCtx.drawImage(exprImg, 0, 0)

    for (const slot of layout.equipmentOrder) {
      if (slot === 'back') continue
      const img = cache.get(`equip_${slot}`)
      if (img) lionCtx.drawImage(img, 0, 0)
    }

    // --- Draw lion composite onto room, scaled 64 -> 80 ---
    const [lionX, lionY] = layout.lionPosition
    osCtx.drawImage(
      lionOffscreen,
      0, 0, LION_SPRITE_SIZE, LION_SPRITE_SIZE,
      lionX, lionY, LION_DISPLAY_SIZE, LION_DISPLAY_SIZE,
    )

    // --- Selection / hover highlights ---
    if (hoveredLayer && hoveredLayer !== selectedLayer) {
      drawHighlight(osCtx, hl, cache, layout, hoveredLayer, 'rgba(147,197,253,0.2)')
    }
    if (selectedLayer) {
      drawHighlight(osCtx, hl, cache, layout, selectedLayer, 'rgba(96,165,250,0.35)')
    }

    // --- Scale 200x200 up to display size with nearest-neighbor ---
    ctx.clearRect(0, 0, displaySize, displaySize)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(offscreen, 0, 0, displaySize, displaySize)
  }, [layout, equipment, displaySize, selectedLayer, hoveredLayer])

  // ---- Animation loop (animated) ----

  useEffect(() => {
    if (!animated) return

    let lastTime = 0
    const tick = (ts: number) => {
      if (ts - lastTime >= FRAME_INTERVAL_MS) {
        frameRef.current = (frameRef.current + 1) % FRAME_COUNT
        lastTime = ts
      }
      renderScene()
      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [animated, renderScene])

  // ---- Static render (non-animated), re-fires on every image load ----

  useEffect(() => {
    if (animated) return
    frameRef.current = 0
    renderScene()
  }) // intentionally no deps: re-renders whenever React re-renders (driven by bumpRender)

  // ---- Alpha hit-testing (lazy per-layer computation) ----

  const getAlphaAt = useCallback(
    (key: string, px: number, py: number): number => {
      if (px < 0 || px >= CANVAS_SIZE || py < 0 || py >= CANVAS_SIZE) return 0

      const ac = alphaCacheRef.current
      let alphas = ac.get(key)

      if (!alphas) {
        const img = imageCacheRef.current.get(key)
        if (!img) return 0

        const tmp = document.createElement('canvas')
        tmp.width = CANVAS_SIZE
        tmp.height = CANVAS_SIZE
        const tmpCtx = tmp.getContext('2d')
        if (!tmpCtx) return 0

        tmpCtx.drawImage(img, 0, 0)
        const data = tmpCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data
        alphas = new Uint8ClampedArray(CANVAS_SIZE * CANVAS_SIZE)
        for (let i = 0; i < alphas.length; i++) {
          alphas[i] = data[i * 4 + 3]
        }
        ac.set(key, alphas)
      }

      return alphas[py * CANVAS_SIZE + px]
    },
    [],
  )

  const hitTest = useCallback(
    (mx: number, my: number): string | null => {
      // Lion takes priority (drawn on top)
      const [lx, ly] = layout.lionPosition
      if (
        mx >= lx && mx < lx + LION_DISPLAY_SIZE &&
        my >= ly && my < ly + LION_DISPLAY_SIZE
      ) {
        return 'lion'
      }

      // Walk room layers top-to-bottom, return first opaque hit
      for (let i = ROOM_LAYERS.length - 1; i >= 0; i--) {
        const layer = ROOM_LAYERS[i]
        if (!imageCacheRef.current.has(`room_${layer}`)) continue

        const offset = layout.furnitureOffsets[layer] ?? [0, 0]
        const flip = layout.furnitureFlips[layer] ?? false

        let px = Math.floor(mx - offset[0])
        let py = Math.floor(my - offset[1])
        if (flip) px = CANVAS_SIZE - 1 - px

        if (getAlphaAt(`room_${layer}`, px, py) > 0) return layer
      }

      return null
    },
    [layout, getAlphaAt],
  )

  // ---- Mouse coordinate conversion (CSS px -> 200x200 canvas space) ----

  const toCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): [number, number] => {
      const rect = canvasRef.current!.getBoundingClientRect()
      return [
        (e.clientX - rect.left) * (CANVAS_SIZE / rect.width),
        (e.clientY - rect.top) * (CANVAS_SIZE / rect.height),
      ]
    },
    [],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLayerHover) return
      const [mx, my] = toCanvasCoords(e)
      onLayerHover(hitTest(mx, my))
    },
    [onLayerHover, hitTest, toCanvasCoords],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLayerClick) return
      const [mx, my] = toCanvasCoords(e)
      const hit = hitTest(mx, my)
      if (hit) onLayerClick(hit, mx, my)
    },
    [onLayerClick, hitTest, toCanvasCoords],
  )

  const handleMouseLeave = useCallback(() => {
    onLayerHover?.(null)
  }, [onLayerHover])

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      onClick={interactive ? handleClick : undefined}
    />
  )
}
