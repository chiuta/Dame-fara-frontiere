// DAME FĂRĂ FRONTIERE: statistici locale victorii/remize/înfrângeri contra AI (pe variantă și nivel), în localStorage.
// Rulare: node tests/statistici.test.mjs
import {launch, check, summary, INDEX} from "./_lib.mjs";
const {browser, page, st} = await launch({}); await page.waitForTimeout(2500);
await page.waitForSelector('[data-id="english"]');
await page.click('[data-id="english"]'); await page.click("#goplay"); await page.waitForTimeout(300);
const stat = () => page.evaluate(() => document.querySelector("#wlstat").textContent);
const end = (over) => page.evaluate((o) => { const P = window.__dame8.P(); P.over = o; P.recorded = false; window.__dame8.after(); }, over);
check("linia de statistică apare, la zero", /0 victorii · 0 remize · 0 înfrângeri/.test(await stat()), await stat());
await end("w");
check("victorie (joci cu albele) → 1 victorie", /1 victorii · 0 remize · 0 înfrângeri/.test(await stat()), await stat());
await end("b");
check("înfrângere → 1 înfrângere", /1 victorii · 0 remize · 1 înfrângeri/.test(await stat()), await stat());
await end("draw");
check("remiză → 1 remiză", /1 victorii · 1 remize · 1 înfrângeri/.test(await stat()), await stat());
await page.evaluate(() => { const P = window.__dame8.P(); P.recorded = true; window.__dame8.after(); });
check("nu se numără de două ori aceeași partidă", /1 victorii · 1 remize · 1 înfrângeri/.test(await stat()), await stat());
await page.click('#levelseg [data-lvl="3"]');
check("alt nivel are propriul contor (zero)", /0 victorii · 0 remize · 0 înfrângeri/.test(await stat()), await stat());
const raw = await page.evaluate(() => { try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/wl\.stats/.test(k)) return JSON.parse(localStorage.getItem(k)); } } catch (e) {} return null; });
check("datele sunt în localStorage (english, nivel 2 = [1,1,1])", raw && JSON.stringify(raw.english && raw.english[2]) === "[1,1,1]", raw);
// partidă în doi pe același dispozitiv: nu se numără
await page.evaluate(() => { const P = window.__dame8.P(); P.hot = true; P.over = "w"; P.recorded = false; window.__dame8.after(); });
const raw2 = await page.evaluate(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/wl\.stats/.test(k)) return localStorage.getItem(k); } return null; });
check("partida în doi (hot-seat) nu intră în statistică", raw2 === JSON.stringify(raw), raw2);
check("0 cereri de rețea și 0 erori", st.net.length === 0 && st.errs.length === 0, [st.net, st.errs]);
await browser.close(); summary();
