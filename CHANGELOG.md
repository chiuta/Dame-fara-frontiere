# Jurnal de modificări

## 2.3.2 — 2026-11-17

- Compatibilitate cu browsere mai vechi (Chrome/Edge 55+, Firefox 52+, Safari 10.1+/iOS 10.3+): kitul 1.8.0 aduce stratul de compatibilitate (rezerve pentru API-urile care lipsesc în motoarele vechi), iar sintaxa JavaScript mai nouă decât ES2017 a fost înlocuită cu forme echivalente acolo unde exista; expresiile regulate noi și `import()` trec prin rezerve. Fără modificări de funcționalitate intenționate. Verificat cu parser ES2017 și într-un motor vechi simulat, nu pe dispozitive reale.

## 2.3.1 — 2026-11-15

- Nou: butoane de distribuire pe rețele sociale (vertical, pe marginea din stânga; fără scripturi externe, doar linkuri deschise la clic); bara de zoom cu lupă și „potrivire ecran” revine pe marginea din dreapta, centrată pe verticală; corectat afișarea suprapusă la zoom mare (panourile cu înălțimi în vh/vw nu mai ies din ecran).

## 2.3.0 — 2026-11-15

- Nou: accesibilitate pe toate ecranele — butonul „Aa” (mărimea textului, contrast ridicat, fără animații, text lizibil, linkuri subliniate, citire cu voce), săgeata „Înapoi sus” și „Sari la conținut”; fereastra se potrivește mereu ecranului; zoom-ul cu lupă și „potrivire ecran” stau acum pe marginea din stânga (fff-kit 1.6.0).

## 2.2.8 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 2.2.1 — 2026-11-03

Stratul comun de jocuri (TBL) vine acum dintr-o singură sursă din hub, nu mai e lipit de mână

## 2.2.0 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.2.0 — 2026-10-27 (anterior: v2.1.0)

Recenzie 2 (2026-10-27).

### Implementat
- Statistici locale victorii / remize / înfrângeri contra AI, pe variantă și pe nivel, în `localStorage` (cu try/catch), afișate sub tablă; texte RO+EN (celelalte limbi folosesc textul EN). Nu se numără jocul în doi, online, turneul și exercițiile.
- Test nou `tests/statistici.test.mjs` (9 verificări).
- Test nou `tools/niveluri-sim.mjs`: simulare AI-vs-AI, N=50 pe pereche (englez/rus/brazilian, culori alternate). Mediu vs Ușor: 50–0 (z=7,07); Avansat vs Ușor: 49–0, 1 remiză (z=7). Nivelurile existente diferă real; testul nu a fost extins la toate variantele.

### Neimplementat și de ce
- Reguli noi sau surse pentru variantele ⚠: neschimbate; nu s-au putut verifica din ≥2 surse în această rundă, deci nu au fost inventate.
- Statistici comune între jocuri: neimplementate (aplicații separate, izolate).

## 2.1.0 — 2026-10-27 (anterior: v2.0.0)

Recenzie 2026-10-27.

### Implementat
- Surse reale pentru variantele cu reguli oficiale (FMJD, frisiandraughts.com, FID/CONI, Wikipedia pentru Dameo/Lasca/Cheskers/Damath), afișate în fișa variantei.
- Lista celor 16 variante marcate ⚠ în dialogul «Despre», cu sursă sau «sursă de completat»; NU sunt prezentate ca verificate.
- Remediere: limba aleasă se păstrează după reîncărcare.
- Test nou `tests/surse.test.mjs` (12 verificări).

### Neimplementat și de ce
- Surse pentru variantele ⚠ fără sursă verificată: rămân «de completat»; nu au fost inventate.
- AI cu niveluri de dificultate: neimplementat în această rundă (necesită calibrare și teste dedicate pe motorul jocului).
- Statistici comune între jocuri: neimplementat (ar cere un spațiu de stocare partajat între aplicații separate, contrar izolării actuale).
- Mod multiplayer local unificat între jocuri: **planificat**, NU acum; jocurile rămân separate.
