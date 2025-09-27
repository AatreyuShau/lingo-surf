document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang');

    chrome.storage.sync.get(['lastLanguage'], function(result) {
        if (result.lastLanguage) {
            langSelect.value = result.lastLanguage;
        }
    });

    langSelect.addEventListener('change', () => {
        chrome.storage.sync.set({
            lastLanguage: langSelect.value
        });
    });
});