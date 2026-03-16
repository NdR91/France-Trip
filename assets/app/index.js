import { FLIGHTS, PARKING_OPTIONS, STAYS, TRIP_META } from "../../data/site-data.js";
import { renderAppView } from "./render.js";
import { loadState, mergeState, persistState } from "./state.js";
import { buildShareUrl, parseUrlState, syncUrlState } from "./url-state.js";
import { copyText, isKeyboardToggle } from "./utils.js";

const datasets = {
  flights: FLIGHTS,
  stays: STAYS,
  parkingOptions: PARKING_OPTIONS,
  tripMeta: TRIP_META,
};

const appElement = document.getElementById("app");
let state = mergeState(loadState(datasets), parseUrlState(window.location.search, datasets), datasets);
let sectionScrollPositions = {};
let shareMessage = "";
let shareTimerId = null;

appElement.addEventListener("click", handleClick);
appElement.addEventListener("keydown", handleKeyDown);
window.addEventListener("popstate", () => {
  state = mergeState(state, parseUrlState(window.location.search, datasets), datasets);
  renderApp();
});

renderApp();

function renderApp() {
  captureSectionScrollPositions();
  appElement.innerHTML = renderAppView({ state, shareMessage, datasets });
  syncCollapsedSections();
  restoreSectionScrollPositions();
  persistState(state);
  syncUrlState(state);
  updateMeta();
}

function handleClick(event) {
  const target = event.target;

  const toggle = target.closest("[data-section-toggle]");
  if (toggle) {
    state = mergeState(state, {
      collapsed: {
        [toggle.dataset.sectionToggle]: !state.collapsed[toggle.dataset.sectionToggle],
      },
    }, datasets);
    renderApp();
    return;
  }

  if (target.closest("a")) {
    return;
  }

  const flightCard = target.closest("[data-flight-id]");
  if (flightCard) {
    state = toggleSetItem(state, "flights", flightCard.dataset.flightId);
    renderApp();
    return;
  }

  const stayCard = target.closest("[data-stay-id]");
  if (stayCard) {
    state = toggleSetItem(state, "stays", stayCard.dataset.stayId);
    renderApp();
    return;
  }

  const parkingCard = target.closest("[data-parking-id]");
  if (parkingCard) {
    if (parkingCard.dataset.parkingDisabled === "true") {
      return;
    }
    state = mergeState(state, { parking: parkingCard.dataset.parkingId }, datasets);
    renderApp();
    return;
  }

  if (target.closest("[data-select-all]")) {
    state = mergeState(state, {
      flights: FLIGHTS.map((flight) => flight.id),
      stays: STAYS.map((stay) => stay.id),
    }, datasets);
    renderApp();
    return;
  }

  if (target.closest("[data-reset]")) {
    state = mergeState(state, {
      flights: [],
      stays: [],
      parking: "no",
      sortAsc: true,
    }, datasets);
    renderApp();
    return;
  }

  if (target.closest("[data-sort-toggle]")) {
    state = mergeState(state, { sortAsc: !state.sortAsc }, datasets);
    renderApp();
    return;
  }

  const removeChipButton = target.closest("[data-remove-chip]");
  if (removeChipButton) {
    state = removeChip(state, removeChipButton.dataset.removeChipType, removeChipButton.dataset.removeChip);
    renderApp();
    return;
  }

  if (target.closest("[data-share-link]")) {
    shareCurrentSelection();
  }
}

function handleKeyDown(event) {
  const toggle = event.target.closest("[data-section-toggle]");
  if (toggle && isKeyboardToggle(event)) {
    event.preventDefault();
    state = mergeState(state, {
      collapsed: {
        [toggle.dataset.sectionToggle]: !state.collapsed[toggle.dataset.sectionToggle],
      },
    }, datasets);
    renderApp();
    return;
  }

  const card = event.target.closest("[data-flight-id], [data-stay-id], [data-parking-id]");
  if (!card || !isKeyboardToggle(event)) {
    return;
  }

  event.preventDefault();

  if (card.dataset.flightId) {
    state = toggleSetItem(state, "flights", card.dataset.flightId);
  } else if (card.dataset.stayId) {
    state = toggleSetItem(state, "stays", card.dataset.stayId);
  } else if (card.dataset.parkingId) {
    if (card.dataset.parkingDisabled === "true") {
      return;
    }
    state = mergeState(state, { parking: card.dataset.parkingId }, datasets);
  }

  renderApp();
}

async function shareCurrentSelection() {
  try {
    await copyText(buildShareUrl(state));
    setShareMessage("Link copiato");
  } catch {
    setShareMessage("Copia non riuscita");
  }
}

function setShareMessage(message) {
  shareMessage = message;
  if (shareTimerId) {
    window.clearTimeout(shareTimerId);
  }
  renderApp();
  shareTimerId = window.setTimeout(() => {
    shareMessage = "";
    shareTimerId = null;
    renderApp();
  }, 2200);
}

function toggleSetItem(currentState, key, value) {
  const next = new Set(currentState[key]);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return mergeState(currentState, { [key]: [...next] }, datasets);
}

function removeChip(currentState, type, id) {
  const key = type === "flight" ? "flights" : "stays";
  const next = [...currentState[key]].filter((entry) => entry !== id);
  return mergeState(currentState, { [key]: next }, datasets);
}

function getSectionScrollRows() {
  return [...appElement.querySelectorAll("[data-scroll-row]")];
}

function captureSectionScrollPositions() {
  sectionScrollPositions = getSectionScrollRows().reduce((positions, row) => {
    positions[row.dataset.scrollRow] = row.scrollLeft;
    return positions;
  }, {});
}

function restoreSectionScrollPositions() {
  getSectionScrollRows().forEach((row) => {
    const savedPosition = sectionScrollPositions[row.dataset.scrollRow];
    if (typeof savedPosition === "number") {
      row.scrollLeft = savedPosition;
    }
  });
}

function syncCollapsedSections() {
  Object.entries(state.collapsed).forEach(([sectionId, isCollapsed]) => {
    const body = appElement.querySelector(`[data-section-body="${sectionId}"]`);
    const toggle = appElement.querySelector(`[data-section-icon="${sectionId}"]`);

    if (!body || !toggle) {
      return;
    }

    if (isCollapsed) {
      body.classList.add("collapsed");
      body.style.maxHeight = "0";
      toggle.classList.add("collapsed");
      return;
    }

    body.classList.remove("collapsed");
    toggle.classList.remove("collapsed");
    body.style.maxHeight = `${body.scrollHeight}px`;
    window.setTimeout(() => {
      body.style.maxHeight = "none";
    }, 320);
  });
}

function updateMeta() {
  document.title = `France Trip - ${TRIP_META.title}`;
  const titleElement = document.querySelector("h1");
  const subtitleElement = document.querySelector(".subtitle");

  if (titleElement) {
    titleElement.textContent = TRIP_META.title;
  }

  if (subtitleElement) {
    subtitleElement.textContent = TRIP_META.subtitle;
  }
}
