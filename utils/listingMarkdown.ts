// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-30
// Purpose: Minimal, deliberately-restricted markdown renderer
//          for user-supplied server-listing descriptions.
//
//          We do NOT use a full markdown library because:
//            - Most full renderers allow raw HTML, which is an
//              instant XSS hole when the source is user input.
//            - We don't want servers to embed images, scripts,
//              iframes, or arbitrary tags inside their description.
//            - The safe subset of markdown (paragraphs, bold,
//              italic, lists, links, headings, code) is small
//              enough to implement directly with full HTML escaping.
//
//          Inline links are rendered with rel="nofollow noopener
//          noreferrer" -- the SEO-juicy DoFollow link is a
//          separate, explicit field on the listing.
// ============================================================

const ESCAPE_RE = /[&<>"']/g
const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function escapeHtml(input: string): string {
  return input.replace(ESCAPE_RE, (c) => ESCAPE_MAP[c])
}

function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

function applyInline(text: string): string {
  // Order matters here -- escape FIRST, then apply inline
  // formatting against the already-escaped text. That way any
  // raw HTML the user typed is already inert before we touch it.
  let out = escapeHtml(text)

  // Inline code: `foo` -> <code>foo</code>
  out = out.replace(/`([^`\n]{1,200})`/g, (_m, code) => `<code>${code}</code>`)

  // Bold: **foo** or __foo__
  out = out.replace(/\*\*([^*\n]{1,500})\*\*/g, "<strong>$1</strong>")
  out = out.replace(/__([^_\n]{1,500})__/g, "<strong>$1</strong>")

  // Italic: *foo* or _foo_
  out = out.replace(/(^|[\s(])\*([^*\n]{1,500})\*/g, "$1<em>$2</em>")
  out = out.replace(/(^|[\s(])_([^_\n]{1,500})_/g, "$1<em>$2</em>")

  // Links: [label](url)
  out = out.replace(/\[([^\]\n]{1,200})\]\(([^)\s]{1,500})\)/g, (_m, label, url) => {
    if (!isSafeUrl(url)) return label
    const safeUrl = escapeHtml(url)
    return `<a href="${safeUrl}" rel="nofollow noopener noreferrer" target="_blank">${label}</a>`
  })

  return out
}

interface BlockState {
  inList: false | "ul" | "ol"
}

function flushList(state: BlockState, html: string[]): void {
  if (state.inList) {
    html.push(`</${state.inList}>`)
    state.inList = false
  }
}

/**
 * Convert a restricted-markdown server description to a sanitised
 * HTML string. Output is safe to drop into dangerouslySetInnerHTML.
 */
export function renderListingDescription(input: string): string {
  if (!input) return ""
  const lines = input.replace(/\r\n/g, "\n").split("\n")
  const html: string[] = []
  const state: BlockState = { inList: false }
  let paragraphBuffer: string[] = []

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const joined = paragraphBuffer.join(" ").trim()
      if (joined.length > 0) {
        html.push(`<p>${applyInline(joined)}</p>`)
      }
      paragraphBuffer = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "")

    if (line.length === 0) {
      flushParagraph()
      flushList(state, html)
      continue
    }

    // Headings (## and ### only -- # is too dominant for a description)
    const headingMatch = /^(#{2,3})\s+(.+)/.exec(line)
    if (headingMatch) {
      flushParagraph()
      flushList(state, html)
      const level = headingMatch[1].length
      html.push(`<h${level}>${applyInline(headingMatch[2])}</h${level}>`)
      continue
    }

    // Blockquote
    const quoteMatch = /^>\s+(.+)/.exec(line)
    if (quoteMatch) {
      flushParagraph()
      flushList(state, html)
      html.push(`<blockquote>${applyInline(quoteMatch[1])}</blockquote>`)
      continue
    }

    // Unordered list item
    const ulMatch = /^[-*]\s+(.+)/.exec(line)
    if (ulMatch) {
      flushParagraph()
      if (state.inList !== "ul") {
        flushList(state, html)
        html.push("<ul>")
        state.inList = "ul"
      }
      html.push(`<li>${applyInline(ulMatch[1])}</li>`)
      continue
    }

    // Ordered list item
    const olMatch = /^\d+\.\s+(.+)/.exec(line)
    if (olMatch) {
      flushParagraph()
      if (state.inList !== "ol") {
        flushList(state, html)
        html.push("<ol>")
        state.inList = "ol"
      }
      html.push(`<li>${applyInline(olMatch[1])}</li>`)
      continue
    }

    // Plain paragraph line
    flushList(state, html)
    paragraphBuffer.push(line)
  }

  flushParagraph()
  flushList(state, html)
  return html.join("")
}
