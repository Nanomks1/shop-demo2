/* ============================================================
   invglass.js — الأنتي كاس: مجموعات الموديلات ومستويات الزجاج (بتصميم مدمج)
   يُحمَّل بعد invphones.js.
   ============================================================ */

/* ============================ الأنتي كاس ============================ */
const gOf = m => S.gg.find(g => g.models.some(x => nz(x) == nz(m)));
const gitem = (gid, ty) => S.items.find(i => i.sec == 'glass' && i.gid == gid && i.ty == ty);
const GT = () => ({ a: lim('gA'), b: lim('gB'), c: lim('gC'), y: lim('gY') });
const LC = { a: '#15803d', b: '#22c55e', c: '#86efac', y: '#d97706', r: '#dc2626' };
const lvN = l => l == 'r' ? 0 : (GT()[l] || 0);
const mval = (i, m) => { const l = (i.lv || {})[m]; return l !== undefined ? lvN(l) : ((i.stock || {})[m] || 0); };
/* أنواع الزجاج لكل موديل: g.ty[موديل] = [أنواع]. غير موجود = يُباع بكل الأنواع (بيانات قديمة) */
const gHas = (g, m, ty) => { const a = g.ty && g.ty[m]; return !ty || !a || a.includes(ty); };
const gMods = (g, ty) => g.models.filter(m => gHas(g, m, ty));
const gShow = (g, ty) => gMods(g, ty).length > 0;
const gFirstTy = g => S.tags.glass.find(t => gShow(g, t)) || S.tags.glass[0];
const gTot = (i, g) => gMods(g, i && i.ty).reduce((a, m) => a + mval(i || {}, m), 0);
const gEst = (i, g) => !!i && gMods(g, i.ty).some(m => (i.lv || {})[m] !== undefined);
function glTySet(g, m, tys) {   // يحفظ أنواع الموديل؛ كل الأنواع = بلا قائمة (يدخل أي نوع جديد لاحقاً)
  const all = S.tags.glass.every(t => tys.includes(t));
  g.ty = g.ty || {};
  if (all) delete g.ty[m]; else g.ty[m] = S.tags.glass.filter(t => tys.includes(t));
  if (!Object.keys(g.ty).length) delete g.ty;
}
const gTyLim = ty => (S.cfg.gtl || {})[ty] ?? lim('gmin');   // مخزَّن بصيغة (أقل من) ويُعرض ناقص 1 ليصبح (فأقل)
const gLim = (i, ty) => (i && i.min) ?? gTyLim(ty || (i && i.ty));
const gSt = (i, g, ty) => { const t = gTot(i, g), m = gLim(i, ty); return t <= 0 ? 'r' : t < m ? 'y' : 'g'; };
function glGet(gid, ty) { let i = gitem(gid, ty); if (!i) { const now = Date.now(); i = { id: uid(), sec: 'glass', gid, ty, stock: {}, lv: {}, by: S.me, at: now, cf: now }; S.items.push(i); } i.stock = i.stock || {}; return i; }

/* دمج أي سجلات أنتي كاس مكررة لنفس المجموعة والنوع (من المزامنة) وتهيئة السجل الأساسي */
function glDedup() {
  const map = {};
  S.items = S.items.filter(i => {
    if (i.sec != 'glass' || !i.gid || !i.ty) return true;
    const k = i.gid + '|' + i.ty, ex = map[k];
    if (!ex) { map[k] = i; return true; }
    ex.stock = ex.stock || {};
    for (const m in (i.stock || {})) ex.stock[m] = Math.max(ex.stock[m] || 0, i.stock[m]);
    if (i.lv) { ex.lv = ex.lv || {}; Object.assign(ex.lv, i.lv); }
    if (ex.min == null && i.min != null) ex.min = i.min;
    if (!ex.price && i.price) ex.price = i.price;
    ex.at = Math.max(ex.at || 0, i.at || 0);
    ex.cf = Math.max(cfTime(ex), cfTime(i));
    return false;
  });
  if (S.tags && S.tags.glass && S.tags.glass[0]) {
    (S.gg || []).forEach(g => {
      if (g && g.id && !S.tags.glass.some(t => gitem(g.id, t))) glGet(g.id, gFirstTy(g));
    });
  }
}
HK.save.push(glDedup);
glDedup();

