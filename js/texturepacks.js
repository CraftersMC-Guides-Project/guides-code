function showDownloadPanel(file) {
    document.getElementById('downloadLink').href = file;
    document.getElementById('downloadPanel').classList.add('show');
    document.getElementById('overlay').classList.add('show');
}

function closeDownloadPanel() {
    document.getElementById('downloadPanel').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
}