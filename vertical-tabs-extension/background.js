// 拡張機能アイコンクリックでサイドパネルを開く
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// サイドパネルの動作設定
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
