/* ============================================================
   invpochette.js — البوشيط: موديل = سطر واحد، واللون هو الهوية
   كل لون دائرة بعدده، وحدّها يلوَّن بالحالة (أحمر نفد / برتقالي قارب).
   يُحمَّل بعد invglass.js.
   ============================================================ */

/* ---------- ألوان الدوائر (الأسماء تُطابَق بعد التطبيع nz) ---------- */
const CS_HEX = Object.fromEntries(Object.entries({
  'أسود': '#0a0a0a', 'black': '#0a0a0a', 'noir': '#0a0a0a',
  'أبيض': '#f8fafc', 'white': '#f8fafc', 'blanc': '#f8fafc',
  'فضي': '#cbd5e1', 'silver': '#cbd5e1', 'argent': '#cbd5e1',
  'رمادي': '#6b7280', 'gris': '#6b7280', 'gray': '#6b7280', 'grey': '#6b7280',
  'أزرق': '#2563eb', 'blue': '#2563eb', 'bleu': '#2563eb', 'كحلي': '#1e3a8a', 'سماوي': '#38bdf8',
  'تركوازي': '#14b8a6', 'تركواز': '#14b8a6',
  'أخضر': '#16a34a', 'green': '#16a34a', 'vert': '#16a34a',
  'أصفر': '#facc15', 'yellow': '#facc15', 'jaune': '#facc15',
  'ذهبي': '#d4a017', 'gold': '#d4a017',
  'برتقالي': '#f97316', 'orange': '#f97316',
  'أحمر': '#dc2626', 'red': '#dc2626', 'rouge': '#dc2626',
  'وردي': '#f472b6', 'pink': '#f472b6', 'rose': '#f472b6',
  'بنفسجي': '#7c3aed', 'violet': '#7c3aed', 'ليلكي': '#c4b5fd',
  'بني': '#92400e', 'brown': '#92400e', 'marron': '#92400e', 'بيج': '#e7d5b3', 'beige': '#e7d5b3',
  'شفاف': 'pat', 'transparent': 'pat'
}).map(([k, v]) => [nz(k), v]));
const CS_EMO = Object.fromEntries(Object.entries({
  'أسود': '⚫', 'black': '⚫', 'noir': '⚫', 'أبيض': '⚪', 'white': '⚪', 'blanc': '⚪', 'شفاف': '⚪', 'transparent': '⚪',
  'فضي': '🔘', 'رمادي': '🔘', 'silver': '🔘', 'gris': '🔘', 'gray': '🔘', 'grey': '🔘',
  'أزرق': '🔵', 'كحلي': '🔵', 'سماوي': '🔵', 'blue': '🔵', 'bleu': '🔵',
  'أخضر': '🟢', 'تركوازي': '🟢', 'تركواز': '🟢', 'green': '🟢', 'vert': '🟢',
  'أصفر': '🟡', 'ذهبي': '🟡', 'yellow': '🟡', 'jaune': '🟡', 'gold': '🟡', 'برتقالي': '🟠', 'orange': '🟠',
  'أحمر': '🔴', 'red': '🔴', 'rouge': '🔴', 'وردي': '💗', 'pink': '💗', 'rose': '💗',
  'بنفسجي': '🟣', 'ليلكي': '🟣', 'violet': '🟣', 'بني': '🟤', 'بيج': '🟤', 'brown': '🟤', 'marron': '🟤', 'beige': '🟤'
}).map(([k, v]) => [nz(k), v]));
const csHex = c => CS_HEX[nz(c)] || '';
const csEmo = c => CS_EMO[nz(c)] || '🔹';
const csBg = c => { const h = csHex(c); return h == 'pat' ? 'repeating-conic-gradient(#cbd5e1 0 25%,#f8fafc 0 50%) 50%/12px 12px' : (h || '#64748b'); };
function csInk(c) {
  const h = csHex(c), m = /^#([0-9a-f]{6})$/i.exec(h);
  if (h == 'pat') return '#111827';
  if (!m) return '#fff';
  const n = parseInt(m[1], 16);
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 150 ? '#111827' : '#fff';
}

/* ---------- البيانات: كل نوع = لون واحد {id, g:'', c, n} ----------
   تحويل تلقائي مرة واحدة للبيانات القديمة (رجالي/نسائي): تُدمج الأعداد في اللون نفسه. */
