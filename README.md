# 🎯 HeadshotAI - Professional Headshot Generator

Transform any photo into a professional headshot in seconds with AI-powered enhancement. Built with pure HTML, CSS, and JavaScript - no frameworks or build tools required!

## ✨ Features

- 🤖 **AI-Powered Enhancement** - Advanced AI technology for professional results using Google's Gemini API
- 🔑 **User-Provided API Key** - Enter your own Gemini API key directly in the app (no server required)
- ✂️ **Image Cropping** - Built-in cropper for perfect 1:1 aspect ratio headshots
- 🗑️ **Background Remover** - Automatically removes and replaces backgrounds
- 👁️ **Smart Blur** - Professional depth-of-field effects
- 💖 **Quality Enhancer** - Improves image resolution and clarity
- ⭐ **Beautification** - Subtle retouching for a polished look
- 🎨 **9 Unique Styles** - Multiple professional suit styles and colors
- ⚡ **Instant Results** - Generate headshots in seconds
- 💾 **Download Options** - Download individual images or all as ZIP
- 📱 **Responsive Design** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **AI Model**: Google Gemini API (gemini-2.5-flash-image-preview)
- **Image Processing**: Canvas API for cropping
- **File Handling**: JSZip for batch downloads (via CDN)

## 🚀 How to Use

### Quick Start

1. **Open the HTML file**
   - Simply open `index.html` in any modern web browser
   - No build process or server required!

2. **Enter your Gemini API Key**
   - Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
   - Paste it into the API key field at the top of the page
   - The key is saved in your browser's localStorage for convenience

3. **Upload a photo**
   - Drag and drop your image or click to browse
   - Supported formats: PNG, JPG, WEBP

4. **Crop your image**
   - Adjust the crop area to frame your face perfectly
   - The cropper maintains a 1:1 (square) aspect ratio
   - Click "Confirm Crop" when ready

5. **Generate headshots**
   - Click the "Generate Professional Headshots" button
   - Wait while the AI creates 9 different professional styles
   - This may take 1-2 minutes depending on API response times

6. **Download your headshots**
   - Download individual images by clicking "Save" on each one
   - Or download all 9 images as a ZIP file with "Download All"

## 📁 File Structure

```
├── index.html         # Main HTML file (open this in browser)
├── styles.css         # All styles and animations
├── app.js             # Application logic and API integration
├── README.md          # This file
└── QUICKSTART.md      # Quick start guide
```

## 🔧 Configuration

### API Key Storage

The app stores your API key in the browser's localStorage for convenience. This means:
- ✅ Your key persists between sessions
- ✅ No need to re-enter it every time
- ⚠️ The key is stored locally on your device only
- ⚠️ Clear browser data will remove the saved key

### Generated Styles

The AI generates headshots in 9 professional styles:

**Classic Styles (3):**
- Navy blue suit
- Black suit
- Light gray suit

**Modern Styles (3):**
- Charcoal gray suit
- Brown suit
- Dark green suit

**Minimalist Styles (3):**
- Burgundy suit
- Beige suit
- Deep charcoal suit

## 🎨 Customization

### Modifying Styles

You can customize the appearance by editing `styles.css`:
- Color schemes: Search for gradient definitions
- Layout: Modify grid templates and spacing
- Animations: Adjust keyframes and transitions

### Changing AI Prompts

To modify how the AI transforms images, edit the `generatePrompt()` function in `app.js`:
- Adjust retouching instructions
- Change suit style descriptions
- Modify background preferences

### Adding More Suit Styles

Edit the `professionalLooks` array in `app.js` to add more styles:

```javascript
const professionalLooks = [
    { style: 'classic', color: 'your color here' },
    // Add more styles...
];
```

## 🔒 Privacy & Security

- ✅ **No Server Required** - Everything runs in your browser
- ✅ **No Data Collection** - Your images never leave your device except to go directly to Gemini API
- ✅ **API Key Security** - Your key is stored locally and only sent to Google's servers
- ⚠️ **HTTPS Recommended** - If hosting online, use HTTPS to protect your API key in transit

## 🐛 Troubleshooting

### Images Not Generating

1. **Check API Key**
   - Ensure your Gemini API key is valid
   - Verify it has access to the `gemini-2.5-flash-image-preview` model
   - Check the browser console (F12) for specific error messages

2. **Rate Limiting**
   - The API has rate limits; wait a moment and try again
   - Free tier has limited requests per minute

3. **Image Format**
   - Ensure your image is in PNG, JPG, or WEBP format
   - Very large images may need to be resized first

### Cropper Not Working

1. **Browser Compatibility**
   - Use a modern browser (Chrome, Firefox, Safari, Edge)
   - Enable JavaScript in your browser settings

2. **Image Loading Issues**
   - Check browser console for errors
   - Try a different image file

### Download Issues

1. **ZIP Downloads**
   - Ensure JSZip library is loading (check network tab in browser dev tools)
   - Try downloading individual images instead

2. **File Permissions**
   - Check that your browser allows downloads
   - Verify popup blockers aren't interfering

## 📝 Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Required browser features:
- Canvas API
- FileReader API
- Fetch API
- localStorage
- ES6+ JavaScript

## 🎓 Code Structure

The application is organized into clear sections:

### app.js Organization

1. **Application State** - Central state management
2. **DOM Elements** - All element references
3. **Event Listeners** - Event binding
4. **API Key Functions** - Key management and visibility
5. **Upload Functions** - File handling and drag-drop
6. **Cropper Functions** - Image cropping logic
7. **Generation Functions** - Gemini API integration
8. **Display Functions** - UI updates and result rendering
9. **Download Functions** - File download and ZIP creation
10. **UI Update Functions** - Button states and resets
11. **Initialization** - App startup

Each function includes JSDoc-style comments explaining its purpose.

## 📄 License

This project is provided as-is for educational and personal use. The original React version was created by Suraj Anand.

## 👨‍💻 Credits

**Original React Version:** [Suraj Anand](https://www.linkedin.com/in/anandsuraj/)  
**Plain HTML/CSS/JS Version:** Rewritten to remove framework dependencies

## 🔗 Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Get Gemini API Key](https://aistudio.google.com/apikey)
- [JSZip Library](https://stuk.github.io/jszip/)

---

© 2025 HeadshotAI Professional Generator. Made with ♥ for your professional success.

