const N = 5;

const arrayRow = document.getElementById("arrayRow");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const newSetBtn = document.getElementById("newSetBtn");
const soundBtn = document.getElementById("soundBtn");
const quietDefault = document.getElementById("quietDefault");
const speedRange = document.getElementById("speedRange");
const stepCounterEl = document.getElementById("stepCounter");
const statusTextEl = document.getElementById("statusText");
const descriptionEl = document.getElementById("description");
const valuesInput = document.getElementById("valuesInput");
const targetInput = document.getElementById("targetInput");
const applyValuesBtn = document.getElementById("applyValuesBtn");
const inputErrorEl = document.getElementById("inputError");

const codeCpp = document.getElementById("codeCpp");
const codePy = document.getElementById("codePy");

const MUTE_KEY = "informatykaMuteDefault";

const codeMap = {
  mid: { cpp: [6], py: [7] },
  compare: { cpp: [7], py: [8] },
  move_right: { cpp: [8], py: [9] },
  move_left: { cpp: [8], py: [10] },
  found: { cpp: [7], py: [8] },
  done: { cpp: [10], py: [11] },
};

let arr = createSortedValues();
let target = arr[2];
let steps = createSteps(arr, target);
let stepIndex = 0;
let timer = null;
let running = false;
let left = 0;
let right = arr.length - 1;
let mid = null;
let foundIndex = null;
let soundEnabled = true;
let audioCtx = null;

function setInputValue(vals) {
  valuesInput.value = vals.join(", ");
}

function createSortedValues() {
  const base = Array.from({ length: N }, () => Math.floor(Math.random() * 20));
  return base.sort((a, b) => a - b);
}

function parseValuesInput(value) {
  const raw = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (raw.length !== N) {
    return { error: `Podaj dokładnie ${N} liczb.` };
  }

  const numbers = raw.map((item) => Number(item));
  if (numbers.some((num) => Number.isNaN(num))) {
    return { error: "Wpisz tylko liczby." };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  return { values: sorted };
}

function createSteps(values, x) {
  const out = [];
  let l = 0;
  let p = values.length - 1;

  while (l <= p) {
    const s = Math.floor((l + p) / 2);
    out.push({ type: "mid", l, p, s, val: values[s], x });
    out.push({ type: "compare", l, p, s, val: values[s], x });
    if (values[s] === x) {
      out.push({ type: "found", l, p, s, val: values[s], x });
      break;
    }
    if (values[s] < x) {
      out.push({ type: "move_right", l, p, s, val: values[s], x });
      l = s + 1;
    } else {
      out.push({ type: "move_left", l, p, s, val: values[s], x });
      p = s - 1;
    }
  }

  out.push({ type: "done", l, p, s: null, x });
  return out;
}

function ensureAudio() {
  if (!soundEnabled) return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playCompareBeep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = 320;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.09);
}

function playFoundBeep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 640;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.14);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.16);
}

function render() {
  arrayRow.innerHTML = "";
  arr.forEach((val, idx) => {
    const cell = document.createElement("div");
    cell.className = "array-cell";
    cell.textContent = String(val);
    if (idx === mid) cell.classList.add("mid");
    if (idx === left) cell.classList.add("left");
    if (idx === right) cell.classList.add("right");
    if (foundIndex === idx) cell.classList.add("found");
    arrayRow.appendChild(cell);
  });
}

function setActiveLines(blockEl, lines) {
  if (!blockEl) return;
  const items = Array.from(blockEl.querySelectorAll(".code-line"));
  items.forEach((line) => {
    const num = Number(line.dataset.line);
    line.classList.toggle("active-line", lines.includes(num));
  });
}

function updateCodeHighlight(stepType) {
  const mapping = codeMap[stepType] || { cpp: [], py: [] };
  setActiveLines(codeCpp, mapping.cpp);
  setActiveLines(codePy, mapping.py);
}

function describeStep(step) {
  switch (step.type) {
    case "mid":
      return `Sprawdzam środek: indeks ${step.s}, wartość ${step.val}.`;
    case "compare":
      return `Porównuję ${step.val} z szukaną ${step.x}.`;
    case "move_right":
      return `Szukana jest większa — przesuwam lewą granicę.`;
    case "move_left":
      return `Szukana jest mniejsza — przesuwam prawą granicę.`;
    case "found":
      return `Znaleziono! Wartość ${step.x} na pozycji ${step.s}.`;
    case "done":
      return foundIndex === null ? "Nie znaleziono wartości." : "Zakończono wyszukiwanie.";
    default:
      return "";
  }
}

