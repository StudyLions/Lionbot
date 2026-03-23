// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 11 -- Commands reference with searchable
//          admin + member command cards
// ============================================================
import { useState } from "react"
import { motion } from "framer-motion"
import { Terminal, Search, Shield, User } from "lucide-react"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"

interface StepCommandsProps {
  serverName: string
  onNext: () => void
  onBack: () => void
  direction: number
}

interface Command {
  name: string
  description: string
  example: string
  category: string
}

const ADMIN_COMMANDS: Command[] = [
  { name: "/settings", description: "Open the dashboard settings panel", example: "/settings", category: "General" },
  { name: "/config", description: "Quick-edit server configuration", example: "/config timezone US/Eastern", category: "General" },
  { name: "/shop add", description: "Add an item to the server shop", example: "/shop add @VIP 500", category: "Economy" },
  { name: "/ranks edit", description: "Edit rank tiers and thresholds", example: "/ranks edit", category: "Ranks" },
  { name: "/rolemenu create", description: "Create a new role selection menu", example: "/rolemenu create #roles", category: "Community" },
  { name: "/schedule create", description: "Create an accountability session", example: "/schedule create \"Study Time\" 09:00", category: "Schedule" },
  { name: "/economy give", description: "Give coins to a member", example: "/economy give @user 500", category: "Economy" },
  { name: "/moderation studyban", description: "Temporarily block a member from joining study voice channels", example: "/moderation studyban @user 1h", category: "Moderation" },
]

const MEMBER_COMMANDS: Command[] = [
  { name: "/me", description: "View your interactive profile with stats, rank, and customization", example: "/me", category: "Stats" },
  { name: "/profile", description: "Generate your full profile + stats card image", example: "/profile", category: "Stats" },
  { name: "/leaderboard", description: "See the server's top members", example: "/leaderboard voice", category: "Stats" },
  { name: "/task add", description: "Add a task to your personal to-do list", example: "/task add Study Chapter 5", category: "Tasks" },
  { name: "/task done", description: "Mark a task as completed and earn coins", example: "/task done 1", category: "Tasks" },
  { name: "/pomodoro", description: "Start a focus timer session", example: "/pomodoro", category: "Productivity" },
  { name: "/room create", description: "Rent a private voice channel", example: "/room create \"Study Room\"", category: "Community" },
  { name: "/shop", description: "Browse and buy items from the server shop", example: "/shop", category: "Economy" },
  { name: "/pet", description: "View and interact with your virtual pet lion", example: "/pet", category: "LionGotchi" },
  { name: "/farm", description: "Manage your LionGotchi farm", example: "/farm plant wheat", category: "LionGotchi" },
  { name: "/workout start", description: "Begin tracking a workout session", example: "/workout start", category: "Productivity" },
  { name: "/transfer", description: "Send coins to another member", example: "/transfer @friend 100", category: "Economy" },
]

function CommandCard({ cmd }: { cmd: Command }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <code className="text-xs font-mono font-semibold text-[#DDB21D]">{cmd.name}</code>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">{cmd.category}</span>
      </div>
      <p className="text-[11px] text-gray-400">{cmd.description}</p>
      <p className="text-[10px] text-gray-600 font-mono">{cmd.example}</p>
    </div>
  )
}

export default function StepCommands({ serverName, onNext, onBack, direction }: StepCommandsProps) {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"member" | "admin">("member")

  const commands = tab === "admin" ? ADMIN_COMMANDS : MEMBER_COMMANDS
  const filtered = search
    ? commands.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase())
      )
    : commands

  return (
    <StepLayout
      title="Commands"
      subtitle="Type / in any Discord channel to see available commands -- Discord shows you options as you type"
      leoPose="pointing"
      leoMessage={getLeoMessage("commands", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass commands-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("commands", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      nextLabel="Finish Setup"
      showSkip={false}
      direction={direction}
    >
      {/* Tab + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-800/60 rounded-xl p-1 border border-gray-700/50">
          <button
            onClick={() => setTab("member")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === "member"
                ? "bg-[#DDB21D]/15 text-[#DDB21D]"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Member ({MEMBER_COMMANDS.length})
          </button>
          <button
            onClick={() => setTab("admin")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === "admin"
                ? "bg-[#DDB21D]/15 text-[#DDB21D]"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin ({ADMIN_COMMANDS.length})
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 focus:ring-2 focus:ring-[#DDB21D]/50 outline-none"
          />
        </div>
      </div>

      {/* Command Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((cmd, i) => (
          <motion.div
            key={cmd.name}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <CommandCard cmd={cmd} />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-sm text-gray-500">
            No commands match &quot;{search}&quot;
          </div>
        )}
      </div>

      <div className="space-y-1.5 text-center">
        <p className="text-[10px] text-gray-600">
          This is a selection of the most-used commands. Members can type <code className="text-gray-400">/</code> in Discord to see all available commands.
        </p>
        <p className="text-[10px] text-gray-600">
          Admin commands require the Admin or Moderator role set in the &quot;The Basics&quot; step.
        </p>
      </div>
    </StepLayout>
  )
}
