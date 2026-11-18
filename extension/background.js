chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message.type !== 'open-panel' || !sender.tab?.id) return;
  chrome.sidePanel.open({ tabId: sender.tab.id }).then(() => reply({ ok: true })).catch(() => reply({ error: 'Open the panel using the extension toolbar icon.' }));
  return true;
});
