const CalendarEngine = {
    START_OF_TIMES: 1648800000, 
    TIME_MULTIPLIER: 72,
    SEASON_LENGTH: 93,
    YEAR_LENGTH: 4,
    DAYS_PER_YEAR: 372,
    DAYS_PER_PAGE: 31, 
    MINUTES_PER_SKYBLOCK_DAY: 20,
    SEASON_SPRING: 0, SEASON_SUMMER: 1, SEASON_AUTUMN: 2, SEASON_WINTER: 3,
    
    LEGENDARY_PATTERN: ['elephant','giraffe','tiger','lion','monkey'],
    LEGENDARY_ICONS: { 'elephant':'<img src="img/pets/Elephant_Pet.webp" style="height:40px;width:auto;">',

    'giraffe':'<img src="img/pets/Giraffe_Pet.webp" style="height:40px;width:auto;">',

    'tiger':'<img src="img/pets/300px-Tiger_Pet.webp" style="height:40px;width:auto;">',

    'lion':'<img src="img/pets/300px-Lion_Pet.webp" style="height:40px;width:auto;">',

    'monkey':'<img src="img/pets/Monkey_Pet.webp" style="height:40px;width:auto;margin:4px;">'},
    TRAVELING_ZOO_LEGENDARY_OFFSET: 2,
    pagesDataCache: new Map(),
    SEASON_NAMES: ['Spring', 'Summer', 'Autumn', 'Winter'],
    CropType: ['WHEAT', 'SUGAR_CANE', 'CARROT', 'POTATO', 'MELON', 'PUMPKIN', 'COCOA_BEANS', 'CACTUS', 'MUSHROOM', 'BEETROOT'],
    CROP_ICONS: { 
        'WHEAT': '<img src="img/Wheat.webp" style="height:20px;width:auto;">',
        'SUGAR_CANE': '<img src="img/Sugar_Cane.webp" style="height:20px;width:auto;">',
        'CARROT': '<img src="img/Carrot.webp" style="height:20px;width:auto;">',
        'POTATO': '<img src="img/Potato.webp" style="height:20px;width:auto;">', 
        'MELON': '<img src="img/Melon.webp" style="height:20px;width:auto;">', 
        'PUMPKIN': '<img src="img/Pumpkin.webp" style="height:20px;width:auto;">', 
        'COCOA_BEANS': '<img src="img/Cocoa_Beans.webp" style="height:20px;width:auto;">', 
        'CACTUS': '<img src="img/Cactus.webp" style="height:20px;width:auto;">', 
        'MUSHROOM': '<img src="img/Mushroom.gif" style="height:20px;width:auto;">', 
        'BEETROOT': '<img src="img/Beetroot.webp" style="height:20px;width:auto;">' 
    },
    Random: (function() {
        //calendarjs by irrl
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
    })(),

    getZooLeg(totalDays) {
        const daysSinceEpoch = totalDays - 1;
        const seasonsSinceEpoch = Math.floor(daysSinceEpoch / this.SEASON_LENGTH);
        const year = Math.floor(seasonsSinceEpoch / this.YEAR_LENGTH) + 1;
        const season = seasonsSinceEpoch % this.YEAR_LENGTH;
        if (season !== this.SEASON_SUMMER && season !== this.SEASON_WINTER) return null;

        const occurrenceIndex = (year - 1) * 2 + (season === this.SEASON_SUMMER ? 0 : 1);
        const idx = (occurrenceIndex + this.TRAVELING_ZOO_LEGENDARY_OFFSET) % this.LEGENDARY_PATTERN.length;
        const name = this.LEGENDARY_PATTERN[idx];
        return { name, icon: this.LEGENDARY_ICONS[name] || '❓' };
    },

    getPageData(pageNumber) {
        if (!this.pagesDataCache.has(pageNumber)) this.calcPage(pageNumber);
        return this.pagesDataCache.get(pageNumber);
    },

    preCalcPage(pageNumber) {
        if (!this.pagesDataCache.has(pageNumber)) this.calcPage(pageNumber);
    },

    calcPage(pageNumber) {
        const pageDays = [];
        const startDay = (pageNumber - 1) * this.DAYS_PER_PAGE + 1;
        const endDay = startDay + this.DAYS_PER_PAGE - 1;
        for (let day = startDay; day <= endDay; day++) pageDays.push(this.getDayInfo(day));
        this.pagesDataCache.set(pageNumber, pageDays);
    },
    
    getDayInfo(totalDays) {
        const daysSinceEpoch = totalDays - 1;
        const seasonsSinceEpoch = Math.floor(daysSinceEpoch / this.SEASON_LENGTH);
        const yearsSinceEpoch = Math.floor(seasonsSinceEpoch / this.YEAR_LENGTH);

        const year = yearsSinceEpoch + 1;
        const season = seasonsSinceEpoch % this.YEAR_LENGTH;
        const dayOfSeason = daysSinceEpoch % this.SEASON_LENGTH + 1;
        
        const events = [];
        if (daysSinceEpoch % 3 === 0) {
            events.push({ name: 'Farming Contest', icon: '<img src="assets/farming/Farm-o-Matic.webp">', type: 'farming', crops: this.getFarmingCrops(Math.floor(daysSinceEpoch / 3)) });
        }
        if (season === this.SEASON_SPRING && (year - 1) % 4 === 0) {
            events.push({ name: "Season of the Pig", icon: '<img src="img/100px-Shiny_Orb.webp">' });
        }
        if ((season === this.SEASON_SUMMER && dayOfSeason <= 3) || (season === this.SEASON_WINTER && dayOfSeason <= 3)) {
            const legendary = this.getZooLeg(totalDays) || { name: 'Error', icon: '❌' };
            events.push({ name: "Travelling Zoo", icon: legendary.icon, legendaryName: legendary.name });
        }
            if (season === this.SEASON_WINTER && dayOfSeason >= 91) {
                events.push({ name: "New Year Celebration", icon: '<img src="img/Enchanted_Cake.webp">' });
            }

            return { totalDays, year, season: this.SEASON_NAMES[season], dayOfSeason, events };
    },

    getFarmingCrops(eventId) {
        const GOLDEN = 0x9E3779B97F4A7C15n;
        const seed64 = (BigInt(eventId) ^ GOLDEN) & ((1n << 48n) - 1n);
        const seed48 = Number(seed64);
        const rng = new this.Random(seed48);
        const arr = this.CropType.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = rng.nextInt(i + 1);
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr.slice(0, 3);
    },
    
    getCurrentTimeData() {
        const realSecondsSinceEpoch = (Date.now() / 1000) - this.START_OF_TIMES;
        const skyblockSeconds = realSecondsSinceEpoch * this.TIME_MULTIPLIER;
        const skyblockDecimalDays = skyblockSeconds / 86400;
        
        const daysSinceEpoch = Math.floor(skyblockDecimalDays);
        const seasonsSinceEpoch = Math.floor(daysSinceEpoch / this.SEASON_LENGTH);
        const currentYear = Math.floor(seasonsSinceEpoch / this.YEAR_LENGTH) + 1;
        const currentSeason = seasonsSinceEpoch % this.YEAR_LENGTH;
        const todaySeason = daysSinceEpoch % this.SEASON_LENGTH + 1;

        return {
            currentYear, currentSeason, todaySeason, skyblockDecimalDays,
            todaySkyblock: daysSinceEpoch + 1,
            todayInYear: (currentSeason * this.SEASON_LENGTH) + todaySeason
        };
    },

    getUpcomingEventsData() {
        const time = this.getCurrentTimeData();
        const upcoming = [];
        // contest
        const nextContestDay = Math.floor(time.todaySkyblock / 3) * 3 + 1;
        upcoming.push({ name: "Farming Contest", icon: '<img src="assets/farming/Farm-o-Matic.webp">', type: 'farming', nextDay: nextContestDay > time.todaySkyblock ? nextContestDay : nextContestDay + 3, crops: this.getFarmingCrops(Math.floor(nextContestDay/3))});
        // SHINY PIGS MY GOAT
        let nextPigYear = Math.ceil(time.currentYear / 4) * 4 + 1; //offset
        if(time.currentYear > nextPigYear || (time.currentYear === nextPigYear && time.currentSeason > this.SEASON_SPRING)) nextPigYear += 4;
        upcoming.push({ name: "Season of the Pig", icon: '<img src="img/100px-Shiny_Orb.webp">', nextDay: ((nextPigYear - 1) * this.DAYS_PER_YEAR) + 1});
        // cake
        let nextNewYearDay = ((time.currentYear -1) * this.DAYS_PER_YEAR) + (this.SEASON_WINTER * this.SEASON_LENGTH) + 91;
        if(time.todayInYear > (this.SEASON_WINTER * this.SEASON_LENGTH) + 91) nextNewYearDay += this.DAYS_PER_YEAR;
        upcoming.push({ name: "New Year Celebration", icon: '<img src="img/Enchanted_Cake.webp">', nextDay: nextNewYearDay });
        // zoo
        const summerStart = (this.SEASON_SUMMER * this.SEASON_LENGTH) + 1;
        const winterStart = (this.SEASON_WINTER * this.SEASON_LENGTH) + 1;
        let nextZooDay;
        if(time.todayInYear < summerStart) nextZooDay = ((time.currentYear -1) * this.DAYS_PER_YEAR) + summerStart;
        else if(time.todayInYear < winterStart) nextZooDay = ((time.currentYear -1) * this.DAYS_PER_YEAR) + winterStart;
        else nextZooDay = (time.currentYear * this.DAYS_PER_YEAR) + summerStart;
        const legendaryNext = this.getZooLeg(nextZooDay) || { name: 'Unknown', icon: '🐘' };
        upcoming.push({ name: "Travelling Zoo", icon: legendaryNext.icon, legendaryName: legendaryNext.name, nextDay: nextZooDay });
        upcoming.forEach(event => {
            const daysUntil = event.nextDay - time.skyblockDecimalDays - 1;
            event.msUntil = daysUntil * this.MINUTES_PER_SKYBLOCK_DAY * 60 * 1000;
        });
        
        return upcoming.sort((a,b) => a.msUntil - b.msUntil);
    },
//if you are reading this noticable notice you may notice that this noticable notice is not worth noticing and has no noticable value
    getNextOccurrences(eventName, startSkyblockDay, count = 10) {
        const results = [];
        const start = Math.max(1, Math.floor(startSkyblockDay));
        const pushOcc = (totalDays, extra = {}) => {
            const realDate = this.getRealTimeForDay(totalDays);
            const msUntil = realDate.getTime() - Date.now();
            results.push(Object.assign({ totalDays, realDate, msUntil }, extra));
        };

        if (eventName === 'Farming Contest') {
            let first = Math.floor((start - 1) / 3) * 3 + 1;
            if (first < start) first += 3;
            for (let i = 0; results.length < count; i++) {
                const day = first + i * 3;
                const eventId = Math.floor((day - 1) / 3);
                pushOcc(day, { crops: this.getFarmingCrops(eventId) });
            }
        } else if (eventName === 'Travelling Zoo') {
            const summerStart = (this.SEASON_SUMMER * this.SEASON_LENGTH) + 1;
            const winterStart = (this.SEASON_WINTER * this.SEASON_LENGTH) + 1;
            let year = Math.floor((start - 1) / this.DAYS_PER_YEAR) + 1;
            while (results.length < count) {
                const s = ((year - 1) * this.DAYS_PER_YEAR) + summerStart;
                if (s >= start) {
                    const legendary = this.getZooLeg(s) || { name: 'Unknown', icon: '❓' };
                    pushOcc(s, { legendaryName: legendary.name, legendaryIcon: legendary.icon });
                }
                const w = ((year - 1) * this.DAYS_PER_YEAR) + winterStart;
                if (results.length < count && w >= start) {
                    const legendary = this.getZooLeg(w) || { name: 'Unknown', icon: '❓' };
                    pushOcc(w, { legendaryName: legendary.name, legendaryIcon: legendary.icon });
                }
                year++;
            }
        } else if (eventName === 'New Year Celebration') {
            let year = Math.floor((start - 1) / this.DAYS_PER_YEAR) + 1;
            while (results.length < count) {
                const day = ((year - 1) * this.DAYS_PER_YEAR) + (this.SEASON_WINTER * this.SEASON_LENGTH) + 91;
                if (day >= start) pushOcc(day);
                year++;
            }
        } else if (eventName === 'Season of the Pig') {
            let year = Math.floor((start - 1) / this.DAYS_PER_YEAR) + 1;
            while (results.length < count) {
                const day = ((year - 1) * this.DAYS_PER_YEAR) + (this.SEASON_SPRING * this.SEASON_LENGTH) + 1;
                if (((year - 1) % 4 === 0) && day >= start) pushOcc(day);
                year++;
            }
        } else {
            for (let i = 0; results.length < count; i++) pushOcc(start + i);
        }

        return results.slice(0, count);
    },

    getRealTimeForDay(totalDays) {
        const realSeconds = this.START_OF_TIMES + ((totalDays - 1) * this.MINUTES_PER_SKYBLOCK_DAY * 60);
        return new Date(realSeconds * 1000);
    },
};