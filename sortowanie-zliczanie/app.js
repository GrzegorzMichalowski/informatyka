let N = 5;
const MAXV = 9;

const valuesRow = document.getElementById("valuesRow");
const countsRow = document.getElementById("countsRow");
const outputRow = document.getElementById("outputRow");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const newSetBtn = document.getElementById("newSetBtn");
const soundBtn = document.getElementById("soundBtn");
const quietDefault = document.getElementById("quietDefault");
const styleSelect = document.getElementById("styleSelect");
const stylePreview = document.getElementById("stylePreview");
const speedRange = document.getElementById("speedRange");
const stepCounterEl = document.getElementById("stepCounter");
const statusTextEl = document.getElementById("statusText");
const descriptionEl = document.getElementById("description");
const valuesInput = document.getElementById("valuesInput");
const countInput = document.getElementById("countInput");
const applyValuesBtn = document.getElementById("applyValuesBtn");
const inputErrorEl = document.getElementById("inputError");

const codeCpp = document.getElementById("codeCpp");
const codePy = document.getElementById("codePy");

const STYLES = {
  school: {
    skin: ["#f5cfa0", "#f1b97a", "#e6a572", "#d9915b"],
    hair: ["#2e1d14", "#5a3b22", "#1b1b1b", "#8b5a2b", "#b06a4a"],
    shirts: ["#ff7a59", "#4e8cff", "#21c07a", "#ffcc4d", "#9b5de5"],
    pants: ["#3b3b3b", "#2c4b6b", "#4b2c2c", "#3c5f4a"],
  },
  sport: {
    skin: ["#f5cfa0", "#f1b97a", "#e6a572", "#d9915b"],
    hair: ["#1b1b1b", "#2e1d14", "#8b5a2b"],
    shirts: ["#ff3b3b", "#ffb703", "#3a86ff", "#00b4d8"],
    pants: ["#1b263b", "#14213d", "#2b2d42"],
  },
  pastel: {
    skin: ["#f6d8c9", "#f2c4b3", "#e9b89f"],
    hair: ["#5e4b56", "#7a5c61", "#3d3b40"],
    shirts: ["#bde0fe", "#ffc8dd", "#cdb4db", "#a2d2ff"],
    pants: ["#a0a0a0", "#8d99ae", "#b0a8b9"],
  },
};

const STYLE_KEY = "informatykaAvatarStyle";
const MUTE_KEY = "informatykaMuteDefault";

const codeMap = {
  count: { cpp: [6], py: [7] },
  scan_v: { cpp: [8], py: [9] },
  write: { cpp: [9, 10], py: [10, 11] },
  done: { cpp: [], py: [] },
};

let values = createRandomValues(N);
let counts = Array(MAXV + 1).fill(0);
let output = Array(N).fill(null);
let steps = createSteps(values);
let stepIndex = 0;
let timer = null;
let running = false;
let currentIndex = null;
let currentValue = null;
let currentCountIndex = null;
let currentOutIndex = null;
let soundEnabled = true;
let audioCtx = null;

function setInputValue(vals) {
  valuesInput.value = vals.join(", ");
}

function createRandomValues(count) {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(Math.floor(Math.random() * (MAXV + 1)));
  }
  return result;
}

function parseValuesInput(value) {
  const raw = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (raw.length < 1 || raw.length > 30) {
    return { error: "Podaj od 1 do 30 liczb." };
  }

  const numbers = raw.map((item) => Number(item));
  if (numbers.some((num) => Number.isNaN(num) || num < 0 || num > MAXV)) {
    return { error: `Wpisz tylko liczby 0–${MAXV}.` };
  }

  return { values: numbers };
}

function getStylePalette() {
  const style = styleSelect ? styleSelect.value : "school";
  return STYLES[style] || STYLES.school;
}

