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
  ph().filter(i => phSt(i) != 'g').forEach(i => L.push(['الهواتف الناقصة', [i.brand, i.name, i.color, i.cap].filter(Boolean).join(' ') + ' — ' + av(i) + (rsQ(i) ? ' (محجوز ' + rsQ(i) + ')' : ''), phSt(i), `buyP('${i.id}')`]));
  S.gg.forEach(g => {
    const hasAny = S.tags.glass.some(t => gitem(g.id, t));
    S.tags.glass.forEach((t, idx) => {
      const i = gitem(g.id, t);
      if (i && gSt(i, g, t) != 'g') L.push(['الأنتي كاس', t + ': ' + g.models.join(' / ') + ' — المجموع ' + (gEst(i, g) ? '≈' : '') + gTot(i, g), gSt(i, g, t), `buyG('${i.id}')`]);
      else if (!i && !hasAny && idx === 0) L.push(['الأنتي كاس', t + ': ' + g.models.join(' / ') + ' — المجموع 0', 'r', `buyG('${g.id}')`]);
    });
  });
  S.items.filter(i => i.sec == 'case' && csSt(i) != 'g').forEach(i => {
    const gs = csGStats(i), badG = gs.filter(x => x.st != 'g').map(x => `${x.g} (${x.tot <= 0 ? 'نفد' : x.tot})`);
    const zColors = (i.v || []).filter(x => x.c && x.n <= 0).map(x => [x.g, x.c].filter(Boolean).join(' '));
    const miss = [...badG, ...zColors.filter(c => !badG.some(b => c.startsWith(b.split(' ')[0])))];
    L.push(['البوشيط', i.name + (miss.length ? ' — ناقص: ' + miss.join('، ') : '') + ' — المتوفر (' + csGSummaryTxt(i) + ')' + (notes && i.rem ? ' — باقي: ' + i.rem : '') + (notes && i.need ? ' — خاصنا: ' + i.need : ''), csSt(i), `buyC('${i.id}')`]);
  });
  S.items.filter(i => i.sec == 'acc' && !gkc(i.kind).g && acSt(i) != 'g').forEach(i => L.push(['الإكسسوارات', acName(i) + (typeof i.cnt == 'number' ? ' — العدد ' + i.cnt : '') + (i.note ? ' — ' + i.note : ''), acSt(i), `buyA('${i.id}')`]));
  agList().filter(d => d.st != 'g').forEach(d => L.push(['الإكسسوارات', d.title + (d.tot !== null ? ' — المجموع ' + (d.est ? '≈' : '') + d.tot : d.st == 'r' ? ' — نفد' : ' — قارب النفاد'), d.st, `agBuy('${encodeURIComponent(d.id)}')`]));
  return L;
}

/* ============================ البحث الموحّد وعرض القسم ============================ */
SRCH.push(
  { k: 'phones', l: 'هواتف', run: n => S.items.filter(i => i.sec == 'phones' && nzOf(i, nzText).includes(n)).slice(0, 30).map(phCard) },
  { k: 'glass', l: 'أنتي كاس', run: n => S.gg.filter(g => g.models.some(m => nz(((g.br || {})[m] || '') + m).includes(n))).slice(0, 15).map(glB) },
  { k: 'case', l: 'بوشيط', run: n => S.items.filter(i => i.sec == 'case' && nzOf(i, nzText).includes(n)).slice(0, 30).map(csCard) },
  { k: 'acc', l: 'إكسسوارات', run: n => S.items.filter(i => i.sec == 'acc' && nzOf(i, nzText).includes(n)).slice(0, 30).map(acCard) }
);
VW.sec = () => ({ phones: phView, glass: glView, case: csView, acc: acView }[V.k] || phView)();