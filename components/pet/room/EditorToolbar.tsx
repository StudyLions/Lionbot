// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-16
// Purpose: Room editor toolbar with 8 tools, undo/redo,
//          save button, and shopping cart badge
// ============================================================

'use client'

import type { EditorTool } from '@/hooks/useRoomEditor'

interface EditorToolbarProps {
  activeTool: EditorTool
  setActiveTool: (tool: EditorTool) => void
  showGrid: boolean
  setShowGrid: (v: boolean) => void
  showLayers: boolean
  setShowLayers: (v: boolean) => void
  zoom: number
  zoomIn: () => void
  zoomOut: () => void
  undoCount: number
  redoCount: number
  undo: () => void
  redo: () => void
  isDirty: boolean
  isSaving: boolean
  saveLayout: () => void
  cartCount: number
}

const TOOLS: Array<{ id: EditorTool; icon: string; label: string }> = [
  { id: 'move',   icon: '✥', label: 'Move' },
  { id: 'select', icon: '◎', label: 'Select' },
  { id: 'flip',   icon: '⇔', label: 'Flip' },
  { id: 'color',  icon: '◐', label: 'Color' },
  { id: 'remove', icon: '✕', label: 'Remove' },
  { id: 'zoom',   icon: '⊕', label: 'Zoom' },
  { id: 'layers', icon: '☰', label: 'Layers' },
  { id: 'grid',   icon: '⊞', label: 'Grid' },
]

const TOGGLE_TOOLS = new Set<EditorTool>(['layers', 'grid'])

export default function EditorToolbar({
  activeTool,
  setActiveTool,
  showGrid,
  setShowGrid,
  showLayers,
  setShowLayers,
  zoom,
  zoomIn,
  zoomOut,
  undoCount,
  redoCount,
  undo,
  redo,
  isDirty,
  isSaving,
  saveLayout,
  cartCount,
}: EditorToolbarProps) {
  function handleToolClick(id: EditorTool) {
    if (id === 'grid') {
      setShowGrid(!showGrid)
      return
    }
    if (id === 'layers') {
      setShowLayers(!showLayers)
      return
    }
    setActiveTool(id)
  }

  function isToggleActive(id: EditorTool): boolean {
    if (id === 'grid') return showGrid
    if (id === 'layers') return showLayers
    return false
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-[#111828] border border-[#3a4a6c] rounded-lg font-pixel select-none">
      {/* Tool group */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map((tool) => {
          const isToggle = TOGGLE_TOOLS.has(tool.id)
          const active = isToggle ? isToggleActive(tool.id) : activeTool === tool.id

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
              className={`
                w-8 h-8 flex items-center justify-center text-sm rounded transition-all
                ${active
                  ? 'border-2 border-yellow-500 bg-yellow-500/10 text-yellow-300 shadow-[0_0_6px_rgba(234,179,8,0.3)]'
                  : 'border border-[#3a4a6c] bg-[#0c1020] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#5a6a8c]'
                }
              `}
            >
              {tool.icon}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#3a4a6c] mx-1.5" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={undoCount === 0}
          title="Undo"
          className="relative w-8 h-8 flex items-center justify-center text-sm rounded border border-[#3a4a6c] bg-[#0c1020] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#5a6a8c] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ↶
          {undoCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center px-0.5 text-[12px] bg-blue-600 text-white rounded-full leading-none">
              {undoCount}
            </span>
          )}
        </button>
        <button
          onClick={redo}
          disabled={redoCount === 0}
          title="Redo"
          className="relative w-8 h-8 flex items-center justify-center text-sm rounded border border-[#3a4a6c] bg-[#0c1020] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#5a6a8c] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ↷
          {redoCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center px-0.5 text-[12px] bg-blue-600 text-white rounded-full leading-none">
              {redoCount}
            </span>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-[#3a4a6c] mx-1.5" />

      {/* Save */}
      <button
        onClick={saveLayout}
        disabled={isSaving || !isDirty}
        title={isDirty ? 'Save changes' : 'No changes to save'}
        className="relative flex items-center gap-1.5 px-3 h-8 text-xs rounded border border-[#3a4a6c] bg-[#0c1020] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#5a6a8c] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isSaving ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <>
            💾
            {isDirty && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            )}
          </>
        )}
        <span>{isSaving ? 'Saving...' : 'Save'}</span>
      </button>

      {/* Cart */}
      <button
        title="Shopping cart"
        className="relative w-8 h-8 flex items-center justify-center text-sm rounded border border-[#3a4a6c] bg-[#0c1020] text-[#8b9dc3] hover:text-[#e2e8f0] hover:border-[#5a6a8c] transition-all ml-0.5"
      >
        🛒
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center px-0.5 text-[12px] bg-green-500 text-white rounded-full leading-none font-bold">
            {cartCount}
          </span>
        )}
      </button>

      {/* Zoom display */}
      <div className="flex items-center gap-0.5 ml-1.5 text-[13px] text-[#6b7fa0]">
        <button
          onClick={zoomOut}
          title="Zoom out"
          className="w-5 h-5 flex items-center justify-center rounded border border-[#3a4a6c] hover:border-[#5a6a8c] hover:text-[#e2e8f0] transition-all"
        >
          −
        </button>
        <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
        <button
          onClick={zoomIn}
          title="Zoom in"
          className="w-5 h-5 flex items-center justify-center rounded border border-[#3a4a6c] hover:border-[#5a6a8c] hover:text-[#e2e8f0] transition-all"
        >
          +
        </button>
      </div>
    </div>
  )
}
