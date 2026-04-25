// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Plain numbered step row. No box, no chip, no accent
//          rotation -- just a quiet number on the left, the heading
//          and copy on the right, and one understated link. Reads
//          like a real onboarding note instead of a UI mockup.
// ============================================================
import * as React from "react"
import { brand } from "../../utils/email/brand"

interface StepProps {
  number: number
  title: string
  body: string
  ctaLabel?: string
  ctaHref?: string
}

export function Step({
  number,
  title,
  body,
  ctaLabel,
  ctaHref,
}: StepProps) {
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
            <span style={numberStyle}>{String(number).padStart(2, "0")}</span>
          </td>
          <td style={bodyCell}>
            <div style={titleStyle}>{title}</div>
            <div style={bodyStyle}>{body}</div>
            {ctaLabel && ctaHref ? (
              <a href={ctaHref} style={linkStyle}>
                {ctaLabel}
              </a>
            ) : null}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

const stepTable: React.CSSProperties = {
  margin: "18px 0",
  borderCollapse: "separate",
  borderSpacing: 0,
  width: "100%",
}

const numberCell: React.CSSProperties = {
  width: "44px",
  verticalAlign: "top",
  paddingTop: "1px",
}

const numberStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "13px",
  fontWeight: 700,
  color: brand.colors.textMuted,
  letterSpacing: "0.04em",
  fontFamily: brand.fontStack,
}

const bodyCell: React.CSSProperties = {
  verticalAlign: "top",
}

const titleStyle: React.CSSProperties = {
  fontSize: "15.5px",
  fontWeight: 600,
  color: brand.colors.headline,
  marginBottom: "4px",
  fontFamily: brand.fontStack,
  letterSpacing: "-0.005em",
}

const bodyStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: brand.colors.text,
  marginBottom: "8px",
  fontFamily: brand.fontStack,
}

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "13.5px",
  fontWeight: 600,
  color: brand.colors.primary,
  textDecoration: "none",
  borderBottom: `1px solid ${brand.colors.primary}`,
  paddingBottom: "1px",
  fontFamily: brand.fontStack,
}

export default Step
