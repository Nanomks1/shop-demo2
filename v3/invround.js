/* ============================================================
   invround.js — الجرد والجولة اليومية + كاشف الأثمنة الفوري
   يُحمَّل بعد invreport.js.
   ============================================================ */

/* ============================ الجرد والجولة اليومية (مضغوط + مقسم بالرفوف + شامل/قديم) ============================ */
function rndAll() {
  const out = [];
  S.items.forEach(i => {
    if (i.sec == 'acc' && gkc(i.kind).g) return;
    if (i.sec == 'glass' && !S.gg.some(g => g.id == i.gid)) return;
    out.push(i);
  });
  agList().forEach(d => {
    const t = d.cf || d.at || Date.now();
    out.push({ _jl: 'ag', sec: 'acc', id: d.id, d, at: t, cf: t });
  });
  (S.tp || []).forEach(r => {
    if (!r || r.k != 'c') return;
    const t = cfTime(r) || Date.now();
    out.push({ _jl: 'tp', sec: 'tp', id: r.id, r, at: t, cf: t });
  });
  return out.sort((a, b) => cfTime(a) - cfTime(b));
}

/* rnd() بدون معاملات تعيد الأصناف القديمة فقط (لتنبيهات التقرير والرئيسية) */
function rnd(allMode) {
  const ms = lim('stale') * 864e5, now = Date.now();
  const L = rndAll();
  return allMode ? L : L.filter(i => { const t = cfTime(i); return t && now - t > ms; });
}

const jlSecOf = i => i._jl == 'ag' ? 'acc' : i._jl == 'tp' ? 'tp' : i.sec;
const jlTextOf = i => {
  if (i._jl == 'ag') return i.d.title;
  if (i._jl == 'tp') return 'تعبئة ' + i.r.op + ' ' + i.r.n;
  if (i.sec == 'glass') { const g = S.gg.find(x => x.id == i.gid); return (i.ty || '') + ' ' + (g ? g.models.join(' ') : ''); }
  return nzText(i);
};

/* إحصائيات سريعة للرف/القسم: عدد الأصناف + مجموع القطع الفعلية */
function jlSecSummary(sec) {
  if (sec == 'phones') {
    const A = ph();
    return `${A.length} صنف · مجموع القطع: ${A.reduce((s, i) => s + (+i.cnt || 0), 0)}`;
  }
  if (sec == 'glass') {
    const tot = S.gg.reduce((s, g) => s + S.tags.glass.reduce((a, t) => { const i = gitem(g.id, t); return a + (i ? gTot(i, g) : 0); }, 0), 0);
    return `${S.gg.length} مجموعة · مجموع الزجاج: ≈${tot}`;
  }
  if (sec == 'case') {
    const A = S.items.filter(i => i.sec == 'case');
    return `${A.length} موديل · مجموع القطع: ${A.reduce((s, i) => s + csTot(i), 0)}`;
  }
  if (sec == 'acc') {
    const A = S.items.filter(i => i.sec == 'acc' && !gkc(i.kind).g), G = agList();
    const cnt = A.reduce((s, i) => s + (typeof i.cnt == 'number' ? i.cnt : 0), 0) + G.reduce((s, d) => s + (d.tot || 0), 0);
    return `${A.length + G.length} صنف/مجموعة · مجموع القطع المرقمة: ${cnt}`;
  }
  if (sec == 'tp') {
    const C = (S.tp || []).filter(r => r && r.k == 'c');
    return `${C.length} فئة بطاقات · مجموع البطاقات: ${C.reduce((s, r) => s + (+r.val || 0), 0)}`;
  }
  const phCnt = ph().reduce((s, i) => s + (+i.cnt || 0), 0), csCnt = S.items.filter(i => i.sec == 'case').reduce((s, i) => s + csTot(i), 0);
  return `الهواتف: ${phCnt} قطعة · البوشيط: ${csCnt} قطعة`;
}

