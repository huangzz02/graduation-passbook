// 畢業門檻學分與各項規章計算引擎

function setStamp(key, ok, statusText) {
  const stamp = $('stamp-' + key);
  const status = $('status-' + key);
  if (!stamp) return;

  stamp.classList.toggle('active', ok);
  const span = stamp.querySelector('span');
  if (span) span.textContent = ok ? '合格' : '未檢核';

  if (status) {
    status.className = 'entry-status ' + (ok ? 'ok' : 'no');
    status.textContent = statusText || (ok ? '已達成' : '尚未達成');
  }
}

function updateDeptAndYearUI() {
  const year = Number($('entryYear')?.value) || 113;
  const deptSelect = $('deptSelect');
  const deptId = deptSelect?.value || 'cs';
  const deptName = (deptSelect && deptSelect.selectedIndex >= 0)
    ? deptSelect.options[deptSelect.selectedIndex].text
    : '資訊工程學系';

  const isMaintained = (year === 113 && deptId === 'cs');

  const subTitle = $('coverSubTitle');
  if (subTitle) {
    subTitle.textContent = isMaintained
      ? `國立臺北大學 ${deptName} · ${year} 學年度學士班檢核試算`
      : `國立臺北大學 ${deptName} · ${year} 學年度（規章資料待收錄）`;
  }

  const workbenchMain = $('workbenchMain');
  const unmaintainedView = $('unmaintainedView');
  const unmaintainedTitle = $('unmaintainedTitle');

  if (workbenchMain && unmaintainedView) {
    workbenchMain.style.display = isMaintained ? '' : 'none';
    unmaintainedView.style.display = isMaintained ? 'none' : 'flex';
    if (!isMaintained && unmaintainedTitle) {
      unmaintainedTitle.textContent = `${year} 學年度 · ${deptName}`;
    }
  }

  return isMaintained;
}

