/**
 * HeadshotAI - Professional Headshot Generator
 * 
 * This application uses Google's Gemini AI API to transform photos into
 * professional headshots. It generates 1 image based on the selected style.
 */

// ==================== Application State ====================

const state = {
    apiKey: '',                    // User's Gemini API key
    selectedFile: null,            // Original uploaded file
    croppedImageData: null,        // Cropped image data (base64)
    croppedImageMimeType: null,    // MIME type of cropped image
    parameters: {
        type: 'professional headshot',
        useCase: 'passport',
        dressStyle: 'navy-suit',
        background: 'soft-grey',
        retouching: 'true',
        headTilting: 'true'
    },
    generatedImage: null,          // Single generated base64 image
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

// Parameter selection elements
const typeSelect = document.getElementById('typeSelect');
const useCaseSelect = document.getElementById('useCaseSelect');
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

// ==================== Event Listeners ====================

// API Key visibility toggle
toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);

// API Key input
apiKeyInput.addEventListener('input', handleApiKeyInput);

// Parameter selections
typeSelect.addEventListener('change', handleParameterChange);
useCaseSelect.addEventListener('change', handleParameterChange);
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
    updateTestConnectionButton();
}

/**
 * Handle parameter changes
 */
function handleParameterChange(e) {
    const parameterName = e.target.id.replace('Select', '');
    state.parameters[parameterName] = e.target.value;
    console.log('📝 Parameter updated:', parameterName, '=', e.target.value);
    updateGenerateButton();
}

/**
 * Test API connection
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
        
        // Show success message
        showError('✅ API connection successful! You can now generate headshots.');
        setTimeout(() => {
            hideAllResultStates();
            resultPlaceholder.classList.remove('hidden');
        }, 3000);
        
    } catch (err) {
        console.error('❌ API Connection Test Failed:', err);
        showError(`❌ API connection failed: ${err.message}`);
    } finally {
        // Reset button
        testConnectionBtn.disabled = false;
        testConnectionBtn.innerHTML = `
            <svg class="icon-small btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test Connection
        `;
    }
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
const dressStyleMapping = {
    'navy-suit': 'Dress the person in a navy-blue three-piece suit made of lightly pleated fabric, paired with a crisp white professional shirt and a neatly tied Windsor knot tie.',
    'navy-dress': 'Dress the person in a sleeveless navy blue round neck dress in the fabric that is a little bit pleated.',
    'it-casual': 'Dress the person like an IT guy, slightly casual, not too formal.'
};

const backgroundMapping = {
    'soft-grey': 'Use a soft grey background.',
    'smoke-blue': 'Use a smoke blue background.',
    'modern-office': 'Use a subtly blurred, neutral, out-of-focus professional modern office background.',
    'studio-backdrop': 'Use a subtly blurred, neutral, out-of-focus professional modern studio backdrop background.'
};

/**
 * Generate the AI prompt for image transformation
 */
function generatePrompt(parameters) {
    const { type, useCase, dressStyle, background, retouching, headTilting } = parameters;
    
    let prompt = `Transform this photo into a ${type}. The overall style should be polished, modern, and perfectly suited for ${useCase}. Perform the following edits:\n`;
    
    // Retouching section
    if (retouching === 'true') {
        prompt += `1. **Retouching**: Perform a subtle beauty retouch, with a specific focus on the eye area. It is essential to completely remove any dark circles, eye bags, and signs of tiredness from under the eyes. Brighten the eyes slightly for a more awake and alert appearance, while ensuring the result looks natural and professional. Also enhance the overall lighting and sharpness for a polished, high-quality result. It is crucial to preserve the person's natural facial features, hair, and expression.\n`;
    }
    
    // Attire section
    prompt += `2. **Attire**: ${dressStyleMapping[dressStyle]}\n`;
    
    // Background section
    prompt += `3. **Background**: ${backgroundMapping[background]} Create a professional depth-of-field effect and ensure the person is the only subject in focus.\n`;
    
    // Head tilting section
    if (headTilting === 'true') {
        prompt += `4. **Head**: Tilt the head slightly for a natural, relaxed look that avoids stiffness.\n`;
    }
    
    prompt += `The final output must be only the modified image.`;
    
    return prompt;
}

/**
 * Call Gemini API to generate a single professional image
 */
async function generateSingleImage(base64ImageData, mimeType, apiKey, parameters) {
    console.log('🎯 Generating single image with parameters:', { parameters, mimeType });
    
    const prompt = generatePrompt(parameters);
    console.log('📝 Generated prompt:', prompt);
    
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
    item.className = 'result-item';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Professional Headshot';
    
    const overlay = document.createElement('div');
    overlay.className = 'result-item-overlay';
    
    const actions = document.createElement('div');
    actions.className = 'result-item-actions';
    
    const label = document.createElement('div');
    label.className = 'style-label';
    const { type, dressStyle, background } = state.parameters;
    const dressStyleName = dressStyleSelect.options[dressStyleSelect.selectedIndex].text;
    const backgroundName = backgroundSelect.options[backgroundSelect.selectedIndex].text;
    label.textContent = `${type} - ${dressStyleName}`;
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = 'Save';
    downloadBtn.onclick = () => downloadImage(imageUrl, 0);
    
    actions.appendChild(label);
    actions.appendChild(downloadBtn);
    overlay.appendChild(actions);
    
    item.appendChild(img);
    item.appendChild(overlay);
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
    state.isLoading = false;
    
    // Reset parameters to defaults
    state.parameters = {
        type: 'professional headshot',
        useCase: 'passport',
        dressStyle: 'navy-suit',
        background: 'soft-grey',
        retouching: 'true',
        headTilting: 'true'
    };
    
    // Reset file input
    fileInput.value = '';
    
    // Reset parameter selections
    typeSelect.value = state.parameters.type;
    useCaseSelect.value = state.parameters.useCase;
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
    
    // Set default parameter values
    typeSelect.value = state.parameters.type;
    useCaseSelect.value = state.parameters.useCase;
    dressStyleSelect.value = state.parameters.dressStyle;
    backgroundSelect.value = state.parameters.background;
    retouchingSelect.value = state.parameters.retouching;
    headTiltingSelect.value = state.parameters.headTilting;
    
    // Initial UI state
    updateGenerateButton();
    updateTestConnectionButton();
    updateResetButton();
    updateResultPlaceholder();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

