// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-22
// Purpose: Generate branded OG images (1200x630) for all LionBot website pages
// Uses satori (JSX -> SVG) + @resvg/resvg-js (SVG -> PNG)
// ============================================================
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, '..', 'temp-og-images');
const FONTS_DIR = join(__dirname, 'fonts');
const ASSETS_DIR = join(__dirname, 'assets');

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const rubikRegular = readFileSync(join(FONTS_DIR, 'Rubik-Regular.ttf'));
const rubikBold = readFileSync(join(FONTS_DIR, 'Rubik-Bold.ttf'));
const avatarData = readFileSync(join(ASSETS_DIR, 'lionbot-avatar.png'));
const avatarBase64 = `data:image/png;base64,${avatarData.toString('base64')}`;

const WIDTH = 1200;
const HEIGHT = 630;

// Category color schemes
const CATEGORIES = {
  marketing: { color: '#3b82f6', label: 'LionBot', gradient: '#1d4ed8' },
  dashboard: { color: '#8b5cf6', label: 'Dashboard', gradient: '#6d28d9' },
  server:    { color: '#10b981', label: 'Server Settings', gradient: '#047857' },
  pet:       { color: '#f0c040', label: 'LionGotchi', gradient: '#d97706' },
};

// All pages to generate OG images for
const PAGES = [
  // --- Marketing / Public ---
  { slug: 'homepage', title: 'LionBot', subtitle: 'The #1 Discord Productivity Bot — Study tracking, economy, leaderboards & more', category: 'marketing' },
  { slug: 'features', title: 'Features', subtitle: 'Activity tracking, economy, pomodoro, leaderboards, reminders, and much more', category: 'marketing' },
  { slug: 'donate', title: 'Support LionBot', subtitle: 'Get LionGems to unlock premium skins, gift friends, and power up your server', category: 'marketing' },
  { slug: 'study', title: 'Study Timer', subtitle: 'Focus sessions with pomodoro, ambient sounds, and deep work tracking', category: 'marketing' },
  { slug: 'skins', title: 'Skin Collection', subtitle: 'Browse and preview all available profile skins and customizations', category: 'marketing' },
  { slug: 'stats', title: 'Stats for Nerds', subtitle: 'Real-time bot statistics, uptime, shard info, and performance metrics', category: 'marketing' },
  { slug: 'privacy-policy', title: 'Privacy Policy', subtitle: 'How LionBot handles your data and protects your privacy', category: 'marketing' },
  { slug: 'terms', title: 'Terms & Conditions', subtitle: 'Terms governing your use of LionBot services and website', category: 'marketing' },
  { slug: 'tutorials', title: 'Tutorials', subtitle: 'Step-by-step guides to get the most out of LionBot', category: 'marketing' },
  { slug: 'coming-soon', title: 'Coming Soon', subtitle: 'New features and updates are on the way — stay tuned', category: 'marketing' },
  { slug: '404', title: 'Page Not Found', subtitle: 'This page doesn\'t exist or has been moved', category: 'marketing' },

  // --- Dashboard (Member) ---
  { slug: 'dashboard-overview', title: 'Dashboard', subtitle: 'Your personal study overview, stats, and activity at a glance', category: 'dashboard' },
  { slug: 'dashboard-tasks', title: 'Tasks', subtitle: 'Manage your to-do list, track progress, and stay organized', category: 'dashboard' },
  { slug: 'dashboard-reminders', title: 'Reminders', subtitle: 'Set up recurring and one-time reminders to stay on track', category: 'dashboard' },
  { slug: 'dashboard-goals', title: 'Goals', subtitle: 'Set weekly and monthly study goals and track your progress', category: 'dashboard' },
  { slug: 'dashboard-leaderboard', title: 'Leaderboard', subtitle: 'See how you rank against other members across all servers', category: 'dashboard' },
  { slug: 'dashboard-supporter', title: 'Supporter', subtitle: 'Premium features and perks for LionBot supporters', category: 'dashboard' },
  { slug: 'dashboard-session', title: 'Session', subtitle: 'Your current study session overview and timer', category: 'dashboard' },
  { slug: 'dashboard-focus', title: 'Focus Mode', subtitle: 'Distraction-free study timer with ambient sounds and breaks', category: 'dashboard' },
  { slug: 'dashboard-history', title: 'Study History', subtitle: 'Detailed breakdown of your past study sessions and patterns', category: 'dashboard' },
  { slug: 'dashboard-inventory', title: 'Inventory', subtitle: 'View your collected skins, items, and customizations', category: 'dashboard' },
  { slug: 'dashboard-profile', title: 'Profile', subtitle: 'Customize your LionBot profile card and display settings', category: 'dashboard' },
  { slug: 'dashboard-gems', title: 'LionGems', subtitle: 'Your gem balance, transaction history, and premium shop', category: 'dashboard' },

  // --- Dashboard (Server) ---
  { slug: 'server-overview', title: 'Server Overview', subtitle: 'Activity stats, top members, and server health at a glance', category: 'server' },
  { slug: 'server-setup', title: 'Server Setup', subtitle: 'Quick setup wizard to configure LionBot for your server', category: 'server' },
  { slug: 'server-settings', title: 'Server Settings', subtitle: 'Configure notifications, channels, permissions, and behavior', category: 'server' },
  { slug: 'server-members', title: 'Members', subtitle: 'View and manage member stats, roles, and activity', category: 'server' },
  { slug: 'server-moderation', title: 'Moderation', subtitle: 'Moderation logs, warnings, and automated rule enforcement', category: 'server' },
  { slug: 'server-economy', title: 'Economy', subtitle: 'Configure LionCoins, rewards, and server economy settings', category: 'server' },
  { slug: 'server-ranks', title: 'Ranks Editor', subtitle: 'Create and manage study ranks with custom rewards and thresholds', category: 'server' },
  { slug: 'server-shop', title: 'Shop Editor', subtitle: 'Set up server shop items, prices, and purchasable roles', category: 'server' },
  { slug: 'server-rolemenus', title: 'Role Menus', subtitle: 'Create self-assignable role menus with buttons and reactions', category: 'server' },
  { slug: 'server-branding', title: 'Branding', subtitle: 'Customize bot colors, embed styles, and server branding', category: 'server' },
  { slug: 'server-schedule', title: 'Schedule', subtitle: 'Configure study room schedules and automated events', category: 'server' },
  { slug: 'server-pomodoro', title: 'Pomodoro', subtitle: 'Set up group pomodoro timers with custom work and break intervals', category: 'server' },
  { slug: 'server-pomodoro-analytics', title: 'Pomodoro Analytics', subtitle: 'Detailed pomodoro usage statistics and member participation', category: 'server' },
  { slug: 'server-videochannels', title: 'Video Channels', subtitle: 'Configure camera-on study rooms and video channel settings', category: 'server' },
  { slug: 'server-liongotchi', title: 'LionGotchi Config', subtitle: 'Enable and configure virtual pet features for your server', category: 'server' },
  { slug: 'server-leaderboard-autopost', title: 'Leaderboard Auto-post', subtitle: 'Schedule automatic leaderboard updates to a channel', category: 'server' },

  // --- Pet / LionGotchi ---
  { slug: 'pet-overview', title: 'Your LionGotchi', subtitle: 'Feed, play, and care for your virtual study companion', category: 'pet' },
  { slug: 'pet-inventory', title: 'Pet Inventory', subtitle: 'View your collected items, food, and pet accessories', category: 'pet' },
  { slug: 'pet-farm', title: 'Farm', subtitle: 'Grow crops and harvest resources for your LionGotchi', category: 'pet' },
  { slug: 'pet-room', title: 'Pet Room', subtitle: 'Decorate and customize your LionGotchi\'s living space', category: 'pet' },
  { slug: 'pet-skins', title: 'Pet Skins', subtitle: 'Unlock and equip unique looks for your LionGotchi', category: 'pet' },
  { slug: 'pet-crafting', title: 'Crafting', subtitle: 'Combine materials to craft items, food, and equipment', category: 'pet' },
  { slug: 'pet-enhancement', title: 'Enhancement', subtitle: 'Upgrade and enhance your items for better stats and effects', category: 'pet' },
  { slug: 'pet-wiki', title: 'Wiki', subtitle: 'Encyclopedia of all LionGotchi items, recipes, and mechanics', category: 'pet' },
  { slug: 'pet-marketplace', title: 'Marketplace', subtitle: 'Buy and sell items with other LionGotchi owners', category: 'pet' },
  { slug: 'pet-sell', title: 'Sell Items', subtitle: 'List your items for sale on the LionGotchi marketplace', category: 'pet' },
  { slug: 'pet-my-listings', title: 'My Listings', subtitle: 'Manage your active marketplace listings and sales', category: 'pet' },
];

