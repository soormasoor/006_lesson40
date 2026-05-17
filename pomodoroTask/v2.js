"use strict";
const DURATIONS = {
  work: 0.1 * 60 * 1000, // debug durations
  shortBreak: 0.1 * 60 * 1000,
  longBreak: 0.1 * 60 * 1000,
};

const AUTO_SWITCH_DELAY = 3000;

const phaseEl = document.getElementById("phase");
const timerEl = document.getElementById("timer");
const sessionsEl = document.getElementById("sessions");
const messageEl = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const resetBtn = document.getElementById("resetBtn");

let completedSessions = 0;

const timer = {
  phase: null,
  end: null,
  timeLeft: null,

  intervalId: null,
  flashIntervalId: null,

  isFlashing: false,
};

let isRunning = false;
let isPaused = false;

function remainingTime() {
  return timer.end - Date.now();
}

function formatTime(millis) {
  const minutes = Math.floor((millis / (1000 * 60)) % 60);
  const seconds = Math.floor((millis / 1000) % 60);

  const pad = (i) => String(i).padStart(2, "0");

  return `${pad(minutes)}:${pad(seconds)}`;
}

function renderTime() {
  timerEl.textContent = formatTime(Math.max(remainingTime(), 0));
}

function updatePhase(phase) {
  switch (phase) {
    case "work":
      phaseEl.textContent = "Work";
      break;

    case "shortBreak":
      phaseEl.textContent = "Short Break";
      break;

    case "longBreak":
      phaseEl.textContent = "Long Break";
      break;
  }
}

function startFlashing() {
  if (timer.flashIntervalId) {
    return;
  }

  timer.flashIntervalId = setInterval(() => {
    timerEl.style.color = timer.isFlashing ? "red" : "white";

    timer.isFlashing = !timer.isFlashing;
  }, 500);
}

function stopFlashing() {
  clearInterval(timer.flashIntervalId);

  timer.flashIntervalId = null;
  timer.isFlashing = false;

  timerEl.style.color = "white";
}

function clearTimer() {
  clearInterval(timer.intervalId);
  clearInterval(timer.flashIntervalId);

  timer.intervalId = null;
  timer.flashIntervalId = null;

  stopFlashing();

  isRunning = false;
  isPaused = false;
}

function finishPhase() {
  const finishedPhase = timer.phase;

  clearTimer();

  messageEl.textContent = "Switching phases...";

  if (finishedPhase === "work") {
    sessionsEl.textContent = `Completed sessions: ${++completedSessions}`;

    const nextPhase = completedSessions % 4 === 0 ? "longBreak" : "shortBreak";

    setTimeout(() => {
      messageEl.textContent = "";
      startPhase(nextPhase);
    }, AUTO_SWITCH_DELAY);
  } else {
    setTimeout(() => {
      messageEl.textContent = "";
      startPhase("work");
    }, AUTO_SWITCH_DELAY);
  }
}

function runTimerLoop() {
  timer.intervalId = setInterval(() => {
    renderTime();

    const timeLeft = remainingTime();

    if (timeLeft <= 10000) {
      startFlashing();
    }

    if (timeLeft <= 0) {
      finishPhase();
    }
  }, 250);
}

function startPhase(phase) {
  if (!DURATIONS.hasOwnProperty(phase)) {
    throw new TypeError("Invalid phase");
  }

  if (isRunning) {
    return;
  }

  clearTimer();

  timer.phase = phase;
  timer.end = Date.now() + DURATIONS[phase];

  isRunning = true;

  updatePhase(phase);
  renderTime();

  runTimerLoop();
}

function pauseTimer() {
  if (!isRunning || isPaused) {
    return;
  }

  clearInterval(timer.intervalId);

  timer.timeLeft = remainingTime();

  isPaused = true;
  isRunning = false;
}

function resumeTimer() {
  if (!isPaused) {
    return;
  }

  timer.end = Date.now() + timer.timeLeft;

  isPaused = false;
  isRunning = true;

  renderTime();

  runTimerLoop();
}

function resetTimer() {
  clearTimer();

  completedSessions = 0;

  sessionsEl.textContent = "Completed sessions: 0";

  phaseEl.textContent = "Press START";
  timerEl.textContent = "00:00";

  timer.phase = null;
  timer.end = null;
  timer.timeLeft = null;
}

startBtn.addEventListener("click", () => {
  if (!isRunning && !isPaused) {
    startPhase("work");
  }
});

pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

resetTimer();
