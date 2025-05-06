document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#loader').style.display = 'none';
});

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  sidebar.classList.toggle("openSbar");

  if (sidebar.classList.contains("openSbar")) {
    document.body.style.overflow = "hidden";
    sidebar.style.overflowY = "auto";
    overlay.style.display = "block";
  } else {
    document.body.style.overflow = "";
    setTimeout(() => {
      sidebar.scrollTop = 0;
    }, 300);
    overlay.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  if (!scrollToTopBtn) {
      console.error("scrollToTopBtn not found in the DOM");
      return;
  }

  window.onscroll = function () {
      if (document.documentElement.scrollTop > 300) {
          scrollToTopBtn.style.display = "block";
      } else {
          scrollToTopBtn.style.display = "none";
      }
  };

  scrollToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
  });
});


// outside click will close the sidebar
document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar");
  const menuIcon = document.querySelector(".menu-icon");
  const left = document.querySelector(".left");
  const overlay = document.getElementById("sidebar-overlay");

  if (!sidebar || !menuIcon || !left || !overlay) return;

  if (
    sidebar.classList.contains("openSbar") &&
    !sidebar.contains(event.target) &&
    !menuIcon.contains(event.target) &&
    !left.contains(event.target)
  ) {
    sidebar.classList.remove("openSbar");
    document.body.style.overflow = "";
    overlay.style.display = "none";

    setTimeout(() => {
      sidebar.scrollTop = 0;
    }, 300);
  } else if (event.target === overlay) {
    sidebar.classList.remove("openSbar");
    document.body.style.overflow = "";
    overlay.style.display = "none";

    setTimeout(() => {
      sidebar.scrollTop = 0;
    }, 300);
  }
});
/*document.getElementById('dark-mode-toggle').addEventListener('click', (event) => {
  const button = event.target;
  const isDarkMode = document.body.classList.toggle('dark-mode');
  
  button.classList.toggle('dark-mode', isDarkMode);
  button.classList.toggle('light-mode', !isDarkMode);

  document.querySelectorAll('body').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('button.toggle-button').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('.card').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('nav-btn').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('button.nav-btn').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('h3').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('ul').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('ul ul').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('::selection').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('p').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('strong').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
});
*/

// Modified to work with dynamic content loading
function initializeThemeSwitcher() {
  console.debug("[ThemeSwitcher] Initializing theme switcher...");

  // Try to find the theme switch button
  const themeSwitch = document.getElementById("theme-switch");
  
  if (!themeSwitch) {
    console.debug("[ThemeSwitcher] Theme switch not found yet, will retry...");
    // If not found, try again after a short delay
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
    disableDarkmode(); // Explicitly set light mode if not dark
  }

  // Add click handler
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

// Improved partial loading with theme switcher initialization
function fetchAllPartials() {
  Promise.all([
    fetch('../navbarv2.html').then(res => res.text()),
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([navbarHtml, sidebarHtml, footerHtml]) => {
    // Insert all HTML at once
    document.querySelector('.navbar').innerHTML = navbarHtml;
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;
    
    // Initialize theme switcher immediately after content is inserted
    initializeThemeSwitcher();
  }).catch(error => {
    console.error("Error loading partials:", error);
  });
}

// Start the process when DOM is ready
document.addEventListener("DOMContentLoaded", fetchAllPartials);

