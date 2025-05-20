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

function fetchAllPartials() {
  Promise.all([
    fetch('../navbarv2.html').then(res => res.text()),
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([navbarHtml, sidebarHtml, footerHtml]) => {
    document.querySelector('.navbar').innerHTML = navbarHtml;
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;
    setupThemeSwitchers();
  }).catch(error => {
    console.error("Error loading partials:", error);
  });
}

setTimeout(() => {
  const gUser = JSON.parse(localStorage.getItem('googleAuth'));
  const dUser = JSON.parse(localStorage.getItem('discordUser'));
  const user = JSON.parse(localStorage.getItem('user'));
  const userSettings = user ? JSON.parse(localStorage.getItem(`userSettings_${user.email}`)) : null;

  const infoDiv = document.getElementById("sidebarUsername");
  const infoDivName = document.getElementById("sidebarName");
  const infoDivImg = document.getElementById("sidebarAvatar");

  if (dUser) {
    infoDiv.innerHTML = `${dUser.email}`;
    infoDivName.innerHTML = `${dUser.username}`;
    infoDivImg.innerHTML = `<img style="width: 30px; height: 30px; margin: 0; border-radius: 50%;" src="https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png">`;
  } else if (user && user.token) {
    if (userSettings) {
      infoDiv.innerHTML = `${user.email}`;
      infoDivName.innerHTML = `${userSettings.username}`;
      infoDivImg.innerHTML = `<img style="width: 30px; height: 30px; margin: 0; border-radius: 50%;" src="${userSettings.profilePic}">`;
    }
  }
}, 2000);

function logout() {
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

window.onload = function() {
  setTimeout(checkLoginStatus, 2000);
};

function fetchAllLPartials() {
  Promise.all([
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([sidebarHtml, footerHtml]) => {
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;
  }).catch(err => {
    console.error("[Partials] Failed to load:", err);
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