// DAME FĂRĂ FRONTIERE — teste pentru funcțiile noi (runda 8, C1a): joc în doi P2P, analizor, provocarea zilei,
// „de ce nu pot muta?", tastatură + anunțuri, turneu Elo local. Rulare: node tests/fff-r8.test.mjs
import {launch, axeRun, hOverflow, check, summary, kitSmoke, kitLabel, chromium, INDEX} from "./_lib.mjs";

const SPEECH = () => {
  window.__said = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  Object.defineProperty(window, "speechSynthesis", {configurable: true, value: {cancel() {}, speak(u) { window.__said.push(u.text); }, getVoices() { return [{lang: 'ro-RO', name: 'Test', localService: true, default: true}]; }, addEventListener() {}, removeEventListener() {}}});
};
const hub = async (page, n) => { if (!(await page.locator("dialog.c1a-dlg[open]").count())) await page.click((await page.locator("#hubbtn").isVisible()) ? "#hubbtn" : "#hubmainbtn"); await page.waitForSelector("dialog.c1a-dlg[open]"); await page.locator(".c1a-tab").nth(n).click(); await page.waitForTimeout(200); };
const play = async (page, id) => { await page.click(`[data-id="${id}"]`); await page.click("#goplay"); await page.waitForTimeout(300); };

console.log("1. pornire, versiune, kit");
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(3500);
  check("0 erori", st.errs.length === 0, st.errs);
  check("0 cereri de rețea", st.net.length === 0, st.net);
  check("0 violări CSP", (await page.evaluate(() => window.__csp)).length === 0);
  check("meta application-version 1.1.0", (await page.getAttribute('meta[name="application-version"]', "content")) === "1.1.0");
  check("#app-version", /1\.1\.0 · 2026-10-14/.test(await page.textContent("#app-version")));
  check("fără depășire orizontală", (await hOverflow(page)) <= 0);
  check("lista de variante intactă (≥ 20 de butoane de joc)", (await page.locator("[data-id]").count()) >= 20);
  await kitSmoke(page, "dame-fara-frontiere", ["dff_r8_probe", "1"]);
  await kitLabel(page, "dame-fara-frontiere");
  await browser.close();
}

console.log("2. „De ce nu pot muta?”, tastatură, anunțuri");
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(800);
  await play(page, "english");
  const mv = await page.evaluate(() => { const P = window.__dame8.P(); return P.eng.genMoves(P.board, P.rules, "w")[0].path; });
  // piesă adversă / pătrat gol / piesă fără mutări
  await page.click('[data-sq="0"]');
  const w1 = await page.textContent("#whymsg");
  check("pătrat gol/neutilizabil: explicație nevidă", w1.trim().length > 10, w1);
  const enemy = await page.evaluate(() => { const P = window.__dame8.P(); for (let i = 0; i < P.board.length; i++) if (P.board[i] && P.board[i].c === "b") return i; return -1; });
  await page.click(`[data-sq="${enemy}"]`);
  const w2 = await page.textContent("#whymsg");
  check("piesă a adversarului: explicație diferită", w2 !== w1 && /advers|negre|nu e a ta|nu este a ta/i.test(w2), w2);
  await page.click(`[data-sq="${mv[0]}"]`); await page.click(`[data-sq="${mv[1]}"]`);
  await page.waitForTimeout(1800);
  check("mutarea legală se execută", (await page.evaluate(() => window.__dame8.P().moves.length)) >= 1);
  const said = await page.evaluate(() => window.__said.length);
  check("anunțurile vocale nu rulează implicit (voce oprită)", said === 0, said);
  await page.keyboard.press("w");
  check("tasta W explică", (await page.textContent("#whymsg")).trim().length > 5);
  await page.keyboard.press("m");
  await page.waitForTimeout(200);
  check("tasta M anunță piesele mutabile (regiune live)", /mut|piese|poți/i.test(await page.textContent("#c1a-live")), await page.textContent("#c1a-live"));
  check("0 erori", st.errs.length === 0, st.errs);
  // voce activă
  await page.evaluate(() => { localStorage.setItem("dff_r8_acc.voice", "true"); });
  await browser.close();
}
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(800);
  await page.evaluate(() => localStorage.setItem("dff_r8_acc.voice", "true"));
  await page.reload(); await page.waitForTimeout(800);
  await play(page, "english");
  await page.keyboard.press("s");
  await page.waitForTimeout(1500);
  check("cu vocea activă, tasta S este rostită", (await page.evaluate(() => window.__said.length)) >= 1, await page.evaluate(() => window.__said));
  await browser.close();
}

