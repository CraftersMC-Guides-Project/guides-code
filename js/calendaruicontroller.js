const UIController = {
    currentPage: 1,
    currentSkyblockDay: 0,
    engine: null,
    elements: {},
    modalCountdownInterval: null,
    currentUpcomingEvents: [], 

    init(engine) {
        this.engine = engine;
        this.cacheDOMElements();
        this.bindEventListeners();
        // jump to todays page
        const time = this.engine.getCurrentTimeData();
        this.currentSkyblockDay = time.currentSkyblockDay;
        this.currentPage = Math.max(1, Math.ceil(this.currentSkyblockDay / this.engine.DAYS_PER_PAGE));
        this.engine.preCalcPage(this.currentPage);
        this.engine.preCalcPage(this.currentPage + 1);
        this.renderCurrentPage();
        this.startTimers();
    },

    cacheDOMElements() {
        this.elements = {
            calendarGrid: document.getElementById('calendar-grid'),
            calendarPageEl: document.getElementById('calendar-page'),
            calendarYearEl: document.getElementById('calendar-year'),
            nextPageBtn: document.getElementById('next-page-btn'),
            prevPageBtn: document.getElementById('prev-page-btn'),
            currentDateInfoEl: document.getElementById('current-date-info'),
            upcomingEventsListEl: document.getElementById('upcoming-events-list'),
            modal: document.getElementById('day-modal'),
            modalCloseBtn: document.getElementById('modal-close-btn')
        };
    },

    bindEventListeners() {
        this.elements.nextPageBtn.addEventListener('click', () => this.goToNextPage());
        this.elements.prevPageBtn.addEventListener('click', () => this.goToPrevPage());
        this.elements.modal.addEventListener('click', (e) => { if (e.target === this.elements.modal) this.closeModal(); });
        this.elements.modalCloseBtn.addEventListener('click', () => this.closeModal());

        this.elements.upcomingEventsListEl.addEventListener('click', (e) => {
            const item = e.target.closest('.event-timer-item');
            if (!item) return;
            const idx = Number(item.dataset.eventIndex);
            const ev = this.currentUpcomingEvents && this.currentUpcomingEvents[idx];

            const next = item.nextElementSibling;
            if (next && next.classList.contains('event-occurrences-wrapper')) {
                next.remove();
                return;
            }
            if (ev) this.showEventOccurrences(ev, item);
        });
    },

    goToNextPage() {
        this.currentPage++;
        this.renderCurrentPage();
        this.engine.preCalcPage(this.currentPage + 1);
    },
    
    goToPrevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderCurrentPage();
        }
    },

    startTimers() {
        let upcomingEvents = this.engine.getUpcomingEventsData().map(event => {
            event.targetTime = Date.now() + event.msUntil;
            return event;
        });
        this.currentUpcomingEvents = upcomingEvents;
        this.renderUpcomingEvents(upcomingEvents);

        // update countdowns
        setInterval(() => {
            upcomingEvents.forEach((event, idx) => {
                const countdownEl = document.querySelectorAll('.event-timer-countdown')[idx];
                if (countdownEl) {
                    const msLeft = event.targetTime - Date.now();
                    countdownEl.textContent = this.formatTime(msLeft);
                }
            });
        }, 1000);

        setInterval(() => {
            const timeData = this.engine.getCurrentTimeData();
            const newSkyblockDay = timeData.currentSkyblockDay;
            const dayChanged = this.currentSkyblockDay !== newSkyblockDay;
            this.currentSkyblockDay = newSkyblockDay;
            this.elements.currentDateInfoEl.textContent = `Today: Year ${timeData.currentYear}, ${this.engine.SEASON_NAMES[timeData.currentSeason]}, Day ${timeData.currentDayOfSeason}`;
            if (dayChanged) {
                const newPage = Math.max(1, Math.ceil(this.currentSkyblockDay / this.engine.DAYS_PER_PAGE));
                if (newPage !== this.currentPage) {
                    this.currentPage = newPage;
                    this.engine.preCalcPage(this.currentPage + 1);
                }
                this.renderCurrentPage();
                upcomingEvents = this.engine.getUpcomingEventsData().map(event => {
                    event.targetTime = Date.now() + event.msUntil;
                    return event;
                });
                this.currentUpcomingEvents = upcomingEvents;
                this.renderUpcomingEvents(upcomingEvents);
            }
        }, 1000);
    },
    
    formatTime(ms) {
        if (ms < 0) return "0d 0h 0m 0s";
        let s = Math.floor(ms / 1000), m = Math.floor(s / 60);
        let h = Math.floor(m / 60), d = Math.floor(h / 24);
        return `${d}d ${h % 24}h ${m % 60}m ${s % 60}s`;
    },
    
    renderUpcomingEvents(events) {
        this.currentUpcomingEvents = events;
        this.elements.upcomingEventsListEl.innerHTML = events.map((event, idx) => {
            let subtext = 'Starts in...';
            if (event.type === 'farming' && event.crops) {
                subtext = event.crops.map(c => this.engine.CROP_ICONS[c] || '?').join(' ');
            } else if (event.name === 'Traveling Zoo' && event.legendaryName) {
                subtext = `Legendary pet: ${capitalize(event.legendaryName)}`;
            }
            return `
                <div class="event-timer-item" data-event-index="${idx}">
                    <div class="event-timer-info">
                        <span class="event-icon">${event.icon}</span>
                        <div>
                            <p class="event-name">${event.name}</p>
                            <p class="event-subtext">${subtext}</p>
                            <p class="expand-text">Click to see next 10 timings</p>
                        </div>
                    </div>
                    <div class="event-timer-countdown">${this.formatTime(event.msUntil)}</div>
                </div>
                `;
        }).join('');
    },

        renderCurrentPage() {
            // Always update page number and year in DOM
            const pageData = this.engine.getPageData(this.currentPage);
            if (pageData && pageData.length > 0) {
                this.elements.calendarPageEl.textContent = this.currentPage;
                this.elements.calendarYearEl.textContent = pageData[0].year;
                this.elements.prevPageBtn.disabled = this.currentPage <= 1;
            }
            this.renderPage(pageData);
        },

        renderPage(pageData) {
            this.elements.calendarGrid.innerHTML = '';
            if (!pageData) return;
            
            this.elements.calendarPageEl.textContent = this.currentPage;
            this.elements.calendarYearEl.textContent = pageData[0].year;
            this.elements.prevPageBtn.disabled = this.currentPage <= 1;

            pageData.forEach(dayInfo => {
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                if (dayInfo.totalDay === this.currentSkyblockDay) {
                    dayCell.classList.add('current-day');
                    dayCell.id = 'current-day';
                }

                
                let eventContent = '';
                if (dayInfo.events.length > 0) {
                    const icons = dayInfo.events.slice(0, 2).map(e => e.icon).join('');
                    const moreCount = dayInfo.events.length - 2;
                    eventContent = `<div class="event-icons-wrapper">${icons}${moreCount > 0 ? `<span class="multiple-events-indicator">+${moreCount}</span>` : ''}</div>`;
                }

                dayCell.innerHTML = `
                    <div class="day-cell-header">
                        <span class="day-season">${dayInfo.season.substring(0,3)} ${dayInfo.dayOfSeason}</span>
                        <span class="day-year">Y${dayInfo.year}</span>
                    </div>
                    <div class="day-cell-body">${eventContent}</div>`;
                dayCell.addEventListener('click', () => this.showDayDetails(dayInfo));
                this.elements.calendarGrid.appendChild(dayCell);
            });
        },

        showDayDetails(dayInfo) {
        const realDate = this.engine.getRealTimeForDay(dayInfo.totalDay);
        document.getElementById('modal-ingame-date').textContent = `Year ${dayInfo.year}, ${dayInfo.season} ${dayInfo.dayOfSeason}`;
        document.getElementById('modal-real-date').textContent = `Date: ${realDate.toLocaleString()}`;
        const countdownEl = document.getElementById('modal-countdown-to-day');
        if (this.modalCountdownInterval) clearInterval(this.modalCountdownInterval);

        const updateCountdown = () => {
            const now = Date.now();
            const ms = realDate.getTime() - now;
            if (ms > 0) {
                countdownEl.style.display = '';
                countdownEl.textContent = `Countdown: ${this.formatTime(ms)}`;
            } else {
                countdownEl.style.display = 'none';
            }
        };
        updateCountdown();
        this.modalCountdownInterval = setInterval(updateCountdown, 1000);

        const eventListEl = document.getElementById('modal-event-list');
        const eventsTitleEl = document.getElementById('modal-events-title');
        eventListEl.innerHTML = '';
        
        if (dayInfo.events.length > 0) {
            eventsTitleEl.style.display = 'block';
            dayInfo.events.forEach(event => {
                const li = document.createElement('li');
                li.className = 'modal-event-item';
                let subtext = '';
                if (event.type === 'farming') {
                    subtext = ` <span style="color: var(--text-secondary); font-size: 0.9rem;">(${event.crops.join(', ')})</span>`;
                } else if (event.name === 'Traveling Zoo' && event.legendaryName) {
                    subtext = ` <span style="color: var(--text-secondary); font-size: 0.9rem;">(Legendary: ${capitalize(event.legendaryName)})</span>`;
                }
                li.innerHTML = `<span class="event-icon">${event.icon}</span> <span>${event.name}${subtext}</span>`;
                eventListEl.appendChild(li);
            });
        } else {
            eventsTitleEl.style.display = 'none';
            eventListEl.innerHTML = '<li>No events on this day.</li>';
        }
        this.elements.modal.classList.add('visible');
        },

        showEventOccurrences(event, itemEl) {
        document.querySelectorAll('.event-occurrences-wrapper').forEach(el => el.remove());
        const occ = this.engine.getNextOccurrences(event.name, this.currentSkyblockDay, 200);
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

        // contests first
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
                            const dayInfo = this.engine.getDayInfo(o.totalDay);
                            const shortSeason = dayInfo.season.substring(0,3);
                            const realStr = o.realDate.toLocaleString();
                            const until = this.formatTime(o.msUntil);
                            const cropsText = (o.crops || []).map(c => `${this.engine.CROP_ICONS[c] || ''}`);
                            return `<tr>
                                <td>Year ${dayInfo.year}, ${shortSeason} ${dayInfo.dayOfSeason}</td>
                                <td>${realStr}</td>
                                <td style="font-family:monospace;color:var(--highlight-color)">${until}</td>
                                <td>${cropsText}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                `;
            };

            const farmingOcc = occ.filter(o => o.crops && o.crops.length).slice(0, 1000); // ensure plenty
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
            // not contest
            const table = document.createElement('table');
            table.className = 'occurrences-table';

            const filtered = occ.slice(0, 10);
            const hasExtraNonFarm = filtered.some(o => o.legendaryName);
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
                        const dayInfo = this.engine.getDayInfo(o.totalDay);
                        const shortSeason = dayInfo.season.substring(0,3);
                        const realStr = o.realDate.toLocaleString();
                        const until = this.formatTime(o.msUntil);
                        let extra = '';
                        if (o.legendaryName) {
                            const icon = o.legendaryIcon || (this.engine.LEGENDARY_ICONS && this.engine.LEGENDARY_ICONS[o.legendaryName]) || '';
                            extra = `<span class="occ-extra">${icon} ${capitalize(o.legendaryName)}</span>`;
                        }
                        const baseCells = [
                            `<td>Year ${dayInfo.year}, ${shortSeason} ${dayInfo.dayOfSeason}</td>`,
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
            if (this.modalCountdownInterval) {
                clearInterval(this.modalCountdownInterval);
                this.modalCountdownInterval = null;
            }
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        UIController.init(CalendarEngine);
    });

