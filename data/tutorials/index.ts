// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Tutorial system types, registry, and lookup helpers
// ============================================================

export interface TutorialStep {
  id: string
  title: string
  paragraphs: string[]
  command?: string
  tip?: string
  interactive?: string
}

export interface Tutorial {
  slug: string
  title: string
  description: string
  audience: "member" | "admin"
  iconName: string
  estimatedMinutes: number
  steps: TutorialStep[]
  nextSlug?: string
  prevSlug?: string
}

import { memberTutorials } from "./memberTutorials"
import { adminTutorials } from "./adminTutorials"

export const allTutorials: Tutorial[] = [...memberTutorials, ...adminTutorials]

export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return allTutorials.find((t) => t.slug === slug)
}

export function getTutorialsByAudience(audience: "member" | "admin"): Tutorial[] {
  return allTutorials.filter((t) => t.audience === audience)
}

export function getAllSlugs(): string[] {
  return allTutorials.map((t) => t.slug)
}