function glView() {
  const j = V.ty || 0, ty = S.tags.glass[j], it = g => gitem(g.id, ty);
  const a = srt(S.gg.filter(g => gShow(g, ty)), 'glass', g => gMods(g, ty)[0] || '', g => { const i = it(g); return i ? gTot(i, g) : 0; }, g => { const i = it(g); return i ? i.at : 0; });
  const tagsHtml = S.tags.glass.map((t, k) => `<button class="tag ${k == j ? 'on' : ''}" onclick="V.ty=${k};render()">${esc(t)}</button>`).join('');
  return {
    t: 'الأنتي كاس',
    h: `<button class="btn" onclick="glAdd()">+ إضافة موديل</button>`
      + secPanel('glass', tagsHtml)
      + (a.map(g => glCard(g, j)).join('') || emptyBox('لا توجد مجموعات أنتي كاس بعد', 'اضغط على «+ إضافة موديل» في الأعلى لبدء أول مجموعة'))
  };
}
function glRow(g, i, j, k, m, single) {
  const lv = (i.lv || {})[m], ex = lv === undefined && (i.stock || {})[m] !== undefined, T = GT(), br = (g.br || {})[m];
  const dots = [['a', `<bdi>${T.a}+</bdi>`], ['b', `<bdi>${T.b}+</bdi>`], ['c', `<bdi>${T.c}+</bdi>`], ['y', 'قليل'], ['r', 'نفد']].map(([l, t]) => `<button class="lvb ${lv == l ? 'on' : ''}" style="--lc:${LC[l]};--lt:${l == 'c' ? '#14532d' : '#fff'}" onclick="glLv('${g.id}',${j},${k},'${l}')">${t}</button>`).join('');
  const hd2 = ex ? `<button class="btn s sm" onclick="glC('${g.id}',${j},${k},-1)">−</button><span class="cn">${i.stock[m]}</span><button class="btn sm" onclick="glC('${g.id}',${j},${k},1)">+</button>` : `<button class="tag" style="margin:0;padding:3px 9px;font-size:.78rem" onclick="glEx('${g.id}',${j},${k})">${lv !== undefined && !single ? `≈${lvN(lv)} · ` : ''}عدد دقيق</button>`;
  if (single && !ex) {
    return `<div class="lvs" style="margin-top:6px">${dots}<button class="lvb" style="--lc:var(--b);--lt:var(--t);flex:0 0 auto;padding:0 10px;opacity:.9" onclick="glEx('${g.id}',${j},${k})">#</button></div>`;
  }
  return `<div class="gm"><div class="row2"><span style="flex:1;font-size:.9rem"><b>${esc(m)}</b>${br ? ` <span class="m">· ${esc(br)}</span>` : ''}</span>${hd2}</div><div class="lvs">${dots}</div></div>`;
}
function glCard(g, j) {
  const ty = S.tags.glass[j], i = gitem(g.id, ty) || { stock: {}, ty }, s = gSt(i, g, ty), min = gLim(i, ty);
  const L = g.models.map((m, k) => [m, k]).filter(x => gHas(g, x[0], ty));   // [الاسم، رتبته في المجموعة] للموديلات التي تُباع بهذا النوع
  const ex = EXP['g_' + g.id], limM = !ex && L.length > 4 ? L.slice(0, 3) : L;
  const more = L.length > 4 ? `<button class="tag" style="width:100%;justify-content:center;margin-top:4px" onclick="toggleExp('g_${g.id}')">${ex ? 'طيّ القائمة ▴' : 'عرض باقي الموديلات (+' + (L.length - 3) + ') ▾'}</button>` : '';
  const single = L.length === 1, br0 = single ? (g.br || {})[L[0][0]] : '';
  return cardH(`<div class="row2" style="gap:6px"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="glOpen('${g.id}',${j})"><b>${esc(L.map(x => x[0]).join(' / '))}${br0 ? ` <span class="m" style="font-weight:500">· ${esc(br0)}</span>` : ''}</b><div class="m">المجموع <bdi>${gEst(i, g) ? '≈' : ''}${gTot(i, g)}</bdi> · الحد ≤ ${min - 1}${i.min != null ? ' (خاص)' : ''}</div></div>${i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : ''}<button class="tag" style="margin:0;padding:4px 9px" onclick="glOpen('${g.id}',${j})" aria-label="خيارات المجموعة">⋯</button></div>`
    + limM.map(([m, k]) => glRow(g, i, j, k, m, single)).join('') + more, colG(g), 'cmp');
}

