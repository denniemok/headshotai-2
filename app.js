/**
 * HeadshotAI - Professional Headshot Generator
 * 
 * This application uses Google's Gemini AI API to transform photos into
 * professional headshots. It generates 9 different professional styles.
 */

// ==================== Application State ====================

const state = {
    apiKey: '',                    // User's Gemini API key
    selectedFile: null,            // Original uploaded file
    croppedImageData: null,        // Cropped image data (base64)
    croppedImageMimeType: null,    // MIME type of cropped image
    generatedImages: [],           // Array of generated base64 images
    isLoading: false,              // Loading state
    cropData: {
        image: null,               // Image object for cropping
        startX: 0,                 // Crop start X position
        startY: 0,                 // Crop start Y position
        width: 0,                  // Crop width
        height: 0                  // Crop height
    }
};

// ==================== DOM Elements ====================

// API Key elements
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
const showIcon = document.getElementById('showIcon');
const hideIcon = document.getElementById('hideIcon');

// Upload elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreview = document.getElementById('imagePreview');
const previewImage = document.getElementById('previewImage');

// Result elements
const resultArea = document.getElementById('resultArea');
const resultPlaceholder = document.getElementById('resultPlaceholder');
const resultLoading = document.getElementById('resultLoading');
const resultError = document.getElementById('resultError');
const resultSuccess = document.getElementById('resultSuccess');
const errorMessage = document.getElementById('errorMessage');
const resultCount = document.getElementById('resultCount');
const resultGrid = document.getElementById('resultGrid');
const downloadAllBtn = document.getElementById('downloadAllBtn');

// Action buttons
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');

// Cropper modal elements
const cropperModal = document.getElementById('cropperModal');
const cropCanvas = document.getElementById('cropCanvas');
const cropBox = document.getElementById('cropBox');
const confirmCropBtn = document.getElementById('confirmCropBtn');
const cancelCropBtn = document.getElementById('cancelCropBtn');

// ==================== Event Listeners ====================

// API Key visibility toggle
toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);

// API Key input
apiKeyInput.addEventListener('input', handleApiKeyInput);

// Upload area events
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

// Button events
generateBtn.addEventListener('click', handleGenerate);
resetBtn.addEventListener('click', handleReset);
downloadAllBtn.addEventListener('click', handleDownloadAll);

// Cropper events
confirmCropBtn.addEventListener('click', handleConfirmCrop);
cancelCropBtn.addEventListener('click', handleCancelCrop);

// ==================== API Key Functions ====================

/**
 * Toggle API key input visibility between password and text
 */
function toggleApiKeyVisibility() {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    showIcon.classList.toggle('hidden', isPassword);
    hideIcon.classList.toggle('hidden', !isPassword);
}

/**
 * Handle API key input changes
 */
function handleApiKeyInput(e) {
    state.apiKey = e.target.value.trim();
    updateGenerateButton();
}

// ==================== Upload Functions ====================

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
}

/**
 * Handle file drop
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImageFile(file);
    }
}

/**
 * Handle file selection from input
 */
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

/**
 * Process the selected image file and open cropper
 */
function processImageFile(file) {
    // Reset state
    state.selectedFile = file;
    state.croppedImageData = null;
    state.croppedImageMimeType = null;
    state.generatedImages = [];
    
    // Hide results and errors
    hideAllResultStates();
    resultPlaceholder.classList.remove('hidden');
    
    // Load image for cropping
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            state.cropData.image = img;
            openCropper(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==================== Cropper Functions ====================

/**
 * Open the image cropper modal
 */
function openCropper(img) {
    cropperModal.classList.remove('hidden');
    
    // Set canvas size
    const maxWidth = 600;
    const maxHeight = window.innerHeight * 0.6;
    let width = img.width;
    let height = img.height;
    
    // Scale image to fit
    if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
    }
    if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
    }
    
    cropCanvas.width = width;
    cropCanvas.height = height;
    
    // Draw image on canvas
    const ctx = cropCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Initialize crop box (90% of canvas, centered, square aspect ratio)
    const cropSize = Math.min(width, height) * 0.9;
    state.cropData.width = cropSize;
    state.cropData.height = cropSize;
    state.cropData.startX = (width - cropSize) / 2;
    state.cropData.startY = (height - cropSize) / 2;
    
    updateCropBox();
    initCropBoxDrag();
}

/**
 * Update crop box position and size
 */
function updateCropBox() {
    // Get canvas position within container
    const canvasRect = cropCanvas.getBoundingClientRect();
    const containerRect = cropCanvas.parentElement.getBoundingClientRect();
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;
    
    // Position crop box relative to canvas position in container
    cropBox.style.left = (offsetX + state.cropData.startX) + 'px';
    cropBox.style.top = (offsetY + state.cropData.startY) + 'px';
    cropBox.style.width = state.cropData.width + 'px';
    cropBox.style.height = state.cropData.height + 'px';
}

