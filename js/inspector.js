// 右側官方規章佐證檢視器 (Official Regulations & Links)

function renderInspector() {
  const container = document.getElementById('inspectorCard');
  if (!container) return;

  const links = window.OFFICIAL_LINKS || (typeof OFFICIAL_LINKS !== 'undefined' ? OFFICIAL_LINKS : []);

  container.innerHTML = `
    <!-- 項目標頭 -->
    <div class="inspector-head">
      <h2 class="inspector-title">相關連結</h2>
      <p class="inspector-summary">建議都看過，一定有你會用到的。</p>
    </div>

    <!-- 所有官方佐證連結卡片 -->
    <div class="inspector-docs-group">
      ${links.map(doc => `
        <a class="inspector-link-card" href="${doc.url || ''}" target="_blank" rel="noopener noreferrer" title="${doc.title || ''}">
          <div class="inspector-link-main">
            <span class="inspector-link-org">${doc.org || ''}</span>
            <span class="inspector-link-title">${doc.title || ''}</span>
          </div>
          <span class="inspector-link-arrow">前往連結↗</span>
        </a>
      `).join('')}
    </div>
  `;
}

function initInspector() {
  renderInspector();
}

if (typeof window !== 'undefined') {
  window.renderInspector = renderInspector;
  window.initInspector = initInspector;
}
