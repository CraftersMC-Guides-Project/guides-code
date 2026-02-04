function showDownloadPanel(file) {
    document.getElementById('confirmDownloadBtn').onclick = function () {
        window.open(file, '_blank');
        closeDownloadPanel();
    };
    document.getElementById('downloadPanel').classList.add('texture-show');
    document.getElementById('overlay').classList.add('texture-show');
}

function closeDownloadPanel() {
    document.getElementById('downloadPanel').classList.remove('texture-show');
    document.getElementById('overlay').classList.remove('texture-show');
}