document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const chooseImageBtn = document.getElementById('chooseImageBtn');
    const startOverBtn = document.querySelector('.btn-start-over');
    const uploadSection = document.querySelector('.upload-section');
    const imageProcessingSection = document.querySelector('.image-processing-section');
    const originalImage = document.getElementById('originalImage');
    const originalImageContainer = document.querySelector('.original-image-preview .image-container');
    const originalPlaceholderText = originalImageContainer.querySelector('.placeholder-text');

    chooseImageBtn.addEventListener('click', () => {
        imageUpload.click();
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage.src = e.target.result;
                originalImage.style.display = 'block';
                originalPlaceholderText.style.display = 'none';
                uploadSection.style.display = 'none';
                imageProcessingSection.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    });

    startOverBtn.addEventListener('click', () => {
        originalImage.src = '';
        originalImage.style.display = 'none';
        originalPlaceholderText.style.display = 'block';
        document.getElementById('removedImage').src = '';
        document.getElementById('removedImage').style.display = 'none';
        document.querySelector('.removed-background-image-preview .placeholder-text').style.display = 'block';
        imageUpload.value = ''; // Clear the selected file
        uploadSection.style.display = 'flex';
        imageProcessingSection.style.display = 'none';
    });

    // Drag and drop functionality for the upload-box area
    const uploadBox = document.querySelector('.upload-box');
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#007bff';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = '#ccc';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#ccc';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    originalImage.src = e.target.result;
                    originalImage.style.display = 'block';
                    originalPlaceholderText.style.display = 'none';
                    uploadSection.style.display = 'none';
                    imageProcessingSection.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please drop an image file.');
            }
        }
    });

    // Background removal functionality
    const removeBackgroundBtn = document.querySelector('.btn-remove-background');
    const removedImage = document.getElementById('removedImage');
    const removedImageContainer = document.querySelector('.removed-background-image-preview .image-container');
    const removedPlaceholderText = removedImageContainer.querySelector('.placeholder-text');

    removeBackgroundBtn.addEventListener('click', async () => {
        const file = imageUpload.files[0];
        if (!file) {
            alert('Please select an image first.');
            return;
        }

        // Show loading state
        removeBackgroundBtn.textContent = 'Processing...';
        removeBackgroundBtn.disabled = true;
        removedPlaceholderText.textContent = 'Processing image...';

        try {
            // For demo purposes, we'll use a client-side solution
            // In production, you'd want to use Remove.bg API or similar service
            await removeBackgroundClientSide(file);
        } catch (error) {
            console.error('Error removing background:', error);
            alert('Error processing image. Please try again.');
            removedPlaceholderText.textContent = 'Error processing image';
        } finally {
            removeBackgroundBtn.textContent = 'Remove Background';
            removeBackgroundBtn.disabled = false;
        }
    });

    async function removeBackgroundClientSide(file) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw the original image
                ctx.drawImage(img, 0, 0);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Enhanced background removal algorithm
                // Sample corner pixels to determine background color
                const corners = [
                    [0, 0], // top-left
                    [canvas.width - 1, 0], // top-right
                    [0, canvas.height - 1], // bottom-left
                    [canvas.width - 1, canvas.height - 1] // bottom-right
                ];
                
                // Get average background color from corners
                let bgR = 0, bgG = 0, bgB = 0;
                let validCorners = 0;
                
                corners.forEach(([x, y]) => {
                    const index = (y * canvas.width + x) * 4;
                    bgR += data[index];
                    bgG += data[index + 1];
                    bgB += data[index + 2];
                    validCorners++;
                });
                
                bgR = Math.round(bgR / validCorners);
                bgG = Math.round(bgG / validCorners);
                bgB = Math.round(bgB / validCorners);
                
                // Remove background pixels with tolerance
                const tolerance = 50; // Adjust this value for sensitivity
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Calculate color distance from background
                    const distance = Math.sqrt(
                        Math.pow(r - bgR, 2) + 
                        Math.pow(g - bgG, 2) + 
                        Math.pow(b - bgB, 2)
                    );
                    
                    // If pixel is similar to background color, make it transparent
                    if (distance < tolerance) {
                        data[i + 3] = 0; // Set alpha to 0 (transparent)
                    }
                    // Apply edge smoothing for pixels close to the threshold
                    else if (distance < tolerance + 20) {
                        const alpha = Math.min(255, (distance - tolerance) * 12.75);
                        data[i + 3] = alpha;
                    }
                }
                
                // Put the modified image data back
                ctx.putImageData(imageData, 0, 0);
                
                // Convert canvas to data URL
                const processedImageUrl = canvas.toDataURL('image/png');
                
                // Display the processed image
                removedImage.src = processedImageUrl;
                removedImage.style.display = 'block';
                removedPlaceholderText.style.display = 'none';
                
                // Add download functionality
                addDownloadButton(processedImageUrl);
                
                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    function addDownloadButton(imageUrl) {
        // Remove existing download button if any
        const existingBtn = document.querySelector('.btn-download');
        if (existingBtn) {
            existingBtn.remove();
        }

        // Create download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Result';
        downloadBtn.className = 'btn-download';
        downloadBtn.style.cssText = `
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
        `;

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'background-removed.png';
            link.href = imageUrl;
            link.click();
        });

        // Add button after the processing buttons
        const processingButtons = document.querySelector('.processing-buttons');
        processingButtons.appendChild(downloadBtn);
    }
});