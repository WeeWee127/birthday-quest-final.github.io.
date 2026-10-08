const birthdayConfig = {
  name: "Nadiya",
  age: "[AGE]",
  greeting:
    "Ми знайомі не так давно, тому я не буду робити вигляд, ніби знаю тебе сто років 😄\n\nАле за ці кілька тижнів ти вже встигла стати людиною, якій захотілося зробити маленький особливий сюрприз.\n\nТому сьогодні бажаю тобі...",
  wishes: [
    "багато приводів посміхатися",
    "людей поруч, з якими будеш відчувати себе спокійно і добре",
    "крутих моментів",
    "здійснення того, чого дійсно хочеться",
    "і щоб цей рік приніс тобі більше хорошого, ніж ти очікуєш"
  ],
  accentColor: "#ff2d6a",
  music: "assets/audio/music.mp3",
  // День, місяць і рік, коли почали спілкуватись
  meetingDate: { day: 23, month: 9, year: 26 }
};

const STORAGE_KEY = "birthday-quest-v1";

/* Replace hint / answers / correctIndex / digit with personal chat memories. */
const memoryCodeConfig = {
  // Рівно 4 питання — у index.html 4 комірки коду.
  // answers — 3 варіанти, correctIndex — номер правильного (0, 1 або 2), digit — цифра коду.
  questions: [
    {
       hint: "1 — Який транспорт найчастіше згадувався у ваших розмовах?",
      answers: ["Велосипед", "Мотоцикл", "Самокат"],
      correctIndex: 1,
      digit: "2"
    },
    {
       hint: "2 —Ти розповідала про експерименти з волоссям. Що сталося, коли ти пробувала блонд?",
      answers: ["Вийшло ідеально", "Волосся сказало «допобачення»", "Стало рожевим"],
      correctIndex: 1,
      digit: "3"
    },
    {
      hint: "3 — Яка тема між вами вже встигла стати майже окремою гілкою діалогу?",
      answers: ["Мотоцикли", "Фільми", "Їжа"],
      correctIndex: 0,
      digit: "0"
    },
    {
      hint: "4 — Ти розповіла про азійський магазин, і мені одразу захотілося однієї страви. Якої?",
      answers: ["Том ям", "Рамен", "Суші"],
      correctIndex: 0,
      digit: "9"
    }
  ]
};