const itemCard = i => i._jl == 'ag' ? agCard(i.d) : i._jl == 'tp' ? jlTpCard(i.r) : i.sec == 'phones' ? phCard(i) : i.sec == 'case' ? csCard(i) : i.sec == 'acc' ? acCard(i) : i.sec == 'glass' ? gl2(i) : '';
function jlTpCard(r) {
  return `<div class="card"><div class="row2"><b>تعبئة ${esc(r.op)} — بطاقة ${r.n} درهم</b><span class="m">${r.val <= 0 ? 'نفد' : r.est ? '≈' + r.val : 'العدد ' + r.val}</span></div><div class="m">آخر تأكيد قبل ${Math.floor((Date.now() - cfTime(r)) / 864e5)} يوم</div><div class="sub"><button class="btn s sm" onclick="go('tp')">فتح شاشة التعبئة</button></div></div>`;
}

const fmtDh = p => { p = dg(p || '').trim(); return !p ? '' : /^\d+(\.\d+)?$/.test(p) ? p + ' درهم' : p; };

/* سطر جرد مضغوط وسريع (تعديل فوري + زر تأكيد ✓ في نفس السطر) */
function jlCompactRow(i) {
  const days = Math.max(0, Math.floor((Date.now() - cfTime(i)) / 864e5));
  const dBadge = `<span class="m" style="font-size:.75rem">${days ? 'قبل ' + days + 'ي' : 'مؤكد اليوم'}</span>`;
  if (i._jl == 'ag') {
    const d = i.d, e = encodeURIComponent(d.id);
    const sub = d.tot !== null ? `المجموع ${d.est ? '≈' : ''}${d.tot}` : ALB2[d.st];
    return `<div class="card cmp jl-row"><div class="row2"><span class="dotl" style="background:${DT[d.st]}"></span><div class="cmp-main" onclick="agCnt('${e}')"><b>${esc(d.title)}</b><div class="m">${esc(sub)} · ${dBadge}</div></div>`
      + ['g', 'y', 'r'].map(s => `<button class="tag ${d.st == s ? 'on' : ''}" style="margin:0;padding:4px 7px;font-size:.74rem" onclick="agLv('${e}','${s}')">${ALB2[s]}</button>`).join('')
      + `<button class="rck" title="تأكيد كما هو" onclick="rCfAg('${e}')">${I('check')}</button></div></div>`;
  }
  if (i._jl == 'tp') {
    const r = i.r;
    return `<div class="card cmp jl-row"><div class="row2"><div class="cmp-main" onclick="go('tp')"><b>تعبئة ${esc(r.op)} — ${r.n} درهم</b><div class="m">${r.val <= 0 ? 'نفد' : (r.est ? '≈' : 'العدد ') + r.val} · ${dBadge}</div></div>`
      + `<button class="btn s sm" onclick="go('tp')">تعديل</button><button class="rck" title="تأكيد كما هو" onclick="rCfTp('${r.id}')">${I('check')}</button></div></div>`;
  }
  if (i.sec == 'phones') {
    const s = phSt(i), sub = [i.color, i.ram, i.cap, i.price && fmtDh(i.price)].filter(Boolean).map(esc).join(' · ');
    return `<div class="card cmp jl-row"><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="phEd('${i.id}')"><b>${esc(i.brand + ' ' + i.name)}</b><div class="m">${sub ? sub + ' · ' : ''}${dBadge}</div></div>`
      + `<button class="btn s sm" onclick="phC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="phC('${i.id}',1)">+</button>`
      + `<button class="rck" title="تأكيد كما هو" onclick="rCf('${i.id}')">${I('check')}</button></div></div>`;
  }
  if (i.sec == 'glass') {
    const g = S.gg.find(x => x.id == i.gid); if (!g) return '';
    const s = gSt(i, g, i.ty), j = Math.max(0, S.tags.glass.indexOf(i.ty));
    return `<div class="card cmp jl-row"><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="go('sec',{k:'glass',ty:${j}})"><b>زجاج ${esc(i.ty)}: ${esc(g.models.join(' / '))}</b><div class="m">المجموع ${gEst(i, g) ? '≈' : ''}${gTot(i, g)}${i.price ? ' · ' + esc(fmtDh(i.price)) : ''} · ${dBadge}</div></div>`
      + `<button class="btn s sm" onclick="go('sec',{k:'glass',ty:${j}})">فتح</button><button class="rck" title="تأكيد كما هو" onclick="rCf('${i.id}')">${I('check')}</button></div></div>`;
  }
  if (i.sec == 'case') {
    const s = csSt(i), gSum = typeof csGSummaryTxt == 'function' ? csGSummaryTxt(i) : 'المجموع ' + csTot(i);
    const chips = typeof csChipsHtml == 'function' ? csChipsHtml(i, true) : '';
    return `<div class="card cmp jl-row"><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="csQuickNote('${i.id}')"><b>بوشيط ${esc(i.name)}</b><div class="m">${esc(gSum)}${i.price ? ' · ' + esc(fmtDh(i.price)) : ''} · ${dBadge}</div></div>`
      + `<button class="rck" title="تأكيد كما هو" onclick="rCf('${i.id}')">${I('check')}</button></div>${chips}</div>`;
  }
  if (i.sec == 'acc') {
    const s = acSt(i), cn = typeof i.cnt == 'number';
    const act = cn ? `<button class="btn s sm" onclick="acC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="acC('${i.id}',1)">+</button>`
      : ['g', 'y', 'r'].map(x => `<button class="tag ${i.st == x ? 'on' : ''}" style="margin:0;padding:4px 7px;font-size:.74rem" onclick="acS('${i.id}','${x}')">${ALB[x]}</button>`).join('');
    return `<div class="card cmp jl-row"><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="acEd('${i.id}')"><b>${esc(acTitle(i))}</b><div class="m">${i.price ? esc(fmtDh(i.price)) + ' · ' : ''}${dBadge}</div></div>`
      + act + `<button class="rck" title="تأكيد كما هو" onclick="rCf('${i.id}')">${I('check')}</button></div></div>`;
  }
  return '';
}

