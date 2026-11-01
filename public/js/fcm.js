/**
 * CraftersMC Guides — Firebase Cloud Messaging & Event Alerts Controller
 * Integrates FCM push notifications and local SkyBlock event alarms.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getMessaging, getToken, onMessage, isSupported } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging.js";

// Firebase App Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAn7vfm3mQb1PR0ppAyBj_5dRsngCAlXnk",
  authDomain: "craftersmc-guides-cab30.firebaseapp.com",
  projectId: "craftersmc-guides-cab30",
  storageBucket: "craftersmc-guides-cab30.firebasestorage.app",
  messagingSenderId: "924655326351",
  appId: "1:924655326351:web:bf07720a8f5787aec04cfa"
};

// VAPID Public Key for Web Push (from .dev.vars)
export const VAPID_KEY = "BK_C5v-NUeL1hWaJ7Zzx3xkaxCKxk6bDLZXvAsV2KuEHK-FK4R4uUtgmezWalpRlG8Bdxy-XNLtM5JcFukc1d-4";

// Default Event Alert Subscriptions (CraftersMC SkyBlock Events)
const DEFAULT_PREFERENCES = {
  farming: true,       // Ethan's Farming Contest
  spooky: true,        // Spooky Festival
  zoo: true,           // Travelling Zoo
  pig: true,           // Season of the Pig (Shiny Pigs)
  new_year: true       // New Year Celebration
};

class SkyCalendarFCMController {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.swRegistration = null;
    this.token = localStorage.getItem('cmc_fcm_token') || null;
    this.preferences = this.loadPreferences();
    this.isSupported = false;
    this.activeAlarms = new Map();
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('cmc_fcm_preferences');
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[FCM] Failed to parse saved preferences:', e);
    }
    return { ...DEFAULT_PREFERENCES };
  }

  savePreferences() {
    try {
      localStorage.setItem('cmc_fcm_preferences', JSON.stringify(this.preferences));
    } catch (e) {
      console.warn('[FCM] Failed to save preferences:', e);
    }
  }

  async init() {
    try {
      // 1. Check if FCM / Web Push is supported in this browser
      const supported = await isSupported();
      if (!supported || !('serviceWorker' in navigator) || !('Notification' in window)) {
        console.warn('[FCM] Push notifications are not supported in this browser environment.');
        this.updateUIStatus('unsupported');
        return;
      }
      this.isSupported = true;

      // 2. Initialize Firebase App
      this.app = initializeApp(firebaseConfig);
      window.firebaseApp = this.app;

      // 3. Register Service Worker with intelligent path resolution
      try {
        const swPath = window.location.pathname.startsWith('/public/')
          ? '/public/firebase-messaging-sw.js'
          : '/firebase-messaging-sw.js';

        try {
          this.swRegistration = await navigator.serviceWorker.register(swPath);
        } catch (firstErr) {
          const fallbackPath = swPath === '/firebase-messaging-sw.js'
            ? '/public/firebase-messaging-sw.js'
            : '/firebase-messaging-sw.js';
          console.warn(`[FCM] Primary SW path (${swPath}) failed, trying fallback (${fallbackPath})...`);
          this.swRegistration = await navigator.serviceWorker.register(fallbackPath);
        }
        console.log('[FCM] Service Worker registered successfully with scope:', this.swRegistration.scope);
      } catch (swErr) {
        console.warn('[FCM] Service worker registration error:', swErr);
      }

      // 4. Initialize Messaging
      this.messaging = getMessaging(this.app);

      // 5. Setup Foreground message listener
      onMessage(this.messaging, (payload) => {
        console.log('[FCM] Foreground push message received:', payload);
        const title = payload.notification?.title || payload.data?.title || 'SkyBlock Event Starting!';
        const body = payload.notification?.body || payload.data?.body || 'Check the calendar for live details.';
        const icon = payload.notification?.icon || payload.data?.icon || '/assets/cmc-icon.png';
        const url = payload.data?.url || '/skycalendar.html';

        this.showToast(title, body, icon, url);

        // Also trigger native Notification if window is in background / blurred
        if (document.hidden && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon,
            badge: '/assets/cmc-icon.png'
          });
        }
      });

      // 6. Update UI with current permission / token status
      this.updateUIStatus(this.getPermissionState());

      // 7. If permission already granted but token not cached, attempt refresh
      if (Notification.permission === 'granted' && !this.token) {
        await this.retrieveToken(false);
      }

      // 8. Start automatic SkyBlock event monitor for active alerts
      this.startEventMonitor();
    } catch (err) {
      console.error('[FCM] Initialization failed:', err);
      this.updateUIStatus('error');
    }
  }

  getPermissionState() {
    if (!this.isSupported) return 'unsupported';
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'denied') return 'denied';
    if (Notification.permission === 'granted') {
      return this.token ? 'active' : 'granted_no_token';
    }
    return 'default';
  }

  async retrieveToken(interactive = true) {
    if (!this.messaging) return null;

    try {
      // Ensure service worker is ready
      const registration = this.swRegistration || await navigator.serviceWorker.ready;

      const currentToken = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        this.token = currentToken;
        localStorage.setItem('cmc_fcm_token', currentToken);
        console.log('[FCM] Registration token retrieved successfully:', currentToken);
        this.updateUIStatus('active');
        this.syncTokenWithBackend(currentToken);
        if (interactive) {
          this.showToast('🔔 Event Alerts Enabled!', 'You will receive push notifications for your selected SkyBlock events.', '/assets/cmc-icon.png');
        }
        return currentToken;
      } else {
        console.warn('[FCM] No registration token available. Request permission to generate one.');
        this.updateUIStatus('default');
        return null;
      }
    } catch (err) {
      console.error('[FCM] An error occurred while retrieving token:', err);
      if (Notification.permission === 'denied') {
        this.updateUIStatus('denied');
        if (interactive) {
          this.showToast('⚠️ Notifications Blocked', 'Please allow notifications in your browser site settings.', '/assets/cmc-icon.png');
        }
      } else {
        this.updateUIStatus('error');
      }
      return null;
    }
  }

  async enableNotifications() {
    if (!this.isSupported) {
      alert('Push notifications are not supported in your browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.retrieveToken(true);
        this.syncPreferenceInputs();
        this.startEventMonitor();
      } else if (permission === 'denied') {
        this.updateUIStatus('denied');
        this.showToast('⚠️ Notifications Blocked', 'You blocked notification permissions. Unblock in browser settings to receive alerts.', '/assets/cmc-icon.png');
      } else {
        this.updateUIStatus('default');
      }
    } catch (err) {
      console.error('[FCM] Permission request failed:', err);
      this.updateUIStatus('error');
    }
  }

  disableNotifications() {
    this.token = null;
    localStorage.removeItem('cmc_fcm_token');
    this.updateUIStatus('default');
    this.showToast('🔕 Alerts Paused', 'SkyBlock event push notifications have been disabled on this device.', '/assets/cmc-icon.png');
  }

  toggleNotifications() {
    if (this.token && Notification.permission === 'granted') {
      this.disableNotifications();
    } else {
      this.enableNotifications();
    }
  }

  testNotification() {
    const sampleEvent = '🌾 Ethan\'s Farming Contest';
    const sampleBody = 'Contest starting in 5 minutes! Contested Crops: Wheat, Carrot, Pumpkin.';
    
    // In-app visual toast
    this.showToast(sampleEvent, sampleBody, '/assets/farming/Farm-o-Matic.webp');

    // System notification
    if (Notification.permission === 'granted') {
      try {
        if (this.swRegistration && 'showNotification' in this.swRegistration) {
          this.swRegistration.showNotification(`[TEST] ${sampleEvent}`, {
            body: sampleBody,
            icon: '/assets/cmc-icon.png',
            badge: '/assets/cmc-icon.png',
            tag: 'skyblock-test',
            vibrate: [150, 50, 150]
          }).catch(err => {
            console.warn('[FCM] OS-level notification blocked:', err.message);
            this.showToast('⚠️ Desktop Banner Blocked by Windows', 'Your browser was denied OS-level permission. Enable notifications for your browser in Windows Settings > System > Notifications.', '/assets/cmc-icon.png');
          });
        } else {
          new Notification(`[TEST] ${sampleEvent}`, {
            body: sampleBody,
            icon: '/assets/cmc-icon.png'
          });
        }
      } catch (e) {
        console.warn('[FCM] Native notification trigger failed:', e);
      }
    } else {
      this.showToast('Notice', 'Click "Enable Push Notifications" to receive system/desktop banners.', '/assets/cmc-icon.png');
    }
  }

  copyToken() {
    if (!this.token) {
      this.showToast('No Token Available', 'Please enable notifications first to generate an FCM token.', '/assets/cmc-icon.png');
      return;
    }

    navigator.clipboard.writeText(this.token).then(() => {
      this.showToast('📋 Token Copied!', 'FCM Device Token copied to clipboard for testing.', '/assets/cmc-icon.png');
    }).catch(err => {
      console.error('[FCM] Clipboard error:', err);
      prompt('Copy your FCM token:', this.token);
    });
  }

  async syncTokenWithBackend(token) {
    if (!token) return;
    try {
      let subData = null;
      try {
        if (this.swRegistration && this.swRegistration.pushManager) {
          const sub = await this.swRegistration.pushManager.getSubscription();
          if (sub) {
            subData = sub.toJSON();
          }
        }
      } catch (e) {}

      await fetch('/api/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          subscription: subData,
          preferences: this.preferences
        })
      });
    } catch (e) {
      console.debug('[FCM] Backend sync skipped:', e.message);
    }
  }

  setPreference(eventId, enabled) {
    this.preferences[eventId] = !!enabled;
    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  syncPreferenceInputs() {
    Object.keys(this.preferences).forEach(eventId => {
      const checkbox = document.getElementById(`fcm-pref-${eventId}`);
      if (checkbox) {
        checkbox.checked = this.preferences[eventId];
      }
    });

    const tokenInput = document.getElementById('fcm-token-display');
    if (tokenInput) {
      tokenInput.value = this.token || 'Notifications not enabled yet';
    }
  }

  startEventMonitor() {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
    this.alertedEvents = new Set(JSON.parse(sessionStorage.getItem('cmc_alerted_events') || '[]'));

    const checkEvents = () => {
      if (Notification.permission !== 'granted' || !window.CalendarEngine) return;

      try {
        const upcoming = window.CalendarEngine.getUpcomingEventsData();
        if (!Array.isArray(upcoming)) return;

        const WARNING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes before event

        upcoming.forEach(ev => {
          let eventKey = null;
          let displayName = ev.name;

          if (ev.name === "Farming Contest") {
            eventKey = 'farming';
            displayName = "Ethan's Farming Contest";
          } else if (ev.name === "Spooky Festival") {
            eventKey = 'spooky';
          } else if (ev.name === "Travelling Zoo") {
            eventKey = 'zoo';
          } else if (ev.name === "Season of the Pig") {
            eventKey = 'pig';
          } else if (ev.name === "New Year Celebration") {
            eventKey = 'new_year';
          }

          if (!eventKey || !this.preferences[eventKey]) return;

          // Check if event is within 5 minutes
          if (ev.msUntil > 0 && ev.msUntil <= WARNING_WINDOW_MS) {
            const uniqueId = `${eventKey}_${ev.nextDay}`;
            if (!this.alertedEvents.has(uniqueId)) {
              this.alertedEvents.add(uniqueId);
              sessionStorage.setItem('cmc_alerted_events', JSON.stringify(Array.from(this.alertedEvents)));

              const minsLeft = Math.max(1, Math.ceil(ev.msUntil / 60000));
              let bodyText = `Starts in ~${minsLeft} minute${minsLeft > 1 ? 's' : ''}!`;
              if (ev.crops && ev.crops.length) {
                bodyText += ` Contested crops: ${ev.crops.join(', ')}.`;
              }

              // 1. Show Foreground Neo-Brutalist toast
              this.showToast(`🌾 ${displayName}`, bodyText, '/assets/cmc-icon.png');

              // 2. Trigger Real System / Service Worker Notification
              if (this.swRegistration && 'showNotification' in this.swRegistration) {
                this.swRegistration.showNotification(`🌾 ${displayName} Alert!`, {
                  body: bodyText,
                  icon: '/assets/cmc-icon.png',
                  badge: '/assets/cmc-icon.png',
                  tag: uniqueId,
                  vibrate: [200, 100, 200],
                  data: { url: '/skycalendar.html' }
                }).catch(err => {
                  console.warn('[FCM] OS-level notification blocked:', err.message);
                });
              } else {
                try {
                  new Notification(`🌾 ${displayName} Alert!`, {
                    body: bodyText,
                    icon: '/assets/cmc-icon.png'
                  });
                } catch (e) {}
              }
            }
          }
        });
      } catch (err) {
        console.debug('[FCM] Event check loop exception:', err);
      }
    };

    setTimeout(checkEvents, 2000);
    this.monitorInterval = setInterval(checkEvents, 25000);
  }

  updateUIStatus(status) {
    const notifyBtn = document.getElementById('fcm-notify-btn');
    const badge = document.getElementById('fcm-status-badge');
    const toggleBtn = document.getElementById('fcm-main-toggle-btn');
    const statusText = document.getElementById('fcm-status-desc');

    if (status === 'active') {
      if (notifyBtn) {
        notifyBtn.classList.remove('gray', 'yellow');
        notifyBtn.classList.add('purple');
        notifyBtn.title = 'Event Alerts: ACTIVE';
      }
      if (badge) {
        badge.className = 'neo-badge green';
        badge.innerHTML = '<span class="material-icons">check_circle</span> ACTIVE';
      }
      if (toggleBtn) {
        toggleBtn.className = 'button70-btn red';
        toggleBtn.innerHTML = '<span class="material-icons">notifications_off</span> Turn Off Alerts';
      }
      if (statusText) {
        statusText.textContent = 'Push notifications are currently active for your selected events.';
      }
    } else if (status === 'denied') {
      if (notifyBtn) {
        notifyBtn.classList.remove('purple', 'gray');
        notifyBtn.classList.add('yellow');
        notifyBtn.title = 'Event Alerts: BLOCKED';
      }
      if (badge) {
        badge.className = 'neo-badge red';
        badge.innerHTML = '<span class="material-icons">block</span> BLOCKED';
      }
      if (toggleBtn) {
        toggleBtn.className = 'button70-btn yellow';
        toggleBtn.innerHTML = '<span class="material-icons">settings</span> Blocked in Browser';
        toggleBtn.disabled = true;
      }
      if (statusText) {
        statusText.textContent = 'Notifications are blocked in browser settings. Please click the lock icon in your URL bar to allow.';
      }
    } else if (status === 'unsupported') {
      if (badge) {
        badge.className = 'neo-badge gray';
        badge.innerHTML = '<span class="material-icons">info</span> UNSUPPORTED';
      }
      if (toggleBtn) {
        toggleBtn.disabled = true;
        toggleBtn.innerHTML = 'Not Supported in Browser';
      }
      if (statusText) {
        statusText.textContent = 'This browser does not support Web Push / Service Workers.';
      }
    } else {
      // default / not configured
      if (notifyBtn) {
        notifyBtn.classList.remove('purple', 'yellow');
        notifyBtn.classList.add('purple');
        notifyBtn.title = 'Event Alerts: OFF';
      }
      if (badge) {
        badge.className = 'neo-badge yellow';
        badge.innerHTML = '<span class="material-icons">notifications_paused</span> INACTIVE';
      }
      if (toggleBtn) {
        toggleBtn.className = 'button70-btn purple';
        toggleBtn.disabled = false;
        toggleBtn.innerHTML = '<span class="material-icons">notifications_active</span> Enable Push Notifications';
      }
      if (statusText) {
        statusText.textContent = 'Enable alerts to get notified before Ethan\'s Contests, Spooky Festival, and more.';
      }
    }

    this.syncPreferenceInputs();
  }

  showToast(title, message, iconUrl = '/assets/cmc-icon.png', clickUrl = '/skycalendar.html') {
    let container = document.getElementById('fcm-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fcm-toast-container';
      container.className = 'fcm-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'neo-fcm-toast';
    toast.innerHTML = `
      <div class="fcm-toast-icon">
        <img src="${iconUrl}" alt="" onerror="this.src='/assets/cmc-icon.png'" />
      </div>
      <div class="fcm-toast-content">
        <div class="fcm-toast-title">${title}</div>
        <div class="fcm-toast-message">${message}</div>
      </div>
      <button class="fcm-toast-close" type="button" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.fcm-toast-close').addEventListener('click', (e) => {
      e.stopPropagation();
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    });

    toast.addEventListener('click', () => {
      if (clickUrl && window.location.pathname !== clickUrl) {
        window.location.href = clickUrl;
      } else {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 250);
      }
    });

    container.appendChild(toast);

    // Auto dismiss after 6.5s
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 250);
      }
    }, 6500);
  }
}

// Global instance
const fcmController = new SkyCalendarFCMController();
window.SkyCalendarFCM = fcmController;

// UI Modal Handlers
window.openNotificationModal = function () {
  const modal = document.getElementById('fcm-modal');
  if (modal) {
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    fcmController.syncPreferenceInputs();
    fcmController.updateUIStatus(fcmController.getPermissionState());
  }
};

window.closeNotificationModal = function () {
  const modal = document.getElementById('fcm-modal');
  if (modal) {
    modal.classList.remove('visible');
    document.body.style.overflow = '';
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => fcmController.init());
} else {
  fcmController.init();
}

export default fcmController;
