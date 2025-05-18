document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#loader').style.display = 'none';
  const consoleDebugStyle = "color: #00ff00; font-weight: bold; background-color: #000000; padding: 2px 4px; border-radius: 2px;";
  console.log("%cscript.js running", consoleDebugStyle);
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

document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

// outside click will close the sidebar
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

// navbar
// document.addEventListener("DOMContentLoaded", function () {
//   fetch('../navbar.html')
//     .then(response => response.text())
//     .then(data => {
//       document.querySelector('.navbar').innerHTML = data;
//       initializeDarkMode(); // Call dark mode initialization after navbar is loaded
//     })
//     .catch(error => console.error('Error loading the navbar:', error));
// });

// // sidebar
// document.addEventListener("DOMContentLoaded", function () {
//   fetch('../sidebar.html')
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById('sidebar').innerHTML = data;
//       initializeDarkMode(); // Call dark mode initialization after navbar is loaded
//     })
//     .catch(error => console.error('Error loading the navbar:', error));
// });

// // footer
// document.addEventListener("DOMContentLoaded", function () {
//   fetch('../footer.html')
//     .then(response => response.text())
//     .then(data => {
//       document.getElementById('footer').innerHTML = data;
//       initializeDarkMode(); // Call dark mode initialization after navbar is loaded
//     })
//     .catch(error => console.error('Error loading the navbar:', error));
// });

// dark mode
// function initializeDarkMode() {
//   const toggleButton = document.getElementById("darkModeToggle");

//   if (!toggleButton) {
//     console.error("Element with ID 'darkModeToggle' not found.");
//     return;
//   }

//   let isDarkMode = localStorage.getItem("darkMode") === "true";
//   applyTheme(isDarkMode);

//   toggleButton.addEventListener("click", () => {
//     isDarkMode = !isDarkMode;
//     localStorage.setItem("darkMode", isDarkMode);
//     applyTheme(isDarkMode);
//   });
// }

// function applyTheme(isDarkMode) {
//   const toggleButton = document.getElementById("darkModeToggle");
//   document.body.classList.toggle("dark-mode", isDarkMode);

//   const elementsToStyle = {
//     // sidebar: document.getElementById("sidebar"),
//     loader: document.getElementById("loader"),
//     sidebarLinks: document.querySelectorAll(".sidebar-link"),
//     cards: document.querySelectorAll(".card"),
//     pCards: document.querySelectorAll(".pack-card"),
//     panel: document.querySelectorAll(".panel"),
//     collectionItem: document.querySelectorAll(".collection-item"),
//     sidelid: document.querySelectorAll(".sidelid"),
//     bottomNavs: document.querySelectorAll(".bottom-nav"),
//     bottomNavItems: document.querySelectorAll(".nav-item"),
//     bottomNavIcons: document.querySelectorAll(".bottom-nav-icon"),
//     ctaButtons: document.querySelectorAll(".cta-btn"),
//     navbars: document.querySelectorAll(".navbar, .custom-navbar"),
//     unicodeContainers: document.querySelectorAll(".container"),
//     itemContainer: document.querySelectorAll(".item-container"),
//     itemCard: document.querySelectorAll(".item-card"),
//     categoryItem: document.querySelectorAll(".category-item"),
//     searchBox: document.querySelectorAll("#searchBox"),
//     searchInput: document.querySelectorAll("#searchInput"),
//     unicodeSections: document.querySelectorAll(".section"),
//     sellerLists: document.querySelectorAll(".seller-list"),
//     sellerCards: document.querySelectorAll(".seller-card"),
//     sellerCardsInactive: document.querySelectorAll(".seller-card-inactive"),
//     sellerLists2: document.querySelectorAll(".seller-list2"),
//     sellerCards2: document.querySelectorAll(".seller-card2"),
//     sellerCardsInactive2: document.querySelectorAll(".seller-card-inactive2"),
//     tables: document.querySelectorAll("table"),
//     footer: document.querySelectorAll("footer"),
//     footerLinks: document.querySelectorAll(".links a"),
//     tableHeaders: document.querySelectorAll("table th"),
//     tableCells: document.querySelectorAll("table td"),
//     statsBox: document.querySelectorAll(".stats-box"),
//     statCard: document.querySelectorAll(".stat-card"),
//     sellerDetails: document.querySelectorAll(".seller-details"),
//     sellerProfile: document.querySelectorAll(".seller-profile"),
//     itemContainer2: document.querySelectorAll(".item-container p"),
//     options: document.querySelectorAll(".rarity-dropdown .options"),
//   };

