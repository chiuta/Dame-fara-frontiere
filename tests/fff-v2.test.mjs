// DAME FĂRĂ FRONTIERE 2.0.0 — antrenor de tactică (variante × niveluri) + greșelile din analiză reluate ca exerciții.
// Rulare: node tests/fff-v2.test.mjs
import {readFileSync as __rf} from 'node:fs';
const APP = JSON.parse(__rf(new URL('../app.json', import.meta.url), 'utf8'));
import {launch, axeRun, hOverflow, check, summary} from "./_lib.mjs";

const TAB = 5; // „Antrenor” este ultima filă a mesei de joc
const hub = async (page, n) => { if (!(await page.locator("dialog.c1a-dlg[open]").count())) await page.click((await page.locator("#hubbtn").isVisible()) ? "#hubbtn" : "#hubmainbtn"); await page.waitForSelector("dialog.c1a-dlg[open]"); await page.locator(".c1a-tab").nth(n).click(); await page.waitForTimeout(200); };

console.log("1. versiune și generator");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(1500);
  check(`versiune ${APP.version} 2.x`, /^2\./.test(APP.version) && (await page.getAttribute('meta[name="application-version"]', "content")) === APP.version);
  const g = async (v, l, n) => page.evaluate(([v, l, n]) => JSON.stringify(window.__dame8.train(v, l, n)), [v, l, n]);
  const a = await g("english", 1, 0), b = await g("english", 1, 0), c = await g("english", 1, 1), d = await g("english", 2, 0);
  check("același (variantă, nivel, nr.) → aceeași poziție", a === b && a.length > 50);
  check("alt număr / alt nivel → altă poziție", a !== c && a !== d);
  await page.evaluate(() => localStorage.clear());
  const a2 = await g("english", 1, 0);
  check("determinist și fără cache", a === a2);
  for (const lv of [1, 2, 3]) {
    const pz = JSON.parse(await g("russian", lv, 0));
    const thr = {1: 250, 2: 120, 3: 60}[lv];
    check(`nivel ${lv}: diferența de ≥ ${thr} sau marcat „weak”`, pz.gap >= thr || pz.weak, [pz.gap, pz.weak]);
    const legal = await page.evaluate(([v, l]) => { const pz = window.__dame8.train(v, l, 0); const D = window.__dame8.P() ? null : null; return pz.sol.length >= 2 && pz.board.length > 0; }, ["russian", lv]);
    check(`nivel ${lv}: soluție și tablă prezente`, legal);
  }
  const vs = await page.evaluate(() => ["english", "russian", "brazilian", "pool", "italian", "spanish", "czech", "german", "romanian", "thai", "turkish", "giveaway"].map(v => !!window.__dame8.train(v, 1, 0)));
  check("toate cele 12 variante generează exerciții", vs.every(Boolean), vs);
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("2. antrenor în interfață");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(1200);
  await hub(page, TAB);
  check("fila Antrenor are selectoare de variantă și nivel", (await page.locator("#tr-var option").count()) === 12 && (await page.locator("#tr-lvl option").count()) === 3);
  await page.selectOption("#tr-var", "english"); await page.selectOption("#tr-lvl", "1");
  await page.click("#tr-go");
  await page.waitForFunction(() => { const P = window.__dame8.P(); return P && P.puzzle && P.puzzle.kind === "train"; }, null, {timeout: 60000});
  await page.waitForTimeout(300);
  check("exercițiul se deschide pe tablă", true);
  check("banner de exercițiu", /Exercițiu/.test(await page.textContent("#pzbanner")), await page.textContent("#pzbanner"));
  check("există butoanele Următorul / Sari peste", /Următorul exercițiu/.test(await page.textContent("#pzbanner")) && /Sari peste/.test(await page.textContent("#pzbanner")));
  const wrong = await page.evaluate(() => { const P = window.__dame8.P(); const sol = P.puzzle.pz.sol.join(); const m = P.eng.genMoves(P.board, P.rules, P.side).filter(x => x.path.join() !== sol && x.path.length === 2)[0]; return m ? m.path : null; });
  if (wrong) {
    await page.click(`[data-sq="${wrong[0]}"]`); await page.click(`[data-sq="${wrong[1]}"]`); await page.waitForTimeout(600);
    const eq = await page.evaluate(() => window.__dame8.P().puzzle.solved);
    if (!eq) check("mutare greșită: mesaj cu diferența", /piese|mai bun/i.test(await page.textContent("#whymsg")), await page.textContent("#whymsg"));
    else check("mutare echivalentă acceptată", true);
  }
  let solved = await page.evaluate(() => window.__dame8.P().puzzle.solved);
  if (!solved) {
    const sol = await page.evaluate(() => window.__dame8.P().puzzle.pz.sol);
    await page.click(`[data-sq="${sol[0]}"]`);
    for (let i = 1; i < sol.length; i++) await page.click(`[data-sq="${sol[i]}"]`);
    await page.waitForTimeout(800);
    solved = await page.evaluate(() => window.__dame8.P().puzzle.solved);
  }
  check("soluția corectă rezolvă exercițiul", solved);
  check("mesaj de reușită", /Corect/.test(await page.textContent("#whymsg")), await page.textContent("#whymsg"));
  const stt = await page.evaluate(() => JSON.parse(localStorage.getItem("dff_r8_train.stats")));
  check("statistica locală: 1 rezolvat, nivel 1", stt && stt.all === 1 && stt.lv["1"] === 1, stt);
  const dayDone = await page.evaluate(() => { try { return Object.keys(localStorage).filter(k => /daily/.test(k)).map(k => localStorage.getItem(k)).join("|"); } catch (e) { return ""; } });
  check("nicio zi marcată rezolvată de antrenor", !/\d{4}-\d\d-\d\d/.test(dayDone), dayDone);
  await page.click("#pzbanner >> text=Următorul exercițiu");
  await page.waitForFunction(() => { const P = window.__dame8.P(); return P && P.puzzle && P.puzzle.kind === "train" && P.puzzle.meta.n === 1; }, null, {timeout: 60000});
  check("«Următorul» deschide exercițiul nr. 2 (progres salvat)", /nr\. 2/.test(await page.textContent("#pzbanner")), await page.textContent("#pzbanner"));
  await page.click("#pzbanner >> text=Sari peste");
  await page.waitForFunction(() => window.__dame8.P().puzzle.meta.n === 2, null, {timeout: 60000});
  check("«Sari peste» trece la nr. 3 fără să numere ca rezolvat", (await page.evaluate(() => JSON.parse(localStorage.getItem("dff_r8_train.stats")).all)) === 1);
  await page.reload(); await page.waitForTimeout(800);
  await hub(page, TAB);
  check("progresul persistă după reîncărcare", /nr\. 3/.test(await page.textContent("#tr-prog")), await page.textContent("#tr-prog"));
  check("statistica persistă", /Rezolvate în total: 1/.test(await page.locator(".c1a-pane:visible").innerText()));
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("3. provocarea zilei rămâne neschimbată");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__dame8.startPuzzle());
  await page.waitForTimeout(600);
  check("provocarea zilei are kind=daily", (await page.evaluate(() => window.__dame8.P().puzzle.kind)) === "daily");
  check("banner zilnic", /Provocarea zilei/.test(await page.textContent("#pzbanner")));
  check("fără buton «Următorul» la provocarea zilei", !/Următorul exercițiu/.test(await page.textContent("#pzbanner")));
  const sol = await page.evaluate(() => window.__dame8.P().puzzle.pz.sol);
  await page.click(`[data-sq="${sol[0]}"]`); for (let i = 1; i < sol.length; i++) await page.click(`[data-sq="${sol[i]}"]`);
  await page.waitForTimeout(800);
  check("soluția marchează ziua", await page.evaluate(() => window.__dame8.P().puzzle.solved) && /Seria/.test(await page.textContent("#whymsg")), await page.textContent("#whymsg"));
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("4. greșelile din analiză → exerciții");
{
  const {browser, page, st} = await launch();
  await page.waitForTimeout(1200);
  await page.click('[data-id="english"]'); await page.click("#goplay"); await page.waitForTimeout(400);
  // construiește local o partidă cu mutări (pseudo)aleatoare, deterministe, ca să existe greșeli de analizat
  const made = await page.evaluate(() => {
    const P = window.__dame8.P(); let x = 12345; const rnd = () => (x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    P.snaps = [{board: P.board.slice(), side: P.side, clock: 0, ml: 0}]; P.moves = [];
    for (let i = 0; i < 16; i++) {
      const ms = P.eng.genMoves(P.board, P.rules, P.side); if (!ms.length) break;
      const mv = ms[Math.floor(rnd() * ms.length)];
      P.moves.push(mv.path.join("-")); P.board = P.eng.applyMove(P.board, P.rules, mv); P.side = P.side === "w" ? "b" : "w";
      P.snaps.push({board: P.board.slice(), side: P.side, clock: i + 1, ml: P.moves.length});
    }
    return P.moves.length;
  });
  check("partidă de probă construită", made >= 10, made);
  await hub(page, 1);
  await page.click("text=Analizează întreaga partidă");
  await page.waitForSelector(".rv-retry", {timeout: 120000});
  const nb = await page.locator(".rv-retry").count();
  check("fiecare greșeală are buton «Reia ca exercițiu»", nb >= 1, nb);
  await page.locator(".rv-retry").first().click();
  await page.waitForFunction(() => { const P = window.__dame8.P(); return P && P.puzzle && P.puzzle.kind === "review"; }, null, {timeout: 60000});
  await page.waitForTimeout(300);
  check("banner de greșeală reluată", /Greșeala ta din partidă/.test(await page.textContent("#pzbanner")), await page.textContent("#pzbanner"));
  const sol = await page.evaluate(() => window.__dame8.P().puzzle.pz.sol);
  await page.click(`[data-sq="${sol[0]}"]`); for (let i = 1; i < sol.length; i++) await page.click(`[data-sq="${sol[i]}"]`);
  await page.waitForTimeout(800);
  check("mutarea mai bună rezolvă exercițiul", await page.evaluate(() => window.__dame8.P().puzzle.solved) && /Corect/.test(await page.textContent("#whymsg")), await page.textContent("#whymsg"));
  const stt = await page.evaluate(() => localStorage.getItem("dff_r8_train.stats"));
  check("exercițiul din partidă nu schimbă statisticile antrenorului", stt === null, stt);
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("5. accesibilitate");
for (const [w, h] of [[1280, 800], [390, 780]]) {
  const {browser, page, st} = await launch({w, h, bypassCSP: true});
  await page.waitForTimeout(1200);
  await hub(page, TAB);
  const ax = await axeRun(page);
  check(`axe 0 (antrenor ${w}×${h})`, ax && ax.length === 0, ax);
  check(`fără depășire orizontală (${w}×${h})`, (await hOverflow(page)) <= 0);
  check("selectoarele au etichete", (await page.locator("#tr-var").getAttribute("aria-label")) && (await page.locator("#tr-lvl").getAttribute("aria-label")));
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}
summary();
