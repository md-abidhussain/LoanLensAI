const scansGrid = document.getElementById('scansGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const riskFilter = document.getElementById('riskFilter');

const statTotal = document.getElementById('statTotal');
const statLow = document.getElementById('statLow');
const statMedium = document.getElementById('statMedium');
const statHigh = document.getElementById('statHigh');
const statAvgHealth = document.getElementById('statAvgHealth');

const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));
const modalTitle = document.getElementById('modalTitle');
const modalDetailContent = document.getElementById('modalDetailContent');
const modalPrintBtn = document.getElementById('modalPrintBtn');

let allScans = [];

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

document.addEventListener('DOMContentLoaded', fetchHistory);
searchInput.addEventListener('input', filterAndRender);
riskFilter.addEventListener('change', filterAndRender);

async function fetchHistory() {
  try {
    const response = await fetch('/api/scans');
    allScans = await response.json();
    if (!response.ok) throw new Error(allScans.error || 'failed to load history');
    calculateStats(allScans);
    filterAndRender();
  } catch (err) {
    scansGrid.innerHTML = `<div class="col-12 text-center text-danger py-4">${err.message}</div>`;
  }
}

function calculateStats(scans) {
  statTotal.textContent = scans.length;
  let low = 0;
  let med = 0;
  let high = 0;
  let totalHealth = 0;

  scans.forEach(s => {
    const r = (s.risk_score || 'medium').toLowerCase();
    if (r === 'low') low++;
    else if (r === 'medium') med++;
    else high++;
    totalHealth += s.health_score || 0;
  });

  statLow.textContent = low;
  statMedium.textContent = med;
  statHigh.textContent = high;
  
  const avg = scans.length > 0 ? Math.round(totalHealth / scans.length) : 0;
  statAvgHealth.textContent = `${avg}%`;
}

function filterAndRender() {
  const searchVal = searchInput.value.toLowerCase().trim();
  const filterVal = riskFilter.value.toLowerCase();

  const filtered = allScans.filter(s => {
    const matchesSearch = s.filename.toLowerCase().includes(searchVal);
    const matchesRisk = filterVal === 'all' || (s.risk_score || '').toLowerCase() === filterVal;
    return matchesSearch && matchesRisk;
  });

  renderCards(filtered);
}

function renderCards(scans) {
  scansGrid.innerHTML = '';
  if (scans.length === 0) {
    emptyState.classList.remove('d-none');
    return;
  }
  emptyState.classList.add('d-none');

  scans.forEach(s => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    
    const rClass = (s.risk_score || 'medium').toLowerCase();
    let badgeColor = 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    if (rClass === 'low') {
      badgeColor = 'bg-success-subtle text-success-emphasis border border-success-subtle';
    } else if (rClass === 'high') {
      badgeColor = 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
    } else if (rClass === 'predatory') {
      badgeColor = 'bg-dark-subtle text-dark-emphasis border border-dark-subtle';
    }

    const formattedDate = new Date(s.created_at).toLocaleDateString();
    
    col.innerHTML = `
      <div class="card card-premium h-100 p-3 bg-white">
        <div class="card-body p-0 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge ${badgeColor} rounded-pill px-2 py-1" style="font-size: 0.75rem;">
                Risk: ${s.risk_score}
              </span>
              <small class="text-muted">${formattedDate}</small>
            </div>
            <h5 class="fw-bold mb-2 text-truncate">${s.filename}</h5>
            <div class="mb-3 d-flex flex-wrap gap-1">
              <span class="badge bg-light text-secondary border px-2 py-1" style="font-size: 0.75rem;">
                <i class="bi bi-file-earmark-text"></i> ${s.loan_type || 'Other Loan'}
              </span>
              <span class="badge bg-light text-secondary border px-2 py-1" style="font-size: 0.75rem;">
                <i class="bi bi-check-circle-fill"></i> ${s.verdict || 'Read Carefully'}
              </span>
            </div>
            <div class="mb-3 bg-light p-2 rounded text-center">
              <small class="text-muted d-block" style="font-size: 0.75rem;">Health Score</small>
              <strong class="text-primary">${s.health_score || 0}%</strong>
            </div>
          </div>
          <button class="btn btn-outline-primary w-100 rounded-pill btn-sm mt-3 view-btn" data-id="${s.id}">
            View Report
          </button>
        </div>
      </div>
    `;
    scansGrid.appendChild(col);
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      showScanDetail(id);
    });
  });
}

async function showScanDetail(id) {
  try {
    const response = await fetch(`/api/scans/${id}`);
    const scan = await response.json();
    if (!response.ok) throw new Error(scan.error || 'failed to load details');

    modalTitle.textContent = scan.filename;
    renderLoanReport(modalDetailContent, scan);
    detailModal.show();
  } catch (err) {
    alert('error fetching details: ' + err.message);
  }
}

modalPrintBtn.addEventListener('click', () => window.print());
