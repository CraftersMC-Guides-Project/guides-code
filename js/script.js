document.addEventListener("DOMContentLoaded", function () {
  const loader = document.querySelector('#loader');
  if (loader) loader.style.display = 'none';

  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const sweepBtn = document.getElementById("sweepBtn");
  if (sweepBtn) {
    const elementsToStyle = {
      container: document.getElementById("float"),
      sweep: sweepBtn,
      home: document.getElementById("homeBtn"),
      ai: document.getElementById("ai"),
      top: document.getElementById("scrollToTopBtn")
    };

    let isActive = false;

    sweepBtn.addEventListener("click", () => {
      isActive = !isActive;
      if (elementsToStyle.container) {
        elementsToStyle.container.style.backgroundColor = isActive ? "var(--primary-text-color)" : "";
        elementsToStyle.container.style.left = isActive ? "calc(100% - 13rem)" : "calc(100% - 4rem)";
        elementsToStyle.container.style.transition = "transform 0.3s ease";
      }

      ["home", "ai", "top"].forEach(key => {
        if (elementsToStyle[key]) {
          elementsToStyle[key].style.display = isActive ? "block" : "none";
          elementsToStyle[key].style.transition = "transform 0.3s ease";
        }
      });

      if (elementsToStyle.sweep) {
        elementsToStyle.sweep.style.transform = isActive ? "rotate(0deg)" : "rotate(180deg)";
        elementsToStyle.sweep.style.transition = "transform 0.3s ease";
      }
    });
  }

  setupThemeSwitchers();
  fetchAllPartials();
  fetchAllLPartials();
});

function toggleLid() {
  const sidelid = document.getElementById("sidelid");
  const overlay = document.getElementById("sidebar-overlay");
  const tips = document.querySelectorAll(".button-tip");

  if (!sidelid) return;

  const isOpening = !sidelid.classList.contains("openlid");

  if (isOpening && window.playChestOpenSound) {
    window.playChestOpenSound();
  }

  if (isOpening) {
    sidelid.style.display = "block";
    sidelid.offsetHeight;
  }

  sidelid.classList.toggle("openlid");

  if (sidelid.classList.contains("openlid")) {
    document.body.style.overflow = "hidden";
    sidelid.style.overflowY = "auto";
    overlay.style.display = "block";
    tips.forEach(tip => tip.setAttribute("style", "display: none !important"));
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

  if (isOpening) {
    if (window.playChestOpenSound) window.playChestOpenSound();
  } else {
    if (window.playChestCloseSound) window.playChestCloseSound();
  }

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
  const clickedOutsideSidebar = sidebar?.classList.contains("openSbar") &&
    !sidebar.contains(event.target) &&
    !menuIcon.contains(event.target) &&
    !left.contains(event.target) &&
    !clickedOverlay;

  const clickedOutsideSidelid = sidelid?.classList.contains("openlid") &&
    !sidelid.contains(event.target) &&
    !menuIcon.contains(event.target) &&
    !left.contains(event.target) &&
    !clickedOverlay;

  if (clickedOutsideSidebar || clickedOverlay) {
    if (sidebar?.classList.contains("openSbar")) {
      sidebar.classList.remove("openSbar");
      document.body.style.overflow = "";
      overlay.style.display = "none";
      setTimeout(() => sidebar.scrollTop = 0, 300);
    }
  }

  if (clickedOutsideSidelid || clickedOverlay) {
    if (sidelid?.classList.contains("openlid")) {
      sidelid.classList.remove("openlid");
      document.body.style.overflow = "";
      overlay.style.display = "none";
      setTimeout(() => sidelid.scrollTop = 0, 300);
    }
  }
});

function homeBtn() {
  window.location.href = "../index.html";
}

function aiBtn() {
  window.location.href = "/ai";
}

function fetchPartial(url, key) {
  const cached = localStorage.getItem(key);
  if (cached) return Promise.resolve(cached);
  return fetch(url).then(res => res.text()).then(html => {
    localStorage.setItem(key, html);
    return html;
  });
}

