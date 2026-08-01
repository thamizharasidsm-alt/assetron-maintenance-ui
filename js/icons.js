// Inline SVG icon set — no external requests, works offline on GitHub Pages.
const ICON_PATHS = {
  home: "<path d='M3 11l9-8 9 8'/><path d='M5 10v10h14V10'/><path d='M9 20v-6h6v6'/>",
  building: "<rect x='4' y='2' width='16' height='20' rx='1'/><path d='M9 6h1M14 6h1M9 10h1M14 10h1M9 14h1M14 14h1M9 18h1M14 18h1'/>",
  armchair: "<path d='M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5'/><path d='M4 12h16v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'/><path d='M6 18v2M18 18v2'/>",
  monitor: "<rect x='3' y='4' width='18' height='13' rx='1.5'/><path d='M8 21h8M12 17v4'/>",
  car: "<path d='M4 16V11l2-5h12l2 5v5'/><path d='M4 16h16'/><circle cx='7.5' cy='16.5' r='1.6'/><circle cx='16.5' cy='16.5' r='1.6'/>",
  factory: "<path d='M3 21V10l6 4v-4l6 4V8l5 3v10z'/><path d='M3 21h18'/>",
  printer: "<path d='M6 9V3h12v6'/><rect x='4' y='9' width='16' height='8' rx='1'/><path d='M6 17v4h12v-4'/>",
  lightbulb: "<path d='M9 18h6M10 21h4'/><path d='M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z'/>",
  hardhat: "<path d='M4 18a8 8 0 0 1 16 0z'/><path d='M12 10V6M4 18h16M9 6h6'/>",
  users: "<circle cx='9' cy='8' r='3'/><path d='M2 20c0-3.3 3-6 7-6s7 2.7 7 6'/><circle cx='17' cy='9' r='2.5'/><path d='M22 20c0-2.5-2-4.5-4.5-5'/>",
  shield: "<path d='M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z'/>",
  settings: "<circle cx='12' cy='12' r='3'/><path d='M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.5c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z'/>",
  search: "<circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3'/>",
  bell: "<path d='M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M10.3 21a2 2 0 0 0 3.4 0'/>",
  chevrondown: "<path d='M6 9l6 6 6-6'/>",
  chevronright: "<path d='M9 6l6 6-6 6'/>",
  plus: "<path d='M12 5v14M5 12h14'/>",
  list: "<path d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'/>",
  layers: "<path d='M12 3l9 5-9 5-9-5z'/><path d='M3 13l9 5 9-5M3 8v10M21 8v10'/>",
  dollarsign: "<path d='M12 2v20M17 6.5c0-1.9-2.2-3.5-5-3.5s-5 1.4-5 3.5S9.2 10 12 10s5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5'/>",
  trendingup: "<path d='M3 17l6-6 4 4 8-8'/><path d='M15 7h6v6'/>",
  trendingdown: "<path d='M3 7l6 6 4-4 8 8'/><path d='M15 17h6v-6'/>",
  check: "<path d='M20 6L9 17l-5-5'/>",
  checkcircle: "<circle cx='12' cy='12' r='9'/><path d='M8 12l3 3 5-6'/>",
  x: "<path d='M18 6L6 18M6 6l12 12'/>",
  alerttriangle: "<path d='M12 3l10 18H2z'/><path d='M12 10v4M12 17h.01'/>",
  package: "<path d='M21 8l-9-5-9 5 9 5 9-5z'/><path d='M3 8v8l9 5 9-5V8'/><path d='M12 13v8'/>",
  mappin: "<path d='M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z'/><circle cx='12' cy='9' r='2.5'/>",
  briefcase: "<rect x='3' y='7' width='18' height='13' rx='1.5'/><path d='M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/>",
  creditcard: "<rect x='2' y='5' width='20' height='14' rx='2'/><path d='M2 10h20'/>",
  filetext: "<path d='M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z'/><path d='M14 3v5h5'/><path d='M8 13h8M8 17h5'/>",
  barchart: "<path d='M4 20V10M12 20V4M20 20v-7'/><path d='M2 20h20'/>",
  clock: "<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 3'/>",
  logout: "<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/><path d='M16 17l5-5-5-5'/><path d='M21 12H9'/>",
  moon: "<path d='M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z'/>",
  sun: "<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'/>",
  menu: "<path d='M4 7h16M4 12h16M4 17h16'/>",
  qrcode: "<rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/><rect x='3' y='14' width='7' height='7'/><path d='M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2'/>",
  wallet: "<path d='M21 7H5a2 2 0 0 1 0-4h13v4'/><path d='M3 7v12a2 2 0 0 0 2 2h16v-6'/><path d='M17 13h4v4h-4z'/>",
  arrowleftright: "<path d='M8 3L4 7l4 4'/><path d='M4 7h16'/><path d='M16 21l4-4-4-4'/><path d='M20 17H4'/>",
  rotateccw: "<path d='M3 12a9 9 0 1 0 3-6.7'/><path d='M3 4v5h5'/>",
  trash: "<path d='M4 7h16'/><path d='M9 7V4h6v3'/><path d='M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13'/>",
  download: "<path d='M12 3v13'/><path d='M7 11l5 5 5-5'/><path d='M4 20h16'/>",
  upload: "<path d='M12 21V8'/><path d='M7 13l5-5 5 5'/><path d='M4 20h16'/>",
  edit: "<path d='M12 20h9'/><path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'/>",
  eye: "<path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z'/><circle cx='12' cy='12' r='3'/>",
  grid: "<rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/><rect x='3' y='14' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/>",
  camera: "<path d='M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z'/><circle cx='12' cy='14' r='3.5'/>",
  crosshair: "<circle cx='12' cy='12' r='9'/><path d='M12 3v4M12 17v4M3 12h4M17 12h4'/><circle cx='12' cy='12' r='1.5' fill='currentColor'/>",
  navigation: "<path d='M3 11l18-8-8 18-3-7-7-3z'/>",
  clipboardcheck: "<rect x='6' y='4' width='12' height='16' rx='1.5'/><path d='M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1'/><path d='M9 13l2 2 4-4'/>",
  gitcompare: "<circle cx='6' cy='6' r='2.5'/><circle cx='18' cy='18' r='2.5'/><path d='M6 8.5V13a4 4 0 0 0 4 4h4M18 15.5V11a4 4 0 0 0-4-4h-4'/>",
  scan: "<path d='M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2'/><path d='M4 12h16'/>",
  usercheck: "<circle cx='9' cy='8' r='3'/><path d='M2 20c0-3.3 3-6 7-6s7 2.7 7 6'/><path d='M17 11l2 2 3-4'/>",
  userplus: "<circle cx='9' cy='8' r='3'/><path d='M2 20c0-3.3 3-6 7-6s7 2.7 7 6'/><path d='M19 8v6M16 11h6'/>",
  server: "<rect x='3' y='4' width='18' height='7' rx='1.5'/><rect x='3' y='13' width='18' height='7' rx='1.5'/><path d='M7 7.5h.01M7 16.5h.01'/>",
  link: "<path d='M9 15l6-6'/><path d='M13 5l1.5-1.5a3.5 3.5 0 0 1 5 5L18 10'/><path d='M11 19l-1.5 1.5a3.5 3.5 0 0 1-5-5L6 14'/>",
  refreshcw: "<path d='M21 12a9 9 0 1 1-3-6.7'/><path d='M21 3v6h-6'/>",
  send: "<path d='M22 2L11 13'/><path d='M22 2l-7 20-4-9-9-4z'/>",
  archive: "<rect x='3' y='4' width='18' height='4' rx='1'/><path d='M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8'/><path d='M10 13h4'/>",
  info: "<circle cx='12' cy='12' r='9'/><path d='M12 8h.01M11 12h1v5h1'/>",
  play: "<path d='M6 4l14 8-14 8z'/>",
  save: "<path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'/><path d='M7 3v5h9V3'/><path d='M7 21v-8h10v8'/>",
  circle: "<circle cx='12' cy='12' r='9'/>",
};

function icon(name, size = 18, cssClass = "") {
  const key = String(name).toLowerCase().replace(/-/g, "");
  const path = ICON_PATHS[key] || ICON_PATHS.circle;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cssClass}" aria-hidden="true">${path}</svg>`;
}

// ---- Colorful icon chips ----
// Deterministic color per icon name (same icon always gets the same color) picked from a curated palette.
const ICON_PALETTE = ["#2563EB", "#16A34A", "#D97706", "#DC2626", "#7C3AED", "#0D9488", "#DB2777", "#0891B2", "#CA8A04", "#4F46E5", "#059669", "#EA580C"];
function iconColor(name) {
  const key = String(name).toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ICON_PALETTE[hash % ICON_PALETTE.length];
}
function iconChip(name, size = 16, chipSize = 30) {
  const color = iconColor(name);
  return `<span class="ac-icon-chip" style="width:${chipSize}px;height:${chipSize}px;background:${color}22;color:${color};">${icon(name, size)}</span>`;
}

window.icon = icon;
window.iconColor = iconColor;
window.iconChip = iconChip;
