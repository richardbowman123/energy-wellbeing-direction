// ENERGY | WELL-BEING | DIRECTION — Main Application Logic

let currentConfig = null;
let currentEntries = [];
let checkinState = {};

// ─── Initialisation ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  currentConfig = loadConfig();
  currentEntries = loadEntries();
  showScreen('landing');
});

// ─── Screen Navigation ──────────────────────────────────────────────────────

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById('screen-' + screenId);
  if (screen) screen.classList.add('active');

  // Tab bar visibility
  const tabBar = document.getElementById('tab-bar');
  const showTabs = ['dashboard', 'insights', 'detail'].includes(screenId);
  tabBar.classList.toggle('visible', showTabs);
  document.body.classList.toggle('has-tabs', showTabs);

  // Update active tab
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === screenId);
  });

  // Render screen content
  if (screenId === 'setup') renderAnchorOptions();
  if (screenId === 'setup-dimensions') renderDimensionSetup();
  if (screenId === 'dashboard') renderDashboard();
  if (screenId === 'insights') renderInsights();

  window.scrollTo(0, 0);
}

function showTab(tab) {
  showScreen(tab);
}

// ─── Setup Screen ───────────────────────────────────────────────────────────

function renderAnchorOptions() {
  const list = document.getElementById('anchor-options-list');
  list.innerHTML = '';

  const currentAnchor = currentConfig.anchorQuestion || DEFAULT_ANCHOR;
  const isPreset = ANCHOR_OPTIONS.includes(currentAnchor);

  for (const option of ANCHOR_OPTIONS) {
    const btn = document.createElement('button');
    btn.className = 'anchor-option' + (option === currentAnchor ? ' selected' : '');
    btn.textContent = option;
    btn.onclick = () => selectAnchor(option);
    list.appendChild(btn);
  }

  // "Write your own" button
  const customBtn = document.createElement('button');
  customBtn.className = 'anchor-option' + (!isPreset ? ' selected' : '');
  customBtn.textContent = 'Write your own...';
  customBtn.onclick = () => showCustomAnchor();
  customBtn.id = 'anchor-custom-btn';
  list.appendChild(customBtn);

  // Custom input (hidden unless active)
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'anchor-custom-input';
  input.id = 'anchor-custom-input';
  input.placeholder = 'Type your anchor question here...';
  input.value = !isPreset ? currentAnchor : '';
  input.style.display = !isPreset ? 'block' : 'none';
  input.oninput = () => {
    currentConfig.anchorQuestion = input.value;
  };
  list.appendChild(input);
}

function selectAnchor(option) {
  currentConfig.anchorQuestion = option;

  // Update UI
  document.querySelectorAll('.anchor-option').forEach(btn => {
    btn.classList.toggle('selected', btn.textContent === option);
  });
  document.getElementById('anchor-custom-btn').classList.remove('selected');
  document.getElementById('anchor-custom-input').style.display = 'none';
}

function showCustomAnchor() {
  document.querySelectorAll('.anchor-option').forEach(btn => btn.classList.remove('selected'));
  document.getElementById('anchor-custom-btn').classList.add('selected');
  const input = document.getElementById('anchor-custom-input');
  input.style.display = 'block';
  input.focus();
  if (input.value) {
    currentConfig.anchorQuestion = input.value;
  }
}

function renderDimensionSetup() {
  const list = document.getElementById('dimension-setup-list');
  list.innerHTML = '';

  // All dimensions: built-in + custom
  const allDims = [...DIMENSION_ORDER, ...(currentConfig.customDimensions || []).map(d => d.id)];

  for (const dimId of allDims) {
    const dim = DIMENSIONS[dimId];
    if (!dim) continue;

    // No toggle now — every displayed dimension is enabled
    if (!currentConfig.enabledDimensions.includes(dimId)) {
      currentConfig.enabledDimensions.push(dimId);
    }
    const importance = currentConfig.importance[dimId] != null ? currentConfig.importance[dimId] : 0;

    const card = document.createElement('div');
    card.className = 'dim-setup-card';
    card.innerHTML = `
      <div class="dim-info">
        <div class="dim-name" style="color: ${dim.color}">${dim.name}</div>
        <div class="dim-question">${dim.importanceQuestion || dim.dailyQuestion}</div>
      </div>
      <div class="dim-importance">
        <input type="range" min="0" max="5" value="${importance}"
               oninput="updateImportance('${dimId}', this.value)">
        <div class="dim-importance-value" id="imp-val-${dimId}">${importance}</div>
      </div>
    `;
    list.appendChild(card);
  }
}