function rCf(id) { const i = find(id); if (i) { vib(25); upd(() => touch(i, 1)); } }
function rCfAg(e) {
  const d = agD(e); if (!d) return;
  vib(25);
  upd(() => {
    let g = S.ag.find(x => x.id == d.id);
    if (!g) { g = { id: d.id, kind: d.kind, conn: d.conn, tier: d.tier, pw: d.pw }; S.ag.push(g); }
    g.by = S.me; g.at = g.cf = Date.now();
    d.mem.forEach(m => touch(m, 1));
  });
}
function rCfTp(id) {
  const r = (S.tp || []).find(x => x.id == id); if (!r) return;
  vib(25);
  upd(() => { r.by = S.me; r.at = r.cf = Date.now(); });
}

const jlCurSec = () => V.js || V.jk || 'all';
function jlFiltered() {
  const allMode = V.jm == 'all', sec = jlCurSec(), q = nz(V.jq || '');
  return rnd(allMode).filter(i => (sec == 'all' || jlSecOf(i) == sec) && (!q || nz(jlTextOf(i)).includes(q)));
}

function rCfAll() {
  const L = jlFiltered().slice(0, 40);
  if (!L.length) return;
  vib(40);
  commit('تم تأكيد ' + L.length + ' صنف في الجرد', () => {
    const now = Date.now();
    L.forEach(i => {
      if (i._jl == 'ag') {
        let g = S.ag.find(x => x.id == i.id);
        if (!g) { g = { id: i.d.id, kind: i.d.kind, conn: i.d.conn, tier: i.d.tier, pw: i.d.pw }; S.ag.push(g); }
        g.by = S.me; g.at = g.cf = now;
        i.d.mem.forEach(m => touch(m, 1));
      } else if (i._jl == 'tp') {
        i.r.by = S.me; i.r.at = i.r.cf = now;
      } else {
        touch(i, 1);
      }
    });
  });
}

