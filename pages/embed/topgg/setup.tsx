// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-20
// Purpose: Animated 3-step setup guide for top.gg iframe embed.
//          Steps reveal sequentially with staggered entrance animation.
// ============================================================
import { useEffect, useState } from "react"
import { GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import EmbedLayout from "@/components/embed/EmbedLayout"

interface Step {
  number: string
  emoji: string
  title: string
  description: string
  color: string
}

const STEPS: Step[] = [
  {
    number: "1",
    emoji: "\u{1F517}",
    title: "Add Leo to Your Server",
    description: "One click to invite. No complicated setup required.",
    color: "#60a5fa",
  },
  {
    number: "2",
    emoji: "\u{2699}\u{FE0F}",
    title: "Configure in Seconds",
    description: "Use /dashboard or slash commands to customize everything.",
    color: "#a78bfa",
  },
  {
    number: "3",
    emoji: "\u{1F680}",
    title: "Watch Your Server Thrive",
    description: "Members earn rewards, climb ranks, and stay engaged.",
    color: "#34d399",
  },
]

export default function TopggSetup() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])

  useEffect(() => {
    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i])
      }, 400 + i * 350)
    })
  }, [])

  return (
    <EmbedLayout title="Get Started with LionBot" height="120px">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          height: "120px",
          padding: "12px 24px",
          boxSizing: "border-box",
        }}
      >
        {STEPS.map((step, i) => {
          const visible = visibleSteps.includes(i)
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "8px",
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? "translateY(0) scale(1)"
                    : "translateY(20px) scale(0.95)",
                  transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  flex: "1 1 0",
                  minWidth: "140px",
                  maxWidth: "200px",
                }}
              >
                {/* Step circle */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `${step.color}18`,
                    border: `2px solid ${step.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {step.emoji}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: step.color,
                      marginBottom: "3px",
                    }}
                  >
                    {step.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11.5px",
                      color: "rgba(255, 255, 255, 0.5)",
                      lineHeight: 1.4,
                    }}
                  >
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector arrow */}
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    opacity: visibleSteps.includes(i + 1) ? 0.3 : 0,
                    transition: "opacity 0.5s ease",
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  ›
                </div>
              )}
            </div>
          )
        })}
      </div>
    </EmbedLayout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
})
