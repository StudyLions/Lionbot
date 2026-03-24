// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-14
// Purpose: Dynamic tutorial page - renders any tutorial by slug
// ============================================================
import { GetServerSideProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Layout from "@/components/Layout/Layout"
import TutorialLayout from "@/components/tutorials/TutorialLayout"
import TutorialStep from "@/components/tutorials/TutorialStep"
import { getTutorialBySlug, getAllSlugs } from "@/data/tutorials"
import type { Tutorial } from "@/data/tutorials"

interface TutorialPageProps {
  tutorial: Tutorial
}

export default function TutorialPage({ tutorial }: TutorialPageProps) {
  if (!tutorial) {
    return (
      <Layout SEO={{ title: "Tutorial Not Found - LionBot", description: "This tutorial does not exist." }}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Tutorial not found</h1>
          <a href="/tutorials" className="text-primary hover:underline text-sm">
            Back to all tutorials
          </a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout
      SEO={{
        title: `${tutorial.title} - LionBot Tutorials`,
        description: tutorial.description,
      }}
    >
      <TutorialLayout tutorial={tutorial}>
        {/* --- AI-MODIFIED (2026-03-24) --- */}
        {/* Purpose: Pass warning and note props to TutorialStep */}
        {tutorial.steps.map((step, i) => (
          <TutorialStep
            key={step.id}
            stepNumber={i + 1}
            totalSteps={tutorial.steps.length}
            title={step.title}
            paragraphs={step.paragraphs}
            command={step.command}
            tip={step.tip}
            warning={step.warning}
            note={step.note}
            interactive={step.interactive}
          />
        ))}
        {/* --- END AI-MODIFIED --- */}
      </TutorialLayout>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<TutorialPageProps> = async ({ params, locale }) => {
  const slug = params?.slug as string
  const tutorial = getTutorialBySlug(slug)

  if (!tutorial) {
    return { notFound: true }
  }

  return {
    props: {
      tutorial,
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  }
}
