// ======= قاعدة البيانات مع نظام المشرفين (Admins) وإعدادات الخط والمظهر =======
const INITIAL_DATA = {
  shopName: 'نبض المحل',
  users: [
    { name: 'أنا (مشرف)', role: 'admin' },
    { name: 'المعلم', role: 'admin' },
    { name: 'الموظف 1', role: 'staff' },
    { name: 'الموظف 2', role: 'staff' },
    { name: 'الموظف 3', role: 'staff' }
  ],
  userIdx: 0,
  adminPin: '0000',
  ui: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    accent: '#6366f1',
    compact: false
  },
  tags: {
    brands: ['Samsung', 'iPhone', 'Redmi', 'Poco', 'Infinix', 'Tecno', 'Realme'],
    storages: ['64/4', '128/4', '128/6', '128/8', '256/8', '128GB', '256GB'],
    colors: ['أسود', 'أزرق', 'أخضر', 'أبيض', 'ذهبي'],
    accCats: ['كابلات', 'شارجورات', 'راس شارجور', 'USB', 'Carte Mémoire', 'سماعات'],
    accTypes: ['Micro', 'Type-C', 'iPhone', 'Aux', '16GB', '32GB', '64GB', '20W', '33W'],
    accBrands: ['عادي', 'Oraimo', 'Hoco', 'Baseus', 'Samsung', 'SanDisk'],
    pochetteNotes: ['نسائي فقط', 'رجالي فقط', 'كحل وألوان غامقة', 'شفاف سيليكون', 'ألوان فاتحة'],
    faults: ['تغيير شاشة', 'كونكتور شحن', 'بطارية', 'شبكة', 'سقط في الماء', 'مايك / صوت']
  },
  repairs: [
    { id: 1, name: 'يوسف العلوي', phone: '0661234567', device: 'Samsung A12', fault: 'تغيير شاشة', price: 250, deposit: 50, status: 'in_shop', waitingPart: 'شاشة A12' },
    { id: 2, name: 'سعيدة', phone: '0662001122', device: 'Redmi Note 11', fault: 'كونكتور شحن', price: 80, deposit: 0, status: 'ready', waitingPart: '' }
  ],
  phones: [
    { id: 11, model: 'Samsung A15', storage: '128/6', color: 'أسود', price: 1650, qty: 3, reserved: '' },
    { id: 12, model: 'Redmi 13C', storage: '128/4', color: 'أخضر', price: 1250, qty: 0, reserved: '' }
  ],
  glassTypes: ['عادي 10د', 'Super Full', 'Privacy', 'Matte'],
  glassGroups: [
    { id: 101, models: ['Samsung A12', 'M12', 'Redmi 9C'], cells: [{ st: 'green', note: '' }, { st: 'red', note: 'مطلوب' }, { st: 'yellow', note: 'بقي 3' }, { st: 'green', note: '' }] },
    { id: 102, models: ['iPhone 13', '13 Pro', '14'], cells: [{ st: 'green', note: '' }, { st: 'green', note: '' }, { st: 'red', note: 'سالا' }, { st: 'green', note: '' }] }
  ],
  pochettes: [
    { id: 201, model: 'Samsung A07', price: 25, status: 'yellow', rem: 'نسائي فقط', need: 'رجالي وكحل' }
  ],
  accessories: [
    { id: 301, cat: 'كابلات', type: 'Micro', brand: 'عادي', price: 20, status: 'red', note: 'بقي 4 حبات' },
    { id: 302, cat: 'USB', type: '16GB', brand: 'SanDisk', price: 45, status: 'green', note: 'متوفر' }
  ],
  requests: []
};

let db = JSON.parse(localStorage.getItem('nabd_shop_v2')) || INITIAL_DATA;
if (!db.users) { db.users = INITIAL_DATA.users; db.userIdx = 0; db.ui = INITIAL_DATA.ui; db.adminPin = '0000'; }

let activeSec = 'repairs';
let subFilter = 'in_shop';
let searchQuery = '';

function currentUser() { return db.users[db.userIdx] || db.users[0]; }
function isAdmin() { return currentUser().role === 'admin'; }

function applyUISettings() {
  const r = document.documentElement;
  r.style.setProperty('--font-size', (db.ui.fontSize || 15) + 'px');
  r.style.setProperty('--font-weight', db.ui.fontWeight || '500');
  r.style.setProperty('--font-family', db.ui.fontFamily || 'system-ui, sans-serif');
  r.style.setProperty('--accent', db.ui.accent || '#6366f1');
  r.style.setProperty('--card-pad', db.ui.compact ? '8px 12px' : '13px 15px');
}

function save() {
  localStorage.setItem('nabd_shop_v2', JSON.stringify(db));
  applyUISettings();
  render();
}

