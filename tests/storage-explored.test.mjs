// Dame fără frontiere — regresie: `dff_explored` corupt în localStorage nu strică contorul; ținte tactile ≥44px pe mobil.
// Rulare: node tests/storage-explored.test.mjs
import {launch, check, summary} from "./_lib.mjs";

for (const [nume, v, asteptat] of [["null", "null", 0], ["număr", "5", 0], ["obiect", '{"a":1}', 0], ["șir", '"str"', 0], ["JSON invalid", "{{", 0], ["id-uri străine", '["nu-exista", 7, null]', 0]]) {
  const {browser, ctx, page, st} = await launch({w: 390, h: 800});
  await page.addInitScript(x => { try { localStorage.setItem("dff_explored", x); } catch (e) {} }, v);
  await page.reload(); await page.waitForTimeout(1200);
  const txt = await page.evaluate(() => (document.getElementById("explored") || {}).textContent || "");
  check(`explored=${nume}: 0 erori`, st.errs.length === 0, st.errs);
  check(`explored=${nume}: contor ${asteptat}, fără «undefined»`, !/undefined|NaN/.test(txt) && new RegExp(": " + asteptat + " /").test(txt), txt);
  await browser.close();
}
{
  const {browser, page} = await launch({w: 390, h: 800});
  await page.waitForTimeout(1500);
  const small = await page.evaluate(() => [...document.querySelectorAll("button,select,input:not([type=hidden]),#app-version")]
    .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 43.5; }).map(e => e.id || e.className));
  check("butoane/câmpuri vizibile ≥44px înălțime la 390px", small.length === 0, small);
  await browser.close();
}
summary();
