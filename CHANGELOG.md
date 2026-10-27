# Jurnal de modificări

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
