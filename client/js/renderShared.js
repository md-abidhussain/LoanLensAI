function renderLoanReport(container, data) {
  const riskClass = (data.risk_score || 'medium').toLowerCase();
  
  let riskBadgeColor = 'bg-warning text-dark';
  let healthBarColor = 'bg-warning';
  let healthTextColor = 'text-warning';
  
  if (riskClass === 'low') {
    riskBadgeColor = 'bg-success text-white';
    healthBarColor = 'bg-success';
    healthTextColor = 'text-success';
  } else if (riskClass === 'high') {
    riskBadgeColor = 'bg-danger text-white';
    healthBarColor = 'bg-danger';
    healthTextColor = 'text-danger';
  } else if (riskClass === 'predatory') {
    riskBadgeColor = 'bg-dark text-white';
    healthBarColor = 'bg-dark';
    healthTextColor = 'text-dark';
  }

  let verdictColor = 'border-warning bg-warning-subtle text-warning-emphasis';
  let verdictIcon = 'bi-exclamation-triangle-fill';
  const verdictVal = (data.verdict || 'Read Carefully');
  
  if (verdictVal.includes('Safe') || verdictVal.includes('Proceed')) {
    verdictColor = 'border-success bg-success-subtle text-success-emphasis';
    verdictIcon = 'bi-check-circle-fill';
  } else if (verdictVal.includes('Avoid') || verdictVal.includes('Predatory') || riskClass === 'high') {
    verdictColor = 'border-danger bg-danger-subtle text-danger-emphasis';
    verdictIcon = 'bi-x-circle-fill';
  }

  const statedNum = parseFloat(data.stated_interest_rate) || 0;
  const effectiveNum = parseFloat(data.effective_apr) || 0;
  const aprDiff = Math.max(0, effectiveNum - statedNum);
  
  const statedWidth = Math.min(100, Math.max(5, (statedNum / 30) * 100));
  const effectiveWidth = Math.min(100, Math.max(5, (effectiveNum / 30) * 100));

  let aprComparisonHtml = '';
  if (statedNum > 0 || effectiveNum > 0) {
    aprComparisonHtml = `
      <div class="mb-4">
        <h5 class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-graph-up-arrow text-primary"></i> APR Visualization
        </h5>
        <div class="row align-items-center mb-2">
          <div class="col-sm-3 fw-semibold">Stated Rate</div>
          <div class="col-sm-9">
            <div class="progress" style="height: 24px;">
              <div class="progress-bar bg-secondary" style="width: ${statedWidth}%">${data.stated_interest_rate}</div>
            </div>
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-sm-3 fw-semibold">Effective APR</div>
          <div class="col-sm-9">
            <div class="progress" style="height: 24px;">
              <div class="progress-bar bg-primary" style="width: ${effectiveWidth}%">${data.effective_apr}</div>
            </div>
          </div>
        </div>
        ${aprDiff > 0 ? `
          <div class="alert alert-warning py-2 px-3 d-inline-flex align-items-center gap-2 rounded border-0 shadow-sm mt-1">
            <i class="bi bi-arrow-up-right-circle-fill text-warning"></i>
            <span>Interest gap is <strong>${aprDiff.toFixed(2)}%</strong> due to hidden calculations</span>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    aprComparisonHtml = `
      <div class="mb-4">
        <h5 class="d-flex align-items-center gap-2 mb-2">
          <i class="bi bi-graph-up-arrow text-primary"></i> Interest Details
        </h5>
        <div class="row">
          <div class="col-6"><strong>Stated Rate:</strong> ${data.stated_interest_rate}</div>
          <div class="col-6"><strong>Effective APR:</strong> ${data.effective_apr}</div>
        </div>
      </div>
    `;
  }

  const flags = data.red_flags || [];
  const topFlags = flags.slice(0, 3);
  
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

  let redFlagsHtml = '';
  if (flags.length > 0) {
    redFlagsHtml = `
      <div class="mb-4">
        <h5 class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-exclamation-octagon-fill text-danger"></i> Red Flags List
        </h5>
        <div class="d-flex flex-column gap-3">
          ${flags.map(f => {
            const sev = (f.severity || 'medium').toLowerCase();
            let borderCol = 'border-warning';
            let bgCol = 'bg-warning-subtle';
            if (sev === 'high') {
              borderCol = 'border-danger';
              bgCol = 'bg-danger-subtle';
            } else if (sev === 'low') {
              borderCol = 'border-success';
              bgCol = 'bg-success-subtle';
            }
            return `
              <div class="card border-0 border-start border-4 ${borderCol} shadow-sm rounded-3">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge ${sev === 'high' ? 'bg-danger' : sev === 'low' ? 'bg-success' : 'bg-warning text-dark'} text-capitalize">${sev} Severity</span>
                  </div>
                  <p class="mb-2 font-monospace bg-light p-2 rounded border border-light" style="font-size: 0.9rem;">
                    <strong>Clause:</strong> "${f.clause}"
                  </p>
                  <p class="mb-0 text-muted"><strong>Explanation:</strong> ${f.explanation}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else {
    redFlagsHtml = `
      <div class="mb-4 text-center py-4 bg-light rounded shadow-sm border border-light">
        <i class="bi bi-shield-check text-success fs-1"></i>
        <p class="mt-2 mb-0 text-muted">No red flags detected in this document.</p>
      </div>
    `;
  }

  const tips = data.negotiation_tips || [];
  let tipsHtml = '';
  if (tips.length > 0) {
    tipsHtml = `
      <div class="mb-4">
        <h5 class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-patch-question-fill text-info"></i> AI Suggestions (What to Negotiate)
        </h5>
        <div class="d-flex flex-column gap-2">
          ${tips.map(t => `
            <div class="card border-0 border-start border-3 border-info shadow-xs rounded-3 bg-info-subtle">
              <div class="card-body p-3 text-info-emphasis">
                <i class="bi bi-lightbulb-fill text-info me-1"></i> ${t}
              </div>
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

    <div class="card border-0 border-start border-4 ${verdictColor} rounded-3 shadow-sm mb-4">
      <div class="card-body p-3 d-flex align-items-start gap-3">
        <i class="bi ${verdictIcon} fs-2 align-self-center"></i>
        <div>
          <h5 class="fw-bold mb-1">Would I Sign This Loan?</h5>
          <h6 class="fw-bold mb-2">${verdictVal}</h6>
          <p class="mb-0">${data.verdict_reason || 'Read terms carefully and clarify negotiation tips before execution.'}</p>
        </div>
      </div>
    </div>

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

    ${aprComparisonHtml}
    ${topReasonsHtml}
    ${tipsHtml}
    ${redFlagsHtml}
  `;
}
