/* ══════════════════════════════════════════
   FASALSETU AI — APPLICATION LOGIC
══════════════════════════════════════════ */

// ── PAGE NAVIGATION ──
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }
  if (pageId === 'page-dashboard') renderDashboard();
  if (pageId === 'page-priority') renderPriorityQueue();
  if (pageId === 'page-recovery') renderRecoveryOptions();
  if (pageId === 'page-analytics') renderAnalytics();
}

// ── LIVE TIME ──
function updateTime() {
  const el = document.getElementById('live-time');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
}
setInterval(updateTime, 1000);

// ── BATCH DATA ──
const batches = [
  { id: 'TOM-104', crop: '🍅 Tomatoes', qty: 55, age: 5, grade: 'C', priority: 'Urgent', status: 'urgent', options: 2 },
  { id: 'TOM-108', crop: '🍅 Tomatoes', qty: 20, age: 4, grade: 'C', priority: 'Urgent', status: 'urgent', options: 1 },
  { id: 'TOM-110', crop: '🍅 Tomatoes', qty: 80, age: 4, grade: 'B', priority: 'Early Action', status: 'urgent', options: 3 },
  { id: 'TOM-111', crop: '🍅 Tomatoes', qty: 35, age: 2, grade: 'B', priority: 'Monitor', status: 'pending', options: 2 },
  { id: 'TOM-112', crop: '🍅 Tomatoes', qty: 60, age: 1, grade: 'A', priority: 'Normal', status: 'pending', options: 3 },
  { id: 'TOM-113', crop: '🧅 Onions',   qty: 90, age: 3, grade: 'A', priority: 'Normal', status: 'pending', options: 3 },
  { id: 'TOM-114', crop: '🍅 Tomatoes', qty: 25, age: 2, grade: 'B', priority: 'Monitor', status: 'review', options: 2 },
  { id: 'TOM-115', crop: '🍅 Tomatoes', qty: 40, age: 3, grade: 'B', priority: 'Early Action', status: 'review', options: 2 },
  { id: 'TOM-098', crop: '🍅 Tomatoes', qty: 60, age: 6, grade: 'C', priority: '—', status: 'processed', options: 0 },
  { id: 'TOM-095', crop: '🍅 Tomatoes', qty: 35, age: 7, grade: 'D', priority: '—', status: 'processed', options: 0 },
  { id: 'TOM-091', crop: '🍅 Tomatoes', qty: 80, age: 2, grade: 'A', priority: '—', status: 'processed', options: 0 },
];

let activeFilter = 'all';

function filterBatches(filter, btn) {
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBatchTable();
}

function renderBatchTable() {
  const tbody = document.getElementById('batch-tbody');
  if (!tbody) return;

  const filtered = activeFilter === 'all'
    ? batches
    : batches.filter(b => b.status === activeFilter);

  tbody.innerHTML = filtered.map(b => {
    const statusMap = {
      urgent:    ['sb-urgent', '⚡ Urgent'],
      pending:   ['sb-pending', '⏳ Pending'],
      review:    ['sb-review', '🔍 In Review'],
      processed: ['sb-done',   '✅ Done'],
    };
    const [cls, label] = statusMap[b.status] || ['sb-pending', 'Unknown'];
    const gradeClass = `grade-${b.grade}`;
    const actionBtn = b.status !== 'processed'
      ? `<button class="btn btn-sm btn-primary" onclick="showPage('page-recovery')">Review →</button>`
      : `<span style="color:var(--text3);font-size:12px;">Completed</span>`;

    return `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${b.crop}</td>
        <td>${b.qty} kg</td>
        <td>${b.age} day${b.age !== 1 ? 's' : ''}</td>
        <td><span class="grade-badge ${gradeClass}">Grade ${b.grade}</span></td>
        <td><span class="status-badge ${cls}">${label}</span></td>
        <td>${b.options > 0 ? b.options + ' options' : '—'}</td>
        <td>${actionBtn}</td>
      </tr>`;
  }).join('');
}

function renderDashboard() {
  renderBatchTable();
  updateSim();
}

