// Early theme initialization to prevent flash of wrong theme
(function () {
  try {
    const isDark = localStorage.getItem("darkMode") === "true" ||
      (localStorage.getItem("darkMode") === null && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("darkmode");
      if (document.body) {
        document.body.classList.add("darkmode");
      }
    }
  } catch (e) {}
})();

document.addEventListener("DOMContentLoaded", function () {

  const loader = document.querySelector("#loader");
  if (loader) loader.style.display = "none";

  setupThemeSwitchers();
  fetchAllPartials();
  initScrollToTop();
});

function toggleLid() {
  const sidelid = document.getElementById("sidelid");
  const overlay = document.getElementById("sidebar-overlay");
  const tips = document.querySelectorAll(".button-tip");

  if (!sidelid) return;

  const isOpening = !sidelid.classList.contains("openlid");

  if (isOpening) {
    sidelid.style.display = "block";
    sidelid.offsetHeight;
  }

  sidelid.classList.toggle("openlid");

  if (sidelid.classList.contains("openlid")) {
    document.body.style.overflow = "hidden";
    sidelid.style.overflowY = "auto";
    overlay.style.display = "block";
    tips.forEach((tip) =>
      tip.setAttribute("style", "display: none !important")
    );
  } else {
    document.body.style.overflow = "";
    setTimeout(() => {
      sidelid.scrollTop = 0;
      sidelid.style.display = "none";
    }, 300);
    overlay.style.display = "none";
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const sidelid = document.getElementById("sidelid");

  const isOpening = !sidebar.classList.contains("openSbar");

  sidebar.classList.toggle("openSbar");

  if (sidebar.classList.contains("openSbar")) {
    document.body.style.overflow = "hidden";
    sidebar.style.overflowY = "auto";
    overlay.style.display = "block";
    if (sidelid) sidelid.style.display = "none";
  } else {
    document.body.style.overflow = "";
    setTimeout(() => {
      sidebar.scrollTop = 0;
    }, 300);
    overlay.style.display = "none";
    if (sidelid) sidelid.style.display = "block";
  }
}

document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar");
  const sidelid = document.getElementById("sidelid");
  const menuIcon = document.querySelector(".menu-icon");
  const left = document.querySelector(".left");
  const overlay = document.getElementById("sidebar-overlay");

  if (!menuIcon || !left || !overlay) return;

  const clickedOverlay = event.target === overlay;
  const clickedOutsideSidebar =
    sidebar?.classList.contains("openSbar") &&
    !sidebar.contains(event.target) &&
    !menuIcon.contains(event.target) &&
    !left.contains(event.target) &&
    !clickedOverlay;

  const clickedOutsideSidelid =
    sidelid?.classList.contains("openlid") &&
    !sidelid.contains(event.target) &&
    !menuIcon.contains(event.target) &&
    !left.contains(event.target) &&
    !clickedOverlay;

  if (clickedOutsideSidebar || clickedOverlay) {
    if (sidebar?.classList.contains("openSbar")) {
      sidebar.classList.remove("openSbar");
      document.body.style.overflow = "";
      overlay.style.display = "none";
      setTimeout(() => (sidebar.scrollTop = 0), 300);
    }
  }

  if (clickedOutsideSidelid || clickedOverlay) {
    if (sidelid?.classList.contains("openlid")) {
      sidelid.classList.remove("openlid");
      document.body.style.overflow = "";
      overlay.style.display = "none";
      setTimeout(() => (sidelid.scrollTop = 0), 300);
    }
  }
});

function fetchPartial(url, key) {
  const cached = localStorage.getItem(key);
  if (cached && !cached.includes("Cannot GET") && !cached.includes("404") && cached.trim().length > 40) {
    return Promise.resolve(cached);
  }

  // Support root, subdirectory, and public-prefixed local hosting environments
  const candidateUrls = [
    url,
    url.startsWith('/') ? '..' + url : '../' + url,
    url.startsWith('/') ? '../..' + url : '../../' + url,
    url.startsWith('/') ? '.' + url : './' + url,
    '/public' + url
  ];

  const tryFetch = (index) => {
    if (index >= candidateUrls.length) {
      return Promise.reject(new Error("Failed to load partial: " + url));
    }
    const currentUrl = candidateUrls[index];
    return fetch(currentUrl)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then((html) => {
        if (html && !html.includes("Cannot GET") && !html.includes("404") && html.trim().length > 40) {
          try { localStorage.setItem(key, html); } catch(e) {}
          return html;
        }
        throw new Error("Invalid HTML response");
      })
      .catch(() => tryFetch(index + 1));
  };

  return tryFetch(0);
}

