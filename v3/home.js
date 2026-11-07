/* ============================================================
   home.js — الرئيسية، البحث الموحّد، المزيد والإعدادات، الأيقونة العائمة
   يُحمَّل بعد extra.js وقبل users.js.
   ============================================================ */

/* ---------- الأقسام الـ 6 (مع إجمالي القطع وحالة التعبئة وطلبات الزبائن) ---------- */
const SECS = [
  ['phones', 'الهواتف', 'cphone'],
  ['glass', 'الأنتي كاس', 'cglass'],
  ['case', 'البوشيط', 'ccase'],
  ['acc', 'الإكسسوارات', 'cacc'],
  ['tp', 'التعبئة', 'ctopup'],
  ['req', 'طلبات الزبائن', 'creq']
];
function secSub(k) {
  if (k == 'glass') return S.gg.length + ' مجموعة';
  if (k == 'tp') {
    const L = typeof tpLines == 'function' ? tpLines() : [];
    if (!L.length) return 'متوفر بالكامل ✓';
    const r = L.filter(x => x[2] == 'r').length, y = L.length - r;
    return [r && r + ' نافد', y && y + ' قارب'].filter(Boolean).join(' · ');
  }
  if (k == 'req') {
    const n = (S.req || []).length;
    return n ? n + ' طلب مسجّل' : 'سأل ولم نجد';
  }
  const L = S.items.filter(i => i.sec == k);
  if (k == 'phones') { const pcs = L.reduce((a, i) => a + (+i.cnt || 0), 0); return L.length + ' صنف · ' + pcs + ' قطعة'; }
  if (k == 'case') { const pcs = L.reduce((a, i) => a + (typeof csTot == 'function' ? csTot(i) : 0), 0); return L.length + ' موديل · ' + pcs + ' قطعة'; }
  return L.length + ' صنف';
}
const secGo = k => k == 'tp' ? "go('tp')" : k == 'req' ? "go('req')" : `go('sec',{k:'${k}'})`;

/* ---------- البحث الموحّد + بطاقة كاشف الأثمنة الفوري (بدون تكرار) ---------- */
let SC = '', SQ_T = 0;   // نطاق البحث الحالي + مؤقت تهدئة الكتابة
const scopeChips = () => [['', 'الكل'], ...SRCH.map(p => [p.k, p.l])].map(([k, l]) => `<button class="tag ${SC == k ? 'on' : ''}" onclick="scSet('${k}')">${l}</button>`).join('');
/* مصادر بحث إضافية: الصيانة، طلبات الزبائن، دليل أسعار الإصلاح */
SRCH.push(
  { k: 'rp', l: 'صيانة', run: n => S.rp.filter(r => nzOf(r, rpText).includes(n)).sort((x, y) => (y.t0 || 0) - (x.t0 || 0)).slice(0, 20).map(rc) },
  { k: 'req', l: 'طلبات الزبائن', run: n => S.req.filter(q => nz(q.t).includes(n)).slice(0, 20).map(q => typeof rqCard == 'function' ? rqCard(q) : `<div class="card"><div class="m">${fd(q.at)} · ${esc(q.by || '')}</div><div>${esc(q.t)}</div><div class="sub">${rqTel(q.t) ? `<button class="btn s sm" onclick="rqWA('${q.id}')">واتساب</button>` : ''}<button class="btn s sm" onclick="rqD('${q.id}')">مسح</button></div></div>`) },
  { k: 'gd', l: 'أسعار الإصلاح', run: n => S.guide.filter(g => nz(g.m + ' ' + g.f + ' ' + (g.n || '')).includes(n)).slice(0, 20).map(gdCard) }
);
function scSet(k) { SC = k; const b = $('sc'); if (b) b.innerHTML = scopeChips(); sq(Q, 1); }

