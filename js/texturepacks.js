function showDownloadPanel(file) {
    document.getElementById('confirmDownloadBtn').onclick = function () {
        window.open(file, '_blank');
        closeDownloadPanel();
    };
    document.getElementById('downloadPanel').classList.add('show');
    document.getElementById('overlay').classList.add('show');
}

function closeDownloadPanel() {
    document.getElementById('downloadPanel').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
}