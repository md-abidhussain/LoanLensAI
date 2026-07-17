function renderNegotiationTips(tips) {
  if (!tips || tips.length === 0) return '';
  return `
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
