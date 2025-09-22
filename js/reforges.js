const reforges = [
  // Sword (9 reforges)
  {
    name: "Gentle",
    itemTypes: ["Sword"],
    stats: {
      Common: { Strength: +3, "Attack Speed": +8 },
      Uncommon: { Strength: +5, "Attack Speed": +10 },
      Rare: { Strength: +7, "Attack Speed": +15 },
      Epic: { Strength: +10, "Attack Speed": +20 },
      Legendary: { Strength: +15, "Attack Speed": +25 },
      Special: { Strength: +20, "Attack Speed": +30 }
    }
  },
  {
    name: "Odd",
    itemTypes: ["Sword"],
    stats: {
      Common: { "Critical Chance": +12, "Critical Damage": +10, Intelligence: -5 },
      Uncommon: { "Critical Chance": +15, "Critical Damage": +15, Intelligence: -10 },
      Rare: { "Critical Chance": +15, "Critical Damage": +15, Intelligence: -18 },
      Epic: { "Critical Chance": +20, "Critical Damage": +22, Intelligence: -32 },
      Legendary: { "Critical Chance": +25, "Critical Damage": +30, Intelligence: -50 },
      Special: { "Critical Chance": +30, "Critical Damage": +40, Intelligence: -75 }
    }
  },
  {
    name: "Fast",
    itemTypes: ["Sword"],
    stats: {
      Common: { "Attack Speed": +10 },
      Uncommon: { "Attack Speed": +20 },
      Rare: { "Attack Speed": +30 },
      Epic: { "Attack Speed": +40 },
      Legendary: { "Attack Speed": +50 },
      Special: { "Attack Speed": +60 }
    }
  },
  {
    name: "Fair",
    itemTypes: ["Sword"],
    stats: {
      Common: { Strength: +2, "Critical Chance": +2, "Critical Damage": +2, Intelligence: +2, "Attack Speed": +2 },
      Uncommon: { Strength: +3, "Critical Chance": +3, "Critical Damage": +3, Intelligence: +3, "Attack Speed": +3 },
      Rare: { Strength: +4, "Critical Chance": +4, "Critical Damage": +4, Intelligence: +4, "Attack Speed": +4 },
      Epic: { Strength: +7, "Critical Chance": +7, "Critical Damage": +7, Intelligence: +7, "Attack Speed": +7 },
      Legendary: { Strength: +10, "Critical Chance": +10, "Critical Damage": +10, Intelligence: +10, "Attack Speed": +10 },
      Special: { Strength: +12, "Critical Chance": +12, "Critical Damage": +12, Intelligence: +12, "Attack Speed": +12 }
    }
  },
  {
    name: "Epic",
    itemTypes: ["Sword"],
    stats: {
      Common: { Strength: +15, "Critical Damage": +10, "Attack Speed": +1 },
      Uncommon: { Strength: +20, "Critical Damage": +15, "Attack Speed": +2 },
      Rare: { Strength: +25, "Critical Damage": +20, "Attack Speed": +4 },
      Epic: { Strength: +32, "Critical Damage": +27, "Attack Speed": +7 },
      Legendary: { Strength: +40, "Critical Damage": +35, "Attack Speed": +10 },
      Special: { Strength: +50, "Critical Damage": +45, "Attack Speed": +15 }
    }
  },
  {
    name: "Sharp",
    itemTypes: ["Sword"],
    stats: {
      Common: { "Critical Chance": +10, "Critical Damage": +20 },
      Uncommon: { "Critical Chance": +12, "Critical Damage": +30 },
      Rare: { "Critical Chance": +14, "Critical Damage": +40 },
      Epic: { "Critical Chance": +17, "Critical Damage": +55 },
      Legendary: { "Critical Chance": +20, "Critical Damage": +75 },
      Special: { "Critical Chance": +25, "Critical Damage": +90 }
    }
  },
  {
    name: "Heroic",
    itemTypes: ["Sword"],
    stats: {
      Common: { Strength: +15, Intelligence: +40, "Attack Speed": +1 },
      Uncommon: { Strength: +20, Intelligence: +50, "Attack Speed": +2 },
      Rare: { Strength: +25, Intelligence: +65, "Attack Speed": +2 },
      Epic: { Strength: +32, Intelligence: +80, "Attack Speed": +3 },
      Legendary: { Strength: +40, Intelligence: +100, "Attack Speed": +5 },
      Special: { Strength: +50, Intelligence: +125, "Attack Speed": +7 }
    }
  },
  {
    name: "Spicy",
    itemTypes: ["Sword"],
    stats: {
      Common: { Strength: +2, "Critical Chance": +1, "Critical Damage": +25, "Attack Speed": +1 },
      Uncommon: { Strength: +3, "Critical Chance": +1, "Critical Damage": +35, "Attack Speed": +2 },
      Rare: { Strength: +4, "Critical Chance": +1, "Critical Damage": +45, "Attack Speed": +4 },
      Epic: { Strength: +7, "Critical Chance": +1, "Critical Damage": +60, "Attack Speed": +7 },
      Legendary: { Strength: +10, "Critical Chance": +1, "Critical Damage": +80, "Attack Speed": +10 },
      Special: { Strength: +12, "Critical Chance": +1, "Critical Damage": +100, "Attack Speed": +15 }
    }
  },
  {
    name: "Legendary",
    itemTypes: ["Sword"],
    stats: {
      Common: { Strength: +3, "Critical Chance": +5, "Critical Damage": +5, Intelligence: +5, "Attack Speed": +2 },
      Uncommon: { Strength: +7, "Critical Chance": +7, "Critical Damage": +10, Intelligence: +8, "Attack Speed": +3 },
      Rare: { Strength: +12, "Critical Chance": +9, "Critical Damage": +15, Intelligence: +12, "Attack Speed": +5 },
      Epic: { Strength: +18, "Critical Chance": +12, "Critical Damage": +22, Intelligence: +18, "Attack Speed": +7 },
      Legendary: { Strength: +25, "Critical Chance": +15, "Critical Damage": +28, Intelligence: +28, "Attack Speed": +10 },
      Special: { Strength: +32, "Critical Chance": +18, "Critical Damage": +36, Intelligence: +36, "Attack Speed": +15 }
    }
  },
  // Sword Reforges End
  // Armor (9 reforges)
  {
    name: "Clean",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +5, Defense: +5, "Critical Chance": +2 },
      Uncommon: { Health: +7, Defense: +7, "Critical Chance": +4 },
      Rare: { Health: +10, Defense: +10, "Critical Chance": +6 },
      Epic: { Health: +15, Defense: +15, "Critical Chance": +8 },
      Legendary: { Health: +20, Defense: +20, "Critical Chance": +10 },
      Special: { Health: +25, Defense: +25, "Critical Chance": +12 }
    }
  },
  {
    name: "Fierce",
    itemTypes: ["Armor"],
    stats: {
      Common: { Strength: +2, "Critical Chance": +2, "Critical Damage": +4 },
      Uncommon: { Strength: +4, "Critical Chance": +3, "Critical Damage": +7 },
      Rare: { Strength: +6, "Critical Chance": +4, "Critical Damage": +10 },
      Epic: { Strength: +8, "Critical Chance": +5, "Critical Damage": +14 },
      Legendary: { Strength: +10, "Critical Chance": +6, "Critical Damage": +18 },
      Special: { Strength: +12, "Critical Chance": +8, "Critical Damage": +24 }
    }
  },
  {
    name: "Heavy",
    itemTypes: ["Armor"],
    stats: {
      Common: { Defense: +25, Speed: -1, "Critical Damage": -1 },
      Uncommon: { Defense: +35, Speed: -1, "Critical Damage": -2 },
      Rare: { Defense: +50, Speed: -1, "Critical Damage": -2 },
      Epic: { Defense: +60, Speed: -1, "Critical Damage": -3 },
      Legendary: { Defense: +80, Speed: -1, "Critical Damage": -5 },
      Special: { Defense: +110, Speed: -1, "Critical Damage": -7 }
    }
  },
  {
    name: "Light",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +5, Defense: +1, Speed: +1, "Critical Chance": +1, "Critical Damage": +1, "Attack Speed": +1 },
      Uncommon: { Health: +7, Defense: +2, Speed: +2, "Critical Chance": +1, "Critical Damage": +2, "Attack Speed": +2 },
      Rare: { Health: +10, Defense: +3, Speed: +3, "Critical Chance": +2, "Critical Damage": +3, "Attack Speed": +3 },
      Epic: { Health: +15, Defense: +4, Speed: +4, "Critical Chance": +2, "Critical Damage": +4, "Attack Speed": +4 },
      Legendary: { Health: +20, Defense: +5, Speed: +5, "Critical Chance": +3, "Critical Damage": +5, "Attack Speed": +5 },
      Special: { Health: +25, Defense: +6, Speed: +6, "Critical Chance": +3, "Critical Damage": +6, "Attack Speed": +6 }
    }
  },
  {
    name: "Mythic",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +2, Defense: +2, Strength: +2, Speed: +2, "Critical Chance": +1, Intelligence: +20 },
      Uncommon: { Health: +4, Defense: +4, Strength: +4, Speed: +2, "Critical Chance": +2, Intelligence: +25 },
      Rare: { Health: +6, Defense: +6, Strength: +6, Speed: +2, "Critical Chance": +3, Intelligence: +30 },
      Epic: { Health: +8, Defense: +8, Strength: +8, Speed: +2, "Critical Chance": +4, Intelligence: +40 },
      Legendary: { Health: +10, Defense: +10, Strength: +10, Speed: +2, "Critical Chance": +5, Intelligence: +50 },
      Special: { Health: +12, Defense: +12, Strength: +12, Speed: +2, "Critical Chance": +6, Intelligence: +60 }
    }
  },
  {
    name: "Pure",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +2, Defense: +2, Strength: +2, Speed: +1, "Critical Chance": +2, "Critical Damage": +2, "Attack Speed": +1, Intelligence: +2 },
      Uncommon: { Health: +4, Defense: +4, Strength: +4, Speed: +1, "Critical Chance": +4, "Critical Damage": +3, "Attack Speed": +1, Intelligence: +3 },
      Rare: { Health: +6, Defense: +6, Strength: +6, Speed: +1, "Critical Chance": +6, "Critical Damage": +4, "Attack Speed": +2, Intelligence: +4 },
      Epic: { Health: +8, Defense: +8, Strength: +8, Speed: +1, "Critical Chance": +8, "Critical Damage": +6, "Attack Speed": +3, Intelligence: +6 },
      Legendary: { Health: +10, Defense: +10, Strength: +10, Speed: +1, "Critical Chance": +10, "Critical Damage": +8, "Attack Speed": +4, Intelligence: +8 },
      Special: { Health: +12, Defense: +12, Strength: +12, Speed: +1, "Critical Chance": +12, "Critical Damage": +8, "Attack Speed": +5, Intelligence: +10 }
    }
  },
  {
    name: "Smart",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +4, Defense: +4, Intelligence: +20 },
      Uncommon: { Health: +6, Defense: +6, Intelligence: +40 },
      Rare: { Health: +9, Defense: +9, Intelligence: +60 },
      Epic: { Health: +12, Defense: +12, Intelligence: +80 },
      Legendary: { Health: +15, Defense: +15, Intelligence: +100 },
      Special: { Health: +20, Defense: +20, Intelligence: +120 }
    }
  },
  {
    name: "Titanic",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +10, Defense: +10 },
      Uncommon: { Health: +15, Defense: +15 },
      Rare: { Health: +20, Defense: +20 },
      Epic: { Health: +25, Defense: +25 },
      Legendary: { Health: +35, Defense: +35 },
      Special: { Health: +50, Defense: +50 }
    }
  },
  {
    name: "Wise",
    itemTypes: ["Armor"],
    stats: {
      Common: { Health: +6, Speed: +1, Intelligence: +25 },
      Uncommon: { Health: +8, Speed: +1, Intelligence: +50 },
      Rare: { Health: +10, Speed: +1, Intelligence: +75 },
      Epic: { Health: +12, Speed: +2, Intelligence: +100 },
      Legendary: { Health: +15, Speed: +2, Intelligence: +125 },
      Special: { Health: +20, Speed: +3, Intelligence: +150 }
    }
  },
  // Armor Reforges End
  // Axe (5 reforges)
  {
    name: "Great",
    itemTypes: ["Axe"],
    stats: {
      Common: { Speed: +1, Strength: +2, "Critical Damage": +2 },
      Uncommon: { Speed: +2, Strength: +4, "Critical Damage": +4 },
      Rare: { Speed: +3, Strength: +6, "Critical Damage": +6 },
      Epic: { Speed: +4, Strength: +9, "Critical Damage": +9 },
      Legendary: { Speed: +5, Strength: +12, "Critical Damage": +12 },
      Special: { Speed: +7, Strength: +16, "Critical Damage": +16 }
    }
  },
  {
    name: "Rugged",
    itemTypes: ["Axe"],
    stats: {
      Common: { Strength: +4, "Critical Damage": +3 },
      Uncommon: { Strength: +6, "Critical Damage": +5 },
      Rare: { Strength: +9, "Critical Damage": +8 },
      Epic: { Strength: +13, "Critical Damage": +12 },
      Legendary: { Strength: +18, "Critical Damage": +16 },
      Special: { Strength: +24, "Critical Damage": +22 }
    }
  },
  {
    name: "Lush",
    itemTypes: ["Axe"],
    stats: {
      Common: { Speed: 3, Fortune: 1 },
      Uncommon: { Speed: 4, Fortune: 1 },
      Rare: { Speed: 5, Fortune: 2 },
      Epic: { Speed: 7, Fortune: 2 },
      Legendary: { Speed: 10, Fortune: 3 },
      Special: { Speed: 15, Fortune: 5 }
    }
  },
  {
    name: "Double-Bit",
    itemTypes: ["Axe"],
    stats: {
      Common: { Speed: 1, Fortune: 1 },
      Uncommon: { Speed: 2, Fortune: 2 },
      Rare: { Speed: 3, Fortune: 3 },
      Epic: { Speed: 5, Fortune: 4 },
      Legendary: { Speed: 7, Fortune: 5 },
      Special: { Speed: 9, Fortune: 6 }
    }
  },
  {
    name: "Lumberjack's",
    itemTypes: ["Axe"],
    stats: {
      Common: { Speed: +1 },
      Uncommon: { Speed: +2 },
      Rare: { Speed: +3 },
      Epic: { Speed: +5 },
      Legendary: { Speed: +7 },
      Special: { Speed: +9 }
    }
  },
  // Axe Reforges End
  // Hoe (4 reforges)
  {
    name: "Green Thumb",
    itemTypes: ["Hoe"],
    stats: {
      Common: { Speed: +1, Fortune: +1 },
      Uncommon: { Speed: +2, Fortune: +2 },
      Rare: { Speed: +3, Fortune: +3 },
      Epic: { Speed: +5, Fortune: +4 },
      Legendary: { Speed: +7, Fortune: +5 },
      Special: { Speed: +9, Fortune: +6 }
    }
  },
  {
    name: "Robust",
    itemTypes: ["Hoe"],
    stats: {
      Common: { Fortune: +2 },
      Uncommon: { Fortune: +3 },
      Rare: { Fortune: +4 },
      Epic: { Fortune: +6 },
      Legendary: { Fortune: +8 },
      Special: { Fortune: +10 }
    }
  },
  {
    name: "Zooming",
    itemTypes: ["Hoe"],
    stats: {
      Common: { Speed: +5 },
      Uncommon: { Speed: +8 },
      Rare: { Speed: +12 },
      Epic: { Speed: +16 },
      Legendary: { Speed: +20 },
      Special: { Speed: +25 }
    }
  },
  {
    name: "Peasant's",
    itemTypes: ["Hoe"],
    stats: {
      Common: { Speed: +1 },
      Uncommon: { Speed: +2 },
      Rare: { Speed: +3 },
      Epic: { Speed: +5 },
      Legendary: { Speed: +7 },
      Special: { Speed: +9 }
    }
  },
  // Hoe Reforges End
  // Accessory (18 reforges)
  {
    name: "Bizarre",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Health: +1, Strength: +1, "Critical Damage": -1, Intelligence: +6 },
      Uncommon: { Health: +1, Strength: +2, "Critical Damage": -2, Intelligence: +8 },
      Rare: { Health: +1, Strength: +2, "Critical Damage": -2, Intelligence: +10 },
      Epic: { Health: +1, Strength: +3, "Critical Damage": -3, Intelligence: +14 },
      Legendary: { Health: +1, Strength: +5, "Critical Damage": -5, Intelligence: +20 },
      Special: { Health: +1, Strength: +2, "Critical Damage": -2, Intelligence: +10 }
    }
  },
  {
    name: "Itchy",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Strength: +1, "Critical Damage": +3 },
      Uncommon: { Strength: +1, "Critical Damage": +4 },
      Rare: { Strength: +1, "Critical Damage": +5, "Attack Speed": +1 },
      Epic: { Strength: +2, "Critical Damage": +7, "Attack Speed": +1 },
      Legendary: { Strength: +3, "Critical Damage": +10, "Attack Speed": +1 },
      Special: { Strength: +1, "Critical Damage": +5, "Attack Speed": +1 }
    }
  },
  {
    name: "Ominous",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1 },
      Uncommon: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Intelligence: +1 },
      Rare: { Health: +2, Defense: +1, Strength: +1, "Critical Damage": +1, Intelligence: +2 },
      Epic: { Health: +3, Defense: +2, Strength: +2, "Critical Damage": +1, Intelligence: +3 },
      Legendary: { Health: +4, Defense: +3, Strength: +3, "Critical Damage": +1, Intelligence: +4 },
      Special: { Health: +2, Defense: +1, Strength: +1, "Critical Damage": +1, Intelligence: +2 }
    }
  },
  {
    name: "Pleasant",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Defense: +4 },
      Uncommon: { Defense: +5 },
      Rare: { Defense: +7 },
      Epic: { Defense: +10 },
      Legendary: { Defense: +15 },
      Special: { Defense: +7 }
    }
  },
  {
    name: "Pretty",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Health: +1, Intelligence: +3 },
      Uncommon: { Health: +1, Intelligence: +4 },
      Rare: { Health: +2, Intelligence: +6, "Attack Speed": +1 },
      Epic: { Health: +2, Speed: +1, Intelligence: +9, "Attack Speed": +1 },
      Legendary: { Health: +3, Speed: +1, Intelligence: +13, "Attack Speed": +1 },
      Special: { Health: +2, Intelligence: +6, "Attack Speed": +1 }
    }
  },
  {
    name: "Shiny",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Health: +4, Intelligence: +1 },
      Uncommon: { Health: +5, Intelligence: +2 },
      Rare: { Health: +7, Intelligence: +2 },
      Epic: { Health: +10, Intelligence: +3l },
      Legendary: { Health: +15, Intelligence: +5 },
      Special: { Health: +7, Intelligence: +2 }
    }
  },
  {
    name: "Simple",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Speed: +1, Intelligence: +1 },
      Uncommon: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Speed: +1, Intelligence: +1 },
      Rare: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Speed: +1, Intelligence: +1 },
      Epic: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Speed: +1, Intelligence: +1 },
      Legendary: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Speed: +1, Intelligence: +1 },
      Special: { Health: +1, Defense: +1, Strength: +1, "Critical Damage": +1, Speed: +1, Intelligence: +1 }
    }
  },
  {
    name: "Strange",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Strength: +2, "Critical Damage": +1, Speed: +1, Intelligence: +1, "Attack Speed": -1 },
      Uncommon: { Defense: +3, Strength: +1, "Critical Damage": +2, Intelligence: -1, "Attack Speed": +2 },
      Rare: { Defense: +2, Strength: -1, Speed: +1, Intelligence: +2 },
      Epic: { Defense: -1, Strength: +3, "Critical Damage": +1, "Attack Speed": +4 },
      Legendary: { Defense: +1, Speed: +3, "Critical Damage": +7, Intelligence: +8 },
      Special: { Defense: +2, Strength: -1, Speed: +1, Intelligence: +2 }
    }
  },
  {
    name: "Vivid",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Godly",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Demonic",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Forceful",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Hurtful",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Keen",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Strong",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Superior",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Unpleasant",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Zealous",
    itemTypes: ["Accessory"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  // Accessory Reforges End
  // Bow + Boomerang (9 reforges)
  {
    name: "Deadly",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { "Critical Chance": +10, "Critical Damage": +5 },
      Uncommon: { "Critical Chance": +13, "Critical Damage": +10 },
      Rare: { "Critical Chance": +16, "Critical Damage": +18 },
      Epic: { "Critical Chance": +19, "Critical Damage": +32 },
      Legendary: { "Critical Chance": +22, "Critical Damage": +50 },
      Special: { "Critical Chance": +29, "Critical Damage": +78 }
    }
  },
  {
    name: "Fine",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Strength: +3,"Critical Chance": +5, "Critical Damage": +2 },
      Uncommon: { Strength: +7,"Critical Chance": +7, "Critical Damage": +4 },
      Rare: { Strength: +12,"Critical Chance": +9, "Critical Damage": +7 },
      Epic: { Strength: +18,"Critical Chance": +12, "Critical Damage": +10 },
      Legendary: { Strength: +25,"Critical Chance": +15, "Critical Damage": +15 },
      Special: { Strength: +33,"Critical Chance": +18, "Critical Damage": +20 }
    }
  },
  {
    name: "Grand",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Strength: +25 },
      Uncommon: { Strength: +32 },
      Rare: { Strength: +40 },
      Epic: { Strength: +50 },
      Legendary: { Strength: +60 },
      Special: { Strength: +75 }
    }
  },
  {
    name: "Hasty",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Strength: +3, "Critical Chance": +20 },
      Uncommon: { Strength: +5, "Critical Chance": +25 },
      Rare: { Strength: +7, "Critical Chance": +30 },
      Epic: { Strength: +10, "Critical Chance": +40 },
      Legendary: { Strength: +15, "Critical Chance": +50 },
      Special: { Strength: +20, "Critical Chance": +75 }
    }
  },
  {
    name: "Neat",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { "Critical Chance": +10, "Critical Damage": +4, Intelligence: +3 },
      Uncommon: { "Critical Chance": +12, "Critical Damage": +8, Intelligence: +6 },
      Rare: { "Critical Chance": +14, "Critical Damage": +14, Intelligence: +10 },
      Epic: { "Critical Chance": +17, "Critical Damage": +20, Intelligence: +15 },
      Legendary: { "Critical Chance": +20, "Critical Damage": +30, Intelligence: +20 },
      Special: { "Critical Chance": +26, "Critical Damage": +40, Intelligence: +25 }
    }
  },
  {
    name: "Rapid",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Strength: +2, "Critical Damage": +35 },
      Uncommon: { Strength: +3, "Critical Damage": +45 },
      Rare: { Strength: +4, "Critical Damage": +55 },
      Epic: { Strength: +7, "Critical Damage": +65 },
      Legendary: { Strength: +10, "Critical Damage": +75 },
      Special: { Strength: +15, "Critical Damage": +90 }
    }
  },
  {
    name: "Unreal",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Strength: +3,"Critical Chance": +8, "Critical Damage": +5 },
      Uncommon: { Strength: +7,"Critical Chance": +9, "Critical Damage": +10 },
      Rare: { Strength: +12,"Critical Chance": +10, "Critical Damage": +18 },
      Epic: { Strength: +18,"Critical Chance": +11, "Critical Damage": +32 },
      Legendary: { Strength: +25,"Critical Chance": +13, "Critical Damage": +50 },
      Special: { Strength: +34,"Critical Chance": +15, "Critical Damage": +70 }
    }
  },
  {
    name: "Awkward",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { "Critical Chance": +10, "Critical Damage": +5, Intelligence: -5 },
      Uncommon: { "Critical Chance": +12, "Critical Damage": +10, Intelligence: -10 },
      Rare: { "Critical Chance": +15, "Critical Damage": +15, Intelligence: -18 },
      Epic: { "Critical Chance": +20, "Critical Damage": +22, Intelligence: -32 },
      Legendary: { "Critical Chance": +25, "Critical Damage": +30, Intelligence: -50 },
      Special: { "Critical Chance": +30, "Critical Damage": +35, Intelligence: -72 }
    }
  },
  {
    name: "Rich",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Strength: +2,"Critical Chance": +10, "Critical Damage": +1, Intelligence: +20 },
      Uncommon: { Strength: +3,"Critical Chance": +12, "Critical Damage": +2, Intelligence: +25 },
      Rare: { Strength: +4,"Critical Chance": +14, "Critical Damage": +4, Intelligence: +30 },
      Epic: { Strength: +7,"Critical Chance": +17, "Critical Damage": +7, Intelligence: +40 },
      Legendary: { Strength: +10,"Critical Chance": +20, "Critical Damage": +10, Intelligence: +50 },
      Special: { Strength: +15,"Critical Chance": +25, "Critical Damage": +15, Intelligence: +60 }
    }
  },
  // Bow & Boomerang Reforges End
];