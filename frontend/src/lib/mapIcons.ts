import L from "leaflet";

export const defaultMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redMarkerSvg = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'><path fill='#ef4444' stroke='#b91c1c' stroke-width='2' d='M12.5 1a11.5 11.5 0 0 0-11.5 11.5c0 9.1 11.5 27.4 11.5 27.4s11.5-18.3 11.5-27.4A11.5 11.5 0 0 0 12.5 1z'/><circle cx='12.5' cy='12.5' r='4' fill='#fff'/></svg>"
);

export const shelterMarkerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${redMarkerSvg}`,
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -32],
  shadowSize: [41, 41],
});

const blueMarkerSvg = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'><path fill='#2563eb' stroke='#1d4ed8' stroke-width='2' d='M12.5 1a11.5 11.5 0 0 0-11.5 11.5c0 9.1 11.5 27.4 11.5 27.4s11.5-18.3 11.5-27.4A11.5 11.5 0 0 0 12.5 1z'/><circle cx='12.5' cy='12.5' r='4' fill='#fff'/></svg>"
);

export const currentMarkerIcon = L.icon({
  iconUrl: `data:image/svg+xml,${blueMarkerSvg}`,
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -32],
  shadowSize: [41, 41],
});

// Ensure Leaflet markers use the default icon unless a custom one is provided.
L.Marker.prototype.options.icon = defaultMarkerIcon;
