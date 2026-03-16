import { FLIGHTS, PARKING_OPTIONS, STAYS, TRIP_META } from "../data/site-data.js";

const STORAGE_KEY = "france-trip-comparator-state";
let sectionScrollPositions = {};

const state = loadState();

const appElement = document.getElementById("app");

renderApp();
bindSectionToggles();

function loadState() {
  const fallback = {
    flights: new Set(),
    stays: new Set(),
    parking: "no",
    sortAsc: true,
    collapsed: {
      stays: false,
      flights: false,
      parking: false,
    },
  };

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      flights: new Set(parsed.flights || []),
      stays: new Set(parsed.stays || []),
      parking: parsed.parking || "no",
      sortAsc: parsed.sortAsc !== false,
      collapsed: {
        stays: Boolean(parsed.collapsed?.stays),
        flights: Boolean(parsed.collapsed?.flights),
        parking: Boolean(parsed.collapsed?.parking),
      },
    };
  } catch {
    return fallback;
  }
}

function persistState() {
  const serializable = {
    flights: [...state.flights],
    stays: [...state.stays],
    parking: state.parking,
    sortAsc: state.sortAsc,
    collapsed: state.collapsed,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

function renderApp() {
  captureSectionScrollPositions();

  const flightHint = getSelectionHint([...state.flights], FLIGHTS, "flight");
  const stayHint = getSelectionHint([...state.stays], STAYS, "stay");

  appElement.innerHTML = `
    ${renderSelectableSection({
      sectionId: "stays",
      title: "Alloggi - seleziona quelli da confrontare",
      hint: stayHint,
      cards: STAYS.map((stay) => renderStayCard(stay)).join(""),
    })}
    ${renderSelectableSection({
      sectionId: "flights",
      title: "Voli - seleziona quelli da confrontare",
      hint: flightHint,
      cards: FLIGHTS.map((flight) => renderFlightCard(flight)).join(""),
    })}
    ${renderSelectableSection({
      sectionId: "parking",
      title: "Parcheggio BLQ · 5gg × 2 auto",
      hint: "Solo per AF Base / AF Full - tocca per selezionare",
      cards: PARKING_OPTIONS.map((parking) => renderParkingCard(parking)).join(""),
      footnote: "Con EasyJet partite da Milano Linate - parcheggio non necessario a Bologna.",
    })}
    ${renderResultsSection()}
  `;

  syncCollapsedSections();
  bindInteractions();
  restoreSectionScrollPositions();
  persistState();
  updateMeta();
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

function getSectionScrollRows() {
  return [...appElement.querySelectorAll("[data-scroll-row]")];
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

function bindSectionToggles() {
  appElement.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-section-toggle]");
    if (!toggle) {
      return;
    }

    const sectionId = toggle.dataset.sectionToggle;
    state.collapsed[sectionId] = !state.collapsed[sectionId];
    renderApp();
  });

  appElement.addEventListener("keydown", (event) => {
    const toggle = event.target.closest("[data-section-toggle]");
    if (!toggle || !isKeyboardToggle(event)) {
      return;
    }

    event.preventDefault();
    const sectionId = toggle.dataset.sectionToggle;
    state.collapsed[sectionId] = !state.collapsed[sectionId];
    renderApp();
  });
}

function bindInteractions() {
  appElement.querySelectorAll("[data-flight-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }

      toggleSelection(state.flights, element.dataset.flightId);
    });

    element.addEventListener("keydown", (event) => {
      if (!isKeyboardToggle(event)) {
        return;
      }

      event.preventDefault();
      toggleSelection(state.flights, element.dataset.flightId);
    });
  });

  appElement.querySelectorAll("[data-stay-id]").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }

      toggleSelection(state.stays, element.dataset.stayId);
    });

    element.addEventListener("keydown", (event) => {
      if (!isKeyboardToggle(event)) {
        return;
      }

      event.preventDefault();
      toggleSelection(state.stays, element.dataset.stayId);
    });
  });

  appElement.querySelectorAll("[data-parking-id]").forEach((element) => {
    element.addEventListener("click", () => {
      state.parking = element.dataset.parkingId;
      renderApp();
    });

    element.addEventListener("keydown", (event) => {
      if (!isKeyboardToggle(event)) {
        return;
      }

      event.preventDefault();
      state.parking = element.dataset.parkingId;
      renderApp();
    });
  });

  appElement.querySelector("[data-select-all]")?.addEventListener("click", () => {
    state.flights = new Set(FLIGHTS.map((flight) => flight.id));
    state.stays = new Set(STAYS.map((stay) => stay.id));
    renderApp();
  });

  appElement.querySelector("[data-reset]")?.addEventListener("click", resetSelections);
  appElement.querySelector("[data-sort-toggle]")?.addEventListener("click", () => {
    state.sortAsc = !state.sortAsc;
    renderApp();
  });

  appElement.querySelectorAll("[data-remove-chip]").forEach((element) => {
    element.addEventListener("click", () => {
      const type = element.dataset.removeChipType;
      const id = element.dataset.removeChip;
      if (type === "flight") {
        state.flights.delete(id);
      } else {
        state.stays.delete(id);
      }
      renderApp();
    });
  });
}

