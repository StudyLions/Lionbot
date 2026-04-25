// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Branded CTA button. Variants: primary (blue, default),
//          secondary (outlined), and warm (golden accent).
// ============================================================
import * as React from "react"
import { Button as REButton } from "@react-email/components"
import { brand } from "../../utils/email/brand"

type Variant = "primary" | "secondary" | "warm"

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
  padding: "13px 24px",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  fontFamily: brand.fontStack,
  letterSpacing: "0.01em",
  lineHeight: "1.2",
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: brand.colors.primary,
    color: "#FFFFFF",
    border: `1px solid ${brand.colors.primary}`,
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    color: brand.colors.headingAccent,
    border: `1px solid ${brand.colors.border}`,
  },
  warm: {
    backgroundColor: brand.colors.warmAccent,
    color: "#1F2937",
    border: `1px solid ${brand.colors.warmAccent}`,
  },
}

export default Button
