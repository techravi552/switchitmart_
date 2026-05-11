export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371, dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))*100)/100;
};
const toRad = v => v*Math.PI/180;

export const getDeliveryCharge = (dist, free=false, slabs=null) => {
  if (free) return 0;
  const s = slabs?.length ? slabs : [
    {minKm:0,maxKm:1,charge:10},{minKm:1,maxKm:2,charge:18},
    {minKm:2,maxKm:3,charge:25},{minKm:3,maxKm:4,charge:30},{minKm:4,maxKm:9999,charge:50}
  ];
  return s.find(x=>dist>=x.minKm&&dist<x.maxKm)?.charge ?? 50;
};

export const getEstimatedTime = (dist, slabs=null) => {
  const s = slabs?.length ? slabs : [
    {minKm:0,maxKm:1,timeLabel:'20-30 mins'},{minKm:1,maxKm:2,timeLabel:'30-40 mins'},
    {minKm:2,maxKm:3,timeLabel:'40-50 mins'},{minKm:3,maxKm:4,timeLabel:'50-60 mins'},{minKm:4,maxKm:9999,timeLabel:'60-90 mins'}
  ];
  return s.find(x=>dist>=x.minKm&&dist<x.maxKm)?.timeLabel ?? '60-90 mins';
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n||0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});

export const timeAgo = (date) => {
  const diff = (Date.now()-new Date(date))/1000;
  if (diff<60) return 'just now';
  if (diff<3600) return `${Math.floor(diff/60)}m ago`;
  if (diff<86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
};

export const DEFAULT_SLABS = [
  {minKm:0, maxKm:1,  charge:10, timeLabel:'20-30 mins'},
  {minKm:1, maxKm:2,  charge:18, timeLabel:'30-40 mins'},
  {minKm:2, maxKm:3,  charge:25, timeLabel:'40-50 mins'},
  {minKm:3, maxKm:4,  charge:30, timeLabel:'50-60 mins'},
  {minKm:4, maxKm:9999, charge:50, timeLabel:'60-90 mins'},
];
