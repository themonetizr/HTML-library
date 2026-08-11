"use strict";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const DEFAULT_BRAND_POSITION = { x: 0.05, y: 0.16 };

const PRESET_GAMES = [
  {
    id: "candy-crush",
    name: "Candy Crush Saga",
    video: "https://cdn.monetizr.com/adviewer/game_background.mp4",
  },
  {
    id: "landslice",
    name: "Landslice",
    image: "https://cdn.monetizr.com/adviewer/600x1300bb.webp",
  },
  {
    id: "subway-surfers",
    name: "Subway Surfers",
    image: "https://cdn.monetizr.com/adviewer/600x1300bb_subway_surfers.webp",
  },
];

const state = {
  backgroundMode: "games",
  backgroundValue: "",
  gameId: "candy-crush",
  logoValue: "",
  brandName: "Your brand",
  videoMode: "upload",
  videoUrl: "",
  videoReady: false,
  theme: "dark",
  brandPosition: { ...DEFAULT_BRAND_POSITION },
  brandDrag: null,
  suppressBrandClick: false,
  objectUrls: new Set(),
  statusTimer: null,
  countdownFrame: null,
  modalCloseTimer: null,
};

const elements = {
  backgroundTabs: document.querySelectorAll("[data-background-tab]"),
  backgroundPanels: document.querySelectorAll("[data-background-panel]"),
  videoTabs: document.querySelectorAll("[data-video-tab]"),
  videoPanels: document.querySelectorAll("[data-video-panel]"),
  gameBackground: document.querySelector("#game-background"),
  gameBackgroundName: document.querySelector("#game-background-name"),
  backgroundFile: document.querySelector("#background-file"),
  backgroundFileName: document.querySelector("#background-file-name"),
  backgroundFileError: document.querySelector("#background-file-error"),
  backgroundDropZone: document.querySelector("#background-drop-zone"),
  browseBackground: document.querySelector("#browse-background"),
  backgroundPreview: document.querySelector("#background-preview"),
  backgroundVideoPreview: document.querySelector("#background-video-preview"),
  emptyPreview: document.querySelector("#empty-preview"),
  logoFile: document.querySelector("#logo-file"),
  logoFileName: document.querySelector("#logo-file-name"),
  logoFileError: document.querySelector("#logo-file-error"),
  logoDropZone: document.querySelector("#logo-drop-zone"),
  browseLogo: document.querySelector("#browse-logo"),
  brandButton: document.querySelector("#brand-button"),
  brandLogo: document.querySelector("#brand-logo"),
  brandName: document.querySelector("#brand-name"),
  videoUrlForm: document.querySelector("[data-video-panel='url']"),
  videoUrl: document.querySelector("#video-url"),
  videoUrlError: document.querySelector("#video-url-error"),
  videoFile: document.querySelector("#video-file"),
  videoFileName: document.querySelector("#video-file-name"),
  videoFileError: document.querySelector("#video-file-error"),
  videoRequiredMessage: document.querySelector("#video-required-message"),
  videoPreview: document.querySelector("#video-preview"),
  videoPlayer: document.querySelector("#video-player"),
  playerClose: document.querySelector("#player-close"),
  videoCountdown: document.querySelector("#video-countdown"),
  wonModal: document.querySelector("#won-modal"),
  wonModalCard: document.querySelector("#won-modal-card"),
  wonModalClose: document.querySelector("#won-modal-close"),
  wonModalLogo: document.querySelector("#won-modal-logo"),
  wonModalBrand: document.querySelector("#won-modal-brand"),
  claimReward: document.querySelector("#claim-reward"),
  deviceSelect: document.querySelector("#device-select"),
  device: document.querySelector("#device"),
  deviceFrame: document.querySelector("#device-frame"),
  deviceScaler: document.querySelector("#device-scaler"),
  previewStage: document.querySelector("#preview-stage"),
  themeSwitch: document.querySelector("#theme-switch"),
  themeSwitchLabel: document.querySelector(".theme-switch__label"),
  resetPreview: document.querySelector("#reset-preview"),
  status: document.querySelector("#status"),
};

