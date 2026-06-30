const PLATFORMS = [
  { key: 'tiktok', name: 'TikTok', icon: 'ti-brand-tiktok', followersLabel: 'Followers', accent: '#25F4EE', iconColor: '#0B1424' },
  { key: 'instagram', name: 'Instagram', icon: 'ti-brand-instagram', followersLabel: 'Followers', accent: '#E1306C', iconColor: '#FFFFFF' },
  { key: 'linkedin', name: 'LinkedIn', icon: 'ti-brand-linkedin', followersLabel: 'Connections / followers', accent: '#0A66C2', iconColor: '#FFFFFF' },
  { key: 'youtube', name: 'YouTube', icon: 'ti-brand-youtube', followersLabel: 'Subscribers', accent: '#FF0000', iconColor: '#FFFFFF' }
];

const STORAGE_PREFIX = 'bic-social-dashboard:';

function weeklyKey(p) { return STORAGE_PREFIX + 'weekly:' + p; }
function postsKey(p) { return STORAGE_PREFIX + 'posts:' + p; }

function loadWeekly(p) {
  try {
    const raw = localStorage.getItem(weeklyKey(p));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load weekly data for', p, e);
    return [];
  }
}

function saveWeekly(p, arr) {
  localStorage.setItem(weeklyKey(p), JSON.stringify(arr));
}

function loadPosts(p) {
  try {
    const raw = localStorage.getItem(postsKey(p));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load posts for', p, e);
    return [];
  }
}

function savePosts(p, arr) {
  localStorage.setItem(postsKey(p), JSON.stringify(arr));
}

function fmtNum(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Math.round(n).toLocaleString();
}

function fmtPct(n) {
  if (n === null || n === undefined || isNaN(n)) return '';
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(1) + '%';
}

function fmtDate(d) {
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------- Tab switching ----------

document.querySelectorAll('.topbar .tabbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.topbar .tabbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('view-overview').style.display = tab === 'overview' ? '' : 'none';
    document.getElementById('view-entry').style.display = tab === 'entry' ? '' : 'none';
    if (tab === 'entry') renderHistory();
  });
});

document.querySelectorAll('#view-entry .tabs .tabbtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#view-entry .tabs .tabbtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    document.getElementById('weekly-form').style.display = mode === 'weekly' ? '' : 'none';
    document.getElementById('post-form').style.display = mode === 'post' ? '' : 'none';
  });
});

// ---------- Entry form ----------

const platformSelect = document.getElementById('platform-select');

function updateFollowerLabel() {
  const p = PLATFORMS.find(x => x.key === platformSelect.value);
  document.getElementById('w-followers-label').textContent = p.followersLabel;
}
platformSelect.addEventListener('change', () => {
  updateFollowerLabel();
  renderHistory();
});
updateFollowerLabel();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
document.getElementById('w-date').value = todayStr();
document.getElementById('p-date').value = todayStr();

function showConfirm() {
  const el = document.getElementById('save-confirm');
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 2000);
}

document.getElementById('save-weekly').addEventListener('click', () => {
  const p = platformSelect.value;
  const date = document.getElementById('w-date').value;
  if (!date) { alert('Pick a date first.'); return; }

  const followers = parseFloat(document.getElementById('w-followers').value);
  const views = parseFloat(document.getElementById('w-views').value);
  const engagements = parseFloat(document.getElementById('w-engagements').value);

  let arr = loadWeekly(p);
  arr = arr.filter(e => e.date !== date);
  arr.push({
    date,
    followers: isNaN(followers) ? null : followers,
    views: isNaN(views) ? null : views,
    engagements: isNaN(engagements) ? null : engagements
  });
  arr.sort((a, b) => a.date.localeCompare(b.date));
  saveWeekly(p, arr);

  document.getElementById('w-followers').value = '';
  document.getElementById('w-views').value = '';
  document.getElementById('w-engagements').value = '';
  showConfirm();
  renderOverview();
  renderHistory();
});

