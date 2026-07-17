function renderVerdictCard(verdict, riskScore, verdictReason) {
  const riskClass = (riskScore || 'medium').toLowerCase();
  const verdictVal = verdict || 'Read Carefully';
  
  let verdictColor = 'border-warning bg-warning-subtle text-warning-emphasis';
  let verdictIcon = 'bi-exclamation-triangle-fill';
  
  if (verdictVal.includes('Safe') || verdictVal.includes('Proceed')) {
    verdictColor = 'border-success bg-success-subtle text-success-emphasis';
    verdictIcon = 'bi-check-circle-fill';
  } else if (verdictVal.includes('Avoid') || verdictVal.includes('Predatory') || riskClass === 'high' || riskClass === 'predatory') {
    verdictColor = 'border-danger bg-danger-subtle text-danger-emphasis';
    verdictIcon = 'bi-x-circle-fill';
  }
  
  return `
    <div class="card border-0 border-start border-4 ${verdictColor} rounded-3 shadow-sm mb-4">
      <div class="card-body p-3 d-flex align-items-start gap-3">
        <i class="bi ${verdictIcon} fs-2 align-self-center"></i>
        <div>
          <h5 class="fw-bold mb-1">Would I Sign This Loan?</h5>
          <h6 class="fw-bold mb-2">${verdictVal}</h6>
          <p class="mb-0">${verdictReason || 'Read terms carefully and clarify negotiation tips before execution.'}</p>
        </div>
      </div>
    </div>
  `;
}
