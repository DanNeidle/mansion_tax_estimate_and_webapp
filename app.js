// © Tax Policy Associates 2025
// 
// ------------- CONFIG / STATE -------------

const BAND_COLUMNS = [
  "band_A",
  "band_B",
  "band_C",
  "band_D",
  "band_E",
  "band_F",
  "band_G",
  "band_H",
  "band_I"
];

const ENGLAND_BOUNDS = L.latLngBounds(
  [49.8, -6.5],
  [55.9, 1.8]
);

const colorRamp = [
  '#f7fbff',
  '#c6dbef',
  '#9ecae1',
  '#4292c6',
  '#0868ac',
  '#08306b'
];

const BAND_COLORS = {
  band_A: "#f7fbff",
  band_B: "#deebf7",
  band_C: "#c6dbef",
  band_D: "#9ecae1",
  band_E: "#6baed6",
  band_F: "#4292c6",
  band_G: "#2171b5",
  band_H: "#08519c",
  band_I: "#08306b"
};

const TRANSACTION_COLORS = {
  tx_2m_to_2_5m_count: "#fbb4b9",
  tx_2_5m_to_3_5m_count: "#f768a1",
  tx_3_5m_to_5m_count: "#c51b8a",
  tx_over_5m_count: "#7a0177"
};

const TRANSACTION_BAR_SEGMENTS = [
  { key: "tx_2m_to_2_5m_count", label: "£2m-£2.5m" },
  { key: "tx_2_5m_to_3_5m_count", label: "£2.5m-£3.5m" },
  { key: "tx_3_5m_to_5m_count", label: "£3.5m-£5m" },
  { key: "tx_over_5m_count", label: "£5m+" }
];

const TRANSACTION_METRICS = [
  { value: "tx_estimated_revenue", label: "Estimated mansion tax revenue", type: "amount" },
  { value: "tx_2m_plus_count", label: "Within mansion tax", type: "count", countField: "tx_2m_plus_count" },
  { value: "tx_2m_to_2_5m_count", label: "£2m - £2.5m", type: "count", countField: "tx_2m_to_2_5m_count" },
  { value: "tx_2_5m_to_3_5m_count", label: "£2.5m - £3.5m", type: "count", countField: "tx_2_5m_to_3_5m_count" },
  { value: "tx_3_5m_to_5m_count", label: "£3.5m - £5m", type: "count", countField: "tx_3_5m_to_5m_count" },
  { value: "tx_over_5m_count", label: "£5m+", type: "count", countField: "tx_over_5m_count" },
];

const TRANSACTION_METRIC_MAP = TRANSACTION_METRICS.reduce((acc, metric) => {
  acc[metric.value] = metric;
  return acc;
}, {});

const SURCHARGE_RATE_MAP = {
  tx_2m_to_2_5m_count: 2500,
  tx_2_5m_to_3_5m_count: 3500,
  tx_3_5m_to_5m_count: 5000,
  tx_over_5m_count: 7500,
};

const POSTCODE_SURCHARGE_FIELDS = [
  { key: "£2m - £2.5m", label: "£2m-£2.5m", color: TRANSACTION_COLORS.tx_2m_to_2_5m_count },
  { key: "£2.5m - £3.5m", label: "£2.5m-£3.5m", color: TRANSACTION_COLORS.tx_2_5m_to_3_5m_count },
  { key: "£3.5m - £5m", label: "£3.5m-£5m", color: TRANSACTION_COLORS.tx_3_5m_to_5m_count },
  { key: "£5m+", label: "£5m+", color: TRANSACTION_COLORS.tx_over_5m_count },
];

const DATASET_OPTIONS = {
  mansion_tax_postcodes: { label: "Mansion tax postcodes" },
  mansion_tax: { label: "Mansion tax - constituencies" },
  council_tax: { label: "Council tax bands" },
  house_price: { label: "Median house price (2025)" },
  house_price_change: { label: "House price change 1995-2025" }
};

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_EMAIL = "info@taxpolicy.org.uk";
const GEO_DEFAULT_LANGUAGE = (typeof navigator !== "undefined" && navigator.language)
  ? navigator.language
  : "en";
const POSTCODE_SEARCH_MIN_LENGTH = 3;
const GEOCODE_DEBOUNCE_MS = 450;
const PLACE_TYPE_ZOOMS = {
  continent: 4,
  ocean: 4,
  sea: 5,
  archipelago: 7,
  country: 6,
  state: 8,
  province: 8,
  region: 8,
  state_district: 9,
  district: 10,
  county: 10,
  municipality: 11,
  borough: 12,
  city: 12,
  city_district: 13,
  town: 13,
  village: 14,
  hamlet: 15,
  suburb: 15,
  neighbourhood: 16,
  neighborhood: 16,
  locality: 16,
  quarter: 15,
  postcode: 16,
  postal_code: 16,
  road: 17,
  street: 17,
  residential: 17,
  track: 17,
  footway: 17,
  path: 17,
  service: 17,
  motorway: 15,
  trunk: 15,
  primary: 15,
  secondary: 16,
  tertiary: 16,
  airport: 13,
  aerodrome: 13,
  railway: 16,
  station: 16,
  platform: 17,
  bus_stop: 17,
  tram_stop: 17,
  industrial: 17,
  commercial: 17,
  retail: 17,
  park: 14,
  forest: 12,
  island: 10,
  lake: 10,
  harbour: 14,
  address: 18,
  building: 18,
  house: 18,
  apartments: 18,
};
const POSTCODE_MARKER_COLOR = "#1133AF";
const PLACE_CLASS_ZOOMS = {
  boundary: 9,
  place: 12,
  natural: 10,
  landuse: 13,
  leisure: 14,
  waterway: 12,
  aeroway: 13,
  highway: 17,
  railway: 16,
  amenity: 17,
  tourism: 16,
  shop: 17,
  office: 17,
};

const BAND_LABELS = {
  band_A: "Band A",
  band_B: "Band B",
  band_C: "Band C",
  band_D: "Band D",
  band_E: "Band E",
  band_F: "Band F",
  band_G: "Band G",
  band_H: "Band H",
  band_I: "Band I"
};

const POSTCODE_GEOJSON_URL = "postcode_sales_by_bracket.geojson";
const CONSTITUENCY_GEOJSON_URL = "constituency_council_tax_bands.geojson";
const DATA_MANIFEST_URL = "map_data_manifest.json";

let geojsonData = null;
let geojsonLayer = null;
let postcodeGeojsonData = null;
let postcodeClusterLayer = null;
let breaks = null;
let constituencyIndex = [];
let constituencyPropsByCode = new Map();
let layerIndex = new Map();
let postcodeIndex = [];
let currentSearchMatches = [];
let searchControlInitialized = false;
let activeResultIndex = -1;
let selectedLayer = null;
let selectedDataset = "mansion_tax_postcodes";
let selectedBand = "band_H";
let selectedTransactionMetric = "tx_estimated_revenue";
let selectedPostcodeProps = null;
const DEFAULT_INFO_TITLE = "Constituency info";
const DEFAULT_STREET_INFO_TITLE = "Click on a postcode marker";
let globalStatMaximums = {
  price2025: 0,
  changePct: 0,
  transactions: 0,
  surchargeProperties: 0,
};

const searchInput = document.getElementById("constituency-search");
const searchResultsEl = document.getElementById("search-results");
const searchClearButton = document.getElementById("search-clear");
const searchLabelEl = document.querySelector('label[for="constituency-search"]');
const infoPanel = document.getElementById("info-panel-content");
const legendPanel = document.getElementById("legend-panel");
const uiPanel = document.getElementById("ui-panel");
const panelHandle = document.getElementById("ui-panel-handle");
const metricSelect = document.getElementById("metric-select");
const metricSection = document.getElementById("metric-section");
const metricLabelEl = document.getElementById("metric-label");
const datasetSelect = document.getElementById("dataset-select");
const infoPanelContainer = document.getElementById("info-panel-panel");
const infoPanelHandle = document.getElementById("info-panel-handle");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingProgress = document.getElementById("loading-progress");
const loadingProgressBar = document.getElementById("loading-progress-bar");
setInfoPanelHeader(DEFAULT_INFO_TITLE);
const MAX_SEARCH_RESULTS = 8;
let pendingGeocodeController = null;
let lastGeocodeQuery = "";
let pendingGeocodeTimeout = null;
const TOTAL_DATASET_STEPS = 2;
const datasetSizeHints = {
  [CONSTITUENCY_GEOJSON_URL]: 0,
  [POSTCODE_GEOJSON_URL]: 0,
};
let byteProgressEnabled = false;
let expectedTotalBytes = 0;
let totalBytesLoaded = 0;
let completedDatasetSteps = 0;
let loadingOverlayDismissed = false;

function ensurePanelToggle(panelKey, headerEl) {
  if (!headerEl) return null;
  let toggle = headerEl.querySelector(".panel-toggle");
  if (toggle) return toggle;

  toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "panel-toggle";
  toggle.dataset.panelKey = panelKey;
  toggle.setAttribute("aria-expanded", "true");
  toggle.setAttribute("aria-label", "Minimise panel");

  const srOnly = document.createElement("span");
  srOnly.className = "sr-only";
  srOnly.textContent = "Minimise panel";
  toggle.appendChild(srOnly);

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  icon.classList.add("panel-toggle-icon");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M6 9l6 6 6-6");
  icon.appendChild(path);
  toggle.appendChild(icon);

  headerEl.appendChild(toggle);
  return toggle;
}