/**
 * Initialize crop box dragging functionality
 */
function initCropBoxDrag() {
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = null;
    let startMouseX = 0;
    let startMouseY = 0;
    let startBoxX = 0;
    let startBoxY = 0;
    let startBoxWidth = 0;
    let startBoxHeight = 0;
    
    /**
     * Get mouse position relative to canvas
     */
    function getCanvasMousePosition(clientX, clientY) {
        const rect = cropCanvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    // Handle crop box dragging
    cropBox.addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('crop-handle')) {
            isResizing = true;
            resizeHandle = e.target;
        } else {
            isDragging = true;
        }
        
        const mousePos = getCanvasMousePosition(e.clientX, e.clientY);
        startMouseX = mousePos.x;
        startMouseY = mousePos.y;
        startBoxX = state.cropData.startX;
        startBoxY = state.cropData.startY;
        startBoxWidth = state.cropData.width;
        startBoxHeight = state.cropData.height;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const mousePos = getCanvasMousePosition(e.clientX, e.clientY);
            const dx = mousePos.x - startMouseX;
            const dy = mousePos.y - startMouseY;
            
            // Update position with bounds checking
            state.cropData.startX = Math.max(0, Math.min(startBoxX + dx, cropCanvas.width - state.cropData.width));
            state.cropData.startY = Math.max(0, Math.min(startBoxY + dy, cropCanvas.height - state.cropData.height));
            
            updateCropBox();
        } else if (isResizing && resizeHandle) {
            const mousePos = getCanvasMousePosition(e.clientX, e.clientY);
            const dx = mousePos.x - startMouseX;
            const dy = mousePos.y - startMouseY;
            
            // Determine which handle is being dragged
            const handleClass = resizeHandle.className;
            
            if (handleClass.includes('se')) {
                // Southeast - increase size
                const delta = Math.max(dx, dy); // Use max to maintain square aspect
                const newSize = Math.max(50, startBoxWidth + delta);
                const maxSize = Math.min(cropCanvas.width - startBoxX, cropCanvas.height - startBoxY);
                state.cropData.width = Math.min(newSize, maxSize);
                state.cropData.height = state.cropData.width;
            } else if (handleClass.includes('nw')) {
                // Northwest - decrease size and move position
                const delta = Math.min(dx, dy);
                const newSize = Math.max(50, startBoxWidth - delta);
                state.cropData.width = newSize;
                state.cropData.height = newSize;
                state.cropData.startX = startBoxX + (startBoxWidth - newSize);
                state.cropData.startY = startBoxY + (startBoxHeight - newSize);
            } else if (handleClass.includes('ne')) {
                // Northeast
                const deltaX = dx;
                const deltaY = -dy;
                const delta = Math.max(deltaX, deltaY);
                const newSize = Math.max(50, startBoxWidth + delta);
                const maxSizeX = cropCanvas.width - startBoxX;
                const maxSizeY = startBoxY + startBoxHeight;
                const finalSize = Math.min(newSize, maxSizeX, maxSizeY);
                state.cropData.width = finalSize;
                state.cropData.height = finalSize;
                state.cropData.startY = startBoxY + (startBoxHeight - finalSize);
            } else if (handleClass.includes('sw')) {
                // Southwest
                const deltaX = -dx;
                const deltaY = dy;
                const delta = Math.max(deltaX, deltaY);
                const newSize = Math.max(50, startBoxWidth + delta);
                const maxSizeX = startBoxX + startBoxWidth;
                const maxSizeY = cropCanvas.height - startBoxY;
                const finalSize = Math.min(newSize, maxSizeX, maxSizeY);
                state.cropData.width = finalSize;
                state.cropData.height = finalSize;
                state.cropData.startX = startBoxX + (startBoxWidth - finalSize);
            }
            
            updateCropBox();
        }
    });
    
    document.addEventListener('mouseup', function() {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    });
}

/**
 * Handle crop confirmation
 */
function handleConfirmCrop() {
    const img = state.cropData.image;
    
    // Calculate scale factor between canvas and original image
    const scaleX = img.width / cropCanvas.width;
    const scaleY = img.height / cropCanvas.height;
    
    // Calculate crop coordinates on original image
    const cropX = state.cropData.startX * scaleX;
    const cropY = state.cropData.startY * scaleY;
    const cropWidth = state.cropData.width * scaleX;
    const cropHeight = state.cropData.height * scaleY;
    
    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    const pixelRatio = window.devicePixelRatio || 1;
    croppedCanvas.width = cropWidth * pixelRatio;
    croppedCanvas.height = cropHeight * pixelRatio;
    
    const ctx = croppedCanvas.getContext('2d');
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    
    // Draw the cropped portion
    ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
    );
    
    // Convert to base64
    croppedCanvas.toBlob(function(blob) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            state.croppedImageData = dataUrl.split(',')[1];
            state.croppedImageMimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            
            // Update preview
            previewImage.src = dataUrl;
            uploadPlaceholder.classList.add('hidden');
            imagePreview.classList.remove('hidden');
            
            // Update UI
            updateGenerateButton();
            updateResetButton();
            updateResultPlaceholder();
        };
        reader.readAsDataURL(blob);
        
        // Close modal
        cropperModal.classList.add('hidden');
    }, 'image/png', 1);
}

