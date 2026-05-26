(function () {
  if (window.__fontSizeAdjusterContentLoaded) {
    return;
  }

  window.__fontSizeAdjusterContentLoaded = true;

  const storage = chrome.fontSizeAdjusterStorage;
  const STYLE_ID = "__font_size_adjuster_style__";
  const ACTIVE_CLASS = "__font_size_adjuster_enabled__";
  const ORIGINAL_SIZE_ATTR = "data-font-size-adjuster-original-size";
  const ORIGINAL_INLINE_STYLE_ATTR = "data-font-size-adjuster-original-inline-style";
  const LEGACY_BASE_SIZE_PROP = "--font-size-adjuster-base-size";
  const LEGACY_SCALE_PROP = "--font-size-adjuster-scale";

  let currentScale = storage.DEFAULT_SCALE;
  let remembered = false;
  let observer = null;

  function canRunOnPage() {
    return Boolean(storage.getCurrentSiteKey());
  }

  function ensureStyle() {
    const existingStyle = document.getElementById(STYLE_ID);

    if (existingStyle && existingStyle.dataset.version === "2") {
      return;
    }

    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.dataset.version = "2";
    style.textContent = `
html.${ACTIVE_CLASS} {
  text-size-adjust: 100% !important;
  -webkit-text-size-adjust: 100% !important;
}
`;

    (document.head || document.documentElement).appendChild(style);
  }

  function clearLegacyState() {
    const root = document.documentElement;

    root.style.removeProperty(LEGACY_BASE_SIZE_PROP);
    root.style.removeProperty(LEGACY_SCALE_PROP);
  }

  function shouldSkipElement(element) {
    if (!(element instanceof HTMLElement)) {
      return true;
    }

    if (element.closest("svg, canvas, video, audio, iframe, object, embed, script, style, noscript")) {
      return true;
    }

    return false;
  }

  function hasDirectText(element) {
    if (
      element.matches(
        "input, textarea, select, button, label, a, p, li, dt, dd, th, td, summary, figcaption, caption, h1, h2, h3, h4, h5, h6"
      )
    ) {
      return true;
    }

    return Array.from(element.childNodes).some((node) => (
      node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
    ));
  }

  function getOriginalFontSize(element) {
    const savedSize = element.getAttribute(ORIGINAL_SIZE_ATTR);

    if (savedSize) {
      return Number(savedSize);
    }

    const computedSize = Number.parseFloat(window.getComputedStyle(element).fontSize);

    if (!Number.isFinite(computedSize) || computedSize <= 0) {
      return null;
    }

    element.setAttribute(ORIGINAL_SIZE_ATTR, String(computedSize));
    element.setAttribute(ORIGINAL_INLINE_STYLE_ATTR, element.getAttribute("style") || "");

    return computedSize;
  }

  function applyScaleToElement(element, scale) {
    if (shouldSkipElement(element) || !hasDirectText(element)) {
      return;
    }

    const originalSize = getOriginalFontSize(element);

    if (!originalSize) {
      return;
    }

    element.style.setProperty("font-size", `${Math.round(originalSize * scale * 100) / 100}px`, "important");
  }

  function applyScaleToTree(root, scale) {
    if (!root) {
      return;
    }

    if (root instanceof HTMLElement) {
      applyScaleToElement(root, scale);
    }

    const queryRoot = root.querySelectorAll ? root : document;
    queryRoot.querySelectorAll(
      "body, p, span, a, li, dt, dd, th, td, button, input, textarea, select, label, summary, figcaption, caption, h1, h2, h3, h4, h5, h6, article, section, main, div"
    ).forEach((element) => applyScaleToElement(element, scale));
  }

  function restoreElement(element) {
    if (!(element instanceof HTMLElement) || !element.hasAttribute(ORIGINAL_SIZE_ATTR)) {
      return;
    }

    const originalInlineStyle = element.getAttribute(ORIGINAL_INLINE_STYLE_ATTR) || "";

    if (originalInlineStyle) {
      element.setAttribute("style", originalInlineStyle);
    } else {
      element.removeAttribute("style");
    }

    element.removeAttribute(ORIGINAL_SIZE_ATTR);
    element.removeAttribute(ORIGINAL_INLINE_STYLE_ATTR);
  }

  function restoreAllElements() {
    document.querySelectorAll(`[${ORIGINAL_SIZE_ATTR}]`).forEach(restoreElement);
  }

  function startObserver() {
    if (observer || currentScale === storage.DEFAULT_SCALE || !document.body) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            applyScaleToTree(node, currentScale);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function stopObserver() {
    if (!observer) {
      return;
    }

    observer.disconnect();
    observer = null;
  }

  function applyScale(scale) {
    currentScale = storage.normalizeScale(scale);

    ensureStyle();
    clearLegacyState();

    if (currentScale === storage.DEFAULT_SCALE) {
      resetScale();
      return;
    }

    document.documentElement.classList.add(ACTIVE_CLASS);
    applyScaleToTree(document.body || document.documentElement, currentScale);
    startObserver();
  }

  function resetScale() {
    currentScale = storage.DEFAULT_SCALE;
    stopObserver();
    restoreAllElements();
    clearLegacyState();
    document.documentElement.classList.remove(ACTIVE_CLASS);
  }

  function whenBodyReady(callback) {
    if (document.body) {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }

  async function loadSavedSetting() {
    if (!canRunOnPage()) {
      return;
    }

    const siteKey = storage.getCurrentSiteKey();
    const setting = await storage.getSiteSetting(siteKey);

    remembered = Boolean(setting);

    if (!setting) {
      return;
    }

    whenBodyReady(() => applyScale(setting.scale));
  }

  function getState() {
    return {
      hostname: storage.getCurrentSiteKey(),
      scale: currentScale,
      remembered,
      supported: canRunOnPage()
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message.type !== "string") {
      return false;
    }

    if (!canRunOnPage()) {
      sendResponse(getState());
      return false;
    }

    const siteKey = storage.getCurrentSiteKey();

    if (message.type === "GET_PAGE_STATE") {
      storage.getSiteSetting(siteKey).then((setting) => {
        remembered = Boolean(setting);

        if (setting) {
          currentScale = setting.scale;
        }

        sendResponse(getState());
      });

      return true;
    }

    if (message.type === "APPLY_FONT_SCALE") {
      whenBodyReady(() => applyScale(message.scale));

      const nextRemembered = Boolean(message.remember);
      const persistence = nextRemembered
        ? storage.saveSiteSetting(siteKey, message.scale)
        : storage.removeSiteSetting(siteKey);

      persistence.then(() => {
        remembered = nextRemembered;
        sendResponse(getState());
      });

      return true;
    }

    if (message.type === "RESET_FONT_SCALE") {
      resetScale();

      storage.removeSiteSetting(siteKey).then(() => {
        remembered = false;
        sendResponse(getState());
      });

      return true;
    }

    return false;
  });

  loadSavedSetting();
})();
