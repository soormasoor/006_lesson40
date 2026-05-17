const DURATIONS = {
  work: 25 * 60 * 1000,
  shortBreak: 5 * 60 * 1000,
  longBreak: 15 * 60 * 1000,
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

startBtn.addEventListener("click", () => {
  if (!isRunning && !isPaused) {
    startPhase("work");
  }
});

pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);

render();
