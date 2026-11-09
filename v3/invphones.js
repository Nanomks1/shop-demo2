/* ============================================================
   invphones.js — الهواتف: البطاقة المدمجة والنافذة السفلية، اقتراح الملحقات، الإضافة، الحجز، سجل الحركات
   يُحمَّل بعد invbase.js.
   ============================================================ */

/* ============================ الهواتف ============================ */
/* الحكم على «مجموع» كل ألوان نفس (الماركة + الموديل + السعة + RAM + الحالة) لا على كل لون وحده.
   ترتيب الحد: حد الموديل الخاص ← حد الماركة (إن وُضع) ← فئة السعر ← الحد العام */
const PT0 = [['أزرار / بسيطة', 400, 6], ['اقتصادية', 2000, 5], ['متوسطة', 4500, 3], ['عالية', 1e9, 2]];
const ptCfg = () => (Array.isArray(S.cfg.pt) && S.cfg.pt.length == 4 ? S.cfg.pt : PT0);
const phPrice = p => { const m = String(p ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).match(/\d+(?:[.,]\d+)?/); return m ? +m[0].replace(',', '.') : 0; };
const phKey = i => [i.brand, nz(i.name), i.ram || '', i.cap || '', i.cond || 'جديد'].join('|');
function phGroupsOf(arr) {
  const m = new Map();
  arr.forEach(i => {
    const k = phKey(i); let g = m.get(k);
    if (!g) { g = { key: k, items: [], brand: i.brand, name: i.name, ram: i.ram, cap: i.cap, cond: i.cond || 'جديد', price: '', tot: 0, cnt: 0, rs: 0, at: 0 }; m.set(k, g); }
    g.items.push(i); g.tot += av(i); g.cnt += +i.cnt || 0; g.rs += rsQ(i);
    if (!g.price && i.price) g.price = i.price; if ((i.at || 0) > g.at) g.at = i.at;
  });
  return [...m.values()];
}
let PGC = { v: -1, n: -1, m: null };
function phGMap() {
  if (PGC.m && PGC.v === ST.ver && PGC.n === S.items.length) return PGC.m;
  const m = {}; phGroupsOf(ph()).forEach(g => g.items.forEach(i => m[i.id] = g));
  PGC = { v: ST.ver, n: S.items.length, m }; return m;
}
const phGroup = i => phGMap()[i.id] || phGroupsOf([i])[0];
function phTierOf(g) {
  const T = ptCfg(), o = (S.cfg.pm || {})[g.key] || {};
  if (o.t != null && T[o.t]) return o.t;
  const p = phPrice(g.price); if (p > 0) { const j = T.findIndex(x => p <= x[1]); return j < 0 ? 3 : j; }
  return -1;
}
function phLimG(g) {
  const o = (S.cfg.pm || {})[g.key] || {};
  if (o.l != null && o.l !== '') return +o.l;
  const bl = (S.cfg.bl || {})[g.brand]; if (bl != null && !(o.t != null)) return +bl;
  const j = phTierOf(g); return j >= 0 ? ptCfg()[j][2] : lim('low');
}
const phGSt = g => g.tot <= 0 ? 'r' : g.tot <= phLimG(g) ? 'y' : 'g';
const phLim = i => phLimG(phGroup(i));
const phSt = i => phGSt(phGroup(i));
const stkL = () => ph().filter(i => i.cnt > 0).sort((a, b) => (a.brand + a.name).localeCompare(b.brand + b.name));
const stkN = i => [i.brand, i.name, i.color, i.ram, i.cap].filter(Boolean).join(' ');

