document.getElementById('toHome').addEventListener('click', () => {
  window.location.href = 'index.html';  // or your audio reducer page
});

document.getElementById('toVideoMaker').addEventListener('click', () => {
  window.location.href = 'video.html';  // or your video maker page
});

document.getElementById('toChangelog').addEventListener('click', () => {
  window.location.href = 'changelog.html';  // or your video maker page
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