export const getRadiusFromLatLonInM = (lat1, lon1, lat2, lon2) => {
const R = 6371; // radius of the earth in km
const dLat = deg2rad(lat2 - lat1); // deg2rad below
const dLon = deg2rad(lon2 - lon1);
const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const d = R * c * 1000; // distance in m
const r = d / 2;
return r > 40000 ? 40000 : Math.floor(r); // yelp radius limited to 40km 
};
  
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}