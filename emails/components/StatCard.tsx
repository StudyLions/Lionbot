// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: A small "metric" card used in the weekly digest. Two
//          flavours: <StatCard> (single big number with label and
//          optional delta) and <StatRow> (a 2-column grid of cards
//          built with table layout for Outlook compatibility).
// ============================================================
import * as React from "react"
import { Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: { direction: "up" | "down" | "flat"; text: string }
  accent?: "primary" | "warm" | "success"
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  accent = "primary",
}: StatCardProps) {
  const accentColor =
    accent === "warm"
      ? brand.colors.warmAccent
      : accent === "success"
      ? brand.colors.success
      : brand.colors.primary

  return (
    <div style={{ ...cardStyle, borderTopColor: accentColor }}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>
        <span style={{ color: accentColor }}>{value}</span>
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
          {delta.direction === "up" ? "▲" : delta.direction === "down" ? "▼" : "•"}{" "}
          {delta.text}
        </Text>
      ) : null}
    </div>
  )
}

// Tables are the most reliable way to get side-by-side cards in email
// (flex/grid have spotty support, especially in Outlook).
export function StatRow({ children }: { children: React.ReactNode[] }) {
  const cells = React.Children.toArray(children)
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ borderCollapse: "separate", borderSpacing: "8px 0", margin: "0 -8px" }}
    >
      <tbody>
        <tr>
          {cells.map((c, i) => (
            <td key={i} style={{ verticalAlign: "top", width: `${100 / cells.length}%` }}>
              {c}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: brand.colors.surfaceMuted,
  borderRadius: "12px",
  padding: "14px 14px 12px",
  borderTop: "3px solid",
  marginBottom: "8px",
}

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: brand.colors.textMuted,
}

const valueStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: "1.2",
  color: brand.colors.headline,
}

const unitStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: brand.colors.textMuted,
}

const deltaStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "12px",
  fontWeight: 600,
}
