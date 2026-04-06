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
import Image from "next/image"

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

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#3b82f6", "#f97316"]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = 4 + Math.random() * 4
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: `${x}%`,
        top: "50%",
      }}
      initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -60 - Math.random() * 80, -100 - Math.random() * 60],
        x: [-20 + Math.random() * 40, -40 + Math.random() * 80],
        scale: [1, 1.2, 0.6],
        rotate: [0, 180 + Math.random() * 360],
      }}
      transition={{
        duration: 1.2 + Math.random() * 0.6,
        delay,
        ease: "easeOut",
      }}
    />
  )
}

function Confetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        delay: Math.random() * 0.3,
        x: 10 + Math.random() * 80,
      })),
    []
  )
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} />
      ))}
    </div>
  )
}

export default function SurveyWidget() {
  const { status: authStatus } = useSession()
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>("loading")
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
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
    setExpanded(false)
    setTimeout(() => setVisible(false), 300)
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
      setShowConfetti(true)
      setTimeout(() => {
        localStorage.setItem(LS_COMPLETED, "true")
        setSurveyStatus("completed")
        setExpanded(false)
        setVisible(false)
      }, 2000)
    } catch {
      setSubmitting(false)
    }
  }

  if (authStatus !== "authenticated" || surveyStatus !== "pending") return null

  return (
    <AnimatePresence>
      {visible && (
        <div className={cn(
          "fixed z-[60]",
          "bottom-24 right-4",
          "max-[639px]:bottom-0 max-[639px]:right-0 max-[639px]:left-0 max-[639px]:w-full"
        )}>
          {/* Teaser pill (shown when not expanded) */}
          <AnimatePresence>
            {!expanded && (
              <motion.button
                type="button"
                onClick={() => setExpanded(true)}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative flex items-center gap-2.5 px-5 py-3 rounded-full cursor-pointer",
                  "bg-gradient-to-r from-amber-500/90 via-primary to-violet-500/90",
                  "text-white font-semibold text-sm shadow-xl",
                  "border border-white/20",
                  "max-[639px]:w-full max-[639px]:rounded-full max-[639px]:mx-4 max-[639px]:mb-4"
                )}
              >
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Image
                    src="/images/lion-heart.webp"
                    alt=""
                    width={22}
                    height={22}
                  />
                </motion.div>
                <span>Help us help you!</span>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); dismiss() }}
                  className="ml-1 text-white/60 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Expanded survey card */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: "spring", damping: 24, stiffness: 300 }}
                className={cn(
                  "relative shadow-2xl border border-border rounded-2xl bg-card overflow-hidden",
                  "w-[360px] max-h-[85vh] overflow-y-auto",
                  "max-[639px]:w-full max-[639px]:rounded-b-none max-[639px]:rounded-t-2xl"
                )}
              >
                {showConfetti && <Confetti />}

                {/* Gradient accent strip */}
                <div className="h-1 bg-gradient-to-r from-amber-500 via-primary to-violet-500" />

                <div className="p-5 space-y-4">
                  {/* Header */}
                  {showConfetti ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <Image
                        src="/images/lion-heart.webp"
                        alt="LionBot mascot"
                        width={64}
                        height={64}
                        className="mx-auto mb-2"
                      />
                      <h3 className="text-base font-semibold text-foreground">
                        Thank you!
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your answers help us build a better LionBot for everyone.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2.5">
                        <Image
                          src="/images/lion-heart.webp"
                          alt="LionBot mascot"
                          width={36}
                          height={36}
                          className="flex-shrink-0 -mt-0.5"
                        />
                        <div>
                          <h3 className="text-base font-semibold text-foreground">
                            {step === 1 ? "Help us help you!" : "Almost done!"}
                          </h3>
                          {step === 1 && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Quick survey so we can build features that matter to you.
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={dismiss}
                        className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Step 1 */}
                  {!showConfetti && step === 1 && (
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
                  {!showConfetti && step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          My Discord server is a...
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
                          I currently study
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
                  {!showConfetti && (
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
                  )}
                </div>

                {/* Progress bar */}
                {!showConfetti && (
                  <div className="h-1 bg-muted/50">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 via-primary to-violet-500"
                      initial={{ width: "0%" }}
                      animate={{ width: step === 1 ? "50%" : "100%" }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  )
}
