/* ============================================================
   invreport.js — الشراء، سطور تقرير المخزون، البحث الموحّد وعرض القسم
   يُحمَّل بعد invacc.js.
   ============================================================ */

/* ============================ الشراء والتقرير ============================ */
function qty(t, d, fn) { ask(t, [{ k: 'n', l: 'الكمية التي وصلت', t: 'tel', v: d }], 'تم الشراء').then(v => { if (v && ci(v.n) > 0) commit('تم الشراء', () => fn(ci(v.n))); }); }
function buyP(id) { const i = find(id); qty(i.brand + ' ' + i.name, 1, n => { i.cnt += n; touch(i, 1); reqChk(i.brand + ' ' + i.name, 1); }); }
/* كل سطر: [القسم, النص, الحالة r/y, دالة «تم الشراء»] */
function invLines(notes = true) {
  const L = [];
  phGroupsOf(ph()).filter(g => phGSt(g) != 'g').forEach(g => {
    const lo = g.items.slice().sort((x, y) => av(x) - av(y))[0], cl = g.items.length > 1 ? ' (' + g.items.map(x => (x.color || 'عام') + ' ' + av(x)).join('، ') + ')' : g.items[0].color ? ' (' + g.items[0].color + ')' : '';
    L.push(['الهواتف الناقصة', [g.brand, g.name, g.ram, g.cap, g.cond == 'مستعمل' && 'مستعمل'].filter(Boolean).join(' ') + ' — ' + g.tot + (g.rs ? ' (محجوز ' + g.rs + ')' : '') + cl, phGSt(g), `buyP('${lo.id}')`]);
  });
  S.gg.forEach(g => {
    const hasAny = S.tags.glass.some(t => gitem(g.id, t));
    S.tags.glass.forEach((t, idx) => {
      const i = gitem(g.id, t);
      if (i && gSt(i, g, t) != 'g') L.push(['الأنتي كاس', t + ': ' + g.models.join(' / ') + ' — المجموع ' + (gEst(i, g) ? '≈' : '') + gTot(i, g), gSt(i, g, t), `buyG('${i.id}')`]);
      else if (!i && !hasAny && idx === 0) L.push(['الأنتي كاس', t + ': ' + g.models.join(' / ') + ' — المجموع 0', 'r', `buyG('${g.id}')`]);
    });
  });
  S.items.filter(i => i.sec == 'case' && csSt(i) != 'g').forEach(i => {
    const V0 = csN(i).v || [], fm = x => csEmo(x.c) + ' ' + (x.c || 'عام') + ' ' + (x.n <= 0 ? 'نفد' : x.n);
    const bad = V0.filter(x => csVSt(i, x) != 'g').map(fm), ok = V0.filter(x => csVSt(i, x) == 'g').map(fm);
    L.push(['البوشيط', i.name + (V0.length ? (bad.length ? ' — ناقص: ' + bad.join('، ') : '') + (ok.length ? ' — متوفر: ' + ok.join('، ') : '') : ' — نفد') + (notes && i.rem ? ' — باقي: ' + i.rem : '') + (notes && i.need ? ' — خاصنا: ' + i.need : ''), csSt(i), `buyC('${i.id}')`]);
  });
  S.items.filter(i => i.sec == 'acc' && !gkc(i.kind).g && acSt(i) != 'g').forEach(i => L.push(['الإكسسوارات', acName(i) + (typeof i.cnt == 'number' ? ' — العدد ' + i.cnt : '') + (i.note ? ' — ' + i.note : ''), acSt(i), `buyA('${i.id}')`]));
  agList().filter(d => d.st != 'g').forEach(d => L.push(['الإكسسوارات', d.title + (d.tot !== null ? ' — المجموع ' + (d.est ? '≈' : '') + d.tot : d.st == 'r' ? ' — نفد' : ' — قارب النفاد'), d.st, `agBuy('${encodeURIComponent(d.id)}')`]));
  return L;
}

/* ============================ البحث الموحّد وعرض القسم ============================ */
SRCH.push(
  { k: 'phones', l: 'هواتف', run: n => { const ks = new Set(S.items.filter(i => i.sec == 'phones' && nzOf(i, nzText).includes(n)).slice(0, 30).map(phKey)); return phGroupsOf(ph().filter(i => ks.has(phKey(i)))).map(phGCard); } },
  { k: 'glass', l: 'أنتي كاس', run: n => S.gg.filter(g => g.models.some(m => nz(((g.br || {})[m] || '') + m).includes(n))).slice(0, 15).map(glB) },
  { k: 'case', l: 'بوشيط', run: n => S.items.filter(i => i.sec == 'case' && nzOf(i, nzText).includes(n)).slice(0, 30).map(csCard) },
  { k: 'acc', l: 'إكسسوارات', run: n => S.items.filter(i => i.sec == 'acc' && nzOf(i, nzText).includes(n)).slice(0, 30).map(acCard) }
);
VW.sec = () => ({ phones: phView, glass: glView, case: csView, acc: acView }[V.k] || phView)();