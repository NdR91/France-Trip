export const STORAGE_KEY = "france-trip-comparator-state";

export function createDefaultState() {
  return {
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
}

export function serializeState(state) {
  return {
    flights: [...state.flights],
    stays: [...state.stays],
    parking: state.parking,
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
  const normalizedParking = parkingIds.has(candidate.parking) ? candidate.parking : fallback.parking;
  const hasParkingEligibleFlight = datasets.flights.some((flight) => normalizedFlights.has(flight.id) && flight.airportParkingNeeded);

  return {
    flights: normalizedFlights,
    stays: new Set((candidate.stays || []).filter((id) => stayIds.has(id))),
    parking: normalizedParking !== fallback.parking && !hasParkingEligibleFlight ? fallback.parking : normalizedParking,
    sortAsc: candidate.sortAsc !== false,
    collapsed: {
      stays: Boolean(candidate.collapsed?.stays),
      flights: Boolean(candidate.collapsed?.flights),
      parking: Boolean(candidate.collapsed?.parking),
    },
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
