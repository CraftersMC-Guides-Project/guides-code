const ACCESSORY_CHECKLIST = [
  {
    rarity: 'COMMON',
    entries: [
      { label: 'Bamboo Talisman » Bamboo Ring', names: ['Bamboo Talisman', 'Bamboo Ring'] },
      { label: 'Bat Talisman » Bat Ring » Bat Artifact', names: ['Bat Talisman', 'Bat Ring', 'Bat Artifact'] },
      { label: 'Bat Person Talisman » Bat Person Ring » Bat Person Artifact', names: ['Bat Person Talisman', 'Bat Person Ring', 'Bat Person Artifact'] },
      { label: 'Blood God Crest', names: ['Blood God Crest'] },
      { label: 'Campfire Initiate Badge', names: ['Campfire Initiate Badge'] },
      { label: 'Candy Talisman » Candy Ring » Candy Artifact » Candy Relic', names: ['Candy Talisman', 'Candy Ring', 'Candy Artifact', 'Candy Relic'] },
      { label: 'Coins Talisman', names: ['Coins Talisman'] },
      { label: 'Cropie Talisman » Squash Ring » Fermento Artifact', names: ['Cropie Talisman', 'Squash Ring', 'Fermento Artifact'] },
      { label: 'Farming Talisman', names: ['Farming Talisman'] },
      { label: 'Farmionaire Talisman » Farmionaire Ring » Farmionaire Artifact', names: ['Farmionaire Talisman', 'Farmionaire Ring', 'Farmionaire Artifact'] },
      { label: 'Feather Talisman » Feather Ring » Feather Artifact » Golden Feather Boots', names: ['Feather Talisman', 'Feather Ring', 'Feather Artifact', 'Golden Feather Boots'] },
      { label: 'Fire Talisman', names: ['Fire Talisman'] },
      { label: 'Intimidation Talisman » Intimidation Ring » Intimidation Artifact', names: ['Intimidation Talisman', 'Intimidation Ring', 'Intimidation Artifact'] },
      { label: 'Mine Affinity Talisman', names: ['Mine Affinity Talisman'] },
      { label: 'Night Vision Charm', names: ['Night Vision Charm'] },
      { label: 'Potato Talisman', names: ['Potato Talisman'] },
      { label: 'Scavenger Talisman', names: ['Scavenger Talisman'] },
      { label: 'Skeleton Talisman', names: ['Skeleton Talisman'] },
      { label: 'Speed Talisman » Speed Ring » Speed Artifact', names: ['Speed Talisman', 'Speed Ring', 'Speed Artifact'] },
      { label: 'Vaccine Talisman', names: ['Vaccine Talisman'] },
      { label: 'Village Affinity Talisman', names: ['Village Affinity Talisman'] },
      { label: 'Wolf Talisman » Wolf Ring', names: ['Wolf Talisman', 'Wolf Ring'] },
      { label: 'Zombie Talisman » Zombie Ring » Zombie Artifact', names: ['Zombie Talisman', 'Zombie Ring', 'Zombie Artifact'] },
    ],
  },
  {
    rarity: 'UNCOMMON',
    entries: [
      { label: 'Broken Piggy Bank, Piggy Bank', names: ['Cracked Piggy Bank', 'Broken Piggy Bank', 'Piggy Bank'] },
      { label: 'Campfire Adept Badge » Campfire Cultist Badge » Campfire Scion Badge » Campfire God Badge', names: ['Campfire Adept Badge', 'Campfire Cultist Badge', 'Campfire Scion Badge', 'Campfire God Badge'] },
      { label: 'Cracked Piggy Bank', names: ['Cracked Piggy Bank', 'Broken Piggy Bank', 'Piggy Bank'] },
      { label: 'Draconic Talisman » Draconic Ring » Draconic Artifact', names: ['Draconic Talisman', 'Draconic Ring', 'Draconic Artifact'] },
      { label: 'Emerald Ring', names: ['Emerald Ring'] },
      { label: 'Farmer Orb', names: ['Farmer Orb'] },
      { label: 'Gravity Talisman', names: ['Gravity Talisman'] },
      { label: 'Hunter Talisman » Hunter Ring', names: ['Hunter Talisman', 'Hunter Ring'] },
      { label: 'Lava Talisman', names: ['Lava Talisman'] },
      { label: 'Magnetic Talisman', names: ['Magnetic Talisman'] },
      { label: "New Year's Cake Bag", names: ["New Year's Cake Bag", 'New Years Cake Bag'] },
      { label: 'Personal Compactor 4000 - 5000 - 6000 - 7000', names: ['Personal Compactor 4000', 'Personal Compactor 5000', 'Personal Compactor 6000', 'Personal Compactor 7000'] },
      { label: 'Personal Deletor 4000 - 5000 - 6000 - 7000', names: ['Personal Deletor 4000', 'Personal Deletor 5000', 'Personal Deletor 6000', 'Personal Deletor 7000'] },
      { label: 'Red Claw Talisman » Red Claw Ring » Red Claw Artifact » Frostclaw Relic', names: ['Red Claw Talisman', 'Red Claw Ring', 'Red Claw Artifact', 'Frostclaw Relic'] },
      { label: 'Seal of the Seas or Seal of the Oceans', names: ['Seal of the Seas', 'Seal of the Oceans'] },
      { label: 'Wood Affinity Talisman', names: ['Wood Affinity Talisman'] },
    ],
  },
  {
    rarity: 'RARE',
    entries: [
      { label: 'Cake Slice', names: ['Cake Slice'] },
      { label: 'Fire Extinguisher » Fire Devourer', names: ['Fire Extinguisher', 'Fire Devourer'] },
      { label: "Pig's Foot", names: ["Pig's Foot", 'Pigs Foot'] },
    ],
  },
  {
    rarity: 'EPIC',
    entries: [
      { label: 'Experience Artifact', names: ['Experience Artifact'] },
    ],
  },
  {
    rarity: 'LEGENDARY',
    entries: [
      { label: 'Dayfreezer or Nightfreezer', names: ['Dayfreezer', 'Nightfreezer'] },
      { label: 'Reaper Orb', names: ['Reaper Orb'] },
      { label: "Sky's Badge", names: ["Sky's Badge", 'Skys Badge'] },
    ],
  },
  {
    rarity: 'SPECIAL',
    entries: [
      { label: 'Creative Mind', names: ['Creative Mind'] },
      { label: 'Game Breaker', names: ['Game Breaker'] },
    ],
  },
];

