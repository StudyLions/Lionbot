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
  getEquipmentFrameUrl,
} from '@/utils/petAssets'
import {
  ROOM_LAYERS,
  CANVAS_SIZE,
  DISPLAY_SCALE,
  LION_SPRITE_SIZE,
  LION_DISPLAY_SIZE,
  type RoomLayout,
  type RenderStep,
  buildRenderSequence,
} from '@/utils/roomConstraints'

const BLOB_BASE = process.env.NEXT_PUBLIC_BLOB_URL || ''
const FIXED_DISPLAY = CANVAS_SIZE * DISPLAY_SCALE
const FRAME_COUNT = 4
const FRAME_INTERVAL_MS = 250

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Extended equipment type with glow tier/intensity for enhancement visuals
interface RoomCanvasProps {
  roomPrefix: string
  furniture: Record<string, string>
  layout: RoomLayout
  equipment: Record<string, { assetPath: string; category: string; glowTier?: string; glowIntensity?: number }>
  expression: string
  size?: number
  animated?: boolean
  interactive?: boolean
  selectedLayer?: string | null
  hoveredLayer?: string | null
  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: onLayerClick now passes null when clicking empty space for deselect support
  onLayerClick?: (layer: string | null, x: number, y: number) => void
  onLayerMouseDown?: (layer: string, x: number, y: number) => void
  onLayerHover?: (layer: string | null) => void
  onTouchLayerStart?: (layer: string, x: number, y: number) => void
  // --- END AI-MODIFIED ---
  className?: string
}

function petAssetUrl(path: string): string {
  return `${BLOB_BASE}/pet-assets/${path}`
}

const GLOW_CONFIG: Record<string, { color: string; baseBlur: number }> = {
  bronze: { color: 'rgba(205, 127, 50, 0.7)', baseBlur: 4 },
  silver: { color: 'rgba(192, 210, 240, 0.8)', baseBlur: 6 },
  gold: { color: 'rgba(255, 215, 0, 0.9)', baseBlur: 8 },
  diamond: { color: 'rgba(100, 200, 255, 0.9)', baseBlur: 10 },
  celestial: { color: 'rgba(200, 100, 255, 0.9)', baseBlur: 12 },
}

function applyGlow(ctx: CanvasRenderingContext2D, glowTier?: string, glowIntensity?: number): void {
  const config = glowTier ? GLOW_CONFIG[glowTier] : undefined
  if (!config) return
  const intensityScale = 1 + (glowIntensity ?? 0) * 0.5
  ctx.shadowColor = config.color
  ctx.shadowBlur = config.baseBlur * intensityScale
}

function clearGlow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-16) ---
// Purpose: Support per-layer scaling. Scale is applied around the center
//          of the 200x200 layer image so items grow/shrink from their center.
function drawLayer(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  offset: [number, number],
  flip: boolean,
  scale: number = 1,
): void {
  ctx.save()
  const cx = CANVAS_SIZE / 2
  const cy = CANVAS_SIZE / 2
  ctx.translate(offset[0] + cx, offset[1] + cy)
  if (scale !== 1) ctx.scale(scale, scale)
  if (flip) ctx.scale(-1, 1)
  ctx.translate(-cx, -cy)
  ctx.drawImage(img, 0, 0)
  ctx.restore()
}
// --- END AI-MODIFIED ---

// --- AI-MODIFIED (2026-03-17) ---
// Purpose: Better selection visuals -- corner bracket handles for selection,
//          subtle tint for hover, dashed border for selected items
function drawCornerHandles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string,
): void {
  const handleLen = Math.min(6, Math.min(w, h) / 3)
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.moveTo(x, y + handleLen)
  ctx.lineTo(x, y)
  ctx.lineTo(x + handleLen, y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + w - handleLen, y)
  ctx.lineTo(x + w, y)
  ctx.lineTo(x + w, y + handleLen)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + w, y + h - handleLen)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x + w - handleLen, y + h)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + handleLen, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + h - handleLen)
  ctx.stroke()

  ctx.restore()
}

