// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Tutorial page layout with sticky sidebar TOC,
//          progress bar, and prev/next navigation
// ============================================================
import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, BookOpen, List } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Tutorial } from "@/data/tutorials"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface TutorialLayoutProps {
  tutorial: Tutorial
  children: React.ReactNode
}

export default function TutorialLayout({ tutorial, children }: TutorialLayoutProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const stepEls = tutorial.steps.map((_, i) =>
        document.getElementById(`step-${i + 1}`)
      )
      let current = 0
      for (let i = stepEls.length - 1; i >= 0; i--) {
        const el = stepEls[i]
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120) {
            current = i
            break
          }
        }
      }
      setActiveStep(current)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [tutorial.steps])

  const progress = Math.round(((activeStep + 1) / tutorial.steps.length) * 100)

  const scrollToStep = (index: number) => {
    const el = document.getElementById(`step-${index + 1}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setTocOpen(false)
    }
  }

  const audienceLabel = tutorial.audience === "member" ? "Member Tutorials" : "Admin Tutorials"

  return (
    <div className="min-h-screen bg-background pt-6 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link href="/tutorials">
                <span className="hover:text-foreground transition-colors cursor-pointer">Tutorials</span>
              </Link>
              <ChevronRight size={12} />
              <Link href={`/tutorials#${tutorial.audience}`}>
                <span className="hover:text-foreground transition-colors cursor-pointer">{audienceLabel}</span>
              </Link>
              <ChevronRight size={12} />
              <span className="text-muted-foreground">{tutorial.title}</span>
            </nav>
            <span className="text-xs text-muted-foreground">
              Step {activeStep + 1} of {tutorial.steps.length}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar TOC */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-3 px-2">
                Contents
              </h2>
              <nav className="space-y-0.5">
                {tutorial.steps.map((step, i) => (
                  <button
                    key={step.id}
                    onClick={() => scrollToStep(i)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-xs transition-colors flex items-start gap-2",
                      activeStep === i
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <span className="w-4 text-right flex-shrink-0 tabular-nums">{i + 1}.</span>
                    <span className="line-clamp-2">{step.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile TOC trigger */}
          <div className="fixed bottom-4 right-4 z-40 lg:hidden">
            <Sheet open={tocOpen} onOpenChange={setTocOpen}>
              <SheetTrigger asChild>
                <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <List size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <SheetHeader className="p-5 pb-2">
                  <SheetTitle className="text-sm">Contents</SheetTitle>
                </SheetHeader>
                <nav className="px-3 pb-6 space-y-0.5">
                  {tutorial.steps.map((step, i) => (
                    <button
                      key={step.id}
                      onClick={() => scrollToStep(i)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-start gap-2",
                        activeStep === i
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <span className="w-4 text-right flex-shrink-0 tabular-nums">{i + 1}.</span>
                      <span>{step.title}</span>
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Title */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  tutorial.audience === "member"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                )}>
                  {tutorial.audience === "member" ? "Member Guide" : "Admin Guide"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {tutorial.estimatedMinutes} min read
                </span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{tutorial.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {tutorial.description}
              </p>
            </div>

            {/* Steps */}
            {children}

            {/* Prev / Next navigation */}
            <div className="mt-12 pt-8 border-t border-border flex items-center justify-between gap-4">
              {tutorial.prevSlug ? (
                <Link href={`/tutorials/${tutorial.prevSlug}`}>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Previous tutorial
                  </span>
                </Link>
              ) : (
                <Link href="/tutorials">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    All tutorials
                  </span>
                </Link>
              )}
              {tutorial.nextSlug ? (
                <Link href={`/tutorials/${tutorial.nextSlug}`}>
                  <span className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer font-medium group">
                    Next tutorial
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ) : (
                <Link href="/tutorials">
                  <span className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors cursor-pointer font-medium group">
                    Back to tutorials
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