function csN(i) {
  const V0 = i.v;
  if (!V0 || !V0.some(x => x.g)) { if (i.glim) delete i.glim; return i; }
  const out = [];
  V0.forEach(x => {
    const c = x.c || '', y = out.find(z => z.c == c);
    if (y) y.n += x.n; else out.push({ id: x.id, g: '', c, n: x.n });
  });
  i.v = out; delete i.glim;
  return i;
}
const csTot = i => (csN(i).v || []).reduce((a, x) => a + x.n, 0);
const csLim = i => i.lim ?? lim('cl');
const csVSt = (i, x) => x.n <= 0 ? 'r' : x.n <= csLim(i) ? 'y' : 'g';
const csSt = i => {
  const V0 = csN(i).v || [];
  if (!V0.length) return 'r';
  const ss = V0.map(x => csVSt(i, x));
  if (ss.includes('r')) return 'r';
  if (ss.includes('y') || !!(i.need && i.need.trim())) return 'y';
  return 'g';
};
const csChipCls = (i, x) => { const s = csVSt(i, x); return s == 'r' ? 'low' : s == 'y' ? 'warn' : ''; };
const csGSummaryTxt = i => (csN(i).v || []).map(x => `${x.c || 'عام'} ${x.n}`).join(' · ') || 'لا ألوان';

/* ---------- العرض: دوائر الألوان ---------- */
function csDot(x, st, txt) {
  const ring = st == 'r' ? `;box-shadow:0 0 0 3px ${DT.r}` : st == 'y' ? `;box-shadow:0 0 0 3px ${DT.y}` : '';
  return `<span class="csd" style="background:${csBg(x.c)};color:${csInk(x.c)}${ring}">${txt}</span>`;
}
/* شريط الدوائر: الضغط عليه يفتح نافذة الموديل. cmp = بدون أسماء للألوان المعروفة */
function csChipsHtml(i, cmp) {
  const V0 = csN(i).v || [];
  if (!V0.length) return `<div class="cs-sws" onclick="csOpen('${i.id}')"><span class="m">لا ألوان — اضغط للإضافة</span></div>`;
  return `<div class="cs-sws" onclick="csOpen('${i.id}')">` + V0.map(x => `<span class="csw">${csDot(x, csVSt(i, x), x.n)}${!cmp || !csHex(x.c) ? `<small class="m">${esc(x.c || 'عام')}</small>` : ''}</span>`).join('') + `</div>`;
}
function csCard(i) {
  const s = csSt(i), cmp = isCmp('case') && V.v == 'sec';
  const pr = i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : '';
  const nt = (i.need ? `<div class="cs-nt" style="color:${DT.r}">خاصنا: ${esc(i.need)}</div>` : '') + (i.rem ? `<div class="cs-nt m">باقي: ${esc(i.rem)}</div>` : '');
  return cardH(`<div class="row2" style="gap:8px;flex-wrap:wrap"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="csOpen('${i.id}')"><b>${esc(i.name)}</b>${nt}</div>${pr}${csChipsHtml(i, cmp)}</div>${cmp ? '' : fxShow(i)}`, colOf(i), 'cmp');
}
function csView() {
  const allCs = S.items.filter(i => i.sec == 'case'), totPcs = allCs.reduce((s, i) => s + csTot(i), 0), lowCnt = allCs.filter(i => csSt(i) != 'g').length;
  let a = srt(allCs, 'case', i => i.name, csTot, i => i.at);
  if (V.cf) a = a.filter(i => csSt(i) != 'g');
  const pg = pgSlice('cs', a);
  const tagsHtml = `<button class="tag ${!V.cf ? 'on' : ''}" onclick="V.cf=0;render()">الكل (${allCs.length} موديل · ${totPcs} قطعة)</button>`
    + `<button class="tag ${V.cf ? 'on' : ''}" onclick="V.cf=1;render()">يحتاج شراء (${lowCnt})</button>`;
  return {
    t: 'البوشيط',
    h: `<button class="btn" onclick="csAdd()">+ إضافة موديل بوشيط</button>`
      + secPanel('case', tagsHtml)
      + (pg.items.map(csCard).join('') + pg.more || emptyBox('لا توجد موديلات بوشيط في هذا الفلتر', 'اضغط على «+ إضافة موديل بوشيط» في الأعلى لإضافة أول موديل'))
  };
}

