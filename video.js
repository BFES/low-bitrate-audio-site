import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

document.getElementById('toHome').addEventListener('click', () => {
  window.location.href = 'index.html';  // or your audio reducer page
});

document.getElementById('toVideoMaker').addEventListener('click', () => {
  window.location.href = 'video.html';  // or your video maker page
});

document.getElementById('toChangelog').addEventListener('click', () => {
  window.location.href = 'changelog.html';  // or your video maker page
});


document.getElementById('togglePrivacy').addEventListener('click', () => {
  const content = document.getElementById('privacyContent');
  content.classList.toggle('open');
});



const ffmpeg = new FFmpeg({
    log: true,
    corePath: '/node_modules/@ffmpeg/core-mt/dist/ffmpeg-core.js',
});
const status = document.getElementById('status');

const loadFFmpeg = async () => {
  status.textContent = 'Loading FFmpeg...';
  await ffmpeg.load();
  status.textContent = 'Ready!';
};

loadFFmpeg();

function normalizeImageSafe(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let safeWidth = Math.min(img.width, 1920);
      let safeHeight = Math.min(img.height, 1080);

      // Ensure both dimensions are even numbers
      if (safeWidth % 2 !== 0) safeWidth--;
      if (safeHeight % 2 !== 0) safeHeight--;

      const canvas = document.createElement("canvas");
      canvas.width = safeWidth;
      canvas.height = safeHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, safeWidth, safeHeight);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/png");
    };
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });
}

async function combineMedia(imageFile, audioFile, outputName = 'output.mp4') {
  const isGif = imageFile.type === 'image/gif';

  await ffmpeg.writeFile('audio.mp3', new Uint8Array(await audioFile.arrayBuffer()));

  if (isGif) {
    await ffmpeg.writeFile('input.gif', await fetchFile(imageFile));
    
    status.textContent = `Converting GIF to mp4...`
    await ffmpeg.exec([
      '-stream_loop', '-1',
      '-i', 'input.gif',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '28',
      '-c:a', 'aac',
      '-b:a', '8k',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      '-movflags', 'faststart',
      outputName
    ])

    ffmpeg.on('progress', ({ progress }) => {
      status.textContent = `Progress: ${(progress * 100).toFixed(0)}%`; 
    });
    // Combine video with audio
    await ffmpeg.exec([
      '-i', 'video.mp4',
      '-i', 'audio.mp3',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '8k',
      '-shortest',
      '-movflags', 'faststart',
      outputName
    ]);


  } else {
    // Non-GIF processing (unchanged)
    const normalizedImageBlob = await normalizeImageSafe(imageFile);
    const normalizedImageArrayBuffer = await normalizedImageBlob.arrayBuffer();
    await ffmpeg.writeFile('image.png', new Uint8Array(normalizedImageArrayBuffer));

    ffmpeg.on('progress', ({ progress }) => {
      status.textContent = `Progress: ${(progress * 100).toFixed(0)}%`; 
    });
    await ffmpeg.exec([
      '-loop', '1',
      '-i', 'image.png',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '8k',
      '-pix_fmt', 'yuv420p',
      '-threads', '4',
      '-shortest',
      outputName
    ]);
  }

  const data = await ffmpeg.readFile(outputName);
  return new Blob([data.buffer], { type: 'video/mp4' });
}

document.getElementById('combineBtn').addEventListener('click', async () => {
  const audioUploader = document.getElementById('audioUploader');
  const imageUploader = document.getElementById('imageUploader');
  const downloadLink = document.querySelector('.download-link');
  downloadLink.href = "";
  downloadLink.textContent = '';

  if(audioUploader.files.length === 0) {
    alert('Please select an audio file.');
    return;
  }

  const audioFile = audioUploader.files[0];

  if (!audioFile.type.startsWith('audio/')) {
    alert('Please upload a valid audio file!');
    audioUploader.value = '';
    return;
  }

  if(imageUploader.files.length === 0) {
    alert('Please select an image file.')
    return;
  }

  const imageFile = imageUploader.files[0];

  if (!imageFile.type.startsWith('image/')) {
    alert('Please upload a valid image file!');
    imageUploader.value = '';
    return;
  }

  status.textContent = "Combining...";

  const videoBlob = await combineMedia(imageFile, audioFile)
  const videoUrl = URL.createObjectURL(videoBlob);

  downloadLink.href = videoUrl;
  downloadLink.download = 'output.mp4';
  downloadLink.textContent = "Download Your Video!";

  status.textContent = "Done!";
  ffmpeg.off('progress');
});