function srch(q) {
  const n = nz(q); if (!n) return '';
  const o = [];
  if (!SC && n.length >= 2 && typeof window.priceLookupHtml == 'function') {
    const topCard = window.priceLookupHtml(n);
    if (topCard) o.push(topCard);
  }
  SRCH.forEach(p => {
    if (SC ? SC != p.k : p.k == 'prc') return;
    const r = p.run(n);
    if (r.length) o.push((SC ? '' : `<h3>${p.l} <span class="m">(${r.length})</span></h3>`) + r.join(''));
  });
  return o.join('') || emptyBox('لا توجد نتائج مطابقة لبحثك');
}
function sq(q, now) {
  if (q && !QP) { QP = 1; history.pushState({ V, q: 1 }, ''); }
  Q = q;
  const hasQ = !!(q && String(q).trim());
  const cBtn = $('q_clr'); if (cBtn) cBtn.hidden = !hasQ;
  const hm = $('hm'); if (hm) hm.hidden = hasQ;
  clearTimeout(SQ_T);
  const run = () => { const r = $('res'); if (r) r.innerHTML = hasQ ? srch(q) : ''; };
  if (!hasQ || now) run();
  else SQ_T = setTimeout(run, 90);
}
function qClear() {
  const i = $('q_inp'); if (i) { i.value = ''; i.focus(); }
  sq('', 1);
}
function goSearch() { go('home'); setTimeout(() => { const i = $('q_inp') || document.querySelector('main input'); if (i) i.focus(); }, 60); }

/* ---------- شريط النظرة السريعة في الرئيسية ---------- */
function homeQuickBar() {
  const rpIn = S.rp.filter(r => r.st == 'in').length;
  const rpRd = S.rp.filter(r => r.st == 'rd').length, rpOk = S.rp.filter(r => r.st == 'rd' && r.res != 'fail' && r.res != 'ref').length;
  const need = typeof invLines == 'function' ? invLines(false).length : 0;
  const rq = (S.req || []).length;
  const P = (cls, on, icn, n, l, sub) => `<button class="qpill ${cls}" onclick="${on}"><div class="qic">${ic(icn)}</div><div class="qn">${n}</div><div class="ql">${l}</div>${sub ? `<div class="qs">${sub}</div>` : ''}</button>`;
  return `<div class="qbar cmp">`
    + P('rp', `go('rp',{tab:'${rpOk ? 'rd' : rpRd ? 'nf' : 'in'}'})`, 'tool', rpIn + rpRd, 'في الصيانة', rpRd ? rpRd + ' جاهز للتسليم' : '')
    + P(need ? 'al' : 'ok', "go('rep')", need ? 'alert' : 'check', need, 'نواقص المخزون', need ? '' : 'مكتمل')
    + P(rq ? 'rp' : 'ok', "go('req')", 'chat', rq, 'طلبات الزبائن', '')
    + `</div>`
    + todayLine();
}
function todayLine() {
  if (!S.rp.length) return '';
  const day = new Date(); day.setHours(0, 0, 0, 0); const t = day.getTime();
  const a = S.rp.filter(r => r.t0 >= t).length, b = S.rp.filter(r => r.st == 'dn' && r.t2 >= t).length;
  return `<div class="m" style="text-align:center;margin:-2px 0 8px">اليوم: استلمنا <b>${a}</b> · سلّمنا <b>${b}</b></div>`;
}
/* ---------- الرئيسية ---------- */
const bkHide = () => { try { localStorage.setItem('bkHide', Date.now()); } catch (e) { } render(); };
VW.home = () => {
  const old = isAdmin() && (S.items.length || S.rp.length) && Date.now() - (S.cfg.lb || 0) > 7 * 864e5;
  let hid = 0; try { hid = Date.now() - (+localStorage.getItem('bkHide') || 0) < 864e5; } catch (e) { }
  const bk = old && !hid ? `<div class="bkb">${I('alert')}<span>لم تُحفظ نسخة خارجية منذ أسبوع</span><button class="btn sm" onclick="BKP()">حفظ</button><button class="bkx" onclick="bkHide()" aria-label="إغلاق">✕</button></div>` : '';
  const call = L => L.map(f => f()).join('');
  const T = HOME.tools.map(f => f()), A = HOME.after.map(f => f());
  const scan = T.filter(h => h.includes('bcHome()')).join('').replace('بيع سريع −1', 'بيع سريع (خصم 1)');
  const more = T.filter(h => !h.includes('bcHome()')).join('') + A.join('');
  return {
    t: 'محل عزيز',
    h: bk + call(HOME.top)
      + `<div class="sec-panel" style="margin-top:4px"><div class="q-wrap"><input id="q_inp" placeholder="ابحث عن ثمن أو سلعة: هاتف، زجاج، تذكرة، زبون…" value="${esc(Q)}" oninput="sq(this.value)"><button id="q_clr" type="button" class="q-clr" ${Q ? '' : 'hidden'} onclick="qClear()" aria-label="مسح البحث">✕</button></div>`
      + `<div id="sc" class="sec-tags nowrap">${scopeChips()}</div></div><div id="res"></div>`
      + '<div id="hm">' + homeQuickBar() + scan
      + '<h3>الأقسام</h3>'
      + `<div class="grid">${SECS.map(([k, n, i]) => `<button class="card sc cs2" onclick="${secGo(k)}">${ic(i)}<span class="ct"><b>${n}</b><span class="m">${secSub(k)}</span></span></button>`).join('')}</div>`
      + more + '</div>',
    a: () => sq(Q, 1)
  };
};

