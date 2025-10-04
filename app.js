/**
 * HeadshotAI - Professional Headshot Generator
 * 
 * This application uses Google's Gemini AI API to transform photos into
 * professional headshots. It generates 1 image based on the selected style.
 * 
 * Features:
 * - Image upload with drag & drop support
 * - Interactive image cropping
 * - Customizable AI prompts
 * - Multiple style options (professional, casual, passport, etc.)
 * - Real-time API connection testing
 * - Responsive design with slide navigation
 */

// ==================== Application State ====================

const state = {
    apiKey: '',                    // User's Gemini API key
    selectedFile: null,            // Original uploaded file
    croppedImageData: null,        // Cropped image data (base64)
    croppedImageMimeType: null,    // MIME type of cropped image
    parameters: {
        type: 'linkedin',
        hairStyle: 'none',
        dressStyle: 'grey-sweater',
        background: 'soft-grey',
        retouching: 'false',
        headTilting: 'false'
    },
    customPrompt: null,            // Custom prompt from textarea
    generatedImage: null,          // Single generated base64 image
    isLoading: false,              // Loading state
    currentSlide: 0,               // Current slide index (0 = upload, 1 = results)
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

// Parameter selection elements
const typeSelect = document.getElementById('typeSelect');
const hairStyleSelect = document.getElementById('hairStyleSelect');
const dressStyleSelect = document.getElementById('dressStyleSelect');
const backgroundSelect = document.getElementById('backgroundSelect');
const retouchingSelect = document.getElementById('retouchingSelect');
const headTiltingSelect = document.getElementById('headTiltingSelect');

// Test connection elements
const testConnectionBtn = document.getElementById('testConnectionBtn');

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

// Dark mode elements
const darkModeToggle = document.getElementById('darkModeToggle');
const sunIcon = document.getElementById('sunIcon');
const moonIcon = document.getElementById('moonIcon');

// Prompt editor elements
const togglePromptEditor = document.getElementById('togglePromptEditor');
const promptEditorContent = document.getElementById('promptEditorContent');
const promptTextarea = document.getElementById('promptTextarea');
const resetPromptBtn = document.getElementById('resetPromptBtn');

// Slide navigation elements
const indicators = document.querySelectorAll('.indicator');
const slides = document.querySelectorAll('.slide');

// ==================== Event Listeners ====================

// API Key visibility toggle
toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);

// API Key input
apiKeyInput.addEventListener('input', handleApiKeyInput);

// Parameter selections
typeSelect.addEventListener('change', handleParameterChange);
hairStyleSelect.addEventListener('change', handleParameterChange);
dressStyleSelect.addEventListener('change', handleParameterChange);
backgroundSelect.addEventListener('change', handleParameterChange);
retouchingSelect.addEventListener('change', handleParameterChange);
headTiltingSelect.addEventListener('change', handleParameterChange);

// Test connection
testConnectionBtn.addEventListener('click', handleTestConnection);

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

// Indicator events
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => goToSlide(index));
});

// Prompt editor events
togglePromptEditor.addEventListener('click', togglePromptEditorVisibility);
resetPromptBtn.addEventListener('click', resetPromptToDefault);
promptTextarea.addEventListener('input', handlePromptTextareaChange);

// Dark mode events
darkModeToggle.addEventListener('click', toggleDarkMode);

// ==================== Dark Mode Functions ====================

/**
 * Toggle dark mode on/off
 * Saves preference to localStorage and updates UI
 */
function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        // Switch to light mode
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        // Switch to dark mode
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

/**
 * Initialize dark mode from localStorage
 * Sets the initial theme based on saved preference or system preference
 */
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

// ==================== API Key Functions ====================

/**
 * Toggle API key input visibility between password and text
 * Provides user-friendly way to view/hide the API key while typing
 */
function toggleApiKeyVisibility() {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    showIcon.classList.toggle('hidden', isPassword);
    hideIcon.classList.toggle('hidden', !isPassword);
}

/**
 * Handle API key input changes
 * Updates application state and enables/disables relevant buttons
 */
function handleApiKeyInput(e) {
    state.apiKey = e.target.value.trim();
    updateGenerateButton();
    updateTestConnectionButton();
}

/**
 * Handle parameter changes from dropdown selections
 * Updates the AI prompt when user changes style parameters
 */