//   const removeHoverEffects = () => {
//     elementsToStyle.tables.forEach(table => {
//       table.querySelectorAll("tr").forEach(row => {
//         row.onmouseenter = null;
//         row.onmouseleave = null;
//       });
//     });
//   };

//   if (isDarkMode) {
//     document.body.style.backgroundColor = "#1e1e2e";
//     document.body.style.color = "white";

//     // elementsToStyle.sidebar.style.backgroundColor = "#111111";
//     elementsToStyle.loader.style.backgroundColor = "#333333";
//     elementsToStyle.cards.forEach(card => (card.style.backgroundColor = "#222222"));
//     elementsToStyle.pCards.forEach(pCard => (pCard.style.backgroundColor = "#222222"));
//     elementsToStyle.panel.forEach(panel => (panel.style.backgroundColor = "#222222"));
//     elementsToStyle.itemContainer.forEach(itemContainer => (itemContainer.style.backgroundColor = "#2222227c"));
//     elementsToStyle.itemCard.forEach(itemCard => (itemCard.style.backgroundColor = "#2222227c"));
//     elementsToStyle.searchBox.forEach(searchBox => (searchBox.style.backgroundColor = "#222", searchBox.style.color = "white"));
//     elementsToStyle.searchInput.forEach(searchInput => (searchInput.style.backgroundColor = "#222", searchInput.style.color = "white"));
//     elementsToStyle.categoryItem.forEach(categoryItem => (categoryItem.style.backgroundColor = "#2222227c"));
//     elementsToStyle.footer.forEach(footer => (footer.style.background = "radial-gradient(ellipse at bottom, rgba(99, 80, 255, 0.3), transparent 70%)", footer.style.borderTop = "1px solid #333", footer.style.color = "#fff"));
//     elementsToStyle.footerLinks.forEach(footerLinks => (footerLinks.style.color = "#fff"))
//     elementsToStyle.collectionItem.forEach(collectionItem => (collectionItem.style.backgroundColor = "#1e1e3e"));
//     elementsToStyle.bottomNavs.forEach(nav => (nav.style.backgroundColor = "#111111"));
//     elementsToStyle.sellerLists.forEach(list => (list.style.backgroundColor = "#111111"));
//     elementsToStyle.sidelid.forEach(sidelid => (sidelid.style.backgroundColor = "rgb(17, 17, 28)", sidelid.style.color = "white"));
//     elementsToStyle.sidebarLinks.forEach(link => (link.style.color = "#fff"));
//     elementsToStyle.bottomNavItems.forEach(item => (item.style.color = "white"));
//     elementsToStyle.bottomNavIcons.forEach(icon => (icon.style.color = "white"));
//     elementsToStyle.ctaButtons.forEach(btn => (btn.style.backgroundColor = "#111111"));
//     elementsToStyle.navbars.forEach(nav => (nav.style.backgroundColor = "#111111"));
//     elementsToStyle.unicodeContainers.forEach(container => (container.style.backgroundColor = "rgba(17, 17, 28, 0.7)"));
//     elementsToStyle.options.forEach(options => (options.style.backgroundColor = "#1e1e2e", options.style.color = "white"));
//     elementsToStyle.unicodeSections.forEach(section => (section.style.backgroundColor = "#222222"));
//     elementsToStyle.sellerCards.forEach(card => (card.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
//     elementsToStyle.sellerCardsInactive.forEach(card => (card.style.backgroundColor = "rgba(70, 0, 0, 0.4)"));
//     elementsToStyle.sellerCards2.forEach(card => (card.style.backgroundColor = "rgba(36, 36, 36, 0.6);"));
//     elementsToStyle.sellerCardsInactive2.forEach(card => (card.style.backgroundColor = "rgba(70, 0, 0, 0.4)"));
//     elementsToStyle.itemContainer2.forEach(itemContainer2 => (itemContainer2.style.color = "white"));

//     elementsToStyle.tables.forEach(table => {
//       table.style.backgroundColor = "#282838";
//       table.style.color = "white";
//       table.style.border = "1px solid #444";
//     });

