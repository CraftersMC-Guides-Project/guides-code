const intervalDuration = 84*3600*1000; // 84hrs
const eventDuration = 60 * 60 * 1000; // 1 hour in ms
const lastCakeNumber = 235;
const lastCakeTime = new Date('2025-07-30T08:30:00+05:30').getTime(); // for IST (India Standard Time)

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
    // Find the next event start time after now, based on lastCakeTime
    const periodsSinceLastCake = Math.floor((now - lastCakeTime) / intervalDuration);
    let nextEventTime = lastCakeTime + (periodsSinceLastCake + 1) * intervalDuration;
    for (let i = 0; i < 50; i++) {
        const eventDate = new Date(nextEventTime + i * intervalDuration);
        eventTimes.push(formatTime(eventDate));
    }
    return eventTimes;
}

function getCurrentCakeNumber() {
    const now = Date.now();
    const periodsSinceLastCake = Math.floor((now - lastCakeTime) / intervalDuration);
    return lastCakeNumber + periodsSinceLastCake + 1;
}

function displayNextEvent() {
    const now = Date.now();
    const periodsSinceLastCake = Math.floor((now - lastCakeTime) / intervalDuration);
    const nextEventTime = lastCakeTime + (periodsSinceLastCake + 1) * intervalDuration;
    const lastEventTime = nextEventTime - intervalDuration;

    const currentCakeNumber = lastCakeNumber + periodsSinceLastCake + 1;
    const previousCakeNumber = currentCakeNumber - 1;

    document.getElementById("nextEventTime").textContent =
        `${formatTime(new Date(nextEventTime))} (Y${currentCakeNumber})`;
    document.getElementById("lastEventTime").textContent =
        `${formatTime(new Date(lastEventTime))} (Y${previousCakeNumber})`;
}

function displayEvents() {
    const eventContainer = document.getElementById("eventContainer");
    eventContainer.innerHTML = ""; // Clear previous events
    const events = calculateEventTimes();
    const now = Date.now();
    const periodsSinceLastCake = Math.floor((now - lastCakeTime) / intervalDuration);
    const startCakeNumber = lastCakeNumber + periodsSinceLastCake + 1; // Y236 for next event
    for (let i = 0; i < 10; i++) {
        const div = document.createElement("div");
        div.classList.add("event-item");
        div.textContent = `${events[i]} (Y${startCakeNumber + i})`;
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
    const periodsSinceLastCake = Math.floor((now - lastCakeTime) / intervalDuration);
    const lastEventTime = lastCakeTime + periodsSinceLastCake * intervalDuration;
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
