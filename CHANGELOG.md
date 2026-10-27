# Jurnal de modificări

## 2.2.0 — 2026-10-27 (anterior: v2.1.0)

Recenzie 2 (2026-10-27).

### Implementat
- Statistici locale victorii / remize / înfrângeri contra AI, pe variantă și pe nivel, în `localStorage` (cu try/catch), afișate sub tablă; texte RO+EN (celelalte limbi folosesc textul EN). Nu se numără jocul în doi, online, turneul și exercițiile.
- Test nou `tests/statistici.test.mjs` (9 verificări).
- Test nou `tests/niveluri-sim.test.mjs`: simulare AI-vs-AI, N=50 pe pereche (englez/rus/brazilian, culori alternate). Mediu vs Ușor: 50–0 (z=7,07); Avansat vs Ușor: 49–0, 1 remiză (z=7). Nivelurile existente diferă real; testul nu a fost extins la toate variantele.

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
