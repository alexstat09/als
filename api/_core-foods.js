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
  { name: 'Tuna, canned in water', alias: 'τόνος κονσέρβα', kcal: 116, p: 26, c: 0, f: 0.8, sodium: 247, satfat: 0.2, s: 100 },
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
  { name: 'Greek yogurt, 0% plain', alias: 'γιαούρτι fat free total', kcal: 59, p: 10.3, c: 3.6, f: 0.4, sugar: 3.2, sodium: 36, s: 170 },
  { name: 'Greek yogurt, full fat', alias: 'γιαούρτι στραγγιστό', kcal: 97, p: 9, c: 4, f: 5, sugar: 4, sodium: 35, satfat: 3.3, s: 170 },
  { name: 'Cottage cheese, 2%', alias: 'cottage', kcal: 84, p: 11, c: 4.3, f: 2.3, sugar: 4.1, sodium: 330, satfat: 1.4, s: 150 },
  { name: 'Milk, semi-skimmed', alias: '2% γάλα ημίπαχο', kcal: 50, p: 3.4, c: 4.8, f: 2, sugar: 4.8, sodium: 44, satfat: 1.3, s: 250 },
  { name: 'Milk, whole', alias: 'γάλα πλήρες', kcal: 64, p: 3.2, c: 4.8, f: 3.6, sugar: 4.8, sodium: 43, satfat: 2.3, s: 250 },
  { name: 'Feta cheese', alias: 'φέτα', kcal: 265, p: 14, c: 4, f: 21, sugar: 4, sodium: 1140, satfat: 15, s: 50 },
  { name: 'Halloumi cheese', alias: 'χαλούμι', kcal: 321, p: 21, c: 2.2, f: 25, sodium: 1350, satfat: 17, s: 50 },
  { name: 'Cheddar cheese', alias: 'cheese τυρί', kcal: 403, p: 25, c: 1.3, f: 33, sodium: 621, satfat: 21, s: 30 },
  { name: 'Mozzarella cheese', alias: 'μοτσαρέλα', kcal: 280, p: 28, c: 3.1, f: 17, sodium: 627, satfat: 10, s: 30 },
  { name: 'Parmesan cheese', alias: 'παρμεζάνα', kcal: 431, p: 38, c: 4.1, f: 29, sodium: 1529, satfat: 19, s: 15 },
  { name: 'Butter', alias: 'βούτυρο', kcal: 717, p: 0.9, c: 0.1, f: 81, sodium: 11, satfat: 51, s: 10 },

  // ── Protein supplements / plant protein ─────────────────────────
  { name: 'Whey protein powder', alias: 'protein shake πρωτεΐνη', kcal: 400, p: 80, c: 8, f: 6, sugar: 5, sodium: 250, satfat: 2, s: 30 },
  { name: 'Tofu, firm', alias: 'τόφου', kcal: 144, p: 17, c: 3, f: 8, fiber: 2, sodium: 14, satfat: 1, s: 100 },
  { name: 'Lentils, cooked', alias: 'φακές', kcal: 116, p: 9, c: 20, f: 0.4, fiber: 8, sodium: 2, s: 200 },
  { name: 'Chickpeas, cooked', alias: 'ρεβίθια', kcal: 164, p: 8.9, c: 27, f: 2.6, fiber: 7.6, sodium: 7, s: 200 },
  { name: 'White beans, cooked', alias: 'φασόλια', kcal: 142, p: 9.7, c: 25, f: 0.4, fiber: 6.3, sodium: 2, s: 200 },

  // ── Grains / starches ───────────────────────────────────────────
  { name: 'White rice, cooked', alias: 'ρύζι άσπρο', kcal: 130, p: 2.7, c: 28, f: 0.3, fiber: 0.4, sodium: 1, s: 150 },
  { name: 'White rice, dry', alias: 'ρύζι', kcal: 365, p: 7, c: 80, f: 0.7, fiber: 1.3, sodium: 5, s: 75 },
  { name: 'Brown rice, cooked', alias: 'ρύζι καστανό', kcal: 123, p: 2.7, c: 26, f: 1, fiber: 1.6, sodium: 4, s: 150 },
  { name: 'Oats, rolled dry', alias: 'oatmeal βρώμη πλιγούρι', kcal: 389, p: 16.9, c: 66, f: 6.9, fiber: 10.6, sodium: 2, s: 50 },
  { name: 'Pasta, cooked', alias: 'ζυμαρικά μακαρόνια', kcal: 158, p: 5.8, c: 31, f: 0.9, fiber: 1.8, sodium: 1, s: 180 },
  { name: 'Pasta, dry', alias: 'ζυμαρικά μακαρόνια', kcal: 371, p: 13, c: 75, f: 1.5, fiber: 3.2, sodium: 6, s: 80 },
  { name: 'Bread, white', alias: 'ψωμί άσπρο', kcal: 265, p: 9, c: 49, f: 3.2, fiber: 2.7, sugar: 5, sodium: 491, s: 30 },
  { name: 'Bread, whole wheat', alias: 'ψωμί ολικής', kcal: 247, p: 13, c: 41, f: 3.4, fiber: 7, sugar: 6, sodium: 450, s: 30 },
  { name: 'Pita bread', alias: 'πίτα', kcal: 275, p: 9, c: 55, f: 1.2, fiber: 2.2, sodium: 536, s: 60 },
  { name: 'Couscous, cooked', alias: 'κουσκούς', kcal: 112, p: 3.8, c: 23, f: 0.2, fiber: 1.4, sodium: 5, s: 150 },
  { name: 'Quinoa, cooked', alias: 'κινόα', kcal: 120, p: 4.4, c: 21, f: 1.9, fiber: 2.8, sodium: 7, s: 150 },
  { name: 'Potato, boiled', alias: 'πατάτα βραστή', kcal: 87, p: 1.9, c: 20, f: 0.1, fiber: 1.8, sodium: 4, s: 200 },
  { name: 'Potato, raw', alias: 'πατάτα', kcal: 77, p: 2, c: 17, f: 0.1, fiber: 2.2, sodium: 6, s: 200 },
  { name: 'Sweet potato, baked', alias: 'γλυκοπατάτα', kcal: 90, p: 2, c: 21, f: 0.1, fiber: 3.3, sugar: 6.5, sodium: 36, s: 150 },
  { name: 'French fries', alias: 'τηγανητές πατάτες chips', kcal: 312, p: 3.4, c: 41, f: 15, fiber: 3.8, sodium: 210, satfat: 2.3, s: 150 },

  // ── Fruit ───────────────────────────────────────────────────────
  { name: 'Banana', alias: 'μπανάνα', kcal: 89, p: 1.1, c: 23, f: 0.3, fiber: 2.6, sugar: 12, sodium: 1, s: 120 },
  { name: 'Apple', alias: 'μήλο', kcal: 52, p: 0.3, c: 14, f: 0.2, fiber: 2.4, sugar: 10, sodium: 1, s: 180 },
  { name: 'Orange', alias: 'πορτοκάλι', kcal: 47, p: 0.9, c: 12, f: 0.1, fiber: 2.4, sugar: 9, sodium: 0, s: 150 },
  { name: 'Strawberries', alias: 'φράουλες', kcal: 32, p: 0.7, c: 7.7, f: 0.3, fiber: 2, sugar: 4.9, sodium: 1, s: 150 },
  { name: 'Grapes', alias: 'σταφύλι', kcal: 69, p: 0.7, c: 18, f: 0.2, fiber: 0.9, sugar: 16, sodium: 2, s: 120 },
  { name: 'Watermelon', alias: 'καρπούζι', kcal: 30, p: 0.6, c: 7.6, f: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1, s: 200 },
  { name: 'Dates', alias: 'χουρμάδες', kcal: 277, p: 1.8, c: 75, f: 0.2, fiber: 6.7, sugar: 66, sodium: 1, s: 24 },
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
  { name: 'Bell pepper', alias: 'πιπεριά', kcal: 31, p: 1, c: 6, f: 0.3, fiber: 2.1, sugar: 4.2, sodium: 4, s: 100 },
  { name: 'Carrot', alias: 'καρότο', kcal: 41, p: 0.9, c: 10, f: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69, s: 80 },
  { name: 'Zucchini', alias: 'κολοκύθι', kcal: 17, p: 1.2, c: 3.1, f: 0.3, fiber: 1, sugar: 2.5, sodium: 8, s: 120 },
  { name: 'Eggplant', alias: 'μελιτζάνα', kcal: 25, p: 1, c: 6, f: 0.2, fiber: 3, sugar: 3.5, sodium: 2, s: 120 },
  { name: 'Green beans', alias: 'φασολάκια', kcal: 31, p: 1.8, c: 7, f: 0.2, fiber: 2.7, sugar: 3.3, sodium: 6, s: 150 },
  { name: 'Mushrooms', alias: 'μανιτάρια', kcal: 22, p: 3.1, c: 3.3, f: 0.3, fiber: 1, sodium: 5, s: 100 },
  { name: 'Olives', alias: 'ελιές kalamata', kcal: 115, p: 0.8, c: 6, f: 11, fiber: 3.2, sodium: 1556, satfat: 1.4, s: 30 },

  // ── Greek / prepared (typical values; use AI Describe for precision) ──
  { name: 'Tzatziki', alias: 'τζατζίκι', kcal: 100, p: 3, c: 4, f: 8, sodium: 320, satfat: 3, s: 60 },
  { name: 'Hummus', alias: 'χούμους', kcal: 166, p: 8, c: 14, f: 10, fiber: 6, sodium: 379, s: 60 },
  { name: 'Pork gyros, meat', alias: 'γύρος χοιρινό', kcal: 215, p: 18, c: 3, f: 14, sodium: 600, satfat: 5, s: 150 },
  { name: 'Chicken gyros, meat', alias: 'γύρος κοτόπουλο', kcal: 175, p: 22, c: 2, f: 9, sodium: 520, satfat: 2.5, s: 150 },
  { name: 'Pork souvlaki, cooked', alias: 'σουβλάκι καλαμάκι χοιρινό', kcal: 195, p: 27, c: 1, f: 9, sodium: 380, satfat: 3, s: 100 },
  { name: 'Greek salad, dressed', alias: 'χωριάτικη σαλάτα', kcal: 110, p: 3, c: 5, f: 9, fiber: 1.5, sodium: 420, s: 200 },
  { name: 'Spanakopita', alias: 'σπανακόπιτα', kcal: 254, p: 6, c: 22, f: 16, fiber: 1.8, sodium: 480, satfat: 6, s: 120 },
  { name: 'Honey', alias: 'μέλι', kcal: 304, p: 0.3, c: 82, f: 0, sugar: 82, sodium: 4, s: 21 }
];
