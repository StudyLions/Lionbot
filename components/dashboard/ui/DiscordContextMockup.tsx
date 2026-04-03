// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-01
// Purpose: Discord context mockup component showing WHERE a
//          customizable string appears in the bot's Discord UI.
//          6 variants: embed, message, button, select, modal, card.
// ============================================================

interface DiscordContextMockupProps {
  contextType: "embed" | "message" | "button" | "select" | "modal" | "card"
  contextRegion: string
  text: string
}

const DIM = "text-[#72767d]/50"
const HIGHLIGHT_RING = "ring-1 ring-cyan-400/40 bg-cyan-500/[0.08] rounded"
const HIGHLIGHT_TEXT = "text-[#dcddde] text-[11px]"
const DIM_TEXT = "text-[#72767d]/40 text-[11px]"
const EDITING_LABEL = "text-cyan-400 text-[9px] mt-0.5"

function BotHeader() {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <div className="w-5 h-5 rounded-full bg-[#DDB21D] flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-3 h-3" fill="white">
          <circle cx="12" cy="10" r="6" />
          <ellipse cx="12" cy="20" rx="5" ry="4" />
        </svg>
      </div>
      <span className="text-[10px] font-semibold text-[#DDB21D]">LionBot</span>
      <span className="text-[7px] bg-[#5865F2] text-white px-0.5 py-px rounded font-semibold uppercase leading-none">Bot</span>
    </div>
  )
}

function HighlightBox({ text, label }: { text: string; label?: string }) {
  return (
    <div>
      <div className={`${HIGHLIGHT_RING} px-1.5 py-1`}>
        <p className={`${HIGHLIGHT_TEXT} whitespace-pre-wrap break-words line-clamp-3`}>{text || "..."}</p>
      </div>
      <p className={EDITING_LABEL}>{label || "You\u2019re editing this"}</p>
    </div>
  )
}

function DimText({ children }: { children: string }) {
  return <p className={`${DIM_TEXT} truncate`}>{children}</p>
}

