const STUDENT_COUNT = 8;
const HEIGHT_MIN = 120;
const HEIGHT_MAX = 180;

const studentsEl = document.getElementById("students");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const newSetBtn = document.getElementById("newSetBtn");
const soundBtn = document.getElementById("soundBtn");
const quietDefault = document.getElementById("quietDefault");
const styleSelect = document.getElementById("styleSelect");
const stylePreview = document.getElementById("stylePreview");
const slowCompare = document.getElementById("slowCompare");
const speedRange = document.getElementById("speedRange");
const stepCounterEl = document.getElementById("stepCounter");
const statusTextEl = document.getElementById("statusText");
const descriptionEl = document.getElementById("description");
const hoverTextEl = document.getElementById("hoverText");
const heightsInput = document.getElementById("heightsInput");
const applyHeightsBtn = document.getElementById("applyHeightsBtn");
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
const SLOW_KEY = "informatykaSlowCompare";

let initialHeights = createRandomHeights();
let heights = [...initialHeights];
let steps = createSteps(initialHeights);
let stepIndex = 0;
let timer = null;
let running = false;
let sortedFrom = heights.length;
let currentJ = null;
let soundEnabled = true;
let audioCtx = null;
const MUTE_KEY = "informatykaMuteDefault";

const codeMap = {
  start_pass: { cpp: [4], py: [4] },
  compare: { cpp: [5, 6], py: [5, 6] },
  swap: { cpp: [6, 7], py: [6, 7] },
  no_swap: { cpp: [6], py: [6] },
  pass_done: { cpp: [4], py: [4] },
  done: { cpp: [], py: [] },
};

function setInputValue(values) {
  heightsInput.value = values.join(", ");
}

function createRandomHeights() {
  const result = [];
  for (let i = 0; i < STUDENT_COUNT; i += 1) {
    const h = Math.floor(Math.random() * (HEIGHT_MAX - HEIGHT_MIN + 1)) + HEIGHT_MIN;
    result.push(h);
  }
  return result;
}

function parseHeightsInput(value) {
  const raw = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (raw.length !== STUDENT_COUNT) {
    return { error: `Podaj dokładnie ${STUDENT_COUNT} liczb.` };
  }

  const numbers = raw.map((item) => Number(item));
  if (numbers.some((num) => Number.isNaN(num) || num <= 0)) {
    return { error: "Wpisz tylko dodatnie liczby." };
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

  const hairTop = document.createElementNS(svgNs, "path");
  hairTop.setAttribute("d", "M18 18 C20 6, 40 6, 42 18 Z");
  hairTop.setAttribute("fill", hair);

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

  svg.append(head, hairTop, eye1, eye2, body, belt, leg1, leg2, shoe1, shoe2);
  return svg;
}

function renderStylePreview() {
  if (!stylePreview) return;
  stylePreview.innerHTML = "";
  stylePreview.appendChild(createAvatarSvg(0));
}

function createSteps(arr) {
  const copy = [...arr];
  const out = [];
  const n = copy.length;

  for (let i = 0; i < n - 1; i += 1) {
    out.push({ type: "start_pass", i });

    for (let j = 0; j < n - i - 1; j += 1) {
      out.push({
        type: "compare",
        i,
        j,
        left: copy[j],
        right: copy[j + 1],
      });

      if (copy[j] > copy[j + 1]) {
        out.push({
          type: "swap",
          i,
          j,
          left: copy[j],
          right: copy[j + 1],
        });
        [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
      } else {
        out.push({
          type: "no_swap",
          i,
          j,
          left: copy[j],
          right: copy[j + 1],
        });
      }
    }

    out.push({ type: "pass_done", i });
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

function playBeep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.14);
}

function playCompareBeep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = 330;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.07, audioCtx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.09);
}

function render() {
  studentsEl.innerHTML = "";
  const scale = 2.1;

  heights.forEach((height, idx) => {
    const student = document.createElement("div");
    student.className = "student";
    student.style.setProperty("--h", Math.round(height * scale));
    student.dataset.index = String(idx + 1);
    student.dataset.height = String(height);

    const person = document.createElement("div");
    person.className = "person";
    person.appendChild(createAvatarSvg(idx));

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `${height} cm`;

    student.append(person, label);
    studentsEl.appendChild(student);

    student.addEventListener("mouseenter", () => {
      hoverTextEl.textContent = `Wskazanie: uczeń ${student.dataset.index}, wzrost ${student.dataset.height} cm.`;
    });

    student.addEventListener("mouseleave", () => {
      hoverTextEl.textContent = "Wskazanie: najedź myszą na ucznia.";
    });
  });

  applyHighlights();
}

