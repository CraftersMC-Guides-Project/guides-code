/**
 * CraftersMC SkyBlock Calendar Engine - Server-Side Calculator
 * Deterministic calculation of current SkyBlock date and upcoming events.
 */

const START_OF_TIMES = 1648800000;
const TIME_MULTIPLIER = 72;
const SEASON_LENGTH = 93;
const DAYS_PER_YEAR = 372;
const MINUTES_PER_SKYBLOCK_DAY = 20;

const CropType = [
  'WHEAT', 'SUGAR_CANE', 'CARROT', 'POTATO',
  'MELON', 'PUMPKIN', 'COCOA_BEANS', 'CACTUS',
  'MUSHROOM', 'BEETROOT'
];

export function getCurrentTimeData(epochMs = Date.now()) {
  const currentSeconds = Math.floor(epochMs / 1000);
  const secondsSinceEpoch = currentSeconds - START_OF_TIMES;
  const skyblockSeconds = secondsSinceEpoch * TIME_MULTIPLIER;
  const skyblockDecimalDays = skyblockSeconds / 1200;
  const daysSinceEpoch = Math.floor(skyblockDecimalDays);

  const currentYear = Math.floor(daysSinceEpoch / DAYS_PER_YEAR) + 1;
  const todayInYear = (daysSinceEpoch % DAYS_PER_YEAR);
  const currentSeason = Math.floor(todayInYear / SEASON_LENGTH);
  const todaySeason = (todayInYear % SEASON_LENGTH) + 1;

  return {
    currentYear,
    currentSeason,
    todaySeason,
    skyblockDecimalDays,
    todaySkyblock: daysSinceEpoch + 1,
    todayInYear
  };
}

export function getFarmingCrops(eventId) {
  const MUL = 0x5DEECE66Dn;
  const ADD = 0xBn;
  const MASK48 = (1n << 48n) - 1n;
  let seed = (BigInt(eventId) ^ MUL) & MASK48;

  const next = (bits) => {
    seed = (seed * MUL + ADD) & MASK48;
    return Number(seed >> (48n - BigInt(bits)));
  };

  const nextInt = (bound) => {
    let bits, val;
    do {
      bits = next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  };

  const pool = [...CropType];
  const selected = [];
  for (let i = 0; i < 3; i++) {
    const idx = nextInt(pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

export function getUpcomingEvents(epochMs = Date.now()) {
  const time = getCurrentTimeData(epochMs);
  const upcoming = [];

  // 1. Ethan's Farming Contest (every 3 in-game days)
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
  upcoming.push({
    key: 'zoo',
    name: "Travelling Zoo",
    nextDay: nextZooDay
  });

  upcoming.forEach(event => {
    const daysUntil = event.nextDay - time.skyblockDecimalDays - 1;
    event.msUntil = Math.round(daysUntil * MINUTES_PER_SKYBLOCK_DAY * 60 * 1000);
    event.minutesUntil = Math.round(event.msUntil / 60000);
  });

  return upcoming.sort((a, b) => a.msUntil - b.msUntil);
}

