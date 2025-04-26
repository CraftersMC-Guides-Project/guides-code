function clearSelection() {
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}

setTimeout(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  const infoDiv = document.getElementById("sidebarUsername");

  if (!user || !user.token) {
    window.location.href = "login.html"; // not logged in
  } else {
    infoDiv.innerHTML = `${user.email}`;
  }
}, 5000); // 5000 milliseconds = 5 seconds

function logout() {
  localStorage.removeItem("user");
  location.reload();
}