// بديل أنيق لـ alert()
function showToast(msg) {
  let el = document.getElementById('live-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'live-toast';
    el.className = 'app-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.add('hidden'), 2400);
}

function norm(s) { return String(s || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').trim(); }
function nextSt(st) { return st === 'green' ? 'yellow' : (st === 'yellow' ? 'red' : 'green'); }
function stLabel(st) { return st === 'green' ? 'متوفر' : (st === 'yellow' ? 'قليل' : 'سالا'); }

// تبديل الموظف (مع طلب كود PIN عند اختيار حساب Admin لحماية صلاحياتك)
function cycleStaff() {
  openSheet(`
    <div class="sheet-title-bar"><strong>👤 اختر اسم المستخدم الحالي</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <div style="display:flex; flex-direction:column; gap:8px;">
      ${db.users.map((u, idx) => `
        <div class="row-card" style="cursor:pointer; border-color:${idx === db.userIdx ? 'var(--accent)' : 'var(--border)'}" onclick="selectUser(${idx})">
          <div>
            <div class="row-title">${u.name}</div>
            <div class="row-sub">${u.role === 'admin' ? '👑 مشرف (صلاحيات كاملة)' : '👤 موظف (استخدام يومي آمن)'}</div>
          </div>
          ${idx === db.userIdx ? '<span style="color:var(--green); font-weight:bold;">✓ نشط</span>' : ''}
        </div>
      `).join('')}
    </div>
    <div id="admin-pin-box" class="hidden" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
      <span class="f-label">🔐 أدخل رمز المشرفين (PIN) للتبديل لهذا الحساب:</span>
      <div style="display:flex; gap:8px;">
        <input type="password" id="verify-pin-inp" class="f-input" placeholder="الافتراضي: 0000">
        <button class="btn-action" style="margin:0; width:auto; padding:0 20px;" id="verify-pin-btn">دخول</button>
      </div>
    </div>
  `);
}

function selectUser(idx) {
  const target = db.users[idx];
  if (target.role === 'admin' && !isAdmin() && db.adminPin) {
    const box = document.getElementById('admin-pin-box');
    box.classList.remove('hidden');
    document.getElementById('verify-pin-inp').focus();
    document.getElementById('verify-pin-btn').onclick = () => {
      if (document.getElementById('verify-pin-inp').value === db.adminPin) {
        db.userIdx = idx; closeSheet(); save(); showToast(`مرحباً ${target.name} 👑`);
      } else {
        showToast('❌ الرمز السري غير صحيح');
      }
    };
    return;
  }
  db.userIdx = idx;
  closeSheet(); save();
  showToast(`تم التبديل إلى: ${target.name}`);
}

function switchSection(sec) {
  activeSec = sec;
  subFilter = sec === 'repairs' ? 'in_shop' : 'all';
  document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('seg-' + sec);
  if (btn) btn.classList.add('active');
  render();
}

function onSearchInput(val) {
  searchQuery = norm(val);
  document.getElementById('clear-search').classList.toggle('hidden', !searchQuery);
  render();
}
function clearSearch() { document.getElementById('global-search').value = ''; onSearchInput(''); }

// ======= الرندر الرئيسي =======
function render() {
  document.getElementById('ui-shop-name').textContent = db.shopName;
  const u = currentUser();
  const staffBtn = document.querySelector('.chip-staff');
  document.getElementById('ui-staff-name').textContent = (u.role === 'admin' ? '👑 ' : '👤 ') + u.name;
  staffBtn.classList.toggle('is-admin', u.role === 'admin');

  document.getElementById('badge-repairs').textContent = db.repairs.filter(r => r.status === 'in_shop').length;

  let shortages = db.phones.filter(p => p.qty === 0).length
    + db.pochettes.filter(p => p.status !== 'green').length
    + db.accessories.filter(a => a.status !== 'green').length
    + db.repairs.filter(r => r.status === 'in_shop' && r.waitingPart).length
    + db.requests.length;
  db.glassGroups.forEach(g => g.cells.forEach(c => { if (c.st !== 'green') shortages++; }));
  document.getElementById('stat-shortages').textContent = shortages;

  // تنبيه بدائل الزجاج
  const toast = document.getElementById('compat-toast');
  if (searchQuery.length >= 2) {
    const matchGrp = db.glassGroups.find(g => g.models.some(m => norm(m).includes(searchQuery)));
    if (matchGrp) {
      const avail = db.glassTypes.filter((_, i) => matchGrp.cells[i]?.st !== 'red');
      toast.innerHTML = `💡 <b>توافق الزجاج:</b> ${matchGrp.models.join(' = ')}<br><span style="color:#34d399">المتوفر: ${avail.join(' ، ') || 'نافد'}</span>`;
      toast.classList.remove('hidden');
    } else toast.classList.add('hidden');
  } else toast.classList.add('hidden');

  const lbl = document.getElementById('fab-label');
  if (activeSec === 'report') lbl.textContent = 'نسخ للواتساب';
  else {
    const titles = { repairs: 'استلام جهاز', phones: 'إضافة هاتف', glass: 'مجموعة توافق', pochette: 'إضافة بوشيط', acc: 'إضافة إكسسوار' };
    lbl.textContent = titles[activeSec] || 'إضافة';
  }

  renderSubFilters();
  renderList();
}

function handleFabClick() {
  if (activeSec === 'repairs') openRepairSheet();
  else if (activeSec === 'phones') openPhoneSheet();
  else if (activeSec === 'glass') openGlassSheet();
  else if (activeSec === 'pochette') openPochetteSheet();
  else if (activeSec === 'acc') openAccSheet();
  else if (activeSec === 'report') copyWhatsAppReport();
}

function renderSubFilters() {
  const bar = document.getElementById('sub-filters');
  if (activeSec === 'repairs') {
    const readyCount = db.repairs.filter(r => r.status === 'ready').length;
    bar.innerHTML = `
      <button class="filter-chip ${subFilter === 'in_shop' ? 'active' : ''}" onclick="subFilter='in_shop'; render()">🔧 في الإصلاح</button>
      <button class="filter-chip ${subFilter === 'ready' ? 'active' : ''}" onclick="subFilter='ready'; render()">✅ جاهز (${readyCount})</button>
      <button class="filter-chip ${subFilter === 'archived' ? 'active' : ''}" onclick="subFilter='archived'; render()">🗄️ الأرشيف</button>
    `;
  } else if (activeSec === 'acc') {
    const cats = ['all', ...new Set(db.accessories.map(a => a.cat))];
    bar.innerHTML = cats.map(c => `
      <button class="filter-chip ${subFilter === c ? 'active' : ''}" onclick="subFilter='${c}'; render()">${c === 'all' ? 'الكل' : c}</button>
    `).join('');
  } else if (activeSec === 'glass' && isAdmin()) {
    bar.innerHTML = `<button class="filter-chip" onclick="openGlassTypesSheet()">⚙️ إدارة أنواع الزجاج (للمشرف)</button>`;
  } else {
    bar.innerHTML = '';
  }
}

function renderList() {
  const box = document.getElementById('list-container');
  const q = searchQuery;

  if (activeSec === 'repairs') {
    const list = db.repairs.filter(r => (q ? true : r.status === subFilter) && (!q || norm(`${r.name} ${r.phone} ${r.device} ${r.fault}`).includes(q)));
    box.innerHTML = list.map(r => `
      <div class="row-card">
        <div class="row-main" onclick="openRepairActionSheet(${r.id})">
          <div class="row-title">${r.device} — <span style="color:var(--accent)">${r.name}</span></div>
          <div class="row-sub">🛠️ ${r.fault} ${r.waitingPart ? `· <b style="color:#fbbf24">⏳ ينتظر: ${r.waitingPart}</b>` : ''}</div>
        </div>
        <div class="row-end">
          <span style="font-weight:700; font-size:0.9rem;">${r.price} د</span>
          ${r.status === 'in_shop' ? `<button class="st-dot-btn green" onclick="markReady(${r.id})">✓ جاهز</button>` : ''}
          ${r.status === 'ready' ? `<button class="st-dot-btn yellow" onclick="sendWA(${r.id})">واتساب</button>` : ''}
        </div>
      </div>
    `).join('') || emptyState('لا توجد أجهزة في هذه القائمة');
  }

  else if (activeSec === 'phones') {
    const list = db.phones.filter(p => !q || norm(`${p.model} ${p.storage} ${p.color}`).includes(q));
    box.innerHTML = list.map(p => `
      <div class="row-card">
        <div class="row-main" onclick="openEditPhoneSheet(${p.id})">
          <div class="row-title">${p.model} <span style="color:var(--muted); font-size:0.84rem;">(${p.storage})</span></div>
          <div class="row-sub">اللون: ${p.color} · <b style="color:var(--accent)">${p.price} درهم</b> ${p.reserved ? `· 🔒 ${p.reserved}` : ''}</div>
        </div>
        <div class="row-end">
          <div class="qty-stepper">
            <button class="step-btn" onclick="stepPhone(${p.id}, -1)">−</button>
            <span class="step-val" style="color:${p.qty === 0 ? 'var(--red)' : 'var(--green)'}">${p.qty}</span>
            <button class="step-btn" onclick="stepPhone(${p.id}, 1)">+</button>
          </div>
        </div>
      </div>
    `).join('') || emptyState('لا توجد هواتف مسجلة');
  }

  else if (activeSec === 'glass') {
    const list = db.glassGroups.filter(g => !q || g.models.some(m => norm(m).includes(q)));
    box.innerHTML = list.map(g => `
      <div class="glass-group-box">
        <div class="glass-header">
          <span class="glass-models-text">${g.models.join(' · ')}</span>
          <button class="filter-chip" onclick="openEditGlassGroupSheet(${g.id})">✏️ تعديل / + موديل</button>
        </div>
        <div class="glass-pills-row">
          ${db.glassTypes.map((t, idx) => {
            if (!g.cells[idx]) g.cells[idx] = { st: 'green', note: '' };
            const c = g.cells[idx];
            return `
              <div class="glass-pill-item" onclick="toggleGlassCell(${g.id}, ${idx})">
                <span class="glass-pill-name">${t} ${c.note ? `(${c.note})` : ''}</span>
                <span class="dot-indicator ${c.st}"></span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('') || emptyState('لا توجد مجموعات زجاج');
  }

  else if (activeSec === 'pochette') {
    const list = db.pochettes.filter(p => !q || norm(`${p.model} ${p.rem} ${p.need}`).includes(q));
    box.innerHTML = list.map(p => `
      <div class="row-card">
        <div class="row-main" onclick="openPochetteDetailSheet(${p.id})">
          <div class="row-title">بوشيط ${p.model}</div>
          <div class="row-sub">باقي: ${p.rem || 'متوفر'} ${p.need ? `· <b style="color:#fb7185">خاصنا: ${p.need}</b>` : ''}</div>
        </div>
        <div class="row-end">
          <button class="st-dot-btn ${p.status}" onclick="togglePochette(${p.id})">${stLabel(p.status)}</button>
        </div>
      </div>
    `).join('') || emptyState('لا توجد بوشيطات مسجلة');
  }

  else if (activeSec === 'acc') {
    const list = db.accessories.filter(a => (subFilter === 'all' || a.cat === subFilter) && (!q || norm(`${a.cat} ${a.type} ${a.brand} ${a.note}`).includes(q)));
    box.innerHTML = list.map(a => `
      <div class="row-card">
        <div class="row-main" onclick="openEditAccSheet(${a.id})">
          <div class="row-title">${a.cat} ${a.type} <span style="font-size:0.8rem; color:var(--muted);">(${a.brand})</span></div>
          <div class="row-sub">${a.price} درهم · ${a.note}</div>
        </div>
        <div class="row-end">
          <button class="st-dot-btn ${a.status}" onclick="toggleAcc(${a.id})">${stLabel(a.status)}</button>
        </div>
      </div>
    `).join('') || emptyState('لا توجد إكسسوارات');
  }

  else if (activeSec === 'report') {
    renderReportSection(box);
  }
}

function emptyState(msg) {
  return `<div style="text-align:center; padding:36px 16px; color:var(--muted); font-size:0.88rem;">${msg}</div>`;
}

// ======= التقرير اليومي =======
function renderReportSection(box) {
  let itemsHTML = '';
  let lines = [`📋 *تقرير المحل (${new Date().toLocaleDateString('ar-MA')})*`];

  db.phones.filter(p => p.qty === 0).forEach(p => {
    lines.push(`🔴 هاتف نفد: ${p.model} (${p.storage})`);
    itemsHTML += reportRow(`📱 هاتف ${p.model} (${p.storage})`, `stepPhone(${p.id}, 1)`);
  });

  db.glassGroups.forEach(g => {
    db.glassTypes.forEach((t, i) => {
      const c = g.cells[i];
      if (c && c.st !== 'green') {
        const txt = `🛡️ زجاج [${t}]: ${g.models.join('/')}`;
        lines.push(`${c.st === 'red' ? '🔴' : '🟡'} ${txt}`);
        itemsHTML += reportRow(txt, `buyGlass(${g.id}, ${i})`);
      }
    });
  });

  db.pochettes.filter(p => p.status !== 'green').forEach(p => {
    const txt = `📲 بوشيط ${p.model} (خاصنا: ${p.need || 'تزويد'})`;
    lines.push(`${p.status === 'red' ? '🔴' : '🟡'} ${txt}`);
    itemsHTML += reportRow(txt, `buyPochette(${p.id})`);
  });

  db.accessories.filter(a => a.status !== 'green').forEach(a => {
    const txt = `🔌 ${a.cat} ${a.type} (${a.brand}) - ${a.note}`;
    lines.push(`${a.status === 'red' ? '🔴' : '🟡'} ${txt}`);
    itemsHTML += reportRow(txt, `buyAcc(${a.id})`);
  });

  db.repairs.filter(r => r.status === 'in_shop' && r.waitingPart).forEach(r => {
    const txt = `🔧 قطعة صيانة: ${r.waitingPart} (${r.name})`;
    lines.push(txt);
    itemsHTML += reportRow(txt, `clearPart(${r.id})`);
  });

  db.requests.forEach((req, idx) => {
    lines.push(`🗣️ طلب زبون: ${req}`);
    itemsHTML += reportRow(`🗣️ طلب زبون: ${req}`, `db.requests.splice(${idx},1); save()`);
  });

  box.innerHTML = (itemsHTML || emptyState('🎉 كل شيء متوفر في المحل! لا توجد نواقص.'))
    + `<pre id="wa-raw" style="background:var(--surface); padding:14px; border-radius:14px; border:1px solid var(--border); white-space:pre-wrap; font-size:0.82rem; color:var(--muted); margin-top:10px;">${lines.join('\n')}</pre>`;
}

function reportRow(title, onBuyCode) {
  return `
    <div class="row-card">
      <div class="row-main"><div class="row-title" style="white-space:normal;">${title}</div></div>
      <button class="st-dot-btn green" onclick="${onBuyCode}; showToast('✓ تمت إعادته للمتوفر')">✓ تم الشراء</button>
    </div>
  `;
}

function copyWhatsAppReport() {
  const el = document.getElementById('wa-raw');
  if (el) navigator.clipboard.writeText(el.textContent).then(() => showToast('✅ تم نسخ التقرير للواتساب!'));
}

function stepPhone(id, d) { const p = db.phones.find(x => x.id === id); if (p) { p.qty = Math.max(0, p.qty + d); save(); } }
function toggleGlassCell(gId, i) { const g = db.glassGroups.find(x => x.id === gId); if (g) { g.cells[i].st = nextSt(g.cells[i].st); save(); } }
function togglePochette(id) { const p = db.pochettes.find(x => x.id === id); if (p) { p.status = nextSt(p.status); save(); } }
function toggleAcc(id) { const a = db.accessories.find(x => x.id === id); if (a) { a.status = nextSt(a.status); save(); } }

function buyGlass(gId, i) { const g = db.glassGroups.find(x => x.id === gId); if (g) { g.cells[i].st = 'green'; g.cells[i].note = ''; save(); } }
function buyPochette(id) { const p = db.pochettes.find(x => x.id === id); if (p) { p.status = 'green'; p.need = ''; save(); } }
function buyAcc(id) { const a = db.accessories.find(x => x.id === id); if (a) { a.status = 'green'; a.note = 'متوفر'; save(); } }
function clearPart(id) { const r = db.repairs.find(x => x.id === id); if (r) { r.waitingPart = ''; save(); } }

// ======= نظام الـ Tags المدمج الأنيق (بدون نافذة This page says القبيحة!) =======
function openSheet(html) {
  document.getElementById('sheet-content').innerHTML = html;
  document.getElementById('sheet-overlay').classList.remove('hidden');
}
function closeSheet() { document.getElementById('sheet-overlay').classList.add('hidden'); }

function tagsCloud(key, targetId, append = false) {
  const arr = db.tags[key] || [];
  const admin = isAdmin();
  return `
    <div id="cloud-wrap-${key}">
      <div class="tags-cloud">
        ${arr.map((t, idx) => `
          <span class="t-chip" onclick="applyTag('${targetId}', '${t}', ${append})">
            ${t}
            ${admin ? `<span class="t-del" onclick="event.stopPropagation(); deleteTag('${key}', ${idx}, '${targetId}', ${append})">×</span>` : ''}
          </span>
        `).join('')}
        <span class="t-chip add" onclick="showInlineTagInput('${key}', '${targetId}', ${append})">+ إضافة</span>
      </div>
      <div id="inline-add-${key}" class="inline-tag-adder hidden">
        <input type="text" id="inline-inp-${key}" placeholder="اكتب الخيار الجديد هنا...">
        <button type="button" onclick="saveInlineTag('${key}', '${targetId}', ${append})">✓ حفظ</button>
      </div>
    </div>
  `;
}

function applyTag(id, val, append) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.value = append ? (inp.value ? inp.value + ' + ' + val : val) : val;
}

function showInlineTagInput(key) {
  const box = document.getElementById('inline-add-' + key);
  if (box) {
    box.classList.toggle('hidden');
    const inp = document.getElementById('inline-inp-' + key);
    if (inp) inp.focus();
  }
}

function saveInlineTag(key, targetId, append) {
  const inp = document.getElementById('inline-inp-' + key);
  if (!inp || !inp.value.trim()) return;
  const val = inp.value.trim();
  if (!db.tags[key].includes(val)) db.tags[key].push(val);
  save();
  const wrap = document.getElementById('cloud-wrap-' + key);
  if (wrap) wrap.outerHTML = tagsCloud(key, targetId, append);
  applyTag(targetId, val, append);
  showToast(`✓ تمت إضافة "${val}"`);
}

function deleteTag(key, idx, targetId, append) {
  db.tags[key].splice(idx, 1);
  save();
  const wrap = document.getElementById('cloud-wrap-' + key);
  if (wrap) wrap.outerHTML = tagsCloud(key, targetId, append);
}

// ======= النوافذ المنزلقة للأقسام =======
function openRepairSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>🔧 استلام جهاز للإصلاح</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">اسم الزبون ورقم هاتفه:</span>
    <div style="display:flex; gap:8px;">
      <input id="sh-rp-name" class="f-input" placeholder="اسم الزبون">
      <input id="sh-rp-ph" type="tel" class="f-input" placeholder="رقم الهاتف">
    </div>
    <span class="f-label">نوع الهاتف:</span>
    ${tagsCloud('brands', 'sh-rp-dev')}
    <input id="sh-rp-dev" class="f-input" placeholder="مثال: Samsung A12">
    <span class="f-label">العطل:</span>
    ${tagsCloud('faults', 'sh-rp-flt', true)}
    <input id="sh-rp-flt" class="f-input" placeholder="العطل">
    <div style="display:flex; gap:8px; margin-top:8px;">
      <input id="sh-rp-pr" type="number" class="f-input" placeholder="السعر المتفق عليه (د)">
      <input id="sh-rp-wait" class="f-input" placeholder="قطعة ناقصة (اختياري)">
    </div>
    <button class="btn-action" onclick="saveRepairSheet()">حفظ واستلام</button>
  `);
}
function saveRepairSheet() {
  const name = document.getElementById('sh-rp-name').value.trim();
  const dev = document.getElementById('sh-rp-dev').value.trim();
  if (!name || !dev) return showToast('⚠️ أدخل اسم الزبون ونوع الهاتف');
  db.repairs.unshift({
    id: Date.now(), name, phone: document.getElementById('sh-rp-ph').value,
    device: dev, fault: document.getElementById('sh-rp-flt').value || 'فحص',
    price: Number(document.getElementById('sh-rp-pr').value) || 0, deposit: 0,
    status: 'in_shop', waitingPart: document.getElementById('sh-rp-wait').value.trim()
  });
  closeSheet(); save(); showToast('✓ تم تسجيل الجهاز');
}

function openRepairActionSheet(id) {
  const r = db.repairs.find(x => x.id === id);
  if (!r) return;
  openSheet(`
    <div class="sheet-title-bar"><strong>🛠️ ${r.device} (${r.name})</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">قطعة غيار ينتظرها من المعلم:</span>
    <input id="ed-rp-wait" class="f-input" value="${r.waitingPart || ''}" placeholder="مثال: شاشة A12">
    <span class="f-label">السعر النهائي (درهم):</span>
    <input id="ed-rp-pr" type="number" class="f-input" value="${r.price}">
    <button class="btn-action" onclick="r_update(${r.id})">حفظ التعديلات</button>
    <div style="display:flex; gap:8px; margin-top:10px;">
      <button class="filter-chip" style="flex:1; padding:11px;" onclick="deliverDevice(${r.id})">🤝 تم التسليم للأرشيف</button>
      ${isAdmin() ? `<button class="btn-danger-soft" onclick="delItem('repairs', ${r.id})">🗑️ حذف</button>` : ''}
    </div>
  `);
}
function r_update(id) {
  const r = db.repairs.find(x => x.id === id);
  if (r) {
    r.waitingPart = document.getElementById('ed-rp-wait').value.trim();
    r.price = Number(document.getElementById('ed-rp-pr').value) || 0;
    closeSheet(); save(); showToast('✓ تم التحديث');
  }
}
function markReady(id) { const r = db.repairs.find(x => x.id === id); if (r) { r.status = 'ready'; r.waitingPart = ''; save(); showToast('✓ نُقل إلى جاهز'); } }
function deliverDevice(id) { const r = db.repairs.find(x => x.id === id); if (r) { r.status = 'archived'; closeSheet(); save(); showToast('✓ نُقل للأرشيف'); } }
function sendWA(id) {
  const r = db.repairs.find(x => x.id === id);
  const ph = (r.phone || '').replace(/\D/g, '').replace(/^0/, '212');
  window.open(`https://wa.me/${ph}?text=${encodeURIComponent(`مرحباً ${r.name}، جهازكم ${r.device} جاهز للاستلام في المحل. المبلغ: ${r.price} درهم.`)}`, '_blank');
}

// الهواتف
function openPhoneSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>📱 إضافة هاتف</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">الماركة والموديل:</span>
    ${tagsCloud('brands', 'sh-ph-m')}
    <input id="sh-ph-m" class="f-input" placeholder="مثال: Samsung A15">
    <span class="f-label">السعة:</span>
    ${tagsCloud('storages', 'sh-ph-s')}
    <input id="sh-ph-s" class="f-input" value="128/6">
    <span class="f-label">اللون:</span>
    ${tagsCloud('colors', 'sh-ph-c')}
    <input id="sh-ph-c" class="f-input" value="أسود">
    <span class="f-label">السعر (درهم):</span>
    <input id="sh-ph-p" type="number" class="f-input" placeholder="1600">
    <button class="btn-action" onclick="savePhoneSheet()">حفظ الهاتف</button>
  `);
}
function savePhoneSheet() {
  const m = document.getElementById('sh-ph-m').value.trim();
  if (!m) return showToast('⚠️ اكتب اسم الهاتف');
  db.phones.unshift({ id: Date.now(), model: m, storage: document.getElementById('sh-ph-s').value, color: document.getElementById('sh-ph-c').value, price: Number(document.getElementById('sh-ph-p').value) || 0, qty: 1, reserved: '' });
  closeSheet(); save(); showToast('✓ تمت إضافة الهاتف');
}

function openEditPhoneSheet(id) {
  const p = db.phones.find(x => x.id === id);
  if (!p) return;
  openSheet(`
    <div class="sheet-title-bar"><strong>📱 ${p.model} (${p.storage})</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">السعر (درهم):</span>
    <input id="ed-ph-pr" type="number" class="f-input" value="${p.price}">
    <span class="f-label">🔒 حجز لزبون / عربون:</span>
    <input id="ed-ph-res" class="f-input" value="${p.reserved || ''}" placeholder="مثال: محجوز لأحمد - عربون 200 د">
    <button class="btn-action" onclick="saveEditPhone(${p.id})">حفظ</button>
    ${isAdmin() ? `<button class="btn-danger-soft" style="width:100%; margin-top:10px;" onclick="delItem('phones', ${p.id})">🗑️ حذف الهاتف نهائياً (للمشرف)</button>` : ''}
  `);
}
function saveEditPhone(id) {
  const p = db.phones.find(x => x.id === id);
  if (p) {
    p.price = Number(document.getElementById('ed-ph-pr').value) || p.price;
    p.reserved = document.getElementById('ed-ph-res').value.trim();
    closeSheet(); save(); showToast('✓ تم الحفظ');
  }
}

// الزجاج
function openGlassSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>🛡️ مجموعة توافق زجاج جديدة</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">الموديلات المتطابقة (افصل بفاصلة):</span>
    ${tagsCloud('brands', 'sh-gl-m', true)}
    <input id="sh-gl-m" class="f-input" placeholder="مثال: Redmi Note 10, Note 10S">
    <button class="btn-action" onclick="saveGlassSheet()">حفظ المجموعة</button>
  `);
}
function saveGlassSheet() {
  const mods = document.getElementById('sh-gl-m').value.split(/[،,+]/).map(s => s.trim()).filter(Boolean);
  if (!mods.length) return showToast('⚠️ اكتب موديلاً واحداً على الأقل');
  db.glassGroups.unshift({ id: Date.now(), models: mods, cells: db.glassTypes.map(() => ({ st: 'green', note: '' })) });
  closeSheet(); save(); showToast('✓ تمت إضافة المجموعة');
}

