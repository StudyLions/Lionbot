// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Single CTA button. One primary variant (solid blue) and
//          a quiet secondary used only when a second link genuinely
//          adds value. No gradients, no glow -- the lift comes from
//          weight, contrast, and confident sizing.
// ============================================================
import * as React from "react"
import { Button as REButton } from "@react-email/components"
import { brand } from "../../utils/email/brand"

type Variant = "primary" | "secondary"

interface EmailButtonProps {
  href: string
  variant?: Variant
  children: React.ReactNode
}

export function Button({
  href,
  variant = "primary",
  children,
}: EmailButtonProps) {
  return (
    <REButton
      href={href}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
      }}
    >
      {children}
    </REButton>
  )
}

const baseStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "12px 22px",
  borderRadius: "10px",
  fontSize: "14.5px",
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: brand.fontStack,
  letterSpacing: "0.005em",
  lineHeight: "1.2",
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: brand.colors.primary,
    color: "#FFFFFF",
    border: `1px solid ${brand.colors.primary}`,
  },
  secondary: {
    backgroundColor: "transparent",
    color: brand.colors.text,
    border: `1px solid ${brand.colors.border}`,
  },
}

export default Button