/* ---------- بطاقة الموديل: دوائر الألوان (اضغط الدائرة ثم − بيع / + إضافة · ضغطة مطولة = تصحيح العدد) ---------- */
let PHS = '', PLT = 0, PLF = 0;
function phLPs(id) { PLF = 0; clearTimeout(PLT); PLT = setTimeout(() => { PLF = 1; if (navigator.vibrate) navigator.vibrate(20); phCnt(id); }, 550); }
function phLPe() { clearTimeout(PLT); }
function phTap(id) { if (PLF) { PLF = 0; return; } PHS = PHS == id ? '' : id; render(); }
function phCnt(id) {
  const i = find(id); if (!i) return;
  ask('تصحيح العدد: ' + stkN(i), [{ k: 'n', l: 'العدد الفعلي الآن (بدل ' + i.cnt + ')', t: 'number', v: i.cnt }], 'تصحيح').then(v => {
    if (!v || String(v.n).trim() === '') return;
    const n = ci(v.n), old = i.cnt;
    if (n < 0) return toast('اكتب عدداً صحيحاً');
    if (n < rsQ(i)) return toast('العدد أقل من المحجوز (' + rsQ(i) + ')');
    if (n === old) return;
    commit('تصحيح العدد: ' + stkN(i) + ' ← ' + n, () => { i.cnt = n; touch(i, 1); });
    if (n > old) reqChk(i.brand + ' ' + i.name, 1);
  });
}
function phDots(g, cmp) {
  return g.items.map(x => `<span class="csw"><span class="csd pc${x.id == PHS ? ' sel' : ''}${x.cnt <= 0 ? ' z' : ''}" style="background:${csBg(x.color)};color:${csInk(x.color)}" onpointerdown="phLPs('${x.id}')" onpointerup="phLPe()" onpointerleave="phLPe()" onpointercancel="phLPe()" oncontextmenu="return false" onclick="phTap('${x.id}')">${x.cnt}</span>${!cmp || !csHex(x.color) ? `<small class="m">${esc(x.color || 'عام')}</small>` : ''}</span>`).join('');
}
function phGCard(g) {
  const s = phGSt(g), cmp = isCmp('phones') && V.v == 'sec', f0 = g.items[0], sel = g.items.find(x => x.id == PHS);
  const t = [g.ram, g.cap].filter(Boolean).map(x => `<span class="phk">${esc(x)}</span>`).join('')
    + (g.cond != 'جديد' ? `<span class="phk c">${esc(g.cond)}</span>` : '')
    + (g.items.length > 1 ? `<span class="phk n"><small>عدد الهواتف</small><b>${g.cnt}</b></span>` : '');
  const rsB = g.rs ? `<span class="rs"> · محجوز ${g.rs}</span>` : '';
  const bar = sel ? `<div class="phsel"><span class="csd" style="background:${csBg(sel.color)};color:${csInk(sel.color)}"></span><b style="flex:1;min-width:0">${esc(sel.color || 'عام')}</b><button class="btn s sm sell" onclick="phC('${sel.id}',-1)">− بيع</button><span class="cn">${sel.cnt}</span><button class="btn sm" onclick="phC('${sel.id}',1)">+ إضافة</button><button class="tag" style="margin:0" onclick="phOpen('${sel.id}')">⋯</button></div>` : '';
  return cardH(`<div class="row2" style="gap:8px;flex-wrap:wrap"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="phGO('${f0.id}')"><b>${esc(g.brand + ' ' + g.name)}</b>${t || rsB ? `<div class="phkr">${t}${rsB}</div>` : ''}</div>${g.price ? `<span class="cmp-pr">${esc(fmtPr(g.price))}</span>` : ''}<div class="cs-sws">${phDots(g, cmp)}</div></div>${bar}`, colOf(f0), 'cmp');
}
/* نافذة الموديل: كل الألوان − / + ثم الحد والإضافة */
function phGO(id) { if (!find(id)) return; phGR(id); sheetOpen(() => { }); }
function phGR(id) {
  const i = find(id); if (!i) return;
  const g = phGroup(i), s = phGSt(g), L = phLimG(g), j = phTierOf(g), o = (S.cfg.pm || {})[g.key] || {};
  const why = o.l != null && o.l !== '' ? 'حد خاص بالموديل' : (S.cfg.bl || {})[g.brand] != null && !(o.t != null) ? 'حد الماركة' : j >= 0 ? 'فئة: ' + ptCfg()[j][0] : 'الحد العام';
  const rows = g.items.map(x => `<div class="cs-vr"><span class="csd" style="background:${csBg(x.color)};color:${csInk(x.color)}"></span><b style="cursor:pointer" onclick="phGo('phOpen','${x.id}')">${esc(x.color || 'عام')}${rsQ(x) ? `<span class="rs"> · محجوز ${rsQ(x)}</span>` : ''}</b><button class="btn s cs-sb" onclick="phC('${x.id}',-1);phGR('${id}')">−</button><span class="cn">${x.cnt}</span><button class="btn cs-sb" onclick="phC('${x.id}',1);phGR('${id}')">+</button></div>`).join('');
  $('sh').innerHTML = `<div class="bar"></div><div class="row2"><h3>${esc(g.brand + ' ' + g.name)}</h3>${g.price ? `<span class="cmp-pr">${esc(fmtPr(g.price))}</span>` : ''}<span class="dotl" style="background:${DT[s]}"></span></div>`
    + `<p class="m" style="margin:2px 0 6px">${esc([g.ram, g.cap, g.cond].filter(Boolean).join(' · '))} · المتاح للبيع: ${g.tot} · «قارب» عند ${L} فأقل لمجموع الألوان (${esc(why)})</p>`
    + rows
    + `<div class="cs-acts"><button class="btn s" onclick="phGo('phDupC','${id}')">+ لون آخر</button><button class="btn s" onclick="phGo('phDup','${id}')">+ سعة / RAM أخرى</button><button class="btn s" onclick="phGo('phLimEd','${id}')">الحد لهذا الموديل</button><button class="btn s" onclick="phGo('phAcc','${id}')">${I('shield')} ملحقات</button></div>`
    + `<p class="m">اضغط اسم اللون لتفاصيله (تعديل، حجز، سجل، حذف).</p><div class="acts"><button class="btn" onclick="finish(null)">تم</button></div>`;
}
function phLimEd(id) {
  const i = find(id); if (!i) return; if (!can('tags')) return toast('للمدير فقط');
  const g = phGroup(i), o = (S.cfg.pm || {})[g.key] || {}, T = ptCfg(), AU = 'تلقائي (حسب السعر)';
  ask('الحد لهذا الموديل: ' + g.brand + ' ' + g.name, [
    { k: 't', l: 'الفئة', t: 'sel', o: [AU, ...T.map(x => x[0])], v: o.t != null && T[o.t] ? T[o.t][0] : AU },
    { k: 'l', l: 'أو حد خاص بهذا الموديل (فارغ = حسب الفئة)', t: 'number', v: o.l ?? '' }
  ]).then(v => {
    if (!v) return;
    upd(() => {
      S.cfg.pm = S.cfg.pm || {}; const ti = T.findIndex(x => x[0] == v.t), l = dg(v.l).trim(), n = {};
      if (ti >= 0) n.t = ti; if (l !== '') n.l = Math.max(0, +l || 0);
      if (n.t == null && n.l == null) delete S.cfg.pm[g.key]; else S.cfg.pm[g.key] = n;
    });
  });
}
/* إعدادات: الفئات السعرية الأربع وحد كل فئة */
const ptRng = j => { const T = ptCfg(); return j == 0 ? 'حتى ' + T[0][1] + ' درهم' : j == 3 ? 'فوق ' + T[2][1] + ' درهم' : (T[j - 1][1] + 1) + ' – ' + T[j][1] + ' درهم'; };
VW.st_pt = () => ({
  t: 'حدود الهواتف حسب السعر',
  h: '<p class="m">يُحكم على مجموع كل ألوان نفس الموديل والسعة والـ RAM، ويصير «قارب على النفاد» عند هذا العدد فأقل. الفئة تُحدَّد من سعر البيع، ويمكن تغييرها لموديل معيّن من نافذته.</p>'
    + ptCfg().map((x, j) => `<button class="card row2" onclick="ptEd(${j})"><b>${esc(x[0])}</b><span class="m">${ptRng(j)}</span><span class="m">حد ${x[2]}</span></button>`).join('')
});
function ptEd(j) {
  if (!can('tags')) return toast('للمدير فقط');
  const T = ptCfg().map(x => [...x]), x = T[j], F = [{ k: 'n', l: 'اسم الفئة', v: x[0] }];
  if (j < 3) F.push({ k: 'm', l: 'أعلى سعر في هذه الفئة (درهم)', t: 'number', v: x[1] });
  F.push({ k: 'l', l: '«قارب على النفاد» عند عدد (مجموع الألوان)', t: 'number', v: x[2] });
  ask('تعديل الفئة', F).then(v => {
    if (!v) return;
    const n = v.n.trim() || x[0], l = Math.max(0, +dg(v.l) || 0), m = j < 3 ? +dg(v.m) : 1e9;
    if (j < 3 && (!(m > 0) || (j > 0 && m <= T[j - 1][1]) || m >= T[j + 1][1])) return toast('السعر يجب أن يكون أكبر من الفئة التي قبلها وأصغر من التي بعدها');
    upd(() => { T[j] = [n, m, l]; S.cfg.pt = T; });
  });
}

