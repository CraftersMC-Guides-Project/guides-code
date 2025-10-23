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
        this.engine.preCalcPage(this.currentPage);
        this.engine.preCalcPage(this.currentPage + 1);
        this.loadPageToday();
        this.initTimers();
    },

    elementLoad() {
        this.elements = {
            calGrid: document.getElementById('grid'),
            pageNum: document.getElementById('page-counter'),
            yearNum: document.getElementById('year'),
            nextPage: document.getElementById('next-page'),
            prevPage: document.getElementById('prev-page'),
            dateHeader: document.getElementById('date-top'),
            eventList: document.getElementById('events-list'),
            modal: document.getElementById('day-modal'),
            modalClose: document.getElementById('modal-close-btn')
        };
    },

    setupListeners() {
        this.elements.nextPage.addEventListener('click', () => this.nextPage());
        this.elements.prevPage.addEventListener('click', () => this.prevPage());
        this.elements.modal.addEventListener('click', (e) => { if (e.target === this.elements.modal) this.closeModal(); });
        this.elements.modalClose.addEventListener('click', () => this.closeModal());

        this.elements.eventList.addEventListener('click', (e) => {
            const item = e.target.closest('.event-timer-item');
            if (!item) return;
            const idx = Number(item.dataset.eventIndex);
            const ev = this.currentUpcomingEvents && this.currentUpcomingEvents[idx];

            const next = item.nextElementSibling;
            if (next && next.classList.contains('event-occurrences-wrapper')) {
                next.remove();
                return;
            }
            if (ev) this.eventOccurLoad(ev, item);
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
    
    upcomingEvents(events) {
        this.currentUpcomingEvents = events;
        this.elements.eventList.innerHTML = events.map((event, idx) => {
            let info = 'Starts in...';
            if (event.type === 'farming' && event.crops) {
                info = event.crops.map(c => this.engine.CROP_ICONS[c] || '?').join(' ');
            } else if (event.name === 'Travelling Zoo' && event.legendaryName) {
                info = `Legendary pet: ${capitalize(event.legendaryName)}`;
            }
            return `
                <div class="event-timer-item" data-event-index="${idx}">
                    <div class="event-timer-info">
                        <span class="event-icon">${event.icon}</span>
                        <div>
                            <p class="event-name">${event.name}</p>
                            <p class="event-info">${info}</p>
                            <p class="expand-text">Click to see next 10 timings</p>
                        </div>
                    </div>
                    <div class="event-timer-countdown">${this.timeCorrect(event.msUntil)}</div>
                </div>
                `;
        }).join('');
    },

        loadPage(page) {
            this.elements.calGrid.innerHTML = '';
            if (!page) return;
            
            this.elements.pageNum.textContent = this.currentPage;
            this.elements.yearNum.textContent = page[0].year;
            this.elements.prevPage.disabled = this.currentPage <= 1;

            page.forEach(day => {
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                if (day.totalDays === this.todaySkyblock) {
                    dayCell.classList.add('today');
                    dayCell.id = 'today';
                }

                
                let eventContent = '';
                if (day.events.length > 0) {
                    const icons = day.events.slice(0, 2).map(e => e.icon).join('');
                    eventContent = `<div class="event-icons">${icons}</div>`;
                }

                dayCell.innerHTML = `
                    <div class="day-header">
                        <span class="day-season">${day.season.substring(0,3)} ${day.dayOfSeason}</span>
                        <span class="day-year">Y${day.year}</span>
                    </div>
                    <div class="day-body">${eventContent}</div>`;
                dayCell.addEventListener('click', () => this.modalThing(day));
                this.elements.calGrid.appendChild(dayCell);
            });
        },

        loadPageToday() {
            const page = this.engine.getPageData(this.currentPage);
            if (page && page.length > 0) {
                this.elements.pageNum.textContent = this.currentPage;
                this.elements.yearNum.textContent = page[0].year;
                this.elements.prevPage.disabled = this.currentPage <= 1;
            }
            this.loadPage(page);
        },

        modalThing(day) {
        const realDate = this.engine.getRealTimeForDay(day.totalDays);
        document.getElementById('modal-title').textContent = `Year ${day.year}, ${day.season} ${day.dayOfSeason}`;
        document.getElementById('modal-subtitle').textContent = `Date: ${realDate.toLocaleString()}`;
        const countdownEl = document.getElementById('modal-timer');
        if (this.modalCount) clearInterval(this.modalCount);

        const updateCountdown = () => {
            const now = Date.now();
            const ms = realDate.getTime() - now;
            if (ms > 0) {
                countdownEl.style.display = '';
                countdownEl.textContent = `Countdown: ${this.timeCorrect(ms)}`;
            } else {
                countdownEl.style.display = 'none';
            }
        };
        updateCountdown();
        this.modalCount = setInterval(updateCountdown, 1000);

        const eventListEl = document.getElementById('modal-event-list');
        const eventsTitleEl = document.getElementById('modal-events-title');
        eventListEl.innerHTML = '';
        
        if (day.events.length > 0) {
            eventsTitleEl.style.display = 'block';
            day.events.forEach(event => {
                const li = document.createElement('li');
                li.className = 'modal-event-item';
                let info = '';
                if (event.type === 'farming') {
                    info = ` <span style="color: var(--text-secondary); font-size: 0.9rem;">(${event.crops.join(', ')})</span>`;
                } else if (event.name === 'Travelling Zoo' && event.legendaryName) {
                    info = ` <span style="color: var(--text-secondary); font-size: 0.9rem;">(Legendary: ${capitalize(event.legendaryName)})</span>`;
                }
                li.innerHTML = `<span class="event-icon">${event.icon}</span> <span>${event.name}${info}</span>`;
                eventListEl.appendChild(li);
            });
        } else {
            eventsTitleEl.style.display = 'none';
            eventListEl.innerHTML = '<li>No events on this day.</li>';
        }
        this.elements.modal.classList.add('visible');
        },

        eventOccurLoad(event, itemEl) {
        document.querySelectorAll('.event-occurrences-wrapper').forEach(el => el.remove());
        const occ = this.engine.getNextOccurrences(event.name, this.todaySkyblock, 200);
        const hasExtra = occ.some(o => (o.crops && o.crops.length) || o.legendaryName);
        const wrapper = document.createElement('div');
        wrapper.className = 'event-occurrences-wrapper accordion';
        const accItem = document.createElement('div');
        accItem.className = 'accordion-item';
        accItem.setAttribute('data-event-name', event.name);
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <div class="header-left">
                <div>
                    <h3>${event.name}</h3>
                    <div style="font-size:0.85rem;color:var(--text-secondary)">${event.type === 'farming' && event.crops ? event.crops.map(c => this.engine.CROP_ICONS[c] || c).join(' ') : (event.legendaryName ? 'Legendary: ' + capitalize(event.legendaryName) : '')}</div>
                </div>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary)">Next 10 occurrences</div>
        `;

        const body = document.createElement('div');
        body.className = 'accordion-body';

        if (event.name === 'Farming Contest') {
            const filterContainer = document.createElement('div');
            filterContainer.className = 'farming-filters';
            const filterLabel = document.createElement('div');
            filterLabel.textContent = 'Filter by crop:';
            this.engine.CropType.forEach(cropKey => {
                const label = document.createElement('label');
                label.className = 'farming-filter';
                label.title = cropKey;
                label.innerHTML = `<input type="checkbox" value="${cropKey}"><span class="crop-icon">${this.engine.CROP_ICONS[cropKey] || ''}</span><span class="crop-name">${cropKey.replace('_',' ')}</span>`;
                filterContainer.appendChild(label);
            });

            body.appendChild(filterContainer);

            const table = document.createElement('table');
            table.className = 'occurrences-table';
            body.appendChild(table);

            const renderTable = (list) => {
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>In-game date</th>
                            <th>Real date (local)</th>
                            <th>Time until</th>
                            <th>Extra</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${list.slice(0,10).map(o => {
                            const day = this.engine.getDayInfo(o.totalDays);
                            const shortSeason = day.season.substring(0,3);
                            const realStr = o.realDate.toLocaleString();
                            const until = this.timeCorrect(o.msUntil);
                            const cropsText = (o.crops || []).map(c => `${this.engine.CROP_ICONS[c] || ''}`);
                            return `<tr>
                                <td>Year ${day.year}, ${shortSeason} ${day.dayOfSeason}</td>
                                <td>${realStr}</td>
                                <td style="font-family:monospace;color:var(--highlight-color)">${until}</td>
                                <td>${cropsText}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                `;
            };
            //if you are reading this noticable notice you may notice that this noticable notice is not worth noticing and has no noticable value
            const farmingOcc = occ.filter(o => o.crops && o.crops.length).slice(0, 1000);
            renderTable(farmingOcc);

            filterContainer.addEventListener('change', () => {
                const checked = Array.from(filterContainer.querySelectorAll('input:checked')).map(i => i.value);
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
            const table = document.createElement('table');
            table.className = 'occurrences-table';

            const filtered = occ.slice(0, 10);
            const hasExtraNonFarm = filtered.some(o => o.legendaryName) || event.name === 'New Year Celebration';
            const theadCols = [
                '<th>In-game date</th>',
                '<th>Real date (local)</th>',
                '<th>Time until</th>'
            ];
            if (hasExtraNonFarm) theadCols.push('<th>Extra</th>');

            table.innerHTML = `
                <thead>
                    <tr>${theadCols.join('')}</tr>
                </thead>
                <tbody>
                    ${filtered.map(o => {
                        const day = this.engine.getDayInfo(o.totalDays);
                        const shortSeason = day.season.substring(0,3);
                        const realStr = o.realDate.toLocaleString();
                        const until = this.timeCorrect(o.msUntil);
                        let extra = '';
                        if (o.legendaryName) {
                            console.log(o.legendaryName);
                            const icon = o.legendaryIcon || (this.engine.LEGENDARY_ICONS && this.engine.LEGENDARY_ICONS[o.legendaryName]) || '';
                            extra = `<span class="occ-extra">${icon} ${capitalize(o.legendaryName)}</span>`;
                        } else if (event.name === 'New Year Celebration') {
                            extra = `Y${day.year}`;
                        }
                        const baseCells = [
                            `<td>Year ${day.year}, ${shortSeason} ${day.dayOfSeason}</td>`,
                            `<td>${realStr}</td>`,
                            `<td style="font-family:monospace;color:var(--highlight-color)">${until}</td>`
                        ];
                        if (hasExtraNonFarm) baseCells.push(`<td>${extra}</td>`);
                        return `<tr>${baseCells.join('')}</tr>`;
                    }).join('')}
                </tbody>
            `;
            body.appendChild(table);
        }
        accItem.appendChild(header);
        accItem.appendChild(body);
        wrapper.appendChild(accItem);
        itemEl.parentNode.insertBefore(wrapper, itemEl.nextSibling);
        requestAnimationFrame(() => body.classList.add('expanded'));
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
            engine = this.engine;
            ui = this;
            try {
                if (!engine) {
                    const today = document.getElementById('today') || document.querySelector('.today');
                    if (today) today.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    console.warn('where calendarengine?');
                    return;
                }

                if (!ui) {
                    console.warn('cant find ui even tho it is in ui');
                    return;
                }

                const time = engine.getCurrentTimeData();
                const pageDaysNum = engine.DAYS_PER_PAGE || 31;
                const todayPage = Math.max(1, Math.ceil(time.todaySkyblock / pageDaysNum));

                if (ui && typeof loadPageToday === 'function') {
                    todaySkyblock = time.todaySkyblock;
                    currentPage = todayPage;
                    if (typeof engine.preCalcPage === 'function') engine.preCalcPage(todayPage + 1);
                    loadPageToday();

                    setTimeout(() => {
                        const today = document.getElementById('today') || document.querySelector('.today');
                        if (today) today.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                    return;
                }
                const page = document.getElementById('page-counter');
                if (!page) return;
                let curr = Number(page.textContent) || 1;
                const diff = todayPage - curr;
                const btn = diff > 0 ? document.getElementById('next-page') : document.getElementById('prev-page');
                const clicks = Math.abs(diff);
                for (let i = 0; i < clicks; i++) {
                    if (btn) btn.click();
                }
                setTimeout(() => {
                    const el = document.getElementById('today') || document.querySelector('.today');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 200);
            } catch (e) {
                console.error('error:', e);
            }
        }
    };

document.addEventListener('DOMContentLoaded', () => {
    UIController.init(CalendarEngine);
});

function capitalize(e) {
    const s = String(e || '');
    return s.length === 0 ? '' : s.charAt(0).toUpperCase() + s.slice(1);
}

function toToday() {
    UIController.toToday();
}