function createAvatarSvg(idx) {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 60 120");
  svg.setAttribute("preserveAspectRatio", "none");

  const palette = getStylePalette();
  const skin = palette.skin[idx % palette.skin.length];
  const hair = palette.hair[idx % palette.hair.length];
  const shirt = palette.shirts[idx % palette.shirts.length];
  const pants = palette.pants[idx % palette.pants.length];

  const head = document.createElementNS(svgNs, "circle");
  head.setAttribute("cx", "30");
  head.setAttribute("cy", "20");
  head.setAttribute("r", "12");
  head.setAttribute("fill", skin);

  const hairStyle = idx % 3;
  let hairTop = document.createElementNS(svgNs, "path");
  hairTop.setAttribute("fill", hair);
  if (hairStyle === 0) {
    hairTop.setAttribute("d", "M16 20 C18 6, 42 6, 44 20 Z");
  } else if (hairStyle === 1) {
    hairTop.setAttribute("d", "M18 20 C20 6, 40 6, 42 20 Z");
  } else {
    hairTop.setAttribute("d", "M16 22 C18 8, 42 8, 44 22 Z");
  }

  const eye1 = document.createElementNS(svgNs, "circle");
  eye1.setAttribute("cx", "26");
  eye1.setAttribute("cy", "20");
  eye1.setAttribute("r", "2");
  eye1.setAttribute("fill", "#1b1a2b");

  const eye2 = document.createElementNS(svgNs, "circle");
  eye2.setAttribute("cx", "34");
  eye2.setAttribute("cy", "20");
  eye2.setAttribute("r", "2");
  eye2.setAttribute("fill", "#1b1a2b");

  const body = document.createElementNS(svgNs, "rect");
  body.setAttribute("x", "18");
  body.setAttribute("y", "34");
  body.setAttribute("width", "24");
  body.setAttribute("height", "36");
  body.setAttribute("rx", "6");
  body.setAttribute("fill", shirt);

  const armLeft = document.createElementNS(svgNs, "rect");
  armLeft.setAttribute("x", "12");
  armLeft.setAttribute("y", "38");
  armLeft.setAttribute("width", "8");
  armLeft.setAttribute("height", "28");
  armLeft.setAttribute("rx", "4");
  armLeft.setAttribute("fill", shirt);

  const armRight = document.createElementNS(svgNs, "rect");
  armRight.setAttribute("x", "40");
  armRight.setAttribute("y", "38");
  armRight.setAttribute("width", "8");
  armRight.setAttribute("height", "28");
  armRight.setAttribute("rx", "4");
  armRight.setAttribute("fill", shirt);

  const handLeft = document.createElementNS(svgNs, "circle");
  handLeft.setAttribute("cx", "16");
  handLeft.setAttribute("cy", "66");
  handLeft.setAttribute("r", "4");
  handLeft.setAttribute("fill", skin);

  const handRight = document.createElementNS(svgNs, "circle");
  handRight.setAttribute("cx", "44");
  handRight.setAttribute("cy", "66");
  handRight.setAttribute("r", "4");
  handRight.setAttribute("fill", skin);

  const belt = document.createElementNS(svgNs, "rect");
  belt.setAttribute("x", "18");
  belt.setAttribute("y", "66");
  belt.setAttribute("width", "24");
  belt.setAttribute("height", "6");
  belt.setAttribute("fill", "#2b2b3b");

  const leg1 = document.createElementNS(svgNs, "rect");
  leg1.setAttribute("x", "18");
  leg1.setAttribute("y", "72");
  leg1.setAttribute("width", "10");
  leg1.setAttribute("height", "38");
  leg1.setAttribute("rx", "3");
  leg1.setAttribute("fill", pants);

  const leg2 = document.createElementNS(svgNs, "rect");
  leg2.setAttribute("x", "32");
  leg2.setAttribute("y", "72");
  leg2.setAttribute("width", "10");
  leg2.setAttribute("height", "38");
  leg2.setAttribute("rx", "3");
  leg2.setAttribute("fill", pants);

  const shoe1 = document.createElementNS(svgNs, "rect");
  shoe1.setAttribute("x", "16");
  shoe1.setAttribute("y", "110");
  shoe1.setAttribute("width", "14");
  shoe1.setAttribute("height", "6");
  shoe1.setAttribute("rx", "3");
  shoe1.setAttribute("fill", "#1b1a2b");

  const shoe2 = document.createElementNS(svgNs, "rect");
  shoe2.setAttribute("x", "30");
  shoe2.setAttribute("y", "110");
  shoe2.setAttribute("width", "14");
  shoe2.setAttribute("height", "6");
  shoe2.setAttribute("rx", "3");
  shoe2.setAttribute("fill", "#1b1a2b");

  const ponytail = document.createElementNS(svgNs, "circle");
  ponytail.setAttribute("cx", "48");
  ponytail.setAttribute("cy", "20");
  ponytail.setAttribute("r", "4");
  ponytail.setAttribute("fill", hair);

  const cap = document.createElementNS(svgNs, "path");
  cap.setAttribute("d", "M14 20 C18 4, 42 4, 46 20 Z");
  cap.setAttribute("fill", hair);
  const capBill = document.createElementNS(svgNs, "rect");
  capBill.setAttribute("x", "38");
  capBill.setAttribute("y", "18");
  capBill.setAttribute("width", "10");
  capBill.setAttribute("height", "4");
  capBill.setAttribute("rx", "2");
  capBill.setAttribute("fill", hair);

  if (hairStyle === 1) {
    svg.append(head, hairTop, ponytail);
  } else if (hairStyle === 2) {
    svg.append(head, cap, capBill);
  } else {
    svg.append(head, hairTop);
  }
  svg.append(eye1, eye2, armLeft, armRight, handLeft, handRight, body, belt, leg1, leg2, shoe1, shoe2);
  return svg;
}

function renderStylePreview() {
  if (!stylePreview) return;
  stylePreview.innerHTML = "";
  stylePreview.appendChild(createAvatarSvg(0));
}