/* ---------- نافذة الموديل: − / + لكل لون ---------- */
let CQ = '', CSCODE = '', CSD = {}, CSUP = 0;   // CSUP = موديل زادت كميته أثناء النافذة (لفحص طلبات الزبائن عند الإغلاق)
function csClosed() { const id = CSUP; CSUP = 0; const i = id && find(id); if (i) reqChk('بوشيط ' + i.name, 1); }
const csGo = (f, id) => { finish(null); setTimeout(() => window[f](id), 450); };
function csOpen(id) { if (!find(id)) return; CSUP = 0; csSheetR(id); sheetOpen(csClosed); }
function csSheetR(id) {
  const i = find(id); if (!i) return;
  const V0 = csN(i).v || [];
  const rows = V0.map(x => `<div class="cs-vr">${csDot(x, csVSt(i, x), '')}<b>${esc(x.c || 'عام')}</b>`
    + (x.n <= 0 && can('del') ? `<button class="tag" style="margin:0;color:${DT.r}" onclick="csX('${i.id}','${x.id}')">× حذف اللون</button>` : '')
    + `<button class="btn s cs-sb" onclick="csS('${i.id}','${x.id}',-1)">−</button><span class="cn">${x.n}</span><button class="btn cs-sb" onclick="csS('${i.id}','${x.id}',1)">+</button></div>`).join('')
    || '<p class="m">لا توجد ألوان بعد: اضغط «+ لون».</p>';
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc(i.name)}</h3>`
    + `<p class="m">«قارب» عند ${csLim(i)} فأقل لكل لون${i.price ? ' · ' + esc(fmtPr(i.price)) : ''}</p>`
    + rows
    + (i.need ? `<div class="rs row2" style="margin-top:8px;gap:6px"><span class="dotl" style="background:${DT.r}"></span><span style="flex:1">خاصنا: ${esc(i.need)}</span><button class="tag" style="margin:0;color:${DT.r}" onclick="csClrNeed('${i.id}');csSheetR('${i.id}')">× مسح</button></div>` : '')
    + (i.rem ? `<div class="m" style="margin-top:6px"><span class="dotl" style="background:${DT.g}"></span> باقي: ${esc(i.rem)}</div>` : '')
    + `<div class="cs-acts"><button class="btn s" onclick="csAddView('${i.id}')">+ لون</button><button class="btn s" onclick="csGo('csLimEd','${i.id}')">الحد والسعر</button><button class="btn s" onclick="csGo('csQuickNote','${i.id}')">باقي / خاصنا</button>`
    + (S.fields.some(f => f.sec == 'case') ? `<button class="btn s" onclick="csGo('csFx','${i.id}')">خانات</button>` : '')
    + `<button class="btn s" onclick="csGo('csDel','${i.id}')">حذف الموديل</button></div>`
    + `<div class="acts"><button class="btn" onclick="finish(null)">تم</button></div>`;
}
function csC(id, vid, d) {
  const it = find(id), x = it && (it.v || []).find(y => y.id == vid); if (!x) return;
  upd(() => { x.n = Math.max(0, x.n + d); touch(it); });
  if (d > 0) reqChk('بوشيط ' + it.name);
}
function csS(id, vid, d) { csC(id, vid, d); if (d > 0) CSUP = id; csSheetR(id); }
function csX(id, vid) {
  if (!can('del')) return toast('الحذف للمدير فقط');
  const r = find(id); if (!r) return;
  commit('تم حذف اللون', () => { r.v = r.v.filter(x => x.id != vid); touch(r); });
  csSheetR(id);
}
function csDel(id) { del('items', id, find(id).name); }
function csClrNeed(id) {
  const i = find(id); if (!i || !i.need) return;
  commit('تم مسح تنبيه «خاصنا»', () => { i.need = ''; i.by = S.me; });
}

/* ---------- الإضافة: ابحث أولاً، ثم اللون والعدد ---------- */
function csAdd() {
  CQ = ''; CSD = {};
  $('sh').innerHTML = `<div class="bar"></div><h3>إضافة بوشيط</h3>${invModelDatalist()}<label>ابحث أولاً: موديل الهاتف<input data-sug="mn" oninput="csF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;
  sheetOpen(csClosed); csF('');
}
function csF(q) {
  CQ = q.trim(); const n = nz(q), m = S.items.filter(i => i.sec == 'case' && (!n || nz(i.name).includes(n))).sort((a, b) => b.at - a.at).slice(0, 6);
  $('pr').innerHTML = m.map(i => `<button class="card row2" onclick="csPick('${i.id}')"><b>${esc(i.name)}</b><span class="m">${esc(csGSummaryTxt(i))}</span></button>`).join('') + `<button class="btn" onclick="csNew()">+ موديل جديد${CQ ? ' «' + esc(CQ) + '»' : ''}</button>`;
}
function csPick(id) { CSD = { id }; csAddView(id); }
function csNew() {
  if (!CQ) return toast('اكتب اسم الموديل');
  const d = S.items.find(i => i.sec == 'case' && nz(i.name) == nz(CQ)); if (d) return csPick(d.id);
  CSD = { name: CQ }; csAddView(null);
}
function csAddView(id) {
  const i = id ? find(id) : null, nm = i ? i.name : CSD.name; if (!nm) return;
  fsInit([['color', 'اللون']], {});
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc(nm)} — إضافة لون</h3><div id="cc"></div>`
    + `<div class="row2" style="gap:8px"><label style="flex:1">العدد<input id="cq" type="number" value="${i ? 1 : 3}"></label>${i ? '' : `<label style="flex:1">السعر (اختياري)<input id="cpr" type="tel" placeholder="مثال: 30"></label>`}</div>`
    + `<div class="acts"><button class="btn s" onclick="${i ? `csSheetR('${i.id}')` : 'finish(null)'}">${i ? 'رجوع' : 'إلغاء'}</button><button class="btn s" onclick="csAddOk(1)">+ لون آخر</button><button class="btn" onclick="csAddOk(0)">حفظ</button></div>`;
  chipsR();
}
function csAddOk(more) {
  const c = FS.v.color || '', n = ci($('cq').value), pr = $('cpr') ? $('cpr').value.trim() : '';
  let i = CSD.id ? find(CSD.id) : null;
  if (!i && !CSD.name) return;
  upd(() => {
    if (!i) {
      const now = Date.now();
      i = { id: uid(), sec: 'case', name: CSD.name, v: [], by: S.me, at: now, cf: now };
      if (CSCODE) { i.code = CSCODE; CSCODE = ''; }
      S.items.push(i); CSD = { id: i.id };
    }
    if (pr && can('price')) i.price = pr;
    csN(i); i.v = i.v || [];
    const x = i.v.find(y => y.c == c);
    if (x) x.n += n; else i.v.push({ id: uid(), g: '', c, n });
    touch(i, 1);
  });
  if (n > 0) CSUP = i.id;
  toast('تمت الإضافة');
  if (more) csAddView(i.id); else finish(null);
}

/* ---------- الحد والسعر والملاحظات والخانات ---------- */
function csFx(id) {
  const i = find(id); fsInit([], {}, 'case', i);
  $('sh').innerHTML = '<div class="bar"></div><h3>خانات: ' + esc(i.name) + '</h3><div id="fx"></div><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({})">حفظ</button></div>';
  sheetOpen(v => { if (v) upd(() => { i.x = { ...FS.fx }; i.by = S.me; }); }); fxR();
}
function csLimEd(id) {
  const i = find(id);
  ask('الحد والسعر — بوشيط ' + i.name, [
    { k: 'p', l: 'سعر البيع (درهم — اختياري)', t: 'tel', v: i.price || '' },
    { k: 'n', l: `«قارب النفاد» عند عدد فأقل لكل لون (فارغ = الحد العام ${lim('cl')})`, t: 'tel', v: i.lim ?? '' }
  ]).then(v => {
    if (!v) return; const n = v.n.trim();
    upd(() => {
      if (n === '') delete i.lim; else i.lim = ci(n);
      if (can('price')) i.price = (v.p || '').trim();
      i.by = S.me;
    });
  });
}
function csQuickNote(id) {
  const i = find(id);
  ask('بوشيط ' + i.name, [{ k: 'rem', l: 'شنو باقي عندنا فالمحل؟ (مثال: غير الأسود)', v: i.rem || '' }, { k: 'need', l: 'شنو خاص يجيب المعلم؟ (مثال: فضي / كحلي)', v: i.need || '' }]).then(v => { if (v) commit('تم التحديث', () => { i.rem = v.rem.trim(); i.need = v.need.trim(); i.by = S.me; }); });
}

/* ---------- الشراء: يُضاف العدد للألوان الناقصة (أو لكل الألوان إن لم يوجد ناقص) ---------- */
function csBuyApply(i, n) {
  csN(i); i.v = i.v || [];
  if (!i.v.length) i.v.push({ id: uid(), g: '', c: '', n });
  else { const t = i.v.filter(x => csVSt(i, x) != 'g'); (t.length ? t : i.v).forEach(x => x.n += n); }
  i.need = ''; touch(i, 1);
}
function buyC(id) {
  const i = find(id); if (!i) return;
  const bad = (csN(i).v || []).filter(x => csVSt(i, x) != 'g'), lbl = bad.length ? bad.map(x => x.c || 'عام').join(' + ') : 'كل الألوان';
  qty(`بوشيط ${i.name} (${lbl})`, 3, n => { csBuyApply(i, n); reqChk('بوشيط ' + i.name, 1); });
}

/* تحويل البيانات القديمة عند الإقلاع (يُحفظ مع أول حفظ عادي) */
S.items.forEach(i => { if (i.sec == 'case') csN(i); });
