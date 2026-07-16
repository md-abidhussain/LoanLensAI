const scanForm = document.getElementById('scanForm');
const fileInput = document.getElementById('fileInput');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultCard = document.getElementById('resultCard');
const errorMessage = document.getElementById('errorMessage');

const summaryText = document.getElementById('summaryText');
const interestRateText = document.getElementById('interestRateText');
const effectiveAprText = document.getElementById('effectiveAprText');
const riskScoreBadge = document.getElementById('riskScoreBadge');
const redFlagsList = document.getElementById('redFlagsList');

scanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return showError('please select a file first');
  if (file.size > 5 * 1024 * 1024) return showError('file is too large, maximum size is 5MB');

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) return showError('invalid file format, upload pdf or image');

  showLoading(true);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/scan', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'unexpected error occurred during scan');
    renderResult(data);
  } catch (err) {
    showError(err.message + ', verify your file/key and try again');
  } finally {
    showLoading(false);
  }
});

function showLoading(isLoading) {
  if (isLoading) {
    loadingSpinner.classList.remove('d-none');
    resultCard.classList.add('d-none');
    errorMessage.classList.add('d-none');
  } else {
    loadingSpinner.classList.add('d-none');
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('d-none');
  resultCard.classList.add('d-none');
}

function renderResult(data) {
  summaryText.textContent = data.summary;
  interestRateText.textContent = data.stated_interest_rate;
  effectiveAprText.textContent = data.effective_apr;
  
  riskScoreBadge.textContent = data.risk_score;
  riskScoreBadge.className = `badge p-2 fs-6 risk-${data.risk_score.toLowerCase()}`;

  redFlagsList.innerHTML = '';
  if (!data.red_flags || data.red_flags.length === 0) {
    redFlagsList.innerHTML = '<li class="list-group-item text-muted">no red flags</li>';
  } else {
    data.red_flags.forEach(flag => {
      const item = document.createElement('li');
      item.className = `list-group-item red-flag-item my-2 shadow-sm rounded red-flag-${flag.severity.toLowerCase()}`;
      item.innerHTML = `
        <strong class="text-capitalize">${flag.severity} Severity</strong>
        <p class="mb-1 mt-2"><strong>Clause:</strong> "${flag.clause}"</p>
        <p class="mb-0"><strong>Details:</strong> ${flag.explanation}</p>
      `;
      redFlagsList.appendChild(item);
    });
  }
  resultCard.classList.remove('d-none');
  errorMessage.classList.add('d-none');
}
