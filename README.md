# Lingo Surf 🥝

[![License](https://img.shields.io/github/license/AatreyuShau/lingo-surf)](https://github.com/AatreyuShau/lingo-surf/blob/main/LICENSE)
![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

A sleek Chrome extension for seamless language learning while you surf the web. Translate words on any webpage with a beautiful, modern interface.

<p align="center">
  <img src="docs/example.png" alt="Lingo Surf Popup Window" width="400"/>
</p>

## Features

- Support for 100+ languages
- Modern, dark theme interface with dynamic animations
- Remembers your last selected language
- Works on any webpage
- Fast and lightweight
- Simple single click activation

## Installation

1. Download from the Chrome Web Store (coming soon)
2. Or install manually:
   - Clone this repository
   - Open Chrome and go to `chrome://extensions`
   - Enable Developer Mode
   - Click "Load unpacked" and select the `chrome-extension` folder

## How to Use

1. Click the Lingo Surf icon in your Chrome toolbar
2. Select your target language from the dropdown
3. Click "Activate for this page"
4. Hover over words to see translations
5. Click "Deactivate" when you're done

## Development

```bash
# Clone the repository
git clone https://github.com/AatreyuShau/lingo-surf.git

# Navigate to the extension directory
cd lingo-surf/chrome-extension

# Install dependencies (if any)
npm install
```

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is licensed under the GNU gpl License; see the [LICENSE](LICENSE) file for details.

---
```html
<!-- HTML -->
<div class="loader-container">
  <div class="loader">
    <svg class="loader-wave" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color: #43cea2"/>
          <stop offset="100%" style="stop-color: #185a9d"/>
        </linearGradient>
      </defs>
      <path d="M 0,15 C 20,15 20,5 40,5 C 60,5 60,15 80,15 C 100,15 100,5 120,5" 
            stroke="url(#wave-grad)" 
            fill="none" 
            stroke-width="2">
        <animate attributeName="d" 
                 dur="3s" 
                 repeatCount="indefinite" 
                 values="M 0,15 C 20,15 20,5 40,5 C 60,5 60,15 80,15 C 100,15 100,5 120,5;
                         M 0,5 C 20,5 20,15 40,15 C 60,15 60,5 80,5 C 100,5 100,15 120,15;
                         M 0,15 C 20,15 20,5 40,5 C 60,5 60,15 80,15 C 100,15 100,5 120,5"/>
      </path>
    </svg>
  </div>
</div>

<!-- CSS -->
<style>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.loader {
  width: 120px;
}

.loader-wave {
  width: 100%;
  height: auto;
}
</style>
```
---

<p align="center">
    Woven from words, code, & curiosity :]
</p>

---