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

// document.addEventListener("DOMContentLoaded", function () {
//   const scrollToTopBtn = document.getElementById("scrollToTopBtn");

//   if (!scrollToTopBtn) {
//       console.error("scrollToTopBtn not found in the DOM");
//       return;
//   }

//   window.onscroll = function () {
//       if (document.documentElement.scrollTop > 300) {
//           scrollToTopBtn.style.display = "block";
//       } else {
//           scrollToTopBtn.style.display = "none";
//       }
//   };

//   scrollToTopBtn.addEventListener("click", function () {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//   });
// });


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
  window.location.href = "../login";
}

function checkLoginStatus() {
    var userLoggedIn = localStorage.getItem('discordUser') !== null;
    var settingsElement = document.getElementById('settings');
    const consoleDebugStyleLogin = "color:rgb(225, 0, 255); font-weight: bold; background-color:rgb(0, 55, 0); padding: 2px 4px; border-radius: 2px;";
    if (userLoggedIn) {
        settingsElement.innerHTML = '<span class="menu-icon material-icons" style="font-size: 38px; color: #ccc;" onclick="logout()">logout</span>';
        console.log("%cUser login found yay", consoleDebugStyleLogin);
    } else {
        settingsElement.innerHTML = '<span class="menu-icon material-icons" style="font-size: 38px; color: #ccc;" onclick="login()">login</span>';
        console.log("%cUser login not found awwwwwwwwwwww", consoleDebugStyleLogin);
    }
}

window.onload = function() {
    setTimeout(checkLoginStatus, 2000);
};

