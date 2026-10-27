// DAME FĂRĂ FRONTIERE 2.1.0 — «Surse și verificare»: cele 16 variante ⚠, surse reale sau „de completat”, fără a declara nimic „verificat”.
// Rulare: node tests/surse.test.mjs
import {readFileSync} from "node:fs";
import {launch, check, summary, INDEX} from "./_lib.mjs";

const src = readFileSync(INDEX, "utf8");
const data = src.slice(src.indexOf("var DATA = ["), src.indexOf("var DTX="));
const approx = [...data.matchAll(/\{id:"([a-z-]+)", t:"[^"]*"[^\n]*?approx:true/g)].map(m => m[1]).sort();
check("în cod sunt exact 16 variante cu approx:true", approx.length === 16, approx);

const {browser, page, st} = await launch({reducedMotion: "reduce"});
await page.waitForTimeout(1500);
console.log("1. dialogul «Despre acest atlas»");
await page.click("#aboutbtn");
await page.waitForSelector("#amodal.open, #amodal[open], #amodal.show", {timeout: 5000}).catch(() => {});
const items = await page.locator("#asrclist li").allInnerTexts();
check("lista din «Despre» are 16 elemente", items.length === 16, items.length);
const head = await page.textContent("#asrch");
check("titlul spune 16 variante marcate ⚠", /16/.test(head) && /⚠/.test(head), head);
const withLink = await page.locator("#asrclist li a[href^='https://']").count();
const todo = await page.locator("#asrclist li:not(:has(a))").count();
check("fiecare element are un link real sau «de completat» (nimic inventat)", withLink + todo === 16 && withLink >= 6 && todo >= 8, {withLink, todo});
const hrefs = await page.locator("#asrclist li a").evaluateAll(as => as.map(a => a.href));
check("linkurile sunt https, cu rel=noopener", hrefs.every(h => h.startsWith("https://")) && (await page.locator("#asrclist a:not([rel~='noopener'])").count()) === 0, hrefs);
check("textul explicativ nu declară nicio variantă «verificată»", /nu declară nicio variantă/.test(await page.locator("[data-i18n='ui.aP16']").innerText()));
await page.keyboard.press("Escape");
await page.waitForTimeout(200);

console.log("2. fișa unei variante ⚠");
await page.evaluate(() => document.querySelector('[data-id="frisian"]').click());
await page.waitForTimeout(200);
const fr = await page.textContent("#vsrc");
check("frizona: sursa oficială frisiandraughts.com + nota ⚠", /frisiandraughts\.com/.test(fr) && /aproximativă/.test(fr), fr);
await page.keyboard.press("Escape");
await page.evaluate(() => document.querySelector('[data-id="croda"]').click());
await page.waitForTimeout(200);
const cr = await page.textContent("#vsrc");
check("Croda: «de completat», fără link", /de completat/.test(cr) && (await page.locator("#vsrc a").count()) === 0, cr);
await page.keyboard.press("Escape");
await page.evaluate(() => document.querySelector('[data-id="italian"]').click());
await page.waitForTimeout(200);
check("italiana: sursa FID e marcată ca doar regulament de competiție", /doar regulamentul de competiție/.test(await page.textContent("#vsrc")));
await page.keyboard.press("Escape");
await page.evaluate(() => document.querySelector('[data-id="english"]').click());
await page.waitForTimeout(200);
check("varianta neaproximativă fără sursă nu afișează secțiunea", (await page.textContent("#vsrc")).trim() === "");
await page.keyboard.press("Escape");

console.log("3. limbi");
await Promise.all([page.waitForNavigation({waitUntil: "load"}), page.selectOption("#langsel", "en")]); // schimbarea limbii reîncarcă pagina
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelector('[data-id="croda"]').click());
await page.waitForTimeout(300);
check("în engleză: «to be completed»", /to be completed/.test(await page.textContent("#vsrc")), await page.textContent("#vsrc"));
check("0 erori de pagină/CSP și 0 cereri de rețea", st.errs.length === 0 && st.net.length === 0, [st.errs, st.net]);
await browser.close();
summary();