function handleParameterChange(e) {
    const parameterName = e.target.id.replace('Select', '');
    state.parameters[parameterName] = e.target.value;
    console.log('📝 Parameter updated:', parameterName, '=', e.target.value);
    
    // Update prompt textarea when dropdowns change
    updatePromptFromParameters();
    
    updateGenerateButton();
}

/**
 * Test API connection with a simple text generation request
 * Validates the API key before allowing image generation
 */
async function handleTestConnection() {
    if (!state.apiKey) {
        showError('Please enter your API key first.');
        return;
    }
    
    console.log('🔍 Testing API connection...');
    testConnectionBtn.disabled = true;
    testConnectionBtn.innerHTML = `
        <svg class="icon-small btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Testing...
    `;
    
    try {
        // Test with a simple text generation request
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${state.apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Hello, please respond with 'API connection successful'"
                        }]
                    }]
                })
            }
        );
        
        console.log('📡 API Response Status:', response.status);
        console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API Error Response:', errorData);
            throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response Data:', data);
        
        // Show success state
        testConnectionBtn.classList.add('success');
        testConnectionBtn.innerHTML = `
            <svg class="icon-small btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Connection Successful
        `;
        
        showError('✅ API connection successful! You can now generate headshots.');
        setTimeout(() => {
            hideAllResultStates();
            resultPlaceholder.classList.remove('hidden');
            // Reset button after delay
            setTimeout(() => {
                testConnectionBtn.classList.remove('success');
                testConnectionBtn.innerHTML = `
                    <svg class="icon-small btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test Connection
                `;
            }, 2000);
        }, 3000);
        
    } catch (err) {
        console.error('❌ API Connection Test Failed:', err);
        
        // Show error state
        testConnectionBtn.classList.add('error');
        testConnectionBtn.innerHTML = `
            <svg class="icon-small btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Connection Failed
        `;
        
        showError(`❌ API connection failed: ${err.message}`);
        
        // Reset button after delay
        setTimeout(() => {
            testConnectionBtn.classList.remove('error');
            testConnectionBtn.innerHTML = `
                <svg class="icon-small btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Connection
            `;
        }, 3000);
    } finally {
        // Reset button state
        testConnectionBtn.disabled = false;
    }
}

// ==================== Prompt Editor Functions ====================

/**
 * Toggle prompt editor visibility
 */
function togglePromptEditorVisibility() {
    const isHidden = promptEditorContent.classList.contains('hidden');
    
    if (isHidden) {
        promptEditorContent.classList.remove('hidden');
        togglePromptEditor.classList.add('expanded');
    } else {
        promptEditorContent.classList.add('hidden');
        togglePromptEditor.classList.remove('expanded');
    }
}

/**
 * Reset prompt to default based on current parameters
 */
function resetPromptToDefault() {
    updatePromptFromParameters();
    console.log('🔄 Prompt reset to default');
}

/**
 * Update prompt textarea from current parameters
 */
function updatePromptFromParameters() {
    const prompt = generatePrompt(state.parameters);
    promptTextarea.value = prompt;
    console.log('📝 Prompt updated from parameters');
}

/**
 * Handle prompt textarea changes
 */
