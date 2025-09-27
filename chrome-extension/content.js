let ACTIVE = false;
let originalTexts = new Map();
document.head.appendChild(Object.assign(document.createElement('link'), {
  rel: 'stylesheet',
  href: chrome.runtime.getURL('loader.css')
}));
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
    margin: 0;
    padding: 0;
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
    margin: 0;
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
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(text);
    const resp = await fetch(url);
    const data = await resp.json();
    return data[0].map(s => s[0]).join('');
  } catch (e) {
    console.error('translateTextRemote failed', e);
    return text;
  }
}

async function translateNode(node, targetLang) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    if (text && !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement?.tagName)) {
      //split
      const parts = text.split(/(\s+)/);
      
      //wrapper
      const wrapper = document.createElement('span');
      wrapper.className = 'lingo-surf-wrapper';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.trim()) {
          if (!originalTexts.has(node)) {
            originalTexts.set(node, text);
          }
          
          const translated = await translateTextRemote(part, targetLang);
          const span = document.createElement('span');
          span.className = 'lingo-surf-highlight';
          span.textContent = translated;
          
          span.dataset.translated = translated;
          span.dataset.original = part;
          
          let isHovered = false;
          
          const toggleTranslation = (span) => {
            const isShowingOriginal = span.classList.contains('showing-original');
            span.textContent = isShowingOriginal ? span.dataset.translated : span.dataset.original;
            span.classList.toggle('showing-original');
          };
          
          ///
          span.addEventListener('mouseenter', function(e) {
            isHovered = true;
          });
          
          span.addEventListener('mouseleave', function(e) {
            isHovered = false;
          });
          
          if (!document.hasSpaceHandler) {
            document.hasSpaceHandler = true;
            document.addEventListener('keydown', function(e) {
              if (e.code === 'Space' && ACTIVE) {
                e.preventDefault();
                
                document.querySelectorAll('.lingo-surf-highlight').forEach(span => {
                  if (span.matches(':hover')) {
                    toggleTranslation(span);
                  }
                });
              }
            });
          };
          
          wrapper.appendChild(span);
        } else {
          wrapper.appendChild(document.createTextNode(part));
        }
      }
      
      node.parentNode.replaceChild(wrapper, node);
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

function createLoader() {
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'lingo-surf-loader-container';
  
  //insert loader HTML
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
      acceptNode: function(node) {
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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'activate') {
    if (ACTIVE) return;
    ACTIVE = true;
    translatePage(msg.lang);
    sendResponse({status: 'translating'});
  } else if (msg.action === 'deactivate') {
    if (!ACTIVE) {
      sendResponse({status: 'not_active'});
      return;
    }
    ACTIVE = false;
    restoreOriginalTexts();
    sendResponse({status: 'deactivated'});
  }
  return true;
});