function capitalize(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function goToTodayAndPage() {
    try {
        const engine = window.CalendarEngine;
        const ui = window.UIController;
        if (!engine) {
            // fallback: just attempt to scroll
            const el = document.getElementById('current-day') || document.querySelector('.current-day');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const time = engine.getCurrentTimeData();
        const daysPerPage = engine.DAYS_PER_PAGE || 31;
        const desiredPage = Math.max(1, Math.ceil(time.currentSkyblockDay / daysPerPage));

        if (ui && typeof ui.renderCurrentPage === 'function') {
            ui.currentSkyblockDay = time.currentSkyblockDay;
            ui.currentPage = desiredPage;
            if (typeof engine.preCalcPage === 'function') engine.preCalcPage(desiredPage + 1);
            ui.renderCurrentPage();

            // Wait for DOM update, then scroll
            setTimeout(() => {
                const el = document.getElementById('current-day') || document.querySelector('.current-day');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
            return;
        }

        // fallback: click pagination buttons until the target page is reached
        const pageEl = document.getElementById('calendar-page');
        if (!pageEl) return;
        let curr = Number(pageEl.textContent) || 1;
        const diff = desiredPage - curr;
        const btn = diff > 0 ? document.getElementById('next-page-btn') : document.getElementById('prev-page-btn');
        const clicks = Math.abs(diff);
        for (let i = 0; i < clicks; i++) {
            if (btn) btn.click();
        }
        setTimeout(() => {
            const el = document.getElementById('current-day') || document.querySelector('.current-day');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    } catch (e) {
        console.error('goToTodayAndPage error', e);
    }
}