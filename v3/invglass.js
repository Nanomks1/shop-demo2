/* ============================================================
   invglass.js — الأنتي كاس: مجموعات الموديلات ومستويات الزجاج
   يُحمَّل بعد invphones.js.
   ============================================================ */

/* ============================ الأنتي كاس ============================ */
const gOf = m => S.gg.find(g => g.models.some(x => nz(x) == nz(m)));
const gitem = (gid, ty) => S.items.find(i => i.sec == 'glass' && i.gid == gid && i.ty == ty);
const GT = () => ({ a: lim('gA'), b: lim('gB'), c: lim('gC'), y: lim('gY') });
const LC = { a: '#15803d', b: '#22c55e', c: '#86efac', y: '#d97706', r: '#dc2626' };
const lvN = l => l == 'r' ? 0 : (GT()[l] || 0);
const mval = (i, m) => { const l = (i.lv || {})[m]; return l !== undefined ? lvN(l) : ((i.stock || {})[m] || 0); };
const gTot = (i, g) => g.models.reduce((a, m) => a + mval(i || {}, m), 0);
const gEst = (i, g) => !!i && g.models.some(m => (i.lv || {})[m] !== undefined);
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
  const defTy = S.tags && S.tags.glass && S.tags.glass[0];
  if (defTy) {
    (S.gg || []).forEach(g => {
      if (g && g.id && !S.tags.glass.some(t => gitem(g.id, t))) glGet(g.id, defTy);
    });
  }
}
HK.save.push(glDedup);
glDedup();

