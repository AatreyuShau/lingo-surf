# Publishing to Chrome Web Store

## 1. Prepare Your Extension

### Create ZIP File
```bash
# Make sure you're in the chrome-extension directory
cd chrome-extension
# Create a ZIP file (exclude unnecessary files)
zip -r ../lingo-surf.zip . -x "*.git*" "*.DS_Store" "node_modules/*" "*.zip"
```

### Required Assets
Prepare these materials before publishing:

- **Icon Files** (already in your extension):
  - 16x16 icon
  - 48x48 icon
  - 128x128 icon

- **Store Listing Assets**:
  1. Screenshots (up to 5):
     - Size: 1280x800 or 640x400 pixels
     - Format: PNG or JPEG
     - Capture key features of your extension
  
  2. Promotional images (optional):
     - Small: 440x280 pixels
     - Large: 920x680 pixels
     - Marquee: 1400x560 pixels

  3. Promotional video (optional):
     - YouTube video URL
     - Show extension features and usage

## 2. Developer Account Setup

1. Visit the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign up for a Google Developer account
3. Pay one-time registration fee ($5)

## 3. Publishing Steps

1. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload your ZIP file
4. Fill in the Store listing info:
   - Extension name: "Lingo Surf"
   - Description: Use parts from README.md
   - Category: "Education"
   - Languages: List all supported languages
   - Screenshots & videos
   - Privacy practices
   - Permissions justification

## 4. Content Guidelines

Your extension listing should include:

- Clear description of functionality
- Accurate preview images
- Privacy policy (required)
- Terms of service (recommended)

## 5. Submit for Review

1. Preview your store listing
2. Submit for review
3. Wait for Google's review (typically 2-3 business days)
4. Address any feedback if rejected

## Post-Publication

- Monitor user feedback and ratings
- Keep extension updated
- Respond to user reviews
- Track analytics in the developer dashboard

## Tips for Approval

1. Ensure clear privacy practices
2. Justify all permissions
3. Have accurate descriptions
4. Follow Chrome Web Store policies
5. Test thoroughly before submission

## Useful Links

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Store Listing Guidelines](https://developer.chrome.com/docs/webstore/best_practices/)
- [Program Policies](https://developer.chrome.com/docs/webstore/program_policies/)