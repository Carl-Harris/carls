const trendData = [
  { month: "Mar", total: 18690, mix: [4.9, 95.1, 0, 0] },
  { month: "Apr", total: 19311, mix: [17.9, 82.1, 0, 0] },
  { month: "May", total: 19802, mix: [23.8, 73.8, 2.4, 0] },
  { month: "Jun", total: 22967, mix: [43.9, 45.6, 1.8, 8.8] },
  { month: "Jul", total: 25332, mix: [46.7, 40, 4.4, 8.9] },
  { month: "Aug", total: 27122, mix: [46, 40, 4, 10] },
];

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
        <circle class="trend-point" cx="${pointX}" cy="${pointY}" r="5" />
        <text class="trend-label" x="${pointX}" y="${pointY - 15}" text-anchor="middle">${label}</text>
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

renderTrendChart();
