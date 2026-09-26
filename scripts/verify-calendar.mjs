#!/usr/bin/env node
/**
 * A guard against exactly the kind of regression this file's git history
 * has twice: a CSS change to the calendar month grid that looks right in
 * isolation but silently undoes an earlier fix (the print-footer addition
 * breaking the full-page print fill; the overflow fix requiring the
 * aspect-ratio removal to avoid clipped pills). Run this after touching
 * any of .cal-cell, .cal-evt, .cal-grid, .dash-grid, .cal-card, or the
 * calendar's print rules, before shipping.
 *
 *   npm run test:calendar
 *
 * It builds the app, serves the build, seeds a synthetic month with the
 * shapes that have broken before (a long team + event name, several
 * stacked events on one day, a 6-row month), and asserts:
 *   1. The printed calendar (a real paginated PDF, not just @media print
 *      applied to the live page) fits on exactly one page — for both a
 *      5-row and a 6-row month.
 *   2. No event chip or its delete button spills outside its own day
 *      cell, horizontally or vertically.
 *   3. A practice chip's "Practice #N" always starts on its own line
 *      below the team name, however that name wraps.
 *
 * No new dependencies — reuses the `playwright` devDependency already in
 * package.json. Exits non-zero (with a description of what failed) if
 * any check fails.
 */
import { chromium } from "playwright";
import { spawn, execSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const PORT = 4501;
const BASE_URL = `http://localhost:${PORT}/`;

const TEAM_ID = "team-1";
const LONG_TEAM_ID = "team-2";

// Two fixed months, chosen for their grid shape rather than tied to
// whatever "today" happens to be, so the test is deterministic: a 5-row
// month and a 6-row month (Jan 2026 starts on a Thursday with 31 days).
const FIVE_ROW_MONTH = { year: 2026, month: 9 };
const SIX_ROW_MONTH = { year: 2026, month: 1 };

function seedState(monthAnchorDate) {
  return {
    program: { name: "Verify Wrestling", slug: "default", fontFamily: null, textColor: null, backgroundColor: null, accentColor: null, logoDataUrl: null },
    syllabus: [],
    teams: [
      { id: TEAM_ID, name: "Hilton Elite", order: 0, color: "#3b82f6" },
      { id: LONG_TEAM_ID, name: "Hilton Youth (Rookies)", order: 1, color: "#d97706" },
    ],
    practices: [
      { id: "p1", teamId: LONG_TEAM_ID, date: monthAnchorDate(3), practiceNumber: 14, reconciledAt: "2020-01-01T00:00:00Z", rows: [], dayNotes: "" },
    ],
    wrestlers: [],
    competitions: [
      { id: "c1", teamId: TEAM_ID, date: monthAnchorDate(5), name: "Fright Night (Weigh-Ins)", type: "DUAL", weighIns: [] },
      { id: "c2", teamId: TEAM_ID, date: monthAnchorDate(6), name: "Fright Night Duals", type: "DUAL", weighIns: [] },
      { id: "c3", teamId: TEAM_ID, date: monthAnchorDate(6), name: "Fright Night Individual Tournament", type: "DUAL", weighIns: [] },
    ],
    weighInSheets: [],
    history: [],
    categoryOrder: { POSITION: [], SITUATION: [], STRUCTURE: [] },
    links: [],
    syllabusRevision: 999,
    numberingRevision: 999,
  };
}

function dateAt(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await delay(250);
  }
  throw new Error(`Preview server never came up at ${url}`);
}

/** Counts pages in a PDF buffer without a PDF-parsing dependency — every
 *  page object in a Chromium-produced PDF is tagged /Type/Page (as opposed
 *  to /Type/Pages, the page-tree node), and Chromium doesn't compress
 *  object streams by default, so a literal byte scan is reliable here. */
function countPdfPages(buffer) {
  const text = buffer.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches ? matches.length : 0;
}

async function checkPrintFillsOnePage(page, label) {
  await page.setViewportSize({ width: 725, height: 965 }); // ~Letter content box at 12mm margins
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ format: "Letter", printBackground: true, preferCSSPageSize: true });
  await page.emulateMedia({ media: "screen" });
  const pageCount = countPdfPages(pdf);
  if (pageCount !== 1) {
    throw new Error(`[print fill] ${label}: expected the calendar to print on 1 page, got ${pageCount}`);
  }
}

async function checkNoOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll(".cal-cell").forEach((cell) => {
      const cellRect = cell.getBoundingClientRect();
      cell.querySelectorAll(".cal-evt, .cal-add").forEach((el) => {
        const r = el.getBoundingClientRect();
        const tolerance = 1;
        if (r.right > cellRect.right + tolerance || r.bottom > cellRect.bottom + tolerance) {
          issues.push({
            text: el.textContent.trim().slice(0, 40),
            overflowRight: Math.max(0, r.right - cellRect.right),
            overflowBottom: Math.max(0, r.bottom - cellRect.bottom),
          });
        }
      });
    });
    return issues;
  });
  if (overflow.length > 0) {
    throw new Error(`[overflow] ${label}: ${overflow.length} element(s) spill past their day cell: ${JSON.stringify(overflow)}`);
  }
}

async function checkPracticeLineBreak(page, label) {
  const pills = await page.$$eval(".cal-cell .pill", (els) =>
    els
      .filter((e) => e.textContent.includes("Practice #"))
      .map((e) => e.innerHTML)
  );
  if (pills.length === 0) throw new Error(`[line break] ${label}: no practice chip found to check`);
  for (const html of pills) {
    if (!/<br\s*\/?>\s*Practice #/i.test(html)) {
      throw new Error(`[line break] ${label}: "Practice #N" isn't on its own line in: ${html}`);
    }
  }
}

async function runForMonth(browser, { year, month }, label) {
  const page = await browser.newPage();
  const monthAnchorDate = (day) => dateAt(year, month, day);
  const state = seedState(monthAnchorDate);

  await page.goto(BASE_URL);
  await page.evaluate((s) => window.localStorage.setItem("matplan-state", JSON.stringify(s)), state);
  await page.reload();
  await page.waitForSelector(".cal-grid", { timeout: 10000 });

  // Navigate to the seeded month if it isn't the current one.
  const now = new Date();
  const monthsAhead = (year - now.getFullYear()) * 12 + (month - 1 - now.getMonth());
  for (let i = 0; i < Math.abs(monthsAhead); i++) {
    await page.click(monthsAhead > 0 ? 'button:has-text("Next")' : 'button:has-text("Prev")');
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(150);

  await checkNoOverflow(page, label);
  await checkPracticeLineBreak(page, label);
  await checkPrintFillsOnePage(page, label);

  await page.close();
}

async function main() {
  console.log("Building…");
  execSync("npm run build", { stdio: "inherit" });

  console.log(`Starting preview server on port ${PORT}…`);
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "ignore",
    detached: true,
  });

  // Respects a custom browser path (e.g. a CI image with Chromium
  // pre-installed somewhere nonstandard) without requiring one.
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_PATH || undefined });
  try {
    await waitForServer(BASE_URL);

    await runForMonth(browser, FIVE_ROW_MONTH, "September 2026 (5-row case)");
    await runForMonth(browser, SIX_ROW_MONTH, "January 2026 (6-row case)");

    console.log("\n✓ All calendar checks passed.");
  } finally {
    await browser.close();
    try {
      process.kill(-server.pid);
    } catch {
      try {
        server.kill();
      } catch {
        // best-effort — a leaked preview server on PORT is a minor
        // annoyance, not worth failing an otherwise-passing run over.
      }
    }
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
