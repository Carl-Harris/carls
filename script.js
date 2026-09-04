const trendData = [
  { month: "Mar", total: 18690, mix: [4.9, 95.1, 0, 0] },
  { month: "Apr", total: 19311, mix: [17.9, 82.1, 0, 0] },
  { month: "May", total: 19802, mix: [23.8, 73.8, 2.4, 0] },
  { month: "Jun", total: 22967, mix: [43.9, 45.6, 1.8, 8.8] },
  { month: "Jul", total: 25332, mix: [46.7, 40, 4.4, 8.9] },
  { month: "Aug", total: 27122, mix: [46, 40, 4, 10] },
];

const surfaceData = [
  {
    id: "ide",
    name: "IDE",
    icon: "⌘",
    units: 916523,
    color: "#673de6",
    description: "Copilot consumption recorded through VS Code Chat and JetBrains Chat.",
    source: "vscode-chat · jetbrains-chat",
  },
  {
    id: "code-review",
    name: "Copilot Code Review",
    icon: "CR",
    units: 7124,
    color: "#f2a900",
    description: "AI units used by Copilot to review pull requests and provide code feedback.",
    source: "copilot-pr-reviews",
  },
  {
    id: "app",
    name: "GitHub Copilot App",
    icon: "◈",
    units: 24,
    color: "#22a690",
    description: "Copilot consumption recorded through the Copilot Chat integration.",
    source: "copilot-chat",
  },
  {
    id: "cli",
    name: "GitHub Copilot CLI",
    icon: ">_",
    units: 0,
    color: "#3276c3",
    description: "No Copilot CLI AI-unit consumption was recorded in this 28-day window.",
    source: "No recorded integration usage",
  },
  {
    id: "cloud-agent",
    name: "GitHub Cloud Agent",
    icon: "☁",
    units: 0,
    color: "#d24d8f",
    description: "No GitHub Cloud Agent AI-unit consumption was recorded in this 28-day window.",
    source: "No recorded integration usage",
  },
  {
    id: "other",
    name: "Other Copilot surfaces",
    icon: "•••",
    units: 0,
    color: "#8c8795",
    description: "No additional Copilot surface consumption was recorded beyond the mapped integrations.",
    source: "No additional recorded integrations",
  },
];

const totalSurfaceUnits = surfaceData.reduce((total, surface) => total + surface.units, 0);
let surfaceMode = "units";
let selectedSurfaceId = "ide";

function formatShare(units) {
  if (units === 0) return "0%";
  const share = (units / totalSurfaceUnits) * 100;
  return share < 0.1 ? "<0.1%" : `${share.toFixed(1)}%`;
}

function formatSurfaceValue(surface) {
  return surfaceMode === "units"
    ? surface.units.toLocaleString("en-US")
    : formatShare(surface.units);
}

function updateSurfaceDetail() {
  const surface = surfaceData.find((item) => item.id === selectedSurfaceId);
  if (!surface) return;

  document.querySelector("#surface-focus-label").textContent = surface.name;
  document.querySelector("#surface-focus-value").textContent = formatSurfaceValue(surface);
  document.querySelector("#surface-focus-unit").textContent =
    surfaceMode === "units" ? "AI units" : "share of total";
  document.querySelector("#surface-detail-icon").textContent = surface.icon;
  document.querySelector("#surface-detail-icon").style.background = surface.color;
  document.querySelector("#surface-detail-share").textContent = formatShare(surface.units);
  document.querySelector("#surface-detail-title").textContent = surface.name;
  document.querySelector("#surface-detail-value").textContent =
    `${surface.units.toLocaleString("en-US")} AI units`;
  document.querySelector("#surface-detail-copy").textContent = surface.description;
  document.querySelector("#surface-detail-source").textContent = surface.source;
}

