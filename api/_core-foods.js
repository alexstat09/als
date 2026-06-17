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
  { name: 'Egg, whole', alias: 'eggs αυγό αυγά', kcal: 143, p: 12.6, c: 0.7, f: 9.5, sugar: 0.4, sodium: 142, satfat: 3.1, s: 50 },
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
  { name: 'White rice, cooked', alias: 'ρύζι άσπρο basmati μπασμάτι jasmine', kcal: 130, p: 2.7, c: 28, f: 0.3, fiber: 0.4, sodium: 1, s: 150 },
  { name: 'White rice, dry', alias: 'ρύζι basmati μπασμάτι', kcal: 365, p: 7, c: 80, f: 0.7, fiber: 1.3, sodium: 5, s: 75 },
  { name: 'Brown rice, cooked', alias: 'ρύζι καστανό', kcal: 123, p: 2.7, c: 26, f: 1, fiber: 1.6, sodium: 4, s: 150 },
  { name: 'Oats, rolled dry', alias: 'oatmeal βρώμη πλιγούρι nutri valley', kcal: 389, p: 16.9, c: 66, f: 6.9, fiber: 10.6, sodium: 2, s: 50 },
  { name: 'Pasta, cooked', alias: 'ζυμαρικά μακαρόνια', kcal: 158, p: 5.8, c: 31, f: 0.9, fiber: 1.8, sodium: 1, s: 180 },
  { name: 'Pasta, dry', alias: 'ζυμαρικά μακαρόνια', kcal: 371, p: 13, c: 75, f: 1.5, fiber: 3.2, sodium: 6, s: 80 },
  { name: 'Bread, white', alias: 'ψωμί άσπρο italian bread d italiano', kcal: 265, p: 9, c: 49, f: 3.2, fiber: 2.7, sugar: 5, sodium: 491, s: 30 },
  { name: 'Bread, whole wheat', alias: 'ψωμί ολικής', kcal: 247, p: 13, c: 41, f: 3.4, fiber: 7, sugar: 6, sodium: 450, s: 30 },
  { name: 'Pita bread', alias: 'πίτα πίτα ψητή λαδωτή σουβλάκι αλαδωτη', kcal: 275, p: 9, c: 55, f: 1.2, fiber: 2.2, sodium: 536, s: 60 },
  { name: 'Couscous, cooked', alias: 'κουσκούς', kcal: 112, p: 3.8, c: 23, f: 0.2, fiber: 1.4, sodium: 5, s: 150 },
  { name: 'Quinoa, cooked', alias: 'κινόα', kcal: 120, p: 4.4, c: 21, f: 1.9, fiber: 2.8, sodium: 7, s: 150 },
  { name: 'Potato, boiled', alias: 'πατάτα βραστή', kcal: 87, p: 1.9, c: 20, f: 0.1, fiber: 1.8, sodium: 4, s: 200 },
  { name: 'Potato, raw', alias: 'πατάτα', kcal: 77, p: 2, c: 17, f: 0.1, fiber: 2.2, sodium: 6, s: 200 },
  { name: 'Sweet potato, baked', alias: 'γλυκοπατάτα', kcal: 90, p: 2, c: 21, f: 0.1, fiber: 3.3, sugar: 6.5, sodium: 36, s: 150 },
  { name: 'French fries', alias: 'τηγανητές πατάτες chips five guys fries', kcal: 312, p: 3.4, c: 41, f: 15, fiber: 3.8, sodium: 210, satfat: 2.3, s: 150 },

  // ── Fruit ───────────────────────────────────────────────────────
  { name: 'Banana', alias: 'μπανάνα', kcal: 89, p: 1.1, c: 23, f: 0.3, fiber: 2.6, sugar: 12, sodium: 1, s: 120 },
  { name: 'Apple', alias: 'μήλο', kcal: 52, p: 0.3, c: 14, f: 0.2, fiber: 2.4, sugar: 10, sodium: 1, s: 180 },
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
  { name: 'Chocolate wafer bar', alias: 'γκοφρέτα koukouroukou wafer καουα banofee lacta', kcal: 537, p: 6, c: 63, f: 29, sugar: 40, sodium: 90, satfat: 18, s: 20 },
  { name: 'Kinder Bueno', alias: 'kinder bueno σοκολάτα', kcal: 565, p: 8.6, c: 49.5, f: 37, sugar: 40, sodium: 120, satfat: 19, s: 21 },
  { name: 'Ferrero Rocher', alias: 'rocher ferrero', kcal: 585, p: 8, c: 46, f: 41, sugar: 41, sodium: 50, satfat: 13, s: 13 },
  { name: 'Lotus Biscoff cookies', alias: 'biscoff lotus speculoos μπισκότα', kcal: 484, p: 3.9, c: 72, f: 19.5, sugar: 38, sodium: 350, satfat: 9, s: 13 },
  { name: 'Speculoos / Biscoff spread', alias: 'speculoos speculoso lidl άλειμμα', kcal: 568, p: 4, c: 58, f: 35, sugar: 49, sodium: 380, satfat: 12, s: 20 },
  { name: 'Oreo cookies', alias: 'oreo oreos μπισκότα', kcal: 480, p: 4.3, c: 71, f: 20, sugar: 38, sodium: 380, satfat: 6, s: 34 },
  { name: 'Marzipan', alias: 'marzipan αμυγδαλόπαστα biermann', kcal: 470, p: 9, c: 50, f: 26, sugar: 45, sodium: 10, satfat: 2.5, s: 15 },
  { name: 'Gummy candy', alias: 'haribo starmix ζελεδάκια gummy bears καραμέλες', kcal: 343, p: 6.9, c: 77, f: 0.5, sugar: 47, sodium: 30, s: 25 },
  { name: 'Cupcake', alias: 'cupcake κεϊκάκι muffin', kcal: 349, p: 3.5, c: 50, f: 15, sugar: 32, sodium: 280, satfat: 5, s: 50 },
  { name: 'Chocolate chip cookie', alias: 'cookie μπισκότο choc chip cookies', kcal: 483, p: 5, c: 64, f: 23, sugar: 35, sodium: 320, satfat: 11, s: 30 },
  { name: 'Butter cookies', alias: 'biscotello μπισκότα βουτύρου cookies', kcal: 489, p: 6, c: 64, f: 22, sugar: 24, sodium: 300, satfat: 12, s: 30 },
  { name: 'Kormos (chocolate biscuit log)', alias: 'κορμός σπιτικός μωσαϊκό chocolate salami', kcal: 414, p: 5, c: 50, f: 21, sugar: 32, sodium: 120, satfat: 11, s: 50 },
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
  { name: 'Magnum ice cream bar', alias: 'magnum salted caramel almond παγωτό ξυλάκι', kcal: 287, p: 3.6, c: 30, f: 17, sugar: 27, sodium: 70, satfat: 11, s: 79 },
  { name: 'Ice cream cone (wafer)', alias: 'χωνάκι παγωτού wafer cone soyumgood', kcal: 388, p: 8, c: 80, f: 4, sugar: 6, sodium: 250, s: 5 },

  // ── Protein snacks / supplements ────────────────────────────────
  { name: 'Protein bar', alias: 'μπάρα πρωτεΐνης protein bar', kcal: 353, p: 33, c: 35, f: 9, fiber: 6, sugar: 4, sodium: 250, s: 60 },
  { name: 'Born Winner protein bar', alias: 'born winner protein bar strawberry cheesecake μπάρα', kcal: 347, p: 33, c: 36, f: 8, fiber: 5, sugar: 3, sodium: 220, s: 60 },
  { name: 'Hungry Not protein bar', alias: 'hungry not protein bar sdoukos σδούκος μπάρα', kcal: 390, p: 40, c: 35, f: 10, fiber: 6, sugar: 3, sodium: 250, s: 50 },
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
  { name: 'Sourdough bread', alias: 'sourdough προζυμένιο ψωμί lidl', kcal: 245, p: 9, c: 47, f: 2, fiber: 3, sodium: 480, s: 60 },
  { name: 'Rye sourdough bread', alias: 'σίτου σίκαλη προζύμι rye sourdough carrefour ψωμί', kcal: 247, p: 9, c: 47, f: 2.5, fiber: 6, sodium: 460, s: 50 },
  { name: 'Koulouri Thessalonikis', alias: 'κουλούρι θεσσαλονίκης σουσάμι sesame bread ring σκλαβενίτης', kcal: 296, p: 10, c: 55, f: 4, fiber: 3, sodium: 450, s: 70 },
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
  { name: 'Kiwi', alias: 'ακτινίδιο kiwi', kcal: 61, p: 1.1, c: 15, f: 0.5, fiber: 3, sugar: 9, sodium: 3, s: 75 },
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
  { name: 'Energy drink', alias: 'energy drink red bull ενεργειακό ποτό', kcal: 45, p: 0, c: 11, f: 0, sugar: 11, sodium: 40, s: 250 }
];