function updateSearchModeLabel() {
  if (!searchLabelEl || !searchInput) return;
  if (selectedDataset === "mansion_tax_postcodes") {
    searchLabelEl.textContent = "Search postcode or place";
    searchInput.placeholder = "e.g. W8 5SA or Kensington";
  } else {
    searchLabelEl.textContent = "Search constituency";
    searchInput.placeholder = "Start typing…";
  }
}

const panelConfigs = {
  controls: {
    element: uiPanel,
    toggle: ensurePanelToggle("controls", panelHandle),
  },
  info: {
    element: infoPanelContainer,
    toggle: ensurePanelToggle("info", infoPanelHandle),
  },
};

const compactViewportQuery = window.matchMedia("(max-width: 640px)");
const panelState = {
  controls: compactViewportQuery.matches,
  info: compactViewportQuery.matches,
};

const LOAD_PROGRESS_BASE = 5;
const LOAD_PROGRESS_RANGE = 85;
const SYNTHETIC_TARGET_RATIO = 0.85;
const SYNTHETIC_MIN_STEP_RATIO = 0.02;
const SYNTHETIC_TICK_MS = 160;
const SYNTHETIC_INITIAL_DELAY_MS = 180;
let syntheticBytes = 0;

function setLoadingProgress(percent) {
  if (!loadingProgressBar) return;
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  loadingProgressBar.style.width = `${clamped}%`;
  if (loadingProgress) {
    loadingProgress.setAttribute("aria-valuenow", String(Math.round(clamped)));
  }
}

function updateByteProgress() {
  if (!byteProgressEnabled) return;
  const total = Math.max(expectedTotalBytes, 1);
  const displayBytes = Math.min(totalBytesLoaded + syntheticBytes, expectedTotalBytes);
  const ratio = Math.min(displayBytes / total, 1);
  const percent = LOAD_PROGRESS_BASE + ratio * LOAD_PROGRESS_RANGE;
  setLoadingProgress(percent);
}

function recordBytesLoaded(bytes) {
  if (!byteProgressEnabled) return;
  if (!Number.isFinite(bytes) || bytes <= 0) return;
  const total = Math.max(expectedTotalBytes, 1);
  totalBytesLoaded = Math.min(totalBytesLoaded + bytes, total);
  updateByteProgress();
}

function markDatasetStepComplete() {
  if (byteProgressEnabled) return;
  completedDatasetSteps = Math.min(TOTAL_DATASET_STEPS, completedDatasetSteps + 1);
  const ratio = completedDatasetSteps / TOTAL_DATASET_STEPS;
  const percent = LOAD_PROGRESS_BASE + ratio * LOAD_PROGRESS_RANGE;
  setLoadingProgress(percent);
}

function finalizeDatasetProgress(loadedBytes, sizeHint) {
  if (byteProgressEnabled) {
    const expected = Number(sizeHint);
    if (Number.isFinite(expected) && expected > loadedBytes) {
      recordBytesLoaded(expected - loadedBytes);
    }
    return;
  }
  markDatasetStepComplete();
}

function applyDataManifest(manifest) {
  if (!manifest || typeof manifest !== "object") return;
  const datasets = manifest.datasets || {};
  let total = 0;
  const manifestMap = [
    { key: "constituency", url: CONSTITUENCY_GEOJSON_URL },
    { key: "postcode", url: POSTCODE_GEOJSON_URL },
  ];

  manifestMap.forEach(entry => {
    const manifestEntry = datasets[entry.key];
    if (!manifestEntry) return;
    const bytes = Number(manifestEntry.bytes);
    if (Number.isFinite(bytes) && bytes > 0) {
      datasetSizeHints[entry.url] = bytes;
      total += bytes;
    }
  });

  if (total > 0) {
    byteProgressEnabled = true;
    expectedTotalBytes = total;
    totalBytesLoaded = 0;
    updateByteProgress();
  }
}

function fetchDataManifest() {
  return fetch(DATA_MANIFEST_URL)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load data manifest: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      applyDataManifest(data);
    });
}

function estimateByteLengthFromText(str) {
  if (typeof str !== "string" || !str.length) {
    return 0;
  }
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str).length;
  }
  if (typeof Blob !== "undefined") {
    try {
      return new Blob([str]).size;
    } catch (err) {
      /* ignore */
    }
  }
  return str.length;
}

function addSyntheticBytes(amount) {
  if (!byteProgressEnabled) return 0;
  const candidate = Number(amount);
  if (!Number.isFinite(candidate) || candidate <= 0) return 0;
  const available = Math.max(expectedTotalBytes - totalBytesLoaded - syntheticBytes, 0);
  const increment = Math.min(candidate, available);
  if (increment <= 0) return 0;
  syntheticBytes += increment;
  updateByteProgress();
  return increment;
}

function removeSyntheticBytes(amount) {
  if (!byteProgressEnabled) return 0;
  const candidate = Number(amount);
  if (!Number.isFinite(candidate) || candidate <= 0) return 0;
  const decrement = Math.min(candidate, syntheticBytes);
  if (decrement <= 0) return 0;
  syntheticBytes -= decrement;
  updateByteProgress();
  return decrement;
}

function startSyntheticProgress(expectedSize) {
  if (!byteProgressEnabled) return null;
  const size = Number(expectedSize);
  if (!Number.isFinite(size) || size <= 0) return null;
  const target = Math.max(size * SYNTHETIC_TARGET_RATIO, size * 0.5);
  const minStep = Math.max(size * SYNTHETIC_MIN_STEP_RATIO, 2000);
  const controller = {
    target,
    progressed: 0,
    active: true,
    timer: null,
  };

  function scheduleTick(delay = SYNTHETIC_TICK_MS) {
    controller.timer = setTimeout(() => {
      if (!controller.active) return;
      const remaining = controller.target - controller.progressed;
      if (remaining <= 0) return;
      const nextStep = Math.min(
        remaining,
        minStep + Math.random() * minStep * 0.5
      );
      const added = addSyntheticBytes(nextStep);
      if (added <= 0) {
        scheduleTick(SYNTHETIC_TICK_MS * 1.5);
        return;
      }
      controller.progressed += added;
      scheduleTick(SYNTHETIC_TICK_MS + Math.random() * SYNTHETIC_TICK_MS);
    }, delay);
  }

  controller.stop = () => {
    if (!controller.active) return;
    controller.active = false;
    if (controller.timer) {
      clearTimeout(controller.timer);
    }
    if (controller.progressed > 0) {
      removeSyntheticBytes(controller.progressed);
      controller.progressed = 0;
    }
  };

  scheduleTick(SYNTHETIC_INITIAL_DELAY_MS);
  return controller;
}

function stopSyntheticProgress(controller) {
  if (!controller || typeof controller.stop !== "function") return;
  controller.stop();
}

function dismissLoadingOverlay() {
  if (!loadingOverlay || loadingOverlayDismissed) return;
  loadingOverlay.classList.add("loading-overlay--hidden");
  loadingOverlayDismissed = true;
}

function finishInitialLoading() {
  setLoadingProgress(100);
  if (!loadingOverlayDismissed) {
    setTimeout(() => {
      dismissLoadingOverlay();
    }, 400);
  }
}

setLoadingProgress(LOAD_PROGRESS_BASE);

function setPanelCollapsed(panelKey, collapsed) {
  if (!panelConfigs[panelKey]) return;
  const { element, toggle } = panelConfigs[panelKey];
  if (!element) return;
  panelState[panelKey] = collapsed;
  element.classList.toggle("panel-collapsed", collapsed);
  if (toggle) {
    toggle.setAttribute("aria-expanded", String(!collapsed));
    const actionLabel = collapsed ? "Restore panel" : "Minimise panel";
    toggle.setAttribute("aria-label", actionLabel);
    const srText = toggle.querySelector(".sr-only");
    if (srText) {
      srText.textContent = actionLabel;
    }
  }
}

function togglePanel(panelKey) {
  setPanelCollapsed(panelKey, !panelState[panelKey]);
}

function ensurePanelExpanded(panelKey) {
  if (panelState[panelKey]) {
    setPanelCollapsed(panelKey, false);
  }
}

Object.entries(panelConfigs).forEach(([key, config]) => {
  if (!config.toggle) return;
  config.toggle.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    togglePanel(key);
  });
});

Object.keys(panelConfigs).forEach(key => {
  setPanelCollapsed(key, panelState[key]);
});

// ------------- MAP INITIALISATION -------------

const map = L.map("map", {
  maxBounds: ENGLAND_BOUNDS.pad(0.2),
  maxBoundsViscosity: 0.8,
  zoomControl: false,
}).fitBounds(ENGLAND_BOUNDS);

// 1. Setup the tile layer (Clean attribution only)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors' // Only the standard credits here
}).addTo(map);