/* ---------- المزيد (منظم بأقسام مستقلة وبطاقات مدمجة الوصف) ---------- */
const MG = [
  ['shop', 'المحل', 'كل ما يخص الأقسام: الهواتف والأنتي كاس والبوشيط والإكسسوارات والصيانة والتعبئة والتقرير. لكل قسم صفحة واحدة تجمع وسومه وحدوده.', 'grid'],
  ['dev', 'المظهر والقفل', 'الثيم وحجم الخط والزر العائم، ورمز القفل السريع والقفل التلقائي.', 'palette'],
  ['adm', 'الإدارة والبيانات', 'المستخدمون والصلاحيات، المزامنة بين الأجهزة، النسخ الاحتياطي، وسلة المحذوفات.', 'users']
];
const STX = [
  ['الشراء السريع بضغطة واحدة في التقرير (✓)', "go('st_rep')", 'التقرير اليومي', 'تأشير صح كمية افتراضية'],
  ['ساعة تذكير التقرير', "go('st_rep')", 'التقرير اليومي', 'موعد تنبيه إرسال'],
  ['أيام بلا تذكير', "go('st_rep')", 'التقرير اليومي', 'عطلة'],
  ['عنوان التقرير وعبارة الختام', "go('st_rep')", 'التقرير اليومي', 'توقيع'],
  ['ما يظهر في التقرير', "go('st_rep')", 'التقرير اليومي', 'أسعار طلبات ديون'],
  ['الثيم (فاتح / ليلي)', "go('st_look')", 'المظهر والقفل', 'لون داكن ليل'],
  ['حجم الخط', "go('st_look')", 'المظهر والقفل', 'كبير صغير'],
  ['الزر العائم (+)', "go('st_look')", 'المظهر والقفل', 'أيقونة إضافة'],
  ['حد «متوفر» و«قارب» لبطاقات التعبئة', "go('st_tp')", 'التعبئة', '5 10 20 50 درهم'],
  ['حدود رصيد هاتف التعبئة', "go('st_tp')", 'التعبئة', 'منخفض نافد'],
  ['ساعة تذكير التعبئة', "go('st_tp')", 'التعبئة', 'صباح'],
  ['الجولة: يُعتبر الصنف غير مؤكد بعد (أيام)', "go('st_rep')", 'التقرير اليومي', 'جولة تأكيد مخزون']
];
const stItems = () => {
  const o = [];
  MG.forEach(([k, t]) => MORE.filter(x => x.g == k).forEach(x => o.push({ l: x.l, fn: x.fn, p: t, kw: x.d || '' })));
  Object.values(CATS).forEach(c => c[1].forEach(([l, fn]) => o.push({ l, fn, p: c[0], kw: '' })));
  STX.forEach(([l, fn, p, kw]) => o.push({ l, fn, p, kw }));
  return o;
};
function stQ(q) {
  const n = nz(q), g = $('stg'), r = $('str'); if (!g || !r) return;
  g.style.display = n ? 'none' : '';
  if (!n) { r.innerHTML = ''; return; }
  const seen = {}, L = stItems().filter(x => { const k = x.l + x.fn; if (seen[k]) return false; seen[k] = 1; return nz(x.l + ' ' + x.kw + ' ' + x.p).includes(n); });
  r.innerHTML = L.map(x => `<button class="card row2" onclick="${x.fn}"><b>${esc(x.l)}</b><span class="m">${esc(x.p)}</span></button>`).join('') || '<p class="m">لا نتائج</p>';
}
VW.st = () => ({
  t: 'المزيد',
  h: `<input placeholder="ابحث في الإعدادات: حد، لون، قفل، تقرير..." oninput="stQ(this.value)"><div id="str"></div><div id="stg">`
    + MG.map(([k, t, d, icon]) => `<button class="card st-card" onclick="go('st_grp',{g:'${k}'})"><div class="st-ic">${ic(icon)}</div><div class="st-txt"><b>${t}</b><div class="m">${d}</div></div><span class="st-arr">${ic('back')}</span></button>`).join('')
    + '</div>'
});
VW.st_grp = () => {
  const g = V.g || 'shop', info = MG.find(x => x[0] == g) || MG[0];
  const L = MORE.filter(x => x.g == g).sort((a, b) => (a.o || 50) - (b.o || 50));
  const R = x => {
    const sub = x.n ? x.n() : '';
    return `<button class="card st-card" onclick="${x.fn}"><div class="st-txt"><b>${esc(x.l)}</b>${x.d ? `<div class="m">${esc(x.d)}</div>` : ''}</div>${sub ? `<span class="m" style="white-space:nowrap">${esc(sub)}</span>` : ''}<span class="st-arr">${ic('back')}</span></button>`;
  };
  const A = L.filter(x => x.adv), B = L.filter(x => !x.adv);
  return {
    t: info[1],
    h: `<p class="m">${info[2]}</p>` + B.map(R).join('')
      + (A.length ? `<details class="card" style="margin-top:12px"><summary><b>خيارات متقدمة</b> <span class="m">(${A.length}) — نادراً ما تحتاجها</span></summary><div style="margin-top:8px">${A.map(R).join('')}</div></details>` : '')
  };
};
MORE.push(
  { g: 'look', o: 10, l: 'الثيم وحجم الخط والأيقونة العائمة', d: 'ألوان التطبيق وحجم الخط والزر العائم (لهذا الجهاز)', fn: "go('st_look')" },
  { g: 'usr', o: 10, l: 'المستخدمون والصلاحيات', d: 'إضافة موظفين وتحديد ما يستطيعون فعله', fn: "go('st_users')" },
  { g: 'usr', o: 20, l: 'رمز القفل السريع', d: 'رمز قصير لفتح التطبيق بسرعة', fn: 'lkSet()', n: () => S.cfg.lk ? 'مُعيَّن' : 'غير مُعيَّن' },
  { g: 'usr', o: 30, l: 'القفل التلقائي', d: 'يقفل التطبيق والمدير بعد مدة بلا استعمال', fn: "limEd('alk')", n: () => (S.cfg.alk ?? DL0.alk) + ' دقيقة' },
  { g: 'data', o: 20, l: 'النسخ الاحتياطي والاستعادة', d: 'حفظ نسخة من البيانات أو استعادتها', fn: "go('st_bk')" },
  { g: 'sec', o: 60, l: 'كل الوسوم (قائمة كاملة)', d: 'كل القوائم (ماركات، ألوان، سعات...) في مكان واحد', fn: "go('st_tags')" }
);

