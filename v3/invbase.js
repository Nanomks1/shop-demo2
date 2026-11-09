/* ============================================================
   invbase.js — أساس المخزون: مساعدات عامة، العرض المضغوط، الحجز، الألوان والفلترة، الحقول والخانات المخصصة، أزرار الوسوم
   يُحمَّل بعد topup.js وقبل invphones.js.
   ============================================================ */

/* ---------- مساعدات ---------- */
const find = id => S.items.find(i => i.id == id);
const ph = () => S.items.filter(i => i.sec == 'phones');
const lim = k => S.cfg[k] ?? DL0[k];
const ci = v => Math.max(0, Math.floor(+dg(v) || 0));
const fmtPr = p => { p = dg(p ?? '').trim(); return !p ? '' : /^\d+(\.\d+)?$/.test(p) ? p + ' درهم' : p; };
/* فصل وقت التعديل العام (at) عن وقت تأكيد الجولة اليومية (cf) */
const cfTime = x => (x && (x.cf || x.at)) || 0;
const touch = (i, cf) => {
  if (!i.cf && i.at) i.cf = i.at;
  i.by = S.me;
  i.at = Date.now();
  if (cf) i.cf = i.at;
};
const sumv = o => Object.values(o || {}).reduce((a, b) => a + b, 0);
S.fields = S.fields || []; S.gg = S.gg || []; S.ag = S.ag || [];
/* cl: 2 يعني لكل لون: 0 نفد (أحمر)، 1 أو 2 قارب (برتقالي)، 3 فأكثر متوفر (أخضر) */
Object.assign(DL0, { cl: 2, gA: 30, gB: 20, gC: 10, gY: 5, acl: 3, agl: 10 });
LM.push(
  ['gA', 'أنتي كاس: مستوى «غامق» يُحسب كـ (قطعة)'], ['gB', 'أنتي كاس: مستوى «أخضر» يُحسب كـ (قطعة)'], ['gC', 'أنتي كاس: مستوى «فاتح» يُحسب كـ (قطعة)'],
  ['gY', 'أنتي كاس: مستوى «قليل» يُحسب كـ (قطعة)'], ['acl', 'إكسسوار بعدد: «قليل» عند عدد فأقل'],
  ['agl', 'مجموعة إكسسوار (كابل/شاحن): «قارب النفاد» عند مجموع فأقل']
);

/* قائمة إكمال تلقائي موحدة لأسماء الموديلات في المحل */
function invModelNames() {
  const m = new Set();
  ph().forEach(i => { if (i.name) m.add(i.name.trim()); });
  (S.gg || []).forEach(g => (g.models || []).forEach(x => m.add(x.trim())));
  S.items.filter(i => i.sec == 'case').forEach(i => { if (i.name) m.add(i.name.trim()); });
  return [...m];
}
SUG.mn = invModelNames;
function invModelDatalist() { return ''; }   // قديمة: صار الإكمال داخل التطبيق (SUG.mn)

/* ---------- طيّ القوائم الطويلة + التصفح التدريجي للأقسام الكبيرة + وضع العرض المضغوط ---------- */
const EXP = {}, PG = {};   // حفظ حالة فتح القوائم المطوية وعدد البطاقات المعروضة أثناء الجلسة
function toggleExp(id) { EXP[id] = !EXP[id]; render(); }
function pgMore(k, step = 40) { PG[k] = (PG[k] || step) + step; render(); }
function pgSlice(k, arr, step = 40) {
  const mx = PG[k] || step, items = arr.slice(0, mx), rem = arr.length - items.length;
  const more = rem > 0 ? `<button type="button" class="btn s" onclick="pgMore('${k}',${step})">عرض المزيد (+${Math.min(step, rem)} من ${rem} متبقية)</button>` : '';
  return { items, more };
}
function pagedHtml(arr, k, fn, step = 40) {
  const pg = pgSlice(k, arr, step);
  return pg.items.map(fn).join('') + pg.more;
}
/* البيع السريع: لهذا الجهاز فقط، وينطفئ وحده بعد 15 دقيقة بلا مسح */
const bcQ = () => !!S.cfg.bcQuick && Date.now() - S.cfg.bcQuick < 9e5;
const isCmp = s => !!((S.cfg.cmp || {})[s]);
function cmpTog(s) { upd(() => { S.cfg.cmp = S.cfg.cmp || {}; S.cfg.cmp[s] = S.cfg.cmp[s] ? 0 : 1; }); }