function fetchAllPartials() {
  Promise.all([
    fetchPartial("/components/navbar.html", "navbarHtmlV10"),
    fetchPartial("/components/sidebar.html", "sidebarHtmlV9"),
    fetchPartial("/components/footer.html", "footerHtmlV9"),
    fetchPartial("/loader.html", "loaderHtml"),
  ])
    .then(([navbarHtml, sidebarHtml, footerHtml, loaderHtml]) => {
      const topEl = document.querySelector(".top");
      if (topEl) {
        topEl.innerHTML = navbarHtml;
        initNavbarPlayerCount();
        const currentPath = window.location.pathname.toLowerCase();
        document.querySelectorAll(".navbar .nav-item").forEach(link => {
          const href = link.getAttribute("href")?.toLowerCase() || "";
          if (!href) return;
          const isHome = (href === "/index.html" || href === "index.html") &&
            (currentPath === "/" || currentPath === "" || (currentPath.endsWith("/index.html") && !currentPath.includes("/leaderboards/")));
          const isGuides = href.includes("journey-guides") && (currentPath.includes("journey-guides") || currentPath.includes("/guide/"));
          const isTools = href.includes("tools") && currentPath.includes("tools");
          const isLeaderboards = href.includes("leaderboards") && currentPath.includes("leaderboards");
          const isBazaar = href.includes("bazaar") && currentPath.includes("bazaar");
          const isAuction = href.includes("auction") && currentPath.includes("auction");
          const isPlayer = href.includes("player") && (currentPath.includes("player") || currentPath.includes("profile"));
          const isStatus = href.includes("status") && currentPath.includes("status");
          const isExact = currentPath.endsWith(href);

          if (isExact || isHome || isGuides || isTools || isLeaderboards || isBazaar || isAuction || isPlayer || isStatus) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }

      const sidebarEl = document.getElementById("sidebar");
      if (sidebarEl) {
        sidebarEl.innerHTML = sidebarHtml;
        const currentPath = window.location.pathname.toLowerCase();
        document.querySelectorAll(".sidebar .sidebar-link").forEach(link => {
          const href = link.getAttribute("href")?.toLowerCase() || "";
          if (href && (currentPath.endsWith(href) || (href.endsWith("index.html") && (currentPath === "/" || currentPath.endsWith("/index.html"))))) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }

      const footerEl = document.getElementById("footer");
      if (footerEl) {
        footerEl.innerHTML = footerHtml;
      }

      const loaderEl = document.getElementById("loader");
      if (loaderEl) {
        loaderEl.innerHTML = loaderHtml;
      }

      setupThemeSwitchers();
      const hideLoader = () => {
        const o = document.getElementById('loader-wrapper');
        if (o) {
          o.classList.add('hidden');
          setTimeout(() => { if (o) o.style.display = 'none'; }, 500);
        }
      };
      if (document.readyState === 'complete') {
        hideLoader();
      } else {
        window.addEventListener('load', hideLoader);
      }
    })
    .catch((error) => {
      console.error("Error loading partials:", error);
      const hideLoader = () => {
        const o = document.getElementById('loader-wrapper');
        if (o) {
          o.classList.add('hidden');
          setTimeout(() => { if (o) o.style.display = 'none'; }, 500);
        }
      };
      if (document.readyState === 'complete') {
        hideLoader();
      } else {
        window.addEventListener('load', hideLoader);
      }
    });
}

function fetchAllLPartials() {
  Promise.all([
    fetch("/components/sidebar.html").then((res) => res.text()),
    fetch("/components/footer.html").then((res) => res.text()),
    fetch("/loader.html").then((res) => res.text()),
  ])
    .then(([sidebarHtml, footerHtml, loaderHtml]) => {
      const sidebarEl = document.getElementById("sidebar");
      if (sidebarEl) sidebarEl.innerHTML = sidebarHtml;
      const footerEl = document.getElementById("footer");
      if (footerEl) footerEl.innerHTML = footerHtml;
      const loaderEl = document.getElementById("loader");
      if (loaderEl) loaderEl.innerHTML = loaderHtml;
      setupThemeSwitchers();
      const hideLoader = () => {
        const o = document.getElementById('loader-wrapper');
        if (o) {
          o.classList.add('hidden');
          setTimeout(() => { if (o) o.style.display = 'none'; }, 500);
        }
      };
      if (document.readyState === 'complete') {
        hideLoader();
      } else {
        window.addEventListener('load', hideLoader);
      }
    })
    .catch((err) => {
      console.error("[Partials] Failed to load:", err);
      const hideLoader = () => {
        const o = document.getElementById('loader-wrapper');
        if (o) {
          o.classList.add('hidden');
          setTimeout(() => { if (o) o.style.display = 'none'; }, 500);
        }
      };
      if (document.readyState === 'complete') {
        hideLoader();
      } else {
        window.addEventListener('load', hideLoader);
      }
    });
}

function setupThemeSwitchers() {
  const themeSwitches = [
    document.getElementById("theme-switch"),
    document.getElementById("darkModeToggle"),
    document.getElementById("leaderboard-theme-switch"),
  ].filter(Boolean);

  const getIsDark = () => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const updateTheme = (isDark) => {
    document.documentElement.classList.toggle("darkmode", isDark);
    if (document.body) {
      document.body.classList.toggle("darkmode", isDark);
    }
    themeSwitches.forEach((switchEl) => {
      const icon = switchEl.querySelector(".material-icons") || (switchEl.classList.contains("material-icons") ? switchEl : null);
      if (icon) {
        icon.textContent = isDark ? "light_mode" : "dark_mode";
      } else {
        switchEl.textContent = isDark ? "light_mode" : "dark_mode";
      }
      const label = isDark ? "Switch to light mode" : "Switch to dark mode";
      switchEl.setAttribute("aria-label", label);
      switchEl.setAttribute("title", label);
    });
  };

  const toggleTheme = (e) => {
    if (e) e.preventDefault();
    const isCurrentlyDark = document.documentElement.classList.contains("darkmode") ||
      (document.body && document.body.classList.contains("darkmode"));
    const isNowDark = !isCurrentlyDark;
    localStorage.setItem("darkMode", isNowDark ? "true" : "false");
    updateTheme(isNowDark);
  };

  // Sync state initially
  updateTheme(getIsDark());

  themeSwitches.forEach((switchEl) => {
    switchEl.onclick = toggleTheme;
  });
}
window.setupThemeSwitchers = setupThemeSwitchers;

function closeAnnouncementBanner() {
  document.getElementById("announcement-banner").style.display = "none";
  document.querySelector(".navbar").style.marginTop = "0";
}

function overlay() {
  const sidelid = document.getElementById("sidelid");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  if (sidelid && sidelid.classList.contains("openlid")) {
    console.log("[DEBUG] overlay(): closing sidelid");
    sidelid.classList.remove("openlid");
    document.body.style.overflow = "";
    overlay.style.display = "none";
    setTimeout(() => (sidelid.scrollTop = 0), 300);
    return;
  }

  if (sidebar && sidebar.classList.contains("openSbar")) {
    console.log("[DEBUG] overlay(): closing sidebar");
    sidebar.classList.remove("openSbar");
    document.body.style.overflow = "";
    overlay.style.display = "none";
    setTimeout(() => (sidebar.scrollTop = 0), 300);
  }
}

// Dropdown functionality for players with multiple names
function createPlayerCell(playerName) {
    if (!playerName.includes("/")) {
        return `<td>${playerName}</td>`;
    }
    
    const names = playerName.split("/");
    const id = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
        <td>
            <div class="player-dropdown">
                <button class="dropdown-btn" onclick="toggleDropdown('${id}')">Show more <span class="dropdown-arrow">▼</span></button>
                <div class="dropdown-content" id="${id}">
                    ${names.map(name => `<div class="dropdown-item">${name}</div>`).join("")}
                </div>
            </div>
        </td>
    `;
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    dropdown.classList.toggle("show");
}

// Close dropdowns when clicking outside
document.addEventListener("click", function(event) {
    if (!event.target.matches(".dropdown-btn")) {
        document.querySelectorAll(".dropdown-content.show").forEach(d => d.classList.remove("show"));
    }
});

// Live Online Players Counter for Navbar
let navbarPlayerInterval = null;

function initNavbarPlayerCount() {
    const countEl = document.getElementById("navbarOnlineCount");
    const badgeEl = document.getElementById("navbarOnlineBadge");
    const dotEl = document.getElementById("navbarPulseDot");
    if (!countEl) return;

    function renderData(data) {
        if (!countEl) return;
        const isMaintenance = data.fullMaintenance === true;
        const count = data.playerCount ?? 0;
        const max = data.maxPlayerCount ?? 750;

        if (isMaintenance) {
            countEl.textContent = "Maintenance";
            if (dotEl) dotEl.className = "status-pulse-dot maintenance";
            if (badgeEl) badgeEl.setAttribute("title", "CraftersMC Network is currently under maintenance");
        } else {
            countEl.textContent = Number(count).toLocaleString();
            if (dotEl) dotEl.className = "status-pulse-dot";
            if (badgeEl) badgeEl.setAttribute("title", `CraftersMC Network • ${Number(count).toLocaleString()} / ${Number(max).toLocaleString()} players online (Click for Status)`);
        }
    }

    // 1. Instant render from local cache if present
    try {
        const cached = localStorage.getItem("cmc_status_cache");
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.data && typeof parsed.data.playerCount === "number") {
                renderData(parsed.data);
            }
        }
    } catch (e) {}

    // 2. Fetch live data
    async function fetchLive() {
        const endpoints = ["/api/network/status", "/network-status"];
        for (const ep of endpoints) {
            try {
                const res = await fetch(ep, { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    if (data && (data.success || data.playerCount !== undefined)) {
                        renderData(data);
                        try {
                            localStorage.setItem("cmc_status_cache", JSON.stringify({ ts: Date.now(), data }));
                        } catch (e) {}
                        return;
                    }
                }
            } catch (e) {}
        }

        // Direct fallback for local development preview
        try {
            const res = await fetch("https://api.craftersmc.net/v1/network/status", {
                headers: { "x-api-key": "e89b4eb6-1776-4fb5-9a25-812c2ce1f8d8" }
            });
            if (res.ok) {
                const data = await res.json();
                if (data && (data.success || data.playerCount !== undefined)) {
                    renderData(data);
                    try {
                        localStorage.setItem("cmc_status_cache", JSON.stringify({ ts: Date.now(), data }));
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }

    fetchLive();

    if (!navbarPlayerInterval) {
        navbarPlayerInterval = setInterval(fetchLive, 30000);
    }
}

// =========================================================
// SCROLL TO TOP CONTROLLER (NEO-BRUTALIST SYSTEM)
// =========================================================
function initScrollToTop() {
    let btn = document.getElementById("scrollToTopBtn");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "scrollToTopBtn";
        btn.className = "scroll-to-top-btn";
        btn.setAttribute("aria-label", "Scroll to top");
        btn.setAttribute("title", "Scroll to top");
        btn.innerHTML = '<span class="material-icons">north</span>';
        document.body.appendChild(btn);
    } else {
        btn.classList.add("scroll-to-top-btn");
        if (!btn.getAttribute("aria-label")) btn.setAttribute("aria-label", "Scroll to top");
        if (!btn.getAttribute("title")) btn.setAttribute("title", "Scroll to top");
        if (!btn.querySelector(".material-icons") && btn.textContent.trim() === "north") {
            btn.innerHTML = '<span class="material-icons">north</span>';
        }
    }

    // Smooth scroll on click
    btn.onclick = function (e) {
        if (e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Throttled scroll listener to toggle visibility class
    let scrollTicking = false;
    const checkScrollPosition = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollY > 260) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
        scrollTicking = false;
    };

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(checkScrollPosition);
            scrollTicking = true;
        }
    }, { passive: true });

    checkScrollPosition();
}
window.initScrollToTop = initScrollToTop;

// Run if DOM is already ready (e.g. async/defer loaded)
if (document.readyState === "interactive" || document.readyState === "complete") {
    initScrollToTop();
}

// Buttery-smooth easing animation for in-page scrolling (matches index.html)
function smoothScrollTo(targetPosition, duration) {
  duration = duration || 650;
  const startPosition = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetPosition - startPosition;
  if (Math.abs(distance) < 2) return;

  let startTime = null;
  let userInterrupted = false;

  const stopOnInterrupt = () => {
    userInterrupted = true;
    cleanup();
  };
  const cleanup = () => {
    window.removeEventListener('wheel', stopOnInterrupt);
    window.removeEventListener('touchmove', stopOnInterrupt);
  };
  window.addEventListener('wheel', stopOnInterrupt, { passive: true });
  window.addEventListener('touchmove', stopOnInterrupt, { passive: true });

  // Cubic ease-in-out curve for natural gliding acceleration and deceleration
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  function animation(currentTime) {
    if (userInterrupted) return;
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const ease = easeInOutCubic(progress);

    window.scrollTo(0, startPosition + distance * ease);

    if (progress < 1) {
      requestAnimationFrame(animation);
    } else {
      cleanup();
    }
  }

  requestAnimationFrame(animation);
}
window.smoothScrollTo = smoothScrollTo;

// =========================================================
// GLOBAL SMOOTH SCROLLING FOR ALL PAGES & IN-PAGE ANCHORS
// =========================================================
function initSmoothScrolling() {
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href');
    if (!href) return;

    let hash = '';
    if (href.startsWith('#') && href.length > 1) {
      hash = href;
    } else if (href.includes('#')) {
      const split = href.split('#');
      const page = split[0].toLowerCase();
      const currentPath = window.location.pathname.toLowerCase();
      const currentFile = currentPath.split('/').pop() || 'index.html';
      if (page === '' || page === currentFile || currentPath.endsWith('/' + page)) {
        hash = '#' + split[1];
      }
    }

    if (hash && hash !== '#') {
      const targetId = hash.slice(1);
      const targetEl = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`) || document.querySelector(hash);
      if (targetEl) {
        e.preventDefault();
        const topNav = document.querySelector('.top') || document.querySelector('.navbar') || document.querySelector('header');
        const topOffset = topNav ? topNav.offsetHeight + 16 : 84;
        const startPosition = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = targetEl.getBoundingClientRect().top + startPosition - topOffset;

        smoothScrollTo(targetPosition, 700);

        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', hash);
        } else {
          window.location.hash = hash;
        }
      }
    }
  });

  // Handle landing on page with an in-page hash
  if (window.location.hash && window.location.hash !== '#') {
    setTimeout(function() {
      try {
        const targetId = window.location.hash.slice(1);
        const targetEl = document.getElementById(targetId) || document.querySelector(`[name="${targetId}"]`);
        if (targetEl) {
          const topNav = document.querySelector('.top') || document.querySelector('.navbar') || document.querySelector('header');
          const topOffset = topNav ? topNav.offsetHeight + 16 : 84;
          const startPosition = window.pageYOffset || document.documentElement.scrollTop;
          const targetPosition = targetEl.getBoundingClientRect().top + startPosition - topOffset;
          smoothScrollTo(targetPosition, 600);
        }
      } catch (err) {}
    }, 200);
  }
}
window.initSmoothScrolling = initSmoothScrolling;