function fetchAllPartials() {
  Promise.all([
    fetchPartial('../navbarv2.html', 'navbarHtml'),
    fetchPartial('../sidebar.html', 'sidebarHtml'),
    fetchPartial('../footer.html', 'footerHtml')
  ]).then(([navbarHtml, sidebarHtml, footerHtml]) => {
    document.querySelector('.top').innerHTML = navbarHtml;
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;
    setupThemeSwitchers();
    updateSidebarLoginButton();
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    setupPgNetworkScrambler();
  }).catch(error => {
    console.error("Error loading partials:", error);
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  });
}

setTimeout(() => {
  // Use cookie for discordUser
  function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
  }

  const gUser = JSON.parse(localStorage.getItem('googleAuth'));
  const dUserCookie = getCookie('discordUser');
  const dUser = dUserCookie ? JSON.parse(dUserCookie) : null;
  const user = JSON.parse(localStorage.getItem('user'));
  const userSettings = user ? JSON.parse(localStorage.getItem(`userSettings_${user.email}`)) : null;

  const infoDiv = document.getElementById("sidebarUsername");
  const infoDivName = document.getElementById("sidebarName");
  const infoDivImg = document.getElementById("sidebarAvatar");

  if (dUser) {
    infoDiv.innerHTML = `${dUser.email || ''}`;
    infoDivName.innerHTML = `${dUser.username || ''}`;
    infoDivImg.innerHTML = dUser.avatar && dUser.id
      ? `<img style="width: 30px; height: 30px; margin: 0; border-radius: 50%;" src="https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png">`
      : '';
  } else if (user && user.token) {
    if (userSettings) {
      infoDiv.innerHTML = `${user.email}`;
      infoDivName.innerHTML = `${userSettings.username}`;
      infoDivImg.innerHTML = `<img style="width: 30px; height: 30px; margin: 0; border-radius: 50%;" src="${userSettings.profilePic}">`;
    }
  }
}, 2000);

function logout() {
  // Remove user data from cookies and localStorage
  document.cookie = "discordUser=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  localStorage.removeItem("user");
  localStorage.removeItem("discordUser");
  location.reload();
}

function login() {
  window.location.href = "/login";
}

function profile() {
  window.location.href = "/profile";
}

function checkLoginStatus() {
  var userLoggedIn = localStorage.getItem('discordUser') !== null;
}

window.onload = function () {
  setTimeout(checkLoginStatus, 2000);
};

function fetchAllLPartials() {
  Promise.all([
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([sidebarHtml, footerHtml]) => {
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;
    updateSidebarLoginButton();
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    setupPgNetworkScrambler();
  }).catch(err => {
    console.error("[Partials] Failed to load:", err);
    // Hide loader even if error
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  });
}

function setupThemeSwitchers() {
  const themeSwitches = [
    document.getElementById("theme-switch"),
    document.getElementById("leaderboard-theme-switch")
  ].filter(Boolean);

  if (!themeSwitches.length) return;

  const updateTheme = () => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("darkmode", isDark);
    themeSwitches.forEach(switchEl => {
      switchEl.textContent = isDark ? "light_mode" : "dark_mode";
    });
  };

  const toggleTheme = () => {
    const isNowDark = !document.body.classList.contains("darkmode");
    localStorage.setItem("darkMode", isNowDark);
    updateTheme();
  };

  updateTheme();
  themeSwitches.forEach(switchEl => {
    switchEl.addEventListener("click", toggleTheme);
  });
}