function setActiveTab(tabs, panels, activeValue, tabDataName, panelDataName) {
  tabs.forEach((tab) => {
    tab.setAttribute("aria-selected", String(tab.dataset[tabDataName] === activeValue));
  });
  panels.forEach((panel) => {
    panel.hidden = panel.dataset[panelDataName] !== activeValue;
  });
}

function selectBackgroundMode(mode) {
  state.backgroundMode = mode;
  setActiveTab(
    elements.backgroundTabs,
    elements.backgroundPanels,
    mode,
    "backgroundTab",
    "backgroundPanel",
  );
  if (mode === "games") selectGame(elements.gameBackground.value);
}

function clearVideo() {
  window.cancelAnimationFrame(state.countdownFrame);
  elements.videoPreview.pause();
  elements.videoPreview.removeAttribute("src");
  elements.videoPreview.load();
  elements.videoPreview.hidden = true;
  elements.videoPlayer.hidden = true;
  elements.videoPlayer.style.setProperty("--video-progress", "0%");
  elements.videoCountdown.textContent = "0";
  elements.videoCountdown.hidden = false;
  elements.playerClose.hidden = true;
  hideWonModal();
  state.videoUrl = "";
  state.videoReady = false;
  updateBrandButton();
}

function updateVideoProgress() {
  const duration = elements.videoPreview.duration;
  const currentTime = elements.videoPreview.currentTime;
  const closeAvailable = Number.isFinite(duration) && duration > 15 && currentTime >= 15;
  const countdownLimit = Number.isFinite(duration) ? Math.min(duration, 15) : 0;
  const remaining = Math.max(0, Math.ceil(countdownLimit - currentTime));
  const progress = Number.isFinite(duration) && duration > 0
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;
  elements.videoCountdown.textContent = String(remaining);
  elements.videoCountdown.hidden = closeAvailable;
  elements.playerClose.hidden = !closeAvailable;
  elements.videoPlayer.style.setProperty("--video-progress", `${progress}%`);
}

function runVideoProgress() {
  window.cancelAnimationFrame(state.countdownFrame);
  updateVideoProgress();
  if (!elements.videoPreview.paused && !elements.videoPreview.ended) {
    state.countdownFrame = window.requestAnimationFrame(runVideoProgress);
  }
}

function hideWonModal() {
  window.clearTimeout(state.modalCloseTimer);
  elements.wonModal.classList.remove("show", "exiting", "exit-go");
  elements.wonModal.setAttribute("aria-hidden", "true");
}

function openWonModal() {
  elements.wonModal.classList.add("show");
  elements.wonModal.setAttribute("aria-hidden", "false");
  elements.wonModalClose.focus({ preventScroll: true });
}

function closeWonModal() {
  if (!elements.wonModal.classList.contains("show") || elements.wonModal.classList.contains("exiting")) return;
  elements.wonModal.classList.add("exiting");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => elements.wonModal.classList.add("exit-go"));
  });
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    hideWonModal();
    updateBrandButton();
    elements.brandButton.focus({ preventScroll: true });
  };
  const onTransitionEnd = (event) => {
    if (event.target !== elements.wonModalCard || event.propertyName !== "transform") return;
    elements.wonModalCard.removeEventListener("transitionend", onTransitionEnd);
    finish();
  };
  elements.wonModalCard.addEventListener("transitionend", onTransitionEnd);
  state.modalCloseTimer = window.setTimeout(finish, 1500);
}

function closePlayer() {
  window.cancelAnimationFrame(state.countdownFrame);
  elements.videoPreview.pause();
  elements.videoPreview.currentTime = 0;
  elements.videoPreview.hidden = true;
  elements.videoPlayer.hidden = true;
  elements.videoPlayer.style.setProperty("--video-progress", "0%");
  elements.videoCountdown.textContent = "0";
  elements.videoCountdown.hidden = false;
  elements.playerClose.hidden = true;
  updateBrandButton();
}

function selectVideoMode(mode) {
  if (state.videoMode !== mode) clearVideo();
  state.videoMode = mode;
  setActiveTab(elements.videoTabs, elements.videoPanels, mode, "videoTab", "videoPanel");
  elements.videoRequiredMessage.textContent = "A video URL or uploaded video is required.";
}

