(function () {
  const storage = chrome.fontSizeAdjusterStorage;
  const i18n = chrome.i18n;

  const elements = {
    hostname: document.getElementById("hostname"),
    scaleValue: document.getElementById("scaleValue"),
    scaleRange: document.getElementById("scaleRange"),
    decrease: document.getElementById("decrease"),
    increase: document.getElementById("increase"),
    remember: document.getElementById("remember"),
    reset: document.getElementById("reset"),
    status: document.getElementById("status"),
    controls: [...document.querySelectorAll("button, input")]
  };

  let activeTabId = null;
  let currentHostname = "";
  let debounceId = null;

  function message(key, substitutions) {
    return i18n.getMessage(key, substitutions) || key;
  }

  function localizeDocument() {
    document.documentElement.lang = message("htmlLang");
    document.documentElement.dir = message("textDirection") || "ltr";

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = message(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", message(element.dataset.i18nAriaLabel));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.setAttribute("title", message(element.dataset.i18nTitle));
    });
  }

  function percentToScale(percent) {
    return storage.normalizeScale(Number(percent) / 100);
  }

  function scaleToPercent(scale) {
    return Math.round(storage.normalizeScale(scale) * 100);
  }

  function setStatus(message, isError) {
    elements.status.textContent = message;
    elements.status.classList.toggle("error", Boolean(isError));
  }

  function setDisabled(disabled) {
    elements.controls.forEach((control) => {
      control.disabled = disabled;
    });
  }

  function updateScaleUI(scale) {
    const percent = scaleToPercent(scale);
    elements.scaleRange.value = String(percent);
    elements.scaleValue.value = `${percent}%`;
  }

  function getDisplayName(url, siteKey) {
    try {
      const parsedUrl = new URL(url || "");

      if (parsedUrl.protocol === "file:") {
        const pathParts = decodeURIComponent(parsedUrl.pathname).split("/").filter(Boolean);
        return pathParts[pathParts.length - 1] || message("localFile");
      }
    } catch {
      return siteKey || message("unsupportedPage");
    }

    return siteKey || message("unsupportedPage");
  }

  function sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(activeTabId, message, (response) => {
        const error = chrome.runtime.lastError;

        if (error) {
          reject(error);
          return;
        }

        resolve(response);
      });
    });
  }

  function injectContentScripts() {
    return new Promise((resolve, reject) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTabId },
          files: ["storage.js", "content.js"]
        },
        () => {
          const error = chrome.runtime.lastError;

          if (error) {
            reject(error);
            return;
          }

          resolve();
        }
      );
    });
  }

  async function sendMessageWithInjection(message) {
    try {
      return await sendMessage(message);
    } catch (error) {
      await injectContentScripts();
      return sendMessage(message);
    }
  }

  async function applyCurrentScale(saveImmediately) {
    const scale = percentToScale(elements.scaleRange.value);
    updateScaleUI(scale);

    const response = await sendMessageWithInjection({
      type: "APPLY_FONT_SCALE",
      scale,
      remember: elements.remember.checked
    });

    if (!response || response.supported === false) {
      throw new Error(message("unsupportedPage"));
    }

    if (elements.remember.checked) {
      setStatus(saveImmediately ? message("siteSaved") : message("adjustmentSaved"));
    } else {
      setStatus(message("temporaryOnly"));
    }
  }

  function scheduleApply() {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(() => {
      applyCurrentScale(false).catch(() => {
        setStatus(message("unsupportedPage"), true);
      });
    }, 80);
  }

  async function loadInitialState() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      throw new Error("无法读取当前标签页");
    }

    activeTabId = tab.id;
    currentHostname = storage.getSiteKeyFromUrl(tab.url || "");
    elements.hostname.textContent = getDisplayName(tab.url, currentHostname);

    if (!currentHostname) {
      setDisabled(true);
      setStatus(message("unsupportedPage"), true);
      return;
    }

    const response = await sendMessageWithInjection({ type: "GET_PAGE_STATE" });

    if (!response || response.supported === false) {
      setDisabled(true);
      setStatus(message("unsupportedPage"), true);
      return;
    }

    updateScaleUI(response.scale || storage.DEFAULT_SCALE);
    elements.remember.checked = Boolean(response.remembered);
    setStatus(response.remembered ? message("autoLoadEnabled") : message("temporaryOnly"));
  }

  elements.scaleRange.addEventListener("input", () => {
    updateScaleUI(percentToScale(elements.scaleRange.value));
    scheduleApply();
  });

  elements.decrease.addEventListener("click", () => {
    elements.scaleRange.value = String(Math.max(80, Number(elements.scaleRange.value) - 5));
    scheduleApply();
    updateScaleUI(percentToScale(elements.scaleRange.value));
  });

  elements.increase.addEventListener("click", () => {
    elements.scaleRange.value = String(Math.min(200, Number(elements.scaleRange.value) + 5));
    scheduleApply();
    updateScaleUI(percentToScale(elements.scaleRange.value));
  });

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => {
      elements.scaleRange.value = button.dataset.scale;
      updateScaleUI(percentToScale(elements.scaleRange.value));
      scheduleApply();
    });
  });

  elements.remember.addEventListener("change", () => {
    applyCurrentScale(true).catch(() => {
      setStatus(message("unsupportedPage"), true);
    });
  });

  elements.reset.addEventListener("click", async () => {
    try {
      await sendMessageWithInjection({ type: "RESET_FONT_SCALE" });
      elements.remember.checked = false;
      updateScaleUI(storage.DEFAULT_SCALE);
      setStatus(message("siteReset"));
    } catch {
      setStatus(message("unsupportedPage"), true);
    }
  });

  localizeDocument();

  loadInitialState().catch(() => {
    setDisabled(true);
    elements.hostname.textContent = currentHostname || message("unsupportedPage");
    setStatus(message("unsupportedPage"), true);
  });
})();
