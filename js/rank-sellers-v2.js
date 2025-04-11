


//Background changer i hope

function changeBackground(type) {
  const backgrounds = {
      'default': 'url("../Backgrounds/IMG_4504.jpeg")',
      'forest': 'url("../Backgrounds/IMG_4498.jpeg")',
      'mountain': 'url("../Backgrounds/IMG_4499.jpeg")',
      'desert': 'url("../Backgrounds/IMG_4500.jpeg")',
      'ocean': 'url("../Backgrounds/IMG_4502.jpeg")',
    'rose': 'url("../Backgrounds/IMG_0007.jpeg")',
    'bush': 'url("../Backgrounds/IMG_0004.jpeg")',
    'fireworks': 'url("../Backgrounds/IMG_0097.jpeg")',
    'snowdrops': 'url("../Backgrounds/IMG_0669.jpeg")',
    'fountain': 'url("../Backgrounds/IMG_0179.jpeg")',
    'skylights': 'url("../Backgrounds/IMG_0205.jpeg")',
    'crocus': 'url("../Backgrounds/Crocus.jpeg")',
    'daisy': 'url("../Backgrounds/Daisy.jpeg")',
    'oldtree': 'url("../Backgrounds/OldTree.jpeg")',
      'cyberpunk': 'linear-gradient(135deg, #ff00ff, #00ffff)',
      'sunset': 'linear-gradient(135deg, #ff5f3f, #e5df3f)',
      'random': () => {
          //random gradient lol
          const randomColor1 = `hsl(${Math.random() * 360}, 70%, 50%)`;
          const randomColor2 = `hsl(${Math.random() * 360}, 70%, 50%)`;
          return `linear-gradient(135deg, ${randomColor1}, ${randomColor2})`;
      }
  };
  const background = typeof backgrounds[type] === 'function' 
      ? backgrounds[type]() 
      : backgrounds[type];

  document.body.style.background = background;
  document.body.style.backgroundSize = 'cover';
}

// dropdown code
document.addEventListener('DOMContentLoaded', () => {
  const backgroundSelect = document.getElementById('backgroundSelect');
  if (backgroundSelect) {
      backgroundSelect.addEventListener('change', (e) => {
          changeBackground(e.target.value);
      });
  }
});