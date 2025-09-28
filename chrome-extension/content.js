let ACTIVE = false;
let originalTexts = new Map();

// Add loader CSS
const loaderLink = document.createElement('link');
loaderLink.rel = 'stylesheet';
loaderLink.href = chrome.runtime.getURL('loader.css');
document.head.appendChild(loaderLink);

// Add styles
const style = document.createElement('style');
style.textContent = `
  .lingo-surf-loader-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 999999;
    background: rgba(22, 24, 28, 0.95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }

  .lingo-surf-loader-container.active {
    opacity: 1;
    visibility: visible;
  }

  .lingo-surf-highlight {
    cursor: help;
    transition: all 0.2s;
    box-decoration-break: clone;
    display: inline;
    border-radius: 4px;
  }

  .lingo-surf-highlight:hover {
    margin: 1.5px 1.5px;
    scale: 1.1;
    padding: 2px 2px;
    background: #005dc120;
    outline: 1px solid #0081c160;
    outline-offset: -1px;
    border-radius: 8px;
  }

  .lingo-surf-highlight.showing-original {
    padding: 2px 2px;
    background: #00c1846f;
    outline: 1px solid #3ec491ff;
    outline-offset: -1px;
    border-radius: 4px;
  }
`;
document.head.appendChild(style);

async function translateTextRemote(text, targetLang) {
  if (!text.trim()) return text;
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
      encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
    const resp = await fetch(url);
    const data = await resp.json();
    return data[0].map(s => s[0]).join('');
  } catch (e) {
    console.error('translateTextRemote failed', e);
    return text;
  }
}

function splitIntoSentences(text) {
  return text.match(/[^.!?]+(?:[.!?…]+|\s*$)/g) || [];
}

async function translateNode(node, targetLang) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (text && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement?.tagName)) {
      const sentences = splitIntoSentences(text);
      const wrapper = document.createElement('span');
      wrapper.className = 'lingo-surf-wrapper';

      let hadTranslation = false;

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length === 0) {
          wrapper.appendChild(document.createTextNode(sentence));
          continue;
        }

        const translated = await translateTextRemote(trimmed, targetLang);

        const span = document.createElement('span');
        span.className = 'lingo-surf-highlight';
        span.textContent = translated;
        span.dataset.translated = translated;
        span.dataset.original = sentence;
        
        span.addEventListener('mouseenter', () => {
          span.dataset.hovered = 'true';
        });
        span.addEventListener('mouseleave', () => {
          span.dataset.hovered = 'false';
        });

        wrapper.appendChild(span);
        hadTranslation = true;
      }

      if (hadTranslation) {
        if (!originalTexts.has(node)) {
          originalTexts.set(node, text);
        }
        node.parentNode.replaceChild(wrapper, node);
      }
    }
  }
}

function restoreOriginalTexts() {
  const wrappers = document.querySelectorAll('.lingo-surf-wrapper');
  wrappers.forEach(wrapper => {
    try {
      for (const [node, text] of originalTexts.entries()) {
        if (wrapper.contains(node) || node.contains(wrapper)) {
          const textNode = document.createTextNode(text);
          wrapper.parentNode.replaceChild(textNode, wrapper);
          originalTexts.delete(node);
          break;
        }
      }
    } catch (e) {
      console.error('Failed to restore text:', e);
    }
  });
  originalTexts.clear();
}

//loader
function createLoader() {
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'lingo-surf-loader-container';
  fetch(chrome.runtime.getURL('loader.html'))
    .then(response => response.text())
    .then(html => {
      loaderContainer.innerHTML = html;
      document.body.appendChild(loaderContainer);
    });
  return loaderContainer;
}

const loader = createLoader();

function showLoader() {
  loader.classList.add('active');
}

function hideLoader() {
  loader.classList.remove('active');
}

async function translatePage(targetLang) {
  showLoader();
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );

  let node;
  const promises = [];
  while (node = walker.nextNode()) {
    promises.push(translateNode(node, targetLang));
  }

  await Promise.all(promises);
  hideLoader();
}

document.addEventListener('keydown', (e) => {
  if (!ACTIVE) return;

  const isCtrlOrCmd = e.ctrlKey || e.metaKey;
  if (isCtrlOrCmd) {
    document.querySelectorAll('.lingo-surf-highlight').forEach(span => {
      if (span.dataset.hovered === 'true') {
        const isOriginal = span.classList.toggle('showing-original');
        span.textContent = isOriginal ? span.dataset.original : span.dataset.translated;
      }
    });
  }
});

/////

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'activate') {
    if (ACTIVE) return;
    ACTIVE = true;
    translatePage(msg.lang);
    sendResponse({ status: 'translating' });
  } else if (msg.action === 'deactivate') {
    if (!ACTIVE) {
      sendResponse({ status: 'not_active' });
      return;
    }
    ACTIVE = false;
    restoreOriginalTexts();
    sendResponse({ status: 'deactivated' });
  }
  return true;
});
