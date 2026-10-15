# CAST — ένα σχέδιο = ένα πρόσωπο (PLAN-K2.md)
Every NAMED person has exactly one design, used in every episode and for nobody else. Add a row with every new person.
Generic figures (villager, citizen, minister, soldier…) must not look like anyone below; inside one episode one generic
design = one role.

| person | function | signature (≥2) | episodes |
|---|---|---|---|
| Ελευθέριος Βενιζέλος | `V()` / `chars.venizelos` | bald · round glasses · short white beard | enotita-04 (k1-g4) |
| Κωνσταντίνος Α΄ | `K()` / `chars.konstantinos` | peaked cap with crown · big upturned moustache | enotita-04 (k1-g4) |
| Όθων | `P.otto` (props.mjs) | crown · fustanella · brown moustache | k2-b1, k2-b3 |
| Δημήτριος Βούλγαρης | `CH.voulgaris` | τζουμπές (long dark robe, fur trim) · red fez · big WHITE moustache | k2-b4 |
| Δημήτριος Γρίβας | `CH.grivas` | officer: gold epaulettes + sabre · red sash · big BLACK moustache · kepi | k2-b4 |
| Επαμεινώνδας Δεληγιώργης | `CH.deligiorgis` | full BLACK beard · balding (side hair) · black cravat | k2-b4 |
| Γεώργιος Α΄ | `CH.georgeI` | crown · BLOND hair + moustache · navy uniform with epaulettes · blue-white sash | k2-b4 |
| Χαρίλαος Τρικούπης | `CH.trikoupis` | thick BLACK moustache, no beard · black frock coat, white vest, bow tie · no hat | k2-b4 |
| Αλέξανδρος Κουμουνδούρος | `CH.koumoundouros` | GREY short hair, no hat · big WHITE moustache + white chin TUFT · black coat, white shirt-front, black bow tie | k2-b3 |
| Ιωάννης Κωλέττης | `CH.kolettis` | BLACK tall fez (Paris 1842 photo — his red fez of the oil portrait is Βούλγαρης's signature) · big BLACK upturned moustache · bordeaux FUR-trimmed coat over fustanella + white-red order sash with star | k2-b2 |

⚠️ Known violations to fix (PLAN-K2.md): k1-g4 S10 (Venizelos via P.person) · k2-b1 S21/S22 (one P.minister for two roles).
⚠️ The red fez is Βούλγαρης's signature. Generic `P.shipowner` / `P.armatolos` / `P.partyMan(…,'fr')` default to a red
fez — in any episode where Βούλγαρης appears, override (`hatC`) as k2-b4 S19 does, or a supporter reads as him.
⚠️ `P.armatolos` (fustanella + fez + big moustache) reads as Κωλέττης even with a dark fez (k2-b2 reviewer) — in any episode with
Κωλέττης use a plain generic (k2-b2 `thug()`: coat + vraka, bare head, goatee) instead.
