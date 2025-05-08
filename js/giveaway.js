let entries = [];
let hostName = '';
let prizeName = '';
let numWinners = 0;
let duration = 0;
let giveawayEndTime = 0;

// Function to start the giveaway
function startGiveaway() {
  hostName = document.getElementById('host-name').value;
  prizeName = document.getElementById('prize-name').value;
  numWinners = parseInt(document.getElementById('num-winners').value);
  duration = document.getElementById('duration').value;
  giveawayEndTime = new Date(duration).getTime();
  
  alert(`Giveaway started by ${hostName} for ${prizeName}.`);
}

// Function to enter the giveaway
function enterGiveaway() {
  let name = document.getElementById('entry-name').value;
  
  if (!name) {
    alert('Please enter your name.');
    return;
  }
  
  if (!entries.includes(name)) {
    entries.push(name);
    updateEntriesList();
    alert(`${name} has been entered into the giveaway!`);
  } else {
    alert('You have already entered the giveaway.');
  }
}

// Function to display the list of entries
function updateEntriesList() {
  const entriesList = document.getElementById('entries-list');
  entriesList.innerHTML = `<h3>Entries:</h3><ul>${entries.map(entry => `<li>${entry}</li>`).join('')}</ul>`;
}

// Function to choose a winner randomly
function chooseWinner() {
  if (entries.length > 0 && new Date().getTime() >= giveawayEndTime) {
    let winnerIndex = Math.floor(Math.random() * entries.length);
    let winner = entries[winnerIndex];

    document.getElementById('winner-name').innerText = `Winner: ${winner} has won ${prizeName}!`;
    document.querySelector('.winner-section').style.display = 'block';
    
    alert(`Winner: ${winner} has won!`);
  }
}

// Function to cancel the expiration period for winner
function cancelExpiry() {
  alert('Expiry period canceled. Redirecting to contact page...');
  window.location.href = 'contact.html';
}

// Interval to check if the giveaway duration has ended and choose a winner
setInterval(() => {
  if (giveawayEndTime && new Date().getTime() >= giveawayEndTime) {
    chooseWinner();
  }
}, 1000);