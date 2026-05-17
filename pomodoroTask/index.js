const DURATIONS = {
  work: 0.05 * 60 * 1000, // TEMPORARILY CHANGED MINUTES FOR DEBUGGING
  shortBreak: 0.05 * 60 * 1000,
  longBreak: 0.05 * 60 * 1000,
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

let timer = {
  end: null,
  intervalId: null,
};

let isRunning = false;
let isPaused = false;

function calculateTime() {
  const diff = timer.end - Date.now();

  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = (i) => String(i).padStart(2, "0");

  timerEl.textContent = `${pad(minutes)}:${pad(seconds)}`;

  return diff;
}

function clearTime() {
  isRunning = false;
  isPaused = false;
  timerEl.textContent = "00:00";
  timer = {
    end: null,
    intervalId: null,
  };
}

function startPhase(phase) {
  if (!DURATIONS.hasOwnProperty(phase)) {
    throw new TypeError("Invalid phase name");
  }
  if (isRunning) {
    return null;
  }

  isRunning = true;

  const timeLeft = DURATIONS[phase];
  timer.end = new Date();
  timer.end.setTime(timer.end.getTime() + timeLeft);

  switch (phase) {
    case "work":
      phaseEl.textContent = "Work";
      break;
    case "shortBreak":
      phaseEl.textContent = "Short Break";
      break;
    case "longBreak":
      phaseEl.textContent = "Long Break";
  }

  timer.intervalId = setInterval(() => {
    if (calculateTime() <= 1000) {
      clearInterval(timer.intervalId);
      clearTime();

      if (phase === "work") {
        sessionsEl.textContent = `Completed sessions: ${++completedSessions}`;

        setTimeout(() => {
          startPhase(completedSessions % 4 === 0 ? "longBreak" : "shortBreak");
        }, AUTO_SWITCH_DELAY);
      } else {
        setTimeout(() => {
          startPhase("work");
        }, AUTO_SWITCH_DELAY);
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (isPaused || !isRunning) {
    return null;
  }

  clearInterval(timer.intervalId);
  isPaused = true;
}

function resumeTimer() {
  if (!isPaused) {
    return null;
  }

  timer.intervalId = setInterval(() => {
    if (calculateTime() <= 1000) {
      clearInterval(timer.intervalId);
      clearTime();

      if (phase === "work") {
        sessionsEl.textContent = `Completed sessions: ${++completedSessions}`;
      }
    }
  }, 1000);

  isPaused = false;
}

startBtn.addEventListener("click", () => {
  if (!isRunning && !isPaused) {
    startPhase("work");
  }
});

pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

render();
