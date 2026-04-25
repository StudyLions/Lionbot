// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Branded CTA button. Variants: primary (blue, default),
//          secondary (outlined glass), and premium (pink-violet-amber
//          gradient that mirrors the homepage "View Premium" CTA).
//
//          Email clients are inconsistent about background-image on
//          buttons; we use solid background + border for the primary
//          variant and only opt into a gradient on the dedicated
//          premium variant where the visual payoff is worth it.
// ============================================================
import * as React from "react"
import { Button as REButton } from "@react-email/components"
import { brand } from "../../utils/email/brand"

type Variant = "primary" | "secondary" | "premium"

interface EmailButtonProps {
  href: string
  variant?: Variant
  children: React.ReactNode
  fullWidth?: boolean
}

export function Button({
  href,
  variant = "primary",
  children,
  fullWidth = false,
}: EmailButtonProps) {
  const styles = variantStyles[variant]
  return (
    <REButton
      href={href}
      style={{
        ...baseStyle,
        ...styles,
        width: fullWidth ? "100%" : undefined,
        textAlign: "center",
      }}
    >
      {children}
    </REButton>
  )
}

const baseStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "14px 26px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: 700,
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
    boxShadow: "0 12px 28px -12px rgba(59,130,246,0.6)",
  },
  secondary: {
    backgroundColor: "transparent",
    color: brand.colors.headline,
    border: `1px solid ${brand.colors.borderStrong}`,
  },
  premium: {
    backgroundImage: brand.gradients.premium,
    backgroundColor: brand.colors.violet,
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 14px 32px -14px rgba(244,114,182,0.55)",
  },
}

export default Button
