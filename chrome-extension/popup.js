window.addEventListener('DOMContentLoaded', () => {
  const activateBtn = document.getElementById('activate');
  const deactivateBtn = document.getElementById('deactivate');
  const status = document.getElementById('status');

  function setStatus(s) { status.textContent = s; }

  function sendMessageWithRetry(tabId, message, attempts = 4) {
    return new Promise((resolve) => {
      let tries = 0;
      const trySend = () => {
        tries++;
        chrome.tabs.sendMessage(tabId, message, (resp) => {
          const err = chrome.runtime.lastError;
          if (!err) return resolve({resp});
          // if message port closed or receiving end doesn't exist, retry
          if (tries < attempts && (/message port closed/i.test(err.message) || /Receiving end does not exist/i.test(err.message))) {
            setTimeout(trySend, 200 * tries);
            return;
          }
          resolve({err});
        });
      };
      trySend();
    });
  }

  activateBtn.addEventListener('click', async () => {
    const lang = document.getElementById('lang').value;
    setStatus('Activating...');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (!tab) { setStatus('No active tab'); return; }
      chrome.tabs.sendMessage(tab.id, {action: 'activate', lang}, (resp) => {
        const err = chrome.runtime.lastError;
        if (err && /Receiving end does not exist/.test(err.message)) {
          setStatus('Content script not present, injecting...');
          chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }, async () => {
            const err2 = chrome.runtime.lastError;
            if (err2) { setStatus('Injection failed: ' + err2.message); return; }
            const {resp, err} = await sendMessageWithRetry(tab.id, {action: 'activate', lang});
            if (err) setStatus('Failed after injection: ' + (err.message || err));
            else setStatus('Activated for this page');
          });
        } else if (err) {
          setStatus('Error: ' + err.message);
        } else {
          setStatus('Activated for this page');
        }
      });
    });
  });

  deactivateBtn.addEventListener('click', () => {
    setStatus('Reloading page...');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const tab = tabs[0];
      if (!tab) { setStatus('No active tab'); return; }
      chrome.tabs.reload(tab.id, {}, () => {
        setStatus('Page reloaded');
      });
    });
  });
});
