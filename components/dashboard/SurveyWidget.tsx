// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: Floating "Get to know you" survey widget.
//          Two-step chip-based UI, localStorage + API persistence,
//          dismissable for 7 days, auto-hides once completed.
// ============================================================
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AGE_RANGES,
  GENDERS,
  USE_CASES,
  FIELDS_OF_STUDY,
  EDUCATION_LEVELS,
  COUNTRIES,
  POPULAR_COUNTRIES,
} from "@/constants/SurveyOptions"

const LS_COMPLETED = "survey_completed"
const LS_DISMISSED = "survey_dismissed_until"
const SHOW_DELAY_MS = 3000
const DISMISS_DAYS = 7

type SurveyStatus = "loading" | "pending" | "dismissed" | "completed"

interface SurveyAnswers {
  country: string
  age_range: string
  gender: string
  use_case: string
  field_of_study: string
  education_level: string
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      animate={selected ? { scale: [0.95, 1.06, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer select-none",
        "min-h-[40px] flex items-center justify-center",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-muted/60 text-muted-foreground border-border hover:border-primary/50 hover:bg-muted"
      )}
    >
      {label}
    </motion.button>
  )
}

function CountrySearch({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return POPULAR_COUNTRIES.filter(
        (c) => c.toLowerCase() !== value.toLowerCase()
      ).slice(0, 6)
    }
    const q = query.toLowerCase()
    return (COUNTRIES as readonly string[])
      .filter(
        (c) =>
          c.toLowerCase().includes(q) &&
          c.toLowerCase() !== value.toLowerCase()
      )
      .slice(0, 5)
  }, [query, value])

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary text-primary-foreground border border-primary">
          {value}
        </span>
        <button
          type="button"
          onClick={() => { onChange(""); setQuery("") }}
          className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
        >
          change
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Type your country..."
        className={cn(
          "w-full px-3 py-2 rounded-lg text-sm border bg-muted/60 text-foreground",
          "border-border placeholder:text-muted-foreground/60",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
        )}
      />
      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg",
              "max-h-[180px] overflow-y-auto"
            )}
          >
            {filtered.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => { onChange(c); setQuery(""); setOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/80 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                >
                  {c}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function SurveyWidget() {
  const { status: authStatus } = useSession()
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>("loading")
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<SurveyAnswers>({
    country: "",
    age_range: "",
    gender: "",
    use_case: "",
    field_of_study: "",
    education_level: "",
  })

  const set = useCallback(
    <K extends keyof SurveyAnswers>(key: K, val: SurveyAnswers[K]) =>
      setAnswers((prev) => ({ ...prev, [key]: prev[key] === val ? "" : val })),
    []
  )

  useEffect(() => {
    if (authStatus !== "authenticated") return

    if (localStorage.getItem(LS_COMPLETED) === "true") {
      setSurveyStatus("completed")
      return
    }
    const until = localStorage.getItem(LS_DISMISSED)
    if (until && Date.now() < Number(until)) {
      setSurveyStatus("dismissed")
      return
    }

    let cancelled = false
    fetch("/api/dashboard/survey")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.status === "completed") {
          localStorage.setItem(LS_COMPLETED, "true")
          setSurveyStatus("completed")
        } else if (data.status === "dismissed" && data.dismissedUntil) {
          localStorage.setItem(
            LS_DISMISSED,
            String(new Date(data.dismissedUntil).getTime())
          )
          setSurveyStatus("dismissed")
        } else {
          setSurveyStatus("pending")
        }
      })
      .catch(() => {
        if (!cancelled) setSurveyStatus("pending")
      })

    return () => { cancelled = true }
  }, [authStatus])

  useEffect(() => {
    if (surveyStatus !== "pending") return
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(timer)
  }, [surveyStatus])

  const dismiss = async () => {
    setVisible(false)
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(LS_DISMISSED, String(until))
    setSurveyStatus("dismissed")
    try {
      await fetch("/api/dashboard/survey/dismiss", { method: "POST" })
    } catch {}
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      await fetch("/api/dashboard/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      })
      localStorage.setItem(LS_COMPLETED, "true")
      setSurveyStatus("completed")
      setVisible(false)
    } catch {
      setSubmitting(false)
    }
  }

  if (authStatus !== "authenticated" || surveyStatus !== "pending") return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className={cn(
            "fixed z-[60] shadow-2xl border border-border rounded-2xl bg-card overflow-hidden",
            "w-[360px] max-h-[85vh] overflow-y-auto",
            "bottom-24 right-4",
            "max-[639px]:bottom-0 max-[639px]:right-0 max-[639px]:left-0 max-[639px]:w-full",
            "max-[639px]:rounded-b-none max-[639px]:rounded-t-2xl"
          )}
        >
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {step === 1 ? "Help us build what YOU need!" : "Almost done!"}
                </h3>
                {step === 1 && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your answers help us understand our audience and build
                    features that matter to you.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Where are you from?
                  </label>
                  <CountrySearch
                    value={answers.country}
                    onChange={(v) =>
                      setAnswers((prev) => ({ ...prev, country: v }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    How old are you?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        selected={answers.age_range === o.value}
                        onClick={() => set("age_range", o.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Gender
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENDERS.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        selected={answers.gender === o.value}
                        onClick={() => set("gender", o.value)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    I use LionBot for...
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {USE_CASES.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        selected={answers.use_case === o.value}
                        onClick={() => set("use_case", o.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    What do you study?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FIELDS_OF_STUDY.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        selected={answers.field_of_study === o.value}
                        onClick={() => set("field_of_study", o.value)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Education level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EDUCATION_LEVELS.map((o) => (
                      <Chip
                        key={o.value}
                        label={o.label}
                        selected={answers.education_level === o.value}
                        onClick={() => set("education_level", o.value)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              {step === 1 ? (
                <>
                  <div />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={dismiss}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Maybe later
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    >
                      Next &rarr;
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    &larr; Back
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={dismiss}
                      className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Maybe later
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={submitting}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {submitting ? "Saving..." : "Done!"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted/50">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