// ── RECOVERY SIMULATOR ──
function updateSim() {
  const qty = parseInt(document.getElementById('sim-qty')?.value || 40);
  const type = document.getElementById('sim-type')?.value || 'separate';

  document.getElementById('sim-qty-val').textContent = qty + ' kg';

  // Modeled economics
  const transportBase = 150;
  const handlingPerKg = 2.5;
  const pricePerKg = 12;
  const coordBonus = 1.4;

  const revenue = qty * pricePerKg;
  const handling = qty * handlingPerKg;
  const transport = transportBase;

  const separateNet = revenue - handling - transport;
  const coordNet = revenue - handling - (transport / coordBonus);
  const improvement = coordNet - separateNet;

  const fmt = n => (n >= 0 ? '₹' : '-₹') + Math.abs(n).toFixed(2);

  document.getElementById('sim-separate').textContent = fmt(separateNet);
  document.getElementById('sim-coordinated').textContent = fmt(coordNet);
  document.getElementById('sim-improvement').textContent = '+₹' + improvement.toFixed(2);
  document.getElementById('sim-separate').className = 'sim-amt ' + (separateNet >= 0 ? 'positive' : 'negative');
}

// ── PRIORITY QUEUE ──
const priorityBatches = [
  { id: 'TOM-104', details: '55 kg · Grade C · Day 5 · Ambient', score: 85, scoreClass: 's-critical', rank: 1, rankClass: 'r1', action: 'Immediate' },
  { id: 'TOM-108', details: '20 kg · Grade C · Day 4 · Ambient', score: 75, scoreClass: 's-critical', rank: 2, rankClass: 'r2', action: 'Urgent' },
  { id: 'TOM-110', details: '80 kg · Grade B · Day 4 · Ambient', score: 68, scoreClass: 's-high',     rank: 3, rankClass: 'r3', action: 'Early Action' },
  { id: 'TOM-115', details: '40 kg · Grade B · Day 3 · Ambient', score: 55, scoreClass: 's-high',     rank: 4, rankClass: 'r3', action: 'Early Action' },
  { id: 'TOM-114', details: '25 kg · Grade B · Day 2 · Cool',    score: 35, scoreClass: 's-medium',   rank: 5, rankClass: 'r4', action: 'Monitor' },
  { id: 'TOM-111', details: '35 kg · Grade B · Day 2 · Ambient', score: 30, scoreClass: 's-medium',   rank: 6, rankClass: 'r4', action: 'Monitor' },
  { id: 'TOM-112', details: '60 kg · Grade A · Day 1 · Cool',    score: 12, scoreClass: 's-low',      rank: 7, rankClass: 'r5', action: 'Normal' },
  { id: 'TOM-113', details: '90 kg · Grade A · Day 3 · Cool',    score: 18, scoreClass: 's-low',      rank: 8, rankClass: 'r5', action: 'Normal' },
];

function renderPriorityQueue() {
  const list = document.getElementById('priority-list');
  if (!list) return;

  list.innerHTML = priorityBatches.map((b, i) => `
    <div class="pq-item ${b.id === 'TOM-115' ? 'selected' : ''}" onclick="selectPriority(this, '${b.id}')">
      <div class="pq-rank ${b.rankClass}">${b.rank}</div>
      <div class="pq-info">
        <div class="pq-id">${b.id}</div>
        <div class="pq-details">${b.details}</div>
      </div>
      <div class="pq-score-bar">
        <div class="score-label">Urgency Score</div>
        <div class="score-track">
          <div class="score-fill ${b.scoreClass}" style="width: ${b.score}%"></div>
        </div>
      </div>
      <div class="pq-action">
        <span class="status-badge ${getActionClass(b.action)}">${b.action}</span>
      </div>
    </div>
  `).join('');
}

function getActionClass(action) {
  if (action === 'Immediate') return 'sb-urgent';
  if (action === 'Urgent') return 'sb-urgent';
  if (action === 'Early Action') return 'sb-pending';
  if (action === 'Monitor') return 'sb-review';
  return 'sb-done';
}

function selectPriority(el, id) {
  document.querySelectorAll('.pq-item').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
}

