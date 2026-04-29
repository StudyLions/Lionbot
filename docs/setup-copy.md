# Setup Checklist — Copy Bank

> Single source of truth for every label, helper, error and empty-state string in the Setup Checklist.
> If a string isn't here, it shouldn't be in the UI. If it changes here, change it everywhere.

## Voice & tone rules

1. **No Discord jargon without a tooltip.** Words that need a `<JargonTip>`: *guild*, *channel*, *category*, *role*, *webhook*, *embed*, *DM*, *intent*, *permission overwrite*, *autoroles*, *XP*, *centiword*, *centiXP*, *renting*, *cog*, *snowflake*, *thread*.
2. **Talk to the admin, not at them.** "Pick a channel" — not "Configure channel ID".
3. **No sarcasm.** Lighthearted is fine. The Leo mascot has been retired from the checklist.
4. **One thing per sentence.** Every help string is ≤ 18 words.
5. **Always say what will visibly change.** "Members will see this in #general" — not "Sets the greeting."
6. **Never use the word "wizard".** It's a *checklist*. Steps are *tasks*.

---

## Top-level checklist UI

| Slot | Copy |
|---|---|
| Widget title | **Get your server ready** |
| Widget subtitle (0/8 done) | A short list of things to set up. Skip anything you don't need — you can change all of it later. |
| Widget subtitle (≥1, <8) | Nice — keep going. {done} of {total} done. |
| Widget subtitle (8/8 done) | All done. You can revisit any of these from Settings. |
| Progress bar a11y label | Setup progress: {done} of {total} tasks complete |
| Collapse button | Hide checklist |
| Reopen banner (after collapse) | You hid the setup checklist. [Show it again] |
| "Skip task" link | Skip for now |
| "Mark done" button (no settings) | Mark as done |
| Saved confirmation toast | Saved. {next}. |
| Save error toast | Couldn't save. {reason}. |
| Drawer "Done" button (after save) | Save and close |
| Drawer "Done" button (no changes) | Close |
| Re-open settings link (completed task) | Edit settings |

---

## "Power user" collapsed section

| Slot | Copy |
|---|---|
| Header | Power-user settings |
| Subtitle | Less common knobs — most servers don't need these. |
| Collapsed CTA | Show {N} more |
| Items | "Don't count these channels for XP" → /dashboard/servers/{id}/settings#untracked, "Auto-give roles to new members" → /settings#autoroles, "Roles that don't appear on rank ladders" → /settings#unranked, etc. |

---

## Task 1 — Server essentials

**Drawer title:** "Server essentials"
**Drawer subtitle:** "Three quick basics so the bot knows your server."
**Drawer "why" footer:** "Without these, leaderboards show wrong times and only Discord owners can change settings."

### Settings

| Field | Label | Help | Default chip | Notes |
|---|---|---|---|---|
| `timezone` | Server timezone | Used for daily resets and "today" stats | Default: UTC | Searchable list. Show admin's detected browser TZ as a "Use my timezone (X)" chip. |
| `admin_role` | Admin role | Members with this role can change every bot setting. | — | <RoleSelect>. Empty state: "No admin role yet — only Discord server owners and members with the Administrator permission can change bot settings." |
| `mod_role` | Moderator role | Mods can warn, mute and remove people. | — | <RoleSelect>. Empty state: "No moderator role yet — moderation features will only work for full admins." |

**Permission preflight:** none required.

---

## Task 2 — How members rank up

**Drawer title:** "How members rank up"
**Drawer subtitle:** "Choose what counts toward member ranks. You can pick more than one."
**Drawer "why" footer:** "Ranks are how members see progress. Pick the activity that matches how your server already runs."

### Settings

| Field | Label | Help | Default | Notes |
|---|---|---|---|---|
| `voice_ranks_enabled` | Count voice time | Hours spent in voice channels | On | Toggle. The fix to the wizard's "pick one" mistake — admins can now enable any combination. |
| `msg_ranks_enabled` | Count messages | Number of messages in text channels | Off | Toggle. |
| `xp_ranks_enabled` | Count XP (combined) | Awarded for both voice and messages | Off | Toggle. Show a one-line tip if all three are on: "Members will appear on three ladders." |
| `dm_ranks` | Send a DM when someone ranks up | A short congratulatory message in their inbox | Off | Toggle. |
| `rank_channel` | Where to announce rank-ups | Pick a channel — leave blank to disable announcements | None | <ChannelSelect> text channels only. |