(() => {
  MORE.push({ g: 'adm', o: 40, l: 'سلة المحذوفات', d: 'استرجاع ما حُذف خلال آخر 30 يوماً', fn: "go('st_trash')", n: () => S.trash.length || '' });
  const P = {
    'الهواتف': ['shop', 10], 'الأنتي كاس': ['shop', 20], 'البوشيط': ['shop', 30], 'الإكسسوارات': ['shop', 40], 'الصيانة': ['shop', 50],
    'حدود التعبئة': ['shop', 60, 0, 'التعبئة'], 'إعدادات التقرير': ['shop', 70, 0, 'التقرير اليومي'],
    'إحصائيات: الأعطال وطلبات الزبائن': ['shop', 80],
    'كل الوسوم (قائمة كاملة)': ['shop', 90, 1], 'الحقول في النماذج': ['shop', 91, 1], 'الخانات المخصصة': ['shop', 92, 1], 'تلوين البطاقات': ['shop', 93, 1], 'حدود النفاد': ['shop', 94, 1, 'حدود النفاد العامة'],
    'الثيم وحجم الخط والأيقونة العائمة': ['dev', 10], 'رمز القفل السريع': ['dev', 20], 'القفل التلقائي': ['dev', 30],
    'المستخدمون والصلاحيات': ['adm', 10], 'المزامنة بين الأجهزة': ['adm', 20], 'النسخ الاحتياطي والاستعادة': ['adm', 30]
  };
  const D = {
    'الهواتف': 'الماركات والألوان والسعات وألوان الماركات وحدود النفاد', 'الأنتي كاس': 'أنواع الزجاج والمستويات والحدود',
    'البوشيط': 'الجنس والألوان وحدود النفاد (رجالي ونسائي)', 'الإكسسوارات': 'الأنواع والموصلات والفئات وحدود كل نوع',
    'الصيانة': 'أعطال الصيانة، دليل الأسعار، مدة حفظ الصور، والأرشفة', 'تلوين البطاقات': 'ألوان خفيفة للتمييز بين الماركات والأقسام',
    'الحقول في النماذج': 'اختر الحقول التي تظهر عند إضافة هاتف أو غيره', 'الخانات المخصصة': 'أضف خانة خاصة بك (مثل: الضمان) لأي قسم',
    'المزامنة بين الأجهزة': 'ربط هاتفين أو أكثر ليتطابقوا في البيانات',
    'إحصائيات: الأعطال وطلبات الزبائن': 'أكثر الأعطال تكراراً وما يطلبه الزبائن ولا نملكه'
  };
  MORE.forEach(x => {
    const p = P[x.l];
    if (D[x.l] && !x.d) x.d = D[x.l];
    if (p) { x.g = p[0]; x.o = p[1]; x.adv = p[2] || 0; if (p[3]) x.l = p[3]; }
    else if (!MG.some(m => m[0] == x.g)) { x.g = 'shop'; x.o = 99; x.adv = 1; }
  });
})();