function normalizeAccessoryName(value) {
  return String(value || '')
    .replace(/§./g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isCampfireBadgeName(value) {
  return /^campfire .+ badge$/.test(normalizeAccessoryName(value));
}

function findOwnedVariant(entry, ownedNames = [], ownedNormalizedNames = new Set()) {
  if (entry.names.some(isCampfireBadgeName)) {
    const ownedCampfire = (ownedNames || []).find(isCampfireBadgeName);
    if (ownedCampfire) return ownedCampfire;
  }

  for (let i = entry.names.length - 1; i >= 0; i -= 1) {
    const variantName = entry.names[i];
    const normVariant = normalizeAccessoryName(variantName);
    if (!normVariant) continue;

    for (const ownedNorm of ownedNormalizedNames) {
      if (ownedNorm === normVariant || ownedNorm.startsWith(normVariant)) {
        return variantName;
      }
    }
  }
  return null;
}

function buildAccessoryChecklistStatus(ownedNames = []) {
  const ownedNormalizedNames = new Set((ownedNames || []).map(normalizeAccessoryName).filter(Boolean));
  const missingByRarity = [];
  const ownedByRarity = [];
  let totalChecklist = 0;
  let ownedChecklistCount = 0;

  for (const bucket of ACCESSORY_CHECKLIST) {
    const ownedEntries = [];
    const missingEntries = [];

    for (const entry of bucket.entries) {
      totalChecklist += 1;
      const ownedVariant = findOwnedVariant(entry, ownedNames, ownedNormalizedNames);
      if (ownedVariant) {
        ownedChecklistCount += 1;
        ownedEntries.push(`• ${entry.label} (owned: ${ownedVariant})`);
      } else {
        missingEntries.push(`• ${entry.label}`);
      }
    }

    if (ownedEntries.length) {
      ownedByRarity.push({
        rarity: bucket.rarity,
        count: ownedEntries.length,
        lines: ownedEntries,
      });
    }
    if (missingEntries.length) {
      missingByRarity.push({
        rarity: bucket.rarity,
        count: missingEntries.length,
        lines: missingEntries,
      });
    }
  }

  return {
    totalChecklist,
    ownedChecklistCount,
    missingByRarity,
    ownedByRarity,
  };
}

if (typeof window !== 'undefined') {
  window.ACCESSORY_CHECKLIST = ACCESSORY_CHECKLIST;
  window.normalizeAccessoryName = normalizeAccessoryName;
  window.buildAccessoryChecklistStatus = buildAccessoryChecklistStatus;
}

if (typeof module !== 'undefined') {
  module.exports = {
    ACCESSORY_CHECKLIST,
    normalizeAccessoryName,
    buildAccessoryChecklistStatus,
  };
}