/* بطاقة الهاتف الواحد (لون واحد): تُستعمل في الجولة اليومية */
function phCard(i) {
  const s = phSt(i), cmp = isCmp('phones') && V.v == 'sec';
  const fxParts = S.fields.filter(f => f.sec == 'phones').map(f => fxVal(i, f).length ? f.name + ': ' + fxVal(i, f).join('، ') : '').filter(Boolean);
  const t = [i.color, i.ram, i.cap, i.cond && i.cond != 'جديد' && i.cond, ...(cmp ? [] : fxParts)].filter(Boolean).map(esc).join(' · ');
  const rsBadge = rsQ(i) ? `<span class="rs"> · محجوز ${rsQ(i)}</span>` : '';
  const extra = !cmp ? (i.note ? `<div class="cs-nt m">${esc(i.note)}</div>` : '') + (i.imei ? `<div class="cs-nt m">IMEI: <bdi>${esc(i.imei)}</bdi></div>` : '') : '';
  return cardH(`<div class="row2" style="gap:6px"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="phOpen('${i.id}')"><b>${esc(i.brand + ' ' + i.name)}</b>${t || rsBadge ? `<div class="m">${t}${rsBadge}</div>` : ''}${extra}</div>${i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : ''}<button class="btn s sm" onclick="phC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="phC('${i.id}',1)">+</button></div>`, colOf(i), 'cmp');
}

