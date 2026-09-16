#!/usr/bin/env node
// ============================================================
// AI-GENERATED FILE
// Created: 2026-09-16
// Purpose: Manual Vercel deploys for lionbot-website. The Vercel team
//          deployment policy blocks git-triggered builds (Ari's decision,
//          2026-09-16), so pushing to `staging`/`main` no longer deploys
//          anything. This script creates a deployment through Vercel's
//          REST API from the commit that is on GitHub (origin/<ref>),
//          never from the local working tree, then waits for the build.
//
// Usage (run inside Lionbot-Website/):
//   npm run deploy:preview            # builds origin/staging as a Preview
//   npm run deploy:prod               # builds origin/main as Production (needs Ari's approval)
//   node scripts/vercel-deploy.cjs --target preview --ref my-branch
//   node scripts/vercel-deploy.cjs --target production --dry-run   # show what would be deployed
//
// Auth: uses the Vercel CLI login (run `npx vercel login` once per machine)
//       or a VERCEL_TOKEN environment variable.
// ============================================================
'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PROJECT_ID = 'prj_PpdzVCVgb17MyfsfgeOpR0l60RWr';
const PROJECT_NAME = 'lionbot-website';
const TEAM_SLUG = 'ari-horeshs-projects';
const GIT = { type: 'github', org: 'StudyLions', repo: 'Lionbot' };
const POLL_MS = 10_000;
const MAX_WAIT_MS = 15 * 60_000;

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
}
const flag = (name) => process.argv.includes(name);

function fail(message) {
  console.error(`\n[vercel-deploy] ${message}`);
  process.exit(1);
}

function readToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const candidates = [
    path.join(process.env.LOCALAPPDATA || '', 'com.vercel.cli', 'Data', 'auth.json'),
    path.join(process.env.APPDATA || '', 'com.vercel.cli', 'Data', 'auth.json'),
    path.join(os.homedir(), '.local', 'share', 'com.vercel.cli', 'Data', 'auth.json'),
    path.join(os.homedir(), 'Library', 'Application Support', 'com.vercel.cli', 'Data', 'auth.json'),
    path.join(os.homedir(), '.vercel', 'auth.json'),
  ];
  for (const file of candidates) {
    if (!file || !fs.existsSync(file)) continue;
    try {
      const token = JSON.parse(fs.readFileSync(file, 'utf8')).token;
      if (token) return token;
    } catch {
      // try the next location
    }
  }
  fail('No Vercel credentials found. Run `npx vercel login` or set VERCEL_TOKEN.');
}

function git(cmd) {
  return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
}

const target = arg('--target');
if (!['production', 'preview'].includes(target)) {
  fail('Pass --target production or --target preview.');
}
const ref = arg('--ref', target === 'production' ? 'main' : 'staging');
if (target === 'production' && ref !== 'main') {
  console.warn(`[vercel-deploy] WARNING: deploying "${ref}" to PRODUCTION instead of main.`);
}

let sha = arg('--sha');
if (!sha) {
  const line = git(`ls-remote origin refs/heads/${ref}`);
  sha = line.split(/\s+/)[0];
  if (!sha) fail(`Branch "${ref}" was not found on origin. Push it first.`);
}

// Warn when the local branch has commits that are not on GitHub yet: they
// would NOT be part of this deployment.
try {
  const local = git(`rev-parse --verify --quiet refs/heads/${ref}`);
  if (local && local !== sha) {
    console.warn(`[vercel-deploy] NOTE: local ${ref} is ${local.slice(0, 7)} but origin/${ref} is ${sha.slice(0, 7)}; deploying what is on GitHub.`);
  }
} catch {
  // local branch may not exist (e.g. main checked out in another worktree)
}

const body = {
  name: PROJECT_NAME,
  project: PROJECT_ID,
  gitSource: { ...GIT, ref, sha },
  meta: { githubCommitRef: ref, githubCommitSha: sha },
};
if (target === 'production') body.target = 'production';

console.log(`[vercel-deploy] ${target.toUpperCase()} deploy of ${GIT.org}/${GIT.repo}@${ref} (${sha.slice(0, 7)})`);
if (flag('--dry-run')) {
  console.log(JSON.stringify(body, null, 2));
  process.exit(0);
}

const headers = { Authorization: `Bearer ${readToken()}`, 'Content-Type': 'application/json' };
const api = (p, init) => fetch(`https://api.vercel.com${p}${p.includes('?') ? '&' : '?'}slug=${TEAM_SLUG}`, { headers, ...init });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const created = await api('/v13/deployments', { method: 'POST', body: JSON.stringify(body) });
  const dep = await created.json();
  if (!created.ok) fail(`Vercel refused the deployment: ${JSON.stringify(dep.error || dep)}`);
  console.log(`[vercel-deploy] created ${dep.id}  https://${dep.url}`);
  console.log(`[vercel-deploy] inspector: ${dep.inspectorUrl || '(n/a)'}`);

  const startedAt = Date.now();
  let last = '';
  while (Date.now() - startedAt < MAX_WAIT_MS) {
    await sleep(POLL_MS);
    const res = await api(`/v13/deployments/${dep.id}`);
    const d = await res.json();
    if (d.readyState !== last) {
      last = d.readyState;
      console.log(`[vercel-deploy] ${Math.round((Date.now() - startedAt) / 1000)}s  ${last}${d.readyStateReason ? ' - ' + d.readyStateReason : ''}`);
    }
    if (d.readyState === 'READY') {
      console.log(`[vercel-deploy] READY  https://${d.url}`);
      if (Array.isArray(d.alias) && d.alias.length) console.log(`[vercel-deploy] aliases: ${d.alias.join(', ')}`);
      process.exit(0);
    }
    if (['ERROR', 'CANCELED', 'BLOCKED'].includes(d.readyState)) {
      fail(`Deployment ended with ${d.readyState}. Check the build log: npx vercel inspect https://${d.url} --logs --scope ${TEAM_SLUG}`);
    }
  }
  fail('Timed out waiting for the build. Check it with `npx vercel ls`.');
})().catch((e) => fail(e.message));