/* ---------- المظهر والأيقونة العائمة ---------- */
const THA = [['b', 'أزرق', '#2563eb'], ['g', 'أخضر', '#059669'], ['v', 'بنفسجي', '#7c3aed'], ['o', 'برتقالي', '#ea580c']], THMD = [['a', 'تلقائي'], ['l', 'نهاري'], ['d', 'ليلي']];
VW.st_look = () => {
  const fabOn = S.cfg.fab !== 0, [ac, md] = thGet(), fs = FS_OLD[S.cfg.fs] || S.cfg.fs || 18;
  return {
    t: 'المظهر والعرض',
    h: '<h3>الأيقونة العائمة السريعة (لهذا الجهاز)</h3>'
      + `<button class="card row2" onclick="fabReset();upd(()=>S.cfg.fab=${fabOn ? 0 : 1})"><b>زر عائم للإضافة السريعة في الرئيسية</b><span class="m">${fabOn ? 'مُفعَّل' : 'مُعطَّل'}</span></button>`
      + (fabOn ? `<button class="card row2" onclick="fabLockToggle()"><b>تثبيت الزر العائم في مكانه (منع السحب)</b><span class="m">${fabLocked() ? 'مُثبَّت' : 'قابل للسحب'}</span></button>` : '')
      + '<h3>الوضع (لهذا الجهاز فقط)</h3>' + THMD.map(([k, n]) => `<button class="tag ${md == k ? 'on' : ''}" onclick="upd(()=>S.cfg.th='${ac}-${k}')">${n}</button>`).join('')
      + '<p class="m">«تلقائي» يتبع وضع الهاتف: نهاري في النهار وليلي في الليل.</p>'
      + '<h3>اللون</h3>' + THA.map(([k, n, c]) => `<button class="tag ${ac == k ? 'on' : ''}" onclick="upd(()=>S.cfg.th='${k}-${md}')"><i style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};border:2px solid #fff"></i>${n}</button>`).join('')
      + '<h3>حجم الخط</h3>' + [[16, 'صغير'], [18, 'عادي'], [20, 'كبير'], [22, 'أكبر']].map(([v, l]) => `<button class="tag ${fs == v ? 'on' : ''}" onclick="upd(()=>S.cfg.fs=${v})">${l}</button>`).join('')
  };
};