/* نافذة الإجراءات السفلية للهاتف (تفتح عند الضغط على اسم الهاتف) */
const phGo = (f, id) => { finish(null); setTimeout(() => window[f](id), 380); };
function phOpen(id) {
  const i = find(id); if (!i) return;
  phSheetR(id); sheetOpen(() => { });
}
function phSheetR(id) {
  const i = find(id); if (!i) return;
  const s = phSt(i), specs = [i.color, i.ram, i.cap, i.cond || 'جديد'].filter(Boolean).join(' · ');
  $('sh').innerHTML = `<div class="bar"></div><div class="row2"><h3>${esc(i.brand + ' ' + i.name)}</h3>${i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : ''}<span class="dotl" style="background:${DT[s]}"></span></div>`
    + (specs ? `<p class="m" style="margin:2px 0 6px">${esc(specs)} · المتاح للبيع: ${av(i)}</p>` : '')
    + rsHtml(i) + fxShow(i)
    + (i.imei ? `<div class="m">IMEI: <bdi>${esc(i.imei)}</bdi></div>` : '')
    + (i.note ? `<div class="m">ملاحظة: ${esc(i.note)}</div>` : '')
    + `<div class="cs-vr"><b>العدد في المحل</b><button class="btn s cs-sb" onclick="phC('${i.id}',-1);phSheetR('${i.id}')">−</button><span class="cn">${i.cnt}</span><button class="btn cs-sb" onclick="phC('${i.id}',1);phSheetR('${i.id}')">+</button></div>`
    + `<div class="cs-acts">`
    + `<button class="btn s" onclick="phGo('phEd','${i.id}')">تعديل التفاصيل</button>`
    + `<button class="btn s" onclick="phGo('phDup','${i.id}')">+ لون / سعة أخرى</button>`
    + (shown('phones', 'res') ? `<button class="btn s" onclick="phGo('phRs','${i.id}')">حجز${rsQ(i) ? ' (' + rsQ(i) + ')' : ''}</button>` : '')
    + `<button class="btn s" onclick="phGo('phAcc','${i.id}')">${I('shield')} ملحقات</button>`
    + (typeof usFromRep == 'function' && av(i) > 0 ? `<button class="btn s" onclick="phGo('usFromRep','${i.id}')">${I('swap')} روپريز</button>` : '')
    + ((i.log || []).length ? `<button class="btn s" onclick="phGo('lgOpen','${i.id}')">السجل</button>` : '')
    + (can('del') ? `<button class="btn s del" onclick="phDelF('${i.id}')">حذف الهاتف</button>` : '')
    + `</div><div class="acts"><button class="btn" onclick="finish(null)">تم</button></div>`;
}
function phDup(id) {
  const r = find(id); if (!r) return;
  $('sh').innerHTML = ''; sheetOpen(x => phDone(x, PR));
  phForm({ brand: r.brand, name: r.name, color: r.color, ram: r.ram, cap: r.cap, cond: r.cond, price: r.price, cnt: 1 });
}

