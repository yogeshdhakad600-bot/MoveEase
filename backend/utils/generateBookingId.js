module.exports = function generateBookingId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MV-${rand}`;
};
