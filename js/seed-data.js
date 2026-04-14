// ENERGY | WELL-BEING | DIRECTION — 90-Day Demo Data Generator
// Deterministic seeded random for reproducible demo data

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (s >>> 0) / 0xFFFFFFFF;
  };
}

function generateDemoData() {
  const rng = seededRandom(42);
  const entries = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 89);

  // Demo importance ratings (claimed, 0-5 scale)
  const claimedImportance = {
    body: 3,
    stillness: 2,
    connection: 5,    // HIGH claimed, moderate actual
    purpose: 4,
    making: 1,        // LOW claimed, HIGH actual (the big reveal)
    character: 4,
    ground: 2,        // MEDIUM claimed, high actual
    spirit: 1         // LOW claimed, moderate-high actual (a quieter reveal)
  };

  // Base patterns for anchor score (1-5)
  // We'll generate anchor first, then derive dimensions with designed correlations
  for (let day = 0; day < 90; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dateKey = formatDate(date);
    const dow = date.getDay(); // 0=Sun

    // ~75% fill rate - skip some days
    if (rng() > 0.75 && day > 0 && day < 88) continue;

    // Base anchor score with patterns
    let anchorBase = 3.2;

    // Monday dip
    if (dow === 1) anchorBase -= 0.6;
    // Weekend lift
    if (dow === 0 || dow === 6) anchorBase += 0.3;
    // Mid-period stress dip (days 35-50)
    if (day >= 35 && day <= 50) anchorBase -= 0.5;
    // Gradual improvement trend
    anchorBase += day * 0.005;
    // Weekly cycle
    anchorBase += Math.sin(day * 0.9) * 0.3;

    const anchor = clampScore(anchorBase + (rng() - 0.5) * 1.5);

    // Generate dimensions with designed correlations to anchor
    // Higher correlation = more closely tracks anchor
    const scores = {};

    // Body: r≈0.72 — exercise days lift everything
    scores.body = generateCorrelated(anchor, 0.72, 3.0, rng, dow === 0 || dow === 6 ? 0.4 : 0);

    // Stillness: r≈0.48 — moderate correlation
    scores.stillness = generateCorrelated(anchor, 0.48, 2.8, rng, 0);

    // Connection: r≈0.41 — claimed 9/10 but only moderate correlation
    scores.connection = generateCorrelated(anchor, 0.41, 3.5, rng, dow === 0 ? 0.5 : 0);

    // Purpose: r≈0.55 — moderate-high
    scores.purpose = generateCorrelated(anchor, 0.55, 3.2, rng, dow === 1 ? -0.3 : 0);

    // Making: r≈0.68 — THE BIG REVEAL — claimed only 3/10 but tracks anchor strongly
    // Creative weekend bursts
    const makingBoost = (dow === 6 || dow === 0) ? 0.6 : 0;
    scores.making = generateCorrelated(anchor, 0.68, 2.5, rng, makingBoost);

    // Character: r≈0.50 — moderate
    scores.character = generateCorrelated(anchor, 0.50, 3.4, rng, 0);

    // Ground: r≈0.62 — claimed 5/10 but actually matters a lot
    // Stress dip mid-period amplified
    const groundDip = (day >= 35 && day <= 50) ? -0.8 : 0;
    scores.ground = generateCorrelated(anchor, 0.62, 3.3, rng, groundDip);

    // Spirit: r≈0.55 — claimed only 1 but quietly meaningful
    // Lifts on weekends (more space to reflect/practice), dips during stress period
    const spiritWeekendLift = (dow === 0) ? 0.5 : 0;
    const spiritStressDip = (day >= 35 && day <= 50) ? -0.4 : 0;
    scores.spirit = generateCorrelated(anchor, 0.55, 2.7, rng, spiritWeekendLift + spiritStressDip);

    entries.push({
      date: dateKey,
      anchor: anchor,
      scores: scores,
      note: generateNote(day, anchor, scores, rng)
    });
  }

  return { entries, importance: claimedImportance };
}

function generateCorrelated(anchor, targetR, baseMean, rng, dayBoost) {
  // Mix anchor signal with noise to approximate target correlation
  const signal = (anchor - 3) / 2; // normalise anchor to roughly -1 to 1
  const noise = (rng() - 0.5) * 2;
  const mixed = signal * targetR + noise * (1 - targetR);
  const score = baseMean + mixed * 1.5 + dayBoost;
  return clampScore(score);
}

function clampScore(val) {
  return Math.max(1, Math.min(5, Math.round(val)));
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateNote(day, anchor, scores, rng) {
  // Sparse notes — only ~15% of entries
  if (rng() > 0.15) return '';

  const notes = [
    'Good energy today. Morning walk made a difference.',
    'Struggled to focus. Mind kept wandering.',
    'Long conversation with a friend. Needed that.',
    'Built something I\'m proud of today.',
    'Felt restless all day. Couldn\'t settle.',
    'Quiet evening. Read for an hour. Felt grounded.',
    'Work felt purposeful today.',
    'Money worries crept in. Hard to shake.',
    'Creative flow state this afternoon.',
    'Didn\'t move enough. Can feel it in my mood.',
    'Spent time on things that don\'t matter.',
    'Great run this morning. Everything felt lighter.',
    'Difficult conversation but handled it well.',
    'Made real progress on the project.',
    'Felt disconnected from everyone today.',
    'Meditation helped. Even just 10 minutes.',
    'Financial clarity after sorting the budget.',
    'Wrote for two hours. Lost track of time.',
    'Walked alone in the woods. Felt held by something bigger.',
    'Sat with a piece of music. Time slowed.',
    'Lit a candle this evening. Small ritual, real shift.',
  ];

  return notes[Math.floor(rng() * notes.length)];
}
