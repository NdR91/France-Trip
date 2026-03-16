export const STORAGE_KEY = "france-trip-comparator-state";

const DEFAULT_PARKING = {
  BLQ: "no-blq",
  LIN: "no-lin",
};

export function createDefaultState() {
  return {
    flights: new Set(["af-base"]),
    stays: new Set(["coco"]),
    parking: {
      BLQ: "fast-sc",
      LIN: DEFAULT_PARKING.LIN,
    },
    sortAsc: true,
    collapsed: {
      stays: false,
      flights: false,
      "parking-blq": false,
      "parking-lin": false,
    },
  };
}

export function serializeState(state) {
  return {
    flights: [...state.flights],
    stays: [...state.stays],
    parking: { ...state.parking },
    sortAsc: state.sortAsc,
    collapsed: { ...state.collapsed },
  };
}

export function normalizeState(candidate, datasets) {
  const fallback = createDefaultState();
  const flightIds = new Set(datasets.flights.map((flight) => flight.id));
  const stayIds = new Set(datasets.stays.map((stay) => stay.id));
  const parkingIds = new Set(datasets.parkingOptions.map((parking) => parking.id));
  const normalizedFlights = new Set((candidate.flights || []).filter((id) => flightIds.has(id)));
  const normalizedParking = normalizeParkingSelection(candidate.parking, parkingIds);
  const activeAirports = new Set(
    datasets.flights
      .filter((flight) => normalizedFlights.has(flight.id) && flight.airportParkingNeeded)
      .map((flight) => flight.departureAirport),
  );

  return {
    flights: normalizedFlights,
    stays: new Set((candidate.stays || []).filter((id) => stayIds.has(id))),
    parking: sanitizeParkingSelection(normalizedParking, activeAirports),
    sortAsc: candidate.sortAsc !== false,
    collapsed: {
      stays: Boolean(candidate.collapsed?.stays),
      flights: Boolean(candidate.collapsed?.flights),
      "parking-blq": Boolean(candidate.collapsed?.["parking-blq"]),
      "parking-lin": Boolean(candidate.collapsed?.["parking-lin"]),
    },
  };
}

function normalizeParkingSelection(candidateParking, parkingIds) {
  if (typeof candidateParking === "string") {
    return {
      ...DEFAULT_PARKING,
      BLQ: parkingIds.has(candidateParking) ? candidateParking : DEFAULT_PARKING.BLQ,
    };
  }

  return {
    BLQ: parkingIds.has(candidateParking?.BLQ) ? candidateParking.BLQ : DEFAULT_PARKING.BLQ,
    LIN: parkingIds.has(candidateParking?.LIN) ? candidateParking.LIN : DEFAULT_PARKING.LIN,
  };
}

function sanitizeParkingSelection(parkingSelection, activeAirports) {
  return {
    BLQ: activeAirports.has("BLQ") ? parkingSelection.BLQ : DEFAULT_PARKING.BLQ,
    LIN: activeAirports.has("LIN") ? parkingSelection.LIN : DEFAULT_PARKING.LIN,
  };
}

export function mergeState(baseState, patch, datasets) {
  const base = serializeState(baseState);
  return normalizeState(
    {
      ...base,
      ...patch,
      collapsed: {
        ...base.collapsed,
        ...(patch.collapsed || {}),
      },
    },
    datasets,
  );
}

export function loadState(datasets) {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultState();
  }

  try {
    return normalizeState(JSON.parse(raw), datasets);
  } catch {
    return createDefaultState();
  }
}

export function persistState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState(state)));
}
