// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: Send Discord webhook notifications for dashboard
//          logins and survey completions with full stats
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
  if (!WEBHOOK_URL) {
    console.warn("[Webhook] SURVEY_WEBHOOK_URL is not set, skipping")
    return
  }
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error(`[Webhook] Discord returned ${res.status}: ${text}`)
    }
  } catch (err) {
    console.error("[Webhook] Failed to send:", err)
  }
}

function formatDistribution(
  rows: { value: string; count: number }[],
  total: number
): string {
  if (rows.length === 0) return "No data yet"
  return rows
    .map((r) => {
      const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
      const label = r.value.replace(/_/g, " ")
      return `${label}: **${r.count}** (${pct}%)`
    })
    .join("\n")
}

async function getFieldDistribution(field: string, limit = 10) {
  const rows = await prisma.$queryRawUnsafe<{ value: string; count: bigint }[]>(
    `SELECT ${field} AS value, COUNT(*) AS count
     FROM user_survey
     WHERE completed_at IS NOT NULL AND ${field} IS NOT NULL
     GROUP BY ${field}
     ORDER BY count DESC
     LIMIT ${limit}`
  )
  return rows.map((r) => ({ value: r.value, count: Number(r.count) }))
}

export async function notifyLogin(payload: LoginPayload) {
  console.log(`[Webhook] notifyLogin called for ${payload.discordId}, URL set: ${!!WEBHOOK_URL}`)
  const [totalEmails, todayEmails, totalSurveys, completedSurveys] =
    await Promise.all([
      prisma.user_config.count({ where: { email: { not: null } } }),
      prisma.user_config.count({
        where: {
          email: { not: null },
          last_seen: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.user_survey.count(),
      prisma.user_survey.count({ where: { completed_at: { not: null } } }),
    ])

  const surveyRate = totalSurveys > 0 ? Math.round((completedSurveys / totalSurveys) * 100) : 0

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
          text: `Emails: ${totalEmails} (${todayEmails} today) | Surveys: ${completedSurveys}/${totalSurveys} (${surveyRate}%)`,
        },
        timestamp: new Date().toISOString(),
      },
    ],
  })
}

export async function notifySurveyCompleted(payload: SurveyPayload) {
  console.log(`[Webhook] notifySurveyCompleted called for ${payload.discordId}, URL set: ${!!WEBHOOK_URL}`)
  const [completed, dismissed, total] = await Promise.all([
    prisma.user_survey.count({ where: { completed_at: { not: null } } }),
    prisma.user_survey.count({
      where: { dismissed_at: { not: null }, completed_at: null },
    }),
    prisma.user_survey.count(),
  ])
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0

  const [countries, ages, genders, useCases, fields, education] =
    await Promise.all([
      getFieldDistribution("country", 8),
      getFieldDistribution("age_range"),
      getFieldDistribution("gender"),
      getFieldDistribution("use_case"),
      getFieldDistribution("field_of_study", 10),
      getFieldDistribution("education_level"),
    ])

  await sendWebhook({
    embeds: [
      {
        title: "Survey Completed",
        color: 0x22c55e,
        fields: [
          { name: "User", value: `<@${payload.discordId}>`, inline: true },
          { name: "Country", value: payload.country || "—", inline: true },
          { name: "Age", value: payload.age_range || "—", inline: true },
          {
            name: "Gender",
            value: payload.gender?.replace(/_/g, " ") || "—",
            inline: true,
          },
          { name: "Use Case", value: payload.use_case || "—", inline: true },
          {
            name: "Field",
            value: payload.field_of_study?.replace(/_/g, " ") || "—",
            inline: true,
          },
          {
            name: "Education",
            value: payload.education_level?.replace(/_/g, " ") || "—",
            inline: true,
          },
        ],
        footer: {
          text: `Completed: ${completed} | Dismissed: ${dismissed} | Total: ${total} | Rate: ${rate}%`,
        },
        timestamp: new Date().toISOString(),
      },
      {
        title: "Survey Trends",
        color: 0x3b82f6,
        fields: [
          {
            name: `Top Countries (${countries.reduce((s, r) => s + r.count, 0)} responses)`,
            value: formatDistribution(countries, completed),
            inline: false,
          },
          {
            name: "Age Ranges",
            value: formatDistribution(ages, completed),
            inline: true,
          },
          {
            name: "Gender",
            value: formatDistribution(genders, completed),
            inline: true,
          },
          {
            name: "Use Case",
            value: formatDistribution(useCases, completed),
            inline: true,
          },
          {
            name: "Field of Study",
            value: formatDistribution(fields, completed),
            inline: true,
          },
          {
            name: "Education Level",
            value: formatDistribution(education, completed),
            inline: true,
          },
        ],
      },
    ],
  })
}