function phDupC(id) {
  const r = find(id); if (!r) return;
  $('sh').innerHTML = ''; sheetOpen(x => phDone(x, PR));
  phForm({ brand: r.brand, name: r.name, ram: r.ram, cap: r.cap, cond: r.cond, price: r.price, cnt: 1 });
}
function phView() {
  const allPh = ph(), G = phGroupsOf(allPh), totPcs = allPh.reduce((t, i) => t + (+i.cnt || 0), 0), lowCnt = G.filter(g => phGSt(g) != 'g').length;
  const usedG = G.filter(g => g.cond == 'مستعمل'), usedPcs = usedG.reduce((t, g) => t + g.cnt, 0);
  const brMap = {};
  G.forEach(g => { if (g.brand) brMap[g.brand] = (brMap[g.brand] || 0) + g.cnt; });
  const brChips = Object.keys(brMap).map(b => `<button class="tag ${V.pb == b && !V.f ? 'on' : ''}" data-b="${esc(b)}" onclick="V.f=0;V.pb=this.dataset.b;render()">${esc(b)} (${brMap[b]})</button>`).join('');
  let a = srt(G, 'phones', g => g.brand + ' ' + g.name, g => g.cnt, g => g.at);
  if (V.f == 1) a = a.filter(g => phGSt(g) != 'g');
  else if (V.f == 2) a = a.filter(g => g.cond == 'مستعمل');
  else if (V.pb) a = a.filter(g => g.brand == V.pb);
  const pg = pgSlice('ph', a);
  const tagsHtml = `<button class="tag ${!V.f && !V.pb ? 'on' : ''}" onclick="V.f=0;V.pb='';render()">الكل (${G.length} موديل · ${totPcs} قطعة)</button>`
    + `<button class="tag ${V.f == 1 ? 'on' : ''}" onclick="V.f=1;V.pb='';render()">يحتاج شراء (${lowCnt})</button>`
    + brChips
    + (usedG.length ? `<button class="tag ${V.f == 2 ? 'on' : ''}" onclick="V.f=2;V.pb='';render()">مستعمل (${usedPcs})</button>` : '');
  return {
    t: 'الهواتف',
    h: `<button class="btn" onclick="phAdd()">+ إضافة هاتف</button>`
      + secPanel('phones', tagsHtml)
      + (pg.items.map(phGCard).join('') + pg.more || emptyBox('لا توجد هواتف مطابقة لهذا الفلتر', 'اضغط على «+ إضافة هاتف» في الأعلى لإضافة هاتف جديد'))
  };
}