function renderSurfaceRows() {
  const list = document.querySelector("#surface-list");
  if (!list) return;

  list.innerHTML = surfaceData
    .map((surface) => {
      const share = (surface.units / totalSurfaceUnits) * 100;
      const visibleWidth = surface.units > 0 ? Math.max(share, 0.7) : 0;
      const active = surface.id === selectedSurfaceId;
      return `
        <button
          class="surface-row${active ? " active" : ""}"
          type="button"
          data-surface-id="${surface.id}"
          aria-pressed="${active}"
        >
          <span class="surface-row-icon" style="background:${surface.color}">${surface.icon}</span>
          <span class="surface-row-name">${surface.name}</span>
          <span class="surface-row-track" aria-hidden="true">
            <i style="width:${visibleWidth}%;background:${surface.color}"></i>
          </span>
          <span class="surface-row-value">${formatSurfaceValue(surface)}</span>
        </button>
      `;
    })
    .join("");

  list.querySelectorAll("[data-surface-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSurfaceId = button.dataset.surfaceId;
      renderSurfaceRows();
      updateSurfaceDetail();
    });
  });
}

function initializeSurfaceExplorer() {
  if (!document.querySelector("#surface-list")) return;

  document.querySelectorAll("[data-surface-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      surfaceMode = button.dataset.surfaceMode;
      document.querySelectorAll("[data-surface-mode]").forEach((toggle) => {
        const active = toggle === button;
        toggle.classList.toggle("active", active);
        toggle.setAttribute("aria-pressed", String(active));
      });
      renderSurfaceRows();
      updateSurfaceDetail();
    });
  });

  renderSurfaceRows();
  updateSurfaceDetail();
}

function renderTrendChart() {
  const chart = document.querySelector("#trend-chart");
  if (!chart) return;

  const width = 900;
  const height = 290;
  const plotTop = 28;
  const plotBottom = 214;
  const mixTop = 232;
  const mixHeight = 8;
  const left = 38;
  const right = 32;
  const max = 30000;
  const step = (width - left - right) / (trendData.length - 1);
  const x = (index) => left + index * step;
  const y = (value) => plotBottom - (value / max) * (plotBottom - plotTop);
  const points = trendData.map((item, index) => `${x(index)},${y(item.total)}`).join(" ");
  const areaPoints = `${left},${plotBottom} ${points} ${x(trendData.length - 1)},${plotBottom}`;
  const colors = ["#d9d6e1", "#673de6", "#22a690", "#f2a900"];

  const grid = [0, 10000, 20000, 30000]
    .map(
      (value) =>
        `<line class="trend-grid-line" x1="0" y1="${y(value)}" x2="${width}" y2="${y(value)}" />`,
    )
    .join("");

  const pointsMarkup = trendData
    .map((item, index) => {
      const pointX = x(index);
      const pointY = y(item.total);
      const label = item.total.toLocaleString("en-US");
      return `
        <g class="trend-point-group" tabindex="0">
          <title>${item.month}: ${label} merged pull requests</title>
          <circle class="trend-point" cx="${pointX}" cy="${pointY}" r="5" />
          <text class="trend-label" x="${pointX}" y="${pointY - 15}" text-anchor="middle">${label}</text>
        </g>
        <text class="trend-month" x="${pointX}" y="273" text-anchor="middle">${item.month}</text>
      `;
    })
    .join("");

  const mixBars = trendData
    .map((item, index) => {
      const barWidth = 62;
      let offset = x(index) - barWidth / 2;
      return item.mix
        .map((value, mixIndex) => {
          if (!value) return "";
          const segmentWidth = (value / 100) * barWidth;
          const segment = `<rect class="mix-bar-segment" x="${offset}" y="${mixTop}" width="${segmentWidth}" height="${mixHeight}" rx="2" fill="${colors[mixIndex]}" />`;
          offset += segmentWidth;
          return segment;
        })
        .join("");
    })
    .join("");

  chart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#673de6" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#673de6" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${grid}
      <polygon class="trend-area" points="${areaPoints}" />
      <polyline class="trend-line" points="${points}" />
      ${pointsMarkup}
      ${mixBars}
    </svg>
  `;
}

initializeSurfaceExplorer();
renderTrendChart();