function showStatus(message) {
  window.clearTimeout(state.statusTimer);
  elements.status.textContent = message;
  elements.status.hidden = false;
  state.statusTimer = window.setTimeout(() => {
    elements.status.hidden = true;
  }, 2800);
}

function isPublicUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

function showBackground(sourceUrl, type = "image") {
  state.backgroundValue = sourceUrl;
  const isVideo = type === "video";

  if (isVideo) {
    elements.backgroundPreview.hidden = true;
    elements.backgroundPreview.removeAttribute("src");
    elements.backgroundVideoPreview.src = sourceUrl;
    elements.backgroundVideoPreview.hidden = false;
    elements.backgroundVideoPreview.load();
    elements.backgroundVideoPreview.play().catch(() => {
      showStatus("The selected background video could not be played.");
    });
  } else {
    elements.backgroundVideoPreview.pause();
    elements.backgroundVideoPreview.hidden = true;
    elements.backgroundVideoPreview.removeAttribute("src");
    elements.backgroundVideoPreview.load();
    elements.backgroundPreview.src = sourceUrl;
    elements.backgroundPreview.hidden = false;
  }
  elements.emptyPreview.hidden = true;
}

function findGame(gameId) {
  return PRESET_GAMES.find((game) => game.id === gameId) || PRESET_GAMES[0];
}

