/**
 * CraftersMC Guides — Firebase Cloud Messaging & Event Alerts Controller
 * Integrates FCM push notifications and local SkyBlock event alarms.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getMessaging, getToken, deleteToken, onMessage, isSupported } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging.js";

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

// SkyBlock Contested Crop Catalog
export const ALL_CROPS = [
  'WHEAT', 'SUGAR_CANE', 'CARROT', 'POTATO',
  'MELON', 'PUMPKIN', 'COCOA_BEANS', 'CACTUS',
  'MUSHROOM', 'BEETROOT'
];

export const CROP_METADATA = {
  'WHEAT': { name: 'Wheat', icon: 'img/Wheat.webp' },
  'SUGAR_CANE': { name: 'Sugar Cane', icon: 'img/Sugar_Cane.webp' },
  'CARROT': { name: 'Carrot', icon: 'img/Carrot.webp' },
  'POTATO': { name: 'Potato', icon: 'img/Potato.webp' },
  'MELON': { name: 'Melon', icon: 'img/Melon.webp' },
  'PUMPKIN': { name: 'Pumpkin', icon: 'img/Pumpkin.webp' },
  'COCOA_BEANS': { name: 'Cocoa Beans', icon: 'img/Cocoa_Beans.webp' },
  'CACTUS': { name: 'Cactus', icon: 'img/Cactus.webp' },
  'MUSHROOM': { name: 'Mushroom', icon: 'img/Mushroom.gif' },
  'BEETROOT': { name: 'Beetroot', icon: 'img/Beetroot.webp' }
};

// Travelling Zoo Pets & Rarities Catalog
export const ALL_ZOO_PETS = ['elephant', 'giraffe', 'tiger', 'lion', 'monkey'];
export const ALL_RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

export const ZOO_PET_METADATA = {
  elephant: { name: 'Elephant', icon: 'img/pets/Elephant_Pet.webp', emoji: '🐘' },
  giraffe:  { name: 'Giraffe',  icon: 'img/pets/Giraffe_Pet.webp',  emoji: '🦒' },
  tiger:    { name: 'Tiger',    icon: 'img/pets/300px-Tiger_Pet.webp', emoji: '🐯' },
  lion:     { name: 'Lion',     icon: 'img/pets/300px-Lion_Pet.webp', emoji: '🦁' },
  monkey:   { name: 'Monkey',   icon: 'img/pets/Monkey_Pet.webp',   emoji: '🐵' }
};

export const RARITY_METADATA = {
  COMMON:    { name: 'Common',    short: 'Com', icon: 'assets/rarity/common.webp',    color: '#64748b' },
  UNCOMMON:  { name: 'Uncommon',  short: 'Unc', icon: 'assets/rarity/uncommon.webp',  color: '#16a34a' },
  RARE:      { name: 'Rare',      short: 'Rare', icon: 'assets/rarity/rare.webp',      color: '#2563eb' },
  EPIC:      { name: 'Epic',      short: 'Epic', icon: 'assets/rarity/epic.webp',      color: '#9333ea' },
  LEGENDARY: { name: 'Legendary', short: 'Leg', icon: 'assets/rarity/legendary.webp', color: '#d97706' }
};

export function createDefaultZooPets() {
  return {
    elephant: [...ALL_RARITIES],
    giraffe:  [...ALL_RARITIES],
    tiger:    [...ALL_RARITIES],
    lion:     [...ALL_RARITIES],
    monkey:   [...ALL_RARITIES]
  };
}

// Default Event Alert Subscriptions (CraftersMC SkyBlock Events)
const DEFAULT_PREFERENCES = {
  farming: true,       // Ethan's Farming Contest
  spooky: true,        // Spooky Festival
  zoo: true,           // Travelling Zoo
  pig: true,           // Season of the Pig (Shiny Pigs)
  new_year: true,      // New Year Celebration
  lead_time: {
    '15': false,       // 15 minutes early
    '5': true          // 5 minutes early
  },
  farming_crops: [...ALL_CROPS], // all 10 crops selected by default
  zoo_pets: createDefaultZooPets() // all pets & rarities selected by default
};

class SkyCalendarFCMController {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.swRegistration = null;
    this.deviceId = this.getOrCreateDeviceId();
    this.token = localStorage.getItem('cmc_fcm_token') || null;
    this.preferences = this.loadPreferences();
    this.isSupported = false;
    this.activeAlarms = new Map();
  }

  getOrCreateDeviceId() {
    try {
      let id = localStorage.getItem('cmc_device_id');
      if (!id) {
        id = 'cmc_' + (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : (Date.now().toString(36) + Math.random().toString(36).substring(2)));
        localStorage.setItem('cmc_device_id', id);
      }
      return id;
    } catch (e) {
      return 'cmc_fallback_' + Date.now().toString(36);
    }
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('cmc_fcm_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          lead_time: {
            ...DEFAULT_PREFERENCES.lead_time,
            ...(parsed.lead_time || {})
          },
          farming_crops: Array.isArray(parsed.farming_crops)
            ? parsed.farming_crops
            : [...DEFAULT_PREFERENCES.farming_crops],
          zoo_pets: (parsed.zoo_pets && typeof parsed.zoo_pets === 'object')
            ? { ...createDefaultZooPets(), ...parsed.zoo_pets }
            : createDefaultZooPets()
        };
      }
    } catch (e) {
      console.warn('[FCM] Failed to parse saved preferences:', e);
    }
    return {
      ...DEFAULT_PREFERENCES,
      lead_time: { ...DEFAULT_PREFERENCES.lead_time },
      farming_crops: [...DEFAULT_PREFERENCES.farming_crops],
      zoo_pets: createDefaultZooPets()
    };
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
      this.renderCropChips();
      this.renderZooPets();
      this.syncPreferenceInputs();

      // 7. If permission already granted, verify subscription validity and re-sync
      if (Notification.permission === 'granted') {
        try {
          const registration = this.swRegistration || await navigator.serviceWorker.ready;
          const sub = await registration.pushManager?.getSubscription();
          if (!sub || !this.token) {
            await this.retrieveToken(false, false);
          } else {
            await this.syncTokenWithBackend(this.token);
          }
        } catch (e) {
          console.warn('[FCM] Auto-sync check warning:', e);
        }
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

  async retrieveToken(interactive = true, forceRefresh = false) {
    if (!this.messaging) return null;

    try {
      // Ensure service worker is ready
      const registration = this.swRegistration || await navigator.serviceWorker.ready;

      // If force refresh requested, delete cached token to guarantee fresh registration
      if (forceRefresh) {
        try {
          await deleteToken(this.messaging);
        } catch (delErr) {
          console.debug('[FCM] deleteToken notice:', delErr.message);
        }
        localStorage.removeItem('cmc_fcm_token');
        this.token = null;
      }

      const currentToken = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (currentToken) {
        this.token = currentToken;
        localStorage.setItem('cmc_fcm_token', currentToken);
        console.log('[FCM] Registration token retrieved successfully:', currentToken);
        this.updateUIStatus('active');
        await this.syncTokenWithBackend(currentToken);
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
        await this.retrieveToken(true, false);
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

  async disableNotifications() {
    const oldToken = this.token;
    this.token = null;
    localStorage.removeItem('cmc_fcm_token');
    this.updateUIStatus('default');

    try {
      if (this.messaging && oldToken) {
        await deleteToken(this.messaging).catch(() => {});
      }
      const registration = this.swRegistration || await navigator.serviceWorker?.ready;
      if (registration?.pushManager) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe().catch(() => {});
        }
      }
      if (oldToken || this.deviceId) {
        await fetch('/api/fcm-token', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device_id: this.deviceId,
            token: oldToken
          })
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('[FCM] Disable cleanup warning:', e);
    }

    this.syncPreferenceInputs();
    this.showToast('🔕 Alerts Removed', 'Push notifications have been disabled and unsubscribed from Cloudflare D1.', '/assets/cmc-icon.png');
  }

  toggleNotifications() {
    if (this.token && Notification.permission === 'granted') {
      this.disableNotifications();
    } else {
      this.enableNotifications();
    }
  }

  async reSync() {
    this.showToast('🔄 Re-syncing Alerts...', 'Refreshing push subscription credentials with Google...', '/assets/cmc-icon.png');
    const token = await this.retrieveToken(false, true);
    if (token) {
      this.showToast('✅ Re-sync Successful', 'Fresh push token registered and synced with alert dispatcher.', '/assets/cmc-icon.png');
    } else {
      this.showToast('⚠️ Re-sync Warning', 'Could not obtain fresh token. Please verify notification permissions.', '/assets/cmc-icon.png');
    }
  }

  async testServerPush() {
    if (!this.token) {
      this.showToast('No Token Available', 'Please enable notifications first before testing server push.', '/assets/cmc-icon.png');
      return;
    }

    this.showToast('🚀 Testing Server Push...', 'Sending test alert directly to this device...', '/assets/cmc-icon.png');
    try {
      let subData = null;
      try {
        const registration = this.swRegistration || await navigator.serviceWorker?.ready;
        if (registration?.pushManager) {
          const sub = await registration.pushManager.getSubscription();
          if (sub) subData = sub.toJSON();
        }
      } catch (e) {}

      const res = await fetch('/api/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: this.token,
          endpoint: subData?.endpoint || null
        })
      });

      const data = await res.json();
      if (data.success) {
        this.showToast('✅ Push Delivered!', 'Test notification sent directly to your device! Check your system banner.', '/assets/cmc-icon.png');
      } else {
        this.showToast('⚠️ Test Notice', data.message || `Status: ${data.status}`, '/assets/cmc-icon.png');
      }
    } catch (e) {
      this.showToast('❌ Test Push Failed', e.message, '/assets/cmc-icon.png');
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
        const registration = this.swRegistration || await navigator.serviceWorker?.ready;
        if (registration?.pushManager) {
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            subData = sub.toJSON();
          }
        }
      } catch (e) {}

      await fetch('/api/fcm-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: this.deviceId,
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

  setTiming(stage, enabled) {
    if (!this.preferences.lead_time) {
      this.preferences.lead_time = { '15': false, '5': true };
    }
    this.preferences.lead_time[stage] = !!enabled;
    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  toggleCrop(cropKey, enabled) {
    if (!Array.isArray(this.preferences.farming_crops)) {
      this.preferences.farming_crops = [...ALL_CROPS];
    }
    if (enabled) {
      if (!this.preferences.farming_crops.includes(cropKey)) {
        this.preferences.farming_crops.push(cropKey);
      }
    } else {
      this.preferences.farming_crops = this.preferences.farming_crops.filter(c => c !== cropKey);
    }
    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  selectAllCrops(select) {
    this.preferences.farming_crops = select ? [...ALL_CROPS] : [];
    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  toggleZooPetRarity(petKey, rarity) {
    if (!this.preferences.zoo_pets) {
      this.preferences.zoo_pets = createDefaultZooPets();
    }
    const currentList = Array.isArray(this.preferences.zoo_pets[petKey])
      ? this.preferences.zoo_pets[petKey]
      : [...ALL_RARITIES];

    if (currentList.includes(rarity)) {
      this.preferences.zoo_pets[petKey] = currentList.filter(r => r !== rarity);
    } else {
      this.preferences.zoo_pets[petKey] = [...currentList, rarity];
    }

    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  toggleZooPetAll(petKey) {
    if (!this.preferences.zoo_pets) {
      this.preferences.zoo_pets = createDefaultZooPets();
    }
    const currentList = Array.isArray(this.preferences.zoo_pets[petKey])
      ? this.preferences.zoo_pets[petKey]
      : [];

    // If already has all rarities, clear; otherwise select all
    if (currentList.length === ALL_RARITIES.length) {
      this.preferences.zoo_pets[petKey] = [];
    } else {
      this.preferences.zoo_pets[petKey] = [...ALL_RARITIES];
    }

    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  setZooBulk(mode) {
    if (!this.preferences.zoo_pets) {
      this.preferences.zoo_pets = createDefaultZooPets();
    }
    ALL_ZOO_PETS.forEach(petKey => {
      if (mode === 'all') {
        this.preferences.zoo_pets[petKey] = [...ALL_RARITIES];
      } else if (mode === 'legendary') {
        this.preferences.zoo_pets[petKey] = ['LEGENDARY'];
      } else if (mode === 'epic_plus') {
        this.preferences.zoo_pets[petKey] = ['EPIC', 'LEGENDARY'];
      } else if (mode === 'clear') {
        this.preferences.zoo_pets[petKey] = [];
      }
    });

    this.savePreferences();
    this.syncPreferenceInputs();
    if (this.token) {
      this.syncTokenWithBackend(this.token);
    }
  }

  renderCropChips() {
    const container = document.getElementById('fcm-crop-chips-container');
    if (!container) return;

    const userCrops = Array.isArray(this.preferences.farming_crops)
      ? this.preferences.farming_crops
      : ALL_CROPS;

    container.innerHTML = ALL_CROPS.map(cropKey => {
      const meta = CROP_METADATA[cropKey] || { name: cropKey, icon: '' };
      const isChecked = userCrops.includes(cropKey);
      return `
        <label class="farming-filter fcm-crop-chip ${isChecked ? 'active' : ''}" title="${meta.name}">
          <input type="checkbox" id="fcm-crop-${cropKey}" value="${cropKey}" ${isChecked ? 'checked' : ''} onchange="window.SkyCalendarFCM && window.SkyCalendarFCM.toggleCrop('${cropKey}', this.checked)" />
          <span class="crop-icon"><img src="${meta.icon}" alt="${meta.name}" style="height:18px; width:auto; vertical-align:middle;" /></span>
          <span class="crop-name">${meta.name}</span>
        </label>
      `;
    }).join('');
  }

  renderZooPets() {
    const container = document.getElementById('fcm-zoo-container');
    if (!container) return;

    const zooPets = this.preferences.zoo_pets || createDefaultZooPets();

    container.innerHTML = ALL_ZOO_PETS.map(petKey => {
      const petMeta = ZOO_PET_METADATA[petKey] || { name: petKey, icon: '' };
      const petRarities = Array.isArray(zooPets[petKey]) ? zooPets[petKey] : [];
      const isAnyActive = petRarities.length > 0;

      const rarityButtons = ALL_RARITIES.map(rarity => {
        const rMeta = RARITY_METADATA[rarity];
        const isChecked = petRarities.includes(rarity);
        const rarityClass = rarity.toLowerCase();
        return `
          <button 
            type="button" 
            class="fcm-rarity-chip ${rarityClass} ${isChecked ? 'active' : ''}" 
            title="${petMeta.name} (${rMeta.name}) - Click to toggle"
            onclick="window.SkyCalendarFCM && window.SkyCalendarFCM.toggleZooPetRarity('${petKey}', '${rarity}')">
            ${rMeta.name}
          </button>
        `;
      }).join('');

      return `
        <div class="fcm-zoo-row ${isAnyActive ? 'active' : 'inactive'}">
          <div class="fcm-zoo-pet-info" onclick="window.SkyCalendarFCM && window.SkyCalendarFCM.toggleZooPetAll('${petKey}')" title="Click to toggle all rarities for ${petMeta.name}">
            <img src="${petMeta.icon}" alt="${petMeta.name}" class="fcm-zoo-pet-icon" onerror="this.style.display='none'" />
            <span class="fcm-zoo-pet-name">${petMeta.name}</span>
            <span class="fcm-zoo-pet-count">${petRarities.length}/${ALL_RARITIES.length}</span>
          </div>
          <div class="fcm-zoo-rarity-group">
            ${rarityButtons}
          </div>
        </div>
      `;
    }).join('');
  }

  syncPreferenceInputs() {
    // 1. Sync event switches
    Object.keys(this.preferences).forEach(eventId => {
      const checkbox = document.getElementById(`fcm-pref-${eventId}`);
      if (checkbox) {
        checkbox.checked = this.preferences[eventId];
      }
    });

    // 2. Sync lead timing checkboxes
    const leadPrefs = this.preferences.lead_time || { '15': false, '5': true };
    const timing15 = document.getElementById('fcm-timing-15');
    if (timing15) timing15.checked = !!leadPrefs['15'];
    const timing5 = document.getElementById('fcm-timing-5');
    if (timing5) timing5.checked = leadPrefs['5'] !== false;

    // 3. Sync crop checkboxes
    const userCrops = Array.isArray(this.preferences.farming_crops)
      ? this.preferences.farming_crops
      : ALL_CROPS;
    ALL_CROPS.forEach(cropKey => {
      const input = document.getElementById(`fcm-crop-${cropKey}`);
      if (input) {
        input.checked = userCrops.includes(cropKey);
      }
    });

    // 4. Update crop status badge text
    const badge = document.getElementById('fcm-crops-count-badge');
    if (badge) {
      const count = userCrops.length;
      if (count === 10) {
        badge.textContent = 'All 10 Crops Active';
        badge.className = 'neo-badge green';
      } else if (count === 0) {
        badge.textContent = 'No Crops (Contests Paused)';
        badge.className = 'neo-badge red';
      } else {
        badge.textContent = `${count} of 10 Crops Selected`;
        badge.className = 'neo-badge cyan';
      }
    }

    // 5. Update Travelling Zoo status badge text
    const zooBadge = document.getElementById('fcm-zoo-count-badge');
    if (zooBadge) {
      const zooPets = this.preferences.zoo_pets || createDefaultZooPets();
      let totalActive = 0;
      const totalMax = ALL_ZOO_PETS.length * ALL_RARITIES.length; // 25
      let legOnly = true;

      ALL_ZOO_PETS.forEach(k => {
        const rArr = Array.isArray(zooPets[k]) ? zooPets[k] : [];
        totalActive += rArr.length;
        if (rArr.length > 0 && (rArr.length !== 1 || rArr[0] !== 'LEGENDARY')) {
          legOnly = false;
        }
      });

      if (totalActive === totalMax) {
        zooBadge.textContent = 'All 5 Pets Active';
        zooBadge.className = 'neo-badge green';
      } else if (totalActive === 0) {
        zooBadge.textContent = 'No Pets (Alerts Paused)';
        zooBadge.className = 'neo-badge red';
      } else if (legOnly && totalActive > 0) {
        zooBadge.textContent = 'Legendary Only';
        zooBadge.className = 'neo-badge yellow';
      } else {
        zooBadge.textContent = `${totalActive}/25 Rarities Active`;
        zooBadge.className = 'neo-badge cyan';
      }
    }

    // Refresh dynamically rendered chip lists
    this.renderCropChips();
    this.renderZooPets();

    const tokenInput = document.getElementById('fcm-token-display');
    if (tokenInput) {
      tokenInput.value = this.token || 'Notifications not enabled yet';
    }

    const deviceIdDisplay = document.getElementById('fcm-device-id-display');
    if (deviceIdDisplay) {
      deviceIdDisplay.textContent = this.deviceId ? this.deviceId.slice(0, 16) + '...' : 'None';
      deviceIdDisplay.title = this.deviceId || '';
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

        const lead15Enabled = this.preferences.lead_time && this.preferences.lead_time['15'];
        const lead5Enabled = this.preferences.lead_time ? (this.preferences.lead_time['5'] !== false) : true;

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

          // Crop filter for Ethan's Farming Contest
          if (eventKey === 'farming' && ev.crops && Array.isArray(ev.crops)) {
            const userCrops = this.preferences.farming_crops;
            if (Array.isArray(userCrops)) {
              if (userCrops.length === 0) return;
              if (userCrops.length < 10) {
                const matches = ev.crops.some(c => userCrops.includes(c));
                if (!matches) return;
              }
            }
          }

          // Pet & Rarity filter for Travelling Zoo
          if (eventKey === 'zoo' && ev.pets && Array.isArray(ev.pets)) {
            const userZooPets = this.preferences.zoo_pets;
            if (userZooPets && typeof userZooPets === 'object') {
              const hasMatchingPet = ev.pets.some(p => {
                const petName = (p.name || '').toLowerCase();
                const petRarity = (p.rarity || '').toUpperCase();
                const allowedRarities = userZooPets[petName];
                if (!Array.isArray(allowedRarities) || allowedRarities.length === 0) return false;
                return allowedRarities.includes(petRarity);
              });
              if (!hasMatchingPet) return;
            }
          }

          // Evaluate 15-minute lead stage (between 10m and 16m away)
          if (lead15Enabled && ev.msUntil > (10 * 60 * 1000) && ev.msUntil <= (16 * 60 * 1000)) {
            this.triggerLocalAlert(eventKey, displayName, ev, 15);
          }

          // Evaluate 5-minute lead stage (between 0m and 6m away)
          if (lead5Enabled && ev.msUntil > 0 && ev.msUntil <= (6 * 60 * 1000)) {
            this.triggerLocalAlert(eventKey, displayName, ev, 5);
          }
        });
      } catch (err) {
        console.debug('[FCM] Event check loop exception:', err);
      }
    };

    setTimeout(checkEvents, 2000);
    this.monitorInterval = setInterval(checkEvents, 20000);
  }

  triggerLocalAlert(eventKey, displayName, ev, leadMinutes) {
    const uniqueId = `${eventKey}_${ev.nextDay}_${leadMinutes}m`;
    if (this.alertedEvents.has(uniqueId)) return;

    this.alertedEvents.add(uniqueId);
    sessionStorage.setItem('cmc_alerted_events', JSON.stringify(Array.from(this.alertedEvents)));

    let extraText = '';
    if (eventKey === 'farming' && ev.crops && ev.crops.length) {
      const formattedCrops = ev.crops.map(c => c.charAt(0) + c.slice(1).toLowerCase().replace('_', ' ')).join(', ');
      extraText = ` Contested crops: ${formattedCrops}.`;
    } else if (eventKey === 'zoo' && ev.pets && ev.pets.length) {
      const formattedPets = ev.pets.map(p => {
        const r = p.rarity ? (p.rarity.charAt(0) + p.rarity.slice(1).toLowerCase()) : '';
        const n = p.name ? (p.name.charAt(0).toUpperCase() + p.name.slice(1)) : '';
        return `${r} ${n}`.trim();
      }).join(', ');
      extraText = ` Oringo's Pets: ${formattedPets}.`;
    }
    const bodyText = `Starting in ~${leadMinutes} minutes!${extraText}`;
    const iconUrl = eventKey === 'farming'
      ? '/assets/farming/Farm-o-Matic.webp'
      : (eventKey === 'zoo' ? '/img/pets/300px-Lion_Pet.webp' : '/assets/cmc-icon.png');
    const symbol = eventKey === 'farming' ? '🌾' : (eventKey === 'zoo' ? '🦁' : '🔔');

    // 1. Show Foreground Neo-Brutalist toast
    this.showToast(`${symbol} ${displayName}`, bodyText, iconUrl);

    // 2. Trigger System / Service Worker Notification
    if (this.swRegistration && 'showNotification' in this.swRegistration) {
      this.swRegistration.showNotification(`${symbol} ${displayName} Alert!`, {
        body: bodyText,
        icon: iconUrl,
        badge: '/assets/cmc-icon.png',
        tag: uniqueId,
        vibrate: [200, 100, 200],
        data: { url: '/skycalendar.html' }
      }).catch(err => {
        console.warn('[FCM] OS-level notification blocked:', err.message);
      });
    } else {
      try {
        new Notification(`${symbol} ${displayName} Alert!`, {
          body: bodyText,
          icon: iconUrl
        });
      } catch (e) {}
    }
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

    const unsubBtn = document.getElementById('fcm-unsubscribe-btn');
    if (unsubBtn) {
      unsubBtn.style.display = (status === 'active' || !!this.token) ? 'inline-flex' : 'none';
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
    fcmController.renderCropChips();
    fcmController.renderZooPets();
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
