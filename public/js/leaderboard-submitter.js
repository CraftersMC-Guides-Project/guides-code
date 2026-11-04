/**
 * Automatic Leaderboard Submitter for CraftersMC Guides
 * Extracts player & profile metrics and automatically updates global leaderboards via /api/leaderboards/update
 */

(function () {
  'use strict';

  const SKILL_XP_PER_LEVEL = [
    50, 125, 200, 300, 500, 750, 1000, 1500, 2000, 3500,
    5000, 7500, 10000, 15000, 20000, 30000, 50000, 75000, 100000, 200000,
    300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000,
    1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000,
    2300000, 2400000, 2500000, 2600000, 2750000, 2900000, 3100000, 3400000, 3700000, 4000000,
    4300000, 4600000, 4900000, 5200000, 5500000, 5800000, 6100000, 6400000, 6700000, 7000000
  ];

  const SKILL_CAPS = {
    farming: 60,
    mining: 50,
    combat: 50,
    foraging: 50,
    enchanting: 50,
    taming: 50
  };

  const AVG_SKILL_NAMES = ['farming', 'mining', 'combat', 'foraging', 'enchanting', 'taming'];

  function getSkillLevel(skillName, xpInput) {
    const cap = SKILL_CAPS[skillName] || 50;
    const xp = Math.max(0, Number(xpInput) || 0);
    let level = 0;
    let cumulative = 0;

    while (level < SKILL_XP_PER_LEVEL.length && xp >= cumulative + SKILL_XP_PER_LEVEL[level] && level < cap) {
      cumulative += SKILL_XP_PER_LEVEL[level];
      level++;
    }
    return Math.min(level, cap);
  }

  function getLevelFromXP(xp) {
    return xp <= 0 ? 1 : Math.floor(-3.5 + Math.sqrt(20.25 + 0.002 * xp));
  }

  function getTotalExpForLevel(level) {
    return level <= 1 ? 0 : (500 * (level - 2) + 5000) * (level - 1);
  }

  function getExpFromLevelToNext(level) {
    return level < 1 ? 5000 : 1000 * (level - 1) + 5000;
  }

  function formatNetworkLevelProgress(xp) {
    const totalXp = Number(xp) || 0;
    const currentLevel = getLevelFromXP(totalXp);
    const xpForCurrentLevel = getTotalExpForLevel(currentLevel);
    const remainingXP = totalXp - xpForCurrentLevel;
    const xpToNextLevel = getExpFromLevelToNext(currentLevel);
    return `Level ${currentLevel} (${Math.floor(remainingXP).toLocaleString()} / ${Math.floor(xpToNextLevel).toLocaleString()} XP)`;
  }

  const RAW_TO_CANONICAL_COLLECTION = {
    wheat: { subCat: 'farming', slug: 'wheat' },
    seed: { subCat: 'farming', slug: 'seed' },
    seeds: { subCat: 'farming', slug: 'seed' },
    wheat_seeds: { subCat: 'farming', slug: 'seed' },
    carrot: { subCat: 'farming', slug: 'carrot' },
    carrot_item: { subCat: 'farming', slug: 'carrot' },
    potato: { subCat: 'farming', slug: 'potato' },
    potato_item: { subCat: 'farming', slug: 'potato' },
    pumpkin: { subCat: 'farming', slug: 'pumpkin' },
    melon: { subCat: 'farming', slug: 'melon' },
    mushroom: { subCat: 'farming', slug: 'mushroom' },
    red_mushroom: { subCat: 'farming', slug: 'mushroom' },
    brown_mushroom: { subCat: 'farming', slug: 'mushroom' },
    mushroom_collection: { subCat: 'farming', slug: 'mushroom' },
    cocoa: { subCat: 'farming', slug: 'cocoa-beans' },
    cocoa_beans: { subCat: 'farming', slug: 'cocoa-beans' },
    'ink_sack:3': { subCat: 'farming', slug: 'cocoa-beans' },
    cactus: { subCat: 'farming', slug: 'cactus' },
    sugar_cane: { subCat: 'farming', slug: 'sugar-cane' },
    sugarcane: { subCat: 'farming', slug: 'sugar-cane' },
    mutton: { subCat: 'farming', slug: 'mutton' },
    raw_porkchop: { subCat: 'farming', slug: 'raw-porkchop' },
    porkchop: { subCat: 'farming', slug: 'raw-porkchop' },
    pork: { subCat: 'farming', slug: 'raw-porkchop' },
    raw_chicken: { subCat: 'farming', slug: 'raw-chicken' },
    chicken: { subCat: 'farming', slug: 'raw-chicken' },
    leather: { subCat: 'farming', slug: 'leather' },
    feather: { subCat: 'farming', slug: 'feather' },
    raw_duck: { subCat: 'farming', slug: 'raw-duck' },
    duck: { subCat: 'farming', slug: 'raw-duck' },
    raw_rabbit: { subCat: 'farming', slug: 'raw-rabbit' },
    rabbit: { subCat: 'farming', slug: 'raw-rabbit' },
    beetroot: { subCat: 'farming', slug: 'beetroot' },

    cobblestone: { subCat: 'mining', slug: 'cobblestone' },
    coal: { subCat: 'mining', slug: 'coal' },
    iron_ingot: { subCat: 'mining', slug: 'iron-ingot' },
    iron: { subCat: 'mining', slug: 'iron-ingot' },
    gold_ingot: { subCat: 'mining', slug: 'gold-ingot' },
    gold: { subCat: 'mining', slug: 'gold-ingot' },
    diamond: { subCat: 'mining', slug: 'diamond' },
    lapis: { subCat: 'mining', slug: 'lapis-lazuli' },
    lapis_lazuli: { subCat: 'mining', slug: 'lapis-lazuli' },
    'ink_sack:4': { subCat: 'mining', slug: 'lapis-lazuli' },
    emerald: { subCat: 'mining', slug: 'emerald' },
    redstone: { subCat: 'mining', slug: 'redstone' },
    obsidian: { subCat: 'mining', slug: 'obsidian' },
    ice: { subCat: 'mining', slug: 'ice' },
    end_stone: { subCat: 'mining', slug: 'end-stone' },
    ender_stone: { subCat: 'mining', slug: 'end-stone' },

    rotten_flesh: { subCat: 'combat', slug: 'rotten-flesh' },
    bone: { subCat: 'combat', slug: 'bone' },
    string: { subCat: 'combat', slug: 'string' },
    spider_eye: { subCat: 'combat', slug: 'spider-eye' },
    gunpowder: { subCat: 'combat', slug: 'gunpowder' },
    sulphur: { subCat: 'combat', slug: 'gunpowder' },
    ender_pearl: { subCat: 'combat', slug: 'ender-pearl' },
    slime_ball: { subCat: 'combat', slug: 'slime-ball' },
    blaze_rod: { subCat: 'combat', slug: 'blaze-rod' },
    magma_cream: { subCat: 'combat', slug: 'magma-cream' },

    oak_log: { subCat: 'foraging', slug: 'oak-log' },
    oak: { subCat: 'foraging', slug: 'oak-log' },
    log: { subCat: 'foraging', slug: 'oak-log' },
    spruce_log: { subCat: 'foraging', slug: 'spruce-log' },
    spruce: { subCat: 'foraging', slug: 'spruce-log' },
    'log:1': { subCat: 'foraging', slug: 'spruce-log' },
    birch_log: { subCat: 'foraging', slug: 'birch-log' },
    birch: { subCat: 'foraging', slug: 'birch-log' },
    'log:2': { subCat: 'foraging', slug: 'birch-log' },
    jungle_log: { subCat: 'foraging', slug: 'jungle-log' },
    jungle: { subCat: 'foraging', slug: 'jungle-log' },
    'log:3': { subCat: 'foraging', slug: 'jungle-log' },
    acacia_log: { subCat: 'foraging', slug: 'acacia-log' },
    acacia: { subCat: 'foraging', slug: 'acacia-log' },
    'log_2': { subCat: 'foraging', slug: 'acacia-log' },
    dark_oak_log: { subCat: 'foraging', slug: 'dark-oak-log' },
    dark_oak: { subCat: 'foraging', slug: 'dark-oak-log' },
    'log_2:1': { subCat: 'foraging', slug: 'dark-oak-log' },
    bamboo: { subCat: 'foraging', slug: 'bamboo' }
  };

  const CROP_SLUG_MAP = {
    wheat: 'wheat',
    carrot: 'carrot',
    potato: 'potato',
    pumpkin: 'pumpkin',
    melon: 'melon',
    sugar_cane: 'sugar-cane',
    sugarcane: 'sugar-cane',
    'sugar-cane': 'sugar-cane',
    cactus: 'cactus',
    cocoa: 'cocoa-beans',
    cocoa_beans: 'cocoa-beans',
    'cocoa-beans': 'cocoa-beans',
    mushroom: 'mushroom',
    red_mushroom: 'mushroom',
    brown_mushroom: 'mushroom',
    beetroot: 'beetroot'
  };

  const DRAGON_BOSS_TARGETS = {
    'trpixel:protector_dragon': 'boss-kills/protector-dragon',
    'protector_dragon': 'boss-kills/protector-dragon',
    'trpixel:strong_dragon': 'boss-kills/strong-dragon',
    'strong_dragon': 'boss-kills/strong-dragon',
    'trpixel:superior_dragon': 'boss-kills/superior-dragon',
    'superior_dragon': 'boss-kills/superior-dragon',
    'trpixel:unstable_dragon': 'boss-kills/unstable-dragon',
    'unstable_dragon': 'boss-kills/unstable-dragon',
    'trpixel:wise_dragon': 'boss-kills/wise-dragon',
    'wise_dragon': 'boss-kills/wise-dragon',
    'trpixel:young_dragon': 'boss-kills/young-dragon',
    'young_dragon': 'boss-kills/young-dragon',
    'trpixel:old_dragon': 'boss-kills/old-dragon',
    'old_dragon': 'boss-kills/old-dragon',
    'trpixel:end_stone_protector': 'boss-kills/end-stone-protector',
    'end_stone_protector': 'boss-kills/end-stone-protector',
    'total_dragon': 'boss-kills/total-dragon',
    'total': 'boss-kills/total-dragon'
  };

  const DRAGON_EYE_TARGETS = {
    'trpixel:protector_dragon': 'summoning-eyes/protector-dragon',
    'protector_dragon': 'summoning-eyes/protector-dragon',
    'trpixel:strong_dragon': 'summoning-eyes/strong-dragon',
    'strong_dragon': 'summoning-eyes/strong-dragon',
    'trpixel:superior_dragon': 'summoning-eyes/superior-dragon',
    'superior_dragon': 'summoning-eyes/superior-dragon',
    'trpixel:unstable_dragon': 'summoning-eyes/unstable-dragon',
    'unstable_dragon': 'summoning-eyes/unstable-dragon',
    'trpixel:wise_dragon': 'summoning-eyes/wise-dragon',
    'wise_dragon': 'summoning-eyes/wise-dragon',
    'trpixel:young_dragon': 'summoning-eyes/young-dragon',
    'young_dragon': 'summoning-eyes/young-dragon',
    'trpixel:old_dragon': 'summoning-eyes/old-dragon',
    'old_dragon': 'summoning-eyes/old-dragon',
    'total_dragon': 'summoning-eyes/total',
    'total': 'summoning-eyes/total'
  };

  const SUBMIT_COOLDOWN_MS = 60 * 1000; // 1 minute per player-profile

  /**
   * Main automatic submission function.
   * Runs in background, non-blocking.
   */
  async function autoSubmitPlayerLeaderboards(playerData, profileData, memberIdInput) {
    try {
      const username = (
        playerData?.name ||
        playerData?.username ||
        profileData?.ownerLastName ||
        profileData?.ownerName ||
        ''
      ).trim();

      if (!username) return;

      const profileName = (
        profileData?.cuteName ||
        profileData?.cute_name ||
        profileData?.profileName ||
        'N/A'
      ).trim();

      const profileId = profileData?.id || profileData?.profile_id || '';

      // Check cooldown using sessionStorage
      const sessionKey = `cmc_lb_sync_${username.toLowerCase()}_${profileId || profileName.toLowerCase()}`;
      try {
        const lastSync = sessionStorage.getItem(sessionKey);
        if (lastSync && Date.now() - Number(lastSync) < SUBMIT_COOLDOWN_MS) {
          // Already submitted recently
          return;
        }
      } catch (_) {}

      // Resolve member object
      const members = profileData?.members || {};
      let memberId = memberIdInput;
      if (!memberId || !members[memberId]) {
        const cleanPlayerUuid = (playerData?.uuid || '').replace(/-/g, '').toLowerCase();
        memberId = Object.keys(members).find(m => m.toLowerCase() === cleanPlayerUuid) || Object.keys(members)[0];
      }
      const member = (memberId && members[memberId]) ? members[memberId] : {};

      const updates = [];

      function addTarget(target, score, extra = {}) {
        if (score === null || score === undefined) return;
        if (typeof score === 'number' && (!Number.isFinite(score) || score <= 0)) return;
        if (typeof score === 'string' && !score.trim()) return;

        updates.push({
          target,
          players: [
            {
              name: username,
              profile: extra.isNetworkStat ? null : profileName,
              score,
              private: false,
              ...extra
            }
          ]
        });
      }

      // 1. Network Stats (Total Playtime & Crafters Level)
      if (playerData) {
        const totalPlaytimeSec = Number(playerData.totalPlaytime || 0);
        if (totalPlaytimeSec > 0) {
          const playtimeHours = Number((totalPlaytimeSec / 3600).toFixed(2));
          addTarget('total-playtime', playtimeHours, { isNetworkStat: true });
        }

        const networkExp = Number(playerData.networkExp || 0);
        if (networkExp > 0) {
          const progressStr = formatNetworkLevelProgress(networkExp);
          addTarget('crafters-level', progressStr, { isNetworkStat: true, levelProgress: progressStr });
        }
      }

      // 2. Skills (6 CraftersMC skills: combat, mining, farming, foraging, enchanting, taming)
      const skillsObj = member.skills || {};
      let totalSkillLevels = 0;
      let totalSkillXp = 0;
      let countedSkills = 0;

      for (const skillKey of AVG_SKILL_NAMES) {
        const xp = Math.round(Number(skillsObj[skillKey] ?? member[`experience_skill_${skillKey}`] ?? 0));
        if (xp > 0) {
          addTarget(`skills/${skillKey}`, xp);
          const level = getSkillLevel(skillKey, xp);
          totalSkillLevels += level;
          totalSkillXp += xp;
          countedSkills++;
        }
      }

      if (countedSkills > 0) {
        const avgSkill = parseFloat((totalSkillLevels / AVG_SKILL_NAMES.length).toFixed(2));
        addTarget('skills/avg-skill', avgSkill);
        addTarget('skills/total', totalSkillXp);
      }

      // 3. Slayer Bosses (Zombie, Wolf, Spider)
      const slayer = member.slayerData || member.slayer_bosses || member.stats?.slayer || {};
      const zombieXp = Math.round(Number(slayer.zombie?.xp ?? slayer.zombie ?? slayer.revenant?.xp ?? slayer.revenant ?? 0));
      const wolfXp = Math.round(Number(slayer.wolf?.xp ?? slayer.wolf ?? slayer.sven?.xp ?? slayer.sven ?? 0));
      const spiderXp = Math.round(Number(slayer.spider?.xp ?? slayer.spider ?? slayer.tarantula?.xp ?? slayer.tarantula ?? 0));

      if (zombieXp > 0) addTarget('slayer/zombie', zombieXp);
      if (wolfXp > 0) addTarget('slayer/wolf', wolfXp);
      if (spiderXp > 0) addTarget('slayer/spider', spiderXp);

      // 4. Damage Stats
      const maxDamage = Math.round(Number(member.maxDamage ?? member.stats?.maxDamage ?? 0));
      const maxCritDamage = Math.round(Number(member.maxCritDamage ?? member.stats?.maxCritDamage ?? 0));
      if (maxDamage > 0) addTarget('damage', maxDamage);
      if (maxCritDamage > 0) addTarget('crit-damage', maxCritDamage);

      // 5. SkyBlock Level
      const sbLvl = Number(member.skyblockLevel ?? member.skyblock_level ?? member.level ?? 0);
      if (sbLvl > 0) {
        addTarget('skyblock-level', sbLvl * 100);
      }

      // 6. Boss Kills & Summoning Eyes
      const endData = member.endData || member.dragonData || {};
      const bossKills = member.bossKillCounts || endData.bossKillCounts || {};
      let totalDragons = 0;

      for (const [rawKey, countVal] of Object.entries(bossKills)) {
        const count = Math.round(Number(countVal || 0));
        if (count <= 0) continue;
        const normKey = String(rawKey || '').toLowerCase().replace(/[^a-z0-9_:]+/g, '');
        const target = DRAGON_BOSS_TARGETS[normKey];
        if (target) {
          addTarget(target, count);
        }
        if (normKey.includes('dragon') && !normKey.includes('total')) {
          totalDragons += count;
        }
      }
      if (totalDragons > 0 && !bossKills['total_dragon']) {
        addTarget('boss-kills/total-dragon', totalDragons);
      }

      // End Stone Protector check in zealotsContribution
      const espKills = Math.round(Number(member.zealotsContribution?.['trpixel:end_stone_protector'] ?? member.zealotsContribution?.end_stone_protector ?? 0));
      if (espKills > 0) {
        addTarget('boss-kills/end-stone-protector', espKills);
      }

      // Summoning Eyes
      const eyeContrib = member.summoningEyeContribution || endData.summoningEyeContribution || {};
      let totalEyes = 0;
      for (const [rawKey, countVal] of Object.entries(eyeContrib)) {
        const count = Math.round(Number(countVal || 0));
        if (count <= 0) continue;
        const normKey = String(rawKey || '').toLowerCase().replace(/[^a-z0-9_:]+/g, '');
        const target = DRAGON_EYE_TARGETS[normKey];
        if (target) {
          addTarget(target, count);
        }
        totalEyes += count;
      }
      if (totalEyes > 0 && !eyeContrib['total_dragon'] && !eyeContrib['total']) {
        addTarget('summoning-eyes/total', totalEyes);
      }

      // 7. Collections
      const coll = profileData?.collections || profileData?.collectionContributions?.[memberId] || {};
      for (const [rawKey, countVal] of Object.entries(coll)) {
        const count = Math.round(Number(countVal || 0));
        if (count <= 0) continue;
        const normKey = String(rawKey || '').toLowerCase().replace(/[^a-z0-9:]+/g, '_').replace(/^_+|_+$/g, '');
        const mapped = RAW_TO_CANONICAL_COLLECTION[normKey] || RAW_TO_CANONICAL_COLLECTION[normKey.replace(/:.*$/, '')];
        if (mapped) {
          addTarget(`collections/${mapped.subCat}/${mapped.slug}`, count);
        }
      }

      // 8. Mob Kills
      const kills = member.kills || {};
      let totalKills = 0;
      for (const [mobName, countVal] of Object.entries(kills)) {
        const count = Math.round(Number(countVal || 0));
        if (count <= 0) continue;
        totalKills += count;
        const mobSlug = String(mobName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (mobSlug && mobSlug !== 'total') {
          addTarget(`kills/${mobSlug}`, count);
        }
      }
      if (totalKills > 0) {
        addTarget('kills/total', totalKills);
      }

      // 9. Farming Contests & Personal Bests
      const farmingContests = member.farmingContestData || member.farming_contests || {};
      const medals = farmingContests.medals || {};
      const bracketHits = farmingContests.bracketHits || {};

      let bronze = Number(medals.bronze || 0);
      let silver = Number(medals.silver || 0);
      let gold = Number(medals.gold || 0);

      // Extract hits if medals object is empty
      if (bronze === 0 && silver === 0 && gold === 0) {
        for (const hits of Object.values(bracketHits)) {
          if (Array.isArray(hits)) {
            for (const h of hits) {
              const hNum = Number(h);
              if (hNum === 0 || h === 'bronze') bronze++;
              else if (hNum === 1 || h === 'silver') silver++;
              else if (hNum === 2 || h === 'gold') gold++;
            }
          }
        }
      }

      if (gold > 0) addTarget('farming-contests/gold', gold);
      if (silver > 0) addTarget('farming-contests/silver', silver);
      if (bronze > 0) addTarget('farming-contests/bronze', bronze);

      // Personal Bests
      const personalBests = farmingContests.personalBests || {};
      for (const [rawCrop, bestVal] of Object.entries(personalBests)) {
        const best = Math.round(Number(typeof bestVal === 'object' ? (bestVal.value || bestVal.score) : bestVal));
        if (best <= 0) continue;
        const cropSlug = CROP_SLUG_MAP[rawCrop.toLowerCase()] || rawCrop.toLowerCase().replace(/_/g, '-');
        addTarget(`farming-bests/${cropSlug}`, best);
      }

      // 10. Races
      const targetPracticeTime = Number(member.targetPracticeData?.bestTimeMilliseconds ?? member.targetPracticeData?.time ?? member.targetPracticeData);
      if (Number.isFinite(targetPracticeTime) && targetPracticeTime > 0) {
        addTarget('races/target-practice', `${Math.round(targetPracticeTime)} ms`);
      }
      const arcticCaveTime = Number(member.arcticCaveRaceData?.bestTimeMilliseconds ?? member.arcticCaveRaceData?.time ?? member.arcticCaveRaceData);
      if (Number.isFinite(arcticCaveTime) && arcticCaveTime > 0) {
        addTarget('races/arctic-cave', `${Math.round(arcticCaveTime)} ms`);
      }
      const enderNodeTime = Number(member.enderNodeHuntData?.bestTimeMilliseconds ?? member.enderNodeHuntData?.time ?? member.enderNodeHuntData);
      if (Number.isFinite(enderNodeTime) && enderNodeTime > 0) {
        addTarget('races/ender-node', `${Math.round(enderNodeTime)} ms`);
      }

      // 11. Events & Extras
      const shinyPigs = Math.round(Number(member.shinyPigsCaptured ?? playerData?.shinyPigsCaptured ?? 0));
      if (shinyPigs > 0) addTarget('shiny-pigs/shiny-pigs', shinyPigs);

      const shinyOrbs = Math.round(Number(member.shinyOrbsUsed ?? playerData?.shinyOrbsUsed ?? 0));
      if (shinyOrbs > 0) addTarget('shiny-pigs/shiny-orbs', shinyOrbs);

      const miningMilestone = Math.round(Number(member.miningMilestone ?? member.stats?.mining_milestone ?? 0));
      if (miningMilestone > 0) addTarget('miningmilestone', miningMilestone);

      const superpairs = Math.round(Number(member.experimentationData?.totalSuperpairs ?? member.experimentationData?.superpairs?.value ?? member.superpairs ?? 0));
      if (superpairs > 0) addTarget('superpairs', superpairs);

      const dailyQuests = Math.round(Number(member.totalDailyQuests ?? member.dailyQuestsCompleted ?? playerData?.totalDailyQuests ?? playerData?.dailyQuestsCompleted ?? 0));
      if (dailyQuests > 0) addTarget('daily-quests', dailyQuests);

      if (updates.length === 0) {
        return;
      }

      // Mark session sync
      try {
        sessionStorage.setItem(sessionKey, String(Date.now()));
      } catch (_) {}

      console.log(`[Leaderboard Submitter] Automatically submitting ${updates.length} stats for "${username}" (${profileName})...`);

      // Fire-and-forget background fetch to proxy
      fetch('/api/leaderboards/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
        .then(async (res) => {
          if (!res.ok) {
            const errTxt = await res.text().catch(() => '');
            console.warn(`[Leaderboard Submitter] HTTP ${res.status}:`, errTxt.slice(0, 300));
            return;
          }
          const data = await res.json().catch(() => ({}));
          console.log(`[Leaderboard Submitter] Successfully updated ${data.updatedCount || updates.length} leaderboard targets for "${username}"!`);
        })
        .catch((err) => {
          console.warn('[Leaderboard Submitter] Background submission skipped or failed:', err?.message || err);
        });

    } catch (outerErr) {
      console.warn('[Leaderboard Submitter] Error preparing leaderboard update:', outerErr);
    }
  }

  // Export to window
  window.autoSubmitPlayerLeaderboards = autoSubmitPlayerLeaderboards;
})();