//     elementsToStyle.tableHeaders.forEach(header => {
//       header.style.backgroundColor = "#33334d";
//       header.style.color = "white";
//     });



//     elementsToStyle.tableCells.forEach(cell => {
//       cell.style.border = "1px solid #444";
//     });

//     removeHoverEffects();

//     elementsToStyle.tables.forEach(table => {
//       table.querySelectorAll("tr").forEach(row => {
//         row.addEventListener("mouseenter", () => {
//           row.style.backgroundColor = "#3a3a4a";
//         });

//         row.addEventListener("mouseleave", () => {
//           row.style.backgroundColor = "#282838";
//         });
//       });
//     });
//     elementsToStyle.statsBox.forEach(stat => (stat.style.backgroundColor = "rgba(0, 0, 0, 0.7)"));
//     elementsToStyle.statCard.forEach(card => (card.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
//     elementsToStyle.sellerDetails.forEach(detail => (detail.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
//     elementsToStyle.sellerProfile.forEach(profile => (profile.style.color = "white"));
//     elementsToStyle.sellerProfile.forEach(profile => (profile.style.backgroundColor = "rgba(34, 34, 34, 0.2)"));

//     toggleButton.textContent = "light_mode";
//   } else {
//     //THIS IS WHeRE THE LIGHT MODE STUFF GOES OK
//     document.body.style.backgroundColor = "white";
//     document.body.style.color = "black";

//     //elementsToStyle.sidebar.style.backgroundColor = "white";
//     elementsToStyle.loader.style.backgroundColor = "white";

//     elementsToStyle.cards.forEach(card => (card.style.backgroundColor = "white"));
//     elementsToStyle.pCards.forEach(pCard => (pCard.style.backgroundColor = "white"));
//     elementsToStyle.panel.forEach(panel => (panel.style.backgroundColor = "white"));
//     elementsToStyle.itemContainer.forEach(itemContainer => (itemContainer.style.backgroundColor = "#ffffff7c"));
//     elementsToStyle.itemCard.forEach(itemCard => (itemCard.style.backgroundColor = "#ffffff7c"));
//     elementsToStyle.searchBox.forEach(searchBox => (searchBox.style.backgroundColor = "transparent", searchBox.style.color = "black"));
//     elementsToStyle.searchInput.forEach(searchInput => (searchInput.style.backgroundColor = "transparent", searchInput.style.color = "black"));
//     elementsToStyle.categoryItem.forEach(categoryItem => (categoryItem.style.backgroundColor = "#ffffff7c"));
//     elementsToStyle.footer.forEach(footer => (footer.style.background = "radial-gradient(ellipse at bottom, rgba(100, 80, 255, 0.6), transparent 70%)", footer.style.borderTop = "transparent", footer.style.color = "#000"));
//     elementsToStyle.footerLinks.forEach(footerLinks => (footerLinks.style.color = "#000"))
//     elementsToStyle.bottomNavs.forEach(nav => (nav.style.backgroundColor = "white"));
//     elementsToStyle.sellerLists.forEach(list => (list.style.backgroundColor = "white"));
//     elementsToStyle.sidelid.forEach(sidelid => (sidelid.style.backgroundColor = "rgb(241, 241, 241)", sidelid.style.color = "black"));
//     elementsToStyle.options.forEach(options => (options.style.backgroundColor = "white", options.style.color = "black"));
//     elementsToStyle.sidebarLinks.forEach(link => (link.style.color = "#000"));
//     elementsToStyle.bottomNavItems.forEach(item => (item.style.color = "#333333"));
//     elementsToStyle.bottomNavIcons.forEach(icon => (icon.style.color = "#333333"));
//     elementsToStyle.ctaButtons.forEach(btn => (btn.style.backgroundColor = "#007bff"));
//     elementsToStyle.navbars.forEach(nav => (nav.style.backgroundColor = "#007bff"));
//     elementsToStyle.unicodeContainers.forEach(container => (container.style.backgroundColor = "rgb(241,241,241,0.6)"));
//     elementsToStyle.unicodeSections.forEach(section => (section.style.backgroundColor = "#f1f1f1", section.style.border = "1px solid #898989"));
//     elementsToStyle.sellerCards.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.1)"));
//     elementsToStyle.sellerCardsInactive.forEach(card => {
//       card.style.border = "2px solid rgb(221, 34, 34)";
//       card.style.backgroundColor = "rgba(221, 34, 34, 0.1)";
//     });
//     elementsToStyle.sellerCards2.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.0)"));
//     elementsToStyle.sellerCardsInactive2.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.3)"));
//     elementsToStyle.itemContainer2.forEach(itemContainer2 => (itemContainer2.style.color = "black"));

