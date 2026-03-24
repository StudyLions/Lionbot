// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-13
// Purpose: Accessible toggle switch component
// ============================================================
// --- AI-MODIFIED (2026-03-20) ---
// Purpose: Play 8-bit toggle on/off sounds
import { getUISoundEngine } from "@/lib/uiSoundEngine"
// --- END AI-MODIFIED ---

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  id?: string
  silent?: boolean
}

export default function Toggle({ checked, onChange, label, disabled = false, id, silent = false }: ToggleProps) {
  const toggleId = id || `toggle-${label?.replace(/\s+/g, "-").toLowerCase() || "default"}`

  // --- AI-MODIFIED (2026-03-20) ---
  // Purpose: Play toggle on/off sound on click
  const handleClick = () => {
    if (disabled) return
    const next = !checked
    if (!silent) getUISoundEngine().play(next ? 'toggleOn' : 'toggleOff')
    onChange(next)
  }
  // --- END AI-MODIFIED ---

  return (
    <div className="flex items-center gap-3">
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={`
          relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${checked ? "bg-primary" : "bg-muted"}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
      {label && (
        <label htmlFor={toggleId} className={`text-sm ${disabled ? "text-muted-foreground" : "text-muted-foreground cursor-pointer"}`}>
          {label}
        </label>
      )}
    </div>
  )
}
