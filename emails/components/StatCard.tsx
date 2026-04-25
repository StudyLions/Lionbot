// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Metric primitives for the weekly digest.
//          - <HeroStat> a single big tile that opens the digest.
//          - <StatCard> small tile with label, value, optional delta.
//          - <StatRow> 2-up grid with table layout for Outlook safety.
// ============================================================
import * as React from "react"
import { Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

type Accent = "primary" | "amber" | "success" | "violet" | "pink"

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: { direction: "up" | "down" | "flat"; text: string }
  accent?: Accent
}

const accentColors: Record<Accent, string> = {
  primary: brand.colors.primary,
  amber: brand.colors.amber,
  success: brand.colors.success,
  violet: brand.colors.violet,
  pink: brand.colors.pink,
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  accent = "primary",
}: StatCardProps) {
  const accentColor = accentColors[accent]
  return (
    <div style={{ ...cardStyle, borderTopColor: accentColor }}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>
        <span style={{ color: brand.colors.headline }}>{value}</span>
        {unit ? <span style={unitStyle}>{` ${unit}`}</span> : null}
      </Text>
      {delta ? (
        <Text
          style={{
            ...deltaStyle,
            color:
              delta.direction === "up"
                ? brand.colors.success
                : delta.direction === "down"
                ? brand.colors.danger
                : brand.colors.textMuted,
          }}
        >
          {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "—"}{" "}
          {delta.text}
        </Text>
      ) : null}
    </div>
  )
}

interface HeroStatProps {
  label: string
  value: string
  unit?: string
  delta?: { direction: "up" | "down" | "flat"; text: string }
  caption?: string
  accent?: Accent
}

// Big opener tile for the weekly digest. Uses an inline gradient bar
// for visual punch instead of the small accent stripe used by StatCard.
export function HeroStat({
  label,
  value,
  unit,
  delta,
  caption,
  accent = "primary",
}: HeroStatProps) {
  const color = accentColors[accent]
  return (
    <div style={heroCardStyle}>
      <div
        style={{
          ...heroAccentBar,
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />
      <Text style={{ ...labelStyle, color: brand.colors.textMuted }}>
        {label}
      </Text>
      <Text style={heroValueStyle}>
        <span style={{ color: brand.colors.headline }}>{value}</span>
        {unit ? <span style={heroUnitStyle}>{` ${unit}`}</span> : null}
      </Text>
      {delta ? (
        <Text
          style={{
            ...deltaStyle,
            fontSize: "13px",
            color:
              delta.direction === "up"
                ? brand.colors.success
                : delta.direction === "down"
                ? brand.colors.danger
                : brand.colors.textMuted,
          }}
        >
          {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "—"}{" "}
          {delta.text}
        </Text>
      ) : null}
      {caption ? <Text style={captionStyle}>{caption}</Text> : null}
    </div>
  )
}

// 2-up grid using table layout (Outlook-safe).
export function StatRow({ children }: { children: React.ReactNode[] }) {
  const cells = React.Children.toArray(children)
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{
        borderCollapse: "separate",
        borderSpacing: "10px 0",
        margin: "0 -10px",
      }}
    >
      <tbody>
        <tr>
          {cells.map((c, i) => (
            <td
              key={i}
              style={{
                verticalAlign: "top",
                width: `${100 / cells.length}%`,
              }}
            >
              {c}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: brand.colors.surface,
  borderRadius: "14px",
  padding: "16px 16px 14px",
  borderTop: "3px solid",
  border: `1px solid ${brand.colors.border}`,
  borderTopWidth: "3px",
  marginBottom: "10px",
  fontFamily: brand.fontStack,
}

const heroCardStyle: React.CSSProperties = {
  backgroundColor: brand.colors.surface,
  borderRadius: "18px",
  padding: "22px 24px 20px",
  border: `1px solid ${brand.colors.border}`,
  marginBottom: "14px",
  position: "relative",
  overflow: "hidden",
  fontFamily: brand.fontStack,
}

const heroAccentBar: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "3px",
}

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: brand.colors.textMuted,
  fontFamily: brand.fontStack,
}

const valueStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "24px",
  fontWeight: 800,
  lineHeight: "1.15",
  color: brand.colors.headline,
  fontFamily: brand.fontStack,
  letterSpacing: "-0.01em",
}

const heroValueStyle: React.CSSProperties = {
  margin: "8px 0 4px",
  fontSize: "44px",
  fontWeight: 800,
  lineHeight: "1.05",
  color: brand.colors.headline,
  fontFamily: brand.fontStack,
  letterSpacing: "-0.02em",
}

const unitStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: brand.colors.textMuted,
}

const heroUnitStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: brand.colors.textMuted,
}

const deltaStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "12px",
  fontWeight: 700,
  fontFamily: brand.fontStack,
}

const captionStyle: React.CSSProperties = {
  margin: "10px 0 0",
  fontSize: "13px",
  lineHeight: "1.55",
  color: brand.colors.text,
  fontFamily: brand.fontStack,
}
