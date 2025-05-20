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

  fetchAllPartials();
  fetchAllLPartials();
  initLBThemeToggle();
});

function toggleLid() {
  const sidelid = document.getElementById("sidelid");
  const overlay = document.getElementById("sidebar-overlay");
  const tips = document.querySelectorAll(".button-tip");

  if (!sidelid) {
    console.error("Element with ID 'sidelid' not found.");
    return;
  }

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
  const sidelid = document.getElementById("sidelid"); // Assuming there's an element with this ID
  
  sidebar.classList.toggle("openSbar");

  if (sidebar.classList.contains("openSbar")) {
    document.body.style.overflow = "hidden";
    sidebar.style.overflowY = "auto";
    overlay.style.display = "block";
    if (sidelid) sidelid.style.display = "none"; // Close sidelid when sidebar opens
  } else {
    document.body.style.overflow = "";
    setTimeout(() => {
      sidebar.scrollTop = 0;
    }, 300);
    overlay.style.display = "none";
    if (sidelid) sidelid.style.display = "block"; // Open sidelid when sidebar closes
  }
  
  const consoleDebugStyleSidebar = "color:rgb(249, 247, 247); font-weight: bold; background-color:rgb(242, 0, 255); padding: 2px 4px; border-radius: 2px;";
  console.log("%csidebar works yayayyay", consoleDebugStyleSidebar);
}

document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar");
  const menuIcon = document.querySelector(".menu-icon");
  const left = document.querySelector(".left");
  const overlay = document.getElementById("sidebar-overlay");

  if (!sidebar || !menuIcon || !left || !overlay) return;

  const clickOutsideSidebar =
    sidebar.classList.contains("openSbar") &&
    !sidebar.contains(event.target) &&
    !menuIcon.contains(event.target) &&
    !left.contains(event.target) &&
    !overlay.contains(event.target);

  const clickOnOverlay = event.target === overlay;

  if (clickOutsideSidebar || clickOnOverlay) {
    sidebar.classList.remove("openSbar");
    document.body.style.overflow = "";
    overlay.style.display = "none";

    setTimeout(() => {
      sidebar.scrollTop = 0;
    }, 300);
  }
});


// outside click will close the sidelid
document.addEventListener("click", (event) => {
  const sidelid = document.getElementById("sidelid");
  const menuIcon = document.querySelector(".menu-icon");
  const left = document.querySelector(".left");
  const overlay = document.getElementById("sidebar-overlay");

  if (!sidelid || !menuIcon || !left || !overlay) return;

  if (sidelid.classList.contains("openlid") &&
    (!sidelid.contains(event.target) &&
      !menuIcon.contains(event.target) &&
      !left.contains(event.target)) ||
    event.target === overlay) {

    sidelid.classList.remove("openlid");
    document.body.style.overflow = "";
    overlay.style.display = "none";

    setTimeout(() => {
      sidelid.scrollTop = 0;
    }, 300);
  }
});

function homeBtn() {
  window.location.href = "../index.html";
}

function aiBtn() {
  window.location.href = "/ai";
}

function initializeThemeSwitcher() {
  console.debug("[ThemeSwitcher] Initializing theme switcher...");
  const themeSwitch = document.getElementById("theme-switch");
  
  if (!themeSwitch) {
    console.debug("[ThemeSwitcher] Theme switch not found yet, will retry...");
    setTimeout(initializeThemeSwitcher, 100);
    return;
  }

  console.debug(`[ThemeSwitcher] Theme switch element found:`, themeSwitch);

  let darkMode = localStorage.getItem("darkMode");
  console.debug(`[ThemeSwitcher] Initial darkMode value from localStorage:`, darkMode);

  const enableDarkmode = () => {
    document.body.classList.add("darkmode");
    localStorage.setItem("darkMode", "true");
    themeSwitch.textContent = "light_mode";
    console.debug("[ThemeSwitcher] Dark mode enabled");
  };

  const disableDarkmode = () => {
    document.body.classList.remove("darkmode");
    localStorage.setItem("darkMode", "false");
    themeSwitch.textContent = "dark_mode";
    console.debug("[ThemeSwitcher] Dark mode disabled");
  };

  // Set initial state
  if (darkMode === "true") {
    enableDarkmode();
  } else {
    disableDarkmode();
  }

  themeSwitch.addEventListener("click", () => {
    darkMode = localStorage.getItem("darkMode");
    if (darkMode !== "true") {
      enableDarkmode();
    } else {
      disableDarkmode();
    }
  });

  console.debug("[ThemeSwitcher] Initialization complete");
}

