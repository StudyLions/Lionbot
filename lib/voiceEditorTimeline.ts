// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Voice Time Editor week timeline — layout math, overlap checks,
//          15-minute snapping, local day grouping
// ============================================================

/** Visible window on each day row: full 24h local (0–24h from midnight). */
export const VIEW_START_MIN = 0
export const VIEW_END_MIN = 24 * 60
export const VIEW_RANGE_MIN = VIEW_END_MIN - VIEW_START_MIN

export interface VoiceEditorSession {
  id: number
  startTime: string
  duration: number
  durationMinutes: number
  liveDurationMinutes: number
  streamDurationMinutes: number
  videoDurationMinutes: number
  tag: string | null
  rating: number | null
  isManual: boolean
}

export function sessionType(s: VoiceEditorSession): "camera" | "stream" | "voice" {
  if (s.videoDurationMinutes > 0) return "camera"
  if (s.streamDurationMinutes > 0) return "stream"
  return "voice"
}

/** YYYY-MM-DD in local timezone */
export function localDayKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Monday 00:00:00 local of the week containing `anchor` */
export function startOfWeekMonday(anchor: Date): Date {
  const x = new Date(anchor)
  x.setHours(0, 0, 0, 0)
  const dow = x.getDay() // 0 Sun .. 6 Sat
  const diff = dow === 0 ? -6 : 1 - dow
  x.setDate(x.getDate() + diff)
  return x
}

/** Seven calendar days starting Monday 00:00 local */
export function weekDaysFromMonday(monday: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

export function endOfWeekSunday(monday: Date): Date {
  const d = new Date(monday)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

export function filterSessionsForDay(sessions: VoiceEditorSession[], day: Date): VoiceEditorSession[] {
  const key = localDayKey(day)
  return sessions.filter((s) => localDayKey(new Date(s.startTime)) === key)
}

/** Minutes from local midnight for session start */
export function startMinutesFromMidnight(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
}

export interface BarLayout {
  leftPct: number
  widthPct: number
  clippedStart: boolean
  clippedEnd: boolean
}

/**
 * Map session to horizontal bar inside [VIEW_START_MIN, VIEW_END_MIN).
 * Sessions crossing midnight show only the portion on this calendar day.
 */
export function layoutSessionBar(session: VoiceEditorSession, day: Date): BarLayout | null {
  const start = new Date(session.startTime)
  const dayKey = localDayKey(day)
  if (localDayKey(start) !== dayKey) return null

  const startMin = startMinutesFromMidnight(session.startTime)
  const endMin = startMin + session.duration / 60

  let drawStart = Math.max(startMin, VIEW_START_MIN)
  let drawEnd = Math.min(endMin, VIEW_END_MIN)
  if (drawEnd <= VIEW_START_MIN || drawStart >= VIEW_END_MIN) return null
  if (drawEnd <= drawStart) return null

  const leftPct = ((drawStart - VIEW_START_MIN) / VIEW_RANGE_MIN) * 100
  const widthPct = ((drawEnd - drawStart) / VIEW_RANGE_MIN) * 100

  return {
    leftPct,
    widthPct: Math.max(widthPct, 0.35), // min visible width
    clippedStart: startMin < VIEW_START_MIN,
    clippedEnd: endMin > VIEW_END_MIN,
  }
}

const SNAP_MIN = 15

export function snapMinutesToGrid(totalMinutesFromMidnight: number): number {
  return Math.round(totalMinutesFromMidnight / SNAP_MIN) * SNAP_MIN
}

export function minutesFromMidnightToDate(day: Date, totalMinutes: number): Date {
  const d = new Date(day)
  d.setHours(0, 0, 0, 0)
  const h = Math.floor(totalMinutes / 60)
  const m = Math.floor(totalMinutes % 60)
  d.setHours(h, m, 0, 0)
  return d
}

/** Interval overlap in ms (exclusive end for [a,b) style) */
function rangesOverlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1
}

/**
 * Returns true if [newStart, newStart+durationSec] overlaps another session
 * in the same guild list (same user), excluding excludeSessionId.
 */
export function overlapsOtherSession(
  sessions: VoiceEditorSession[],
  excludeId: number | null,
  newStartMs: number,
  durationSec: number
): boolean {
  const newEnd = newStartMs + durationSec * 1000
  for (const s of sessions) {
    if (excludeId != null && s.id === excludeId) continue
    const s0 = new Date(s.startTime).getTime()
    const s1 = s0 + s.duration * 1000
    if (rangesOverlap(newStartMs, newEnd, s0, s1)) return true
  }
  return false
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Which session ids should show overlap preview while dragging a block
// --- END AI-MODIFIED ---
/** Includes the moving session plus any it would overlap; empty if placement is valid. */
export function overlapPreviewIdsForMove(
  sessions: VoiceEditorSession[],
  movingId: number,
  newStartMs: number,
  durationSec: number
): Set<number> {
  const newEnd = newStartMs + durationSec * 1000
  const others = new Set<number>()
  for (const s of sessions) {
    if (s.id === movingId) continue
    const s0 = new Date(s.startTime).getTime()
    const s1 = s0 + s.duration * 1000
    if (rangesOverlap(newStartMs, newEnd, s0, s1)) others.add(s.id)
  }
  if (others.size === 0) return new Set()
  const out = new Set(others)
  out.add(movingId)
  return out
}

/** Delta from dragging: pixels / trackWidth * VIEW_RANGE_MIN = minutes */
export function deltaPixelsToMinutes(deltaXPx: number, trackWidthPx: number): number {
  if (trackWidthPx <= 0) return 0
  return (deltaXPx / trackWidthPx) * VIEW_RANGE_MIN
}

export function deltaPixelsToDurationChange(deltaXPx: number, trackWidthPx: number): number {
  return Math.round(deltaPixelsToMinutes(deltaXPx, trackWidthPx) * 60)
}

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: Pending edits model — store drag/resize changes locally before committing

export interface PendingEdit {
  newStartTime?: string
  newDuration?: number
}

/** Merge pending edits into the session list so the timeline shows the draft state. */
export function applyPendingEdits(
  sessions: VoiceEditorSession[],
  pendingEdits: Map<number, PendingEdit>
): VoiceEditorSession[] {
  if (pendingEdits.size === 0) return sessions
  return sessions.map((s) => {
    const edit = pendingEdits.get(s.id)
    if (!edit) return s
    return {
      ...s,
      startTime: edit.newStartTime ?? s.startTime,
      duration: edit.newDuration ?? s.duration,
      durationMinutes: Math.round((edit.newDuration ?? s.duration) / 60),
    }
  })
}

export function formatTimeShort(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

export function sessionEndISO(s: VoiceEditorSession): string {
  return new Date(new Date(s.startTime).getTime() + s.duration * 1000).toISOString()
}
// --- END AI-MODIFIED ---
