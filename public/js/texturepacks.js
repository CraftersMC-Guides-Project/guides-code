/**
 * Texture Packs Download Dialog Controller
 */
function showDownloadPanel(file) {
  const confirmBtn = document.getElementById('confirmDownloadBtn');
  if (confirmBtn) {
    confirmBtn.onclick = function () {
      window.open(file, '_blank');
      closeDownloadPanel();
    };
  }
  const modal = document.getElementById('downloadModal');
  if (modal) modal.classList.add('texture-show');
}

function closeDownloadPanel() {
  const modal = document.getElementById('downloadModal');
  if (modal) modal.classList.remove('texture-show');
}