function handlePromptTextareaChange(e) {
    // Store custom prompt in state for later use
    state.customPrompt = e.target.value;
    console.log('📝 Custom prompt updated');
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
    state.generatedImage = null;
    
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
 * Sets up the canvas and initializes the crop box for user interaction
 */
function openCropper(img) {
    cropperModal.classList.remove('hidden');
    
    // Set canvas size with better mobile handling
    const isMobile = window.innerWidth <= 768;
    const isSmallPhone = window.innerWidth <= 480;
    
    // Calculate available space more accurately
    const modalPadding = 32; // 1.5rem * 2 (top + bottom)
    const modalHeader = 120; // Approximate height of modal header
    const modalActions = 80; // Approximate height of modal actions
    const availableHeight = window.innerHeight - modalPadding - modalHeader - modalActions;
    
    // Set maximum dimensions based on screen size
    const maxWidth = isSmallPhone ? Math.min(400, window.innerWidth - 32) : 
                     isMobile ? Math.min(500, window.innerWidth - 32) : 600;
    const maxHeight = isSmallPhone ? Math.min(300, availableHeight) :
                      isMobile ? Math.min(400, availableHeight) : 
                      Math.min(600, availableHeight);
    
    let width = img.width;
    let height = img.height;
    
    // Scale image to fit within constraints
    const scaleX = maxWidth / width;
    const scaleY = maxHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    width = width * scale;
    height = height * scale;
    
    cropCanvas.width = width;
    cropCanvas.height = height;
    
    // Draw image on canvas
    const ctx = cropCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Initialize crop box (90% of canvas, centered, square aspect ratio)
    // Use smaller size on mobile to ensure handles stay within bounds
    const cropSize = Math.min(width, height) * (isSmallPhone ? 0.6 : isMobile ? 0.7 : 0.9);
    state.cropData.width = cropSize;
    state.cropData.height = cropSize;
    state.cropData.startX = (width - cropSize) / 2;
    state.cropData.startY = (height - cropSize) / 2;
    
    updateCropBox();
    initCropBoxDrag();
}

/**
 * Update crop box position and size on the canvas
 * Calculates relative positioning for the draggable crop area
 */
function updateCropBox() {
    // Get canvas position within container
    const canvasRect = cropCanvas.getBoundingClientRect();
    const containerRect = cropCanvas.parentElement.getBoundingClientRect();
    const offsetX = canvasRect.left - containerRect.left;
    const offsetY = canvasRect.top - containerRect.top;
    
    // Calculate the actual image position within the canvas
    // The image is drawn at (0,0) but might be scaled, so we need to account for that
    const imageScale = Math.min(canvasRect.width / cropCanvas.width, canvasRect.height / cropCanvas.height);
    const imageOffsetX = (canvasRect.width - cropCanvas.width * imageScale) / 2;
    const imageOffsetY = (canvasRect.height - cropCanvas.height * imageScale) / 2;
    
    // Position crop box relative to the actual image position
    cropBox.style.left = (offsetX + imageOffsetX + state.cropData.startX * imageScale) + 'px';
    cropBox.style.top = (offsetY + imageOffsetY + state.cropData.startY * imageScale) + 'px';
    cropBox.style.width = (state.cropData.width * imageScale) + 'px';
    cropBox.style.height = (state.cropData.height * imageScale) + 'px';
}

/**
 * Initialize crop box dragging functionality
 * Handles mouse and touch events for moving and resizing the crop area
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
     * Get mouse/touch position relative to canvas
     */
    function getCanvasPosition(clientX, clientY) {
        const rect = cropCanvas.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    /**
     * Handle start of interaction (mouse down or touch start)
     */
    function handleStart(e, clientX, clientY) {
        if (e.target.classList.contains('crop-handle')) {
            isResizing = true;
            resizeHandle = e.target;
        } else {
            isDragging = true;
        }
        
        const pos = getCanvasPosition(clientX, clientY);
        startMouseX = pos.x;
        startMouseY = pos.y;
        startBoxX = state.cropData.startX;
        startBoxY = state.cropData.startY;
        startBoxWidth = state.cropData.width;
        startBoxHeight = state.cropData.height;
        e.preventDefault();
    }
    
    /**
     * Handle movement (mouse move or touch move)
     */
    function handleMove(e, clientX, clientY) {
        if (isDragging) {
            const pos = getCanvasPosition(clientX, clientY);
            const dx = pos.x - startMouseX;
            const dy = pos.y - startMouseY;
            
            // Update position with bounds checking
            // Minimal margin to allow reaching edges while keeping handles visible
            const isMobile = window.innerWidth <= 768;
            const margin = isMobile ? 2 : 1; // Minimal margin to allow edge access
            state.cropData.startX = Math.max(margin, Math.min(startBoxX + dx, cropCanvas.width - state.cropData.width - margin));
            state.cropData.startY = Math.max(margin, Math.min(startBoxY + dy, cropCanvas.height - state.cropData.height - margin));
            
            updateCropBox();
        } else if (isResizing && resizeHandle) {
            const pos = getCanvasPosition(clientX, clientY);
            const dx = pos.x - startMouseX;
            const dy = pos.y - startMouseY;
            
            // Determine which handle is being dragged
            const handleClass = resizeHandle.className;
            
            if (handleClass.includes('se')) {
                // Southeast - increase size
                const delta = Math.max(dx, dy); // Use max to maintain square aspect
                const isMobile = window.innerWidth <= 768;
                const minSize = isMobile ? 40 : 30; // Reduced minimum size to allow edge access
                const margin = isMobile ? 2 : 1; // Minimal margin to allow edge access
                const newSize = Math.max(minSize, startBoxWidth + delta);
                const maxSize = Math.min(cropCanvas.width - startBoxX - margin, cropCanvas.height - startBoxY - margin);
                state.cropData.width = Math.min(newSize, maxSize);
                state.cropData.height = state.cropData.width;
            } else if (handleClass.includes('nw')) {
                // Northwest - decrease size and move position
                const delta = Math.min(dx, dy);
                const isMobile = window.innerWidth <= 768;
                const minSize = isMobile ? 40 : 30; // Reduced minimum size to allow edge access
                const margin = isMobile ? 2 : 1; // Minimal margin to allow edge access
                const newSize = Math.max(minSize, startBoxWidth - delta);
                state.cropData.width = newSize;
                state.cropData.height = newSize;
                state.cropData.startX = Math.max(margin, startBoxX + (startBoxWidth - newSize));
                state.cropData.startY = Math.max(margin, startBoxY + (startBoxHeight - newSize));
            } else if (handleClass.includes('ne')) {
                // Northeast
                const deltaX = dx;
                const deltaY = -dy;
                const delta = Math.max(deltaX, deltaY);
                const isMobile = window.innerWidth <= 768;
                const minSize = isMobile ? 40 : 30; // Reduced minimum size to allow edge access
                const margin = isMobile ? 2 : 1; // Minimal margin to allow edge access
                const newSize = Math.max(minSize, startBoxWidth + delta);
                const maxSizeX = cropCanvas.width - startBoxX - margin;
                const maxSizeY = startBoxY + startBoxHeight - margin;
                const finalSize = Math.min(newSize, maxSizeX, maxSizeY);
                state.cropData.width = finalSize;
                state.cropData.height = finalSize;
                state.cropData.startY = Math.max(margin, startBoxY + (startBoxHeight - finalSize));
            } else if (handleClass.includes('sw')) {
                // Southwest
                const deltaX = -dx;
                const deltaY = dy;
                const delta = Math.max(deltaX, deltaY);
                const isMobile = window.innerWidth <= 768;
                const minSize = isMobile ? 40 : 30; // Reduced minimum size to allow edge access
                const margin = isMobile ? 2 : 1; // Minimal margin to allow edge access
                const newSize = Math.max(minSize, startBoxWidth + delta);
                const maxSizeX = startBoxX + startBoxWidth - margin;
                const maxSizeY = cropCanvas.height - startBoxY - margin;
                const finalSize = Math.min(newSize, maxSizeX, maxSizeY);
                state.cropData.width = finalSize;
                state.cropData.height = finalSize;
                state.cropData.startX = Math.max(margin, startBoxX + (startBoxWidth - finalSize));
            }
            
            updateCropBox();
        }
    }
    
    /**
     * Handle end of interaction (mouse up or touch end)
     */
    function handleEnd() {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    }
    
    // Mouse events
    cropBox.addEventListener('mousedown', function(e) {
        handleStart(e, e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', function(e) {
        handleMove(e, e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', function() {
        handleEnd();
    });
    
    // Touch events for mobile devices
    cropBox.addEventListener('touchstart', function(e) {
        // Only prevent default if we're actually starting a drag/resize operation
        const touch = e.touches[0];
        handleStart(e, touch.clientX, touch.clientY);
        e.preventDefault(); // Prevent default touch behaviors only after we've started
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        // Only prevent default if we're actively dragging/resizing
        if (isDragging || isResizing) {
            e.preventDefault(); // Prevent scrolling during touch
            const touch = e.touches[0];
            handleMove(e, touch.clientX, touch.clientY);
        }
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        // Only prevent default if we were actually dragging/resizing
        if (isDragging || isResizing) {
            e.preventDefault();
        }
        handleEnd();
    }, { passive: false });
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

// ==================== Slide Functions ====================

/**
 * Go to a specific slide
 */
function goToSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= slides.length) return;
    
    const currentSlideElement = slides[state.currentSlide];
    const targetSlideElement = slides[slideIndex];
    
    // Add transition classes
    if (slideIndex > state.currentSlide) {
        // Moving forward
        currentSlideElement.classList.add('slide-out-left');
        targetSlideElement.classList.add('slide-in-right');
    } else {
        // Moving backward
        currentSlideElement.classList.add('slide-out-right');
        targetSlideElement.classList.add('slide-in-left');
    }
    
    // Update state
    state.currentSlide = slideIndex;
    
    // Update slide visibility
    setTimeout(() => {
        // Remove all active classes
        slides.forEach(slide => {
            slide.classList.remove('active', 'slide-in-right', 'slide-in-left', 'slide-out-right', 'slide-out-left');
        });
        
        // Add active class to current slide
        targetSlideElement.classList.add('active');
        
        // Update navigation buttons
        updateNavigationButtons();
    }, 250);
}

/**
 * Update navigation indicators
 */
function updateNavigationButtons() {
    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === state.currentSlide);
    });
}

