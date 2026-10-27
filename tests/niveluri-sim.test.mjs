// DAME FĂRĂ FRONTIERE: verificare prin simulare că nivelurile AI (1 Ușor, 2 Mediu, 3 Avansat) chiar diferă.
// Motorul generic (window.DAME) se extrage din primul <script> al motorului și rulează în Node, fără browser.
// Deschiderea: 4 mutări aleatoare (seed fix) pentru varietate; culorile se alternează. N >= 50 partide per pereche.
// Durează (timp real de gândire al AI: ~0,5 s la Mediu, ~1,1 s la Avansat): ~10-40 min pentru N=50. Rulare: node tests/niveluri-sim.test.mjs [N] [variante separate prin virgulă] [perechi: 21,31]
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, "..", "index.html"), "utf8");
const m = html.match(/<script>\s*\/\* =+\s*DAME FĂRĂ FRONTIERE — motor generic de dame[\s\S]*?<\/script>/);
if (!m) throw new Error("motorul generic nu a fost găsit");
const body = m[0].replace(/^<script>/, "").replace(/<\/script>$/, "");
const sandbox = {performance, Math: Object.create(Math), console};
// Math.random deterministic (nivelul 1 îl folosește pentru mutări întâmplătoare)
let s0 = 12345; const rnd = () => { s0 = (s0 * 1664525 + 1013904223) >>> 0; return s0 / 4294967296; };
sandbox.Math.random = rnd; sandbox.self = sandbox;
const ctx = vm.createContext(sandbox);
vm.runInContext(body, ctx);
const D = ctx.DAME;
const ENG = {
  english: {size: 8, promotion: "stop"},
  russian: {size: 8, menCaptureBackward: true, flyingKings: true, maxCapture: false, promotion: "continue"},
  brazilian: {size: 8, menCaptureBackward: true, flyingKings: true, maxCapture: true, promotion: "final"}
};
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log("  ok   " + n); } else { fail++; console.log("FAIL " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : "")); } };
const N = parseInt(process.argv[2], 10) || 50;
const VARS = (process.argv[3] || "english,russian,brazilian").split(",");

function game(vid, lvW, lvB) {
  const rules = D.normRules(ENG[vid]); let b = D.initialBoard(rules), side = "w", clock = 0, ply = 0;
  const lim = rules.size >= 10 ? 60 : 50;
  while (ply < 300) {
    const ms = D.genMoves(b, rules, side);
    if (!ms.length) { const r = D.result(b, rules, side); return r === "w" ? 1 : r === "b" ? 0 : 0.5; }
    if (clock >= lim) return 0.5;
    const mv = ply < 4 ? ms[Math.floor(rnd() * ms.length)] : D.bestMove(b, rules, side, side === "w" ? lvW : lvB);
    const p0 = b[mv.path[0]], man = p0 && !p0.k;
    b = D.applyMove(b, rules, mv); clock = (mv.caps.length || man) ? 0 : clock + 1; side = side === "w" ? "b" : "w"; ply++;
  }
  return 0.5;
}
function duel(hi, lo, n) {
  let w = 0, l = 0, d = 0;
  for (let i = 0; i < n; i++) {
    const vid = VARS[i % VARS.length], hiWhite = Math.floor(i / VARS.length) % 2 === 0;
    const r = hiWhite ? game(vid, hi, lo) : 1 - game(vid, lo, hi);
    if (r === 1) w++; else if (r === 0) l++; else d++;
  }
  const dec = w + l, z = dec ? (w - dec / 2) / Math.sqrt(dec / 4) : 0, score = (w + d / 2) / n;
  return {hi, lo, n, w, l, d, score: +score.toFixed(3), z: +z.toFixed(2)};
}
const t0 = Date.now();
const PAIRS = (process.argv[4] || "21,31").split(",");
const r21 = PAIRS.includes("21") ? duel(2, 1, N) : null, r31 = PAIRS.includes("31") ? duel(3, 1, N) : null;
for (const r of [r21, r31].filter(Boolean)) console.log(`  nivel ${r.hi} vs nivel ${r.lo}: ${r.n} partide (${VARS.join("/")}), ${r.w} victorii, ${r.l} înfrângeri, ${r.d} remize; scor ${r.score}; z=${r.z}`);
console.log(`  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
ok("N >= 50 partide pe pereche", [r21, r31].filter(Boolean).every(r => r.n >= 50), [r21 && r21.n, r31 && r31.n]);
if (r21) ok("Mediu bate semnificativ Ușor (z >= 2.58, scor > 0.5)", r21.z >= 2.58 && r21.score > 0.5, r21);
if (r31) ok("Avansat bate semnificativ Ușor (z >= 2.58, scor > 0.5)", r31.z >= 2.58 && r31.score > 0.5, r31);
console.log(`\n${pass} reușite, ${fail} eșuate`); process.exit(fail ? 1 : 0);