function updateSidebarLoginButton() {
  // Use cookie for discordUser
  function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
  }

  const profileImg = document.getElementById("sidebarProfilePic");
  const usernameText = document.getElementById("sidebarUsername");
  const sidebarNameElement = document.getElementById("sidebarName");
  const sidebarAvatarElement = document.getElementById("sidebarAvatar");
  const sidebarAvatarImgElement = document.getElementById("sidebarAvatarImg");
  const sidebarTopTop = document.querySelector(".sidebar-top-bottom-top");

  const dUserCookie = getCookie("discordUser");
  const storedUser = dUserCookie ? JSON.parse(dUserCookie) : null;
  if (!sidebarTopTop) return;

  if (storedUser) {
    // Show user info (optional: you can add your user info logic here)
    if (sidebarAvatarElement) sidebarAvatarElement.style.display = 'block';
    if (sidebarNameElement) sidebarNameElement.style.display = '';
    if (profileImg) profileImg.src = "../assets/cmc-guides.png";
    // Remove login button if present
    const oldBtn = sidebarTopTop.querySelector('.sidebar-login-btn');
    if (oldBtn) oldBtn.remove();
    // Optionally, show settings icon etc.
    const userInfoRow = sidebarTopTop.querySelector('div[style*="display: flex"]');
    const settingsDiv = document.getElementById("settings");
    if (userInfoRow) userInfoRow.style.display = "";
    if (settingsDiv) settingsDiv.style.display = "";
  } else {
    // Hide user info and settings
    if (sidebarAvatarElement) sidebarAvatarElement.style.display = 'none';
    if (sidebarNameElement) sidebarNameElement.textContent = "Name";
    if (profileImg) profileImg.src = "../assets/cmc-guides.png";
    const userInfoRow = sidebarTopTop.querySelector('div[style*="display: flex"]');
    const settingsDiv = document.getElementById("settings");
    if (userInfoRow) userInfoRow.style.display = "none";
    if (settingsDiv) settingsDiv.style.display = "none";
    // Remove any existing login button to avoid duplicates
    const oldBtn = sidebarTopTop.querySelector('.sidebar-login-btn');
    if (oldBtn) oldBtn.remove();
    // Add login button
    const loginBtn = document.createElement("button");
    loginBtn.className = "sidebar-login-btn";
    loginBtn.textContent = "Login with Discord";
    loginBtn.style.cssText = `
      background: #5865f2;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 8px 18px;
      font-size: 1rem;
      cursor: pointer;
      margin: 0 auto 10px auto;
      display: block;
    `;
    loginBtn.onclick = () => window.location.href = '/login.html';
    sidebarTopTop.appendChild(loginBtn);
  }
}

function closeAnnouncementBanner() {
  document.getElementById('announcement-banner').style.display = 'none';
  document.querySelector('.navbar').style.marginTop = '0';
}

