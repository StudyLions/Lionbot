// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Single step block inside a tutorial page
// ============================================================
import { ReactNode } from "react"
import { Terminal, Lightbulb } from "lucide-react"
import TryItLive from "./TryItLive"

interface TutorialStepProps {
  stepNumber: number
  totalSteps: number
  title: string
  paragraphs: string[]
  command?: string
  tip?: string
  interactive?: string
}

export default function TutorialStep({
  stepNumber,
  totalSteps,
  title,
  paragraphs,
  command,
  tip,
  interactive,
}: TutorialStepProps) {
  return (
    <section className="scroll-mt-24" id={`step-${stepNumber}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0 pb-10">
          <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>

          <div className="space-y-3">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          {command && (
            <div className="mt-4 flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3">
              <Terminal size={16} className="text-primary flex-shrink-0" />
              <code className="text-sm font-mono text-foreground">{command}</code>
            </div>
          )}

          {tip && (
            <div className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3 flex gap-3">
              <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200/80 leading-relaxed">{tip}</p>
            </div>
          )}

          {interactive && (
            <div className="mt-6">
              <TryItLive componentId={interactive} />
            </div>
          )}

          {stepNumber < totalSteps && (
            <div className="mt-8 border-b border-border/40" />
          )}
        </div>
      </div>
    </section>
  )
}