function createSteps(arr) {
  const out = [];
  const countsLocal = Array(MAXV + 1).fill(0);

  for (let i = 0; i < arr.length; i += 1) {
    countsLocal[arr[i]] += 1;
    out.push({ type: "count", i, val: arr[i] });
  }

  let k = 0;
  for (let v = 0; v <= MAXV; v += 1) {
    out.push({ type: "scan_v", v });
    for (let c = 0; c < countsLocal[v]; c += 1) {
      out.push({ type: "write", v, outIndex: k });
      k += 1;
    }
  }

  out.push({ type: "done" });
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

function playCountBeep() {
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

function playWriteBeep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 560;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.14);
}

function render() {
  valuesRow.innerHTML = "";
  values.forEach((val, idx) => {
    const card = document.createElement("div");
    card.className = "student";
    const person = document.createElement("div");
    person.className = "person";
    person.appendChild(createAvatarSvg(idx));
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = String(val);
    card.append(person, label);
    valuesRow.appendChild(card);
  });

  countsRow.innerHTML = "";
  for (let v = 0; v <= MAXV; v += 1) {
    const cell = document.createElement("div");
    cell.className = "count-cell";
    cell.textContent = `${v}: ${counts[v]}`;
    countsRow.appendChild(cell);
  }

  outputRow.innerHTML = "";
  output.forEach((val) => {
    const cell = document.createElement("div");
    cell.className = "output-cell";
    cell.textContent = val === null ? "–" : String(val);
    outputRow.appendChild(cell);
  });

  applyHighlights();
}

function applyHighlights() {
  const valueNodes = Array.from(valuesRow.children);
  const countNodes = Array.from(countsRow.children);
  const outNodes = Array.from(outputRow.children);

  valueNodes.forEach((node, idx) => {
    node.classList.toggle("scan", idx === currentIndex);
  });

  countNodes.forEach((node, idx) => {
    node.classList.toggle("active", idx === currentCountIndex);
  });

  outNodes.forEach((node, idx) => {
    node.classList.toggle("active", idx === currentOutIndex);
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
    case "count":
      return `Zliczam wartość ${step.val}. Zwiększam licznik.`;
    case "scan_v":
      return `Sprawdzam liczbę ${step.v} w tablicy liczniki.`;
    case "write":
      return `Wpisuję ${step.v} do wyniku na pozycję ${step.outIndex + 1}.`;
    case "done":
      return "Gotowe! Zbiór jest posortowany.";
    default:
      return "";
  }
}

function updateStatus(step) {
  stepCounterEl.textContent = `Krok: ${Math.min(stepIndex, steps.length)}`;
  statusTextEl.textContent = running ? "Sortowanie trwa..." : "Pauza / gotowe.";
  descriptionEl.textContent = describeStep(step);
}

function applyStep(step) {
  if (!step) return;

  if (step.type === "count") {
    currentIndex = step.i;
    currentValue = step.val;
    currentCountIndex = step.val;
    counts[step.val] += 1;
    playCountBeep();
  }

  if (step.type === "scan_v") {
    currentIndex = null;
    currentValue = step.v;
    currentCountIndex = step.v;
  }

  if (step.type === "write") {
    currentOutIndex = step.outIndex;
    output[step.outIndex] = step.v;
    playWriteBeep();
  }

  if (step.type === "done") {
    currentIndex = null;
    currentCountIndex = null;
    currentOutIndex = null;
    values = [...output];
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
  statusTextEl.textContent = "Sortowanie trwa...";
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
  values = [...values];
  counts = Array(MAXV + 1).fill(0);
  output = Array(N).fill(null);
  steps = createSteps(values);
  stepIndex = 0;
  currentIndex = null;
  currentValue = null;
  currentCountIndex = null;
  currentOutIndex = null;
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
  const count = getCountInput();
  if (count === null) return;
  N = count;
  values = createRandomValues(N);
  setInputValue(values);
  countInput.value = String(N);
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
  inputErrorEl.textContent = "";
  N = newValues.length;
  countInput.value = String(N);
  values = newValues;
  reset();
});

speedRange.addEventListener("input", () => {
  if (running) {
    stop();
    start();
  }
});

if (styleSelect) {
  styleSelect.addEventListener("change", () => {
    localStorage.setItem(STYLE_KEY, styleSelect.value);
    renderStylePreview();
    render();
  });
}

function getCountInput() {
  const count = Number(countInput.value);
  if (Number.isNaN(count) || count < 1 || count > 30) {
    inputErrorEl.textContent = "Liczba elementów musi być z zakresu 1–30.";
    return null;
  }
  return Math.floor(count);
}

setInputValue(values);
countInput.value = String(N);
const mutedDefault = localStorage.getItem(MUTE_KEY) === "1";
quietDefault.checked = mutedDefault;
soundEnabled = !mutedDefault;
soundBtn.textContent = soundEnabled ? "Dźwięk: WŁ" : "Dźwięk: WYŁ";
const savedStyle = localStorage.getItem(STYLE_KEY);
if (styleSelect && savedStyle) {
  styleSelect.value = savedStyle;
}
renderStylePreview();
render();
updateStatus({ type: "init" });
descriptionEl.textContent = "Gotowe do startu. Wybierz Start lub Krok.";
updateCodeHighlight("done");