// --- Cookie Consent Logic ---
function showCookieConsent() {
  if (document.getElementById('cookie-consent-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    background: linear-gradient(90deg, #23272e 60%, #2b2f3a 100%);
    color: #fff;
    z-index: 99999;
    padding: 2em 1em 1.5em 1em;
    box-shadow: 0 -4px 32px #000a;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 1.08em;
    border-top-left-radius: 18px;
    border-top-right-radius: 18px;
    animation: cookieFadeIn 0.7s cubic-bezier(.4,1.4,.6,1) 1;
    backdrop-filter: blur(6px);
  `;

  // Add keyframes for fade-in
  if (!document.getElementById('cookie-consent-style')) {
    const style = document.createElement('style');
    style.id = 'cookie-consent-style';
    style.innerHTML = `
      @keyframes cookieFadeIn {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #cookie-consent-banner button {
        font-family: inherit;
        font-weight: 600;
        letter-spacing: 0.03em;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 12px #0002;
      }
      #cookie-consent-banner button:focus {
        outline: 2px solid #ffd700;
      }
      #cookie-consent-banner .cookie-icon {
        font-size: 2.2em;
        margin-bottom: 0.3em;
        color: #ffd700;
        filter: drop-shadow(0 2px 8px #ffd70044);
        animation: cookieBounce 1.2s infinite alternate;
      }
      @keyframes cookieBounce {
        from { transform: translateY(0);}
        to { transform: translateY(-8px);}
      }
      #cookie-consent-banner .cookie-btn-allow {
        background: linear-gradient(90deg, #ffd700 60%, #ffe066 100%);
        color: #23272e;
        border: none;
        padding: 10px 32px;
        border-radius: 8px;
        font-size: 1.08em;
        cursor: pointer;
        margin-right: 0.5em;
        box-shadow: 0 2px 12px #ffd70033;
      }
      #cookie-consent-banner .cookie-btn-allow:hover {
        background: linear-gradient(90deg, #ffe066 60%, #ffd700 100%);
        color: #181c22;
      }
      #cookie-consent-banner .cookie-btn-deny {
        background: linear-gradient(90deg, #23272e 60%, #2b2f3a 100%);
        color: #fff;
        border: 1.5px solid #ffd700;
        padding: 10px 32px;
        border-radius: 8px;
        font-size: 1.08em;
        cursor: pointer;
        margin-left: 0.5em;
      }
      #cookie-consent-banner .cookie-btn-deny:hover {
        background: #ffd700;
        color: #23272e;
        border-color: #ffd700;
      }
      #cookie-consent-banner .cookie-policy-link {
        color: #ffd700;
        text-decoration: underline;
        font-weight: 500;
      }
    `;
    document.head.appendChild(style);
  }

  banner.innerHTML = `
    <div style="max-width: 700px; text-align: center;">
      <span class="material-icons cookie-icon">cookie</span>
      <div style="font-size:1.25em;font-weight:700;letter-spacing:0.01em;margin-bottom:0.3em;">
        Cookie Consent Required
      </div>
      <div style="margin-bottom:0.7em;line-height:1.7;">
        We use cookies to store your login session and preferences.<br>
        <span style="color:#ffd700;font-weight:500;">If you do not allow cookies, you will not be able to join giveaways or access other services that require login.</span>
      </div>
      <small style="color:#aaa;">
        Read more in our <a href="/privacypolicy.html" class="cookie-policy-link" target="_blank">Privacy Policy</a>.
      </small>
    </div>
    <div style="margin-top: 1.5em; display: flex; gap: 1em; justify-content: center;">
      <button id="cookie-allow-btn" class="cookie-btn-allow">Allow Cookies</button>
      <button id="cookie-deny-btn" class="cookie-btn-deny">Deny</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('cookie-allow-btn').onclick = function () {
    localStorage.setItem('cookieConsent', 'allowed');
    banner.remove();
  };
  document.getElementById('cookie-deny-btn').onclick = function () {
    localStorage.setItem('cookieConsent', 'denied');
    banner.remove();
    alert("You have denied cookies. You will not be able to join giveaways or access login-required services.");
  };
}

document.addEventListener("DOMContentLoaded", function () {
  // ...existing code...
  if (!localStorage.getItem('cookieConsent')) {
    showCookieConsent();
  }
});

// developmental Login Bypass

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  document.cookie = 'discordUser=' + encodeURIComponent(JSON.stringify({
    id: "AakashNeverDies",
    username: "AakashNeverDies",
    avatar: "",
  })) + '; path=/';
}

