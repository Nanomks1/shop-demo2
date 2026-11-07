/* ============================================================
   invphones.js — الهواتف: البطاقة والعرض، اقتراح الملحقات، الإضافة، الحجز، سجل الحركات
   يُحمَّل بعد invbase.js.
   ============================================================ */

/* ============================ الهواتف ============================ */
const phLim = i => (S.cfg.bl || {})[i.brand] ?? lim('low');
const phSt = i => { const c = av(i); return c <= 0 ? 'r' : c <= phLim(i) ? 'y' : 'g'; };
const stkL = () => ph().filter(i => i.cnt > 0).sort((a, b) => (a.brand + a.name).localeCompare(b.brand + b.name));
const stkN = i => [i.brand, i.name, i.color, i.ram, i.cap].filter(Boolean).join(' ');
function phCard(i) {
  const s = phSt(i), t = [i.color, i.ram, i.cap, i.cond && i.cond != 'جديد' && i.cond].filter(Boolean).map(esc).join(' · ');
  const accBtn = `<button class="btn s sm" onclick="phAcc('${i.id}')">ملحقات</button>`;
  const repBtn = typeof usFromRep == 'function' && av(i) > 0 ? `<button class="btn s sm" onclick="usFromRep('${i.id}')">${I('swap')} روپريز</button>` : '';
  const phMore = repBtn + ((i.log || []).length ? `<button class="btn s sm" onclick="lgOpen('${i.id}')">السجل</button>` : '');
  if (isCmp('phones') && V.v == 'sec') {
    return cardH(`<div class="row2"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="phEd('${i.id}')"><b>${esc(i.brand + ' ' + i.name)}</b>${t ? `<div class="m">${t}${rsQ(i) ? ' · محجوز ' + rsQ(i) : ''}</div>` : ''}</div>${i.price ? `<span class="cmp-pr">${esc(i.price)}</span>` : ''}<button class="btn s sm" onclick="phC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="phC('${i.id}',1)">+</button></div>`, colOf(i), 'cmp');
  }
  return cardH(`<div class="row2"><b>${esc(i.brand + ' ' + i.name)}</b><span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]}</span></div>${t ? `<div class="m">${t}</div>` : ''}${i.imei ? `<div class="m">IMEI: <bdi>${esc(i.imei)}</bdi></div>` : ''}${rsHtml(i)}${fxShow(i)}${i.note ? `<div class="m">${esc(i.note)}</div>` : ''}`
    + `<div class="row2" style="margin-top:8px"><b class="cmp-pr" style="flex:1;margin:0">${esc(fmtPr(i.price))}</b><button class="btn s sm" onclick="phC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="phC('${i.id}',1)">+</button></div>`
    + `<div class="sub"><button class="btn s sm" onclick="phEd('${i.id}')">تعديل</button>${shown('phones', 'res') ? `<button class="btn s sm" onclick="phRs('${i.id}')">حجز${rsQ(i) ? ' (' + rsQ(i) + ')' : ''}</button>` : ''}${accBtn}${phMore ? `<button class="btn s sm" aria-label="المزيد" onclick="const n=this.parentNode.nextElementSibling;n.hidden=!n.hidden">⋯</button>` : ''}</div>${phMore ? `<div class="sub" hidden>${phMore}</div>` : ''}`, colOf(i));
}
function phView() {
  const allPh = ph(), totPcs = allPh.reduce((s, i) => s + (+i.cnt || 0), 0), lowCnt = allPh.filter(i => phSt(i) != 'g').length;
  const usedPh = allPh.filter(i => i.cond == 'مستعمل'), usedPcs = usedPh.reduce((s, i) => s + (+i.cnt || 0), 0);
  const brMap = {};
  allPh.forEach(i => { if (i.brand) brMap[i.brand] = (brMap[i.brand] || 0) + (+i.cnt || 0); });
  const brChips = Object.keys(brMap).map(b => `<button class="tag ${V.pb == b && !V.f ? 'on' : ''}" data-b="${esc(b)}" onclick="V.f=0;V.pb=this.dataset.b;render()">${esc(b)} (${brMap[b]})</button>`).join('');
  let a = srt(allPh, 'phones', i => i.brand + ' ' + i.name, i => i.cnt, i => i.at);
  if (V.f == 1) a = a.filter(i => phSt(i) != 'g');
  else if (V.f == 2) a = a.filter(i => i.cond == 'مستعمل');
  else if (V.pb) a = a.filter(i => i.brand == V.pb);
  const pg = pgSlice('ph', a);
  const tagsHtml = `<button class="tag ${!V.f && !V.pb ? 'on' : ''}" onclick="V.f=0;V.pb='';render()">الكل (${allPh.length} · ${totPcs} قطعة)</button>`
    + `<button class="tag ${V.f == 1 ? 'on' : ''}" onclick="V.f=1;V.pb='';render()">يحتاج شراء (${lowCnt})</button>`
    + brChips
    + (usedPh.length ? `<button class="tag ${V.f == 2 ? 'on' : ''}" onclick="V.f=2;V.pb='';render()">مستعمل (${usedPcs})</button>` : '');
  return {
    t: 'الهواتف',
    h: `<button class="btn" onclick="phAdd()">+ إضافة هاتف</button>`
      + secPanel('phones', tagsHtml)
      + (pg.items.map(phCard).join('') + pg.more || emptyBox('لا توجد هواتف مطابقة لهذا الفلتر', 'اضغط على «+ إضافة هاتف» في الأعلى لإضافة هاتف جديد'))
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
        + (c.v || []).map(x => `<div class="cs-chip ${csChipCls(c, x)}"><span>${esc([x.g, x.c].filter(Boolean).join('·') || 'عام')}</span><button onclick="csC('${c.id}','${x.id}',-1);phUpR('${id}')">−</button><b>${x.n}</b><button onclick="csC('${c.id}','${x.id}',1);phUpR('${id}')">+</button></div>`).join('')
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
  $('sh').innerHTML = `<div class="bar"></div><h3>${ed ? 'تعديل هاتف' : 'هاتف جديد'}</h3>`
    + invModelDatalist()
    + `<div id="cc"></div>`
    + `<div class="row2" style="gap:8px;align-items:flex-end"><label style="flex:2;margin-top:8px">الموديل<input id="pm" list="dl_mnames" value="${esc(rec.name || '')}" placeholder="مثال: A07"></label><label style="flex:1;margin-top:8px">العدد<input id="pcnt" type="number" value="${rec.cnt ?? 1}"></label></div>`
    + `<label${hh('phones', 'price')}>سعر البيع (درهم)<input id="pp" type="tel" value="${esc(rec.price || '')}" placeholder="${esc(rec._costPh || 'مثال: 1350')}" ${ed && !can('price') ? 'disabled' : ''}></label>`
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
    if (g == 'brand') ['bcol', 'bl'].forEach(c => { const o = S.cfg && S.cfg[c]; if (!o) return; Object.keys(map).forEach(x => { if (o[x] !== undefined) { if (o[map[x]] === undefined) o[map[x]] = o[x]; delete o[x]; } }); });
  });
  return ch;
}
HK.save.push(() => { lgScan(); S.items.forEach(i => { delete i._nz; delete i._nzV; }); });
tagFix(); lgScan(); LGI = 1;

