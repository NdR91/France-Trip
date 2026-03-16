import { getBestPricedCombo, getComboReasons, getComparisonInsights, getParkingOption, getVisibleCombos, hasParkingEligibleFlight } from "./domain/combos.js";
import { checkIcon, escapeHtml, formatMoneyDecimal, formatMoneyRounded } from "./utils.js";

export function renderAppView({ state, shareMessage, datasets }) {
  const flightHint = getSelectionHint([...state.flights], datasets.flights);
  const stayHint = getSelectionHint([...state.stays], datasets.stays);
  const parkingEligible = hasParkingEligibleFlight(state, datasets.flights);
  const parkingCopy = getParkingSectionCopy(state, datasets.flights, parkingEligible);

  return `
    ${renderTopDecisionBanner(state, datasets)}
    ${renderSelectableSection(state, {
      sectionId: "stays",
      title: "Alloggi da confrontare",
      hint: stayHint,
      cards: datasets.stays.map((stay) => renderStayCard(state, stay)).join(""),
    })}
    ${renderSelectableSection(state, {
      sectionId: "flights",
      title: "Voli da confrontare",
      hint: flightHint,
      cards: datasets.flights.map((flight) => renderFlightCard(state, flight)).join(""),
    })}
    ${renderSelectableSection(state, {
      sectionId: "parking",
      title: "Parcheggio Bologna · 5 giorni · 2 auto",
      hint: parkingCopy.hint,
      cards: datasets.parkingOptions.map((parking) => renderParkingCard(state, parking, parkingEligible)).join(""),
      footnote: parkingCopy.footnote,
    })}
    ${renderResultsSection(state, shareMessage, datasets)}
  `;
}

function renderTopDecisionBanner(state, datasets) {
  if (!state.flights.size || !state.stays.size) {
    return "";
  }

  const combos = getVisibleCombos({ state, ...datasets });
  if (!combos.length) {
    return "";
  }

  const bestCombo = getBestPricedCombo(combos);
  const comboCountLabel = `${combos.length} ${combos.length === 1 ? "combinazione" : "combinazioni"}`;

  return `
    <section class="top-decision">
      <div>
        <div class="top-decision-label">Scelta migliore ora</div>
        <div class="top-decision-value">${formatMoneyRounded(bestCombo.total)} - ${escapeHtml(bestCombo.flight.label)} + ${escapeHtml(bestCombo.stay.label)}</div>
        <div class="top-decision-note">E' la combinazione piu economica tra le ${comboCountLabel} gia' nel confronto.</div>
      </div>
      <a class="top-decision-link" href="#results-section">Apri combinazioni</a>
    </section>
  `;
}

