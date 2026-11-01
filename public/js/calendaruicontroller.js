const UIController = {
    currentPage: 1,
    todaySkyblock: 0,
    engine: null,
    elements: {},
    modalCount: null,
    currentUpcomingEvents: [], 

    init(engine) {
        this.engine = engine;
        this.elementLoad();
        this.setupListeners();
        const time = this.engine.getCurrentTimeData();
        this.todaySkyblock = time.todaySkyblock;
        this.currentPage = Math.max(1, Math.ceil(this.todaySkyblock / this.engine.DAYS_PER_PAGE));
        if (this.elements.yearInput) this.elements.yearInput.value = time.currentYear;
        this.engine.preCalcPage(this.currentPage);
        this.engine.preCalcPage(this.currentPage + 1);
        this.loadPageToday();
        this.initTimers();
    },

    elementLoad() {
        this.elements = {
            calGrid: document.getElementById('grid'),
            yearNum: document.getElementById('year'),
            yearInput: document.getElementById('year-input'),
            yearGo: document.getElementById('year-go'),
            nextPage: document.getElementById('next-page'),
            prevPage: document.getElementById('prev-page'),
            pageCounter: document.getElementById('page-counter'),
            dateHeader: document.getElementById('date-top'),
            eventList: document.getElementById('events-list'),
            modal: document.getElementById('day-modal'),
            modalClose: document.getElementById('modal-close-btn'),
            eventModal: document.getElementById('event-modal'),
            eventModalClose: document.getElementById('event-modal-close-btn')
        };
    },

    setupListeners() {
        this.elements.nextPage.addEventListener('click', () => this.nextPage());
        this.elements.prevPage.addEventListener('click', () => this.prevPage());
        if (this.elements.yearGo) this.elements.yearGo.addEventListener('click', () => this.goToYearFromInput());
        if (this.elements.yearInput) this.elements.yearInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.goToYearFromInput(); });
        this.elements.modal.addEventListener('click', (e) => { if (e.target === this.elements.modal) this.closeModal(); });
        this.elements.modalClose.addEventListener('click', () => this.closeModal());

        if (this.elements.eventModal) {
            this.elements.eventModal.addEventListener('click', (e) => {
                if (e.target === this.elements.eventModal) this.closeEventModal();
            });
        }
        if (this.elements.eventModalClose) {
            this.elements.eventModalClose.addEventListener('click', () => this.closeEventModal());
        }

        // Keyboard accessibility: ESC key to close any open modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.elements.modal && this.elements.modal.classList.contains('visible')) {
                    this.closeModal();
                }
                if (this.elements.eventModal && this.elements.eventModal.classList.contains('visible')) {
                    this.closeEventModal();
                }
            }
        });

        this.elements.eventList.addEventListener('click', (e) => {
            const item = e.target.closest('.event-timer-item');
            if (!item) return;
            const idx = Number(item.dataset.eventIndex);
            const ev = this.currentUpcomingEvents && this.currentUpcomingEvents[idx];
            if (ev) {
                this.openEventModal(ev);
            }
        });

        // Keyboard accessibility: Enter or Space on an event item
        this.elements.eventList.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.event-timer-item');
                if (item) {
                    e.preventDefault();
                    item.click();
                }
            }
        });
    },

    nextPage() {
        this.currentPage++;
        this.loadPageToday();
        this.engine.preCalcPage(this.currentPage + 1);
    },
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadPageToday();
        }
    },

    initTimers() {
        let upcomingEvents = this.engine.getUpcomingEventsData().map(event => {
            event.targetTime = Date.now() + event.msUntil;
            return event;
        });
        this.currentUpcomingEvents = upcomingEvents;
        this.upcomingEvents(upcomingEvents);

        setInterval(() => {
            upcomingEvents.forEach((event, idx) => {
                const countdownEl = document.querySelectorAll('.event-timer-countdown')[idx];
                if (countdownEl) {
                    const msLeft = event.targetTime - Date.now();
                    countdownEl.textContent = this.timeCorrect(msLeft);
                }
            });
        }, 1000);

        setInterval(() => {
            const timeData = this.engine.getCurrentTimeData();
            const newSkyblockDay = timeData.todaySkyblock;
            const dayChanged = this.todaySkyblock !== newSkyblockDay;
            this.todaySkyblock = newSkyblockDay;
            this.elements.dateHeader.textContent = `Today: Year ${timeData.currentYear}, ${this.engine.SEASON_NAMES[timeData.currentSeason]}, Day ${timeData.todaySeason}`;
            if (dayChanged) {
                const newPage = Math.max(1, Math.ceil(this.todaySkyblock / this.engine.DAYS_PER_PAGE));
                if (newPage !== this.currentPage) {
                    this.currentPage = newPage;
                    this.engine.preCalcPage(this.currentPage + 1);
                }
                this.loadPageToday();
                upcomingEvents = this.engine.getUpcomingEventsData().map(event => {
                    event.targetTime = Date.now() + event.msUntil;
                    return event;
                });
                this.currentUpcomingEvents = upcomingEvents;
                this.upcomingEvents(upcomingEvents);
            }
        }, 1000);
    },
    
    timeCorrect(ms) {
        if (ms < 0) return "0d 0h 0m 0s";
        let s = Math.floor(ms / 1000), m = Math.floor(s / 60);
        let h = Math.floor(m / 60), d = Math.floor(h / 24);
        return `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
    },
    
getPetEmoji(name) {
            if (!name) return '❓';
            const key = String(name).toLowerCase();
            return this.engine.PET_EMOJIS?.[key] || '❓';
        },

        getRarityLabel(rarity) {
            if (!rarity) return '';
            const upper = String(rarity).toUpperCase();
            const key = String(rarity).toLowerCase();
            if (this.engine && this.engine.RARITIES_ICONS && this.engine.RARITIES_ICONS[upper]) {
                return this.engine.RARITIES_ICONS[upper];
            }
            return `<img src="assets/rarity/${key}.webp" class="rarity-icon" alt="${capitalize(key)}">`;
        },

        getEventDisplayName(event) {
            if (!event) return '';
            const name = typeof event === 'string' ? event : event.name;
            if (name === 'Farming Contest' || (event && event.type === 'farming')) {
                return "Ethan's Farming Contest";
            }
            return name;
        },

        getEventIcon(event) {
            if (event.name === 'Travelling Zoo') {
                if (event.legendaryIcon) return event.legendaryIcon;
                const nameKey = String(event.legendaryName || '').toLowerCase();
                if (this.engine && this.engine.LEGENDARY_ICONS && this.engine.LEGENDARY_ICONS[nameKey]) return this.engine.LEGENDARY_ICONS[nameKey];
                return event.icon || '';
            }
            return event.icon;

        },

    upcomingEvents(events) {
        this.currentUpcomingEvents = events;
        const accentColors = ['blue', 'yellow', 'green', 'purple', 'orange', 'pink'];
        this.elements.eventList.innerHTML = events.map((event, idx) => {
            const displayName = this.getEventDisplayName(event);
            let info = 'Starts in...';
            if (event.type === 'farming' && event.crops) {
                const cropsHtml = event.crops.map(c => {
                    const icon = this.engine.CROP_ICONS[c] || '';
                    const cleanName = formatCropName(c);
                    return `<span class="crop-preview-badge" title="${cleanName}">${icon} <span class="crop-badge-name">${cleanName}</span></span>`;
                }).join('');
                info = `<div class="farming-crops-preview"><span class="farming-crops-label">Contested Crops:</span> <div class="farming-crops-chips">${cropsHtml}</div></div>`;
            } else if (event.name === 'Travelling Zoo' && event.legendaryName) {
                if (event.pets && event.pets.length) {
                    const items = event.pets.map(p => `
                        <li class="zoo-pet-item">
                            <span class="zoo-pet-emoji">${this.getPetEmoji(p.name)}</span>
                            <span class="zoo-pet-name">${capitalize(p.name)}</span>
                            ${this.getRarityLabel(p.rarity)}
                        </li>
                    `).join('');
                    info = `<ul class="zoo-pet-list">${items}</ul>`;
                } else {
                    info = `<div class="zoo-legendary-preview"><span class="legendary-label">Legendary:</span> ${this.getEventIcon(event.legendaryName)} <span class="legendary-name">${capitalize(event.legendaryName)}</span></div>`;
                }
            }
            const accent = accentColors[idx % accentColors.length];
            return `
                <div class="event-timer-item neo-card accent-${accent}" data-event-index="${idx}" role="button" tabindex="0" aria-label="View schedule for ${displayName}">
                    <div class="event-card-top">
                        <div class="event-icon-badge">${this.getEventIcon(event)}</div>
                        <div class="event-title-block">
                            <div class="event-title-row">
                                <h3 class="event-name">${displayName}</h3>
                                <span class="event-timing-tag">Upcoming</span>
                            </div>
                            <div class="event-info">${info}</div>
                        </div>
                    </div>
                    <div class="event-card-bottom">
                        <div class="event-timer-countdown neo-stat-chip">${this.timeCorrect(event.msUntil)}</div>
                        <div class="event-open-modal-hint">
                            <span class="material-icons">event_repeat</span>
                            <span>Timetable</span>
                        </div>
                    </div>
                </div>
                `;
        }).join('');
    },

        loadPage(page) {
            this.elements.calGrid.innerHTML = '';
            if (!page) return;

            // keep year input synced with what's shown on the page
            if (this.elements.yearInput) this.elements.yearInput.value = page[0].year;
            this.elements.yearNum.textContent = page[0].year;
            this.elements.prevPage.disabled = this.currentPage <= 1;
            if (this.elements.pageCounter) this.elements.pageCounter.textContent = this.currentPage;

            page.forEach(day => {
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell neo-card';
                if (day.totalDays === this.todaySkyblock) {
                    dayCell.classList.add('today');
                    dayCell.id = 'today';
                }

                dayCell.setAttribute('role', 'button');
                dayCell.setAttribute('tabindex', '0');
                const evCount = day.events ? day.events.length : 0;
                dayCell.setAttribute('aria-label', `Year ${day.year}, ${day.season} ${day.dayOfSeason}${evCount > 0 ? ` (${evCount} event${evCount > 1 ? 's' : ''})` : ''} - Click to inspect`);

                let eventContent = '';
                if (day.events.length > 0) {
                    const icons = day.events.slice(0, 2).map(e => e.icon).join('');
                    eventContent = `<div class="event-icons">${icons}</div>`;
                } else {
                    eventContent = `<div class="no-events" style="font-size: 8px; opacity:0.5;">None</div>`;
                }

                dayCell.innerHTML = `
                    <div class="day-header">
                        <span class="day-season">${day.season.substring(0,3)} ${day.dayOfSeason}</span>
                        <span class="day-year">Y${day.year}</span>
                    </div>
                    <div class="day-body">${eventContent}</div>`;
                
                if (dayCell.id === 'today') {
                    dayCell.classList.add('cyan');
                }

                dayCell.addEventListener('click', () => this.modalThing(day));
                dayCell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.modalThing(day);
                    }
                });

                this.elements.calGrid.appendChild(dayCell);
            });
        },

        loadPageToday() {
            const page = this.engine.getPageData(this.currentPage);
            if (page && page.length > 0) {
                if (this.elements.yearInput) this.elements.yearInput.value = page[0].year;
                this.elements.yearNum.textContent = page[0].year;
                this.elements.prevPage.disabled = this.currentPage <= 1;
            }
            this.loadPage(page);
        },

        modalThing(day) {
            const realDate = this.engine.getRealTimeForDay(day.totalDays);
            const startTime = realDate.getTime();
            const dayDurationMs = (this.engine.MINUTES_PER_SKYBLOCK_DAY || 20) * 60 * 1000;
            const endTime = startTime + dayDurationMs;
            const endDate = new Date(endTime);

            const modalTitleEl = document.getElementById('modal-title');
            const modalSubtitleEl = document.getElementById('modal-subtitle');
            const countdownEl = document.getElementById('modal-timer');
            const seasonBadgeEl = document.getElementById('modal-badge-season');
            const dayBadgeEl = document.getElementById('modal-badge-day');
            const statusBadgeEl = document.getElementById('modal-badge-status');
            const eventsCountEl = document.getElementById('modal-events-count');

            if (modalTitleEl) {
                modalTitleEl.textContent = `Year ${day.year}, ${day.season} ${day.dayOfSeason}`;
            }

            // Season Badge
            const seasonColorMap = {
                'Spring': 'green',
                'Summer': 'yellow',
                'Autumn': 'orange',
                'Winter': 'cyan'
            };
            const seasonIconMap = {
                'Spring': 'filter_vintage',
                'Summer': 'wb_sunny',
                'Autumn': 'eco',
                'Winter': 'ac_unit'
            };
            const sColor = seasonColorMap[day.season] || 'cyan';
            const sIcon = seasonIconMap[day.season] || 'calendar_today';

            if (seasonBadgeEl) {
                seasonBadgeEl.className = `neo-badge ${sColor}`;
                seasonBadgeEl.innerHTML = `<span class="material-icons" style="font-size:12px;">${sIcon}</span> ${day.season}`;
            }
            if (dayBadgeEl) {
                dayBadgeEl.className = 'neo-badge pink';
                dayBadgeEl.textContent = `Day ${day.dayOfSeason} of 93`;
            }

            // Real Time Window Subtitle
            const dateStr = realDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const timeRangeStr = `${realDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            if (modalSubtitleEl) {
                modalSubtitleEl.innerHTML = `<span class="modal-time-date">${dateStr}</span> <span class="modal-time-bullet">&bull;</span> <span class="modal-time-range">${timeRangeStr} (Local Time)</span>`;
            }

            if (this.modalCount) clearInterval(this.modalCount);

            const updateCountdown = () => {
                const now = Date.now();
                if (now >= startTime && now < endTime) {
                    // Active Now (Today)
                    const msRemaining = Math.max(0, endTime - now);
                    if (countdownEl) {
                        countdownEl.style.display = 'inline-flex';
                        countdownEl.className = 'modal-countdown-chip status-active';
                        countdownEl.innerHTML = `<span class="pulse-indicator"></span> <span class="material-icons" style="font-size:16px;">radio_button_checked</span> <span>Happening Now &bull; ${this.timeCorrect(msRemaining)} remaining</span>`;
                    }
                    if (statusBadgeEl) {
                        statusBadgeEl.style.display = 'inline-flex';
                        statusBadgeEl.className = 'neo-badge green pulse-badge';
                        statusBadgeEl.innerHTML = '<span class="pulse-indicator"></span> ACTIVE TODAY';
                    }
                } else if (now < startTime) {
                    // Upcoming day in the future
                    const msUntil = startTime - now;
                    if (countdownEl) {
                        countdownEl.style.display = 'inline-flex';
                        countdownEl.className = 'modal-countdown-chip status-upcoming';
                        countdownEl.innerHTML = `<span class="material-icons" style="font-size:16px;">hourglass_top</span> <span>Starts in: ${this.timeCorrect(msUntil)}</span>`;
                    }
                    if (statusBadgeEl) {
                        statusBadgeEl.style.display = 'inline-flex';
                        statusBadgeEl.className = 'neo-badge blue';
                        statusBadgeEl.innerHTML = '<span class="material-icons" style="font-size:12px;">update</span> UPCOMING';
                    }
                } else {
                    // Concluded day in the past
                    if (countdownEl) {
                        countdownEl.style.display = 'inline-flex';
                        countdownEl.className = 'modal-countdown-chip status-past';
                        countdownEl.innerHTML = `<span class="material-icons" style="font-size:16px;">history</span> <span>Day Concluded</span>`;
                    }
                    if (statusBadgeEl) {
                        statusBadgeEl.style.display = 'inline-flex';
                        statusBadgeEl.className = 'neo-badge gray';
                        statusBadgeEl.innerHTML = '<span class="material-icons" style="font-size:12px;">check</span> CONCLUDED';
                    }
                }
            };
            updateCountdown();
            this.modalCount = setInterval(updateCountdown, 1000);

            const eventListEl = document.getElementById('modal-event-list');
            const eventsTitleEl = document.getElementById('modal-events-title');
            if (eventListEl) eventListEl.innerHTML = '';

            const numEvents = (day.events && day.events.length) || 0;
            if (eventsCountEl) {
                eventsCountEl.textContent = numEvents === 1 ? '1 Event' : `${numEvents} Events`;
                eventsCountEl.className = numEvents > 0 ? 'neo-badge yellow' : 'neo-badge gray';
            }

            if (numEvents > 0) {
                if (eventsTitleEl) eventsTitleEl.style.display = '';
                day.events.forEach(event => {
                    const li = document.createElement('li');
                    li.className = 'modal-event-item';
                    const displayName = this.getEventDisplayName(event);

                    let tagBadge = '<span class="neo-badge blue">SPECIAL EVENT</span>';
                    let descHtml = '';
                    let detailsHtml = '';

                    if (event.type === 'farming' || event.name === 'Farming Contest') {
                        tagBadge = '<span class="neo-badge orange">FARMING CONTEST</span>';
                        if (event.crops && event.crops.length) {
                            const cropsHtml = event.crops.map(c => {
                                const icon = this.engine.CROP_ICONS[c] || '';
                                const cleanName = formatCropName(c);
                                return `<span class="day-modal-crop-pill" title="${cleanName}">${icon} <span>${cleanName}</span></span>`;
                            }).join('');
                            detailsHtml = `
                                <div class="modal-event-crops-row">
                                    <span class="modal-crops-mini-label">Contested Crops:</span>
                                    <div class="day-modal-crops-chips">${cropsHtml}</div>
                                </div>
                            `;
                        }
                    } else if (event.name === 'Travelling Zoo') {
                        tagBadge = '<span class="neo-badge yellow">TRAVELLING ZOO</span>';
                        let petsHtml = '';
                        if (event.pets && event.pets.length) {
                            const items = event.pets.map(p => `
                                <li class="zoo-pet-item">
                                    <span class="zoo-pet-emoji">${this.getPetEmoji(p.name)}</span>
                                    <span class="zoo-pet-name">${capitalize(p.name)}</span>
                                    ${this.getRarityLabel(p.rarity)}
                                </li>
                            `).join('');
                            petsHtml = `<ul class="zoo-pet-list">${items}</ul>`;
                        }
                        let legHtml = '';
                        if (event.legendaryName) {
                            legHtml = `<div class="modal-zoo-legendary-row"><span class="modal-zoo-legendary-label">Legendary Pet:</span> <span class="modal-zoo-legendary-val">${this.getPetEmoji(event.legendaryName)} ${capitalize(event.legendaryName)}</span></div>`;
                        }
                        detailsHtml = `<div class="modal-zoo-block">${legHtml}${petsHtml}</div>`;
                    } else if (event.name === 'Spooky Festival') {
                        tagBadge = '<span class="neo-badge purple">SPOOKY FESTIVAL</span>';
                        descHtml = '<p class="modal-event-desc">Fear Mongerer arrives! Trick-or-Treat across SkyBlock and collect Green and Purple Candies from all mobs.</p>';
                    } else if (event.name === 'Season of the Pig') {
                        tagBadge = '<span class="neo-badge pink">SEASON OF THE PIG</span>';
                        descHtml = '<p class="modal-event-desc">Shiny Pigs appear across the Hub! Hit them to earn Shiny Orbs and rare celebratory loot.</p>';
                    } else if (event.name === 'New Year Celebration') {
                        tagBadge = '<span class="neo-badge cyan">NEW YEAR</span>';
                        descHtml = `<p class="modal-event-desc">Baker visits the Hub distributing Year ${day.year} Cakes! Fireworks and celebration active throughout the day.</p>`;
                    }

                    li.innerHTML = `
                        <div class="modal-event-icon-badge">${this.getEventIcon(event)}</div>
                        <div class="modal-event-details">
                            <div class="modal-event-header-row">
                                <h4 class="modal-event-name">${displayName}</h4>
                                <div class="modal-event-header-badges">
                                    ${tagBadge}
                                    <button type="button" class="modal-event-timetable-btn" title="View timetable for ${displayName}">
                                        <span class="material-icons" style="font-size:13px;">event_repeat</span>
                                        <span>Timetable</span>
                                    </button>
                                </div>
                            </div>
                            ${descHtml}
                            ${detailsHtml}
                        </div>
                    `;

                    // Clicking the timetable button or item opens the event timetable modal
                    const ttBtn = li.querySelector('.modal-event-timetable-btn');
                    if (ttBtn) {
                        ttBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.closeModal();
                            this.openEventModal(event);
                        });
                    }
                    li.style.cursor = 'pointer';
                    li.addEventListener('click', () => {
                        this.closeModal();
                        this.openEventModal(event);
                    });

                    eventListEl.appendChild(li);
                });
            } else {
                if (eventsTitleEl) eventsTitleEl.style.display = '';
                eventListEl.innerHTML = `
                    <li class="modal-empty-state">
                        <div class="modal-empty-icon-wrap">
                            <span class="material-icons" style="font-size:26px;">event_busy</span>
                        </div>
                        <div class="modal-empty-text-wrap">
                            <h4 class="modal-empty-title">No Events Scheduled</h4>
                            <p class="modal-empty-subtitle">Standard peaceful SkyBlock day with no active festivals or special contests.</p>
                        </div>
                    </li>
                `;
            }

            this.elements.modal.classList.add('visible');
        },

        openEventModal(event) {
            if (!this.elements.eventModal) return;
            const barTitleEl = document.getElementById('event-modal-bar-title');
            const iconEl = document.getElementById('event-modal-icon');
            const titleEl = document.getElementById('event-modal-title');
            const subtitleEl = document.getElementById('event-modal-subtitle');
            const timerEl = document.getElementById('event-modal-timer');
            const bodyEl = document.getElementById('event-modal-body');

            const displayName = this.getEventDisplayName(event);
            if (barTitleEl) barTitleEl.textContent = `Event Timetable • ${displayName}`;
            if (iconEl) iconEl.innerHTML = `<span class="event-icon">${this.getEventIcon(event)}</span>`;
            if (titleEl) titleEl.textContent = displayName;

            let subInfo = '';
            if (event.type === 'farming' && event.crops) {
                const cropsHtml = event.crops.map(c => {
                    const icon = this.engine.CROP_ICONS[c] || '';
                    const cleanName = formatCropName(c);
                    return `<span class="modal-crop-chip" title="${cleanName}">${icon} <span>${cleanName}</span></span>`;
                }).join('');
                subInfo = `<div class="modal-contested-crops-row"><span class="modal-crops-label">Contested Crops:</span> <div class="modal-crops-list">${cropsHtml}</div></div>`;
            } else if (event.legendaryName) {
                subInfo = `<div class="modal-legendary-pet-row"><span class="modal-pet-label">Legendary Pet:</span> <span class="modal-pet-value">${this.getPetEmoji(event.legendaryName)} ${capitalize(event.legendaryName)}</span></div>`;
            }
            if (subtitleEl) subtitleEl.innerHTML = subInfo;

            if (this.eventModalCount) clearInterval(this.eventModalCount);
            
            let targetTime = event.targetTime;
            if (!targetTime) {
                if (typeof event.msUntil === 'number' && !isNaN(event.msUntil)) {
                    targetTime = Date.now() + event.msUntil;
                } else {
                    const nextOcc = this.engine.getNextOccurrences(event.name, this.todaySkyblock, 1)[0];
                    targetTime = nextOcc ? nextOcc.realDate.getTime() : Date.now();
                }
            }

            const updateEventCountdown = () => {
                const now = Date.now();
                const ms = targetTime - now;
                if (timerEl) {
                    if (ms > 0) {
                        timerEl.style.display = 'inline-flex';
                        timerEl.innerHTML = `<span class="material-icons" style="font-size:16px;">schedule</span> <span>Starts in: ${this.timeCorrect(ms)}</span>`;
                    } else {
                        timerEl.style.display = 'inline-flex';
                        timerEl.innerHTML = `<span class="material-icons" style="font-size:16px;">celebration</span> <span>Event Active Now!</span>`;
                    }
                }
            };
            updateEventCountdown();
            this.eventModalCount = setInterval(updateEventCountdown, 1000);

            bodyEl.innerHTML = '';

            const occ = this.engine.getNextOccurrences(event.name, this.todaySkyblock, 200);

            if (event.name === 'Farming Contest') {
                const filterContainer = document.createElement('div');
                filterContainer.className = 'farming-filters-container';
                filterContainer.innerHTML = `
                    <div class="farming-filters-header">
                        <span class="material-icons" style="font-size:16px;">filter_alt</span>
                        <span class="farming-filters-title">Filter by Crop:</span>
                        <span class="farming-filters-note">(select crops to filter timetable)</span>
                    </div>
                `;

                const chipsWrapper = document.createElement('div');
                chipsWrapper.className = 'farming-filters-chips';
                this.engine.CropType.forEach(cropKey => {
                    const label = document.createElement('label');
                    label.className = 'farming-filter';
                    label.title = cropKey;
                    label.innerHTML = `<input type="checkbox" value="${cropKey}"><span class="crop-icon">${this.engine.CROP_ICONS[cropKey] || ''}</span><span class="crop-name">${cropKey.replace('_',' ')}</span>`;
                    chipsWrapper.appendChild(label);
                });
                filterContainer.appendChild(chipsWrapper);
                bodyEl.appendChild(filterContainer);

                const tableWrap = document.createElement('div');
                tableWrap.className = 'occurrences-table-wrapper';
                const table = document.createElement('table');
                table.className = 'occurrences-table';
                tableWrap.appendChild(table);
                bodyEl.appendChild(tableWrap);

                const renderTable = (list) => {
                    if (!list || list.length === 0) {
                        table.innerHTML = `
                            <thead>
                                <tr>
                                    <th>In-Game Date</th>
                                    <th>Real Date (Local)</th>
                                    <th>Time Until</th>
                                    <th>Crops</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="4" style="text-align:center; padding: 24px; color: var(--text-secondary); font-weight: 700;">
                                        No upcoming contests found matching selected crops in the next 1,000 SkyBlock days.
                                    </td>
                                </tr>
                            </tbody>
                        `;
                        return;
                    }
                    table.innerHTML = `
                        <thead>
                            <tr>
                                <th><div class="th-content"><span class="material-icons">calendar_today</span> In-Game Date</div></th>
                                <th><div class="th-content"><span class="material-icons">schedule</span> Real Date (Local)</div></th>
                                <th><div class="th-content"><span class="material-icons">hourglass_top</span> Time Until</div></th>
                                <th><div class="th-content"><span class="material-icons">eco</span> Contested Crops</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${list.slice(0, 10).map(o => {
                                const day = this.engine.getDayInfo(o.totalDays);
                                const shortSeason = day.season.substring(0, 3);
                                const realStr = o.realDate.toLocaleString();
                                const until = this.timeCorrect(o.msUntil);
                                const cropsHtml = (o.crops || []).map(c => {
                                    const icon = this.engine.CROP_ICONS[c] || '';
                                    const cleanName = formatCropName(c);
                                    return `<span class="table-crop-badge" title="${cleanName}">${icon} <span>${cleanName}</span></span>`;
                                }).join(' ');
                                return `<tr>
                                    <td><span class="table-date-badge">Year ${day.year}, ${shortSeason} ${day.dayOfSeason}</span></td>
                                    <td class="table-real-date">${realStr}</td>
                                    <td><span class="table-time-until">${until}</span></td>
                                    <td><div class="table-crops-row">${cropsHtml}</div></td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    `;
                };

                const farmingOcc = occ.filter(o => o.crops && o.crops.length).slice(0, 1000);
                renderTable(farmingOcc);

                chipsWrapper.addEventListener('change', () => {
                    const checked = Array.from(chipsWrapper.querySelectorAll('input:checked')).map(i => i.value);
                    if (checked.length === 0) {
                        renderTable(farmingOcc);
                        return;
                    }
                    const matches = [];
                    for (let i = 0; i < farmingOcc.length && matches.length < 10; i++) {
                        const o = farmingOcc[i];
                        if (o.crops && checked.some(c => o.crops.includes(c))) matches.push(o);
                    }
                    renderTable(matches);
                });
            } else {
                const tableWrap = document.createElement('div');
                tableWrap.className = 'occurrences-table-wrapper';
                const table = document.createElement('table');
                table.className = 'occurrences-table';
                tableWrap.appendChild(table);
                bodyEl.appendChild(tableWrap);

                const filtered = occ.slice(0, 10);
                const hasExtraNonFarm = filtered.some(o => o.legendaryName) || event.name === 'New Year Celebration';
                const theadCols = [
                    '<th><div class="th-content"><span class="material-icons">calendar_today</span> In-Game Date</div></th>',
                    '<th><div class="th-content"><span class="material-icons">schedule</span> Real Date (Local)</div></th>',
                    '<th><div class="th-content"><span class="material-icons">hourglass_top</span> Time Until</div></th>'
                ];
                if (hasExtraNonFarm) theadCols.push('<th><div class="th-content"><span class="material-icons">stars</span> Extra Details</div></th>');

                table.innerHTML = `
                    <thead>
                        <tr>${theadCols.join('')}</tr>
                    </thead>
                    <tbody>
                        ${filtered.map(o => {
                            const day = this.engine.getDayInfo(o.totalDays);
                            const shortSeason = day.season.substring(0, 3);
                            const realStr = o.realDate.toLocaleString();
                            const until = this.timeCorrect(o.msUntil);
                            let extra = '';
                            if (o.pets && o.pets.length) {
                                const items = o.pets.map(p => `<li class="zoo-pet-item"><span class="zoo-pet-emoji">${this.getPetEmoji(p.name)}</span> <span class="zoo-pet-name">${capitalize(p.name)}</span> ${this.getRarityLabel(p.rarity)}</li>`).join('');
                                extra = `<ul class="zoo-pet-list">${items}</ul>`;
                            } else if (o.legendaryName) {
                                const icon = this.getPetEmoji(o.legendaryName);
                                extra = `<span class="occ-extra">${icon} ${capitalize(o.legendaryName)}</span>`;
                            } else if (event.name === 'New Year Celebration') {
                                extra = `<span class="neo-badge yellow">Year ${day.year}</span>`;
                            }
                            const baseCells = [
                                `<td><span class="table-date-badge">Year ${day.year}, ${shortSeason} ${day.dayOfSeason}</span></td>`,
                                `<td class="table-real-date">${realStr}</td>`,
                                `<td><span class="table-time-until">${until}</span></td>`
                            ];
                            if (hasExtraNonFarm) baseCells.push(`<td>${extra}</td>`);
                            return `<tr>${baseCells.join('')}</tr>`;
                        }).join('')}
                    </tbody>
                `;
            }

            this.elements.eventModal.classList.add('visible');
        },

        closeEventModal() {
            if (this.elements.eventModal) {
                this.elements.eventModal.classList.remove('visible');
            }
            if (this.eventModalCount) {
                clearInterval(this.eventModalCount);
                this.eventModalCount = null;
            }
        },

        closeModal() {
            this.elements.modal.classList.remove('visible');
            if (this.modalCount) {
                clearInterval(this.modalCount);
                this.modalCount = null;
            }
        },
        //THIS WAS A PAINNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN
        toToday() {
            try {
                if (!this.engine) {
                    const today = document.getElementById('today') || document.querySelector('.today');
                    if (today) today.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    console.warn('missing engine');
                    return;
                }
                const time = this.engine.getCurrentTimeData();
                const pageDaysNum = this.engine.DAYS_PER_PAGE || 31;
                const todayPage = Math.max(1, Math.ceil(time.todaySkyblock / pageDaysNum));
                this.currentPage = todayPage;
                if (typeof this.engine.preCalcPage === 'function') this.engine.preCalcPage(todayPage + 1);
                this.loadPageToday();
                setTimeout(() => {
                    const today = document.getElementById('today') || document.querySelector('.today');
                    if (today) today.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
            } catch (e) {
                console.error('toToday error:', e);
            }
        },
        goToYearFromInput() {
            const raw = this.elements && this.elements.yearInput ? this.elements.yearInput.value : null;
            const year = Number(raw);
            if (!Number.isInteger(year) || year < 1) return;
            const firstDay = ((year - 1) * this.engine.DAYS_PER_YEAR) + 1;
            const page = Math.max(1, Math.ceil(firstDay / this.engine.DAYS_PER_PAGE));
            this.currentPage = page;
            if (typeof this.engine.preCalcPage === 'function') this.engine.preCalcPage(this.currentPage + 1);
            this.loadPageToday();
        },
    };

document.addEventListener('DOMContentLoaded', () => {
    UIController.init(CalendarEngine);
});

function capitalize(e) {
    const s = String(e || '');
    return s.length === 0 ? '' : s.charAt(0).toUpperCase() + s.slice(1);
}

function formatCropName(c) {
    return String(c || '').toLowerCase().split('_').map(w => capitalize(w)).join(' ');
}

function toToday() {
    UIController.toToday();
}

function closeModal() {
    if (window.UIController) {
        window.UIController.closeModal();
    }
}

function closeEventModal() {
    if (window.UIController) {
        window.UIController.closeEventModal();
    }
}

window.UIController = UIController;
window.toToday = toToday;
window.closeModal = closeModal;
window.closeEventModal = closeEventModal;