// Audio handling for click and chest sounds
document.addEventListener("DOMContentLoaded", function () {

  const clickAudio = document.createElement('audio');
  clickAudio.src = '/assets/audio/click.mp3';
  clickAudio.preload = 'auto';
  document.body.appendChild(clickAudio);

  const chestOpenAudio = document.createElement('audio');
  chestOpenAudio.src = '/assets/audio/chest-open.mp3';
  chestOpenAudio.preload = 'auto';
  document.body.appendChild(chestOpenAudio);

  const chestCloseAudio = document.createElement('audio');
  chestCloseAudio.src = '/assets/audio/chest-close.mp3';
  chestCloseAudio.preload = 'auto';
  document.body.appendChild(chestCloseAudio);

  function playClickSound() {
    console.log("[DEBUG] playClickSound called");
    try {
      clickAudio.currentTime = 0.2;
      clickAudio.play().catch((err) => { console.warn("[DEBUG] clickAudio play error:", err); });
    } catch (err) {
      console.warn("[DEBUG] clickAudio play error (outer):", err);
    }
  }

  function playChestOpenSound() {
    console.log("[DEBUG] playChestOpenSound called");
    chestOpenAudio.pause();
    chestOpenAudio.currentTime = 0;
    chestOpenAudio.play().catch((err) => { console.warn("[DEBUG] chestOpenAudio play error:", err); });
  }

  function playChestCloseSound() {
    console.log("[DEBUG] playChestCloseSound called");
    chestCloseAudio.pause();
    chestCloseAudio.currentTime = 0;
    chestCloseAudio.play().catch((err) => { console.warn("[DEBUG] chestCloseAudio play error:", err); });
  }

  window.playClickSound = playClickSound;
  window.playChestOpenSound = playChestOpenSound;
  window.playChestCloseSound = playChestCloseSound;

  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return; // Only play sound for left-click
    let el = e.target;
    while (el && el !== document.body) {
      if (
        el.tagName === 'A' ||
        el.tagName === 'BUTTON' ||
        el.classList.contains('toggle') ||
        el.getAttribute('role') === 'switch' ||
        el.getAttribute('aria-pressed') !== null
      ) {
        console.log("[DEBUG] pointerdown on clickable element:", el);
        if (window.playClickSound) window.playClickSound();
        break;
      }
      el = el.parentElement;
    }
  }, true);
});

function overlay() {
  const sidelid = document.getElementById("sidelid");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");

  // Close sidelid if open
  if (sidelid && sidelid.classList.contains("openlid")) {
    console.log("[DEBUG] overlay(): closing sidelid");
    sidelid.classList.remove("openlid");
    document.body.style.overflow = "";
    overlay.style.display = "none";
    setTimeout(() => sidelid.scrollTop = 0, 300);
    if (window.playChestCloseSound) window.playChestCloseSound();
    return;
  }

  // Else, close sidebar if open
  if (sidebar && sidebar.classList.contains("openSbar")) {
    console.log("[DEBUG] overlay(): closing sidebar");
    sidebar.classList.remove("openSbar");
    document.body.style.overflow = "";
    overlay.style.display = "none";
    setTimeout(() => sidebar.scrollTop = 0, 300);
    if (window.playChestCloseSound) window.playChestCloseSound();
  }
}

function setupPgNetworkScrambler() {
    const link = document.getElementById("pg-network-anim");
    if (!link) return;

    const originalText = 'Pg Network <img src="../assets/dev-ui.svg" alt="Developer" class="ui" title="Developer">';
    const scrambleText = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#&^%$!*-_=+;:|~`";
    let interval = null;

    // Extract the text and HTML parts
    const textPart = "Pg Network";
    const htmlPart = ' <img src="../assets/dev-ui.svg" alt="Developer" class="ui" title="Developer">';

    function randomizeText(text) {
        return text.split('').map(char => {
            if (char === ' ' || char === '(' || char === ')') return char;
            return scrambleText[Math.floor(Math.random() * scrambleText.length)];
        }).join('');
    }

    link.addEventListener("mouseenter", function() {
        let frame = 0;
        clearInterval(interval);
        link.style.color = "red";
        interval = setInterval(() => {
            if (frame < 10) {
                link.innerHTML = randomizeText(textPart) + htmlPart;
                frame++;
            } else {
                clearInterval(interval);
                link.innerHTML = originalText;
                link.style.color = "";
            }
        }, 50);
    });

    link.addEventListener("mouseleave", function() {
        clearInterval(interval);
        link.innerHTML = originalText;
        link.style.color = "";
    });
}
document.addEventListener("DOMContentLoaded", function () {
  setupPgNetworkScrambler();

    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      return '';
    }

    function setCookie(name, value, days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }

    const validThemes = ['essential', 'minecraft'];
    let savedTheme = getCookie('theme');

    if (!validThemes.includes(savedTheme)) {
      savedTheme = 'minecraft';
      setCookie('theme', savedTheme, 365);
    }

    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.href = `../themes/${savedTheme}/style.css`;
    document.head.appendChild(themeLink);
});

