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

async function loadChangelog() {
  const response = await fetch('/changelog.json');
  const changelog = await response.json();
  const container = document.getElementById('changelogContent');

  let html = '';
  changelog.forEach(entry => {
    html += `<h3>Version ${entry.version} <small>(${entry.date})</small></h3><ul>`;
    entry.notes.forEach(note => {
      html += `<li>${note}</li>`;
    });
    html += '</ul>';
  });

  container.innerHTML = html;
}

loadChangelog();