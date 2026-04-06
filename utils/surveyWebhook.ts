// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: Send Discord webhook notifications for dashboard
//          logins and survey completions with running stats
// ============================================================
import { prisma } from "./prisma"

const WEBHOOK_URL = process.env.SURVEY_WEBHOOK_URL

interface LoginPayload {
  discordId: string
  email: string
  emailVerified: boolean | null
}

interface SurveyPayload {
  discordId: string
  country: string | null
  age_range: string | null
  gender: string | null
  use_case: string | null
  field_of_study: string | null
  education_level: string | null
}

async function sendWebhook(body: object) {
  if (!WEBHOOK_URL) return
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {}
}

async function getEmailStats() {
  const total = await prisma.user_config.count({
    where: { email: { not: null } },
  })
  const today = await prisma.user_config.count({
    where: {
      email: { not: null },
      last_seen: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
  })
  return { total, today }
}

async function getSurveyStats() {
  const [completed, dismissed, total] = await Promise.all([
    prisma.user_survey.count({ where: { completed_at: { not: null } } }),
    prisma.user_survey.count({
      where: { dismissed_at: { not: null }, completed_at: null },
    }),
    prisma.user_survey.count(),
  ])
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, dismissed, total, rate }
}

export async function notifyLogin(payload: LoginPayload) {
  const stats = await getEmailStats()
  await sendWebhook({
    embeds: [
      {
        title: "New Dashboard Login",
        color: 0x5865f2,
        fields: [
          { name: "User", value: `<@${payload.discordId}>`, inline: true },
          { name: "Email", value: payload.email, inline: true },
          {
            name: "Verified",
            value: payload.emailVerified ? "Yes" : "Unknown",
            inline: true,
          },
        ],
        footer: {
          text: `Total emails: ${stats.total} | Today: ${stats.today}`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  })
}

export async function notifySurveyCompleted(payload: SurveyPayload) {
  const stats = await getSurveyStats()

  const fields = [
    { name: "User", value: `<@${payload.discordId}>`, inline: true },
    { name: "Country", value: payload.country || "—", inline: true },
    { name: "Age", value: payload.age_range || "—", inline: true },
    { name: "Gender", value: payload.gender?.replace("_", " ") || "—", inline: true },
    { name: "Use Case", value: payload.use_case || "—", inline: true },
    { name: "Field", value: payload.field_of_study?.replace("_", " ") || "—", inline: true },
    { name: "Education", value: payload.education_level?.replace("_", " ") || "—", inline: true },
  ]

  await sendWebhook({
    embeds: [
      {
        title: "Survey Completed",
        color: 0x22c55e,
        fields,
        footer: {
          text: `Completed: ${stats.completed} | Dismissed: ${stats.dismissed} | Rate: ${stats.rate}%`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