const M2_KEYS = ["A", "B", "C", "D"];
const M2_LOCK = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`;

const screens = {
  start: "screen-start",
  resume: "screen-resume",
  boot: "screen-boot",
  player: "screen-player",
  map: "screen-map",
  m1: "screen-m1",
  m2: "screen-m2",
  greet: "screen-greet",
  m3: "screen-m3",
  finale: "screen-finale"
};

const els = {
  mute: document.getElementById("mute-btn"),
  hud: document.getElementById("progress-hud"),
  fill: document.getElementById("progress-fill"),
  pct: document.getElementById("progress-pct"),
  bar: document.getElementById("progress-bar"),
  gifts: document.getElementById("gifts"),
  m1Feedback: document.getElementById("m1-feedback"),
  m1Next: document.getElementById("btn-m1-next"),
  codeCells: [],
  m2Cells: document.getElementById("code-cells"),
  m2Hint: document.getElementById("m2-hint"),
  m2Answers: document.getElementById("m2-answers"),
  m2Feedback: document.getElementById("m2-feedback"),
  m2Progress: document.getElementById("m2-progress"),
  m2Access: document.getElementById("m2-access"),
  m2Next: document.getElementById("btn-m2-next"),
  m2Panel: document.getElementById("m2-panel"),
  m2Garage: document.getElementById("m2-garage"),
  m2Chip: document.getElementById("m2-chip"),
  m2QLabel: document.getElementById("m2-qlabel"),
  m2Status: document.getElementById("m2-status"),
  m2GFill: document.getElementById("m2-gfill"),
  m2Needle: document.getElementById("m2-gneedle"),
  greetText: document.getElementById("greet-text"),
  wishes: document.getElementById("wishes"),
  skip: document.getElementById("btn-skip"),
  greetNext: document.getElementById("btn-greet-next"),
  bootFill: document.getElementById("boot-fill"),
  bootPct: document.getElementById("boot-pct"),
  bootStatus: document.getElementById("boot-status"),
  bootLog: document.getElementById("boot-log"),
  rewardFill: document.getElementById("reward-fill"),
  rewardPct: document.getElementById("reward-pct"),
  rewardDone: document.getElementById("reward-done"),
  claim: document.getElementById("btn-claim"),
  secret: document.getElementById("secret"),
  modal: document.getElementById("reset-modal"),
  resumePct: document.getElementById("resume-pct"),
  m3Day: document.getElementById("m3-day"),
  m3Month: document.getElementById("m3-month"),
  m3Year: document.getElementById("m3-year"),
  m3Feedback: document.getElementById("m3-feedback"),
  rewardBar: document.getElementById("reward-bar")
};

let state = loadState();
let audio = null;
let typingTimer = 0;
let skipTyping = false;
let correctGift = 2;
let currentScreen = "start";
let pendingUnlock = null;
let lastAnswerAt = 0;
let m2Busy = false;

applyConfig();
bindEvents();
initParticles();
bootApp();

function applyConfig() {
  document.documentElement.style.setProperty("--accent", birthdayConfig.accentColor);
  const hex = /^#?([0-9a-f]{6})$/i.exec(birthdayConfig.accentColor || "");
  if (hex) {
    const n = parseInt(hex[1], 16);
    document.documentElement.style.setProperty("--accent-rgb", `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`);
  }
  buildMemoryCells();
  document.title = `Birthday Quest — ${birthdayConfig.name}`;
  document.querySelectorAll("[data-name]").forEach((node) => {
    node.textContent = birthdayConfig.name;
  });
  birthdayConfig.wishes.forEach((wish) => {
    const li = document.createElement("li");
    li.textContent = wish;
    els.wishes.appendChild(li);
  });
}

function defaultState() {
  return {
    started: false,
    mission: 0,
    m1: false,
    m2: false,
    m3: false,
    complete: false,
    muted: false,
    screen: "start",
    m2Solved: 0
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = { ...defaultState(), ...JSON.parse(raw) };
    parsed.m2Solved = clampM2Solved(parsed.m2Solved);
    if (parsed.m2) parsed.m2Solved = memoryCodeConfig.questions.length;
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* private mode / blocked storage */
  }
}

function bootApp() {
  updateProgress();
  updateMissions();
  syncMuteUi();
  if (state.started && state.screen && state.screen !== "start") {
    els.resumePct.textContent = `${progressValue()}%`;
    showScreen("resume", false);
  } else {
    showScreen("start", false);
  }
}

function bindEvents() {
  document.getElementById("btn-start").addEventListener("click", startQuest);
  document.getElementById("btn-continue").addEventListener("click", () => {
    resumeAudio();
    showScreen(state.screen === "resume" ? "map" : state.screen);
  });
  document.getElementById("btn-reset").addEventListener("click", () => {
    els.modal.classList.remove("hidden");
  });
  document.getElementById("btn-reset-no").addEventListener("click", () => {
    els.modal.classList.add("hidden");
  });
  document.getElementById("btn-reset-yes").addEventListener("click", resetQuest);
  document.getElementById("btn-accept").addEventListener("click", () => showScreen("map"));
  document.getElementById("mission-list").addEventListener("click", onMissionClick);
  els.m1Next.addEventListener("click", () => showScreen("map"));
  els.m2Answers.addEventListener("click", onMemoryAnswer);
  els.m2Next.addEventListener("click", () => showScreen("m3"));
  els.skip.addEventListener("click", () => {
    skipTyping = true;
  });
  els.greetNext.addEventListener("click", () => {
    state.complete = true;
    state.mission = 3;
    saveState();
    updateProgress();
    showScreen("finale");
  });
  els.claim.addEventListener("click", claimReward);
  els.m3Day.addEventListener("input", checkM3Date);
  els.m3Month.addEventListener("input", checkM3Date);
  els.m3Year.addEventListener("input", checkM3Date);
  document.getElementById("btn-secret").addEventListener("click", () => {
    els.secret.classList.remove("hidden");
  });
  els.mute.addEventListener("click", toggleMute);

  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("pointerdown", () => btn.classList.add("is-pressed"));
    btn.addEventListener("pointerup", () => btn.classList.remove("is-pressed"));
  });
}

function startQuest() {
  state.started = true;
  saveState();
  resumeAudio();
  runBootSequence();
}

function resumeAudio() {
  if (!audio) {
    audio = new Audio(birthdayConfig.music);
    audio.loop = true;
    audio.addEventListener("error", () => {
      audio = null;
    });
  }
  if (audio && !state.muted) {
    audio.play().catch(() => {});
  }
  syncMuteUi();
}

function toggleMute() {
  state.muted = !state.muted;
  saveState();
  if (!audio) resumeAudio();
  if (audio) {
    if (state.muted) audio.pause();
    else audio.play().catch(() => {});
  }
  syncMuteUi();
}

function syncMuteUi() {
  const muted = state.muted || !audio;
  els.mute.setAttribute("aria-pressed", String(muted));
  els.mute.setAttribute("aria-label", muted ? "Увімкнути звук" : "Вимкнути звук");
  els.mute.querySelector(".icon-mute").classList.toggle("hidden", !muted);
  els.mute.querySelector(".icon-sound").classList.toggle("hidden", muted);
}

function resetQuest() {
  stopAudio();
  state = defaultState();
  saveState();
  els.modal.classList.add("hidden");
  skipTyping = false;
  m2Busy = false;
  els.m1Next.classList.add("hidden");
  els.m2Next.classList.add("hidden");
  els.m2Access.classList.add("hidden");
  els.secret.classList.add("hidden");
  els.wishes.classList.add("hidden");
  els.greetText.textContent = "";
  updateProgress();
  updateMissions();
  showScreen("start");
}

function stopAudio() {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function showScreen(name, persist = true) {
  currentScreen = name;
  Object.entries(screens).forEach(([key, id]) => {
    const node = document.getElementById(id);
    const active = key === name;
    node.classList.toggle("is-active", active);
    node.hidden = !active;
    node.inert = !active;
    node.setAttribute("aria-hidden", String(!active));
  });
  els.hud.classList.toggle("hidden", name === "start" || name === "resume" || name === "boot");
  if (persist && name !== "resume") {
    state.screen = name;
    saveState();
  }
  if (name === "map") {
    updateMissions();
    if (pendingUnlock) {
      const btn = document.querySelector(`.mission[data-mission="${pendingUnlock}"]`);
      if (btn) {
        btn.classList.add("is-unlocking");
        setTimeout(() => btn.classList.remove("is-unlocking"), 800);
      }
      pendingUnlock = null;
    }
  }
  if (name === "m1") setupMission1();
  if (name === "m2") setupMission2();
  if (name === "greet") startGreeting();
  if (name === "m3") initM3();
  if (name === "finale") burstConfetti(90);
}

function progressValue() {
  if (state.complete) return 100;
  if (state.m3) return 75;
  if (state.m2) return 50;
  if (state.m1) return 25;
  return 0;
}

function updateProgress() {
  const value = progressValue();
  els.fill.style.width = `${value}%`;
  els.pct.textContent = `${value}%`;
  els.bar.setAttribute("aria-valuenow", String(value));
}

function updateMissions() {
  document.querySelectorAll(".mission").forEach((btn) => {
    const id = Number(btn.dataset.mission);
    const unlocked =
      id === 1 ||
      (id === 2 && state.m1) ||
      (id === 3 && state.m2);
    const done = (id === 1 && state.m1) || (id === 2 && state.m2) || (id === 3 && state.m3);
    btn.disabled = !unlocked;
    btn.classList.toggle("is-locked", !unlocked);
    btn.classList.toggle("is-done", done);
    const label = btn.querySelector(".mission__state");
    label.textContent = done ? "COMPLETE" : unlocked ? "AVAILABLE" : "LOCKED";
  });
}

function onMissionClick(event) {
  const btn = event.target.closest(".mission");
  if (!btn || btn.disabled) return;
  const id = Number(btn.dataset.mission);
  if (id === 1) showScreen("m1");
  if (id === 2) showScreen("m2");
  if (id === 3) showScreen("m3");
}

function setupMission1() {
  els.gifts.innerHTML = "";
  els.m1Feedback.textContent = "";
  if (!state.m1) {
    els.m1Next.classList.add("hidden");
    correctGift = Number.isInteger(state.giftIndex) ? state.giftIndex : Math.floor(Math.random() * 4);
    state.giftIndex = correctGift;
    saveState();
  } else {
    correctGift = Number.isInteger(state.giftIndex) ? state.giftIndex : 0;
  }
  for (let i = 0; i < 4; i += 1) {
    const btn = document.createElement("button");
    btn.className = "gift";
    btn.type = "button";
    btn.textContent = state.m1 && i === correctGift ? "✨" : "🎁";
    btn.setAttribute("aria-label", `Коробка ${i + 1}`);
    if (state.m1) {
      btn.disabled = true;
      if (i === correctGift) btn.classList.add("is-open");
    } else {
      btn.addEventListener("click", () => pickGift(i, btn));
    }
    els.gifts.appendChild(btn);
  }
  if (state.m1) {
    els.m1Feedback.textContent = "MISSION COMPLETE ✓  +100 XP";
    els.m1Next.classList.remove("hidden");
  }
}

function pickGift(index, btn) {
  if (state.m1) return;
  if (index !== correctGift) {
    btn.classList.remove("is-wrong");
    void btn.offsetWidth;
    btn.classList.add("is-wrong");
    els.m1Feedback.textContent = Math.random() > 0.5 ? "Не тута 😏" : "Давай ще раз.";
    return;
  }
  btn.classList.add("is-open");
  btn.textContent = "✨";
  document.querySelectorAll(".gift").forEach((g) => {
    g.disabled = true;
  });
  els.m1Feedback.textContent = "Умничка) ✓  +100 XP";
  els.m1Next.classList.remove("hidden");
  state.m1 = true;
  state.mission = 1;
  pendingUnlock = 2;
  saveState();
  updateProgress();
  burstConfetti(48);
}

function setupMission2() {
  m2Busy = false;
  const total = memoryCodeConfig.questions.length;
  const solved = state.m2 ? total : clampM2Solved(state.m2Solved);
  state.m2Solved = solved;
  els.m2Garage.classList.remove("is-unlocked");
  els.m2Panel.classList.remove("is-error", "hidden");
  els.m2Access.classList.add("hidden");
  els.m2Next.classList.add("hidden");
  els.m2Feedback.textContent = "";
  renderCodeCells(solved, -1);
  updateM2Progress(solved);

  if (state.m2 || solved >= total) {
    finishMemoryCode(false);
    return;
  }
  renderMemoryQuestion(solved);
}

function clampM2Solved(value) {
  const max = memoryCodeConfig.questions.length;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return 0;
  return Math.min(n, max);
}

/* Комірки коду (цифри 0-9 "прокручуються" як одометр) і поділки тахометра. */
function buildMemoryCells() {
  const questions = memoryCodeConfig.questions;
  const total = questions.length;
  els.m2Cells.style.setProperty("--n", total);
  els.m2Cells.innerHTML = questions
    .map((q) => {
      const d = Math.min(9, Math.max(0, parseInt(q.digit, 10) || 0));
      const strip = Array.from({ length: 10 }, (_, n) => `<span>${n}</span>`).join("");
      return `<div class="m2-cell" style="--d:${d}"><div class="m2-strip">${strip}</div><div class="m2-lock">${M2_LOCK}</div></div>`;
    })
    .join("");
  els.codeCells = [...els.m2Cells.querySelectorAll(".m2-cell")];

  let ticks = "";
  for (let i = 0; i <= total; i += 1) {
    const a = Math.PI * (1 - i / total);
    const c = Math.cos(a);
    const sn = Math.sin(a);
    ticks += `<line x1="${(60 + 42 * c).toFixed(1)}" y1="${(60 - 42 * sn).toFixed(1)}" x2="${(60 + 46 * c).toFixed(1)}" y2="${(60 - 46 * sn).toFixed(1)}"/>`;
  }
  document.getElementById("m2-gticks").innerHTML = ticks;
}

function updateM2Progress(solved) {
  const total = memoryCodeConfig.questions.length;
  const p = total ? solved / total : 0;
  const done = solved >= total;
  els.m2Progress.textContent = `${solved}/${total}`;
  els.m2GFill.style.strokeDashoffset = String(100 * (1 - p));
  els.m2GFill.style.opacity = solved ? "1" : "0";
  els.m2Needle.style.transform = `rotate(${-90 + 180 * p}deg)`;
  els.m2Chip.textContent = done ? "OPEN" : "LOCKED";
  els.m2Chip.classList.toggle("is-on", done);
}

function setCellOpen(cell, open, animate) {
  if (cell.classList.contains("is-open") === open) return;
  if (animate) {
    cell.classList.toggle("is-open", open);
    return;
  }
  cell.classList.add("no-anim");
  cell.classList.toggle("is-open", open);
  void cell.offsetWidth;
  cell.classList.remove("no-anim");
}

function renderCodeCells(solved, animateIndex) {
  const total = memoryCodeConfig.questions.length;
  els.codeCells.forEach((cell, index) => {
    setCellOpen(cell, index < solved, animateIndex === index);
    cell.classList.remove("is-error");
    cell.classList.toggle("is-active", index === solved && solved < total);
  });
}

function renderMemoryQuestion(index) {
  const total = memoryCodeConfig.questions.length;
  const question = memoryCodeConfig.questions[index];
  els.m2QLabel.textContent = `ПІДКАЗКА ${index + 1}/${total}`;
  els.m2Status.textContent = `ВІДКРИЙ КОМІРКУ ${index + 1}`;
  els.m2Hint.textContent = question.hint;
  els.m2Feedback.classList.remove("is-error");
  els.m2Answers.innerHTML = "";
  question.answers.forEach((label, answerIndex) => {
    const btn = document.createElement("button");
    btn.className = "m2-answer";
    btn.type = "button";
    btn.dataset.index = String(answerIndex);
    btn.innerHTML = `<span class="m2-key">${M2_KEYS[answerIndex] || answerIndex + 1}</span><span class="m2-txt"></span>`;
    btn.querySelector(".m2-txt").textContent = label;
    els.m2Answers.appendChild(btn);
  });
  els.m2Panel.classList.remove("is-enter");
  void els.m2Panel.offsetWidth;
  els.m2Panel.classList.add("is-enter");
}

function onMemoryAnswer(event) {
  const btn = event.target.closest(".m2-answer");
  if (!btn || btn.disabled || state.m2 || m2Busy) return;
  if (Date.now() - lastAnswerAt < 180) return;
  lastAnswerAt = Date.now();

  const step = clampM2Solved(state.m2Solved);
  const question = memoryCodeConfig.questions[step];
  if (!question) return;

  const chosen = Number(btn.dataset.index);
  if (chosen !== question.correctIndex) {
    const cell = els.codeCells[step];
    btn.classList.add("is-wrong");
    btn.disabled = true;
    els.m2Panel.classList.remove("is-enter", "is-error");
    void els.m2Panel.offsetWidth;
    els.m2Panel.classList.add("is-error");
    if (cell) {
      cell.classList.remove("is-error");
      void cell.offsetWidth;
      cell.classList.add("is-error");
    }
    els.m2Feedback.textContent = "Не тута 😏. Давай ще раз.";
    els.m2Feedback.classList.add("is-error");
    try { if (navigator.vibrate) navigator.vibrate(50); } catch { /* ignore */ }
    window.setTimeout(() => {
      els.m2Panel.classList.remove("is-error");
      if (cell) cell.classList.remove("is-error");
    }, 450);
    return;
  }

  m2Busy = true;
  els.m2Panel.classList.remove("is-error");
  btn.classList.add("is-right");
  els.m2Answers.querySelectorAll(".m2-answer").forEach((node) => {
    node.disabled = true;
  });
  els.m2Feedback.classList.remove("is-error");
  els.m2Feedback.textContent = "DIGIT UNLOCKED";

  const nextSolved = step + 1;
  state.m2Solved = nextSolved;
  saveState();
  renderCodeCells(nextSolved, step);
  updateM2Progress(nextSolved);

  window.setTimeout(() => {
    if (nextSolved >= memoryCodeConfig.questions.length) {
      finishMemoryCode(true);
      return;
    }
    m2Busy = false;
    els.m2Feedback.textContent = "";
    renderMemoryQuestion(nextSolved);
  }, 1100);
}

function finishMemoryCode(justCompleted) {
  const total = memoryCodeConfig.questions.length;
  m2Busy = true;
  renderCodeCells(total, -1);
  updateM2Progress(total);
  els.m2Panel.classList.add("hidden");
  els.m2Answers.innerHTML = "";
  els.m2Feedback.textContent = "";
  els.m2Garage.classList.add("is-unlocked");
  els.m2Access.classList.remove("hidden");
  els.m2Next.classList.remove("hidden");

  if (!state.m2) {
    state.m2 = true;
    state.m2Solved = total;
    state.mission = 2;
    pendingUnlock = 3;
    saveState();
    updateProgress();
  }
  if (justCompleted) burstConfetti(48);
}

function startGreeting() {
  skipTyping = false;
  els.wishes.classList.add("hidden");
  els.greetNext.classList.add("hidden");
  els.skip.classList.remove("hidden");
  typeText(birthdayConfig.greeting, els.greetText, () => {
    els.wishes.classList.remove("hidden");
    els.skip.classList.add("hidden");
    els.greetNext.classList.remove("hidden");
  });
}

function typeText(text, node, done) {
  clearInterval(typingTimer);
  node.textContent = "";
  let i = 0;
  typingTimer = setInterval(() => {
    if (skipTyping) {
      node.textContent = text;
      clearInterval(typingTimer);
      done();
      return;
    }
    node.textContent += text.charAt(i);
    i += 1;
    if (i >= text.length) {
      clearInterval(typingTimer);
      done();
    }
  }, 16);
}

async function runBootSequence() {
  showScreen("boot");
  els.bootLog.innerHTML = "";
  await animateBar(els.bootFill, els.bootPct, 80, 700);
  els.bootStatus.textContent = "INITIALIZING...";
  await tickLog("PLAYER FOUND ✓");
  await tickLog("BIRTHDAY MODE ACTIVATED ✓");
  await animateBar(els.bootFill, els.bootPct, 100, 250);
  await tickLog("QUEST READY ✓");
  await wait(220);
  showScreen("player");
}

async function runReward() {
  els.claim.classList.add("hidden");
  els.rewardDone.classList.add("hidden");
  document.getElementById("m3-status").textContent = "PREPARING YOUR REWARD...";
  const steps = [10, 30, 60, 100];
  for (const step of steps) {
    await animateBar(els.rewardFill, els.rewardPct, step, 280);
  }
  document.getElementById("m3-status").textContent = "One last thing...";
  els.rewardDone.classList.remove("hidden");
  els.claim.classList.remove("hidden");
}

function claimReward() {
  state.m3 = true;
  saveState();
  updateMissions();
  showScreen("greet");
}

function initM3() {
  els.m3Day.value = "";
  els.m3Month.value = "";
  els.m3Year.value = "";
  els.m3Feedback.textContent = "";
  els.claim.classList.add("hidden");
}

function checkM3Date() {
  const day = parseInt(els.m3Day.value) || 0;
  const month = parseInt(els.m3Month.value) || 0;
  const year = parseInt(els.m3Year.value) || 0;
  
  if (!day || !month || !year) {
    els.m3Feedback.textContent = "";
    els.claim.classList.add("hidden");
    return;
  }
  
  if (day === birthdayConfig.meetingDate.day && month === birthdayConfig.meetingDate.month && year === birthdayConfig.meetingDate.year) {
    els.m3Feedback.textContent = "✓ Правильно!";
    els.m3Feedback.style.color = birthdayConfig.accentColor;
    els.claim.classList.remove("hidden");
  } else {
    els.m3Feedback.textContent = "✗ Неправильно. Спробуй ще раз.";
    els.m3Feedback.style.color = "#ff6b6b";
    els.claim.classList.add("hidden");
  }
}

function tickLog(text) {
  return new Promise((resolve) => {
    const li = document.createElement("li");
    li.textContent = text;
    els.bootLog.appendChild(li);
    setTimeout(resolve, 280);
  });
}

function animateBar(fill, label, to, duration) {
  return new Promise((resolve) => {
    const start = performance.now();
    const from = Number(label.textContent.replace("%", "")) || 0;
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (to - from) * t);
      fill.style.width = `${value}%`;
      label.textContent = `${value}%`;
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initParticles() {
  const canvas = document.getElementById("bg-particles");
  const ctx = canvas.getContext("2d");
  const dots = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.4,
    s: Math.random() * 0.25 + 0.05
  }));

  const draw = () => {
    const { innerWidth: w, innerHeight: h } = window;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    dots.forEach((dot) => {
      dot.y -= dot.s / 180;
      if (dot.y < 0) dot.y = 1;
      ctx.beginPath();
      ctx.arc(dot.x * w, dot.y * h, dot.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  draw();
}

function burstConfetti(count) {
  const canvas = document.getElementById("fx-canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const bits = Array.from({ length: count }, () => ({
    x: canvas.width * 0.5,
    y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * -8 - 3,
    g: 0.16 + Math.random() * 0.08,
    s: 4 + Math.random() * 5,
    a: 1,
    c: Math.random() > 0.5 ? birthdayConfig.accentColor : "#ffffff"
  }));

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    bits.forEach((b) => {
      b.vy += b.g;
      b.x += b.vx;
      b.y += b.vy;
      b.a -= 0.012;
      if (b.a <= 0) return;
      alive = true;
      ctx.globalAlpha = b.a;
      ctx.fillStyle = b.c;
      ctx.fillRect(b.x, b.y, b.s, b.s * 0.6);
    });
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  tick();
}

