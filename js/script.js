document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#loader').style.display = 'none';
});

function toggleLid() {
  const sidelid = document.getElementById("sidelid");
  const overlay = document.getElementById("sidebar-overlay");

  if (!sidelid) {
    console.error("Element with ID 'sidelid' not found.");
    return;
  }

  sidelid.classList.toggle("openlid");

  if (sidelid.classList.contains("openlid")) {
    document.body.style.overflow = "hidden";
    sidebar.style.overflowY = "auto";
    overlay.style.display = "block";
  } else {
    document.body.style.overflow = "";
    setTimeout(() => {
      sidelid.scrollTop = 0;
    }, 300);
    overlay.style.display = "none";
  }
}

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
document.addEventListener("DOMContentLoaded", function () {
  fetch('../navbar.html')
    .then(response => response.text())
    .then(data => {
      document.querySelector('.navbar').innerHTML = data;
      initializeDarkMode(); // Call dark mode initialization after navbar is loaded
    })
    .catch(error => console.error('Error loading the navbar:', error));
});

// sidebar
document.addEventListener("DOMContentLoaded", function () {
  fetch('../sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
      initializeDarkMode(); // Call dark mode initialization after navbar is loaded
    })
    .catch(error => console.error('Error loading the navbar:', error));
});

// footer
document.addEventListener("DOMContentLoaded", function () {
  fetch('../footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer').innerHTML = data;
      initializeDarkMode(); // Call dark mode initialization after navbar is loaded
    })
    .catch(error => console.error('Error loading the navbar:', error));
});

// dark mode
function initializeDarkMode() {
  const toggleButton = document.getElementById("darkModeToggle");

  if (!toggleButton) {
    console.error("Element with ID 'darkModeToggle' not found.");
    return;
  }

  let isDarkMode = localStorage.getItem("darkMode") === "true";
  applyTheme(isDarkMode);

  toggleButton.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem("darkMode", isDarkMode);
    applyTheme(isDarkMode);
  });
}