function selectGame(gameId) {
  const game = findGame(gameId);
  state.backgroundMode = "games";
  state.gameId = game.id;
  elements.gameBackground.value = game.id;
  const type = game.video ? "video" : "image";
  elements.gameBackgroundName.textContent = `${game.name}${type === "video" ? " video" : ""} background`;
  showBackground(game.video || game.image, type);
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function acceptBackgroundFile(file) {
  elements.backgroundFileError.textContent = "";
  if (!file) return;

  const extension = file.name.toLowerCase().split(".").pop();
  const allowedType = ["image/jpeg", "image/png", "image/gif", "video/mp4"].includes(file.type);
  const allowedExtension = ["jpg", "jpeg", "png", "gif", "mp4"].includes(extension);
  if (!allowedType && !allowedExtension) {
    elements.backgroundFileError.textContent = "Choose a JPEG, PNG, GIF, or MP4 file.";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    elements.backgroundFileError.textContent = "The background file exceeds the 10 MB limit.";
    return;
  }

  try {
    const isVideo = file.type === "video/mp4" || extension === "mp4";
    const backgroundUrl = isVideo ? URL.createObjectURL(file) : await readImage(file);
    if (isVideo) state.objectUrls.add(backgroundUrl);
    state.backgroundMode = "upload";
    state.gameId = "";
    elements.backgroundFileName.textContent = file.name;
    showBackground(backgroundUrl, isVideo ? "video" : "image");
  } catch (_error) {
    elements.backgroundFileError.textContent = "The background file could not be read.";
  }
}

function updateBrandButton() {
  const ready = Boolean(state.logoValue && state.videoReady);
  elements.brandButton.hidden = !state.logoValue;
  elements.brandButton.setAttribute("aria-disabled", String(!ready));
  if (state.logoValue) window.requestAnimationFrame(applyBrandButtonPosition);
}

function updateBrandName(value) {
  state.brandName = value.trim() || "Your brand";
  elements.wonModalBrand.textContent = state.brandName;
}

function brandButtonBounds() {
  const inset = Number(selectedDevice().dataset.inset);
  const minX = inset;
  const minY = inset;
  const maxX = Math.max(minX, elements.device.offsetWidth - inset - elements.brandButton.offsetWidth);
  const maxY = Math.max(minY, elements.device.offsetHeight - inset - elements.brandButton.offsetHeight);
  return { minX, minY, maxX, maxY };
}

function applyBrandButtonPosition() {
  if (elements.brandButton.hidden) return;
  const bounds = brandButtonBounds();
  const left = bounds.minX + state.brandPosition.x * (bounds.maxX - bounds.minX);
  const top = bounds.minY + state.brandPosition.y * (bounds.maxY - bounds.minY);
  elements.brandButton.style.left = `${left}px`;
  elements.brandButton.style.top = `${top}px`;
}

function moveBrandButton(event) {
  if (!state.brandDrag || state.brandDrag.pointerId !== event.pointerId) return;
  const deviceRect = elements.device.getBoundingClientRect();
  const scale = deviceRect.width / elements.device.offsetWidth;
  if (!scale) return;

  const deltaX = (event.clientX - state.brandDrag.startClientX) / scale;
  const deltaY = (event.clientY - state.brandDrag.startClientY) / scale;
  if (Math.hypot(event.clientX - state.brandDrag.startClientX, event.clientY - state.brandDrag.startClientY) > 4) {
    state.brandDrag.moved = true;
  }

  const bounds = brandButtonBounds();
  const left = Math.min(bounds.maxX, Math.max(bounds.minX, state.brandDrag.startLeft + deltaX));
  const top = Math.min(bounds.maxY, Math.max(bounds.minY, state.brandDrag.startTop + deltaY));
  const horizontalRange = bounds.maxX - bounds.minX;
  const verticalRange = bounds.maxY - bounds.minY;
  state.brandPosition.x = horizontalRange ? (left - bounds.minX) / horizontalRange : 0;
  state.brandPosition.y = verticalRange ? (top - bounds.minY) / verticalRange : 0;
  elements.brandButton.style.left = `${left}px`;
  elements.brandButton.style.top = `${top}px`;
  event.preventDefault();
}

function finishBrandDrag(event) {
  if (!state.brandDrag || state.brandDrag.pointerId !== event.pointerId) return;
  state.suppressBrandClick = state.brandDrag.moved;
  state.brandDrag = null;
  elements.brandButton.classList.remove("is-dragging");
  try {
    elements.brandButton.releasePointerCapture(event.pointerId);
  } catch (_error) {
    // Synthetic events and older browsers may not own pointer capture.
  }
}

async function acceptLogoFile(file) {
  elements.logoFileError.textContent = "";
  if (!file) return;

  const extension = file.name.toLowerCase().split(".").pop();
  const allowedType = ["image/jpeg", "image/png"].includes(file.type);
  const allowedExtension = ["jpg", "jpeg", "png"].includes(extension);
  if (!allowedType && !allowedExtension) {
    elements.logoFileError.textContent = "Choose a JPEG or PNG logo.";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    elements.logoFileError.textContent = "The logo exceeds the 10 MB limit.";
    return;
  }

  try {
    state.logoValue = await readImage(file);
    elements.logoFileName.textContent = file.name;
    elements.brandLogo.src = state.logoValue;
    elements.wonModalLogo.src = state.logoValue;
    updateBrandButton();
  } catch (_error) {
    elements.logoFileError.textContent = "The logo could not be read.";
  }
}

function revokeObjectUrls() {
  state.objectUrls.forEach((url) => URL.revokeObjectURL(url));
  state.objectUrls.clear();
}

function previewVideo(value, objectUrl = false) {
  if (!value) return;
  clearVideo();
  if (objectUrl) state.objectUrls.add(value);
  state.videoUrl = value;
  state.videoReady = true;
  elements.videoPreview.src = value;
  elements.videoPreview.hidden = true;
  elements.videoRequiredMessage.textContent = "Video ready. Click the on-screen reward button to play.";
  updateBrandButton();
}

function selectedDevice() {
  return elements.deviceSelect.selectedOptions[0];
}

function setTheme(theme, persist = true) {
  const resolvedTheme = theme === "light" ? "light" : "dark";
  state.theme = resolvedTheme;
  document.documentElement.dataset.theme = resolvedTheme;
  const isLight = resolvedTheme === "light";
  elements.themeSwitch.setAttribute("aria-checked", String(isLight));
  elements.themeSwitch.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
  elements.themeSwitchLabel.textContent = isLight ? "Light" : "Dark";
  if (persist) {
    try {
      window.localStorage.setItem("ad-viewer-theme", resolvedTheme);
    } catch (_error) {
      // The theme still works when browser storage is unavailable.
    }
  }
}

function initialTheme() {
  try {
    const savedTheme = window.localStorage.getItem("ad-viewer-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  } catch (_error) {
    // Fall through to the design-system dark default.
  }
  return "dark";
}

function updateDevice() {
  const option = selectedDevice();
  const portraitWidth = Number(option.dataset.width);
  const portraitHeight = Number(option.dataset.height);
  const width = portraitWidth;
  const height = portraitHeight;
  const inset = Number(option.dataset.inset);
  const screenRadius = Number(option.dataset.radius);
  const availableWidth = Math.max(220, elements.previewStage.clientWidth - 70);
  const availableHeight = Math.max(300, elements.previewStage.clientHeight - 70);
  const scale = Math.min(1, availableWidth / width, availableHeight / height);

  elements.device.style.setProperty("--device-width", `${width}px`);
  elements.device.style.setProperty("--device-height", `${height}px`);
  elements.device.style.setProperty("--device-inset", `${inset}px`);
  elements.device.style.setProperty("--device-screen-radius", `${screenRadius}px`);
  elements.device.style.setProperty("--device-scale", String(scale));
  elements.deviceScaler.style.width = `${width * scale}px`;
  elements.deviceScaler.style.height = `${height * scale}px`;
  elements.deviceFrame.src = option.dataset.frame;
  elements.deviceFrame.style.transform = "none";
  applyBrandButtonPosition();
}

function resetPreview() {
  revokeObjectUrls();
  clearVideo();
  state.backgroundMode = "games";
  state.gameId = "candy-crush";
  state.logoValue = "";
  state.brandName = "Your brand";
  state.videoMode = "upload";
  state.brandPosition = { ...DEFAULT_BRAND_POSITION };
  state.brandDrag = null;
  state.suppressBrandClick = false;

  elements.backgroundFile.value = "";
  elements.backgroundFileName.textContent = "";
  elements.backgroundFileError.textContent = "";
  elements.logoFile.value = "";
  elements.logoFileName.textContent = "";
  elements.logoFileError.textContent = "";
  elements.brandLogo.removeAttribute("src");
  elements.wonModalLogo.removeAttribute("src");
  elements.brandName.value = "Your brand";
  elements.wonModalBrand.textContent = "Your brand";
  elements.brandButton.hidden = true;
  elements.brandButton.setAttribute("aria-disabled", "true");
  elements.videoUrl.value = "";
  elements.videoFile.value = "";
  elements.videoFileName.textContent = "";
  elements.videoUrlError.textContent = "";
  elements.videoFileError.textContent = "";
  selectBackgroundMode("games");
  selectGame("candy-crush");
  elements.videoRequiredMessage.textContent = "A video URL or uploaded video is required.";
  selectVideoMode("upload");
  updateDevice();
  showStatus("Preview reset to Candy Crush Saga.");
}

elements.backgroundTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectBackgroundMode(tab.dataset.backgroundTab));
});