function updateImportance(dimId, value) {
  currentConfig.importance[dimId] = parseInt(value);
  document.getElementById('imp-val-' + dimId).textContent = value;
}

// Custom dimensions
function showAddDimension() {
  document.getElementById('custom-dim-form').style.display = 'block';
  document.getElementById('add-dim-btn').style.display = 'none';
  document.getElementById('custom-dim-name').focus();
}

function hideAddDimension() {
  document.getElementById('custom-dim-form').style.display = 'none';
  document.getElementById('add-dim-btn').style.display = 'block';
  document.getElementById('custom-dim-name').value = '';
  document.getElementById('custom-dim-question').value = '';
}

function addCustomDimension() {
  const nameInput = document.getElementById('custom-dim-name');
  const questionInput = document.getElementById('custom-dim-question');
  const name = nameInput.value.trim();
  const question = questionInput.value.trim();

  if (!name) { nameInput.focus(); return; }

  // Generate colours from a preset palette
  const customColors = ['#D4A0E8', '#E8A0B8', '#A0D4E8', '#D4E8A0', '#E8CDA0', '#A0E8C0', '#C0A0E8'];
  const colorIdx = (currentConfig.customDimensions || []).length % customColors.length;

  const id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const newDim = {
    id: id,
    name: name,
    pillar: 'custom',
    importanceQuestion: question || `How important is ${name.toLowerCase()} to you?`,
    dailyQuestion: question || `How was your ${name.toLowerCase()} today?`,
    color: customColors[colorIdx],
    defaultImportance: 0,
    isCustom: true
  };

  DIMENSIONS[id] = newDim;

  if (!currentConfig.customDimensions) currentConfig.customDimensions = [];
  currentConfig.customDimensions.push(newDim);
  currentConfig.enabledDimensions.push(id);
  currentConfig.importance[id] = 0;

  hideAddDimension();
  renderDimensionSetup();
}

function startWithDemoData() {
  saveSetupConfig();
  const demo = generateDemoData();
  currentEntries = demo.entries;
  currentConfig.importance = demo.importance;
  currentConfig.usingDemoData = true;
  currentConfig.setupComplete = true;
  saveConfig(currentConfig);
  saveEntries(currentEntries);
  startCheckIn();
}

function startFresh() {
  saveSetupConfig();
  currentEntries = [];
  currentConfig.usingDemoData = false;
  currentConfig.setupComplete = true;
  saveConfig(currentConfig);
  saveEntries(currentEntries);
  startCheckIn();
}

function saveSetupConfig() {
  // Anchor already updated via selectAnchor/input handler
  saveConfig(currentConfig);
}

// ─── Check-in Flow ──────────────────────────────────────────────────────────

function startCheckIn() {
  checkinState = {
    step: 0, // 0 = pause, 1 = anchor, 2+ = dimensions, last = note, last+1 = confirm
    anchor: null,
    scores: {},
    note: '',
    dimensions: currentConfig.enabledDimensions
  };
  showScreen('checkin');
  renderCheckinStep();
}