function glView() {
  const j = V.ty || 0, ty = S.tags.glass[j], it = g => gitem(g.id, ty);
  const a = srt(S.gg, 'glass', g => g.models[0] || '', g => { const i = it(g); return i ? gTot(i, g) : 0; }, g => { const i = it(g); return i ? i.at : 0; });
  const tagsHtml = S.tags.glass.map((t, k) => `<button class="tag ${k == j ? 'on' : ''}" onclick="V.ty=${k};render()">${esc(t)}</button>`).join('');
  return {
    t: 'الأنتي كاس',
    h: `<button class="btn" onclick="glAdd()">+ إضافة موديل</button>`
      + secPanel('glass', tagsHtml)
      + (a.map(g => glCard(g, j)).join('') || emptyBox('لا توجد مجموعات أنتي كاس بعد', 'اضغط على «+ إضافة موديل» في الأعلى لبدء أول مجموعة'))
  };
}
function glRow(g, i, j, k, m) {
  const lv = (i.lv || {})[m], ex = lv === undefined && (i.stock || {})[m] !== undefined, T = GT(), br = (g.br || {})[m];
  const dots = [['a', `<bdi>${T.a}+</bdi>`], ['b', `<bdi>${T.b}+</bdi>`], ['c', `<bdi>${T.c}+</bdi>`], ['y', 'قليل'], ['r', 'نفد']].map(([l, t]) => `<button class="lvb ${lv == l ? 'on' : ''}" style="--lc:${LC[l]};--lt:${l == 'c' ? '#14532d' : '#fff'}" onclick="glLv('${g.id}',${j},${k},'${l}')">${t}</button>`).join('');
  const hd2 = ex ? `<button class="btn s sm" onclick="glC('${g.id}',${j},${k},-1)">−</button><span class="cn">${i.stock[m]}</span><button class="btn sm" onclick="glC('${g.id}',${j},${k},1)">+</button>` : `<span class="m"><bdi>${lv !== undefined ? '≈' + lvN(lv) : ''}</bdi></span><button class="btn s sm" onclick="glEx('${g.id}',${j},${k})">عدد دقيق</button>`;
  return `<div class="gm"><div class="row2"><span style="flex:1">${esc(m)}${br ? ` <span class="m">· ${esc(br)}</span>` : ''}</span>${hd2}</div><div class="lvs">${dots}</div></div>`;
}
function glCard(g, j) {
  const ty = S.tags.glass[j], i = gitem(g.id, ty) || { stock: {} }, s = gSt(i, g, ty), min = gLim(i, ty);
  const ex = EXP['g_' + g.id], limM = !ex && g.models.length > 4 ? g.models.slice(0, 3) : g.models;
  const more = g.models.length > 4 ? `<button class="tag" style="width:100%;justify-content:center;margin-top:6px" onclick="toggleExp('g_${g.id}')">${ex ? 'طيّ القائمة ▴' : 'عرض باقي الموديلات (+' + (g.models.length - 3) + ') ▾'}</button>` : '';
  return cardH(`<div class="row2"><b>${esc(g.models.join(' / '))}</b>${i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : ''}</div><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]} · المجموع <bdi>${gEst(i, g) ? '≈' : ''}${gTot(i, g)}</bdi> · «قارب» عند ${min - 1} فأقل${i.min != null ? ' (حد خاص)' : ''}</span></div>`
    + limM.map((m, k) => glRow(g, i, j, k, m)).join('') + more
    + `<div class="sub"><button class="btn s sm" onclick="glM('${g.id}')">+ موديل مطابق</button><button class="btn s sm" onclick="glMin('${g.id}',${j})">الحد والسعر</button><button class="btn s sm" onclick="glRm('${g.id}')">حذف موديل</button></div>`, colG(g));
}
function glB(g) {   // بطاقة نتيجة البحث: كل أنواع الزجاج للمجموعة مع السعر الواضح
  return cardH(`<b>زجاج يطابق: ${esc(g.models.join(' / '))}</b>` + S.tags.glass.map(t => {
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
function glAdd() {
  GS = {}; fsInit([['brand', 'الماركة']], {});
  $('sh').innerHTML = `<div class="bar"></div><h3>موديل جديد</h3>${invModelDatalist()}<div id="cc"></div><label>اسم الموديل<input id="gn" list="dl_mnames" placeholder="مثال: A15"></label><button class="btn" onclick="glNext()">التالي</button>`;
  sheetOpen(() => { }); chipsR();
}
function glNext() {
  const n = $('gn').value.trim(); if (!n) return; if (gOf(n)) return toast('هذا الموديل مسجل');
  GS.n = n; GS.b = FS.v.brand || '';
  $('sh').innerHTML = `<div class="bar"></div><h3>«${esc(n)}» يطابق أي موديل؟</h3><label>ابحث بين الموديلات<input oninput="glS(this.value)"></label><div id="gl"></div><button class="btn s" onclick="glNew()">لا يطابق شيئاً (مجموعة جديدة)</button>`; glS('');
}
function glS(q) {
  const k = nz(q);
  $('gl').innerHTML = S.gg.flatMap(g => g.models.map(m => ({ g, m }))).filter(x => !k || nz(x.m).includes(k)).slice(0, 8).map(x => `<button class="card row2" onclick="glJoin('${x.g.id}')"><b>${esc(x.m)}</b><span class="m">${x.g.models.length} موديلات</span></button>`).join('');
}
function glJoin(gid) { const g = S.gg.find(x => x.id == gid); upd(() => { clrM(GS.n); g.models.push(GS.n); if (GS.b) { g.br = g.br || {}; g.br[GS.n] = GS.b; } }); finish(null); reqChk('أنتي كاس ' + GS.n, 1); }
function glNew() {
  upd(() => {
    clrM(GS.n);
    const g = { id: uid(), models: [GS.n] };
    if (GS.b) g.br = { [GS.n]: GS.b };
    S.gg.push(g);
    const ty = S.tags.glass[V.ty || 0] || S.tags.glass[0];
    if (ty) glGet(g.id, ty);
  });
  finish(null); reqChk('أنتي كاس ' + GS.n, 1);
}
function glM(gid) {
  const g = S.gg.find(x => x.id == gid); fsInit([['brand', 'الماركة (اختياري)']], {});
  $('sh').innerHTML = `<div class="bar"></div><h3>موديل مطابق</h3>${invModelDatalist()}<div id="cc"></div><label>الاسم<input id="gmn" list="dl_mnames"></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({n:$('gmn').value.trim(),b:FS.v.brand||''})">حفظ</button></div>`;
  sheetOpen(v => {
    if (!v || !v.n) return; const n = v.n, o = gOf(n); if (o && o.id == gid) return toast('موجود في المجموعة');
    const add = () => { clrM(n); g.models.push(n); if (v.b) { g.br = g.br || {}; g.br[n] = v.b; } };
    if (!o) { upd(add); reqChk('أنتي كاس ' + n, 1); return; }
    sure('«' + n + '» في مجموعة أخرى. دمج المجموعتين؟', 'دمج', false).then(y => { if (y) upd(() => glMerge(g, o)); });
  });
  chipsR();
}
function glMerge(a, b) {   // دمج المجموعة b في a: الأعداد تُجمع، والمستويات والحد والسعر لا تضيع
  S.items = S.items.filter(i => {
    if (i.sec != 'glass' || i.gid != b.id) return true;
    const t = gitem(a.id, i.ty); if (!t) { i.gid = a.id; return true; }
    t.stock = t.stock || {}; for (const m in (i.stock || {})) t.stock[m] = (t.stock[m] || 0) + i.stock[m];
    if (i.lv) { t.lv = t.lv || {}; Object.assign(t.lv, i.lv); }
    if (t.min == null && i.min != null) t.min = i.min; if (!t.price && i.price) t.price = i.price; return false;
  });
  b.models.forEach(m => a.models.push(m)); if (b.br) a.br = Object.assign(a.br || {}, b.br);
  S.gg = S.gg.filter(x => x != b);
}
function glRm(gid) {
  const g = S.gg.find(x => x.id == gid);
  ask('حذف موديل من المجموعة', [{ k: 'm', l: 'الموديل', t: 'sel', o: g.models, v: g.models[0] }], 'حذف', true).then(v => {
    if (!v) return; if (!can('del')) return toast('الحذف للمدير فقط');
    sure('حذف «' + v.m + '» ؟').then(y => {
      if (!y) return;
      commit('تم حذف الموديل', () => {
        const oldItems = S.items.filter(i => i.sec == 'glass' && i.gid == gid).map(i => JSON.parse(JSON.stringify(i)));
        g.models = g.models.filter(m => m != v.m); if (g.br) delete g.br[v.m];
        S.items.filter(i => i.sec == 'glass' && i.gid == gid).forEach(i => { delete (i.stock || {})[v.m]; if (i.lv) delete i.lv[v.m]; });
        if (!g.models.length) {
          const now = Date.now();
          S.trash.push({ id: uid(), coll: 'gg', obj: { ...g, models: [v.m] }, label: 'أنتي كاس: ' + v.m, t: now });
          oldItems.forEach(it => S.trash.push({ id: uid(), coll: 'items', obj: it, label: 'مخزون أنتي كاس (' + it.ty + '): ' + v.m, t: now }));
          S.gg = S.gg.filter(x => x != g);
          S.items = S.items.filter(i => !(i.sec == 'glass' && i.gid == gid));
        }
      });
    });
  });
}
const gl2 = i => { const g = S.gg.find(x => x.id == i.gid); return g ? `<div class="card"><b>زجاج ${esc(i.ty)}: ${esc(g.models.join(' / '))}</b><div class="m">المجموع <bdi>${gEst(i, g) ? '≈' : ''}${gTot(i, g)}</bdi> · آخر تأكيد قبل ${Math.floor((Date.now() - cfTime(i)) / 864e5)} يوم</div></div>` : ''; };
function buyG(id) {
  let i = find(id);
  const g = i ? S.gg.find(x => x.id == i.gid) : S.gg.find(x => x.id == id);
  if (!g) return;
  if (!i) i = glGet(g.id, S.tags.glass[0] || 'عادي');
  commit('تم الشراء', () => { i.lv = i.lv || {}; i.stock = i.stock || {}; for (const l of ['c', 'b', 'a']) { g.models.forEach(m => { if (mval(i, m) < lvN(l)) { i.lv[m] = l; delete i.stock[m]; } }); if (gSt(i, g, i.ty) == 'g') break; } touch(i, 1); });
  reqChk(g.models.join(' '));
}