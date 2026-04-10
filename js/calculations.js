// ENERGY | WELL-BEING | DIRECTION — Statistical Calculations

function pearsonCorrelation(x, y) {
  const n = x.length;
  if (n < 3) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function calculateCorrelations(entries, enabledDimensions) {
  const results = {};
  const anchors = entries.map(e => e.anchor);

  for (const dimId of enabledDimensions) {
    const scores = entries.map(e => e.scores[dimId]).filter(s => s != null);
    const paired = entries
      .filter(e => e.scores[dimId] != null)
      .map(e => ({ anchor: e.anchor, score: e.scores[dimId] }));

    if (paired.length < 5) {
      results[dimId] = { correlation: 0, n: 0 };
      continue;
    }

    const r = pearsonCorrelation(
      paired.map(p => p.anchor),
      paired.map(p => p.score)
    );

    results[dimId] = {
      correlation: Math.round(r * 100) / 100,
      n: paired.length
    };
  }

  return results;
}

function calculateDimensionStats(entries, dimId) {
  const scores = entries
    .filter(e => e.scores[dimId] != null)
    .map(e => ({ date: e.date, score: e.scores[dimId], anchor: e.anchor }));

  if (scores.length === 0) {
    return { avg: 0, min: 0, max: 0, count: 0, bestWeek: null, worstWeek: null, dayOfWeek: {} };
  }

  const values = scores.map(s => s.score);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Day of week averages
  const dowTotals = {};
  const dowCounts = {};
  for (const s of scores) {
    const d = new Date(s.date);
    const dow = d.getDay();
    dowTotals[dow] = (dowTotals[dow] || 0) + s.score;
    dowCounts[dow] = (dowCounts[dow] || 0) + 1;
  }
  const dayOfWeek = {};
  for (let i = 0; i < 7; i++) {
    dayOfWeek[i] = dowCounts[i] ? Math.round((dowTotals[i] / dowCounts[i]) * 100) / 100 : null;
  }

  // Best and worst weeks
  const weeks = groupByWeek(scores);
  let bestWeek = null, worstWeek = null;
  let bestAvg = -Infinity, worstAvg = Infinity;

  for (const [weekKey, weekScores] of Object.entries(weeks)) {
    if (weekScores.length < 3) continue;
    const weekAvg = weekScores.reduce((a, b) => a + b.score, 0) / weekScores.length;
    if (weekAvg > bestAvg) { bestAvg = weekAvg; bestWeek = weekKey; }
    if (weekAvg < worstAvg) { worstAvg = weekAvg; worstWeek = weekKey; }
  }

  return {
    avg: Math.round(avg * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
    bestWeek: bestWeek ? { week: bestWeek, avg: Math.round(bestAvg * 100) / 100 } : null,
    worstWeek: worstWeek ? { week: worstWeek, avg: Math.round(worstAvg * 100) / 100 } : null,
    dayOfWeek
  };
}

function groupByWeek(scores) {
  const weeks = {};
  for (const s of scores) {
    const d = new Date(s.date);
    // ISO week start (Monday)
    const day = d.getDay() || 7;
    const monday = new Date(d);
    monday.setDate(d.getDate() - day + 1);
    const weekKey = formatDateKey(monday);
    if (!weeks[weekKey]) weeks[weekKey] = [];
    weeks[weekKey].push(s);
  }
  return weeks;
}

function formatDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getRecentEntries(entries, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffKey = formatDateKey(cutoff);
  return entries.filter(e => e.date >= cutoffKey);
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  // Allow today to not be checked in yet (check from yesterday if today missing)
  const todayKey = formatDateKey(today);
  if (!sorted.some(e => e.date === todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(checkDate);
    if (sorted.some(e => e.date === key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function calculateAnchorStats(entries) {
  if (entries.length === 0) return { avg: 0, trend: 0 };

  const anchors = entries.map(e => e.anchor);
  const avg = anchors.reduce((a, b) => a + b, 0) / anchors.length;

  // Trend: compare last 14 days average to previous 14
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 14) return { avg: Math.round(avg * 100) / 100, trend: 0 };

  const recent = sorted.slice(-14).map(e => e.anchor);
  const prior = sorted.slice(-28, -14).map(e => e.anchor);

  if (prior.length === 0) return { avg: Math.round(avg * 100) / 100, trend: 0 };

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;

  return {
    avg: Math.round(avg * 100) / 100,
    trend: Math.round((recentAvg - priorAvg) * 100) / 100
  };
}

function normaliseImportance(importance) {
  // Convert 0-5 scale to 0-1 for chart comparison
  const normalised = {};
  for (const [k, v] of Object.entries(importance)) {
    normalised[k] = Math.round((v / 5) * 100) / 100;
  }
  return normalised;
}

function generateInsights(correlations, importance, entries) {
  const insights = [];

  for (const dimId of Object.keys(correlations)) {
    const r = correlations[dimId].correlation;
    const absR = Math.abs(r);
    const imp = importance[dimId] || 0;

    insights.push({
      dimension: dimId,
      correlation: r,
      absCorrelation: absR,
      importance: imp,
      gap: absR - (imp / 5),
      absGap: Math.abs(absR - (imp / 5)),
      direction: absR > (imp / 5) ? 'undervalued' : 'overvalued'
    });
  }

  // Sort by importance (highest first)
  insights.sort((a, b) => b.importance - a.importance);
  return insights;
}

// Find best and worst scoring days for a dimension
function findNotableDays(entries, dimId, count) {
  const withScores = entries
    .filter(e => e.scores[dimId] != null)
    .map(e => ({ date: e.date, score: e.scores[dimId], anchor: e.anchor, note: e.note }));

  const sorted = [...withScores].sort((a, b) => b.score - a.score || b.anchor - a.anchor);
  const best = sorted.slice(0, count);
  const worst = [...withScores].sort((a, b) => a.score - b.score || a.anchor - b.anchor).slice(0, count);

  return { best, worst };
}

// Find cross-dimension correlations for a given dimension
function findCrossDimensionPatterns(entries, dimId, enabledDimensions) {
  const patterns = [];
  const dimEntries = entries.filter(e => e.scores[dimId] != null);
  if (dimEntries.length < 7) return patterns;

  for (const otherId of enabledDimensions) {
    if (otherId === dimId) continue;

    const paired = dimEntries
      .filter(e => e.scores[otherId] != null)
      .map(e => ({ a: e.scores[dimId], b: e.scores[otherId] }));

    if (paired.length < 7) continue;

    const r = pearsonCorrelation(
      paired.map(p => p.a),
      paired.map(p => p.b)
    );

    if (Math.abs(r) > 0.3) {
      patterns.push({
        otherDimension: otherId,
        correlation: Math.round(r * 100) / 100,
        direction: r > 0 ? 'rises together' : 'moves opposite'
      });
    }
  }

  // Sort by absolute correlation strength
  patterns.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  return patterns.slice(0, 3);
}

// Generate the narrative for a dimension panel
function generateDimensionNarrative(dimId, insight, notableDays, crossPatterns, anchorQuestion) {
  const dim = DIMENSIONS[dimId];
  const name = dim.name.toLowerCase();
  const sections = [];

  // Correlation with anchor
  const r = insight.correlation;
  const absR = insight.absCorrelation;
  const imp = insight.importance;

  if (absR >= 0.6) {
    sections.push(`${dim.name} moves closely in step with your anchor. On days you score this highly, your overall feeling tends to lift with it.`);
  } else if (absR >= 0.4) {
    sections.push(`${dim.name} has a moderate connection to your anchor. It shapes how you feel, but it's not the whole picture.`);
  } else {
    sections.push(`${dim.name} shows a weaker connection to your anchor. Day to day, it doesn't shift your overall feeling as much as you might expect.`);
  }

  // Gap observation
  if (imp >= 4 && absR < 0.45) {
    sections.push(`You rated this ${imp}/5 for importance, but the pattern is softer than that. It may matter to you deeply in principle — but your daily data suggests other dimensions are doing more of the heavy lifting.`);
  } else if (imp <= 2 && absR >= 0.55) {
    sections.push(`You rated this only ${imp}/5 for importance — yet the data tells a different story. This dimension quietly tracks your anchor more than you gave it credit for.`);
  }

  // Notable days reflection
  if (notableDays.best.length > 0 && notableDays.worst.length > 0) {
    const bestDates = notableDays.best.slice(0, 3).map(d => formatDisplayDate(d.date)).join(', ');
    const worstDates = notableDays.worst.slice(0, 3).map(d => formatDisplayDate(d.date)).join(', ');
    sections.push(`Your strongest days for ${name}: ${bestDates}. What was different about those days? Your lowest: ${worstDates}. What might have been missing?`);
  }

  // Cross-dimension patterns
  for (const pattern of crossPatterns.slice(0, 2)) {
    const otherDim = DIMENSIONS[pattern.otherDimension];
    if (!otherDim) continue;

    if (pattern.correlation > 0.4) {
      sections.push(`When ${name} is up, ${otherDim.name.toLowerCase()} tends to be up too. These might reinforce each other.`);
    } else if (pattern.correlation < -0.3) {
      sections.push(`Interestingly, ${name} and ${otherDim.name.toLowerCase()} tend to move in opposite directions. When one rises, the other often dips. What might that tension mean for you?`);
    }
  }

  return sections;
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function correlationLabel(r) {
  const absR = Math.abs(r);
  if (absR >= 0.6) return 'Strong';
  if (absR >= 0.4) return 'Moderate';
  if (absR >= 0.2) return 'Mild';
  return 'Weak';
}