function openEditGlassGroupSheet(gId) {
  const g = db.glassGroups.find(x => x.id === gId);
  if (!g) return;
  openSheet(`
    <div class="sheet-title-bar"><strong>🛡️ تعديل مجموعة التوافق</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">إضافة أو تعديل الموديلات المتطابقة (افصل بفاصلة):</span>
    ${tagsCloud('brands', 'ed-gl-mods', true)}
    <input id="ed-gl-mods" class="f-input" value="${g.models.join('، ')}">
    <button class="btn-action" onclick="saveEditGlassGroup(${g.id})">حفظ الموديلات</button>
    ${isAdmin() ? `<button class="btn-danger-soft" style="width:100%; margin-top:10px;" onclick="delItem('glassGroups', ${g.id})">🗑️ حذف المجموعة (للمشرف)</button>` : ''}
  `);
}
function saveEditGlassGroup(gId) {
  const g = db.glassGroups.find(x => x.id === gId);
  const mods = document.getElementById('ed-gl-mods').value.split(/[،,+]/).map(s => s.trim()).filter(Boolean);
  if (g && mods.length) { g.models = mods; closeSheet(); save(); showToast('✓ تم تحديث المجموعة'); }
}

function openGlassTypesSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>⚙️ أنواع الأنتي كاس (للمشرف)</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">أسماء الأنواع مفصولة بفاصلة:</span>
    <input id="ed-gl-types" class="f-input" value="${db.glassTypes.join('، ')}">
    <button class="btn-action" onclick="db.glassTypes=document.getElementById('ed-gl-types').value.split(/[،,]/).map(x=>x.trim()).filter(Boolean); closeSheet(); save(); showToast('✓ تم تحديث الأنواع');">حفظ الأنواع</button>
  `);
}

// البوشيط
function openPochetteSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>📲 إضافة موديل بوشيط</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    ${tagsCloud('brands', 'sh-po-m')}
    <input id="sh-po-m" class="f-input" placeholder="مثال: Samsung A07">
    <button class="btn-action" onclick="const v=document.getElementById('sh-po-m').value.trim(); if(v){db.pochettes.unshift({id:Date.now(), model:v, price:25, status:'green', rem:'', need:''}); closeSheet(); save(); showToast('✓ تمت الإضافة');}">حفظ</button>
  `);
}
function openPochetteDetailSheet(id) {
  const p = db.pochettes.find(x => x.id === id);
  openSheet(`
    <div class="sheet-title-bar"><strong>📲 بوشيط ${p.model}</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">شنو باقي عندنا:</span>
    ${tagsCloud('pochetteNotes', 'sh-po-rem', true)}
    <input id="sh-po-rem" class="f-input" value="${p.rem}">
    <span class="f-label">شنو خاص يجيب المعلم:</span>
    ${tagsCloud('pochetteNotes', 'sh-po-need', true)}
    <input id="sh-po-need" class="f-input" value="${p.need}">
    <button class="btn-action" onclick="savePochetteDetail(${p.id})">حفظ</button>
    ${isAdmin() ? `<button class="btn-danger-soft" style="width:100%; margin-top:10px;" onclick="delItem('pochettes', ${p.id})">🗑️ حذف الموديل (للمشرف)</button>` : ''}
  `);
}
function savePochetteDetail(id) {
  const p = db.pochettes.find(x => x.id === id);
  p.rem = document.getElementById('sh-po-rem').value.trim();
  p.need = document.getElementById('sh-po-need').value.trim();
  if (p.need && p.status === 'green') p.status = 'yellow';
  closeSheet(); save(); showToast('✓ تم الحفظ');
}

