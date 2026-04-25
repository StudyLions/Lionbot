// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-25
// Purpose: Quiet metric primitives for the weekly digest.
//          - <BigStat> a single, generous number opening the email.
//          - <StatGrid> a 4-up row of small metrics rendered as plain
//            type, no card chrome.
//          The whole digest uses one accent color (blue), with the
//          delta line picking up green/red only when there is real
//          movement to report.
// ============================================================
import * as React from "react"
import { Text } from "@react-email/components"
import { brand } from "../../utils/email/brand"

interface BigStatProps {
  label: string
  value: string
  unit?: string
  delta?: { direction: "up" | "down" | "flat"; text: string }
}

export function BigStat({ label, value, unit, delta }: BigStatProps) {
  const deltaColor =
    delta?.direction === "up"
      ? brand.colors.success
      : delta?.direction === "down"
      ? brand.colors.danger
      : brand.colors.textMuted

  return (
    <div style={bigWrap}>
      <Text style={bigLabel}>{label}</Text>
      <Text style={bigValue}>
        <span>{value}</span>
        {unit ? <span style={bigUnit}>{` ${unit}`}</span> : null}
      </Text>
      {delta ? (
        <Text style={{ ...bigDelta, color: deltaColor }}>{delta.text}</Text>
      ) : null}
    </div>
  )
}

interface StatItem {
  label: string
  value: string | number
  unit?: string
}

// 2-up grid (renders as a single 2-column table on every email client).
// Two rows of two stats each -- four small metrics laid out as plain
// type. No backgrounds, no border accents, no rotating colors.
export function StatGrid({ items }: { items: StatItem[] }) {
  const rows: StatItem[][] = []
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2))
  }
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={gridTable}
    >
      <tbody>
        {rows.map((row, rIdx) => (
          <tr key={rIdx}>
            {row.map((item, cIdx) => (
              <td
                key={cIdx}
                style={{
                  ...gridCell,
                  paddingRight: cIdx === 0 ? "16px" : 0,
                  paddingLeft: cIdx === 1 ? "16px" : 0,
                  borderTop:
                    rIdx > 0 ? `1px solid ${brand.colors.border}` : "none",
                  paddingTop: rIdx === 0 ? "12px" : "16px",
                  paddingBottom: "16px",
                }}
              >
                <Text style={gridLabel}>{item.label}</Text>
                <Text style={gridValue}>
                  <span>{item.value}</span>
                  {item.unit ? <span style={gridUnit}>{` ${item.unit}`}</span> : null}
                </Text>
              </td>
            ))}
            {row.length === 1 ? <td style={{ width: "50%" }} /> : null}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const bigWrap: React.CSSProperties = {
  margin: "8px 0 4px",
  fontFamily: brand.fontStack,
}

const bigLabel: React.CSSProperties = {
  margin: 0,
  fontSize: "12.5px",
  fontWeight: 600,
  color: brand.colors.textMuted,
  letterSpacing: "0.02em",
  fontFamily: brand.fontStack,
}

const bigValue: React.CSSProperties = {
  margin: "4px 0 2px",
  fontSize: "44px",
  fontWeight: 700,
  lineHeight: "1.05",
  color: brand.colors.headline,
  letterSpacing: "-0.025em",
  fontFamily: brand.fontStack,
}

const bigUnit: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  color: brand.colors.textMuted,
  marginLeft: "2px",
}

const bigDelta: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "13px",
  fontWeight: 600,
  fontFamily: brand.fontStack,
}

const gridTable: React.CSSProperties = {
  margin: "16px 0 4px",
  borderTop: `1px solid ${brand.colors.border}`,
  borderBottom: `1px solid ${brand.colors.border}`,
  borderCollapse: "collapse",
}

const gridCell: React.CSSProperties = {
  verticalAlign: "top",
  width: "50%",
}

const gridLabel: React.CSSProperties = {
  margin: 0,
  fontSize: "11.5px",
  fontWeight: 600,
  color: brand.colors.textMuted,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  fontFamily: brand.fontStack,
}

const gridValue: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: "20px",
  fontWeight: 700,
  color: brand.colors.headline,
  letterSpacing: "-0.01em",
  fontFamily: brand.fontStack,
  lineHeight: "1.2",
}

const gridUnit: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 500,
  color: brand.colors.textMuted,
  marginLeft: "2px",
}