function renderCheckinStep() {
  const container = document.getElementById('checkin-container');
  const { step, dimensions } = checkinState;
  const questionCount = dimensions.length + 1; // anchor + dimensions

  if (step === 0) {
    // Attunement pause
    container.innerHTML = `
      <div class="checkin-pause">
        Take one breath.<br>
        Notice where you are.
      </div>
      <div style="margin-top: var(--space-xxl);">
        <button class="btn-ghost" onclick="nextCheckinStep()" style="font-size: 1.05rem; color: var(--text-secondary);">
          I'm here
        </button>
      </div>
    `;
  } else if (step === 1) {
    // Anchor question
    container.innerHTML = `
      <div class="fade-in">
        <div class="checkin-progress">1 of ${questionCount}</div>
        <div class="checkin-dimension-label" style="color: var(--accent);">Your Anchor</div>
        <div class="checkin-question">${currentConfig.anchorQuestion}</div>
        ${renderScoreButtons(checkinState.anchor, 'setAnchorScore')}
      </div>
    `;
  } else if (step <= dimensions.length + 1) {
    // Dimension questions
    const dimIdx = step - 2;
    const dimId = dimensions[dimIdx];
    const dim = DIMENSIONS[dimId];
    const pillar = Object.values(PILLARS).find(p => p.dimensions.includes(dimId));
    const pillarName = pillar ? pillar.name : (dim.isCustom ? 'Custom' : '');

    container.innerHTML = `
      <div class="fade-in">
        <div class="checkin-progress">${step} of ${questionCount}</div>
        <div class="checkin-dimension-label" style="color: ${dim.color};">${pillarName} &middot; ${dim.name}</div>
        <div class="checkin-question">${dim.dailyQuestion}</div>
        ${renderScoreButtons(checkinState.scores[dimId], 'setDimScore', dimId)}
      </div>
    `;
  } else if (step === dimensions.length + 2) {
    // Note
    container.innerHTML = `
      <div class="fade-in">
        <div class="checkin-progress">Almost done</div>
        <div class="checkin-question">Anything you want to note?</div>
        <div class="checkin-note">
          <textarea id="checkin-note-input" placeholder="Optional — a word, a sentence, whatever feels right.">${checkinState.note}</textarea>
        </div>
        <div class="checkin-nav">
          <button class="btn-ghost" onclick="prevCheckinStep()">&larr;</button>
          <button class="btn-primary" onclick="finishCheckIn()">Done</button>
        </div>
      </div>
    `;
  } else {
    // Confirmation
    const entryCount = currentEntries.length;
    container.innerHTML = `
      <div class="checkin-confirmation fade-in">
        <div style="font-size: 3rem; color: var(--accent); margin-bottom: var(--space-md);">&#10003;</div>
        <h2>Noted.</h2>
        <p class="dim" style="margin-top: var(--space-xs);">Day ${entryCount} of your practice.</p>
        <div style="margin-top: var(--space-xl);">
          <button class="btn-secondary" onclick="showScreen('dashboard')">View today</button>
        </div>
        <div style="margin-top: var(--space-sm);">
          <button class="btn-ghost" onclick="showScreen('insights')">View historic data (DUMMY MODE)</button>
        </div>
      </div>
    `;
  }
}

function renderScoreButtons(selected, handler, dimId) {
  const extra = dimId ? `,'${dimId}'` : '';

  // 0-5 scale
  let html = '<div class="score-buttons">';
  for (let i = 0; i <= 5; i++) {
    const sel = selected === i ? ' selected' : '';
    html += `<button class="score-btn${sel}" onclick="${handler}(${i}${extra})">${i}</button>`;
  }
  html += '</div>';

  // Endpoint labels
  html += `<div class="score-labels-row">`;
  html += `<span class="score-endpoint">Not at all</span>`;
  html += `<span class="score-endpoint">Fully</span>`;
  html += `</div>`;

  // Selected label
  html += `<div class="score-label">${selected != null ? SCORE_LABELS[selected] : '&nbsp;'}</div>`;

  // Back button
  html += `<div class="checkin-nav">`;
  if (checkinState.step > 1) {
    html += `<button class="btn-ghost" onclick="prevCheckinStep()">&larr;</button>`;
  }
  html += `</div>`;

  return html;
}

function setAnchorScore(score) {
  checkinState.anchor = score;
  updateScoreDisplay(score);
  fadeToNextStep(1200);
}

function setDimScore(score, dimId) {
  checkinState.scores[dimId] = score;
  updateScoreDisplay(score);
  fadeToNextStep(1200);
}

function updateScoreDisplay(score) {
  // Update button states without re-rendering the whole page
  document.querySelectorAll('.score-btn').forEach(btn => {
    const btnScore = parseInt(btn.textContent);
    btn.classList.toggle('selected', btnScore === score);
  });
  // Show the score label
  const labelEl = document.querySelector('.score-label');
  if (labelEl) {
    labelEl.textContent = SCORE_LABELS[score] || '';
  }
}

function fadeToNextStep(delay) {
  setTimeout(() => {
    const container = document.getElementById('checkin-container');
    container.classList.add('checkin-fade-out');
    setTimeout(() => {
      container.classList.remove('checkin-fade-out');
      nextCheckinStep();
    }, 400);
  }, delay);
}

function nextCheckinStep() {
  checkinState.step++;
  renderCheckinStep();
}

function prevCheckinStep() {
  if (checkinState.step > 0) {
    checkinState.step--;
    renderCheckinStep();
  }
}

