import L from 'leaflet';
let iconOptions = {
    iconSize: [24, 33.33],
    popupAnchor: [1, -24],
    iconAnchor:   [13, 28.33],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
}
let administrative = L.icon({
    iconUrl: '../../../assets/icons/map-topo-icons/administrative.svg',
    ...iconOptions
});
let populated = L.icon({
    iconUrl: '../../../assets/icons/map-topo-icons/populated.svg',
    ...iconOptions
});
let otherTopo = L.icon({
    iconUrl: '../../../assets/icons/map-topo-icons/other-topo.svg',
    ...iconOptions
});
let structure = L.icon({
    iconUrl: '../../../assets/icons/map-topo-icons/structure.svg',
    ...iconOptions
});
let other = L.icon({
    iconUrl: '../../../assets/icons/map-topo-icons/other.png',
    ...iconOptions
});
let unknownTheme = L.icon({
    iconUrl: '../../../assets/icons/map-topo-icons/climate.png',
    ...iconOptions
});
const getMarkerIcon = (colorCode) => {
    switch(colorCode) {
        case 'Administrative Region': return administrative;
        case 'Populated Place': return populated;
        case 'Structure': return structure;
        case 'Other Topographical Feature': return otherTopo;
        default: return other;
    }
}

export default getMarkerIcon;
