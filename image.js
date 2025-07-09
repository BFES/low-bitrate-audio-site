document.getElementById('toHome').addEventListener('click', () => {
  window.location.href = 'index.html';  
});

document.getElementById('toVideoMaker').addEventListener('click', () => {
  window.location.href = 'video.html'; 
});

document.getElementById('toChangelog').addEventListener('click', () => {
  window.location.href = 'changelog.html';  
});

document.getElementById('toImageTool').addEventListener('click', () => {
  window.location.href = 'image.html'; 
});

document.getElementById('togglePrivacy').addEventListener('click', () => {
  const content = document.getElementById('privacyContent');
  content.classList.toggle('open');
});

document.getElementById('toggleTOS').addEventListener('click', () => {
  const tosContent = document.getElementById('tosContent');
  tosContent.classList.toggle('open');
});

const status = document.getElementById('status');

function normalizeAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvasWidth = 640;
      const canvasHeight = 480;

      // Compute target dimensions while preserving aspect ratio
      const widthRatio = canvasWidth / img.width;
      const heightRatio = canvasHeight / img.height;
      const scaleRatio = Math.min(widthRatio, heightRatio);

      const targetWidth = Math.floor(img.width * scaleRatio);
      const targetHeight = Math.floor(img.height * scaleRatio);

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      // Optional: fill background color (black)
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Compute top-left corner to center the image
      const xOffset = Math.floor((canvasWidth - targetWidth) / 2);
      const yOffset = Math.floor((canvasHeight - targetHeight) / 2);

      // Draw image centered with scaled size
      ctx.drawImage(img, xOffset, yOffset, targetWidth, targetHeight);

      // Export to JPEG with reduced quality
      canvas.toBlob(blob => {
        resolve(blob);
      }, 'image/jpeg', 0.3);
    };

    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });
}

document.getElementById('convertBtn').addEventListener('click', async () => {
  const uploader = document.getElementById('imageUploader');
  const link = document.querySelector(".download-link");
  link.href = "";
  link.textContent = "";

  if (uploader.files.length === 0) {
    alert("Please select an image file.");
    return;
  }

  const file = uploader.files[0];

  if (!file.type.startsWith('image/')) {
    alert("Please upload a valid image file!");
    uploader.value = "";
    return;
  }

  //status.textContent = "Converting...";

  try {
    const compressedBlob = await normalizeAndCompressImage(file);
    const url = URL.createObjectURL(compressedBlob);

    link.href = url;
    link.download = 'output.jpg';
    link.textContent = 'Download Your New Image!';

    //status.textContent = "Done!";
  } catch (err) {
    console.error("Image processing error:", err);
    //status.textContent = "Failed.";
  }
});