/* اقتراح الأنتي كاس والبوشيط تلقائياً لحظة بيع هاتف */
function phMatchGlass(i) {
  const nm = nz(i.name), full = nz(i.brand + ' ' + i.name);
  return S.gg.find(g => g.models.some(m => { const x = nz(m); return x == nm || x == full || (x.length >= 2 && full.endsWith(x)); }));
}
function phMatchCase(i) {
  const nm = nz(i.name), full = nz(i.brand + ' ' + i.name);
  return S.items.filter(c => c.sec == 'case' && (nz(c.name) == nm || nz(c.name) == full || (nz(c.name).length >= 2 && full.endsWith(nz(c.name)))));
}
function phAcc(id) { phUpR(id); sheetOpen(() => { }); }
function phUpR(id) {
  const i = find(id); if (!i) return;
  const g = phMatchGlass(i), cs = phMatchCase(i), T = GT();
  let h = `<div class="bar"></div><h3>${I('shield')} ملحقات ${esc(i.brand + ' ' + i.name)}</h3><p class="m">اخصم ما أخذه الزبون مع هذا الهاتف:</p>`;
  if (g) {
    const mName = g.models.find(m => nz(i.brand + ' ' + i.name).includes(nz(m))) || g.models[0];
    const mk = Math.max(0, g.models.indexOf(mName));
    h += `<div class="card"><b>${I('shield')} أنتي كاس مطابق: ${esc(g.models.join(' / '))}</b>`
      + S.tags.glass.map((ty, j) => {
        if (!gHas(g, mName, ty)) return '';
        const it = gitem(g.id, ty) || { stock: {} }, lv = (it.lv || {})[mName], ex = lv === undefined && (it.stock || {})[mName] !== undefined;
        return `<div class="gm"><div class="row2"><b style="flex:1">${esc(ty)}${it.price ? ` <span class="cmp-pr">(${esc(fmtPr(it.price))})</span>` : ''}</b>`
          + (ex ? `<button class="btn s sm" onclick="glC('${g.id}',${j},${mk},-1);phUpR('${id}')">−1</button><span class="cn">${it.stock[mName]}</span>`
            : [['a', `<bdi>${T.a}+</bdi>`], ['b', `<bdi>${T.b}+</bdi>`], ['c', `<bdi>${T.c}+</bdi>`], ['y', 'قليل'], ['r', 'نفد']].map(([l, lb]) => `<button class="tag ${lv == l ? 'on' : ''}" style="margin:0;padding:4px 8px;font-size:.75rem" onclick="glLv('${g.id}',${j},${mk},'${l}');phUpR('${id}')">${lb}</button>`).join(''))
          + `</div></div>`;
      }).join('') + `</div>`;
  }
  if (cs.length) {
    cs.forEach(c => {
      h += `<div class="card"><b>${I('box')} بوشيط: ${esc(c.name)} (${csGSummaryTxt(c)}${c.price ? ' · ' + esc(fmtPr(c.price)) : ''})</b><div class="cs-chips">`
        + (c.v || []).map(x => `<div class="cs-chip ${csChipCls(c, x)}"><span>${esc(x.c || 'عام')}</span><button onclick="csC('${c.id}','${x.id}',-1);phUpR('${id}')">−</button><b>${x.n}</b><button onclick="csC('${c.id}','${x.id}',1);phUpR('${id}')">+</button></div>`).join('')
        + `</div></div>`;
    });
  }
  if (!g && !cs.length) h += '<p class="m">لا يوجد أنتي كاس أو بوشيط مطابق لهذا الموديل في المخزون.</p>';
  h += `<div class="acts"><button class="btn" onclick="finish(null)">تم / إغلاق</button></div>`;
  $('sh').innerHTML = h;
}
function phC(id, d) {
  const i = find(id); if (!i) return;
  if (d < 0 && rsQ(i) > 0 && av(i) <= 0) return toast('كل القطع محجوزة: سلّم الحجز أو ألغِه أولاً');
  if (d < 0 && i.cnt <= 0) return;
  commit(d < 0 ? 'بيع ' + i.brand + ' ' + i.name + ' (−1)' : 'إضافة ' + i.brand + ' ' + i.name + ' (+1)', () => { i.cnt = Math.max(0, i.cnt + d); touch(i); });
  if (d > 0) return reqChk(i.brand + ' ' + i.name);
}
/* الإضافة: ابحث أولاً، فإن وُجد الهاتف أضف الكمية بدل إعادة الكتابة */
let PQ = '';
function phAdd() {
  PR = null; $('sh').innerHTML = `<div class="bar"></div><h3>إضافة هاتف</h3><label>ابحث أولاً: ماركة أو موديل<input id="pf" oninput="phF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;
  sheetOpen(v => phDone(v, PR)); phF('');
}
function phF(q) {
  PQ = q.trim(); const n = nz(q), m = ph().filter(i => !n || nz(i.brand + i.name + i.color).includes(n)).sort((a, b) => b.at - a.at).slice(0, 6);
  $('pr').innerHTML = m.map(i => `<button class="card row2" onclick="phPick('${i.id}')"><b>${esc(i.brand + ' ' + i.name)}</b><span class="m">${esc([i.color, i.cap].filter(Boolean).join(' · '))} · ${i.cnt}</span></button>`).join('') + `<button class="btn" onclick="phForm({name:PQ})">+ هاتف جديد${PQ ? ' «' + esc(PQ) + '»' : ''}</button>`;
}
function phPick(id) {
  const i = find(id); PR = i;
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc(i.brand + ' ' + i.name)}</h3><p class="m">${esc([i.color, i.ram, i.cap].filter(Boolean).join(' · '))} — الكمية الحالية ${i.cnt}</p><label>كم قطعة وصلت؟<input id="pa" type="number" value="1"></label><div class="acts"><button class="btn s" onclick="phForm(find('${id}'))">تعديل التفاصيل</button><button class="btn" onclick="phAddQty()">إضافة الكمية</button></div>`;
}
function phAddQty() { const n = ci($('pa').value); if (!n) return toast('اكتب عدداً أكبر من صفر'); finish({ add: n }); }
function phEd(id) { const r = find(id); $('sh').innerHTML = ''; sheetOpen(v => phDone(v, r)); phForm(r); }
function phForm(rec) {
  PR = rec; const ed = !!rec.id;
  fsInit([['brand', 'الماركة'], ['color', 'اللون', () => shown('phones', 'color')], ['ram', 'RAM', () => shown('phones', 'ram')], ['cap', 'السعة', () => shown('phones', 'cap')]],
    { brand: rec.brand || '', color: rec.color || '', ram: rec.ram || '', cap: rec.cap || '', cond: rec.cond || 'جديد' }, 'phones', rec, shown('phones', 'cond'));
  FS.sugC = colSugPh;
  $('sh').innerHTML = `<div class="bar"></div><h3>${ed ? 'تعديل هاتف' : 'هاتف جديد'}</h3>`
    + invModelDatalist()
    + `<div id="cc"></div>`
    + `<label style="margin-top:8px">الموديل<input id="pm" data-sug="mn" oninput="colRef()" onchange="colRef()" value="${esc(rec.name || '')}" placeholder="مثال: A07"></label>`
    + `<div class="pcrow"><label class="pcp"${hh('phones', 'price')}>سعر البيع (درهم)<input id="pp" type="tel" value="${esc(rec.price || '')}" placeholder="${esc(rec._costPh || 'مثال: 1350')}" ${ed && !can('price') ? 'disabled' : ''}></label><label class="pcn">العدد<input id="pcnt" type="number" value="${rec.cnt ?? 1}"></label></div>`
    + `<div id="cc2"></div>`
    + `<label${hh('phones', 'imei')}>IMEI / الرقم التسلسلي (اختياري)<div class="row2" style="margin-top:4px"><input id="pimei" value="${esc(rec.imei || '')}" placeholder="امسح الباركود أو اكتب الرقم" style="flex:1"><button type="button" class="btn s sm" onclick="scanIntoInput('pimei')">${I('scan')} مسح</button></div></label>`
    + `<div id="fx"></div><label${hh('phones', 'note')}>ملاحظة<textarea id="pt">${esc(rec.note || '')}</textarea></label>`
    + `<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="phSave()">حفظ</button></div>`
    + (ed || rec._fromUsed ? '' : `<button class="btn s" onclick="phSave(2)">حفظ وإضافة مثله (لون أو سعة أخرى)</button>` + moreBtn('phSave')) + (ed && S.items.includes(rec) && can('del') ? `<button class="btn s" style="color:#dc2626;margin-top:10px" onclick="phDelF('${rec.id}')">حذف هذا الهاتف</button>` : '');
  chipsR();
}
function phSave(more) {
  const n = $('pm').value.trim(), b = FS.v.brand; if (!b || !n) return toast('اختر الماركة واكتب الموديل');
  const c = ci($('pcnt').value), q = PR && PR.id ? rsQ(PR) : 0; if (c < q) return toast('العدد أقل من المحجوز (' + q + ')');
  finish(fxAtt({ brand: b, name: n, color: FS.v.color || '', ram: FS.v.ram || '', cap: FS.v.cap || '', cond: FS.v.cond || 'جديد', price: $('pp').value.trim(), cnt: c, note: $('pt').value.trim(), imei: $('pimei').value.trim(), _more: more || 0 }));
}
function phDone(v, r) {
  if (!v) return; const more = v._more; delete v._more;
  if (v.add !== undefined) { commit('أُضيفت الكمية', () => { r.cnt += v.add; touch(r, 1); }); reqChk(r.brand + ' ' + r.name, 1); return; }
  if (r && r.id && S.items.includes(r)) {
    if (!can('price')) v.price = r.price;
    const cntChg = r.cnt !== v.cnt;
    commit('تم التعديل', () => { Object.assign(r, v); if (cntChg) touch(r, 1); else r.by = S.me; });
    if (cntChg && v.cnt > 0) reqChk(r.brand + ' ' + r.name, 1);
    return;
  }
  const code = r && r.code || '', d = ph().find(i => i.brand == v.brand && nz(i.name) == nz(v.name) && i.color == v.color && i.ram == v.ram && i.cap == v.cap && i.cond == v.cond);
  commit(d ? 'أُضيفت الكمية للموجود' : 'تمت الإضافة', () => {
    if (d) { d.cnt += v.cnt; if (v.price && can('price')) d.price = v.price; if (v.imei) d.imei = d.imei ? (d.imei.includes(v.imei) ? d.imei : d.imei + ' · ' + v.imei) : v.imei; if (code && !d.code) d.code = code; if (v.x) d.x = { ...(d.x || {}), ...v.x }; touch(d, 1); }
    else { const o = { id: uid(), sec: 'phones', ...v }; if (code) o.code = code; touch(o, 1); S.items.push(o); }
  });
  if (more == 2) setTimeout(() => { sheetOpen(x => phDone(x, PR)); phForm({ brand: v.brand, name: v.name, color: v.color, ram: v.ram, cap: v.cap, cond: v.cond, price: v.price, cnt: 1 }); }, 350);
  else if (more) setTimeout(phAdd, 350);
  else if (v.cnt > 0) reqChk(v.brand + ' ' + v.name, 1);
}
function phDelF(id) { finish(null); setTimeout(() => { const i = find(id); if (i) del('items', id, i.brand + ' ' + i.name); }, 450); }

