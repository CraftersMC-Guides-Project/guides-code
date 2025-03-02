/*document.getElementById('dark-mode-toggle').addEventListener('click', (event) => {
  const button = event.target;
  const isDarkMode = document.body.classList.toggle('dark-mode');
  
  button.classList.toggle('dark-mode', isDarkMode);
  button.classList.toggle('light-mode', !isDarkMode);

  document.querySelectorAll('body').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('button.toggle-button').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('.card').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('nav-btn').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('button.nav-btn').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('h3').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('ul').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('ul ul').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('::selection').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('p').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
  document.querySelectorAll('strong').forEach(el => el.classList.toggle('dark-mode', isDarkMode));
});
*/

let darkmode = localStorage.getItem ('darkmode' )
const themeSwitch = document.getElementById('theme-switch')
const enableDarkmode = () => {
  document.body.classList.add('darkmode')
  localStorage.setItem('darkmode', 'active')
}
const disableDarkmode = () => {
  document.body.classList.remove ('darkmode')
  localStorage.setItem ('darkmode', 'null')
}
if(darkmode === "active") enableDarkmode ()
  themeSwitch.addEventListener ("click", () => {
  darkmode = localStorage.getItem( 'darkmode')
  darkmode !== "active" ? enableDarkmode() : disableDarkmode()
})