function applyTheme(isDarkMode) {
  const toggleButton = document.getElementById("darkModeToggle");
  document.body.classList.toggle("dark-mode", isDarkMode);

  const elementsToStyle = {
    // sidebar: document.getElementById("sidebar"),
    loader: document.getElementById("loader"),
    sidebarLinks: document.querySelectorAll(".sidebar-link"),
    cards: document.querySelectorAll(".card"),
    pCards: document.querySelectorAll(".pack-card"),
    panel: document.querySelectorAll(".panel"),
    collectionItem: document.querySelectorAll(".collection-item"),
    sidelid: document.querySelectorAll(".sidelid"),
    bottomNavs: document.querySelectorAll(".bottom-nav"),
    bottomNavItems: document.querySelectorAll(".nav-item"),
    bottomNavIcons: document.querySelectorAll(".bottom-nav-icon"),
    ctaButtons: document.querySelectorAll(".cta-btn"),
    navbars: document.querySelectorAll(".navbar, .custom-navbar"),
    unicodeContainers: document.querySelectorAll(".container"),
    itemContainer: document.querySelectorAll(".item-container"),
    itemCard: document.querySelectorAll(".item-card"),
    categoryItem: document.querySelectorAll(".category-item"),
    searchBox: document.querySelectorAll("#searchBox"),
    searchInput: document.querySelectorAll("#searchInput"),
    unicodeSections: document.querySelectorAll(".section"),
    sellerLists: document.querySelectorAll(".seller-list"),
    sellerCards: document.querySelectorAll(".seller-card"),
    sellerCardsInactive: document.querySelectorAll(".seller-card-inactive"),
    sellerLists2: document.querySelectorAll(".seller-list2"),
    sellerCards2: document.querySelectorAll(".seller-card2"),
    sellerCardsInactive2: document.querySelectorAll(".seller-card-inactive2"),
    tables: document.querySelectorAll("table"),
    footer: document.querySelectorAll("footer"),
    footerLinks: document.querySelectorAll(".links a"),
    tableHeaders: document.querySelectorAll("table th"),
    tableCells: document.querySelectorAll("table td"),
    statsBox: document.querySelectorAll(".stats-box"),
    statCard: document.querySelectorAll(".stat-card"),
    sellerDetails: document.querySelectorAll(".seller-details"),
    sellerProfile: document.querySelectorAll(".seller-profile"),
    itemContainer2: document.querySelectorAll(".item-container p"),
  };

  const removeHoverEffects = () => {
    elementsToStyle.tables.forEach(table => {
      table.querySelectorAll("tr").forEach(row => {
        row.onmouseenter = null;
        row.onmouseleave = null;
      });
    });
  };

  if (isDarkMode) {
    document.body.style.backgroundColor = "#1e1e2e";
    document.body.style.color = "white";

    // elementsToStyle.sidebar.style.backgroundColor = "#111111";
    elementsToStyle.loader.style.backgroundColor = "#333333";
    elementsToStyle.cards.forEach(card => (card.style.backgroundColor = "#222222"));
    elementsToStyle.pCards.forEach(pCard => (pCard.style.backgroundColor = "#222222"));
    elementsToStyle.panel.forEach(panel => (panel.style.backgroundColor = "#222222"));
    elementsToStyle.itemContainer.forEach(itemContainer => (itemContainer.style.backgroundColor = "#2222227c"));
    elementsToStyle.itemCard.forEach(itemCard => (itemCard.style.backgroundColor = "#2222227c"));
    elementsToStyle.searchBox.forEach(searchBox => (searchBox.style.backgroundColor = "#222", searchBox.style.color = "white"));
    elementsToStyle.searchInput.forEach(searchInput => (searchInput.style.backgroundColor = "#222", searchInput.style.color = "white"));
    elementsToStyle.categoryItem.forEach(categoryItem => (categoryItem.style.backgroundColor = "#2222227c"));
    elementsToStyle.footer.forEach(footer => (footer.style.background = "radial-gradient(ellipse at bottom, rgba(99, 80, 255, 0.3), transparent 70%)", footer.style.borderTop = "1px solid #333", footer.style.color = "#fff"));
    elementsToStyle.footerLinks.forEach(footerLinks => (footerLinks.style.color = "#fff"))
    elementsToStyle.collectionItem.forEach(collectionItem => (collectionItem.style.backgroundColor = "#1e1e3e"));
    elementsToStyle.bottomNavs.forEach(nav => (nav.style.backgroundColor = "#111111"));
    elementsToStyle.sellerLists.forEach(list => (list.style.backgroundColor = "#111111"));
    elementsToStyle.sidelid.forEach(sidelid => (sidelid.style.backgroundColor = "rgb(17, 17, 28)", sidelid.style.color = "white"));
    elementsToStyle.sidebarLinks.forEach(link => (link.style.color = "#fff"));
    elementsToStyle.bottomNavItems.forEach(item => (item.style.color = "white"));
    elementsToStyle.bottomNavIcons.forEach(icon => (icon.style.color = "white"));
    elementsToStyle.ctaButtons.forEach(btn => (btn.style.backgroundColor = "#111111"));
    elementsToStyle.navbars.forEach(nav => (nav.style.backgroundColor = "#111111"));
    elementsToStyle.unicodeContainers.forEach(container => (container.style.backgroundColor = "rgba(17, 17, 28, 0.7)"));
    elementsToStyle.unicodeSections.forEach(section => (section.style.backgroundColor = "#222222"));
    elementsToStyle.sellerCards.forEach(card => (card.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
    elementsToStyle.sellerCardsInactive.forEach(card => (card.style.backgroundColor = "rgba(70, 0, 0, 0.4)"));
    elementsToStyle.sellerCards2.forEach(card => (card.style.backgroundColor = "rgba(36, 36, 36, 0.6);"));
    elementsToStyle.sellerCardsInactive2.forEach(card => (card.style.backgroundColor = "rgba(70, 0, 0, 0.4)"));
    elementsToStyle.itemContainer2.forEach(itemContainer2 => (itemContainer2.style.color = "white"));

    elementsToStyle.tables.forEach(table => {
      table.style.backgroundColor = "#282838";
      table.style.color = "white";
      table.style.border = "1px solid #444";
    });

    elementsToStyle.tableHeaders.forEach(header => {
      header.style.backgroundColor = "#33334d";
      header.style.color = "white";
    });



    elementsToStyle.tableCells.forEach(cell => {
      cell.style.border = "1px solid #444";
    });

    removeHoverEffects();

    elementsToStyle.tables.forEach(table => {
      table.querySelectorAll("tr").forEach(row => {
        row.addEventListener("mouseenter", () => {
          row.style.backgroundColor = "#3a3a4a";
        });

        row.addEventListener("mouseleave", () => {
          row.style.backgroundColor = "#282838";
        });
      });
    });
    elementsToStyle.statsBox.forEach(stat => (stat.style.backgroundColor = "rgba(0, 0, 0, 0.7)"));
    elementsToStyle.statCard.forEach(card => (card.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
    elementsToStyle.sellerDetails.forEach(detail => (detail.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
    elementsToStyle.sellerProfile.forEach(profile => (profile.style.color = "white"));
    elementsToStyle.sellerProfile.forEach(profile => (profile.style.backgroundColor = "rgba(34, 34, 34, 0.2)"));

    toggleButton.textContent = "light_mode";
  } else {
    //THIS IS WHeRE THE LIGHT MODE STUFF GOES OK
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";

    //elementsToStyle.sidebar.style.backgroundColor = "white";
    elementsToStyle.loader.style.backgroundColor = "white";

    elementsToStyle.cards.forEach(card => (card.style.backgroundColor = "white"));
    elementsToStyle.pCards.forEach(pCard => (pCard.style.backgroundColor = "white"));
    elementsToStyle.panel.forEach(panel => (panel.style.backgroundColor = "white"));
    elementsToStyle.itemContainer.forEach(itemContainer => (itemContainer.style.backgroundColor = "#ffffff7c"));
    elementsToStyle.itemCard.forEach(itemCard => (itemCard.style.backgroundColor = "#ffffff7c"));
    elementsToStyle.searchBox.forEach(searchBox => (searchBox.style.backgroundColor = "transparent", searchBox.style.color = "black"));
    elementsToStyle.searchInput.forEach(searchInput => (searchInput.style.backgroundColor = "transparent", searchInput.style.color = "black"));
    elementsToStyle.categoryItem.forEach(categoryItem => (categoryItem.style.backgroundColor = "#ffffff7c"));
    elementsToStyle.footer.forEach(footer => (footer.style.background = "radial-gradient(ellipse at bottom, rgba(100, 80, 255, 0.6), transparent 70%)", footer.style.borderTop = "transparent", footer.style.color = "#000"));
    elementsToStyle.footerLinks.forEach(footerLinks => (footerLinks.style.color = "#000"))
    elementsToStyle.bottomNavs.forEach(nav => (nav.style.backgroundColor = "white"));
    elementsToStyle.sellerLists.forEach(list => (list.style.backgroundColor = "white"));
    elementsToStyle.sidelid.forEach(sidelid => (sidelid.style.backgroundColor = "rgb(241, 241, 241)", sidelid.style.color = "black"));
    elementsToStyle.sidebarLinks.forEach(link => (link.style.color = "#000"));
    elementsToStyle.bottomNavItems.forEach(item => (item.style.color = "#333333"));
    elementsToStyle.bottomNavIcons.forEach(icon => (icon.style.color = "#333333"));
    elementsToStyle.ctaButtons.forEach(btn => (btn.style.backgroundColor = "#007bff"));
    elementsToStyle.navbars.forEach(nav => (nav.style.backgroundColor = "#007bff"));
    elementsToStyle.unicodeContainers.forEach(container => (container.style.backgroundColor = "rgb(241,241,241,0.6)"));
    elementsToStyle.unicodeSections.forEach(section => (section.style.backgroundColor = "#f1f1f1", section.style.border = "1px solid #898989"));
    elementsToStyle.sellerCards.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.1)"));
    elementsToStyle.sellerCardsInactive.forEach(card => {
      card.style.border = "2px solid rgb(221, 34, 34)";
      card.style.backgroundColor = "rgba(221, 34, 34, 0.1)";
    });
    elementsToStyle.sellerCards2.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.0)"));
    elementsToStyle.sellerCardsInactive2.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.3)"));
    elementsToStyle.itemContainer2.forEach(itemContainer2 => (itemContainer2.style.color = "black"));

    elementsToStyle.tables.forEach(table => {
      table.style.backgroundColor = "white";
      table.style.color = "black";
      table.style.border = "1px solid #ccc";
    });

    elementsToStyle.tableHeaders.forEach(header => {
      header.style.backgroundColor = "#007bff";
      header.style.color = "black";
    });

    elementsToStyle.tableCells.forEach(cell => {
      cell.style.border = "1px solid #ccc";
    });

    elementsToStyle.statsBox.forEach(stat => (stat.style.backgroundColor = "rgba(0, 0, 0, 0.7)"));
    elementsToStyle.statCard.forEach(card => (card.style.backgroundColor = "rgba(80, 80, 80, 0.4)"));
    elementsToStyle.sellerDetails.forEach(detail => (detail.style.backgroundColor = "rgba(80, 80, 80, 0.4)"))
    elementsToStyle.sellerProfile.forEach(profile => (profile.style.backgroundColor = "rgba(170, 170, 170, 0.2)"));

    removeHoverEffects();

    elementsToStyle.tables.forEach(table => {
      table.querySelectorAll("tr").forEach(row => {
        row.addEventListener("mouseenter", () => {
          row.style.backgroundColor = "#f0f0f0";
        });

        row.addEventListener("mouseleave", () => {
          row.style.backgroundColor = "white";
        });
      });
    });

    toggleButton.textContent = "dark_mode";
  }
}

function toggleTheme(event) {
  const reveal = document.getElementById("theme-reveal");
  const x = event.clientX;
  const y = event.clientY;

  reveal.style.top = `${y - 50}px`;
  reveal.style.left = `${x - 50}px`;
  reveal.style.background = getComputedStyle(document.body).getPropertyValue('--main-bg-color');
  reveal.style.transform = "scale(0)";
  reveal.style.transition = "none";

  void reveal.offsetWidth;

  reveal.style.transition = "transform 0.6s ease-out";
  reveal.style.transform = "scale(50)";

  setTimeout(() => {
    document.body.classList.toggle("darkmode");
    reveal.style.transform = "scale(0)";
  }, 300);
}

// Darkmode by Pg network 
// declare the elements here otherwise won't work + error
// document.addEventListener("DOMContentLoaded", () => {
//   const toggleButton = document.getElementById("darkModeToggle");

//   if (!toggleButton) {
//     console.error("Element with ID 'darkModeToggle' not found.");
//     console.warn("Retrying...");
//     setTimeout(5000);
//     // Retry after 5 seconds
//     const toggleButton = document.getElementById("darkModeToggle");

//     if (!toggleButton) {
//       console.error("Element with ID 'darkModeToggle' still not found.");
//       return;
//     }

//     return;
//   }

//   const elementsToStyle = {
//     // sidebar: document.getElementById("sidebar"),
//     loader: document.getElementById("loader"),
//     sidebarLinks: document.querySelectorAll(".sidebar-link"),
//     cards: document.querySelectorAll(".card"),
//     pCards: document.querySelectorAll(".pack-card"),
//     panel: document.querySelectorAll(".panel"),
//     collectionItem: document.querySelectorAll(".collection-item"),
//     contentSections: document.querySelectorAll(".content"),
//     sidelid: document.querySelectorAll(".sidelid"),
//     bottomNavs: document.querySelectorAll(".bottom-nav"),
//     bottomNavItems: document.querySelectorAll(".nav-item"),
//     bottomNavIcons: document.querySelectorAll(".bottom-nav-icon"),
//     ctaButtons: document.querySelectorAll(".cta-btn"),
//     navbars: document.querySelectorAll(".navbar"),
//     unicodeContainers: document.querySelectorAll(".container"),
//     unicodeSections: document.querySelectorAll(".section"),
//     sellerLists: document.querySelectorAll(".seller-list"),
//     sellerCards: document.querySelectorAll(".seller-card"),
//     sellerCardsInactive: document.querySelectorAll(".seller-card-inactive"),
//     tables: document.querySelectorAll("table"),
//     footer: document.querySelectorAll("footer"),
//     footerLinks: document.querySelectorAll(".links a"),
//     tableHeaders: document.querySelectorAll("table th"),
//     tableCells: document.querySelectorAll("table td"),
//     statsBox: document.querySelectorAll(".stats-box"),
//     statCard: document.querySelectorAll(".stat-card"),
//     sellerDetails: document.querySelectorAll(".seller-details"),
//     sellerProfile: document.querySelectorAll(".seller-profile"),
//   };

//   let isDarkMode = localStorage.getItem("darkMode") === "true";

// const removeHoverEffects = () => {
//   elementsToStyle.tables.forEach(table => {
//     table.querySelectorAll("tr").forEach(row => {
//       row.onmouseenter = null;
//       row.onmouseleave = null;
//     });
//   });
// };

//   const applyTheme = () => {
//     document.body.classList.toggle("dark-mode", isDarkMode);

//     if (isDarkMode) {
//       document.body.style.backgroundColor = "#1e1e2e";
//       document.body.style.color = "white";

//       // elementsToStyle.sidebar.style.backgroundColor = "#111111";
//       elementsToStyle.loader.style.backgroundColor = "#333333";
//       elementsToStyle.cards.forEach(card => (card.style.backgroundColor = "#222222"));
//       elementsToStyle.pCards.forEach(pCard => (pCard.style.backgroundColor = "#222222"));
//       elementsToStyle.panel.forEach(panel => (panel.style.backgroundColor = "#222222"));
//       elementsToStyle.footer.forEach(footer => (footer.style.background = "radial-gradient(ellipse at bottom, rgba(99, 80, 255, 0.3), transparent 70%)", footer.style.boderTop = "1px solid #333", footer.style.color = "#fff"));
//       elementsToStyle.footerLinks.forEach(footerLinks => (footerLinks.style.color = "#fff"))
//       elementsToStyle.contentSections.forEach(section => (section.style.backgroundColor = "#222222"));
//       elementsToStyle.collectionItem.forEach(collectionItem => (collectionItem.style.backgroundColor = "#1e1e3e"));
//       elementsToStyle.bottomNavs.forEach(nav => (nav.style.backgroundColor = "#111111"));
//       elementsToStyle.sellerLists.forEach(list => (list.style.backgroundColor = "#111111"));
//       elementsToStyle.sidelid.forEach(sidelid => (sidelid.style.backgroundColor = "rgb(17, 17, 28)", sidelid.style.color = "white"));
//       elementsToStyle.sidebarLinks.forEach(link => (link.style.color = "#fff"));
//       elementsToStyle.bottomNavItems.forEach(item => (item.style.color = "white"));
//       elementsToStyle.bottomNavIcons.forEach(icon => (icon.style.color = "white"));
//       elementsToStyle.ctaButtons.forEach(btn => (btn.style.backgroundColor = "#111111"));
//       elementsToStyle.navbars.forEach(nav => (nav.style.backgroundColor = "#111111"));
//       elementsToStyle.unicodeContainers.forEach(container => (container.style.backgroundColor = "rgba(17, 17, 28, 0.7)"));
//       elementsToStyle.unicodeSections.forEach(section => (section.style.backgroundColor = "#222222"));
//       elementsToStyle.sellerCards.forEach(card => (card.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
//       elementsToStyle.sellerCardsInactive.forEach(card => (card.style.backgroundColor = "rgba(70, 0, 0, 0.4)"));

//       elementsToStyle.tables.forEach(table => {
//         table.style.backgroundColor = "#282838";
//         table.style.color = "white";
//         table.style.border = "1px solid #444";
//       });

//       elementsToStyle.tableHeaders.forEach(header => {
//         header.style.backgroundColor = "#33334d";
//         header.style.color = "white";
//       });



//       elementsToStyle.tableCells.forEach(cell => {
//         cell.style.border = "1px solid #444";
//       });

//       removeHoverEffects();

//       elementsToStyle.tables.forEach(table => {
//         table.querySelectorAll("tr").forEach(row => {
//           row.addEventListener("mouseenter", () => {
//             row.style.backgroundColor = "#3a3a4a";
//           });

//           row.addEventListener("mouseleave", () => {
//             row.style.backgroundColor = "#282838";
//           });
//         });
//       });
//       elementsToStyle.statsBox.forEach(stat => (stat.style.backgroundColor = "rgba(0, 0, 0, 0.7)"));
//       elementsToStyle.statCard.forEach(card => (card.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
//       elementsToStyle.sellerDetails.forEach(detail => (detail.style.backgroundColor = "rgba(0, 0, 0, 0.4)"));
//       elementsToStyle.sellerProfile.forEach(profile => (profile.style.color = "white"));
//       elementsToStyle.sellerProfile.forEach(profile => (profile.style.backgroundColor = "rgba(34, 34, 34, 0.2)"));

//       toggleButton.textContent = "light_mode";
//     } else {
//       document.body.style.backgroundColor = "white";
//       document.body.style.color = "black";

//       //elementsToStyle.sidebar.style.backgroundColor = "white";
//       elementsToStyle.loader.style.backgroundColor = "white";

//       elementsToStyle.cards.forEach(card => (card.style.backgroundColor = "white"));
//       elementsToStyle.pCards.forEach(pCard => (pCard.style.backgroundColor = "white"));
//       elementsToStyle.panel.forEach(panel => (panel.style.backgroundColor = "white"));
//       elementsToStyle.footer.forEach(footer => (footer.style.background = "radial-gradient(ellipse at bottom, rgba(100, 80, 255, 0.6), transparent 70%)", footer.style.borderTop = "transparent", footer.style.color = "#000"));
//       elementsToStyle.footerLinks.forEach(footerLinks => (footerLinks.style.color = "#000"))
//       elementsToStyle.contentSections.forEach(section => (section.style.backgroundColor = "#f9f9f9"));
//       elementsToStyle.bottomNavs.forEach(nav => (nav.style.backgroundColor = "white"));
//       elementsToStyle.sellerLists.forEach(list => (list.style.backgroundColor = "white"));
//       elementsToStyle.sidelid.forEach(sidelid => (sidelid.style.backgroundColor = "rgb(241, 241, 241)", sidelid.style.color = "black"));
//       elementsToStyle.sidebarLinks.forEach(link => (link.style.color = "#000"));
//       elementsToStyle.bottomNavItems.forEach(item => (item.style.color = "#333333"));
//       elementsToStyle.bottomNavIcons.forEach(icon => (icon.style.color = "#333333"));
//       elementsToStyle.ctaButtons.forEach(btn => (btn.style.backgroundColor = "#007bff"));
//       elementsToStyle.navbars.forEach(nav => (nav.style.backgroundColor = "#007bff"));
//       elementsToStyle.unicodeContainers.forEach(container => (container.style.backgroundColor = "rgb(241,241,241,0.6)"));
//       elementsToStyle.unicodeSections.forEach(section => (section.style.backgroundColor = "#f1f1f1", section.style.border = "1px solid #898989"));
//       elementsToStyle.sellerCards.forEach(card => (card.style.backgroundColor = "#rgba(255, 255, 255, 0.1)"));
//       elementsToStyle.sellerCardsInactive.forEach(card => {
//         card.style.border = "2px solid rgb(221, 34, 34)";
//         card.style.backgroundColor = "rgba(221, 34, 34, 0.1)";
//       });

//       elementsToStyle.tables.forEach(table => {
//         table.style.backgroundColor = "white";
//         table.style.color = "black";
//         table.style.border = "1px solid #ccc";
//       });

//       elementsToStyle.tableHeaders.forEach(header => {
//         header.style.backgroundColor = "#007bff";
//         header.style.color = "black";
//       });

//       elementsToStyle.tableCells.forEach(cell => {
//         cell.style.border = "1px solid #ccc";
//       });

//       elementsToStyle.statsBox.forEach(stat => (stat.style.backgroundColor = "(rgba(0, 0, 0, 0.7)"));
//       elementsToStyle.statCard.forEach(card => (card.style.backgroundColor = "rgba(80, 80, 80, 0.4)"));
//       elementsToStyle.sellerDetails.forEach(detail => (detail.style.backgroundColor = "rgba(80, 80, 80, 0.4)"))
//       elementsToStyle.sellerProfile.forEach(profile => (profile.style.backgroundColor = "rgba(170, 170, 170, 0.2)"));

//       removeHoverEffects();

//       elementsToStyle.tables.forEach(table => {
//         table.querySelectorAll("tr").forEach(row => {
//           row.addEventListener("mouseenter", () => {
//             row.style.backgroundColor = "#f0f0f0";
//           });

//           row.addEventListener("mouseleave", () => {
//             row.style.backgroundColor = "white";
//           });
//         });
//       });

//       toggleButton.textContent = "dark_mode";
//     }
//   };

//   applyTheme();

//   // if (!toggleButton) {
//   //   console.error("Element with ID 'darkModeToggle' not found.");
//   //   console.warn("Retrying...");
//   //   setTimeout(applyTheme, 5000);
//   //   return;
//   // }

//   if (toggleButton) {
//     toggleButton.addEventListener("click", () => {
//       isDarkMode = !isDarkMode;
//       localStorage.setItem("darkMode", isDarkMode);
//       //got rid of auto reload for a bit mb if any issues
//       //location.reload();
//       applyTheme();
//     });
//   }
// });

setTimeout(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userSettings = JSON.parse(localStorage.getItem(`userSettings_${user.email}`));
  const infoDiv = document.getElementById("sidebarUsername");
  const infoDivName = document.getElementById("sidebarName");
  const infoDivImg = document.getElementById("sidebarImg");

  if (!user || !user.token) {
    window.location.href = "login.html"; // not logged in
  } else {
    infoDiv.innerHTML = `${user.email}`;
    infoDivName.innerHTML = `${userSettings.username}`;
    infoDivImg.innerHTML = `<img style="width: 30px; height: 30px; margin: 0;" src="${userSettings.profilePic}">`;
  }
}, 5000); // 5000 milliseconds = 5 seconds

function logout() {
  localStorage.removeItem("user");
  location.reload();
}