/* ---------- الأيقونة العائمة الذكية (FAB — في الرئيسية فقط) ---------- */
function fabAct() {
  $('sh').innerHTML = `<div class="bar"></div><h3>إجراء سريع</h3>`
    + `<button class="btn" onclick="finish(1)">${I('mobile')} + إضافة هاتف</button>`
    + `<button class="btn s" onclick="finish(2)">${I('tool')} + استلام صيانة</button>`
    + `<button class="btn s" onclick="finish(3)">${I('scan')} مسح باركود أو IMEI</button>`
    + `<button class="btn s" onclick="finish(4)">${I('chat')} تسجيل طلب زبون</button>`
    + `<button class="btn s" onclick="finish(5)">${I('check')} الجرد والجولة اليومية</button>`
    + `<button class="btn s" onclick="finish(null)">إلغاء</button>`;
  sheetOpen(w => {
    if (w == 1) phAdd();
    else if (w == 2) rEd(null);
    else if (w == 3) bcHome();
    else if (w == 4) rq();
    else if (w == 5) go('jl');
  });
}
const FABK = 'fabPos', FABL = 'fabLk'; let FABM = 0;
const fabLocked = () => { try { return localStorage.getItem(FABL) == '1'; } catch (e) { return false; } };
function fabLockToggle() { try { fabLocked() ? localStorage.removeItem(FABL) : localStorage.setItem(FABL, '1'); } catch (e) { } render(); }
function fabPlace() {
  const el = $('fab'); if (!el) return;
  let p = null; try { p = JSON.parse(localStorage.getItem(FABK) || 'null'); } catch (e) { }
  if (!p || (p.s != 'l' && p.s != 'r')) { el.style.left = el.style.top = el.style.bottom = el.style.right = ''; return; }
  const w = el.offsetWidth || 50, h = el.offsetHeight || 50;
  const x = p.s == 'l' ? 14 : innerWidth - w - 14, y = Math.min(Math.max(70, (+p.y || 0) * innerHeight), innerHeight - h - 4);
  Object.assign(el.style, { left: x + 'px', top: y + 'px', bottom: 'auto', right: 'auto' });
}
function fabReset() { try { localStorage.removeItem(FABK); } catch (e) { } fabPlace(); }
function fabBind(el) {
  let st = null;
  const mv = e => {
    if (!st) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.m && Math.hypot(dx, dy) < 8) return;
    st.m = true;
    const w = el.offsetWidth || 50, h = el.offsetHeight || 50;
    Object.assign(el.style, { left: Math.min(Math.max(4, st.l + dx), innerWidth - w - 4) + 'px', top: Math.min(Math.max(70, st.t + dy), innerHeight - h - 4) + 'px', bottom: 'auto', right: 'auto' });
  };
  const up = () => {
    removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
    if (st && st.m) {
      const r = el.getBoundingClientRect();
      try { localStorage.setItem(FABK, JSON.stringify({ s: r.left + r.width / 2 < innerWidth / 2 ? 'l' : 'r', y: +(r.top / innerHeight).toFixed(4) })); } catch (e) { }
      FABM = Date.now(); fabPlace();
    }
    st = null;
  };
  el.addEventListener('pointerdown', e => {
    if (fabLocked()) return;
    const r = el.getBoundingClientRect();
    st = { x: e.clientX, y: e.clientY, l: r.left, t: r.top, m: false };
    addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  });
  el.addEventListener('click', e => { if (Date.now() - FABM < 400) { e.stopPropagation(); e.preventDefault(); } }, true);
}
function fabUpd() {
  let el = $('fab');
  if (!el) {
    document.body.insertAdjacentHTML('beforeend', '<div id="fab" hidden></div>');
    el = $('fab'); fabBind(el);
  }
  const show = S.cfg.fab !== 0 && V.v == 'home';
  el.hidden = !show;
  if (!show) return;
  el.innerHTML = `<button class="fab-b" onclick="fabAct()" aria-label="إضافة">${ic('plus')}</button>`;
  fabPlace();
}
addEventListener('resize', fabPlace);
HK.render.push(fabUpd);