// 2. Move standard Leaflet attribution to Bottom-Left
map.attributionControl.setPosition('bottomleft');

// 3. Create a custom control for Land Registry (Bottom-Right)
const LandRegistryControl = L.Control.extend({
  options: {
    position: 'bottomright'
  },
  onAdd: function(map) {
    const div = L.DomUtil.create('div', 'leaflet-control-attribution leaflet-control custom-legal-box');
    div.innerHTML = '<span class="legal-text">Contains HM Land Registry data © Crown copyright and database right 2025.</span>';
    return div;
  }
});
map.addControl(new LandRegistryControl());


function getDatasetLabel() {
  if (selectedDataset === "mansion_tax") {
    return TRANSACTION_METRIC_MAP[selectedTransactionMetric]?.label || DATASET_OPTIONS[selectedDataset]?.label || "";
  }
  return DATASET_OPTIONS[selectedDataset]?.label || "";
}

function setInfoPanelHeader(text) {
  if (!infoPanelHandle) return;
  let titleEl = infoPanelHandle.querySelector(".panel-title");
  if (!titleEl) {
    // If the title element doesn't exist, create it and prepend it
    // to keep the button on the right.
    titleEl = document.createElement("span");
    titleEl.className = "panel-title";
    infoPanelHandle.prepend(titleEl);
  }
  titleEl.textContent = text || DEFAULT_INFO_TITLE;
}

function getPostcodeDisplayName(props) {
  if (!props) return DEFAULT_STREET_INFO_TITLE;
  return props.postcode_label || props.postcode_clean || DEFAULT_STREET_INFO_TITLE;
}

function setSelectedPostcode(props) {
  selectedPostcodeProps = props || null;
  ensurePanelExpanded("info");
  updateInfo(selectedPostcodeProps, { force: true });
}

function clearPostcodeSelection() {
  selectedPostcodeProps = null;
  if (selectedDataset === "mansion_tax_postcodes") {
    updateInfo(null, { force: true });
  }
}

function getPropsIdentifier(props) {
  if (!props) return null;
  if (props.pcon_code) return String(props.pcon_code).trim();
  if (props.code) return String(props.code).trim();
  if (props.name) return String(props.name).trim();
  return null;
}

function shouldUpdateInfo(props, forceUpdate = false) {
  if (forceUpdate || !props) {
    return true;
  }
  if (!selectedLayer) {
    return false;
  }
  const selectedProps = selectedLayer.feature?.properties;
  if (!selectedProps) {
    return false;
  }
  const selectedId = getPropsIdentifier(selectedProps);
  const propsId = getPropsIdentifier(props);
  if (selectedId && propsId) {
    return selectedId === propsId;
  }
  return props === selectedProps;
}

function renderStatComparisonBar(stat) {
  const hasValue = Number.isFinite(stat.value);
  const hasMax = Number.isFinite(stat.maxValue) && stat.maxValue > 0;

  if (!hasValue || !hasMax) {
    return `
      <div class="stat-bar stat-bar--empty">
        <div class="stat-bar-label">${stat.label}</div>
        <div class="stat-bar-track disabled"></div>
        <div class="stat-bar-empty">No data</div>
      </div>
    `;
  }

  const safeValue = Math.max(stat.value, 0);
  const ratio = Math.min(safeValue / stat.maxValue, 1) * 100;
  const formattedMax = stat.format(stat.maxValue);
  const formattedValue = stat.format(stat.value);
  const isMobile = compactViewportQuery.matches;

  // For mobile, we render the value inside the bar
  if (isMobile) {
    const valueClass = ratio > 50 ? "value-on-left" : "value-on-right";
    return `
      <div class="stat-bar" style="--stat-color:${stat.color};--stat-marker:${ratio}%;">
        <div class="stat-bar-label">${stat.label}</div>
        <div class="stat-bar-axis">
          <span>0</span>
          <span>${formattedMax}</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-marker"></div>
          <div class="stat-bar-value ${valueClass}">${formattedValue}</div>
        </div>
      </div>
    `;
  }

  // Desktop version is unchanged
  return `
    <div class="stat-bar" style="--stat-color:${stat.color};--stat-marker:${ratio}%;">
      <div class="stat-bar-label">${stat.label}</div>
      <div class="stat-bar-axis">
        <span>0</span>
        <span>${formattedMax}</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-marker"></div>
      </div>
      <div class="stat-bar-value">${formattedValue}</div>
    </div>
  `;
}

function buildConstituencySections(props = {}, options = {}) {
  const { includeCouncilTax = true } = options;
  if (!props) {
    return {
      name: DEFAULT_INFO_TITLE,
      sectionsHtml: '<div class="info-section"><div class="stacked-bar-note">No constituency data available.</div></div>',
    };
  }

  const name = props.name || props.pcon_code || "Unknown constituency";
  const bandStats = calculateBandStats(props);
  const priceInfo = getHousePriceInfo(props);
  const txInfo = getTransactionInfo(props);

  const transactionBar = buildTransactionBar(txInfo);
  const surchargePropertiesMinibar = renderStatComparisonBar({
    label: "Mansion tax properties",
    value: txInfo.counts.tx_2m_plus_count,
    maxValue: globalStatMaximums.surchargeProperties,
    format: formatCount,
    color: "#F15BB5",
  });
  const transactionSection = `
    <div class="info-section">
      <div class="stat-bars">${surchargePropertiesMinibar}</div>
      ${transactionBar}
    </div>`;

  const councilTaxBar = buildCouncilTaxBar(bandStats);
  const councilTaxSection = `
    <div class="info-section">
      <h5>Council tax bands – number of properties</h5>
      ${councilTaxBar}
    </div>`;

  const medianPriceMinibar = renderStatComparisonBar({
    label: "Median price (2025)",
    value: priceInfo.price2025,
    maxValue: globalStatMaximums.price2025,
    format: formatCurrency,
    color: "#1133AF",
  });

  const priceChangeMinibar = renderStatComparisonBar({
    label: "Price change since 1995",
    value: priceInfo.changePct,
    maxValue: globalStatMaximums.changePct,
    format: value => formatPercent(value, 1),
    color: "#0E9C8F",
  });

  const marketSnapshotSection = `
    <div class="info-section">
      <h5>Constituency market snapshot</h5>
      <div class="stat-bars">
        ${medianPriceMinibar}
        ${priceChangeMinibar}
      </div>
    </div>`;

  const sections = [
    transactionSection,
  ];
  if (includeCouncilTax) {
    sections.push(councilTaxSection);
  }
  sections.push(marketSnapshotSection);

  const sectionsHtml = sections.join("").trim();

  return { name, sectionsHtml };
}

function renderPostcodeInfo(props) {
  if (!infoPanel) return;
  if (!props) {
    setInfoPanelHeader(DEFAULT_STREET_INFO_TITLE);
    infoPanel.innerHTML = `
      <div class="info-section">
        <div class="stacked-bar-note">Select a street marker to view mansion tax properties.</div>
      </div>`;
    return;
  }

  const name = getPostcodeDisplayName(props);
  setInfoPanelHeader(name);
  const barChart = buildPostcodeBar(props);

  const streetSection = `
    <div class="info-section constituency-summary">
      <h4 class="constituency-heading">Mansion tax properties at this postcode</h4>
      ${barChart}
    </div>
  `;

  const constituencyCode = (props.pcon_code || "").trim();
  const constituencyProps = constituencyPropsByCode.get(constituencyCode);
  let constituencySection = `
    <div class="info-section">
      <div class="stacked-bar-note">No constituency data available for this postcode.</div>
    </div>
  `;
  if (constituencyProps) {
    const { name: constituencyName, sectionsHtml } = buildConstituencySections(constituencyProps, { includeCouncilTax: false });
    constituencySection = `
      <div class="info-section constituency-summary">
        <h4 class="constituency-heading">${constituencyName}</h4>
      </div>
      ${sectionsHtml}
    `;
  }

  infoPanel.innerHTML = (streetSection + constituencySection).trim();
}

function updateInfo(props, options = {}) {
  if (!infoPanel) return;

  if (selectedDataset === "mansion_tax_postcodes") {
    renderPostcodeInfo(props);
    return;
  }

  const { force = false } = options;
  if (!shouldUpdateInfo(props, force)) {
    return;
  }

  const datasetLabel = getDatasetLabel();
  const placeholderLabel = selectedDataset === "council_tax"
    ? `${BAND_LABELS[selectedBand]} share`
    : datasetLabel;

  if (!props) {
    setInfoPanelHeader(DEFAULT_INFO_TITLE);
    infoPanel.innerHTML = "";
    return;
  }

  const { name, sectionsHtml } = buildConstituencySections(props);
  setInfoPanelHeader(name);
  infoPanel.innerHTML = sectionsHtml;
}