/**
 * Handle crop cancellation
 */
function handleCancelCrop() {
    cropperModal.classList.add('hidden');
    state.selectedFile = null;
    state.cropData.image = null;
}

// ==================== Generation Functions ====================

/**
 * Handle generate button click - Main AI generation function
 */
async function handleGenerate() {
    if (!state.apiKey) {
        showError('Please enter your Gemini API key.');
        return;
    }
    
    if (!state.croppedImageData) {
        showError('Please upload and crop an image first.');
        return;
    }
    
    // Update UI to loading state
    state.isLoading = true;
    state.generatedImages = [];
    hideAllResultStates();
    resultLoading.classList.remove('hidden');
    generateBtn.disabled = true;
    resetBtn.disabled = true;
    
    try {
        // Generate professional images using Gemini API
        const images = await generateProfessionalImages(
            state.croppedImageData,
            state.croppedImageMimeType,
            state.apiKey
        );
        
        if (images && images.length > 0) {
            state.generatedImages = images;
            displayResults(images);
        } else {
            showError('The AI could not process this image. Please try another one.');
        }
    } catch (err) {
        console.error('Generation error:', err);
        showError(err.message || 'An error occurred while generating the images. Please check your API key and try again.');
    } finally {
        state.isLoading = false;
        generateBtn.disabled = false;
        resetBtn.disabled = false;
    }
}

/**
 * Professional suit styles for generation
 */
const professionalLooks = [
    // Classic Style (3 images)
    { style: 'classic', color: 'dark navy blue' },
    { style: 'classic', color: 'classic black' },
    { style: 'classic', color: 'light gray' },
    // Modern Style (3 images)
    { style: 'modern', color: 'charcoal gray' },
    { style: 'modern', color: 'brown' },
    { style: 'modern', color: 'dark green' },
    // Minimalist Style (3 images)
    { style: 'minimalist', color: 'burgundy' },
    { style: 'minimalist', color: 'beige' },
    { style: 'minimalist', color: 'deep charcoal' }
];

/**
 * Generate the AI prompt for image transformation
 */
function generatePrompt(style, suitColor) {
    let styleDescription = "a classic, well-fitting business suit";
    if (style === 'modern') {
        styleDescription = "a modern, slim-fit business suit";
    } else if (style === 'minimalist') {
        styleDescription = "a minimalist and elegant business suit with clean lines";
    }
    
    return `Please transform this photo into a professional headshot. Perform the following edits:
1. **Retouching**: This is a key instruction. Perform a subtle beauty retouch, with a specific focus on the eye area. It is essential to completely remove any dark circles, eye bags, and signs of tiredness from under the eyes. Brighten the eyes slightly for a more awake and alert appearance, while ensuring the result looks natural and professional. Also enhance the overall lighting and sharpness for a polished, high-quality result. It is crucial to preserve the person's natural facial features, hair, and expression.
2. **Attire**: This is a critical instruction. Change the person's clothing to a ${styleDescription}. The color of the suit is very important: it MUST be ${suitColor}. Do not use any other color.
3. **Background**: The existing background MUST be replaced with a subtly blurred, neutral, out-of-focus professional background (like a modern office or a simple studio backdrop). This is crucial for creating a professional depth-of-field effect and ensuring the person is the only subject in focus.
The final output must be only the modified image.`;
}

/**
 * Call Gemini API to generate a single professional image
 */
async function generateSingleImage(base64ImageData, mimeType, apiKey, style, suitColor) {
    const prompt = generatePrompt(style, suitColor);
    
    const requestBody = {
        contents: [{
            parts: [
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: base64ImageData
                    }
                },
                {
                    text: prompt
                }
            ]
        }],
        generationConfig: {
            response_modalities: ["IMAGE", "TEXT"]
        }
    };
    
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        }
    );
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate image');
    }
    
    const data = await response.json();
    
    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part.inline_data) {
            return part.inline_data.data;
        }
    }
    
    return null;
}

/**
 * Generate all professional images (9 styles)
 */
