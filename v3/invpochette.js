/* ============================================================
   invpochette.js — البوشيط: رجالي/نسائي، ألوان وتصاميم
   يُحمَّل بعد invglass.js.
   ============================================================ */

/* ============================ البوشيط (مقسّم الحد والحالة بين رجالي ونسائي) ============================ */
const csTot = i => (i.v || []).reduce((a, x) => a + x.n, 0);
const csLim = i => i.lim ?? lim('cl');
const csGenders = () => (S.tags.gender && S.tags.gender.length) ? S.tags.gender : ['رجالي', 'نسائي'];
const csGLim = (i, g) => (i.glim && i.glim[g] != null) ? i.glim[g] : csLim(i);

/* إحصائيات كل جنس للبوشيط: [{g, tot, lim, st}] */
function csGStats(i) {
  const V0 = i.v || [], G = csGenders();
  if (V0.length && V0.every(x => !x.g)) {
    const t = csTot(i), L = csLim(i);
    return [{ g: 'عام', tot: t, lim: L, st: t <= 0 ? 'r' : t <= L ? 'y' : 'g' }];
  }
  const out = [];
  G.forEach(g => {
    const L = csGLim(i, g);
    if (L < 0) return;
    const tot = V0.filter(x => x.g == g).reduce((a, x) => a + x.n, 0);
    out.push({ g, tot, lim: L, st: tot <= 0 ? 'r' : tot <= L ? 'y' : 'g' });
  });
  return out.length ? out : [{ g: 'عام', tot: csTot(i), lim: csLim(i), st: csTot(i) <= 0 ? 'r' : csTot(i) <= csLim(i) ? 'y' : 'g' }];
}

const csSt = i => {
  const gs = csGStats(i);
  if (gs.some(x => x.st == 'r')) return 'r';
  if (gs.some(x => x.st == 'y') || !!(i.need && i.need.trim())) return 'y';
  return 'g';
};
const csGSummaryTxt = i => csGStats(i).map(x => `${x.g} ${x.tot}`).join(' · ');
const csGBadgesHtml = i => csGStats(i).map(x => `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:8px;background:var(--bg);border:1px solid var(--b);font-size:.8rem"><span class="dotl" style="background:${DT[x.st]};width:8px;height:8px"></span><span>${esc(x.g)}:</span><b>${x.tot}</b></span>`).join(' ');
const csChipCls = (i, x) => {
  const L = x.g ? csGLim(i, x.g) : csLim(i);
  return x.n <= 0 ? 'low' : (L > 0 && x.n <= L) ? 'warn' : '';
};

function csChipsHtml(i, cmp) {
  const V0 = i.v || [], ex = EXP['c_' + i.id];
  const limV = !ex && V0.length > (cmp ? 3 : 4) ? V0.slice(0, cmp ? 2 : 4) : V0;
  const missingG = csGenders().map((g, gIdx) => (csGLim(i, g) >= 0 && !V0.some(x => x.g == g)) ? `<div class="cs-chip low"><span>${esc(g)}</span><button onclick="csQuickG('${i.id}',${gIdx},-1)">−</button><b>0</b><button onclick="csQuickG('${i.id}',${gIdx},1)">+</button></div>` : '').join('');
  return `<div class="cs-chips">` + limV.map(x => `<div class="cs-chip ${csChipCls(i, x)}"><span>${esc([x.g, x.c].filter(Boolean).join('·') || 'عام')}</span><button onclick="csC('${i.id}','${x.id}',-1)">−</button><b>${x.n}</b><button onclick="csC('${i.id}','${x.id}',1)">+</button>${x.n <= 0 && can('del') ? `<button onclick="csX('${i.id}','${x.id}')" style="color:#dc2626">×</button>` : ''}</div>`).join('')
    + missingG
    + (V0.length > limV.length || ex ? `<button class="tag" style="margin:0;padding:4px 10px;font-size:.8rem" onclick="toggleExp('c_${i.id}')">${ex ? 'طيّ ▴' : '+' + (V0.length - limV.length) + ' أخرى ▾'}</button>` : '') + `</div>`;
}

