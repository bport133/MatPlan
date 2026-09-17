/**
 * MatPlan — Wrestling Program Management
 * Single-file React recreation of the Next.js + Prisma app.
 * Server actions/Prisma are replaced by a client store persisted with window.storage.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase, supabaseEnabled } from "./lib/supabaseClient.js";
import { useAuth } from "./Auth.jsx";

/* ============================== STYLES (ported from globals.css) ============================== */

const CSS = `
.mp {
  --accent: #d81e2c;
  --accent-ink: #fff;
  --steel: #8a8f94;
  --text: #e9e9e6;
  --bg: #101010;
  --panel: #1a1a1a;
  --panel2: #212121;
  --raised: #333333;
  --line: #2c2c2c;
  --muted: #8a8f94;
  --font-brand: Anton, Impact, "Haettenschweiler", "Arial Narrow", sans-serif;
  --font-heading: Oswald, "Segoe UI", system-ui, sans-serif;
  --texture: repeating-linear-gradient(115deg, rgba(255,255,255,.018) 0px, rgba(255,255,255,.018) 1px, transparent 1px, transparent 40px),
             repeating-linear-gradient(25deg, rgba(255,255,255,.012) 0px, rgba(255,255,255,.012) 1px, transparent 1px, transparent 60px);
  --tone-red-bg: rgba(216,30,44,.14);
  --tone-red-color: #ff6b76;
  --tone-red-border: rgba(216,30,44,.45);
  --tone-orange-bg: rgba(217,119,6,.14);
  --tone-orange-color: #ffb454;
  --tone-orange-border: rgba(217,119,6,.4);
  --tone-amber-bg: rgba(202,138,4,.14);
  --tone-amber-color: #f2c94c;
  --tone-amber-border: rgba(202,138,4,.4);
  --tone-emerald-bg: rgba(16,150,72,.14);
  --tone-emerald-color: #4ade80;
  --tone-emerald-border: rgba(16,150,72,.4);
  --tone-blue-bg: rgba(96,165,250,.14);
  --tone-blue-color: #7dd3fc;
  --tone-blue-border: rgba(96,165,250,.4);
  --tone-slate-bg: rgba(255,255,255,.06);
  --tone-slate-color: #b8bcc0;
  --tone-slate-border: rgba(255,255,255,.16);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  font-size: 14px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}
.mp * { box-sizing: border-box; }
.mp p, .mp h1, .mp h2, .mp h3, .mp ul { margin: 0; }

.wrap { max-width: 1100px; margin: 0 auto; padding: 16px; }

.card {
  background-color: var(--panel);
  background-image: var(--texture);
  border: 1px solid var(--line);
  border-radius: 2px;
  clip-path: polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px));
}

.row { display: flex; align-items: center; }
.wrapf { flex-wrap: wrap; }
.gap2 { gap: .5rem; }
.gap3 { gap: .75rem; }
.between { justify-content: space-between; }
.right { margin-left: auto; }
.mb5 { margin-bottom: 1.25rem; }
.mt1 { margin-top: .25rem; }

.grid { display: grid; gap: .75rem; }
.g2 { grid-template-columns: repeat(2, 1fr); }
.g3 { grid-template-columns: repeat(3, 1fr); }
.g4 { grid-template-columns: repeat(4, 1fr); }
@media (max-width: 820px) { .g3, .g4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .g2, .g3, .g4 { grid-template-columns: 1fr; } }

.prow-head { display: grid; grid-template-columns: 1fr auto 92px; gap: 10px; align-items: start; }.prow-dur { text-align: right; white-space: nowrap; }
.prow-dur .inp { width: 52px; text-align: right; display: inline-block; }

/* Sheet-style practice header: Team | Practice #, Start | End, Duration full width. */
.thead { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; }
.thead > div { border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 6px 8px; min-width: 0; }
.thead > div:nth-child(2n) { border-right: none; }
.thead > .thead-wide { grid-column: 1 / -1; border-right: none; border-bottom: none; text-align: center; }
.thead .seclbl { display: block; margin-bottom: 2px; }
.thead .inp { width: 100%; }
@media (max-width: 640px) { .prow-head { grid-template-columns: 1fr auto; } .prow-dur { grid-column: 2; } }

.muted { color: var(--muted); }
.tiny { font-size: 11px; }
.xs { font-size: 12px; }
.b { font-weight: 700; }
.sb { font-weight: 600; }
.eb { font-weight: 800; }
.upper { text-transform: uppercase; letter-spacing: .06em; }
.link { color: var(--accent); text-decoration: none; font-weight: 600; background: none; border: none; padding: 0; }
.link:hover { text-decoration: underline; }
.inp.numsm { width: 64px; text-align: center; }

.hdr { padding: 12px 16px; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; }
.pad { padding: 12px; }

.inp {
  width: 100%; background: var(--panel2); border: 1px solid var(--line); border-radius: 3px;
  padding: .4rem .6rem; font-size: .875rem; color: var(--text); outline: none; font-family: inherit;
}
.inp:focus { border-color: var(--accent); }
.mp textarea.inp { resize: vertical; min-height: 44px; }
.mp select.inp { cursor: pointer; }
.fld > span { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); display: block; margin-bottom: 4px; }
.fld { display: block; }

.mp button { font-family: inherit; cursor: pointer; }
.btn {
  display: inline-flex; align-items: center; gap: .35rem; padding: .35rem .75rem; border-radius: 3px;
  font-size: .8125rem; font-weight: 700; font-family: var(--font-heading); letter-spacing: .02em;
  transition: .15s; border: none; background: none; text-decoration: none;
}
.btn-g { background: var(--accent); color: var(--accent-ink); }
.btn-g:hover { filter: brightness(1.12); }
.btn-o { background: var(--steel); color: #16181a; }
.btn-o:hover { background: #9fa4a9; }
.btn-ghost { background: var(--panel2); color: var(--text); border: 1px solid var(--line); }
.btn-ghost:hover { background: #2a2a2a; }
.btn-sm { padding: .25rem .5rem; font-size: .75rem; }
.btn[disabled] { opacity: .5; cursor: not-allowed; }
.mp :focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }

.tab {
  display: inline-flex; align-items: center; gap: .35rem; padding: .5rem .75rem; border-radius: 3px;
  font-size: .8125rem; font-weight: 700; font-family: var(--font-heading); text-transform: uppercase;
  letter-spacing: .04em; white-space: nowrap; color: var(--muted); background: none; border: none;
}
.tab.on { background: var(--accent); color: var(--accent-ink); box-shadow: 0 0 0 1px var(--accent), 0 0 12px rgba(216,30,44,.35); }
.tabs { display: flex; gap: .25rem; padding: .25rem; overflow-x: auto; }

.seclbl { font-size: 11px; font-weight: 700; font-family: var(--font-heading); text-transform: uppercase; letter-spacing: .1em; color: var(--accent); padding-top: 4px; display: block; }

.pill { font-size: 11px; padding: 2px 8px; border-radius: 999px; border: 1px solid; white-space: nowrap; font-weight: 600; display: inline-block; }

.divide > * + * { border-top: 1px solid var(--line); }
.click { cursor: pointer; }
.click:hover { background: rgba(255,255,255,.03); }

.mp table { width: 100%; border-collapse: collapse; font-size: 14px; }
.mp th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); font-weight: 700; padding: 8px 16px; border-bottom: 1px solid var(--line); }
.mp td { padding: 8px 16px; }
.mp tbody tr:hover { background: rgba(255,255,255,.03); }

.ib { border: 1px solid var(--line); border-radius: 3px; overflow: hidden; background: var(--raised); }
.ibhdr { padding: 8px 12px; background: var(--panel2); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; }

.iconbtn { color: var(--muted); }
.iconbtn:hover { color: var(--tone-red-color); }

/*
 * minmax(0, 1fr) rather than 1fr: a plain 1fr track still has an automatic
 * minimum, so a long event name or an expanded confirm prompt widens that
 * column and squeezes the rest. This pins all seven to equal width and makes
 * the content wrap or ellipsis inside the cell instead.
 */
.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.cal-cell { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: 3px; min-height: 84px; padding: 6px; background: var(--raised); display: flex; flex-direction: column; gap: 4px; }
.cal-cell.sel { border-color: var(--accent); }
/* The add form sits above the grid so it's visible without scrolling down. */
.dayadd { border-color: var(--accent); }
.cal-cell.out { background: #0b0b0b; color: #4a4d50; }
.cal-cell .pill { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.cal-evt { display: flex; align-items: center; gap: .5rem; min-width: 0; }
.cal-evt > .pill { flex: 1; min-width: 0; }
@media (max-width: 640px) { .cal-cell { min-height: 56px; padding: 4px; font-size: 11px; } }

.flyout { display: flex; align-items: stretch; gap: 0; overflow-x: auto; }
.flyout-col { min-width: 230px; max-width: 230px; flex: none; padding: 12px; border-right: 1px solid var(--line); }
.flyout-col.detail { min-width: 320px; max-width: 420px; }
.flyout-col-title { font-family: var(--font-heading); font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); font-weight: 700; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 6px; }
.flyout-item { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 9px 10px; margin-bottom: 4px; border-radius: 2px; cursor: pointer; font-size: 13px; color: var(--text); background: transparent; border: 1px solid transparent; width: 100%; text-align: left; font-family: inherit; }
.flyout-item:hover { background: var(--panel2); }
.flyout-item.chosen { background: var(--accent); color: var(--accent-ink); font-weight: 700; }
.flyout-item .arrow { opacity: .5; font-size: 12px; }
.flyout-item.chosen .arrow { opacity: 1; }
.flyout-empty { padding: 20px 8px; color: var(--muted); font-size: 12px; }

.rte { border: 1px solid var(--line); border-radius: 3px; background: var(--panel2); overflow: hidden; }
.rte-toolbar { display: flex; gap: 2px; padding: 4px; border-bottom: 1px solid var(--line); background: var(--panel); }
.rte-btn { width: 26px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 3px; border: 1px solid transparent; background: transparent; color: var(--text); font-size: 12px; font-weight: 700; line-height: 1; }
.rte-btn:hover { background: var(--panel2); border-color: var(--line); }
.rte-btn.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.rte-content { min-height: 44px; padding: .5rem .6rem; font-size: .875rem; color: var(--text); outline: none; }
.rte-content ul, .rte-readonly ul { list-style: disc; margin: 4px 0; padding-left: 20px; }
.rte-readonly { padding: .5rem .6rem; background: var(--panel2); border: 1px solid var(--line); border-radius: 3px; }
`;


/* ============================== DOMAIN CONSTANTS ============================== */

const CATEGORIES = ["WARM_UP", "INSTRUCTION", "DRILL", "LIVE", "BREAK", "GAME"];
const CATEGORY_LABEL = {
  WARM_UP: "Warm Up", INSTRUCTION: "Instruction", DRILL: "Drill",
  LIVE: "Live", BREAK: "Break", GAME: "Game",
};
const CATEGORY_TONE = {
  WARM_UP: "slate", INSTRUCTION: "emerald", DRILL: "amber",
  LIVE: "red", BREAK: "blue", GAME: "orange",
};

const OUTCOMES = ["PLANNED", "DONE", "MODIFIED", "SKIPPED", "ADDED"];
const OUTCOME_LABEL = {
  PLANNED: "Planned", DONE: "Done", MODIFIED: "Modified", SKIPPED: "Skipped", ADDED: "Added",
};
const OUTCOME_TONE = {
  PLANNED: "slate", DONE: "emerald", MODIFIED: "amber", SKIPPED: "red", ADDED: "blue",
};

const HWT = 999;
const WEIGHT_CLASS_ORDER = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 125, HWT];
const WEIGHT_CLASS_LABEL = Object.fromEntries(
  WEIGHT_CLASS_ORDER.map((wc) => [wc, wc === HWT ? "Hwt" : String(wc)])
);
// Visual split only, matching the paper card's two print columns — one roster, not two.
const WEIGHT_CLASS_COLUMNS = [
  [50, 55, 60, 65, 70, 75, 80],
  [85, 90, 95, 100, 110, 125, HWT],
];
// Fixed lookup, not a numeric sort — 100→110→125 breaks uniform steps and Hwt (999) must sort last.
function weightClassIndex(wc) {
  if (wc === null || wc === undefined) return WEIGHT_CLASS_ORDER.length;
  const i = WEIGHT_CLASS_ORDER.indexOf(wc);
  return i === -1 ? WEIGHT_CLASS_ORDER.length : i;
}
const WEIGH_IN_FOOTER_LINES = [
  "All Wrestlers will make weight in a singlet or be moved up. Wrestlers not making weight should still be given a match.",
  "All bouts and matches will adhere to the policies outlined in the GRYWL handbook, available at GRYWL.com",
];

const HISTORY_CATEGORIES = ["INTERSECTIONAL_STATE", "SECTION_V_STATE_QUALIFIER", "SECTION_V_CLASS"];
const HISTORY_CATEGORY_LABEL = {
  INTERSECTIONAL_STATE: "NYSPHSAA Intersectional New York State Wrestling Champions",
  SECTION_V_STATE_QUALIFIER: "NYSPHSAA Section V Wrestling (State Qualifier) Champions",
  SECTION_V_CLASS: "NYSPHSAA Section V (Class) Wrestling Champions",
};

const FONT_OPTIONS = [
  "Segoe UI", "Arial", "Calibri", "Cambria", "Georgia", "Times New Roman",
  "Verdana", "Tahoma", "Trebuchet MS", "Garamond", "Courier New", "Comic Sans MS",
];
const COLOR_SWATCHES = [
  { name: "Matte Black", hex: "#101010" },
  { name: "Charcoal Panel", hex: "#1a1a1a" },
  { name: "Steel", hex: "#8a8f94" },
  { name: "Off-White", hex: "#e9e9e6" },
  { name: "Hot Red", hex: "#d81e2c" },
  { name: "Dark Red", hex: "#8b0000" },
  { name: "Orange", hex: "#ffa233" },
  { name: "Amber", hex: "#f1c40f" },
  { name: "Green", hex: "#339933" },
  { name: "Teal", hex: "#7dcec9" },
  { name: "Blue", hex: "#36499c" },
  { name: "Purple", hex: "#8e44ad" },
  { name: "White", hex: "#ffffff" },
  { name: "Light Gray", hex: "#eef2f3" },
];
const THEME_DEFAULTS = {
  fontFamily: "Segoe UI",
  textColor: "#e9e9e6",
  backgroundColor: "#101010",
  accentColor: "#d81e2c",
};

const GENERAL = "General";

/* ============================== SEED CURRICULUM ==============================
 * Transcribed from the coach's curriculum spreadsheet and the "Basic Skills,
 * Strategy, and Technique for Successful Coaching" chapter (Coach's Guide to
 * Excellence, 2nd Edition).
 *
 * Shape: [position, situation, name, cues?, { s: structure, why, err }?]
 * `position` is the broad phase; `situation` is the concept grouping within it
 * (the workbook's "Concept / Situation" column) and is now set on every item.
 * Core is not in the workbook — the flags below are carried over from the
 * previous seed by skill name.
 */

