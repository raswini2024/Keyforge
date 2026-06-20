const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
};

const lengthInput = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");
const output = document.getElementById("output");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const copyLabel = document.getElementById("copyLabel");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

const checkboxes = {
  uppercase: document.getElementById("uppercase"),
  lowercase: document.getElementById("lowercase"),
  numbers: document.getElementById("numbers"),
  symbols: document.getElementById("symbols")
};

let currentPassword = "";
let scrambleTimer = null;

function activeKeys() {
  return Object.keys(checkboxes).filter((key) => checkboxes[key].checked);
}

function buildPool(keys) {
  return keys.map((key) => CHARSETS[key]).join("");
}

function randomChar(pool) {
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function generatePassword() {
  const keys = activeKeys();
  const length = parseInt(lengthInput.value, 10);
  const pool = buildPool(keys);

  // Guarantee at least one character from each selected set
  let chars = keys.map((key) => randomChar(CHARSETS[key]));
  while (chars.length < length) {
    chars.push(randomChar(pool));
  }
  // Shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function scoreStrength(password, keys) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (keys.length >= 3) score++;
  if (keys.length === 4) score++;
  return score; // 0 to 5
}

function updateStrength(password, keys) {
  const score = scoreStrength(password, keys);
  const pct = Math.min(100, (score / 5) * 100);
  strengthFill.style.width = pct + "%";

  let label = "Weak";
  let color = "var(--weak)";
  if (score >= 4) {
    label = "Strong";
    color = "var(--strong)";
  } else if (score >= 2) {
    label = "Medium";
    color = "var(--mid)";
  }
  strengthFill.style.background = color;
  strengthLabel.textContent = label;
}

function scrambleReveal(finalPassword) {
  if (scrambleTimer) clearInterval(scrambleTimer);
  const pool = buildPool(activeKeys()) || CHARSETS.lowercase;
  const frames = 10;
  let frame = 0;

  scrambleTimer = setInterval(() => {
    frame++;
    let display = "";
    for (let i = 0; i < finalPassword.length; i++) {
      const settled = frame / frames > i / finalPassword.length;
      display += settled ? finalPassword[i] : randomChar(pool);
    }
    output.textContent = display;
    if (frame >= frames) {
      clearInterval(scrambleTimer);
      output.textContent = finalPassword;
    }
  }, 35);
}

function spawnSparks() {
  const rect = generateBtn.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top;
  const count = 10;

  for (let i = 0; i < count; i++) {
    const spark = document.createElement("span");
    spark.className = "spark";
    const angle = (Math.random() * Math.PI) - Math.PI / 2 - Math.PI / 2;
    const distance = 30 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 10;
    spark.style.left = (originX + (Math.random() * rect.width - rect.width / 2)) + "px";
    spark.style.top = originY + "px";
    spark.style.setProperty("--dx", dx + "px");
    spark.style.setProperty("--dy", dy + "px");
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 600);
  }
}

function handleGenerate() {
  currentPassword = generatePassword();
  scrambleReveal(currentPassword);
  updateStrength(currentPassword, activeKeys());
  copyLabel.textContent = "Copy";
  spawnSparks();
}

function ensureAtLeastOneChecked(changedBox) {
  const anyChecked = activeKeys().length > 0;
  if (!anyChecked) {
    changedBox.checked = true;
  }
}

lengthInput.addEventListener("input", () => {
  lengthValue.textContent = lengthInput.value;
});

lengthInput.addEventListener("change", handleGenerate);

Object.values(checkboxes).forEach((box) => {
  box.addEventListener("change", () => {
    ensureAtLeastOneChecked(box);
    handleGenerate();
  });
});

generateBtn.addEventListener("click", handleGenerate);

copyBtn.addEventListener("click", async () => {
  if (!currentPassword) return;
  try {
    await navigator.clipboard.writeText(currentPassword);
    copyLabel.textContent = "Copied!";
  } catch (err) {
    copyLabel.textContent = "Press Ctrl+C";
  }
  setTimeout(() => {
    copyLabel.textContent = "Copy";
  }, 1500);
});

// Initial generation on load
handleGenerate();