/**
 * Auto-slide to results page when generation starts
 */
function slideToResults() {
    goToSlide(1);
}

// ==================== Generation Functions ====================

/**
 * Handle generate button click - Main AI generation function
 * Orchestrates the entire image generation process using Gemini API
 */
async function handleGenerate() {
    console.log('🚀 Starting image generation process...');
    
    if (!state.apiKey) {
        console.log('❌ No API key provided');
        showError('Please enter your Gemini API key.');
        return;
    }
    
    if (!state.croppedImageData) {
        console.log('❌ No cropped image data');
        showError('Please upload and crop an image first.');
        return;
    }
    
    console.log('✅ All prerequisites met:', {
        hasApiKey: !!state.apiKey,
        hasImage: !!state.croppedImageData,
        parameters: state.parameters,
        imageMimeType: state.croppedImageMimeType
    });
    
    // Update UI to loading state
    state.isLoading = true;
    state.generatedImage = null;
    hideAllResultStates();
    resultLoading.classList.remove('hidden');
    generateBtn.disabled = true;
    resetBtn.disabled = true;
    updateTestConnectionButton();
    
    // Auto-slide to results page
    slideToResults();
    
    try {
        // Generate single professional image using Gemini API
        console.log('📡 Calling Gemini API for image generation...');
        const image = await generateSingleImage(
            state.croppedImageData,
            state.croppedImageMimeType,
            state.apiKey,
            state.parameters
        );
        
        if (image) {
            console.log('✅ Image generated successfully, length:', image.length);
            state.generatedImage = image;
            displayResult(image);
        } else {
            console.log('❌ No image returned from API');
            showError('The AI could not process this image. Please try another one.');
        }
    } catch (err) {
        console.error('❌ Generation error:', err);
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        showError(err.message || 'An error occurred while generating the image. Please check your API key and try again.');
    } finally {
        console.log('🏁 Generation process completed');
        state.isLoading = false;
        generateBtn.disabled = false;
        resetBtn.disabled = false;
        updateTestConnectionButton();
    }
}