console.log("2b. tablă de la tastatură (săgeți, Enter)");
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(800);
  await play(page, "english");
  const mv = await page.evaluate(() => { const P = window.__dame8.P(); return P.eng.genMoves(P.board, P.rules, "w")[0].path; });
  await page.focus(`[data-sq="${mv[0]}"]`);
  await page.keyboard.press("ArrowRight");
  const sq1 = await page.evaluate(() => document.activeElement.getAttribute("data-sq"));
  check("săgeata dreapta mută focusul pe pătratul vecin", sq1 !== null && sq1 !== String(mv[0]) , [sq1, mv[0]]);
  check("exact un pătrat din tablă are tabindex=0 (roving)", (await page.locator('button.sq[tabindex="0"]').count()) === 1);
  await page.focus(`[data-sq="${mv[0]}"]`); await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  check("Enter selectează piesa și anunță mutările posibile", /Selectat.*Destina/i.test(await page.textContent("#c1a-live")), await page.textContent("#c1a-live"));
  await page.focus(`[data-sq="${mv[1]}"]`); await page.keyboard.press("Enter");
  await page.waitForTimeout(1500);
  check("mutare completă doar din tastatură", (await page.evaluate(() => window.__dame8.P().moves.length)) >= 1);
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("3. analizor");
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(800);
  await play(page, "english");
  await hub(page, 1);
  await page.click("text=Analizează poziția");
  await page.waitForSelector(".c1a-meter", {timeout: 20000});
  const t = await page.locator(".c1a-pane:visible").innerText();
  check("evaluare + cea mai bună mutare + adâncime", /Mutare|mutarea/i.test(t) && /adânc/i.test(t), t.slice(0, 400));
  const r1 = await page.evaluate(() => { const r = window.__dame8.analyze(400); return r && r.list.length; });
  check("clasament de mutări ≥ 2", r1 >= 2, r1);
  const srt = await page.evaluate(() => { const r = window.__dame8.analyze(300); return r.list.every((x, i) => i === 0 || r.list[i - 1].s >= x.s); });
  check("mutările sunt ordonate descrescător după scor", srt);
  await browser.close();
}

