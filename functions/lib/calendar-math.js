/**
 * CraftersMC SkyBlock Calendar Engine - Server-Side Calculator
 * Exact deterministic calculation matching public/js/calendarengine.js
 */

const START_OF_TIMES = 1648800000;
const TIME_MULTIPLIER = 72;
const SEASON_LENGTH = 93;
const YEAR_LENGTH = 4;
const DAYS_PER_YEAR = 372;
const MINUTES_PER_SKYBLOCK_DAY = 20;

const CropType = [
  'WHEAT', 'SUGAR_CANE', 'CARROT', 'POTATO',
  'MELON', 'PUMPKIN', 'COCOA_BEANS', 'CACTUS',
  'MUSHROOM', 'BEETROOT'
];

const PET_TYPES = ['tiger', 'lion', 'monkey', 'elephant', 'giraffe'];
const PET_RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC'];

const JavaRandom = (function() {
  const MUL = 0x5DEECE66Dn;
  const ADD = 0xBn;
  const MASK48 = (1n << 48n) - 1n;

  return class JavaRandom {
    constructor(seedVal) {
      this.seed = 0n;
      this.setSeed(Number(seedVal) || 0);
    }
    setSeed(seedVal) {
      const s = BigInt(seedVal);
      this.seed = (s ^ MUL) & MASK48;
    }
    next(bits) {
      this.seed = (this.seed * MUL + ADD) & MASK48;
      return Number(this.seed >> (48n - BigInt(bits)));
    }
    nextInt(bound) {
      if (bound === undefined) return this.next(32) | 0;
      if (!Number.isInteger(bound) || bound <= 0) throw new RangeError('bound must be positive int');
      if ((bound & (bound - 1)) === 0) {
        return Math.floor(bound * (this.next(31) / 2147483648));
      }
      let bits, val;
      do {
        bits = this.next(31);
        val = bits % bound;
      } while (bits - val + (bound - 1) < 0);
      return val;
    }
  };
})();

export function getCurrentTimeData(epochMs = Date.now()) {
  const realSecondsSinceEpoch = (epochMs / 1000) - START_OF_TIMES;
  const skyblockSeconds = realSecondsSinceEpoch * TIME_MULTIPLIER;
  const skyblockDecimalDays = skyblockSeconds / 86400; // 86400 SkyBlock seconds per day (20 real minutes)

  const daysSinceEpoch = Math.floor(skyblockDecimalDays);
  const seasonsSinceEpoch = Math.floor(daysSinceEpoch / SEASON_LENGTH);
  const currentYear = Math.floor(seasonsSinceEpoch / YEAR_LENGTH) + 1;
  const currentSeason = seasonsSinceEpoch % YEAR_LENGTH;
  const todaySeason = (daysSinceEpoch % SEASON_LENGTH) + 1;

  return {
    currentYear,
    currentSeason,
    todaySeason,
    skyblockDecimalDays,
    todaySkyblock: daysSinceEpoch + 1,
    todayInYear: (currentSeason * SEASON_LENGTH) + todaySeason
  };
}

export function getFarmingCrops(eventId) {
  const GOLDEN = 0x9E3779B97F4A7C15n;
  const seed64 = (BigInt(eventId) ^ GOLDEN) & ((1n << 48n) - 1n);
  const seed48 = Number(seed64);
  const rng = new JavaRandom(seed48);
  const arr = CropType.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.nextInt(i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.slice(0, 3);
}

export function getZooPets(totalDays) {
  const daysSinceEpoch = totalDays - 1;
  const seasonsSinceEpoch = Math.floor(daysSinceEpoch / SEASON_LENGTH);
  const seed = Math.floor(seasonsSinceEpoch / 2);

  const legendaryIndex = seed % PET_TYPES.length;
  const picked = [legendaryIndex];
  const rng = new JavaRandom(seed);
  while (picked.length < 3) {
    const idx = rng.nextInt(PET_TYPES.length);
    if (!picked.includes(idx)) picked.push(idx);
  }
  const pets = picked.map((idx) => {
    const name = PET_TYPES[idx];
    const rarity = idx === legendaryIndex ? 'LEGENDARY' : PET_RARITIES[rng.nextInt(PET_RARITIES.length)];
    return { name, rarity };
  });

  return { seed, pets, legendary: pets[0] };
}

export function getUpcomingEvents(epochMs = Date.now()) {
  const time = getCurrentTimeData(epochMs);
  const upcoming = [];

  // 1. Ethan's Farming Contest (every 3 in-game days = 1 hour IRL)
  const nextContestDay = Math.floor(time.todaySkyblock / 3) * 3 + 1;
  const finalContestDay = nextContestDay > time.todaySkyblock ? nextContestDay : nextContestDay + 3;
  upcoming.push({
    key: 'farming',
    name: "Ethan's Farming Contest",
    type: 'farming',
    nextDay: finalContestDay,
    crops: getFarmingCrops(Math.floor(finalContestDay / 3))
  });

  // 2. Season of the Pig (every 4 SkyBlock years in Spring)
  let nextPigYear = Math.ceil(time.currentYear / 4) * 4 + 1;
  if (time.currentYear > nextPigYear || (time.currentYear === nextPigYear && time.currentSeason > 0)) {
    nextPigYear += 4;
  }
  upcoming.push({
    key: 'pig',
    name: "Season of the Pig",
    nextDay: ((nextPigYear - 1) * DAYS_PER_YEAR) + 1
  });

  // 3. New Year Celebration
  let nextNewYearDay = ((time.currentYear - 1) * DAYS_PER_YEAR) + (3 * SEASON_LENGTH) + 91;
  if (time.todayInYear > (3 * SEASON_LENGTH) + 91) nextNewYearDay += DAYS_PER_YEAR;
  upcoming.push({
    key: 'new_year',
    name: "New Year Celebration",
    nextDay: nextNewYearDay
  });

  // 4. Spooky Festival
  const spookyStartInYear = (2 * SEASON_LENGTH) + 59;
  let nextSpookyDay = ((time.currentYear - 1) * DAYS_PER_YEAR) + spookyStartInYear;
  if (time.todayInYear > spookyStartInYear) nextSpookyDay += DAYS_PER_YEAR;
  upcoming.push({
    key: 'spooky',
    name: "Spooky Festival",
    nextDay: nextSpookyDay
  });

  // 5. Travelling Zoo
  const summerStart = (1 * SEASON_LENGTH) + 1;
  const winterStart = (3 * SEASON_LENGTH) + 1;
  let nextZooDay;
  if (time.todayInYear < summerStart) nextZooDay = ((time.currentYear - 1) * DAYS_PER_YEAR) + summerStart;
  else if (time.todayInYear < winterStart) nextZooDay = ((time.currentYear - 1) * DAYS_PER_YEAR) + winterStart;
  else nextZooDay = (time.currentYear * DAYS_PER_YEAR) + summerStart;
  
  const zooData = getZooPets(nextZooDay);
  upcoming.push({
    key: 'zoo',
    name: "Travelling Zoo",
    nextDay: nextZooDay,
    pets: zooData.pets,
    legendary: zooData.legendary
  });

  upcoming.forEach(event => {
    const daysUntil = event.nextDay - time.skyblockDecimalDays - 1;
    event.msUntil = Math.round(daysUntil * MINUTES_PER_SKYBLOCK_DAY * 60 * 1000);
    event.minutesUntil = Math.round(event.msUntil / 60000);
  });

  return upcoming.sort((a, b) => a.msUntil - b.msUntil);
}
