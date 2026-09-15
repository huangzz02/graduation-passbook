// 畢業門檻存摺 主應用程式入口 (Application Entry - Vanilla JS)

// 動態初始化全校各學院學系選單
function renderDepartmentOptions() {
  const deptSelect = $('deptSelect');
  if (!deptSelect || typeof DEPARTMENTS_DATA === 'undefined') return;

  deptSelect.innerHTML = '';
  DEPARTMENTS_DATA.forEach(col => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = col.college;
    
    col.departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept.id;
      option.textContent = dept.name;
      if (dept.default) option.selected = true;
      optgroup.appendChild(option);
    });

    deptSelect.appendChild(optgroup);
  });
}


// Google 表單連結
const GOOGLE_FORM_URL = 'https://forms.gle/omeFpYTbeD2gSMso7';

// 點擊開啟 Google 回報與催更表單 (Strictly zero emojis)
function openContactForm() {
  window.open(GOOGLE_FORM_URL, '_blank');
}

// 事件監聽綁定
function bindEventListeners() {
  // 問題回報與催更表單 (頁尾按鈕)
  const footerContactBtn = $('footerContactBtn');
  if (footerContactBtn) {
    footerContactBtn.addEventListener('click', openContactForm);
  }

  // 催更表單 (未維護介面大按鈕)
  const unmaintainedContactBtn = $('unmaintainedContactBtn');
  if (unmaintainedContactBtn) {
    unmaintainedContactBtn.addEventListener('click', openContactForm);
  }

  // 重設清空
  const resetBtn = $('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('確定要清空所有填寫進度與數值嗎？')) {
        clearState();
        document.querySelectorAll('input[type=number]').forEach(i => i.value = 0);
        document.querySelectorAll('input[type=checkbox]').forEach(i => i.checked = false);
        document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
        if ($('entryYear')) $('entryYear').value = 113;
        if ($('deptSelect')) $('deptSelect').value = 'cs';
        syncCustomSelects();
        updateDeptAndYearUI();
        recalc();
      }
    });
  }

  // 英文方案切換：若切換回正常修課，預設清空學分
  const englishStatus = $('englishStatus');
  if (englishStatus) {
    englishStatus.addEventListener('change', () => {
      if (englishStatus.value === 'take' && $('englishCredits')) {
        $('englishCredits').value = 0;
      }
    });
  }

  // 全域變動即時重算
  document.addEventListener('input', recalc);
  document.addEventListener('change', recalc);
}

// 七組精選主題設定（順序：粗獷、侘寂、磨砂、浮雕、夢核、終端、賽博）
const THEMES = [
  { id: 'brutal', name: '粗獷' },
  { id: 'wabi', name: '侘寂' },
  { id: 'glass', name: '磨砂' },
  { id: 'emboss', name: '浮雕' },
  { id: 'dream', name: '夢核' },
  { id: 'terminal', name: '終端' },
  { id: 'cyber', name: '賽博' }
];

function applyTheme(themeId) {
  if (!THEMES.some(t => t.id === themeId)) {
    themeId = 'brutal';
  }

  document.documentElement.setAttribute('data-theme', themeId);
  document.body.className = themeId;
  localStorage.setItem('ntpu_passbook_theme', themeId);

  // 更新選單中當前選取狀態
  document.querySelectorAll('.theme-opt').forEach(opt => {
    if (opt.dataset.themeVal === themeId) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  // 更新按鈕提示文字
  const currentTheme = THEMES.find(t => t.id === themeId);
  const themeToggleBtn = $('themeToggleBtn');
  if (themeToggleBtn && currentTheme) {
    themeToggleBtn.setAttribute('title', `切換風格（當前：${currentTheme.name}）`);
  }
}


// 初始化主題與選單事件
function initTheme() {
  const saved = localStorage.getItem('ntpu_passbook_theme') || 'brutal';
  applyTheme(saved);

  const themeToggleBtn = $('themeToggleBtn');
  const themeDropdown = $('themeDropdown');

  if (themeToggleBtn && themeDropdown) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('open');
    });

    // 防止點擊選單內部或捲軸時觸發 document click 導致選單關閉
    themeDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 點開後偵測到滑鼠離開選單範圍即自動收合（附 150ms 防抖緩衝，游標移動平順自然）
    let themeLeaveTimer = null;
    const themeMenuWrap = document.querySelector('.theme-menu-wrap');
    if (themeMenuWrap) {
      themeMenuWrap.addEventListener('mouseleave', () => {
        if (themeDropdown.classList.contains('open')) {
          themeLeaveTimer = setTimeout(() => {
            themeDropdown.classList.remove('open');
          }, 150);
        }
      });
      themeMenuWrap.addEventListener('mouseenter', () => {
        if (themeLeaveTimer) {
          clearTimeout(themeLeaveTimer);
          themeLeaveTimer = null;
        }
      });
    }

    themeDropdown.querySelectorAll('.theme-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        if (themeLeaveTimer) {
          clearTimeout(themeLeaveTimer);
          themeLeaveTimer = null;
        }
        const val = opt.dataset.themeVal;
        if (val) applyTheme(val);
        themeDropdown.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      if (themeLeaveTimer) {
        clearTimeout(themeLeaveTimer);
        themeLeaveTimer = null;
      }
      themeDropdown.classList.remove('open');
    });
  }
}

