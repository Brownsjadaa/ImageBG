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
});