/* ---------- التنبيه الذكي لـ «زبون سأل ولم نجد» عند توفر السلعة ---------- */
function reqFind(txt) {
  const n = nz(txt); if (n.length < 2 || !(S.req && S.req.length)) return [];
  return S.req.filter(q => {
    const clean = dg(q.t || '').replace(/(?:\+?212|0)[\s\-.]*[567](?:[\s\-.]*\d){8}/g, '').replace(/[-–—:،.]/g, ' ').trim();
    const qn = nz(clean); if (qn.length < 2) return false;
    if (n.includes(qn) || qn.includes(n)) return true;
    const w = clean.split(/\s+/).map(nz).filter(x => x.length >= 3 || /^[a-z]\d$|^\d[a-z]$/.test(x));
    return w.length > 0 && w.every(x => n.includes(x));
  });
}
function reqDismiss(id) {
  if (typeof rqD == 'function') rqD(id);
  const el = $('rqa_' + id); if (el) el.remove();
  if (SH && !$('sh').querySelector('[id^="rqa_"]')) finish(null);
}
function reqChk(txt, wait) {
  const m = reqFind(txt); if (!m.length) return;
  setTimeout(() => {
    if (SH) return;
    $('sh').innerHTML = `<div class="bar"></div><h3>${I('bell')} زبون سأل عن هذه السلعة!</h3><p class="m">توفرت الآن «<b>${esc(txt)}</b>» وهناك طلب مسجّل يطابقها:</p>`
      + m.map(q => {
        const tel = typeof rqTel == 'function' ? rqTel(q.t) : '';
        return `<div class="card" id="rqa_${q.id}"><b>${esc(q.t)}</b><div class="m">${fd(q.at)} · ${esc(q.by || '')}</div><div class="sub">${tel ? `<a href="tel:${esc(tel)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">${I('phone')} اتصال</a><button class="btn sm" onclick="rqWA('${q.id}')">${I('send')} إبلاغ واتساب</button>` : ''}<button class="btn s sm" onclick="reqDismiss('${q.id}')">مسح الطلب</button></div></div>`;
      }).join('')
      + `<div class="acts"><button class="btn s" onclick="finish(null)">إغلاق</button></div>`;
    sheetOpen(() => { });
  }, wait ? 380 : 60);
}

/* ---------- الحجز (بعدد): المحجوز يُخصم من المتاح ---------- */
const rsL = i => Array.isArray(i.res) ? i.res : (i.res && i.res.n ? [{ n: i.res.n, d: i.res.d || '', q: 1 }] : []);
const rsQ = i => rsL(i).reduce((a, r) => a + (+r.q || 1), 0);
const av = i => Math.max(0, (+i.cnt || 0) - rsQ(i));
const rsHtml = i => {
  const L = rsL(i); if (!L.length) return '';
  return `<div class="rs">محجوز ${rsQ(i)} من ${i.cnt}: ${L.map(r => esc(r.n) + ((+r.q || 1) > 1 ? ' ×' + r.q : '') + (r.d ? ' · عربون ' + esc(r.d) : '')).join('، ')}${av(i) <= 0 ? ' — كل القطع محجوزة' : ''}</div>`;
};

/* ---------- الألوان والترتيب ولوحة الفلترة الموحدة ---------- */
const PAL = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c', '#b91c1c', '#c2410c', '#a16207', '#15803d', '#0f766e', '#1d4ed8',
  '#6d28d9', '#a21caf', '#be185d', '#92400e', '#64748b', '#1e293b'];