function updateLegend(breakValues = []) {
  if (!legendPanel) return;

  if (selectedDataset === "mansion_tax_postcodes") {
    const legendLabel = DATASET_OPTIONS[selectedDataset]?.label || "Mansion tax postcodes";
    legendPanel.innerHTML = `<strong>${legendLabel}</strong><br><span>Each marker shows a postcode with at least one £2m+ property. Important: marker locations are approximate. Individual properties are not shown; only postcodes.</span>`;
    return;
  }

  const label = selectedDataset === "council_tax"
    ? `${BAND_LABELS[selectedBand]} share`
    : getDatasetLabel();
  legendPanel.innerHTML = `<strong>${label}</strong><br>`;

  if (!breakValues || breakValues.length === 0) {
    legendPanel.innerHTML += "<span>No data</span>";
    return;
  }

  for (let i = 0; i < breakValues.length; i++) {
    const from = breakValues[i];
    const to = breakValues[i + 1];
    const color = getColor(from + 1e-9, breakValues);
    const fromLabel = formatLegendValue(from);
    const toLabel = typeof to === "number" ? formatLegendValue(to) : null;

    legendPanel.innerHTML +=
      `<i style="background:${color}"></i> ` +
      (toLabel ? `${fromLabel} &ndash; ${toLabel}<br>` : `${fromLabel}+<br>`);
  }
}

// ------------- DATA / STYLE FUNCTIONS -------------

