// タブ一覧を取得して表示
async function loadTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  renderTabs(tabs);
}

// タブをレンダリング
function renderTabs(tabs) {
  const tabList = document.getElementById('tabList');
  tabList.innerHTML = '';

  tabs.forEach(tab => {
    const tabItem = createTabElement(tab);
    tabList.appendChild(tabItem);
  });
}

// タブ要素を作成
function createTabElement(tab) {
  const div = document.createElement('div');
  div.className = 'tab-item' + (tab.active ? ' active' : '');
  div.dataset.tabId = tab.id;
  div.draggable = true;

  // ファビコン
  const favicon = document.createElement('img');
  favicon.className = 'tab-favicon';
  favicon.src = tab.favIconUrl || getDefaultFavicon();
  favicon.onerror = () => { favicon.src = getDefaultFavicon(); };

  // タイトル
  const title = document.createElement('span');
  title.className = 'tab-title';
  title.textContent = tab.title || 'New Tab';
  title.title = tab.title || 'New Tab';

  // 閉じるボタン
  const closeBtn = document.createElement('button');
  closeBtn.className = 'tab-close';
  closeBtn.innerHTML = '×';
  closeBtn.title = 'タブを閉じる';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.tabs.remove(tab.id);
  });

  div.appendChild(favicon);
  div.appendChild(title);
  div.appendChild(closeBtn);

  // タブをクリックでアクティブに
  div.addEventListener('click', () => {
    chrome.tabs.update(tab.id, { active: true });
  });

  // ドラッグ&ドロップ
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('dragleave', handleDragLeave);
  div.addEventListener('drop', handleDrop);
  div.addEventListener('dragend', handleDragEnd);

  return div;
}

// デフォルトファビコン
function getDefaultFavicon() {
  return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%23666" width="16" height="16" rx="2"/></svg>';
}

// ドラッグ&ドロップ処理
let draggedTab = null;

function handleDragStart(e) {
  draggedTab = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== draggedTab) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  if (this !== draggedTab) {
    const draggedTabId = parseInt(draggedTab.dataset.tabId);
    const targetTabId = parseInt(this.dataset.tabId);

    const targetTab = await chrome.tabs.get(targetTabId);
    await chrome.tabs.move(draggedTabId, { index: targetTab.index });
  }
}

function handleDragEnd() {
  this.classList.remove('dragging');
  document.querySelectorAll('.tab-item').forEach(item => {
    item.classList.remove('drag-over');
  });
  draggedTab = null;
}

// 新しいタブを開く
document.getElementById('newTabBtn').addEventListener('click', () => {
  chrome.tabs.create({});
});

// タブの変更を監視
chrome.tabs.onCreated.addListener(loadTabs);
chrome.tabs.onRemoved.addListener(loadTabs);
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.title || changeInfo.favIconUrl || changeInfo.status === 'complete') {
    loadTabs();
  }
});
chrome.tabs.onMoved.addListener(loadTabs);
chrome.tabs.onActivated.addListener(loadTabs);

// 設定パネルの開閉
document.getElementById('settingsBtn').addEventListener('click', () => {
  const panel = document.getElementById('settingsPanel');
  panel.classList.toggle('hidden');
});

// 幅スライダーの処理
const widthSlider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');

widthSlider.addEventListener('input', (e) => {
  const width = e.target.value;
  widthValue.textContent = width + 'px';
  document.body.style.maxWidth = width + 'px';
  chrome.storage.local.set({ panelWidth: width });
});

// 保存された幅を読み込み
chrome.storage.local.get(['panelWidth'], (result) => {
  const savedWidth = result.panelWidth || 280;
  widthSlider.value = savedWidth;
  widthValue.textContent = savedWidth + 'px';
  document.body.style.maxWidth = savedWidth + 'px';
});

// 初期読み込み
loadTabs();
