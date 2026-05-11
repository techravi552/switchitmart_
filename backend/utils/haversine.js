const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 100) / 100;
};
const toRad = (v) => v * Math.PI / 180;

// Default slabs
const DEFAULT_SLABS = [
  { minKm: 0,  maxKm: 1, charge: 10, timeLabel: '20-30 mins' },
  { minKm: 1,  maxKm: 2, charge: 18, timeLabel: '30-40 mins' },
  { minKm: 2,  maxKm: 3, charge: 25, timeLabel: '40-50 mins' },
  { minKm: 3,  maxKm: 4, charge: 30, timeLabel: '50-60 mins' },
  { minKm: 4,  maxKm: 9999, charge: 50, timeLabel: '60-90 mins' },
];

const getDeliveryCharge = (distance, freeDelivery = false, customSlabs = null) => {
  if (freeDelivery) return 0;
  const slabs = (customSlabs && customSlabs.length > 0) ? customSlabs : DEFAULT_SLABS;
  const slab = slabs.find(s => distance >= s.minKm && distance < s.maxKm);
  return slab ? slab.charge : 50;
};

const getEstimatedTime = (distance, customSlabs = null) => {
  const slabs = (customSlabs && customSlabs.length > 0) ? customSlabs : DEFAULT_SLABS;
  const slab = slabs.find(s => distance >= s.minKm && distance < s.maxKm);
  return slab ? slab.timeLabel : '60-90 mins';
};

module.exports = { haversineDistance, getDeliveryCharge, getEstimatedTime, DEFAULT_SLABS };