function buildTemplate(page) {
  const cat = CATEGORIES[page.category];
  const titleSize = page.title.length > 22 ? 62 : page.title.length > 16 ? 72 : 80;

  return {
    type: 'div',
    props: {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'row',
        padding: 0,
        margin: 0,
        fontFamily: 'Rubik',
        overflow: 'hidden',
        position: 'relative',
        background: '#0f1629',
      },
      children: [
        // Background gradient layer
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(135deg, #1B2137 0%, #0f1629 50%, #131a2e 100%)',
            },
          },
        },
        // Large accent glow behind logo area
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 40,
              right: -40,
              width: 500,
              height: 500,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cat.color}20 0%, ${cat.gradient}10 40%, transparent 70%)`,
            },
          },
        },
        // Accent orb bottom-left
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: -100,
              left: -60,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cat.gradient}15 0%, transparent 70%)`,
            },
          },
        },
        // Subtle grid pattern overlay
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            },
          },
        },
        // Top accent line
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 5,
              background: `linear-gradient(90deg, ${cat.color}, ${cat.gradient}, transparent)`,
            },
          },
        },

        // LEFT SIDE: Text content
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '56px 0 56px 72px',
              position: 'relative',
              flex: 1,
            },
            children: [
              // Category badge
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 28,
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: 20,
                          fontWeight: 700,
                          color: cat.color,
                          background: `${cat.color}15`,
                          padding: '6px 20px',
                          borderRadius: 24,
                          border: `1.5px solid ${cat.color}35`,
                          letterSpacing: '0.5px',
                        },
                        children: cat.label,
                      },
                    },
                  ],
                },
              },
              // Title
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: titleSize,
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.1,
                    letterSpacing: '-1.5px',
                    marginBottom: 20,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  },
                  children: page.title,
                },
              },
              // Subtitle
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 28,
                    fontWeight: 400,
                    color: '#94a3b8',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  },
                  children: page.subtitle,
                },
              },
              // Footer line: URL
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 44,
                  },
                  children: [
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: 22,
                          fontWeight: 700,
                          color: '#64748b',
                          letterSpacing: '0.5px',
                        },
                        children: 'lionbot.org',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: { fontSize: 22, color: '#334155' },
                        children: '/',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontSize: 20,
                          fontWeight: 400,
                          color: '#475569',
                        },
                        children: 'Discord Productivity Bot',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // RIGHT SIDE: Big logo with effects
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 340,
              position: 'relative',
            },
            children: [
              // Outer glow ring
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${cat.color}12 0%, transparent 70%)`,
                  },
                },
              },
              // Spinning ring effect (outer)
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    border: `2px solid ${cat.color}20`,
                  },
                },
              },
              // Inner accent ring
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: `1.5px solid ${cat.color}30`,
                  },
                },
              },
              // Glow behind avatar
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${cat.color}30 0%, ${cat.color}10 50%, transparent 70%)`,
                  },
                },
              },
              // Avatar image - large
              {
                type: 'img',
                props: {
                  src: avatarBase64,
                  width: 160,
                  height: 160,
                  style: {
                    borderRadius: '50%',
                    border: `4px solid ${cat.color}50`,
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function generateImage(page) {
  const template = buildTemplate(page);

  const svg = await satori(template, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Rubik', data: rubikRegular, weight: 400, style: 'normal' },
      { name: 'Rubik', data: rubikBold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outPath = join(OUTPUT_DIR, `${page.slug}.png`);
  writeFileSync(outPath, pngBuffer);
  return outPath;
}

async function main() {
  console.log(`Generating ${PAGES.length} OG images...`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  let success = 0;
  let failed = 0;

  for (const page of PAGES) {
    try {
      const path = await generateImage(page);
      success++;
      const pct = Math.round((success + failed) / PAGES.length * 100);
      process.stdout.write(`\r[${pct}%] ${success} generated, ${failed} failed`);
    } catch (err) {
      failed++;
      console.error(`\nFAILED: ${page.slug} - ${err.message}`);
    }
  }

  console.log(`\n\nDone! ${success} images generated, ${failed} failed.`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
