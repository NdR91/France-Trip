function parseList(value, allowedIds) {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(",").map((item) => item.trim()).filter((item) => allowedIds.has(item)))];
}

function buildParams(state) {
  const params = new URLSearchParams();
  const flights = [...state.flights];
  const stays = [...state.stays];

  if (flights.length) {
    params.set("f", flights.join(","));
  }

  if (stays.length) {
    params.set("s", stays.join(","));
  }

  if (state.parking.BLQ !== "no-blq") {
    params.set("pb", state.parking.BLQ);
  }

  if (state.parking.LIN !== "no-lin") {
    params.set("pl", state.parking.LIN);
  }

  if (!state.sortAsc) {
    params.set("sort", "desc");
  }

  return params;
}

export function parseUrlState(search, datasets) {
  const params = new URLSearchParams(search);
  const flightIds = new Set(datasets.flights.map((flight) => flight.id));
  const stayIds = new Set(datasets.stays.map((stay) => stay.id));
  const parkingIds = new Set(datasets.parkingOptions.map((parking) => parking.id));
  const patch = {};

  if (params.has("f")) {
    patch.flights = parseList(params.get("f"), flightIds);
  }

  if (params.has("s")) {
    patch.stays = parseList(params.get("s"), stayIds);
  }

  if (params.has("pb") || params.has("pl") || params.has("p")) {
    patch.parking = {};
  }

  if (params.has("pb")) {
    const parking = params.get("pb");
    patch.parking.BLQ = parkingIds.has(parking) ? parking : "no-blq";
  } else if (params.has("p")) {
    const parking = params.get("p");
    patch.parking.BLQ = parkingIds.has(parking) ? parking : "no-blq";
  }

  if (params.has("pl")) {
    const parking = params.get("pl");
    patch.parking.LIN = parkingIds.has(parking) ? parking : "no-lin";
  }

  if (params.has("sort")) {
    patch.sortAsc = params.get("sort") !== "desc";
  }

  return patch;
}

export function syncUrlState(state) {
  const params = buildParams(state);
  const search = params.toString();
  const nextUrl = search ? `${window.location.pathname}?${search}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
}

export function buildShareUrl(state) {
  const params = buildParams(state);
  const search = params.toString();
  return `${window.location.origin}${window.location.pathname}${search ? `?${search}` : ""}`;
}