// Run if DOM is already ready (e.g. async/defer loaded)
if (document.readyState === "interactive" || document.readyState === "complete") {
    initScrollToTop();
    initSmoothScrolling();
}

/* =========================================================
   MediaWiki:Gadget-timer.js
   Native & jQuery-compatible recurring event timer runner
   ========================================================= */
if (typeof window.$ === 'undefined') {
  window.$ = function (selector) {
    if (typeof selector === 'function') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', selector);
      } else {
        selector();
      }
      return;
    }
    if (selector === document) {
      return {
        ready: function (fn) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
          } else {
            fn();
          }
        }
      };
    }
    var elements = [];
    if (typeof selector === 'string') {
      elements = Array.prototype.slice.call(document.querySelectorAll(selector));
    } else if (selector instanceof NodeList || Array.isArray(selector)) {
      elements = Array.prototype.slice.call(selector);
    } else if (selector && selector.nodeType) {
      elements = [selector];
    }
    return {
      length: elements.length,
      each: function (cb) {
        elements.forEach(function (el, i) {
          cb.call(el, i, el);
        });
        return this;
      },
      data: function (key) {
        if (!elements[0]) return undefined;
        return elements[0].dataset[key] !== undefined
          ? elements[0].dataset[key]
          : elements[0].getAttribute('data-' + key);
      },
      html: function (val) {
        if (val === undefined) return elements[0] ? elements[0].innerHTML : '';
        elements.forEach(function (el) {
          el.innerHTML = val;
        });
        return this;
      }
    };
  };
}