function applyHighlights() {
  const nodes = Array.from(studentsEl.children);

  nodes.forEach((node, idx) => {
    node.classList.remove("current", "scan", "scan2", "sorted");

    if (idx >= sortedFrom) node.classList.add("sorted");
    if (idx === currentJ) node.classList.add("scan");
    if (idx === currentJ + 1) node.classList.add("scan2");
  });
}

function setActiveLines(blockEl, lines) {
  if (!blockEl) return;
  const items = Array.from(blockEl.querySelectorAll(".code-line"));
  items.forEach((line) => {
    const num = Number(line.dataset.line);
    if (lines.includes(num)) {
      line.classList.add("active-line");
    } else {
      line.classList.remove("active-line");
    }
  });
}

function updateCodeHighlight(stepType) {
  const mapping = codeMap[stepType] || { cpp: [], py: [] };
  setActiveLines(codeCpp, mapping.cpp);
  setActiveLines(codePy, mapping.py);
}

function describeStep(step) {
  switch (step.type) {
    case "start_pass":
      return `Przebieg ${step.i + 1}: zaczynamy porównywanie sąsiadów.`;
    case "compare":
      return `Porównuję parę: ${step.left} cm i ${step.right} cm.`;
    case "swap":
      return `Zamiana! ${step.left} cm jest większe od ${step.right} cm.`;
    case "no_swap":
      return `Bez zamiany: ${step.left} cm ≤ ${step.right} cm.`;
    case "pass_done":
      return "Największy element tej rundy jest już na końcu.";
    case "done":
      return "Gotowe! Wszyscy uczniowie są ustawieni od najmniejszego do największego.";
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

  if (step.type === "start_pass") {
    currentJ = null;
  }

  if (step.type === "compare") {
    currentJ = step.j;
    playCompareBeep();
  }

  if (step.type === "swap") {
    currentJ = step.j;
    [heights[step.j], heights[step.j + 1]] = [heights[step.j + 1], heights[step.j]];
    playBeep();
  }

  if (step.type === "no_swap") {
    currentJ = step.j;
  }

  if (step.type === "pass_done") {
    sortedFrom = heights.length - (step.i + 1);
    currentJ = null;
  }

  if (step.type === "done") {
    sortedFrom = 0;
    currentJ = null;
    stop();
  }

  render();
  updateStatus(step);
  updateCodeHighlight(step.type);
}

function getBaseDelay() {
  const min = Number(speedRange.min);
  const max = Number(speedRange.max);
  const value = Number(speedRange.value);
  return Math.max(120, min + max - value);
}

function nextDelayFor(step) {
  const base = getBaseDelay();
  if (slowCompare && slowCompare.checked && step && step.type === "compare") {
    return Math.round(base * 1.6);
  }
  return base;
}

function scheduleNext() {
  if (!running) return;
  if (stepIndex >= steps.length) {
    stop();
    return;
  }
  const upcoming = steps[stepIndex];
  const delay = nextDelayFor(upcoming);
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
  heights = [...initialHeights];
  steps = createSteps(heights);
  stepIndex = 0;
  sortedFrom = heights.length;
  currentJ = null;
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
  initialHeights = createRandomHeights();
  reset();
  setInputValue(initialHeights);
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

applyHeightsBtn.addEventListener("click", () => {
  const { values, error } = parseHeightsInput(heightsInput.value);
  if (error) {
    inputErrorEl.textContent = error;
    return;
  }

  inputErrorEl.textContent = "";
  initialHeights = values;
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

setInputValue(initialHeights);
const mutedDefault = localStorage.getItem(MUTE_KEY) === "1";
quietDefault.checked = mutedDefault;
soundEnabled = !mutedDefault;
soundBtn.textContent = soundEnabled ? "Dźwięk: WŁ" : "Dźwięk: WYŁ";
const savedStyle = localStorage.getItem(STYLE_KEY);
if (styleSelect && savedStyle) {
  styleSelect.value = savedStyle;
}
const savedSlow = localStorage.getItem(SLOW_KEY) === "1";
if (slowCompare) {
  slowCompare.checked = savedSlow;
  slowCompare.addEventListener("change", () => {
    localStorage.setItem(SLOW_KEY, slowCompare.checked ? "1" : "0");
  });
}
renderStylePreview();
render();
updateStatus({ type: "init" });
descriptionEl.textContent = "Gotowe do startu. Wybierz Start lub Krok.";
updateCodeHighlight("done");
