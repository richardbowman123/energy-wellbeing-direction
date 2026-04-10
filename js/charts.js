// ENERGY | WELL-BEING | DIRECTION — Chart.js Rendering

// Shared chart defaults for dark theme
const CHART_DEFAULTS = {
  color: '#888888',
  borderColor: '#2A2A2A',
  font: { family: "'Inter', sans-serif", size: 12 }
};

Chart.defaults.color = CHART_DEFAULTS.color;
Chart.defaults.font.family = CHART_DEFAULTS.font.family;
Chart.defaults.font.size = CHART_DEFAULTS.font.size;

// Store chart instances for cleanup
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

// ─── Diverging Bar Chart (Insights: Claimed vs Derived) ─────────────────────

function renderGapChart(canvasId, insights, importance) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const sorted = [...insights].sort((a, b) => b.absGap - a.absGap);

  const labels = sorted.map(i => DIMENSIONS[i.dimension].name);
  const claimedData = sorted.map(i => -(i.claimed * 100));
  const derivedData = sorted.map(i => i.absCorrelation * 100);
  const colors = sorted.map(i => DIMENSIONS[i.dimension].color);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Your belief',
          data: claimedData,
          backgroundColor: 'rgba(235, 233, 224, 0.15)',
          borderColor: 'rgba(235, 233, 224, 0.3)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        },
        {
          label: 'The pattern',
          data: derivedData,
          backgroundColor: colors.map(c => c + '99'),
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 16,
            font: { size: 12 }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = Math.abs(context.raw);
              const prefix = context.dataset.label;
              return `${prefix}: ${Math.round(val)}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { display: false },
          ticks: {
            callback: v => Math.abs(v) + '%',
            font: { size: 11 }
          },
          min: -100,
          max: 100
        },
        y: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            font: { family: "'Cormorant', serif", size: 14 }
          }
        }
      }
    }
  });
}

// ─── Time Series (Dimension Detail) ─────────────────────────────────────────

function renderTimeSeries(canvasId, entries, dimId) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dim = DIMENSIONS[dimId];

  const filtered = entries.filter(e => e.scores[dimId] != null);
  const labels = filtered.map(e => e.date);
  const scores = filtered.map(e => e.scores[dimId]);
  const anchors = filtered.map(e => e.anchor);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: dim.name,
          data: scores,
          borderColor: dim.color,
          backgroundColor: dim.color + '33',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false
        },
        {
          label: 'Anchor',
          data: anchors,
          borderColor: 'rgba(255, 187, 0, 0.2)',
          borderWidth: 1,
          borderDash: [4, 4],
          pointRadius: 0,
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { boxWidth: 12, padding: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const d = new Date(context[0].label);
              return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            maxTicksLimit: 6,
            font: { size: 10 },
            callback: function(value, index) {
              const d = new Date(this.getLabelForValue(value));
              return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            }
          }
        },
        y: {
          min: -0.5,
          max: 5.5,
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { display: false },
          ticks: {
            stepSize: 1,
            font: { size: 11 },
            callback: v => Number.isInteger(v) && v >= 0 ? SCORE_LABELS[v] || v : ''
          }
        }
      }
    }
  });
}

// ─── Day of Week Pattern (Dimension Detail) ──────────────────────────────────

function renderDayOfWeek(canvasId, dayOfWeekData, dimColor) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const values = dayNames.map((_, i) => dayOfWeekData[i] || 0);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dayNames,
      datasets: [{
        data: values,
        backgroundColor: values.map(v => {
          const intensity = Math.max(0.2, v / 5);
          return dimColor + Math.round(intensity * 255).toString(16).padStart(2, '0');
        }),
        borderRadius: 6,
        barPercentage: 0.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `Average: ${ctx.raw.toFixed(1)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 11 } }
        },
        y: {
          min: 0,
          max: 5,
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { display: false },
          ticks: {
            stepSize: 1,
            font: { size: 11 }
          }
        }
      }
    }
  });
}

// ─── Weekly Heatmap (Dashboard) ─────────────────────────────────────────────

function renderWeeklyHeatmap(containerId, entries) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Empty cell for the week-label column, then day labels
  const corner = document.createElement('div');
  container.appendChild(corner);

  const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  for (const name of dayNames) {
    const label = document.createElement('div');
    label.className = 'heatmap-day-label';
    label.textContent = name;
    container.appendChild(label);
  }

  // Get last 4 weeks of data
  const today = new Date();
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);

  // Align to Monday
  const startDay = fourWeeksAgo.getDay() || 7;
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - startDay + 1);

  const entryMap = {};
  for (const e of entries) {
    entryMap[e.date] = e;
  }

  for (let i = 0; i < 28; i++) {
    // At the start of each week row, add a date label
    if (i % 7 === 0) {
      const weekStart = new Date(fourWeeksAgo);
      weekStart.setDate(weekStart.getDate() + i);
      const weekLabel = document.createElement('div');
      weekLabel.className = 'heatmap-week-label';
      weekLabel.textContent = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      container.appendChild(weekLabel);
    }

    const d = new Date(fourWeeksAgo);
    d.setDate(d.getDate() + i);
    const key = formatDateKey(d);
    const entry = entryMap[key];

    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';

    if (entry) {
      cell.setAttribute('data-score', entry.anchor);
      cell.title = `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${entry.anchor}/5 — ${SCORE_LABELS[entry.anchor]}`;
    } else {
      cell.title = `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: No entry`;
    }

    container.appendChild(cell);
  }
}

// ─── Mini Time Series (Insights panels) ──────────────────────────────────────

function renderMiniTimeSeries(canvasId, entries, dimId) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dim = DIMENSIONS[dimId];

  const filtered = entries.filter(e => e.scores[dimId] != null);
  if (filtered.length < 2) return;

  const labels = filtered.map(e => e.date);
  const scores = filtered.map(e => e.scores[dimId]);
  const anchors = filtered.map(e => e.anchor);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: dim.name,
          data: scores,
          borderColor: dim.color,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: dim.color,
          tension: 0.3,
          fill: false
        },
        {
          label: 'Anchor',
          data: anchors,
          borderColor: 'rgba(255, 187, 0, 0.25)',
          borderWidth: 1,
          borderDash: [3, 3],
          pointRadius: 0,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: 'rgba(255, 187, 0, 0.5)',
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 8,
            boxHeight: 2,
            padding: 8,
            font: { size: 10 },
            color: '#888888'
          }
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const d = new Date(context[0].label);
              return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            },
            label: function(context) {
              const name = context.dataset.label;
              return `${name}: ${context.raw}/5`;
            }
          }
        }
      },
      scales: {
        x: { display: false },
        y: {
          min: 0,
          max: 5,
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { display: false },
          ticks: { display: false }
        }
      }
    }
  });
}
