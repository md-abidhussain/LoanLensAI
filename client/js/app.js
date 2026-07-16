const scanForm = document.getElementById('scanForm');
const fileInput = document.getElementById('fileInput');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultCard = document.getElementById('resultCard');
const errorMessage = document.getElementById('errorMessage');
const dropZone = document.getElementById('dropZone');
const browseBtn = document.getElementById('browseBtn');
const fileChip = document.getElementById('fileChip');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const removeFileBtn = document.getElementById('removeFileBtn');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const reportContent = document.getElementById('reportContent');

let currentFile = null;

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeIcon = document.getElementById('darkModeIcon');

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  darkModeIcon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
  darkModeToggle.className = theme === 'dark' ? 'btn btn-outline-warning btn-sm' : 'btn btn-outline-light btn-sm';
  localStorage.setItem('theme', theme);
}

darkModeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

// File Selection Handlers
browseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    selectFile(e.target.files[0]);
  }
});

function selectFile(file) {
  if (file.size > 5 * 1024 * 1024) {
    showError('file is too large, max 5MB');
    return;
  }
  currentFile = file;
  fileNameDisplay.textContent = file.name;
  fileChip.classList.remove('d-none');
  dropZone.classList.add('d-none');
}

removeFileBtn.addEventListener('click', () => {
  currentFile = null;
  fileInput.value = '';
  fileChip.classList.add('d-none');
  dropZone.classList.remove('d-none');
});

// Drag & Drop Handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) {
    selectFile(e.dataTransfer.files[0]);
  }
});

// Try Sample Documents
document.querySelectorAll('.sample-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const filename = btn.getAttribute('data-sample');
    try {
      showLoading(true);
      const response = await fetch(`/assets/${filename}`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });
      selectFile(file);
      await uploadFile(file);
    } catch (err) {
      showError('failed to load sample file');
      showLoading(false);
    }
  });
});

// Progress Checklist Animation
const steps = ['upload', 'read', 'extract', 'type', 'apr', 'risks', 'tips', 'report'];
let stepIndex = 0;
let stepTimer = null;

function animateSteps() {
  stepIndex = 0;
  steps.forEach(s => {
    const el = document.getElementById(`step-${s}`);
    el.className = 'process-step py-1 d-flex align-items-center gap-2';
    el.querySelector('i').className = 'bi bi-circle text-muted';
  });
  setStepState(0, 'active');
  stepTimer = setInterval(() => {
    if (stepIndex < steps.length - 1) {
      setStepState(stepIndex, 'completed');
      stepIndex++;
      setStepState(stepIndex, 'active');
    }
  }, 400);
}

function setStepState(idx, state) {
  const el = document.getElementById(`step-${steps[idx]}`);
  if (!el) return;
  if (state === 'active') {
    el.className = 'process-step py-1 d-flex align-items-center gap-2 active';
    el.querySelector('i').className = 'bi bi-arrow-right-circle-fill text-primary';
  } else {
    el.className = 'process-step py-1 d-flex align-items-center gap-2 completed';
    el.querySelector('i').className = 'bi bi-check-circle-fill text-success';
  }
}

function finishSteps() {
  clearInterval(stepTimer);
  steps.forEach((_, idx) => setStepState(idx, 'completed'));
}

// Upload & Scan API Handler
scanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentFile) return showError('please select or drop a file first');
  showLoading(true);
  await uploadFile(currentFile);
});

async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch('/api/scan', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'error during scan');
    finishSteps();
    setTimeout(() => {
      renderLoanReport(reportContent, data);
      resultCard.classList.remove('d-none');
      showLoading(false);
    }, 400);
  } catch (err) {
    showError(err.message + ', please try again');
    showLoading(false);
  }
}

function showLoading(isLoading) {
  loadingSpinner.classList.toggle('d-none', !isLoading);
  if (isLoading) {
    resultCard.classList.add('d-none');
    errorMessage.classList.add('d-none');
    animateSteps();
  } else {
    clearInterval(stepTimer);
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('d-none');
  resultCard.classList.add('d-none');
}

downloadReportBtn.addEventListener('click', () => window.print());