**Validation:**
- "You need at least one rank type on, otherwise members won't rank up at all." — only show if all three are off after a save attempt.

**Permission preflight (rank_channel):** Send Messages, Embed Links.

**Power-user (collapsed):** XP per minute (`xp_per_period` — see scale fix below), XP per word (`xp_per_centiword`), unranked roles list link.

---

## Task 3 — Member rewards

**Drawer title:** "Member rewards"
**Drawer subtitle:** "How many LionCoins members earn from studying."
**Drawer "why" footer:** "Coins drive the in-server shop, role unlocks and accountability bookings. You can change these anytime."

### Settings

| Field | Label | Help | Default | Notes |
|---|---|---|---|---|
| `study_hourly_reward` | Coins per hour of study | A standard rate is 50–150. | 100 | <MobileSlider min 0 max 500 step 10>. Recommended pill at 100. |
| `study_hourly_live_bonus` | Bonus for being on camera | Extra coins per hour when their camera is on | 50 | <MobileSlider min 0 max 200 step 10>. Recommended pill at 50. |
| `starting_funds` | Starting balance for new members | A small welcome bonus | 0 | <NumberInput>. |
| `coins_per_centixp` | Coin → XP conversion (1 coin = X XP) | Power-user only — leave default unless you know what you're doing | 1 | Hidden behind "Show advanced". |

**Live preview:**
> "A member who studies 1 hour with camera on earns **{study_hourly_reward + study_hourly_live_bonus} LionCoins**."

---

## Task 4 — Welcome new members

**Drawer title:** "Welcome new members"
**Drawer subtitle:** "Greet people when they join your server."
**Drawer "why" footer:** "First impressions matter. Personalised greetings make new members 3× more likely to stick around."

### Settings

| Field | Label | Help | Default | Notes |
|---|---|---|---|---|
| `greeting_channel` | Channel to post greetings | Pick a text channel — usually #welcome or #general | None | <ChannelSelect> text channels. |
| `greeting_message` | Welcome message | Use {mention} to ping the new member | "Welcome {mention} to {server}!" | Multi-line textarea with token chips: `{mention}`, `{user}`, `{server}`. Live Discord embed preview. |
| `returning_message` | Message for returning members | Optional — shown when someone re-joins | "Welcome back {mention}!" | Same. |

**Buttons:**
- **Send a test greeting** — POSTs to a new endpoint that has the bot send the rendered message to the picked channel, mentioning the calling admin only. If channel is empty, button is disabled with tooltip: "Pick a channel first."

**Permission preflight (greeting_channel):** Send Messages, Embed Links, Mention Everyone (only if message contains `@everyone`/`@here`).

**Empty state for ChannelSelect:** "No text channels you can use yet. Make one in Discord, then refresh."

---

## Task 5 — Notification channels

**Drawer title:** "Notification channels"
**Drawer subtitle:** "Where the bot sends logs, mod alerts and rank-up posts."
**Drawer "why" footer:** "These help moderators see what's happening without scrolling through history."

### Settings

| Field | Label | Help | Default | Notes |
|---|---|---|---|---|
| `event_log_channel` | Activity log channel | Joins, leaves, voice sessions | None | <ChannelSelect>. |
| `mod_log_channel` | Moderation log channel | Warns, mutes, ticket actions | None | <ChannelSelect>. |
| `alert_channel` | Mod alert channel | Pings mods when something needs attention | None | <ChannelSelect>. |
| `pomodoro_channel` | Pomodoro timer channel | Where the timer status is shown | None | <ChannelSelect>. |

**Permission preflight per channel:** Send Messages, Embed Links. Show <BotPermBadge variant="error"> if missing, with one-tap "Show fix" expander.

**Empty selection copy:** "None — feature will be silent."

---

## Task 6 — Tasks & Pomodoro

**Drawer title:** "Tasks and focus timer"
**Drawer subtitle:** "Reward members for finishing tasks and using the Pomodoro timer."
**Drawer "why" footer:** "These two features power the daily-grind loop most servers use."

### Settings

| Field | Label | Help | Default | Notes |
|---|---|---|---|---|
| `task_reward` | LionCoins per finished task | A small reward keeps members coming back | 50 | <MobileSlider 0–200>. |
| `task_reward_limit` | Max rewarded tasks per day | Stops people farming the reward | 10 | <NumberInput min 1 max 50>. |
| `session_leave_summary` | Send a "great session" summary | A short embed when someone leaves the timer | Off | Toggle. |