function EmbedMockup({ contextRegion, text }: { contextRegion: string; text: string }) {
  const isTitle = contextRegion === "title"
  const isDesc = contextRegion === "desc"
  const isFooter = contextRegion === "footer"
  const isAuthor = contextRegion === "author"
  const isFieldName = contextRegion === "field_name"
  const isFieldValue = contextRegion === "field_value"

  return (
    <div className="bg-[#2f3136] rounded p-2">
      <BotHeader />
      <div className="flex gap-1">
        <div className="w-0.5 flex-shrink-0 rounded-full bg-primary" />
        <div className="flex-1 min-w-0 space-y-1 pl-1.5">
          {isAuthor ? <HighlightBox text={text} /> : <DimText>LionBot</DimText>}
          {isTitle ? (
            <HighlightBox text={text} />
          ) : (
            <p className={`${DIM_TEXT} font-semibold`}>Embed title</p>
          )}
          {isDesc ? (
            <HighlightBox text={text} />
          ) : (
            <DimText>Embed description text...</DimText>
          )}
          <div className="flex gap-3 pt-0.5">
            <div className="flex-1 min-w-0">
              {isFieldName ? (
                <HighlightBox text={text} />
              ) : (
                <p className={`${DIM_TEXT} font-medium`}>Field</p>
              )}
              {isFieldValue ? (
                <HighlightBox text={text} />
              ) : (
                <DimText>Value</DimText>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${DIM_TEXT} font-medium`}>Field</p>
              <DimText>Value</DimText>
            </div>
          </div>
          {isFooter ? (
            <HighlightBox text={text} />
          ) : (
            <p className={`${DIM_TEXT} text-[9px]`}>Footer text</p>
          )}
        </div>
      </div>
    </div>
  )
}

function MessageMockup({ text }: { text: string }) {
  return (
    <div className="bg-[#2f3136] rounded p-2">
      <BotHeader />
      <HighlightBox text={text} />
    </div>
  )
}

function ButtonMockup({ text }: { text: string }) {
  return (
    <div className="bg-[#2f3136] rounded p-2">
      <BotHeader />
      <DimText>Choose an action below:</DimText>
      <div className="flex gap-1 mt-1.5">
        <button className="px-2 py-0.5 rounded bg-[#4f545c]/50 text-[#72767d]/40 text-[10px]">
          Action
        </button>
        <div className={`${HIGHLIGHT_RING} px-2 py-0.5`}>
          <span className={`${HIGHLIGHT_TEXT} font-medium`}>{text || "Button"}</span>
        </div>
        <button className="px-2 py-0.5 rounded bg-[#4f545c]/50 text-[#72767d]/40 text-[10px]">
          Other
        </button>
      </div>
      <p className={EDITING_LABEL}>You&rsquo;re editing this</p>
    </div>
  )
}

function SelectMockup({ contextRegion, text }: { contextRegion: string; text: string }) {
  const isPlaceholder = contextRegion === "placeholder"

  return (
    <div className="bg-[#2f3136] rounded p-2">
      <BotHeader />
      <DimText>Select an option:</DimText>
      <div className="mt-1.5 rounded border border-[#4f545c]/60 overflow-hidden">
        <div className={`px-2 py-1 flex items-center justify-between ${isPlaceholder ? HIGHLIGHT_RING : "bg-[#2f3136]"}`}>
          <span className={isPlaceholder ? HIGHLIGHT_TEXT : DIM_TEXT}>
            {isPlaceholder ? text || "Placeholder..." : "Select an option..."}
          </span>
          <svg className={`w-3 h-3 ${DIM}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {!isPlaceholder && (
          <div className="border-t border-[#4f545c]/40">
            <div className={`px-2 py-0.5 ${DIM_TEXT}`}>Option A</div>
            <div className={`px-2 py-0.5 ${HIGHLIGHT_RING}`}>
              <span className={HIGHLIGHT_TEXT}>{text || "Option"}</span>
            </div>
            <div className={`px-2 py-0.5 ${DIM_TEXT}`}>Option C</div>
          </div>
        )}
      </div>
      <p className={EDITING_LABEL}>You&rsquo;re editing this</p>
    </div>
  )
}

function ModalMockup({ contextRegion, text }: { contextRegion: string; text: string }) {
  const isTitle = contextRegion === "title"

  return (
    <div className="bg-[#36393f]/80 rounded p-3 flex items-center justify-center">
      <div className="bg-[#2f3136] rounded-lg border border-[#40444b] w-full max-w-[220px] overflow-hidden">
        <div className={`px-3 py-2 border-b border-[#40444b] ${isTitle ? HIGHLIGHT_RING : ""}`}>
          <p className={isTitle ? `${HIGHLIGHT_TEXT} font-semibold` : `${DIM_TEXT} font-semibold`}>
            {isTitle ? text || "Modal Title" : "Modal Title"}
          </p>
          {isTitle && <p className={EDITING_LABEL}>You&rsquo;re editing this</p>}
        </div>
        <div className="px-3 py-2 space-y-1.5">
          <div className={!isTitle ? HIGHLIGHT_RING + " px-1 py-0.5" : ""}>
            <p className={!isTitle ? `${HIGHLIGHT_TEXT} text-[10px]` : `${DIM_TEXT} text-[10px]`}>
              {!isTitle ? text || "Field label" : "Field label"}
            </p>
            {!isTitle && <p className={EDITING_LABEL}>You&rsquo;re editing this</p>}
          </div>
          <div className="rounded border border-[#40444b] px-1.5 py-1">
            <p className={`${DIM_TEXT} text-[9px]`}>Type here...</p>
          </div>
        </div>
        <div className="px-3 py-2 border-t border-[#40444b] flex justify-end gap-1">
          <button className={`px-2 py-0.5 rounded text-[9px] ${DIM_TEXT}`}>Cancel</button>
          <button className="px-2 py-0.5 rounded bg-[#5865F2]/40 text-[10px] text-[#72767d]">Submit</button>
        </div>
      </div>
    </div>
  )
}

function CardMockup({ contextRegion, text }: { contextRegion: string; text: string }) {
  const isHeader = contextRegion === "header"
  const isFooter = contextRegion === "footer"

  return (
    <div className="bg-[#2f3136] rounded p-2">
      <div className="rounded-lg border border-[#40444b] overflow-hidden bg-[#36393f]">
        <div className={`px-3 py-1.5 border-b border-[#40444b]/60 ${isHeader ? HIGHLIGHT_RING : ""}`}>
          <p className={`${isHeader ? HIGHLIGHT_TEXT : DIM_TEXT} font-bold text-[10px] uppercase tracking-wider`}>
            {isHeader ? text || "HEADER" : "CARD TITLE"}
          </p>
          {isHeader && <p className={EDITING_LABEL}>You&rsquo;re editing this</p>}
        </div>
        <div className="px-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div className={!isHeader && !isFooter ? HIGHLIGHT_RING + " px-1 py-0.5" : ""}>
              <p className={`${DIM_TEXT} text-[9px] uppercase`}>Stat</p>
              <p className={!isHeader && !isFooter ? HIGHLIGHT_TEXT : DIM_TEXT}>
                {!isHeader && !isFooter ? text || "Value" : "42h"}
              </p>
              {!isHeader && !isFooter && <p className={EDITING_LABEL}>You&rsquo;re editing this</p>}
            </div>
            <div>
              <p className={`${DIM_TEXT} text-[9px] uppercase`}>Rank</p>
              <p className={DIM_TEXT}>#3</p>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 border-t border-[#40444b]/60 ${isFooter ? HIGHLIGHT_RING : ""}`}>
          <p className={`${isFooter ? HIGHLIGHT_TEXT : DIM_TEXT} text-[9px]`}>
            {isFooter ? text || "Footer" : "Generated by LionBot"}
          </p>
          {isFooter && <p className={EDITING_LABEL}>You&rsquo;re editing this</p>}
        </div>
      </div>
      <p className="text-fuchsia-400/60 text-[8px] mt-1 italic">Renders in card image</p>
    </div>
  )
}

export default function DiscordContextMockup({
  contextType,
  contextRegion,
  text,
}: DiscordContextMockupProps) {
  switch (contextType) {
    case "embed":
      return <EmbedMockup contextRegion={contextRegion} text={text} />
    case "message":
      return <MessageMockup text={text} />
    case "button":
      return <ButtonMockup text={text} />
    case "select":
      return <SelectMockup contextRegion={contextRegion} text={text} />
    case "modal":
      return <ModalMockup contextRegion={contextRegion} text={text} />
    case "card":
      return <CardMockup contextRegion={contextRegion} text={text} />
    default:
      return <MessageMockup text={text} />
  }
}
