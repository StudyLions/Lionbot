// ============================================================
// AI-GENERATED FILE
// Created: 2026-04-05
// Purpose: Timeline/changelog data for the public /timeline page
// ============================================================

export type TimelineCategory =
  | "feature"
  | "improvement"
  | "bugfix"
  | "liongotchi"
  | "premium"
  | "website";

export type TimelineArea = "bot" | "website" | "both";

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  category: TimelineCategory;
  area: TimelineArea;
}

export const TIMELINE_ENTRIES: TimelineEntry[] = [
  // ── April 25, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-25",
    title: "LionHeart Studio — A Real Studio for Customizing Your Profile Card",
    description:
      "We rebuilt the entire LionHeart supporter dashboard from scratch and turned it into something that actually feels like the premium product you're paying for. The old page was a 1,200-line vertical settings form: six separate color sections each with fourteen swatches, four dropdowns, a Save button, a Refresh Preview button, and a tiny preview buried at the bottom that you'd scroll back up from to tweak the next slider. The new LionHeart Studio puts your live profile card in a sticky Discord-style chat frame on the left side of the screen with a fake 'Just hit 2h 14m of focused study today' message above it, so you can finally see exactly how your card lands in chat as you tweak it. On the right, all the controls are split into five clean tabs — Looks, Colors, Motion, Frame, Profile — and there's no Save button anymore. Every change auto-saves in the background after a 600ms pause and auto-renders a fresh preview after 800ms, with a small 'Saved ✓' / 'Rendering…' / 'Saving…' status pill in the corner so you always know what state your card is in. The Looks tab leads with twelve hand-tuned curated themes (Royal Gold, Cyber Pink, Cozy Garden, Holographic, Minimal Ice, Stardust, Snowstorm, Lightning Strike, Hearts on Fire, Black Diamond, Sakura, Inferno) — one click applies a coordinated palette, particle style, border and animation speed in one go. Each look has a mini animated SVG preview that runs entirely in your browser (no API call), and there's a Surprise Me button that picks a random look and tints it. The Colors tab swaps the old swatch-grid blocks for a single palette node graph showing all six color targets (sparkle, ring, glow, particle, username, embed) as live-glowing nodes you click to recolor — a Link All toggle changes them all together, and there's a built-in HSL editor with hue/saturation/lightness sliders, a hex input, harmony auto-fill (mono / analogous / complementary / triadic), and a recent colors strip. The Motion tab has six self-animating particle-style cards that show you exactly what each shape looks like falling behind your card (no render needed), an intensity slider with a 25-cell density preview, and a speed picker with a real animated speedometer needle. The Frame tab has six SVG-rendered border style previews. The Profile tab keeps bio text, the seasonal toggle (now with a calendar tooltip showing the four date windows and which one is currently active), an embed accent picker with a live mock embed preview, and the timer personalization. There's also a Compare button that side-by-sides your saved version against your draft so you can see exactly what you've changed. The hero header at the top is now a tier-colored card with a shimmering badge, an animated boost shelf showing your monthly gems / coin boost / farm growth / drop rate / LionGotchi gold / unlocked timer themes, and three actions (Manage subscription, Surprise me, Reset to defaults). Top-tier supporters (LionHeart++) now get a thank-you celebration card at the bottom of the page instead of an upgrade pitch. The whole experience is sticky on desktop, stacks cleanly on mobile, and the card preview backend rate limit was relaxed from 5 seconds to 1.5 seconds for active supporters so the auto-render flows without ever feeling throttled.",
    category: "premium",
    area: "website",
  },
  {
    date: "2026-04-25",
    title: "Fixed: USD Subscribers Were Not Getting Their Gems or LionHeart++ Server Premium",
    description:
      "We caught and fixed a serious bug today affecting anyone who subscribed to LionHeart, LionHeart+, or LionHeart++ in US dollars. The Stripe webhook that activates your perks the moment you finish checkout was checking your purchased Stripe Price ID against the wrong list of known IDs — it only knew about our older EUR price IDs, not the newer USD ones — so every USD subscription came in flagged as 'no tier'. The dashboard showed you as a supporter (because the subscription itself was active in Stripe and recorded correctly), but no monthly LionGems were credited, the included server premium slot for LionHeart++ was not provisioned, and your top.gg vote rewards quietly fell back to the free 5-gem rate instead of the boosted 10/15/30 amounts. We rewrote the webhook's price-to-tier mapping to recognize all four families of price IDs we have configured (USD, EUR, plus the legacy public ones) and trim trailing whitespace, and we added a loud warning log so the next time someone adds a new Stripe price we'll spot it immediately instead of silently downgrading the subscriber. We also went back and made the three affected accounts whole — credited the missing first-month LionGems (3000 / 1200 / 1200), set the right subscription tier on each row, and provisioned the LionHeart++ server premium slot for the user who paid for that tier. If you subscribed in USD any time in the last few weeks and noticed your perks weren't showing up, you should now see your full balance and tier on your dashboard.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-04-25",
    title: "Email — Welcomes, Weekly Recaps, and Full Control Over What Lands in Your Inbox",
    description:
      "We launched our first proper email program this week. The moment you sign in with Discord for the first time, you now get a warm welcome email with a short list of things to try — and if you happen to own or moderate one of the servers running LionBot, you get a different version of that email with a 5-step setup checklist that deep-links straight into your server's dashboard (greetings, ranks, shop, role menus, pomodoro). It is one-time and idempotent — signing in a second time will not double-send. Every Sunday evening (18:00 UTC), if you have studied at all that week, you will get a weekly recap with your focus time vs. last week, your current streak, tasks completed, your top server, LionGems earned, and a personalised highlight (\"Beat last week by 3.2 hours\", \"First 10-hour week!\", that kind of thing). The numbers come from the same place as your dashboard so they will always match. Every email is fully on-brand — same blues, same warm cream background, same font feel as the dashboard — with a logo header and a clean footer with one-click unsubscribe and a link to manage preferences. Speaking of: there is a brand-new Email Notifications card on /dashboard/settings where you can toggle each category individually (welcome, weekly digest, lifecycle, premium, announcements) or hit the big red 'Unsubscribe from all' button if you want a clean break — and there is a public unsubscribe page that works without you having to be signed in at all. Gmail and Outlook will also show their native unsubscribe button on every message because we added the proper RFC 8058 List-Unsubscribe headers. Every marketing email closes with a small premium block that adapts to your tier — free users see what they would unlock with LionHeart, LionHeart users see why LionHeart+ is worth it, top supporters get a thank-you instead of a pitch.",
    category: "feature",
    area: "website",
  },
  // ── April 24, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-24",
    title: "A Refreshed Homepage and Premium Page",
    description:
      "We gave the homepage and the premium (donate) page a big visual refresh so the site finally feels as polished as the bot it's selling. The homepage now opens with a redesigned hero featuring a floating 'live activity' card showing how many people are studying right now, how many are in voice rooms, and the lifetime session count — with a small ring of community avatars underneath. Right under the hero, a slim trust strip surfaces three live counters (active servers, members tracked, study sessions) so the social proof is above the fold instead of buried halfway down the page. The three separate LionGotchi sections (your pet, the farm, the marketplace) have been collapsed into a single section with a tab switcher, which both shortens the page and tells a tighter 'this is one connected ecosystem' story. A new premium teaser block sits between the trailer and the how-it-works steps with a glowing animated profile-card preview, three perks, and dual CTAs that bridge to the premium page. The how-it-works section trades its three numbered circles for three illustrated step tiles (an invite-button mock, a dashboard-toggles mock, and a live-stats mock with a pulse dot). The page closes on a bolder full-width gradient banner with three CTAs — Add to Discord, View Premium, Join Discord. The premium page got an even bigger overhaul: a new split hero with an animated showcase, an 'audience chooser' strip so you can jump straight to Personal / Server / Gems, a value-pillars 'why upgrade' block, redesigned tier cards with a clearly dominant 'Most Popular' LionHeart+ tier, an always-visible comparison grid (no more hidden table), a 'what you give up on free' loss-aversion strip, restyled gem packages with a 'Best Value' badge and a 'what gems unlock' sidebar, a trust band before the FAQ, a mobile swipe carousel for the tier cards, and a sticky pricing CTA bar that slides in once you scroll past the tiers. Every Subscribe / Pay button now has risk-reversal microcopy underneath ('Cancel anytime · Secure with Stripe · Instant activation') and the modal CTAs read 'Pay €X with Stripe' and 'Sign in with Discord to checkout' instead of generic 'Confirm Purchase' wording. Both pages were also migrated off the old hardcoded grey palette onto the same shadcn design tokens the dashboard uses, so the whole site now feels like one cohesive product.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-24",
    title: "Plant Your Whole Farm in One Click",
    description:
      "We added a 'Plant All' button to the toolbar on both the personal farm and the family farm in your LionGotchi dashboard, in response to a request from a member of one of our families. Previously, planting on a farm with 15 plots meant clicking each empty plot one-by-one, picking a seed, and confirming — and on a family with multiple farms, that turned into 50–150 separate clicks just to fill everything for a study session. Now, with at least one empty plot on the active farm, a green 'Plant All (N)' button appears next to the Water All / Harvest All buttons. Clicking it opens the same familiar seed shop, but every seed card shows the total batch cost upfront (e.g. '120G' with '10G x 12' beneath, instead of just '10G'), and the green action button reads 'Buy & Plant All (12)' so you can see exactly how many plots and how much gold you're committing before clicking. The server validates you can afford the full batch before any gold is spent — there's no 'partially planted' state. Each plot still rolls its own rarity independently, so you can absolutely still get a lucky LEGENDARY in the middle of a Plant All batch (and we'll tell you in the success toast: 'Planted 12 x Carrot for 120G — 1 RARE!'). Family farm planting respects the same plant_farm permission as single-plot planting, and the gold comes from the family treasury (clearly labelled in the dialog so members don't confuse it with their personal balance). Dead plants still need to be cleared with the existing 'Clear Dead' button before they count as empty — keeping that step explicit means no surprise gold drains. Thanks to Gaijin Yakuza for the suggestion.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 23, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-23",
    title: "Mods Can Now Edit Pomodoro Timers They Created (Bug Report #0041)",
    description:
      "Spotted a frustrating inconsistency in how Pomodoro timer permissions worked: anyone with the 'Manage Channels' permission could create a brand-new Pomodoro timer in a voice channel using `/pomodoro create` (with any focus length, break length, voice alerts, custom name, etc.) — but the moment they tried to change one of those same settings later via `/pomodoro edit`, the bot would refuse with a 'You don't have permission' error. The fix is now live: for regular guild voice-channel timers (the kind a mod creates for the whole server to use), `/pomodoro edit` now uses the exact same permission check as `/pomodoro create`. If you can create the timer, you can edit it. Private study room timers — the kind tied to a specific room owner — keep their stricter rules: only the room owner or a server admin can change those, so random mods can't override what a room owner has set up. We also tightened up a tiny related gap where the 'Voice Alerts' button on the timer settings UI had no permission check at all (anyone with access to the menu could toggle it). Now it follows the same rules as everything else — same role gates as the matching slash command parameter. Thanks to the user who filed bug report #0041.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-23",
    title: "Manage Your Subscription: Switch Plans, Currencies, and Add Tax IDs From Stripe",
    description:
      "We gave the 'Manage Subscription' page on Stripe a long-overdue tune-up so it actually reflects what you can subscribe to today. If you have a LionHeart subscription, the 'Change plan' option now shows the current pricing for all three tiers (LionHeart, LionHeart+, LionHeart++) in both USD and EUR — previously it was still showing the original launch prices from earlier this year. If your server has Server Premium, you can now switch between monthly and yearly plans (and between USD and EUR) right from the portal without having to cancel and re-subscribe — that flow used to be missing entirely, so admins had to email us to switch billing frequency. We also added the missing Privacy Policy and Terms of Service links to the portal footer (small thing, but Stripe was nagging us about it), and unlocked the ability to add a billing name, address, phone number, and tax ID to your account. The tax ID field in particular helps EU and UK customers get proper VAT-compliant invoices. None of this changes what you're charged or how your existing subscription works — it just gives you proper self-service over the parts of your subscription you should always have been able to control.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-23",
    title: "Family 'Leave' Button Now Asks for Confirmation",
    description:
      "We had a few reports that members were tapping the 'Leave' button on the family hub by accident — usually meaning to tap one of the buttons next to it — and then getting stuck on the 7-day cooldown before they could rejoin or join another family. The button now opens a confirmation prompt first: a clear warning embed reminding you that you won't be able to join another family for 7 days, plus a red 'Yes, Leave' button and a grey 'Cancel' button. The leader-side 'Disband' button gets the same treatment, with extra wording that the bank items and treasury gold will be returned to you. Tapping the wrong button is now harmless — just hit Cancel and you're back to the family hub. Thanks to Sky for the suggestion.",
    category: "improvement",
    area: "bot",
  },
  {
    date: "2026-04-23",
    title: "Room Decorating: Drag Feels Smoother on Phones, and Items Can No Longer Hide Off-Screen",
    description:
      "Two follow-up tweaks to the LionGotchi room editor based on a bug report from a member of Comité des jeunes Lit Up. First, when you drag a piece of furniture on a phone, the movement now feels noticeably smoother — touchscreens fire 'finger moved' events extremely fast (over 100 times a second on most devices), and we were running a full re-render on every single one of those events, which made the chair you were dragging stutter behind your finger. The drag now updates at most once per screen refresh (60 times a second), which is what your eye can actually see anyway, so the chair sticks to your finger instead of trailing it. Second, we tightened the off-canvas guardrail. Most furniture sprites are 200x200 images where the actual visible chair, lamp, or rug only takes up a smaller portion of the middle — the corners are transparent. Our previous safety check looked at the full 200x200 image, so you could still accidentally drag a lamp far enough that the only thing 'on-canvas' was an invisible transparent corner, making the lamp seem to vanish. The new check uses each item's true visible area, so at least 24 pixels of the actual chair/lamp/rug stays on the canvas no matter how aggressively you drag. No more lost decorations.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 21, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-21",
    title: "Room Decorating: Smoother Drag, Matching Colors Everywhere, and a Mobile-Friendly Preview",
    description:
      "We tackled four bugs in the LionGotchi room editor that had been making decorating frustrating. First — and the biggest one — some wallpapers and furniture were showing up in completely different colors on the website than what your pet actually had on Discord (a 'bookcase wall' might look green in the editor but show up purple in the bot's profile cards). Under the hood, the website's image library on our CDN had drifted out of sync with the bot's local files over the past few months, so we wrote a sync tool and re-uploaded all 312 room asset images straight from the bot. Now whatever color you pick on the website is exactly what shows up on Discord. Second, when you placed or swapped a piece of furniture, you sometimes had to click it a second time before it would render — and the canvas would briefly flash blank while the new image loaded. We fixed both: images now load incrementally instead of being wiped and reloaded together, and items appear immediately on first equip even before they're added to your saved layout order. Third, the drag-to-position controls now keep at least 20 pixels of every decoration on-screen, so you can't accidentally fling a chair or rug into the void where you can't grab it back. Fourth, on phones, the room preview on the /pet overview and on friends' profiles was getting cut off by the Gameboy frame; the canvas and frame are now fully responsive and scale to whatever size your screen has. Decorating should feel a lot less janky now.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 20, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-20",
    title: "Disable Auto-Blacklisting (and Wipe Active Bans) From the Dashboard",
    description:
      "We heard from a few admins this week that when LionBot kicks a member from a camera-required or screen-share channel, it can also assign a 'blacklist' role for repeat offenders — and there was no obvious way to turn that off, or to clear out everyone who was already affected. Both problems are now solved on the dashboard. The Video Channels page now has a clearly labelled 'Auto-Blacklisting' card that shows whether the feature is ON or OFF in plain language, with a one-click 'Disable' button next to the role selector — clear it, save, and members will only ever be kicked, never auto-blacklisted again. We also built a brand-new Screen Channels page with the exact same controls (previously screen-share enforcement was only configurable via slash command). And if you've already accumulated a list of currently-blacklisted members, both pages now show how many are active and let you 'Clear All Active Blacklists' — which pardons every active record AND removes the role from each affected member in Discord, in one action, with a typed confirmation and an audit trail. Built in response to a support ticket from a Study Space admin asking exactly how to do this.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-20",
    title: "Pomodoro Voice Alerts Are Audible Again",
    description:
      "If you had voice alerts enabled on a Pomodoro timer, you may have noticed that lately the bot would join the channel for a few seconds each round but no chime would actually play (or, on some systems, you'd hear a faint click followed by silence). After digging into a stubborn report from a regular user whose timer had been silent for weeks, we found the root cause: the bot was sending the raw bytes of the alert sound files directly to Discord, but Discord's voice service expects the audio to be in a very specific format (48 kHz raw PCM). Our alert files were 44.1 kHz WAV files with a header on top, so what Discord actually received was a brief blip of header noise followed by audio it couldn't make sense of — which most ears interpret as silence. We now route the alert through ffmpeg, which decodes the WAV file and converts it to exactly the format Discord wants. Same alert sounds, same timing, same volume — just actually audible now. The fix mirrors how our SoundsBot has always played its rain/campfire/LoFi tracks, which is why those have been working perfectly.",
    category: "bugfix",
    area: "bot",
  },
  // ── April 19, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-19",
    title: "Send a Partial Stack of Items to Friends",
    description:
      "When you gift an item to a friend on the website, you can now choose how many to send instead of being forced to ship the entire stack. Pick an item, type the quantity (or hit \"All\"), and the rest stays in your inventory. Stacks of 1 work the same as before — no extra tap. Enhanced or scrolled gear still has to be sent as the whole stack, since the bonuses are tied to the stack itself and can't be cleanly split. Requested by an admin who wanted to send a few scrolls to a friend without losing the rest of their own collection.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-19",
    title: "/strikes Now Loads Instantly for High-Offense Users",
    description:
      "If a server had a long moderation history, the /strikes command would sometimes get stuck on \"thinking…\" when looking up a member with lots of past offenses. Under the hood the bot was scanning the entire guild's ticket history just to compute the per-guild ticket numbering for everyone before it could filter to one person. We rewrote that lookup to use three small targeted queries instead, so the command now responds in under a second regardless of how many tickets the server has — and it skips the heavy file attachment data it didn't actually need.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-19",
    title: "Clearer Descriptions for the Rank Type Setting",
    description:
      "The dashboard previously labelled the \"XP\" rank type as \"Combined XP\" with a description that said it counted both voice time and messages. That was misleading — the bot's XP rank type only counts text/word activity (longer messages earn more); voice study time is its own separate metric. We've updated the labels and tooltips on the Settings page, the Ranks page, and the setup wizard so admins know exactly which activity each option counts. The setting itself didn't change — just the description of what it does.",
    category: "improvement",
    area: "website",
  },
  {
    date: "2026-04-19",
    title: "Anti-AFK Now Respects Untracked Channels (and Untrack Whole Categories from the Dashboard)",
    description:
      "Two related improvements. First, a bug fix: the Anti-AFK system was still sending activity check prompts in voice and stage channels that you'd marked as untracked in the Voice Tracker settings — including channels inside untracked categories like hangout or chat-only spaces. From now on, if a channel doesn't count toward study stats, Anti-AFK won't ping people there either. Second, you can now untrack a whole category in one click directly from the dashboard's Tracking Exclusions section (both for voice and text). Previously the dropdown only listed individual channels, so admins had to either pick every child channel one by one or use a slash command. Same goes for stage channels — they're properly handled across both improvements.",
    category: "bugfix",
    area: "both",
  },
  // ── April 17, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-17",
    title: "Reset a Member's Tracked Stats from the Dashboard",
    description:
      "Server admins can now selectively wipe a single member's tracked study data from the dashboard — voice and text study time, voice and text XP, pomodoro milestones, season stats, and (optionally) coins — with an optional time-frame filter (last 24 hours, last 7 days, last 30 days, custom range, or all time). Every reset shows a live preview of exactly what will be deleted, requires a written reason, and asks you to type the member's name to confirm. Each action is logged with the admin who ran it, the scope, and the rows affected, so nothing happens silently. Only admins of that specific server can use this, and the tool is locked to the targeted member in the targeted server — it cannot accidentally touch anyone else's data.",
    category: "feature",
    area: "website",
  },
  // ── April 10, 2026 ─────────────────────────────────────────
  {
    date: "2026-04-10",
    title: "Inventory QoL — Equip Best, Try On, and Marketplace Links",
    description:
      "We added three quality-of-life features to the pet inventory based on community feedback: an 'Equip Best' button that auto-equips your strongest items across all slots with one click, a 'Try On' preview that lets you see how any item looks on your lion before equipping or buying, and convenient marketplace links throughout the inventory page so you can easily browse for new gear.",
    category: "liongotchi",
    area: "website",
  },
  // ── April 7, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-07",
    title: "Privacy Dashboard — GDPR Compliance",
    description:
      "We added a new Privacy section to the dashboard where you can view a summary of all data we store about you, download a full copy of your data as a JSON file, or request deletion of your account data. Deletion requests include a 14-day cooling-off period and are reviewed by an admin before processing.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-07",
    title: "Room Inactivity Auto-Delete",
    description:
      "Server admins can now enable automatic cleanup of inactive private rooms. Set a number of days, and rooms with no messages or voice activity will be deleted automatically — with the remaining balance refunded to the owner. The dashboard also shows each room's last active time so admins can monitor activity at a glance.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-07",
    title: "Configurable Schedule Reminder Timing",
    description:
      "Server admins can now customize how early scheduled session reminders are sent, anywhere from 5 to 30 minutes before the session starts. Previously this was locked at 15 minutes. Configure it with /admin config schedule or through the bot's interactive settings panel.",
    category: "improvement",
    area: "bot",
  },
  // ── April 6, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-06",
    title: "Anti AFK System — Premium Voice Activity Checks",
    description:
      "We added a new premium feature that automatically checks if users in voice channels are still active. Admins can configure check intervals, grace periods, and choose between disconnecting, pausing sessions, or moving inactive users to the AFK channel. Everything is configured from the dashboard with smart exemptions for streaming users, pomodoro sessions, and specific roles or channels.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-04-06",
    title: "Schedule Reminder Mute + Notification Fix",
    description:
      "You can now mute scheduled session reminders with a button right on the DM itself, or from the dashboard profile page. We also fixed an issue where booking consecutive hourly slots would send a separate reminder for each hour — now you only get one notification for the entire block.",
    category: "improvement",
    area: "both",
  },
  // ── April 5, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-05",
    title: "Features Page Overhaul — 12 Sections, Live Stats & FAQ",
    description:
      "We completely rebuilt the features page with 5 new sections (Private Rooms, Tasks & Boards, Scheduled Sessions, Ambient Sounds, Web Dashboard), live stats counters, sticky category navigation, a 'More Features' grid, and a FAQ section. The page now showcases 20+ features instead of just 7.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-05",
    title: "Scheduled Sessions: Calendar, iCal Sync & Server View",
    description:
      "Your study sessions now appear on a beautiful monthly calendar. You can sync them to Google Calendar or Apple Calendar with one click. Server admins also get a calendar tab showing attendance across all sessions.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-05",
    title: "Room Notifications Toggle",
    description:
      "Server admins can now turn off the join/leave notification messages that appear inside private rooms. Find it in Server Settings under Private Rooms.",
    category: "improvement",
    area: "both",
  },
  {
    date: "2026-04-05",
    title: "Study Session Notifications Fixed",
    description:
      "Session reminders now send properly as DMs before the session starts, and the channel ping actually triggers a push notification on your phone.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-05",
    title: "Session Stats Labels Fixed",
    description:
      "The attendance stats on scheduled sessions no longer have invisible text on dark theme. Each stat now has its own clear label.",
    category: "bugfix",
    area: "bot",
  },

  // ── April 4, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-04",
    title: "Sound Bot Slash Commands",
    description:
      "All ambient sound bots now support 9 slash commands: /nowplaying, /skip, /volume, /sound, /panel, /history, /queue, /blacklist, and /status. Control your server's vibes without touching the dashboard.",
    category: "feature",
    area: "bot",
  },
  {
    date: "2026-04-04",
    title: "Sound Bot Trail Messages Fixed",
    description:
      "The sound bot was leaving behind old control panel messages every 10 minutes. We tracked down the cause and fixed it — no more message clutter in voice channels.",
    category: "bugfix",
    area: "bot",
  },

  // ── April 3, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-03",
    title: "Theme Picker — 5 Color Themes",
    description:
      "The dashboard now has 5 beautiful color themes: Midnight (the classic dark look), Light, Ocean, Forest, and Sunset. Find the theme switcher at the bottom of the sidebar.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "My Rooms — Complete Redesign",
    description:
      "The rooms dashboard got a total makeover with a two-panel layout. See all your rooms on the left, click one to manage it on the right — deposit coins, rename, invite or kick members, transfer ownership, and control the pomodoro timer.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "Admin Room Management Panel",
    description:
      "Server admins get a dedicated rooms panel with analytics, health stats, room search, freeze/unfreeze controls, bulk actions, CSV export, and a full audit log of admin actions.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "Leave Room Command",
    description:
      "Members can now voluntarily leave a private room with /room leave or the new Leave button on the room panel. No more needing the owner to kick you.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-03",
    title: "Farm Growth — Accurate Time Estimates",
    description:
      "The farm embed now shows how much time is actually remaining instead of wildly wrong numbers. We were accidentally using old growth constants for the estimate.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-03",
    title: "Farm Growth Saves Properly",
    description:
      "Fixed a rare issue where farm progress could be lost if a voice session and a message counted at the exact same moment. Growth updates are now safe from overlap.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-03",
    title: "Messages Now Count Toward Farm Growth",
    description:
      "Sending messages was supposed to help your plants grow, but the math was accidentally rounding everything down to zero. Now your messages actually contribute!",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-03",
    title: "Ambient Sounds Page Fixed for Premium Servers",
    description:
      "Premium servers were seeing a 'not premium' message on the Ambient Sounds page even though they had premium. This was caused by missing database setup on the production server.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-04-03",
    title: "Sounds Bot Goes Live",
    description:
      "The ambient sounds bot is now running on the live server with all 10 bot instances ready to serve premium guilds.",
    category: "premium",
    area: "bot",
  },

  // ── April 2, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-02",
    title: "Four Live Bot Bugs Fixed",
    description:
      "We went through 12 hours of logs and fixed: /warning crashing when used on a bot, the /profile command failing during startup, a database conflict when two people joined voice at the exact same time, and a logging format issue.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-02",
    title: "Website Links Temporarily Updated",
    description:
      "While lionbot.org was down, we swapped all bot links to point to the backup URL so nothing was broken for users.",
    category: "improvement",
    area: "bot",
  },

  // ── April 1, 2026 ──────────────────────────────────────────
  {
    date: "2026-04-01",
    title: "/pet Command Crash Fixed",
    description:
      "The /pet command was crashing on all servers due to a text formatting issue introduced during the text customization work. We identified and fixed it within hours.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-01",
    title: "Text Customization System (Premium)",
    description:
      "Premium servers can now customize any bot message to say whatever they want. Change button labels, embed text, notification wording — everything is editable from the dashboard with search, categories, and backup/restore.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-04-01",
    title: "Room Owner Delete & Mod Role",
    description:
      "Room owners can now delete their own rooms (with a coin refund) using /room delete or the dashboard. Admins can also set a moderator role that automatically gets access to all rooms.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-04-01",
    title: "Six Room Settings Now Actually Work",
    description:
      "We found that six room settings (sync permissions, max rooms per user, name length limit, minimum deposit, auto-extend, cooldown) were showing in the dashboard but the bot wasn't reading them. Now they're fully wired up.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-04-01",
    title: "LoFi Music Polish Pass",
    description:
      "LoFi playback got a full quality upgrade: proper song metadata, consistent volume levels, smooth fade-in/fade-out, 'Now Playing' display, skip button, automatic crash recovery, and sub-playlists by mood.",
    category: "improvement",
    area: "bot",
  },

  // ── March 31, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-31",
    title: "Shared Kanban Boards",
    description:
      "Create collaborative task boards with your friends! Drag and drop tasks between columns, assign team members, track activity history, and use /board on Discord to check tasks quickly.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-31",
    title: "Screen Share Enforcement",
    description:
      "Just like camera-only channels, admins can now set up screen-share-only voice channels. Members who don't share their screen get warned and eventually timed out.",
    category: "feature",
    area: "bot",
  },
  {
    date: "2026-03-31",
    title: "Marketplace — Scroll Data Preserved",
    description:
      "Previously, selling an enhanced item on the marketplace would lose all its scroll bonuses. Now scroll data is fully preserved — buyers get exactly the item you listed, scrolls and all.",
    category: "bugfix",
    area: "website",
  },

  // ── March 30, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-30",
    title: "Weekly Leaderboard Post Fix",
    description:
      "If you used 'Run Now' to manually post a leaderboard during the week, it would block the scheduled weekly post from firing. Fixed — manual runs no longer interfere with the schedule.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-30",
    title: "Economy Page Loading Fix",
    description:
      "The economy dashboard was stuck on a loading spinner for large servers. We split it into two faster requests and added proper database indexes so it loads in seconds now.",
    category: "bugfix",
    area: "website",
  },

  // ── March 27, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-27",
    title: "\"Unknown\" Member Names Fixed",
    description:
      "Members who study in voice channels but never run a bot command were showing as \"Unknown\" on the dashboard. Now the bot syncs their name as soon as they join a voice channel.",
    category: "bugfix",
    area: "bot",
  },

  // ── March 25, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-25",
    title: "Multi-Rank Type Support",
    description:
      "Servers can now track Voice, XP, and Message ranks all at the same time instead of picking just one. Enable secondary rank types from the dashboard or /configure ranks.",
    category: "feature",
    area: "both",
  },

  // ── March 24, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-24",
    title: "Pet Friends — Discord Bot Integration",
    description:
      "The friends system is now fully available from Discord! Use the Friends button on /pet to browse friends, accept requests, visit pets, care for them, and water their farm — all without leaving Discord.",
    category: "liongotchi",
    area: "bot",
  },
  {
    date: "2026-03-24",
    title: "Friend Request Notifications",
    description:
      "You'll now see a gold badge on the Friends tab when you have pending friend requests, plus a banner on the pet overview page. We also added a limit of 10 friend requests per day to prevent spam.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-24",
    title: "Pet Family — Discord Bot Integration",
    description:
      "Families are now playable from Discord! Create families, invite members, view the family portrait, browse members' pets, manage the shared farm, and pick themes — all through the Family button on /pet.",
    category: "liongotchi",
    area: "bot",
  },
  {
    date: "2026-03-24",
    title: "Family Feature Fixes (15+ Bugs)",
    description:
      "We did a deep audit of the family section and fixed over 15 issues: pages not loading, actions posting to wrong places, missing member data, broken permissions, and more. The entire family system is now solid.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-24",
    title: "Equipment Drop Bonus Actually Works Now",
    description:
      "Your equipment's drop rate bonus was being displayed in the stats but wasn't actually affecting drop rolls. We tracked it down and fixed it — your gear bonuses now genuinely help you find more items.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-24",
    title: "Pet Tutorial Wizard",
    description:
      "New players get a friendly 12-step interactive tutorial that walks through every LionGotchi feature with live demos and zero jargon. It uses real game components so you see exactly what to expect.",
    category: "liongotchi",
    area: "website",
  },
  {
    date: "2026-03-24",
    title: "UI/UX Consistency Overhaul",
    description:
      "We went through every single page (111 files!) and made everything consistent: standardized tabs, cards, inputs, colors, loading states, pagination, and accessibility improvements across the entire website.",
    category: "website",
    area: "website",
  },

  // ── March 23, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-23",
    title: "Server Premium — Now a Subscription",
    description:
      "Server premium is now a proper monthly subscription (€9.99/mo or €99.99/year, save 17%) powered by Stripe. No more spending LionGems on premium — gems are now exclusively for skins and cosmetics.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "LionHeart++ Includes Server Premium",
    description:
      "LionHeart++ subscribers now get one free server premium included with their membership. You can apply it to any server you admin and transfer it between servers (7-day cooldown).",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Subscriptions Dashboard",
    description:
      "A new page to manage all your subscriptions in one place: LionHeart membership status, paid server premiums with transfer options, and LionHeart++ server premium management.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-03-23",
    title: "Setup Wizard — \"Leo's Welcome Tour\"",
    description:
      "New server admins get a beautiful 12-step guided setup with live previews, real bot-rendered profile cards, a sarcastic lion mascot named Leo, and confetti at the end. Covers timezone, economy, ranks, pomodoro, rooms, LionGotchi, and more.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-03-23",
    title: "Leaderboard Role Filter",
    description:
      "Admins can now choose which roles appear on the server leaderboard. Enable filtering from the new Leaderboard config page, pick the roles, and members can switch between filtered views.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Shop Rooms — Buy Room Rentals from the Shop",
    description:
      "Admins can now add room rental packages to the server shop. Members can buy a private room directly from the shop with /shop, and the room gets created automatically.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Ambient Sounds — Schedules, Voting & Analytics",
    description:
      "Sound bots got four big additions: usage analytics with charts, scheduled sound changes (e.g., LoFi during the day, rain at night), sound voting for members, and private room sound rental.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-23",
    title: "Daily Study Cap Fix",
    description:
      "Some servers had their daily study cap set incorrectly — the dashboard was saving hours but the bot expected seconds. This caused voice tracking to completely stop on affected servers. We fixed the conversion and restored all affected servers.",
    category: "bugfix",
    area: "both",
  },

  // ── March 22, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-22",
    title: "LionGotchi Social Features",
    description:
      "The biggest LionGotchi update yet! Friends system (add friends, care for their pets, water farms, send gifts), family system (shared bank, farms, treasury, portraits, themes, leveling), and a pet leaderboard with 4 categories.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Ambient Sounds Bot",
    description:
      "Premium servers can now have up to 5 sound bots playing rain, campfire, ocean, brown noise, white noise, or LoFi music in voice channels. Configure everything from the dashboard — just invite a bot and pick a sound.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Sticky Messages",
    description:
      "A new premium feature: set up bot-managed embeds that always stay as the last message in a channel. Great for rules, announcements, or any info you want everyone to see. Configure from the dashboard.",
    category: "premium",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Scroll Success Rate Reworked",
    description:
      "We reworked how scroll success rates scale with enhancement level. The old system hit a harsh cliff where scrolling became essentially impossible at high levels. The new curve is smooth and fair — still challenging, but never hopeless.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Private Rooms Dashboard",
    description:
      "Your private rooms now have a dedicated dashboard page! See all your rooms across servers, deposit coins, rename rooms, view study leaderboards, manage members, and get warnings when rooms are about to expire.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-22",
    title: "Room Editor — Timer Controls",
    description:
      "Room owners can now create, start, stop, and configure pomodoro timers for their rooms directly from the dashboard. Focus time, break time, and auto-restart are all adjustable.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "Dashboard Global Search",
    description:
      "Press Ctrl+K (or Cmd+K) anywhere on the dashboard to instantly search across all pages, settings, and features. Results are grouped by type with keyboard navigation.",
    category: "feature",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "OG Images for Every Page",
    description:
      "Every page on the website now has a unique branded preview image. When you share a link on Discord, Twitter, or anywhere else, it shows a beautiful card instead of a generic preview.",
    category: "website",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "Room Editor / Discord Sync Fixed",
    description:
      "The room editor on the website wasn't showing the same furniture as Discord. We fixed the mismatch — what you see on the website now matches what the bot renders.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-22",
    title: "Drop Notification Buttons Fixed",
    description:
      "The 'Open Pet' and 'Mute Drops' buttons on item drop notifications used to stop working after bot restarts. They now work permanently, even on old messages.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-22",
    title: "Drop Channel Notifications Restored",
    description:
      "Servers with a dedicated drop channel stopped getting item drop notifications. We accidentally disabled them while fixing spam reports — now they work again for servers that set up a channel.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-22",
    title: "Farm Planting Controls Now Visible",
    description:
      "On the website, clicking a farm plot selected it but the plant button was hidden below the screen. Now it automatically scrolls into view so you can actually plant things.",
    category: "bugfix",
    area: "website",
  },

  // ── March 21, 2026 ─────────────────────────────────────────
  {
    date: "2026-03-21",
    title: "LionGotchi Launched! \uD83C\uDF89",
    description:
      "The moment we've all been waiting for — LionGotchi is live on all servers! Adopt a virtual pet, take care of it, collect items from studying, decorate your room, grow a farm, enhance equipment, and explore the marketplace.",
    category: "liongotchi",
    area: "both",
  },
  {
    date: "2026-03-21",
    title: "Auto Leaderboard Posts",
    description:
      "Set up automated leaderboard posts that fire on a schedule (daily, weekly, monthly, or seasonal). Comes with role assignment, coin rewards, winner DMs, and a full dashboard editor with live embed preview.",
    category: "feature",
    area: "both",
  },
  {
    date: "2026-03-21",
    title: "Marketplace Redesign",
    description:
      "The marketplace got a MapleStory-inspired makeover: individual item detail pages, scroll data on listings, separate gold/gem price history charts, a filter sidebar, grid/list view toggle, and a sleek buy dialog.",
    category: "liongotchi",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Enhancement Page Overhaul",
    description:
      "Enhancement got a cinematic upgrade: an animated anvil forge ceremony with sound effects, batch enhancing for repetitive scrolling, achievement badges, and session streak tracking.",
    category: "liongotchi",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Dashboard Security Hardened",
    description:
      "We discovered and fixed a security issue where any signed-in user could view other servers' admin pages. All server pages now properly check your permissions before showing anything.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Stripe Checkout Fixed",
    description:
      "LionHeart membership checkout was failing due to a subtle issue with how payment info was stored. Fixed and verified — all subscription tiers now work smoothly.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Balance Command Crash Fixed",
    description:
      "The /balance command was crashing on servers using certain languages (like German) due to a formatting issue in translated text. We added a safety net so it falls back gracefully.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-21",
    title: "Leaderboard Card Rendering Fixed",
    description:
      "Leaderboard images weren't generating correctly because one of our background services was running old code. A quick restart fixed it.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-21",
    title: "Vote Reminder DMs — No More Duplicates",
    description:
      "Top.gg vote reminder DMs were sending 2-3 copies to the same person. We added deduplication so you only get one reminder per vote cycle.",
    category: "bugfix",
    area: "bot",
  },
  {
    date: "2026-03-21",
    title: "False \"Access Denied\" Fixed",
    description:
      "Dashboard pages would sometimes flash \"Access Denied\" when Discord's servers were slow to respond. Now it shows a friendly retry message instead and keeps your session alive.",
    category: "bugfix",
    area: "website",
  },
  {
    date: "2026-03-21",
    title: "Leaderboard Autopost — Cross-Server Fix",
    description:
      "Test Post and Run Now on the leaderboard autopost page weren't working for most servers because the action was processed on a different server shard. Fixed to work across all shards.",
    category: "bugfix",
    area: "bot",
  },
];

export const TIMELINE_STATS = {
  totalFeatures: TIMELINE_ENTRIES.filter(
    (e) => e.category === "feature" || e.category === "liongotchi" || e.category === "premium"
  ).length,
  totalBugFixes: TIMELINE_ENTRIES.filter((e) => e.category === "bugfix").length,
  totalUpdates: TIMELINE_ENTRIES.length,
};