**Permission preflight (pomodoro_channel set in Task 5):** Send Messages, Embed Links, Manage Messages (the bot deletes its old timer messages).

---

## Task 7 — Accountability sessions *(optional)*

**Drawer title:** "Accountability sessions"
**Drawer subtitle:** "Members book a 1-hour study slot, show up on time and earn rewards."
**Drawer "why" footer:** "Used by groups that want a structured, scheduled co-working rhythm. Skip if you just want free-form voice study."

### Settings (all routed to `schedule_guild_config`, NOT `guild_config`)

| Field | Backend column | Label | Help | Default |
|---|---|---|---|---|
| `accountability_lobby` | `schedule_guild_config.lobby_channel` | Lobby voice channel | Where members wait before sessions start | — |
| `accountability_category` | `schedule_guild_config.room_channel` | Sessions category | The voice category the bot creates session rooms in | — |
| `accountability_price` | `schedule_guild_config.schedule_cost` | Booking cost (LionCoins) | What a member pays to book a slot | 250 |
| `accountability_reward` | `schedule_guild_config.reward` | Attendance reward | Earned for showing up on time | 200 |
| `accountability_bonus` | `schedule_guild_config.bonus_reward` | Streak bonus | Extra for consistent attendance | 100 |

**Permission preflight (lobby + category):** Move Members, Connect, Speak, Manage Channels (creates rooms).

**Empty state for category dropdown:** "No voice categories yet. In Discord: Right-click your server → Create Category → set type to Voice."

---

## Task 8 — Pet game *(optional)*

**Drawer title:** "Pet game"
**Drawer subtitle:** "Members can hatch, feed, and grow a LionGotchi pet by studying."
**Drawer "why" footer:** "Adds a fun gamified loop on top of ranks. Off by default — turn on if your community likes games."

### Settings

| Field | Label | Help | Default | Notes |
|---|---|---|---|---|
| `lg_enabled` | Enable the pet game in this server | Members can use `/pet` commands and see their pets | Off | Toggle. |
| `lg_drop_channel` | Drop notification channel | Where item drops appear | None | <ChannelSelect> shown only when enabled. |
| `lg_teaser_enabled` | Show a teaser hint to members | Posts a "Try the pet game" message once | On | Toggle, only when enabled. |

**Empty state:** "Pets are off. Members won't see /pet commands or the pet menu in their dashboard."

---

## JargonTip dictionary

| Term | Plain definition |
|---|---|
| **Channel** | A room inside a Discord server where messages are sent. Text or voice. |
| **Category** | A folder that groups several channels together in the sidebar. |
| **Role** | A label you give members. Used for permissions, colours and rank ladders. |
| **Permission** | Something a member or the bot is allowed to do (like send messages). |
| **DM** | A private message sent to one person, outside any server. |
| **Embed** | A formatted message box with a coloured stripe — what bots usually post. |
| **Webhook** | A way for the bot to post to a channel using a custom name and avatar. |
| **XP** | Experience points. Earned from studying. Drives ranks. |
| **LionCoin** | The bot's currency. Spent in the server shop and on accountability. |
| **Pomodoro** | A focus technique: work for 25 min, break for 5. The bot runs the timer. |
| **Rank** | A level a member reaches as they earn XP. Each rank is a role you set up. |
| **Untracked channel** | A channel where time spent doesn't count toward XP. |
| **Autorole** | A role given automatically when someone joins or hits a level. |
| **Voice category** | A category whose channels are voice channels. |
| **Lobby** | A waiting voice channel members join before being moved into a session. |
| **Mention** | An @notification that pings a person or role. |

---

## Permission badges

| Badge | When | Copy |
|---|---|---|
| `BotPermBadge ok` | Bot has all required perms in chosen channel | "Looks good" |
| `BotPermBadge warning` | Bot missing optional perms (e.g. Mention Everyone) | "Some optional features won't work" |
| `BotPermBadge error` | Bot missing required perms | "The bot can't post here. [Show fix]" |
| Fix expander | Always one click away | "1. Open the channel in Discord. 2. Tap the gear → Permissions. 3. Add the bot's role. 4. Tick: Send Messages, Embed Links." |

---

## Accessibility / motion

- All animations honor `prefers-reduced-motion: reduce` (no slide-in, no confetti).
- Focus is trapped inside the open drawer, returns to the trigger on close.
- Esc closes the drawer if there are no unsaved changes; if dirty, a confirm sheet appears: "You have unsaved changes — Save or Discard?"
- Touch targets ≥ 44×44 px everywhere.