function fetchAllPartials() {
  Promise.all([
    fetch('../navbarv2.html').then(res => res.text()),
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([navbarHtml, sidebarHtml, footerHtml]) => {
    document.querySelector('.navbar').innerHTML = navbarHtml;
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;
    
    initializeThemeSwitcher();
  }).catch(error => {
    console.error("Error loading partials:", error);
  });
}

setTimeout(() => {
  const gUser = JSON.parse(localStorage.getItem('googleAuth'));
  const dUser = JSON.parse(localStorage.getItem('discordUser'));
  const user = JSON.parse(localStorage.getItem('user'));
  const userSettings = user ? JSON.parse(localStorage.getItem(`userSettings_${user.email}`)) : null;
  const consoleDebugStyleLoginType = "color:rgb(225, 0, 255); font-weight: bold; background-color:rgb(0, 47, 155); padding: 2px 4px; border-radius: 2px;";

  const infoDiv = document.getElementById("sidebarUsername");
  const infoDivName = document.getElementById("sidebarName");
  const infoDivImg = document.getElementById("sidebarAvatar");

  if (dUser) {
    // Display Discord user info
    infoDiv.innerHTML = `${dUser.email}`;
    infoDivName.innerHTML = `${dUser.username}`;
    infoDivImg.innerHTML = `<img style="width: 30px; height: 30px; margin: 0; border-radius: 50%;" src="https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png">`;
    console.log("%cuser type discord", consoleDebugStyleLoginType);


  } else if (user && user.token) {
    // Display Email/Password user info
    if (userSettings) {
      infoDiv.innerHTML = `${user.email}`;
      infoDivName.innerHTML = `${userSettings.username}`;
      infoDivImg.innerHTML = `<img style="width: 30px; height: 30px; margin: 0; border-radius: 50%;" src="${userSettings.profilePic}">`;
      console.log("%cuser type local", consoleDebugStyleLoginType);
    } else {
      console.error("User settings not found.");
      console.log("%cuser type none silly", consoleDebugStyleLoginType);
      //window.location.href = "sign-up.html";
    }

  } else {
    // Not logged in
    //window.location.href = "sign-up.html";
  }
}, 2000); // 2 seconds delay

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("discordUser");
  location.reload();
  const consoleDebugStyleLogout = "color:rgb(225, 0, 255); font-weight: bold; background-color:rgb(0, 55, 0); padding: 2px 4px; border-radius: 2px;";
  console.log("%cUser logged out gg", consoleDebugStyleLogout);
}

function login() {
  window.location.href = "/login";
}
function profile() {
  window.location.href = "/profile";
}

function checkLoginStatus() {
    var userLoggedIn = localStorage.getItem('discordUser') !== null;
    const consoleDebugStyleLogin = "color:rgb(225, 0, 255); font-weight: bold; background-color:rgb(0, 55, 0); padding: 2px 4px; border-radius: 2px;";
    if (userLoggedIn) {
        console.log("%cUser login found yay", consoleDebugStyleLogin);
    } else {
        console.log("%cUser login not found awwwwwwwwwwww", consoleDebugStyleLogin);
    }
}

window.onload = function() {
    setTimeout(checkLoginStatus, 2000);
};

// Initialize theme toggle system
function initLBThemeToggle() {
  const leaderboardThemeSwitch = document.getElementById("leaderboard-theme-switch");
  
  if (!leaderboardThemeSwitch) {
    console.debug("[Theme] Switch not found, retrying...");
    setTimeout(initLBThemeToggle, 100); // Retry after 100ms
    return;
  }

  console.debug("[Theme] Switch found:", leaderboardThemeSwitch);

  // Check localStorage or fallback to OS preference
  let darkMode = localStorage.getItem("darkMode");
  if (darkMode === null) { // First visit
    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? "true" : "false";
  }

  const enableDarkmode = () => {
    document.body.classList.add("darkmode");
    localStorage.setItem("darkMode", "true");
    leaderboardThemeSwitch.textContent = "light_mode";
    console.debug("[Theme] Dark mode enabled");
  };

  const disableDarkmode = () => {
    document.body.classList.remove("darkmode");
    localStorage.setItem("darkMode", "false");
    leaderboardThemeSwitch.textContent = "dark_mode";
    console.debug("[Theme] Dark mode disabled");
  };

  if (darkMode === "true") enableDarkmode();
  else disableDarkmode();

  leaderboardThemeSwitch.addEventListener("click", () => {
    if (document.body.classList.contains("darkmode")) disableDarkmode();
    else enableDarkmode();
  });
}

function fetchAllLPartials() {
  Promise.all([
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([sidebarHtml, footerHtml]) => {
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;

    console.debug("[Partials] Loaded successfully!");
    
    initLBThemeToggle();
  }).catch(err => {
    console.error("[Partials] Failed to load:", err);
  });
}

initLBThemeToggle();