//     elementsToStyle.tables.forEach(table => {
//       table.style.backgroundColor = "white";
//       table.style.color = "black";
//       table.style.border = "1px solid #ccc";
//     });

//     elementsToStyle.tableHeaders.forEach(header => {
//       header.style.backgroundColor = "#007bff";
//       header.style.color = "black";
//     });

//     elementsToStyle.tableCells.forEach(cell => {
//       cell.style.border = "1px solid #ccc";
//     });

//     elementsToStyle.statsBox.forEach(stat => (stat.style.backgroundColor = "rgba(0, 0, 0, 0.7)"));
//     elementsToStyle.statCard.forEach(card => (card.style.backgroundColor = "rgba(80, 80, 80, 0.4)"));
//     elementsToStyle.sellerDetails.forEach(detail => (detail.style.backgroundColor = "rgba(80, 80, 80, 0.4)"))
//     elementsToStyle.sellerProfile.forEach(profile => (profile.style.backgroundColor = "rgba(170, 170, 170, 0.2)"));

//     removeHoverEffects();

//     elementsToStyle.tables.forEach(table => {
//       table.querySelectorAll("tr").forEach(row => {
//         row.addEventListener("mouseenter", () => {
//           row.style.backgroundColor = "#f0f0f0";
//         });

//         row.addEventListener("mouseleave", () => {
//           row.style.backgroundColor = "white";
//         });
//       });
//     });

//     toggleButton.textContent = "dark_mode";
//   }
//   const consoleDebugStyleToggle = "color:rgb(0, 123, 255); font-weight: bold; background-color: #000000; padding: 2px 4px; border-radius: 2px;";
//   console.log("%ctheme was toggled - debug", consoleDebugStyleToggle);
// }

// function toggleTheme(event) {
  
//   const reveal = document.getElementById("theme-reveal");
//   const x = event.clientX;
//   const y = event.clientY;

//   reveal.style.top = `${y - 50}px`;
//   reveal.style.left = `${x - 50}px`;
//   reveal.style.background = getComputedStyle(document.body).getPropertyValue('--main-bg-color');
//   reveal.style.transform = "scale(0)";
//   reveal.style.transition = "none";

//   void reveal.offsetWidth;

//   reveal.style.transition = "transform 0.6s ease-out";
//   reveal.style.transform = "scale(50)";

//   setTimeout(() => {
//     document.body.classList.toggle("darkmode");
//     reveal.style.transform = "scale(0)";
//   }, 300);
//   const consoleDebugStyleToggleTheme = "color: #00ff00; font-weight: bold; background-color: #000000; padding: 2px 4px; border-radius: 2px;";
//   console.log("%cTheme toggled!", consoleDebugStyleToggleTheme);
// }

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
    setTimeout(initLBThemeToggle, 10000); // Retry after 10000ms
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

  // Set initial state
  if (darkMode === "true") enableDarkmode();
  else disableDarkmode();

  // Toggle on click
  leaderboardThemeSwitch.addEventListener("click", () => {
    if (document.body.classList.contains("darkmode")) disableDarkmode();
    else enableDarkmode();
  });
}

// Fetch and inject partial HTML (navbar, sidebar, footer)
function fetchAllLPartials() {
  Promise.all([
    fetch('../sidebar.html').then(res => res.text()),
    fetch('../footer.html').then(res => res.text())
  ]).then(([sidebarHtml, footerHtml]) => {
    // Inject HTML
    document.getElementById('sidebar').innerHTML = sidebarHtml;
    document.getElementById('footer').innerHTML = footerHtml;

    console.debug("[Partials] Loaded successfully!");
    
    // Reinitialize theme toggle (in case the switch was reloaded)
    initLBThemeToggle();
  }).catch(err => {
    console.error("[Partials] Failed to load:", err);
  });
}

// Start everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initLBThemeToggle(); // Initialize theme first
  fetchAllLPartials(); // Then load partials
});

// Start the theme toggle
initLBThemeToggle();