/* نافذة خيارات مجموعة الأنتي كاس */
function glOpen(gid, j) {
  const g = S.gg.find(x => x.id == gid); if (!g) return;
  const ty = S.tags.glass[j], i = gitem(gid, ty) || {}, min = gLim(i, ty), vm = gMods(g, ty);
  const goAct = fn => { finish(null); setTimeout(fn, 380); };
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc(vm.join(' / '))}</h3>`
    + `<p class="m">نوع الزجاج: ${esc(ty)}${i.price ? ' · السعر: ' + esc(fmtPr(i.price)) : ''} · «قارب» عند ${min - 1} فأقل</p>`
    + `<div class="cs-acts">`
    + `<button class="btn s" onclick="finish(1)">+ موديل مطابق</button>`
    + `<button class="btn s" onclick="finish(2)">الحد والسعر</button>`
    + (vm.length === 1 ? `<button class="btn s" onclick="finish(3)">إدخال عدد دقيق</button>` : '')
    + (S.tags.glass.length > 1 ? `<button class="btn s" onclick="finish(5)">أنواع الزجاج للموديلات</button>` : '')
    + `<button class="btn s del" onclick="finish(4)">حذف موديل من المجموعة</button>`
    + `</div><div class="acts"><button class="btn" onclick="finish(null)">إغلاق</button></div>`;
  sheetOpen(w => {
    if (w == 1) goAct(() => glM(gid));
    else if (w == 2) goAct(() => glMin(gid, j));
    else if (w == 3) goAct(() => glEx(gid, j, g.models.indexOf(vm[0])));
    else if (w == 5) goAct(() => glTyEdit(gid));
    else if (w == 4) goAct(() => glRm(gid));
  });
}

function glB(g) {   // بطاقة نتيجة البحث: كل أنواع الزجاج للمجموعة مع السعر الواضح
  return cardH(`<b>زجاج يطابق: ${esc(g.models.join(' / '))}</b>` + S.tags.glass.filter(t => gShow(g, t)).map(t => {
    const i = gitem(g.id, t), s = i ? gSt(i, g, t) : 'r', pr = i && i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : '';
    return `<div class="row2" style="margin-top:4px"><span class="dotl" style="background:${DT[s]}"></span><span style="flex:1">${esc(t)}</span>${pr}<span class="m"><bdi>${i ? (gEst(i, g) ? '≈' : '') + gTot(i, g) : 0}</bdi></span></div>`;
  }).join(''), colG(g));
}
function glC(gid, j, k, d) { const m = S.gg.find(x => x.id == gid).models[k], i = glGet(gid, S.tags.glass[j]); upd(() => { i.stock[m] = Math.max(0, (i.stock[m] || 0) + d); touch(i); }); if (d > 0) reqChk('أنتي كاس ' + m); }
function glLv(gid, j, k, l) { const m = S.gg.find(x => x.id == gid).models[k], i = glGet(gid, S.tags.glass[j]); upd(() => { i.lv = i.lv || {}; i.lv[m] = l; delete i.stock[m]; touch(i, 1); }); if (l != 'r') reqChk('أنتي كاس ' + m); }
function glEx(gid, j, k) {
  const m = S.gg.find(x => x.id == gid).models[k], i0 = gitem(gid, S.tags.glass[j]) || {};
  ask('عدد دقيق — ' + m, [{ k: 'n', l: 'العدد', t: 'tel', v: mval(i0, m) }]).then(v => { if (!v || v.n.trim() === '') return; const i = glGet(gid, S.tags.glass[j]); upd(() => { i.stock[m] = ci(v.n); if (i.lv) delete i.lv[m]; touch(i, 1); }); });
}
function glMin(gid, j) {
  const ty = S.tags.glass[j], i = gitem(gid, ty) || {};
  ask('الحد والسعر — ' + ty, [{ k: 'p', l: 'سعر البيع (درهم)', t: 'tel', v: i.price || '' }, { k: 'm', l: `حد خاص بهذه المجموعة: «قارب النفاد» عند مجموع فأقل (فارغ = حد ${ty}: ${gTyLim(ty) - 1}). اكتب 0 إن كانت نادرة`, t: 'tel', v: i.min != null ? i.min - 1 : '' }]).then(v => {
    if (!v) return; const r = glGet(gid, ty), m = v.m.trim();
    upd(() => { if (m === '') delete r.min; else r.min = ci(m) + 1; if (can('price')) r.price = v.p.trim(); r.by = S.me; });
  });
}
const clrM = n => S.items.forEach(i => { if (i.sec == 'glass' && i.lv) delete i.lv[n]; });
let GS = {};
const glBrHid = b => !!(S.cfg.nsb || {})[b];   // ماركات أخفاها المدير من قائمة الأنتي كاس (هواتف صغيرة غير ذكية)
function glTyR() {
  const b = $('gty'); if (!b) return;
  b.innerHTML = S.tags.glass.length < 2 ? '' : `<label>أنواع الزجاج لهذا الموديل</label><div>${S.tags.glass.map((t, k) => `<button type="button" class="tag ${GS.t.includes(t) ? 'on' : ''}" onclick="glTyT(${k})">${esc(t)}</button>`).join('')}</div>`;
}
function glTyT(k) { const t = S.tags.glass[k]; GS.t = GS.t.includes(t) ? GS.t.filter(x => x != t) : [...GS.t, t]; glTyR(); }
const glTyNow = () => [S.tags.glass[V.ty || 0] || S.tags.glass[0]].filter(Boolean);
function glAdd() {
  GS = { t: glTyNow() }; fsInit([['brand', 'الماركة']], {}); FS.hid = { brand: glBrHid };
  $('sh').innerHTML = `<div class="bar"></div><h3>موديل جديد</h3>${invModelDatalist()}<div id="cc"></div><label>اسم الموديل<input id="gn" data-sug="mn" placeholder="مثال: A15"></label><div id="gty"></div><button class="btn" onclick="glNext()">التالي</button>`;
  sheetOpen(() => { }); chipsR(); glTyR();
}
function glNext() {
  const n = $('gn').value.trim(); if (!n) return; if (gOf(n)) return toast('هذا الموديل مسجل');
  if (!GS.t.length) return toast('اختر نوع زجاج واحداً على الأقل');
  GS.n = n; GS.b = FS.v.brand || '';
  $('sh').innerHTML = `<div class="bar"></div><h3>«${esc(n)}» يطابق أي موديل؟</h3><label>ابحث بين الموديلات<input oninput="glS(this.value)"></label><div id="gl"></div><button class="btn s" onclick="glNew()">لا يطابق شيئاً (مجموعة جديدة)</button>`; glS('');
}
function glS(q) {
  const k = nz(q);
  $('gl').innerHTML = S.gg.flatMap(g => g.models.map(m => ({ g, m }))).filter(x => !k || nz(x.m).includes(k)).slice(0, 8).map(x => `<button class="card row2" onclick="glJoin('${x.g.id}')"><b>${esc(x.m)}</b><span class="m">${x.g.models.length} موديلات</span></button>`).join('');
}
function glJoin(gid) { const g = S.gg.find(x => x.id == gid); upd(() => { clrM(GS.n); g.models.push(GS.n); glTySet(g, GS.n, GS.t); if (GS.b) { g.br = g.br || {}; g.br[GS.n] = GS.b; } }); finish(null); reqChk('أنتي كاس ' + GS.n, 1); }
function glNew() {
  upd(() => {
    clrM(GS.n);
    const g = { id: uid(), models: [GS.n] };
    if (GS.b) g.br = { [GS.n]: GS.b };
    glTySet(g, GS.n, GS.t);
    S.gg.push(g);
    const ty = GS.t[0] || gFirstTy(g);
    if (ty) glGet(g.id, ty);
  });
  finish(null); reqChk('أنتي كاس ' + GS.n, 1);
}
function glM(gid) {
  const g = S.gg.find(x => x.id == gid); GS = { t: glTyNow() }; fsInit([['brand', 'الماركة (اختياري)']], {}); FS.hid = { brand: glBrHid };
  $('sh').innerHTML = `<div class="bar"></div><h3>موديل مطابق</h3>${invModelDatalist()}<div id="cc"></div><label>الاسم<input id="gmn" data-sug="mn"></label><div id="gty"></div><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="glMOk()">حفظ</button></div>`;
  sheetOpen(v => {
    if (!v || !v.n) return; const n = v.n, o = gOf(n); if (o && o.id == gid) return toast('موجود في المجموعة');
    const add = () => { clrM(n); g.models.push(n); glTySet(g, n, v.t || S.tags.glass); if (v.b) { g.br = g.br || {}; g.br[n] = v.b; } };
    if (!o) { upd(add); reqChk('أنتي كاس ' + n, 1); return; }
    sure('«' + n + '» في مجموعة أخرى. دمج المجموعتين؟', 'دمج', false).then(y => { if (y) upd(() => glMerge(g, o)); });
  });
  chipsR(); glTyR();
}
function glMOk() {
  if (!GS.t.length) return toast('اختر نوع زجاج واحداً على الأقل');
  finish({ n: $('gmn').value.trim(), b: FS.v.brand || '', t: GS.t.slice() });
}
function glMerge(a, b) {   // دمج المجموعة b في a: الأعداد تُجمع، والمستويات والحد والسعر لا تضيع
  S.items = S.items.filter(i => {
    if (i.sec != 'glass' || i.gid != b.id) return true;
    const t = gitem(a.id, i.ty); if (!t) { i.gid = a.id; return true; }
    t.stock = t.stock || {}; for (const m in (i.stock || {})) t.stock[m] = (t.stock[m] || 0) + i.stock[m];
    if (i.lv) { t.lv = t.lv || {}; Object.assign(t.lv, i.lv); }
    if (t.min == null && i.min != null) t.min = i.min; if (!t.price && i.price) t.price = i.price; return false;
  });
  b.models.forEach(m => a.models.push(m)); if (b.br) a.br = Object.assign(a.br || {}, b.br); if (b.ty) a.ty = Object.assign(a.ty || {}, b.ty);
  S.gg = S.gg.filter(x => x != b);
}
function glRm(gid) {
  const g = S.gg.find(x => x.id == gid);
  ask('حذف موديل من المجموعة', [{ k: 'm', l: 'الموديل', t: 'sel', o: g.models, v: g.models[0] }], 'حذف', true).then(v => {
    if (!v) return; if (!can('del')) return toast('الحذف للمدير فقط');
    sure('حذف «' + v.m + '» ؟').then(y => {
      if (!y) return;
      commit('تم حذف الموديل', () => {
        const oldItems = S.items.filter(i => i.sec == 'glass' && i.gid == gid).map(i => JSON.parse(JSON.stringify(i))), tyM = g.ty && g.ty[v.m];
        g.models = g.models.filter(m => m != v.m); if (g.br) delete g.br[v.m]; if (g.ty) { delete g.ty[v.m]; if (!Object.keys(g.ty).length) delete g.ty; }
        S.items.filter(i => i.sec == 'glass' && i.gid == gid).forEach(i => { delete (i.stock || {})[v.m]; if (i.lv) delete i.lv[v.m]; });
        if (!g.models.length) {
          const now = Date.now();
          S.trash.push({ id: uid(), coll: 'gg', obj: { ...g, models: [v.m], ty: tyM ? { [v.m]: tyM } : undefined }, label: 'أنتي كاس: ' + v.m, t: now });
          oldItems.forEach(it => S.trash.push({ id: uid(), coll: 'items', obj: it, label: 'مخزون أنتي كاس (' + it.ty + '): ' + v.m, t: now }));
          S.gg = S.gg.filter(x => x != g);
          S.items = S.items.filter(i => !(i.sec == 'glass' && i.gid == gid));
        }
      });
    });
  });
}
const gl2 = i => { const g = S.gg.find(x => x.id == i.gid); return g ? `<div class="card"><b>زجاج ${esc(i.ty)}: ${esc(gMods(g, i.ty).join(' / '))}</b><div class="m">المجموع <bdi>${gEst(i, g) ? '≈' : ''}${gTot(i, g)}</bdi> · آخر تأكيد قبل ${Math.floor((Date.now() - cfTime(i)) / 864e5)} يوم</div></div>` : ''; };
function buyG(id) {
  let i = find(id);
  const g = i ? S.gg.find(x => x.id == i.gid) : S.gg.find(x => x.id == id);
  if (!g) return;
  if (!i) i = glGet(g.id, gFirstTy(g) || 'عادي');
  const ms = gMods(g, i.ty);
  commit('تم الشراء', () => { i.lv = i.lv || {}; i.stock = i.stock || {}; for (const l of ['c', 'b', 'a']) { ms.forEach(m => { if (mval(i, m) < lvN(l)) { i.lv[m] = l; delete i.stock[m]; } }); if (gSt(i, g, i.ty) == 'g') break; } touch(i, 1); });
  reqChk(ms.join(' '));
}
/* نافذة أنواع الزجاج لكل موديل داخل المجموعة */
let GE = null;
function glTyEdit(gid) {
  const g = S.gg.find(x => x.id == gid); if (!g) return;
  GE = { gid, m: Object.fromEntries(g.models.map(m => [m, S.tags.glass.filter(t => gHas(g, m, t))])) };
  $('sh').innerHTML = `<div class="bar"></div><h3>أنواع الزجاج لكل موديل</h3><p class="m">الأزرق = يُباع بهذا النوع. الموديل لا يظهر إلا في الأنواع المختارة.</p>`
    + g.models.map((m, a) => `<label>${esc(m)}</label><div>${S.tags.glass.map((t, k) => `<button type="button" class="tag ${GE.m[m].includes(t) ? 'on' : ''}" onclick="glTyEdT(this,${a},${k})">${esc(t)}</button>`).join('')}</div>`).join('')
    + `<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="glTyEdOk()">حفظ</button></div>`;
  sheetOpen(glTyEdDone);
}
function glTyEdT(el, a, k) {
  const g = S.gg.find(x => x.id == GE.gid), m = g.models[a], t = S.tags.glass[k];
  GE.m[m] = GE.m[m].includes(t) ? GE.m[m].filter(x => x != t) : [...GE.m[m], t];
  el.classList.toggle('on', GE.m[m].includes(t));
}
function glTyEdOk() {
  if (Object.values(GE.m).some(a => !a.length)) return toast('كل موديل يحتاج نوع زجاج واحداً على الأقل');
  finish(GE.m);
}
function glTyEdDone(m) {
  if (!m) return; const g = S.gg.find(x => x.id == GE.gid); if (!g) return;
  const lost = [];   // أنواع أُزيلت من موديل وفيها مخزون
  g.models.forEach(x => S.tags.glass.forEach(t => {
    if (gHas(g, x, t) && !(m[x] || []).includes(t)) { const i = gitem(g.id, t); if (i && mval(i, x) > 0) lost.push(x + ' (' + t + ')'); }
  }));
  const apply = () => upd(() => {
    g.models.forEach(x => {
      glTySet(g, x, m[x] || S.tags.glass);
      S.tags.glass.forEach(t => { if ((m[x] || []).includes(t)) return; const i = gitem(g.id, t); if (i) { if (i.stock) delete i.stock[x]; if (i.lv) delete i.lv[x]; } });
    });
  });
  if (lost.length) sure('سيُحذف مخزون: ' + lost.join('، ') + ' — متابعة؟', 'حفظ', true).then(y => { if (y) apply(); }); else apply();
}