function toNumberOrNull(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (cleaned === "") return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function safeNumber(value) {
  const num = toNumberOrNull(value);
  return num === null ? 0 : num;
}

function calculateBandStats(props = {}) {
  const values = {};
  let total = 0;
  for (const band of BAND_COLUMNS) {
    const value = safeNumber(props[band]);
    values[band] = value;
    total += value;
  }
  return { values, total };
}

function calculateEstimatedRevenue(counts = {}) {
  let total = 0;
  Object.entries(SURCHARGE_RATE_MAP).forEach(([key, rate]) => {
    const count = toNumberOrNull(counts[key]);
    if (Number.isFinite(count) && Number.isFinite(rate) && count > 0 && rate > 0) {
      total += count * rate;
    }
  });
  return total;
}

function getBandPercent(value, total) {
  return total > 0 ? (value / total) * 100 : 0;
}

function formatPercent(value, fractionDigits = 2) {
  if (!Number.isFinite(value)) return "0%";
  return value.toFixed(fractionDigits) + "%";
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "0";
  return Math.round(value).toLocaleString("en-GB");
}

function formatCount(value) {
  if (!Number.isFinite(value)) return "n/a";
  return Math.round(value).toLocaleString("en-GB");
}

function formatCurrency(value) {
  if (!Number.isFinite(value)) return "n/a";
  return "£" + Math.round(value).toLocaleString("en-GB");
}

function formatCurrencyCompact(value) {
  if (!Number.isFinite(value)) return "n/a";
  if (Math.abs(value) >= 1_000_000) {
    return "£" + (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  return formatCurrency(value);
}

function formatCurrencyShort(value) {
  if (!Number.isFinite(value)) return "n/a";
  const absVal = Math.abs(value);
  if (absVal >= 1_000_000) {
    const millions = value / 1_000_000;
    return "£" + millions.toFixed(millions >= 10 ? 0 : 1).replace(/\.0$/, "") + "m";
  }
  if (absVal >= 1_000) {
    const thousands = value / 1_000;
    return "£" + thousands.toFixed(thousands >= 10 ? 0 : 1).replace(/\.0$/, "") + "k";
  }
  return formatCurrency(value);
}

function formatChange(value, fractionDigits = 1) {
  if (!Number.isFinite(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return sign + value.toFixed(fractionDigits) + "%";
}

function formatLegendValue(value) {
  if (selectedDataset === "house_price") {
    return formatCurrency(value);
  }
  if (selectedDataset === "mansion_tax") {
    const metric = TRANSACTION_METRIC_MAP[selectedTransactionMetric];
    if (metric && metric.type === "count") {
      return formatCount(value);
    }
    if (metric && metric.type === "amount") {
      return formatCurrencyShort(value);
    }
    return formatPercent(value, 1);
  }
  const digits = 1;
  return formatPercent(value, digits);
}

function getHousePriceInfo(props = {}) {
  return {
    price2025: toNumberOrNull(props.median_price_2025),
    price1995: toNumberOrNull(props.median_price_1995),
    changePct: toNumberOrNull(props.median_price_change_pct)
  };
}

function getTransactionInfo(props = {}) {
  const counts = {
    tx_2m_to_2_5m_count: toNumberOrNull(props.tx_2m_to_2_5m_count),
    tx_2_5m_to_3_5m_count: toNumberOrNull(props.tx_2_5m_to_3_5m_count),
    tx_3_5m_to_5m_count: toNumberOrNull(props.tx_3_5m_to_5m_count),
    tx_over_5m_count: toNumberOrNull(props.tx_over_5m_count),
    tx_2m_plus_count: toNumberOrNull(props.tx_2m_plus_count),
    tx_total_count: toNumberOrNull(props.tx_total_count),
    tx_rejected_count: toNumberOrNull(props.tx_rejected_count)
  };

  // Percents are no longer used for transactions, return empty object
  const percents = {};

  const estimatedRevenue = calculateEstimatedRevenue(counts);

  return { counts, percents, estimatedRevenue };
}

function hasDataForProps(props = {}) {
  if (selectedDataset === "council_tax") {
    const { total } = calculateBandStats(props);
    return total > 0;
  }
  if (selectedDataset === "house_price") {
    const { price2025 } = getHousePriceInfo(props);
    return Number.isFinite(price2025);
  }
  if (selectedDataset === "house_price_change") {
    const { changePct } = getHousePriceInfo(props);
    return Number.isFinite(changePct);
  }
  const txInfo = getTransactionInfo(props);
  const metric = TRANSACTION_METRIC_MAP[selectedTransactionMetric];
  if (!metric) return false;
  if (metric.type === "count") {
    const value = txInfo.counts[metric.countField];
    return Number.isFinite(value) && value > 0;
  }
  if (metric.type === "amount") {
    const amount = txInfo.estimatedRevenue;
    return Number.isFinite(amount) && amount > 0;
  }
  const pct = txInfo.percents[metric.percentField];
  return Number.isFinite(pct);
}



function buildCouncilTaxBar(bandStats) {
  const { values, total } = bandStats;
  if (!total) {
    return '<div class="stacked-bar-note">No council tax data</div>';
  }
  const isMobile = compactViewportQuery.matches;
  const items = BAND_COLUMNS.map((band, index) => {
    const value = values[band] || 0;
    if (band === "band_I" && value <= 0) {
      return null;
    }
    const percent = getBandPercent(value, total);
    const labelLetter = band.split("_")[1]?.toUpperCase() || "";
    return {
      label: labelLetter,
      value: percent,
      displayValue: formatPercent(percent, isMobile ? 0 : 1),
      tooltip: `${BAND_LABELS[band]}: ${formatPercent(percent, 1)} (${formatNumber(value)} properties)`,
      color: BAND_COLORS[band] || "#ccc",
      delay: index * 0.06
    };
  }).filter(Boolean);
  return buildBarChart(items, { mode: "percent" });
}

function buildTransactionBar(txInfo) {
  const total = txInfo.counts.tx_2m_plus_count;
  if (!Number.isFinite(total) || total <= 0) {
    return '<div class="stacked-bar-note">No transaction data</div>';
  }

  const items = TRANSACTION_BAR_SEGMENTS.map((segment, index) => {
    const value = txInfo.counts[segment.key];
    const count = Number.isFinite(value) && value > 0 ? value : 0;
    const percent = (total > 0 ? (count / total) * 100 : 0);
    return {
      label: segment.label,
      value: count,
      displayValue: formatCount(count),
      tooltip: `${segment.label}: ${formatCount(count)} (${formatPercent(percent, 1)})`,
      color: TRANSACTION_COLORS[segment.key] || "#bbb",
      delay: index * 0.06
    };
  });
  const maxValue = items.reduce((max, item) => Math.max(max, item.value || 0), 0);
  return buildBarChart(items, { mode: "count", maxValue, compact: true });
}

function buildPostcodeBar(props = {}) {
  const items = POSTCODE_SURCHARGE_FIELDS.map((field, index) => {
    const value = toNumberOrNull(props[field.key]);
    const count = Number.isFinite(value) && value > 0 ? value : 0;
    return {
      label: field.label,
      value: count,
      displayValue: formatCount(count),
      tooltip: `${field.label}: ${formatCount(count)}`,
      color: field.color || "#7a7a7a",
      delay: index * 0.05,
    };
  });
  const maxValue = items.reduce((max, item) => Math.max(max, item.value || 0), 0);
  if (maxValue <= 0) {
    return '<div class="stacked-bar-note">No mansion tax properties on record</div>';
  }
  return buildBarChart(items, { mode: "count", maxValue, compact: true });
}

function buildBarChart(items, options = {}) {
  const mode = options.mode || "percent";
  const fallback = '<div class="stacked-bar-note">No data</div>';
  if (!items || items.length === 0) {
    return fallback;
  }
  const values = items.map(item => Number.isFinite(item.value) ? item.value : 0);
  const rawMax = values.reduce((max, value) => Math.max(max, value), 0);
  const effectiveMax = rawMax > 0
    ? rawMax
    : (mode === "percent" ? 100 : 1);
  if (!effectiveMax || effectiveMax <= 0) {
    return fallback;
  }

  const bars = items.map((item, index) => {
    const value = Number.isFinite(item.value) ? item.value : 0;
    const height = effectiveMax > 0 ? Math.max((value / effectiveMax) * 100, 0) : 0;
    const color = item.color || "#3182bd";
    const displayValue = item.displayValue || (mode === "percent" ? formatPercent(value, 1) : formatCount(value));
    const tooltip = item.tooltip || `${item.label || ""}: ${displayValue}`;
    const delay = (item.delay ?? index * 0.08);
    return `
      <div class="bar" title="${tooltip}">
        <div class="bar-track">
          <div class="bar-fill" style="--bar-color:${color};--bar-height:${height}%;--bar-delay:${delay}s;">
              <div class="bar-value">${displayValue}</div>
          </div>
        </div>
        <div class="bar-label">${item.label || ""}</div>
      </div>
    `;
  }).join("");

  const chartClasses = ["bar-chart"];
  if (options.compact) chartClasses.push("compact");

  return `
    <div class="bar-chart-container">
      <div class="${chartClasses.join(" ")}">
        <div class="bar-chart-bars">
          ${bars}
        </div>
      </div>
    </div>
  `;
}

function buildTooltipContent(props = {}) {
  const name = props.name || props.pcon_code || "Unknown constituency";

  if (!hasDataForProps(props)) {
    return `<strong>${name}</strong><br/>No data available`;
  }

  if (selectedDataset === "council_tax") {
    const { values, total } = calculateBandStats(props);
    const selectedValue = values[selectedBand];
    const percent = getBandPercent(selectedValue, total);

    return `
      <strong>${name}</strong><br/>
      ${formatPercent(percent)} in ${BAND_LABELS[selectedBand]}<br/>
      <small>${formatNumber(selectedValue)} properties</small>
    `.trim();
  }

  const { price2025, price1995, changePct } = getHousePriceInfo(props);

  if (selectedDataset === "house_price") {
    return `
      <strong>${name}</strong><br/>
      ${formatCurrency(price2025)} median price (2025)<br/>
      <small>${formatCurrency(price1995)} in 1995</small>
    `.trim();
  }
  if (selectedDataset === "house_price_change") {
    return `
      <strong>${name}</strong><br/>
      ${formatChange(changePct)} since 1995<br/>
      <small>${formatCurrency(price1995)} &rarr; ${formatCurrency(price2025)}</small>
    `.trim();
  }

  const txInfo = getTransactionInfo(props);
  const metric = TRANSACTION_METRIC_MAP[selectedTransactionMetric];
  if (!metric) {
    return `<strong>${name}</strong><br/>No data available`;
  }

  if (metric.type === "count") {
    const count = txInfo.counts[metric.countField];
    return `
      <strong>${name}</strong><br/>
      ${formatNumber(count)} mansion tax properties
    `.trim();
  }

  if (metric.type === "amount") {
    const revenue = txInfo.estimatedRevenue;
    const totalCount = txInfo.counts.tx_2m_plus_count;
    return `
      <strong>${name}</strong><br/>
      ${formatCurrencyCompact(revenue)} estimated revenue<br/>
      <small>${formatNumber(totalCount)} mansion tax properties</small>
    `.trim();
  }

  const pctValue = txInfo.percents[metric.percentField];
  const pct = Number.isFinite(pctValue) ? pctValue : 0;
  const count = txInfo.counts[metric.countField];
  return `
    <strong>${name}</strong><br/>
    ${formatPercent(pct, 1)} of transactions<br/>
    <small>${formatNumber(count)} sales</small>
  `.trim();
}

function getMetricValue(feature) {
  const props = feature.properties || {};
  if (selectedDataset === "council_tax") {
    const { values, total } = calculateBandStats(props);
    if (!total) return null;
    return getBandPercent(values[selectedBand], total);
  }

  if (selectedDataset === "house_price") {
    const { price2025 } = getHousePriceInfo(props);
    return Number.isFinite(price2025) ? price2025 : null;
  }

  if (selectedDataset === "house_price_change") {
    const { changePct } = getHousePriceInfo(props);
    return Number.isFinite(changePct) ? changePct : null;
  }

  const metric = TRANSACTION_METRIC_MAP[selectedTransactionMetric];
  if (!metric) return null;
  const txInfo = getTransactionInfo(props);
  if (metric.type === "count") {
    const count = txInfo.counts[metric.countField];
    return Number.isFinite(count) ? count : null;
  }
  if (metric.type === "amount") {
    const revenue = txInfo.estimatedRevenue;
    return Number.isFinite(revenue) ? revenue : null;
  }
  const pct = txInfo.percents[metric.percentField];
  return Number.isFinite(pct) ? pct : null;
}

function computeBreaks() {
  if (selectedDataset === 'mansion_tax') {
    const metric = TRANSACTION_METRIC_MAP[selectedTransactionMetric];
    if (metric) {
      if (metric.type === 'count') {
        return [0, 50, 100, 300, 1000, 5000];
      }
      if (metric.type === 'amount') {
        return [0, 100000, 300000, 500000, 1000000, 10000000];
      }
    }
  }

  if (!geojsonData) return [];

  const values = geojsonData.features
    .map(getMetricValue)
    .filter(value => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);

  if (values.length === 0) return [];

  const nClasses = 5;
  const quantileBreaks = [];

  for (let i = 0; i < nClasses; i++) {
    const q = i / nClasses;
    const idx = Math.floor(q * (values.length - 1));
    quantileBreaks.push(values[idx]);
  }
  quantileBreaks.push(values[values.length - 1]);

  return [...new Set(quantileBreaks)];
}

function computeGlobalStatMaximums() {
  if (!geojsonData) return;

  const stats = {
    price2025: 0,
    changePct: 0,
    transactions: 0,
    surchargeProperties: 0,
  };

  geojsonData.features.forEach(feature => {
    const props = feature.properties || {};
    const price = toNumberOrNull(props.median_price_2025);
    if (Number.isFinite(price) && price > stats.price2025) {
      stats.price2025 = price;
    }

    const change = toNumberOrNull(props.median_price_change_pct);
    if (Number.isFinite(change) && change > stats.changePct) {
      stats.changePct = change;
    }

    const tx = toNumberOrNull(props.tx_total_count);
    if (Number.isFinite(tx) && tx > stats.transactions) {
      stats.transactions = tx;
    }

    const surchargeCount = toNumberOrNull(props.tx_2m_plus_count);
    if (Number.isFinite(surchargeCount) && surchargeCount > stats.surchargeProperties) {
      stats.surchargeProperties = surchargeCount;
    }
  });

  globalStatMaximums = stats;
}

function createPostcodeClusterLayer(data) {
  if (!data || !Array.isArray(data.features)) {
    return null;
  }

  if (typeof L.markerClusterGroup !== "function") {
    console.warn("Leaflet.markercluster plugin is unavailable.");
    return null;
  }

  const clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    spiderfyDistanceMultiplier: 1.2,
    iconCreateFunction: cluster => {
      const count = cluster.getChildCount();
      const size = getClusterMarkerSize(count);
      return L.divIcon({
        html: `<span class="postcode-cluster" style="width:${size}px;height:${size}px;"><span class="postcode-cluster-count">${formatCount(count)}</span></span>`,
        className: "postcode-cluster-wrapper",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }
  });

  const pointLayer = L.geoJSON(data, {
    pointToLayer: (feature, latlng) => {
      const props = feature.properties || {};
      const label = getPostcodeDisplayName(props);
      const hvCount = toNumberOrNull(props.hv_count);
      const marker = L.marker(latlng, {
        title: label,
        riseOnHover: true,
        icon: getPostcodeMarkerIcon(hvCount),
      });
      const tooltipContent = `
        <strong>${label}</strong><br/>
        ${formatCount(hvCount)} mansion tax properties
      `;
      marker.bindTooltip(tooltipContent, { direction: "top" });
      marker.on("click", () => {
        setSelectedPostcode(props);
      });
      return marker;
    }
  });

  clusterGroup.addLayer(pointLayer);
  return clusterGroup;
}

function getPostcodeMarkerIcon(count) {
  const baseSize = 36;
  const size = count > 25 ? 50 : count > 10 ? 42 : baseSize;
  const html = `<span class="postcode-circle-marker" style="width:${size}px;height:${size}px;"></span>`;
  return L.divIcon({
    html,
    className: "postcode-circle-marker-wrapper",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function getClusterMarkerSize(count) {
  if (count > 200) return 80;
  if (count > 100) return 68;
  if (count > 50) return 58;
  return 48;
}

function getColor(d, breaksArr) {
  if (!breaksArr || breaksArr.length < 2) return "#f0f0f0";

  for (let i = breaksArr.length - 1; i >= 0; i--) {
    if (d >= breaksArr[i]) {
      return colorRamp[Math.min(i, colorRamp.length - 1)];
    }
  }
  return colorRamp[0];
}

function style(feature) {
  const props = feature.properties || {};
  const value = getMetricValue({ properties: props });
  const hasData = typeof value === "number" && Number.isFinite(value);

  if (!hasData) {
    return {
      fillColor: "transparent",
      weight: 0.6,
      opacity: 1,
      color: "#cccccc",
      dashArray: "2 4",
      fillOpacity: 0,
      interactive: false
    };
  }

  return {
    fillColor: getColor(value, breaks),
    weight: 0.5,
    opacity: 1,
    color: "#ffffff",
    dashArray: "",
    fillOpacity: 0.8
  };
}

function applyHighlight(layer, { updateInfoPanel = false } = {}) {
  if (!layer) return;
  const props = layer.feature?.properties || {};
  const hasData = hasDataForProps(props);

  layer.setStyle({
    weight: 2,
    color: "#1133AF",
    fillOpacity: hasData ? 0.9 : 0
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  if (updateInfoPanel) {
    updateInfo(props, { force: true });
  }
}

function resetLayerStyle(layer) {
  if (!layer || !geojsonLayer) return;
  geojsonLayer.resetStyle(layer);
}

function refreshInfoPanel() {
  if (selectedDataset === "mansion_tax_postcodes") {
    updateInfo(selectedPostcodeProps || null, { force: true });
    return;
  }
  if (selectedLayer) {
    updateInfo(selectedLayer.feature?.properties);
  } else {
    updateInfo(null);
  }
}

function setSelectedLayer(layer) {
  if (!layer) return;
  ensurePanelExpanded("info");

  if (selectedLayer && selectedLayer !== layer) {
    resetLayerStyle(selectedLayer);
  }

  selectedLayer = layer;
  applyHighlight(layer, { updateInfoPanel: true });
}

function clearSelectedLayer() {
  if (selectedDataset === "mansion_tax_postcodes") {
    clearPostcodeSelection();
    return;
  }
  if (selectedLayer) {
    resetLayerStyle(selectedLayer);
    selectedLayer = null;
  }
  updateInfo(null);
  setInfoPanelHeader(DEFAULT_INFO_TITLE);
}

function makePanelDraggable(panelEl, handleEl) {
  if (!panelEl || !handleEl) return;
  let isDragging = false;
  let pointerId = null;
  const offset = { x: 0, y: 0 };

  function convertToAbsolute() {
    if (panelEl.dataset.absolute === "true") return;
    const rect = panelEl.getBoundingClientRect();
    panelEl.style.position = "fixed";
    panelEl.style.left = `${rect.left}px`;
    panelEl.style.top = `${rect.top}px`;
    panelEl.style.right = "auto";
    panelEl.style.zIndex = "1300";
    panelEl.dataset.absolute = "true";
  }

  function getBounds() {
    const padding = 10;
    const rect = panelEl.getBoundingClientRect();
    const maxLeft = Math.max(padding, window.innerWidth - rect.width - padding);
    const maxTop = Math.max(padding, window.innerHeight - rect.height - padding);
    return {
      minLeft: padding,
      minTop: padding,
      maxLeft,
      maxTop
    };
  }

  function positionWithin(left, top) {
    const bounds = getBounds();
    const clampedLeft = Math.min(Math.max(left, bounds.minLeft), bounds.maxLeft);
    const clampedTop = Math.min(Math.max(top, bounds.minTop), bounds.maxTop);
    panelEl.style.left = `${clampedLeft}px`;
    panelEl.style.top = `${clampedTop}px`;
    panelEl.style.right = "auto";
  }

  function ensureWithinBounds() {
    if (panelEl.dataset.absolute !== "true") return;
    const rect = panelEl.getBoundingClientRect();
    positionWithin(rect.left, rect.top);
  }

  function startDrag(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target.closest(".panel-toggle")) return;
    event.preventDefault();
    convertToAbsolute();
    const rect = panelEl.getBoundingClientRect();
    offset.x = event.clientX - rect.left;
    offset.y = event.clientY - rect.top;
    isDragging = true;
    pointerId = event.pointerId ?? null;
    panelEl.classList.add("dragging");
    if (handleEl.setPointerCapture && pointerId !== null) {
      try {
        handleEl.setPointerCapture(pointerId);
      } catch (err) {
        /* ignore */
      }
    }
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  }

  function onDragMove(event) {
    if (!isDragging) return;
    if (pointerId !== null && event.pointerId !== pointerId) return;
    event.preventDefault();
    const left = event.clientX - offset.x;
    const top = event.clientY - offset.y;
    positionWithin(left, top);
  }

  function stopDrag(event) {
    if (!isDragging) return;
    if (pointerId !== null && event && event.pointerId !== undefined && event.pointerId !== pointerId) return;
    isDragging = false;
    pointerId = null;
    panelEl.classList.remove("dragging");
    window.removeEventListener("pointermove", onDragMove);
    window.removeEventListener("pointerup", stopDrag);
    window.removeEventListener("pointercancel", stopDrag);
    if (handleEl.releasePointerCapture && event?.pointerId !== undefined) {
      try {
        handleEl.releasePointerCapture(event.pointerId);
      } catch (err) {
        /* ignore */
      }
    }
  }

  handleEl.addEventListener("pointerdown", startDrag);
  window.addEventListener("resize", ensureWithinBounds);
}

function highlightFeature(e) {
  applyHighlight(e.target, { updateInfoPanel: false });
}

function resetHighlight(e) {
  const layer = e.target;
  
  // If leaving the selected layer, do absolutely nothing.
  // The data is already there, and we want to keep the map styling.
  if (selectedLayer === layer) {
    return;
  }

  resetLayerStyle(layer);
}

function handleFeatureClick(e) {
  const layer = e.target;
  setSelectedLayer(layer);

  setTimeout(() => {
    layer.openTooltip();
  }, 120);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: handleFeatureClick
  });

  layer.bindTooltip(buildTooltipContent(feature.properties || {}), {
    sticky: true
  });
}

function buildSearchIndex() {
  constituencyIndex = geojsonData.features
    .map(feature => {
      const props = feature.properties || {};
      const name = (props.name || props.pcon_code || "").trim();
      const code = (props.pcon_code || "").trim();
      if (!name || !code) return null;
      return {
        name,
        code,
        searchKey: `${name} ${code}`.toLowerCase(),
        props
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  constituencyPropsByCode = new Map();
  constituencyIndex.forEach(entry => {
    constituencyPropsByCode.set(entry.code, entry.props);
  });

  layerIndex = new Map();
  geojsonLayer.eachLayer(layer => {
    const code = layer.feature?.properties?.pcon_code;
    if (code) {
      layerIndex.set(code.trim(), layer);
    }
  });
}

function buildPostcodeIndex() {
  postcodeIndex = [];
  if (!postcodeGeojsonData || !Array.isArray(postcodeGeojsonData.features)) {
    return;
  }
  postcodeIndex = postcodeGeojsonData.features
    .map(feature => {
      const props = feature.properties || {};
      const label = (props.postcode_label || props.postcode_clean || "").trim();
      const clean = (props.postcode_clean || label).trim();
      if (!label) return null;
      const coords = feature.geometry?.coordinates;
      if (!coords || coords.length < 2) return null;
      const latlng = L.latLng(coords[1], coords[0]);
      return {
        label,
        clean,
        searchKey: `${label} ${clean}`.toLowerCase(),
        latlng,
        props,
      };
    })
    .filter(Boolean);
}

function updateSearchResults(term) {
  if (selectedDataset === "mansion_tax_postcodes") {
    updatePostcodeSearchResults(term);
    return;
  }
  const query = term.trim().toLowerCase();
  activeResultIndex = -1;
  if (!query) {
    currentSearchMatches = [];
    renderSearchResults([]);
    return;
  }

  const matches = constituencyIndex
    .filter(entry => entry.searchKey.includes(query))
    .slice(0, MAX_SEARCH_RESULTS)
    .map(entry => ({
      type: "constituency",
      primaryText: entry.name,
      secondaryText: entry.code,
      payload: entry,
    }));

  currentSearchMatches = matches;
  renderSearchResults(matches);
}

function createPostcodeResult(entry) {
  return {
    type: "postcode",
    primaryText: entry.label,
    secondaryText: entry.clean,
    payload: entry,
  };
}

function cancelGeocodeRequest() {
  if (pendingGeocodeController) {
    pendingGeocodeController.abort();
    pendingGeocodeController = null;
  }
  if (pendingGeocodeTimeout) {
    clearTimeout(pendingGeocodeTimeout);
    pendingGeocodeTimeout = null;
  }
}

function updatePostcodeSearchResults(term) {
  const query = term.trim().toLowerCase();
  activeResultIndex = -1;
  cancelGeocodeRequest();
  if (!query) {
    currentSearchMatches = [];
    renderSearchResults([]);
    return;
  }

  if (query.length < POSTCODE_SEARCH_MIN_LENGTH) {
    currentSearchMatches = [buildMessageResult(`Type at least ${POSTCODE_SEARCH_MIN_LENGTH} characters`)];
    renderSearchResults(currentSearchMatches);
    return;
  }

  const exactMatch = postcodeIndex.find(entry => entry.clean.toLowerCase() === query || entry.label.toLowerCase() === query);
  if (exactMatch) {
    focusOnPostcodeEntry(exactMatch, { zoom: true });
    searchInput.value = exactMatch.label;
    updateSearchInputIndicator(exactMatch.label);
    clearSearchResults();
    return;
  }

  const localMatches = postcodeIndex
    .filter(entry => entry.searchKey.includes(query))
    .slice(0, MAX_SEARCH_RESULTS)
    .map(createPostcodeResult);

  if (localMatches.length > 0) {
    currentSearchMatches = localMatches;
    renderSearchResults(localMatches);
    return;
  }

  pendingGeocodeTimeout = setTimeout(() => {
    pendingGeocodeTimeout = null;
    fetchExternalSearchResults(query);
  }, GEOCODE_DEBOUNCE_MS);
}

function buildMessageResult(text) {
  return {
    type: "message",
    primaryText: text,
    secondaryText: "",
    payload: null,
  };
}

function fetchExternalSearchResults(query) {
  lastGeocodeQuery = query;
  cancelGeocodeRequest();
  const controller = new AbortController();
  pendingGeocodeController = controller;
  currentSearchMatches = [buildMessageResult("Searching wider map…")];
  renderSearchResults(currentSearchMatches);

  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    limit: String(MAX_SEARCH_RESULTS),
    countrycodes: "gb",
    polygon_geojson: "0",
    q: query,
  });
  if (NOMINATIM_EMAIL) {
    params.set("email", NOMINATIM_EMAIL);
  }

  const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;
  fetch(url, {
    headers: {
      "Accept": "application/json",
      "Accept-Language": GEO_DEFAULT_LANGUAGE,
    },
    signal: controller.signal,
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Geocode lookup failed");
      }
      return response.json();
    })
    .then(results => {
      if (lastGeocodeQuery !== query) {
        return;
      }
      const entries = (results || []).slice(0, MAX_SEARCH_RESULTS).map(result => {
        const lat = Number(result.lat);
        const lon = Number(result.lon);
        return {
          type: "external",
          primaryText: result.display_name || query,
          secondaryText: (result.address?.city || result.address?.town || result.address?.village || result.type || ""),
          payload: {
            latlng: Number.isFinite(lat) && Number.isFinite(lon) ? L.latLng(lat, lon) : null,
            place: result,
          },
        };
      }).filter(entry => entry.payload.latlng);
      currentSearchMatches = entries.length ? entries : [buildMessageResult("No matching places found")];
      renderSearchResults(currentSearchMatches);
      if (pendingGeocodeController === controller) {
        pendingGeocodeController = null;
      }
    })
    .catch(() => {
      if (pendingGeocodeController === controller) {
        pendingGeocodeController = null;
      }
      currentSearchMatches = [buildMessageResult("Unable to reach map search. Try again.")];
      renderSearchResults(currentSearchMatches);
    });
}

function renderSearchResults(matches) {
  if (!searchResultsEl) return;
  if (!matches.length) {
    searchResultsEl.innerHTML = "";
    searchResultsEl.classList.remove("visible");
    return;
  }

  searchResultsEl.innerHTML = matches
    .map((entry, index) => {
      const isActive = index === activeResultIndex;
      const activeClass = isActive ? "active" : "";
      const primary = entry.primaryText || entry.name || "";
      const secondary = entry.secondaryText ? `<br><small>${entry.secondaryText}</small>` : "";
      return `
        <li class="${activeClass}" data-result-index="${index}">
          <strong>${primary}</strong>${secondary}
        </li>
      `;
    })
    .join("");

  searchResultsEl.classList.add("visible");

  if (activeResultIndex >= 0) {
    ensureActiveResultVisible();
  }
}

function ensureActiveResultVisible() {
  if (!searchResultsEl) return;
  const activeEl = searchResultsEl.querySelector("li.active");
  if (activeEl && typeof activeEl.scrollIntoView === "function") {
    activeEl.scrollIntoView({ block: "nearest" });
  }
}

function moveActiveResult(delta) {
  if (!currentSearchMatches.length) return;

  if (activeResultIndex === -1) {
    activeResultIndex = delta > 0 ? 0 : currentSearchMatches.length - 1;
  } else {
    activeResultIndex = (activeResultIndex + delta + currentSearchMatches.length) % currentSearchMatches.length;
  }

  renderSearchResults(currentSearchMatches);
}

function getActiveResult() {
  if (activeResultIndex >= 0 && activeResultIndex < currentSearchMatches.length) {
    return currentSearchMatches[activeResultIndex];
  }
  return currentSearchMatches[0];
}

function focusOnConstituency(entry) {
  if (!entry) return;
  const layer = layerIndex.get(entry.code);
  if (!layer) return;

  setSelectedLayer(layer);

  map.fitBounds(layer.getBounds(), {
    padding: [30, 30],
    maxZoom: 12
  });

  setTimeout(() => {
    layer.openTooltip();
  }, 150);
}

function focusOnPostcodeEntry(payload, options = {}) {
  if (!payload) return;
  const latlng = payload.latlng;
  if (latlng) {
    map.setView(latlng, options.zoom ? 16 : 14, { animate: true });
  }
  setSelectedPostcode(payload.props);
}

function focusOnExternalLocation(payload) {
  if (!payload) return;
  const place = payload.place || {};
  const { minZoom, maxZoom } = getMapZoomLimits();
  const suggestedZoom = getSuggestedZoomForPlace(place);
  const safeZoom = Math.max(minZoom, Math.min(suggestedZoom, maxZoom));
  const bounds = getPlaceBounds(place);
  const duration = 0.9;

  if (bounds) {
    map.flyToBounds(bounds, { maxZoom: safeZoom, duration, padding: [30, 30] });
  } else if (payload.latlng) {
    map.flyTo(payload.latlng, safeZoom, { duration });
  }
  clearPostcodeSelection();
}

function getPlaceBounds(place) {
  if (!place || !Array.isArray(place.boundingbox) || place.boundingbox.length !== 4) {
    return null;
  }
  const coords = place.boundingbox.map(value => Number(value));
  if (coords.some(value => !Number.isFinite(value))) return null;
  const south = coords[0];
  const north = coords[1];
  const west = coords[2];
  const east = coords[3];
  return L.latLngBounds(
    [Math.min(south, north), Math.min(west, east)],
    [Math.max(south, north), Math.max(west, east)]
  );
}

function getSuggestedZoomForPlace(place) {
  const FALLBACK = 15;
  if (!place || typeof place !== "object") {
    return FALLBACK;
  }

  const bbox = getPlaceBounds(place);
  if (bbox) {
    const span = Math.max(
      Math.abs(bbox.getNorth() - bbox.getSouth()),
      Math.abs(bbox.getEast() - bbox.getWest())
    );
    if (span > 0) {
      const zoom = Math.floor(Math.log2(360 / span));
      if (Number.isFinite(zoom)) {
        return zoom;
      }
    }
  }

  const type = (place.type || place.addresstype || "").toLowerCase();
  if (type && PLACE_TYPE_ZOOMS[type]) {
    return PLACE_TYPE_ZOOMS[type];
  }
  const className = (place.class || place.category || "").toLowerCase();
  if (className && PLACE_CLASS_ZOOMS[className]) {
    return PLACE_CLASS_ZOOMS[className];
  }

  const rank = Number(place.place_rank);
  if (Number.isFinite(rank)) {
    if (rank >= 28) return 17;
    if (rank >= 26) return 16;
    if (rank >= 24) return 15;
    if (rank >= 22) return 13;
    if (rank >= 20) return 12;
    if (rank >= 18) return 11;
    if (rank >= 16) return 10;
    if (rank >= 14) return 9;
    if (rank >= 12) return 8;
    if (rank >= 10) return 7;
    if (rank >= 8) return 6;
    if (rank >= 6) return 5;
    return 4;
  }

  return FALLBACK;
}

function getMapZoomLimits() {
  let minZoom = 2;
  let maxZoom = 18;
  if (map) {
    const min = map.getMinZoom?.();
    if (Number.isFinite(min)) {
      minZoom = min;
    }
    const max = map.getMaxZoom?.();
    if (Number.isFinite(max)) {
      maxZoom = max;
    }
  }
  return { minZoom, maxZoom };
}

function clearSearchResults() {
  currentSearchMatches = [];
  activeResultIndex = -1;
  cancelGeocodeRequest();
  if (!searchResultsEl) return;
  searchResultsEl.innerHTML = "";
  searchResultsEl.classList.remove("visible");
}

function handleSearchSelection(entry) {
  if (!entry) return;
  if (entry.type === "message") {
    return;
  }
  if (entry.type === "constituency") {
    const payload = entry.payload;
    if (payload) {
      focusOnConstituency(payload);
      searchInput.value = payload.name;
      updateSearchInputIndicator(payload.name);
    }
  } else if (entry.type === "postcode") {
    focusOnPostcodeEntry(entry.payload, { zoom: true });
    searchInput.value = entry.primaryText || entry.payload?.label || "";
    updateSearchInputIndicator(searchInput.value);
  } else if (entry.type === "external") {
    focusOnExternalLocation(entry.payload);
    searchInput.value = entry.primaryText || "";
    updateSearchInputIndicator(searchInput.value);
  }
  clearSearchResults();
}

function updateSearchInputIndicator(value) {
  if (!searchClearButton) return;
  if (value && value.trim().length > 0) {
    searchClearButton.classList.add("visible");
  } else {
    searchClearButton.classList.remove("visible");
  }
}

function focusFirstSearchResult() {
  if (!currentSearchMatches.length) return;
  const target = getActiveResult();
  if (target) {
    handleSearchSelection(target);
  }
}

function setupSearchControl() {
  if (searchControlInitialized) return;
  if (!searchInput || !searchResultsEl) return;

  searchControlInitialized = true;

  searchInput.addEventListener("input", e => {
    const value = e.target.value;
    updateSearchInputIndicator(value);
    updateSearchResults(value);
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      focusFirstSearchResult();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActiveResult(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActiveResult(-1);
    } else if (e.key === "Escape") {
      clearSearchResults();
    }
  });

  if (searchClearButton) {
    searchClearButton.addEventListener("click", e => {
      e.preventDefault();
      searchInput.value = "";
      updateSearchInputIndicator("");
      clearSearchResults();
      searchInput.focus();
      clearSelectedLayer();
    });
  }

  searchResultsEl.addEventListener("mousedown", e => {
    // Prevent input from losing focus before click handler runs
    e.preventDefault();
  });

  searchResultsEl.addEventListener("click", e => {
    const li = e.target.closest("li[data-result-index]");
    if (!li) return;
    const idx = Number(li.getAttribute("data-result-index"));
    if (!Number.isFinite(idx) || idx < 0 || idx >= currentSearchMatches.length) return;
    const entry = currentSearchMatches[idx];
    handleSearchSelection(entry);
  });

  document.addEventListener("click", e => {
    if (!searchResultsEl.contains(e.target) && e.target !== searchInput) {
      clearSearchResults();
    }
  });

  updateSearchInputIndicator(searchInput.value);
}

function refreshMetricDisplay() {
  const mapContainer = map.getContainer();
  if (selectedDataset === "mansion_tax_postcodes") {

    // Postcode mode: Remove the fade (show normal map)
    mapContainer.classList.remove("map-dimmed");

    if (geojsonLayer && map.hasLayer(geojsonLayer)) {
      map.removeLayer(geojsonLayer);
    }
    if (postcodeClusterLayer && !map.hasLayer(postcodeClusterLayer)) {
      postcodeClusterLayer.addTo(map);
    }
    updateLegend([]);
    if (selectedLayer) {
      resetLayerStyle(selectedLayer);
      selectedLayer = null;
    }
    updateInfo(selectedPostcodeProps || null, { force: true });
    return;
  }

  // 2. ELSE (Constituency modes): Add the fade
  mapContainer.classList.add("map-dimmed");

  if (!geojsonData || !geojsonLayer) {
    updateLegend([]);
    refreshInfoPanel();
    return;
  }

  if (postcodeClusterLayer && map.hasLayer(postcodeClusterLayer)) {
    map.removeLayer(postcodeClusterLayer);
  }
  if (!map.hasLayer(geojsonLayer)) {
    geojsonLayer.addTo(map);
  }

  breaks = computeBreaks();
  updateLegend(breaks);
  refreshInfoPanel();

  geojsonLayer.setStyle(style);
  geojsonLayer.eachLayer(layer => {
    const content = buildTooltipContent(layer.feature?.properties || {});
    const hasTooltip = typeof layer.getTooltip === "function" && layer.getTooltip();
    if (typeof layer.setTooltipContent === "function" && hasTooltip) {
      layer.setTooltipContent(content);
    } else {
      layer.bindTooltip(content, { sticky: true });
    }
  });

  if (selectedLayer) {
    applyHighlight(selectedLayer);
  }
}

function refreshMetricSelectOptions() {
  if (!metricSection || !metricSelect || !metricLabelEl) return;

  if (selectedDataset === "council_tax") {
    metricSection.classList.remove("hidden");
    metricLabelEl.textContent = "Council tax band";
    metricSelect.innerHTML = BAND_COLUMNS
      .map(band => `<option value="${band}">${BAND_LABELS[band]}</option>`)
      .join("");
    metricSelect.value = selectedBand;
    return;
  }

  if (selectedDataset === "mansion_tax") {
    metricSection.classList.remove("hidden");
    metricLabelEl.textContent = "Transaction metric";
    metricSelect.innerHTML = TRANSACTION_METRICS
      .map(metric => `<option value="${metric.value}">${metric.label}</option>`)
      .join("");
    metricSelect.value = selectedTransactionMetric;
    return;
  }

  metricSection.classList.add("hidden");
}

function setupMetricSelect() {
  if (!metricSelect) return;
  metricSelect.addEventListener("change", e => {
    const value = e.target.value;
    if (selectedDataset === "council_tax") {
      if (!BAND_COLUMNS.includes(value)) return;
      selectedBand = value;
    } else if (selectedDataset === "mansion_tax") {
      if (!TRANSACTION_METRIC_MAP[value]) return;
      selectedTransactionMetric = value;
    } else {
      return;
    }
    refreshMetricDisplay();
  });
}

function setupDatasetSelector() {
  if (!datasetSelect) return;
  datasetSelect.value = selectedDataset;
  refreshMetricSelectOptions();

  datasetSelect.addEventListener("change", e => {
    const choice = e.target.value;
    if (!DATASET_OPTIONS[choice]) return;
    selectedDataset = choice;
    if (choice === "mansion_tax") {
      selectedTransactionMetric = "tx_estimated_revenue";
    } else if (!TRANSACTION_METRIC_MAP[selectedTransactionMetric]) {
      selectedTransactionMetric = TRANSACTION_METRICS[0]?.value || "tx_2m_plus_count";
    }
    if (choice !== "mansion_tax_postcodes") {
      selectedPostcodeProps = null;
    }
    refreshMetricSelectOptions();
    refreshMetricDisplay();
    updateSearchModeLabel();
    clearSearchResults();
  });
}

function maybeShowBrandBanner() {
  const banner = document.getElementById("brand-banner");
  if (!banner) return;
  const host = (window.location && window.location.hostname) ? window.location.hostname : "";
  if (!/taxpolicy\.org\.uk$/i.test(host)) {
    banner.style.display = "flex";
  }
}

makePanelDraggable(uiPanel, panelHandle);
makePanelDraggable(infoPanelContainer, infoPanelHandle);
setupMetricSelect();
setupDatasetSelector();
setupSearchControl();
refreshMetricSelectOptions();
updateInfo(null);
updateLegend([]);
maybeShowBrandBanner();
updateSearchModeLabel();

// ------------- LOADING DATA -------------

function fetchJsonWithProgress(url, label) {
  const sizeHint = Number(datasetSizeHints[url]) || 0;
  return fetch(url).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load ${label}: ${response.statusText}`);
    }
    const contentLength = Number(response.headers.get("content-length"));
    const expectedSize = Number.isFinite(contentLength) ? contentLength : sizeHint;
    const supportsStreaming = response.body && typeof response.body.getReader === "function" && typeof TextDecoder !== "undefined";

    if (!supportsStreaming) {
      const syntheticProgress = startSyntheticProgress(expectedSize || sizeHint);
      return response.text()
        .then(text => {
          stopSyntheticProgress(syntheticProgress);
          const parsed = text ? JSON.parse(text) : {};
          const byteLength = estimateByteLengthFromText(text);
          if (byteLength > 0) {
            recordBytesLoaded(byteLength);
          }
          finalizeDatasetProgress(byteLength, expectedSize);
          return parsed;
        })
        .catch(err => {
          stopSyntheticProgress(syntheticProgress);
          throw err;
        });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let datasetLoaded = 0;

    function readChunk() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          text += decoder.decode();
          finalizeDatasetProgress(datasetLoaded, expectedSize);
          return JSON.parse(text);
        }
        if (value && value.length) {
          datasetLoaded += value.length;
          text += decoder.decode(value, { stream: true });
          recordBytesLoaded(value.length);
        }
        return readChunk();
      });
    }

    return readChunk();
  });
}

function loadPrimaryDatasets() {
  Promise.all([
    fetchJsonWithProgress(CONSTITUENCY_GEOJSON_URL, "constituency map data"),
    fetchJsonWithProgress(POSTCODE_GEOJSON_URL, "postcode data")
  ])
    .then(([constituencyData, postcodeData]) => {
      geojsonData = constituencyData;
      postcodeGeojsonData = postcodeData;
      computeGlobalStatMaximums();

      geojsonLayer = L.geoJSON(geojsonData, {
        style: style,
        onEachFeature: onEachFeature
      });

    if (postcodeGeojsonData) {
      postcodeClusterLayer = createPostcodeClusterLayer(postcodeGeojsonData);
      buildPostcodeIndex();
    }

      map.fitBounds(ENGLAND_BOUNDS);

      buildSearchIndex();
      refreshMetricDisplay();
      finishInitialLoading();
    })
    .catch(err => {
      console.error(err);
      finishInitialLoading();
      alert("Error loading map data.");
    });
}

fetchDataManifest()
  .catch(err => {
    console.warn("Data manifest load failed:", err);
  })
  .finally(() => {
    loadPrimaryDatasets();
  });

window.addEventListener("resize", () => {
  if (selectedLayer) {
    updateInfo(selectedLayer.feature.properties, { force: true });
  }
});
