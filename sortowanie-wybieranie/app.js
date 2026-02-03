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

const SKIN_TONES = ["#f5cfa0", "#f1b97a", "#e6a572", "#d9915b"];
const HAIR_COLORS = ["#2e1d14", "#5a3b22", "#1b1b1b", "#8b5a2b", "#b06a4a"];
const SHIRT_COLORS = ["#ff7a59", "#4e8cff", "#21c07a", "#ffcc4d", "#9b5de5"];
const PANTS_COLORS = ["#3b3b3b", "#2c4b6b", "#4b2c2c", "#3c5f4a"];

let initialHeights = createRandomHeights();
let heights = [...initialHeights];
let steps = createSteps(initialHeights);
let stepIndex = 0;
let timer = null;
let running = false;
let sortedUpto = -1;
let currentI = null;
let currentJ = null;
let currentMin = null;
let soundEnabled = true;
let audioCtx = null;
const MUTE_KEY = "informatykaMuteDefault";

const codeMap = {
  select_i: { cpp: [4, 5], py: [4, 5] },
  compare: { cpp: [6, 7], py: [6, 7] },
  new_min: { cpp: [7, 8], py: [7, 8] },
  swap: { cpp: [11], py: [9, 10] },
  no_swap: { cpp: [11], py: [9] },
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

function createAvatarSvg(idx) {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("viewBox", "0 0 60 120");
  svg.setAttribute("preserveAspectRatio", "none");

  const skin = SKIN_TONES[idx % SKIN_TONES.length];
  const hair = HAIR_COLORS[idx % HAIR_COLORS.length];
  const shirt = SHIRT_COLORS[idx % SHIRT_COLORS.length];
  const pants = PANTS_COLORS[idx % PANTS_COLORS.length];

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

function createSteps(arr) {
  const copy = [...arr];
  const out = [];

  for (let i = 0; i < copy.length - 1; i += 1) {
    let min = i;
    out.push({ type: "select_i", i });

    for (let j = i + 1; j < copy.length; j += 1) {
      out.push({
        type: "compare",
        i,
        j,
        min,
        valJ: copy[j],
        valMin: copy[min],
      });

      if (copy[j] < copy[min]) {
        min = j;
        out.push({
          type: "new_min",
          i,
          j,
          min,
          valMin: copy[min],
        });
      }
    }

    if (min !== i) {
      out.push({ type: "swap", i, min, valI: copy[i], valMin: copy[min] });
      [copy[i], copy[min]] = [copy[min], copy[i]];
    } else {
      out.push({ type: "no_swap", i, valI: copy[i] });
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

function playBeep() {
  if (!soundEnabled || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 520;
  gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.14);
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
    node.classList.remove("current", "scan", "min", "sorted");

    if (idx <= sortedUpto) node.classList.add("sorted");
    if (idx === currentI) node.classList.add("current");
    if (idx === currentJ) node.classList.add("scan");
    if (idx === currentMin) node.classList.add("min");
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
    case "select_i":
      return `Zaczynamy nowe ustawianie. Pozycja i = ${step.i + 1}. Szukamy najmniejszego wzrostu w pozostałych.`;
    case "compare":
      return `Porównuję ucznia na pozycji j = ${step.j + 1} (${step.valJ} cm) z najmniejszym znalezionym (${step.valMin} cm).`;
    case "new_min":
      return `Nowy najmniejszy wzrost to ${step.valMin} cm na pozycji ${step.min + 1}.`;
    case "swap":
      return `Zamieniam uczniów: pozycja ${step.i + 1} (${step.valI} cm) z pozycją ${step.min + 1} (${step.valMin} cm).`;
    case "no_swap":
      return `Nie trzeba zamiany. Pozycja ${step.i + 1} jest już najmniejsza (${step.valI} cm).`;
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

  if (step.type === "select_i") {
    currentI = step.i;
    currentJ = null;
    currentMin = step.i;
  }

  if (step.type === "compare") {
    currentI = step.i;
    currentJ = step.j;
    currentMin = step.min;
  }

  if (step.type === "new_min") {
    currentI = step.i;
    currentJ = step.j;
    currentMin = step.min;
  }

  if (step.type === "swap") {
    currentI = step.i;
    currentJ = null;
    currentMin = step.min;
    [heights[step.i], heights[step.min]] = [heights[step.min], heights[step.i]];
    sortedUpto = step.i;
    playBeep();
  }

  if (step.type === "no_swap") {
    currentI = step.i;
    currentJ = null;
    currentMin = step.i;
    sortedUpto = step.i;
  }

  if (step.type === "done") {
    currentI = null;
    currentJ = null;
    currentMin = null;
    sortedUpto = heights.length - 1;
    stop();
  }

  render();
  updateStatus(step);
  updateCodeHighlight(step.type);
}

function nextStep() {
  if (stepIndex >= steps.length) {
    stop();
    return;
  }

  const step = steps[stepIndex];
  stepIndex += 1;
  applyStep(step);
}

function start() {
  if (running) return;
  ensureAudio();
  running = true;
  statusTextEl.textContent = "Sortowanie trwa...";
  timer = setInterval(nextStep, Number(speedRange.value));
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  running = false;
  statusTextEl.textContent = "Pauza / gotowe.";
}

function reset() {
  stop();
  heights = [...initialHeights];
  steps = createSteps(heights);
  stepIndex = 0;
  sortedUpto = -1;
  currentI = null;
  currentJ = null;
  currentMin = null;
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
  nextStep();
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

setInputValue(initialHeights);
const mutedDefault = localStorage.getItem(MUTE_KEY) === "1";
quietDefault.checked = mutedDefault;
soundEnabled = !mutedDefault;
soundBtn.textContent = soundEnabled ? "Dźwięk: WŁ" : "Dźwięk: WYŁ";
render();
updateStatus({ type: "init" });
descriptionEl.textContent = "Gotowe do startu. Wybierz Start lub Krok.";
updateCodeHighlight("done");