const DBC = { Samsung: '#3b82f6', Redmi: '#f97316', Xiaomi: '#eab308', Realme: '#facc15', Oppo: '#22c55e', Vivo: '#a855f7', Tecno: '#06b6d4', Infinix: '#84cc16', iPhone: '#64748b', Itel: '#ef4444' };
const DSC = { glass: '#06b6d4', case: '#a855f7', acc: '#84cc16' }, DCM = { phones: 'b', glass: 's', case: 's', acc: 's' };
const SN3 = { phones: 'الهواتف', glass: 'الأنتي كاس', case: 'البوشيط', acc: 'الإكسسوارات' }, MN = { b: 'حسب الماركة', s: 'لون واحد للقسم', o: 'بدون' };
const autoBc = t => {
  S.cfg.bcol = S.cfg.bcol || {};
  if (S.cfg.bcol[t] !== undefined || DBC[t]) return;
  const used = Object.values(S.cfg.bcol).concat(Object.values(DBC)), free = PAL.filter(c => !used.includes(c)), pool = free.length ? free : PAL;
  S.cfg.bcol[t] = pool[Math.floor(Math.random() * pool.length)];
};
const BC = b => b ? ((S.cfg.bcol || {})[b] ?? DBC[b] ?? '') : '';
const SCOL = s => (S.cfg.scol || {})[s] ?? DSC[s] ?? '';
const CM = s => (S.cfg.cm || {})[s] ?? DCM[s];
const brOfName = n => { const z = nz(n); return [...S.tags.brand].sort((a, b) => b.length - a.length).find(t => z.includes(nz(t))) || ''; };
const colOf = i => { const s = i.sec; if (!s || s == 'glass') return ''; const m = CM(s); if (m == 'o') return ''; if (m == 's') return SCOL(s); return BC(s == 'phones' ? i.brand : s == 'case' ? brOfName(i.name) : ''); };
const colG = g => { const m = CM('glass'); if (m == 'o') return ''; if (m == 's') return SCOL('glass'); return BC(Object.values(g.br || {})[0]); };
const cardH = (h, c, cls = '') => `<div class="card${cls ? ' ' + cls : ''}"${c ? ` style="border-inline-start:6px solid ${c}"` : ''}>${h}</div>`;

const SOL = { phones: [['n', 'الماركة'], ['d', 'الأحدث'], ['l', 'الأقل']] };
['glass', 'case', 'acc'].forEach(s => SOL[s] = [['n', 'الاسم'], ['d', 'الأحدث'], ['l', 'الأقل']]);
const SO = s => (S.cfg.so || {})[s] || 'n';