function drawHighlight(
  ctx: CanvasRenderingContext2D,
  tmpCanvas: HTMLCanvasElement,
  cache: Map<string, HTMLImageElement>,
  layout: RoomLayout,
  layer: string | null,
  color: string,
  isSelection: boolean,
): void {
  if (!layer) return

  if (layer === 'lion') {
    const [lx, ly] = layout.lionPosition
    const ls = Math.round(LION_DISPLAY_SIZE * (layout.lionScale ?? 1))
    if (isSelection) {
      ctx.save()
      ctx.setLineDash([3, 2])
      ctx.strokeStyle = 'rgba(96,165,250,0.5)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(lx - 1, ly - 1, ls + 2, ls + 2)
      ctx.setLineDash([])
      ctx.restore()
      drawCornerHandles(ctx, lx - 1.5, ly - 1.5, ls + 3, ls + 3, '#60a5fa')
    } else {
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 0.5
      ctx.strokeRect(lx - 0.5, ly - 0.5, ls + 1, ls + 1)
      ctx.restore()
    }
    return
  }

  const img = cache.get(`room_${layer}`)
  if (!img) return

  const tmpCtx = tmpCanvas.getContext('2d')
  if (!tmpCtx) return

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Use nearest-neighbor + pass scale so highlight matches actual rendered size
  tmpCtx.imageSmoothingEnabled = false
  const offset: [number, number] = layout.furnitureOffsets[layer] ?? [0, 0]
  const flip = layout.furnitureFlips[layer] ?? false
  const scale = layout.furnitureScales?.[layer] ?? 1

  tmpCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  drawLayer(tmpCtx, img, offset, flip, scale)
  // --- END AI-MODIFIED ---

  if (isSelection) {
    const alphaData = tmpCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data
    let minX = CANVAS_SIZE, minY = CANVAS_SIZE, maxX = 0, maxY = 0
    for (let py = 0; py < CANVAS_SIZE; py++) {
      for (let px = 0; px < CANVAS_SIZE; px++) {
        if (alphaData[(py * CANVAS_SIZE + px) * 4 + 3] > 10) {
          if (px < minX) minX = px
          if (px > maxX) maxX = px
          if (py < minY) minY = py
          if (py > maxY) maxY = py
        }
      }
    }
    if (maxX > minX && maxY > minY) {
      const pad = 2
      ctx.save()
      ctx.setLineDash([3, 2])
      ctx.strokeStyle = 'rgba(96,165,250,0.5)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(minX - pad, minY - pad, maxX - minX + pad * 2, maxY - minY + pad * 2)
      ctx.setLineDash([])
      ctx.restore()
      drawCornerHandles(ctx, minX - pad - 1, minY - pad - 1, maxX - minX + (pad + 1) * 2, maxY - minY + (pad + 1) * 2, '#60a5fa')
    }
  }

  tmpCtx.globalCompositeOperation = 'source-atop'
  tmpCtx.fillStyle = color
  tmpCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  tmpCtx.globalCompositeOperation = 'source-over'
  ctx.drawImage(tmpCanvas, 0, 0)
}
// --- END AI-MODIFIED ---

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
  onTouchLayerStart,
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

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Compute render sequence from equipped slots + saved layout,
  //          and load both static and per-frame equipment image URLs
  const activeRenderSequence = useMemo(() =>
    buildRenderSequence(Object.keys(equipment), layout.renderSequence),
    [equipment, layout.renderSequence]
  )
  const renderSeqRef = useRef(activeRenderSequence)
  renderSeqRef.current = activeRenderSequence

  const imageUrls = useMemo(() => {
    const urls: Record<string, string> = {}

    for (const layer of ROOM_LAYERS) {
      if (furniture[layer]) {
        urls[`room_${layer}`] = petAssetUrl(furniture[layer])
      }
    }

    const LION_PARTS = ['body', 'head', 'hair'] as const
    for (let f = 0; f < FRAME_COUNT; f++) {
      for (const part of LION_PARTS) {
        urls[`lion_${part}_${f}`] = getLionSpriteUrl(part, f)
      }
      urls[`lion_expr_${f}`] = getLionExpressionUrl(expression, f)
    }

    for (const [slot, eq] of Object.entries(equipment)) {
      const staticUrl = getItemImageUrl(eq.assetPath, eq.category)
      if (staticUrl) urls[`equip_${slot}`] = staticUrl

      for (let f = 0; f < FRAME_COUNT; f++) {
        const frameUrl = getEquipmentFrameUrl(eq.assetPath, eq.category, f)
        if (frameUrl) urls[`equip_${slot}_${f}`] = frameUrl
      }
    }

    return urls
  }, [roomPrefix, furniture, expression, equipment])
  // --- END AI-MODIFIED ---

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

    // --- AI-MODIFIED (2026-03-20) ---
    // Purpose: Nearest-neighbor scaling on all offscreen canvases to keep pixel art crisp
    osCtx.imageSmoothingEnabled = false
    lionCtx.imageSmoothingEnabled = false
    // --- END AI-MODIFIED ---

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

      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Use layout.layerOrder for draw order so user layer reordering
      //          is respected. Falls back to ROOM_LAYERS if layerOrder is missing.
      const drawOrder = curLayout.layerOrder ?? ROOM_LAYERS as unknown as string[]
      for (const layer of drawOrder) {
        const img = cache.get(`room_${layer}`)
        if (!img) continue
        const offset: [number, number] = curLayout.furnitureOffsets[layer] ?? [0, 0]
        const flip = curLayout.furnitureFlips[layer] ?? false
        const scale = curLayout.furnitureScales?.[layer] ?? 1
        drawLayer(osCtx, img, offset, flip, scale)
      }
      // --- END AI-MODIFIED ---

      const lionScale = curLayout.lionScale ?? 1
      const scaledLionSize = Math.round(LION_DISPLAY_SIZE * lionScale)

      const backEquip = curEquip['BACK'] || curEquip['back']
      if (backEquip) {
        const backImg = cache.get('equip_BACK') || cache.get('equip_back')
        if (backImg) {
          const [lx, ly] = curLayout.lionPosition
          const backOff = curLayout.equipmentOffsets?.['BACK'] ?? [0, 0]
          const bScale = LION_SPRITE_SIZE > 0 ? scaledLionSize / LION_SPRITE_SIZE : 1
          const bx = lx + Math.round(backOff[0] * bScale)
          const by = ly + Math.round(backOff[1] * bScale)
          // --- AI-MODIFIED (2026-03-17) ---
          // Purpose: Apply glow to BACK equipment slot
          applyGlow(osCtx, backEquip.glowTier, backEquip.glowIntensity)
          osCtx.drawImage(backImg, 0, 0, backImg.naturalWidth, backImg.naturalHeight, bx, by, scaledLionSize, scaledLionSize)
          clearGlow(osCtx)
          // --- END AI-MODIFIED ---
        }
      }

      lionCtx.clearRect(0, 0, LION_SPRITE_SIZE, LION_SPRITE_SIZE)
      const curSeq = renderSeqRef.current

      for (const step of curSeq) {
        if (step.type === 'lion') {
          if (step.key === 'expression') {
            const exprImg = cache.get(`lion_expr_${frame}`)
            if (exprImg) lionCtx.drawImage(exprImg, 0, 0)
          } else {
            const img = cache.get(`lion_${step.key}_${frame}`)
            if (img) lionCtx.drawImage(img, 0, 0)
          }
        } else {
          const slot = step.key
          if (slot === 'BACK') continue
          const animImg = cache.get(`equip_${slot}_${frame}`)
          const staticImg = cache.get(`equip_${slot}`)
          const img = animImg || staticImg
          if (img) {
            const eqOff = curLayout.equipmentOffsets?.[slot] ?? [0, 0]
            // --- AI-MODIFIED (2026-03-17) ---
            // Purpose: Apply glow effect based on enhancement quality
            const eqData = curEquip[slot]
            applyGlow(lionCtx, eqData?.glowTier, eqData?.glowIntensity)
            lionCtx.drawImage(img, eqOff[0], eqOff[1])
            clearGlow(lionCtx)
            // --- END AI-MODIFIED ---
          }
        }
      }

      const [lionX, lionY] = curLayout.lionPosition
      osCtx.drawImage(lionOffscreen, 0, 0, LION_SPRITE_SIZE, LION_SPRITE_SIZE, lionX, lionY, scaledLionSize, scaledLionSize)
      // --- END AI-MODIFIED ---

      // --- AI-MODIFIED (2026-03-17) ---
      // Purpose: Pass isSelection flag for corner-handle selection vs subtle hover tint
      if (curHovered && curHovered !== curSelected) {
        drawHighlight(osCtx, hl, cache, curLayout, curHovered, 'rgba(147,197,253,0.15)', false)
      }
      if (curSelected) {
        drawHighlight(osCtx, hl, cache, curLayout, curSelected, 'rgba(96,165,250,0.25)', true)
      }
      // --- END AI-MODIFIED ---

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
      const ls = Math.round(LION_DISPLAY_SIZE * (curLayout.lionScale ?? 1))
      if (mx >= lx && mx < lx + ls && my >= ly && my < ly + ls) {
        return 'lion'
      }
      // --- AI-MODIFIED (2026-03-20) ---
      // Purpose: Use layerOrder for hit detection so clicks respect custom layer order
      const hitLayers = curLayout.layerOrder ?? ROOM_LAYERS as unknown as string[]
      for (let i = hitLayers.length - 1; i >= 0; i--) {
        const layer = hitLayers[i]
        if (!imageCacheRef.current.has(`room_${layer}`)) continue
        const offset = curLayout.furnitureOffsets[layer] ?? [0, 0]
        const flip = curLayout.furnitureFlips[layer] ?? false
        let px = Math.floor(mx - offset[0])
        let py = Math.floor(my - offset[1])
        if (flip) px = CANVAS_SIZE - 1 - px
        if (getAlphaAt(`room_${layer}`, px, py) > 0) return layer
      }
      // --- END AI-MODIFIED ---
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

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Report null hits for empty-space click-to-deselect
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onLayerClick) return
      const [mx, my] = toCanvasCoords(e)
      const hit = hitTest(mx, my)
      onLayerClick(hit, mx, my)
    },
    [onLayerClick, hitTest, toCanvasCoords],
  )
  // --- END AI-MODIFIED ---

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

  // --- AI-MODIFIED (2026-03-17) ---
  // Purpose: Touch support -- touchstart initiates drag via onTouchLayerStart
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!onTouchLayerStart && !onLayerClick) return
      const touch = e.touches[0]
      if (!touch) return
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const mx = (touch.clientX - rect.left) * (CANVAS_SIZE / rect.width)
      const my = (touch.clientY - rect.top) * (CANVAS_SIZE / rect.height)
      const hit = hitTest(mx, my)
      if (hit && onTouchLayerStart) {
        e.preventDefault()
        onTouchLayerStart(hit, mx, my)
      } else if (onLayerClick) {
        onLayerClick(hit, mx, my)
      }
    },
    [onTouchLayerStart, onLayerClick, hitTest],
  )
  // --- END AI-MODIFIED ---

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
      onTouchStart={interactive ? handleTouchStart : undefined}
    />
  )
  // --- END AI-MODIFIED ---
}