function recalc() {
  const isMaintained = updateDeptAndYearUI();
  if (!isMaintained) {
    saveState();
    return;
  }

  // ---- 01 必修 ----
  const majorRequired = Number($('majorRequired')?.value) || 0;
  const okMajor = majorRequired >= 64;

  // ---- 03 國文 ----
  const chineseCredits = Math.min(Math.max(Number($('chineseCredits')?.value) || 0, 0), 4);
  const okChinese = chineseCredits >= 4;

  // ---- 04 英文 (正常修課 / 免修 / 抵免) ----
  const englishStatus = $('englishStatus')?.value || 'take';
  const isEnglishDone = englishStatus === 'take';
  const isEnglishExempt = englishStatus === 'exempt';
  const isEnglishTransfer = englishStatus === 'transfer';
  const rawEngCredits = Math.min(Math.max(Number($('englishCredits')?.value) || 0, 0), 4);
  const englishCredits = isEnglishTransfer ? 4 : isEnglishExempt ? 0 : rawEngCredits;
  const okEnglish = (isEnglishDone && englishCredits >= 4) || isEnglishTransfer || isEnglishExempt;

  // ---- 05 通識 ----
  const genEdCredits = Number($('genEdCredits')?.value) || 0;
  const genEdDomains = $('genEdDomains')?.checked || false;
  const okGenEd = genEdCredits >= 16 && genEdDomains;

  // === 02 + 06 互相制約核心邏輯 ===
  const fixedCredits = 64 + 4 + (isEnglishExempt ? 0 : 4) + 16;
  const pool = 132 - fixedCredits;           // 正常 44，英文免修 48
  const electiveMin = 24;                     // 本系選修最低門檻
  const freeMax = pool - electiveMin;         // 正常 20，英文免修 24

  // 02 本系選修：至少 24，無上限
  const electiveCredits = Number($('electiveCredits')?.value) || 0;
  const electiveDomains = $('electiveDomains')?.checked || false;
  const okElective = electiveCredits >= electiveMin && electiveDomains;

  // 06 自由學分：至多 freeMax，選修超修時相應遞減
  const electiveOverflow = Math.max(0, electiveCredits - electiveMin);
  const freeNeeded = Math.max(0, freeMax - electiveOverflow);
  const freeCredits = Number($('freeCredits')?.value) || 0;
  const okFree = freeCredits >= freeNeeded;

  // UI 控制項與提示即時同步
  const engInput = $('englishCredits');
  if (engInput) {
    engInput.disabled = isEnglishExempt || isEnglishTransfer;
    if (isEnglishExempt || isEnglishTransfer) engInput.value = englishCredits;
  }
  
  const engReq = $('englishReq');
  if (engReq) {
    engReq.textContent = isEnglishExempt ? '免修' : isEnglishTransfer ? '已取得 4 學分' : '需 4 學分';
  }

  const englishStatusNote = $('englishStatusNote');
  if (englishStatusNote) {
    englishStatusNote.style.display = (isEnglishExempt || isEnglishTransfer) ? 'block' : 'none';
    englishStatusNote.textContent = isEnglishExempt
      ? `未獲學分，自由學分上限提高至 ${freeMax} 學分`
      : (isEnglishTransfer ? '直接獲得 4 學分' : '');
  }

  const freeReq = $('freeReq');
  if (freeReq) freeReq.textContent = `至多 ${freeMax} 學分`;

  const electiveReq = $('electiveReq');
  if (electiveReq) electiveReq.textContent = `至少 ${electiveMin} 學分`;

  // 各項目蓋章與狀態文字
  setStamp('reqMajor', okMajor, okMajor ? '已達標' : `尚差 ${Math.max(0, 64 - majorRequired)} 學分`);
  
  let eleStatus = '已達標';
  if (!okElective) {
    if (electiveCredits < electiveMin && !electiveDomains) eleStatus = `尚差 ${electiveMin - electiveCredits} 學分 且未滿向度`;
    else if (electiveCredits < electiveMin) eleStatus = `尚差 ${electiveMin - electiveCredits} 學分`;
    else eleStatus = '未滿兩領域三門課';
  }
  setStamp('elective', okElective, eleStatus);
  setStamp('chinese', okChinese, okChinese ? '已修畢' : `尚差 ${4 - chineseCredits} 學分`);

  let engStatusText = '尚未達成';
  if (isEnglishDone) engStatusText = okEnglish ? '已修畢（獲得 4 學分）' : `尚差 ${4 - englishCredits} 學分`;
  else if (isEnglishTransfer) engStatusText = '已抵免';
  else if (isEnglishExempt) engStatusText = '已免修';
  setStamp('english', okEnglish, engStatusText);
  
  let genStatus = '已達標';
  if (!okGenEd) {
    if (genEdCredits < 16 && !genEdDomains) genStatus = `差 ${16 - genEdCredits} 學分 且未滿5向度`;
    else if (genEdCredits < 16) genStatus = `尚差 ${16 - genEdCredits} 學分`;
    else genStatus = '未滿 5 向度';
  }
  setStamp('genEd', okGenEd, genStatus);
  setStamp('free', okFree, okFree ? '已達標' : `尚差 ${Math.max(0, freeNeeded - freeCredits)} 學分`);

  // 學分累計（02+06 互約，總分 132）
  const englishEarned = (isEnglishDone || isEnglishTransfer) ? englishCredits : 0;
  const electiveCountable = Math.min(electiveCredits, pool);
  const freeCountable = Math.min(freeCredits, Math.max(0, pool - electiveCountable), freeMax);
  const creditTotal = Math.min(majorRequired, 64) +
                      electiveCountable +
                      chineseCredits +
                      englishEarned +
                      Math.min(genEdCredits, 16) +
                      freeCountable;
  
  const creditLabel = $('creditLabel');
  if (creditLabel) creditLabel.textContent = `${creditTotal} / 132`;

  const hudCreditText = $('hudCreditText');
  if (hudCreditText) hudCreditText.innerHTML = `${creditTotal}<span>/132</span>`;

  const hudMeterFill = $('hudMeterFill');
  if (hudMeterFill) hudMeterFill.style.width = Math.round((creditTotal / 132) * 100) + '%';

  // ---- 非學分類邏輯 ----
  // 07 外語能力指標
  const langPath = $('langPath')?.value || 'none';
  const langBoxes = {
    course: { box: $('langCourseBox'), done: 'langCourseDone' },
    english_test: { box: $('langEnglishBox'), done: 'langEnglishDone' },
    foreign_test: { box: $('langForeignBox'), done: 'langForeignDone' }
  };
  Object.entries(langBoxes).forEach(([path, item]) => {
    if (item.box) item.box.style.display = langPath === path ? 'block' : 'none';
  });
  const okLang = Boolean(langBoxes[langPath] && $(langBoxes[langPath].done)?.checked);
  setStamp('lang', okLang, okLang ? '已達標' : '尚未通過');

  // 09 跨領域學程
  const programChoice = $('programChoice')?.value || 'none';
  const isCourseProgram = programChoice === 'minor' || programChoice === 'double_major';
  const hasProgram = programChoice !== 'none';
  
  const programCertificateBox = $('programCertificateBox');
  const programCompletionLabel = $('programCompletionLabel');
  const programSingleWarn = $('programSingleWarn');
  
  if (programCertificateBox) programCertificateBox.style.display = hasProgram ? 'block' : 'none';
  if (programCompletionLabel) {
    programCompletionLabel.textContent = isCourseProgram
      ? `已完成${programChoice === 'minor' ? '輔系' : '雙主修'}所有所需課程`
      : '已申請並獲得證書';
  }
  if (programSingleWarn) programSingleWarn.style.display = programChoice === 'micro_single' ? 'block' : 'none';

  const okProgram = hasProgram && Boolean($('programCertificateDone')?.checked);
  setStamp('program', okProgram, okProgram ? '已達標' : '尚未達標');

  // 10 體育
  const peTimes = Number($('peTimes')?.value) || 0;
  const okPe = peTimes >= 4;
  setStamp('pe', okPe, okPe ? '已達標' : `尚差 ${Math.max(0, 4 - peTimes)} 次`);

  // 11 CPE
  const cpeGrade = $('cpeGrade')?.value || 'low';
  const cpeInputLabel = $('cpeInputLabel');
  const cpeReq = $('cpeReq');
  if (cpeInputLabel) cpeInputLabel.textContent = cpeGrade === 'low' ? '單次考試通過題數' : '累積通過題數';
  if (cpeReq) cpeReq.textContent = cpeGrade === 'low' ? '單次考試需 ≥ 2 題' : (cpeGrade === 'g5' ? '累積需 ≥ 2 題' : '累積需 ≥ 1 題');
  
  const cpeScore = Number($('cpeScore')?.value) || 0;
  const cpeNeed = cpeGrade === 'g6' ? 1 : 2;
  const okCpe = cpeScore >= cpeNeed;
  setStamp('cpe', okCpe, okCpe ? '已合格' : `尚差 ${Math.max(0, cpeNeed - cpeScore)} 題`);

  // ---- 總彙整與待結清清單 ----
  const items = [
    { ok: okMajor, label: '本系必修：尚差 ' + Math.max(0, 64 - majorRequired) + ' 學分' },
    { ok: okElective, label: '系選修：' + (electiveCredits < electiveMin ? `尚差 ${electiveMin - electiveCredits} 學分 ` : '') + (!electiveDomains ? '（尚未涵蓋兩領域三堂課）' : '') },
    { ok: okChinese, label: `大一國文：尚差 ${4 - chineseCredits} 學分` },
    { ok: okEnglish, label: `大一英文：尚差 ${Math.max(0, 4 - englishCredits)} 學分` },
    { ok: okGenEd, label: '通識：' + (genEdCredits < 16 ? `尚差 ${16 - genEdCredits} 學分 ` : '') + (!genEdDomains ? '（尚未滿足 5 向度）' : '') },
    { ok: okFree, label: '自由學分：尚差 ' + Math.max(0, freeNeeded - freeCredits) + ' 學分' },
    { ok: okLang, label: '外語能力指標：尚未達成' },
    { ok: true, label: '' }, // 08 程式能力預設合格
    { ok: okProgram, label: '學分學程／微學程／輔系／雙主修／師培：尚未達標' },
    { ok: okPe, label: '體育：尚差 ' + Math.max(0, 4 - peTimes) + ' 次' },
    { ok: okCpe, label: 'CPE 程式能力檢定：尚未達到題數標準' }
  ];

  const doneCount = items.filter(i => i.ok).length;
  const doneCountEl = $('doneCount');
  if (doneCountEl) doneCountEl.innerHTML = `${doneCount}<span>/11</span>`;

  // 門檻蓋章進度條更新
  const stampMeterFill = $('stampMeterFill');
  const stampProgressLabel = $('stampProgressLabel');
  if (stampMeterFill) stampMeterFill.style.width = Math.round((doneCount / 11) * 100) + '%';
  if (stampProgressLabel) stampProgressLabel.textContent = `${doneCount} / 11`;

  // 待結清事項渲染
  const gapsList = $('gapsList');
  if (gapsList) {
    const gaps = items.filter(i => !i.ok && i.label);
    if (gaps.length === 0) {
      gapsList.innerHTML = '<li class="gaps-empty">所有項目皆已達成，恭喜達成畢業門檻！</li>';
    } else {
      gapsList.innerHTML = gaps.map(g => `<li>${g.label}</li>`).join('');
    }
  }

  saveState();
}

if (typeof window !== 'undefined') {
  window.setStamp = setStamp;
  window.updateDeptAndYearUI = updateDeptAndYearUI;
  window.recalc = recalc;
}
