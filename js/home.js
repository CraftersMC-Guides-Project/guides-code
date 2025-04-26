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
  const userSettings = JSON.parse(localStorage.getItem(`userSettings_${user.email}`));
  const infoDiv = document.getElementById("sidebarUsername");
  const infoDivName = document.getElementById("sidebarName");

  if (!user || !user.token) {
    window.location.href = "login.html"; // not logged in
  } else {
    infoDiv.innerHTML = `${user.email}`;
    infoDivName.innerHTML = `${userSettings.username}`;
  }
}, 5000); // 5000 milliseconds = 5 seconds

function logout() {
  localStorage.removeItem("user");
  location.reload();
}
