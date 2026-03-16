export function getParkingOption(id, parkingOptions) {
  return parkingOptions.find((parking) => parking.id === id) || parkingOptions[0];
}

export function hasParkingEligibleFlight(state, flights) {
  return flights.some((flight) => state.flights.has(flight.id) && flight.airportParkingNeeded);
}

export function hasParkingEligibleFlightForAirport(state, flights, airport) {
  return flights.some(
    (flight) => state.flights.has(flight.id) && flight.airportParkingNeeded && flight.departureAirport === airport,
  );
}

export function getSelectedParkingForFlight(state, flight, parkingOptions) {
  const parkingId = state.parking[flight.departureAirport];
  return getParkingOption(parkingId, parkingOptions);
}

export function getVisibleCombos({ state, flights, stays, parkingOptions }) {
  const combos = flights
    .filter((flight) => state.flights.has(flight.id))
    .flatMap((flight) => {
      return stays
        .filter((stay) => state.stays.has(stay.id))
        .map((stay) => {
          const parking = getSelectedParkingForFlight(state, flight, parkingOptions);
          const extraParking = flight.airportParkingNeeded ? parking.cost : 0;
          const convenienceScore = flight.travelConvenienceScore + stay.disneyAccessScore + stay.flexibilityScore + flight.flexibilityScore;
          return {
            id: `${flight.id}-${stay.id}`,
            flight,
            stay,
            parking,
            extraParking,
            convenienceScore,
            total: flight.totalCost + stay.totalCost + extraParking,
          };
        });
    });

  return combos.sort((left, right) => (state.sortAsc ? left.total - right.total : right.total - left.total));
}

export function getBestPricedCombo(combos) {
  return [...combos].sort((left, right) => left.total - right.total)[0];
}

export function getComparisonInsights(combos) {
  if (!combos.length) {
    return [];
  }

  const cheapest = getBestPricedCombo(combos);
  const mostComfortable = [...combos].sort((left, right) => right.convenienceScore - left.convenienceScore || left.total - right.total)[0];
  const bestDisney = [...combos].sort((left, right) => right.stay.disneyAccessScore - left.stay.disneyAccessScore || left.total - right.total)[0];

  return [
    {
      title: "Piu economica",
      value: cheapest.total,
      note: `${cheapest.flight.label} + ${cheapest.stay.label}`,
      type: "price",
    },
    {
      title: "Piu comoda",
      value: `${mostComfortable.flight.label} + ${mostComfortable.stay.label}`,
      note: "L'opzione piu equilibrata tra volo, flessibilita' e accesso ai parchi.",
      type: "comfort",
    },
    {
      title: "Accesso Disney",
      value: bestDisney.stay.label,
      note: bestDisney.stay.destinationNote,
      type: "access",
    },
  ];
}

export function getComboReasons(combo) {
  return [
    combo.flight.flexibilityLabel,
    combo.flight.parkingImpactLabel,
    combo.stay.parisAccessLabel,
    combo.stay.pros[0],
  ];
}
