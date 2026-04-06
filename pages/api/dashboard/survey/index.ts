// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-06
// Purpose: GET survey status / POST survey answers for the
//          "Get to know you" widget
// ============================================================
import type { NextApiRequest, NextApiResponse } from "next"
import { requireAuth, unauthorized } from "@/utils/adminAuth"
import { prisma } from "@/utils/prisma"
import { notifySurveyCompleted } from "@/utils/surveyWebhook"

const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000

const VALID_USE_CASES = ["study", "community"]
const VALID_GENDERS = ["male", "female", "non_binary", "prefer_not_to_say"]
const VALID_AGE_RANGES = ["13-17", "18-24", "25-34", "35-44", "45+"]
const VALID_EDUCATION = [
  "high_school", "undergraduate", "graduate", "phd", "professional", "other",
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const auth = await requireAuth(req, res)
  if (!auth) return

  if (req.method === "GET") {
    const survey = await prisma.user_survey.findUnique({
      where: { userid: auth.userId },
    })

    if (!survey) {
      return res.json({ status: "pending" })
    }
    if (survey.completed_at) {
      return res.json({ status: "completed" })
    }
    if (
      survey.dismissed_at &&
      Date.now() - survey.dismissed_at.getTime() < DISMISS_DURATION_MS
    ) {
      return res.json({
        status: "dismissed",
        dismissedUntil: new Date(
          survey.dismissed_at.getTime() + DISMISS_DURATION_MS
        ).toISOString(),
      })
    }
    return res.json({ status: "pending" })
  }

  if (req.method === "POST") {
    const { country, use_case, gender, age_range, field_of_study, education_level } =
      req.body || {}

    if (use_case && !VALID_USE_CASES.includes(use_case)) {
      return res.status(400).json({ error: "Invalid use_case" })
    }
    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ error: "Invalid gender" })
    }
    if (age_range && !VALID_AGE_RANGES.includes(age_range)) {
      return res.status(400).json({ error: "Invalid age_range" })
    }
    if (education_level && !VALID_EDUCATION.includes(education_level)) {
      return res.status(400).json({ error: "Invalid education_level" })
    }

    await prisma.user_survey.upsert({
      where: { userid: auth.userId },
      update: {
        country: country || undefined,
        use_case: use_case || undefined,
        gender: gender || undefined,
        age_range: age_range || undefined,
        field_of_study: field_of_study || undefined,
        education_level: education_level || undefined,
        completed_at: new Date(),
      },
      create: {
        userid: auth.userId,
        country: country || null,
        use_case: use_case || null,
        gender: gender || null,
        age_range: age_range || null,
        field_of_study: field_of_study || null,
        education_level: education_level || null,
        completed_at: new Date(),
      },
    })

    notifySurveyCompleted({
      discordId: auth.discordId,
      country: country || null,
      age_range: age_range || null,
      gender: gender || null,
      use_case: use_case || null,
      field_of_study: field_of_study || null,
      education_level: education_level || null,
    }).catch(() => {})

    return res.json({ status: "completed" })
  }

  res.setHeader("Allow", "GET, POST")
  return res.status(405).json({ error: "Method not allowed" })
}