async function generateProfessionalImages(base64ImageData, mimeType, apiKey) {
    const generatedImages = [];
    
    // Generate images sequentially to avoid rate-limiting
    for (const look of professionalLooks) {
        try {
            const result = await generateSingleImage(
                base64ImageData,
                mimeType,
                apiKey,
                look.style,
                look.color
            );
            
            if (result) {
                generatedImages.push(result);
            }
        } catch (err) {
            console.error(`Error generating ${look.style} ${look.color}:`, err);
            // Continue with other images even if one fails
        }
    }
    
    return generatedImages;
}

// ==================== Display Functions ====================

/**
 * Display generated results in the grid
 */
function displayResults(images) {
    hideAllResultStates();
    resultSuccess.classList.remove('hidden');
    
    // Update count
    resultCount.textContent = `${images.length} Headshots Ready!`;
    
    // Clear grid
    resultGrid.innerHTML = '';
    
    // Add images to grid
    images.forEach((base64Image, index) => {
        const imageUrl = `data:image/png;base64,${base64Image}`;
        
        const item = document.createElement('div');
        item.className = 'result-item';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Headshot ${index + 1}`;
        
        const overlay = document.createElement('div');
        overlay.className = 'result-item-overlay';
        
        const actions = document.createElement('div');
        actions.className = 'result-item-actions';
        
        const label = document.createElement('div');
        label.className = 'style-label';
        label.textContent = `Style ${index + 1}`;
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = 'Save';
        downloadBtn.onclick = () => downloadImage(imageUrl, index);
        
        actions.appendChild(label);
        actions.appendChild(downloadBtn);
        overlay.appendChild(actions);
        
        item.appendChild(img);
        item.appendChild(overlay);
        resultGrid.appendChild(item);
    });
    
    updateResetButton();
}

/**
 * Show error message
 */
function showError(message) {
    hideAllResultStates();
    resultError.classList.remove('hidden');
    errorMessage.textContent = message;
}

/**
 * Hide all result states
 */
function hideAllResultStates() {
    resultPlaceholder.classList.add('hidden');
    resultLoading.classList.add('hidden');
    resultError.classList.add('hidden');
    resultSuccess.classList.add('hidden');
}

/**
 * Update result placeholder text based on state
 */
function updateResultPlaceholder() {
    const title = resultPlaceholder.querySelector('.result-title');
    const text = resultPlaceholder.querySelector('.result-text');
    
    if (state.croppedImageData) {
        title.textContent = 'Ready to generate!';
        text.textContent = 'Click the generate button below';
    } else {
        title.textContent = 'Your headshots will appear here';
        text.textContent = 'Upload a photo to get started';
    }
}

// ==================== Download Functions ====================

/**
 * Download a single image
 */
function downloadImage(imageUrl, index) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `headshot-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Download all images as a ZIP file
 */
async function handleDownloadAll() {
    if (!state.generatedImages || state.generatedImages.length === 0) return;
    
    // Create a new ZIP file
    const zip = new JSZip();
    
    // Add all images to ZIP
    for (let i = 0; i < state.generatedImages.length; i++) {
        const base64Image = state.generatedImages[i];
        const imageUrl = `data:image/png;base64,${base64Image}`;
        
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            zip.file(`headshot-${i + 1}.png`, blob);
        } catch (err) {
            console.error(`Error adding image ${i + 1} to ZIP:`, err);
        }
    }
    
    // Generate and download ZIP
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'headshots.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
}

// ==================== UI Update Functions ====================

/**
 * Update generate button state
 */
function updateGenerateButton() {
    const hasApiKey = state.apiKey.length > 0;
    const hasImage = state.croppedImageData !== null;
    generateBtn.disabled = !hasApiKey || !hasImage || state.isLoading;
}

/**
 * Update reset button visibility
 */
function updateResetButton() {
    const shouldShow = state.croppedImageData || state.generatedImages.length > 0;
    resetBtn.classList.toggle('hidden', !shouldShow);
}

/**
 * Reset the application to initial state
 */
function handleReset() {
    // Reset state
    state.selectedFile = null;
    state.croppedImageData = null;
    state.croppedImageMimeType = null;
    state.generatedImages = [];
    state.isLoading = false;
    
    // Reset file input
    fileInput.value = '';
    
    // Reset upload area
    uploadPlaceholder.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    previewImage.src = '';
    
    // Reset results
    hideAllResultStates();
    resultPlaceholder.classList.remove('hidden');
    
    // Update UI
    updateGenerateButton();
    updateResetButton();
    updateResultPlaceholder();
}

// ==================== Initialization ====================

/**
 * Initialize the application
 */
function init() {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        state.apiKey = savedApiKey;
        updateGenerateButton();
    }
    
    // Save API key to localStorage on input
    apiKeyInput.addEventListener('blur', function() {
        if (state.apiKey) {
            localStorage.setItem('gemini_api_key', state.apiKey);
        }
    });
    
    // Initial UI state
    updateGenerateButton();
    updateResetButton();
    updateResultPlaceholder();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