/* الحجز: قائمة الحجوزات + حجز جديد + تسليم/إلغاء */
function phRs(id) { sheetOpen(rsCb); rsList(id); }
function rsList(id) {
  const i = find(id), L = rsL(i);
  $('sh').innerHTML = `<div class="bar"></div><h3>حجوزات ${esc(i.brand + ' ' + i.name)}</h3><p class="m">العدد ${i.cnt} · محجوز ${rsQ(i)} · متاح ${av(i)}</p>`
    + (L.length ? L.map((r, k) => `<div class="card"><b>${esc(r.n)} × ${+r.q || 1}${r.d ? ' · عربون ' + esc(r.d) : ''}</b><div class="sub"><button class="btn sm" onclick="finish({id:'${id}',k:${k},sold:1})">سُلِّم للزبون</button><button class="btn s sm" onclick="finish({id:'${id}',k:${k}})">إلغاء الحجز</button></div></div>`).join('') : '<p class="m">لا حجوزات</p>')
    + `<div class="acts"><button class="btn s" onclick="finish(null)">إغلاق</button>${av(i) > 0 ? `<button class="btn" onclick="rsForm('${id}')">+ حجز جديد</button>` : ''}</div>`;
}
function rsForm(id) {
  const i = find(id);
  $('sh').innerHTML = `<div class="bar"></div><h3>حجز جديد — ${esc(i.brand + ' ' + i.name)}</h3><p class="m">المتاح للحجز: ${av(i)}</p><label>اسم الزبون<input id="rn"></label><label>عدد القطع<input id="rq" type="number" value="1"></label><label>العربون (اختياري)<input id="rd" type="tel"></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="rsSave('${id}')">حفظ الحجز</button></div>`;
}
function rsSave(id) {
  const i = find(id), n = $('rn').value.trim(), q = ci($('rq').value), d = $('rd').value.trim();
  if (!n) return toast('اكتب اسم الزبون'); if (!q) return toast('اكتب عدداً أكبر من صفر'); if (q > av(i)) return toast('المتاح للحجز ' + av(i) + ' فقط');
  finish({ id, add: { n, q, d } });
}
function rsCb(v) {
  if (!v) return; const i = find(v.id); if (!i) return;
  if (v.add) return commit('تم الحجز', () => { i.res = [...rsL(i), v.add]; });
  const L = rsL(i), r = L[v.k]; if (!r) return;
  commit(v.sold ? 'سُلِّم الحجز' : 'أُلغي الحجز', () => { const R = L.filter((_, k) => k != v.k); i.res = R.length ? R : null; if (v.sold) { i.cnt = Math.max(0, i.cnt - (+r.q || 1)); touch(i); } });
}

