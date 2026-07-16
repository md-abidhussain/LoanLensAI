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
  resultCard.classList.add('d-none');
  errorMessage.classList.add('d-none');
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
  riskScoreBadge.textContent = data.risk_score;
  riskScoreBadge.className = `badge p-2 fs-6 risk-${data.risk_score.toLowerCase()}`;

  healthMeterText.className = 'font-monospace fs-4';
  const riskClass = data.risk_score.toLowerCase();
  if (riskClass === 'low') healthMeterText.classList.add('text-success');
  else if (riskClass === 'medium') healthMeterText.classList.add('text-warning');
  else if (riskClass === 'high') healthMeterText.classList.add('text-danger');
  else healthMeterText.classList.add('text-dark');

  topReasonsList.innerHTML = '';
  const topFlags = (data.red_flags || []).slice(0, 3);
  if (topFlags.length === 0) {
    topReasonsList.innerHTML = '<li class="text-muted">• No major risk reasons</li>';
  } else {
    topFlags.forEach(f => {
      const li = document.createElement('li');
      li.className = 'fw-semibold py-1';
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
      li.className = 'list-group-item list-group-item-info my-1 rounded border-0 shadow-sm';
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
      item.className = `list-group-item red-flag-item my-2 shadow-sm rounded red-flag-${f.severity.toLowerCase()}`;
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
