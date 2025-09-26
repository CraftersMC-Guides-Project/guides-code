document.addEventListener("DOMContentLoaded", function () {
  const loader = document.querySelector("#loader");
  if (loader) loader.style.display = "none";

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
      top: document.getElementById("scrollToTopBtn"),
    };

    let isActive = false;

    sweepBtn.addEventListener("click", () => {
      isActive = !isActive;
      if (elementsToStyle.container) {
        elementsToStyle.container.style.backgroundColor = isActive
          ? "#000"
          : "";
        elementsToStyle.container.style.left = isActive
          ? "calc(100% - 13rem)"
          : "calc(100% - 4rem)";
        elementsToStyle.container.style.transition = "transform 0.3s ease";
      }

      ["home", "ai", "top"].forEach((key) => {
        if (elementsToStyle[key]) {
          elementsToStyle[key].style.display = isActive ? "block" : "none";
          elementsToStyle[key].style.transition = "transform 0.3s ease";
        }
      });

      if (elementsToStyle.sweep) {
        elementsToStyle.sweep.style.transform = isActive
          ? "rotate(0deg)"
          : "rotate(180deg)";
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

function homeBtn() {
  window.location.href = "../index.html";
}

function aiBtn() {
  window.location.href = "/ai";
}

function fetchPartial(url, key) {
  const cached = localStorage.getItem(key);
  if (cached) return Promise.resolve(cached);
  return fetch(url)
    .then((res) => res.text())
    .then((html) => {
      localStorage.setItem(key, html);
      return html;
    });
}

function fetchAllPartials() {
  Promise.all([
    fetchPartial("../navbarv2.html", "navbarHtml"),
    fetchPartial("../sidebar.html", "sidebarHtml"),
    fetchPartial("../footer.html", "footerHtml"),
  ])
    .then(([navbarHtml, sidebarHtml, footerHtml]) => {
      document.querySelector(".top").innerHTML = navbarHtml;
      document.getElementById("sidebar").innerHTML = sidebarHtml;
      document.getElementById("footer").innerHTML = footerHtml;
      setupThemeSwitchers();
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";
      setupPgNetworkScrambler();
    })
    .catch((error) => {
      console.error("Error loading partials:", error);
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";
    });
}

function fetchAllLPartials() {
  Promise.all([
    fetch("../sidebar.html").then((res) => res.text()),
    fetch("../footer.html").then((res) => res.text()),
  ])
    .then(([sidebarHtml, footerHtml]) => {
      document.getElementById("sidebar").innerHTML = sidebarHtml;
      document.getElementById("footer").innerHTML = footerHtml;
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";
      setupPgNetworkScrambler();
    })
    .catch((err) => {
      console.error("[Partials] Failed to load:", err);
      // Hide loader even if error
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";
    });
}

function setupThemeSwitchers() {
  const themeSwitches = [
    document.getElementById("theme-switch"),
    document.getElementById("leaderboard-theme-switch"),
  ].filter(Boolean);

  if (!themeSwitches.length) return;

  const updateTheme = () => {
    const isDark = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("darkmode", isDark);
    themeSwitches.forEach((switchEl) => {
      switchEl.textContent = isDark ? "light_mode" : "dark_mode";
    });
  };

  const toggleTheme = () => {
    const isNowDark = !document.body.classList.contains("darkmode");
    localStorage.setItem("darkMode", isNowDark);
    updateTheme();
  };

  updateTheme();
  themeSwitches.forEach((switchEl) => {
    switchEl.addEventListener("click", toggleTheme);
  });
}

function closeAnnouncementBanner() {
  document.getElementById("announcement-banner").style.display = "none";
  document.querySelector(".navbar").style.marginTop = "0";
}

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
    setTimeout(() => (sidelid.scrollTop = 0), 300);
    if (window.playChestCloseSound) window.playChestCloseSound();
    return;
  }

  // Else, close sidebar if open
  if (sidebar && sidebar.classList.contains("openSbar")) {
    console.log("[DEBUG] overlay(): closing sidebar");
    sidebar.classList.remove("openSbar");
    document.body.style.overflow = "";
    overlay.style.display = "none";
    setTimeout(() => (sidebar.scrollTop = 0), 300);
    if (window.playChestCloseSound) window.playChestCloseSound();
  }
}