// ── RECOVERY OPTIONS ──
const recoveryOptions = [
  {
    id: 'juice',
    icon: '🏭',
    name: 'Juice Processing Unit',
    dest: 'Rohini Industrial Area, Delhi · 12 km',
    metrics: {
      'Destination Type': 'Commercial Processing',
      'Available Capacity': '200 kg (confirmed)',
      'Pickup Window': 'Today 4–6 PM',
      'Transport Cost': '₹60 (shared truck)',
      'Handling Cost': '₹20',
      'Expected Price': '₹14/kg',
    },
    net: '₹480',
    netClass: 'positive',
    netSub: 'Modeled net recovery',
    best: true,
    reason: 'Highest net recovery value with confirmed capacity & today pickup window.',
  },
  {
    id: 'market',
    icon: '🛒',
    name: 'Secondary Retail Market',
    dest: 'Lajpat Nagar Market, Delhi · 8 km',
    metrics: {
      'Destination Type': 'Retail / Direct Sale',
      'Available Capacity': '50 kg (limited)',
      'Pickup Window': 'Tomorrow morning',
      'Transport Cost': '₹45',
      'Handling Cost': '₹15',
      'Expected Price': '₹10/kg',
    },
    net: '₹340',
    netClass: 'positive',
    netSub: 'Modeled net recovery',
    best: false,
    reason: 'Good recovery but limited capacity (40 kg batch just fits). Pickup tomorrow raises spoilage risk.',
  },
  {
    id: 'ngo',
    icon: '❤️',
    name: 'NGO Food Bank Donation',
    dest: 'Karol Bagh Food Bank · 5 km',
    metrics: {
      'Destination Type': 'Charitable Donation',
      'Available Capacity': 'Unlimited',
      'Pickup Window': 'Today or Tomorrow',
      'Transport Cost': '₹30 (NGO vehicle)',
      'Handling Cost': '₹0',
      'Expected Price': '₹0 (donated)',
    },
    net: '₹0',
    netClass: 'neutral',
    netSub: 'No monetary return · social value',
    best: false,
    reason: 'Zero monetary return but ensures produce does not go to waste. Ethical choice if Grade B not suitable for processing.',
  },
];

let selectedRecovery = null;

function renderRecoveryOptions() {
  const grid = document.getElementById('recovery-options');
  if (!grid) return;

  grid.innerHTML = recoveryOptions.map(opt => `
    <div class="recovery-option-card ${opt.best ? 'best-match' : ''}" id="roc-${opt.id}" onclick="selectRecovery('${opt.id}')">
      ${opt.best ? '<div class="best-match-badge">⭐ Best Match</div>' : ''}
      <div class="roc-icon">${opt.icon}</div>
      <div class="roc-name">${opt.name}</div>
      <div class="roc-dest">📍 ${opt.dest}</div>
      <div class="roc-metrics">
        ${Object.entries(opt.metrics).map(([k,v]) => `
          <div class="roc-metric"><span>${k}</span><span>${v}</span></div>
        `).join('')}
      </div>
      <div class="roc-net ${opt.netClass}">
        ${opt.net}
        <sub>${opt.netSub}</sub>
      </div>
    </div>
  `).join('');
}

