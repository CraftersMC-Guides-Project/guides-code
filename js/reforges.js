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
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Light",
    itemTypes: ["Armor"],
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
    name: "Mythic",
    itemTypes: ["Armor"],
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
    name: "Pure",
    itemTypes: ["Armor"],
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
    name: "Smart",
    itemTypes: ["Armor"],
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
    name: "Titanic",
    itemTypes: ["Armor"],
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
    name: "Wise",
    itemTypes: ["Armor"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  // Armor Reforges End
  // Axe (5 reforges)
  {
    name: "Great",
    itemTypes: ["Axe"],
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
    name: "Rugged",
    itemTypes: ["Axe"],
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
    name: "Lush",
    itemTypes: ["Axe"],
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
    name: "Double-Bit",
    itemTypes: ["Axe"],
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
    name: "Lumberjack's",
    itemTypes: ["Axe"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  // Axe Reforges End
  // Hoe (4 reforges)
  {
    name: "Green Thumb",
    itemTypes: ["Hoe"],
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
    name: "Robust",
    itemTypes: ["Hoe"],
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
    name: "Zooming",
    itemTypes: ["Hoe"],
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
    name: "Peasant's",
    itemTypes: ["Hoe"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  // Hoe Reforges End
  // Accessory (18 reforges)
  {
    name: "Bizarre",
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
    name: "Itchy",
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
    name: "Ominous",
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
    name: "Pleasant",
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
    name: "Pretty",
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
    name: "Shiny",
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
    name: "Simple",
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
    name: "Strange",
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
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  {
    name: "Fine",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Grand",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Hasty",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Neat",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Rapid",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Unreal",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Awkward",
    itemTypes: ["Bow","Boomerang"],
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
    name: "Rich",
    itemTypes: ["Bow","Boomerang"],
    stats: {
      Common: { Stat1: 1, Stat2: 2 },
      Uncommon: { Stat1: 2, Stat2: 3 },
      Rare: { Stat1: 3, Stat2: 4 },
      Epic: { Stat1: 4, Stat2: 5 },
      Legendary: { Stat1: 5, Stat2: 6 },
      Special: { Stat1: 6, Stat2: 7 }
    }
  },
  // Bow & Boomerang Reforges End
];