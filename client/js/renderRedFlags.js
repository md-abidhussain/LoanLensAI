function sortRedFlags(flags) {
  const priority = { high: 3, medium: 2, low: 1 };
  return [...flags].sort((a, b) => {
    const sevA = (a.severity || 'medium').toLowerCase();
    const sevB = (b.severity || 'medium').toLowerCase();
    return (priority[sevB] || 0) - (priority[sevA] || 0);
  });
}

function renderRedFlags(flags) {
  if (!flags || flags.length === 0) {
    return `
      <div class="mb-4 text-center py-4 bg-light rounded shadow-sm border border-light">
        <i class="bi bi-shield-check text-success fs-1"></i>
        <p class="mt-2 mb-0 text-muted">No red flags detected in this document.</p>
      </div>
    `;
  }
  
  const sorted = sortRedFlags(flags);
  return `
    <div class="mb-4">
      <h5 class="d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-exclamation-octagon-fill text-danger"></i> Red Flags List
      </h5>
      <div class="d-flex flex-column gap-3">
        ${sorted.map(f => {
          const sev = (f.severity || 'medium').toLowerCase();
          let borderCol = 'border-warning-subtle';
          let bgBadge = 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
          if (sev === 'high') {
            borderCol = 'border-danger-subtle';
            bgBadge = 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
          } else if (sev === 'low') {
            borderCol = 'border-success-subtle';
            bgBadge = 'bg-success-subtle text-success-emphasis border border-success-subtle';
          }
          return `
            <div class="card border-0 border-start border-4 ${borderCol} shadow-sm rounded-3">
              <div class="card-body p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="badge ${bgBadge} text-capitalize">${sev} Severity</span>
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
}
