// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Onboarding step row used by the welcome templates.
//          A pill-shaped numbered badge on the left, title +
//          description + arrow link on the right. Renders inside a
//          dark card so the steps feel like a UI list, not a blob
//          of text.
// ============================================================
import * as React from "react"
import { brand } from "../../utils/email/brand"

interface StepProps {
  number: number
  title: string
  body: string
  ctaLabel: string
  ctaHref: string
  accent?: "primary" | "amber" | "violet"
}

const accentColors = {
  primary: brand.colors.primary,
  amber: brand.colors.amber,
  violet: brand.colors.violet,
}

export function Step({
  number,
  title,
  body,
  ctaLabel,
  ctaHref,
  accent = "primary",
}: StepProps) {
  const accent_ = accentColors[accent]
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={stepTable}
    >
      <tbody>
        <tr>
          <td style={numberCell}>
            <div style={{ ...numberBadge, color: accent_ }}>{number}</div>
          </td>
          <td style={bodyCell}>
            <div style={titleStyle}>{title}</div>
            <div style={bodyStyle}>{body}</div>
            <a href={ctaHref} style={{ ...linkStyle, color: accent_ }}>
              {ctaLabel} →
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

const stepTable: React.CSSProperties = {
  margin: "10px 0",
  borderCollapse: "separate",
  borderSpacing: 0,
  background: brand.colors.surface,
  border: `1px solid ${brand.colors.border}`,
  borderRadius: "14px",
  width: "100%",
}

const numberCell: React.CSSProperties = {
  width: "62px",
  verticalAlign: "top",
  padding: "16px 0 16px 16px",
}

const numberBadge: React.CSSProperties = {
  display: "inline-block",
  width: "38px",
  height: "38px",
  lineHeight: "38px",
  textAlign: "center",
  borderRadius: "12px",
  backgroundColor: brand.colors.background,
  border: `1px solid ${brand.colors.border}`,
  fontSize: "16px",
  fontWeight: 800,
  fontFamily: brand.fontStack,
}

const bodyCell: React.CSSProperties = {
  verticalAlign: "top",
  padding: "16px 18px 16px 4px",
}

const titleStyle: React.CSSProperties = {
  fontSize: "15.5px",
  fontWeight: 700,
  color: brand.colors.headline,
  marginBottom: "4px",
  fontFamily: brand.fontStack,
  letterSpacing: "-0.005em",
}

const bodyStyle: React.CSSProperties = {
  fontSize: "13.5px",
  lineHeight: "1.55",
  color: brand.colors.text,
  marginBottom: "8px",
  fontFamily: brand.fontStack,
}

const linkStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 700,
  textDecoration: "none",
  fontFamily: brand.fontStack,
}

export default Step