console.log("4. provocarea zilei");
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(800);
  const a = await page.evaluate(() => JSON.stringify(window.__dame8.daily("2026-10-14")));
  const b = await page.evaluate(() => JSON.stringify(window.__dame8.daily("2026-10-14")));
  const c = await page.evaluate(() => JSON.stringify(window.__dame8.daily("2026-10-15")));
  check("aceeași dată → aceeași problemă", a === b && a.length > 50);
  check("alt zi → altă problemă", a !== c);
  // determinism între contexte (alt browser, fără cache)
  const p2 = await launch({init: SPEECH}); await p2.page.waitForTimeout(500);
  const a2 = await p2.page.evaluate(() => JSON.stringify(window.__dame8.daily("2026-10-14")));
  check("determinist între sesiuni/dispozitive", a === a2);
  await p2.browser.close();
  const pz = JSON.parse(a);
  await page.evaluate(() => window.__dame8.startPuzzle());
  await page.waitForTimeout(500);
  const okPz = await page.evaluate(() => { const P = window.__dame8.P(); return !!(P && P.puzzle); });
  check("problema se deschide pe tablă", okPz);
  // mutare greșită (dacă există alta decât soluția)
  const wrong = await page.evaluate(() => { const P = window.__dame8.P(); const sol = P.puzzle.pz.sol.join(); const m = P.eng.genMoves(P.board, P.rules, P.side).filter(x => x.path.join() !== sol)[0]; return m ? m.path : null; });
  if (wrong) { await page.click(`[data-sq="${wrong[0]}"]`); await page.click(`[data-sq="${wrong[1]}"]`); await page.waitForTimeout(500);
    check("mutare greșită: explicație cu diferența de evaluare", /soluți|mai slab|mai bun|piese/i.test(await page.textContent("#whymsg")) , await page.textContent("#whymsg")); }
  const sol = await page.evaluate(() => window.__dame8.P().puzzle.pz.sol);
  await page.evaluate(() => { const P = window.__dame8.P(); if (P.puzzle.tries) { /* reset prin meniu dacă există */ } });
  const solved = await page.evaluate(() => { const P = window.__dame8.P(); return P.puzzle.solved; });
  if (!solved) { await page.click(`[data-sq="${sol[0]}"]`); await page.click(`[data-sq="${sol[1]}"]`); await page.waitForTimeout(800); }
  check("soluția corectă marchează ziua rezolvată", await page.evaluate(() => window.__dame8.P().puzzle.solved));
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("5. turneu Elo local");
{
  const {browser, page, st} = await launch({init: SPEECH});
  await page.waitForTimeout(800);
  await hub(page, 3);
  await page.locator(".c1a-pane:visible button.c1a-pri").first().click();
  await page.waitForTimeout(400);
  check("clasament afișat", (await page.locator(".c1a-table").count()) >= 1);
  const nm = await page.locator(".c1a-matches .c1a-match").count();
  check("meciuri generate (round-robin cu ≥ 4 jucători → 6)", nm === 6, nm);
  for (let i = 0; i < 2; i++) { await page.locator('button:has-text("Simulează")').first().click(); await page.waitForTimeout(3000); }
  const rec = await page.evaluate(() => window.__dame8.tour().state.matches.filter(m => m.res !== null && m.res !== undefined).length);
  check("rezultate simulate înregistrate", rec >= 2, rec);
  const txt = await page.locator(".c1a-table").first().innerText();
  check("clasamentul conține nivelurile AI", /AI/.test(txt));
  // persistență
  await page.reload(); await page.waitForTimeout(600);
  await hub(page, 3);
  check("turneul persistă după reîncărcare", (await page.locator(".c1a-matches .c1a-match").count()) === 6);
  check("0 erori", st.errs.length === 0, st.errs);
  await browser.close();
}