/**
 * Parameter mappings
 */
const typeMapping = {
    'passport': "Transform this photo into a polished, modern Passport photo \
that complies with standard passport requirements. No filters or retouching that alters appearance. \
Neutral expression, eyes open, mouth closed, head and shoulders centered, facing camera straight-on. \
Full head visible with space around; no hats, sunglasses, or heavy accessories. \
Capture the subject in even lighting with no shadows or glare. \
Compose for passports: Natural skin tones, sharp focus; \
high resolution, 35x45 mm at 300 DPI.",
    
    'headshot': "Transform this photo into a polished, modern, and approachable professional headshot \
that reflects the subject's passion, purpose, and personality—ideal for personal branding. \
Emphasize a friendly, confident expression with sharp focus on the eyes. \
Compose for personal branding: chest-up framing, neutral and professional tones, minimal distractions, \
balanced composition, high-resolution.",
        
    'linkedin': "Transform this photo into a polished, modern, and approachable Linkedin-style portrait \
that reflects a strong professional image. \
Emphasize a friendly, confident expression with sharp focus on the eyes. \
Compose for LinkedIn: neutral and professional tones, minimal distractions, high resolution.",
    
    'casual': "Transform this photo into a relaxed, informal, and approachable casual headshot with a laid-back pose. \
that reflects the subject's personality and lifestyle. \
Emphasize a friendly expression, warm tones, and shallow depth of field. \
Compose for social media: waist-up framing, headroom for cropping, \
high-resolution, social media-ready cropping (1:1 or 4:5)."
};

const hairStyleMapping = {
    'none': 'Keep the hair as it is.',
    'professional': 'Style the hair in a clean, professional manner that looks polished and well-groomed. Ensure the hair is neat, styled appropriately for a business setting, and enhances the professional appearance.',
    'casual': 'Style the hair in a natural, relaxed manner that looks effortless and approachable. Keep the styling simple and comfortable while maintaining a clean appearance.',
    'formal': 'Style the hair in a formal, well-groomed manner suitable for formal occasions. Ensure the hair looks sophisticated, elegant, and perfectly styled for professional or formal settings.',
    'modern': 'Style the hair in a contemporary, modern way that reflects current trends while maintaining professionalism. Create a stylish, up-to-date look that is both fashionable and appropriate.'
};

