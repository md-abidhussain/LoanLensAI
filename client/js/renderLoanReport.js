function renderLoanReport(container, data) {
  const riskClass = (data.risk_score || 'medium').toLowerCase();
  
  let riskBadgeColor = 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
  let healthBarColor = 'bg-warning';
  let healthTextColor = 'text-warning';
  
  if (riskClass === 'low') {
    riskBadgeColor = 'bg-success-subtle text-success-emphasis border border-success-subtle';
    healthBarColor = 'bg-success';
    healthTextColor = 'text-success';
  } else if (riskClass === 'high') {
    riskBadgeColor = 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
    healthBarColor = 'bg-danger';
    healthTextColor = 'text-danger';
  } else if (riskClass === 'predatory') {
    riskBadgeColor = 'bg-dark-subtle text-dark-emphasis border border-dark-subtle';
    healthBarColor = 'bg-dark';
    healthTextColor = 'text-dark';
  }
  
  const sortedFlags = sortRedFlags(data.red_flags || []);
  const topFlags = sortedFlags.slice(0, 3);
  
  let topReasonsHtml = '';
  if (topFlags.length > 0) {
    topReasonsHtml = `
      <div class="mb-4">
        <h5 class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-list-stars text-danger"></i> Top Reasons For Health Score
        </h5>
        <div class="d-flex flex-column gap-2">
          ${topFlags.map(f => `
            <div class="border-start border-3 border-danger bg-light p-2 rounded shadow-xs">
              <span class="fw-semibold text-danger">${f.explanation}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center border-bottom pb-3 mb-4 gap-2">
      <div>
        <h3 class="fw-bold mb-1">${data.filename || 'Loan Analysis'}</h3>
        <span class="badge bg-primary fs-6 px-3 py-2 rounded-pill shadow-xs">
          <i class="bi bi-file-earmark-text-fill"></i> ${data.loan_type || 'Other Loan'}
        </span>
      </div>
      <div>
        <span class="badge ${riskBadgeColor} fs-6 px-3 py-2 rounded-pill shadow-xs">
          Risk: ${data.risk_score}
        </span>
      </div>
    </div>

    ${renderVerdictCard(data.verdict, data.risk_score, data.verdict_reason)}

    <div class="card border-0 bg-light p-3 mb-4 rounded-3 shadow-sm">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="d-flex align-items-center gap-2 mb-0">
          <i class="bi bi-heart-pulse-fill text-primary"></i> Loan Health
        </h5>
        <span class="fw-bold fs-5 ${healthTextColor}">${data.health_score || 100}%</span>
      </div>
      <div class="progress" style="height: 12px; background-color: #e9ecef;">
        <div class="progress-bar ${healthBarColor}" role="progressbar" style="width: ${data.health_score || 100}%;"></div>
      </div>
    </div>

    <div class="mb-4">
      <h5 class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-card-text text-primary"></i> Plain-Language Summary
      </h5>
      <p class="text-muted leading-relaxed">${data.summary}</p>
    </div>

    ${renderAprBars(data.stated_interest_rate, data.effective_apr)}
    ${topReasonsHtml}
    ${renderNegotiationTips(data.negotiation_tips)}
    ${renderRedFlags(data.red_flags)}
  `;
}
