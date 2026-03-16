// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Auto-crop item images by detecting pixel content bounds
//          and zooming into the actual item, ignoring empty canvas space
// ============================================================
import { useRef, useEffect, useState, memo } from "react"

interface CroppedItemImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  style?: React.CSSProperties
  padding?: number
}

const boundsCache = new Map<string, { x: number; y: number; w: number; h: number } | null>()

function detectContentBounds(
  imageData: ImageData,
  width: number,
  height: number,
  padding: number
): { x: number; y: number; w: number; h: number } | null {
  const { data } = imageData
  let minX = width, minY = height, maxX = -1, maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3]
      if (alpha > 10) {
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0 || maxY < 0) return null

  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(width - 1, maxX + padding)
  maxY = Math.min(height - 1, maxY + padding)

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
}

function CroppedItemImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  style,
  padding = 2,
}: CroppedItemImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!src) return
    setFailed(false)
    setLoaded(false)

    const cached = boundsCache.get(src)
    if (cached !== undefined) {
      drawCropped(src, cached)
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const tmp = document.createElement("canvas")
        tmp.width = img.width
        tmp.height = img.height
        const tmpCtx = tmp.getContext("2d")
        if (!tmpCtx) { fallback(img); return }

        tmpCtx.drawImage(img, 0, 0)
        const imageData = tmpCtx.getImageData(0, 0, img.width, img.height)
        const bounds = detectContentBounds(imageData, img.width, img.height, padding)
        boundsCache.set(src, bounds)
        drawCropped(src, bounds)
      } catch {
        boundsCache.set(src, null)
        fallback(img)
      }
    }

    img.onerror = () => { setFailed(true) }
    img.src = src

    function drawCropped(
      imgSrc: string,
      bounds: { x: number; y: number; w: number; h: number } | null
    ) {
      const drawImg = new Image()
      drawImg.crossOrigin = "anonymous"
      drawImg.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        if (!bounds) {
          canvas.width = drawImg.width
          canvas.height = drawImg.height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(drawImg, 0, 0)
        } else {
          canvas.width = bounds.w
          canvas.height = bounds.h
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(
            drawImg,
            bounds.x, bounds.y, bounds.w, bounds.h,
            0, 0, bounds.w, bounds.h
          )
        }
        setLoaded(true)
      }
      drawImg.src = imgSrc
    }

    function fallback(loadedImg: HTMLImageElement) {
      const canvas = canvasRef.current
      if (!canvas) { setFailed(true); return }
      canvas.width = loadedImg.width
      canvas.height = loadedImg.height
      const ctx = canvas.getContext("2d")
      ctx?.drawImage(loadedImg, 0, 0)
      setLoaded(true)
    }
  }, [src, padding])

  if (failed) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ imageRendering: "pixelated", ...style }}
      />
    )
  }

  return (
    <div className={containerClassName}>
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          imageRendering: "pixelated",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.15s",
          ...style,
        }}
        role="img"
        aria-label={alt}
      />
    </div>
  )
}

export default memo(CroppedItemImage)
