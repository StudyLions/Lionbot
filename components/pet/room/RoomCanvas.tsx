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
} from 'react'
import {
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
const FIXED_DISPLAY = CANVAS_SIZE * DISPLAY_SCALE
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
  onLayerMouseDown?: (layer: string, x: number, y: number) => void
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
    ctx.strokeRect(lx - 0.5, ly - 0.5, LION_DISPLAY_SIZE + 1, LION_DISPLAY_SIZE + 1)
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
  onLayerMouseDown,
  onLayerHover,
  className,
}: RoomCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const lionOffscreenRef = useRef<HTMLCanvasElement | null>(null)
  const highlightRef = useRef<HTMLCanvasElement | null>(null)
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>())
  const alphaCacheRef = useRef(new Map<string, Uint8ClampedArray>())
  const frameRef = useRef(0)
  const rafIdRef = useRef(0)

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Store frequently-changing props in refs so the animation loop
  //          never needs to restart. renderScene reads from refs, not closure vars.
  const layoutRef = useRef(layout)
  const selectedRef = useRef(selectedLayer)
  const hoveredRef = useRef(hoveredLayer)
  const equipRef = useRef(equipment)

  layoutRef.current = layout
  selectedRef.current = selectedLayer
  hoveredRef.current = hoveredLayer
  equipRef.current = equipment
  // --- END AI-MODIFIED ---

  const [imagesReady, setImagesReady] = useState(false)

  const imageUrls = useMemo(() => {
    const urls: Record<string, string> = {}

    for (const layer of ROOM_LAYERS) {
      if (furniture[layer]) {
        urls[`room_${layer}`] = petAssetUrl(furniture[layer])
      }
    }

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

  useEffect(() => {
    let active = true
    const cache = new Map<string, HTMLImageElement>()
    imageCacheRef.current = cache
    alphaCacheRef.current = new Map()
    setImagesReady(false)

    const entries = Object.entries(imageUrls)
    if (entries.length === 0) {
      setImagesReady(true)
      return
    }

    let remaining = entries.length
    for (const [key, url] of entries) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      const done = () => {
        if (!active) return
        remaining--
        if (remaining <= 0) setImagesReady(true)
      }
      img.onload = () => {
        if (!active) return
        cache.set(key, img)
        done()
      }
      img.onerror = done
      img.src = url
    }

    return () => { active = false }
  }, [imageUrls])

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

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Single stable animation loop that reads ALL data from refs.
  //          Never restarts -- depends only on [animated, imagesReady].
  useEffect(() => {
    const canvas = canvasRef.current
    const offscreen = offscreenRef.current
    const lionOffscreen = lionOffscreenRef.current
    const hl = highlightRef.current
    if (!canvas || !offscreen || !lionOffscreen || !hl) return
    if (!imagesReady) return

    const ctx = canvas.getContext('2d')
    const osCtx = offscreen.getContext('2d')
    const lionCtx = lionOffscreen.getContext('2d')
    if (!ctx || !osCtx || !lionCtx) return

    let lastFrameTime = 0
    let running = true

    const paint = (ts: number) => {
      if (!running) return

      if (animated && ts - lastFrameTime >= FRAME_INTERVAL_MS) {
        frameRef.current = (frameRef.current + 1) % FRAME_COUNT
        lastFrameTime = ts
      }

      const cache = imageCacheRef.current
      const frame = frameRef.current
      const curLayout = layoutRef.current
      const curSelected = selectedRef.current
      const curHovered = hoveredRef.current
      const curEquip = equipRef.current

      osCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      for (const layer of ROOM_LAYERS) {
        const img = cache.get(`room_${layer}`)
        if (!img) continue
        const offset: [number, number] = curLayout.furnitureOffsets[layer] ?? [0, 0]
        const flip = curLayout.furnitureFlips[layer] ?? false
        drawLayer(osCtx, img, offset, flip)
      }

      const backEquip = curEquip['back']
      if (backEquip) {
        const backImg = cache.get('equip_back')
        if (backImg) {
          const [lx, ly] = curLayout.lionPosition
          osCtx.drawImage(backImg, 0, 0, backImg.naturalWidth, backImg.naturalHeight, lx, ly, LION_DISPLAY_SIZE, LION_DISPLAY_SIZE)
        }
      }

      lionCtx.clearRect(0, 0, LION_SPRITE_SIZE, LION_SPRITE_SIZE)
      for (const part of LION_PARTS) {
        const img = cache.get(`lion_${part}_${frame}`)
        if (img) lionCtx.drawImage(img, 0, 0)
      }
      const exprImg = cache.get(`lion_expr_${frame}`)
      if (exprImg) lionCtx.drawImage(exprImg, 0, 0)

      for (const slot of curLayout.equipmentOrder) {
        if (slot === 'back') continue
        const img = cache.get(`equip_${slot}`)
        if (img) lionCtx.drawImage(img, 0, 0)
      }

      const [lionX, lionY] = curLayout.lionPosition
      osCtx.drawImage(lionOffscreen, 0, 0, LION_SPRITE_SIZE, LION_SPRITE_SIZE, lionX, lionY, LION_DISPLAY_SIZE, LION_DISPLAY_SIZE)

      if (curHovered && curHovered !== curSelected) {
        drawHighlight(osCtx, hl, cache, curLayout, curHovered, 'rgba(147,197,253,0.2)')
      }
      if (curSelected) {
        drawHighlight(osCtx, hl, cache, curLayout, curSelected, 'rgba(96,165,250,0.35)')
      }

      ctx.clearRect(0, 0, FIXED_DISPLAY, FIXED_DISPLAY)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(offscreen, 0, 0, FIXED_DISPLAY, FIXED_DISPLAY)

      if (animated) {
        rafIdRef.current = requestAnimationFrame(paint)
      }
    }

    if (animated) {
      rafIdRef.current = requestAnimationFrame(paint)
    } else {
      frameRef.current = 0
      paint(0)
    }

    return () => {
      running = false
      cancelAnimationFrame(rafIdRef.current)
    }
  }, [animated, imagesReady])
  // --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: hitTest reads layout from ref so it doesn't invalidate on every layout change
  const hitTest = useCallback(
    (mx: number, my: number): string | null => {
      const curLayout = layoutRef.current
      const [lx, ly] = curLayout.lionPosition
      if (mx >= lx && mx < lx + LION_DISPLAY_SIZE && my >= ly && my < ly + LION_DISPLAY_SIZE) {
        return 'lion'
      }
      for (let i = ROOM_LAYERS.length - 1; i >= 0; i--) {
        const layer = ROOM_LAYERS[i]
        if (!imageCacheRef.current.has(`room_${layer}`)) continue
        const offset = curLayout.furnitureOffsets[layer] ?? [0, 0]
        const flip = curLayout.furnitureFlips[layer] ?? false
        let px = Math.floor(mx - offset[0])
        let py = Math.floor(my - offset[1])
        if (flip) px = CANVAS_SIZE - 1 - px
        if (getAlphaAt(`room_${layer}`, px, py) > 0) return layer
      }
      return null
    },
    [getAlphaAt],
  )
  // --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Throttle hit-testing to max once per animation frame
  const hoverRafRef = useRef(0)
  const lastHoverRef = useRef<string | null>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLayerHover) return
      const clientX = e.clientX
      const clientY = e.clientY
      if (hoverRafRef.current) return
      hoverRafRef.current = requestAnimationFrame(() => {
        hoverRafRef.current = 0
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return
        const mx = (clientX - rect.left) * (CANVAS_SIZE / rect.width)
        const my = (clientY - rect.top) * (CANVAS_SIZE / rect.height)
        const hit = hitTest(mx, my)
        if (hit !== lastHoverRef.current) {
          lastHoverRef.current = hit
          onLayerHover(hit)
        }
      })
    },
    [onLayerHover, hitTest],
  )
  // --- END AI-MODIFIED ---

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLayerClick) return
      const [mx, my] = toCanvasCoords(e)
      const hit = hitTest(mx, my)
      if (hit) onLayerClick(hit, mx, my)
    },
    [onLayerClick, hitTest, toCanvasCoords],
  )

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Separate mousedown handler for drag initiation.
  //          Drags must start on mousedown (not click) so that mouseup
  //          can cleanly end them without click re-triggering a new drag.
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLayerMouseDown) return
      const [mx, my] = toCanvasCoords(e)
      const hit = hitTest(mx, my)
      if (hit) {
        e.preventDefault()
        onLayerMouseDown(hit, mx, my)
      }
    },
    [onLayerMouseDown, hitTest, toCanvasCoords],
  )
  // --- END AI-MODIFIED ---

  const handleMouseLeave = useCallback(() => {
    lastHoverRef.current = null
    onLayerHover?.(null)
  }, [onLayerHover])

  // --- AI-MODIFIED (2026-03-16) ---
  // Purpose: Fixed 800x800 canvas, use CSS transform for zoom
  const cssScale = (size ?? FIXED_DISPLAY) / FIXED_DISPLAY

  return (
    <canvas
      ref={canvasRef}
      width={FIXED_DISPLAY}
      height={FIXED_DISPLAY}
      className={className}
      style={{
        imageRendering: 'pixelated',
        width: FIXED_DISPLAY * cssScale,
        height: FIXED_DISPLAY * cssScale,
      }}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      onClick={interactive ? handleClick : undefined}
      onMouseDown={interactive ? handleMouseDown : undefined}
    />
  )
  // --- END AI-MODIFIED ---
}