function renderSelectableSection(state, { sectionId, title, hint, cards, footnote = "" }) {
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

function renderStayCard(state, stay) {
  const selected = state.stays.has(stay.id);
  const statusClass = selected ? "included" : "excluded";
  const statusLabel = selected ? "in confronto" : "escluso";

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

function renderFlightCard(state, flight) {
  const selected = state.flights.has(flight.id);
  const statusClass = selected ? "included" : "excluded";
  const statusLabel = selected ? "in confronto" : "escluso";
  const logoClass = getFlightLogoClass(flight.id);
  const logo = flight.logo
    ? `<img class="fcard-logo ${logoClass}" src="${flight.logo}" alt="${escapeHtml(flight.airlineLabel || flight.label)}">`
    : `<span class="fcard-logo-fallback">${escapeHtml((flight.airlineLabel || flight.label).slice(0, 2).toUpperCase())}</span>`;

  return `
    <article class="sel-card fcard ${selected ? "selected" : "unselected"}" data-flight-id="${flight.id}" aria-pressed="${String(selected)}" role="button" tabindex="0">
      <span class="check-badge">${checkIcon()}</span>
      <div class="fcard-brand">
        ${logo}
        <div class="fcard-brand-copy">
          <div class="fcard-name">${escapeHtml(flight.label)}</div>
        </div>
      </div>
      <div class="fcard-sub">${escapeHtml(flight.route)} · ${escapeHtml(flight.departureCity)}</div>
      <div class="fcard-price">${formatMoneyRounded(flight.totalCost)}</div>
      <div class="fcard-ppp">${formatMoneyDecimal(flight.perPerson)} / persona</div>
      ${flight.schedule.map((row) => `<div class="fcard-row">${escapeHtml(row)}</div>`).join("")}
      <div class="fcard-meta">
        <div class="fcard-meta-row"><span class="dot b"></span>durata ${escapeHtml(flight.durationLabel)}</div>
        <div class="fcard-meta-row"><span class="dot ${flight.stopLabel === "nessuno scalo" ? "g" : "o"}"></span>${escapeHtml(flight.stopLabel)}</div>
      </div>
      <div class="pills">${flight.pills.map(renderStyledPill).join("")}</div>
      <div class="card-status ${statusClass}">${statusLabel}</div>
    </article>
  `;
}

function getFlightLogoClass(flightId) {
  if (flightId === "easyjet") {
    return "is-easyjet";
  }

  if (flightId.startsWith("af-")) {
    return "is-air-france";
  }

  return "";
}

function renderParkingCard(state, parking, parkingEligible) {
  const isDisabled = parking.id !== "no" && !parkingEligible;
  const selected = !isDisabled && state.parking === parking.id;
  const statusClass = isDisabled ? "disabled" : selected ? "included" : "excluded";
  const statusLabel = isDisabled ? "solo voli BLQ" : selected ? "attivo" : "disponibile";
  const priceClass = parking.id === "fast-sc" ? "pcard-price best" : "pcard-price";
  const badges = parking.badges.map((badge) => `<span class="mbadge ${badge.className}">${escapeHtml(badge.text)}</span>`).join("");
  const extras = parking.extra.map((extra) => `<div class="kv"><span class="dot b"></span>${escapeHtml(extra)}</div>`).join("");
  const disabledAttributes = isDisabled ? ' aria-disabled="true" tabindex="-1" data-parking-disabled="true"' : ' tabindex="0"';

  return `
    <article class="sel-card pcard ${selected ? "selected" : "unselected"} ${isDisabled ? "disabled" : ""}" data-parking-id="${parking.id}" aria-pressed="${String(selected)}" role="button"${disabledAttributes}>
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

function renderResultsSection(state, shareMessage, datasets) {
  const hasFlights = state.flights.size > 0;
  const hasStays = state.stays.size > 0;

  if (!hasFlights && !hasStays) {
    return renderEmptyState();
  }

  if (!hasFlights || !hasStays) {
    return renderNeedMoreState(hasFlights, hasStays);
  }

  const combos = getVisibleCombos({ state, ...datasets });
  const totals = combos.map((combo) => combo.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const parking = getParkingOption(state.parking, datasets.parkingOptions);
  const selectedChipHtml = getSelectedChips(state, datasets);
  const insights = getComparisonInsights(combos);
  const hasSingleCombo = combos.length === 1;

  return `
    <section class="section results-block ${hasSingleCombo ? "results-block-single" : ""}">
      <div class="section-head results-head" style="cursor:default;margin-bottom:12px">
        <div class="section-head-left">
          <span class="section-title">Combinazioni</span>
          <span class="section-hint">Totale viaggio, con parcheggio aggiunto solo alle partenze da Bologna.</span>
        </div>
        <button class="section-action" data-sort-toggle type="button">${state.sortAsc ? "Prezzo crescente" : "Prezzo decrescente"}</button>
      </div>

      <div id="results-section" class="results-shell">
        <div class="sel-bar">
          <div class="sel-bar-main">
            <span class="sel-bar-label">Selezionati</span>
            <div class="sel-chips">${selectedChipHtml}</div>
          </div>
          <div class="sel-bar-actions">
            <button class="ghost-button" data-share-link type="button">Copia link</button>
            <button class="ghost-button" data-select-all type="button">Seleziona tutti</button>
            <button class="ghost-button" data-reset type="button">Reset</button>
            ${shareMessage ? `<span class="share-feedback">${escapeHtml(shareMessage)}</span>` : ""}
          </div>
        </div>

        ${renderSummaryArea({ combos, hasSingleCombo, min, max, parking, insights, tripMeta: datasets.tripMeta })}

        <div class="combo-list">
          ${combos.map((combo, index) => renderComboCard(combo, index === 0 && combos.length > 1, state, datasets)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderSummaryArea({ combos, hasSingleCombo, min, max, parking, insights, tripMeta }) {
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
          <div class="stat-val">${formatMoneyRounded(Math.round(combo.total / tripMeta.peopleCount))}</div>
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
        <div class="empty-state-desc">Tocca le card qui sopra per confrontare le combinazioni. Le preferenze restano salvate nel browser.</div>
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
        <div class="need-more-title">Serve ancora un ${missing}</div>
        <div class="need-more-desc">Aggiungilo al confronto per vedere il totale completo.</div>
        <div class="need-more-items">
          <span class="need-pill ${hasFlights ? "done" : ""}">✈️ Volo</span>
          <span class="need-pill ${hasStays ? "done" : ""}">🏠 Alloggio</span>
        </div>
      </div>
    </section>
  `;
}

function renderComboCard(combo, isBest, state, datasets) {
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
          <div class="combo-total-ppp">${formatMoneyRounded(Math.round(combo.total / datasets.tripMeta.peopleCount))} / pers.</div>
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
        ${renderComboParkingNote(combo, state, datasets)}
      </div>
    </article>
  `;
}

function renderComboParkingNote(combo, state, datasets) {
  const parking = getParkingOption(state.parking, datasets.parkingOptions);

  if (combo.extraParking > 0) {
    return `<span class="combo-park-note">con ${escapeHtml(parking.label)}</span>`;
  }

  if (combo.flight.airportParkingNeeded && parking.cost === 0) {
    return '<span class="combo-park-note" style="color:#c8c8c8">parcheggio BLQ non selezionato</span>';
  }

  return "";
}

function renderInsightCard(insight) {
  const value = insight.type === "price" ? formatMoneyRounded(insight.value) : insight.value;
  return `
    <article class="insight-card">
      <div class="stat-lbl">${escapeHtml(insight.title)}</div>
      <div class="insight-value">${escapeHtml(value)}</div>
      <div class="insight-note">${escapeHtml(insight.note)}</div>
    </article>
  `;
}

function getSelectionHint(selectedIds, items) {
  if (!selectedIds.length) {
    return "Nessuna opzione selezionata - tocca le card da confrontare";
  }

  if (selectedIds.length === items.length) {
    return "Tutte le opzioni sono nel confronto";
  }

  const selectedLabels = items.filter((item) => selectedIds.includes(item.id)).map((item) => item.label);
  return `${selectedLabels.join(", ")} selezionat${selectedIds.length === 1 ? "o" : "i"}`;
}

function getParkingSectionCopy(state, flights, parkingEligible) {
  if (!state.flights.size) {
    return {
      hint: "Disponibile quando selezioni almeno un volo da Bologna",
      footnote: "Questi parcheggi coprono solo le partenze da Bologna. Quelli da Milano arriveranno dopo.",
    };
  }

  if (!parkingEligible) {
    return {
      hint: "Nessun volo da Bologna nel confronto - parcheggi BLQ disattivati",
      footnote: "I parcheggi di questa sezione valgono solo per voli in partenza da Bologna.",
    };
  }

  const selectedBlqCount = flights.filter((flight) => state.flights.has(flight.id) && flight.airportParkingNeeded).length;
  return {
    hint: `${selectedBlqCount} ${selectedBlqCount === 1 ? "volo da Bologna attivo" : "voli da Bologna attivi"} - tocca una card`,
    footnote: "Il parcheggio viene applicato solo alle combinazioni con partenza da Bologna.",
  };
}

function getSelectedChips(state, datasets) {
  const chips = [
    ...datasets.flights.filter((flight) => state.flights.has(flight.id)).map((flight) => renderSelectableChip("flight", flight.id, flight.label)),
    ...datasets.stays.filter((stay) => state.stays.has(stay.id)).map((stay) => renderSelectableChip("stay", stay.id, stay.label)),
  ];

  const parking = getParkingOption(state.parking, datasets.parkingOptions);
  if (parking.cost > 0) {
    chips.push(`<span class="sel-chip is-accent">${escapeHtml(parking.label)} +${formatMoneyRounded(parking.cost)}</span>`);
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