elements.gameBackground.addEventListener("change", () => {
  selectGame(elements.gameBackground.value);
});

elements.browseBackground.addEventListener("click", () => elements.backgroundFile.click());
elements.backgroundFile.addEventListener("change", () => {
  acceptBackgroundFile(elements.backgroundFile.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.backgroundDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.backgroundDropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  elements.backgroundDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.backgroundDropZone.classList.remove("is-dragging");
  });
});

elements.backgroundDropZone.addEventListener("drop", (event) => {
  acceptBackgroundFile(event.dataTransfer.files[0]);
});

elements.backgroundPreview.addEventListener("error", () => {
  elements.backgroundPreview.hidden = true;
  elements.emptyPreview.hidden = false;
  showStatus("The selected background could not be loaded.");
});

elements.backgroundVideoPreview.addEventListener("error", () => {
  elements.backgroundVideoPreview.hidden = true;
  elements.emptyPreview.hidden = false;
  showStatus("The selected background video could not be loaded.");
});

elements.browseLogo.addEventListener("click", () => elements.logoFile.click());
elements.logoFile.addEventListener("change", () => {
  acceptLogoFile(elements.logoFile.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.logoDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.logoDropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  elements.logoDropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.logoDropZone.classList.remove("is-dragging");
  });
});