/* سجل الحركات (آخر 20 حركة للهواتف والإكسسوارات ذات العدد) + دمج الوسوم المكررة عند الإقلاع */
const LGB = {}; let LGI = 0;
function lgScan() {
  S.items.forEach(i => {
    if (i.sec != 'phones' && i.sec != 'acc') return; const t = typeof i.cnt == 'number' ? i.cnt : null; if (t === null) return;
    if (!(i.id in LGB)) { LGB[i.id] = t; if (LGI && t > 0 && !(i.log && i.log.length)) i.log = [[i.at || Date.now(), i.by || S.me || '', t, t]]; return; }
    if (LGB[i.id] === t) return;
    const last = (i.log || []).slice(-1)[0];
    if (!last || last[3] !== t) i.log = [...(i.log || []), [i.at || Date.now(), i.by || S.me || '', t - LGB[i.id], t]].slice(-20);
    LGB[i.id] = t;
  });
}
function lgOpen(id) {
  const i = find(id); if (!i) return; const nm = i.sec == 'phones' ? i.brand + ' ' + i.name : acName(i), L = (i.log || []).slice().reverse();
  $('sh').innerHTML = `<div class="bar"></div><h3>سجل ${esc(nm)}</h3>` + (L.map(([t, u, d, c]) => `<div class="card"><b>${d > 0 ? '+' + d : d}</b> ← العدد ${c}<div class="m">${esc(u || '—')} · ${fd(t)}</div></div>`).join('') || '<p class="m">لا حركات بعد</p>') + '<div class="acts"><button class="btn s" onclick="finish(null)">إغلاق</button></div>';
  sheetOpen(() => { });
}
const TKEY = x => String(x ?? '').toLowerCase().replace(/[\s\-_.]/g, '');
function tagFix() {
  let ch = 0;
  ['brand', 'color', 'cap', 'ram'].forEach(g => {
    const a = S.tags && S.tags[g]; if (!Array.isArray(a)) return;
    const keep = {}, out = [], map = {};
    a.forEach(x => { const k = TKEY(x); if (!k) return; if (keep[k] === undefined) { keep[k] = x; out.push(x); } else if (keep[k] !== x) map[x] = keep[k]; });
    if (out.length === a.length) return;
    S.tags[g] = out; ch = 1;
    S.items.forEach(i => { if (map[i[g]] !== undefined) i[g] = map[i[g]]; if (g == 'color' && Array.isArray(i.v)) i.v.forEach(x => { if (map[x.c] !== undefined) x.c = map[x.c]; }); });
    if (g == 'brand') ['bcol', 'bl', 'nsb'].forEach(c => { const o = S.cfg && S.cfg[c]; if (!o) return; Object.keys(map).forEach(x => { if (o[x] !== undefined) { if (o[map[x]] === undefined) o[map[x]] = o[x]; delete o[x]; } }); });
  });
  return ch;
}
HK.save.push(() => { lgScan(); S.items.forEach(i => { delete i._nz; delete i._nzV; }); });
tagFix(); lgScan(); LGI = 1;