HK.render.push(() => {
  document.querySelectorAll('.rtabs, #sc').forEach(c => {
    const t = c.querySelector('.tag.on'); if (!t || c.scrollWidth <= c.clientWidth + 2) return;
    const x = c.getBoundingClientRect(), y = t.getBoundingClientRect();
    c.scrollBy({ left: (y.left + y.width / 2) - (x.left + x.width / 2), top: 0 });
  });
});

/* ---------- الحدود ---------- */
const LMIN1 = ['alk', 'stale'];
const limShow = k => k == 'gmin' ? lim(k) - 1 : lim(k);
function limEd(k) {
  if (!isAdmin()) return toast('للمدير فقط');
  const L = (LM.find(x => x[0] == k) || [])[1] || 'تعديل القيمة';
  ask(L, [{ k: 'v', l: 'القيمة', t: 'tel', v: limShow(k) }]).then(v => {
    if (!v || v.v.trim() === '') return;
    const n = parseInt(dg(v.v), 10);
    if (isNaN(n) || n < (LMIN1.includes(k) ? 1 : 0)) return toast('اكتب رقماً صحيحاً');
    upd(() => S.cfg[k] = k == 'gmin' ? n + 1 : n);
  });
}

/* ---------- الوسوم ---------- */
VW.st_tags = () => ({ t: 'الوسوم', h: Object.keys(TG).map(g => row(TG[g], `go('st_tg',{g:'${g}'})`, S.tags[g].length)).join('') });
function tgAdd(g) {
  if (!can('tags')) return toast('للمدير فقط');
  ask('وسم جديد: ' + TG[g], [{ k: 't', l: 'الاسم' }]).then(v => {
    const t = v && v.t.trim();
    if (t && !S.tags[g].includes(t)) upd(() => { S.tags[g].push(t); if (g == 'brand' && typeof autoBc == 'function') autoBc(t); });
  });
}

/* ---------- المحذوفات ---------- */
VW.st_trash = () => ({
  t: 'المحذوفات (30 يوماً)',
  h: S.trash.map(t => `<div class="card row2"><div style="flex:1"><b>${esc(t.label)}</b><div class="m"><bdi>${fd(t.t)}</bdi></div></div><button class="btn s sm" onclick="restore('${t.id}')">استرجاع</button></div>`).join('') || emptyBox('سلة المحذوفات فارغة')
});