const JL_TABS = [['all', 'الكل'], ['phones', 'الهواتف'], ['glass', 'الأنتي كاس'], ['case', 'البوشيط'], ['acc', 'الإكسسوارات'], ['tp', 'التعبئة']];
function jlRefreshList() {
  const L = jlFiltered(), a = L.slice(0, 40), box = $('jl_list'), btn = $('jl_cf_all');
  if (btn) { btn.hidden = !a.length; btn.innerHTML = `${I('check')} تأكيد كل القائمة الظاهرة (${a.length})`; }
  if (box) box.innerHTML = a.map(jlCompactRow).join('') || emptyBox('كل الأصناف في هذا القسم مؤكدة حديثاً ✓');
}
VW.jl = () => {
  const allMode = V.jm == 'all', sec = jlCurSec(), staleCnt = rnd(false).length;
  const L = jlFiltered(), a = L.slice(0, 40);
  return {
    t: 'الجرد والجولة اليومية',
    h: `<div class="card" style="padding:10px 12px;margin:4px 0 8px"><div class="row2"><b style="flex:1">${esc(jlSecSummary(sec))}</b><span class="m">غير مؤكد: ${staleCnt}</span></div></div>`
      + `<div class="sec-panel">`
      + `<div class="sec-tags">${JL_TABS.map(([k, l]) => `<button class="tag ${sec == k ? 'on' : ''}" onclick="V.js='${k}';delete V.jk;render()">${l}</button>`).join('')}</div>`
      + `<div class="sec-toolbar"><div class="seg-group" style="width:100%"><button type="button" class="seg-btn ${!allMode ? 'on' : ''}" onclick="V.jm='old';render()">يحتاج تأكيداً (${staleCnt})</button><button type="button" class="seg-btn ${allMode ? 'on' : ''}" onclick="V.jm='all';render()">جرد شامل للقسم</button></div></div>`
      + `<input style="margin:8px 0 0" placeholder="ابحث داخل الجرد: موديل أو ماركة..." value="${esc(V.jq || '')}" oninput="V.jq=this.value;jlRefreshList()">`
      + `</div>`
      + `<button id="jl_cf_all" class="btn s" ${a.length ? '' : 'hidden'} onclick="rCfAll()">${I('check')} تأكيد كل القائمة الظاهرة (${a.length})</button>`
      + `<div id="jl_list">${a.map(jlCompactRow).join('') || emptyBox('كل الأصناف في هذا القسم مؤكدة حديثاً ✓', 'اضغط «جرد شامل للقسم» في الأعلى إن أردت مراجعة كل المخزون')}</div>`
  };
};
HOME.after.push(() => {
  const n = rnd(false).length;
  return `<button class="btn s" onclick="go('jl')">${I('check')} الجرد والجولة اليومية${n ? ` (${n} يحتاج تأكيداً)` : ''}</button>`;
});

