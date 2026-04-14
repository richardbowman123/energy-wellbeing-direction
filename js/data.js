// ENERGY | WELL-BEING | DIRECTION — Dimension Definitions & Config

const PILLARS = {
  energy: { name: 'Energy', dimensions: ['body', 'stillness'] },
  wellbeing: { name: 'Well-being', dimensions: ['connection', 'character', 'ground', 'spirit'] },
  direction: { name: 'Direction', dimensions: ['purpose', 'making'] }
};

const DIMENSIONS = {
  body: {
    id: 'body',
    name: 'Body',
    pillar: 'energy',
    // Setup: importance framing
    importanceQuestion: 'How important is it that you move in a way that feels good each day?',
    // Daily check-in: tracking question
    dailyQuestion: 'Did you move in a way that felt good today?',
    color: '#E8C547',
    defaultImportance: 0,
    isCustom: false
  },
  stillness: {
    id: 'stillness',
    name: 'Stillness',
    pillar: 'energy',
    importanceQuestion: 'How important is it that you find moments of quiet each day?',
    dailyQuestion: 'Did you find a moment of quiet today?',
    color: '#A0C4E8',
    defaultImportance: 0,
    isCustom: false
  },
  connection: {
    id: 'connection',
    name: 'Connection',
    pillar: 'wellbeing',
    importanceQuestion: 'How important is it that you feel genuinely close to someone each day?',
    dailyQuestion: 'Did you feel genuinely close to someone today?',
    color: '#E88B8B',
    defaultImportance: 0,
    isCustom: false
  },
  purpose: {
    id: 'purpose',
    name: 'Purpose',
    pillar: 'direction',
    importanceQuestion: 'How important is it that your time feels spent on things that matter?',
    dailyQuestion: 'Did your time feel spent on things that matter?',
    color: '#8BE8A0',
    defaultImportance: 0,
    isCustom: false
  },
  making: {
    id: 'making',
    name: 'Making',
    pillar: 'direction',
    importanceQuestion: 'How important is it that you create or build something each day?',
    dailyQuestion: 'Did you create or build something today?',
    color: '#C4A0E8',
    defaultImportance: 0,
    isCustom: false
  },
  character: {
    id: 'character',
    name: 'Character',
    pillar: 'wellbeing',
    importanceQuestion: 'How important is it that you act in line with the person you want to be?',
    dailyQuestion: 'Did you act in line with the person you want to be?',
    color: '#E8D0A0',
    defaultImportance: 0,
    isCustom: false
  },
  ground: {
    id: 'ground',
    name: 'Ground',
    pillar: 'wellbeing',
    importanceQuestion: 'How important is it that you feel inwardly steady, whatever the day throws at you?',
    dailyQuestion: 'Did you feel inwardly steady today, whatever the day threw at you?',
    color: '#A0E8D0',
    defaultImportance: 0,
    isCustom: false
  },
  spirit: {
    id: 'spirit',
    name: 'Spirit',
    pillar: 'wellbeing',
    importanceQuestion: 'How important is it that you feel connected to something larger than yourself?',
    dailyQuestion: 'Did you feel connected to something larger than yourself today?',
    color: '#B8A0E8',
    defaultImportance: 0,
    isCustom: false
  }
};

const DIMENSION_ORDER = ['body', 'stillness', 'connection', 'purpose', 'making', 'character', 'ground', 'spirit'];

// 0-5 scale
const SCORE_LABELS = {
  0: 'Not at all',
  1: 'Barely',
  2: 'A little',
  3: 'Somewhat',
  4: 'Mostly',
  5: 'Fully'
};

// Anchor question presets
const ANCHOR_OPTIONS = [
  'How steady did you feel today?',
  'How happy were you today?',
  'How would you rate your well-being today?',
  'How present did you feel today?',
  'How much energy did you have today?',
  'How connected to yourself did you feel today?',
  'How balanced did you feel today?',
  'How alive did you feel today?',
  'How much impact did you have today?',
  'How much did you fulfil your purpose today?',
  'Did today feel like yours?',
  'How at peace did you feel today?'
];

const DEFAULT_ANCHOR = ANCHOR_OPTIONS[0];

const DEFAULT_CONFIG = {
  anchorQuestion: DEFAULT_ANCHOR,
  enabledDimensions: [...DIMENSION_ORDER],
  importance: Object.fromEntries(
    DIMENSION_ORDER.map(id => [id, DIMENSIONS[id].defaultImportance])
  ),
  customDimensions: [],
  setupComplete: false,
  usingDemoData: false
};

function loadConfig() {
  const stored = localStorage.getItem('ewd_config');
  if (stored) {
    try {
      const config = JSON.parse(stored);
      // Restore custom dimensions into DIMENSIONS
      if (config.customDimensions) {
        for (const cd of config.customDimensions) {
          if (!DIMENSIONS[cd.id]) {
            DIMENSIONS[cd.id] = cd;
          }
        }
      }
      return config;
    } catch (e) { /* fall through */ }
  }
  return { ...DEFAULT_CONFIG, customDimensions: [] };
}

function saveConfig(config) {
  localStorage.setItem('ewd_config', JSON.stringify(config));
}

function loadEntries() {
  const stored = localStorage.getItem('ewd_entries');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* fall through */ }
  }
  return [];
}

function saveEntries(entries) {
  localStorage.setItem('ewd_entries', JSON.stringify(entries));
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hasTodayEntry() {
  const entries = loadEntries();
  return entries.some(e => e.date === getTodayKey());
}

function getEnabledDimensionCount(config) {
  return config.enabledDimensions.length;
}