function updateStatus(step) {
  stepCounterEl.textContent = `Krok: ${Math.min(stepIndex, steps.length)}`;
  statusTextEl.textContent = running ? "Wyszukiwanie trwa..." : "Pauza / gotowe.";
  descriptionEl.textContent = describeStep(step);
}

function applyStep(step) {
  if (!step) return;

  if (step.type === "mid" || step.type === "compare") {
    left = step.l;
    right = step.p;
    mid = step.s;
    if (step.type === "compare") playCompareBeep();
  }

  if (step.type === "move_right") {
    left = step.s + 1;
    mid = null;
  }

  if (step.type === "move_left") {
    right = step.s - 1;
    mid = null;
  }

  if (step.type === "found") {
    foundIndex = step.s;
    playFoundBeep();
    stop();
  }

  if (step.type === "done") {
    stop();
  }

  render();
  updateStatus(step);
  updateCodeHighlight(step.type);
}

function nextDelayFor() {
  const min = Number(speedRange.min);
  const max = Number(speedRange.max);
  const value = Number(speedRange.value);
  return Math.max(120, min + max - value);
}

function scheduleNext() {
  if (!running) return;
  if (stepIndex >= steps.length) {
    stop();
    return;
  }
  const delay = nextDelayFor();
  timer = setTimeout(() => {
    const step = steps[stepIndex];
    stepIndex += 1;
    applyStep(step);
    scheduleNext();
  }, delay);
}

function start() {
  if (running) return;
  ensureAudio();
  running = true;
  statusTextEl.textContent = "Wyszukiwanie trwa...";
  scheduleNext();
}

function stop() {
  if (timer) clearTimeout(timer);
  timer = null;
  running = false;
  statusTextEl.textContent = "Pauza / gotowe.";
}

function reset() {
  stop();
  left = 0;
  right = arr.length - 1;
  mid = null;
  foundIndex = null;
  steps = createSteps(arr, target);
  stepIndex = 0;
  render();
  updateStatus({ type: "init" });
  descriptionEl.textContent = "Gotowe do startu. Wybierz Start lub Krok.";
  updateCodeHighlight("done");
}

startBtn.addEventListener("click", () => {
  if (stepIndex >= steps.length) return;
  start();
});

pauseBtn.addEventListener("click", () => {
  stop();
});

stepBtn.addEventListener("click", () => {
  stop();
  ensureAudio();
  if (stepIndex >= steps.length) return;
  const step = steps[stepIndex];
  stepIndex += 1;
  applyStep(step);
});

resetBtn.addEventListener("click", () => {
  reset();
});

newSetBtn.addEventListener("click", () => {
  arr = createSortedValues();
  target = arr[Math.floor(Math.random() * arr.length)];
  setInputValue(arr);
  targetInput.value = target;
  reset();
  inputErrorEl.textContent = "";
});

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "Dźwięk: WŁ" : "Dźwięk: WYŁ";
  if (soundEnabled) ensureAudio();
});

quietDefault.addEventListener("change", () => {
  const muted = quietDefault.checked;
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  soundEnabled = !muted;
  soundBtn.textContent = soundEnabled ? "Dźwięk: WŁ" : "Dźwięk: WYŁ";
  if (soundEnabled) ensureAudio();
});

applyValuesBtn.addEventListener("click", () => {
  const { values: newValues, error } = parseValuesInput(valuesInput.value);
  if (error) {
    inputErrorEl.textContent = error;
    return;
  }
  const t = Number(targetInput.value);
  if (Number.isNaN(t)) {
    inputErrorEl.textContent = "Podaj szukaną wartość.";
    return;
  }
  inputErrorEl.textContent = "";
  arr = newValues;
  target = t;
  reset();
});

speedRange.addEventListener("input", () => {
  if (running) {
    stop();
    start();
  }
});

setInputValue(arr);
targetInput.value = target;
const mutedDefault = localStorage.getItem(MUTE_KEY) === "1";
quietDefault.checked = mutedDefault;
soundEnabled = !mutedDefault;
soundBtn.textContent = soundEnabled ? "Dźwięk: WŁ" : "Dźwięk: WYŁ";
render();
updateStatus({ type: "init" });
descriptionEl.textContent = "Gotowe do startu. Wybierz Start lub Krok.";
updateCodeHighlight("done");