console.log("6. joc în doi prin FFF.p2p (două pagini, lockstep)");
{
  const args = ["--no-sandbox", "--allow-loopback-in-peer-connection", "--disable-features=WebRtcHideLocalIpsWithMdns"];
  const A = await launch({args, init: SPEECH, bypassCSP: true}), B = await launch({args, init: SPEECH, bypassCSP: true});
  const D = (p, r) => p.locator(`[data-role=${r}]`);
  await A.page.waitForTimeout(800); await B.page.waitForTimeout(800);
  await play(A.page, "russian");
  await hub(A.page, 0); await A.page.click("text=Începe un joc în doi…");
  await D(A.page, "p2p-dialog").waitFor();
  check("axe 0 în dialogul P2P", (await axeRun(A.page)).length === 0, await axeRun(A.page));
  await D(A.page, "optin").check(); await D(A.page, "mode-host").click(); await D(A.page, "gen-offer").click();
  await D(A.page, "offer-out").waitFor(); const offer = await D(A.page, "offer-out").inputValue();
  await hub(B.page, 0); await B.page.click("text=Începe un joc în doi…");
  await D(B.page, "p2p-dialog").waitFor();
  await D(B.page, "optin").check(); await D(B.page, "mode-join").click();
  await D(B.page, "offer-in").fill(offer); await D(B.page, "gen-answer").click();
  await D(B.page, "answer-out").waitFor();
  await D(A.page, "answer-in").fill(await D(B.page, "answer-out").inputValue()); await D(A.page, "connect").click();
  await A.page.waitForFunction(() => { const P = window.__dame8.P(); return P && P.online && P.online.ctrl && P.online.ctrl.open; }, null, {timeout: 25000});
  await B.page.waitForFunction(() => { const P = window.__dame8.P(); return P && P.online && P.v && P.v.id === "russian"; }, null, {timeout: 25000});
  check("oaspetele primește varianta gazdei", true);
  const mvA = await A.page.evaluate(() => { const P = window.__dame8.P(); return P.eng.genMoves(P.board, P.rules, "w")[0].path; });
  await A.page.click(`[data-sq="${mvA[0]}"]`); await A.page.click(`[data-sq="${mvA[1]}"]`);
  await B.page.waitForFunction(() => window.__dame8.P().moves.length === 1, null, {timeout: 8000});
  check("mutarea gazdei ajunge la oaspete", true);
  const mvB = await B.page.evaluate(() => { const P = window.__dame8.P(); return P.eng.genMoves(P.board, P.rules, "b")[0].path; });
  await B.page.click(`[data-sq="${mvB[0]}"]`); await B.page.click(`[data-sq="${mvB[1]}"]`);
  await A.page.waitForFunction(() => window.__dame8.P().moves.length === 2, null, {timeout: 8000});
  await B.page.waitForFunction(() => window.__dame8.P().moves.length === 2, null, {timeout: 8000});
  const bA = await A.page.evaluate(() => JSON.stringify(window.__dame8.P().board)), bB = await B.page.evaluate(() => JSON.stringify(window.__dame8.P().board));
  check("tablele identice pe ambele părți", bA === bB);
  check("fără resincronizări inutile", (await B.page.evaluate(() => window.__dame8.P().online.ctrl.lockstep.stats.resyncs)) === 0);
  await B.page.click(`[data-sq="${mvB[0]}"]`);
  check("mutare în afara rândului: explicație", /rândul/i.test(await B.page.textContent("#whymsg")), await B.page.textContent("#whymsg"));
  check("axe 0 pe pagina de joc online (gazdă)", (await axeRun(A.page)).length === 0, await axeRun(A.page));
  await A.page.click("text=Propune remiză");
  await B.page.waitForSelector(".c1a-oprompt button");
  await B.page.click(".c1a-oprompt >> text=Acceptă");
  await A.page.waitForFunction(() => window.__dame8.P().over === "draw", null, {timeout: 8000});
  await B.page.waitForFunction(() => window.__dame8.P().over === "draw", null, {timeout: 8000});
  check("remiza acceptată se aplică ambelor părți", (await B.page.evaluate(() => window.__dame8.P().over)) === "draw");
  check("0 erori (A, B)", A.st.errs.length === 0 && B.st.errs.length === 0, [A.st.errs, B.st.errs]);
  await A.browser.close(); await B.browser.close();
}

console.log("7. axe + 360×740 în panourile noi, deschis/închis");
for (const [w, h, sc] of [[1280, 800, "light"], [360, 740, "dark"]]) {
  const {browser, page, st} = await launch({w, h, colorScheme: sc, reducedMotion: "reduce", bypassCSP: true, init: SPEECH});
  await page.waitForTimeout(3600);
  await play(page, "english");
  for (let t = 0; t < 5; t++) {
    await hub(page, t);
    check(`axe 0 (hub, tab ${t}, ${w}×${h} ${sc})`, (await axeRun(page)).length === 0, await axeRun(page));
    check(`fără depășire orizontală (tab ${t}, ${w}×${h})`, (await hOverflow(page)) <= 0);
  }
  await page.keyboard.press("Escape");
  check("Escape închide dialogul", (await page.locator("dialog.c1a-dlg[open]").count()) === 0);
  check(`0 erori (${w}×${h})`, st.errs.length === 0, st.errs);
  await browser.close();
}
summary();
