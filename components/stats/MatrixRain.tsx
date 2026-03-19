// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-19
// Purpose: Matrix rain canvas background with study-themed
//          falling characters at low opacity
// ============================================================
import { useEffect, useRef } from "react"

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789STUDYFOCUSLEARN"

export default function MatrixRain({ density = 30 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let columns: number[] = []
    const fontSize = 14
    const speed = 33

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const colCount = Math.floor(canvas.width / fontSize)
      columns = Array.from(
        { length: Math.min(colCount, density) },
        () => Math.random() * canvas.height
      )
    }

    resize()
    window.addEventListener("resize", resize)

    let lastTime = 0
    const draw = (time: number) => {
      if (time - lastTime < speed) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastTime = time

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "rgba(0, 255, 65, 0.06)"
      ctx.font = `${fontSize}px monospace`

      const spacing = Math.floor(canvas.width / columns.length)
      for (let i = 0; i < columns.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * spacing
        ctx.fillText(char, x, columns[i])

        if (columns[i] > canvas.height && Math.random() > 0.975) {
          columns[i] = 0
        }
        columns[i] += fontSize
      }

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [density])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  )
}
