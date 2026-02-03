const STUDENT_COUNT = 12;
const HEIGHT_MIN = 120;
const HEIGHT_MAX = 180;

const studentsEl = document.getElementById("students");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const newSetBtn = document.getElementById("newSetBtn");
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

let initialHeights = createRandomHeights();
let heights = [...initialHeights];
let steps = createSteps(initialHeights);
let stepIndex = 0;
let timer = null;
let running = false;
let sortedFrom = heights.length;
let currentJ = null;

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

function render() {
  studentsEl.innerHTML = "";
  const scale = 2.1;

  heights.forEach((height, idx) => {
    const student = document.createElement("div");
    student.className = "student";
    student.style.setProperty("--h", Math.round(height * scale));
    student.dataset.index = String(idx + 1);
    student.dataset.height = String(height);

    const head = document.createElement("div");
    head.className = "head";

    const body = document.createElement("div");
    body.className = "body";

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = `${height} cm`;

    student.append(head, body, label);
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
  }

  if (step.type === "swap") {
    currentJ = step.j;
    [heights[step.j], heights[step.j + 1]] = [heights[step.j + 1], heights[step.j]];
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
render();
updateStatus({ type: "init" });
descriptionEl.textContent = "Gotowe do startu. Wybierz Start lub Krok.";
updateCodeHighlight("done");