// ============ 全域主題客製下拉選單邏輯 (Custom Select) ============
function initCustomSelects() {
  const selects = document.querySelectorAll('select');
  selects.forEach((sel) => {
    const existing = sel.parentNode.querySelector(`.custom-select[data-select-id="${sel.id}"]`);
    if (existing) existing.remove();
    sel.classList.add('custom-select-hidden');

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';
    wrapper.dataset.selectId = sel.id;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const valSpan = document.createElement('span');
    valSpan.className = 'custom-select-value';

    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('class', 'custom-select-arrow');
    arrowSvg.setAttribute('viewBox', '0 0 16 16');
    arrowSvg.setAttribute('fill', 'currentColor');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M8 11.5l-5-5h10l-5 5z');
    arrowSvg.appendChild(path);

    trigger.appendChild(valSpan);
    trigger.appendChild(arrowSvg);
    wrapper.appendChild(trigger);

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');

    Array.from(sel.children).forEach((child) => {
      if (child.tagName.toLowerCase() === 'optgroup') {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'custom-select-group';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'custom-select-group-title';
        titleDiv.textContent = child.label;
        groupDiv.appendChild(titleDiv);

        Array.from(child.children).forEach((opt) => {
          const optDiv = createOptionElement(opt, sel, wrapper, valSpan);
          groupDiv.appendChild(optDiv);
        });

        menu.appendChild(groupDiv);
      } else if (child.tagName.toLowerCase() === 'option') {
        const optDiv = createOptionElement(child, sel, wrapper, valSpan);
        menu.appendChild(optDiv);
      }
    });

    wrapper.appendChild(menu);
    sel.parentNode.insertBefore(wrapper, sel.nextSibling);

    let leaveTimer = null;
    wrapper._clearLeaveTimer = () => {
      if (leaveTimer) {
        clearTimeout(leaveTimer);
        leaveTimer = null;
      }
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper._clearLeaveTimer();
      const wasOpen = wrapper.classList.contains('open');
      document.querySelectorAll('.custom-select.open').forEach((cs) => {
        if (cs !== wrapper) {
          if (cs._clearLeaveTimer) cs._clearLeaveTimer();
          cs.classList.remove('open');
          cs.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
        }
      });
      const themeDropdown = $('themeDropdown');
      if (themeDropdown) themeDropdown.classList.remove('open');
      wrapper.classList.toggle('open', !wasOpen);
      trigger.setAttribute('aria-expanded', String(!wasOpen));
    });

    // 點開後偵測到滑鼠離開範圍自動收合（附 150ms 平滑防抖緩衝）
    wrapper.addEventListener('mouseleave', () => {
      if (wrapper.classList.contains('open')) {
        leaveTimer = setTimeout(() => {
          wrapper.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }, 150);
      }
    });

    wrapper.addEventListener('mouseenter', () => {
      wrapper._clearLeaveTimer();
    });

    sel.addEventListener('change', () => {
      syncSingleCustomSelect(sel, wrapper, valSpan);
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select.open').forEach((cs) => {
      if (cs._clearLeaveTimer) cs._clearLeaveTimer();
      cs.classList.remove('open');
      cs.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
    });
  });
}

function createOptionElement(opt, sel, wrapper, valSpan) {
  const optDiv = document.createElement('div');
  optDiv.className = 'custom-select-option';
  optDiv.dataset.val = opt.value;
  optDiv.textContent = opt.textContent;
  if (opt.selected) optDiv.classList.add('selected');

  optDiv.addEventListener('click', (e) => {
    e.stopPropagation();
    if (wrapper._clearLeaveTimer) wrapper._clearLeaveTimer();
    sel.value = opt.value;
    wrapper.classList.remove('open');
    wrapper.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded', 'false');
    syncSingleCustomSelect(sel, wrapper, valSpan);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  });

  return optDiv;
}

function syncSingleCustomSelect(sel, wrapper, valSpan) {
  const curOption = sel.options[sel.selectedIndex] || sel.options[0];
  if (curOption && valSpan) {
    valSpan.textContent = curOption.textContent;
  }
  wrapper.querySelectorAll('.custom-select-option').forEach((item) => {
    if (item.dataset.val === sel.value) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function syncCustomSelects() {
  document.querySelectorAll('select').forEach((sel) => {
    const wrapper = sel.parentNode.querySelector(`.custom-select[data-select-id="${sel.id}"]`);
    if (wrapper) {
      const valSpan = wrapper.querySelector('.custom-select-value');
      syncSingleCustomSelect(sel, wrapper, valSpan);
    }
  });
}

// 應用程式初始化啟動
function initApp() {
  initTheme();
  renderDepartmentOptions();
  initCustomSelects();
  bindEventListeners();
  loadState();
  syncCustomSelects();
  updateDeptAndYearUI();
  recalc();
  initInspector();
}

document.addEventListener('DOMContentLoaded', initApp);

if (typeof window !== 'undefined') {
  window.openContactForm = openContactForm;
  window.applyTheme = applyTheme;
  window.syncCustomSelects = syncCustomSelects;
  window.initApp = initApp;
}

