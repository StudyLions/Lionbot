// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Custom MDX components for guide articles. These are
//          passed to MDXRemote to render rich, interactive content
//          inside .mdx guide files.
// ============================================================
import React, { useState } from "react"
import Link from "next/link"
import {
  Bot,
  ExternalLink,
  Terminal,
  Lightbulb,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Link as LinkIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BOT_INVITE_URL =
  "https://discord.com/oauth2/authorize?client_id=889078613817831495&permissions=1376674495606&scope=bot+applications.commands"

// ── Invite CTA ──────────────────────────────────────────────
export function InviteCTA({ text, compact }: { text?: string; compact?: boolean }) {
  if (compact) {
    return (
      <a
        href={BOT_INVITE_URL}
        target="_blank"
        rel="noreferrer"
        className="not-prose inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
      >
        <Bot className="h-4 w-4" />
        {text || "Add LionBot to Discord"}
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    )
  }

  return (
    <div className="not-prose my-8 relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8 text-center">
      <div className="relative z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Bot className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {text || "Ready to try it out?"}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-5 text-sm leading-relaxed">
          Add LionBot to your Discord server in seconds. It&apos;s free, takes no setup,
          and works with servers of any size.
        </p>
        <a
          href={BOT_INVITE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
        >
          <Bot className="h-5 w-5" />
          Add LionBot to Your Server
          <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </a>
      </div>
    </div>
  )
}

// ── Command Showcase ────────────────────────────────────────
export function CommandShowcase({
  command,
  description,
  children,
}: {
  command: string
  description?: string
  children?: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="not-prose my-5 rounded-lg border border-border bg-accent/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-accent/50 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          <span className="text-xs font-medium uppercase tracking-wider">Discord Command</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-4 py-3">
        <code className="text-primary font-mono text-base font-medium">{command}</code>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-3 text-sm text-muted-foreground">{children}</div>}
      </div>
    </div>
  )
}

// ── Callout blocks ──────────────────────────────────────────
const calloutStyles = {
  tip: {
    icon: Lightbulb,
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    iconColor: "text-emerald-400",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconColor: "text-amber-400",
    label: "Warning",
  },
  info: {
    icon: Info,
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    iconColor: "text-blue-400",
    label: "Info",
  },
}

function Callout({
  type,
  title,
  children,
}: {
  type: "tip" | "warning" | "info"
  title?: string
  children: React.ReactNode
}) {
  const style = calloutStyles[type]
  const Icon = style.icon

  return (
    <div
      className={cn(
        "not-prose my-5 rounded-lg border-l-4 p-4",
        style.border,
        style.bg
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", style.iconColor)} />
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold mb-1", style.iconColor)}>
            {title || style.label}
          </p>
          <div className="text-sm text-muted-foreground leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Tip({ title, children }: { title?: string; children: React.ReactNode }) {
  return <Callout type="tip" title={title}>{children}</Callout>
}

export function Warning({ title, children }: { title?: string; children: React.ReactNode }) {
  return <Callout type="warning" title={title}>{children}</Callout>
}

export function InfoBox({ title, children }: { title?: string; children: React.ReactNode }) {
  return <Callout type="info" title={title}>{children}</Callout>
}

// ── FAQ Section ─────────────────────────────────────────────
export interface FAQItem {
  question: string
  answer: string
}

export function FAQSection({
  items,
  title,
}: {
  items: FAQItem[]
  title?: string
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="not-prose my-8">
      <h2 className="text-xl font-bold text-foreground mb-4" id="faq">
        {title || "Frequently Asked Questions"}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-border overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-accent/30 transition-colors"
            >
              <span className="text-sm font-medium text-foreground pr-4">
                {item.question}
              </span>
              {openIndex === i ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Heading anchors ─────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function HeadingWithAnchor({
  level,
  children,
  ...props
}: {
  level: 2 | 3 | 4
  children: React.ReactNode
  [key: string]: any
}) {
  const text = typeof children === "string" ? children : ""
  const id = props.id || slugify(text)
  const Tag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <Tag id={id} className="group scroll-mt-24" {...props}>
      {children}
      <a
        href={`#${id}`}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
        aria-label={`Link to ${text}`}
      >
        <LinkIcon className="inline h-4 w-4" />
      </a>
    </Tag>
  )
}

// ── Component map for MDXRemote ─────────────────────────────
export const mdxComponents = {
  InviteCTA,
  CommandShowcase,
  Tip,
  Warning,
  Info: InfoBox,
  FAQSection,
  h2: (props: any) => <HeadingWithAnchor level={2} {...props} />,
  h3: (props: any) => <HeadingWithAnchor level={3} {...props} />,
  h4: (props: any) => <HeadingWithAnchor level={4} {...props} />,
  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith("http")
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href || "#"}>
        <a {...props}>{children}</a>
      </Link>
    )
  },
}