function resetSelections() {
  state.flights = new Set();
  state.stays = new Set();
  state.parking = "no";
  state.sortAsc = true;
  renderApp();
}

function toggleSelection(collection, key) {
  if (collection.has(key)) {
    collection.delete(key);
  } else {
    collection.add(key);
  }
  renderApp();
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

function renderSelectableSection({ sectionId, title, hint, cards, footnote = "" }) {
  return `
    <section class="section">
      <div class="section-head is-toggle" data-section-toggle="${sectionId}" role="button" tabindex="0" aria-expanded="${String(!state.collapsed[sectionId])}">
        <div class="section-head-left">
          <span class="section-title">${escapeHtml(title)}</span>
          <span class="section-hint">${escapeHtml(hint)}</span>
        </div>
        <span class="section-toggle ${state.collapsed[sectionId] ? "collapsed" : ""}" data-section-icon="${sectionId}">▾</span>
      </div>
      <div class="section-body ${state.collapsed[sectionId] ? "collapsed" : ""}" data-section-body="${sectionId}">
        <div class="scroll-row" data-scroll-row="${sectionId}">${cards}</div>
        ${footnote ? `<p class="footnote">${escapeHtml(footnote)}</p>` : ""}
      </div>
    </section>
  `;
}

function renderStayCard(stay) {
  const selected = state.stays.has(stay.id);
  const statusClass = selected ? "included" : "excluded";
  const statusLabel = selected ? "nel confronto" : "escluso";

  return `
    <article class="sel-card hcard ${selected ? "selected" : "unselected"}" data-stay-id="${stay.id}" aria-pressed="${String(selected)}" role="button" tabindex="0">
      <div class="hcard-media">
        <img class="hcard-image" src="${stay.image}" alt="${escapeHtml(stay.name)}">
        <div class="hcard-media-overlay"></div>
        <div class="hcard-banner" style="background:${stay.bannerColor}"></div>
      </div>
      <span class="check-badge">${checkIcon()}</span>
      <div class="hcard-body">
        <div class="hcard-name">${escapeHtml(stay.name)}</div>
        <div class="hcard-loc">${escapeHtml(stay.location)}</div>
        <div class="hcard-price">${formatMoneyRounded(stay.totalCost)}</div>
        <div class="hcard-ppp">${formatMoneyDecimal(stay.perPerson)} / persona</div>
        ${renderHighlights(stay.highlights)}
        <div class="pills">${stay.pills.map(renderPill).join("")}</div>
        <a class="card-link" href="${stay.link}" target="_blank" rel="noopener noreferrer">${stay.providerLabel} →</a>
      </div>
      <div class="card-status ${statusClass}">${statusLabel}</div>
    </article>
  `;
}

function renderFlightCard(flight) {
  const selected = state.flights.has(flight.id);
  const statusClass = selected ? "included" : "excluded";
  const statusLabel = selected ? "nel confronto" : "escluso";

  return `
    <article class="sel-card fcard ${selected ? "selected" : "unselected"}" data-flight-id="${flight.id}" aria-pressed="${String(selected)}" role="button" tabindex="0">
      <span class="check-badge">${checkIcon()}</span>
      <div class="fcard-name">${escapeHtml(flight.label)}</div>
      <div class="fcard-sub">${escapeHtml(flight.route)} · ${escapeHtml(flight.departureCity)}</div>
      <div class="fcard-price">${formatMoneyRounded(flight.totalCost)}</div>
      <div class="fcard-ppp">${formatMoneyDecimal(flight.perPerson)} / persona</div>
      ${flight.schedule.map((row) => `<div class="fcard-row">${escapeHtml(row)}</div>`).join("")}
      <div class="pills">${flight.pills.map(renderStyledPill).join("")}</div>
      <div class="card-status ${statusClass}">${statusLabel}</div>
    </article>
  `;
}

function renderParkingCard(parking) {
  const selected = state.parking === parking.id;
  const statusClass = selected ? "included" : "excluded";
  const statusLabel = selected ? "selezionato" : "escluso";
  const priceClass = parking.id === "fast-sc" ? "pcard-price best" : "pcard-price";
  const badges = parking.badges.map((badge) => `<span class="mbadge ${badge.className}">${escapeHtml(badge.text)}</span>`).join("");
  const extras = parking.extra
    .map((extra) => `<div class="kv"><span class="dot b"></span>${escapeHtml(extra)}</div>`)
    .join("");

  return `
    <article class="sel-card pcard ${selected ? "selected" : "unselected"}" data-parking-id="${parking.id}" aria-pressed="${String(selected)}" role="button" tabindex="0">
      <span class="check-badge">${checkIcon()}</span>
      <div class="pcard-provider">${escapeHtml(parking.label)}</div>
      <div class="pcard-type">${escapeHtml(parking.subtitle)}</div>
      ${badges}
      <div class="${priceClass}">${formatMoneyDecimal(parking.cost)}</div>
      ${parking.originalCost ? `<div class="pcard-orig">anziche ${formatMoneyRounded(parking.originalCost)}</div>` : ""}
      <div class="pcard-note">${escapeHtml(parking.note)}</div>
      ${extras}
      <div class="card-status ${statusClass}">${statusLabel}</div>
    </article>
  `;
}

function renderHighlights(items) {
  if (!items.length) {
    return "";
  }

  const [first, second, ...rest] = items;
  const intro = [first, second].filter(Boolean).map(renderHighlight).join("");
  const remaining = rest.length ? `<div class="divr"></div>${rest.map(renderHighlight).join("")}` : "";
  return `${intro}${remaining}`;
}

function renderHighlight(item) {
  return `<div class="kv"><span class="dot ${item.color}"></span>${escapeHtml(item.text)}</div>`;
}

function renderPill(text) {
  return `<span class="pill">${escapeHtml(text)}</span>`;
}

function renderStyledPill(item) {
  const style = item.color && item.border ? ` style="color:${item.color};border-color:${item.border}"` : "";
  return `<span class="pill"${style}>${escapeHtml(item.text)}</span>`;
}

function renderResultsSection() {
  const hasFlights = state.flights.size > 0;
  const hasStays = state.stays.size > 0;

  if (!hasFlights && !hasStays) {
    return renderEmptyState();
  }

  if (!hasFlights || !hasStays) {
    return renderNeedMoreState(hasFlights, hasStays);
  }

  const combos = getVisibleCombos();
  const totals = combos.map((combo) => combo.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const parking = getParkingOption(state.parking);
  const selectedChipHtml = getSelectedChips();
  const insights = getComparisonInsights(combos);
  const hasSingleCombo = combos.length === 1;

  return `
    <section class="section results-block ${hasSingleCombo ? "results-block-single" : ""}">
      <div class="section-head results-head" style="cursor:default;margin-bottom:12px">
        <div class="section-head-left">
          <span class="section-title">Combinazioni</span>
          <span class="section-hint">Confronto ordinato per prezzo totale, con parcheggio applicato solo ai voli da Bologna.</span>
        </div>
        <button class="section-action" data-sort-toggle type="button">${state.sortAsc ? "ordina per prezzo ↑" : "ordina per prezzo ↓"}</button>
      </div>

      <div id="results-section" class="results-shell">
        <div class="sel-bar">
          <div class="sel-bar-main">
            <span class="sel-bar-label">Nel confronto</span>
            <div class="sel-chips">${selectedChipHtml}</div>
          </div>
          <div class="sel-bar-actions">
            <button class="ghost-button" data-select-all type="button">Seleziona tutti</button>
            <button class="ghost-button" data-reset type="button">Reset</button>
          </div>
        </div>

        ${renderSummaryArea({ combos, hasSingleCombo, min, max, parking, insights })}

        <div class="combo-list">
          ${combos.map((combo, index) => renderComboCard(combo, index === 0 && combos.length > 1)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSummaryArea({ combos, hasSingleCombo, min, max, parking, insights }) {
  if (hasSingleCombo) {
    const combo = combos[0];
    return `
      <div class="summary-bar summary-bar-single">
        <div>
          <div class="stat-lbl">selezione corrente</div>
          <div class="stat-val blue">${formatMoneyRounded(combo.total)}</div>
        </div>
        <div>
          <div class="stat-lbl">per persona</div>
          <div class="stat-val">${formatMoneyRounded(Math.round(combo.total / TRIP_META.peopleCount))}</div>
        </div>
        <div>
          <div class="stat-lbl">parcheggio</div>
          <div class="stat-val" style="color:var(--orange)">${parking.cost > 0 ? formatMoneyDecimal(parking.cost) : "no"}</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="summary-bar">
      <div><div class="stat-lbl">combinazioni</div><div class="stat-val">${combos.length}</div></div>
      <div><div class="stat-lbl">minimo</div><div class="stat-val blue">${formatMoneyRounded(min)}</div></div>
      <div><div class="stat-lbl">massimo</div><div class="stat-val">${formatMoneyRounded(max)}</div></div>
      <div><div class="stat-lbl">parcheggio</div><div class="stat-val" style="color:var(--orange)">${parking.cost > 0 ? formatMoneyDecimal(parking.cost) : "no"}</div></div>
      <div><div class="stat-lbl">spread</div><div class="stat-val">${formatMoneyRounded(max - min)}</div></div>
    </div>

    <div class="insight-grid">
      ${insights.map(renderInsightCard).join("")}
    </div>
  `;
}

function renderEmptyState() {
  return `
    <section class="section">
      <div class="section-head" style="cursor:default;margin-bottom:12px">
        <span class="section-title">Combinazioni</span>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">✈️</div>
        <div class="empty-state-title">Seleziona almeno un volo e un alloggio</div>
        <div class="empty-state-desc">Tocca le card nelle sezioni qui sopra per includerle nel confronto. Le preferenze restano salvate nel browser.</div>
        <div class="empty-state-arrows">
          <div class="empty-arrow">✈️ Volo · ○</div>
          <div class="empty-arrow">🏠 Alloggio · ○</div>
        </div>
      </div>
    </section>
  `;
}

function renderNeedMoreState(hasFlights, hasStays) {
  const missing = hasFlights ? "alloggio" : "volo";

  return `
    <section class="section">
      <div class="section-head" style="cursor:default;margin-bottom:12px">
        <span class="section-title">Combinazioni</span>
      </div>
      <div class="need-more">
        <div class="need-more-title">Manca ancora qualcosa</div>
        <div class="need-more-desc">Seleziona anche un ${missing} per vedere le combinazioni complete.</div>
        <div class="need-more-items">
          <span class="need-pill ${hasFlights ? "done" : ""}">✈️ Volo</span>
          <span class="need-pill ${hasStays ? "done" : ""}">🏠 Alloggio</span>
        </div>
      </div>
    </section>
  `;
}

function renderComboCard(combo, isBest) {
  const reasons = getComboReasons(combo);

  return `
    <article class="combo-card ${isBest ? "best-card" : ""}">
      <div class="combo-top">
        <div>
          <div class="combo-name">
            <span class="vbadge" style="background:${combo.flight.color}"></span>
            ${escapeHtml(combo.flight.label)} + ${escapeHtml(combo.stay.label)}
            ${isBest ? '<span class="tag-best">migliore</span>' : ""}
          </div>
          <div class="combo-route">${escapeHtml(combo.flight.route)} · ${escapeHtml(combo.stay.location)}</div>
        </div>

        <div>
          <div class="combo-total-val ${isBest ? "best" : ""}">${formatMoneyRounded(combo.total)}</div>
          <div class="combo-total-ppp">${formatMoneyRounded(Math.round(combo.total / TRIP_META.peopleCount))} / pers.</div>
          ${combo.extraParking > 0 ? `<div class="combo-total-park">+${formatMoneyRounded(combo.extraParking)} parcheggio</div>` : ""}
        </div>
      </div>

      <div class="combo-grid">
        <div>
          <div class="stat-lbl">Voli</div>
          <div class="cgrid-val">${formatMoneyDecimal(combo.flight.totalCost)}</div>
          <div class="cgrid-note">${escapeHtml(combo.flight.flexibilityLabel)}</div>
        </div>
        <div>
          <div class="stat-lbl">Alloggio</div>
          <div class="cgrid-val">${formatMoneyDecimal(combo.stay.totalCost)}</div>
          <div class="cgrid-note">${escapeHtml(combo.stay.flexibilityLabel)}</div>
        </div>
        <div>
          <div class="stat-lbl">A Disneyland</div>
          <div class="cgrid-note">${escapeHtml(combo.stay.destinationNote)}</div>
        </div>
      </div>

      <div class="combo-reasons">
        ${reasons.map((reason) => `<span class="summary-pill">${escapeHtml(reason)}</span>`).join("")}
      </div>

      <div class="combo-footer">
        <a class="combo-link" href="${combo.stay.link}" target="_blank" rel="noopener noreferrer">${combo.stay.providerLabel} →</a>
        ${renderComboParkingNote(combo)}
      </div>
    </article>
  `;
}

function renderComboParkingNote(combo) {
  if (combo.extraParking > 0) {
    return `<span class="combo-park-note">incl. ${escapeHtml(getParkingOption(state.parking).label)}</span>`;
  }

  if (combo.flight.airportParkingNeeded && getParkingOption(state.parking).cost === 0) {
    return '<span class="combo-park-note" style="color:#c8c8c8">+ parcheggio non selezionato</span>';
  }

  return "";
}

function getVisibleCombos() {
  const parking = getParkingOption(state.parking);

  const combos = FLIGHTS
    .filter((flight) => state.flights.has(flight.id))
    .flatMap((flight) => {
      return STAYS
        .filter((stay) => state.stays.has(stay.id))
        .map((stay) => {
          const extraParking = flight.airportParkingNeeded ? parking.cost : 0;
          const convenienceScore = flight.travelConvenienceScore + stay.disneyAccessScore + stay.flexibilityScore + flight.flexibilityScore;
          return {
            id: `${flight.id}-${stay.id}`,
            flight,
            stay,
            extraParking,
            convenienceScore,
            total: flight.totalCost + stay.totalCost + extraParking,
          };
        });
    });

  return combos.sort((left, right) => {
    if (state.sortAsc) {
      return left.total - right.total;
    }

    return right.total - left.total;
  });
}

function getComparisonInsights(combos) {
  if (!combos.length) {
    return [];
  }

  const cheapest = combos[0];
  const mostComfortable = [...combos].sort((left, right) => right.convenienceScore - left.convenienceScore || left.total - right.total)[0];
  const bestDisney = [...combos].sort((left, right) => right.stay.disneyAccessScore - left.stay.disneyAccessScore || left.total - right.total)[0];

  return [
    {
      title: "Piu economica",
      value: formatMoneyRounded(cheapest.total),
      note: `${cheapest.flight.label} + ${cheapest.stay.label}`,
    },
    {
      title: "Piu comoda",
      value: `${mostComfortable.flight.label} + ${mostComfortable.stay.label}`,
      note: "Miglior equilibrio tra comodita' volo, flessibilita' e accesso ai parchi.",
    },
    {
      title: "Disney piu semplice",
      value: bestDisney.stay.label,
      note: bestDisney.stay.parisAccessLabel,
    },
  ];
}

function renderInsightCard(insight) {
  return `
    <article class="insight-card">
      <div class="stat-lbl">${escapeHtml(insight.title)}</div>
      <div class="insight-value">${escapeHtml(insight.value)}</div>
      <div class="insight-note">${escapeHtml(insight.note)}</div>
    </article>
  `;
}

function getComboReasons(combo) {
  return [
    combo.flight.flexibilityLabel,
    combo.flight.parkingImpactLabel,
    combo.stay.parisAccessLabel,
    combo.stay.pros[0],
  ];
}

function getSelectionHint(selectedIds, items, type) {
  if (!selectedIds.length) {
    return "Nessuno selezionato · tocca le card per includerle";
  }

  if (selectedIds.length === items.length) {
    return "Tutti selezionati";
  }

  const selectedLabels = items
    .filter((item) => selectedIds.includes(item.id))
    .map((item) => item.label);

  return `${selectedLabels.join(", ")} selezionat${selectedIds.length === 1 ? "o" : "i"}`;
}

function getSelectedChips() {
  const chips = [
    ...FLIGHTS.filter((flight) => state.flights.has(flight.id)).map((flight) => {
      return renderSelectableChip("flight", flight.id, flight.label);
    }),
    ...STAYS.filter((stay) => state.stays.has(stay.id)).map((stay) => {
      return renderSelectableChip("stay", stay.id, stay.label);
    }),
  ];

  const parking = getParkingOption(state.parking);
  if (parking.cost > 0) {
    chips.push(`<span class="sel-chip" style="background:#fef3e2;color:#92400e">${escapeHtml(parking.label)} +${formatMoneyRounded(parking.cost)}</span>`);
  }

  return chips.join("");
}

function renderSelectableChip(type, id, label) {
  return `
    <span class="sel-chip">
      ${escapeHtml(label)}
      <button class="sel-chip-x" data-remove-chip="${id}" data-remove-chip-type="${type}" type="button" aria-label="Rimuovi ${escapeHtml(label)}">✕</button>
    </span>
  `;
}

function getParkingOption(id) {
  return PARKING_OPTIONS.find((parking) => parking.id === id) || PARKING_OPTIONS[0];
}

function checkIcon() {
  return `
    <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `;
}

function formatMoneyRounded(value) {
  return `€${Math.round(value).toLocaleString("it-IT")}`;
}

function formatMoneyDecimal(value) {
  return `€${value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isKeyboardToggle(event) {
  return event.key === "Enter" || event.key === " ";
}
