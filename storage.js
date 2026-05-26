(function () {
  const STORAGE_KEY = "siteSettings";
  const DEFAULT_SCALE = 1;
  const MIN_SCALE = 0.8;
  const MAX_SCALE = 2;
  const TWO_PART_PUBLIC_SUFFIXES = new Set([
    "com.cn",
    "net.cn",
    "org.cn",
    "gov.cn",
    "edu.cn",
    "co.uk",
    "org.uk",
    "ac.uk",
    "com.au",
    "net.au",
    "org.au",
    "co.jp",
    "ne.jp",
    "or.jp",
    "com.hk",
    "net.hk",
    "org.hk",
    "com.sg",
    "com.tw"
  ]);

  function normalizeScale(scale) {
    const value = Number(scale);

    if (!Number.isFinite(value)) {
      return DEFAULT_SCALE;
    }

    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value * 100) / 100));
  }

  function getSiteKeyFromUrl(url) {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol === "file:") {
        return `file://${decodeURIComponent(parsedUrl.pathname)}`;
      }

      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return "";
      }

      return getRegistrableDomain(parsedUrl.hostname);
    } catch {
      return "";
    }
  }

  function getRegistrableDomain(hostname) {
    const normalizedHostname = String(hostname || "").toLowerCase().replace(/\.$/, "");

    if (!normalizedHostname || normalizedHostname === "localhost") {
      return normalizedHostname;
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(normalizedHostname) || normalizedHostname.includes(":")) {
      return normalizedHostname;
    }

    const parts = normalizedHostname.split(".").filter(Boolean);

    if (parts.length <= 2) {
      return normalizedHostname;
    }

    const publicSuffix = parts.slice(-2).join(".");

    if (TWO_PART_PUBLIC_SUFFIXES.has(publicSuffix) && parts.length >= 3) {
      return parts.slice(-3).join(".");
    }

    return parts.slice(-2).join(".");
  }

  function getCurrentSiteKey() {
    return getSiteKeyFromUrl(window.location.href);
  }

  function readAllSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [STORAGE_KEY]: {} }, (result) => {
        const settings = result && result[STORAGE_KEY] && typeof result[STORAGE_KEY] === "object"
          ? result[STORAGE_KEY]
          : {};

        resolve(settings);
      });
    });
  }

  function writeAllSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [STORAGE_KEY]: settings }, resolve);
    });
  }

  async function getSiteSetting(siteKey) {
    if (!siteKey) {
      return null;
    }

    const settings = await readAllSettings();
    const setting = settings[siteKey];

    if (!setting || setting.enabled !== true) {
      return null;
    }

    return {
      scale: normalizeScale(setting.scale),
      enabled: true,
      updatedAt: Number(setting.updatedAt) || 0
    };
  }

  async function saveSiteSetting(siteKey, scale) {
    if (!siteKey) {
      return null;
    }

    const settings = await readAllSettings();
    const setting = {
      scale: normalizeScale(scale),
      enabled: true,
      updatedAt: Date.now()
    };

    settings[siteKey] = setting;
    await writeAllSettings(settings);
    return setting;
  }

  async function removeSiteSetting(siteKey) {
    if (!siteKey) {
      return;
    }

    const settings = await readAllSettings();
    delete settings[siteKey];
    await writeAllSettings(settings);
  }

  chrome.fontSizeAdjusterStorage = {
    DEFAULT_SCALE,
    MIN_SCALE,
    MAX_SCALE,
    getCurrentSiteKey,
    getRegistrableDomain,
    getSiteKeyFromUrl,
    getSiteSetting,
    normalizeScale,
    removeSiteSetting,
    saveSiteSetting
  };
})();
