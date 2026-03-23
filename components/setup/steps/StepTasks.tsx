// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Step 5 -- Tasks & Workouts configuration
// ============================================================
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronUp, ListChecks, Dumbbell, Check, Circle } from "lucide-react"
import StepLayout from "../StepLayout"
import { getLeoMessage } from "../leoMessages"
import Slider from "../Slider"

// --- AI-MODIFIED (2026-03-23) ---
// Purpose: optional hasExistingConfig forwarded to StepLayout
// --- END AI-MODIFIED ---
interface StepTasksProps {
  config: Record<string, any>
  serverName: string
  onUpdate: (key: string, value: any) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  saving: boolean
  direction: number
  hasExistingConfig?: boolean
}

const DEMO_TASKS = [
  { text: "Read Chapter 5 of Organic Chemistry", done: true },
  { text: "Complete 20 practice problems", done: true },
  { text: "Review lecture notes for midterm", done: false },
  { text: "Submit lab report draft", done: false },
]

export default function StepTasks({
  config, serverName, onUpdate, onNext, onBack, onSkip, saving, direction, hasExistingConfig,
}: StepTasksProps) {
  const [showAdvanced, setShowAdvanced] = useState(true)

  return (
    <StepLayout
      title="Tasks & Workouts"
      subtitle="Personal to-do lists and timed exercise sessions"
      leoPose="pointing"
      leoMessage={getLeoMessage("tasks", "intro", serverName)}
      // --- AI-MODIFIED (2026-03-23) ---
      // Purpose: Pass tasks-step hint to StepLayout for Leo hint cycling
      leoHintMessage={getLeoMessage("tasks", "hint", serverName)}
      // --- END AI-MODIFIED ---
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      saving={saving}
      direction={direction}
      hasExistingConfig={hasExistingConfig}
    >
      {/* Task Config */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <ListChecks className="w-4 h-4 text-[#DDB21D]" />
          Task System
        </div>
        <p className="text-xs text-gray-400">
          Members type <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">/task add</code> in any Discord channel to create tasks and <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">/task done</code> to check them off. They earn LionCoins for every completed task -- it&apos;s a built-in to-do list with rewards!
        </p>

        <Slider
          label="Max active tasks per member"
          value={config.max_tasks ?? 5}
          min={1}
          max={20}
          step={1}
          onChange={(v) => onUpdate("max_tasks", v)}
          description="How many tasks a member can have at once"
        />

        <Slider
          label="Coins per completed task"
          value={config.task_reward ?? 50}
          min={0}
          max={500}
          step={10}
          onChange={(v) => onUpdate("task_reward", v)}
          description="LionCoins awarded for completing a task"
        />

        <Slider
          label="Daily task reward limit"
          value={config.task_reward_limit ?? 5}
          min={1}
          max={20}
          step={1}
          onChange={(v) => onUpdate("task_reward_limit", v)}
          description="Max number of rewarded tasks per day"
        />
      </div>

      {/* Task Demo */}
      <div className="bg-[#36393f] rounded-lg p-4 max-w-md w-full">
        <p className="text-xs text-gray-400 mb-3 font-medium">How tasks look for members:</p>
        <div className="space-y-2">
          {DEMO_TASKS.map((task, i) => (
            <motion.div
              key={task.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2"
            >
              {task.done ? (
                <Check className="w-4 h-4 text-[#43b581] flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
              )}
              <span className={`text-xs ${task.done ? "text-gray-500 line-through" : "text-[#dcddde]"}`}>
                {task.text}
              </span>
              {task.done && (
                <span className="text-[10px] text-[#DDB21D] font-medium ml-auto">
                  +{config.task_reward ?? 50} coins
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Workouts (Advanced) */}
      <div className="border border-gray-700/50 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-5 py-3 bg-gray-800/40 hover:bg-gray-800/60 transition-colors"
        >
          <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Workouts
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="px-5 py-4 space-y-4 bg-gray-800/30"
          >
            <p className="text-xs text-gray-400">
              Timed exercise sessions tracked through voice channels -- like study time, but for working out.
              Members type <code className="bg-gray-700 px-1 rounded text-[#DDB21D]">/workout start</code> in Discord, then join a voice channel to track their workout. They earn LionCoins when the session meets the minimum length.
            </p>
            <Slider
              label="Minimum workout length"
              value={config.min_workout_length ?? 15}
              min={5}
              max={60}
              step={5}
              onChange={(v) => onUpdate("min_workout_length", v)}
              suffix=" min"
              description="A workout must last at least this long to earn a reward"
            />
            <Slider
              label="Workout reward"
              value={config.workout_reward ?? 100}
              min={0}
              max={500}
              step={10}
              onChange={(v) => onUpdate("workout_reward", v)}
              description="LionCoins earned for completing a workout session"
            />
          </motion.div>
        )}
      </div>
    </StepLayout>
  )
}
