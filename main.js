import { FFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg({
    log: true,
    corePath: '/node_modules/@ffmpeg/core/dist/ffmpeg-core.js',
});
const status = document.getElementById('status');

const loadFFmpeg = async () => {
  status.textContent = 'Loading FFmpeg...';
  await ffmpeg.load();
  status.textContent = 'FFmpeg ready!';
};

loadFFmpeg();

document.getElementById('convertBtn').addEventListener('click', async () => {
  const uploader = document.getElementById('uploader');
  if (uploader.files.length === 0) {
    alert('Please select a file.');
    return;
  }

  const file = uploader.files[0];

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

  const link = document.createElement('a');
  link.href = url;
  link.download = 'output.mp3';
  link.textContent = 'Download converted file';
  document.body.appendChild(link);

  status.textContent = 'Done!';
});