function finishCheckIn() {
  const noteInput = document.getElementById('checkin-note-input');
  checkinState.note = noteInput ? noteInput.value : '';

  const entry = {
    date: getTodayKey(),
    anchor: checkinState.anchor,
    scores: { ...checkinState.scores },
    note: checkinState.note
  };

  // Replace today's entry if exists, otherwise add
  const existingIdx = currentEntries.findIndex(e => e.date === entry.date);
  if (existingIdx >= 0) {
    currentEntries[existingIdx] = entry;
  } else {
    currentEntries.push(entry);
  }

  saveEntries(currentEntries);

  checkinState.step++;
  renderCheckinStep();
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

function renderDashboard() {
  currentEntries = loadEntries();
  const today = getTodayKey();
  const todayEntry = currentEntries.find(e => e.date === today);

  // Anchor question
  const anchorQ = document.getElementById('dash-anchor-question');
  anchorQ.textContent = currentConfig.anchorQuestion;

  // Anchor score
  const anchorEl = document.getElementById('dash-anchor-score');
  const anchorLabel = document.getElementById('dash-anchor-label');
  if (todayEntry) {
    anchorEl.textContent = todayEntry.anchor;
    anchorLabel.textContent = SCORE_LABELS[todayEntry.anchor] || '';
  } else {
    anchorEl.textContent = '—';
    anchorLabel.textContent = 'Not logged yet';
  }

  // Dimension row with names and scores
  renderDimensionRow('dash-dim-row', todayEntry, currentConfig.enabledDimensions);

  // Heatmap
  renderWeeklyHeatmap('dash-heatmap', currentEntries);

  // Stats (no streak)
  const anchorStats = calculateAnchorStats(currentEntries);
  document.getElementById('dash-total').textContent = currentEntries.length;
  document.getElementById('dash-avg').textContent = anchorStats.avg ? anchorStats.avg.toFixed(1) : '—';

  // Check-in CTA — always offers a peek at the populated demo Insights above
  const cta = document.getElementById('dash-checkin-cta');
  const demoBtn = `<div style="margin-bottom: var(--space-sm);">
      <button class="btn-ghost" onclick="showScreen('insights')">View historic data (DUMMY MODE)</button>
    </div>`;
  if (todayEntry) {
    cta.innerHTML = demoBtn + `<p class="dim small">You've checked in today.</p>
      <button class="btn-ghost" style="margin-top: var(--space-xs);" onclick="startCheckIn()">Update today's entry</button>`;
  } else {
    cta.innerHTML = demoBtn + `<button class="btn-primary" onclick="startCheckIn()">Check in now</button>`;
  }
}

function renderDimensionRow(containerId, todayEntry, enabledDimensions) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  for (const dimId of enabledDimensions) {
    const dim = DIMENSIONS[dimId];
    if (!dim) continue;
    const score = todayEntry ? todayEntry.scores[dimId] : null;

    const item = document.createElement('div');
    item.className = 'dim-row-item';
    item.onclick = () => showDimensionDetail(dimId);

    item.innerHTML = `
      <div class="dim-row-dot" style="background: ${dim.color}; opacity: ${score != null ? 0.4 + (score / 5) * 0.6 : 0.2};"></div>
      <div class="dim-row-name">${dim.name}</div>
      <div class="dim-row-score">${score != null ? score + '/5 · ' + SCORE_LABELS[score] : 'Not logged'}</div>
    `;

    container.appendChild(item);
  }
}

// ─── Insights ───────────────────────────────────────────────────────────────