document.getElementById('save-post').addEventListener('click', () => {
  const p = platformSelect.value;
  const date = document.getElementById('p-date').value;
  const title = document.getElementById('p-title').value.trim();
  if (!date || !title) { alert('Date and title are required.'); return; }

  const views = parseFloat(document.getElementById('p-views').value);
  const likes = parseFloat(document.getElementById('p-likes').value);
  const comments = parseFloat(document.getElementById('p-comments').value);
  const shares = parseFloat(document.getElementById('p-shares').value);

  const arr = loadPosts(p);
  arr.push({
    date,
    title,
    views: isNaN(views) ? 0 : views,
    likes: isNaN(likes) ? 0 : likes,
    comments: isNaN(comments) ? 0 : comments,
    shares: isNaN(shares) ? 0 : shares
  });
  savePosts(p, arr);

  document.getElementById('p-title').value = '';
  document.getElementById('p-views').value = '';
  document.getElementById('p-likes').value = '';
  document.getElementById('p-comments').value = '';
  document.getElementById('p-shares').value = '';
  showConfirm();
  renderOverview();
  renderHistory();
});

// ---------- History list (view/delete entries) ----------

function renderHistory() {
  const p = platformSelect.value;
  const weekly = loadWeekly(p);
  const posts = loadPosts(p);
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  if (weekly.length === 0 && posts.length === 0) {
    list.innerHTML = '<p class="empty-note">No entries yet for this platform.</p>';
    return;
  }

  weekly.slice().reverse().forEach(entry => {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `<span class="hr-info"><strong>${fmtDate(entry.date)}</strong> &middot; weekly &middot; ${fmtNum(entry.followers)} followers, ${fmtNum(entry.views)} views</span>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'history-del';
    delBtn.innerHTML = '<i class="ti ti-trash"></i>';
    delBtn.addEventListener('click', () => {
      const arr = loadWeekly(p).filter(e => e.date !== entry.date);
      saveWeekly(p, arr);
      renderOverview();
      renderHistory();
    });
    row.appendChild(delBtn);
    list.appendChild(row);
  });

  posts.slice().reverse().forEach((entry, idxFromEnd) => {
    const realIdx = posts.length - 1 - idxFromEnd;
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `<span class="hr-info"><strong>${fmtDate(entry.date)}</strong> &middot; post &middot; "${entry.title}" &middot; ${fmtNum(entry.views)} views</span>`;
    const delBtn = document.createElement('button');
    delBtn.className = 'history-del';
    delBtn.innerHTML = '<i class="ti ti-trash"></i>';
    delBtn.addEventListener('click', () => {
      const arr = loadPosts(p);
      arr.splice(realIdx, 1);
      savePosts(p, arr);
      renderOverview();
      renderHistory();
    });
    row.appendChild(delBtn);
    list.appendChild(row);
  });
}

// ---------- Overview rendering ----------

const chartInstances = {};

function buildCard(p) {
  const div = document.createElement('div');
  div.className = 'platform-card';
  div.style.setProperty('--accent', p.accent);
  div.innerHTML = `
    <div class="card-head">
      <div class="head-row">
        <span class="platform-icon" style="--icon-color:${p.iconColor}"><i class="ti ${p.icon}"></i></span>
        <span class="platform-name">${p.name}</span>
      </div>
      <div class="metrics-row" id="metrics-${p.key}"></div>
    </div>
    <div class="chart-wrap">
      <canvas id="chart-${p.key}" role="img" aria-label="${p.name} follower trend over time"></canvas>
    </div>
    <div class="top-post" id="toppost-${p.key}"></div>
  `;
  return div;
}

function metricTile(label, value, delta) {
  const deltaColor = delta === null || delta === undefined ? 'var(--muted-dim)' : (delta >= 0 ? 'var(--success)' : 'var(--danger)');
  const deltaHtml = (delta === null || delta === undefined) ? '' : `<span class="metric-delta" style="color:${deltaColor}">${fmtPct(delta)}</span>`;
  return `
    <div class="metric-tile">
      <p class="metric-label">${label}</p>
      <p class="metric-value">${fmtNum(value)}${deltaHtml}</p>
    </div>
  `;
}

function renderQuad(p) {
  const weekly = loadWeekly(p.key);
  const posts = loadPosts(p.key);

  const metricsEl = document.getElementById('metrics-' + p.key);
  if (weekly.length === 0) {
    metricsEl.innerHTML = metricTile(p.followersLabel, null, null) + metricTile('Views', null, null);
  } else {
    const latest = weekly[weekly.length - 1];
    const prev = weekly.length > 1 ? weekly[weekly.length - 2] : null;
    const followerDelta = (prev && prev.followers) ? ((latest.followers - prev.followers) / prev.followers * 100) : null;
    const viewsDelta = (prev && prev.views) ? ((latest.views - prev.views) / prev.views * 100) : null;
    metricsEl.innerHTML = metricTile(p.followersLabel, latest.followers, followerDelta) + metricTile('Views', latest.views, viewsDelta);
  }

  const ctx = document.getElementById('chart-' + p.key);
  const labels = weekly.map(e => fmtDate(e.date));
  const data = weekly.map(e => e.followers);

  if (chartInstances[p.key]) chartInstances[p.key].destroy();

  chartInstances[p.key] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length ? labels : ['No data'],
      datasets: [{
        data: data.length ? data : [null],
        borderColor: p.accent,
        backgroundColor: p.accent + '26',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: data.length <= 12 ? 3 : 0,
        pointBackgroundColor: p.accent
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: {
        x: {
          display: weekly.length > 0,
          ticks: { font: { size: 10 }, color: '#7C88A6', maxRotation: 0, autoSkip: true, maxTicksLimit: 4 },
          grid: { display: false }
        },
        y: {
          display: weekly.length > 0,
          ticks: { font: { size: 10 }, color: '#7C88A6' },
          grid: { color: '#243456' }
        }
      }
    }
  });

  const toppostEl = document.getElementById('toppost-' + p.key);
  if (posts.length === 0) {
    toppostEl.innerHTML = '<span>No posts logged yet.</span>';
  } else {
    const top = posts.slice().sort((a, b) => b.views - a.views)[0];
    toppostEl.innerHTML = `<span>Top post: </span><span class="post-title">${top.title}</span> — ${fmtNum(top.views)} views`;
  }
}

function renderOverview() {
  const grid = document.getElementById('quad-grid');
  grid.innerHTML = '';
  PLATFORMS.forEach(p => grid.appendChild(buildCard(p)));
  PLATFORMS.forEach(p => renderQuad(p));
}

// ---------- Export / Import / Reset ----------

document.getElementById('export-btn').addEventListener('click', () => {
  const data = {};
  PLATFORMS.forEach(p => {
    data[p.key] = {
      weekly: loadWeekly(p.key),
      posts: loadPosts(p.key)
    };
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bic-social-dashboard-' + todayStr() + '.json';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      PLATFORMS.forEach(p => {
        if (data[p.key]) {
          if (Array.isArray(data[p.key].weekly)) saveWeekly(p.key, data[p.key].weekly);
          if (Array.isArray(data[p.key].posts)) savePosts(p.key, data[p.key].posts);
        }
      });
      renderOverview();
      alert('Import complete.');
    } catch (err) {
      alert('That file could not be read as valid dashboard data.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('This clears all saved data for every platform on this device. This cannot be undone. Continue?')) return;
  PLATFORMS.forEach(p => {
    localStorage.removeItem(weeklyKey(p.key));
    localStorage.removeItem(postsKey(p.key));
  });
  renderOverview();
});

// ---------- Init ----------

renderOverview();