const dressStyleMapping = {
    'navy-suit': 'Dress the person in a navy-blue three-piece suit made of lightly pleated fabric, paired with a crisp white professional shirt and a neatly tied Windsor knot tie.',
    'navy-dress': 'Dress the person in a sleeveless navy blue round neck dress made of lightly pleated fabric.',
    'grey-sweater': 'Dress the person in a dark grey crew-neck sweater over a light blue collared shirt.',
    'black-suit': 'Dress the person in a black, modern, slim-fit business suit.',
    'grey-suit': 'Dress the person in a grey, elegant business suit with clean lines.',
    'casual': 'Dress the person in a casual, relaxed, everyday attire.'
};

const backgroundMapping = {
    'plain-white': 'Use a plain white background.',
    'light-blue': 'Use a light blue background.',
    'light-pink': 'Use a light pink background.',
    'soft-grey': 'Use a soft grey background.',
    'smoke-blue': 'Use a smoke blue background.',
    'modern-office': 'Use a subtly blurred, neutral, out-of-focus background set in a modern office.',
    'studio-backdrop': 'Use a subtly blurred, neutral, out-of-focus background set in a modern studio backdrop.',
    'study-room': 'Use a subtly blurred, neutral, out-of-focus background set in a study room with bookshelves.',
    'casual': 'Use a natural, casual, everyday background. Use a depth-of-field effect and ensure the person is the only subject in focus.'
};

const retouchingMapping = {
    'true': 'Perform a subtle beauty retouch, with a specific focus on the eye area. It is essential to completely remove any dark circles, eye bags, and signs of tiredness from under the eyes. Brighten the eyes slightly for a more awake and alert appearance, while ensuring the result looks natural and professional. Also enhance the overall lighting and sharpness for a polished, high-quality result. It is crucial to preserve the person\'s natural facial features, hair, and expression.',
    'false': 'Skip retouching and maintain the original facial features as they are.'
};

const headTiltingMapping = {
    'true': 'Tilt the head slightly for a natural, relaxed look that avoids stiffness.',
    'false': 'Keep the head straight and upright for a formal, professional appearance.'
};

/**
 * Generate the AI prompt for image transformation
 * Combines user selections into a structured prompt for the AI
 */
function generatePrompt(parameters) {
    const { type, hairStyle, dressStyle, background, retouching, headTilting } = parameters;
    
    let prompt = `${typeMapping[type]} ${hairStyleMapping[hairStyle]} Perform the following edits:\n`;
    
    // Background section
    prompt += `1. **Background**: ${backgroundMapping[background]}\n`;
    // Deprecated: Create a professional depth-of-field effect and ensure the person is the only subject in focus.

    // Attire section
    prompt += `2. **Attire**: ${dressStyleMapping[dressStyle]}\n`;
    
    // Hair section
    prompt += `3. **Hair**: ${hairStyleMapping[hairStyle]}\n`;
    
    // Head tilting section
    prompt += `4. **Head Tilting**: ${headTiltingMapping[headTilting]}\n`;
    
    // Retouching section
    prompt += `5. **Retouching**: ${retouchingMapping[retouching]}\n`;
    
    prompt += `The final output must be only the modified image.`;
    
    return prompt;
}

/**
 * Call Gemini API to generate a single professional image
 * Sends the cropped image and prompt to Google's Gemini API for processing
 */
