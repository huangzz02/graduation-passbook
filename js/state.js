// LocalStorage 狀態管理模組
const STORAGE_KEY = 'NTPU_GRAD_PASSBOOK_DATA_V4';
const $ = id => document.getElementById(id);

function saveState() {
  const data = {
    entryYear: $('entryYear')?.value || 113,
    deptSelect: $('deptSelect')?.value || 'cs',
    majorRequired: $('majorRequired')?.value || 0,
    electiveCredits: $('electiveCredits')?.value || 0,
    electiveDomains: $('electiveDomains')?.checked || false,
    chineseCredits: $('chineseCredits')?.value || 0,
    englishCredits: $('englishCredits')?.value || 0,
    englishStatus: $('englishStatus')?.value || 'take',
    genEdCredits: $('genEdCredits')?.value || 0,
    genEdDomains: $('genEdDomains')?.checked || false,
    freeCredits: $('freeCredits')?.value || 0,
    langPath: $('langPath')?.value || 'none',
    langCourseDone: $('langCourseDone')?.checked || false,
    langEnglishDone: $('langEnglishDone')?.checked || false,
    langForeignDone: $('langForeignDone')?.checked || false,
    programChoice: $('programChoice')?.value || 'none',
    programCertificateDone: $('programCertificateDone')?.checked || false,
    peTimes: $('peTimes')?.value || 0,
    cpeGrade: $('cpeGrade')?.value || 'low',
    cpeScore: $('cpeScore')?.value || 0
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    for (const key in data) {
      const el = $(key);
      if (!el) continue;
      if (el.type === 'checkbox') {
        el.checked = Boolean(data[key]);
      } else {
        el.value = data[key];
      }
    }
  } catch (e) {
    console.warn('LocalStorage load failed:', e);
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

if (typeof window !== 'undefined') {
  window.$ = $;
  window.STORAGE_KEY = STORAGE_KEY;
  window.saveState = saveState;
  window.loadState = loadState;
  window.clearState = clearState;
}
