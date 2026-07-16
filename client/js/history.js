const scanHistoryBody = document.getElementById('scanHistoryBody');
const detailModal = new bootstrap.Modal(document.getElementById('detailModal'));

const modalTitle = document.getElementById('modalTitle');
const modalSummary = document.getElementById('modalSummary');
const modalRate = document.getElementById('modalRate');
const modalApr = document.getElementById('modalApr');
const modalRisk = document.getElementById('modalRisk');
const modalRedFlags = document.getElementById('modalRedFlags');
const modalHealthMeter = document.getElementById('modalHealthMeter');
const modalHealthScore = document.getElementById('modalHealthScore');
const modalTopReasons = document.getElementById('modalTopReasons');
const modalNegotiationTips = document.getElementById('modalNegotiationTips');

document.addEventListener('DOMContentLoaded', fetchHistory);

async function fetchHistory() {
  try {
    const response = await fetch('/api/scans');
    const scans = await response.json();
    if (!response.ok) throw new Error(scans.error || 'failed to load history');
    renderHistoryTable(scans);
  } catch (err) {
    scanHistoryBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">${err.message}</td></tr>`;
  }
}

function renderHistoryTable(scans) {
  scanHistoryBody.innerHTML = '';
  if (scans.length === 0) {
    scanHistoryBody.innerHTML = '<tr><td colspan="4" class="text-center">no scan history found</td></tr>';
    return;
  }

  scans.forEach(scan => {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', () => showScanDetail(scan.id));
    
    const formattedDate = new Date(scan.created_at).toLocaleString();
    tr.innerHTML = `
      <td>${scan.id}</td>
      <td>${scan.filename}</td>
      <td><span class="badge risk-${scan.risk_score.toLowerCase()}">${scan.risk_score}</span></td>
      <td>${formattedDate}</td>
    `;
    scanHistoryBody.appendChild(tr);
  });
}

async function showScanDetail(id) {
  try {
    const response = await fetch(`/api/scans/${id}`);
    const scan = await response.json();
    if (!response.ok) throw new Error(scan.error || 'failed to load details');

    modalTitle.textContent = scan.filename;
    modalSummary.textContent = scan.summary;
    modalRate.textContent = scan.stated_interest_rate;
    modalApr.textContent = scan.effective_apr;
    modalHealthMeter.textContent = scan.health_meter;
    modalHealthScore.textContent = scan.health_score;
    
    const riskClass = (scan.risk_score || 'medium').toLowerCase();
    modalRisk.textContent = scan.risk_score;
    modalRisk.className = 'badge rounded-pill px-3 py-2 fs-6';
    
    const modalHealthCard = document.getElementById('modalHealthCard');
    modalHealthCard.className = 'card border-0 rounded-3 p-3 mb-4 text-center shadow-sm';

    if (riskClass === 'low') {
      modalRisk.classList.add('bg-success', 'text-white');
      modalHealthCard.classList.add('bg-success-subtle', 'text-success-emphasis');
      modalHealthMeter.className = 'font-monospace fs-3 text-success fw-bold';
    } else if (riskClass === 'medium') {
      modalRisk.classList.add('bg-warning', 'text-dark');
      modalHealthCard.classList.add('bg-warning-subtle', 'text-warning-emphasis');
      modalHealthMeter.className = 'font-monospace fs-3 text-warning fw-bold';
    } else if (riskClass === 'high') {
      modalRisk.classList.add('bg-danger', 'text-white');
      modalHealthCard.classList.add('bg-danger-subtle', 'text-danger-emphasis');
      modalHealthMeter.className = 'font-monospace fs-3 text-danger fw-bold';
    } else {
      modalRisk.classList.add('bg-dark', 'text-white');
      modalHealthCard.classList.add('bg-secondary-subtle', 'text-dark-emphasis');
      modalHealthMeter.className = 'font-monospace fs-3 text-dark fw-bold';
    }

    modalTopReasons.innerHTML = '';
    const topFlags = (scan.red_flags || []).slice(0, 3);
    if (topFlags.length === 0) {
      modalTopReasons.innerHTML = '<li class="text-muted border-start border-3 border-secondary bg-light p-2 mb-2 rounded">• No major risk factors</li>';
    } else {
      topFlags.forEach(f => {
        const li = document.createElement('li');
        li.className = 'border-start border-3 border-danger bg-light p-2 mb-2 rounded fw-semibold';
        li.textContent = `• ${f.explanation}`;
        modalTopReasons.appendChild(li);
      });
    }

    modalNegotiationTips.innerHTML = '';
    if (!scan.negotiation_tips || scan.negotiation_tips.length === 0) {
      modalNegotiationTips.innerHTML = '<li class="list-group-item text-muted">no suggestions</li>';
    } else {
      scan.negotiation_tips.forEach(t => {
        const li = document.createElement('li');
        li.className = 'list-group-item border-start border-3 border-info bg-light my-1 rounded shadow-sm';
        li.textContent = t;
        modalNegotiationTips.appendChild(li);
      });
    }

    modalRedFlags.innerHTML = '';
    if (!scan.red_flags || scan.red_flags.length === 0) {
      modalRedFlags.innerHTML = '<li class="list-group-item text-muted">no red flags</li>';
    } else {
      scan.red_flags.forEach(flag => {
        const item = document.createElement('li');
        const severity = flag.severity.toLowerCase();
        item.className = `list-group-item red-flag-item my-2 red-flag-${severity}`;
        item.innerHTML = `
          <strong class="text-capitalize">${flag.severity} Severity</strong>
          <p class="mb-1 mt-1"><strong>Clause:</strong> "${flag.clause}"</p>
          <p class="mb-0"><strong>Details:</strong> ${flag.explanation}</p>
        `;
        modalRedFlags.appendChild(item);
      });
    }
    detailModal.show();
  } catch (err) {
    alert('error fetching details: ' + err.message);
  }
}