elements.logoDropZone.addEventListener("drop", (event) => {
  acceptLogoFile(event.dataTransfer.files[0]);
});

elements.brandName.addEventListener("input", () => updateBrandName(elements.brandName.value));

elements.videoTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectVideoMode(tab.dataset.videoTab));
});

elements.videoUrlForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = elements.videoUrl.value.trim();
  if (!isPublicUrl(value)) {
    elements.videoUrlError.textContent = "Enter a valid HTTP or HTTPS video URL.";
    return;
  }
  elements.videoUrlError.textContent = "";
  elements.videoFile.value = "";
  elements.videoFileName.textContent = "";
  previewVideo(value);
});

elements.videoFile.addEventListener("change", () => {
  const file = elements.videoFile.files[0];
  elements.videoFileError.textContent = "";
  if (!file) return;
  if (!file.type.startsWith("video/")) {
    elements.videoFileError.textContent = "Choose a supported video file.";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    elements.videoFileError.textContent = "The file exceeds the 10 MB limit.";
    return;
  }
  elements.videoUrl.value = "";
  elements.videoUrlError.textContent = "";
  elements.videoFileName.textContent = file.name;
  previewVideo(URL.createObjectURL(file), true);
});

elements.brandButton.addEventListener("click", () => {
  if (state.suppressBrandClick) {
    state.suppressBrandClick = false;
    return;
  }
  if (!state.logoValue) {
    showStatus("Select a button logo first.");
    return;
  }
  if (!state.videoReady) {
    showStatus("Set a video URL or upload a video first.");
    return;
  }
  elements.videoPreview.hidden = false;
  elements.videoPlayer.hidden = false;
  elements.brandButton.hidden = true;
  elements.videoPreview.muted = false;
  elements.videoPreview.currentTime = 0;
  elements.videoCountdown.hidden = false;
  elements.playerClose.hidden = true;
  updateVideoProgress();
  elements.videoPreview.play().catch(() => {
    closePlayer();
    showStatus("The selected video could not be played.");
  });
});

elements.playerClose.addEventListener("click", closePlayer);
elements.videoPreview.addEventListener("loadedmetadata", updateVideoProgress);
elements.videoPreview.addEventListener("play", runVideoProgress);
elements.videoPreview.addEventListener("pause", () => {
  window.cancelAnimationFrame(state.countdownFrame);
  updateVideoProgress();
});
elements.wonModalClose.addEventListener("click", closeWonModal);
elements.claimReward.addEventListener("click", closeWonModal);

elements.brandButton.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  state.brandDrag = {
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startLeft: elements.brandButton.offsetLeft,
    startTop: elements.brandButton.offsetTop,
    moved: false,
  };
  elements.brandButton.classList.add("is-dragging");
  try {
    elements.brandButton.setPointerCapture(event.pointerId);
  } catch (_error) {
    // Synthetic events and older browsers may not support pointer capture.
  }
});

elements.brandButton.addEventListener("dragstart", (event) => event.preventDefault());
document.addEventListener("pointermove", moveBrandButton, { passive: false });
document.addEventListener("pointerup", finishBrandDrag);
document.addEventListener("pointercancel", finishBrandDrag);

elements.videoPreview.addEventListener("ended", () => {
  window.cancelAnimationFrame(state.countdownFrame);
  elements.videoCountdown.textContent = "0";
  elements.videoPlayer.style.setProperty("--video-progress", "100%");
  window.requestAnimationFrame(() => {
    elements.videoPreview.hidden = true;
    elements.videoPlayer.hidden = true;
    elements.videoPreview.currentTime = 0;
    openWonModal();
  });
});

elements.deviceSelect.addEventListener("change", updateDevice);
elements.themeSwitch.addEventListener("click", () => setTheme(state.theme === "dark" ? "light" : "dark"));
elements.resetPreview.addEventListener("click", resetPreview);

window.addEventListener("resize", updateDevice);
window.addEventListener("beforeunload", revokeObjectUrls);

selectGame("candy-crush");
setTheme(initialTheme(), false);
updateDevice();
