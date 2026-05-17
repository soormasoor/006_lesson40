"use strict";

const DURATIONS = {
  work: 0.1 * 60 * 1000,
  shortBreak: 0.1 * 60 * 1000,
  longBreak: 0.1 * 60 * 1000,
};

const AUTO_SWITCH_DELAY = 3000;
const STORAGE_KEY = "pomodoro-state";

const phaseEl = document.getElementById("phase");
const timerEl = document.getElementById("timer");
const sessionsEl = document.getElementById("sessions");
const messageEl = document.getElementById("message");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const resetBtn = document.getElementById("resetBtn");

const sound = new Audio("sound.mp3");

const timer = {
  phase: null,
  end: null,
  timeLeft: null,

  isRunning: false,
  isPaused: false,

  intervalId: null,
  flashIntervalId: null,
  isFlashing: false,
};

let completedSessions = 0;

const storage = {
  save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phase: timer.phase,
        end: timer.end,
        timeLeft: timer.timeLeft,
        isRunning: timer.isRunning,
        isPaused: timer.isPaused,
        completedSessions,
      }),
    );
  },

  load() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

function remainingTime() {
  return timer.end - Date.now();
}

function formatTime(ms) {
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const seconds = Math.floor((ms / 1000) % 60);

  const pad = (n) => String(n).padStart(2, "0");

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

    default:
      phaseEl.textContent = "Press START";
  }
}

function startFlashing() {
  if (timer.flashIntervalId) return;

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

  timer.intervalId = null;

  stopFlashing();

  timer.isRunning = false;
  timer.isPaused = false;
}

function finishPhase() {
  const finishedPhase = timer.phase;

  clearTimer();

  messageEl.textContent = "Switching phases...";

  storage.save();

  if (finishedPhase === "work") {
    completedSessions++;

    sessionsEl.textContent = `Completed sessions: ${completedSessions}`;

    const nextPhase = completedSessions % 4 === 0 ? "longBreak" : "shortBreak";

    setTimeout(() => {
      messageEl.textContent = "";

      sound.play();

      startPhase(nextPhase);
    }, AUTO_SWITCH_DELAY);
  } else {
    setTimeout(() => {
      messageEl.textContent = "";

      sound.play();

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

  if (timer.isRunning) return;

  clearTimer();

  timer.phase = phase;
  timer.end = Date.now() + DURATIONS[phase];

  timer.isRunning = true;

  updatePhase(phase);
  renderTime();

  storage.save();

  runTimerLoop();
}

function pauseTimer() {
  if (!timer.isRunning || timer.isPaused) {
    return;
  }

  clearInterval(timer.intervalId);

  timer.intervalId = null;

  timer.timeLeft = remainingTime();

  timer.isPaused = true;
  timer.isRunning = false;

  storage.save();
}

function resumeTimer() {
  if (!timer.isPaused) return;

  timer.end = Date.now() + timer.timeLeft;

  timer.isPaused = false;
  timer.isRunning = true;

  renderTime();

  storage.save();

  runTimerLoop();
}

function resetTimer() {
  clearTimer();

  completedSessions = 0;

  timer.phase = null;
  timer.end = null;
  timer.timeLeft = null;

  sessionsEl.textContent = "Completed sessions: 0";

  updatePhase(null);

  timerEl.textContent = "00:00";

  messageEl.textContent = "";

  storage.clear();
}

function restoreState() {
  const saved = storage.load();

  if (!saved) {
    resetTimer();
    return;
  }

  timer.phase = saved.phase;
  timer.end = saved.end;
  timer.timeLeft = saved.timeLeft;

  timer.isRunning = saved.isRunning;
  timer.isPaused = saved.isPaused;

  completedSessions = saved.completedSessions || 0;

  sessionsEl.textContent = `Completed sessions: ${completedSessions}`;

  updatePhase(timer.phase);

  if (timer.isRunning) {
    const timeLeft = remainingTime();

    if (timeLeft <= 0) {
      finishPhase();
      return;
    }

    renderTime();

    runTimerLoop();
  }

  if (timer.isPaused) {
    timerEl.textContent = formatTime(timer.timeLeft);
  }

  if (!timer.isRunning && !timer.isPaused) {
    timerEl.textContent = "00:00";
  }
}

startBtn.addEventListener("click", () => {
  if (!timer.isRunning && !timer.isPaused) {
    startPhase("work");
  }
});

pauseBtn.addEventListener("click", pauseTimer);

resumeBtn.addEventListener("click", resumeTimer);

resetBtn.addEventListener("click", resetTimer);

restoreState();
