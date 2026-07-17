function renderAprBars(statedInterestRate, effectiveApr) {
  const statedNum = parseFloat(statedInterestRate) || 0;
  const effectiveNum = parseFloat(effectiveApr) || 0;
  const aprDiff = Math.max(0, effectiveNum - statedNum);
  
  const statedWidth = Math.min(100, Math.max(5, (statedNum / 30) * 100));
  const effectiveWidth = Math.min(100, Math.max(5, (effectiveNum / 30) * 100));

  if (statedNum > 0 || effectiveNum > 0) {
    return `
      <div class="mb-4">
        <h5 class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-graph-up-arrow text-primary"></i> APR Visualization
        </h5>
        <div class="row align-items-center mb-2">
          <div class="col-sm-3 fw-semibold">Stated Rate</div>
          <div class="col-sm-9">
            <div class="progress" style="height: 24px;">
              <div class="progress-bar bg-secondary" style="width: ${statedWidth}%">${statedInterestRate}</div>
            </div>
          </div>
        </div>
        <div class="row align-items-center mb-3">
          <div class="col-sm-3 fw-semibold">Effective APR</div>
          <div class="col-sm-9">
            <div class="progress" style="height: 24px;">
              <div class="progress-bar bg-primary" style="width: ${effectiveWidth}%">${effectiveApr}</div>
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
  }
  
  return `
    <div class="mb-4">
      <h5 class="d-flex align-items-center gap-2 mb-2">
        <i class="bi bi-graph-up-arrow text-primary"></i> Interest Details
      </h5>
      <div class="row">
        <div class="col-6"><strong>Stated Rate:</strong> ${statedInterestRate}</div>
        <div class="col-6"><strong>Effective APR:</strong> ${effectiveApr}</div>
      </div>
    </div>
  `;
}
