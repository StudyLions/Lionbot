// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Shared range slider component used across setup
//          wizard step configurations
// ============================================================

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  suffix?: string
  description?: string
}

export default function Slider({ label, value, min, max, step, onChange, suffix = "", description }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm font-mono font-semibold text-[#DDB21D]">{value}{suffix}</span>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#DDB21D] bg-gray-700"
      />
    </div>
  )
}