async function generateSingleImage(base64ImageData, mimeType, apiKey, parameters) {
    console.log('🎯 Generating single image with parameters:', { parameters, mimeType });
    
    // Use custom prompt if available, otherwise generate from parameters
    const prompt = state.customPrompt || generatePrompt(parameters);
    console.log('📝 Using prompt:', state.customPrompt ? 'Custom prompt' : 'Generated prompt');
    console.log('📝 Prompt content:', prompt);
    
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
    
    console.log('📦 Request body prepared:', {
        hasImage: !!requestBody.contents[0].parts[0].inline_data.data,
        imageDataLength: requestBody.contents[0].parts[0].inline_data.data.length,
        promptLength: requestBody.contents[0].parts[1].text.length,
        mimeType: requestBody.contents[0].parts[0].inline_data.mime_type
    });
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
    console.log('🌐 Making API request to:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'));
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    console.log('📡 API Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📊 API Response data structure:', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        firstCandidate: data.candidates?.[0] ? {
            hasContent: !!data.candidates[0].content,
            hasParts: !!data.candidates[0].content?.parts,
            partsLength: data.candidates[0].content?.parts?.length || 0
        } : null
    });
    
    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts || [];
    console.log('🔍 Searching for image in', parts.length, 'parts');
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        console.log(`Part ${i}:`, {
            hasInlineData: !!part.inlineData,
            hasInlineDataSnake: !!part.inline_data,
            hasText: !!part.text,
            mimeType: part.inlineData?.mimeType || part.inline_data?.mime_type,
            dataLength: part.inlineData?.data?.length || part.inline_data?.data?.length
        });
        
        // Check both camelCase and snake_case formats
        if (part.inlineData) {
            console.log('✅ Found image data in part', i, '(camelCase format)');
            return part.inlineData.data;
        } else if (part.inline_data) {
            console.log('✅ Found image data in part', i, '(snake_case format)');
            return part.inline_data.data;
        }
    }
    
    console.log('❌ No image data found in response');
    console.log('Full response structure:', JSON.stringify(data, null, 2));
    return null;
}


// ==================== Display Functions ====================

/**
 * Display generated result (single image)
 */
function displayResult(base64Image) {
    hideAllResultStates();
    resultSuccess.classList.remove('hidden');
    
    // Update count
    resultCount.textContent = '1 Headshot Ready!';
    
    // Clear grid
    resultGrid.innerHTML = '';
    
    // Add single image to grid
    const imageUrl = `data:image/png;base64,${base64Image}`;
    
    const item = document.createElement('div');
    item.className = 'result-item result-item-single';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Professional Headshot';
    
    item.appendChild(img);
    resultGrid.appendChild(item);
    
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
        title.textContent = 'Your headshot will appear here';
        text.textContent = 'Upload a photo and customize your settings to get started';
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
 * Download the single generated image
 */
function handleDownloadAll() {
    if (!state.generatedImage) return;
    
    const imageUrl = `data:image/png;base64,${state.generatedImage}`;
    downloadImage(imageUrl, 0);
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
 * Update test connection button state
 */
function updateTestConnectionButton() {
    const hasApiKey = state.apiKey.length > 0;
    testConnectionBtn.disabled = !hasApiKey || state.isLoading;
}

/**
 * Update reset button visibility
 */
function updateResetButton() {
    const shouldShow = state.croppedImageData || state.generatedImage !== null;
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
    state.generatedImage = null;
    state.customPrompt = null;
    state.isLoading = false;
    state.currentSlide = 0;
    
    // Reset parameters to defaults
    state.parameters = {
        type: 'linkedin',
        hairStyle: 'none',
        dressStyle: 'grey-sweater',
        background: 'soft-grey',
        retouching: 'false',
        headTilting: 'false'
    };
    
    // Reset file input
    fileInput.value = '';
    
    // Reset parameter selections
    typeSelect.value = state.parameters.type;
    hairStyleSelect.value = state.parameters.hairStyle;
    dressStyleSelect.value = state.parameters.dressStyle;
    backgroundSelect.value = state.parameters.background;
    retouchingSelect.value = state.parameters.retouching;
    headTiltingSelect.value = state.parameters.headTilting;
    
    // Reset upload area
    uploadPlaceholder.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    previewImage.src = '';
    
    // Reset results
    hideAllResultStates();
    resultPlaceholder.classList.remove('hidden');
    
    // Reset prompt editor
    updatePromptFromParameters();
    
    // Reset slide to first page
    goToSlide(0);
    
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
    // Initialize dark mode
    initDarkMode();
    
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
    
    // Set default parameter values
    typeSelect.value = state.parameters.type;
    hairStyleSelect.value = state.parameters.hairStyle;
    dressStyleSelect.value = state.parameters.dressStyle;
    backgroundSelect.value = state.parameters.background;
    retouchingSelect.value = state.parameters.retouching;
    headTiltingSelect.value = state.parameters.headTilting;
    
    // Initialize prompt editor with default prompt
    updatePromptFromParameters();
    
    // Initial UI state
    updateGenerateButton();
    updateTestConnectionButton();
    updateResetButton();
    updateResultPlaceholder();
    updateNavigationButtons();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

