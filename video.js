import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

document.getElementById('toHome').addEventListener('click', () => {
  window.location.href = 'index.html';  // or your audio reducer page
});

document.getElementById('toVideoMaker').addEventListener('click', () => {
  window.location.href = 'video.html';  // or your video maker page
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

document.getElementById('combineBtn').addEventListener('click', async () => {
  const audioUploader = document.getElementById('audioUploader');
  const imageUploader = document.getElementById('imageUploader');
  const downloadLink = document.querySelector('.download-link');

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

  const audioResponse = await fetch(URL.createObjectURL(audioFile));
  const audioData = await audioResponse.arrayBuffer();
  const imageResponse = await fetch(URL.createObjectURL(imageFile));
  const imageData = await imageResponse.arrayBuffer();

  await ffmpeg.writeFile('image.jpg', await fetchFile(imageFile));
  await ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));

  ffmpeg.on('log', ({ message }) => {
    console.log('FFmpeg log:', message);
    });

  //console.log(await ffmpeg.listFiles());

  await ffmpeg.exec([
    '-loop', '1',
    '-i', 'image.jpg',
    '-i', 'audio.mp3',
    '-c:v', 'libx264',
    '-tune', 'stillimage',
    '-c:a', 'aac',
    '-b:a', '8k',
    '-pix_fmt', 'yuv420p',
    '-threads', '4',
    '-shortest',
    'output.mp4'
  ]);


  ffmpeg.on('progress', ({ progress }) => {
    console.log(`Progress: ${(progress * 100).toFixed(2)}%`);
  });

  const data = await ffmpeg.readFile('output.mp4');

  const videoBlob = new Blob([data.buffer], { type: 'video/mp4'});
  const videoUrl = URL.createObjectURL(videoBlob);

  downloadLink.href = videoUrl;
  downloadLink.download = 'output.mp4';
  downloadLink.textContent = "Download Your Video!";
});
