// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-15
// Purpose: Scroll success rate curve chart (extracted for SSR-safe
//          dynamic import since Recharts requires browser DOM)
// ============================================================
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
// --- AI-MODIFIED (2026-03-22) ---
// Purpose: Import calcLevelPenalty; fix formula from linear subtraction to diminishing-returns curve
import { calcLevelPenalty } from "@/utils/gameConstants"
// --- END AI-MODIFIED ---

interface Props {
  scrollProps: { success_rate: number; destroy_rate: number }
  gameConstants: any
}

export default function SuccessCurveChart({ scrollProps, gameConstants }: Props) {
  // --- AI-REPLACED (2026-03-22) ---
  // Reason: Old formula used wrong linear subtraction and didn't match actual enhancement logic
  // What the new code does better: Uses same diminishing-returns calcLevelPenalty as the actual API
  // --- Original code (commented out for rollback) ---
  // const penalty = gameConstants?.LEVEL_PENALTY_FACTOR ?? 0.08
  // const maxLvl = 20
  // const data = []
  // for (let lvl = 0; lvl <= maxLvl; lvl++) {
  //   const success = Math.max(0, scrollProps.success_rate * 100 - lvl * penalty * 100)
  //   data.push({ level: lvl, success: Math.round(success * 10) / 10 })
  // }
  // --- End original code ---
  const maxLvl = 20
  const data = []
  for (let lvl = 0; lvl <= maxLvl; lvl++) {
    const success = scrollProps.success_rate * calcLevelPenalty(lvl) * 100
    data.push({ level: lvl, success: Math.round(success * 10) / 10 })
  }
  // --- END AI-REPLACED ---

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2a3c" />
        <XAxis dataKey="level" tick={{ fontSize: 16, fill: "#4a5a70" }} />
        <YAxis tick={{ fontSize: 16, fill: "#4a5a70" }} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f1628",
            border: "2px solid #2a3a5c",
            borderRadius: 0,
            fontSize: 18,
            fontFamily: "var(--font-pixel, monospace)",
          }}
          formatter={(value: number) => `${value}%`}
        />
        <Line type="monotone" dataKey="success" stroke="#40e070" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
