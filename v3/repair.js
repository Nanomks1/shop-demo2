/* ============================================================
   repair.js — الصيانة: الاستلام والتسليم، رقم التذكرة (#A101)،
   تنبيه الديون، إرفاق السلع، الضمان، IMEI، الصور، واتساب،
   دليل أسعار الإصلاح، وشاشة طلبات الزبائن المستقلة.
   يُحمَّل بعد invset.js وقبل report.js.
   ============================================================ */

/* ---------- ثوابت ومساعدات ---------- */
const RK = ['شاشة مكسورة', 'بدون SIM', 'مطفأ لا يشتغل', 'البصمة لا تعمل', 'بدون غطاء'];
const TB = { in: 'في المحل', rd: 'جاهز', nf: 'لم تُصلَّح', dn: 'الأرشيف' };
const tabOf = r => r.st == 'rd' && (r.res == 'fail' || r.res == 'ref') ? 'nf' : r.st;   // «لم تُصلَّح» = تعذّر الإصلاح أو رفض (الحالة تبقى rd)
const FL = [['all', 'الكل'], ['today', 'اليوم'], ['yest', 'البارحة'], ['week', 'هذا الأسبوع'], ['month', 'هذا الشهر'], ['date', 'تاريخ']];
const RES = { ok: 'تم الإصلاح', fail: 'تعذّر الإصلاح', ref: 'رفض الإصلاح' };
const LOC = { m: 'عند المعلم', s: 'الرف' };   // مكان الهاتف داخل المحل (يُخفى من إعدادات الحقول)
const DVO = ['— اختر —', 'جُرِّب مع الزبون وهو يعمل', 'سُلِّم بدون تجربة مع الزبون'];
const WAR_OPTS = [[0, 'بدون ضمان'], [3, '3 أيام'], [7, '7 أيام'], [15, '15 يوم'], [30, '30 يوم']];
const WAR_SEL = ['بدون ضمان (0 يوم)', '3 أيام', '7 أيام', '15 يوم', '30 يوم'];
let ZP = [], ZK = [], ZI = '', ZD = 0, ZR = {}, ZW = 0, GPM = [];
const rf = id => S.rp.find(r => r.id == id);
const rnum = t => waNum(t);
const rph8 = t => rnum(t).slice(-8);
const sn1 = x => /^\s*\d+(\.\d+)?\s*$/.test(x || '');
const d0 = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const dh = p => sn1(p) ? String(p).trim() + ' درهم' : (p || '');
const tOf = r => r.st == 'dn' ? r.t2 : r.st == 'rd' ? (r.t1 || r.t0) : r.t0;
const isLateRp = r => r.st == 'rd' && Math.floor((Date.now() - (r.t1 || r.t0)) / 864e5) > 15;
const inR = t => {
  const f = V.d || 'all', n = d0(Date.now()); if (f == 'all') return 1; if (!t) return 0;
  if (f == 'today') return d0(t) == n; if (f == 'yest') return d0(t) == n - 864e5;
  if (f == 'week') return d0(t) >= n - ((new Date().getDay() + 6) % 7) * 864e5;
  if (f == 'month') { const a = new Date(t), b = new Date(); return a.getMonth() == b.getMonth() && a.getFullYear() == b.getFullYear(); }
  return !V.dt || new Date(t).toLocaleDateString('en-CA') == V.dt;
};
const PI = s => { const p = i => [20 + 40 * (i % 3), 20 + 40 * Math.floor(i / 3)]; return (s.length > 1 ? `<polyline fill="none" stroke="#3b82f6" stroke-width="4" points="${s.map(i => p(i).join(',')).join(' ')}"/>` : '') + [...Array(9).keys()].map(i => `<circle cx="${p(i)[0]}" cy="${p(i)[1]}" r="${s.includes(i) ? 7 : 5}" fill="${s[0] == i ? '#22c55e' : s.includes(i) ? '#3b82f6' : '#94a3b8'}"/>`).join(''); };
const rImg = r => r.img && r.img.startsWith('data:') ? r.img : (IMG[r.id] || '');
const rpText = r => (r.tk ? r.tk + ' #' + r.tk + ' ' : '') + (r.st == 'in' && LOC[r.loc] ? LOC[r.loc] + ' ' : '') + r.name + ' ' + r.tel + ' ' + r.dev + ' ' + r.fault + ' ' + (r.note || '') + ' ' + fxTxt(r) + ' ' + (r.imei || '');
Object.assign(DL0, { rpKeep: 30 });
LM.push(['rpKeep', 'الصيانة: مسح الصورة والرمز بعد التسليم بـ (أيام)']);
FLD.rp = [['cap', 'السعر المتفق'], ['dep', 'العربون'], ['war', 'ضمان الإصلاح'], ['loc', 'مكان الهاتف (عند المعلم / الرف)'], ['lock', 'PIN'], ['pat', 'نمط القفل'], ['img', 'الصورة'], ['chk', 'حالة الجهاز'], ['imei', 'IMEI'], ['note', 'الملاحظة']];
FLDN.rp = 'الصيانة';

