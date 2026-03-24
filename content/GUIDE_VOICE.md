# LionBot Guide Writing Voice & Context

> This file is the single source of truth for writing LionBot guide articles.
> Every AI session that writes guides should read this file first.

---

## Who Is Writing

All guides are written from the perspective of **Ari Horesh**, founder of LionBot. They are written in **first person** ("I built this because...") with an **enthusiastic, genuine** tone.

### Ari's Background

- Final-year medical student who built LionBot as a side project
- Started a study-with-me YouTube channel that grew a large community
- Built the bot in 2021 originally for his own Discord community ("Study Lions")
- Other servers kept asking for the bot, so he invested his own time and money to make it available to everyone
- Personally uses the pomodoro technique daily for medical school studying
- Proud that LionBot is the #1 educational Discord bot, serving 70,000+ servers and millions of users worldwide
- The bot is now used beyond study servers -- any community that wants to gamify their experience

### Why LionBot Is Free

All three reasons -- intertwined:
1. Productivity tools should be accessible to everyone
2. It started as a passion project for his own community
3. Core features are completely free; optional cosmetics (LionGems/skins) help sustain the project

---

## Writing Style Rules

### Tone
- **Enthusiastic and genuine** -- Ari is excited about what he's built and wants to share it
- First person throughout ("I built this", "when I was studying for exams")
- Friendly and approachable, like talking to a friend who happens to know a lot about Discord bots
- NOT corporate, NOT stiff, NOT salesy
- No emojis in article text
- Confident but not arrogant -- let the numbers speak naturally

### Structure (Every Guide)
1. **Personal hook / story** (2-3 paragraphs) -- Why this feature exists, personal connection
2. **What the feature does** -- Clear explanation for someone who's never heard of it
3. **Quick CTA** -- Casual "Add the bot" button early in the article
4. **Step-by-step setup** -- Detailed how-to with commands, screenshots/diagrams
5. **Tips & best practices** -- Real advice from experience
6. **FAQ section** -- Common questions (generates FAQ rich results in Google)
7. **Final CTA** -- Bottom invite block
8. **Author sign-off** -- "- Ari, Founder of LionBot"

### CTA Style
Super casual: "Go ahead, add the bot. It's free, I promise"
Use `<InviteCTA>` component -- appears at least twice per article (early + end).

### Numbers & Credibility
- DO mention scale: "70,000+ servers", "millions of users", "#1 educational Discord bot"
- Keep it natural, not braggy -- weave into the story
- Example: "What started as a small bot for my study group is now used in over 70,000 Discord servers."

### SEO Requirements
- H1 is the article title (handled by layout)
- Use H2 for major sections, H3 for sub-sections
- Include target keyword in first paragraph, H2s, and naturally throughout
- Add `<FAQSection>` at the end with 5-8 questions (generates FAQ JSON-LD for Google)
- Internal links to related guides and tutorials
- External links to relevant resources (Discord docs, etc.)
- Keep paragraphs short (2-4 sentences max)
- Use bullet lists for scanability

### Visual Assets
- Generate dynamic visuals: mock Discord UI, feature diagrams, workflow illustrations
- Use `<CommandShowcase>` for every Discord command mentioned
- Use `<Tip>`, `<Warning>`, `<Info>` callout blocks for advice
- All images should be built as components or generated -- no external image hosting dependencies

### Article Frontmatter Template

```yaml
---
title: "SEO-optimized title with primary keyword"
description: "150-160 char meta description with keyword"
slug: "keyword-slug"
keywords: ["primary keyword", "secondary keyword", "long tail 1", "long tail 2"]
category: "productivity|economy|setup|customization|moderation|community"
author: "Ari Horesh"
publishedAt: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD"
featured: true|false
draft: false
---
```

---

## Article Categories

| Category | Description | Color |
|---|---|---|
| productivity | Pomodoro, study tracking, tasks, goals, focus | Blue |
| economy | Coins, shop, ranks, leaderboards | Amber |
| setup | Getting started, server setup, permissions | Green |
| customization | Skins, branding, role menus, profiles | Purple |
| moderation | Moderation tools, video channels | Red |
| community | Private rooms, schedule, social features | Cyan |

---

## Key Phrases to Use Naturally

- "I built this because..." (personal connection)
- "When I was studying for my medical exams..." (authenticity)
- "Go ahead, add the bot. It's free, I promise" (CTA)
- "What started as a small bot for my study group..." (origin story)
- "Over 70,000 servers trust LionBot..." (social proof)
- "The best part? It's completely free." (value prop)

## Things to NEVER Do

- Never sound like a sales pitch or corporate copy
- Never use emojis in article body text
- Never make claims without backing them up
- Never write walls of text without visual breaks
- Never skip the personal story section
- Never forget the FAQ section (critical for SEO)
- Never publish without proper frontmatter keywords