// الإكسسوارات
function openAccSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>🔌 إضافة إكسسوار</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">القسم:</span>
    ${tagsCloud('accCats', 'sh-ac-cat')}
    <input id="sh-ac-cat" class="f-input" value="كابلات">
    <span class="f-label">النوع / السعة:</span>
    ${tagsCloud('accTypes', 'sh-ac-type')}
    <input id="sh-ac-type" class="f-input" value="Type-C">
    <span class="f-label">الماركة:</span>
    ${tagsCloud('accBrands', 'sh-ac-br')}
    <input id="sh-ac-br" class="f-input" value="عادي">
    <span class="f-label">السعر (درهم):</span>
    <input id="sh-ac-pr" type="number" class="f-input" value="20">
    <button class="btn-action" onclick="saveAccSheet()">حفظ</button>
  `);
}
function saveAccSheet() {
  db.accessories.unshift({
    id: Date.now(), cat: document.getElementById('sh-ac-cat').value,
    type: document.getElementById('sh-ac-type').value, brand: document.getElementById('sh-ac-br').value,
    price: Number(document.getElementById('sh-ac-pr').value) || 20, status: 'green', note: 'متوفر'
  });
  closeSheet(); save(); showToast('✓ تمت إضافة الإكسسوار');
}

function openEditAccSheet(id) {
  const a = db.accessories.find(x => x.id === id);
  if (!a) return;
  openSheet(`
    <div class="sheet-title-bar"><strong>🔌 ${a.cat} ${a.type}</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">ملاحظة للمعلم (مثال: بقي 3 حبات):</span>
    <input id="ed-ac-note" class="f-input" value="${a.note}">
    <span class="f-label">السعر (درهم):</span>
    <input id="ed-ac-pr" type="number" class="f-input" value="${a.price}">
    <button class="btn-action" onclick="a_update(${a.id})">حفظ</button>
    ${isAdmin() ? `<button class="btn-danger-soft" style="width:100%; margin-top:10px;" onclick="delItem('accessories', ${a.id})">🗑️ حذف الصنف (للمشرف)</button>` : ''}
  `);
}
function a_update(id) {
  const a = db.accessories.find(x => x.id === id);
  if (a) {
    a.note = document.getElementById('ed-ac-note').value.trim();
    a.price = Number(document.getElementById('ed-ac-pr').value) || a.price;
    closeSheet(); save(); showToast('✓ تم الحفظ');
  }
}

// طلب زبون سأل ولم نجد (بدون prompt)
function openCustomerReqSheet() {
  openSheet(`
    <div class="sheet-title-bar"><strong>🗣️ زبون سأل ولم نجد</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>
    <span class="f-label">اختر أو اكتب السلعة التي طلبها الزبون:</span>
    ${tagsCloud('brands', 'sh-req-inp', true)}
    <input id="sh-req-inp" class="f-input" placeholder="مثال: بوشيط Poco X6 Pro">
    <button class="btn-action" onclick="const v=document.getElementById('sh-req-inp').value.trim(); if(v){db.requests.push(v); closeSheet(); save(); showToast('✓ أُضيف لقائمة المعلم');}">إضافة للتقرير</button>
  `);
}

// ======= ⚙️ الإعدادات المتقدمة (مظهر وخط للجميع + لوحة تحكم خاصة بالـ Admins) =======
function openSettingsSheet() {
  const admin = isAdmin();
  const adminsNames = db.users.filter(u => u.role === 'admin').map(u => u.name).join('، ');
  const staffNames = db.users.filter(u => u.role !== 'admin').map(u => u.name).join('، ');

  openSheet(`
    <div class="sheet-title-bar"><strong>⚙️ الإعدادات والتحكم</strong><button class="filter-chip" onclick="closeSheet()">✕</button></div>

    <!-- قسم المظهر والخطوط -->
    <div style="background:var(--bg); padding:12px; border-radius:14px; border:1px solid var(--border);">
      <strong style="font-size:0.88rem; color:var(--accent);">🎨 التحكم في الخط والمظهر</strong>
      
      <span class="f-label">حجم الخط (${db.ui.fontSize}px):</span>
      <input type="range" min="13" max="19" step="0.5" value="${db.ui.fontSize}" style="width:100%" oninput="db.ui.fontSize=Number(this.value); applyUISettings();">

      <div style="display:flex; gap:8px; margin-top:8px;">
        <div style="flex:1">
          <span class="f-label">سُمك الخط:</span>
          <select id="ui-weight" class="f-input" onchange="db.ui.fontWeight=this.value; applyUISettings();">
            <option value="400" ${db.ui.fontWeight === '400' ? 'selected' : ''}>خفيف ومريح</option>
            <option value="500" ${db.ui.fontWeight === '500' ? 'selected' : ''}>متوسط (افتراضي)</option>
            <option value="700" ${db.ui.fontWeight === '700' ? 'selected' : ''}>عريض وواضح</option>
          </select>
        </div>
        <div style="flex:1">
          <span class="f-label">كثافة العرض:</span>
          <select id="ui-compact" class="f-input" onchange="db.ui.compact=(this.value==='1'); applyUISettings();">
            <option value="0" ${!db.ui.compact ? 'selected' : ''}>مريح</option>
            <option value="1" ${db.ui.compact ? 'selected' : ''}>مدمج (عناصر أكثر)</option>
          </select>
        </div>
      </div>

      <span class="f-label">لون التطبيق الرئيسي:</span>
      <div style="display:flex; gap:10px; margin-top:6px;">
        ${['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'].map(col => `
          <span onclick="db.ui.accent='${col}'; applyUISettings();" style="width:30px; height:30px; border-radius:50%; background:${col}; cursor:pointer; border:2px solid ${db.ui.accent === col ? '#fff' : 'transparent'}"></span>
        `).join('')}
      </div>
    </div>

    <!-- قسم المشرفين (Admins Only) -->
    ${admin ? `
      <div style="background:var(--bg); padding:12px; border-radius:14px; border:1px solid var(--accent); margin-top:12px;">
        <strong style="font-size:0.88rem; color:var(--accent);">👑 لوحة المشرفين (Admins فقط)</strong>
        
        <span class="f-label">اسم المحل:</span>
        <input id="adm-shop" class="f-input" value="${db.shopName}">

        <span class="f-label">👑 أسماء المشرفين Admins (صلاحيات كاملة وحذف وتعديل):</span>
        <input id="adm-admins" class="f-input" value="${adminsNames}" placeholder="مثال: أنا، المعلم">

        <span class="f-label">👤 أسماء الموظفين العاديين (بدون صلاحية الحذف أو الإعدادات):</span>
        <input id="adm-staff" class="f-input" value="${staffNames}" placeholder="مثال: الموظف 1، الموظف 2">

        <span class="f-label">🔐 الرمز السري للمشرفين (PIN):</span>
        <input id="adm-pin" class="f-input" value="${db.adminPin || '0000'}">

        <button class="btn-action" onclick="saveAdminSettings()">حفظ إعدادات المشرفين</button>
        <button class="btn-danger-soft" style="width:100%; margin-top:10px;" onclick="resetAllDemoData()">⚠️ تصفير السلع التجريبية والبدء من الصفر</button>
      </div>
    ` : `
      <div style="text-align:center; padding:14px; margin-top:12px; background:var(--bg); border-radius:12px; color:var(--muted); font-size:0.84rem;">
        🔒 إعدادات المحل وصلاحيات الحذف متاحة فقط لحسابات المشرفين (Admins).
      </div>
    `}
    <button class="btn-action" style="background:var(--surface-2);" onclick="save(); closeSheet(); showToast('✓ تم حفظ المظهر');">إغلاق وحفظ</button>
  `);
}

function saveAdminSettings() {
  db.shopName = document.getElementById('adm-shop').value.trim() || 'نبض المحل';
  db.adminPin = document.getElementById('adm-pin').value.trim() || '0000';
  const admins = document.getElementById('adm-admins').value.split(/[،,]/).map(s => s.trim()).filter(Boolean).map(name => ({ name, role: 'admin' }));
  const staff = document.getElementById('adm-staff').value.split(/[،,]/).map(s => s.trim()).filter(Boolean).map(name => ({ name, role: 'staff' }));
  if (admins.length) db.users = [...admins, ...staff];
  db.userIdx = 0;
  closeSheet(); save();
  showToast('👑 تم حفظ صلاحيات المشرفين والموظفين');
}

function resetAllDemoData() {
  db.phones = []; db.glassGroups = []; db.pochettes = []; db.accessories = []; db.repairs = []; db.requests = [];
  closeSheet(); save();
  showToast('✓ تم تفريغ السلع التجريبية');
}

function delItem(col, id) {
  if (!isAdmin()) return showToast('🔒 الحذف متاح للمشرفين فقط');
  db[col] = db[col].filter(x => x.id !== id);
  closeSheet(); save();
  showToast('🗑️ تم الحذف');
}

applyUISettings();
render();
