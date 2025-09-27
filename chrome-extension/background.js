chrome.runtime.onInstalled.addListener(() => {
  //no persistent state needed
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.tabs.sendMessage(tabId, {action: 'deactivate'});
  }
});
//bg remains minimal to avoid lifecycle races; translations are performed in content script
