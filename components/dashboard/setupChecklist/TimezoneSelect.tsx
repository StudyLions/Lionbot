// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-29
// Purpose: Timezone picker for the Setup Checklist Essentials task.
//
//          Shows the browser-detected IANA zone as a one-click "Use my
//          timezone" chip, plus a searchable dropdown of common zones
//          grouped by region. ~60 zones cover the vast majority of admins.
//
//          Falls back to the existing dashboard SearchSelect for the actual
//          combobox so behaviour matches every other dropdown in the app.
// ============================================================
import { useMemo } from "react"
import SearchSelect from "@/components/dashboard/ui/SearchSelect"
import { Sparkles } from "lucide-react"

// Group label \u2192 list of IANA zones. Curated to the most-used ones; admins
// can still type any zone via the search input.
const ZONE_GROUPS: Record<string, string[]> = {
  "Universal": ["UTC"],
  "Africa": ["Africa/Cairo", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi"],
  "Americas \u2014 North": [
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Toronto",
    "America/Mexico_City",
    "America/Vancouver",
  ],
  "Americas \u2014 South": ["America/Sao_Paulo", "America/Buenos_Aires", "America/Bogota", "America/Lima", "America/Santiago"],
  "Asia": [
    "Asia/Dubai",
    "Asia/Tehran",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Dhaka",
    "Asia/Bangkok",
    "Asia/Jakarta",
    "Asia/Singapore",
    "Asia/Hong_Kong",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
  ],
  "Europe": [
    "Europe/Lisbon",
    "Europe/London",
    "Europe/Madrid",
    "Europe/Paris",
    "Europe/Amsterdam",
    "Europe/Berlin",
    "Europe/Rome",
    "Europe/Stockholm",
    "Europe/Warsaw",
    "Europe/Athens",
    "Europe/Istanbul",
    "Europe/Moscow",
  ],
  "Oceania": ["Australia/Perth", "Australia/Sydney", "Australia/Adelaide", "Pacific/Auckland", "Pacific/Honolulu"],
}

function detectBrowserZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

interface Props {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
}

export default function TimezoneSelect({ value, onChange, disabled }: Props) {
  const browserZone = useMemo(detectBrowserZone, [])

  // If the admin's browser zone isn't in our curated list, add it as a single-option group.
  const allCurated = useMemo(() => {
    const flat = Object.entries(ZONE_GROUPS).flatMap(([group, zones]) =>
      zones.map((z) => ({ value: z, label: z, group })),
    )
    if (browserZone && !flat.find((o) => o.value === browserZone)) {
      flat.push({ value: browserZone, label: browserZone, group: "Detected" })
    }
    return flat
  }, [browserZone])

  return (
    <div className="space-y-2">
      <SearchSelect
        options={allCurated}
        value={value}
        onChange={(v) => onChange(typeof v === "string" ? v : null)}
        placeholder="Search timezones (e.g. Berlin, Tokyo)"
        disabled={disabled}
        emptyMessage="No matching timezone. Try a city name."
      />
      {browserZone && value !== browserZone && (
        <button
          type="button"
          onClick={() => onChange(browserZone)}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 min-h-[32px] px-2.5 py-1 rounded-full text-[12px] font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Sparkles size={11} aria-hidden="true" />
          Use my timezone ({browserZone})
        </button>
      )}
    </div>
  )
}
