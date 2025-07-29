const intervalDuration = (5 * 24 + 4) * 60 * 60 * 1000; // 5 days 4 hours in ms
const eventDuration = 60 * 60 * 1000; // 1 hour in ms
const baseEventTime = new Date('2025-05-01T16:00:00+01:00').getTime();
const eventAlertMessage = `
🦁 Did you know? 🦁 The Creedon NPC is there with his random pets near the spawn inside the event stand area. Go online to buy those pets! 🐾
`;

// Set the last cake number here
const lastCakeNumber = 235;

function formatTime(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-IN', options).replace(':00', '').trim();
}

// Find the most recent event start time before now
function getCurrentEventStartTime() {
    const now = Date.now();
    const periodsSinceBase = Math.floor((now - baseEventTime) / intervalDuration);
    return baseEventTime + periodsSinceBase * intervalDuration;
}

function calculateEventTimes() {
    const eventTimes = [];
    const now = Date.now();
    // Find the next event start time after now
    const periodsSinceBase = Math.floor((now - baseEventTime) / intervalDuration);
    let nextEventTime = baseEventTime + (periodsSinceBase + 1) * intervalDuration;
    for (let i = 0; i < 50; i++) {
        const eventDate = new Date(nextEventTime + i * intervalDuration);
        eventTimes.push(formatTime(eventDate));
    }
    return eventTimes;
}

function displayNextEvent() {
    const now = Date.now();
    const periodsSinceBase = Math.floor((now - baseEventTime) / intervalDuration);
    const nextEventTime = baseEventTime + (periodsSinceBase + 1) * intervalDuration;
    const lastEventTime = nextEventTime - intervalDuration;

    // Show cake numbers
    document.getElementById("nextEventTime").textContent =
        `${formatTime(new Date(nextEventTime))} (Y${lastCakeNumber + 1})`;
    document.getElementById("lastEventTime").textContent =
        `${formatTime(new Date(lastEventTime))} (Y${lastCakeNumber})`;
}

function displayEvents() {
    const eventContainer = document.getElementById("eventContainer");
    eventContainer.innerHTML = ""; // Clear previous events
    const events = calculateEventTimes();
    // Start from Y236 for future events
    for (let i = 0; i < 10; i++) {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.textContent = `${events[i]} (Y${lastCakeNumber + 2 + i})`;
        eventContainer.appendChild(div);
    }
}

function toggleEventContainer() {
    const content = document.querySelector(".content");
    content.classList.toggle("show");
    const collapsible = document.querySelector(".collapsible");
    displayEvents()
    displayNextEvent();
    if (content.classList.contains("show")) {
        collapsible.innerHTML = "Next Events (Click to Collapse)";
        content.style.display = "block";
    } else {
        collapsible.innerHTML = "Next Events (Click to Expand)";
        content.style.display = "none";
    }
}

function showEventAlert(eventStartTime) {
    const now = Date.now();
    const eventEndTime = eventStartTime + eventDuration;
    if (now >= eventStartTime && now <= eventEndTime) {
        alert(eventAlertMessage);
    }
}

function updateCountdown() {
    const now = Date.now();
    const periodsSinceBase = Math.floor((now - baseEventTime) / intervalDuration);
    const lastEventTime = baseEventTime + periodsSinceBase * intervalDuration;
    const nextEventTime = lastEventTime + intervalDuration;
    const remainingTime = nextEventTime - now;

    if (remainingTime <= 0) {
        displayNextEvent();
        displayEvents();
        return;
    }

    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    document.getElementById("timer").innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const percentage = ((intervalDuration - remainingTime) / intervalDuration) * 100;
    document.getElementById("progressBar").style.width = percentage + "%";

    showEventAlert(nextEventTime);
}

document.addEventListener('DOMContentLoaded', function () {
    displayNextEvent();
    displayEvents();
    const eventContainer = document.getElementById("eventContainer");
    eventContainer.addEventListener("click", toggleEventContainer);
  });

setInterval(updateCountdown, 1000);
