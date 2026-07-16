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
const healthMeterText = document.getElementById('healthMeterText');
const healthScoreText = document.getElementById('healthScoreText');
const topReasonsList = document.getElementById('topReasonsList');
const negotiationTipsList = document.getElementById('negotiationTipsList');

scanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return showError('please select a file first');
  if (file.size > 5 * 1024 * 1024) return showError('file is too large, max 5MB');

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) return showError('invalid file format');

  showLoading(true);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/scan', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'error during scan');
    renderResult(data);
  } catch (err) {
    showError(err.message + ', please try again');
  } finally {
    showLoading(false);
  }
});

function showLoading(isLoading) {
  loadingSpinner.classList.toggle('d-none', !isLoading);
  if (isLoading) {
    resultCard.classList.add('d-none');
    errorMessage.classList.add('d-none');
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
  healthMeterText.textContent = data.health_meter;
  healthScoreText.textContent = data.health_score;

  const riskClass = (data.risk_score || 'medium').toLowerCase();
  riskScoreBadge.textContent = data.risk_score;
  riskScoreBadge.className = 'badge rounded-pill px-3 py-2 fs-6';
  
  const healthCard = document.getElementById('healthCard');
  healthCard.className = 'card border-0 rounded-3 p-3 mb-4 text-center shadow-sm';

  if (riskClass === 'low') {
    riskScoreBadge.classList.add('bg-success', 'text-white');
    healthCard.classList.add('bg-success-subtle', 'text-success-emphasis');
    healthMeterText.className = 'font-monospace fs-3 text-success fw-bold';
  } else if (riskClass === 'medium') {
    riskScoreBadge.classList.add('bg-warning', 'text-dark');
    healthCard.classList.add('bg-warning-subtle', 'text-warning-emphasis');
    healthMeterText.className = 'font-monospace fs-3 text-warning fw-bold';
  } else if (riskClass === 'high') {
    riskScoreBadge.classList.add('bg-danger', 'text-white');
    healthCard.classList.add('bg-danger-subtle', 'text-danger-emphasis');
    healthMeterText.className = 'font-monospace fs-3 text-danger fw-bold';
  } else {
    riskScoreBadge.classList.add('bg-dark', 'text-white');
    healthCard.classList.add('bg-secondary-subtle', 'text-dark-emphasis');
    healthMeterText.className = 'font-monospace fs-3 text-dark fw-bold';
  }

  topReasonsList.innerHTML = '';
  const topFlags = (data.red_flags || []).slice(0, 3);
  if (topFlags.length === 0) {
    topReasonsList.innerHTML = '<li class="text-muted border-start border-3 border-secondary bg-light p-2 mb-2 rounded">• No major risk factors</li>';
  } else {
    topFlags.forEach(f => {
      const li = document.createElement('li');
      li.className = 'border-start border-3 border-danger bg-light p-2 mb-2 rounded fw-semibold';
      li.textContent = `• ${f.explanation}`;
      topReasonsList.appendChild(li);
    });
  }

  negotiationTipsList.innerHTML = '';
  if (!data.negotiation_tips || data.negotiation_tips.length === 0) {
    negotiationTipsList.innerHTML = '<li class="list-group-item text-muted">no suggestions</li>';
  } else {
    data.negotiation_tips.forEach(t => {
      const li = document.createElement('li');
      li.className = 'list-group-item border-start border-3 border-info bg-light my-1 rounded shadow-sm';
      li.textContent = t;
      negotiationTipsList.appendChild(li);
    });
  }

  redFlagsList.innerHTML = '';
  if (!data.red_flags || data.red_flags.length === 0) {
    redFlagsList.innerHTML = '<li class="list-group-item text-muted">no red flags</li>';
  } else {
    data.red_flags.forEach(f => {
      const item = document.createElement('li');
      const severity = f.severity.toLowerCase();
      item.className = `list-group-item red-flag-item my-2 shadow-sm rounded red-flag-${severity}`;
      item.innerHTML = `
        <strong class="text-capitalize">${f.severity} Severity</strong>
        <p class="mb-1 mt-2"><strong>Clause:</strong> "${f.clause}"</p>
        <p class="mb-0"><strong>Details:</strong> ${f.explanation}</p>
      `;
      redFlagsList.appendChild(item);
    });
  }
  resultCard.classList.remove('d-none');
  errorMessage.classList.add('d-none');
}