/*
MediaWiki:Gadget-timer.js
*/
function updateEventTimers() {
  // loop over every timer
  $('.EventTimer').each(function() {
    // read data attributes from html element
    var interval = $(this).data('interval') * 60;
    var offset = $(this).data('offset') * 60;
    
    // calculate remaining time until next event
    var now = new Date();
    var totalSeconds = Math.floor(now.getTime() / 1000) - 1735686000; // unix time in seconds since start of 2025
    var countdown = interval - (totalSeconds + offset) % interval;

    // array of time values
    var timeParts = [
      Math.floor(countdown / 86400),          // days
      Math.floor((countdown % 86400) / 3600), // hours 
      Math.floor((countdown % 3600) / 60),    // minutes
      countdown % 60                          // seconds
    ];
    // shift out leading zeros
    while (timeParts[0] === 0) timeParts.shift();

    var timeWords = ['seconds', 'minutes', 'hours', 'days'];
    var timeWordsSingular = ['second', 'minute', 'hour', 'day'];
    timeParts = timeParts.map(function(v,i) { 
      return v.toString() + ' '
        + ((v === 1) ? timeWordsSingular[timeParts.length- i - 1] : timeWords[timeParts.length - i - 1]);
    });
    var returnString = timeParts.join(', ');

    // write 0 if timer has run out
    returnString = (returnString === '') ? '0 seconds' : returnString;
    
    $(this).html(returnString);
  });
}
window.updateEventTimers = updateEventTimers;