/* ============================ كاشف الأثمنة الفوري الموحّد (بأيقونات SVG الملوّنة) ============================ */
window.priceLookupHtml = function (q) {
  const n = nz(q); if (n.length < 2) return '';
  const phs = ph().filter(i => nzOf(i, nzText).includes(n)).slice(0, 6);
  const gls = S.gg.filter(g => g.models.some(m => nz(((g.br || {})[m] || '') + m).includes(n))).slice(0, 4);
  const css = S.items.filter(i => i.sec == 'case' && nzOf(i, nzText).includes(n)).slice(0, 4);
  const gds = (S.guide || []).filter(g => nz(g.m + ' ' + g.f + ' ' + (g.n || '')).includes(n)).slice(0, 6);
  const acs = S.items.filter(i => i.sec == 'acc' && nzOf(i, nzText).includes(n)).slice(0, 5);
  const cats = (phs.length ? 1 : 0) + (gls.length ? 1 : 0) + (css.length ? 1 : 0) + (gds.length ? 1 : 0) + (acs.length ? 1 : 0);
  if (!cats) return '';
  let rows = '';
  phs.forEach(i => {
    const s = phSt(i), sub = [i.color, i.ram, i.cap, i.cond && i.cond != 'جديد' && i.cond].filter(Boolean).join('·');
    rows += `<div class="rrow" style="padding:7px 0;cursor:pointer" onclick="phEd('${i.id}')"><span class="dotl" style="background:${DT[s]}"></span><span class="rt" style="font-size:.88rem">${I('cphone')} <b>${esc(i.brand + ' ' + i.name)}</b> ${sub ? `<small class="m">(${esc(sub)})</small>` : ''} <small class="m">· متاح ${av(i)}</small></span><b class="cmp-pr">${esc(i.price ? fmtDh(i.price) : 'بدون سعر')}</b></div>`;
  });
  gls.forEach(g => {
    S.tags.glass.forEach((ty, j) => {
      const it = gitem(g.id, ty), tot = it ? gTot(it, g) : 0, s = it ? gSt(it, g, ty) : 'r';
      if (tot > 0 || (it && it.price)) {
        rows += `<div class="rrow" style="padding:7px 0;cursor:pointer" onclick="glMin('${g.id}',${j})"><span class="dotl" style="background:${DT[s]}"></span><span class="rt" style="font-size:.88rem">${I('cglass')} زجاج <b>${esc(ty)}</b> <small class="m">(${esc(g.models.slice(0, 3).join('/'))}) · ${it && gEst(it, g) ? '≈' : ''}${tot}</small></span><b class="cmp-pr">${esc(it && it.price ? fmtDh(it.price) : 'حدّد السعر')}</b></div>`;
      }
    });
  });
  css.forEach(c => {
    const s = csSt(c), gSum = typeof csGSummaryTxt == 'function' ? csGSummaryTxt(c) : 'المتوفر ' + csTot(c);
    rows += `<div class="rrow" style="padding:7px 0;cursor:pointer" onclick="csLimEd('${c.id}')"><span class="dotl" style="background:${DT[s]}"></span><span class="rt" style="font-size:.88rem">${I('ccase')} بوشيط <b>${esc(c.name)}</b> <small class="m">(${esc(gSum)})</small></span><b class="cmp-pr">${esc(c.price ? fmtDh(c.price) : 'حدّد السعر')}</b></div>`;
  });
  acs.forEach(a => {
    const s = acSt(a);
    rows += `<div class="rrow" style="padding:7px 0;cursor:pointer" onclick="acEd('${a.id}')"><span class="dotl" style="background:${DT[s]}"></span><span class="rt" style="font-size:.88rem">${I('cacc')} <b>${esc(acName(a))}</b></span><b class="cmp-pr">${esc(a.price ? fmtDh(a.price) : '—')}</b></div>`;
  });
  gds.forEach(g => {
    const prTxt = fmtDh(g.p) + (g.p2 ? ' · أصلي: ' + fmtDh(g.p2) : '');
    rows += `<div class="rrow" style="padding:7px 0;cursor:pointer" onclick="gdEd('${g.id}')"><span class="dotl" style="background:var(--p)"></span><span class="rt" style="font-size:.88rem">${I('crepair')} إصلاح <b>${esc(g.m)}</b> — ${esc(g.f)}${g.n ? ` <small class="m">(${esc(g.n)})</small>` : ''}</span><b class="cmp-pr">${esc(prTxt)}</b></div>`;
  });
  if (!rows) return '';
  return `<div class="card" style="border-color:var(--p);background:color-mix(in srgb,var(--ab) 35%,var(--c));padding:10px 12px"><div class="row2" style="margin-bottom:4px"><b style="color:var(--p);font-size:.9rem">${I('tag')} ملخص الأثمنة والتوفر</b><span class="m" style="font-size:.76rem">اضغط على السطر للتعديل</span></div>${rows}</div>`;
};
SRCH.unshift({
  k: 'prc',
  l: 'الأثمنة',
  run: n => { const h = window.priceLookupHtml(n); return h ? [h] : []; }
});