const SYLLABUS_SEED = [
  // ===================== WARM-UP =====================
  ["Warm-Up", "Warm-Up", "Movement Warm-Up", ["Jog", "Shuffle Inside", "Shuffle Outside", "Skip"], { s: "WARM_UP" }],
  // ===================== NEUTRAL POSITION =====================
  ["Neutral Position", "Neutral - Offense", "Leg Attack Knee Placement", ["*Break the Baseline*", "Single Leg: Knee Hits Outside by Pinky Toe", "Double Leg: Knee Hits Between Feet", "High Crotch: Knee Hits Between Feet by Big Toe"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Times to Attack", ["Feel Pressure", "Change in Tie", "Change in Level"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Double Leg", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Knee Pull (Single Leg)", ["Control Far Knee (Opposite Side Head Is On) with a Fish Hook", "Turn Knee Down and In Towards Opponent's Other Toes", "Drive In and Finish Takedown"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Snag (Single Leg)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Trip", ["Extra Penetration Step", "Deep Hook of Leg", "Head Lands in the Middle of Chest", "Arms Out for Wide Base"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Butt Lock Finish", ["Lock", "Lift", "Travel", "Finish"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Half Sprawl / Knee Slide", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Circle Back Side / Back Arm Reach (Mat)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Run the Pipe (Feet / Middle)", ["Side Step", "Back Step", "Sit Um", "Cover"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Head Tap & Trip (Feet / Outside)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Upper Cut & Trip (Feet / Inside)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Limp Arm / Back Arm Reach (Mat)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Back Door Finish (Mat)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Elbow to the Mat w/ Hamstring Finish", ["Elbow to the Mat", "Pinch Shoulder to Thigh w/ Tight Grip", "Circle to Back Side with Still-Tight Shoulder + Grip", "Lift Leg as You Circle to Create Hamstring Pressure"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Drive to Crackdown - Cover Hips (Mat)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Switch to Double (Feet)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "From the Mat", ["Elbow to the Mat w/ Limp Arm", "Elbow to the Mat", "Pinch Shoulder to Thigh", "Walk to Corner and Iowa", "Limp Arm and Attack Ankle"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "High Crotch", ["Inside Control w/ Block Out on Far Armpit", "*Fish Hook Pull*", "Knee Hits Between Opponent's Feet by R Foot", "Arm Snakes Down Leg", "To Double (*Must Have Weight on Far Leg*): Reinforce w/ Outside Arm, Bring Trail Leg Outside/Set on Knee, Step Up and Double Flare Finish", "Knee Transfer: Trail Leg Knee to Back of Foot, Knee on the Baseline to Come Open, Switch Ears to Far Ankle, Back Arm Reach to Far Ankle, Circle and Drive — OR — Reach to Far Leg (Inside) and Block at Thigh/Knee, Circle and Drive"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Base", "Square Stance", ["Feet Shoulder-Width Apart, Head Up, Elbows In, Hands Up", "Used Defensively — Even Weight, Ready to React Either Direction"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Base", "Staggered Stance", ["Feet Shoulder-Width Apart, Head Up, Elbows In, Hands Up", "Used Offensively — Lead Leg Set to Penetrate"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Base", "Stance Motion", ["Forward, Backward, Circle Right, Circle Left", "Maintain Stance — Don't Bounce or Cross Legs"], { s: "DRILL" }],
  ["Neutral Position", "Neutral - Base", "Combination Movement Drill", ["Chain Together: Stance Motion → Down-Block → Full Sprawl → Recover → Penetration Step", "Combine Skills at Game Speed Once Each Piece Is Clean on Its Own"], { s: "DRILL" }],
  ["Neutral Position", "Neutral - Base", "European Stance", null, { s: "INSTRUCTION", why: "Keeps distance between you and your opponent; forearm on knee opposite ear, extended." }],
  ["Neutral Position", "Neutral - Base", "Lines of Defense", ["1st Line: Head/Hands, Thumbs", "2nd Line: Forearms", "3rd Line: Hips", "4th Line: Tricks (Shrink Roll)", "5th Line: Escape/Reversal"], { s: "INSTRUCTION", why: "70% of takedowns are awarded on the 1st line of defense." }],
  ["Neutral Position", "Neutral - Base", "V-Block", ["Pressure to Elbow Retreat"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Front Headlock", ["Circle Up the Side, Look Under the Head with a Wrist", "Techniques Include: Circle, Cradles, Drags, Shucks, Far Knee Blocks or Knee Taps, Roll Through, Freestyle Reverse Rolls"], { s: "INSTRUCTION", why: "The front headlock is a critical core position — critical to the success of a good wrestler." }],
  ["Neutral Position", "Neutral - Counter Offence", "Front Headlock Defense", ["Attack the Hand, Wrist, or the Lock", "Look for Drags or to Post the Wrist and Circle Up to an Offensive Two-on-One Position", "Motion Is Important — Work to Peek Out in Some Situations"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Block, Snap, and Spin", ["Block with Combo of Hands, Thumbs, Forearm, Head", "Snap Collar Tie and Inside Control Through the Hole", "Cover Head and Shoulder", "On Toes", "Back Arm with Bent Wrist to Prevent Crayfish", "Hip Heist", "Attack Hips or Ankles", "Bump to Finish"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Head in Hole - Spin Behind", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Cement Job", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Arm Whip", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Chainsaw - Spin Behind", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Cross Ankle", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Shot - Block - ReShot", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Snap to Dresser Dump", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Snap to Bottom Leg Cradle", ["Inside Control and Collar Tie", "Snap Inside Control and Collar Tie to Step Back Leg", "Cover Hard and Fast with Shoulder", "Switch Collar Tie to Football the Head", "Inside Control Goes to Fish Hook in Arm Pit", "Head Goes into Lion's Mouth", "Drive Towards Far Hip", "Hip Heist and Chase Near Ankle"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Clearing a Collar Tie", ["Pass the Elbow: Grab Above the Elbow, Shrug Shoulders, Step and Circle Outside to Get the Angle, Pull Elbow Down and Across as You Drive In", "Duck: Try to Pass the Elbow First — If She's Grabbing Tight, Push the Elbow, Outside Step, Lower Level, Throw the Elbow Behind You, and Shoot", "Throw By: Collar Tie, Step Outside, Back of Hand Above Her Elbow, Elbow High, Throw Her Elbow Past Your Face, Keep the Collar Tie, Drive Forward and Go Behind"], { s: "INSTRUCTION", why: "Dominating the center of the mat has become increasingly important under newer rules — a wrestler must know how to react and clear a tie-up the moment they lose position." }],
  ["Neutral Position", "Neutral - Counter Offence", "Clearing a Two-on-One", ["Get Head Position, Sweep Single to the Leg Opposite the Arm They Have, Pull Your Elbow to Your Ribs Hard as You Swing Around", "Chop Her Hand at the Wrist, Swing Other Arm to an Underhook", "Pull the Elbow of the Arm with Your Wrist Until Her Hand Pops Off, Underhook", "Chop Wrist or Pull Elbow into a Drag"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Clearing an Underhook", ["UH on Your Control Arm: Get Head Position, Circle Away from the UH, Bring Elbow to Ribs Until You Slide Past Her Elbow, Sweep Single to the Leg Opposite the UH", "UH on Your Attack Arm: Get Head Position, Circle Away, Bring Elbow In Until Her UH Slides Past Her Elbow, Hi-C or Double Same Leg as the UH", "Windmill the Arm Back into an Inside Tie"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Clearing Straight Arms", ["Pop Her Arms Up Above the Elbows and Shoot", "Snap Her Arms Down, Start Above the Elbows and Slide Down to the Wrists, Front Headlock or Shoot After She Bounces Back Up", "Pop One Side and Snap the Other — Single or Hi-C", "Pop: Small Step Outside to Get the Angle, Pop Above Her Elbow, Drive Her Bicep into Her Face, Lower Your Level and Shoot Hi-C or Single"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Clearing a Wrist Tie", ["She Has Your Control Arm with One Hand: Drag to Hi-C; With Two Hands: Sweep Single", "She Has Your Attack Arm with One Hand: Drag to Single; With Two Hands: Hi-C"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Clearing a Front Headlock", ["Grab Her Elbow with Your Same-Side Hand, Shrug Shoulders, Circle to the Arm You've Grabbed Until You Get the Angle, Slide Your Head Across Her Chest, Drive Up and Pass Her Elbow By", "Reach Across to Grab Her Elbow with Your Other Hand, Drag (Sucker Drag) Her Elbow Across, Cut the Corner with Your Hips, Pop Your Head Out and Bump Her Hip with Yours"], { s: "INSTRUCTION", err: "A wrestler needs a few different ways to clear a tie — expect a fight, and be ready to chain two, three, or four motions together to get it done." }],
  ["Neutral Position", "Neutral - Counter Offence", "Whizzer Counter — Limp Arm", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Whizzer Counter — Double Trouble", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Pancake", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Head Whip", ["Reversing a Front Headlock"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Sprawl and Circle Out", ["Bent Leg", "Straight Leg", "Circle Out Towards Bent Leg", "Back to Stance"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Hands", ["Protections", "Re-Direction"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Blocking", ["With Hands", "With Hands and Forearm"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Shot - Block - Circle", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Hip Heist (Hands and Feet Drill)", ["Switch Over / Landing Hip Outside Drill", "Cross L over R Hand", "Inside Hip (L) Lands Outside"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Sprawl", ["Bent Leg", "Straight Leg", "Hips in Back Arched", "Hip Cut and Slide Chest to Neck", "LOD: Head & Hands, Forearms, Hips"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Hip Cuts", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Change Over (Landing Hip Outside Drill)", ["Cross L over R Hand", "Inside Hip (L) Lands Outside"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Head Position", ["Stop or Redirect an Attack Using the Center of Your Forehead", "If the Head Fails, Hands Become the Next Area of Defense"], { s: "INSTRUCTION", why: "Shot defense has four primary parts: head, hands, forearms, and hips. Recognizing which layer is being tested lets a wrestler counterattack instead of just surviving." }],
  ["Neutral Position", "Neutral - Defense", "Down-Block", ["Defend a Shot Without Leaving Your Feet", "Relates Directly to Head and Hand Defense"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Cross-Block", ["Defend a Shot Without Leaving Your Feet, Crossing to the Far Side", "Sets Up Re-Shooting or Running Down the Legs"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Forearm Shiver / Shuck", ["Punch Underhooks and Look for Whip-Overs to Develop an Attack Defense"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Punching Hip Motions", ["Whizzers, Ground Sprawls", "Offensive-Minded Counters: Laterals and Whip-Overs", "Last Line of Defense in the Stance"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Re-Direct the Opponent's Head", ["Single Leg Attack: Redirect the Head to the Outside of Your Body", "High-Crotch Attack: Redirect the Head into a Single-Leg Position"], { s: "INSTRUCTION", why: "A common maxim in counter-offense — recognizing the position being defended lets a wrestler counterattack with purpose instead of just reacting." }],
  ["Neutral Position", "Neutral - Defense", "Sprawl Drill", null, { s: "INSTRUCTION", why: "The beginning point many coaches start from when building counter-offense, especially in freestyle." }],
  ["Neutral Position", "Neutral - Defense", "Whizzer", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Defense", "Run the Pipe", null, { s: "INSTRUCTION", why: "Run from Master Position when opponent grabs your wrist." }],
  ["Neutral Position", "Neutral - Offense", "Move Your Hands, Move Your Feet", ["Straight Arms — You Pop or Post", "Bent Arms — You Chop or Pass"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Base", "Making Contact", ["Must Be Able to Bite Nose to Tie", "Hands Defensive (Thumbs Out)", "Stalk In", "Attack Thumbs to Arm Pits from Inside Out"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Collar Ties and Inside Control", ["One Hand Defensive (Thumb Out), Other Clawed Ready to Tie or Block", "Stalk In", "Attack with Explosion", "Elbow @ 90 Degrees"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Two on One Tie", ["Primary Techniques: Mid-Leg Single, Far-Leg Headlock", "Circle the Wrist to the Mat and Post the Hand to Take the Easy Points", "Defense: Attack the Wrist and Turn the Two-on-One into Your Own Two-on-One, or Shoot a Far-Leg Low-Level Single to Neutralize It"], { s: "INSTRUCTION", why: "One of the most effective tie/control positions — lets a wrestler execute a variety of takedowns from the two-on-one while controlling the position as the opponent fights to get out." }],
  ["Neutral Position", "Neutral - Offense", "Throw By / Shrug", ["Collar Tie and Inside Control", "Inside Control Slides Down to Bicep and Fish Hooks", "Right Foot Steps to Right Foot", "Big Toe to Big Toe", "Crow Hop", "At the Same Time Throw By and Pull Collar Tie/Claw"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Duck Under", ["From Collar Tie", "From Wrist Control", "From Opponent's Wrist Control"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Crack Down", ["Elbow Deep", "Shoulder Pressure Through Thigh", "Fight to Split"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Crack Down Cradle", ["Open Hips and Head Hunt to Cradle"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Split to Body", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Backpack Stick", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Knee Slide to Back Door", ["Lead Leg Hand Stays on Leg", "Other Hand Posts on the Mat", "Raise Up and Slide Both Knees In", "Pop Head Through Back Door", "Double Up on Single Leg", "Knee Transfer Out"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Sweep Single", ["Touch, Move, Inside Tie, Pressure, Pressure, Circle Away, Sweep — to Inside Convert (Lock Off Ankle)", "Finish: Lock Off Ankle, Upper-Cut the Knee, Heel Tap, Follow to the Ground"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Head Outside Single (High-C) w/ Fake Set-Up to Double Flair", ["Touch, Move, Tie, Pressure, Pressure, Circle", "Fake the Single, Shoot High-Crotch (Head Outside) to a Double Flair Finish", "Chase the Half Nelson on the Way Down If a High Shoulder Presents"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Ankle & Knee Pick", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Fireman's Carry", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Low Single", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Throw", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Trips, Props, Grapevines", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Arm Drags", null, { s: "INSTRUCTION", why: "Greco-Roman minimizes the attack zone, forcing coaches and athletes to focus on fewer attacks and seek a much higher level of precision for success." }],
  ["Neutral Position", "Neutral - Offense", "Double Leg Flair Finish", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Quarter Nelson", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Draw Step", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Russian Two-on-One", ["Hip In", "Double (Post)", "Fireman's", "Front Headlock"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Easy Pickens (Arm Bar)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Counter Offence", "Butt Drag", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Tree-Top Finish", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Backside Finish", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Snap Spin", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Shoot, Battle Out, Finish", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Knee Tap", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Underhook Series", ["Circle In", "Head Pop", "Punch By", "Single", "High Crotch", "Front Headlock"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Collar Tie & Wrist", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Inside & Elbow", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Elbow & Wrist", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Head Tie (Collar Tie)", null, { s: "INSTRUCTION", why: "Contact places a wrestler in position to control their opponent even before a shot or attack is unleashed. Wrestlers must dominate the position and be able to move from one contact to another with skill and authority." }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Head and Bicep Tie", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Biceps Tie (One or Two)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Elbow Tie (One or Two)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Underhook (One or Two)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Wrist Tie (One or Two)", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Forearm Hook", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Over Tie", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Over Under", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Circle & Pull", ["Touch, Move, Inside Tie, Pressure, Pressure, Circle Away, Pull — Sweep/Shot to Inside Convert", "Post Finish Variation: Same Entry, Finish by Posting on the Far Knee"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Pressure In / Pressure Back", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Post", ["Securing an Opponent's Control Point (Hand or Head) to the Mat So the Attacker Can Move Past It"], { s: "INSTRUCTION", err: "Confusing Pop and Post — a wrestler cannot post a control point into the air." }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Block", ["Securing an Opponent's Control Point (Elbow) and Holding It in Place So the Attacker Can Move Past It or Secure a Lift"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Chop", ["Quick, Short Downward Movements Against an Opponent's Arms (Wrist, Elbows)"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Snap", ["Extended Pulling, Downward Motion on a Control Point Such as an Opponent's Head or Shoulder"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Drag", ["Pulling a Control Point Such as a Tricep from the Outside Across the Attacker's Stance or Position"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Fake", ["Any Action or Movement Attempted to Draw Attention to an Area of an Opponent's Defense to Open an Attack"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Pop", ["Quick, Short Upward Movements Against an Opponent's Arms or Elbows"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Shuck", ["Pushing a Control Point (Elbow or Head) from the Outside Across the Attacker's Stance or Position"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Pummel", ["Rolling or Digging Arms Inside an Opponent's Arm for Control of an Inside Position — Commonly Seen from an Over-Under Position"], { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Set-Ups / Control Ties", "Inside Control", null, { s: "INSTRUCTION" }],
  ["Neutral Position", "Neutral - Offense", "Slide-By", null, { s: "INSTRUCTION" }],
  // ===================== TOP POSITION =====================
  ["Top Position", "Top - Breakdowns", "Thigh Pry and Spiral", ["Spiral: Anchor & Backpack, Spiral to the Front, Pull the Hip Down, Reset on Top"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Breakdowns", "Waist & Lace", ["Waist & Lace — Change Hands, Drive Flat"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Breakdowns", "3-Breakdown Review (Waist & Lace, Arm Chop, Spiral)", ["Waist & Lace: Change Hands, Drive Flat", "Arm Chop: Tight Waist, Arm-Chop, Drive the Knee Through the Butt", "Spiral: Anchor & Backpack, Spiral to Front, Pull Hip Down, Reset on Top"], { s: "DRILL" }],
  ["Top Position", "Top - Breakdowns", "Far Knee & Far Ankle", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Bundle", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Legs", ["Claw/Spiral", "Double Thigh Pry", "Cross Wrist", "Belly Openings (Pinch, Tickle)"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "1 on 1", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Cross Wrist", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Iowa", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "2 on 1", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Leg Turk", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Cross Wrist Series", ["Pocket"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Breakdowns", "Deep Waist and Far Ankle", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Base", "Basic Breakdown Pressure", ["Toe Pressure", "Walk Your Feet", "Bump Under/Over"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Leg Breakdown", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Counter Motion / Open Hips to Sky", ["Weight Forward and on Hands", "Heel First", "Lead with Knee", "Anchor Up, Cross Body (Elbow to Mid Chest/Elevate Far Ankle)"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Leg Turns", ["Cross Face", "Jacobs", "Power Half", "Splits", "Guillotine", "Double Grapes", "Ball and Chain w/ Bar", "Cradle"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Rolling Wrists Over w/ One-on-Ones", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Putting Legs In", ["Cross Leverage", "From Scoop", "Chop Across Opposite Side"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Pocket Ride", ["Cheap Points", "Turk", "Half", "Ball Chain"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Ball and Chain Series", ["To Half", "To Tilt"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Breakdowns", "Near Arm Chop & Drive", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Arm Turks", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Cradle Dogfight", ["Cross Face and Lock Above Elbow as High as Possible", "Post Opposite Hand Behind Bent Knee", "Run His Head to His Knee (Keeping Hand Posted)", "Lock onto Wrist, Applying Cross Face", "Sit Back", "Temple to Temple", "Bottom Knee in Ribs", "On Toes", "Turn Inside Hip Down", "Drive Through Hips of Opponent Until Far Hip Is on the Mat", "Walk Legs Around Towards Head"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Cradle Dogfight, Part 2", ["Temple to Temple", "Bottom Knee in Ribs", "Pressure In to Feel Pressure Back", "Time the Pressure", "Duck Head to Chest", "Knees Slide to Opponent's", "Whip the Cradle Over", "Temple to Temple", "Bottom Knee in Ribs"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Gregor Setup", ["Opponent Posts Out Arm Looking to Bar", "Deep Tight Waist", "Grab and Post Arm on the Mat", "Slide Inside Knee Up to Hip", "Lift and Drag Opponent Over Top of Arm"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "From Belly", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Weight Lift", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "From Iowa", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "From Base", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Penn State", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Bar & Half", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Jersey Tilt", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Money Tilt", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Leg-In Turns", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Michigan Cradle (Claw)", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Roll Back Cradle", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Bar Tilt", ["Base", "Belly"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Far-Side Cradle", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Bar (Top Turn)", ["Base", "Belly", "Wrist"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Gillespie Bar", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Rides & Controls", "Navy Ride", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Half Nelson w/ One-on-One", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Half Nelson Block", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Half Nelson Bar & Half", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Arm Bar", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Half Nelson", ["Hand on Head, Head on Hand", "Palm Deep, Covering Head", "Drive at 1 O'Clock", "Settle Chest Back", "Bent Leg, Straight Leg", "Reverse Half"], { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Crunch Cradle", null, { s: "INSTRUCTION" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Tilts", ["Leg Sandwich", "Ankle to Ankle, Knee to Knee", "Kick Stand", "Hips in Bread Basket", "Arm Bar Tilt w/ Wrist"], { s: "INSTRUCTION" }],
  // ===================== BOTTOM POSITION =====================
  ["Bottom Position", "Bottom - Base", "Building A Base", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Leg Counter — Swim", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Arm Bar Defense / Awareness", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Half Nelson Defense / Awareness", ["Look Away, Wing Down"], { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Leg Counter — Catch and Pass", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Leg Counter — Mule Kick", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Leg Counter — Hip Down / High Leg", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Leg Defense", ["Kick and Sit", "Kick, Knee Slide, Stand", "Kick and Back Over", "Pop the Ankle and Go", "Hooks and Swim", "Tripod, Cross Leg Over, Roll"], { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Cradle Defense / Awareness", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Hand Fighting", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Defense", "Half Nelson Defense", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Falling Forward Switch", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Stand Up Finishes", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit Out", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Stand Up Set Ups", ["Step Up, Block & Belly, Step Up (Head & Shoulder)", "Pressure Back, Peel Hands, Turn & Face"], { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Referee's Position — Starting Stance", ["Bottom: Palms on Mat, Toes Flat or Curled — Coach's Choice", "Top: Set on Command Before the Whistle"], { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Bent Over Switch", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Standing Switch (\"Okie\")", ["Back Step", "Hip Heist"], { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit Out - Turn In", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Switch", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Stand Up (Inside Leg)", ["Head and Shoulders Back", "Step to Heel", "Wrist Control", "Elbow In w/ Wrist Bent Out", "Find the Head", "Rotate Back Over Foot/Knee"], { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Peterson", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit-Out Turn-in", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit-Out Hip Heist", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Granby Roll", null, { s: "INSTRUCTION" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Houdini", null, { s: "INSTRUCTION" }],
  // ===================== NEUTRAL POSITION =====================
  ["Neutral Position", "Neutral - Base", "Scare-Crow Drill", ["Change Level w/ Hips", "Eyes Straight"], { s: "DRILL" }],
  ["Neutral Position", "Neutral - Base", "Over and Back Drill", ["Shoot, Recover to Stance", "Face Opposite Direction"], { s: "DRILL" }],
  ["Neutral Position", "Neutral - Offense", "High Shoulder Drill", ["Double to Half", "Elbow Deep"], { s: "DRILL" }],
  ["Neutral Position", "Neutral - Base", "Push-Pull Drill", ["Push Partner w/ Double Bicep Pressure", "Pull Partner w/ Fish Hooks"], { s: "DRILL" }],
  // ===================== TOP POSITION =====================
  ["Top Position", "Top - Rides & Controls", "Get Outs", null, { s: "DRILL" }],
  ["Top Position", "Top - Base", "Bump Drill", ["Bump, Recover, Switch Sides"], { s: "DRILL" }],
  ["Top Position", "Top - Base", "Hip Float Drill (Scank)", null, { s: "DRILL" }],
  ["Top Position", "Top - Base", "Toe Walk to Breakdown", ["Anchor, Backpack, Toe Pressure (Walk the Feet)"], { s: "DRILL" }],
  ["Top Position", "Top - Base", "Improving Position", null, { s: "DRILL" }],
  ["Top Position", "Top - Rides & Controls", "Switch & Follow Drill", null, { s: "DRILL" }],
  ["Top Position", "Top - Base", "Crab Walk off Switch to Turk w/ Picture Frame", ["Step Over Switch Leg (Inside)", "Crowd Hips", "Short Choppy Steps", "As You Walk Out Front, Reach Through Legs", "Step In and Turk", "Elevate and Picture Frame"], { s: "DRILL" }],
  ["Top Position", "Top - Base", "Bump Under, Chop Over, Switch Sides", ["Bump Under, Chop Over, Switch Sides", "Backpack Position, Toe Pressure"], { s: "DRILL" }],
  ["Top Position", "Top - Rides & Controls", "Mat Return Drill", ["Long Arm / Short Arm", "Front Trip / Back Trip", "Claw Return", "Clean Out to Finish", "Anchor & Backpack / Drag Down — Chase the Hips"], { s: "DRILL" }],
  ["Top Position", "Top - Turns & Pinning Combinations", "Chase Half Nelson on the Transition", ["Anytime There Is a High Shoulder", "Works Off a One-on-One or w/ the Arm Blocked", "Chase Immediately as the Opponent Hits the Mat — Before They Base Out"], { s: "INSTRUCTION" }],
  // ===================== BOTTOM POSITION =====================
  ["Bottom Position", "Bottom - Escapes & Reversals", "Bear Crawl to Hip Heist", null, { s: "DRILL" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Hip Heist Drill", null, { s: "DRILL" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Crab Walk off Switch", ["Step Over Switch Leg (Inside)", "Crowd Hips", "Short Choppy Steps", "Circle Out Front and Look for High Shoulder"], { s: "DRILL" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit-Out turn-In Follow", null, { s: "DRILL" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Switch-Switch-Switch-Switch", null, { s: "DRILL" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit-Out Turn-In Follow (2x) - Switch", null, { s: "DRILL" }],
  ["Bottom Position", "Bottom - Escapes & Reversals", "Sit-Out Turn-In Follow (2x) - Stand-Up", null, { s: "DRILL" }],
  // ===================== GAMES =====================
  ["Games", "Games", "Spin Drill", null, { s: "DRILL" }],
  // ===================== LIVE WRESTLING =====================
  ["Live Wrestling", "Live Wrestling", "King of the Mat", ["Winner Stays On, Next Wrestler Rotates In", "Loser Goes to the End of the Line"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "Neutral Only", ["Start on Feet", "Restart on Feet After Each Takedown/Exposure"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "Top Start — Turns Only", ["Top Wrestler Scores by Turning/Exposing Only", "Reset to Top Position After Each Score"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "Situational — Last 30 Seconds, Riding Time", ["Start with a Riding-Time Deficit/Lead", "Practice Stalling Out or Working to Escape/Turn Against the Clock"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "Takedown Wrestling (Win by 2)", ["Neutral Start", "First to Win a Takedown by 2+ Points Wins the Go"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "Bottom Start — Escapes Only", ["Bottom Wrestler Scores by Escaping or Reversing", "Reset to Bottom Position After Each Score"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "Situational — Down 2 with 1 Minute Left", ["Start Neutral, Trailing by 2", "Live Go to Teach Urgency and Finishing Shots Late in a Period"], { s: "LIVE" }],
  ["Live Wrestling", "Live Wrestling", "World Series", ["Best of 7 (Takedowns)"], { s: "LIVE", why: "Rotating round-robin live-wrestling format used across many practices." }],
  ["Live Wrestling", "Live Wrestling", "Situational — Trailing/Leading by Points", null, { s: "LIVE" }],
  // ===================== GAMES =====================
  ["Games", "Games", "Round Robin", ["Wrestlers Take Turns Coming Out After an Equal Amount of Time", "When Down on the Mat, the New Wrestler Assumes the Top Position, Then Switches the New Man to Bottom"], { s: "GAME" }],
  ["Games", "Games", "King of the Mat", ["Goal Is to Win — Works Best When the Group Is Even in Ability", "Part 1: Takedowns for 5 Minutes Continuous Time. Winner Stays In!", "Part 2: Takedowns for 5 Minutes Continuous Time. Loser Stays In!", "Part 3: Mat Wrestling for 5 Minutes of 30-Second Intervals. Most Points Comes Out!", "Ties: For Parts 1-2 the Wrestler In Longest Comes Out; for Part 3, Mat Wrestling in 30-Second Intervals Decides It"], { s: "GAME" }],
  ["Games", "Games", "Float & Check", ["Sit-Outs (Follow Both Ways)", "Re-Switch Switches & Standing Switches", "Wrist Rolls & Shoulder Rolls", "All of the Above"], { s: "GAME" }],
  ["Games", "Games", "Scoring Situations", null, { s: "GAME" }],
  ["Games", "Games", "7-Second Starts", ["Top Man Moves First", "Bottom Man Moves First", "Both Move on Whistle"], { s: "GAME" }],
  ["Games", "Games", "Ride-Out Contests", null, { s: "GAME" }],
  ["Games", "Games", "Any Part of Any Pinning Situation", ["On Knees", "Broken Down", "On Back"], { s: "GAME" }],
  ["Games", "Games", "Spin & Hip", null, { s: "GAME" }],
  ["Games", "Games", "Sharks", ["Groups of 3 Wrestling — Each Wrestler Stays In for Six and One-Half Minutes Except \"B,\" Who Stays In for Eight and One-Half Minutes (Advantage: Done First)", "Each New Partner Match-Up Wrestles the Entire Two-and-One-Half or Two-Minute Period", "Period 1: 2:30, Period 2: 2:00, Period 3: 2:00", "First Period Starts from Neutral", "Coach May Choose to Release Wrestlers After Each Takedown or Continue Wrestling", "Return All Wrestlers to Feet for a Fresh Start After Each Takedown/Continue Period", "Last Two Periods Wrestled for Four Starts, Maintaining the Same Starting Position (Two on Each Side)"], { s: "GAME" }],
  ["Games", "Games", "Behind Standing", null, { s: "GAME" }],
  ["Games", "Games", "Cradles on Each Other", null, { s: "GAME" }],
  ["Games", "Games", "Stay In for 6 Minutes", ["Groups of 3 — Doubles Time Spent from the Neutral Position at the Expense of Mat Wrestling", "A New Wrestler Comes In for Each New Start; No Wrestler Sits Out for Long", "Takedowns: 4:00 Intervals", "Down Position: 2:00 Intervals", "Do Not Allow Any Wrestler to Sit Down During the 30-Second Mat-Wrestling Intervals"], { s: "GAME" }],
  ["Games", "Games", "Rock of Gibraltar", ["Bottom Man Holds Base"], { s: "GAME" }],
  ["Games", "Games", "Iowa vs. Oklahoma", null, { s: "GAME" }],
  ["Games", "Games", "Capture the Shoe", ["Groups of 2 — Each Wrestler Tucks a Shoe/Sock at the Waistband", "Neutral Position, Live Wrestling to Grab the Opponent's Shoe Without Losing Your Own"], { s: "GAME" }],
  // ===================== BOTTOM POSITION =====================
  ["Bottom Position", "Bottom - Base", "Placeholder", null, { s: "INSTRUCTION" }],
];

/* ============================== SEED HISTORY ==============================
 * Transcribed from the program's "Dashboard History.pdf" — three honor rolls.
 * Shape per entry: [weight, name, years]
 */

const HISTORY_SEED = {
  INTERSECTIONAL_STATE: [
    ["190", "Elijah Diakomihalis", "2024"],
    ["152", "Rocco Camillaci", "2022"],
    ["99-120", "Greg Diakomihalis", "2020,2019,2018,2017,2016"],
    ["99", "Gregor McNeil", "2019"],
    ["126", "Ryan Burgos", "2019"],
    ["195", "Sam Deprez", "2019"],
    ["160-182", "Lou Deprez", "2017,2016,2015"],
    ["99-138", "Yianni Diakomihalis", "2016,2015,2014,2013"],
    ["145", "Vincent Deprez", "2014"],
    ["119", "Andy Antonucci", "1989"],
    ["155", "Rick Sadwick", "1988,1987"],
    ["112", "Dave Pitoni", "1986"],
    ["145", "Dave Juergens", "1975"],
  ],
  SECTION_V_STATE_QUALIFIER: [
    ["103", "Chrystian Velez", "2026"],
    ["108-132", "Jon Testa", "2026,2025,2024"],
    ["126", "Nicholas Testa", "2026"],
    ["152", "Philip Testa", "2025"],
    ["101", "Lukas Yeager", "2024"],
    ["170", "Landon Lazarek", "2024"],
    ["189-190", "Elijah Diakomihalis", "2024,2023"],
    ["102", "Jonathan Testa", "2023"],
    ["215", "Nathan Kasper", "2023"],
    ["99-152", "Rocco Camillaci", "2022,2020,2019,2018"],
    ["99-138", "Ryan Burgos", "2020,2019,2018,2017"],
    ["99-120", "Greg Diakomihalis", "2020,2019,2018,2017,2016"],
    ["285", "Collin Burns", "2020"],
    ["99", "Gregor McNeil", "2019"],
    ["170-195", "Sam Deprez", "2019,2018,2017"],
    ["113-126", "Austin Hertel", "2017,2016,2015"],
    ["120-182", "Lou Deprez", "2017,2016,2015,2014,2013"],
    ["170-195", "Mike Spallina", "2017,2016,2015"],
    ["99-138", "Yianni Diakomihalis", "2016,2015,2014,2013"],
    ["182", "Hobie Strassner", "2015"],
    ["103-145", "Vincent Deprez", "2014,2013,2012,2011"],
    ["145-152", "Anthony Deprez", "2014,2013"],
    ["160", "John Velieri", "2009"],
    ["125-130", "Mark Ranzenbach", "2007,2006"],
    ["135", "Pat Hanscomb", "2000"],
    ["177", "Mark Schermerhorn", "1996"],
    ["105-119", "Andy Antonucci", "1989,1988"],
    ["155", "Rick Sadwick", "1988,1987"],
    ["112", "Dave Pitoni", "1986"],
    ["145", "Dave Juergens", "1975"],
    ["105", "Clark Barnard", "1974"],
    ["155", "Clayton Barnard", "1973"],
  ],
  SECTION_V_CLASS: [
    ["103", "Chrystian Velez", "2026"],
    ["124-132", "Jon Testa", "2026,2025"],
    ["126", "Nicholas Testa", "2026"],
    ["101-108", "Lukas Yeager", "2025,2024"],
    ["152-170", "Landon Lazarek", "2024,2023"],
    ["189-190", "Elijah Diakomihalis", "2024,2023"],
    ["102", "Jonathan Testa", "2023"],
    ["215", "Nathan Kasper", "2023"],
    ["285", "Chris Fronczak", "2023"],
    ["99-152", "Rocco Camillaci", "2022,2021,2020,2019,2018"],
    ["126", "Tyler Simons", "2022"],
    ["99-138", "Ryan Burgos", "2020,2019,2018,2017"],
    ["99-120", "Greg Diakomihalis", "2020,2019,2018,2017,2016"],
    ["285", "Collin Burns", "2020,2018"],
    ["99", "Gregor McNeil", "2019"],
    ["152", "Mike Fronczak", "2019"],
    ["170-195", "Sam Deprez", "2019,2018,2017"],
    ["113-126", "Austin Hertel", "2017,2016,2015"],
    ["120-182", "Lou Deprez", "2017,2016,2015,2014,2013"],
    ["152-195", "Mike Spallina", "2017,2016,2015,2013"],
    ["220", "Nate Whybra", "2017"],
    ["99-138", "Yianni Diakomihalis", "2016,2015,2014,2013,2012"],
    ["182", "Hobie Strassner", "2015"],
    ["220", "John Fuino", "2015"],
    ["96-145", "Vincent Deprez", "2014,2013,2012,2011,2010"],
    ["145-152", "Anthony Deprez", "2014,2013"],
    ["182", "Dan Norris", "2014"],
    ["145", "Jim Hough", "2011"],
    ["160-171", "John Velieri", "2009,2008"],
    ["96-130", "Mark Ranzenbach", "2007,2006,2004"],
    ["125", "Joey Ranzenbach", "2005"],
    ["130-135", "Pat Hanscomb", "2000,1998"],
    ["177", "Mark Schermerhorn", "1996"],
    ["177", "Bob Streb", "1995"],
    ["91", "Mark Spitzer", "1993"],
    ["126", "Scott Yockel", "1993"],
    ["155", "Craig Reynolds", "1990"],
    ["91", "Don Spaulding", "1989"],
    ["105-119", "Andy Antonucci", "1989,1988"],
    ["132", "Steve LaFountain", "1989"],
    ["138", "Pat White", "1989"],
    ["155", "Rick Sadwick", "1988,1987"],
    ["105-112", "Dave Pitoni", "1986,1985"],
    ["91", "Dan Goodwin", "1985"],
    ["167", "Gregg Sadwick", "1984"],
    ["215", "Steve Obenhofer", "1982"],
    ["112-119", "Chris Kellman", "1979,1978"],
    ["145", "George Eblacker", "1978"],
    ["132", "Chuck Partridge", "1976"],
    ["177", "Bob Clark", "1976"],
    ["119", "Clark Barnard", "1975"],
    ["145", "Dave Juergens", "1975"],
  ],
};

/* ============================== UTILITIES ============================== */

let SEQ = 0;
function uid() {
  SEQ += 1;
  return "c" + Date.now().toString(36) + SEQ.toString(36) + Math.random().toString(36).slice(2, 7);
}

const pad2 = (n) => String(n).padStart(2, "0");

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/**
 * Parses a wall-clock time the coach typed ("6:00 PM", "6pm", "18:00") into
 * minutes past midnight, or null if it isn't a time. Plain "6" is read as
 * afternoon practice (18:00) since a high-school room never starts at 6am.
 */
function parseClock(text) {
  const s = String(text || "").trim().toLowerCase();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/);
  if (!m) return null;
  let hour = Number(m[1]);
  const mins = m[2] ? Number(m[2]) : 0;
  if (hour > 23 || mins > 59) return null;
  const mer = m[3] ? m[3][0] : null;
  if (mer === "p" && hour < 12) hour += 12;
  else if (mer === "a" && hour === 12) hour = 0;
  else if (!mer && hour >= 1 && hour <= 7) hour += 12; // bare "6" means 6 PM
  return hour * 60 + mins;
}

/** Elapsed minutes between two clock strings, rolling past midnight. */
function clockDuration(startTime, endTime) {
  const a = parseClock(startTime);
  const b = parseClock(endTime);
  if (a === null || b === null) return null;
  return b >= a ? b - a : b + 24 * 60 - a;
}

/**
 * Parses a "YYYY-MM-DD" date-only string as a local-midnight Date.
 * `new Date("YYYY-MM-DD")` parses as UTC midnight per the ISO-8601 spec, which
 * shifts a day backwards in any timezone behind UTC — this builds from parts.
 */
function parseDateOnly(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return new Date(y, m - 1, d);
}
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const fmtLong = (s) =>
  parseDateOnly(s).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const fmtFull = (s) =>
  parseDateOnly(s).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fmtDay = (s) => parseDateOnly(s).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const fmtShort = (d) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

function parseYears(years) {
  return String(years)
    .split(/[,\s]+/)
    .map((y) => y.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}
function maxYear(years) {
  const parsed = parseYears(years);
  return parsed.length ? Math.max(...parsed) : 0;
}

// Ordered (listed) values sort by their stored index; everything else falls back to
// alphabetical and is appended after — "A-Z by default, manual override when needed".
function sortByCustomOrder(values, orderList) {
  const map = new Map((orderList || []).map((v, i) => [v, i]));
  return [...values].sort((a, b) => {
    const oa = map.get(a);
    const ob = map.get(b);
    if (oa !== undefined && ob !== undefined) return oa - ob;
    if (oa !== undefined) return -1;
    if (ob !== undefined) return 1;
    return a.localeCompare(b);
  });
}

const ENTITIES = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
function stripHtml(html) {
  return String(html || "")
    .replace(/<\/(p|div|li|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => ENTITIES[m] || m)
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function toCsv(rows) {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = c === null || c === undefined ? "" : String(c);
          return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
        })
        .join(",")
    )
    .join("\n");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const src = String(text).replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function download(filename, text, type) {
  const blob = new Blob([text], { type: type || "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ============================== SHARED UI ============================== */

const TONE = {
  red: { bg: "var(--tone-red-bg)", color: "var(--tone-red-color)", border: "var(--tone-red-border)" },
  orange: { bg: "var(--tone-orange-bg)", color: "var(--tone-orange-color)", border: "var(--tone-orange-border)" },
  amber: { bg: "var(--tone-amber-bg)", color: "var(--tone-amber-color)", border: "var(--tone-amber-border)" },
  emerald: { bg: "var(--tone-emerald-bg)", color: "var(--tone-emerald-color)", border: "var(--tone-emerald-border)" },
  blue: { bg: "var(--tone-blue-bg)", color: "var(--tone-blue-color)", border: "var(--tone-blue-border)" },
  slate: { bg: "var(--tone-slate-bg)", color: "var(--tone-slate-color)", border: "var(--tone-slate-border)" },
};
const toneOf = (tone) => TONE[tone in TONE ? tone : "slate"];

function Pill({ label, tone }) {
  const t = toneOf(tone);
  return (
    <span className="pill" style={{ background: t.bg, color: t.color, borderColor: t.border }}>
      {label}
    </span>
  );
}

function Field({ label, children, style }) {
  return (
    <label className="fld" style={style}>
      <span>{label}</span>
      {children}
    </label>
  );
}

/**
 * Two-step confirmation for destructive actions.
 *
 * The app runs inside a sandboxed iframe, where the browser blocks modal
 * dialogs — window.confirm() never shows anything and returns false, so any
 * action gated behind it silently does nothing. This asks inline instead.
 *
 * onConfirm may return a string to refuse the action and show that reason.
 */
function ConfirmButton({
  label,
  message,
  confirmLabel = "Delete",
  className = "btn btn-ghost btn-sm iconbtn",
  confirmClassName = "btn btn-o btn-sm",
  title,
  disabled,
  onConfirm,
}) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState(null);

  function run(e) {
    e.stopPropagation();
    const refusal = onConfirm();
    if (typeof refusal === "string") {
      setError(refusal);
      setAsking(false);
      return;
    }
    setAsking(false);
    setError(null);
  }

  if (!asking) {
    return (
      <span className="row gap2 wrapf">
        <button
          className={className}
          title={title}
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); setError(null); setAsking(true); }}
        >
          {label}
        </button>
        {error && <span className="xs" style={{ color: "var(--tone-red-color)" }}>{error}</span>}
      </span>
    );
  }

  return (
    <span className="row gap2 wrapf" onClick={(e) => e.stopPropagation()}>
      {message && <span className="xs muted">{message}</span>}
      <button className={confirmClassName} onClick={run}>{confirmLabel}</button>
      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setAsking(false); }}>Cancel</button>
    </span>
  );
}

/**
 * Highlights a field's existing value when you click into it, so typing
 * replaces it instead of appending to whatever was pre-filled. Click a second
 * time to place the cursor and edit in place.
 *
 * Runs on the root element via focus bubbling rather than being wired onto
 * every input by hand — new fields get the behavior for free.
 */
function selectOnFocus(e) {
  const el = e.target;
  if (!el || el.tagName !== "INPUT") return;
  if (!["text", "number", "search", "tel", ""].includes(el.type)) return;
  if (el.readOnly || el.disabled || !el.value) return;
  // Deferred: Safari clears the selection if you set it during the focus event.
  requestAnimationFrame(() => {
    try { el.select(); } catch (err) { /* some input types reject select() */ }
  });
}

/**
 * The practice a new one should inherit time and location from: the same
 * team's most recent practice on or before `beforeDate`, falling back to its
 * latest practice overall when you're scheduling into a gap.
 */
function previousPractice(practices, teamId, beforeDate) {
  const mine = practices
    .filter((p) => p.teamId === teamId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  if (!mine.length) return null;
  return mine.find((p) => !beforeDate || p.date <= beforeDate) || mine[0];
}

/**
 * Default colors handed to teams in order, chosen to stay distinguishable on
 * the dark theme. Past the end of the list teams cycle back around and can be
 * recolored by hand in Settings.
 */
const TEAM_COLORS = ["#4aa3df", "#ffa233", "#39b385", "#b57bee", "#f1c40f", "#ff6b6b", "#5bd1d7", "#e88fb0"];

/**
 * Extra per-wrestler fields carried over from a club's registration/roster
 * spreadsheet — everything beyond what MatPlan itself needs (name, teams,
 * weight class, active). All free text so a club's own conventions (how they
 * write a discount, what "Net" means to them, etc.) pass through untouched.
 */
const WRESTLER_DETAIL_FIELDS = [
  "firstName", "lastName", "dob", "gender", "age", "grade",
  "parentName", "parentCell", "email",
  "emergencyContactName", "emergencyContactPhone",
  "allergies",
  "insurance", "policyNumber",
  "address", "city", "state", "zip",
  "discountName", "discountAmount", "refunds", "net", "list",
];
const emptyWrestlerDetails = () => Object.fromEntries(WRESTLER_DETAIL_FIELDS.map((f) => [f, ""]));

const teamColor = (team) => (team && team.color) || TEAM_COLORS[0];

/** Hex to rgba, for tinting a pill without washing out the dark background. */
function tint(hex, alpha) {
  const h = String(hex || "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return `rgba(74,163,223,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function hexToHsl(hex) {
  const h = String(hex || "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return null;
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue;
  if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return { h: (hue / 6) * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * Team colors come from a plain browser color wheel (see TeamsCard), so a
 * coach can land on anything — including a near-white or near-black pick,
 * common for a team that actually wears white or black. Used raw, those
 * collapse the tinted "practice" pill to flat grey and turn the solid
 * "competition" pill into a jarring bright/dark block. Clamping lightness
 * into a safe band keeps every team's color legible and still reading as
 * *their* color (grey-in, grey-out for a true white/black pick) rather than
 * flattening or blowing out against the app's dark surfaces.
 */
function displayTeamColor(hex) {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const l = Math.min(68, Math.max(32, hsl.l));
  return hslToHex(hsl.h, hsl.s, l);
}

/** WCAG relative luminance — HSL lightness alone picks badly for saturated
 * hues (yellow reads much brighter than its lightness number suggests). */
function relLuminance(hex) {
  const h = String(hex || "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return 0.5;
  const chan = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255);
}

/** Picks whichever of dark/light text has better contrast against a solid
 * fill of `hex`, so every hue — including bright yellows and greens — stays
 * readable, not just colors that happen to be "dark" or "light" by name. */
function idealTextOn(hex) {
  const bgL = relLuminance(hex) + 0.05;
  const contrastWith = (textHex) => {
    const textL = relLuminance(textHex) + 0.05;
    return bgL > textL ? bgL / textL : textL / bgL;
  };
  return contrastWith("#16181a") >= contrastWith("#f5f5f3") ? "#16181a" : "#f5f5f3";
}

/**
 * Team color carries which team; fill carries which kind of event — practices
 * are tinted, competitions solid — so both read at a glance in one pill.
 */
function eventPillStyle(color, kind) {
  const c = displayTeamColor(color);
  if (kind === "competition") {
    return { background: c, color: idealTextOn(c), borderColor: c, fontWeight: 700 };
  }
  return { background: tint(c, 0.18), color: c, borderColor: tint(c, 0.55) };
}

const BASELINE_FIELDS = ["startTime", "endTime", "location", "address"];

/**
 * What a new practice should start with: the team's baseline where one is set,
 * otherwise whatever that team's last practice used. The baseline is the
 * season's standing slot and room; individual practices override it freely.
 */
function practiceDefaults(state, teamId, beforeDate) {
  const team = state.teams.find((t) => t.id === teamId) || {};
  const prior = previousPractice(state.practices, teamId, beforeDate) || {};
  const out = {};
  for (const key of BASELINE_FIELDS) {
    const base = team[`default${key[0].toUpperCase()}${key.slice(1)}`];
    out[key] = (base && String(base).trim()) || prior[key] || "";
  }
  return out;
}

/** Entries actually wrestling — scratched names stay on the sheet but don't count. */
const weighingIn = (sheet) => (sheet ? sheet.entries.filter((e) => e.available !== false) : []);

/** "12 wrestlers · 2 scratched", or just the count when nobody is out. */
function sheetCount(sheet) {
  if (!sheet) return "";
  const out = sheet.entries.length - weighingIn(sheet).length;
  return `${weighingIn(sheet).length} wrestlers${out ? ` · ${out} scratched` : ""}`;
}

/** Team picker. `allLabel` turns it into a filter with an all-teams option. */
function TeamSelect({ value, onChange, allLabel, style }) {
  const { state } = useApp();
  const teams = [...state.teams].sort((a, b) => a.order - b.order);
  return (
    <select className="inp" style={style} value={value || ""} onChange={(e) => onChange(e.target.value || null)}>
      {allLabel && <option value="">{allLabel}</option>}
      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
    </select>
  );
}

/**
 * A wrestler's team memberships. Wrestlers can sit on more than one team —
 * a Cup kid who also wrestles Elite — so membership is a list. Reads the old
 * single `teamId` shape too, in case a save predates the migration.
 */
function teamsOf(wrestler) {
  if (Array.isArray(wrestler.teamIds)) return wrestler.teamIds;
  return wrestler.teamId ? [wrestler.teamId] : [];
}

const onRosterOf = (wrestler, teamId) => !teamId || teamsOf(wrestler).includes(teamId);

/** Team name for display, tolerating rows whose team was deleted. */
function useTeamName() {
  const { state } = useApp();
  return (teamId) => {
    const t = state.teams.find((x) => x.id === teamId);
    return t ? t.name : null;
  };
}

/* ============================== STORE ============================== */

const STORAGE_KEY = "matplan-state";
const SYLLABUS_REVISION = 5;
const NUMBERING_REVISION = 1;

/**
 * Rebuild a saved state's syllabus from the current seed without breaking
 * archived practices. Practice rows point at syllabus item IDs, so any item
 * whose name still exists keeps its original ID — reconciled practices keep
 * reading correctly. Items dropped from the workbook are retained (marked
 * retired) for the same reason; they just sort to the end.
 */
/**
 * Turns the old free-text `team` strings into Team records and stamps every
 * practice, competition, wrestler, and weigh-in sheet with a teamId.
 *
 * Practice numbers are deliberately NOT renumbered per team — reconciled
 * practices are the record of what happened, and rewriting their numbers would
 * rewrite the archive. Numbering goes per-team from the next new practice on.
 */
function migrateTeams(saved) {
  if (saved.teams && saved.teams.length) return saved;

  const names = [];
  const seen = new Set();
  for (const list of [saved.practices || [], saved.competitions || []]) {
    for (const row of list) {
      const n = (row.team || "").trim();
      if (n && !seen.has(n.toLowerCase())) { seen.add(n.toLowerCase()); names.push(n); }
    }
  }
  if (!names.length) names.push(saved.program?.name || "Varsity");

  const teams = names.map((name, i) => ({ id: uid(), name, order: i, color: TEAM_COLORS[i % TEAM_COLORS.length] }));
  const idFor = (name) => {
    const hit = teams.find((t) => t.name.toLowerCase() === (name || "").trim().toLowerCase());
    return (hit || teams[0]).id;
  };

  const practices = (saved.practices || []).map((p) => ({ ...p, teamId: p.teamId || idFor(p.team) }));
  const competitions = (saved.competitions || []).map((c) => ({ ...c, teamId: c.teamId || idFor(c.team) }));
  const wrestlers = (saved.wrestlers || []).map((w) => ({
    ...w,
    teamIds: Array.isArray(w.teamIds) && w.teamIds.length ? w.teamIds : [w.teamId || teams[0].id],
  }));
  const weighInSheets = (saved.weighInSheets || []).map((s) => {
    if (s.teamId) return s;
    const parent =
      practices.find((p) => p.id === s.practiceId) ||
      competitions.find((c) => c.id === s.competitionId);
    return { ...s, teamId: parent ? parent.teamId : teams[0].id };
  });

  return { ...saved, teams, practices, competitions, wrestlers, weighInSheets };
}

/**
 * Per-team practice numbering. Walks each team's practices in date order and
 * assigns 1..n — so a team's first practice is #1 regardless of what the other
 * teams were doing that week.
 *
 * Reconciled practices keep the number they were archived under; the counter
 * steps past them instead. That way fixing the numbering never rewrites the
 * record of a practice that already happened.
 */
function renumberPractices(practices) {
  const byTeam = new Map();
  for (const p of practices) {
    if (!byTeam.has(p.teamId)) byTeam.set(p.teamId, []);
    byTeam.get(p.teamId).push(p);
  }

  const numbers = new Map();
  for (const list of byTeam.values()) {
    const ordered = [...list].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    let next = 1;
    for (const p of ordered) {
      if (p.reconciledAt && p.practiceNumber != null) {
        numbers.set(p.id, p.practiceNumber);
        next = Math.max(next, p.practiceNumber + 1);
        continue;
      }
      numbers.set(p.id, next);
      next += 1;
    }
  }

  return practices.map((p) => ({ ...p, practiceNumber: numbers.get(p.id) }));
}

/** Gives every team a color, for saves made before teams had one. */
function migrateTeamColors(saved) {
  if (!saved.teams || saved.teams.every((t) => t.color)) return saved;
  return {
    ...saved,
    teams: saved.teams.map((t, i) => ({ ...t, color: t.color || TEAM_COLORS[i % TEAM_COLORS.length] })),
  };
}

/** Backfills `teamIds` for saves made while wrestlers had a single team. */
function migrateRosterTeams(saved) {
  if (!saved.wrestlers || saved.wrestlers.every((w) => Array.isArray(w.teamIds))) return saved;
  const fallback = (saved.teams && saved.teams[0] && saved.teams[0].id) || null;
  return {
    ...saved,
    wrestlers: saved.wrestlers.map((w) => ({
      ...w,
      teamIds: Array.isArray(w.teamIds) && w.teamIds.length ? w.teamIds : [w.teamId || fallback].filter(Boolean),
    })),
  };
}

/** Backfills the club-roster detail fields (parent/emergency contact,
 * medical, insurance, address, dues) for saves made before they existed. */
function migrateWrestlerDetails(saved) {
  if (!saved.wrestlers || saved.wrestlers.every((w) => w.detailsAdded)) return saved;
  return {
    ...saved,
    wrestlers: saved.wrestlers.map((w) => {
      if (w.detailsAdded) return w;
      const patch = {};
      for (const f of WRESTLER_DETAIL_FIELDS) if (w[f] === undefined) patch[f] = "";
      return { ...w, ...patch, detailsAdded: true };
    }),
  };
}

function migrateNumbering(saved) {
  if (saved.numberingRevision === NUMBERING_REVISION) return saved;
  return {
    ...saved,
    practices: renumberPractices(saved.practices || []),
    numberingRevision: NUMBERING_REVISION,
  };
}

function migrateSyllabus(saved) {
  if (saved.syllabusRevision === SYLLABUS_REVISION) return saved;

  const byName = new Map();
  for (const item of saved.syllabus || []) {
    if (!byName.has(item.name)) byName.set(item.name, item);
  }

  const used = new Set();
  const rebuilt = seedState().syllabus.map((fresh) => {
    const prior = byName.get(fresh.name);
    if (prior && !used.has(prior.id)) {
      used.add(prior.id);
      return { ...fresh, id: prior.id };
    }
    return fresh;
  });

  const referenced = new Set();
  for (const p of saved.practices || []) {
    for (const r of p.rows || []) if (r.itemId) referenced.add(r.itemId);
  }
  const retired = (saved.syllabus || [])
    .filter((i) => !used.has(i.id) && referenced.has(i.id))
    .map((i, n) => ({ ...i, retired: true, order: rebuilt.length + n }));

  return { ...saved, syllabus: [...rebuilt, ...retired], syllabusRevision: SYLLABUS_REVISION };
}

function seedState() {
  let historyOrder = 0;
  const history = [];
  for (const category of HISTORY_CATEGORIES) {
    for (const [weight, name, years] of HISTORY_SEED[category]) {
      history.push({ id: uid(), category, weight, name, years, order: historyOrder++ });
    }
  }
  return {
    program: {
      name: "My Wrestling Program",
      slug: "default",
      fontFamily: THEME_DEFAULTS.fontFamily,
      textColor: THEME_DEFAULTS.textColor,
      backgroundColor: THEME_DEFAULTS.backgroundColor,
      accentColor: THEME_DEFAULTS.accentColor,
      logoDataUrl: null,
    },
    syllabus: SYLLABUS_SEED.map((entry, i) => {
      const [position, situation, name, cues, o] = entry;
      const opts = o || {};
      return {
        id: uid(),
        situation: situation || null,
        position,
        structure: opts.s || null,
        name,
        order: i,
        why: opts.why || null,
        commonErrors: opts.err || null,
        cues: (cues || []).map((text, j) => ({ id: uid(), order: j, text })),
      };
    }),
    teams: [{ id: uid(), name: "Varsity", order: 0, color: TEAM_COLORS[0] }],
    practices: [],
    wrestlers: [],
    competitions: [],
    weighInSheets: [],
    history,
    categoryOrder: { POSITION: [], SITUATION: [], STRUCTURE: [] },
    syllabusRevision: SYLLABUS_REVISION,
    numberingRevision: NUMBERING_REVISION,
  };
}

const AppCtx = React.createContext(null);
const useApp = () => React.useContext(AppCtx);

function runMigrations(saved) {
  return migrateWrestlerDetails(migrateTeamColors(migrateRosterTeams(migrateNumbering(migrateTeams(migrateSyllabus(saved))))));
}

const APP_STATE_TABLE = "app_state";
const APP_STATE_ROW_ID = "singleton";

/**
 * Two persistence backends behind one interface. Without Supabase configured
 * (no VITE_SUPABASE_* at build time) this is exactly the original
 * localStorage-only behavior. With it configured, state lives in one shared
 * Postgres row (`app_state`), synced across signed-in coaches over Realtime —
 * every other function in this file (makeApi, all the components) is
 * unchanged, since both backends hand back the same `{ state, update, loaded }`
 * shape and the same in-memory state tree.
 */
function usePersistentState() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const dirty = useRef(false);
  const saving = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    if (!supabaseEnabled) {
      (async () => {
        let next = null;
        try {
          const res = await window.storage.get(STORAGE_KEY);
          if (res && res.value) next = JSON.parse(res.value);
        } catch (err) {
          next = null; // no saved state yet, or storage unavailable
        }
        if (cancelled) return;
        setState(next && next.syllabus ? runMigrations(next) : seedState());
        setLoaded(true);
      })();
      return () => { cancelled = true; };
    }

    (async () => {
      const { data, error } = await supabase
        .from(APP_STATE_TABLE)
        .select("data")
        .eq("id", APP_STATE_ROW_ID)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.error("Failed to load shared state:", error);
        setState(seedState());
        setLoaded(true);
        return;
      }
      let next = data ? data.data : null;
      if (!next || !next.syllabus) {
        next = seedState();
        await supabase
          .from(APP_STATE_TABLE)
          .upsert({ id: APP_STATE_ROW_ID, data: next, updated_by: user?.email || null });
      } else {
        next = runMigrations(next);
      }
      if (cancelled) return;
      setState(next);
      setLoaded(true);
    })();

    const channel = supabase
      .channel("app_state_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: APP_STATE_TABLE, filter: `id=eq.${APP_STATE_ROW_ID}` },
        (payload) => {
          // Skip the echo of our own in-flight save — it'll land from the
          // local update instead, avoiding a flash back to the pre-save value.
          if (saving.current) return;
          if (payload.new && payload.new.data) setState(payload.new.data);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!loaded || !state || !dirty.current) return;
    const t = setTimeout(async () => {
      if (!supabaseEnabled) {
        try {
          const p = window.storage.set(STORAGE_KEY, JSON.stringify(state));
          if (p && p.catch) p.catch(() => {});
        } catch (err) { /* storage unavailable — session-only */ }
        return;
      }
      saving.current = true;
      const { error } = await supabase
        .from(APP_STATE_TABLE)
        .upsert({ id: APP_STATE_ROW_ID, data: state, updated_at: new Date().toISOString(), updated_by: user?.email || null });
      saving.current = false;
      if (error) console.error("Failed to save shared state:", error);
    }, 350);
    return () => clearTimeout(t);
  }, [state, loaded]);

  const update = React.useCallback((fn) => {
    dirty.current = true;
    setState((s) => fn(s));
  }, []);

  return { state, update, loaded };
}

/* ============================== ACTIONS (formerly server actions) ============================== */

function makeApi(update) {
  const patchIn = (key, id, patch) =>
    update((s) => ({ ...s, [key]: s[key].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const removeFrom = (key, id) => update((s) => ({ ...s, [key]: s[key].filter((x) => x.id !== id) }));
  const nextOrder = (list) => (list.length ? Math.max(...list.map((x) => x.order || 0)) + 1 : 0);
  const patchPractice = (pid, fn) =>
    update((s) => ({ ...s, practices: s.practices.map((p) => (p.id === pid ? fn(p) : p)) }));
  const patchSheet = (sid, fn) =>
    update((s) => ({ ...s, weighInSheets: s.weighInSheets.map((x) => (x.id === sid ? fn(x) : x)) }));

  return {
    /* ---- syllabus ---- */
    createItem(input) {
      const id = uid();
      update((s) => ({
        ...s,
        syllabus: [
          ...s.syllabus,
          {
            id,
            situation: input.situation.trim() || null,
            position: input.position.trim(),
            structure: input.structure || null,
            name: input.name.trim(),
            order: nextOrder(s.syllabus),
            why: input.why.trim() || null,
            commonErrors: input.commonErrors.trim() || null,
            cues: input.cues
              .map((c) => c.trim())
              .filter(Boolean)
              .map((text, i) => ({ id: uid(), order: i, text })),
          },
        ],
      }));
      return id;
    },
    updateItem(input) {
      patchIn("syllabus", input.id, {
        situation: input.situation.trim() || null,
        position: input.position.trim(),
        structure: input.structure || null,
        name: input.name.trim(),
        why: input.why.trim() || null,
        commonErrors: input.commonErrors.trim() || null,
      });
    },
    deleteItem(id) {
      update((s) => ({
        ...s,
        syllabus: s.syllabus.filter((x) => x.id !== id),
        practices: s.practices.map((p) => ({
          ...p,
          rows: p.rows.map((r) => (r.syllabusItemId === id ? { ...r, syllabusItemId: null } : r)),
        })),
      }));
    },
    addCue(itemId, text) {
      update((s) => ({
        ...s,
        syllabus: s.syllabus.map((i) =>
          i.id === itemId ? { ...i, cues: [...i.cues, { id: uid(), order: nextOrder(i.cues), text }] } : i
        ),
      }));
    },
    updateCue(itemId, cueId, text) {
      update((s) => ({
        ...s,
        syllabus: s.syllabus.map((i) =>
          i.id === itemId ? { ...i, cues: i.cues.map((c) => (c.id === cueId ? { ...c, text } : c)) } : i
        ),
      }));
    },
    deleteCue(itemId, cueId) {
      update((s) => ({
        ...s,
        syllabus: s.syllabus.map((i) => (i.id === itemId ? { ...i, cues: i.cues.filter((c) => c.id !== cueId) } : i)),
      }));
    },
    reorderCategory(field, orderedValues) {
      update((s) => ({ ...s, categoryOrder: { ...s.categoryOrder, [field]: orderedValues } }));
    },
    importSyllabus(rows) {
      let created = 0;
      let updated = 0;
      update((s) => {
        const items = [...s.syllabus];
        for (const r of rows) {
          const position = (r[1] || "").trim();
          const name = (r[3] || "").trim();
          if (!position || !name) continue;
          const situation = (r[2] || "").trim() || null;
          const structureRaw = (r[0] || "").trim().toUpperCase();
          const data = {
            why: (r[5] || "").trim() || null,
            commonErrors: (r[6] || "").trim() || null,
            structure: CATEGORIES.includes(structureRaw) ? structureRaw : null,
          };
          const cues = (r[4] || "")
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
            .map((text, i) => ({ id: uid(), order: i, text }));
          const idx = items.findIndex((i) => i.situation === situation && i.position === position && i.name === name);
          if (idx >= 0) {
            items[idx] = { ...items[idx], ...data, cues: cues.length ? cues : items[idx].cues };
            updated++;
          } else {
            items.push({
              id: uid(), situation, position, name, order: nextOrder(items), cues, ...data,
            });
            created++;
          }
        }
        return { ...s, syllabus: items };
      });
      return { created, updated };
    },

    /* ---- practices ---- */
    createTeam(name) {
      const id = uid();
      update((s) => ({
        ...s,
        teams: [
          ...s.teams,
          { id, name: name.trim() || "New Team", order: s.teams.length, color: TEAM_COLORS[s.teams.length % TEAM_COLORS.length] },
        ],
      }));
      return id;
    },
    updateTeam: (id, data) => patchIn("teams", id, data),
    /**
     * Reassigning a practice's team also pulls it into that team's number
     * sequence — otherwise it would carry its old team's number across and
     * collide with an existing practice.
     */
    movePracticeToTeam(practiceId, teamId) {
      update((s) => ({
        ...s,
        practices: renumberPractices(
          s.practices.map((p) => (p.id === practiceId ? { ...p, teamId } : p))
        ),
      }));
    },
    /**
     * Pushes a team's baseline onto its existing practices. Only fields the
     * baseline actually sets are written, and reconciled practices are skipped
     * — their times and room are the record of what actually ran.
     *
     * `onlyBlank` fills gaps without disturbing practices that were moved.
     */
    applyTeamBaseline(teamId, onlyBlank) {
      update((s) => {
        const team = s.teams.find((t) => t.id === teamId);
        if (!team) return s;
        return {
          ...s,
          practices: s.practices.map((p) => {
            if (p.teamId !== teamId || p.reconciledAt) return p;
            const next = { ...p };
            for (const key of BASELINE_FIELDS) {
              const base = team[`default${key[0].toUpperCase()}${key.slice(1)}`];
              if (!base || !String(base).trim()) continue;
              if (onlyBlank && p[key]) continue;
              next[key] = String(base).trim();
            }
            return next;
          }),
        };
      });
    },
    /**
     * Fills a date range with practices on the given weekdays (0 = Sunday).
     * Dates that already have a practice for this team are skipped, so it can
     * be re-run to extend a season without doubling anything up.
     */
    generatePractices(teamId, startDate, endDate, weekdays) {
      let created = 0;
      update((s) => {
        const taken = new Set(s.practices.filter((p) => p.teamId === teamId).map((p) => p.date));
        const base = practiceDefaults(s, teamId, startDate);
        const added = [];
        const end = parseDateOnly(endDate);
        for (let d = parseDateOnly(startDate); d <= end; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
          if (!weekdays.includes(d.getDay())) continue;
          const key = dateKey(d);
          if (taken.has(key)) continue;
          taken.add(key);
          added.push({
            id: uid(), date: key, teamId,
            startTime: base.startTime, endTime: base.endTime,
            location: base.location || null, address: base.address || null,
            practiceNumber: null, dayNotes: "", reconciledAt: null, rows: [],
          });
        }
        created = added.length;
        if (!created) return s;
        return { ...s, practices: renumberPractices([...s.practices, ...added]) };
      });
      return created;
    },
    renumberAllPractices() {
      update((s) => ({ ...s, practices: renumberPractices(s.practices) }));
    },
    /**
     * Deleting a team reassigns its practices, competitions, wrestlers, and
     * sheets to the fallback team rather than deleting them — a season's
     * records shouldn't vanish because a level got renamed or folded.
     */
    deleteTeam(id, fallbackId) {
      update((s) => {
        if (s.teams.length <= 1) return s;
        const target = fallbackId || s.teams.find((t) => t.id !== id).id;
        const move = (list) => list.map((r) => (r.teamId === id ? { ...r, teamId: target } : r));
        // A wrestler on several teams just loses this one; a wrestler who was
        // only on it moves to the fallback so they stay on some roster.
        const wrestlers = s.wrestlers.map((w) => {
          const rest = teamsOf(w).filter((t) => t !== id);
          return { ...w, teamIds: rest.length ? rest : [target] };
        });
        return {
          ...s,
          teams: s.teams.filter((t) => t.id !== id).map((t, i) => ({ ...t, order: i })),
          practices: move(s.practices),
          competitions: move(s.competitions),
          wrestlers,
          weighInSheets: move(s.weighInSheets),
        };
      });
    },
    /**
     * Accepts either a bare "YYYY-MM-DD" string or a full input object, so the
     * Practice Plans tab can still create a plan from a date alone while the
     * dashboard captures team, number, times, and location up front.
     *
     * Practice numbers run per team: Elite can be on #48 while Rookies is on #12.
     */
    createPractice(input) {
      const o = typeof input === "string" ? { date: input } : input || {};
      const id = uid();
      const clean = (v) => (v && String(v).trim() ? String(v).trim() : "");
      update((s) => {
        const teamId = o.teamId || (s.teams[0] && s.teams[0].id) || null;
        const nums = s.practices.filter((p) => p.teamId === teamId).map((p) => p.practiceNumber || 0);
        const autoNumber = (nums.length ? Math.max(...nums) : 0) + 1;
        // Fill from the team's baseline (or its last practice) when the caller
        // left these out. An explicit "" still means blank.
        const base = practiceDefaults(s, teamId, o.date);
        const inherit = (key) => (o[key] === undefined ? base[key] : o[key]);
        const typed = o.practiceNumber != null && String(o.practiceNumber).trim() !== ""
          ? Number(o.practiceNumber)
          : autoNumber;
        return {
          ...s,
          practices: [
            ...s.practices,
            {
              id,
              date: o.date,
              teamId,
              startTime: clean(inherit("startTime")),
              endTime: clean(inherit("endTime")),
              location: clean(inherit("location")) || null,
              address: clean(inherit("address")) || null,
              practiceNumber: Number.isFinite(typed) ? typed : autoNumber,
              dayNotes: "",
              reconciledAt: null,
              rows: [],
            },
          ],
        };
      });
      return id;
    },
    deletePractice(id) {
      update((s) => ({
        ...s,
        practices: s.practices.filter((p) => p.id !== id),
        weighInSheets: s.weighInSheets.map((w) => (w.practiceId === id ? { ...w, practiceId: null } : w)),
      }));
    },
    updatePracticeHeader: (id, data) => patchIn("practices", id, data),
    addRow(pid, category) {
      patchPractice(pid, (p) => ({
        ...p,
        rows: [
          ...p.rows,
          {
            id: uid(), order: nextOrder(p.rows), category, durationMin: 0,
            syllabusItemId: null, adHocLabel: "", teachingCues: "", outcome: "PLANNED",
          },
        ],
      }));
    },
    addRowFromSyllabus(pid, syllabusItemId) {
      update((s) => {
        const item = s.syllabus.find((i) => i.id === syllabusItemId);
        return {
          ...s,
          practices: s.practices.map((p) =>
            p.id === pid
              ? {
                  ...p,
                  rows: [
                    ...p.rows,
                    {
                      id: uid(),
                      order: nextOrder(p.rows),
                      category: "DRILL",
                      durationMin: 0,
                      syllabusItemId,
                      adHocLabel: "",
                      teachingCues: item ? item.cues.map((c) => c.text).join(" | ") : "",
                      outcome: "PLANNED",
                    },
                  ],
                }
              : p
          ),
        };
      });
    },
    updateRow(pid, rowId, data) {
      patchPractice(pid, (p) => ({ ...p, rows: p.rows.map((r) => (r.id === rowId ? { ...r, ...data } : r)) }));
    },
    deleteRow(pid, rowId) {
      patchPractice(pid, (p) => ({ ...p, rows: p.rows.filter((r) => r.id !== rowId) }));
    },
    moveRow(pid, rowId, direction) {
      patchPractice(pid, (p) => {
        const rows = [...p.rows].sort((a, b) => a.order - b.order);
        const i = rows.findIndex((r) => r.id === rowId);
        const j = direction === "up" ? i - 1 : i + 1;
        if (i === -1 || j < 0 || j >= rows.length) return p;
        const a = rows[i];
        const b = rows[j];
        return { ...p, rows: p.rows.map((r) => (r.id === a.id ? { ...r, order: b.order } : r.id === b.id ? { ...r, order: a.order } : r)) };
      });
    },
    reconcilePractice: (id) => patchIn("practices", id, { reconciledAt: new Date().toISOString() }),
    reopenPractice: (id) => patchIn("practices", id, { reconciledAt: null }),

    /* ---- roster ---- */
    createWrestler(name, weightClass, teamIds) {
      update((s) => {
        const list = (teamIds || []).filter(Boolean);
        return {
          ...s,
          wrestlers: [
            ...s.wrestlers,
            {
              id: uid(), name, weightClass, active: true,
              teamIds: list.length ? list : [(s.teams[0] && s.teams[0].id)].filter(Boolean),
              order: nextOrder(s.wrestlers),
              ...emptyWrestlerDetails(),
              detailsAdded: true,
            },
          ],
        };
      });
    },
    /**
     * Adds or removes one team from a wrestler. A wrestler is never left with
     * no team — removing their last one is a no-op, since an unassigned
     * wrestler would drop off every roster view at once.
     */
    toggleWrestlerTeam(wrestlerId, teamId) {
      update((s) => ({
        ...s,
        wrestlers: s.wrestlers.map((w) => {
          if (w.id !== wrestlerId) return w;
          const current = teamsOf(w);
          if (!current.includes(teamId)) return { ...w, teamIds: [...current, teamId] };
          if (current.length <= 1) return w;
          return { ...w, teamIds: current.filter((t) => t !== teamId) };
        }),
      }));
    },
    updateWrestler: (id, data) => patchIn("wrestlers", id, data),
    deleteWrestler: (id) => removeFrom("wrestlers", id),
    /**
     * Accepts two shapes. The simple round-trip export — Name, Teams, Weight
     * Class, Active — and a club's fuller registration/roster export (25
     * columns: Team, First, Last, DOB, Gender, Age, Grade, Weight, Parent,
     * Cell, Email, Emergency Contact, Cell, Net, Discount Amount, Discount
     * Name, Refunds, Allergies, List, Insurance, Policy #, Address, City,
     * Zip, State), told apart by column count. Either way, matching is by
     * full name; unknown team names are ignored rather than created.
     */
    importRoster(rows) {
      let created = 0;
      let updated = 0;
      update((s) => {
        const list = [...s.wrestlers];
        const teamIdsFor = (raw) =>
          (raw || "")
            .split(";")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
            .map((t) => (s.teams.find((x) => x.name.toLowerCase() === t) || {}).id)
            .filter(Boolean);
        const toNum = (raw) => {
          const n = Number((raw || "").trim());
          return (raw || "").trim() && !Number.isNaN(n) ? n : null;
        };

        for (const r of rows) {
          const wide = r.length > 6;
          let name, teamIds, weightClass, active, details;

          if (wide) {
            const [
              team, first, last, dob, gender, age, grade, weight, parent, cell, email,
              ecName, ecCell, net, discAmt, discName, refunds, allergies, list_, insurance,
              policy, address, city, zip, state,
            ] = r.map((c) => (c || "").trim());
            name = `${first} ${last}`.trim();
            teamIds = teamIdsFor(team);
            weightClass = toNum(weight);
            active = null; // the club sheet doesn't track this — leave existing wrestlers' flag alone
            details = {
              firstName: first, lastName: last, dob, gender, age, grade,
              parentName: parent, parentCell: cell, email,
              emergencyContactName: ecName, emergencyContactPhone: ecCell,
              allergies, insurance, policyNumber: policy,
              address, city, state, zip,
              discountName: discName, discountAmount: discAmt, refunds, net, list: list_,
            };
          } else {
            name = (r[0] || "").trim();
            teamIds = teamIdsFor(r[1]);
            weightClass = toNum(r[2]);
            const activeRaw = (r[3] || "").trim().toLowerCase();
            active = activeRaw ? activeRaw === "yes" || activeRaw === "true" : true;
            details = null;
          }
          if (!name) continue;

          const idx = list.findIndex((w) => w.name === name);
          const fallback = [(s.teams[0] || {}).id].filter(Boolean);
          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              weightClass,
              active: active === null ? list[idx].active : active,
              teamIds: teamIds.length ? teamIds : teamsOf(list[idx]),
              ...(details || {}),
            };
            updated++;
          } else {
            list.push({
              id: uid(), name, weightClass, active: active === null ? true : active,
              teamIds: teamIds.length ? teamIds : fallback,
              order: nextOrder(list),
              ...emptyWrestlerDetails(),
              ...(details || {}),
              detailsAdded: true,
            });
            created++;
          }
        }
        return { ...s, wrestlers: list };
      });
      return { created, updated };
    },

    /* ---- competitions ---- */
    createCompetition(input) {
      const id = uid();
      update((s) => ({
        ...s,
        competitions: [
          ...s.competitions,
          {
            id,
            date: input.dateStr,
            teamId: input.teamId || (s.teams[0] && s.teams[0].id) || null,
            team: (input.team || "").trim(),
            name: input.name,
            type: input.type,
            startTime: (input.startTime || "").trim(),
            location: (input.location || "").trim() || null,
            address: (input.address || "").trim() || null,
            notes: null,
            weighIns: [],
          },
        ],
      }));
      return id;
    },
    updateCompetition: (id, data) => patchIn("competitions", id, data),
    /**
     * Removes a competition. Any weigh-in sheet nested under it is kept — the
     * sheet is the record of what wrestlers actually weighed, so it survives
     * on the Weigh-In tab with its event link cleared.
     */
    deleteCompetition(id) {
      update((s) => ({
        ...s,
        competitions: s.competitions.filter((c) => c.id !== id),
        weighInSheets: s.weighInSheets.map((w) => (w.competitionId === id ? { ...w, competitionId: null } : w)),
      }));
    },
    setCompetitionWeighIn(compId, wrestlerId, data) {
      update((s) => ({
        ...s,
        competitions: s.competitions.map((c) => {
          if (c.id !== compId) return c;
          const exists = c.weighIns.some((w) => w.wrestlerId === wrestlerId);
          return {
            ...c,
            weighIns: exists
              ? c.weighIns.map((w) => (w.wrestlerId === wrestlerId ? { ...w, ...data } : w))
              : [...c.weighIns, { wrestlerId, weight: null, weightClass: null, notes: null, ...data }],
          };
        }),
      }));
    },

    /* ---- weigh-in sheets ---- */
    createWeighInSheet(input) {
      const id = uid();
      const clean = (v) => (v && String(v).trim() ? String(v).trim() : null);
      update((s) => {
        const teamId = input.teamId || (s.teams[0] && s.teams[0].id) || null;
        return {
          ...s,
          weighInSheets: [
            ...s.weighInSheets,
            {
              id, date: input.date,
              event: clean(input.event),
              homeTeam: clean(input.homeTeam),
              visitorTeam: clean(input.visitorTeam),
              teamId,
              competitionId: input.competitionId || null,
              practiceId: input.practiceId || null,
              archivedAt: null, createdAt: new Date().toISOString(),
              // Seeded from the team's active roster so a sheet opens ready to
              // weigh instead of empty. Anyone out for this event is scratched
              // on the sheet, which never touches the roster itself.
              entries: input.populate === false ? [] : s.wrestlers
                .filter((w) => w.active && onRosterOf(w, teamId))
                .sort((a, b) => a.order - b.order)
                .map((w, i) => ({
                  id: uid(), weightClass: w.weightClass ?? null, wrestlerId: w.id,
                  name: w.name, weight: null, level: null, available: true, order: i,
                })),
            },
          ],
        };
      });
      return id;
    },
    updateWeighInHeader(sid, data) {
      patchIn("weighInSheets", sid, {
        date: data.date,
        event: data.event.trim() || null,
        homeTeam: data.homeTeam.trim() || null,
        visitorTeam: data.visitorTeam.trim() || null,
      });
    },
    populateFromRoster(sid) {
      update((s) => {
        const sheet = s.weighInSheets.find((x) => x.id === sid);
        if (!sheet) return s;
        const already = new Set(sheet.entries.map((e) => e.wrestlerId).filter(Boolean));
        const toAdd = s.wrestlers
          .filter((w) => w.active && !already.has(w.id) && onRosterOf(w, sheet.teamId))
          .sort((a, b) => a.order - b.order);
        if (!toAdd.length) return s;
        let order = nextOrder(sheet.entries);
        const entries = [
          ...sheet.entries,
          ...toAdd.map((w) => ({
            id: uid(), weightClass: w.weightClass ?? null, wrestlerId: w.id,
            name: w.name, weight: null, level: null, available: true, order: order++,
          })),
        ];
        return { ...s, weighInSheets: s.weighInSheets.map((x) => (x.id === sid ? { ...x, entries } : x)) };
      });
    },
    /** Scratch or restore a wrestler for this event only. */
    toggleEntryAvailable(sid, entryId) {
      patchSheet(sid, (sh) => ({
        ...sh,
        entries: sh.entries.map((e) => (e.id === entryId ? { ...e, available: e.available === false } : e)),
      }));
    },
    addEntry(sid, data) {
      patchSheet(sid, (sh) => ({
        ...sh,
        entries: [
          ...sh.entries,
          {
            id: uid(), weightClass: data.weightClass, wrestlerId: data.wrestlerId,
            name: data.name.trim(), weight: null, level: null, available: true, order: nextOrder(sh.entries),
          },
        ],
      }));
    },
    updateEntry(sid, entryId, data) {
      patchSheet(sid, (sh) => ({
        ...sh,
        entries: sh.entries.map((e) =>
          e.id === entryId
            ? { ...e, weightClass: data.weightClass, name: data.name.trim(), weight: data.weight, level: data.level.trim() || null }
            : e
        ),
      }));
    },
    deleteEntry(sid, entryId) {
      patchSheet(sid, (sh) => ({ ...sh, entries: sh.entries.filter((e) => e.id !== entryId) }));
    },
    archiveWeighInSheet: (sid) => patchIn("weighInSheets", sid, { archivedAt: new Date().toISOString() }),
    unarchiveWeighInSheet: (sid) => patchIn("weighInSheets", sid, { archivedAt: null }),
    deleteWeighInSheet: (sid) => removeFrom("weighInSheets", sid),

    /* ---- history ---- */
    createHistoryRecord(input) {
      update((s) => ({
        ...s,
        history: [
          ...s.history,
          {
            id: uid(), category: input.category, weight: input.weight.trim(),
            name: input.name.trim(), years: input.years.trim(), order: nextOrder(s.history),
          },
        ],
      }));
    },
    updateHistoryRecord(id, data) {
      patchIn("history", id, { weight: data.weight.trim(), name: data.name.trim(), years: data.years.trim() });
    },
    deleteHistoryRecord: (id) => removeFrom("history", id),

    /* ---- program / theme ---- */
    updateTheme(data) {
      update((s) => ({ ...s, program: { ...s.program, ...data } }));
    },
    updateLogo(logoDataUrl) {
      update((s) => ({ ...s, program: { ...s.program, logoDataUrl } }));
    },
    resetTheme() {
      update((s) => ({ ...s, program: { ...s.program, ...THEME_DEFAULTS, logoDataUrl: null } }));
    },
    resetAllData() {
      update(() => seedState());
    },
  };
}

/* ============================== SHELL ============================== */

function AppHeader({ logoDataUrl }) {
  return (
    <div className="card mb5" style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, lineHeight: 1 }}>
          <span style={{ fontFamily: "var(--font-brand)", fontSize: 40, letterSpacing: ".03em" }}>
            <span style={{ color: "var(--text)" }}>MAT</span>
            <span style={{ color: "var(--accent)" }}>PLAN</span>
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: "4px 0 0" }}>
          Plan. Teach. Develop. Win.
        </p>
      </div>
      <div style={{ flex: "1 1 320px", textAlign: "center", margin: "0 16px" }}>
        <h1 className="eb" style={{ fontFamily: "var(--font-heading)", fontSize: 15, margin: 0, lineHeight: 1.25 }}>
          The Complete Wrestling Development System for Building Championship Programs
        </h1>
        <p className="muted xs" style={{ margin: "4px 0 0", lineHeight: 1.4 }}>
          Create structured curriculums, build better practices, track athlete progress, manage weigh-ins, preserve
          program history, and develop wrestlers through a proven Teach-Drill-Test framework.
        </p>
      </div>
      {logoDataUrl && <img src={logoDataUrl} alt="Team logo" style={{ height: 96, maxWidth: 280, objectFit: "contain" }} />}
    </div>
  );
}

const TABS = [
  { tab: "dashboard", label: "Dashboard" },
  { tab: "syllabus", label: "Syllabus" },
  { tab: "practice", label: "Practice Plans" },
  { tab: "roster", label: "Roster" },
  { tab: "weighin", label: "Weigh-In" },
  { tab: "history", label: "History" },
];

function TabNav() {
  const { view, go } = useApp();
  const { user, signOut } = useAuth();
  return (
    <div className="card mb5" style={{ padding: 4, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.tab} className={`tab${view.tab === t.tab ? " on" : ""}`} onClick={() => go(t.tab)}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="row gap2" style={{ flexShrink: 0, marginRight: 4 }}>
        {user && (
          <button className="btn btn-ghost btn-sm" title={user.email} onClick={signOut}>
            Sign Out
          </button>
        )}
        <button className="btn btn-ghost btn-sm" title="Customize appearance" onClick={() => go("settings")}>
          ⚙ Customize
        </button>
      </div>
    </div>
  );
}

function PracticeSubNav() {
  const { view, go } = useApp();
  const here = view.tab === "practice" && view.sub === "archive" ? "archive" : "plans";
  return (
    <div className="tabs" style={{ padding: 0, marginBottom: 12 }}>
      <button className={`tab${here === "plans" ? " on" : ""}`} onClick={() => go("practice")}>Plans</button>
      <button className={`tab${here === "archive" ? " on" : ""}`} onClick={() => go("practice", "archive")}>Archive</button>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */

const DAY_MS = 86400000;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Dashboard() {
  const { state, go } = useApp();
  const teamName = useTeamName();
  const colorOf = (teamId) => teamColor(state.teams.find((t) => t.id === teamId));
  const [teamFilter, setTeamFilter] = useState(null); // null = all teams
  const now = new Date();
  const todayK = dateKey(now);
  const onTeam = (row) => !teamFilter || row.teamId === teamFilter;

  /*
   * Fixed Sunday–Saturday weeks, not a rolling 21-day window. The block only
   * advances when a new Sunday arrives, so the week you're looking at mid-week
   * is the same one you saw on Monday.
   *
   * Built by calendar parts rather than adding DAY_MS — the season crosses the
   * November DST change, and millisecond math drifts an hour there, which is
   * enough to throw a Saturday event into the wrong week.
   */
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const weekStart = addDays(now, -now.getDay()); // back up to this week's Sunday

  const weeks = [0, 1, 2].map((w) => {
    const start = addDays(weekStart, w * 7);
    const end = addDays(start, 6); // Saturday, inclusive
    return { start, end, startK: dateKey(start), endK: dateKey(end), isCurrent: w === 0, events: [] };
  });
  const rangeStartK = weeks[0].startK;
  const rangeEndK = weeks[2].endK;

  const inRange = (d) => d >= rangeStartK && d <= rangeEndK;
  const events = [
    ...state.practices.filter((p) => onTeam(p) && inRange(p.date)).map((p) => ({ kind: "Practice", date: p.date, id: p.id, teamId: p.teamId, num: p.practiceNumber })),
    ...state.competitions.filter((c) => onTeam(c) && inRange(c.date)).map((c) => ({ kind: "Competition", date: c.date, id: c.id, name: c.name, teamId: c.teamId })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  for (const w of weeks) w.events = events.filter((e) => e.date >= w.startK && e.date <= w.endK);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="hdr">
          <h2 className="b" style={{ fontSize: 16 }}>Next 3 Weeks</h2>
          <div className="row gap2 wrapf">
            <span className="muted tiny upper">Team</span>
            <TeamSelect value={teamFilter} onChange={setTeamFilter} allLabel="All Teams" style={{ maxWidth: 180 }} />
          </div>
        </div>
        <div className="grid g3">
          {weeks.map((week, i) => (
            <div key={i} className="ib">
              <div className="ibhdr row between gap2">
                <span className="sb xs">{fmtShort(week.start)} – {fmtShort(week.end)}</span>
                {week.isCurrent && <Pill label="This Week" tone="emerald" />}
              </div>
              <div className="divide">
                {week.events.map((e) => (
                  <div key={`${e.kind}-${e.id}`} className="pad row between gap2">
                    <div
                      className="row between click"
                      style={{ flex: 1, minWidth: 0 }}
                      onClick={() => (e.kind === "Practice" ? go("dashboard", "practiceday", e.id) : go("dashboard", "competition", e.id))}
                    >
                      <span
                        className="sb xs"
                        style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: e.date < todayK ? 0.45 : 1 }}
                      >
                        {fmtDay(e.date)}
                        {!teamFilter && teamName(e.teamId) ? <span className="muted"> · {teamName(e.teamId)}</span> : null}
                      </span>
                      <span className="pill" style={eventPillStyle(colorOf(e.teamId), e.kind === "Practice" ? "practice" : "competition")}>
                        {e.kind}
                      </span>
                    </div>
                    {e.kind === "Practice" ? (
                      <DeletePracticeButton practiceId={e.id} label="✕" />
                    ) : (
                      <DeleteCompetitionButton competitionId={e.id} label="✕" />
                    )}
                  </div>
                ))}
                {week.events.length === 0 && <div className="pad muted xs">Nothing scheduled.</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CalendarSection teamFilter={teamFilter} />
    </div>
  );
}

function CalendarSection({ teamFilter }) {
  const { state, go } = useApp();
  const teamName = useTeamName();
  const colorOf = (teamId) => teamColor(state.teams.find((t) => t.id === teamId));
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const { year, month } = cursor;

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

  const days = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) days.push(new Date(d));

  const byDay = new Map();
  const ensure = (k) => {
    if (!byDay.has(k)) byDay.set(k, { practices: [], competitions: [] });
    return byDay.get(k);
  };
  const onTeam = (row) => !teamFilter || row.teamId === teamFilter;
  for (const p of state.practices) {
    if (!onTeam(p)) continue;
    ensure(p.date).practices.push({ id: p.id, practiceNumber: p.practiceNumber, teamId: p.teamId });
  }
  for (const c of state.competitions) {
    if (!onTeam(c)) continue;
    ensure(c.date).competitions.push({ id: c.id, name: c.name, type: c.type, teamId: c.teamId });
  }

  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayK = dateKey(now);
  const [addDay, setAddDay] = useState(null);
  const [preview, setPreview] = useState(null); // { kind, id } — single-click peek

  const step = (delta) => {
    const d = new Date(year, month - 1 + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() + 1 });
    setAddDay(null);
  };

  return (
    <div className="card">
      <div className="hdr">
        <h2 className="sb" style={{ fontSize: 14 }}>{monthLabel}</h2>
        <div className="row gap2 wrapf">
          <button className="btn btn-ghost btn-sm" onClick={() => step(-1)}>← Prev</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCursor({ year: now.getFullYear(), month: now.getMonth() + 1 })}>Today</button>
          <button className="btn btn-ghost btn-sm" onClick={() => step(1)}>Next →</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
      </div>
      <div className="pad">
        {addDay && <DayAddPanel key={addDay} dateStr={addDay} defaultTeamId={teamFilter} onClose={() => setAddDay(null)} go={go} />}
        {preview && <EventPreview key={preview.id} {...preview} onClose={() => setPreview(null)} go={go} />}
        <div className="cal-grid" style={{ marginBottom: 4 }}>
          {WEEKDAYS.map((w) => (
            <div key={w} className="muted tiny upper" style={{ textAlign: "center" }}>{w}</div>
          ))}
        </div>
        <div className="cal-grid">
          {days.map((d) => {
            const key = dateKey(d);
            return (
              <CalendarDay
                key={key}
                dateStr={key}
                dayNum={d.getDate()}
                inMonth={d.getMonth() === month - 1}
                isToday={key === todayK}
                selected={key === addDay}
                entry={byDay.get(key) || { practices: [], competitions: [] }}
                onAdd={() => { setPreview(null); setAddDay((cur) => (cur === key ? null : key)); }}
                onSelect={(kind, id) => { setAddDay(null); setPreview((cur) => (cur && cur.id === id ? null : { kind, id })); }}
                previewId={preview && preview.id}
                teamLabel={teamFilter ? null : teamName}
                colorOf={colorOf}
                go={go}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * The add form lives below the grid rather than floating over a day cell.
 * `.card` uses a clip-path notch, which clips every descendant to the card's
 * outline — an absolutely positioned popover gets sliced off at the bottom
 * edge, so the form has to sit in normal flow and let the card grow.
 */
/**
 * Single-click peek at an event. Sits above the grid for the same reason the
 * add form does — `.card` clips anything absolutely positioned inside it, so a
 * floating popover over the day cell would be cut off at the card edge.
 */
function EventPreview({ kind, id, onClose, go }) {
  const { state } = useApp();
  const teamName = useTeamName();
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [id]);

  const practice = kind === "practice" ? state.practices.find((p) => p.id === id) : null;
  const competition = kind === "competition" ? state.competitions.find((c) => c.id === id) : null;
  const row = practice || competition;
  if (!row) return null;

  const team = state.teams.find((t) => t.id === row.teamId);
  const mins = practice ? clockDuration(practice.startTime, practice.endTime) : null;
  const time = row.startTime
    ? `${row.startTime}${practice && practice.endTime ? `–${practice.endTime}` : ""}${mins != null ? ` (${mins} min)` : ""}`
    : "No time set";

  const title = practice
    ? `Practice${practice.practiceNumber ? ` #${practice.practiceNumber}` : ""}`
    : competition.name;

  return (
    <div ref={panelRef} className="ib pad dayadd" style={{ marginBottom: 12 }}>
      <div className="row between wrapf gap2">
        <div className="row gap2 wrapf">
          <span className="pill" style={eventPillStyle(teamColor(team), kind)}>{teamName(row.teamId) || "—"}</span>
          <span className="sb">{title}</span>
          {practice && (practice.reconciledAt ? <Pill label="Reconciled" tone="emerald" /> : <Pill label="Plan in progress" tone="slate" />)}
          {competition && <Pill label={competition.type === "DUAL" ? "Dual Meet" : "Tournament"} tone="slate" />}
        </div>
        <button className="btn btn-ghost btn-sm iconbtn" onClick={onClose}>Close</button>
      </div>

      <div className="grid g4" style={{ marginTop: 10 }}>
        <Field label="Team"><p className="xs">{teamName(row.teamId) || "—"}</p></Field>
        <Field label="Date"><p className="xs">{fmtLong(row.date)}</p></Field>
        <Field label="Time"><p className="xs">{time}</p></Field>
        <Field label="Location"><p className="xs">{row.location || <span className="muted">—</span>}</p></Field>
      </div>
      {row.address && <p className="muted xs" style={{ marginTop: 6 }}>{row.address}</p>}

      <div className="row gap2 wrapf" style={{ marginTop: 10 }}>
        {practice ? (
          <>
            <button className="btn btn-g btn-sm" onClick={() => go("dashboard", "practiceday", practice.id)}>Open Practice →</button>
            <button className="btn btn-ghost btn-sm" onClick={() => go("practice", "detail", practice.id)}>Practice Plan →</button>
          </>
        ) : (
          <button className="btn btn-g btn-sm" onClick={() => go("dashboard", "competition", competition.id)}>Open Competition →</button>
        )}
      </div>
    </div>
  );
}

function DayAddPanel({ dateStr, defaultTeamId, onClose, go }) {
  const { state, api } = useApp();
  const teamName = useTeamName();
  const [kind, setKind] = useState("practice");
  const [justAdded, setJustAdded] = useState(null);
  const firstTeam = defaultTeamId || (state.teams[0] || {}).id || null;
  const carry = practiceDefaults(state, firstTeam, dateStr);
  const [form, setForm] = useState({
    teamId: firstTeam,
    date: dateStr,
    practiceNumber: "",
    name: "",
    type: "DUAL",
    startTime: carry.startTime,
    endTime: carry.endTime,
    location: carry.location,
    address: carry.address,
  });
  // Fields the coach has typed into are never overwritten by a carry-forward.
  const edited = useRef(new Set());
  const set = (k) => (e) => {
    edited.current.add(k);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const source = previousPractice(state.practices, form.teamId, form.date || dateStr);
  const teamHasBaseline = BASELINE_FIELDS.some((k) => {
    const t = state.teams.find((x) => x.id === form.teamId) || {};
    return (t[`default${k[0].toUpperCase()}${k.slice(1)}`] || "").trim();
  });

  /** Switching team pulls that team's usual time and room in instead. */
  function changeTeam(teamId) {
    const base = practiceDefaults(state, teamId, form.date || dateStr);
    setForm((f) => {
      const next = { ...f, teamId };
      for (const key of BASELINE_FIELDS) {
        if (!edited.current.has(key)) next[key] = base[key];
      }
      return next;
    });
  }

  function clearCarried() {
    for (const k of ["startTime", "endTime", "location", "address"]) edited.current.add(k);
    setForm((f) => ({ ...f, startTime: "", endTime: "", location: "", address: "" }));
  }

  /**
   * Scheduling and planning are separate jobs. Adding an event keeps you on the
   * dashboard with the form open so a whole season's schedule can be entered in
   * one pass; the plan itself gets built later from the Practice Plans tab.
   */
  function submit() {
    const on = form.date || dateStr;
    if (kind === "practice") {
      const id = api.createPractice({
        date: on,
        teamId: form.teamId,
        practiceNumber: form.practiceNumber,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        address: form.address,
      });
      setJustAdded({ kind: "practice", id, date: on, label: "Practice" });
      setForm((f) => ({ ...f, practiceNumber: "" }));
      return;
    }
    if (!form.name.trim()) return;
    const id = api.createCompetition({
      dateStr: on,
      teamId: form.teamId,
      name: form.name.trim(),
      type: form.type,
      startTime: form.startTime,
      location: form.location,
      address: form.address,
    });
    setJustAdded({ kind: "competition", id, date: on, label: form.name.trim() });
    setForm((f) => ({ ...f, name: "", address: "" }));
  }

  const panelRef = useRef(null);
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [dateStr]);

  return (
    <div ref={panelRef} className="ib pad dayadd" style={{ marginBottom: 12 }}>
      <div className="row between wrapf gap2" style={{ marginBottom: 10 }}>
        <div className="row gap2 wrapf">
          <span className="sb xs">Add to {fmtFull(dateStr)}</span>
          <button className={`btn btn-sm ${kind === "practice" ? "btn-g" : "btn-ghost"}`} onClick={() => setKind("practice")}>Practice</button>
          <button className={`btn btn-sm ${kind === "competition" ? "btn-g" : "btn-ghost"}`} onClick={() => setKind("competition")}>Competition</button>
        </div>
        <button className="btn btn-ghost btn-sm iconbtn" onClick={onClose}>{justAdded ? "Done" : "Cancel"}</button>
      </div>

      <div className="grid g4">
        <Field label="Team">
          <TeamSelect value={form.teamId} onChange={changeTeam} />
        </Field>
        {kind === "practice" ? (
          <Field label="Practice #"><input className="inp" placeholder="Practice # (auto)" value={form.practiceNumber} onChange={set("practiceNumber")} /></Field>
        ) : (
          <Field label="Event Name"><input className="inp" placeholder="Event name" value={form.name} onChange={set("name")} /></Field>
        )}
        {kind === "competition" && (
          <Field label="Event Type">
            <select className="inp" value={form.type} onChange={set("type")}>
              <option value="DUAL">Dual Meet</option>
              <option value="TOURNAMENT">Tournament</option>
            </select>
          </Field>
        )}
        <Field label="Date"><input type="date" className="inp" value={form.date} onChange={set("date")} /></Field>
        <Field label={kind === "practice" ? "Start Time" : "Time"}>
          <input className="inp" placeholder={kind === "practice" ? "Start time (6:00 PM)" : "Time (9:00 AM)"} value={form.startTime} onChange={set("startTime")} />
        </Field>
        {kind === "practice" && (
          <Field label="End Time"><input className="inp" placeholder="End time (7:30 PM)" value={form.endTime} onChange={set("endTime")} /></Field>
        )}
        <Field label="Location"><input className="inp" placeholder="Location" value={form.location} onChange={set("location")} /></Field>
        <Field label="Address">
          <input className="inp" placeholder="Street address" value={form.address} onChange={set("address")} />
        </Field>
      </div>

      {justAdded && (
        <p className="xs" style={{ marginTop: 8, color: "var(--tone-emerald-color)" }}>
          Added {justAdded.label} on {fmtFull(justAdded.date)}.{" "}
          <button
            className="link xs"
            onClick={() => go("dashboard", justAdded.kind === "practice" ? "practiceday" : "competition", justAdded.id)}
          >
            Open it
          </button>
        </p>
      )}

      {kind === "practice" && (form.startTime || form.endTime || form.location || form.address) && (
        <p className="muted xs" style={{ marginTop: 8 }}>
          {teamHasBaseline
            ? `Prefilled from the ${teamName(form.teamId)} baseline.`
            : source
              ? `Carried from ${teamName(source.teamId)} #${source.practiceNumber} on ${fmtFull(source.date)}.`
              : "Prefilled."}{" "}
          <button className="link xs" onClick={clearCarried}>Clear</button>
        </p>
      )}

      <div className="row gap2" style={{ marginTop: 10 }}>
        <button className="btn btn-g btn-sm" disabled={kind === "competition" && !form.name.trim()} onClick={submit}>
          {kind === "practice" ? "Add Practice" : "Add Competition"}
        </button>
      </div>
    </div>
  );
}

function CalendarDay({ dateStr, dayNum, inMonth, isToday, selected, entry, onAdd, onSelect, previewId, teamLabel, colorOf, go }) {
  return (
    <div className={`cal-cell${inMonth ? "" : " out"}${selected ? " sel" : ""}`}>
      <div className="row between">
        <span className="xs sb" style={isToday ? { color: "var(--accent)" } : undefined}>{dayNum}</span>
        {inMonth && (
          <button className="btn btn-ghost btn-sm" style={{ padding: "0 4px" }} onClick={onAdd} title="Add to this day">+</button>
        )}
      </div>

      {entry.practices.map((p) => (
        <div key={p.id} className="cal-evt">
          <button
            className="pill"
            title="Click for details · double-click to open"
            style={{ ...eventPillStyle(colorOf(p.teamId), "practice"), outline: previewId === p.id ? "2px solid var(--accent)" : undefined }}
            onClick={() => onSelect("practice", p.id)}
            onDoubleClick={() => go("dashboard", "practiceday", p.id)}
          >
            {teamLabel && teamLabel(p.teamId) ? `${teamLabel(p.teamId)} ` : ""}#{p.practiceNumber || "—"}
          </button>
          <DeletePracticeButton practiceId={p.id} label="✕" />
        </div>
      ))}
      {entry.competitions.map((c) => (
        <div key={c.id} className="cal-evt">
          <button
            className="pill"
            title="Click for details · double-click to open"
            style={{ ...eventPillStyle(colorOf(c.teamId), "competition"), outline: previewId === c.id ? "2px solid var(--accent)" : undefined }}
            onClick={() => onSelect("competition", c.id)}
            onDoubleClick={() => go("dashboard", "competition", c.id)}
          >
            {teamLabel && teamLabel(c.teamId) ? `${teamLabel(c.teamId)} · ` : ""}{c.name}
          </button>
          <DeleteCompetitionButton competitionId={c.id} label="✕" />
        </div>
      ))}
    </div>
  );
}

/* ============================== PRACTICE PLANS ============================== */

function PracticeListPage() {
  const { state, api, go } = useApp();
  const teamName = useTeamName();
  const [date, setDate] = useState(todayStr());
  const [teamFilter, setTeamFilter] = useState(null);
  const [newTeamId, setNewTeamId] = useState((state.teams[0] || {}).id || null);

  const onTeam = (p) => !teamFilter || p.teamId === teamFilter;
  const upcoming = state.practices.filter((p) => !p.reconciledAt && onTeam(p)).sort((a, b) => a.date.localeCompare(b.date));
  const reconciled = state.practices.filter((p) => p.reconciledAt && onTeam(p)).sort((a, b) => b.date.localeCompare(a.date));
  const label = (p) => `${teamFilter ? "" : `${teamName(p.teamId) || "—"} · `}#${p.practiceNumber || "—"}`;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="pad" style={{ paddingBottom: 0 }}><PracticeSubNav /></div>
        <div className="hdr">
          <h1 className="b" style={{ fontSize: 16 }}>Practice Plans</h1>
          <div className="row gap2 wrapf">
            <span className="muted tiny upper">Showing</span>
            <TeamSelect value={teamFilter} onChange={setTeamFilter} allLabel="All Teams" style={{ maxWidth: 180 }} />
          </div>
        </div>
        <div className="pad">
          <div className="row gap2 wrapf">
            <TeamSelect value={newTeamId} onChange={setNewTeamId} style={{ maxWidth: 180 }} />
            <input type="date" className="inp" style={{ maxWidth: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
            <button
              className="btn btn-g btn-sm"
              onClick={() => go("practice", "detail", api.createPractice({ date, teamId: newTeamId }))}
            >
              + Create Practice Plan
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Upcoming / Unreconciled</h2></div>
        <div className="divide">
          {upcoming.map((p) => (
            <div key={p.id} className="row">
              <div className="pad row between click" style={{ flex: 1 }} onClick={() => go("practice", "detail", p.id)}>
                <span className="sb">{fmtFull(p.date)}</span>
                <span className="muted xs">{label(p)} · {p.rows.length} rows</span>
              </div>
              <div className="pad" style={{ paddingLeft: 0 }}>
                <DeletePracticeButton practiceId={p.id} />
              </div>
            </div>
          ))}
          {upcoming.length === 0 && <div className="pad muted xs">No plans yet — create one above.</div>}
        </div>
      </div>

      <div className="card">
        <div className="hdr">
          <h2 className="sb" style={{ fontSize: 14 }}>Recently Reconciled</h2>
          <button className="link xs" onClick={() => go("practice", "archive")}>View full archive →</button>
        </div>
        <div className="divide">
          {reconciled.slice(0, 5).map((p) => (
            <div key={p.id} className="row">
              <div className="pad row between click" style={{ flex: 1 }} onClick={() => go("practice", "detail", p.id)}>
                <span className="sb">{fmtFull(p.date)}<span className="muted xs"> · {label(p)}</span></span>
                <Pill label="Reconciled" tone="emerald" />
              </div>
              <div className="pad" style={{ paddingLeft: 0 }}>
                <DeletePracticeButton practiceId={p.id} label="Delete" />
              </div>
            </div>
          ))}
          {reconciled.length === 0 && <div className="pad muted xs">Nothing reconciled yet.</div>}
        </div>
      </div>
    </div>
  );
}

function DeletePracticeButton({ practiceId, label = "Delete Draft", onDeleted }) {
  const { state, api } = useApp();
  const practice = state.practices.find((p) => p.id === practiceId);

  return (
    <ConfirmButton
      label={label}
      message="Delete this plan?"
      onConfirm={() => {
        if (practice && practice.reconciledAt) {
          return "Reconciled practices can't be deleted — reopen it for editing first.";
        }
        api.deletePractice(practiceId);
        if (onDeleted) onDeleted();
      }}
    />
  );
}

/**
 * Team membership toggles. A wrestler can be on any number of teams; the last
 * one can't be unchecked, so nobody ends up off every roster.
 */
function TeamCheckboxes({ wrestler }) {
  const { state, api } = useApp();
  const mine = teamsOf(wrestler);
  const teams = [...state.teams].sort((a, b) => a.order - b.order);

  return (
    <div className="row gap2 wrapf">
      {teams.map((t) => {
        const on = mine.includes(t.id);
        return (
          <label key={t.id} className="row gap2 xs" style={{ whiteSpace: "nowrap" }}>
            <input
              type="checkbox"
              checked={on}
              disabled={on && mine.length === 1}
              title={on && mine.length === 1 ? "A wrestler has to be on at least one team" : undefined}
              onChange={() => api.toggleWrestlerTeam(wrestler.id, t.id)}
            />
            {t.name}
          </label>
        );
      })}
    </div>
  );
}

function DeleteCompetitionButton({ competitionId, label = "Delete", onDeleted }) {
  const { state, api } = useApp();
  const competition = state.competitions.find((c) => c.id === competitionId);
  const recorded = competition ? competition.weighIns.length : 0;

  return (
    <ConfirmButton
      label={label}
      message={recorded
        ? `Delete this competition and ${recorded} recorded weigh-in${recorded === 1 ? "" : "s"}?`
        : "Delete this competition?"}
      onConfirm={() => {
        if (!competition) return;
        api.deleteCompetition(competitionId);
        if (onDeleted) onDeleted();
      }}
    />
  );
}

function ArchivePage() {
  const { state, go } = useApp();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", q: "" });

  const byId = useMemo(() => new Map(state.syllabus.map((i) => [i.id, i])), [state.syllabus]);
  const practices = state.practices
    .filter((p) => p.reconciledAt)
    .filter((p) => (filters.from ? p.date >= filters.from : true))
    .filter((p) => (filters.to ? p.date <= filters.to : true))
    .filter((p) => {
      if (!filters.q) return true;
      const needle = filters.q.toLowerCase();
      return p.rows.some((r) => {
        const item = r.syllabusItemId ? byId.get(r.syllabusItemId) : null;
        return (item ? item.name : r.adHocLabel || "").toLowerCase().includes(needle);
      });
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const hasFilters = filters.from || filters.to || filters.q;

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="pad" style={{ paddingBottom: 0 }}><PracticeSubNav /></div>
        <div className="hdr"><h1 className="b" style={{ fontSize: 16 }}>Archive</h1></div>
        <div className="pad row gap2 wrapf">
          <Field label="From"><input type="date" className="inp" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><input type="date" className="inp" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Field label="Syllabus Concept/Skill" style={{ flex: 1, minWidth: 200 }}>
            <input className="inp" placeholder="Category name" value={q} onChange={(e) => setQ(e.target.value)} />
          </Field>
          <button className="btn btn-g btn-sm" style={{ alignSelf: "flex-end" }} onClick={() => setFilters({ from, to, q })}>Filter</button>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end" }} onClick={() => { setFrom(""); setTo(""); setQ(""); setFilters({ from: "", to: "", q: "" }); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="card divide">
        {practices.map((p) => {
          const counts = {
            DONE: p.rows.filter((i) => i.outcome === "DONE").length,
            MODIFIED: p.rows.filter((i) => i.outcome === "MODIFIED").length,
            SKIPPED: p.rows.filter((i) => i.outcome === "SKIPPED").length,
            ADDED: p.rows.filter((i) => i.outcome === "ADDED").length,
          };
          return (
            <div key={p.id} className="pad row between wrapf click" onClick={() => go("practice", "detail", p.id)}>
              <span className="sb">{fmtFull(p.date)}</span>
              <div className="row gap2 wrapf">
                {counts.DONE > 0 && <Pill label={`${counts.DONE} done`} tone="emerald" />}
                {counts.MODIFIED > 0 && <Pill label={`${counts.MODIFIED} modified`} tone="amber" />}
                {counts.SKIPPED > 0 && <Pill label={`${counts.SKIPPED} skipped`} tone="red" />}
                {counts.ADDED > 0 && <Pill label={`${counts.ADDED} added`} tone="blue" />}
              </div>
            </div>
          );
        })}
        {practices.length === 0 && <div className="pad muted xs">No reconciled practices match.</div>}
      </div>
    </div>
  );
}

function RichTextEditor({ value, onChange, onBlur }) {
  const ref = useRef(null);
  const lastValue = useRef(null);
  const [active, setActive] = useState({});

  useEffect(() => {
    if (ref.current && value !== lastValue.current) {
      ref.current.innerHTML = value || "";
      lastValue.current = value;
    }
  }, [value]);

  useEffect(() => {
    // Force browsers to use <b>/<i>/<u>/<ul> tags instead of inline style spans,
    // so formatting state stays consistent across browsers.
    try { document.execCommand("styleWithCSS", false, false); } catch (err) { /* unsupported */ }
  }, []);

  function refreshActive() {
    try {
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      });
    } catch (err) { /* ignore */ }
  }

  function handleInput() {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastValue.current = html;
    onChange(html);
    refreshActive();
  }

  function exec(cmd) {
    if (ref.current) ref.current.focus();
    document.execCommand(cmd);
    handleInput();
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleInput();
  }

  const TOOLBAR = [
    { cmd: "bold", label: "B", title: "Bold" },
    { cmd: "italic", label: "I", title: "Italic" },
    { cmd: "underline", label: "U", title: "Underline" },
    { cmd: "insertUnorderedList", label: "•", title: "Bullet list" },
  ];

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {TOOLBAR.map((t) => (
          <button
            key={t.cmd}
            type="button"
            className={active[t.cmd] ? "rte-btn active" : "rte-btn"}
            title={t.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className="rte-content"
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onFocus={refreshActive}
        onBlur={onBlur}
      />
    </div>
  );
}

function SyllabusPicker({ options, onSelect, placeholder = "Search the syllabus…" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.position.toLowerCase().includes(q) ||
        (o.situation || "").toLowerCase().includes(q)
    );
  }, [options, query]);

  if (!open) {
    return <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>+ Concept/Skill from Syllabus</button>;
  }

  return (
    <div className="ib" style={{ maxWidth: 420 }}>
      <div className="ibhdr">
        <input className="inp" autoFocus placeholder={placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Close</button>
      </div>
      <div style={{ maxHeight: 260, overflowY: "auto" }} className="divide">
        {filtered.map((o) => (
          <button
            key={o.id}
            className="pad click"
            style={{ width: "100%", textAlign: "left", background: "none", border: "none", color: "inherit" }}
            onClick={() => { onSelect(o.id); setQuery(""); setOpen(false); }}
          >
            <div className="row gap2 wrapf">
              <span className="sb xs">{o.name}</span>
            </div>
            <div className="muted tiny">{[o.position, o.situation].filter(Boolean).join(" › ")}</div>
          </button>
        ))}
        {filtered.length === 0 && <div className="pad muted xs">No matches.</div>}
      </div>
    </div>
  );
}

function letterFor(i) { return String.fromCharCode(65 + i); }
function generateRotation(n) {
  const rounds = [];
  for (let shift = 1; shift <= n - 1; shift++) {
    const round = [];
    for (let i = 0; i < n; i++) round.push(`${letterFor(i)} - ${letterFor((i + shift) % n)}`);
    rounds.push(round);
  }
  return rounds;
}
function RotationTable({ size }) {
  const rounds = generateRotation(size);
  return (
    <div className="ib">
      <div className="ibhdr"><span className="sb xs">Groups of {size}</span></div>
      <table>
        <tbody>
          {rounds.map((round, i) => (
            <tr key={i}>{round.map((pair, j) => <td key={j} className="xs">{pair}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function GroupRotation() {
  return (
    <div className="card">
      <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Group Rotations</h2></div>
      <div className="pad">
        <p className="muted xs" style={{ marginBottom: 8 }}>
          Reference rotation using generic letters — assign real wrestlers to A/B/C… at practice.
        </p>
        <div className="grid g2">
          <RotationTable size={3} />
          <RotationTable size={4} />
        </div>
      </div>
    </div>
  );
}

/**
 * The calendar's practice event, one layer above the plan itself. Adding a
 * practice to a day creates the event; the plan is nested inside it, so the
 * calendar stays a schedule and the editor stays the planning surface.
 */
function PracticeDayPage({ practiceId }) {
  const { state, api, go } = useApp();
  const teamName = useTeamName();
  const [editingWhere, setEditingWhere] = useState(false);
  const practice = state.practices.find((p) => p.id === practiceId);

  if (!practice) {
    return (
      <div className="card pad">
        <p className="sb">That practice is gone.</p>
        <button className="link xs" onClick={() => go("dashboard")}>← Back to dashboard</button>
      </div>
    );
  }

  const totalMinutes = practice.rows.reduce((sum, r) => sum + (r.durationMin || 0), 0);
  const windowMinutes = clockDuration(practice.startTime, practice.endTime);
  const sheet = state.weighInSheets.find((s) => s.practiceId === practice.id);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card pad">
        <div className="row between wrapf">
          <div>
            <div className="row gap2 wrapf">
              <button className="link xs" onClick={() => go("dashboard")}>← Dashboard</button>
              <span className="b" style={{ fontSize: 16 }}>Practice{practice.practiceNumber ? ` #${practice.practiceNumber}` : ""}</span>
              {practice.reconciledAt ? <Pill label="Reconciled" tone="emerald" /> : <Pill label="Plan in progress" tone="slate" />}
            </div>
            <p className="muted xs" style={{ marginTop: 4 }}>
              {[
                teamName(practice.teamId),
                fmtLong(practice.date),
                practice.startTime
                  ? `${practice.startTime}${practice.endTime ? `–${practice.endTime}` : ""}${windowMinutes != null ? ` (${windowMinutes} min)` : ""}`
                  : "No time set",
                practice.location,
              ].filter(Boolean).join(" · ")}
            </p>
            {practice.address && <p className="muted xs" style={{ marginTop: 2 }}>{practice.address}</p>}
            {!practice.reconciledAt && !editingWhere && (
              <button className="link xs" style={{ marginTop: 4 }} onClick={() => setEditingWhere(true)}>Edit details</button>
            )}
          </div>
          {!practice.reconciledAt && (
            <DeletePracticeButton practiceId={practice.id} label="Delete Practice" onDeleted={() => go("dashboard")} />
          )}
        </div>

        {/*
          Rolled up once the practice has its details — the summary line above
          carries them. Opens as a full editor rather than location-only, and
          stays open while a new practice is still missing the basics.
        */}
        {!practice.reconciledAt && (editingWhere || !(practice.startTime || practice.location)) && (
          <div style={{ marginTop: 12 }}>
            <div className="grid g4">
              <Field label="Team">
                <TeamSelect value={practice.teamId} onChange={(id) => api.movePracticeToTeam(practice.id, id)} />
              </Field>
              <Field label="Practice #">
                <input
                  key={`n${practice.practiceNumber}`}
                  className="inp"
                  placeholder="Practice #"
                  defaultValue={practice.practiceNumber != null ? String(practice.practiceNumber) : ""}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    api.updatePracticeHeader(practice.id, { practiceNumber: e.target.value.trim() && !Number.isNaN(n) ? n : null });
                  }}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  className="inp"
                  defaultValue={practice.date}
                  onBlur={(e) => e.target.value && api.updatePracticeHeader(practice.id, { date: e.target.value })}
                />
              </Field>
              <Field label="Start Time">
                <input
                  className="inp"
                  placeholder="Start time (6:00 PM)"
                  defaultValue={practice.startTime || ""}
                  onBlur={(e) => api.updatePracticeHeader(practice.id, { startTime: e.target.value.trim() })}
                />
              </Field>
              <Field label="End Time">
                <input
                  className="inp"
                  placeholder="End time (7:30 PM)"
                  defaultValue={practice.endTime || ""}
                  onBlur={(e) => api.updatePracticeHeader(practice.id, { endTime: e.target.value.trim() })}
                />
              </Field>
              <Field label="Location">
                <input
                  className="inp"
                  placeholder="Location"
                  defaultValue={practice.location || ""}
                  onBlur={(e) => api.updatePracticeHeader(practice.id, { location: e.target.value.trim() || null })}
                />
              </Field>
              <Field label="Address">
                <input
                  className="inp"
                  placeholder="Street address"
                  defaultValue={practice.address || ""}
                  onBlur={(e) => api.updatePracticeHeader(practice.id, { address: e.target.value.trim() || null })}
                />
              </Field>
            </div>
            {editingWhere && (
              <div className="row gap2" style={{ marginTop: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingWhere(false)}>Done</button>
                <span className="muted xs">Changing the date can put this team's numbering out of order — Settings › Teams has a renumber.</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Practice Plan</h2></div>
        <div className="pad row between wrapf">
          <span className="muted xs">
            {practice.rows.length === 0
              ? "No rows planned yet."
              : `${practice.rows.length} rows · ${totalMinutes} min on the mat`}
          </span>
          <button className="btn btn-g btn-sm" onClick={() => go("practice", "detail", practice.id)}>
            {practice.rows.length === 0 ? "Build the Plan →" : "Open Practice Plan →"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Weigh-In</h2></div>
        <div className="pad row between wrapf">
          <span className="muted xs">
            {sheet ? `${sheetCount(sheet)} on the sheet` : "No weigh-in sheet for this practice."}
          </span>
          {sheet ? (
            <button className="btn btn-ghost btn-sm" onClick={() => go("weighin", "detail", sheet.id)}>Open Weigh-In Sheet →</button>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => go("weighin", "detail", api.createWeighInSheet({
                date: practice.date,
                event: `Practice${practice.practiceNumber ? ` #${practice.practiceNumber}` : ""}`,
                homeTeam: teamName(practice.teamId) || state.program.name,
                teamId: practice.teamId,
                practiceId: practice.id,
              }))}
            >
              + Weigh-In Sheet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PracticeEditor({ practiceId }) {
  const { state, api, go } = useApp();
  const teamName = useTeamName();
  const practice = state.practices.find((p) => p.id === practiceId);
  const byId = useMemo(() => new Map(state.syllabus.map((i) => [i.id, i])), [state.syllabus]);

  const [startTime, setStartTime] = useState(practice ? practice.startTime : "");
  const [endTime, setEndTime] = useState(practice ? practice.endTime : "");
  const [practiceNumber, setPracticeNumber] = useState(practice && practice.practiceNumber != null ? String(practice.practiceNumber) : "");
  const [dayNotes, setDayNotes] = useState(practice ? practice.dayNotes || "" : "");

  if (!practice) {
    return (
      <div className="card pad">
        <p className="sb">That practice plan is gone.</p>
        <button className="link xs" onClick={() => go("practice")}>← Back to plans</button>
      </div>
    );
  }

  const editable = !practice.reconciledAt;
  const sortedRows = [...practice.rows].sort((a, b) => a.order - b.order);
  const totalMinutes = sortedRows.reduce((sum, r) => sum + (r.durationMin || 0), 0);
  const windowMinutes = clockDuration(practice.startTime, practice.endTime);

  const leafOptions = [...state.syllabus]
    .filter((l) => !l.retired)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((l) => ({ id: l.id, name: l.name, situation: l.situation, position: l.position }));

  function saveHeader() {
    api.updatePracticeHeader(practice.id, {
      startTime, endTime,
      practiceNumber: practiceNumber ? Number(practiceNumber) : null,
      dayNotes,
    });
  }

  function exportCsv() {
    const rows = [["#", "Category", "Minutes", "Concept/Skill", "Position", "Cues", "Teaching Notes", "Outcome"]];
    sortedRows.forEach((r, i) => {
      const item = r.syllabusItemId ? byId.get(r.syllabusItemId) : null;
      rows.push([
        i + 1,
        CATEGORY_LABEL[r.category],
        r.durationMin,
        item ? item.name : r.adHocLabel || "",
        item ? [item.position, item.situation].filter(Boolean).join(" > ") : "",
        item ? item.cues.map((c) => c.text).join(" | ") : "",
        stripHtml(r.teachingCues),
        OUTCOME_LABEL[r.outcome],
      ]);
    });
    download(`practice-${practice.date}.csv`, toCsv(rows));
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card pad">
        <div className="row between wrapf">
          <div className="row gap2 wrapf">
            <button className="link xs" onClick={() => go("practice")}>← Plans</button>
            <span className="b" style={{ fontSize: 16 }}>{fmtLong(practice.date)}</span>
            {practice.reconciledAt ? <Pill label="Reconciled" tone="emerald" /> : <Pill label="Plan in progress" tone="slate" />}
          </div>
          <div className="row gap2 wrapf">
            <button className="btn btn-ghost btn-sm" onClick={exportCsv}>Export CSV</button>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
            {editable ? (
              <>
                <DeletePracticeButton practiceId={practice.id} onDeleted={() => go("practice")} />
                <ConfirmButton
                  label="Reconcile Practice"
                  className="btn btn-o btn-sm"
                  confirmLabel="Reconcile"
                  message="Move to the archive as read-only?"
                  onConfirm={() => api.reconcilePractice(practice.id)}
                />
              </>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => api.reopenPractice(practice.id)}>Reopen for Editing</button>
            )}
          </div>
        </div>

        <div className="thead" style={{ marginTop: 12 }}>
          <div>
            <span className="seclbl">Team</span>
            {editable ? (
              <TeamSelect
                value={practice.teamId}
                onChange={(id) => api.movePracticeToTeam(practice.id, id)}
              />
            ) : (
              <p className="xs">{teamName(practice.teamId) || <span className="muted">—</span>}</p>
            )}
          </div>
          <div>
            <span className="seclbl">Practice #</span>
            {editable ? (
              <input className="inp" placeholder="Practice #" value={practiceNumber} onChange={(e) => setPracticeNumber(e.target.value)} onBlur={saveHeader} />
            ) : (
              <p className="xs">{practice.practiceNumber != null ? practice.practiceNumber : <span className="muted">—</span>}</p>
            )}
          </div>
          <div>
            <span className="seclbl">Start Time</span>
            {editable ? (
              <input className="inp" placeholder="Start time (6:00 PM)" value={startTime} onChange={(e) => setStartTime(e.target.value)} onBlur={saveHeader} />
            ) : (
              <p className="xs">{practice.startTime || <span className="muted">—</span>}</p>
            )}
          </div>
          <div>
            <span className="seclbl">End Time</span>
            {editable ? (
              <input className="inp" placeholder="End time (7:30 PM)" value={endTime} onChange={(e) => setEndTime(e.target.value)} onBlur={saveHeader} />
            ) : (
              <p className="xs">{practice.endTime || <span className="muted">—</span>}</p>
            )}
          </div>
          <div className="thead-wide">
            <span className="seclbl">Duration</span>
            <p className="xs sb">
              {windowMinutes != null ? `${windowMinutes} min` : `${totalMinutes} min planned`}
              {windowMinutes != null && windowMinutes !== totalMinutes && (
                <span className="muted"> · {totalMinutes} min planned on the mat</span>
              )}
            </p>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <span className="seclbl">Cascading Messages</span>
          {editable ? (
            <textarea className="inp" style={{ marginTop: 4 }} value={dayNotes} onChange={(e) => setDayNotes(e.target.value)} onBlur={saveHeader} />
          ) : (
            <p className="xs" style={{ marginTop: 4 }}>{practice.dayNotes || <span className="muted">No messages.</span>}</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="hdr">
          <h2 className="sb" style={{ fontSize: 14 }}>Practice Flow</h2>
          <span className="muted xs">{totalMinutes} min total</span>
        </div>
        <div className="divide">
          {sortedRows.map((row, i) => (
            <RowItem
              key={row.id}
              practiceId={practice.id}
              row={row}
              item={row.syllabusItemId ? byId.get(row.syllabusItemId) : null}
              editable={editable}
              isFirst={i === 0}
              isLast={i === sortedRows.length - 1}
            />
          ))}
          {sortedRows.length === 0 && <div className="pad muted xs">No rows yet — add one below.</div>}
        </div>

        {editable && (
          <div className="pad row gap2 wrapf">
            <SyllabusPicker
              options={leafOptions}
              onSelect={(id) => api.addRowFromSyllabus(practice.id, id)}
              placeholder="Search the syllabus to add a row…"
            />
            {CATEGORIES.map((c) => (
              <button key={c} className="btn btn-ghost btn-sm" onClick={() => api.addRow(practice.id, c)}>
                + {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        )}
      </div>

      <GroupRotation />
    </div>
  );
}

function RowItem({ practiceId, row, item, editable, isFirst, isLast }) {
  const { api } = useApp();
  const [showCues, setShowCues] = useState(false);
  const [category, setCategory] = useState(row.category);
  const [durationMin, setDurationMin] = useState(row.durationMin);
  const [adHocLabel, setAdHocLabel] = useState(row.adHocLabel || "");
  const [teachingCues, setTeachingCues] = useState(row.teachingCues || "");

  const cues = item ? item.cues : [];

  function save(overrides) {
    const o = overrides || {};
    api.updateRow(practiceId, row.id, {
      category: o.category || category,
      durationMin: Number(durationMin) || 0,
      adHocLabel,
      teachingCues,
      outcome: o.outcome || row.outcome,
    });
  }

  return (
    <div className="pad">
      <div className="prow-head">
        <div className="row gap2 wrapf">
          {item ? (
            <>
              <span className="sb">{item.name}</span>
              <span className="muted tiny">{[item.position, item.situation].filter(Boolean).join(" › ")}</span>
            </>
          ) : editable ? (
            <input
              className="inp"
              style={{ maxWidth: 220 }}
              placeholder="Skill / Concept"
              value={adHocLabel}
              onChange={(e) => setAdHocLabel(e.target.value)}
              onBlur={() => save()}
            />
          ) : (
            <span className="sb">{adHocLabel || "(untitled)"}</span>
          )}

          {cues.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowCues((s) => !s)}>
              {showCues ? "Hide techniques" : `Techniques (${cues.length})`}
            </button>
          )}
        </div>
        {editable ? (
          <select
            className="inp"
            style={{ maxWidth: 140 }}
            value={category}
            onChange={(e) => { setCategory(e.target.value); save({ category: e.target.value }); }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        ) : (
          <Pill label={CATEGORY_LABEL[category]} tone={CATEGORY_TONE[category]} />
        )}

        <div className="prow-dur">
          {editable ? (
            <>
              <input type="number" className="inp" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} onBlur={() => save()} />
              <span className="muted xs"> min</span>
            </>
          ) : (
            <span className="sb xs">{durationMin} <span className="muted">min</span></span>
          )}
        </div>
      </div>

      {showCues && (
        <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
          {[...cues].sort((a, b) => a.order - b.order).map((c) => (
            <li key={c.id} className="xs muted">{c.text}</li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 8 }}>
        <Field label="Teaching Cues / Progression">
          {editable ? (
            <RichTextEditor value={teachingCues} onChange={setTeachingCues} onBlur={() => save()} />
          ) : teachingCues ? (
            <div className="xs rte-readonly" dangerouslySetInnerHTML={{ __html: teachingCues }} />
          ) : (
            <p className="xs muted">—</p>
          )}
        </Field>
      </div>

      <div className="row between wrapf gap2" style={{ marginTop: 8 }}>
        <div className="row gap2 wrapf">
        {OUTCOMES.map((o) => (
          <button
            key={o}
            disabled={!editable}
            onClick={() => save({ outcome: o })}
            style={{ border: "none", background: "none", padding: 0, cursor: editable ? "pointer" : "default" }}
          >
            <span
              className="pill"
              style={{
                opacity: row.outcome === o ? 1 : 0.35,
                background: `var(--tone-${OUTCOME_TONE[o]}-bg)`,
                color: `var(--tone-${OUTCOME_TONE[o]}-color)`,
                borderColor: `var(--tone-${OUTCOME_TONE[o]}-border)`,
              }}
            >
              {OUTCOME_LABEL[o]}
            </span>
          </button>
        ))}
        </div>
        {editable && (
          <div className="row gap2">
            <button className="btn btn-ghost btn-sm iconbtn" disabled={isFirst} title="Move up" onClick={() => api.moveRow(practiceId, row.id, "up")}>↑</button>
            <button className="btn btn-ghost btn-sm iconbtn" disabled={isLast} title="Move down" onClick={() => api.moveRow(practiceId, row.id, "down")}>↓</button>
            <button className="btn btn-ghost btn-sm iconbtn" onClick={() => api.deleteRow(practiceId, row.id)}>Remove</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== COMPETITION ============================== */

function CompetitionDetail({ competitionId }) {
  const { state, api, go } = useApp();
  const teamName = useTeamName();
  const competition = state.competitions.find((c) => c.id === competitionId);
  const [editingHeader, setEditingHeader] = useState(false);
  const [name, setName] = useState(competition ? competition.name : "");
  const [type, setType] = useState(competition ? competition.type : "DUAL");
  const [startTime, setStartTime] = useState(competition ? competition.startTime || "" : "");
  const [location, setLocation] = useState(competition ? competition.location || "" : "");
  const [address, setAddress] = useState(competition ? competition.address || "" : "");
  const [notes, setNotes] = useState(competition ? competition.notes || "" : "");

  if (!competition) {
    return (
      <div className="card pad">
        <p className="sb">That competition is gone.</p>
        <button className="link xs" onClick={() => go("dashboard")}>← Back to dashboard</button>
      </div>
    );
  }

  const active = state.wrestlers
    .filter((w) => w.active && onRosterOf(w, competition.teamId))
    .sort((a, b) => a.order - b.order);
  const sheet = state.weighInSheets.find((s) => s.competitionId === competition.id);
  const weighInFor = (wid) => competition.weighIns.find((w) => w.wrestlerId === wid) || { weight: null, weightClass: null, notes: null };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card pad">
        {!editingHeader ? (
          <div className="row between wrapf">
            <div>
              <div className="row gap2 wrapf">
                <button className="link xs" onClick={() => go("dashboard")}>← Dashboard</button>
                <span className="b" style={{ fontSize: 16 }}>{competition.name}</span>
                <Pill label={competition.type === "DUAL" ? "Dual Meet" : "Tournament"} tone="orange" />
              </div>
              <p className="muted xs" style={{ marginTop: 4 }}>
                {[
                  teamName(competition.teamId),
                  fmtLong(competition.date),
                  competition.startTime,
                  competition.location,
                ].filter(Boolean).join(" · ")}
              </p>
              {competition.address && (
                <p className="muted xs" style={{ marginTop: 2 }}>{competition.address}</p>
              )}
            </div>
            <div className="row gap2 wrapf">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingHeader(true)}>Edit</button>
              <DeleteCompetitionButton
                competitionId={competition.id}
                label="Delete Competition"
                onDeleted={() => go("dashboard")}
              />
            </div>
          </div>
        ) : (
          <div className="grid g2">
            <Field label="Team">
              <TeamSelect value={competition.teamId} onChange={(id) => api.updateCompetition(competition.id, { teamId: id })} />
            </Field>
            <Field label="Event Name"><input className="inp" placeholder="Event name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Event Type">
              <select className="inp" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="DUAL">Dual Meet</option>
                <option value="TOURNAMENT">Tournament</option>
              </select>
            </Field>
            <Field label="Time"><input className="inp" placeholder="Time (9:00 AM)" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
            <Field label="Location"><input className="inp" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
            <Field label="Address"><input className="inp" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
            <Field label="Notes"><input className="inp" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            <div className="row gap2">
              <button
                className="btn btn-g btn-sm"
                onClick={() => {
                  api.updateCompetition(competition.id, {
                    name, type, startTime,
                    location: location || null,
                    address: address || null,
                    notes: notes || null,
                  });
                  setEditingHeader(false);
                }}
              >
                Save
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingHeader(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Weigh-In Sheet</h2></div>
        <div className="pad row between wrapf">
          <span className="muted xs">
            {sheet
              ? `${sheetCount(sheet)} on the sheet${sheet.archivedAt ? " · archived" : ""}`
              : "No weigh-in sheet for this competition yet."}
          </span>
          {sheet ? (
            <button className="btn btn-g btn-sm" onClick={() => go("weighin", "detail", sheet.id)}>Open Weigh-In Sheet →</button>
          ) : (
            <button
              className="btn btn-g btn-sm"
              onClick={() => go("weighin", "detail", api.createWeighInSheet({
                date: competition.date,
                event: competition.name,
                homeTeam: teamName(competition.teamId) || state.program.name,
                visitorTeam: competition.type === "DUAL" ? competition.name : "",
                teamId: competition.teamId,
                competitionId: competition.id,
              }))}
            >
              + Weigh-In Sheet
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Weigh-Ins</h2></div>
        <div className="divide">
          {active.map((w) => (
            <CompetitionWeighInRow key={w.id} competitionId={competition.id} wrestler={w} weighIn={weighInFor(w.id)} />
          ))}
          {active.length === 0 && (
            <div className="pad muted xs">No active wrestlers on the roster yet — add them on the Roster page.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompetitionWeighInRow({ competitionId, wrestler, weighIn }) {
  const { api } = useApp();
  const [weight, setWeight] = useState(weighIn.weight != null ? String(weighIn.weight) : "");
  const [weightClass, setWeightClass] = useState(
    weighIn.weightClass != null ? String(weighIn.weightClass) : wrestler.weightClass != null ? String(wrestler.weightClass) : ""
  );
  const [notes, setNotes] = useState(weighIn.notes || "");

  function save() {
    api.setCompetitionWeighIn(competitionId, wrestler.id, {
      weight: weight ? Number(weight) : null,
      weightClass: weightClass ? Number(weightClass) : null,
      notes: notes || null,
    });
  }

  return (
    <div className="pad row gap2 wrapf">
      <span className="sb xs" style={{ minWidth: 140 }}>{wrestler.name}</span>
      <Field label="Weight"><input className="inp numsm" value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={save} /></Field>
      <Field label="Class"><input className="inp numsm" value={weightClass} onChange={(e) => setWeightClass(e.target.value)} onBlur={save} /></Field>
      <Field label="Notes" style={{ flex: 1, minWidth: 160 }}>
        <input className="inp" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={save} />
      </Field>
    </div>
  );
}

/* ============================== SYLLABUS ============================== */

function ImportExport({ label, onExport, onImport, columnsHint }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState(null);

  function onFileChosen(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result));
        if (rows.length && /name|position|first|team/i.test(rows[0].join(","))) rows.shift(); // drop header row
        const res = onImport(rows);
        setMessage(`Imported: ${res.created} added, ${res.updated} updated.`);
      } catch (err) {
        setMessage("Couldn't read that file. Expected a CSV with " + columnsHint + ".");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div className="row gap2 wrapf">
      <button className="btn btn-ghost btn-sm" onClick={onExport}>Export {label} to CSV</button>
      <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
      <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
        Import {label} from CSV
      </button>
      <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={onFileChosen} />
      {message && <span className="muted xs">{message}</span>}
    </div>
  );
}

function SyllabusPage() {
  const { state, api, go } = useApp();
  const [filters, setFilters] = useState({ position: "", situation: "", structure: "" });
  const [draft, setDraft] = useState({ position: "", situation: "", structure: "" });

  const order = state.categoryOrder;
  const positionOptions = sortByCustomOrder([...new Set(state.syllabus.map((i) => i.position))], order.POSITION);
  const situationOptions = sortByCustomOrder(
    [...new Set(state.syllabus.map((i) => i.situation).filter(Boolean))],
    order.SITUATION
  );
  const structureOptions = sortByCustomOrder([...CATEGORIES], order.STRUCTURE);

  const items = state.syllabus
    .filter((i) => !i.retired)
    .filter((i) => (filters.position ? i.position === filters.position : true))
    .filter((i) => (filters.situation ? i.situation === filters.situation : true))
    .filter((i) => (filters.structure ? i.structure === filters.structure : true))
    .sort((a, b) => a.order - b.order);

  const hasFilters = !!(filters.position || filters.situation || filters.structure);

  function exportCsv() {
    const rows = [["Structure", "Position", "Situation", "Name", "Cues / Progression", "Why", "Common Errors"]];
    for (const i of [...state.syllabus].sort((a, b) => a.order - b.order)) {
      rows.push([
        i.structure || "", i.position, i.situation || "", i.name,
        i.cues.map((c) => c.text).join(" | "), i.why || "", i.commonErrors || "",
      ]);
    }
    download("syllabus.csv", toCsv(rows));
  }

  return (
    <div className="card">
      <div className="hdr">
        <h1 className="b" style={{ fontSize: 16 }}>Syllabus</h1>
        <div className="row gap2 wrapf">
          <ImportExport
            label="Syllabus"
            onExport={exportCsv}
            onImport={(rows) => api.importSyllabus(rows)}
            columnsHint="Structure, Position, Situation, Name, Cues, Why, Common Errors"
          />
          <button className="btn btn-ghost btn-sm" onClick={() => go("syllabus", "organize")}>Organize Categories</button>
        </div>
      </div>

      <div className="pad row gap2 wrapf" style={{ paddingBottom: 12 }}>
        <Field label="Position">
          <select className="inp" value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })}>
            <option value="">All</option>
            {positionOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Situation">
          <select className="inp" value={draft.situation} onChange={(e) => setDraft({ ...draft, situation: e.target.value })}>
            <option value="">All</option>
            {situationOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Structure">
          <select className="inp" value={draft.structure} onChange={(e) => setDraft({ ...draft, structure: e.target.value })}>
            <option value="">All</option>
            {structureOptions.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </Field>
        <button className="btn btn-g btn-sm" style={{ alignSelf: "flex-end" }} onClick={() => setFilters((f) => ({ ...f, ...draft }))}>
          Filter
        </button>
        {hasFilters && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: "flex-end" }}
            onClick={() => { setDraft({ position: "", situation: "", structure: "" }); setFilters({ position: "", situation: "", structure: "" }); }}
          >
            Clear
          </button>
        )}
      </div>

      <SyllabusFlyout
        items={items}
        positionOrder={positionOptions}
        situationOrder={situationOptions}
        hasFilters={hasFilters}
        onClearFilters={() => { setDraft({ position: "", situation: "", structure: "" }); setFilters({ position: "", situation: "", structure: "" }); }}
      />
    </div>
  );
}

const positionOf = (item) => item.position;
const situationOf = (item) => item.situation || GENERAL;

function SyllabusFlyout({ items, positionOrder, situationOrder, hasFilters, onClearFilters }) {
  const { state } = useApp();
  const [sel1, setSel1] = useState(null);
  const [sel2, setSel2] = useState(null);
  const [selItemId, setSelItemId] = useState(null);
  const [panel, setPanel] = useState("detail");

  const situations = useMemo(
    () => [...new Set(state.syllabus.map((i) => i.situation).filter(Boolean))].sort(),
    [state.syllabus]
  );
  const allPositions = useMemo(() => [...new Set(state.syllabus.map((i) => i.position))].sort(), [state.syllabus]);

  const level1Values = useMemo(() => {
    const set = new Set(items.map(positionOf));
    return positionOrder.filter((v) => set.has(v));
  }, [items, positionOrder]);

  const level2Values = useMemo(() => {
    if (!sel1) return [];
    const set = new Set(items.filter((i) => positionOf(i) === sel1).map(situationOf));
    const ordered = situationOrder.filter((v) => set.has(v));
    return set.has(GENERAL) ? [...ordered, GENERAL] : ordered;
  }, [items, situationOrder, sel1]);

  const itemsInBranch = useMemo(() => {
    if (!sel1 || !sel2) return [];
    return items.filter((i) => positionOf(i) === sel1 && situationOf(i) === sel2).sort((a, b) => a.order - b.order);
  }, [items, sel1, sel2]);

  const selectedItem = state.syllabus.find((i) => i.id === selItemId) || null;

  return (
    <div className="flyout">
      <div className="flyout-col">
        <div className="flyout-col-title">
          <span>Position</span>
          <button className="btn btn-ghost btn-sm" onClick={() => { setSelItemId(null); setPanel("new"); }}>+ New Concept/Skill</button>
        </div>
        {level1Values.map((v) => (
          <button
            key={v}
            className={`flyout-item${v === sel1 ? " chosen" : ""}`}
            onClick={() => { setSel1(v); setSel2(null); setSelItemId(null); setPanel("detail"); }}
          >
            <span>{v}</span>
            <span className="arrow">›</span>
          </button>
        ))}
        {level1Values.length === 0 && (
          <div className="flyout-empty">No concepts/skills match. Clear the filters, or add one with “+ New Concept/Skill”.</div>
        )}
      </div>

      {sel1 && (
        <div className="flyout-col">
          <div className="flyout-col-title">Situation</div>
          {level2Values.map((v) => (
            <button
              key={v}
              className={`flyout-item${v === sel2 ? " chosen" : ""}`}
              onClick={() => { setSel2(v); setSelItemId(null); setPanel("detail"); }}
            >
              <span>{v}</span>
              <span className="arrow">›</span>
            </button>
          ))}
        </div>
      )}

      {sel1 && sel2 && (
        <div className="flyout-col">
          <div className="flyout-col-title">Concepts/Skills</div>
          {itemsInBranch.map((item) => (
            <button
              key={item.id}
              className={`flyout-item${item.id === selItemId ? " chosen" : ""}`}
              onClick={() => { setSelItemId(item.id); setPanel("detail"); }}
            >
              <span>{item.name}</span>
            </button>
          ))}
          {itemsInBranch.length === 0 && <div className="flyout-empty">No concepts/skills here yet.</div>}
        </div>
      )}

      {panel === "new" && (
        <NewItemForm
          defaultSituation={sel2 && sel2 !== GENERAL ? sel2 : ""}
          defaultPosition={sel1 || ""}
          situations={situations}
          positions={allPositions}
          onCreated={(id, situation, position) => {
            setSel1(position);
            setSel2(situation || GENERAL);
            setSelItemId(id);
            setPanel("detail");
          }}
          onCancel={() => setPanel("detail")}
        />
      )}

      {panel !== "new" && selectedItem && (
        <ItemDetail
          key={selectedItem.id}
          item={selectedItem}
          editing={panel === "edit"}
          situations={situations}
          positions={allPositions}
          onEdit={() => setPanel("edit")}
          onCancelEdit={() => setPanel("detail")}
          onSaved={(newSituation, newPosition, moved) => {
            setPanel("detail");
            setSel1(newPosition);
            setSel2(newSituation || GENERAL);
            if (moved && hasFilters) onClearFilters();
          }}
          onDeleted={() => { setSelItemId(null); setPanel("detail"); }}
        />
      )}
    </div>
  );
}

function StructureSelect({ value, onChange }) {
  return (
    <Field label="Structure">
      <select className="inp" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">No structure</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
      </select>
    </Field>
  );
}

function NewItemForm({ defaultSituation, defaultPosition, situations, positions, onCreated, onCancel }) {
  const { api } = useApp();
  const [situation, setSituation] = useState(defaultSituation);
  const [position, setPosition] = useState(defaultPosition);
  const [structure, setStructure] = useState("");
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [commonErrors, setCommonErrors] = useState("");
  const [cuesText, setCuesText] = useState("");

  function submit() {
    if (!position.trim() || !name.trim()) return;
    const id = api.createItem({ situation, position, structure, name, why, commonErrors, cues: cuesText.split("\n") });
    onCreated(id, situation.trim(), position.trim());
  }

  return (
    <div className="flyout-col detail">
      <div className="flyout-col-title">New Concept/Skill</div>
      <div className="grid" style={{ gap: 8 }}>
        <Field label="Position">
          <input className="inp" list="positions-list" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} autoFocus />
          <datalist id="positions-list">{positions.map((p) => <option key={p} value={p} />)}</datalist>
        </Field>
        <Field label="Situation (optional)">
          <input className="inp" list="situations-list" placeholder="Concept / Situation" value={situation} onChange={(e) => setSituation(e.target.value)} />
          <datalist id="situations-list">{situations.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        <StructureSelect value={structure} onChange={setStructure} />
        <Field label="Name"><input className="inp" placeholder="Concept / skill name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Cues / Progression (one per line)">
          <textarea className="inp" style={{ minHeight: 70 }} value={cuesText} onChange={(e) => setCuesText(e.target.value)} />
        </Field>
        <Field label="Why"><textarea className="inp" value={why} onChange={(e) => setWhy(e.target.value)} /></Field>
        <Field label="Common Errors"><textarea className="inp" value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)} /></Field>
        <div className="row gap2">
          <button className="btn btn-g btn-sm" disabled={!position.trim() || !name.trim()} onClick={submit}>Create</button>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function ItemDetail({ item, editing, situations, positions, onEdit, onCancelEdit, onSaved, onDeleted }) {
  const { api } = useApp();
  const [situation, setSituation] = useState(item.situation || "");
  const [position, setPosition] = useState(item.position);
  const [structure, setStructure] = useState(item.structure || "");
  const [name, setName] = useState(item.name);
  const [why, setWhy] = useState(item.why || "");
  const [commonErrors, setCommonErrors] = useState(item.commonErrors || "");
  const [addingCue, setAddingCue] = useState(false);
  const [cueDraft, setCueDraft] = useState("");

  function save() {
    if (!position.trim() || !name.trim()) return;
    api.updateItem({ id: item.id, situation, position, structure, name, why, commonErrors });
    const moved = position.trim() !== item.position || (situation.trim() || null) !== item.situation;
    onSaved(situation.trim(), position.trim(), moved);
  }

  function remove() {
    api.deleteItem(item.id);
    onDeleted();
  }

  function submitCue() {
    if (!cueDraft.trim()) return;
    api.addCue(item.id, cueDraft.trim());
    setCueDraft("");
    setAddingCue(false);
  }

  if (editing) {
    return (
      <div className="flyout-col detail">
        <div className="flyout-col-title">Edit Concept/Skill</div>
        <div className="grid" style={{ gap: 8 }}>
          <Field label="Position">
            <input className="inp" list="positions-list-edit" placeholder="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
            <datalist id="positions-list-edit">{positions.map((p) => <option key={p} value={p} />)}</datalist>
          </Field>
          <Field label="Situation (optional)">
            <input className="inp" list="situations-list-edit" placeholder="Concept / Situation" value={situation} onChange={(e) => setSituation(e.target.value)} />
            <datalist id="situations-list-edit">{situations.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
          <StructureSelect value={structure} onChange={setStructure} />
          <Field label="Name"><input className="inp" placeholder="Concept / skill name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Why"><textarea className="inp" value={why} onChange={(e) => setWhy(e.target.value)} /></Field>
          <Field label="Common Errors"><textarea className="inp" value={commonErrors} onChange={(e) => setCommonErrors(e.target.value)} /></Field>
          <div className="row gap2">
            <button className="btn btn-g btn-sm" onClick={save}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={onCancelEdit}>Cancel</button>
            <ConfirmButton label="Delete" message="Delete this concept/skill and its cues?" onConfirm={remove} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flyout-col detail">
      <div className="flyout-col-title">
        <span>Concept/Skill</span>
        <button className="btn btn-ghost btn-sm" onClick={onEdit}>Edit</button>
      </div>
      <div className="row gap2 wrapf" style={{ marginBottom: 6 }}>
        <span className="b" style={{ fontSize: 15 }}>{item.name}</span>
        {item.structure && <Pill label={CATEGORY_LABEL[item.structure]} tone="slate" />}
      </div>
      <div className="muted tiny" style={{ marginBottom: 10 }}>
        {[item.position, item.situation].filter(Boolean).join(" › ")}
      </div>

      <div className="seclbl" style={{ marginBottom: 4 }}>Cues / Progression</div>
      <ul style={{ margin: "0 0 8px", padding: 0, listStyle: "none" }}>
        {[...item.cues].sort((a, b) => a.order - b.order).map((cue) => (
          <CueRow key={cue.id} itemId={item.id} cue={cue} />
        ))}
        {item.cues.length === 0 && !addingCue && <li className="muted xs">No cues yet.</li>}
      </ul>
      {!addingCue ? (
        <button className="btn btn-ghost btn-sm" onClick={() => setAddingCue(true)}>+ Cue</button>
      ) : (
        <div className="row gap2 wrapf" style={{ marginBottom: 8 }}>
          <input
            className="inp"
            style={{ maxWidth: 220 }}
            placeholder="Coaching cue text"
            value={cueDraft}
            onChange={(e) => setCueDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitCue()}
            autoFocus
          />
          <button className="btn btn-g btn-sm" onClick={submitCue}>Add</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingCue(false)}>Cancel</button>
        </div>
      )}

      {item.why && (
        <>
          <div className="seclbl" style={{ marginTop: 10, marginBottom: 4 }}>Why</div>
          <p className="xs">{item.why}</p>
        </>
      )}
      {item.commonErrors && (
        <>
          <div className="seclbl" style={{ marginTop: 10, marginBottom: 4 }}>Common Errors</div>
          <p className="xs">{item.commonErrors}</p>
        </>
      )}
    </div>
  );
}

function CueRow({ itemId, cue }) {
  const { api } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cue.text);

  return (
    <li className="row gap2 wrapf" style={{ padding: "2px 0" }}>
      <span className="muted" style={{ fontSize: 11 }}>•</span>
      {!editing ? (
        <>
          <span className="xs">{cue.text}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
        </>
      ) : (
        <>
          <input className="inp" style={{ maxWidth: 200 }} placeholder="Coaching cue" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button className="btn btn-g btn-sm" onClick={() => { api.updateCue(itemId, cue.id, draft); setEditing(false); }}>Save</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(cue.text); setEditing(false); }}>Cancel</button>
          <button className="btn btn-ghost btn-sm iconbtn" onClick={() => api.deleteCue(itemId, cue.id)}>Delete</button>
        </>
      )}
    </li>
  );
}

function OrganizeCategoriesPage() {
  const { state, go } = useApp();
  const order = state.categoryOrder;
  const positions = sortByCustomOrder([...new Set(state.syllabus.map((i) => i.position))], order.POSITION);
  const situations = sortByCustomOrder([...new Set(state.syllabus.map((i) => i.situation).filter(Boolean))], order.SITUATION);
  const structures = sortByCustomOrder([...CATEGORIES], order.STRUCTURE);

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="hdr">
          <h1 className="b" style={{ fontSize: 16 }}>Organize Categories</h1>
          <button className="link xs" onClick={() => go("syllabus")}>← Back to Syllabus</button>
        </div>
        <p className="pad muted xs">
          Values sort A-Z by default. Drag any row to set a custom order — it&apos;s used everywhere Position,
          Situation, and Structure are shown or filtered.
        </p>
      </div>

      <OrganizeCategoryList field="POSITION" title="Position" initialValues={positions} />
      <OrganizeCategoryList field="SITUATION" title="Situation" initialValues={situations} />
      <OrganizeCategoryList field="STRUCTURE" title="Structure" labels={CATEGORY_LABEL} initialValues={structures} />
    </div>
  );
}

function OrganizeCategoryList({ field, title, labels, initialValues }) {
  const { api } = useApp();
  const [values, setValues] = useState(initialValues);
  const dragIndex = useRef(null);

  useEffect(() => { setValues(initialValues); }, [initialValues.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  function onDrop(dropIndex) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === dropIndex) return;
    const next = [...values];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    setValues(next);
    api.reorderCategory(field, next);
  }

  return (
    <div className="card">
      <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>{title}</h2></div>
      <div className="divide">
        {values.map((v, i) => (
          <div
            key={v}
            className="pad row gap2"
            style={{ cursor: "grab" }}
            draggable
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
          >
            <span className="muted" style={{ fontSize: 14 }}>≡</span>
            <span className="xs">{(labels && labels[v]) || v}</span>
          </div>
        ))}
        {values.length === 0 && <div className="pad muted xs">No values yet.</div>}
      </div>
    </div>
  );
}

/* ============================== ROSTER ============================== */

function RosterPage() {
  const { state, api } = useApp();
  const teamName = useTeamName();
  const [name, setName] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [teamFilter, setTeamFilter] = useState(null);
  const [newTeamId, setNewTeamId] = useState((state.teams[0] || {}).id || null);

  const shown = [...state.wrestlers]
    .filter((w) => onRosterOf(w, teamFilter))
    .sort((a, b) => a.order - b.order);

  // Matches the club registration/roster spreadsheet column-for-column, so it
  // round-trips through importRoster's "wide" format. Active/Inactive isn't
  // part of that format — manage it in the app; exporting stays a clean 1:1
  // copy of the sheet.
  function exportCsv() {
    const rows = [[
      "Team", "First", "Last", "DOB", "Gender", "Age", "Grade", "Weight",
      "Parent", "Cell", "Email", "Emergency Contact", "Cell", "Net",
      "Discount Amount", "Discount Name", "Refunds", "Allergies", "List",
      "Insurance", "Policy #", "Address", "City", "Zip", "State",
    ]];
    for (const w of shown) {
      const names = teamsOf(w).map((id) => teamName(id)).filter(Boolean).join("; ");
      rows.push([
        names, w.firstName || "", w.lastName || "", w.dob || "", w.gender || "", w.age || "", w.grade || "",
        w.weightClass == null ? "" : w.weightClass,
        w.parentName || "", w.parentCell || "", w.email || "",
        w.emergencyContactName || "", w.emergencyContactPhone || "",
        w.net || "", w.discountAmount || "", w.discountName || "", w.refunds || "",
        w.allergies || "", w.list || "", w.insurance || "", w.policyNumber || "",
        w.address || "", w.city || "", w.zip || "", w.state || "",
      ]);
    }
    download("roster.csv", toCsv(rows));
  }

  function addWrestler() {
    if (!name.trim()) return;
    api.createWrestler(name.trim(), weightClass ? Number(weightClass) : null, [teamFilter || newTeamId]);
    setName("");
    setWeightClass("");
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="hdr">
          <h1 className="b" style={{ fontSize: 16 }}>Roster</h1>
          <div className="row gap2 wrapf">
            <TeamSelect value={teamFilter} onChange={setTeamFilter} allLabel="All Teams" style={{ maxWidth: 180 }} />
            <ImportExport
              label="Roster"
              onExport={exportCsv}
              onImport={(rows) => api.importRoster(rows)}
              columnsHint="either Name, Teams, Weight Class, Active — or a club roster export: Team, First, Last, DOB, Gender, Age, Grade, Weight, Parent, Cell, Email, Emergency Contact, Cell, Net, Discount Amount, Discount Name, Refunds, Allergies, List, Insurance, Policy #, Address, City, Zip, State"
            />
          </div>
        </div>
      </div>

      <div className="card divide">
        {shown.map((w) => <WrestlerRow key={w.id} wrestler={w} showTeam={!teamFilter} />)}
        {shown.length === 0 && (
          <div className="pad muted xs">
            {state.wrestlers.length === 0 ? "No wrestlers yet — add one below." : "No wrestlers on this team yet."}
          </div>
        )}
      </div>

      <div className="card pad row gap2 wrapf">
        <TeamSelect value={teamFilter || newTeamId} onChange={setNewTeamId} style={{ maxWidth: 180 }} />
        <input className="inp" style={{ maxWidth: 200 }} placeholder="Wrestler name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addWrestler()} />
        <input className="inp numsm" placeholder="Weight (lbs)" value={weightClass} onChange={(e) => setWeightClass(e.target.value)} />
        <button className="btn btn-g btn-sm" onClick={addWrestler}>+ Add Wrestler</button>
      </div>
    </div>
  );
}

function WrestlerRow({ wrestler, showTeam }) {
  const { state, api } = useApp();
  const [editing, setEditing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [name, setName] = useState(wrestler.name);
  const [weightClass, setWeightClass] = useState(wrestler.weightClass != null ? String(wrestler.weightClass) : "");
  const [active, setActive] = useState(wrestler.active);

  return (
    <div>
      <div className="pad row between wrapf">
        <div className="row gap2 wrapf">
          <span className="sb xs">{wrestler.name}</span>
          {showTeam && teamsOf(wrestler).map((id) => {
            const t = state.teams.find((x) => x.id === id);
            if (!t) return null;
            return (
              <span key={id} className="pill" style={eventPillStyle(teamColor(t), "practice")}>{t.name}</span>
            );
          })}
          {wrestler.weightClass != null && <Pill label={`${wrestler.weightClass} lbs`} tone="slate" />}
          {!wrestler.active && <Pill label="Inactive" tone="red" />}
        </div>
        <div className="row gap2">
          <button className="btn btn-ghost btn-sm" onClick={() => setDetailsOpen((v) => !v)}>
            {detailsOpen ? "Hide Details" : "Details"}
          </button>
          {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>}
        </div>
      </div>

      {editing && (
        <div className="pad row gap2 wrapf" style={{ paddingTop: 0 }}>
          <input className="inp" style={{ maxWidth: 200 }} placeholder="Wrestler name" value={name} onChange={(e) => setName(e.target.value)} />
          <TeamCheckboxes wrestler={wrestler} />
          <input className="inp numsm" placeholder="Weight (lbs)" value={weightClass} onChange={(e) => setWeightClass(e.target.value)} />
          <label className="row gap2 xs">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
          </label>
          <button
            className="btn btn-g btn-sm"
            onClick={() => {
              api.updateWrestler(wrestler.id, { name, weightClass: weightClass ? Number(weightClass) : null, active });
              setEditing(false);
            }}
          >
            Save
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          <ConfirmButton
            label="Delete"
            confirmLabel="Remove"
            message="Remove from the roster?"
            onConfirm={() => api.deleteWrestler(wrestler.id)}
          />
        </div>
      )}

      {detailsOpen && <WrestlerDetailsPanel wrestler={wrestler} onClose={() => setDetailsOpen(false)} />}
    </div>
  );
}

/**
 * The club registration/roster fields that don't fit the compact roster
 * row: personal info, parent/guardian and emergency contacts, medical and
 * insurance, mailing address, and dues. Collapsed by default so the roster
 * stays scannable during practice; opened per wrestler via "Details".
 */
function WrestlerDetailsPanel({ wrestler, onClose }) {
  const { api } = useApp();
  const [form, setForm] = useState(() =>
    Object.fromEntries(WRESTLER_DETAIL_FIELDS.map((f) => [f, wrestler[f] || ""]))
  );
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function save() {
    api.updateWrestler(wrestler.id, form);
    onClose();
  }

  return (
    <div className="pad" style={{ paddingTop: 0 }}>
      <div className="ib pad" style={{ display: "grid", gap: 14 }}>
        <div>
          <span className="seclbl">Personal</span>
          <div className="grid g3" style={{ marginTop: 6 }}>
            <Field label="First Name"><input className="inp" value={form.firstName} onChange={set("firstName")} /></Field>
            <Field label="Last Name"><input className="inp" value={form.lastName} onChange={set("lastName")} /></Field>
            <Field label="Date of Birth"><input type="date" className="inp" value={form.dob} onChange={set("dob")} /></Field>
            <Field label="Gender"><input className="inp" value={form.gender} onChange={set("gender")} /></Field>
            <Field label="Age"><input className="inp" value={form.age} onChange={set("age")} /></Field>
            <Field label="Grade"><input className="inp" value={form.grade} onChange={set("grade")} /></Field>
          </div>
        </div>

        <div>
          <span className="seclbl">Parent / Guardian</span>
          <div className="grid g3" style={{ marginTop: 6 }}>
            <Field label="Parent Name"><input className="inp" value={form.parentName} onChange={set("parentName")} /></Field>
            <Field label="Parent Cell"><input className="inp" value={form.parentCell} onChange={set("parentCell")} /></Field>
            <Field label="Email"><input className="inp" value={form.email} onChange={set("email")} /></Field>
          </div>
        </div>

        <div>
          <span className="seclbl">Emergency Contact</span>
          <div className="grid g3" style={{ marginTop: 6 }}>
            <Field label="Name"><input className="inp" value={form.emergencyContactName} onChange={set("emergencyContactName")} /></Field>
            <Field label="Cell"><input className="inp" value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} /></Field>
          </div>
        </div>

        <div>
          <span className="seclbl">Medical &amp; Insurance</span>
          <div className="grid g3" style={{ marginTop: 6 }}>
            <Field label="Allergies"><input className="inp" value={form.allergies} onChange={set("allergies")} /></Field>
            <Field label="Insurance Provider"><input className="inp" value={form.insurance} onChange={set("insurance")} /></Field>
            <Field label="Policy #"><input className="inp" value={form.policyNumber} onChange={set("policyNumber")} /></Field>
          </div>
        </div>

        <div>
          <span className="seclbl">Address</span>
          <div className="grid g4" style={{ marginTop: 6 }}>
            <Field label="Street Address" style={{ gridColumn: "span 2" }}>
              <input className="inp" value={form.address} onChange={set("address")} />
            </Field>
            <Field label="City"><input className="inp" value={form.city} onChange={set("city")} /></Field>
            <Field label="State"><input className="inp" value={form.state} onChange={set("state")} /></Field>
          </div>
          <div className="grid g4" style={{ marginTop: 8 }}>
            <Field label="Zip"><input className="inp" value={form.zip} onChange={set("zip")} /></Field>
          </div>
        </div>

        <div>
          <span className="seclbl">Dues</span>
          <div className="grid g3" style={{ marginTop: 6 }}>
            <Field label="Discount Name"><input className="inp" value={form.discountName} onChange={set("discountName")} /></Field>
            <Field label="Discount Amount"><input className="inp" value={form.discountAmount} onChange={set("discountAmount")} /></Field>
            <Field label="Refunds"><input className="inp" value={form.refunds} onChange={set("refunds")} /></Field>
            <Field label="Net"><input className="inp" value={form.net} onChange={set("net")} /></Field>
            <Field label="List"><input className="inp" value={form.list} onChange={set("list")} /></Field>
          </div>
        </div>

        <div className="row gap2">
          <button className="btn btn-g btn-sm" onClick={save}>Save Details</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== WEIGH-IN ============================== */

function sheetSubtitle(s) {
  return [s.event, s.homeTeam && s.visitorTeam ? `${s.homeTeam} vs ${s.visitorTeam}` : s.homeTeam || s.visitorTeam]
    .filter(Boolean)
    .join(" · ");
}

function WeighInListPage() {
  const { state, api, go } = useApp();
  const [date, setDate] = useState(todayStr());
  const [event, setEvent] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [visitorTeam, setVisitorTeam] = useState("");

  const active = state.weighInSheets.filter((s) => !s.archivedAt).sort((a, b) => b.date.localeCompare(a.date));
  const archived = state.weighInSheets.filter((s) => s.archivedAt).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="hdr"><h1 className="b" style={{ fontSize: 16 }}>Weigh-In</h1></div>
        <div className="pad row gap2 wrapf">
          <input type="date" className="inp" style={{ maxWidth: 160 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <input className="inp" style={{ maxWidth: 180 }} placeholder="Event name" value={event} onChange={(e) => setEvent(e.target.value)} />
          <input className="inp" style={{ maxWidth: 160 }} placeholder="Home team" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} />
          <input className="inp" style={{ maxWidth: 160 }} placeholder="Visitor team" value={visitorTeam} onChange={(e) => setVisitorTeam(e.target.value)} />
          <button
            className="btn btn-g btn-sm"
            onClick={() => go("weighin", "detail", api.createWeighInSheet({ date, event, homeTeam, visitorTeam }))}
          >
            + New Weigh-In
          </button>
        </div>
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Active</h2></div>
        <div className="divide">
          {active.map((s) => (
            <div key={s.id} className="pad row between wrapf click" onClick={() => go("weighin", "detail", s.id)}>
              <div>
                <span className="sb">{fmtFull(s.date)}</span>
                {sheetSubtitle(s) && <span className="muted xs" style={{ marginLeft: 8 }}>{sheetSubtitle(s)}</span>}
              </div>
              <span className="muted xs">{sheetCount(s)}</span>
            </div>
          ))}
          {active.length === 0 && <div className="pad muted xs">No weigh-ins yet — create one above.</div>}
        </div>
      </div>

      <div className="card">
        <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Archived</h2></div>
        <div className="divide">
          {archived.map((s) => (
            <div key={s.id} className="pad row between wrapf click" onClick={() => go("weighin", "detail", s.id)}>
              <div>
                <span className="sb">{fmtFull(s.date)}</span>
                {sheetSubtitle(s) && <span className="muted xs" style={{ marginLeft: 8 }}>{sheetSubtitle(s)}</span>}
              </div>
              <Pill label="Archived" tone="emerald" />
            </div>
          ))}
          {archived.length === 0 && <div className="pad muted xs">Nothing archived yet.</div>}
        </div>
      </div>
    </div>
  );
}

function WeighInSheetForm({ sheetId }) {
  const { state, api, go } = useApp();
  const sheet = state.weighInSheets.find((s) => s.id === sheetId);
  const [editingHeader, setEditingHeader] = useState(false);
  const [date, setDate] = useState(sheet ? sheet.date : todayStr());
  const [event, setEvent] = useState(sheet ? sheet.event || "" : "");
  const [homeTeam, setHomeTeam] = useState(sheet ? sheet.homeTeam || "" : "");
  const [visitorTeam, setVisitorTeam] = useState(sheet ? sheet.visitorTeam || "" : "");

  if (!sheet) {
    return (
      <div className="card pad">
        <p className="sb">That weigh-in sheet is gone.</p>
        <button className="link xs" onClick={() => go("weighin")}>← Back to weigh-ins</button>
      </div>
    );
  }

  const editable = !sheet.archivedAt;
  const rosterNames = state.wrestlers.filter((w) => w.active).sort((a, b) => a.order - b.order);

  const byClass = new Map();
  for (const wc of WEIGHT_CLASS_ORDER) byClass.set(wc, []);
  byClass.set("extra", []);
  for (const e of sheet.entries) {
    const key = e.weightClass === null || e.weightClass === undefined ? "extra" : e.weightClass;
    if (!byClass.has(key)) byClass.set(key, []);
    byClass.get(key).push(e);
  }
  for (const list of byClass.values()) list.sort((a, b) => a.order - b.order);

  function exportCsv() {
    const sorted = [...sheet.entries].sort(
      (a, b) => weightClassIndex(a.weightClass) - weightClassIndex(b.weightClass) || a.order - b.order
    );
    const rows = [
      ["Date", parseDateOnly(sheet.date).toLocaleDateString()],
      ["Event", sheet.event || ""],
      ["Home", sheet.homeTeam || ""],
      ["Visitor", sheet.visitorTeam || ""],
      [],
      ["Weight Class", "Wrestler", "WT", "Level"],
    ];
    for (const e of sorted) {
      rows.push([
        e.weightClass == null ? "Extra" : WEIGHT_CLASS_LABEL[e.weightClass] || e.weightClass,
        e.name, e.weight == null ? "" : e.weight, e.level || "",
      ]);
    }
    rows.push([]);
    for (const line of WEIGH_IN_FOOTER_LINES) rows.push([line]);
    download(`weigh-in-${sheet.date}.csv`, toCsv(rows));
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <datalist id="roster-names">{rosterNames.map((r) => <option key={r.id} value={r.name} />)}</datalist>

      <div className="card pad">
        {!editingHeader ? (
          <div className="row between wrapf">
            <div>
              <div className="row gap2 wrapf">
                <button className="link xs" onClick={() => go("weighin")}>← Weigh-Ins</button>
                <span className="b" style={{ fontSize: 16 }}>{fmtLong(sheet.date)}</span>
                <Pill label={editable ? "Active" : "Archived"} tone={editable ? "slate" : "emerald"} />
              </div>
              <p className="muted xs" style={{ marginTop: 4 }}>{sheetSubtitle(sheet) || "No event details yet"}</p>
            </div>
            {editable && <button className="btn btn-ghost btn-sm" onClick={() => setEditingHeader(true)}>Edit</button>}
          </div>
        ) : (
          <div className="grid g2">
            <Field label="Date"><input type="date" className="inp" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Event"><input className="inp" placeholder="Event name" value={event} onChange={(e) => setEvent(e.target.value)} /></Field>
            <Field label="Home"><input className="inp" placeholder="Home team" value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} /></Field>
            <Field label="Visitor"><input className="inp" placeholder="Visitor team" value={visitorTeam} onChange={(e) => setVisitorTeam(e.target.value)} /></Field>
            <div className="row gap2">
              <button
                className="btn btn-g btn-sm"
                onClick={() => { api.updateWeighInHeader(sheet.id, { date, event, homeTeam, visitorTeam }); setEditingHeader(false); }}
              >
                Save
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingHeader(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="row gap2 wrapf" style={{ marginTop: 12 }}>
          {editable && <button className="btn btn-ghost btn-sm" onClick={() => api.populateFromRoster(sheet.id)}>Populate from Roster</button>}
          <button className="btn btn-ghost btn-sm" onClick={exportCsv}>Export CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Print / Save as PDF</button>
          {editable ? (
            <ConfirmButton
              label="Archive"
              className="btn btn-ghost btn-sm"
              confirmLabel="Archive"
              message="Make this sheet read-only?"
              onConfirm={() => api.archiveWeighInSheet(sheet.id)}
            />
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => api.unarchiveWeighInSheet(sheet.id)}>Reopen</button>
          )}
          <ConfirmButton
            label="Delete Sheet"
            message="Delete this sheet and its recorded weights?"
            onConfirm={() => { api.deleteWeighInSheet(sheet.id); go("weighin"); }}
          />
        </div>
      </div>

      <div className="grid g2">
        {[0, 1].map((col) => (
          <div key={col} className="grid" style={{ gap: 16 }}>
            {WEIGHT_CLASS_COLUMNS[col].map((wc) => (
              <WeightClassSection
                key={wc}
                sheetId={sheet.id}
                weightClass={wc}
                title={WEIGHT_CLASS_LABEL[wc]}
                entries={byClass.get(wc) || []}
                editable={editable}
                rosterNames={rosterNames}
              />
            ))}
          </div>
        ))}
      </div>

      <WeightClassSection
        sheetId={sheet.id}
        weightClass={null}
        title="Extra Wrestlers"
        entries={byClass.get("extra") || []}
        editable={editable}
        rosterNames={rosterNames}
      />

      <div className="card pad">
        {WEIGH_IN_FOOTER_LINES.map((line, i) => (
          <p key={i} className="muted xs" style={{ margin: i === 0 ? 0 : "4px 0 0" }}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function WeightClassSection({ sheetId, weightClass, title, entries, editable, rosterNames }) {
  return (
    <div className="card">
      <div className="hdr"><h3 className="sb xs">{title}</h3></div>
      <div className="divide">
        {entries.map((e) => <EntryRow key={e.id} sheetId={sheetId} entry={e} editable={editable} />)}
        {entries.length === 0 && <div className="pad muted xs">No wrestlers yet.</div>}
      </div>
      {editable && <AddEntryControl sheetId={sheetId} weightClass={weightClass} rosterNames={rosterNames} />}
    </div>
  );
}

function EntryRow({ sheetId, entry, editable }) {
  const { api } = useApp();
  const [name, setName] = useState(entry.name);
  const [weight, setWeight] = useState(entry.weight != null ? String(entry.weight) : "");
  const [level, setLevel] = useState(entry.level || "");
  const [weightClass, setWeightClass] = useState(entry.weightClass != null ? String(entry.weightClass) : "");
  const out = entry.available === false;

  function save(overrideWeightClass) {
    const wcStr = overrideWeightClass === undefined ? weightClass : overrideWeightClass;
    api.updateEntry(sheetId, entry.id, {
      weightClass: wcStr ? Number(wcStr) : null,
      name,
      weight: weight ? Number(weight) : null,
      level,
    });
  }

  if (!editable) {
    return (
      <div className="pad row gap2 wrapf" style={out ? { opacity: 0.45 } : undefined}>
        <span className="sb xs" style={{ minWidth: 140, textDecoration: out ? "line-through" : undefined }}>{entry.name}</span>
        {out && <Pill label="Scratched" tone="red" />}
        <span className="muted xs">{entry.weight != null ? `${entry.weight} lbs` : ""}</span>
        <span className="muted xs">{entry.level || ""}</span>
      </div>
    );
  }

  return (
    <div className="pad row gap2 wrapf" style={out ? { opacity: 0.55 } : undefined}>
      <input className="inp" style={{ maxWidth: 160 }} list="roster-names" placeholder="Wrestler name" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => save()} />
      <Field label="WT"><input className="inp numsm" value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={() => save()} /></Field>
      <Field label="Level"><input className="inp numsm" value={level} onChange={(e) => setLevel(e.target.value)} onBlur={() => save()} /></Field>
      <Field label="Class">
        <select className="inp numsm" value={weightClass} onChange={(e) => { setWeightClass(e.target.value); save(e.target.value); }}>
          <option value="">Extra</option>
          {WEIGHT_CLASS_ORDER.map((wc) => <option key={wc} value={wc}>{WEIGHT_CLASS_LABEL[wc]}</option>)}
        </select>
      </Field>
      <button
        className="btn btn-ghost btn-sm"
        title={out ? "Put back on the sheet for this event" : "Scratch for this event only — stays on the roster"}
        onClick={() => api.toggleEntryAvailable(sheetId, entry.id)}
      >
        {out ? "Available" : "Scratch"}
      </button>
      <ConfirmButton
        label="Delete"
        confirmLabel="Remove"
        message="Remove this entry from the sheet?"
        onConfirm={() => api.deleteEntry(sheetId, entry.id)}
      />
    </div>
  );
}

function AddEntryControl({ sheetId, weightClass, rosterNames }) {
  const { api } = useApp();
  const [name, setName] = useState("");

  function submit() {
    const typed = name.trim();
    if (!typed) return;
    const match = rosterNames.find((r) => r.name.trim().toLowerCase() === typed.toLowerCase());
    api.addEntry(sheetId, { weightClass, name: typed, wrestlerId: match ? match.id : null });
    setName("");
  }

  return (
    <div className="pad row gap2 wrapf">
      <input
        className="inp"
        style={{ maxWidth: 200 }}
        list="roster-names"
        placeholder="Wrestler name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="btn btn-ghost btn-sm" disabled={!name.trim()} onClick={submit}>+ Add</button>
    </div>
  );
}

/* ============================== HISTORY ============================== */

function HistoryPage() {
  const { state } = useApp();
  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card">
        <div className="hdr"><h1 className="b" style={{ fontSize: 16 }}>History</h1></div>
      </div>
      {HISTORY_CATEGORIES.map((category) => {
        const records = state.history
          .filter((r) => r.category === category)
          .sort((a, b) => maxYear(b.years) - maxYear(a.years) || a.order - b.order);
        return (
          <HistoryCategoryList key={category} category={category} title={HISTORY_CATEGORY_LABEL[category]} records={records} />
        );
      })}
    </div>
  );
}

function HistoryCategoryList({ category, title, records }) {
  return (
    <div className="card">
      <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>{title}</h2></div>
      <div className="divide">
        {records.map((r) => <HistoryRow key={r.id} record={r} />)}
        {records.length === 0 && <div className="pad muted xs">No champions recorded yet.</div>}
      </div>
      <AddRecordForm category={category} />
    </div>
  );
}

function HistoryRow({ record }) {
  const { api } = useApp();
  const [editing, setEditing] = useState(false);
  const [weight, setWeight] = useState(record.weight);
  const [name, setName] = useState(record.name);
  const [yearsText, setYearsText] = useState(record.years);

  if (!editing) {
    const years = parseYears(record.years).sort((a, b) => b - a);
    return (
      <div className="pad row between wrapf">
        <div className="row gap2 wrapf">
          <Pill label={record.weight} tone="slate" />
          <span className="sb xs">{record.name}</span>
          <div className="row gap2 wrapf">
            {years.map((y) => <Pill key={y} label={String(y)} tone="amber" />)}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
      </div>
    );
  }

  return (
    <div className="pad row gap2 wrapf">
      <input className="inp numsm" placeholder="Weight class" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <input className="inp" style={{ maxWidth: 200 }} placeholder="Wrestler name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="inp" style={{ flex: 1, minWidth: 160 }} placeholder="Years (comma separated)" value={yearsText} onChange={(e) => setYearsText(e.target.value)} />
      <button
        className="btn btn-g btn-sm"
        disabled={!weight.trim() || !name.trim()}
        onClick={() => { api.updateHistoryRecord(record.id, { weight, name, years: yearsText }); setEditing(false); }}
      >
        Save
      </button>
      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
      <ConfirmButton
        label="Delete"
        confirmLabel="Remove"
        message="Remove from this list?"
        onConfirm={() => api.deleteHistoryRecord(record.id)}
      />
    </div>
  );
}

function AddRecordForm({ category }) {
  const { api } = useApp();
  const [weight, setWeight] = useState("");
  const [name, setName] = useState("");
  const [yearsText, setYearsText] = useState("");

  function submit() {
    if (!weight.trim() || !name.trim() || !yearsText.trim()) return;
    api.createHistoryRecord({ category, weight, name, years: yearsText });
    setWeight("");
    setName("");
    setYearsText("");
  }

  return (
    <div className="pad row gap2 wrapf">
      <input className="inp numsm" placeholder="Weight class" value={weight} onChange={(e) => setWeight(e.target.value)} />
      <input className="inp" style={{ maxWidth: 200 }} placeholder="Wrestler name" value={name} onChange={(e) => setName(e.target.value)} />
      <input
        className="inp"
        style={{ flex: 1, minWidth: 160 }}
        placeholder="Years (comma separated)"
        value={yearsText}
        onChange={(e) => setYearsText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="btn btn-g btn-sm" disabled={!weight.trim() || !name.trim() || !yearsText.trim()} onClick={submit}>
        + Add Champion
      </button>
    </div>
  );
}

/* ============================== SETTINGS ============================== */

function SettingsPage() {
  const { state, api } = useApp();
  const p = state.program;
  const [font, setFont] = useState(p.fontFamily);
  const [text, setText] = useState(p.textColor);
  const [bg, setBg] = useState(p.backgroundColor);
  const [accent, setAccent] = useState(p.accentColor);
  const fileInputRef = useRef(null);

  function onLogoFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => api.updateLogo(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="hdr"><h1 className="b" style={{ fontSize: 16 }}>Customize Appearance</h1></div>
      </div>

      <div className="card pad">
        <span className="seclbl">Team Logo</span>
        <div className="row gap2 wrapf" style={{ marginTop: 8 }}>
          {p.logoDataUrl ? (
            <img src={p.logoDataUrl} alt="Team logo" style={{ height: 48, maxWidth: 160, objectFit: "contain" }} />
          ) : (
            <span className="muted xs">No logo uploaded.</span>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onLogoFile} className="xs" />
          {p.logoDataUrl && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { api.updateLogo(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            >
              Remove Logo
            </button>
          )}
        </div>
      </div>

      <div className="card pad">
        <span className="seclbl">Font</span>
        <div style={{ marginTop: 8, maxWidth: 280 }}>
          <select className="inp" value={font} onChange={(e) => setFont(e.target.value)}>
            {FONT_OPTIONS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>
        </div>
        <p className="xs" style={{ marginTop: 10, fontFamily: font }}>The quick brown fox jumps over the lazy dog.</p>
      </div>

      <ColorPicker label="Text Color" value={text} onChange={setText} />
      <ColorPicker label="Background Color" value={bg} onChange={setBg} />
      <ColorPicker label="Accent Color (header, tabs, buttons)" value={accent} onChange={setAccent} />

      <div className="card pad row gap2 wrapf">
        <button
          className="btn btn-g"
          onClick={() => api.updateTheme({ fontFamily: font, textColor: text, backgroundColor: bg, accentColor: accent })}
        >
          Save Changes
        </button>
        <ConfirmButton
          label="Reset to Defaults"
          className="btn btn-ghost"
          confirmLabel="Reset"
          message="Reset font, colors, and logo?"
          onConfirm={() => {
            api.resetTheme();
            setFont(THEME_DEFAULTS.fontFamily);
            setText(THEME_DEFAULTS.textColor);
            setBg(THEME_DEFAULTS.backgroundColor);
            setAccent(THEME_DEFAULTS.accentColor);
          }}
        />
      </div>

      <TeamsCard />

      <div className="card pad">
        <span className="seclbl">Program Data</span>
        <p className="muted xs" style={{ marginTop: 6, marginBottom: 8 }}>
          Everything you enter is saved in this app. Resetting reloads the seeded syllabus and championship history and
          erases practices, roster, and weigh-ins.
        </p>
        <ConfirmButton
          label="Reset All Data"
          confirmLabel="Erase Everything"
          message="Erase all practices, roster, and weigh-ins?"
          onConfirm={() => api.resetAllData()}
        />
      </div>
    </div>
  );
}

/**
 * Teams are levels within one program — they share the syllabus, the
 * championship history, and this theme. Only rosters and schedules are
 * per-team, which is why this lives in Settings and not behind auth.
 */
function TeamsCard() {
  const { state, api } = useApp();
  const [newName, setNewName] = useState("");
  const teams = [...state.teams].sort((a, b) => a.order - b.order);

  const counts = (teamId) => ({
    wrestlers: state.wrestlers.filter((w) => onRosterOf(w, teamId)).length,
    practices: state.practices.filter((p) => p.teamId === teamId).length,
  });


  function add() {
    if (!newName.trim()) return;
    api.createTeam(newName);
    setNewName("");
  }

  return (
    <div className="card">
      <div className="hdr"><h2 className="sb" style={{ fontSize: 14 }}>Teams</h2></div>
      <div className="divide">
        {teams.map((t) => {
          const c = counts(t.id);
          const fallback = teams.find((x) => x.id !== t.id);
          return (
            <div key={t.id} className="pad row between wrapf gap2" style={{ alignItems: "flex-start" }}>
              <div className="row gap2">
                <input
                  type="color"
                  value={teamColor(t)}
                  title="Team color"
                  onChange={(e) => api.updateTeam(t.id, { color: e.target.value })}
                  style={{ width: 32, height: 30, padding: 0, border: "1px solid var(--line)", borderRadius: 6 }}
                />
                <input
                  className="inp"
                  style={{ maxWidth: 240 }}
                  value={t.name}
                  onChange={(e) => api.updateTeam(t.id, { name: e.target.value })}
                />
              </div>
              <div className="row gap2 wrapf">
                <span className="muted xs">{c.wrestlers} wrestlers · {c.practices} practices</span>
                <TeamBaseline team={t} />
                <TeamScheduleGenerator team={t} />
                {teams.length > 1 && (
                  <ConfirmButton
                    label="Delete"
                    confirmLabel="Delete & Move"
                    message={`Move its wrestlers and practices to ${fallback.name}?`}
                    onConfirm={() => api.deleteTeam(t.id, fallback.id)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pad row gap2 wrapf">
        <input
          className="inp"
          style={{ maxWidth: 240 }}
          placeholder="Team name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn btn-g btn-sm" onClick={add}>+ Add Team</button>
      </div>
      <div className="pad" style={{ paddingTop: 0 }}>
        <p className="muted xs" style={{ marginBottom: 8 }}>
          Practice numbering runs separately per team — each team's first practice is #1. Deleting a team moves its
          wrestlers, practices, competitions, and weigh-in sheets to another team rather than erasing them.
        </p>
        <ConfirmButton
          label="Renumber Practices by Team"
          className="btn btn-ghost btn-sm"
          confirmLabel="Renumber"
          message="Renumber each team's practices 1–n by date? Reconciled practices keep their numbers."
          onConfirm={() => api.renumberAllPractices()}
        />
      </div>
    </div>
  );
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Fills a stretch of season with a team's repeating practice days. */
function TeamScheduleGenerator({ team }) {
  const { state, api } = useApp();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState([2, 4]); // Tue/Thu
  const [result, setResult] = useState(null);

  const last = state.practices
    .filter((p) => p.teamId === team.id)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const now = new Date();
  const dayAfter = last
    ? dateKey(new Date(parseDateOnly(last.date).getFullYear(), parseDateOnly(last.date).getMonth(), parseDateOnly(last.date).getDate() + 1))
    : todayStr();
  // Default through the end of the season's March.
  const marchYear = now.getMonth() > 2 ? now.getFullYear() + 1 : now.getFullYear();
  const [from, setFrom] = useState(dayAfter);
  const [to, setTo] = useState(dateKey(new Date(marchYear, 2, 31)));

  if (!open) {
    return <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>Generate practices</button>;
  }

  return (
    <div className="ib pad" style={{ width: "100%", marginTop: 8 }}>
      <div className="row between wrapf gap2" style={{ marginBottom: 8 }}>
        <span className="sb xs">Repeat {team.name} practices</span>
        <button className="btn btn-ghost btn-sm iconbtn" onClick={() => { setOpen(false); setResult(null); }}>Done</button>
      </div>
      <div className="row gap2 wrapf" style={{ marginBottom: 8 }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <label key={label} className="row gap2 xs" style={{ whiteSpace: "nowrap" }}>
            <input
              type="checkbox"
              checked={days.includes(i)}
              onChange={() => setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="grid g2">
        <Field label="From"><input type="date" className="inp" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Through"><input type="date" className="inp" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      <div className="row gap2 wrapf" style={{ marginTop: 10 }}>
        <ConfirmButton
          label="Create practices"
          className="btn btn-g btn-sm"
          confirmLabel="Create"
          message={`Add ${days.map((d) => WEEKDAY_LABELS[d]).join("/") || "—"} practices through ${to}?`}
          onConfirm={() => {
            if (!days.length) return "Pick at least one weekday.";
            if (!from || !to || from > to) return "Check the date range.";
            const n = api.generatePractices(team.id, from, to, days);
            setResult(n);
          }}
        />
        {result != null && (
          <span className="xs" style={{ color: "var(--tone-emerald-color)" }}>
            {result === 0 ? "Nothing to add — those dates already have practices." : `Added ${result} practices.`}
          </span>
        )}
      </div>
      <p className="muted xs" style={{ marginTop: 8 }}>
        Uses this team's baseline for time and venue. Dates that already have a practice are skipped.
      </p>
    </div>
  );
}

/**
 * A team's standing slot and room. New practices start from it, and it can be
 * pushed onto existing ones — either filling gaps or overwriting. Individual
 * practices are still edited on the dashboard or in Practice Plans.
 */
function TeamBaseline({ team }) {
  const { state, api } = useApp();
  const [open, setOpen] = useState(false);

  const field = (key) => `default${key[0].toUpperCase()}${key.slice(1)}`;
  const value = (key) => team[field(key)] || "";
  const set = (key) => (e) => api.updateTeam(team.id, { [field(key)]: e.target.value });
  const hasBaseline = BASELINE_FIELDS.some((k) => value(k).trim());
  const open2 = state.practices.filter((p) => p.teamId === team.id && !p.reconciledAt).length;

  const summary = [value("startTime") && `${value("startTime")}${value("endTime") ? `–${value("endTime")}` : ""}`, value("location")]
    .filter(Boolean)
    .join(" · ");

  if (!open) {
    return (
      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        {hasBaseline ? `Baseline: ${summary || "set"}` : "Set baseline"}
      </button>
    );
  }

  return (
    <div className="ib pad" style={{ width: "100%", marginTop: 8 }}>
      <div className="row between wrapf gap2" style={{ marginBottom: 8 }}>
        <span className="sb xs">{team.name} baseline</span>
        <button className="btn btn-ghost btn-sm iconbtn" onClick={() => setOpen(false)}>Done</button>
      </div>
      <div className="grid g4">
        <Field label="Start Time"><input className="inp" placeholder="Start time (6:00 PM)" value={value("startTime")} onChange={set("startTime")} /></Field>
        <Field label="End Time"><input className="inp" placeholder="End time (7:15 PM)" value={value("endTime")} onChange={set("endTime")} /></Field>
        <Field label="Location"><input className="inp" placeholder="Location" value={value("location")} onChange={set("location")} /></Field>
        <Field label="Address"><input className="inp" placeholder="Street address" value={value("address")} onChange={set("address")} /></Field>
      </div>
      <p className="muted xs" style={{ marginTop: 8 }}>
        New practices for this team start from these. {open2
          ? `${open2} existing practice${open2 === 1 ? "" : "s"} can be updated:`
          : "No unreconciled practices to update yet."}
      </p>
      {open2 > 0 && (
        <div className="row gap2 wrapf" style={{ marginTop: 8 }}>
          <ConfirmButton
            label="Fill blanks only"
            className="btn btn-ghost btn-sm"
            confirmLabel="Fill"
            message={`Fill missing times and venue on ${open2} practice${open2 === 1 ? "" : "s"}?`}
            onConfirm={() => {
              if (!hasBaseline) return "Set a baseline value first.";
              api.applyTeamBaseline(team.id, true);
            }}
          />
          <ConfirmButton
            label="Overwrite all"
            className="btn btn-o btn-sm"
            confirmLabel="Overwrite"
            message={`Replace times and venue on all ${open2}? Reconciled practices are skipped.`}
            onConfirm={() => {
              if (!hasBaseline) return "Set a baseline value first.";
              api.applyTeamBaseline(team.id, false);
            }}
          />
        </div>
      )}
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="card pad">
      <span className="seclbl">{label}</span>
      <div className="row gap2 wrapf" style={{ marginTop: 8 }}>
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c.hex}
            title={c.name}
            onClick={() => onChange(c.hex)}
            style={{
              width: 26, height: 26, borderRadius: 6, background: c.hex,
              border: String(value).toLowerCase() === c.hex ? "2px solid var(--accent)" : "1px solid var(--line)",
              padding: 0,
            }}
          />
        ))}
        <span className="row gap2" style={{ marginLeft: 8 }}>
          <span className="muted xs">More Colors</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: 32, height: 26, padding: 0, border: "1px solid var(--line)", borderRadius: 6 }}
          />
        </span>
      </div>
    </div>
  );
}

/* ============================== ROOT ============================== */

function Screen() {
  const { view } = useApp();
  switch (view.tab) {
    case "syllabus":
      return view.sub === "organize" ? <OrganizeCategoriesPage /> : <SyllabusPage />;
    case "practice":
      if (view.sub === "detail") return <PracticeEditor key={view.id} practiceId={view.id} />;
      if (view.sub === "archive") return <ArchivePage />;
      return <PracticeListPage />;
    case "roster":
      return <RosterPage />;
    case "weighin":
      return view.sub === "detail" ? <WeighInSheetForm key={view.id} sheetId={view.id} /> : <WeighInListPage />;
    case "history":
      return <HistoryPage />;
    case "settings":
      return <SettingsPage />;
    case "dashboard":
    default:
      if (view.sub === "competition") return <CompetitionDetail key={view.id} competitionId={view.id} />;
      if (view.sub === "practiceday") return <PracticeDayPage key={view.id} practiceId={view.id} />;
      return <Dashboard />;
  }
}

function MatPlan() {
  const { state, update, loaded } = usePersistentState();
  const api = useMemo(() => makeApi(update), [update]);
  const [view, setView] = useState({ tab: "dashboard" });
  const go = React.useCallback((tab, sub, id) => {
    setView({ tab, sub, id });
    if (typeof window !== "undefined" && window.scrollTo) window.scrollTo(0, 0);
  }, []);

  if (!loaded || !state) {
    return (
      <div className="mp">
        <style>{CSS}</style>
        <div className="wrap"><div className="card pad muted">Loading MatPlan…</div></div>
      </div>
    );
  }

  const p = state.program;
  const rootStyle = {
    fontFamily: `${p.fontFamily}, "Segoe UI", system-ui, -apple-system, Arial, sans-serif`,
    "--text": p.textColor,
    "--bg": p.backgroundColor,
    "--accent": p.accentColor,
  };

  return (
    <AppCtx.Provider value={{ state, api, view, go }}>
      <div className="mp" style={rootStyle} onFocus={selectOnFocus}>
        <style>{CSS}</style>
        <div className="wrap">
          <AppHeader logoDataUrl={p.logoDataUrl} />
          <TabNav />
          <Screen />
        </div>
      </div>
    </AppCtx.Provider>
  );
}

export default MatPlan;