function renderInsights() {
  // Insights showcases the archive (demo) data — illustrates what patterns
  // emerge over time. Dashboard handles the user's own real entries.
  const demo = generateDemoData();
  currentEntries = demo.entries;
  const panelsContainer = document.getElementById('insight-panels');

  const correlations = calculateCorrelations(currentEntries, currentConfig.enabledDimensions);
  const insights = generateInsights(correlations, demo.importance, currentEntries);

  panelsContainer.innerHTML = '';

  for (const insight of insights) {
    const dimId = insight.dimension;
    const dim = DIMENSIONS[dimId];
    if (!dim) continue;

    const notableDays = findNotableDays(currentEntries, dimId, 3);
    const crossPatterns = findCrossDimensionPatterns(currentEntries, dimId, currentConfig.enabledDimensions);
    const narrative = generateDimensionNarrative(dimId, insight, notableDays, crossPatterns, currentConfig.anchorQuestion);

    const patternPct = Math.round(insight.absCorrelation * 100);
    const impPct = Math.round((insight.importance / 5) * 100);
    const patternLabel = correlationLabel(insight.correlation);

    const panel = document.createElement('div');
    panel.className = 'dim-panel fade-in';
    panel.style.borderLeftColor = dim.color;
    panel.onclick = () => showDimensionDetail(dimId);

    // Header: dimension name
    let html = `
      <div class="dim-panel-header">
        <div class="dim-panel-name" style="color: ${dim.color}">${dim.name}</div>
      </div>
    `;

    // Two sub-cells: importance vs role
    html += `
      <div class="dim-panel-summary">
        <div class="dim-panel-subcell">
          <div class="dim-panel-subcell-label">Your importance</div>
          <div class="dim-panel-subcell-value" style="color: var(--cream);">${insight.importance}/5</div>
          <div class="dim-panel-subcell-bar">
            <div class="dim-panel-subcell-bar-fill" style="width: ${impPct}%; background: var(--cream);"></div>
          </div>
        </div>
        <div class="dim-panel-subcell">
          <div class="dim-panel-subcell-label">Role in your anchor</div>
          <div class="dim-panel-subcell-value" style="color: ${dim.color};">${patternLabel}</div>
          <div class="dim-panel-subcell-bar">
            <div class="dim-panel-subcell-bar-fill" style="width: ${patternPct}%; background: ${dim.color};"></div>
          </div>
        </div>
      </div>
    `;

    // Mini time series chart
    html += `
      <div class="dim-panel-chart">
        <div class="dim-panel-chart-label">Day by day</div>
        <canvas id="mini-chart-${dimId}"></canvas>
      </div>
    `;

    // Narrative paragraphs
    html += `<div class="dim-panel-narrative">`;
    for (const para of narrative) {
      html += `<p>${para}</p>`;
    }
    html += `</div>`;

    panel.innerHTML = html;
    panelsContainer.appendChild(panel);
  }

  // Render mini charts after panels are in the DOM
  requestAnimationFrame(() => {
    for (const insight of insights) {
      const dimId = insight.dimension;
      if (DIMENSIONS[dimId]) {
        renderMiniTimeSeries('mini-chart-' + dimId, currentEntries, dimId);
      }
    }
  });
}

// ─── Dimension Detail ───────────────────────────────────────────────────────

function showDimensionDetail(dimId) {
  const dim = DIMENSIONS[dimId];
  if (!dim) return;
  const pillar = Object.values(PILLARS).find(p => p.dimensions.includes(dimId));

  document.getElementById('detail-name').textContent = dim.name;
  document.getElementById('detail-name').style.color = dim.color;
  document.getElementById('detail-pillar').textContent = pillar ? pillar.name : (dim.isCustom ? 'Custom' : '');

  showScreen('detail');

  // Calculate stats
  const stats = calculateDimensionStats(currentEntries, dimId);
  const correlations = calculateCorrelations(currentEntries, [dimId]);
  const cor = correlations[dimId] ? correlations[dimId].correlation : 0;

  document.getElementById('detail-avg').textContent = stats.avg ? stats.avg.toFixed(1) : '—';
  document.getElementById('detail-cor').textContent = cor ? cor.toFixed(2) : '—';

  // Best/worst weeks
  if (stats.bestWeek) {
    const bDate = new Date(stats.bestWeek.week);
    document.getElementById('detail-best-week').textContent =
      `${bDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} (avg ${stats.bestWeek.avg.toFixed(1)})`;
  } else {
    document.getElementById('detail-best-week').textContent = '—';
  }

  if (stats.worstWeek) {
    const wDate = new Date(stats.worstWeek.week);
    document.getElementById('detail-worst-week').textContent =
      `${wDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} (avg ${stats.worstWeek.avg.toFixed(1)})`;
  } else {
    document.getElementById('detail-worst-week').textContent = '—';
  }

  // Charts
  requestAnimationFrame(() => {
    renderTimeSeries('detail-timeseries', currentEntries, dimId);
    renderDayOfWeek('detail-dow', stats.dayOfWeek, dim.color);
  });
}

// ─── Settings ───────────────────────────────────────────────────────────────

function goToSetup() {
  showScreen('setup');
}

function resetApp() {
  if (!confirm('This will clear all your data and start from the beginning. Are you sure?')) return;
  localStorage.removeItem('ewd_config');
  localStorage.removeItem('ewd_entries');
  currentConfig = { ...DEFAULT_CONFIG, customDimensions: [] };
  currentEntries = [];
  showScreen('landing');
}
