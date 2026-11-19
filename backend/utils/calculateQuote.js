function calculateQuote({ vehicle, distanceKm, floors = 0, hasLift = false, services = {} }) {
  const breakdown = {};
  breakdown.vehicleBaseFare = vehicle.baseFare;
  breakdown.distanceCharge = Math.round(distanceKm * vehicle.perKmRate);
  breakdown.floorCharge = hasLift ? 0 : floors * 250;
  breakdown.packing = services.packing ? 2500 : 0;
  breakdown.loadingUnloading = services.loadingUnloading ? 1500 : 0;
  breakdown.insurance = services.insurance ? 800 : 0;
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { breakdown, total };
}

module.exports = calculateQuote;
