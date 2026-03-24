// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-23
// Purpose: Individual guide article page. Statically generated
//          from MDX files in content/guides/ for optimal SEO.
// ============================================================
import { GetStaticPaths, GetStaticProps } from "next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import { NextSeo, ArticleJsonLd, FAQPageJsonLd, BreadcrumbJsonLd } from "next-seo"
import Layout from "@/components/Layout/Layout"
import GuideLayout from "@/components/guides/GuideLayout"
import { mdxComponents } from "@/components/guides/MDXComponents"
import {
  getAllGuideSlugs,
  getGuideBySlug,
  getRelatedGuides,
} from "@/lib/guides"
import type { GuideMeta } from "@/lib/guides"

interface GuidePageProps {
  meta: GuideMeta
  mdxSource: MDXRemoteSerializeResult
  related: GuideMeta[]
  faqItems: { question: string; answer: string }[]
}

export default function GuidePage({ meta, mdxSource, related, faqItems }: GuidePageProps) {
  const canonicalUrl = `https://lionbot.org/guides/${meta.slug}`
  const ogImageUrl = `https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com/og-images/guide-${meta.slug}.png`
  const fallbackOgImage = "https://dj03j4ltfyd6tjzw.public.blob.vercel-storage.com/og-images/guides.png"

  return (
    <Layout
      SEO={{
        title: `${meta.title} | LionBot`,
        description: meta.description,
        canonical: canonicalUrl,
        openGraph: {
          title: meta.title,
          description: meta.description,
          url: canonicalUrl,
          type: "article",
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: meta.title,
              type: "image/png",
            },
          ],
        },
      }}
    >
      <NextSeo
        additionalMetaTags={[
          { name: "keywords", content: meta.keywords.join(", ") },
          { name: "author", content: meta.author },
          { property: "article:published_time", content: meta.publishedAt },
          { property: "article:modified_time", content: meta.updatedAt },
          { property: "article:section", content: meta.category },
        ]}
      />

      <ArticleJsonLd
        type="Article"
        url={canonicalUrl}
        title={meta.title}
        images={[ogImageUrl, fallbackOgImage]}
        datePublished={meta.publishedAt}
        dateModified={meta.updatedAt}
        authorName={[{ name: meta.author, url: "https://lionbot.org" }]}
        publisherName="LionBot"
        publisherLogo="https://lionbot.org/apple-touch-icon.png"
        description={meta.description}
      />

      <BreadcrumbJsonLd
        itemListElements={[
          { position: 1, name: "Home", item: "https://lionbot.org" },
          { position: 2, name: "Guides", item: "https://lionbot.org/guides" },
          { position: 3, name: meta.title, item: canonicalUrl },
        ]}
      />

      {faqItems.length > 0 && (
        <FAQPageJsonLd
          mainEntity={faqItems.map((item) => ({
            questionName: item.question,
            acceptedAnswerText: item.answer,
          }))}
        />
      )}

      <GuideLayout meta={meta} related={related}>
        <MDXRemote {...mdxSource} components={mdxComponents} />
      </GuideLayout>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllGuideSlugs()

  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps<GuidePageProps> = async ({ params, locale }) => {
  const slug = params?.slug as string
  const guide = getGuideBySlug(slug)

  if (!guide) {
    return { notFound: true }
  }

  const mdxSource = await serialize(guide.content, {
    parseFrontmatter: false,
  })

  const related = getRelatedGuides(slug, 3)

  const faqItems = extractFAQItems(guide.content)

  const { content: _content, ...meta } = guide

  return {
    props: {
      meta,
      mdxSource,
      related,
      faqItems,
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
    revalidate: 60,
  }
}

function extractFAQItems(mdxContent: string): { question: string; answer: string }[] {
  const faqMatch = mdxContent.match(/<FAQSection\s+items=\{(\[[\s\S]*?\])\}/m)
  if (!faqMatch) return []

  try {
    const cleaned = faqMatch[1]
      .replace(/'/g, '"')
      .replace(/,\s*\]/g, "]")
      .replace(/,\s*\}/g, "}")
    return JSON.parse(cleaned)
  } catch {
    return []
  }
}