function selectRecovery(id) {
  selectedRecovery = recoveryOptions.find(r => r.id === id);
  document.querySelectorAll('.recovery-option-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('roc-' + id).classList.add('selected');

  const panel = document.getElementById('decision-panel');
  panel.style.display = 'flex';
  document.getElementById('dp-dest-name').textContent = selectedRecovery.name;
  document.getElementById('dp-reason').textContent = selectedRecovery.reason;

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function confirmRecovery() {
  if (!selectedRecovery) return;
  document.getElementById('modal-dest').textContent = selectedRecovery.name;
  document.getElementById('modal-value').textContent = selectedRecovery.net;
  document.getElementById('success-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('success-modal').style.display = 'none';
}

// ── ANALYTICS ──
const destinations = [
  { label: 'Juice Processing Units', kg: 142, pct: 42, color: '#2e7d32' },
  { label: 'Secondary Retail Market', kg: 98,  pct: 29, color: '#43a047' },
  { label: 'NGO Food Banks',         kg: 65,  pct: 19, color: '#66bb6a' },
  { label: 'Composting / Biogas',    kg: 28,  pct: 8,  color: '#ffa726' },
  { label: 'Direct Farm Return',     kg: 9,   pct: 3,  color: '#ef5350' },
];

const outcomes = [
  { id: 'TOM-104', crop: '🍅 Tomatoes', qty: 55, grade: 'C', dest: 'Juice Processing, Rohini', value: '₹660', date: '04 Nov', outcome: 'Recovered' },
  { id: 'TOM-098', crop: '🍅 Tomatoes', qty: 60, grade: 'C', dest: 'Juice Processing, Rohini', value: '₹480', date: '04 Nov', outcome: 'Recovered' },
  { id: 'TOM-095', crop: '🍅 Tomatoes', qty: 35, grade: 'D', dest: 'NGO Food Bank, Karol Bagh', value: '₹0 (Donated)', date: '03 Nov', outcome: 'Donated' },
  { id: 'TOM-091', crop: '🍅 Tomatoes', qty: 80, grade: 'A', dest: 'Retail Market, Lajpat Nagar', value: '₹960', date: '03 Nov', outcome: 'Sold' },
  { id: 'TOM-088', crop: '🍅 Tomatoes', qty: 25, grade: 'D', dest: 'Composting Unit', value: '₹0', date: '02 Nov', outcome: 'Composted' },
  { id: 'TOM-085', crop: '🧅 Onions',   qty: 120, grade: 'A', dest: 'Retail Market, Sadar Bazar', value: '₹1,800', date: '02 Nov', outcome: 'Sold' },
  { id: 'TOM-082', crop: '🍅 Tomatoes', qty: 42, grade: 'B', dest: 'Secondary Market, Mayur Vihar', value: '₹378', date: '01 Nov', outcome: 'Sold' },
];

function renderAnalytics() {
  renderDestChart();
  renderOutcomeTable();
}

function renderDestChart() {
  const chart = document.getElementById('dest-chart');
  if (!chart) return;

  chart.innerHTML = destinations.map(d => `
    <div class="bc-row">
      <div class="bc-label">${d.label}</div>
      <div class="bc-bar">
        <div class="bc-fill" style="width: ${d.pct}%; background: ${d.color}">
          <span class="bc-val">${d.kg} kg</span>
        </div>
      </div>
      <span style="font-size:12px;font-weight:700;min-width:36px;text-align:right">${d.pct}%</span>
    </div>
  `).join('');
}

function renderOutcomeTable() {
  const tbody = document.getElementById('outcome-tbody');
  if (!tbody) return;

  tbody.innerHTML = outcomes.map(o => {
    const outcomeClass = o.outcome === 'Composted' ? 'sb-urgent' :
                         o.outcome === 'Donated' ? 'sb-review' : 'sb-done';
    const gradeClass = `grade-${o.grade}`;
    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.crop}</td>
        <td>${o.qty} kg</td>
        <td><span class="grade-badge ${gradeClass}">Grade ${o.grade}</span></td>
        <td>${o.dest}</td>
        <td style="font-weight:700">${o.value}</td>
        <td style="color:var(--text3)">${o.date}</td>
        <td><span class="status-badge ${outcomeClass}">${o.outcome}</span></td>
      </tr>`;
  }).join('');
}

// ── REVIEW PAGE INTERACTIONS ──
function selectCondition(grade) {
  document.querySelectorAll('.condition-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('cond-' + grade).classList.add('selected');
}

// ── REGISTER PAGE ──
let batchCounter = 116;
function genBatchId() {
  document.getElementById('f-batch-id').value = 'TOM-' + batchCounter++;
}

function submitBatch() {
  const id = document.getElementById('f-batch-id').value;
  const qty = document.getElementById('f-qty').value;
  if (!id || !qty) {
    alert('Please fill in all required fields.');
    return;
  }
  // Add to batch list (prototype)
  showPage('page-review');
}

// ── SET DEFAULT ARRIVAL TIME ──
function setDefaultArrival() {
  const input = document.getElementById('f-arrival');
  if (input) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    input.value = now.toISOString().slice(0, 16);
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  showPage('page-landing');
  setDefaultArrival();
  updateTime();
});
