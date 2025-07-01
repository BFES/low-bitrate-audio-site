import { FFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg({
    log: true,
    corePath: '/node_modules/@ffmpeg/core/dist/ffmpeg-core.js',
});
const status = document.getElementById('status');

const loadFFmpeg = async () => {
  status.textContent = 'Loading FFmpeg...';
  await ffmpeg.load();
  status.textContent = 'Ready!';
};

loadFFmpeg();


document.getElementById('convertBtn').addEventListener('click', async () => {
  const uploader = document.getElementById('audioUploader');
  const link = document.querySelector(".download-link");
  link.href = "";
  link.textContent = '';
  if (uploader.files.length === 0) {
    alert('Please select a file.');
    return;
  }


  const file = uploader.files[0];

  if (!file.type.startsWith('audio/')) {
    alert('Please upload a valid audio file!');
    uploader.value = '';
    return;
  }

  status.textContent = 'Converting...';

  const response = await fetch(URL.createObjectURL(file));
  const data1 = await response.arrayBuffer();
  // ffmpeg.FS('writeFile', file.name, new Uint8Array(data1));
  await ffmpeg.writeFile(file.name, new Uint8Array(data1));


  await ffmpeg.exec([
    '-i', file.name,
    '-b:a', '8k',
    'output.mp3'
  ]);

  //const data2 = ffmpeg.FS('readFile', 'output.mp3');
  const data2 = await ffmpeg.readFile('output.mp3')

  const url = URL.createObjectURL(new Blob([data2.buffer], { type: 'audio/mpeg' }));

  link.href = url;
  link.download = 'output.mp3';
  link.textContent = 'Download converted file';

  status.textContent = 'Done!';
});

