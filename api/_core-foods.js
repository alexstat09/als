// ════════════════════════════════════════════════════════════════
// Verified CORE food database — the staples you actually eat, baked in so they
// are ALWAYS instant, correct and reachable (no dependency on USDA/OFF uptime).
// Values are per 100 g, from USDA Standard Reference / canonical references.
// `alias` adds extra search terms (synonyms, Greek names). `s` = a sensible
// default serving in grams. food-search.js matches these first and ranks them
// above everything else. Underscore filename → not a route, just a require.
// ════════════════════════════════════════════════════════════════
'use strict';

// name, alias, kcal, p, c, f, [fiber, sugar, sodium, satfat], s(serving g)
module.exports = [
  // ── Poultry / meat ──────────────────────────────────────────────
  { name: 'Chicken breast, raw', alias: 'chicken fillet στήθος κοτόπουλο', kcal: 114, p: 21.2, c: 0, f: 2.6, sodium: 45, satfat: 0.6, s: 150 },
  { name: 'Chicken breast, cooked', alias: 'grilled roasted chicken κοτόπουλο', kcal: 165, p: 31, c: 0, f: 3.6, sodium: 74, satfat: 1, s: 150 },
  { name: 'Chicken thigh, cooked', alias: 'chicken μπούτι κοτόπουλο', kcal: 209, p: 26, c: 0, f: 10.9, sodium: 88, satfat: 3, s: 120 },
  { name: 'Turkey breast, cooked', alias: 'γαλοπούλα', kcal: 135, p: 30, c: 0, f: 1, sodium: 60, satfat: 0.3, s: 120 },
  { name: 'Ground beef, cooked', alias: 'minced mince beef κιμάς μοσχάρι', kcal: 254, p: 25.7, c: 0, f: 16, sodium: 72, satfat: 6.3, s: 150 },
  { name: 'Beef steak, cooked', alias: 'μοσχάρι μπριζόλα', kcal: 217, p: 26, c: 0, f: 12, sodium: 55, satfat: 4.6, s: 150 },
  { name: 'Pork chop, cooked', alias: 'χοιρινό μπριζόλα', kcal: 231, p: 26, c: 0, f: 13, sodium: 62, satfat: 4.7, s: 150 },
  { name: 'Bacon, cooked', alias: 'μπέικον', kcal: 541, p: 37, c: 1.4, f: 42, sodium: 1717, satfat: 14, s: 30 },
  { name: 'Lamb, cooked', alias: 'αρνί', kcal: 294, p: 25, c: 0, f: 21, sodium: 72, satfat: 9, s: 150 },

  // ── Fish / seafood ──────────────────────────────────────────────
  { name: 'Salmon, raw', alias: 'σολομός', kcal: 208, p: 20, c: 0, f: 13, sodium: 59, satfat: 3.1, s: 150 },
  { name: 'Salmon, cooked', alias: 'σολομός', kcal: 206, p: 22, c: 0, f: 12, sodium: 61, satfat: 3, s: 150 },
  { name: 'Tuna, canned in water', alias: 'τόνος κονσέρβα geisha', kcal: 116, p: 26, c: 0, f: 0.8, sodium: 247, satfat: 0.2, s: 100 },
  { name: 'Sea bass, cooked', alias: 'λαβράκι', kcal: 124, p: 23, c: 0, f: 2.6, sodium: 80, satfat: 0.6, s: 150 },
  { name: 'Sea bream, cooked', alias: 'τσιπούρα', kcal: 130, p: 23, c: 0, f: 4, sodium: 80, satfat: 1, s: 150 },
  { name: 'Cod, cooked', alias: 'μπακαλιάρος', kcal: 105, p: 23, c: 0, f: 0.9, sodium: 78, satfat: 0.2, s: 150 },
  { name: 'Shrimp, cooked', alias: 'prawns γαρίδες', kcal: 99, p: 24, c: 0.2, f: 0.3, sodium: 111, satfat: 0.1, s: 100 },
  { name: 'Sardines, canned', alias: 'σαρδέλες', kcal: 208, p: 25, c: 0, f: 11, sodium: 307, satfat: 1.5, s: 90 },
  { name: 'Octopus, cooked', alias: 'χταπόδι', kcal: 164, p: 30, c: 4.4, f: 2.1, sodium: 391, satfat: 0.5, s: 100 },

  // ── Eggs / dairy ────────────────────────────────────────────────
  { name: 'Egg, whole', alias: 'eggs αυγό αυγά', kcal: 143, p: 12.6, c: 0.7, f: 9.5, sugar: 0.4, sodium: 142, satfat: 3.1, s: 50 , u: 'egg', us: 50 },
  { name: 'Egg white', alias: 'ασπράδι αυγού', kcal: 52, p: 10.9, c: 0.7, f: 0.2, sodium: 166, s: 33 },
  { name: 'Greek yogurt, 2% plain', alias: 'γιαούρτι fage total', kcal: 73, p: 9.5, c: 3.9, f: 1.9, sugar: 3.9, sodium: 36, satfat: 1.2, s: 170 },
  { name: 'Greek yogurt, 0% plain', alias: 'γιαούρτι fat free total fage galpo lidl 0%', kcal: 59, p: 10.3, c: 3.6, f: 0.4, sugar: 3.2, sodium: 36, s: 170 },
  { name: 'Greek yogurt, full fat', alias: 'γιαούρτι στραγγιστό', kcal: 97, p: 9, c: 4, f: 5, sugar: 4, sodium: 35, satfat: 3.3, s: 170 },
  { name: 'Cottage cheese, 2%', alias: 'cottage', kcal: 84, p: 11, c: 4.3, f: 2.3, sugar: 4.1, sodium: 330, satfat: 1.4, s: 150 },
  { name: 'Milk, semi-skimmed', alias: '2% γάλα ημίπαχο', kcal: 50, p: 3.4, c: 4.8, f: 2, sugar: 4.8, sodium: 44, satfat: 1.3, s: 250 },
  { name: 'Milk, whole', alias: 'γάλα πλήρες', kcal: 64, p: 3.2, c: 4.8, f: 3.6, sugar: 4.8, sodium: 43, satfat: 2.3, s: 250 },
  { name: 'Feta cheese', alias: 'φέτα', kcal: 265, p: 14, c: 4, f: 21, sugar: 4, sodium: 1140, satfat: 15, s: 50 },
  { name: 'Halloumi cheese', alias: 'χαλούμι', kcal: 321, p: 21, c: 2.2, f: 25, sodium: 1350, satfat: 17, s: 50 },
  { name: 'Cheddar cheese', alias: 'cheese τυρί', kcal: 403, p: 25, c: 1.3, f: 33, sodium: 621, satfat: 21, s: 30 },
  { name: 'Mozzarella cheese', alias: 'μοτσαρέλα', kcal: 280, p: 28, c: 3.1, f: 17, sodium: 627, satfat: 10, s: 30 },
  { name: 'Parmesan cheese', alias: 'παρμεζάνα parmigiano reggiano regiano grana padano italiano aldi selection milbona', kcal: 431, p: 38, c: 4.1, f: 29, sodium: 1529, satfat: 19, s: 15 },
  { name: 'Butter', alias: 'βούτυρο', kcal: 717, p: 0.9, c: 0.1, f: 81, sodium: 11, satfat: 51, s: 10 },

  // ── Protein supplements / plant protein ─────────────────────────
  { name: 'Whey protein powder', alias: 'protein shake πρωτεΐνη', kcal: 400, p: 80, c: 8, f: 6, sugar: 5, sodium: 250, satfat: 2, s: 30 },
  { name: 'Tofu, firm', alias: 'τόφου', kcal: 144, p: 17, c: 3, f: 8, fiber: 2, sodium: 14, satfat: 1, s: 100 },
  { name: 'Lentils, cooked', alias: 'φακές', kcal: 116, p: 9, c: 20, f: 0.4, fiber: 8, sodium: 2, s: 200 },
  { name: 'Lentils, dry', alias: 'φακές ξερές dry lentils', kcal: 352, p: 24.6, c: 63, f: 1.1, fiber: 10.7, sodium: 6, s: 60 },
  { name: 'Chickpeas, cooked', alias: 'ρεβίθια', kcal: 164, p: 8.9, c: 27, f: 2.6, fiber: 7.6, sodium: 7, s: 200 },
  { name: 'White beans, cooked', alias: 'φασόλια', kcal: 142, p: 9.7, c: 25, f: 0.4, fiber: 6.3, sodium: 2, s: 200 },

  // ── Grains / starches ───────────────────────────────────────────
  { name: 'White rice, cooked', alias: 'ρύζι ριζι άσπρο basmati μπασμάτι jasmine rice', kcal: 130, p: 2.7, c: 28, f: 0.3, fiber: 0.4, sodium: 1, s: 150 },
  { name: 'White rice, dry', alias: 'ρύζι basmati μπασμάτι', kcal: 365, p: 7, c: 80, f: 0.7, fiber: 1.3, sodium: 5, s: 75 },
  { name: 'Brown rice, cooked', alias: 'ρύζι καστανό', kcal: 123, p: 2.7, c: 26, f: 1, fiber: 1.6, sodium: 4, s: 150 },
  { name: 'Oats, rolled dry', alias: 'oatmeal βρώμη πλιγούρι nutri valley', kcal: 389, p: 16.9, c: 66, f: 6.9, fiber: 10.6, sodium: 2, s: 50 },
  { name: 'Pasta, cooked', alias: 'ζυμαρικά μακαρόνια', kcal: 158, p: 5.8, c: 31, f: 0.9, fiber: 1.8, sodium: 1, s: 180 },
  { name: 'Pasta, dry', alias: 'ζυμαρικά μακαρόνια', kcal: 371, p: 13, c: 75, f: 1.5, fiber: 3.2, sodium: 6, s: 80 },
  { name: 'Bread, white', alias: 'ψωμί άσπρο italian bread d italiano', kcal: 265, p: 9, c: 49, f: 3.2, fiber: 2.7, sugar: 5, sodium: 491, s: 30 , u: 'slice', us: 30 },
  { name: 'Bread, whole wheat', alias: 'ψωμί ολικής', kcal: 247, p: 13, c: 41, f: 3.4, fiber: 7, sugar: 6, sodium: 450, s: 30 , u: 'slice', us: 30 },
  { name: 'Pita bread', alias: 'πίτα πίτα ψητή λαδωτή σουβλάκι αλαδωτη', kcal: 275, p: 9, c: 55, f: 1.2, fiber: 2.2, sodium: 536, s: 60 , u: 'pita', us: 60 },
  { name: 'Couscous, cooked', alias: 'κουσκούς', kcal: 112, p: 3.8, c: 23, f: 0.2, fiber: 1.4, sodium: 5, s: 150 },
  { name: 'Quinoa, cooked', alias: 'κινόα', kcal: 120, p: 4.4, c: 21, f: 1.9, fiber: 2.8, sodium: 7, s: 150 },
  { name: 'Potato, boiled', alias: 'πατάτα βραστή', kcal: 87, p: 1.9, c: 20, f: 0.1, fiber: 1.8, sodium: 4, s: 200 },
  { name: 'Potato, raw', alias: 'πατάτα', kcal: 77, p: 2, c: 17, f: 0.1, fiber: 2.2, sodium: 6, s: 200 },
  { name: 'Sweet potato, baked', alias: 'γλυκοπατάτα', kcal: 90, p: 2, c: 21, f: 0.1, fiber: 3.3, sugar: 6.5, sodium: 36, s: 150 },
  { name: 'French fries', alias: 'τηγανητές πατάτες chips five guys fries', kcal: 312, p: 3.4, c: 41, f: 15, fiber: 3.8, sodium: 210, satfat: 2.3, s: 150 },

  // ── Fruit ───────────────────────────────────────────────────────
  { name: 'Banana', alias: 'μπανάνα', kcal: 89, p: 1.1, c: 23, f: 0.3, fiber: 2.6, sugar: 12, sodium: 1, s: 120 , u: 'banana', us: 120 },
  { name: 'Apple', alias: 'μήλο', kcal: 52, p: 0.3, c: 14, f: 0.2, fiber: 2.4, sugar: 10, sodium: 1, s: 180 , u: 'apple', us: 180 },
  { name: 'Orange', alias: 'πορτοκάλι', kcal: 47, p: 0.9, c: 12, f: 0.1, fiber: 2.4, sugar: 9, sodium: 0, s: 150 },
  { name: 'Strawberries', alias: 'φράουλες', kcal: 32, p: 0.7, c: 7.7, f: 0.3, fiber: 2, sugar: 4.9, sodium: 1, s: 150 },
  { name: 'Grapes', alias: 'σταφύλι', kcal: 69, p: 0.7, c: 18, f: 0.2, fiber: 0.9, sugar: 16, sodium: 2, s: 120 },
  { name: 'Watermelon', alias: 'καρπούζι', kcal: 30, p: 0.6, c: 7.6, f: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1, s: 200 },
  { name: 'Dates', alias: 'χουρμάδες medjool', kcal: 277, p: 1.8, c: 75, f: 0.2, fiber: 6.7, sugar: 66, sodium: 1, s: 24 },
  { name: 'Blueberries', alias: 'μύρτιλα', kcal: 57, p: 0.7, c: 14, f: 0.3, fiber: 2.4, sugar: 10, sodium: 1, s: 100 },

  // ── Nuts / fats ─────────────────────────────────────────────────
  { name: 'Olive oil', alias: 'extra virgin ελαιόλαδο λάδι', kcal: 884, p: 0, c: 0, f: 100, sodium: 2, satfat: 14, s: 14 },
  { name: 'Almonds', alias: 'αμύγδαλα', kcal: 579, p: 21, c: 22, f: 50, fiber: 12.5, sugar: 4.4, sodium: 1, s: 28 },
  { name: 'Walnuts', alias: 'καρύδια', kcal: 654, p: 15, c: 14, f: 65, fiber: 6.7, sugar: 2.6, sodium: 2, s: 28 },
  { name: 'Peanuts', alias: 'φιστίκια αράπικα', kcal: 567, p: 26, c: 16, f: 49, fiber: 8.5, sugar: 4, sodium: 18, s: 28 },
  { name: 'Peanut butter', alias: 'φυστικοβούτυρο', kcal: 588, p: 25, c: 20, f: 50, fiber: 6, sugar: 9, sodium: 17, satfat: 10, s: 32 },
  { name: 'Tahini', alias: 'ταχίνι', kcal: 595, p: 17, c: 21, f: 54, fiber: 9.3, sodium: 35, s: 30 },
  { name: 'Avocado', alias: 'αβοκάντο', kcal: 160, p: 2, c: 9, f: 15, fiber: 6.7, sugar: 0.7, sodium: 7, s: 100 },

  // ── Vegetables ──────────────────────────────────────────────────
  { name: 'Tomato', alias: 'ντομάτα', kcal: 18, p: 0.9, c: 3.9, f: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, s: 120 },
  { name: 'Cucumber', alias: 'αγγούρι', kcal: 15, p: 0.7, c: 3.6, f: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2, s: 100 },
  { name: 'Lettuce', alias: 'μαρούλι', kcal: 15, p: 1.4, c: 2.9, f: 0.2, fiber: 1.3, sodium: 28, s: 50 },
  { name: 'Spinach', alias: 'σπανάκι', kcal: 23, p: 2.9, c: 3.6, f: 0.4, fiber: 2.2, sodium: 79, s: 100 },
  { name: 'Broccoli', alias: 'μπρόκολο', kcal: 34, p: 2.8, c: 7, f: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, s: 100 },
  { name: 'Onion', alias: 'κρεμμύδι', kcal: 40, p: 1.1, c: 9, f: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4, s: 80 },
  { name: 'Bell pepper', alias: 'πιπεριά red bell pepper paprika πάπρικα κόκκινη', kcal: 31, p: 1, c: 6, f: 0.3, fiber: 2.1, sugar: 4.2, sodium: 4, s: 100 },
  { name: 'Carrot', alias: 'καρότο', kcal: 41, p: 0.9, c: 10, f: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69, s: 80 },
  { name: 'Zucchini', alias: 'κολοκύθι', kcal: 17, p: 1.2, c: 3.1, f: 0.3, fiber: 1, sugar: 2.5, sodium: 8, s: 120 },
  { name: 'Eggplant', alias: 'μελιτζάνα', kcal: 25, p: 1, c: 6, f: 0.2, fiber: 3, sugar: 3.5, sodium: 2, s: 120 },
  { name: 'Green beans', alias: 'φασολάκια πλατιά flat κατεψυγμένα αινος', kcal: 31, p: 1.8, c: 7, f: 0.2, fiber: 2.7, sugar: 3.3, sodium: 6, s: 150 },
  { name: 'Mushrooms', alias: 'μανιτάρια', kcal: 22, p: 3.1, c: 3.3, f: 0.3, fiber: 1, sodium: 5, s: 100 },
  { name: 'Olives', alias: 'ελιές kalamata', kcal: 115, p: 0.8, c: 6, f: 11, fiber: 3.2, sodium: 1556, satfat: 1.4, s: 30 },

  // ── Greek / prepared (typical values; use AI Describe for precision) ──
  { name: 'Tzatziki', alias: 'τζατζίκι', kcal: 100, p: 3, c: 4, f: 8, sodium: 320, satfat: 3, s: 60 },
  { name: 'Hummus', alias: 'χούμους', kcal: 166, p: 8, c: 14, f: 10, fiber: 6, sodium: 379, s: 60 },
  { name: 'Pork gyros, meat', alias: 'γύρος χοιρινό', kcal: 215, p: 18, c: 3, f: 14, sodium: 600, satfat: 5, s: 150 },
  { name: 'Chicken gyros, meat', alias: 'γύρος κοτόπουλο', kcal: 175, p: 22, c: 2, f: 9, sodium: 520, satfat: 2.5, s: 150 },
  { name: 'Pork souvlaki, cooked', alias: 'σουβλάκι καλαμάκι χοιρινό', kcal: 195, p: 27, c: 1, f: 9, sodium: 380, satfat: 3, s: 100 },
  { name: 'Greek salad, dressed', alias: 'χωριάτικη σαλάτα', kcal: 110, p: 3, c: 5, f: 9, fiber: 1.5, sodium: 420, s: 200 },
  { name: 'Spanakopita', alias: 'σπανακόπιτα σπανακοπιτάκια', kcal: 254, p: 6, c: 22, f: 16, fiber: 1.8, sodium: 480, satfat: 6, s: 120 },
  { name: 'Honey', alias: 'μέλι', kcal: 304, p: 0.3, c: 82, f: 0, sugar: 82, sodium: 4, s: 21 },

  // ════════════════════════════════════════════════════════════════
  // Expansion 2026-06-17 — built from Alex's real MFP recents + saved
  // meals. Branded items he eats by name + GENERIC catch-alls per
  // category, so even an unseen brand lands on a close, correct hit.
  // ════════════════════════════════════════════════════════════════

  // ── Chocolate / sweets / candy (his biggest lane) ───────────────
  { name: 'Milk chocolate', alias: 'σοκολάτα γάλακτος lacta chocolate σοκολατένιο αυγό chocolate egg', kcal: 535, p: 7.6, c: 59, f: 30, sugar: 52, sodium: 79, satfat: 18, s: 25 },
  { name: 'Dark chocolate, 70-85%', alias: 'σοκολάτα υγείας μαύρη bitter dark chocolate elmer', kcal: 598, p: 7.8, c: 46, f: 43, fiber: 11, sugar: 24, sodium: 20, satfat: 24, s: 20 },
  { name: 'ION dark chocolate w/ almonds 72%', alias: 'ion σοκολάτα υγείας αμυγδάλου super fruits', kcal: 597, p: 8, c: 40, f: 45, fiber: 9, sugar: 28, sodium: 15, satfat: 22, s: 15 },
  { name: 'Chocolate wafer bar', alias: 'γκοφρέτα koukouroukou wafer καουα banofee lacta', kcal: 537, p: 6, c: 63, f: 29, sugar: 40, sodium: 90, satfat: 18, s: 20 , u: 'bar', us: 20 },
  { name: 'Kinder Bueno', alias: 'kinder bueno σοκολάτα', kcal: 565, p: 8.6, c: 49.5, f: 37, sugar: 40, sodium: 120, satfat: 19, s: 21 },
  { name: 'Ferrero Rocher', alias: 'rocher ferrero', kcal: 585, p: 8, c: 46, f: 41, sugar: 41, sodium: 50, satfat: 13, s: 13 },
  { name: 'Lotus Biscoff cookies', alias: 'biscoff lotus speculoos μπισκότα', kcal: 484, p: 3.9, c: 72, f: 19.5, sugar: 38, sodium: 350, satfat: 9, s: 13 , u: 'cookie', us: 6.3 },
  { name: 'Speculoos / Biscoff spread', alias: 'speculoos speculoso lidl άλειμμα', kcal: 568, p: 4, c: 58, f: 35, sugar: 49, sodium: 380, satfat: 12, s: 20 },
  { name: 'Oreo cookies', alias: 'oreo oreos μπισκότα', kcal: 480, p: 4.3, c: 71, f: 20, sugar: 38, sodium: 380, satfat: 6, s: 34 , u: 'cookie', us: 11.3 },
  { name: 'Marzipan', alias: 'marzipan αμυγδαλόπαστα biermann', kcal: 470, p: 9, c: 50, f: 26, sugar: 45, sodium: 10, satfat: 2.5, s: 15 },
  { name: 'Gummy candy', alias: 'haribo starmix ζελεδάκια gummy bears καραμέλες', kcal: 343, p: 6.9, c: 77, f: 0.5, sugar: 47, sodium: 30, s: 25 },
  { name: 'Cupcake', alias: 'cupcake κεϊκάκι muffin', kcal: 349, p: 3.5, c: 50, f: 15, sugar: 32, sodium: 280, satfat: 5, s: 50 },
  { name: 'Chocolate chip cookie', alias: 'cookie μπισκότο choc chip cookies', kcal: 483, p: 5, c: 64, f: 23, sugar: 35, sodium: 320, satfat: 11, s: 30 , u: 'cookie', us: 30 },
  { name: 'Butter cookies', alias: 'biscotello μπισκότα βουτύρου cookies', kcal: 489, p: 6, c: 64, f: 22, sugar: 24, sodium: 300, satfat: 12, s: 30 },
  { name: 'Kormos (chocolate biscuit log)', alias: 'κορμός σπιτικός μωσαϊκό chocolate salami', kcal: 414, p: 5, c: 50, f: 21, sugar: 32, sodium: 120, satfat: 11, s: 50 , u: 'slice', us: 50 },
  { name: 'Granola', alias: 'γκρανόλα granola μούσλι muesli', kcal: 449, p: 10, c: 64, f: 17, fiber: 7, sugar: 18, sodium: 30, s: 40 },
  { name: 'Granola w/ dark chocolate', alias: 'γκρανόλα μαύρη σοκολάτα healthy habits', kcal: 455, p: 9, c: 62, f: 19, fiber: 7, sugar: 20, sodium: 40, s: 30 },
  { name: 'Chocolate brownie batter spread', alias: 'chocolate brownie batter per4m άλειμμα', kcal: 333, p: 12, c: 42, f: 13, sugar: 18, sodium: 120, satfat: 6, s: 15 },
  { name: 'Protein donut / cake (Per4m)', alias: 'cinnamon donut per4m protein ντόνατ κανέλα πρωτεΐνης', kcal: 352, p: 20, c: 45, f: 10, sugar: 8, sodium: 300, satfat: 4, s: 40 },
  { name: 'Peanut butter w/ dark chocolate', alias: 'φυστικοβούτυρο μαύρη σοκολάτα χαϊτογλου', kcal: 568, p: 18, c: 25, f: 44, fiber: 5, sugar: 18, sodium: 40, satfat: 11, s: 20 },
  { name: 'Almond butter', alias: 'αμυγδαλοβούτυρο almond butter healthy habits', kcal: 615, p: 21, c: 19, f: 55, fiber: 10, sugar: 4, sodium: 5, satfat: 4.5, s: 20 },
  { name: 'Chocolate chips / drops', alias: 'σταγόνες σοκολάτας choc drops rodmarnt couverture', kcal: 485, p: 5, c: 60, f: 25, sugar: 54, sodium: 20, satfat: 15, s: 30 },

  // ── Ice cream / gelato ──────────────────────────────────────────
  { name: 'Vanilla ice cream', alias: 'παγωτό βανίλια ice cream', kcal: 209, p: 3.5, c: 24, f: 11, sugar: 21, sodium: 80, satfat: 7, s: 100 },
  { name: 'Chocolate ice cream', alias: 'παγωτό σοκολάτα', kcal: 217, p: 3.8, c: 28, f: 10, sugar: 25, sodium: 76, satfat: 6, s: 100 },
  { name: 'Chocolate hazelnut gelato', alias: 'gelato bueno παγωτό σοκολάτα φουντούκι', kcal: 230, p: 4, c: 31, f: 10, sugar: 26, sodium: 60, satfat: 6, s: 80 },
  { name: 'Magnum ice cream bar', alias: 'magnum salted caramel almond παγωτό ξυλάκι', kcal: 287, p: 3.6, c: 30, f: 17, sugar: 27, sodium: 70, satfat: 11, s: 79 , u: 'bar', us: 79 },
  { name: 'Ice cream cone (wafer)', alias: 'χωνάκι παγωτού wafer cone soyumgood', kcal: 388, p: 8, c: 80, f: 4, sugar: 6, sodium: 250, s: 5 },

  // ── Protein snacks / supplements ────────────────────────────────
  { name: 'Protein bar', alias: 'μπάρα πρωτεΐνης protein bar', kcal: 353, p: 33, c: 35, f: 9, fiber: 6, sugar: 4, sodium: 250, s: 60 , u: 'bar', us: 60 },
  { name: 'Born Winner protein bar', alias: 'born winner protein bar strawberry cheesecake μπάρα', kcal: 347, p: 33, c: 36, f: 8, fiber: 5, sugar: 3, sodium: 220, s: 60 , u: 'bar', us: 60 },
  { name: 'Hungry Not protein bar', alias: 'hungry not protein bar sdoukos σδούκος μπάρα', kcal: 390, p: 40, c: 35, f: 10, fiber: 6, sugar: 3, sodium: 250, s: 50 , u: 'bar', us: 50 },
  { name: 'Protein drink mix powder', alias: 'ryse protein drink mix chocolate cookie blast σκόνη', kcal: 373, p: 70, c: 12, f: 5, sugar: 3, sodium: 250, s: 30 },
  { name: 'High-protein yogurt', alias: 'protein yogurt γιαούρτι πρωτεΐνης high protein snack', kcal: 81, p: 10, c: 8, f: 1, sugar: 6, sodium: 40, s: 200 },

  // ── Branded / Greek dairy ───────────────────────────────────────
  { name: 'Kri Kri Super Spoon yogurt', alias: 'super spoon kri kri γιαούρτι επιδόρπιο banana super fruits', kcal: 93, p: 8, c: 12, f: 1.5, sugar: 10, sodium: 40, satfat: 1, s: 170 },
  { name: 'Philadelphia cream cheese', alias: 'philadelphia τυρί κρέμα cream cheese', kcal: 245, p: 5.4, c: 4, f: 23, sugar: 3.5, sodium: 380, satfat: 14, s: 30 },
  { name: 'Philadelphia high-protein', alias: 'philadelphia extra protein τυρί κρέμα', kcal: 87, p: 10, c: 4, f: 3.5, sugar: 3, sodium: 360, satfat: 2.2, s: 40 },
  { name: 'Regato cheese', alias: 'regato classic ρεγκάτο τυρί kerrygold', kcal: 356, p: 25, c: 1, f: 28, sodium: 800, satfat: 18, s: 20 },
  { name: 'Kefalotyri cheese', alias: 'κεφαλοτύρι κεφαλογραβιέρα γραβιέρα', kcal: 389, p: 27, c: 0.5, f: 31, sodium: 1100, satfat: 20, s: 20 },
  { name: 'Kefir', alias: 'κεφίρ kefir κουκάκη', kcal: 61, p: 3.3, c: 4.5, f: 3.3, sugar: 4.5, sodium: 40, satfat: 2.1, s: 200 },
  { name: 'Milk, 1.5% (fresko)', alias: 'fresko gala olympos γάλα ημίπαχο 1.5', kcal: 46, p: 3.3, c: 4.8, f: 1.5, sugar: 4.8, sodium: 44, satfat: 0.9, s: 250 },

  // ── Cereal / breakfast ──────────────────────────────────────────
  { name: 'Chocolate cereal (Coco Pops)', alias: 'coco pops kellogg δημητριακά σοκολάτα cereal', kcal: 388, p: 4.5, c: 87, f: 2.5, fiber: 2, sugar: 35, sodium: 480, s: 30 },

  // ── Bread / Greek bakery ────────────────────────────────────────
  { name: 'Sourdough bread', alias: 'sourdough προζυμένιο ψωμί lidl', kcal: 245, p: 9, c: 47, f: 2, fiber: 3, sodium: 480, s: 60 , u: 'slice', us: 60 },
  { name: 'Rye sourdough bread', alias: 'σίτου σίκαλη προζύμι rye sourdough carrefour ψωμί', kcal: 247, p: 9, c: 47, f: 2.5, fiber: 6, sodium: 460, s: 50 , u: 'slice', us: 50 },
  { name: 'Koulouri Thessalonikis', alias: 'κουλούρι θεσσαλονίκης σουσάμι sesame bread ring σκλαβενίτης', kcal: 296, p: 10, c: 55, f: 4, fiber: 3, sodium: 450, s: 70 , u: 'piece', us: 70 },
  { name: 'Lagana bread', alias: 'λαγάνα σαρακοστιανό ψωμί', kcal: 299, p: 8, c: 60, f: 3, fiber: 2.5, sodium: 470, s: 60 },

  // ── Greek prepared / taverna dishes ─────────────────────────────
  { name: 'Pasta with mince (makaronia me kima)', alias: 'μακαρόνια με κιμά bolognese ζυμαρικά κιμάς', kcal: 149, p: 8, c: 18, f: 5, fiber: 1.5, sodium: 220, satfat: 2, s: 300 },
  { name: 'Chicken in tomato sauce (kokkinisto)', alias: 'κοτόπουλο κοκκινιστό chicken tomato sauce', kcal: 213, p: 18, c: 6, f: 13, sodium: 380, satfat: 3, s: 200 },
  { name: 'Cheese pie (tyropita)', alias: 'τυρόπιτα τυροπιτάκια cheese pie', kcal: 316, p: 9, c: 25, f: 20, fiber: 1.2, sodium: 520, satfat: 9, s: 120 },
  { name: 'Spinach & cheese pie (spanakotyropita)', alias: 'σπανακοτυρόπιτα spinach cheese pie', kcal: 229, p: 8, c: 20, f: 13, fiber: 2, sodium: 480, satfat: 6, s: 150 },
  { name: 'Chicken souvlaki, cooked', alias: 'σουβλάκι κοτόπουλο καλαμάκι chicken skewer αγγελακης', kcal: 166, p: 27, c: 1, f: 6, sodium: 380, satfat: 1.6, s: 100 },
  { name: 'Gyros pita wrap', alias: 'πιτόγυρο γύρος πίτα wrap σουβλάκι τυλιχτό πιτογυρο', kcal: 252, p: 11, c: 25, f: 12, fiber: 1.8, sodium: 600, satfat: 4, s: 280 },
  { name: 'Quiche Lorraine', alias: 'quiche lorraine κις', kcal: 368, p: 9, c: 20, f: 28, fiber: 1, sodium: 480, satfat: 13, s: 120 },
  { name: 'Calamari, raw', alias: 'καλαμάρι squid θράψαλο', kcal: 92, p: 15.6, c: 3.1, f: 1.4, sodium: 44, satfat: 0.4, s: 130 },
  { name: 'Fried calamari', alias: 'καλαμαράκια τηγανητά fried squid', kcal: 175, p: 15, c: 8, f: 9, sodium: 260, satfat: 2, s: 130 },

  // ── Meat (additional cuts / organ) ──────────────────────────────
  { name: 'Ground beef, 93% lean, raw', alias: 'κιμάς μοσχαρίσιος άπαχος lean mince raw', kcal: 152, p: 20, c: 0, f: 8, sodium: 66, satfat: 3.2, s: 130 },
  { name: 'Beef brizola, lean, raw', alias: 'μοσχαρίσια μπριζόλα flank steak άπαχη brizola chunked beef', kcal: 150, p: 21, c: 0, f: 7, sodium: 55, satfat: 2.8, s: 200 },
  { name: 'Veal liver, cooked', alias: 'συκώτι μοσχαρίσιο veal beef liver συκωτάκι', kcal: 192, p: 27, c: 4, f: 7, sodium: 80, satfat: 2.5, s: 150 },
  { name: 'Turkey bacon', alias: 'turkey bacon γαλοπούλα μπέικον ifantis ferrano', kcal: 130, p: 17, c: 2, f: 6, sodium: 1000, satfat: 1.8, s: 40 },
  { name: 'Roast turkey slices', alias: 'γαλοπούλα ψητή φέτες αγροικία turkey breast slices', kcal: 97, p: 18, c: 2, f: 1.5, sodium: 900, satfat: 0.5, s: 30 },

  // ── Egg (additional) ────────────────────────────────────────────
  { name: 'Egg yolk', alias: 'κρόκος αυγού egg yolk', kcal: 322, p: 16, c: 3.6, f: 27, sodium: 48, satfat: 9.5, s: 17 },

  // ── Fruit (additional) ──────────────────────────────────────────
  { name: 'Kiwi', alias: 'ακτινίδιο kiwi', kcal: 61, p: 1.1, c: 15, f: 0.5, fiber: 3, sugar: 9, sodium: 3, s: 75 , u: 'kiwi', us: 75 },
  { name: 'Pineapple', alias: 'ανανάς pineapple', kcal: 50, p: 0.5, c: 13, f: 0.1, fiber: 1.4, sugar: 10, sodium: 1, s: 100 },
  { name: 'Mandarin / clementine', alias: 'μανταρίνι mandarin clementine', kcal: 53, p: 0.8, c: 13, f: 0.3, fiber: 1.8, sugar: 11, sodium: 2, s: 80 },

  // ── Vegetables (additional) ─────────────────────────────────────
  { name: 'Garlic', alias: 'σκόρδο garlic', kcal: 149, p: 6.4, c: 33, f: 0.5, fiber: 2.1, sodium: 17, s: 5 },
  { name: 'Mixed vegetables (frozen blend)', alias: 'melange mexicain μεξικάνικα λαχανικά mixed frozen vegetables ardo', kcal: 56, p: 2.5, c: 10, f: 0.6, fiber: 3, sodium: 20, s: 100 },
  { name: 'Canned tomatoes', alias: 'ντομάτες κονσέρβα canned chopped tomatoes', kcal: 32, p: 1.3, c: 5, f: 0.3, fiber: 1.2, sugar: 4, sodium: 120, s: 250 },
  { name: 'Tomato paste', alias: 'πελτές ντομάτας tomato paste concentrate', kcal: 82, p: 4, c: 16, f: 0.5, fiber: 4, sugar: 12, sodium: 60, s: 15 },

  // ── Nuts (additional) ───────────────────────────────────────────
  { name: 'Brazil nuts', alias: 'βραζιλιάνικα καρύδια brazil nuts', kcal: 656, p: 14, c: 12, f: 66, fiber: 7.5, sugar: 2.3, sodium: 3, satfat: 15, s: 10 },
  { name: 'Hemp seeds', alias: 'σπόροι κάνναβης hemp seeds hearts', kcal: 553, p: 31.6, c: 8.7, f: 48.8, fiber: 4, sugar: 1.5, sodium: 5, satfat: 4.6, s: 10 },

  // ── Cocoa / baking ──────────────────────────────────────────────
  { name: 'Cocoa / cacao powder', alias: 'κακάο cocoa cacao powder σκόνη ion', kcal: 340, p: 20, c: 58, f: 13, fiber: 33, sugar: 2, sodium: 21, satfat: 7.8, s: 10 },

  // ── Pasta (additional) ──────────────────────────────────────────
  { name: 'Whole wheat pasta, dry', alias: 'ζυμαρικά ολικής penne integrale tortiglioni barilla μακαρόνια', kcal: 348, p: 13, c: 66, f: 2.5, fiber: 8, sodium: 6, s: 80 },

  // ── Condiments / sauces / extras ────────────────────────────────
  { name: 'Ketchup, zero sugar', alias: 'zero ketchup κέτσαπ χωρίς ζάχαρη pn', kcal: 24, p: 1, c: 5, f: 0, sugar: 2, sodium: 600, s: 20 },
  { name: 'Ketchup', alias: 'κέτσαπ ketchup', kcal: 110, p: 1.2, c: 26, f: 0.1, sugar: 22, sodium: 900, s: 20 },
  { name: 'Sweet chilli sauce, zero', alias: 'sweet chilli sauce γλυκιά τσίλι zero sugar', kcal: 18, p: 0.5, c: 4, f: 0, sugar: 2, sodium: 400, s: 30 },
  { name: 'Tomato basil pasta sauce', alias: 'basil sauce σάλτσα ντομάτας βασιλικός barilla basilico', kcal: 62, p: 1.5, c: 10, f: 1.8, sugar: 6, sodium: 400, satfat: 0.3, s: 100 },
  { name: 'Lemon', alias: 'λεμόνι lemon', kcal: 29, p: 1.1, c: 9, f: 0.3, fiber: 2.8, sugar: 2.5, sodium: 2, s: 30 },
  { name: 'Stock cube, prepared', alias: 'ζωμός κότας λαχανικών knorr κύβος bouillon broth', kcal: 6, p: 0.3, c: 0.8, f: 0.2, sodium: 350, s: 250 },

  // ── Fast food / eating out ──────────────────────────────────────
  { name: 'Cheeseburger', alias: 'cheeseburger μπέργκερ burger five guys', kcal: 266, p: 15, c: 20, f: 14, sodium: 480, satfat: 6, s: 150 },
  { name: 'Pizza', alias: 'pizza πίτσα', kcal: 266, p: 11, c: 33, f: 10, fiber: 2, sodium: 600, satfat: 4.5, s: 120 },
  { name: 'Chicken burrito', alias: 'chicken burrito chipotle μπουρίτο', kcal: 203, p: 11, c: 24, f: 7, fiber: 3, sodium: 480, satfat: 2.5, s: 430 },
  { name: 'Fried chicken (KFC-style)', alias: 'kfc fried chicken κοτόπουλο τηγανητό mighty bucket', kcal: 282, p: 20, c: 10, f: 18, sodium: 600, satfat: 4, s: 150 },

  // ── Drinks ──────────────────────────────────────────────────────
  { name: 'Energy drink, zero', alias: 'monster energy ultra zero ενεργειακό ποτό', kcal: 3, p: 0, c: 0.5, f: 0, sodium: 80, s: 500 },
  { name: 'Energy drink', alias: 'energy drink red bull ενεργειακό ποτό', kcal: 45, p: 0, c: 11, f: 0, sugar: 11, sodium: 40, s: 250 },

  // ════════════════════════════════════════════════════════════════
  // Expansion 2026-06-17 (session 3) — proactive supermarket + Greek-
  // cuisine sweep: the foods Alex is LIKELY to eat next based on his
  // profile (Greek teen, recomp, big sweet tooth, shops Lidl/Sklavenitis
  // /Carrefour/AB). Generic catch-alls per category. All kcal reconciled.
  // ════════════════════════════════════════════════════════════════

  // ── Cereal / breakfast ──────────────────────────────────────────
  { name: 'Corn flakes', alias: 'κορν φλέικς cornflakes δημητριακά kellogg', kcal: 357, p: 7.5, c: 84, f: 0.9, fiber: 3, sugar: 8, sodium: 660, s: 30 },
  { name: 'Muesli', alias: 'μούσλι muesli δημητριακά', kcal: 365, p: 10, c: 66, f: 6, fiber: 7, sugar: 16, sodium: 30, s: 45 },
  { name: 'Frosted flakes', alias: 'frosties δημητριακά ζάχαρη', kcal: 375, p: 4.5, c: 91, f: 0.6, fiber: 2, sugar: 37, sodium: 480, s: 30 },
  { name: 'Pancakes', alias: 'τηγανίτες pancakes', kcal: 227, p: 6, c: 28, f: 9, fiber: 1, sugar: 6, sodium: 380, satfat: 2, s: 80 },
  { name: 'Waffle', alias: 'βάφλα waffle', kcal: 291, p: 7, c: 33, f: 14, sugar: 8, sodium: 420, satfat: 3, s: 75 , u: 'waffle', us: 75 },
  { name: 'Croissant', alias: 'κρουασάν croissant', kcal: 406, p: 8, c: 46, f: 21, fiber: 2.6, sugar: 11, sodium: 470, satfat: 12, s: 60 },
  { name: 'Rice cakes', alias: 'ρυζογκοφρέτες rice cakes', kcal: 387, p: 8, c: 82, f: 3, fiber: 4, sodium: 30, s: 9 , u: 'cake', us: 9 },
  { name: 'Semolina, dry', alias: 'σιμιγδάλι semolina', kcal: 360, p: 12, c: 73, f: 1, fiber: 3.9, sodium: 1, s: 40 },

  // ── Cheese / dairy (additional) ─────────────────────────────────
  { name: 'Anthotyro / myzithra', alias: 'ανθότυρο μυζήθρα anthotyro greek whey cheese', kcal: 130, p: 11, c: 4, f: 8, sodium: 90, satfat: 5, s: 50 },
  { name: 'Graviera cheese', alias: 'γραβιέρα graviera τυρί', kcal: 405, p: 27, c: 1, f: 32, sodium: 700, satfat: 20, s: 30 },
  { name: 'Kasseri cheese', alias: 'κασέρι kasseri τυρί', kcal: 375, p: 25, c: 1, f: 30, sodium: 800, satfat: 19, s: 30 },
  { name: 'Gouda cheese', alias: 'γκούντα gouda edam τυρί', kcal: 356, p: 25, c: 2.2, f: 27, sodium: 819, satfat: 18, s: 30 },
  { name: 'Cream cheese', alias: 'τυρί κρέμα cream cheese', kcal: 342, p: 6, c: 5, f: 34, sugar: 3, sodium: 320, satfat: 20, s: 30 },
  { name: 'Ricotta cheese', alias: 'ρικότα ricotta', kcal: 174, p: 11, c: 3, f: 13, sugar: 0.3, sodium: 84, satfat: 8, s: 50 },
  { name: 'Sour cream', alias: 'ξινή κρέμα sour cream', kcal: 198, p: 2.4, c: 4.6, f: 19, sugar: 3.5, sodium: 40, satfat: 11, s: 30 },
  { name: 'Heavy cream', alias: 'κρέμα γάλακτος heavy whipping cream', kcal: 340, p: 2.1, c: 2.8, f: 36, sugar: 2.8, sodium: 27, satfat: 23, s: 30 },
  { name: 'Chocolate milk', alias: 'σοκολατούχο γάλα chocolate milk', kcal: 83, p: 3.2, c: 10.3, f: 3, sugar: 9.5, sodium: 60, satfat: 1.8, s: 250 },
  { name: 'Almond milk, unsweetened', alias: 'γάλα αμυγδάλου almond milk φυτικό', kcal: 15, p: 0.5, c: 0.3, f: 1.2, sodium: 60, s: 250 },
  { name: 'Oat milk', alias: 'γάλα βρώμης oat milk φυτικό', kcal: 45, p: 1, c: 6.6, f: 1.5, sugar: 4, sodium: 60, s: 250 },
  { name: 'Soy milk', alias: 'γάλα σόγιας soy milk φυτικό', kcal: 43, p: 3.3, c: 1.8, f: 1.8, sugar: 1, sodium: 50, s: 250 },

  // ── Meat / deli (additional) ────────────────────────────────────
  { name: 'Chicken wings, cooked', alias: 'φτερούγες κοτόπουλο chicken wings buffalo', kcal: 290, p: 27, c: 0, f: 20, sodium: 90, satfat: 5.5, s: 100 },
  { name: 'Chicken drumstick, cooked', alias: 'μπουτάκι κοτόπουλο drumstick', kcal: 172, p: 28, c: 0, f: 6, sodium: 90, satfat: 1.6, s: 100 },
  { name: 'Pork sausage, cooked', alias: 'λουκάνικο sausage χωριάτικο', kcal: 300, p: 18, c: 2, f: 25, sodium: 800, satfat: 9, s: 80 },
  { name: 'Salami', alias: 'σαλάμι salami αλλαντικά', kcal: 336, p: 22, c: 1, f: 27, sodium: 1700, satfat: 10, s: 30 },
  { name: 'Ham, sliced', alias: 'ζαμπόν ham γαλοπούλα χοιρινό αλλαντικά', kcal: 145, p: 18, c: 1.5, f: 7, sodium: 1100, satfat: 2.5, s: 30 },
  { name: 'Prosciutto / cured ham', alias: 'προσούτο prosciutto παρμα', kcal: 195, p: 27, c: 0.4, f: 9, sodium: 2300, satfat: 3.2, s: 30 },
  { name: 'Mortadella', alias: 'μορταδέλα mortadella αλλαντικά', kcal: 311, p: 16, c: 3, f: 25, sodium: 1200, satfat: 9, s: 30 },
  { name: 'Hot dog / frankfurter', alias: 'λουκάνικο φρανκφούρτης hot dog', kcal: 290, p: 10, c: 4, f: 26, sodium: 900, satfat: 9, s: 50 },
  { name: 'Meatballs (keftedes)', alias: 'κεφτέδες keftedes meatballs', kcal: 230, p: 18, c: 8, f: 14, sodium: 400, satfat: 5, s: 120 },
  { name: 'Burger patty (bifteki), cooked', alias: 'μπιφτέκι burger patty κεφτές', kcal: 250, p: 26, c: 0, f: 16, sodium: 300, satfat: 6, s: 120 },
  { name: 'Soutzoukakia', alias: 'σουτζουκάκια smyrna meatballs', kcal: 220, p: 14, c: 8, f: 15, sodium: 450, satfat: 5, s: 120 },
  { name: 'Chicken nuggets', alias: 'κοτομπουκιές nuggets κοτόπουλο', kcal: 290, p: 15, c: 16, f: 18, fiber: 1, sodium: 500, satfat: 3.5, s: 100 },
  { name: 'Schnitzel (breaded)', alias: 'σνίτσελ schnitzel πανέ κοτόπουλο', kcal: 270, p: 18, c: 15, f: 15, fiber: 1, sodium: 450, satfat: 3.5, s: 150 },

  // ── Fish / seafood (additional) ─────────────────────────────────
  { name: 'Mussels, cooked', alias: 'μύδια mussels', kcal: 172, p: 24, c: 7, f: 4.6, sodium: 369, satfat: 0.9, s: 100 },
  { name: 'Anchovies / gavros', alias: 'γαύρος αντζούγιες anchovies', kcal: 131, p: 20, c: 0, f: 5, sodium: 104, satfat: 1.3, s: 80 },
  { name: 'Smoked salmon', alias: 'καπνιστός σολομός smoked salmon', kcal: 117, p: 18, c: 0, f: 4.3, sodium: 1700, satfat: 0.9, s: 50 },
  { name: 'Mackerel, cooked', alias: 'σκουμπρί mackerel', kcal: 262, p: 24, c: 0, f: 18, sodium: 83, satfat: 4.2, s: 120 },
  { name: 'Fish fingers', alias: 'ψαροκροκέτες fish fingers sticks', kcal: 220, p: 12, c: 19, f: 11, fiber: 1, sodium: 400, satfat: 2, s: 90 },

  // ── Legumes / grains (additional) ───────────────────────────────
  { name: 'Gigantes / butter beans, cooked', alias: 'γίγαντες ελέφαντες butter beans', kcal: 115, p: 7, c: 20, f: 0.5, fiber: 7, sodium: 4, s: 200 },
  { name: 'Fava / split peas, cooked', alias: 'φάβα split peas yellow', kcal: 116, p: 8, c: 21, f: 0.4, fiber: 8, sodium: 5, s: 150 },
  { name: 'Peas, cooked', alias: 'αρακάς πιζέλια peas', kcal: 84, p: 5.4, c: 14, f: 0.4, fiber: 5, sugar: 5, sodium: 3, s: 150 },
  { name: 'Sweetcorn', alias: 'καλαμπόκι corn sweetcorn', kcal: 96, p: 3.4, c: 21, f: 1.5, fiber: 2.4, sugar: 4.5, sodium: 15, s: 150 },
  { name: 'Black beans, cooked', alias: 'μαύρα φασόλια black beans', kcal: 132, p: 8.9, c: 24, f: 0.5, fiber: 8.7, sodium: 2, s: 200 },
  { name: 'Kidney beans, cooked', alias: 'κόκκινα φασόλια kidney beans', kcal: 127, p: 8.7, c: 23, f: 0.5, fiber: 6.4, sodium: 2, s: 200 },
  { name: 'Bulgur, cooked', alias: 'πλιγούρι bulgur', kcal: 83, p: 3, c: 19, f: 0.2, fiber: 4.5, sodium: 5, s: 150 },
  { name: 'Barley, cooked', alias: 'κριθάρι barley', kcal: 123, p: 2.3, c: 28, f: 0.4, fiber: 3.8, sodium: 3, s: 150 },
  { name: 'Baguette / French bread', alias: 'μπαγκέτα baguette french bread', kcal: 270, p: 9, c: 52, f: 2.5, fiber: 2.5, sodium: 580, s: 50 },
  { name: 'Tortilla wrap', alias: 'τορτίγια wrap tortilla', kcal: 310, p: 8, c: 50, f: 8, fiber: 3, sodium: 600, satfat: 3, s: 60 },
  { name: 'Crackers', alias: 'κράκερ crackers cream', kcal: 430, p: 9, c: 70, f: 12, fiber: 3, sodium: 700, satfat: 3, s: 25 },
  { name: 'Breadsticks (kritsinia)', alias: 'κριτσίνια breadsticks grissini', kcal: 410, p: 12, c: 72, f: 8, fiber: 4, sodium: 700, satfat: 1.5, s: 30 },
  { name: 'Rusks / paximadi', alias: 'παξιμάδι ντάκος rusks κρητικό', kcal: 350, p: 11, c: 66, f: 5, fiber: 6, sodium: 500, s: 40 },

  // ── Fruit (additional) ──────────────────────────────────────────
  { name: 'Pear', alias: 'αχλάδι pear', kcal: 57, p: 0.4, c: 15, f: 0.1, fiber: 3.1, sugar: 10, sodium: 1, s: 170 },
  { name: 'Peach', alias: 'ροδάκινο peach nectarine νεκταρίνι', kcal: 39, p: 0.9, c: 10, f: 0.3, fiber: 1.5, sugar: 8, sodium: 0, s: 150 },
  { name: 'Apricot', alias: 'βερίκοκο apricot', kcal: 48, p: 1.4, c: 11, f: 0.4, fiber: 2, sugar: 9, sodium: 1, s: 35 },
  { name: 'Cherries', alias: 'κεράσια cherries', kcal: 63, p: 1.1, c: 16, f: 0.2, fiber: 2.1, sugar: 13, sodium: 0, s: 100 },
  { name: 'Plum', alias: 'δαμάσκηνο plum', kcal: 46, p: 0.7, c: 11, f: 0.3, fiber: 1.4, sugar: 10, sodium: 0, s: 65 },
  { name: 'Fig', alias: 'σύκο fig', kcal: 74, p: 0.8, c: 19, f: 0.3, fiber: 2.9, sugar: 16, sodium: 1, s: 50 },
  { name: 'Melon', alias: 'πεπόνι melon cantaloupe', kcal: 34, p: 0.8, c: 8, f: 0.2, fiber: 0.9, sugar: 8, sodium: 16, s: 150 },
  { name: 'Pomegranate', alias: 'ρόδι pomegranate', kcal: 83, p: 1.7, c: 19, f: 1.2, fiber: 4, sugar: 14, sodium: 3, s: 100 },
  { name: 'Mango', alias: 'μάνγκο mango', kcal: 60, p: 0.8, c: 15, f: 0.4, fiber: 1.6, sugar: 14, sodium: 1, s: 150 },
  { name: 'Raspberries', alias: 'σμέουρα raspberries βατόμουρα', kcal: 52, p: 1.2, c: 12, f: 0.7, fiber: 6.5, sugar: 4.4, sodium: 1, s: 100 },
  { name: 'Raisins', alias: 'σταφίδες raisins', kcal: 299, p: 3.1, c: 79, f: 0.5, fiber: 3.7, sugar: 59, sodium: 11, s: 30 },

  // ── Vegetables (additional) ─────────────────────────────────────
  { name: 'Cauliflower', alias: 'κουνουπίδι cauliflower', kcal: 25, p: 1.9, c: 5, f: 0.3, fiber: 2, sugar: 1.9, sodium: 30, s: 100 },
  { name: 'Cabbage', alias: 'λάχανο cabbage', kcal: 25, p: 1.3, c: 6, f: 0.1, fiber: 2.5, sugar: 3.2, sodium: 18, s: 100 },
  { name: 'Asparagus', alias: 'σπαράγγια asparagus', kcal: 20, p: 2.2, c: 3.9, f: 0.1, fiber: 2.1, sugar: 1.9, sodium: 2, s: 100 },
  { name: 'Leek', alias: 'πράσο leek', kcal: 61, p: 1.5, c: 14, f: 0.3, fiber: 1.8, sugar: 3.9, sodium: 20, s: 80 },
  { name: 'Beetroot', alias: 'παντζάρι beetroot beets', kcal: 43, p: 1.6, c: 10, f: 0.2, fiber: 2.8, sugar: 7, sodium: 78, s: 100 },
  { name: 'Okra', alias: 'μπάμιες okra', kcal: 33, p: 1.9, c: 7, f: 0.2, fiber: 3.2, sugar: 1.5, sodium: 7, s: 100 },
  { name: 'Artichoke', alias: 'αγκινάρα artichoke', kcal: 47, p: 3.3, c: 11, f: 0.2, fiber: 5.4, sugar: 1, sodium: 94, s: 120 },
  { name: 'Arugula / rocket', alias: 'ρόκα arugula rocket', kcal: 25, p: 2.6, c: 3.7, f: 0.7, fiber: 1.6, sugar: 2, sodium: 27, s: 30 },
  { name: 'Pumpkin / squash', alias: 'κολοκύθα pumpkin squash', kcal: 26, p: 1, c: 6.5, f: 0.1, fiber: 0.5, sugar: 2.8, sodium: 1, s: 100 },
  { name: 'Sweetcorn, canned', alias: 'καλαμπόκι κονσέρβα canned corn', kcal: 81, p: 2.5, c: 18, f: 0.8, fiber: 2, sugar: 5, sodium: 220, s: 150 },
  { name: 'Pickles', alias: 'πίκλες τουρσί pickles gherkins', kcal: 11, p: 0.3, c: 2.3, f: 0.2, fiber: 1, sodium: 800, s: 30 },
  { name: 'Sun-dried tomatoes', alias: 'λιαστές ντομάτες sun dried tomatoes', kcal: 258, p: 14, c: 55, f: 3, fiber: 12, sugar: 38, sodium: 270, s: 30 },

  // ── Nuts / seeds (additional) ───────────────────────────────────
  { name: 'Cashews', alias: 'κάσιους cashews', kcal: 553, p: 18, c: 30, f: 44, fiber: 3.3, sugar: 6, sodium: 12, satfat: 8, s: 28 },
  { name: 'Pistachios', alias: 'φιστίκια αιγίνης πιστάκια pistachios', kcal: 560, p: 20, c: 28, f: 45, fiber: 10, sugar: 8, sodium: 1, satfat: 5.5, s: 28 },
  { name: 'Hazelnuts', alias: 'φουντούκια hazelnuts', kcal: 628, p: 15, c: 17, f: 61, fiber: 10, sugar: 4, sodium: 0, satfat: 4.5, s: 28 },
  { name: 'Sunflower seeds', alias: 'ηλιόσποροι sunflower seeds', kcal: 584, p: 21, c: 20, f: 51, fiber: 9, sugar: 2.6, sodium: 9, satfat: 4.5, s: 28 },
  { name: 'Pumpkin seeds', alias: 'πασατέμπο κολοκυθόσποροι pumpkin seeds', kcal: 559, p: 30, c: 11, f: 49, fiber: 6, sodium: 7, satfat: 8.7, s: 28 },
  { name: 'Chia seeds', alias: 'σπόροι chia seeds τσία', kcal: 486, p: 17, c: 42, f: 31, fiber: 34, sugar: 0, sodium: 16, satfat: 3.3, s: 15 },
  { name: 'Flax seeds', alias: 'λιναρόσπορος flax seeds linseed', kcal: 534, p: 18, c: 29, f: 42, fiber: 27, sugar: 1.5, sodium: 30, satfat: 3.7, s: 15 },
  { name: 'Mixed nuts', alias: 'ανάμεικτοι ξηροί καρποί mixed nuts', kcal: 607, p: 20, c: 21, f: 54, fiber: 7, sugar: 4, sodium: 5, satfat: 8, s: 30 },

  // ── Sweets / desserts (his lane — expanded) ─────────────────────
  { name: 'Hazelnut chocolate spread (Nutella)', alias: 'nutella μερέντα πραλίνα chocolate hazelnut spread', kcal: 539, p: 6, c: 57, f: 31, sugar: 57, sodium: 41, satfat: 11, s: 20 },
  { name: 'Donut, glazed', alias: 'ντόνατ donut λουκουμάς γλασέ', kcal: 452, p: 4.9, c: 51, f: 25, sugar: 23, sodium: 370, satfat: 11, s: 60 },
  { name: 'Brownie', alias: 'μπράουνι brownie', kcal: 466, p: 6, c: 64, f: 21, sugar: 44, sodium: 280, satfat: 6, s: 60 },
  { name: 'Chocolate cake', alias: 'σοκολατένιο κέικ chocolate cake τούρτα', kcal: 371, p: 5, c: 50, f: 17, sugar: 35, sodium: 300, satfat: 5, s: 90 },
  { name: 'Cheesecake', alias: 'τσιζκέικ cheesecake', kcal: 321, p: 5.5, c: 26, f: 22, sugar: 22, sodium: 320, satfat: 12, s: 100 },
  { name: 'Tiramisu', alias: 'τιραμισού tiramisu', kcal: 283, p: 4.5, c: 30, f: 16, sugar: 22, sodium: 90, satfat: 9, s: 100 },
  { name: 'Baklava', alias: 'μπακλαβάς baklava', kcal: 430, p: 6, c: 45, f: 26, fiber: 2, sugar: 30, sodium: 200, satfat: 8, s: 80 },
  { name: 'Galaktoboureko', alias: 'γαλακτομπούρεκο custard pie', kcal: 230, p: 4, c: 33, f: 9, sugar: 22, sodium: 120, satfat: 4, s: 120 },
  { name: 'Loukoumades', alias: 'λουκουμάδες honey puffs', kcal: 350, p: 4, c: 52, f: 14, sugar: 25, sodium: 200, satfat: 3, s: 100 },
  { name: 'Rice pudding (rizogalo)', alias: 'ρυζόγαλο rice pudding', kcal: 130, p: 3.5, c: 22, f: 3, sugar: 14, sodium: 50, satfat: 1.8, s: 150 },
  { name: 'Halva', alias: 'χαλβάς halva ταχινιού', kcal: 469, p: 12, c: 54, f: 22, fiber: 4, sugar: 42, sodium: 195, satfat: 4, s: 40 },
  { name: 'Pasteli (sesame bar)', alias: 'παστέλι sesame honey bar', kcal: 470, p: 11, c: 52, f: 24, fiber: 5, sugar: 42, sodium: 10, satfat: 3.5, s: 30 },
  { name: 'Bougatsa', alias: 'μπουγάτσα cream pie', kcal: 270, p: 5, c: 28, f: 15, sugar: 10, sodium: 250, satfat: 7, s: 120 },
  { name: 'Tsoureki', alias: 'τσουρέκι sweet brioche bread', kcal: 330, p: 9, c: 54, f: 9, sugar: 18, sodium: 200, satfat: 4, s: 60 },
  { name: 'Melomakarona', alias: 'μελομακάρονα honey cookies', kcal: 420, p: 4, c: 55, f: 21, sugar: 30, sodium: 150, satfat: 3, s: 40 },
  { name: 'Popcorn', alias: 'ποπκόρν popcorn', kcal: 387, p: 13, c: 78, f: 4, fiber: 15, sodium: 8, s: 30 },
  { name: 'Marshmallow', alias: 'ζαχαρωτά marshmallow', kcal: 318, p: 1.8, c: 81, f: 0.2, sugar: 58, sodium: 80, s: 30 },
  { name: 'Petit beurre biscuits', alias: 'πτι μπερ μπισκότα petit beurre biscuits παπαδοπούλου', kcal: 460, p: 7, c: 72, f: 15, sugar: 24, sodium: 350, satfat: 7, s: 25 },
  { name: 'Digestive biscuits', alias: 'ντάιτζεστιβ digestive biscuits μπισκότα', kcal: 471, p: 7, c: 63, f: 21, fiber: 3, sugar: 17, sodium: 600, satfat: 9, s: 30 },
  { name: 'Cereal / energy bar', alias: 'μπάρα δημητριακών cereal energy bar', kcal: 380, p: 6, c: 65, f: 10, fiber: 5, sugar: 25, sodium: 150, satfat: 4, s: 35 },

  // ── Candy bars / branded chocolate ──────────────────────────────
  { name: 'Mars bar', alias: 'mars bar σοκολάτα', kcal: 449, p: 3.8, c: 70, f: 17, sugar: 60, sodium: 150, satfat: 8, s: 51 },
  { name: 'Snickers', alias: 'snickers σοκολάτα', kcal: 488, p: 9, c: 57, f: 24, sugar: 50, sodium: 230, satfat: 9, s: 50 },
  { name: 'Twix', alias: 'twix σοκολάτα', kcal: 495, p: 4.7, c: 64, f: 24, sugar: 49, sodium: 210, satfat: 14, s: 50 },
  { name: 'Bounty', alias: 'bounty καρύδα σοκολάτα', kcal: 477, p: 4, c: 58, f: 26, sugar: 47, sodium: 130, satfat: 19, s: 57 },
  { name: 'KitKat', alias: 'kitkat γκοφρέτα σοκολάτα', kcal: 518, p: 6.5, c: 61, f: 27, sugar: 49, sodium: 70, satfat: 16, s: 41 },
  { name: 'Milka chocolate', alias: 'milka σοκολάτα γάλακτος', kcal: 530, p: 6.6, c: 58, f: 30, sugar: 57, sodium: 110, satfat: 18, s: 25 },
  { name: 'M&Ms', alias: 'm&ms σοκολατάκια smarties', kcal: 492, p: 4.6, c: 71, f: 21, sugar: 65, sodium: 70, satfat: 13, s: 45 },
  { name: 'Toblerone', alias: 'toblerone σοκολάτα', kcal: 525, p: 5.6, c: 60, f: 29, sugar: 58, sodium: 80, satfat: 17, s: 35 },

  // ── Savory snacks / chips ───────────────────────────────────────
  { name: 'Potato chips', alias: 'πατατάκια chips crisps lays', kcal: 536, p: 7, c: 53, f: 35, fiber: 4, sodium: 525, satfat: 3.5, s: 30 },
  { name: 'Tortilla chips / nachos', alias: 'νατσος doritos tortilla chips', kcal: 497, p: 7, c: 63, f: 24, fiber: 4, sodium: 400, satfat: 3, s: 30 },
  { name: 'Pretzels', alias: 'πρέτζελ pretzels', kcal: 380, p: 10, c: 80, f: 3, fiber: 3, sodium: 1200, s: 30 },
  { name: 'Cheese puffs', alias: 'γαριδάκια cheese puffs τσιπς', kcal: 540, p: 6, c: 50, f: 35, sodium: 800, satfat: 4, s: 25 },

  // ── Condiments / sauces / dips (additional) ─────────────────────
  { name: 'Mayonnaise', alias: 'μαγιονέζα mayonnaise', kcal: 680, p: 1, c: 1, f: 75, sodium: 600, satfat: 11, s: 15 },
  { name: 'Mustard', alias: 'μουστάρδα mustard', kcal: 66, p: 4, c: 5, f: 3.3, fiber: 2, sodium: 1100, s: 10 },
  { name: 'BBQ sauce', alias: 'σάλτσα bbq barbecue', kcal: 172, p: 1, c: 41, f: 0.6, sugar: 33, sodium: 800, s: 20 },
  { name: 'Soy sauce', alias: 'σάλτσα σόγιας soy sauce', kcal: 53, p: 8, c: 5, f: 0.1, sodium: 5500, s: 15 },
  { name: 'Pesto', alias: 'πέστο pesto', kcal: 430, p: 5, c: 6, f: 43, sodium: 800, satfat: 7, s: 20 },
  { name: 'Salad dressing / vinaigrette', alias: 'σος σαλάτας dressing vinaigrette', kcal: 290, p: 0.5, c: 8, f: 29, sugar: 5, sodium: 600, satfat: 4, s: 20 },
  { name: 'Jam / marmalade', alias: 'μαρμελάδα jam marmalade', kcal: 250, p: 0.4, c: 65, f: 0.1, sugar: 49, sodium: 30, s: 20 },
  { name: 'Maple syrup', alias: 'σιρόπι σφενδάμου maple syrup', kcal: 260, p: 0, c: 67, f: 0.1, sugar: 60, sodium: 12, s: 20 },
  { name: 'Sugar', alias: 'ζάχαρη sugar', kcal: 387, p: 0, c: 100, f: 0, sugar: 100, sodium: 0, s: 5 },
  { name: 'Taramosalata', alias: 'ταραμοσαλάτα taramosalata fish roe dip', kcal: 480, p: 4, c: 8, f: 49, sodium: 700, satfat: 6, s: 50 },
  { name: 'Melitzanosalata', alias: 'μελιτζανοσαλάτα eggplant dip', kcal: 230, p: 1.5, c: 8, f: 21, fiber: 3, sodium: 400, satfat: 3, s: 50 },
  { name: 'Tirokafteri (spicy cheese dip)', alias: 'τυροκαφτερή ktipiti spicy feta dip', kcal: 270, p: 7, c: 5, f: 25, sodium: 700, satfat: 12, s: 50 },

  // ── Greek cooked / prepared dishes (additional) ─────────────────
  { name: 'Moussaka', alias: 'μουσακάς moussaka', kcal: 170, p: 8, c: 10, f: 11, fiber: 1.5, sodium: 380, satfat: 4.5, s: 250 },
  { name: 'Pastitsio', alias: 'παστίτσιο pastitsio', kcal: 180, p: 9, c: 16, f: 9, fiber: 1.2, sodium: 380, satfat: 4, s: 250 },
  { name: 'Gemista (stuffed vegetables)', alias: 'γεμιστά stuffed peppers tomatoes', kcal: 110, p: 2.5, c: 16, f: 4.5, fiber: 2.5, sodium: 300, satfat: 0.7, s: 200 },
  { name: 'Dolmades (stuffed vine leaves)', alias: 'ντολμάδες dolmades sarma', kcal: 150, p: 2.5, c: 18, f: 8, fiber: 2.5, sodium: 500, satfat: 1.2, s: 100 },
  { name: 'Fasolada (bean soup)', alias: 'φασολάδα bean soup', kcal: 90, p: 4.5, c: 14, f: 2.5, fiber: 4, sodium: 350, satfat: 0.4, s: 300 },
  { name: 'Briam (roasted vegetables)', alias: 'μπριάμ briam roasted vegetables', kcal: 95, p: 1.8, c: 11, f: 5, fiber: 3, sodium: 250, satfat: 0.8, s: 200 },
  { name: 'Horta (boiled greens)', alias: 'χόρτα βραστά boiled wild greens', kcal: 60, p: 3, c: 6, f: 3, fiber: 3, sodium: 80, satfat: 0.5, s: 200 },
  { name: 'Saganaki (fried cheese)', alias: 'σαγανάκι fried cheese', kcal: 350, p: 20, c: 8, f: 27, sodium: 900, satfat: 14, s: 80 },
  { name: 'Falafel', alias: 'φαλάφελ falafel', kcal: 333, p: 13, c: 32, f: 18, fiber: 5, sodium: 290, satfat: 2.4, s: 100 },

  // ── Drinks (additional) ─────────────────────────────────────────
  { name: 'Orange juice', alias: 'χυμός πορτοκάλι orange juice', kcal: 45, p: 0.7, c: 10.4, f: 0.2, sugar: 8.4, sodium: 1, s: 250 },
  { name: 'Apple juice', alias: 'χυμός μήλο apple juice', kcal: 46, p: 0.1, c: 11, f: 0.1, sugar: 9.6, sodium: 4, s: 250 },
  { name: 'Cola', alias: 'κόκα κόλα coca cola soft drink αναψυκτικό', kcal: 42, p: 0, c: 10.6, f: 0, sugar: 10.6, sodium: 4, s: 330 },
  { name: 'Cola / soda, zero', alias: 'coke zero light diet αναψυκτικό χωρίς ζάχαρη', kcal: 1, p: 0, c: 0, f: 0, sodium: 10, s: 330 },
  { name: 'Sprite / lemon-lime soda', alias: 'sprite seven up lemonade αναψυκτικό', kcal: 38, p: 0, c: 9.5, f: 0, sugar: 9.5, sodium: 10, s: 330 },
  { name: 'Fanta / orange soda', alias: 'fanta πορτοκαλάδα orange soda', kcal: 45, p: 0, c: 11, f: 0, sugar: 11, sodium: 10, s: 330 },
  { name: 'Iced tea', alias: 'παγωμένο τσάι ice tea', kcal: 30, p: 0, c: 7.5, f: 0, sugar: 7, sodium: 5, s: 330 },
  { name: 'Frappe / iced coffee (w/ milk & sugar)', alias: 'φραπέ freddo iced coffee καφές', kcal: 45, p: 1, c: 8, f: 1, sugar: 7, sodium: 20, s: 300 },
  { name: 'Cappuccino / latte', alias: 'καπουτσίνο latte coffee καφές', kcal: 55, p: 3, c: 6, f: 2, sugar: 5, sodium: 40, satfat: 1.2, s: 240 },
  { name: 'Coffee, black', alias: 'καφές espresso filter black coffee', kcal: 2, p: 0.1, c: 0, f: 0, sodium: 5, s: 200 },
  { name: 'Hot chocolate', alias: 'ζεστή σοκολάτα hot chocolate ρόφημα', kcal: 90, p: 3, c: 14, f: 2.5, sugar: 12, sodium: 90, satfat: 1.5, s: 250 },
  { name: 'Milkshake', alias: 'μιλκσέικ milkshake', kcal: 112, p: 3.5, c: 18, f: 3, sugar: 16, sodium: 80, satfat: 1.9, s: 300 },
  { name: 'Sports drink', alias: 'gatorade powerade sports drink ισοτονικό', kcal: 24, p: 0, c: 6, f: 0, sugar: 6, sodium: 45, s: 500 },

  // ── Greek dairy brands (additional) ─────────────────────────────
  { name: 'FAGE Total 0% yogurt', alias: 'φαγε total 0 στραγγιστό γιαούρτι fage', kcal: 57, p: 10.3, c: 4, f: 0, sugar: 4, sodium: 36, s: 200 },
  { name: 'FAGE Total 2% yogurt', alias: 'φαγε total 2 στραγγιστό γιαούρτι fage', kcal: 71, p: 9, c: 4, f: 2, sugar: 4, sodium: 36, satfat: 1.3, s: 200 },
  { name: 'FAGE Total 5% yogurt', alias: 'φαγε total 5 πλήρες στραγγιστό γιαούρτι fage', kcal: 97, p: 9, c: 3.8, f: 5, sugar: 3.8, sodium: 36, satfat: 3.3, s: 200 },
  { name: 'FAGE Fruyo 0% fruit yogurt', alias: 'φαγε fruyo φρούτα γιαούρτι fage', kcal: 84, p: 7.9, c: 12.5, f: 0.2, sugar: 11, sodium: 40, s: 150 },
  { name: 'Strained yogurt 2% (ΔΕΛΤΑ/ΝΟΥΝΟΥ/Μεβγάλ)', alias: 'δέλτα νουνού μεβγάλ στραγγιστό γιαούρτι delta nounou mevgal', kcal: 71, p: 9, c: 4, f: 2, sugar: 4, sodium: 40, satfat: 1.3, s: 200 },
  { name: 'Traditional Greek yogurt (full fat, with skin)', alias: 'παραδοσιακό γιαούρτι πρόβειο με πέτσα traditional', kcal: 96, p: 3.8, c: 4.7, f: 7, sugar: 4.7, sodium: 46, satfat: 4.5, s: 150 },
  { name: 'Ayran (αριάνι)', alias: 'αριάνι ayran γιαούρτι ρόφημα drink', kcal: 37, p: 3, c: 4, f: 1, sugar: 3.5, sodium: 180, satfat: 0.6, s: 250 },
  { name: 'Evaporated milk (γάλα εβαπορέ)', alias: 'γάλα εβαπορέ νουνού evaporated milk', kcal: 135, p: 6.7, c: 10, f: 7.5, sugar: 10, sodium: 106, satfat: 4.6, s: 30 },
  { name: 'Condensed milk, sweetened (ζαχαρούχο)', alias: 'ζαχαρούχο γάλα condensed milk sweetened', kcal: 321, p: 7.9, c: 54, f: 8.7, sugar: 54, sodium: 127, satfat: 5.5, s: 30 },
  { name: 'Lactose-free milk (γάλα χωρίς λακτόζη)', alias: 'γάλα χωρίς λακτόζη lactose free milk', kcal: 47, p: 3.4, c: 4.8, f: 1.5, sugar: 4.8, sodium: 44, satfat: 1, s: 250 },
  { name: 'Cooking cream 20% (κρέμα γάλακτος)', alias: 'κρέμα γάλακτος cooking cream light μαγειρικής', kcal: 200, p: 2.6, c: 3.5, f: 20, sugar: 3, sodium: 40, satfat: 13, s: 30 },

  // ── Greek cheese (additional) ───────────────────────────────────
  { name: 'Ladotyri (λαδοτύρι Ρόδου)', alias: 'λαδοτύρι ρόδου ladotyri cheese τυρί λαδοτυρι', kcal: 400, p: 25, c: 1, f: 33, sodium: 900, satfat: 21, s: 30 },
  { name: 'Manouri cheese (μανούρι)', alias: 'μανούρι manouri τυρί cheese', kcal: 330, p: 14, c: 2, f: 30, sodium: 300, satfat: 19, s: 30 },
  { name: 'Kefalograviera cheese (κεφαλογραβιέρα)', alias: 'κεφαλογραβιέρα kefalograviera τυρί cheese', kcal: 420, p: 27, c: 0.5, f: 34, sodium: 1100, satfat: 21, s: 30 },
  { name: 'Katiki Domokou (κατίκι Δομοκού)', alias: 'κατίκι δομοκού katiki soft cheese τυρί', kcal: 122, p: 9, c: 3, f: 8, sodium: 400, satfat: 5, s: 30 },
  { name: 'Kopanisti cheese (κοπανιστή)', alias: 'κοπανιστή kopanisti spicy cheese τυρί', kcal: 280, p: 14, c: 2, f: 24, sodium: 900, satfat: 15, s: 30 },
  { name: 'Xynomyzithra (ξινομυζήθρα)', alias: 'ξινομυζήθρα xinomizithra sour cheese τυρί', kcal: 230, p: 12, c: 3, f: 19, sodium: 500, satfat: 12, s: 30 },
  { name: 'Edam cheese', alias: 'edam τυρί ένταμ cheese', kcal: 357, p: 25, c: 1.4, f: 28, sodium: 820, satfat: 18, s: 30 },
  { name: 'Gruyere cheese', alias: 'gruyere γραβιέρα ελβετική τυρί cheese', kcal: 413, p: 30, c: 0.4, f: 32, sodium: 700, satfat: 19, s: 30 },

  // ── Greek snacks / biscuits (additional) ────────────────────────
  { name: '7Days croissant', alias: '7days σεβεν ντέις κρουασάν chipita croissant', kcal: 432, p: 7, c: 47, f: 24, sugar: 22, sodium: 350, satfat: 12, s: 70, u: 'piece', us: 70 },
  { name: '7Days croissant chocolate', alias: '7days σοκολάτα croissant chipita duo', kcal: 445, p: 6.5, c: 50, f: 24, sugar: 28, sodium: 330, satfat: 12, s: 70, u: 'piece', us: 70 },
  { name: 'Molto croissant', alias: 'μόλτο molto croissant κρουασάν', kcal: 410, p: 7, c: 48, f: 21, sugar: 24, sodium: 340, satfat: 11, s: 65, u: 'piece', us: 65 },
  { name: 'Bake Rolls', alias: 'bake rolls μπέικ ρολς παξιμαδάκια snack', kcal: 450, p: 11, c: 62, f: 17, sugar: 3, sodium: 1200, satfat: 2, s: 40, u: 'pack', us: 40 },
  { name: 'Fun-O cookies', alias: 'fun-o funo σάντουιτς μπισκότα cream cookies', kcal: 480, p: 4.5, c: 70, f: 20, sugar: 40, sodium: 400, satfat: 9, s: 30, u: 'cookie', us: 11 },
  { name: 'Cream crackers (Παπαδοπούλου)', alias: 'κριμ κράκερς cream crackers παπαδοπούλου', kcal: 430, p: 10, c: 68, f: 13, fiber: 3, sugar: 3, sodium: 800, satfat: 6, s: 25 },
  { name: 'Miranda biscuit (Παπαδοπούλου)', alias: 'μιράντα miranda σοκολάτα μπισκότο παπαδοπούλου', kcal: 500, p: 6, c: 62, f: 25, sugar: 35, sodium: 300, satfat: 14, s: 20, u: 'cookie', us: 20 },
  { name: 'Caprice (ΙΟΝ)', alias: 'καπρίς caprice ion γκοφρέτα πραλίνα wafer', kcal: 530, p: 7, c: 58, f: 30, sugar: 40, sodium: 90, satfat: 20, s: 22, u: 'piece', us: 11 },
  { name: 'ION filled chocolate (γεμιστά)', alias: 'ίον γεμιστά ion σοκολάτα πραλίνα', kcal: 535, p: 6, c: 58, f: 31, sugar: 55, sodium: 60, satfat: 18, s: 40, u: 'bar', us: 40 },
  { name: 'Lacta chocolate', alias: 'λάκτα lacta σοκολάτα γάλακτος milk chocolate', kcal: 555, p: 7.5, c: 58, f: 32, sugar: 57, sodium: 80, satfat: 19, s: 25, u: 'square', us: 8 },
  { name: 'Merenda hazelnut spread', alias: 'μερέντα merenda πραλίνα φουντουκιού spread', kcal: 541, p: 6, c: 57, f: 31, sugar: 54, sodium: 55, satfat: 8, s: 20 },
  { name: 'Nucrema spread (ΙΟΝ)', alias: 'nucrema νουκρέμα ion πραλίνα spread', kcal: 560, p: 6.5, c: 55, f: 34, sugar: 50, sodium: 40, satfat: 10, s: 20 },
  { name: 'Serenata wafer', alias: 'σερενάτα serenata γκοφρέτα wafer chocolate', kcal: 560, p: 6, c: 52, f: 36, sugar: 42, sodium: 80, satfat: 22, s: 38, u: 'bar', us: 38 },
  { name: 'Break wafer (Παυλίδης)', alias: 'break μπρέικ παυλίδης γκοφρέτα wafer', kcal: 530, p: 6, c: 60, f: 29, sugar: 40, sodium: 90, satfat: 18, s: 44, u: 'bar', us: 44 },
  { name: 'Garidaki corn puffs (γαριδάκια)', alias: 'γαριδάκια cheetos πουφάκια καλαμποκιού', kcal: 520, p: 6, c: 55, f: 31, sugar: 2, sodium: 900, satfat: 4, s: 30, u: 'pack', us: 30 },
  { name: 'Doritos tortilla chips', alias: 'ντορίτος doritos τορτίγια τσιπς nachos', kcal: 498, p: 7, c: 63, f: 24, fiber: 4, sugar: 2, sodium: 700, satfat: 3, s: 30, u: 'pack', us: 30 },
  { name: 'Pringles', alias: 'πρίνγκλς pringles πατατάκια chips', kcal: 535, p: 4, c: 51, f: 34, fiber: 3, sugar: 2, sodium: 660, satfat: 9, s: 30, u: 'pack', us: 30 },
  { name: "Lay's potato chips", alias: 'λέις lays ruffles πατατάκια chips τσιπς', kcal: 535, p: 6, c: 53, f: 33, fiber: 4, sugar: 0.5, sodium: 550, satfat: 3, s: 30, u: 'pack', us: 30 },
  { name: 'Chocolate rice cake (ρυζογκοφρέτα)', alias: 'ρυζογκοφρέτα σοκολάτα rice cake chocolate', kcal: 460, p: 6, c: 65, f: 19, fiber: 2, sugar: 35, sodium: 100, satfat: 11, s: 15, u: 'piece', us: 8 },

  // ── Bakery / sweets (additional) ────────────────────────────────
  { name: 'Sfoliata (σφολιάτα)', alias: 'σφολιάτα sfoliata puff pastry ζαμπόν τυρί', kcal: 380, p: 6, c: 40, f: 22, sugar: 2, sodium: 500, satfat: 11, s: 120, u: 'piece', us: 120 },
  { name: 'Ham & cheese pie (ζαμπονοτυρόπιτα)', alias: 'ζαμπονοτυρόπιτα ham cheese pie σφολιάτα', kcal: 290, p: 10, c: 26, f: 16, sugar: 2, sodium: 600, satfat: 8, s: 150, u: 'piece', us: 150 },
  { name: 'Sausage roll (λουκανόπιτα)', alias: 'λουκανόπιτα sausage roll πίτα λουκάνικο', kcal: 320, p: 9, c: 28, f: 19, sugar: 2, sodium: 650, satfat: 8, s: 150, u: 'piece', us: 150 },
  { name: 'Apple pie (μηλόπιτα)', alias: 'μηλόπιτα apple pie μηλοπιτάκι', kcal: 265, p: 3, c: 37, f: 12, fiber: 1.5, sugar: 20, sodium: 200, satfat: 5, s: 120, u: 'slice', us: 120 },
  { name: 'Dakos (ντάκος)', alias: 'ντάκος dakos κρητικός κουκουβάγια rusk salad', kcal: 220, p: 6, c: 26, f: 11, fiber: 2, sugar: 3, sodium: 500, satfat: 3, s: 200, u: 'piece', us: 200 },
  { name: 'Crepe with chocolate (κρέπα)', alias: 'κρέπα crepe nutella σοκολάτα', kcal: 300, p: 5, c: 40, f: 13, sugar: 24, sodium: 200, satfat: 5, s: 200, u: 'piece', us: 200 },
  { name: 'Profiterole (προφιτερόλ)', alias: 'προφιτερόλ profiterole σου σοκολάτα', kcal: 300, p: 5, c: 30, f: 18, sugar: 22, sodium: 120, satfat: 10, s: 150, u: 'piece', us: 150 },
  { name: 'Ekmek kataifi (εκμέκ)', alias: 'εκμέκ ekmek κανταΐφι κρέμα', kcal: 280, p: 4, c: 34, f: 14, sugar: 24, sodium: 100, satfat: 8, s: 150, u: 'piece', us: 150 },
  { name: 'Kataifi (κανταΐφι)', alias: 'κανταΐφι kataifi σιρόπι walnut dessert', kcal: 360, p: 5, c: 45, f: 18, fiber: 1, sugar: 30, sodium: 120, satfat: 4, s: 100, u: 'piece', us: 100 },
  { name: 'Pasta sokolatina (πάστα σοκολατίνα)', alias: 'πάστα σοκολατίνα chocolate pastry cake', kcal: 360, p: 5, c: 40, f: 20, sugar: 30, sodium: 120, satfat: 11, s: 120, u: 'piece', us: 120 },
  { name: 'Eclair (εκλέρ)', alias: 'εκλέρ eclair σου κρέμα σοκολάτα', kcal: 280, p: 6, c: 26, f: 17, sugar: 18, sodium: 120, satfat: 9, s: 100, u: 'piece', us: 100 },

  // ── Drinks — soft / coffee (additional) ─────────────────────────
  { name: 'Amita juice (χυμός)', alias: 'amita αμίτα χυμός juice φρούτων life', kcal: 46, p: 0.6, c: 10.5, f: 0.1, sugar: 9.5, sodium: 5, s: 250 },
  { name: 'Loux orangeade (πορτοκαλάδα)', alias: 'loux λουξ πορτοκαλάδα orangeade αναψυκτικό', kcal: 45, p: 0, c: 11, f: 0, sugar: 11, sodium: 8, s: 330 },
  { name: 'Lemonade (λεμονάδα)', alias: 'λεμονάδα lemonade loux ΕΨΑ epsa αναψυκτικό', kcal: 38, p: 0, c: 9.5, f: 0, sugar: 9.5, sodium: 8, s: 330 },
  { name: 'Gazoza (γκαζόζα)', alias: 'γκαζόζα gazoza loux ΕΨΑ soda αναψυκτικό', kcal: 40, p: 0, c: 10, f: 0, sugar: 10, sodium: 8, s: 330 },
  { name: 'Green Cola', alias: 'green cola γκριν κόλα stevia αναψυκτικό', kcal: 1, p: 0, c: 0, f: 0, sodium: 10, s: 330 },
  { name: 'Sparkling water (ανθρακούχο νερό)', alias: 'σουρωτή souroti ανθρακούχο νερό sparkling water soda', kcal: 0, p: 0, c: 0, f: 0, sodium: 5, s: 500 },
  { name: 'Water (νερό)', alias: 'νερό water μεταλλικό νερό', kcal: 0, p: 0, c: 0, f: 0, sodium: 1, s: 500 },
  { name: 'Freddo espresso (no sugar)', alias: 'φρέντο εσπρέσο freddo espresso καφές coffee σκέτος', kcal: 6, p: 0.3, c: 1, f: 0.1, sodium: 5, s: 250 },
  { name: 'Freddo cappuccino (no sugar)', alias: 'φρέντο καπουτσίνο freddo cappuccino καφές coffee', kcal: 30, p: 1.6, c: 2.5, f: 1.5, sugar: 2.3, sodium: 25, satfat: 1, s: 250 },
  { name: 'Greek coffee (ελληνικός, no sugar)', alias: 'ελληνικός καφές greek coffee σκέτος', kcal: 5, p: 0.2, c: 1, f: 0, sodium: 3, s: 100 },
  { name: 'Herbal tea (χαμομήλι/τσάι)', alias: 'χαμομήλι τσάι herbal tea βότανα', kcal: 1, p: 0, c: 0.2, f: 0, sodium: 2, s: 250 },
  { name: 'Fruit smoothie', alias: 'σμούθι smoothie φρούτων', kcal: 57, p: 1, c: 13, f: 0.3, fiber: 1.5, sugar: 11, sodium: 10, s: 250 },

  // ── Alcohol (alc = g ethanol/100ml; app ignores it, validator counts it) ──
  { name: 'Beer, lager (μπύρα)', alias: 'μπύρα beer lager mythos alfa fix amstel heineken', kcal: 43, p: 0.5, c: 3.6, f: 0, alc: 3.9, sodium: 4, s: 330 },
  { name: 'Radler / shandy (ράντλερ)', alias: 'ράντλερ radler shandy μπύρα λεμόνι', kcal: 45, p: 0.3, c: 8, f: 0, alc: 1.6, sugar: 7, sodium: 5, s: 330 },
  { name: 'Red wine (κόκκινο κρασί)', alias: 'κόκκινο κρασί red wine οίνος', kcal: 85, p: 0.1, c: 2.6, f: 0, alc: 10.6, sodium: 4, s: 150 },
  { name: 'White wine (λευκό κρασί)', alias: 'λευκό κρασί white wine οίνος', kcal: 82, p: 0.1, c: 2.6, f: 0, alc: 9.9, sodium: 4, s: 150 },
  { name: 'Rose wine (ροζέ κρασί)', alias: 'ροζέ κρασί rose wine οίνος', kcal: 83, p: 0.1, c: 3, f: 0, alc: 9.9, sodium: 4, s: 150 },
  { name: 'Ouzo (ούζο)', alias: 'ούζο ouzo spirit ποτό', kcal: 225, p: 0, c: 0, f: 0, alc: 32, sodium: 1, s: 50 },
  { name: 'Tsipouro / raki (τσίπουρο/ρακή)', alias: 'τσίπουρο ρακή tsipouro raki spirit ποτό', kcal: 225, p: 0, c: 0, f: 0, alc: 32, sodium: 1, s: 50 },
  { name: 'Spirits, 40% (vodka/whisky/gin)', alias: 'βότκα ουίσκι τζιν vodka whisky gin spirit ποτό', kcal: 225, p: 0, c: 0, f: 0, alc: 32, sodium: 1, s: 40 },
  { name: 'Tequila (τεκίλα)', alias: 'τεκίλα tequila shot spirit', kcal: 225, p: 0, c: 0, f: 0, alc: 32, sodium: 1, s: 40 },
  { name: 'Cocktail (mixed drink)', alias: 'κοκτέιλ cocktail mojito margarita mixed drink', kcal: 145, p: 0, c: 14, f: 0, alc: 11, sugar: 12, sodium: 10, s: 250 },
  { name: 'Prosecco / champagne (σαμπάνια)', alias: 'σαμπάνια prosecco champagne αφρώδης οίνος', kcal: 76, p: 0.1, c: 3, f: 0, alc: 8.7, sugar: 1.5, sodium: 4, s: 120 },
  { name: 'Cider (μηλίτης)', alias: 'μηλίτης cider strongbow somersby', kcal: 50, p: 0, c: 7, f: 0, alc: 3.5, sugar: 6, sodium: 5, s: 330 },
  { name: 'Liqueur, sweet (λικέρ)', alias: 'λικέρ liqueur baileys sweet spirit', kcal: 320, p: 1, c: 25, f: 10, alc: 20, sugar: 22, sodium: 20, satfat: 6, s: 50 },

  // ── Fast food / eating out — Greek (additional) ─────────────────
  { name: "Goody's burger", alias: 'goodys γκουντις burger μπέργκερ', kcal: 250, p: 12, c: 22, f: 12, sugar: 4, sodium: 450, satfat: 5, s: 200, u: 'piece', us: 200 },
  { name: 'Toast, ham & cheese (τοστ)', alias: 'τοστ toast ζαμπόν τυρί ham cheese sandwich everest', kcal: 290, p: 13, c: 28, f: 14, sugar: 3, sodium: 700, satfat: 6, s: 120, u: 'piece', us: 120 },
  { name: 'Club sandwich', alias: 'κλαμπ σάντουιτς club sandwich', kcal: 250, p: 12, c: 24, f: 12, fiber: 2, sugar: 3, sodium: 600, satfat: 4, s: 250, u: 'piece', us: 250 },
  { name: 'Gyros plate (γύρος μερίδα)', alias: 'γύρος μερίδα gyros plate πατάτες τζατζίκι', kcal: 200, p: 10, c: 20, f: 9, fiber: 1.5, sugar: 2, sodium: 500, satfat: 3, s: 450, u: 'piece', us: 450 },
  { name: 'Souvlaki skewer (καλαμάκι)', alias: 'καλαμάκι σουβλάκι skewer χοιρινό κοτόπουλο', kcal: 210, p: 22, c: 1, f: 13, sodium: 300, satfat: 4, s: 80, u: 'piece', us: 80 },
  { name: 'Kebab / adana (κεμπάπ)', alias: 'κεμπάπ kebab adana σουτζούκι', kcal: 240, p: 17, c: 3, f: 18, sodium: 500, satfat: 7, s: 100, u: 'piece', us: 100 },
  { name: 'Peinirli (πεϊνιρλί)', alias: 'πεϊνιρλί peinirli boat pizza τυρί', kcal: 280, p: 11, c: 30, f: 12, sodium: 500, satfat: 5, s: 200, u: 'piece', us: 200 },

  // ── Greek prepared dishes (additional) ──────────────────────────
  { name: 'Spanakorizo (σπανακόρυζο)', alias: 'σπανακόρυζο spinach rice', kcal: 110, p: 3, c: 16, f: 4, fiber: 2, sodium: 300, s: 300 },
  { name: 'Youvetsi (γιουβέτσι)', alias: 'γιουβέτσι youvetsi κριθαράκι κρέας', kcal: 140, p: 10, c: 14, f: 5, sodium: 350, satfat: 2, s: 350 },
  { name: 'Chicken soup (κοτόσουπα)', alias: 'κοτόσουπα chicken soup αυγολέμονο', kcal: 40, p: 4, c: 3, f: 1.5, sodium: 400, s: 300 },
  { name: 'Lentil soup (φακές)', alias: 'φακές lentil soup σούπα', kcal: 75, p: 5, c: 12, f: 0.8, fiber: 4, sodium: 300, s: 350 },
  { name: 'Chickpea soup (ρεβιθάδα)', alias: 'ρεβιθάδα ρεβίθια σούπα chickpea soup', kcal: 90, p: 5, c: 13, f: 2.5, fiber: 4, sodium: 300, s: 350 },
  { name: 'Greek sausage (λουκάνικο χωριάτικο)', alias: 'λουκάνικο χωριάτικο greek sausage σουτζούκι', kcal: 300, p: 15, c: 2, f: 26, sodium: 900, satfat: 10, s: 80 },

  // ── Fruit (additional) ──────────────────────────────────────────
  { name: 'Nectarine (νεκταρίνι)', alias: 'νεκταρίνι nectarine φρούτο', kcal: 44, p: 1.1, c: 10.5, f: 0.3, fiber: 1.7, sugar: 8, sodium: 0, s: 140, u: 'piece', us: 140 },
  { name: 'Persimmon (λωτός)', alias: 'λωτός persimmon kaki φρούτο', kcal: 70, p: 0.6, c: 18, f: 0.2, fiber: 3.6, sugar: 12.5, sodium: 1, s: 168, u: 'piece', us: 168 },
  { name: 'Chestnuts (κάστανα)', alias: 'κάστανα chestnut roasted ψητά', kcal: 245, p: 3.2, c: 53, f: 2.2, fiber: 5, sugar: 11, sodium: 2, s: 50 },
  { name: 'Quince (κυδώνι)', alias: 'κυδώνι quince φρούτο', kcal: 57, p: 0.4, c: 15, f: 0.1, fiber: 1.9, sugar: 12, sodium: 4, s: 90, u: 'piece', us: 90 },
  { name: 'Prickly pear (φραγκόσυκο)', alias: 'φραγκόσυκο prickly pear cactus fig', kcal: 41, p: 0.7, c: 9.6, f: 0.5, fiber: 3.6, sugar: 6, sodium: 5, s: 100, u: 'piece', us: 100 },

  // ── Vegetables / herbs (additional) ─────────────────────────────
  { name: 'Celery (σέλινο)', alias: 'σέλινο celery σέλερι λαχανικό', kcal: 16, p: 0.7, c: 3, f: 0.2, fiber: 1.6, sugar: 1.3, sodium: 80, s: 40 },
  { name: 'Parsley (μαϊντανός)', alias: 'μαϊντανός parsley βότανο', kcal: 36, p: 3, c: 6, f: 0.8, fiber: 3.3, sugar: 0.9, sodium: 56, s: 10 },
  { name: 'Dill (άνηθος)', alias: 'άνηθος dill βότανο', kcal: 43, p: 3.5, c: 7, f: 1.1, fiber: 2.1, sodium: 61, s: 10 },
  { name: 'Radish (ραπανάκι)', alias: 'ραπανάκι radish ραπάνι λαχανικό', kcal: 16, p: 0.7, c: 3.4, f: 0.1, fiber: 1.6, sugar: 1.9, sodium: 39, s: 50 },
  { name: 'Spring onion (φρέσκο κρεμμυδάκι)', alias: 'φρέσκο κρεμμυδάκι spring onion scallion', kcal: 32, p: 1.8, c: 7.3, f: 0.2, fiber: 2.6, sugar: 2.3, sodium: 16, s: 15 },
  { name: 'Cherry tomatoes (ντοματίνια)', alias: 'ντοματίνια cherry tomatoes ντομάτα', kcal: 18, p: 0.9, c: 3.9, f: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, s: 100 },
  { name: 'Purslane (γλιστρίδα)', alias: 'γλιστρίδα purslane αντράκλα χόρτο', kcal: 20, p: 2, c: 3.4, f: 0.4, fiber: 1, sodium: 45, s: 100 },

  // ── Pantry / cooking (additional) ───────────────────────────────
  { name: 'Flour, all-purpose (αλεύρι)', alias: 'αλεύρι flour φαρίνα σιτάλευρο', kcal: 364, p: 10, c: 76, f: 1, fiber: 2.7, sugar: 0.3, sodium: 2, s: 30 },
  { name: 'Cornstarch (κορν φλάουρ)', alias: 'κορν φλάουρ cornstarch cornflour άμυλο', kcal: 381, p: 0.3, c: 91, f: 0.1, sodium: 9, s: 10 },
  { name: 'Yeast, dry (μαγιά)', alias: 'μαγιά yeast ζύμη ξηρή', kcal: 325, p: 40, c: 41, f: 7.6, fiber: 27, sodium: 51, s: 7 },
  { name: 'Vinegar (ξύδι)', alias: 'ξύδι vinegar wine vinegar', kcal: 18, p: 0, c: 0.9, f: 0, sodium: 2, s: 15 },
  { name: 'Balsamic vinegar (βαλσάμικο)', alias: 'βαλσάμικο balsamic vinegar ξύδι', kcal: 88, p: 0.5, c: 17, f: 0, sugar: 15, sodium: 23, s: 15 },
  { name: 'Margarine (μαργαρίνη)', alias: 'μαργαρίνη margarine βιτάμ soft benecol', kcal: 717, p: 0.2, c: 0.7, f: 81, sodium: 700, satfat: 16, s: 10 },
  { name: 'Sunflower oil (ηλιέλαιο)', alias: 'ηλιέλαιο sunflower oil σπορέλαιο λάδι', kcal: 884, p: 0, c: 0, f: 100, sodium: 0, satfat: 11, s: 10 },
  { name: 'Corn / seed oil (καλαμποκέλαιο)', alias: 'καλαμποκέλαιο σπορέλαιο corn oil vegetable oil', kcal: 884, p: 0, c: 0, f: 100, sodium: 0, satfat: 13, s: 10 },
  { name: 'Capers (κάπαρη)', alias: 'κάπαρη capers τουρσί', kcal: 23, p: 2.4, c: 5, f: 0.9, fiber: 3.2, sodium: 2000, s: 15 },
  { name: 'Pickled vegetables (τουρσί)', alias: 'τουρσί pickled vegetables πίκλα', kcal: 20, p: 1, c: 4, f: 0.2, fiber: 1.5, sodium: 1200, s: 50 },
  { name: 'Phyllo pastry (φύλλο κρούστας)', alias: 'φύλλο κρούστας phyllo filo pastry σφολιάτας', kcal: 290, p: 8, c: 52, f: 5, fiber: 2, sodium: 400, s: 60 },
  { name: 'Trahana, dry (τραχανάς)', alias: 'τραχανάς trahana ξινός γλυκός', kcal: 360, p: 13, c: 66, f: 4, fiber: 3, sodium: 300, s: 60 },
  { name: 'Hilopites, dry (χυλοπίτες)', alias: 'χυλοπίτες hilopites egg noodles ζυμαρικά', kcal: 365, p: 13, c: 71, f: 3, fiber: 3, sodium: 20, s: 80 },
  { name: 'Orzo, dry (κριθαράκι)', alias: 'κριθαράκι orzo ζυμαρικά manestra', kcal: 360, p: 12, c: 72, f: 1.5, fiber: 3, sodium: 5, s: 80 },
  { name: 'Melba toast / rusks (φρυγανιές)', alias: 'φρυγανιές melba toast παπαδοπούλου toasted bread', kcal: 400, p: 12, c: 72, f: 6, fiber: 5, sugar: 5, sodium: 600, s: 15, u: 'piece', us: 8 },

  // ── Protein / gym (additional) ──────────────────────────────────
  { name: 'Casein protein powder', alias: 'casein καζεΐνη πρωτεΐνη powder', kcal: 360, p: 80, c: 5, f: 2, sodium: 200, s: 30 },
  { name: 'Protein pancake mix (dry)', alias: 'protein pancake mix πρωτεΐνης τηγανίτες', kcal: 370, p: 30, c: 45, f: 6, fiber: 3, sugar: 6, sodium: 400, s: 50 },
  { name: 'Protein cookie', alias: 'protein cookie μπισκότο πρωτεΐνης', kcal: 380, p: 20, c: 40, f: 15, fiber: 5, sugar: 8, sodium: 300, satfat: 5, s: 60, u: 'cookie', us: 60 },
  { name: 'Protein shake, ready-to-drink', alias: 'protein shake ρόφημα πρωτεΐνης ready to drink rtd', kcal: 62, p: 10, c: 4, f: 0.8, sugar: 2, sodium: 90, s: 330 },
  { name: 'Protein ice cream', alias: 'protein ice cream παγωτό πρωτεΐνης', kcal: 130, p: 10, c: 15, f: 3, fiber: 3, sugar: 6, sodium: 90, s: 100 },
  { name: 'Creatine monohydrate', alias: 'creatine κρεατίνη monohydrate συμπλήρωμα', kcal: 0, p: 0, c: 0, f: 0, sodium: 0, s: 5 },
  { name: 'Protein chips', alias: 'protein chips τσιπς πρωτεΐνης quest', kcal: 380, p: 40, c: 30, f: 10, fiber: 6, sodium: 500, s: 30, u: 'pack', us: 30 },
  { name: 'Nut & seed bar (KIND-style)', alias: 'kind bar μπάρα ξηρών καρπών nut bar', kcal: 500, p: 12, c: 45, f: 30, fiber: 6, sugar: 20, sodium: 90, satfat: 4, s: 40, u: 'bar', us: 40 },

  // ── Rhodes / regional specialties ───────────────────────────────
  { name: 'Melekouni (μελεκούνι)', alias: 'μελεκούνι melekouni ρόδος σουσάμι μέλι sesame honey bar', kcal: 480, p: 12, c: 50, f: 26, fiber: 6, sugar: 35, sodium: 20, satfat: 4, s: 40, u: 'piece', us: 40 },
  { name: 'Pitaroudia (πιταρούδια)', alias: 'πιταρούδια pitaroudia ρόδος ρεβίθια κεφτέδες fritters', kcal: 230, p: 6, c: 25, f: 12, fiber: 3, sodium: 300, s: 100, u: 'piece', us: 40 },
  { name: 'Soumada (σουμάδα)', alias: 'σουμάδα soumada αμύγδαλο ρόφημα almond drink', kcal: 180, p: 1, c: 30, f: 6, sugar: 28, sodium: 5, s: 200 },
  { name: 'Shrimp saganaki (γαρίδες σαγανάκι)', alias: 'γαρίδες σαγανάκι shrimp saganaki φέτα ντομάτα', kcal: 120, p: 12, c: 4, f: 6, sodium: 500, satfat: 2.5, s: 250 },
  { name: 'Octopus in wine (χταπόδι κρασάτο)', alias: 'χταπόδι κρασάτο octopus wine στιφάδο', kcal: 140, p: 18, c: 4, f: 5, sodium: 500, satfat: 1, s: 200 },
  { name: 'Stuffed eggplant (μελιτζάνες παπουτσάκια)', alias: 'μελιτζάνες παπουτσάκια γεμιστές stuffed eggplant', kcal: 130, p: 4, c: 10, f: 8, fiber: 3, sodium: 300, satfat: 2.5, s: 250 },
  { name: 'Skordalia (σκορδαλιά)', alias: 'σκορδαλιά skordalia garlic dip πατάτα σκόρδο', kcal: 200, p: 2, c: 15, f: 15, fiber: 1.5, sodium: 400, satfat: 2, s: 60 }
];
