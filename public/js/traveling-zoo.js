/*
old version of the code, didnt update the time smh

const initialTargetTime = new Date('2025-01-27T14:30:00+05:30').getTime();
let targetTime = initialTargetTime;
const eventDuration = 60 * 60 * 1000;
const intervalDuration = (2 * 24 + 14) * 60 * 60 * 1000;
const eventAlertMessage = `
🦁 Did you know? 🦁 The Creedon NPC is there with his random pets near the spawn inside the event stand area. Go online to buy those pets! 🐾
`;

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

function calculateEventTimes() {
    const eventTimes = [];
    for (let i = 0; i < 50; i++) {
        const nextEventDate = new Date(initialTargetTime + (i * intervalDuration));
        eventTimes.push(formatTime(nextEventDate));
    }
    return eventTimes;
}

function displayNextEvent() {
    const eventTimes = calculateEventTimes();
    const nextEvent = eventTimes[0];
    const lastEvent = new Date(initialTargetTime - intervalDuration);
    document.getElementById("nextEventTime").textContent = nextEvent;
    document.getElementById("lastEventTime").textContent = formatTime(lastEvent);
}

function displayEvents() {
    const eventContainer = document.getElementById("eventContainer");
    const events = calculateEventTimes();

    for (let i = 0; i < 10; i++) {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.textContent = events[i];
        eventContainer.appendChild(div);
    }
}

function toggleEventContainer() {
    const content = document.querySelector(".content");
    content.classList.toggle("show");

    const collapsible = document.querySelector(".collapsible");
    if (content.classList.contains("show")) {
        collapsible.innerHTML = "Next Events (Click to Collapse)";
        content.style.display = "block";
    } else {
        collapsible.innerHTML = "Next Events (Click to Expand)";
        content.style.display = "none";
    }
}

function updateNextEventTime() {
    targetTime += intervalDuration;
    displayNextEvent();
}

function showEventAlert() {
    const now = new Date().getTime();
    const eventStartTime = targetTime;
    const eventEndTime = targetTime + eventDuration;

    if (now >= eventStartTime && now <= eventEndTime) {
        alert(eventAlertMessage);
    }
}

const timerInterval = setInterval(function () {
    const now = new Date().getTime();
    const remainingTime = targetTime - now;

    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        document.getElementById("timer").innerHTML = "Event is available now!";
        document.getElementById("progressBar").style.width = "100%";
        updateNextEventTime();
    } else {
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

        document.getElementById("timer").innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const totalTime = intervalDuration - initialTargetTime + targetTime;
        const percentage = (remainingTime / totalTime) * 100;
        document.getElementById("progressBar").style.width = percentage + "%";

        showEventAlert();
    }
}, 1000);

displayNextEvent();
displayEvents();

new code: (its below this)*/
const intervalDuration = (2 * 24 + 14) * 60 * 60 * 1000; // 2 days 14 hours in ms
const eventDuration = 60 * 60 * 1000; // 1 hour in ms
const baseEventTime = new Date('2025-01-27T14:30:00+05:30').getTime();
const eventAlertMessage = `
🦁 Did you know? 🦁 The Creedon NPC is there with his random pets near the spawn inside the event stand area. Go online to buy those pets! 🐾
`;

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
    document.getElementById("nextEventTime").textContent = formatTime(new Date(nextEventTime));
    document.getElementById("lastEventTime").textContent = formatTime(new Date(lastEventTime));
}

function displayEvents() {
    const eventContainer = document.getElementById("eventContainer");
    eventContainer.innerHTML = ""; // Clear previous events
    const events = calculateEventTimes();
    for (let i = 0; i < 10; i++) {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.textContent = events[i];
        eventContainer.appendChild(div);
    }
}

function toggleEventContainer() {
    const content = document.querySelector(".timer-content");
    content.classList.toggle("show");
    const collapsible = document.querySelector(".timer-collapsible");
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