/* ---------- نظام رقم التذكرة القصير (#A101 .. #Z999) ---------- */
const tkCode = n => { n = Math.max(1, Math.floor(+n || 1)) - 1; return String.fromCharCode(65 + (Math.floor(n / 899) % 26)) + (101 + (n % 899)); };
const tkParse = c => { const m = String(c || '').trim().match(/^#?([A-Z])(\d{3})$/i); return m ? (m[1].toUpperCase().charCodeAt(0) - 65) * 899 + (+m[2] - 100) : 0; };
function tkMax() {
  let mx = +(S.cfg && S.cfg.tkSeq) || 0;
  S.rp.forEach(r => { const n = tkParse(r.tk); if (n > mx) mx = n; });
  (S.trash || []).forEach(t => { if (t.coll == 'rp' && t.obj) { const n = tkParse(t.obj.tk); if (n > mx) mx = n; } });
  return mx;
}
function nextTk() { const n = tkMax() + 1; S.cfg.tkSeq = n; return tkCode(n); }
function fixDupTk() {
  const seen = {}; let chg = 0;
  S.rp.slice().sort((a, b) => (a.t0 || 0) - (b.t0 || 0)).forEach(r => {
    if (!r.tk) { if (r.st != 'dn') { r.tk = nextTk(); chg = 1; } return; }
    if (seen[r.tk]) { const base = r.tk.replace(/-\d+$/, ''); let n = 2; while (seen[base + '-' + n]) n++; r.tk = base + '-' + n; chg = 1; }
    seen[r.tk] = r.id;
  });
  const mx = tkMax(); if ((S.cfg.tkSeq || 0) < mx) { S.cfg.tkSeq = mx; chg = 1; }
  return chg;
}

/* ---------- فحص ديون الزبون المفتوحة ---------- */
function rpDebts(tel, name) { return typeof dbtCustOpen == 'function' ? dbtCustOpen(tel, name) : []; }
const rpDebtSum = L => L.reduce((a, d) => a + (typeof dRem == 'function' ? dRem(d) : Math.max(0, (+d.amt || 0))), 0);

/* ---------- الضمان ---------- */
function warInfo(r) {
  const w = +r.war || 0; if (!w || r.res == 'fail' || r.res == 'ref') return null;
  if (r.st != 'dn' || !r.t2) return { active: true, daysLeft: w, label: `الضمان المقرر: ${w} يوم` };
  const end = r.t2 + w * 864e5, rem = Math.ceil((end - Date.now()) / 864e5), endStr = new Date(end).toLocaleDateString('ar-MA');
  return rem > 0 ? { active: true, daysLeft: rem, label: `تحت الضمان: باقي ${rem} يوم (لغاية ${endStr})` } : { active: false, daysLeft: 0, label: `انتهى الضمان (${w} يوم — انتهى ${endStr})` };
}
const warToLbl = d => { d = +d || 0; if (!d) return WAR_SEL[0]; const f = WAR_OPTS.find(x => x[0] === d); return f ? f[1] : d + ' يوم'; };
const lblToWar = s => { const m = String(s || '').match(/\d+/); return m ? +m[0] : 0; };

/* ---------- تنظيف الصور والرموز بعد مرور rpKeep يوماً على التسليم + ضمان فرادة التذاكر ---------- */
function cleanOldRpMedia() {
  const now = Date.now(), base = lim('rpKeep') * 864e5; let chg = fixDupTk();
  S.rp.forEach(r => {
    if (r.st != 'dn' || !r.t2) return;
    if (now - r.t2 > base && (r.img || IMG[r.id] || r.lock || (r.pat && r.pat.length))) {
      r.img = ''; r.lock = ''; r.pat = []; MEDIA.del(r.id).catch(e => errLog('حذف صورة قديمة: ' + (e && e.message || e))); delete IMG[r.id]; chg = 1;
    }
  });
  if (chg) save();
}
cleanOldRpMedia();

/* ---------- بطاقة الصيانة (مرتبة وأزرارها واضحة) ---------- */
function rc(r) {
  const n = Math.floor((Date.now() - r.t0) / 864e5), w = r.st == 'rd' ? Math.floor((Date.now() - (r.t1 || r.t0)) / 864e5) : 0, i = r.id, im = rImg(r), wi = warInfo(r);
  const bCls = w > 15 || (r.st == 'rd' && r.res == 'fail') ? 'rp-late' : r.st == 'rd' && r.res == 'ok' ? 'rp-ok' : r.st == 'in' ? 'rp-in' : '';
  const oDebts = r.st != 'dn' ? rpDebts(r.tel, r.name) : [], oSum = oDebts.length ? rpDebtSum(oDebts) : 0;
  const B = (t, f, p) => `<button class="btn ${p ? '' : 's'} sm" onclick="${f}">${t}</button>`;
  const locHtml = r.st == 'in' && shown('rp', 'loc') ? `<span style="display:inline-flex;gap:4px">${Object.keys(LOC).map(k => `<button class="tag ${r.loc == k ? 'on' : ''}" style="margin:0;padding:3px 9px;font-size:.76rem" onclick="rLoc('${i}','${k}')">${LOC[k]}</button>`).join('')}</span>` : '';
  return `<div class="card ${bCls}"><div class="row2">${im ? `<img onclick="rpZoom('${i}')" src="${im}" style="cursor:pointer;width:56px;height:56px;object-fit:cover;border-radius:10px">` : ''}<div style="flex:1"><b>${r.tk ? `<span class="tk-b">#${esc(r.tk)}</span>` : ''}${esc(r.name)}</b><div class="m">${esc(r.dev)} — ${esc(r.fault)}</div></div>${locHtml}${(r.pat || []).length > 1 ? `<svg viewBox="0 0 120 120" width="48">${PI(r.pat)}</svg>` : ''}</div>`
    + (r.note ? `<div class="rnote" onclick="rNote('${i}')" title="اضغط لتعديل الملاحظة">${I('chat')}<span>${esc(r.note)}</span></div>` : '')
    + `<div class="row2" style="margin-top:4px;flex-wrap:wrap;gap:6px"><span class="m"><bdi>${esc(r.tel)}</bdi> · استلام: <bdi>${fd(r.t0)}</bdi> · ${esc(r.by)}${n && r.st != 'dn' ? ' · منذ ' + n + ' يوم' : ''}</span>${r.cap ? `<span class="cmp-pr" style="margin-inline-start:auto">السعر: ${esc(dh(r.cap))}${r.dep ? ' (عربون ' + esc(r.dep) + ')' : ''}</span>` : (r.dep ? `<span class="m" style="margin-inline-start:auto">العربون: ${esc(r.dep)}</span>` : '')}</div>`
    + (r.st == 'dn' ? `<div class="m">تسليم: <bdi>${fd(r.t2)}</bdi> · ${esc(r.dby || '')} · المقبوض: <b>${esc(dh(r.paid))}</b></div>` : '') + (typeof dbtRp == 'function' ? dbtRp(r) : '')
    + (oSum > 0 ? `<div class="rs" style="color:#dc2626;cursor:pointer" onclick="go('dbt')">${I('alert')} تنبيه: على هذا الزبون دين مفتوح (${oSum} درهم)</div>` : '')
    + ((r.chk || []).length ? `<div class="m">الحالة: ${esc(r.chk.join('، '))}</div>` : '') + (r.lock ? `<div class="m">PIN: ${esc(r.lock)}</div>` : '') + (w > 15 ? `<div class="rs">منسي منذ ${w} يوم</div>` : '')
    + ((r.calls || []).length ? `<div class="m">اتصالات: ${r.calls.length}</div>` : '') + (r.st != 'in' && r.res ? (r.st == 'rd' && r.res != 'ok' ? `<div style="color:#dc2626;font-weight:700">${RES[r.res]}</div>` : `<div class="m">${RES[r.res]}</div>`) : '')
    + fxShow(r) + (r.imei ? `<div class="m">IMEI: <bdi>${esc(r.imei)}</bdi></div>` : '') + (wi ? `<div class="m" style="color:${wi.active ? '#16a34a' : '#64748b'};font-weight:700">${I('shield')} ${esc(wi.label)}</div>` : '')
    + (r.st == 'dn' ? (r.tst ? `<div class="m" style="color:#16a34a;font-weight:700">${I('check')} جُرِّب مع الزبون وسُلِّم مصلوحاً (${esc(r.dby || '')})</div>` : (r.res == 'ok' ? '<div class="m">سُلِّم بدون توثيق التجربة</div>' : '')) + (r.dnote ? `<div class="m">ملاحظة التسليم: ${esc(r.dnote)}</div>` : '') : '')
    + (r.st == 'in' ? `<div class="sub">${B('مصلوح', `rSt('${i}','ok')`, 1)}${B('غير مصلوح', `rSt('${i}','fail')`)}${B('رفض', `rSt('${i}','ref')`)}</div>`
      : r.st == 'rd' ? `<div class="sub">${B('تسليم', `rDV('${i}')`, 1)}${B('إبلاغ واتساب', `rWA('${i}')`)}${B('اتصلت', `rCL('${i}')`)}${B('إرجاع للمحل', `rSt('${i}','in')`)}</div>` : '')
    + `<div class="sub">${r.tel ? `<a href="tel:${esc(r.tel)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">${I('phone')} اتصال</a>` : ''}${r.st != 'dn' && !r.note ? B('+ ملاحظة', `rNote('${i}')`) : ''}${B('تعديل', `rEd('${i}')`)}<button class="btn s sm" style="flex:0 0 auto;padding:0 12px;color:#ef4444" onclick="rDel('${i}')">حذف</button></div></div>`;
}
function rpList() {
  const q = nz(V.q || ''), tab = V.tab || 'in', all = V.all && q, sf = V.sf || '';
  let a = S.rp.filter(r => (all || tabOf(r) == tab) && inR(tOf(r)) && (!q || nzOf(r, rpText).includes(q)));
  if (!all) {
    if (sf == 'late' && (tab == 'rd' || tab == 'nf')) a = a.filter(isLateRp);
    else if (sf == 'war' && tab == 'dn') a = a.filter(r => { const w = warInfo(r); return w && w.active; });
    else if ((sf == 'm' || sf == 's') && tab == 'in') a = a.filter(r => r.loc == sf);
  }
  a.sort((x, y) => tOf(y) - tOf(x));
  const limN = V.rlim || 40, vis = a.slice(0, limN);
  const moreBtnHtml = a.length > limN ? `<button class="btn s" onclick="V.rlim=(V.rlim||40)+40;rpL()">عرض المزيد (+${a.length - limN} متبقية)</button>` : '';
  return (vis.map(rc).join('') + moreBtnHtml) || emptyBox('لا توجد هواتف صيانة في هذا الفلتر', 'اضغط على «+ استلام هاتف» في الأعلى لتسجيل جهاز جديد');
}
const rpL = () => { if ($('rl')) $('rl').innerHTML = rpList(); };

function rpSubFiltersHtml(tab) {
  const sf = V.sf || '';
  if (tab == 'in' && shown('rp', 'loc')) {
    const mCnt = S.rp.filter(r => r.st == 'in' && r.loc == 'm').length;
    const sCnt = S.rp.filter(r => r.st == 'in' && r.loc == 's').length;
    if (!mCnt && !sCnt) return '';
    return `<div class="sec-tags" style="padding:6px 0 0;border:0">`
      + `<button class="tag ${!sf ? 'on' : ''}" onclick="V.sf='';render()">الكل</button>`
      + `<button class="tag ${sf == 'm' ? 'on' : ''}" onclick="V.sf=V.sf=='m'?'':'m';render()">عند المعلم (${mCnt})</button>`
      + `<button class="tag ${sf == 's' ? 'on' : ''}" onclick="V.sf=V.sf=='s'?'':'s';render()">في الرف (${sCnt})</button>`
      + `</div>`;
  }
  if (tab == 'rd' || tab == 'nf') {
    const lateCnt = S.rp.filter(r => tabOf(r) == tab && isLateRp(r)).length;
    if (!lateCnt && sf != 'late') return '';
    return `<div class="sec-tags" style="padding:6px 0 0;border:0">`
      + `<button class="tag ${!sf ? 'on' : ''}" onclick="V.sf='';render()">الكل</button>`
      + `<button class="tag ${sf == 'late' ? 'on' : ''}" onclick="V.sf=V.sf=='late'?'':'late';render()">${I('alert')} منسي +15 يوم (${lateCnt})</button>`
      + `</div>`;
  }
  if (tab == 'dn') {
    const warCnt = S.rp.filter(r => r.st == 'dn' && (warInfo(r) || {}).active).length;
    if (!warCnt && sf != 'war') return '';
    return `<div class="sec-tags" style="padding:6px 0 0;border:0">`
      + `<button class="tag ${!sf ? 'on' : ''}" onclick="V.sf='';render()">كل الأرشيف</button>`
      + `<button class="tag ${sf == 'war' ? 'on' : ''}" onclick="V.sf=V.sf=='war'?'':'war';render()">${I('shield')} تحت الضمان (${warCnt})</button>`
      + `</div>`;
  }
  return '';
}

VW.rp = () => {
  const tab = V.tab || 'in';
  return {
    t: 'الصيانة',
    h: `<div class="row2" style="gap:8px"><button class="btn" style="width:auto;flex:2" onclick="rEd(null)">+ استلام هاتف</button><button class="btn s" style="width:auto;flex:1" onclick="go('gd')">دليل الأسعار</button></div>`
      + `<div class="sec-panel">`
      + `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding-bottom:10px;border-bottom:1px dashed var(--b)">`
      + Object.keys(TB).map(k => {
        const cnt = S.rp.filter(r => tabOf(r) == k).length, on = tab == k;
        return `<button class="tag ${on ? 'on' : ''}" style="margin:0;justify-content:center;flex-direction:column;gap:2px;padding:7px 2px;border-radius:11px;font-size:.84rem;line-height:1.25" onclick="V.tab='${k}';V.sf='';V.rlim=40;render()"><span>${TB[k]}</span><b style="font-size:.98rem;color:${on ? '#fff' : 'var(--p)'}">${cnt}</b></button>`;
      }).join('')
      + `</div>`
      + rpSubFiltersHtml(tab)
      + `<input style="margin:10px 0 6px" placeholder="ابحث: تذكرة (A101)، اسم، رقم، جهاز، عطل" value="${esc(V.q)}" oninput="V.q=this.value;V.rlim=40;rpL()">`
      + `<div class="row2" style="gap:6px"><select style="flex:1;margin:0" aria-label="التاريخ" onchange="V.d=this.value;V.rlim=40;render()">${FL.map(([k, l]) => `<option value="${k}" ${(V.d || 'all') == k ? 'selected' : ''}>${k == 'all' ? 'كل التواريخ' : l}</option>`).join('')}</select><button class="tool-pill ${V.all ? 'on' : ''}" onclick="V.all=!V.all;render()">كل التبويبات</button></div>`
      + `${V.d == 'date' ? `<input type="date" style="margin-top:6px" value="${V.dt || ''}" onchange="V.dt=this.value;render()">` : ''}`
      + `</div>`
      + `<div id="rl">${rpList()}</div>`
  };
};

/* ---------- تغيير الحالة، الاتصال، الحذف ---------- */
function rSt(id, x) {
  const r = rf(id);
  commit(x == 'in' ? 'عاد إلى «في المحل»' : x == 'ok' ? 'انتقل إلى «جاهز»' : 'انتقل إلى «لم تُصلَّح»', () => { if (x == 'in') { r.st = 'in'; r.res = ''; } else { r.st = 'rd'; r.res = x; r.t1 = Date.now(); } r.loc = ''; r.lb = S.me; });
}
function rNote(id) {   // تعديل سريع للملاحظة دون فتح نموذج التعديل الكامل
  const r = rf(id); if (!r) return;
  $('sh').innerHTML = `<div class="bar"></div><h3 style="color:var(--t)">ملاحظة — ${esc((r.tk ? '#' + r.tk + ' ' : '') + r.name)}</h3><textarea id="rn_t" rows="4" placeholder="اكتب ملاحظة عن هذا الهاتف…">${esc(r.note || '')}</textarea><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish($('rn_t').value.trim())">حفظ</button></div>`;
  sheetOpen(v => { if (v === null) return; commit(v ? 'تم حفظ الملاحظة' : 'تم مسح الملاحظة', () => { r.note = v; r.lb = S.me; }); });
  setTimeout(() => { const t = $('rn_t'); if (t) t.focus(); }, 80);
}
function rLoc(id, k) {
  const r = rf(id); if (!r || !LOC[k]) return;
  const off = r.loc == k;
  commit(off ? 'أُلغي مكان الهاتف' : 'مكان الهاتف: ' + LOC[k], () => { r.loc = off ? '' : k; r.lb = S.me; });
}
function rCL(id) { const r = rf(id); commit('تم تسجيل الاتصال', () => (r.calls = r.calls || []).push(fd(Date.now()) + ' ' + S.me)); }
function rDel(id) { const r = rf(id); del('rp', id, (r.tk ? '#' + r.tk + ' ' : '') + r.name + ' — ' + r.dev); }

/* ---------- إرفاق سلعة من المخزون عند تسليم الصيانة ---------- */
function rpAddonOpts(dev) {
  const out = [{ k: '', l: '— بدون إرفاق سلعة —' }], nd = nz(dev || '');
  if (nd.length >= 2) {
    S.gg.filter(g => g.models.some(m => { const nm = nz(m); return nm && (nd.includes(nm) || nm.includes(nd)); })).forEach(g => {
      const mName = g.models.find(m => { const nm = nz(m); return nm && (nd.includes(nm) || nm.includes(nd)); }) || g.models[0];
      S.tags.glass.forEach((ty, j) => {
        const it = gitem(g.id, ty), tot = it ? gTot(it, g) : 0;
        if (tot > 0) out.push({ k: `gl:${g.id}:${j}:${mName}`, l: `أنتي كاس ${ty} (${mName})${it && it.price ? ' — ' + dh(it.price) : ''}` });
      });
    });
    S.items.filter(i => i.sec == 'case' && (nd.includes(nz(i.name)) || nz(i.name).includes(nd))).forEach(i => {
      (i.v || []).filter(v => v.n > 0).forEach(v => {
        const vl = [v.g, v.c].filter(Boolean).join('·') || 'عام';
        out.push({ k: `cs:${i.id}:${v.id}`, l: `بوشيط ${i.name} (${vl}) — متوفر ${v.n}` });
      });
    });
  }
  return out;
}
function applyRpAddon(opt) {
  if (!opt || !opt.k) return '';
  const p = opt.k.split(':');
  if (p[0] == 'gl') {
    const g = S.gg.find(x => x.id == p[1]), ty = S.tags.glass[+p[2]], m = p.slice(3).join(':');
    if (g && ty) {
      const i = glGet(g.id, ty);
      const tM = mval(i, m) > 0 ? m : (g.models.find(x => mval(i, x) > 0) || m);
      if (i.stock && i.stock[tM] > 0) {
        i.stock[tM]--;
      } else if (i.lv && i.lv[tM] && i.lv[tM] != 'r') {
        const step = { a: 'b', b: 'c', c: 'y', y: 'r' };
        i.lv[tM] = step[i.lv[tM]] || 'r';
      }
      touch(i);
      return 'أنتي كاس ' + ty + ' (' + m + ')';
    }
  } else if (p[0] == 'cs') {
    const i = find(p[1]), v = i && (i.v || []).find(x => x.id == p[2]);
    if (v && v.n > 0) { v.n--; touch(i); return 'بوشيط ' + i.name + ' (' + ([v.g, v.c].filter(Boolean).join('·') || 'عام') + ')'; }
  } else if (p[0] == 'ac') {
    const i = find(p[1]);
    if (i && i.cnt > 0) { i.cnt--; touch(i); return acName(i); }
  }
  return '';
}

/* التسليم: تجربة مع الزبون (إجبارية عند الإصلاح) + المتبقي بعد العربون + مدة الضمان + إرفاق سلعة + تنبيه دين */
function rDV(id, pre) {
  const r = rf(id), pr = pre || {}, cap = sn1(r.cap) ? +r.cap : null, dep = sn1(r.dep) ? +r.dep : 0;
  const def = (r.res == 'ok' && cap !== null) ? String(Math.max(0, cap - dep)) : '';
  const addons = rpAddonOpts(r.dev);
  const oDebts = rpDebts(r.tel, r.name), oSum = oDebts.length ? rpDebtSum(oDebts) : 0;
  const debtHint = oSum > 0 ? ` [تنبيه: عليه دين سابق ${oSum} درهم]` : '';
  const lbl = (def ? (dep ? 'المتبقي ' + def + ' (السعر ' + cap + ' − العربون ' + dep + ') — هل هو المقبوض الآن؟ عدّله إن اختلف' : 'هل المبلغ المقبوض هو ' + def + ' ؟ عدّله إن اختلف')
    : (dep ? 'المبلغ المقبوض الآن (العربون ' + r.dep + ' مقبوض سابقاً — اكتب 0 إن لم يُقبض شيء)' : 'المبلغ المقبوض (0 إن لم يُقبض شيء)')) + debtHint + (addons.length > 1 ? ' — وإن أرفقتَ سلعة فأضف ثمنها' : '');
  const F = [{ k: 'p', l: lbl, t: 'tel', v: pr.p ?? def }];
  if (r.res == 'ok') {
    const cur = warToLbl(pr.war ?? r.war ?? 0), wo = WAR_SEL.includes(cur) ? WAR_SEL : [cur, ...WAR_SEL];
    F.unshift({ k: 'tested', l: (pr.err ? 'مطلوب، اختر أحد الخيارين: ' : '') + 'تجربة الإصلاح مع الزبون قبل التسليم (إجباري)', t: 'sel', o: DVO, v: pr.tested || DVO[0] }, { k: 'war', l: 'مدة ضمان الإصلاح (يبدأ اليوم)', t: 'sel', o: wo, v: cur });
  }
  if (addons.length > 1) F.push({ k: 'addon', l: 'إرفاق سلعة من المخزون مع التسليم (تُخصم تلقائياً)', t: 'sel', o: addons.map(x => x.l), v: pr.addon || addons[0].l });
  F.push({ k: 'dnote', l: 'ملاحظة عند التسليم (اختياري)', v: pr.dnote ?? (r.dnote || '') });
  return ask('تسليم الهاتف: ' + (r.tk ? '#' + r.tk + ' ' : '') + r.name, F, 'تأكيد التسليم').then(v => {
    if (!v) return;
    const again = e => rDV(id, { p: v.p, dnote: v.dnote, tested: v.tested, war: lblToWar(v.war), addon: v.addon, err: e });
    if (r.res == 'ok' && v.tested == DVO[0]) return again(1);
    if (v.p.trim() !== '' && !sn1(v.p)) { toast('اكتب المبلغ رقماً فقط (مثال 100)'); return again(0); }
    const picked = addons.find(x => x.l == v.addon);
    commit('تم التسليم', () => {
      const addTxt = applyRpAddon(picked);
      r.st = 'dn'; r.t2 = Date.now(); r.dby = S.me; r.paid = v.p.trim() || '0';
      r.tst = v.tested == DVO[1] ? Date.now() : 0; if (r.res == 'ok') r.war = lblToWar(v.war);
      const dn = (v.dnote || '').trim();
      r.dnote = [dn, addTxt ? 'مرفق: ' + addTxt : ''].filter(Boolean).join(' · ');
    });
  });
}
/* واتساب: إبلاغ الزبون بجاهزية الهاتف فقط (مع رقم التذكرة وIMEI والضمان) */
function rWA(id) {
  const r = rf(id); if (!r || !rnum(r.tel)) return toast('لا يوجد رقم لهذا الزبون: عدّل السجل وأضف الرقم');
  const c = sn1(r.cap) ? ' تكلفة الإصلاح: ' + r.cap.trim() + (r.dep ? '، العربون: ' + r.dep : '') + '.' : '';
  const dev = r.dev + (r.tk ? ` (تذكرة #${r.tk})` : '') + (r.imei ? ` [IMEI: ${r.imei}]` : '') + ((+r.war > 0 && r.res == 'ok') ? ` (الضمان: ${r.war} يوم)` : '');
  const s = r.res == 'ok' ? `هاتفك ${dev} جاهز في المحل.${c}` : r.res == 'fail' ? `للأسف تعذّر إصلاح هاتفك ${dev}. يمكنك استلامه من المحل.` : `هاتفك ${dev} جاهز للاستلام بدون إصلاح.`;
  location.href = 'https://wa.me/' + rnum(r.tel) + '?text=' + encodeURIComponent(`مرحباً ${r.name}، ${s}\n— محل عزيز`);
}

/* ---------- قوائم الإكمال التلقائي (الزبائن والأجهزة) ---------- */
function rpSugData() {
  const names = new Map(), devs = new Set();
  [...(S.rp || []), ...(S.debt || []), ...(S.used || [])].forEach(x => {
    if (x.name && x.tel && !names.has(x.name)) names.set(x.name, x.tel);
    if (x.dev) devs.add(x.dev.trim());
  });
  (S.items || []).forEach(i => { if (i.sec == 'phones') devs.add((i.brand + ' ' + i.name).trim()); });
  (S.guide || []).forEach(g => { if (g.m) devs.add(g.m.trim()); });
  return { names: [...names.keys()], devs: [...devs] };
}
SUG.rn = () => rpSugData().names.slice(0, 40);
SUG.rd = () => rpSugData().devs.slice(0, 50);
function rpDatalists() { return ''; }   // قديمة: صار الإكمال داخل التطبيق

function rEd(id) { const rec = id ? rf(id) : {}; $('sh').innerHTML = ''; sheetOpen(v => rDone(v, rec)); rForm(rec); }
function rForm(rec) {
  ZR = rec; ZP = [...(rec.pat || [])]; ZK = [...(rec.chk || [])]; ZI = rec.img || ''; ZW = +(rec.war ?? 0);
  fsInit([], {}, 'rp', rec);
  const shownImg = ZI.startsWith('data:') ? ZI : (rec.id && IMG[rec.id]) || '';
  const lockOpen = rec.lock || (rec.pat && rec.pat.length) ? ' open' : '';
  const tkShow = rec.tk || '';
  const moreOpen = (rec.imei || ZI || +rec.war) ? ' open' : '';
  $('sh').innerHTML = `<div class="bar"></div><div class="row2"><h3 style="color:var(--t);margin:0;flex:1">${rec.id ? 'تعديل صيانة' : 'استلام هاتف'}</h3>${tkShow ? `<span class="tk-b" style="font-size:1.05rem;padding:4px 12px" title="اكتب هذا الرقم على ملصق الهاتف">#${esc(tkShow)}</span>` : '<span class="m" style="font-size:.82rem">رقم التذكرة يظهر بعد الحفظ</span>'}</div>`
    + rpDatalists()
    + `<div class="row2" style="gap:8px;align-items:flex-end"><label style="flex:1">اسم الزبون<input id="r_n" data-sug="rn" value="${esc(rec.name || '')}" oninput="rH(1)"></label><label style="flex:1">رقم الهاتف<input id="r_t" type="tel" value="${esc(rec.tel || '')}" oninput="rH()"></label></div><div id="rh" class="m" style="margin-top:4px"></div>`
    + `<label>نوع الهاتف (اكتب أو اختر الماركة تحته)<input id="r_v" data-sug="rd" value="${esc(rec.dev || '')}" placeholder="مثال: Samsung A15" oninput="syncRpTags();checkDeviceHistory();suggestGuidePrice()"></label>`
    + `<div id="rp_br_tags" style="margin:4px 0 6px">${S.tags.brand.map((b, j) => `<button type="button" class="tag rp-br-tg" onclick="pickRpBrand(${j})">${esc(b)}</button>`).join('')}</div><div id="rp_dev_hist" class="m" style="color:#d97706;font-weight:700"></div>`
    + `<label>العطل / المشكل (اكتب أو اختر من الأعطال تحته)<input id="r_f" value="${esc(rec.fault || '')}" placeholder="مثال: تغيير شاشة" oninput="syncRpTags();suggestGuidePrice()"></label>`
    + `<div id="rp_fl_tags" style="margin:4px 0 6px">${S.tags.fault.map((x, j) => `<button type="button" class="tag rp-fl-tg" onclick="pickRpFault(${j})">${esc(x)}</button>`).join('')}</div>`
    + `<div id="rp_price_hint" style="margin:4px 0"></div>`
    + `<div class="row2" style="gap:8px;align-items:flex-end"><label style="flex:1.3"${hh('rp', 'cap')}>السعر المتفق (أو: اتصل)<input id="r_c" value="${esc(rec.cap || '')}" placeholder="مثال: 150"></label><label style="flex:1"${hh('rp', 'dep')}>العربون (اختياري)<input id="r_d" type="tel" value="${esc(rec.dep || '')}" placeholder="0"></label></div>`
    + `<div${hh('rp', 'chk')}><label>حالة الجهاز عند الاستلام</label><div id="rk"></div></div>`
    + `<label${hh('rp', 'note')}>ملاحظة (اختياري) — تظهر بارزة على البطاقة<textarea id="r_o" rows="2">${esc(rec.note || '')}</textarea></label>`
    + `<details class="card" style="padding:10px 12px;margin-top:12px"${moreOpen}><summary><b>تفاصيل إضافية</b> <span class="m">(الضمان، الصورة، IMEI)</span></summary>`
    + `<label${hh('rp', 'war')}>ضمان الإصلاح (يبدأ من تاريخ التسليم)<div style="margin:4px 0">${WAR_OPTS.map(([d, l]) => `<button type="button" class="tag war-tg ${ZW === d ? 'on' : ''}" onclick="setRpWar(${d})">${l}</button>`).join('')}</div><input id="r_war" type="tel" value="${ZW || ''}" placeholder="أو اكتب عدد أيام الضمان (0 = بدون ضمان)" oninput="setRpWar(+this.value||0,1)"></label>`
    + `<label${hh('rp', 'imei')}>IMEI / الرقم التسلسلي (اختياري)<div class="row2" style="margin-top:4px"><input id="r_imei" value="${esc(rec.imei || '')}" placeholder="امسح باركود العلبة أو *#06#" style="flex:1"><button type="button" class="btn s sm" onclick="scanIntoInput('r_imei')">${I('scan')} مسح</button></div></label>`
    + `<div${hh('rp', 'img')}><label>صورة الهاتف</label><div class="row2"><button type="button" class="btn s sm" onclick="rCam()">التقاط صورة</button><button type="button" class="btn s sm" onclick="$('r_i').click()">من المعرض</button><button type="button" id="r_imx" class="btn s sm" onclick="rImDel()" ${shownImg ? '' : 'hidden'}>حذف الصورة</button></div><img id="r_im" ${shownImg ? `src="${shownImg}"` : 'hidden'} style="width:100%;border-radius:10px;margin-top:8px"><input id="r_i" type="file" accept="image/*" hidden onchange="rIM(this.files[0])"></div>`
    + `<div id="fx"></div></details>`
    + `<details class="card" style="padding:10px 12px;margin-top:10px"${lockOpen}><summary><b>بيانات القفل</b> <span class="m">(PIN، نمط القفل)</span></summary><label${hh('rp', 'lock')}>رمز PIN (إن وجد)<input id="r_l" value="${esc(rec.lock || '')}"></label>`
    + `<div${hh('rp', 'pat')}><label>نمط القفل (ارسمه بإصبعك)</label><svg id="zsv" viewBox="0 0 120 120" width="150" style="touch-action:none;background:var(--bg);border-radius:12px" onpointerdown="ZD=1;rP(event,1)" onpointermove="if(ZD)rP(event)" onpointerup="ZD=0" onpointercancel="ZD=0">${PI(ZP)}</svg> <button type="button" class="btn s sm" onclick="ZP=[];$('zsv').innerHTML=PI(ZP)">مسح</button></div></details>`
    + `<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="rSave()">حفظ</button></div>`;
  rKc(); rH(); fxR(); syncRpTags(); checkDeviceHistory(); suggestGuidePrice();
}

/* تلوين وسوم الماركات والأعطال المختارة تلقائياً ليعرف المستخدم ما ضغط عليه */
function syncRpTags() {
  const dev = (($('r_v') || {}).value || '').trim().toLowerCase();
  document.querySelectorAll('.rp-br-tg').forEach((btn, j) => {
    const b = String(S.tags.brand[j] || '').toLowerCase();
    btn.classList.toggle('on', !!b && dev.startsWith(b));
  });
  const pts = (($('r_f') || {}).value || '').split('،').map(s => s.trim()).filter(Boolean);
  document.querySelectorAll('.rp-fl-tg').forEach((btn, j) => {
    btn.classList.toggle('on', pts.includes(S.tags.fault[j]));
  });
}

function setRpWar(d, typing) {
  ZW = +d || 0; if (!typing && $('r_war')) $('r_war').value = ZW || '';
  document.querySelectorAll('.war-tg').forEach((b, k) => b.classList.toggle('on', WAR_OPTS[k] && WAR_OPTS[k][0] === ZW));
}
function rP(e, d) { const b = $('zsv').getBoundingClientRect(), x = (e.clientX - b.left) / b.width * 120, y = (e.clientY - b.top) / b.height * 120; if (d) ZP = []; for (let i = 0; i < 9; i++) if (!ZP.includes(i) && Math.hypot(20 + 40 * (i % 3) - x, 20 + 40 * Math.floor(i / 3) - y) < 14) ZP.push(i); $('zsv').innerHTML = PI(ZP); }
function rShowIm() { const m = $('r_im'); if (!m) return; m.src = ZI; m.hidden = false; if ($('r_imx')) $('r_imx').hidden = false; }
function rImDel() { ZI = ''; const m = $('r_im'); if (m) { m.hidden = true; m.removeAttribute('src'); } if ($('r_imx')) $('r_imx').hidden = true; }
function rIM(f) { if (!f) return; const im = new Image(); im.onload = () => { const k = Math.min(1, 560 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); ZI = c.toDataURL('image/jpeg', .55); rShowIm(); }; im.src = URL.createObjectURL(f); }
/* كاميرا داخل النموذج (بدل اختيار ملف) — إن لم تُمنح الصلاحية نعود لاختيار الملف */
let CAMS = null;
function camStop() { if (CAMS) { CAMS.getTracks().forEach(t => t.stop()); CAMS = null; } const b = $('cam_box'); if (b) b.remove(); }
function rCam() {
  if ($('cam_box')) return camStop();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return $('r_i').click();
  $('r_im').insertAdjacentHTML('beforebegin', '<div id="cam_box" class="card" style="margin:8px 0;padding:10px;text-align:center"><video id="cam_v" autoplay playsinline muted style="width:100%;border-radius:12px"></video><div class="row2" style="margin-top:8px"><button type="button" class="btn sm" style="flex:1" onclick="camSnap()">التقاط</button><button type="button" class="btn s sm" onclick="camStop()">إلغاء</button></div></div>');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
    const v = $('cam_v'); if (!v) { s.getTracks().forEach(t => t.stop()); return; } CAMS = s; v.srcObject = s;
  }).catch(e => { camStop(); toast(camErr(e), 0, 15000); $('r_i').click(); });
}
function camSnap() {
  const v = $('cam_v'); if (!v || !v.videoWidth) return toast('انتظر ظهور الصورة ثم اضغط التقاط');
  const k = Math.min(1, 560 / Math.max(v.videoWidth, v.videoHeight)), c = document.createElement('canvas'); c.width = v.videoWidth * k; c.height = v.videoHeight * k;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); ZI = c.toDataURL('image/jpeg', .55); camStop(); rShowIm();
}
HK.hide.push(camStop);
function rKc() { $('rk').innerHTML = RK.map(k => `<button type="button" class="tag ${ZK.includes(k) ? 'on' : ''}" onclick="rKt('${k}')">${k}</button>`).join(''); }
function rKt(k) { ZK = ZK.includes(k) ? ZK.filter(x => x != k) : [...ZK, k]; rKc(); }
function rH(fromName) {
  const box = $('rh'); if (!box) return;
  const telEl = $('r_t'), nameEl = $('r_n');
  let telVal = (telEl || {}).value || '', nameVal = (nameEl || {}).value || '';
  if (fromName && nameVal && !telVal && telEl) {
    const known = S.rp.find(r => r != ZR && r.name == nameVal && r.tel) || (S.debt || []).find(d => d.name == nameVal && d.tel);
    if (known) { telEl.value = telVal = known.tel; }
  }
  const t = rph8(telVal), m = t.length >= 8 ? S.rp.filter(r => r != ZR && rph8(r.tel) === t) : [];
  if (!fromName && t.length >= 8 && !nameVal && nameEl && m.length) {
    nameEl.value = nameVal = m[m.length - 1].name;
  }
  const parts = [];
  if (m.length) parts.push(`<div>زبون سابق: ${m.length} مرة، آخرها ${esc(m[m.length - 1].dev)}</div>`);
  const aw = m.map(r => ({ r, w: warInfo(r) })).filter(x => x.r.st == 'dn' && x.w && x.w.active);
  if (aw.length) { const l = aw[aw.length - 1]; parts.push(`<div style="color:#16a34a;font-weight:700">${I('shield')} تنبيه: جهاز (${esc(l.r.dev)}) لهذا الزبون ما زال ${esc(l.w.label)}!</div>`); }
  const dbs = rpDebts(telVal, nameVal);
  if (dbs.length) {
    const sum = rpDebtSum(dbs), why = dbs.map(d => d.why).filter(Boolean).join('، ');
    parts.push(`<div style="color:#dc2626;font-weight:700;margin-top:2px">${I('alert')} تنبيه: على هذا الزبون دين مفتوح بمجموع ${sum} درهم${why ? ' (' + esc(why) + ')' : ''}!</div>`);
  }
  box.innerHTML = parts.join('');
}
function pickRpBrand(j) {
  const b = S.tags.brand[j], el = $('r_v'); if (!el) return; let cur = el.value.trim();
  const o = S.tags.brand.find(x => x && cur.toLowerCase().startsWith(String(x).toLowerCase()));
  if (o && o.toLowerCase() === b.toLowerCase()) {
    el.value = cur.slice(o.length).trim();
  } else {
    if (o) cur = cur.slice(o.length).trim();
    el.value = b + (cur ? ' ' + cur : ' ');
  }
  syncRpTags(); el.focus(); checkDeviceHistory(); suggestGuidePrice();
}
function pickRpFault(j) {
  const f = S.tags.fault[j], el = $('r_f'); if (!el) return;
  let p = el.value.split('،').map(s => s.trim()).filter(Boolean); p = p.includes(f) ? p.filter(x => x !== f) : [...p, f];
  el.value = p.join('، '); syncRpTags(); suggestGuidePrice();
}
function suggestGuidePrice() {
  const dev = nz(($('r_v') || {}).value || ''), flt = nz(($('r_f') || {}).value || ''), box = $('rp_price_hint'); if (!box) return;
  GPM = (!dev && !flt) ? [] : S.guide.filter(g => { const gm = nz(g.m), gf = nz(g.f), mm = dev && (dev.includes(gm) || gm.includes(dev)), fm = flt && (flt.includes(gf) || gf.includes(flt)); return (mm && fm) || (dev.length > 2 && mm && !flt); }).slice(0, 4);
  box.innerHTML = GPM.flatMap((g, j) => {
    const btns = [`<button type="button" class="tag on" style="margin:2px" onclick="$('r_c').value=GPM[${j}].p">${I('bulb')} ${esc(g.m)} (${esc(g.f)}): ${esc(dh(g.p))} — اضغط لوضعه</button>`];
    if (g.p2) btns.push(`<button type="button" class="tag on" style="margin:2px;background:#059669;border-color:#059669" onclick="$('r_c').value=GPM[${j}].p2">${I('bulb')} ${esc(g.m)} (فئة 2 / أصلي): ${esc(dh(g.p2))}</button>`);
    return btns;
  }).join('');
}
function checkDeviceHistory() {
  const dev = nz(($('r_v') || {}).value || ''), box = $('rp_dev_hist'); if (!box) return;
  if (dev.length < 3) { box.textContent = ''; return; }
  const rec = S.rp.filter(r => r != ZR && r.st == 'dn' && nz(r.dev).includes(dev) && (Date.now() - (r.t2 || 0)) < 14 * 864e5);
  if (!rec.length) { box.textContent = ''; return; }
  const l = rec[rec.length - 1], days = Math.floor((Date.now() - l.t2) / 864e5);
  box.textContent = `تنبيه: جهاز مشابه (${l.dev} — ${l.name}) سُلّم منذ ${days || 'أقل من'} يوم (${l.tst ? 'جُرِّب مع الزبون' : 'بدون توثيق تجربة'})`;
}
function rSave() {
  const n = $('r_n').value.trim(), f = $('r_f').value.trim(), v = $('r_v').value.trim(), t = $('r_t').value.replace(/\D/g, ''), isNew = !(ZR && ZR.id);
  if (!n || !f) return toast('الاسم والعطل مطلوبان');
  if (!v && (isNew || ZR.dev)) return toast('اكتب نوع الهاتف');
  if (t.length < 8 && (isNew || ZR.tel)) return toast('اكتب رقم هاتف الزبون (8 أرقام على الأقل)');
  finish(fxAtt({ name: n, tel: $('r_t').value.trim(), dev: v, fault: f, cap: $('r_c').value.trim(), dep: $('r_d').value.trim(), lock: $('r_l').value.trim(), pat: ZP, chk: ZK, img: ZI, note: $('r_o').value.trim(), imei: $('r_imei').value.trim(), war: Math.max(0, Math.floor(+$('r_war').value || 0)) }));
}
function rDone(v, r) {
  if (!v) return;
  if (r && r.id && S.rp.includes(r)) {
    return commit('تم التعديل', () => {
      if (!v.img && IMG[r.id]) delImg(r.id);
      if (v.img && v.img.startsWith('data:image')) { putImg(r.id, v.img); v.img = 'idb:' + r.id; }
      if (!r.tk) r.tk = nextTk();
      Object.assign(r, v, { lb: S.me });
    });
  }
  let tk = '';
  commit('تم الاستلام', () => {
    tk = nextTk();
    const id = uid();
    if (v.img && v.img.startsWith('data:image')) { putImg(id, v.img); v.img = 'idb:' + id; }
    S.rp.push({ id, tk, st: 'in', t0: Date.now(), by: S.me, calls: [], ...v });
  });
  if (tk) toast('تم الاستلام — رقم التذكرة: #' + tk);
}
function rpZoom(id) {
  const r = rf(id), src = r && rImg(r); if (!src) return;
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc((r.tk ? '#' + r.tk + ' — ' : '') + r.name + ' — ' + r.dev)}</h3><img src="${src}" style="width:100%;max-height:70vh;object-fit:contain;border-radius:12px"><div class="acts"><button class="btn s" onclick="finish(null)">إغلاق</button></div>`;
  sheetOpen(() => { });
}

/* ---------- دليل أسعار الإصلاح (مع فلاتر سريعة ودعم فئتين للسعر) ---------- */
const gdCard = g => `<div class="card cmp"><div class="row2"><b>${esc(g.m)}</b><span class="cmp-pr">${esc(dh(g.p))}${g.p2 ? ` <span class="m" style="font-weight:600">· أصلي/2:</span> ${esc(dh(g.p2))}` : ''}</span></div><div class="row2" style="margin-top:4px"><span class="m" style="flex:1">${esc(g.f)}${g.n ? ' · ' + esc(g.n) : ''}</span>${can('price') ? `<button class="btn s sm" onclick="gdEd('${g.id}')">تعديل</button><button class="btn s sm" style="color:#ef4444" onclick="gdDel('${g.id}')">حذف</button>` : ''}</div></div>`;
const gdList = (q, flt) => {
  const n = nz(q || ''), fn = nz(flt || '');
  return S.guide.filter(g => (!fn || nz(g.f).includes(fn)) && (!n || nz(g.m + ' ' + g.f + ' ' + (g.n || '')).includes(n))).sort((a, b) => a.m.localeCompare(b.m)).map(gdCard).join('') || emptyBox('لا توجد تسعيرات مطابقة', can('price') ? 'اضغط على «+ إضافة تسعيرة» في الأعلى لإضافة سعر إصلاح جديد' : '');
};
VW.gd = () => {
  const gf = V.gf || '';
  return {
    t: 'دليل أسعار الإصلاح',
    h: (can('price') ? '<button class="btn" onclick="gdEd(null)">+ إضافة تسعيرة</button>' : '')
      + `<div class="sec-panel">`
      + `<div class="sec-tags">${[`<button class="tag ${!gf ? 'on' : ''}" onclick="V.gf='';render()">الكل (${S.guide.length})</button>`, ...S.tags.fault.map(f => `<button class="tag ${gf == f ? 'on' : ''}" onclick="V.gf=${esc(JSON.stringify(f))};render()">${esc(f)}</button>`)].join('')}</div>`
      + `<input style="margin-top:10px;margin-bottom:0" placeholder="ابحث: موديل الهاتف أو العطل..." value="${esc(V.q || '')}" oninput="V.q=this.value;$('gdl').innerHTML=gdList(V.q,V.gf)">`
      + `</div>`
      + `<div id="gdl">${gdList(V.q, gf)}</div>`
  };
};
function gdEd(id) {
  if (!can('price')) return toast('للمدير فقط'); const g = id ? S.guide.find(x => x.id == id) : {};
  ask(id ? 'تعديل تسعيرة' : 'تسعيرة جديدة', [
    { k: 'm', l: 'الموديل (مثال: Samsung A12)', v: g.m || '' },
    { k: 'f', l: 'العطل (مثال: تغيير شاشة)', v: g.f || 'تغيير شاشة' },
    { k: 'p', l: 'السعر الأساسي / العادي', t: 'tel', v: g.p || '' },
    { k: 'p2', l: 'سعر الفئة الثانية / الأصلي (اختياري)', t: 'tel', v: g.p2 || '' },
    { k: 'n', l: 'ملاحظة (اختياري)', v: g.n || '' }
  ]).then(v => {
    if (!v) return; if (!v.m.trim() || !v.f.trim() || !v.p.trim()) return toast('الموديل والعطل والسعر مطلوبة');
    upd(() => { const o = { m: v.m.trim(), f: v.f.trim(), p: v.p.trim(), p2: (v.p2 || '').trim(), n: v.n.trim() }; if (id) Object.assign(g, o); else S.guide.push({ id: uid(), ...o }); });
  });
}
function gdDel(id) { const g = S.guide.find(x => x.id == id); del('guide', id, g.m + ' ' + g.f); }

/* ---------- شاشة طلبات الزبائن («زبون سأل ولم نجد») + الاتصال والواتساب والتعديل ---------- */
function rq() {
  ask('تسجيل طلب زبون (سأل ولم نجد)', [
    { k: 't', l: 'السلعة أو الموديل المطلوب (مثال: بوشيط A54 / شاشة iPhone 13)', v: '' },
    { k: 'p', l: 'اسم الزبون ورقم هاتفه (اختياري — لإبلاغه بالواتساب فور توفرها)', v: '' }
  ]).then(v => {
    if (!v) return;
    const item = v.t.trim(), ph = (v.p || '').trim();
    if (!item) return toast('اكتب اسم السلعة المطلوبة');
    const full = ph ? item + ' — ' + ph : item;
    commit('تم تسجيل الطلب', () => S.req.push({ id: uid(), t: full, by: S.me, at: Date.now() }));
  });
}
function rqEd(id) {
  const q = S.req.find(x => x.id == id); if (!q) return;
  ask('تعديل طلب الزبون', [{ k: 't', l: 'الطلب (مع رقم الهاتف إن وجد)', t: 'area', v: q.t }]).then(v => {
    const t = v && v.t.trim(); if (!t) return;
    commit('تم تعديل الطلب', () => { q.t = t; });
  });
}
function rqD(id) {
  commit('تم مسح الطلب', () => { S.req = S.req.filter(r => r.id != id); });
  if (SH && $('sh') && !$('sh').querySelector('[id^="rqa_"]')) setTimeout(() => { if (SH) finish(null); }, 60);
}
function rqTel(txt) {
  const s = String(txt || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const m = s.match(/(?:\+?212|0)[\s\-.]*[567](?:[\s\-.]*\d){8}/);
  return m ? m[0].replace(/\D/g, '') : '';
}
function rqWA(id) {
  const q = S.req.find(x => x.id == id); if (!q) return;
  const ph = rqTel(q.t); if (!ph) return toast('لا يوجد رقم هاتف في هذا الطلب');
  const clean = q.t.replace(/(?:\+?212|0)[\s\-.]*[567](?:[\s\-.]*\d){8}/, '').replace(/[-–—:،.]/g, ' ').trim();
  location.href = 'https://wa.me/' + rnum(ph) + '?text=' + encodeURIComponent(`مرحباً، بخصوص طلبك (${clean || 'السلعة المطلوبة'}) فقد توفرت لدينا في محل عزيز. مرحباً بك!`);
}
function rqCard(q) {
  const ph = rqTel(q.t);
  return `<div class="card"><div class="row2"><b style="flex:1;line-height:1.45">${esc(q.t)}</b></div>`
    + `<div class="m" style="margin-top:4px"><bdi>${fd(q.at)}</bdi>${q.by ? ' · ' + esc(q.by) : ''}${ph ? ` · هاتف: <bdi>${esc(ph)}</bdi>` : ''}</div>`
    + `<div class="sub">${ph ? `<a href="tel:${esc(ph)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">${I('phone')} اتصال</a><button class="btn sm" onclick="rqWA('${q.id}')">${I('send')} إبلاغ واتساب</button>` : ''}<button class="btn s sm" onclick="rqEd('${q.id}')">تعديل</button><button class="btn s sm" style="color:#ef4444" onclick="rqD('${q.id}')">مسح</button></div></div>`;
}
function rqList() {
  const n = nz(V.q || '');
  const L = (S.req || []).slice().sort((a, b) => (b.at || 0) - (a.at || 0)).filter(q => !n || nz(q.t).includes(n));
  return L.map(rqCard).join('') || emptyBox('لا توجد طلبات زبائن مسجلة حالياً', 'اضغط على «+ تسجيل طلب زبون» لتدوين أي سلعة سأل عنها زبون ولم يجدها');
}
VW.req = () => ({
  t: 'طلبات الزبائن',
  h: `<button class="btn" onclick="rq()">+ تسجيل طلب زبون (سأل ولم نجد)</button>`
    + `<div class="sec-panel" style="padding:10px">`
    + `<div class="row2" style="margin-bottom:8px"><b style="flex:1">إجمالي الطلبات المسجلة: ${(S.req || []).length}</b><span class="m" style="font-size:.78rem">تظهر أيضاً في التقرير اليومي</span></div>`
    + `<input style="margin:0" placeholder="ابحث في الطلبات: موديل، سلعة، أو رقم..." value="${esc(V.q || '')}" oninput="V.q=this.value;$('rql').innerHTML=rqList()">`
    + `</div>`
    + `<div id="rql">${rqList()}</div>`
});

/* ---------- ربط الباركود/IMEI، الإعدادات ---------- */
function bcNewRp() { $('sh').innerHTML = ''; const rec = { imei: BCODE }; sheetOpen(v => rDone(v, rec)); rForm(rec); }
BCX.push(() => `<button class="btn s sm" onclick="bcNewRp()">${I('tool')} + استلام صيانة</button>`);
BCM.push(c => { const nc = nz(c); return S.rp.filter(r => r.imei && nz(r.imei).includes(nc)).map(rc).join(''); });
/* ---------- أرشفة: حذف الصيانات المسلّمة منذ أكثر من سنة وانتهى ضمانها (يدوياً وللمدير فقط) ---------- */
const rpOld = () => { const n = Date.now(); return S.rp.filter(r => r.st == 'dn' && r.t2 && n - r.t2 > Math.max(365, (+r.war || 0) + 30) * 864e5); };
function rpArch() {
  if (!isAdmin()) return toast('للمدير فقط');
  const a = rpOld(); if (!a.length) return toast('لا توجد صيانات مسلّمة أقدم من سنة');
  sure('حذف ' + a.length + ' صيانة مسلّمة منذ أكثر من سنة (انتهى ضمانها) من كل الأجهزة؟ يُفضّل أخذ ملف نسخة احتياطية قبل ذلك. تُحفظ نسخة تلقائية داخل الهاتف أولاً.', 'أرشفة').then(y => {
    if (!y) return;
    snapPre().then(() => { const ids = new Set(a.map(x => x.id)); S.rp = S.rp.filter(x => !ids.has(x.id)); save(); render(); toast('تمت أرشفة ' + a.length + ' صيانة'); });
  });
}
CATS.rp = ['الصيانة', [tg('أعطال الصيانة', 'fault'), ['دليل أسعار الإصلاح', "go('gd')"], ['مدة حفظ الصورة والرمز بعد التسليم', "limEd('rpKeep')", () => lim('rpKeep') + ' يوم'], ['أرشفة الصيانات المسلّمة القديمة', "rpArch()", () => rpOld().length + ' صيانة']], 'rp'];
MORE.push({ g: 'sec', o: 50, l: 'الصيانة', fn: "go('st_c',{c:'rp'})" });