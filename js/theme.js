// Theme management system
document.addEventListener('DOMContentLoaded', function() {
    // Set default theme if not set
    if (!getCookie('theme')) {
        setTheme('default');
    } else {
        loadTheme(getCookie('theme'));
    }
});

function loadTheme(themeName) {
    // Remove any existing theme stylesheets
    const oldTheme = document.querySelector('link[data-theme]');
    if (oldTheme) {
        oldTheme.remove();
    }

    // Create new theme link
    const themeLink = document.createElement('link');
    themeLink.rel = 'stylesheet';
    themeLink.href = `themes/${themeName}.css`;
    themeLink.dataset.theme = themeName;
    document.head.appendChild(themeLink);
    
    // Update cookie if different
    if (getCookie('theme') !== themeName) {
        setCookie('theme', themeName, 365);
    }
}

function setTheme(themeName) {
    loadTheme(themeName);
    setCookie('theme', themeName, 365);
}

// Cookie helper functions
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}