/* شريط الأدوات المدمج + لوحة القسم الموحدة + صندوق الفراغ المتوازن */
const sortToolbarHtml = s => {
  const canCmp = s != 'glass', cm = isCmp(s);
  return `<div class="sec-toolbar"><div class="seg-group">`
    + SOL[s].map(([k, l]) => `<button type="button" class="seg-btn ${SO(s) == k ? 'on' : ''}" onclick="soSet('${s}','${k}')">${l}</button>`).join('')
    + `</div><div class="sec-actions">`
    + `<button type="button" class="tool-pill" onclick="go('jl',{js:'${s}',jk:'${s}',jm:'all'})">${I('check')} جرد</button>`
    + (canCmp ? `<button type="button" class="tool-pill ${cm ? 'on' : ''}" onclick="cmpTog('${s}')">${I(cm ? 'cards' : 'rows')} ${cm ? 'مفصل' : 'مضغوط'}</button>` : '')
    + `</div></div>`;
};
const secPanel = (s, tagsHtml) => `<div class="sec-panel"><div class="sec-tags">${tagsHtml}</div>${sortToolbarHtml(s)}</div>`;
const emptyBox = (title, sub) => `<div class="empty-state"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;

function soSet(s, k) { upd(() => { S.cfg.so = S.cfg.so || {}; S.cfg.so[s] = k; }); }
const srt = (a, s, nm, lo, at) => { const k = SO(s); return [...a].sort((x, y) => k == 'd' ? (at(y) || 0) - (at(x) || 0) : k == 'l' ? (lo(x) - lo(y)) || String(nm(x)).localeCompare(String(nm(y))) : String(nm(x)).localeCompare(String(nm(y)))); };

/* ---------- إظهار/إخفاء الحقول في النماذج (يضبطه المدير) ---------- */
const FLD = {
  phones: [['color', 'اللون'], ['ram', 'RAM'], ['cap', 'السعة'], ['cond', 'الحالة'], ['price', 'السعر'], ['imei', 'IMEI'], ['note', 'الملاحظة'], ['res', 'زر الحجز']],
  acc: [['conn', 'الموصل'], ['tier', 'الفئة'], ['brand', 'الماركة'], ['price', 'السعر'], ['cnt', 'العدد'], ['lim', 'الحد'], ['note', 'الملاحظة']]
};
const FLDN = { phones: 'الهواتف', acc: 'الإكسسوارات' };   // ملف الصيانة يضيف FLD.rp و FLDN.rp
const hd = (s, k) => ((S.cfg.hide || {})[s] || {})[k];
const shown = (s, k) => !hd(s, k);
const hh = (s, k) => hd(s, k) ? ' hidden' : '';
function fTog(s, k) { if (!can('fields')) return toast('للمدير فقط'); upd(() => { S.cfg.hide = S.cfg.hide || {}; const h = S.cfg.hide[s] = S.cfg.hide[s] || {}; h[k] = h[k] ? 0 : 1; }); }

/* ---------- الخانات المخصصة (حقول إضافية بخيارات لكل قسم) ---------- */
const SECN = { phones: 'الهواتف', acc: 'الإكسسوارات', case: 'البوشيط', rp: 'الصيانة' };
const fxNorm = (v, u) => { v = dg(v || '').trim(); return u && /^\d+(\.\d+)?$/.test(v) ? v + u : v; };   // 32 + GB => 32GB
const fxList = (sec, key) => S.fields.filter(f => f.sec == sec && (!f.kinds || !f.kinds.length || f.kinds.includes(key)));
const fxVal = (i, f) => [].concat((i.x || {})[f.id] || []).filter(Boolean);
const fxTxt = i => S.fields.map(f => fxVal(i, f).length ? f.name + ' ' + fxVal(i, f).join(' ') : '').join(' ');
const fxShow = i => { const p = S.fields.map(f => fxVal(i, f).length ? f.name + ': ' + fxVal(i, f).join('، ') : '').filter(Boolean); return p.length ? `<div class="m">${I('tag')} ${esc(p.join(' · '))}</div>` : ''; };

/* ---------- حالة النموذج المفتوح + أزرار الوسوم ---------- */
let FS = { v: {}, add: '', defs: [], fx: {}, fxA: '', fxSec: '', cond: 0 }, PR = null;
function fsInit(defs, v, sec, rec, cond) { FS = { v: { ...v }, add: '', defs, fx: { ...((rec && rec.x) || {}) }, fxA: '', fxSec: sec || '', cond: cond ? 1 : 0 }; }
function chipGroupHtml([g, l], canTg) {
  const hid = FS.hid && FS.hid[g], sg = g == 'color' && FS.sugC ? FS.sugC() : null, sa = sg && sg.a ? sg.a.filter(n => S.tags[g].includes(n)) : [];
  let lst = S.tags[g].map((t, j) => [t, j]);
  if (hid) lst = lst.filter(([t]) => !hid(t) || FS.v[g] == t);   // إخفاء وسوم غير مناسبة لهذا النموذج
  if (sa.length) lst = [...sa.map(n => lst.find(x => x[0] == n)).filter(Boolean), ...lst.filter(x => !sa.includes(x[0]))];   // المقترح أولاً
  const cam = g == 'color' && typeof colCam == 'function' ? `<button type="button" class="tag" onclick="colCam()">${I('scan')} من الصورة</button>` : '';
  return `<label>${l}${sa.length ? ` <small class="m">★ ${esc(sg.t)}</small>` : ''}</label><div>${lst.map(([t, j]) => `<button type="button" class="tag ${FS.v[g] == t ? 'on' : ''}" onclick="chPick('${g}',${j})">${sa.includes(t) ? '★ ' : ''}${esc(t)}</button>`).join('')}${cam}${!canTg ? '' : FS.add == g ? `<span class="row2"><input id="chn" placeholder="الاسم الجديد"><button type="button" class="btn sm" onclick="chOk('${g}')">إضافة</button></span>` : `<button type="button" class="tag" onclick="FS.add='${g}';chipsR()">+ جديد</button>`}</div>`;
}
function chipsR() {
  const b = $('cc'), b2 = $('cc2'); if (!b) return;
  const canTg = can('tags'), vis = FS.defs.filter(d => !d[2] || d[2]());
  const topDefs = b2 ? vis.slice(0, 1) : vis;
  const botDefs = b2 ? vis.slice(1) : [];
  const condHtml = FS.cond ? `<label>الحالة</label><div>${['جديد', 'مستعمل'].map(c => `<button type="button" class="tag ${FS.v.cond == c ? 'on' : ''}" onclick="FS.v.cond='${c}';chipsR()">${c}</button>`).join('')}</div>` : '';
  b.innerHTML = topDefs.map(d => chipGroupHtml(d, canTg)).join('') + (b2 ? '' : condHtml);
  if (b2) b2.innerHTML = botDefs.map(d => chipGroupHtml(d, canTg)).join('') + condHtml;
  fxR();
}
function chPick(g, j) {
  const v = S.tags[g][j], prev = FS.v[g];
  FS.v[g] = prev == v ? '' : v;
  if (g == 'tier' && $('ap')) {
    const cur = $('ap').value.trim();
    if (!cur || cur == prev) $('ap').value = FS.v.tier || '';
  }
  chipsR();
}
function chOk(g) {
  if (!can('tags')) return toast('للمدير فقط');
  const t = ($('chn').value || '').trim();
  if (t) { if (!S.tags[g].includes(t)) { S.tags[g].push(t); if (g == 'brand') autoBc(t); tagFix(); } FS.v[g] = t; save(); }
  FS.add = ''; chipsR();
}
const fxKey = () => FS.fxSec == 'acc' ? FS.v.kind : FS.fxSec == 'phones' ? FS.v.brand : '';
function fxR() {
  const b = $('fx'); if (!b) return;
  const canFx = can('fields') || can('tags');
  b.innerHTML = fxList(FS.fxSec, fxKey()).map(f => { const v = [].concat(FS.fx[f.id] || []); return `<label>${esc(f.name)}</label><div>${f.opts.map((o, j) => `<button type="button" class="tag ${v.includes(o) ? 'on' : ''}" onclick="fxT('${f.id}',${j})">${esc(o)}</button>`).join('')}${!canFx ? '' : FS.fxA == f.id ? `<span class="row2"><input id="fxn" placeholder="خيار جديد"><button type="button" class="btn sm" onclick="fxN('${f.id}')">إضافة</button></span>` : `<button type="button" class="tag" onclick="FS.fxA='${f.id}';fxR()">+ جديد</button>`}</div>`; }).join('');
}
function fxT(id, j) { const f = S.fields.find(x => x.id == id), o = f.opts[j], a = [].concat(FS.fx[id] || []); FS.fx[id] = f.multi ? (a.includes(o) ? a.filter(x => x != o) : [...a, o]) : (a[0] == o ? '' : o); fxR(); }
function fxN(id) {
  if (!can('fields') && !can('tags')) return toast('للمدير فقط');
  const f = S.fields.find(x => x.id == id), v = fxNorm($('fxn').value, f.unit);
  FS.fxA = '';
  if (v && !f.opts.includes(v)) { f.opts.push(v); save(); }
  if (v) { const a = [].concat(FS.fx[id] || []); FS.fx[id] = f.multi ? [...a, v] : v; }
  fxR();
}
const fxAtt = v => { if (FS.fxSec && v && typeof v == 'object') v.x = { ...FS.fx }; return v; };
const moreBtn = fn => `<button class="btn s" onclick="${fn}(1)">حفظ وإضافة آخر</button>`;
const nzText = i => hay(i) + ' ' + fxTxt(i) + ' ' + (i.imei || '') + ' ' + (i.code || '') + ' ' + (i.pw || '');
const hay = i => [i.brand, i.name, i.color, i.ram, i.cap, i.note, i.kind, i.conn, i.tier, (i.v || []).map(x => x.g + x.c).join(' ')].join(' ');