function csQuickG(id, gIdx, d) {
  const it = find(id), g = csGenders()[gIdx]; if (!it || !g) return;
  let x = (it.v || []).find(y => y.g == g && !y.c) || (it.v || []).find(y => y.g == g);
  if (!x && d < 0) return;
  upd(() => {
    if (!x) { x = { id: uid(), g, c: '', n: 0 }; it.v = it.v || []; it.v.push(x); }
    x.n = Math.max(0, x.n + d);
    touch(it);
  });
  if (d > 0) reqChk('بوشيط ' + it.name);
}

function csClrNeed(id) {
  const i = find(id); if (!i || !i.need) return;
  commit('تم مسح تنبيه «خاصنا»', () => { i.need = ''; i.by = S.me; });
}

function csCard(i) {
  const s = csSt(i), cmp = isCmp('case') && V.v == 'sec';
  const prHtml = i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : (!cmp && can('price') ? `<button class="tag" style="margin:0;padding:2px 8px;font-size:.76rem" onclick="csLimEd('${i.id}')">+ السعر</button>` : '');
  const chips = csChipsHtml(i, cmp);
  if (cmp) {
    return cardH(`<div class="row2" style="flex-wrap:wrap;gap:6px"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="csQuickNote('${i.id}')"><b>${esc(i.name)}</b></div>${prHtml}${csGBadgesHtml(i)}<button class="btn s sm" onclick="csLimEd('${i.id}')">الحد والسعر</button><button class="btn s sm" onclick="csVar('${i.id}')">+ نوع</button></div>` + chips, colOf(i), 'cmp');
  }
  return cardH(`<div class="row2"><b>${esc(i.name)}</b>${prHtml}<span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]}</span></div>`
    + `<div class="row2" style="flex-wrap:wrap;gap:6px;margin-top:6px">${csGBadgesHtml(i)}<span class="m" style="font-size:.78rem;margin-inline-start:auto">«قارب» عند ${csLim(i)} فأقل لكل جنس</span></div>`
    + chips
    + fxShow(i)
    + (i.rem ? `<div class="m" style="margin-top:6px"><span class="dotl" style="background:${DT.g}"></span> باقي: ${esc(i.rem)}</div>` : '')
    + (i.need ? `<div class="rs row2" style="margin-top:4px;gap:6px"><span class="dotl" style="background:${DT.r}"></span><span style="flex:1">خاصنا: ${esc(i.need)}</span><button class="tag" style="margin:0;padding:2px 8px;font-size:.76rem;color:#dc2626" onclick="csClrNeed('${i.id}')">× مسح</button></div>` : '')
    + `<div class="sub"><button class="btn s sm" onclick="csQuickNote('${i.id}')">باقي / خاصنا</button><button class="btn s sm" onclick="csVar('${i.id}')">+ لون/نوع</button><button class="btn s sm" onclick="csLimEd('${i.id}')">الحد والسعر</button>${S.fields.some(f => f.sec == 'case') ? `<button class="btn s sm" onclick="csFx('${i.id}')">خانات</button>` : ''}<button class="btn s sm" onclick="csDel('${i.id}')">حذف</button></div>`, colOf(i));
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
function csC(id, vid, d) { const it = find(id), x = it.v.find(y => y.id == vid); upd(() => { x.n = Math.max(0, x.n + d); touch(it); }); if (d > 0) reqChk('بوشيط ' + it.name); }
function csX(id, vid) { if (!can('del')) return toast('الحذف للمدير فقط'); const r = find(id); sure('حذف هذا النوع؟').then(y => { if (y) commit('تم الحذف', () => { r.v = r.v.filter(x => x.id != vid); }); }); }
function csDel(id) { del('items', id, find(id).name); }
let CQ = '', CSCODE = '';
function csAdd() {
  CQ = ''; PR = null; $('sh').innerHTML = `<div class="bar"></div><h3>إضافة بوشيط</h3>${invModelDatalist()}<label>ابحث أولاً: موديل الهاتف<input list="dl_mnames" oninput="csF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;
  sheetOpen(v => csDone(v, PR)); csF('');
}
function csF(q) {
  CQ = q.trim(); const n = nz(q), m = S.items.filter(i => i.sec == 'case' && (!n || nz(i.name).includes(n))).sort((a, b) => b.at - a.at).slice(0, 6);
  $('pr').innerHTML = m.map(i => `<button class="card row2" onclick="csPick('${i.id}')"><b>${esc(i.name)}</b><span class="m">${csGSummaryTxt(i)}</span></button>`).join('') + `<button class="btn" onclick="csNew()">+ موديل جديد${CQ ? ' «' + esc(CQ) + '»' : ''}</button>`;
}
function csPick(id) { PR = find(id); csVarForm(); }
function csNew() {
  if (!CQ) return toast('اكتب اسم الموديل'); const d = S.items.find(i => i.sec == 'case' && nz(i.name) == nz(CQ)); if (d) return csPick(d.id);
  const now = Date.now();
  PR = { id: uid(), sec: 'case', name: CQ, v: [], by: S.me, at: now, cf: now }; if (CSCODE) { PR.code = CSCODE; CSCODE = ''; } csVarForm();
}
function csVar(id) { PR = find(id); $('sh').innerHTML = ''; sheetOpen(v => csDone(v, PR)); csVarForm(); }
function csVarForm() {
  const isNewModel = !S.items.includes(PR), G = csGenders();
  if (isNewModel && G.length >= 2) {
    fsInit([['color', 'لون محدد (اختياري — اتركه فارغاً للإدخال السريع رجالي/نسائي)']], {});
    $('sh').innerHTML = `<div class="bar"></div><h3>بوشيط جديد: ${esc(PR.name)}</h3>`
      + `<div class="row2" style="gap:8px"><label style="flex:1">عدد ${esc(G[0])}<input id="cq_g0" type="number" value="3"></label><label style="flex:1">عدد ${esc(G[1])}<input id="cq_g1" type="number" value="3"></label><label style="flex:1">السعر (اختياري)<input id="cpr" type="tel" value="${esc(PR.price || '')}" placeholder="مثال: 30"></label></div>`
      + `<div id="cc"></div>`
      + `<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({dual:1,q0:ci($('cq_g0').value),q1:ci($('cq_g1').value),c:FS.v.color||'',pr:$('cpr').value.trim()})">حفظ</button></div>`;
    chipsR();
    return;
  }
  fsInit([['gender', 'الجنس'], ['color', 'اللون (اختياري)']], { gender: G[0] || '' });
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc(PR.name)} — إضافة نوع/لون</h3><div id="cc"></div><div class="row2" style="gap:8px"><label style="flex:1">العدد<input id="cq" type="number" value="1"></label>${isNewModel ? `<label style="flex:1">السعر (اختياري)<input id="cpr" type="tel" value="${esc(PR.price || '')}" placeholder="مثال: 30"></label>` : ''}</div><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({g:FS.v.gender||'',c:FS.v.color||'',n:ci($('cq').value),pr:$('cpr')?$('cpr').value.trim():''})">حفظ</button></div>`;
  chipsR();
}
function csDone(v, r) {
  if (!v || !r) return;
  const pr = v.pr; delete v.pr;
  commit('تمت الإضافة', () => {
    if (pr && can('price')) r.price = pr;
    if (!S.items.includes(r)) S.items.push(r);
    if (v.dual) {
      const G = csGenders();
      [[G[0], v.q0], [G[1], v.q1]].forEach(([gName, q]) => {
        if (!gName) return;
        const x = r.v.find(y => y.g == gName && y.c == (v.c || ''));
        if (x) x.n += q; else r.v.push({ id: uid(), g: gName, c: v.c || '', n: q });
      });
    } else {
      const x = r.v.find(y => y.g == v.g && y.c == v.c);
      if (x) x.n += v.n; else r.v.push({ id: uid(), ...v });
    }
    touch(r, 1);
  });
  if (csTot(r) > 0) reqChk('بوشيط ' + r.name, 1);
}
function csFx(id) {
  const i = find(id); fsInit([], {}, 'case', i);
  $('sh').innerHTML = '<div class="bar"></div><h3>خانات: ' + esc(i.name) + '</h3><div id="fx"></div><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({})">حفظ</button></div>';
  sheetOpen(v => { if (v) upd(() => { i.x = { ...FS.fx }; i.by = S.me; }); }); fxR();
}
function csLimEd(id) {
  const i = find(id), G = csGenders(), gl = i.glim || {};
  const F = [
    { k: 'p', l: 'سعر البيع (درهم — اختياري)', t: 'tel', v: i.price || '' },
    { k: 'n', l: `الحد العام لهذا الموديل لكل جنس: «قارب النفاد» عند عدد فأقل (فارغ = الحد العام ${lim('cl')})`, t: 'tel', v: i.lim ?? '' }
  ];
  G.forEach((g, idx) => F.push({ k: 'g' + idx, l: `حد خاص بـ «${g}» فقط (فارغ = يتبع الحد أعلاه · اكتب -1 إن كنتم لا تجلبون ${g} لهذا الموديل)`, t: 'tel', v: gl[g] != null ? gl[g] : '' }));
  ask('الحد والسعر — بوشيط ' + i.name, F).then(v => {
    if (!v) return; const n = v.n.trim();
    upd(() => {
      if (n === '') delete i.lim; else i.lim = ci(n);
      const newGl = {};
      G.forEach((g, idx) => {
        const s = dg(v['g' + idx] ?? '').trim();
        if (s !== '') newGl[g] = s === '-1' ? -1 : ci(s);
      });
      if (Object.keys(newGl).length) i.glim = newGl; else delete i.glim;
      if (can('price')) i.price = (v.p || '').trim();
      i.by = S.me;
    });
  });
}
function csQuickNote(id) {
  const i = find(id);
  ask('بوشيط ' + i.name, [{ k: 'rem', l: 'شنو باقي عندنا فالمحل؟ (مثال: غير النسائي)', v: i.rem || '' }, { k: 'need', l: 'شنو خاص يجيب المعلم؟ (مثال: ألوان رجالية / كحل)', v: i.need || '' }]).then(v => { if (v) commit('تم التحديث', () => { i.rem = v.rem.trim(); i.need = v.need.trim(); i.by = S.me; }); });
}
function buyC(id) {
  const i = find(id); if (!i) return;
  const badG = csGStats(i).filter(x => x.st != 'g');
  const lbl = badG.length ? badG.map(x => x.g).join(' + ') : 'لكل نوع';
  qty(`بوشيط ${i.name} (${lbl})`, 3, n => {
    if (badG.length && badG[0].g != 'عام') {
      badG.forEach(b => {
        const vars = (i.v || []).filter(x => x.g == b.g);
        if (!vars.length) { i.v = i.v || []; i.v.push({ id: uid(), g: b.g, c: '', n }); }
        else {
          const z = vars.filter(x => x.n <= 0);
          (z.length ? z : [vars[0]]).forEach(x => x.n += n);
        }
      });
    } else {
      const z = (i.v || []).filter(x => x.n <= 0), t = z.length ? z : (i.v || []);
      t.forEach(x => x.n += n);
    }
    i.need = ''; touch(i, 1); reqChk('بوشيط ' + i.name, 1);
  });
}