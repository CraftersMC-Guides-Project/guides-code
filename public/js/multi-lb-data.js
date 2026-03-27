// Data Here: Achievements, Arctic Cave Race, Avg Skill, Cakes, Gems, Crafters Level, Playtime, Slayers, Damage, Networth, Pets, Coins, Skills, Target Practice, Ender Node Hunt
// Not here: Collections, Farming Contests, Boss Time (Or any other with 200-300 lines data)
// Achievements
const achievementsData = [
    { rank: 1, name: "SphinxWraith/HeGzoStRqFe", achievements: "70" },
    { rank: 2, name: "Kg_lcky_01", achievements: "64" },
    { rank: 3, name: "hornrush89", achievements: "62" },
    { rank: 4, name: "MythicalPanda30", achievements: "60" },
    { rank: 5, name: "YourFather6459", achievements: "60" },
    { rank: 6, name: "Dharmaveer31", achievements: "57" },
    { rank: 7, name: "SammyMishu", achievements: "52" },
    { rank: 8, name: "Perry3338", achievements: "51" },
    { rank: 9, name: "Rehan2038", achievements: "51" },
    { rank: 10, name: "TGJASSIYT", achievements: "49" }
];
// Avg Skill
const skillData = [
  { rank: 1, name: "SphinxWraith/David_R06/Moerderfisch", level: "51.7" },
  { rank: 2, name: "GRAVITY8303", level: "50.2" },
  { rank: 3, name: "AndyGamer024/Aryaan045", level: "50" },
  { rank: 4, name: "Kg_lcky_01", level: "49" },
  { rank: 5, name: "JODHEMANT8975/GlumnorbG", level: "48.7" },
  { rank: 6, name: "Itzomkar1232891", level: "47.2" },
  { rank: 7, name: "DRONZAR_OP", level: "46.2" },
  { rank: 8, name: "Rehan2038", level: "45.2" },
  { rank: 9, name: "HueDisNwPhn", level: "44.5" },
  { rank: 10, name: "Fallen1sec", level: "40.2" }
];
// Cakes
const cakeData = [
  { rank: 1, name: "gelacktic", cakes: "654" },
  { rank: 2, name: "MythicalPanda30", cakes: "172" },
  { rank: 3, name: "TGJASSIYT", cakes: "74" },
  { rank: 4, name: "Ghosthunter4233", cakes: "26" },
  { rank: 5, name: "Rehan2038/HueDisNwPhn", cakes: "22" },
  { rank: 6, name: "HueDisNwPhn", cakes: "19" },
  { rank: 7, name: "C69P2W", cakes: "5" },
  { rank: 8, name: "NetworkPg", cakes: "3" },
  { rank: 9, name: "Unknown", cakes: "N/A" },
  { rank: 10, name: "Unknown", cakes: "N/A" }
];
// Gems 
const gemsData = [
  { rank: 1, name: "RaiTheBirds", gems: "208k" },
  { rank: 2, name: "Darkshadow52195", gems: "54K" },
  { rank: 3, name: "Shakilbaby", gems: "52K" },
  { rank: 4, name: "Jaddu0192/Dipanshu_FF", gems: "42.6K" },
  { rank: 5, name: "Spideyg4mer77", gems: "27K" },
  { rank: 6, name: "Craniax6797", gems: "19.2K" },
  { rank: 7, name: "Mistry_Human", gems: "16.7K" },
  { rank: 8, name: "IceBerg899", gems: "16.4K" },
  { rank: 9, name: "POSTALFERN73293", gems: "16K" },
  { rank: 10, name: "KRIZMORRENO", gems: "12K" }
];
// Crafters Level 
const levelsData = [
  { rank: 1, name: "HeGzoStRqFe", level: "105" },
  { rank: 2, name: "SphinxWraith", level: "91" },
  { rank: 3, name: "hornrush89", level: "88" },
  { rank: 4, name: "Luv_bats007", level: "61" },
  { rank: 5, name: "Froncyte", level: "58" },
  { rank: 6, name: "JODHEMANT8975", level: "50" },
  { rank: 7, name: "Kg_lcky_01", level: "48" },
  { rank: 8, name: "Perry3338/club32", level: "44" },
  { rank: 9, name: "HueDisNwPhn", level: "43" },
  { rank: 10, name: "Jeremy2075/Darkshadow52195", level: "40" }
];
// Playtime
const playtimeData = [
    { rank: 1, name: "HeGzoStRqFe", playtime: "8156.4h" },
    { rank: 2, name: "SphinxWraith", playtime: "6454.9h" },
    { rank: 3, name: "Perry3338", playtime: "5064.1h" },
    { rank: 4, name: "gelacktic", playtime: "3841h" },
    { rank: 5, name: "DueBacon2007102", playtime: "3809.1h" },
    { rank: 6, name: "JODHEMANT8975", playtime: "3352.3h" },
    { rank: 7, name: "Creepyshorts", playtime: "3350.7h" },
    { rank: 8, name: "Itzomkar1232891", playtime: "3001h" },
    { rank: 9, name: "HueDisNwPhn", playtime: "2605.8h" },
    { rank: 10, name: "Kg_lcky_01", playtime: "2515.7h" }
];
// Zombie and Wolf Slayer Exp 
const collectionsData = [
  {
    "name": "Zombie Slayer",
    "image": "img/revenant-horror.png",
    "players": [
      { "rank": 1, "name": "SphinxWraith", "score": "50M+" },
      { "rank": 2, "name": "HeGzoStRqFe", "score": "N/A" },
      { "rank": 3, "name": "DueBacon2007102", "score": "34M+" },
      { "rank": 4, "name": "Itzomkar1232891", "score": "N/A" },
      { "rank": 5, "name": "Kg_lcky_01", "score": "27.3M+" },
      { "rank": 6, "name": "DRONZAR_OP", "score": "25.6M+" },
      { "rank": 7, "name": "SoundClover8088", "score": "19.1M+" },
      { "rank": 8, "name": "Firegod174", "score": "17M+" },
      { "rank": 9, "name": "Herejefferson", "score": "15.5M+" },
      { "rank": 10, "name": "GRAVITY8303", "score": "15.5M+" }
    ]
  },
  {
    "name": "Wolf Slayer",
    "image": "img/fenrir-packmaster.png",
    "players": [
      { "rank": 1, "name": "Aryaan045", "score": "17.7M+" },
      { "rank": 2, "name": "DueBacon2007102", "score": "N/A" },
      { "rank": 3, "name": "SphinxWraith", "score": "10M+" },
      { "rank": 4, "name": "Herejefferson", "score": "N/A" },
      { "rank": 5, "name": "HeGzoStRqFe", "score": "N/A" },
      { "rank": 6, "name": "Itzomkar1232891", "score": "N/A" },
      { "rank": 7, "name": "Shakilbaby", "score": "N/A" },
      { "rank": 8, "name": "Veldra5692", "score": "5.8M+" },
      { "rank": 9, "name": "DRONZAR_OP", "score": "N/A" },
      { "rank": 10, "name": "Yogi_Ji_gaming", "score": "N/A" }
    ]
  }
];
// Damage
const damageData = [
  { rank: 1, name: "Unknown", damage: "N/A" },
  { rank: 2, name: "Unknown", damage: "N/A" },
  { rank: 3, name: "Unknown", damage: "N/A" },
  { rank: 4, name: "Unknown", damage: "N/A" },
  { rank: 5, name: "Unknown", damage: "N/A" },
  { rank: 6, name: "Unknown", damage: "N/A" },
  { rank: 7, name: "Unknown", damage: "N/A" },
  { rank: 8, name: "Unknown", damage: "N/A" },
  { rank: 9, name: "Unknown", damage: "N/A" },
  { rank: 10, name: "Unknown", damage: "N/A" }
];
// Networth
const networthData = [
  { rank: 1, name: "Unknown", networth: "N/A" },
  { rank: 2, name: "Unknown", networth: "N/A" },
  { rank: 3, name: "Unknown", networth: "N/A" },
  { rank: 4, name: "Unknown", networth: "N/A" },
  { rank: 5, name: "Unknown", networth: "N/A" },
  { rank: 6, name: "Unknown", networth: "N/A" },
  { rank: 7, name: "Unknown", networth: "N/A" },
  { rank: 8, name: "Unknown", networth: "N/A" },
  { rank: 9, name: "Unknown", networth: "N/A" },
  { rank: 10, name: "Unknown", networth: "N/A" }
];
// Pets
const petsData = {
    petsLevels: {
        name: "Pets Levels",
        scoreLabel: "Level",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    },
    petsXP: {
        name: "Pets XP",
        scoreLabel: "XP",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    },
    petScore: {
        name: "Pet Score",
        scoreLabel: "Score",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    }
};
// Most Coins and Dropped Coins
const coinsData = {
    highestCoins: {
        name: "Highest Coins",
        scoreLabel: "Coins",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    },
    droppedCoins: {
        name: "Dropped Coins",
        scoreLabel: "Coins",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    }
};
// Skills
const skillsLeaderboards = {
    skillsXp: {
        name: "Skills XP",
        scoreLabel: "XP",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    },
    averageSkill: {
        name: "Average Skill",
        scoreLabel: "Average",
        players: [
            { rank: 1, name: "SphinxWraith/David_R06", level: "51.7" },
            { rank: 2, name: "Moerderfisch", level: "50.7" },
            { rank: 3, name: "GRAVITY8303", level: "50.2" },
            { rank: 4, name: "AndyGamer024", level: "50" },
            { rank: 5, name: "Itzomkar1232891", level: "47.2" },
            { rank: 6, name: "DRONZAR_OP", level: "46.2" },
            { rank: 7, name: "Kg_lcky_01", level: "46" },
            { rank: 8, name: "Rehan2038", level: "42.3" },
            { rank: 9, name: "Perry3338", level: "39.5" },
            { rank: 10, name: "Kautilya3072", level: "36.2" }
        ]
    },
    skillsLevels: {
        name: "Skills Levels",
        scoreLabel: "Level",
        players: [
            { rank: 1, name: "Unknown", score: "N/A" },
            { rank: 2, name: "Unknown", score: "N/A" },
            { rank: 3, name: "Unknown", score: "N/A" },
            { rank: 4, name: "Unknown", score: "N/A" },
            { rank: 5, name: "Unknown", score: "N/A" },
            { rank: 6, name: "Unknown", score: "N/A" },
            { rank: 7, name: "Unknown", score: "N/A" },
            { rank: 8, name: "Unknown", score: "N/A" },
            { rank: 9, name: "Unknown", score: "N/A" },
            { rank: 10, name: "Unknown", score: "N/A" }
        ]
    }
};
// Target Practice
const targetPracticeLeaderboard = {
    name: "Target Practice",
    scoreLabel: "Time",
    players: [
        { rank: 1, name: "Unknown", score: "N/A" },
        { rank: 2, name: "Unknown", score: "N/A" },
        { rank: 3, name: "Unknown", score: "N/A" },
        { rank: 4, name: "Unknown", score: "N/A" },
        { rank: 5, name: "Unknown", score: "N/A" }
    ]
};
// Arctic Cave Race
const arcticCaveRace = {
    name: "Arctic Cave Race",
    scoreLabel: "Time",
    players: [
        { rank: 1, name: "Unknown", score: "N/A" },
        { rank: 2, name: "Unknown", score: "N/A" },
        { rank: 3, name: "Unknown", score: "N/A" },
        { rank: 4, name: "Unknown", score: "N/A" },
        { rank: 5, name: "Unknown", score: "N/A" }
    ]
};
// Ender Node Hunt
const enderNodeHunt = {
    name: "Ender Node Hunt",
    scoreLabel: "Time",
    players: [
        { rank: 1, name: "Unknown", score: "N/A" },
        { rank: 2, name: "Unknown", score: "N/A" },
        { rank: 3, name: "Unknown", score: "N/A" },
        { rank: 4, name: "Unknown", score: "N/A" },
        { rank: 5, name: "Unknown", score: "N/A" }
    ]
};