/* =========================================================
   SkyBlock In-Game Clock Runner (Plain, Matching index.html)
   ========================================================= */
function updateGameClock() {
  var timeElements = document.querySelectorAll('.game-clock-time, #game-clock-time');
  var dateElements = document.querySelectorAll('.game-clock-date, #game-clock-date');
  if (timeElements.length === 0 && dateElements.length === 0) return;

  var now = new Date();
  var START_OF_TIMES = 1648800000;
  var TIME_MULTIPLIER = 72;
  var SEASON_LENGTH = 93;
  var YEAR_LENGTH = 4;
  var SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];

  // Official CraftersMC calendar.js time algorithm
  var epochTime = Math.floor(now.getTime() / 1000) - START_OF_TIMES;
  var skyBlockTime = epochTime * TIME_MULTIPLIER;

  var totalMinutes = Math.floor(skyBlockTime / 60);
  var totalHours = Math.floor(totalMinutes / 60);
  var totalDays = Math.floor(totalHours / 24);
  var totalSeasons = Math.floor(totalDays / SEASON_LENGTH);
  var totalYears = Math.floor(totalSeasons / YEAR_LENGTH);

  var currentMinute = totalMinutes % 60;
  var currentHour = totalHours % 24;
  var currentDay = (totalDays % SEASON_LENGTH) + 1;
  var currentSeason = totalSeasons % YEAR_LENGTH;
  var currentYear = totalYears + 1;

  var ampm = currentHour >= 12 ? 'PM' : 'AM';
  var displayHour = currentHour % 12 || 12;
  var timeStr = displayHour + ':' + (currentMinute < 10 ? '0' : '') + currentMinute + ' ' + ampm;
  var dateStr = 'Year ' + currentYear + ', ' + SEASON_NAMES[currentSeason] + ' ' + currentDay;

  timeElements.forEach(function(el) { el.textContent = timeStr; });
  dateElements.forEach(function(el) { el.textContent = dateStr; });
}
window.updateGameClock = updateGameClock;

$(document).ready(function() {
  // update every 1000ms if there are EventTimers on the page
  if ($('.EventTimer').length !== 0) {
    updateEventTimers();
    setInterval(updateEventTimers, 1000);
  }

  // Initialize in-game clock immediately and tick smoothly
  if (document.querySelectorAll('.game-clock-time, #game-clock-time').length !== 0) {
    updateGameClock();
    setInterval(updateGameClock, 500);
  }
});


