/* ============================================================
   invacc.js — الإكسسوارات ومجموعات الكابلات والشواحن (تصميم السطر الواحد المرن)
   يُحمَّل بعد invpochette.js.
   ============================================================ */

/* ============================ الإكسسوارات ============================ */
const DKC = { 'كابل': { conn: 1 }, 'شاحن': { conn: 1 } }, DK = { 'كابل': { g: 1, w: 0 }, 'شاحن': { g: 1, w: 1 }, 'رأس شاحن': { g: 1, w: 1 } };
const kc = k => ({ conn: 0, tier: 1, ...(DKC[k] || {}), ...((S.cfg.kc || {})[k] || {}) });
const gkc = k => ({ g: 0, w: 0, ...(DK[k] || {}), ...((S.cfg.gkc || {})[k] || {}) });
const fxIn = i => S.fields.filter(f => f.sec == 'acc').map(f => fxVal(i, f).join(' ')).filter(Boolean).join(' ');
const xSig = o => S.fields.filter(f => f.sec == 'acc').map(f => fxVal(o, f).slice().sort().join('+')).join('|');
const acName = i => [i.kind, i.conn, fxIn(i), i.tier && 'فئة ' + i.tier, i.brand].filter(Boolean).join(' ');
const acTitle = i => [i.kind, i.conn, fxIn(i), i.brand].filter(Boolean).join(' ');
const acLim = i => i.lim ?? kc(i.kind).lim ?? lim('acl');
const acSt = i => typeof i.cnt == 'number' ? (i.cnt <= 0 ? 'r' : i.cnt <= acLim(i) ? 'y' : 'g') : i.st;
const ALB = { g: 'متوفر', y: 'قليل', r: 'نفد' };

function acCard(i) {
  const s = acSt(i), cn = typeof i.cnt == 'number', cmp = isCmp('acc') && V.v == 'sec';
  const fxParts = S.fields.filter(f => f.sec == 'acc').map(f => fxVal(i, f).length ? f.name + ': ' + fxVal(i, f).join('، ') : '').filter(Boolean);
  const sub = [i.tier && 'فئة ' + i.tier, i.pw, ...(cmp ? [] : fxParts), i.note].filter(Boolean).map(esc).join(' · ');
  const act = cn
    ? `<button class="btn s sm" onclick="acC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="acC('${i.id}',1)">+</button>`
    : ['g', 'y', 'r'].map(x => `<button class="tag ${i.st == x ? 'on' : ''}" style="margin:0;padding:4px 8px;font-size:.76rem" onclick="acS('${i.id}','${x}')">${ALB[x]}</button>`).join('');
  return cardH(`<div class="row2" style="flex-wrap:wrap;gap:6px"><span class="dotl" style="background:${DT[s]}"></span><div class="cmp-main" onclick="acOpen('${i.id}')"><b>${esc(acTitle(i))}</b>${sub ? `<div class="m">${sub}</div>` : ''}</div>${i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : ''}<div class="row2" style="gap:4px">${act}</div></div>`, colOf(i), 'cmp');
}

/* نافذة الإجراءات السفلية للإكسسوار (تفتح عند الضغط على السطر) */
const acGo = (f, id) => { finish(null); setTimeout(() => window[f](id), 380); };
function acOpen(id) {
  const i = find(id); if (!i) return;
  acSheetR(id); sheetOpen(() => { });
}
function acSheetR(id) {
  const i = find(id); if (!i) return;
  const s = acSt(i), cn = typeof i.cnt == 'number';
  const meta = [i.tier && 'فئة ' + i.tier, i.pw, cn ? 'الحد ≤ ' + acLim(i) : ''].filter(Boolean).join(' · ');
  const ctrl = cn
    ? `<div class="cs-vr"><b>العدد المتوفر</b><button class="btn s cs-sb" onclick="acC('${i.id}',-1);acSheetR('${i.id}')">−</button><span class="cn">${i.cnt}</span><button class="btn cs-sb" onclick="acC('${i.id}',1);acSheetR('${i.id}')">+</button></div>`
    : `<div class="row2" style="margin:8px 0">${['g', 'y', 'r'].map(x => `<button class="tag ${i.st == x ? 'on' : ''}" style="flex:1;margin:0;min-height:42px" onclick="acS('${i.id}','${x}');acSheetR('${i.id}')">${ALB[x]}</button>`).join('')}</div>`;
  $('sh').innerHTML = `<div class="bar"></div><div class="row2"><h3>${esc(acTitle(i))}</h3>${i.price ? `<span class="cmp-pr">${esc(fmtPr(i.price))}</span>` : ''}<span class="dotl" style="background:${DT[s]}"></span></div>`
    + (meta ? `<p class="m" style="margin:2px 0 6px">${esc(meta)}</p>` : '')
    + fxShow(i)
    + (i.note ? `<div class="m" style="margin:4px 0">ملاحظة: ${esc(i.note)}</div>` : '')
    + ctrl
    + `<div class="cs-acts">`
    + `<button class="btn s" onclick="acGo('acEd','${i.id}')">تعديل</button>`
    + `<button class="btn s" onclick="acGo('acDup','${i.id}')">+ سعة / فئة أخرى</button>`
    + `<button class="btn s" onclick="acGo('acNote','${i.id}')">ملاحظة</button>`
    + (cn ? '' : `<button class="btn s" onclick="acGo('acCnt','${i.id}')">تحويل لعدد رقمي</button>`)
    + ((i.log || []).length ? `<button class="btn s" onclick="acGo('lgOpen','${i.id}')">السجل</button>` : '')
    + `<button class="btn s del" onclick="acGo('acDel','${i.id}')">حذف</button>`
    + `</div><div class="acts"><button class="btn" onclick="finish(null)">تم</button></div>`;
}
function acDup(id) {
  const r = find(id); if (!r) return;
  $('sh').innerHTML = ''; sheetOpen(v => acDone(v, PR));
  acForm({ kind: r.kind, conn: r.conn || '', brand: r.brand || '', tier: r.tier || '', pw: r.pw || '', price: r.price || '', lim: r.lim });
}

function acView() {
  const j = V.kk, k = j == null ? null : S.tags.kind[j];
  const a = srt(S.items.filter(i => i.sec == 'acc' && !gkc(i.kind).g && (k == null || i.kind == k)), 'acc', acName, i => ({ r: 0, y: 1, g: 2 })[acSt(i)], i => i.at);
  const pg = pgSlice('ac', a);
  const G = agList().filter(d => k == null || d.kind == k).map(agCard).join('');
  const tagsHtml = `<button class="tag ${j == null ? 'on' : ''}" onclick="V.kk=null;render()">الكل</button>`
    + S.tags.kind.map((t, x) => `<button class="tag ${j == x ? 'on' : ''}" onclick="V.kk=${x};render()">${esc(t)}</button>`).join('');
  return {
    t: 'الإكسسوارات',
    h: `<button class="btn" onclick="acAdd()">+ إضافة إكسسوار</button>`
      + secPanel('acc', tagsHtml)
      + G + (pg.items.map(acCard).join('') + pg.more || (G ? '' : emptyBox('لا توجد إكسسوارات في هذا القسم بعد', 'اضغط على «+ إضافة إكسسوار» في الأعلى لإضافة أول قطعة')))
  };
}
function acC(id, d) { const i = find(id); upd(() => { i.cnt = Math.max(0, i.cnt + d); touch(i); }); if (d > 0) reqChk(acName(i)); }
function acCnt(id) { const i = find(id); ask('عدد القطع', [{ k: 'n', l: 'العدد الحالي', t: 'tel', v: '' }]).then(v => { if (v && v.n.trim() !== '') { upd(() => { i.cnt = ci(v.n); touch(i, 1); }); if (+dg(v.n) > 0) reqChk(acName(i), 1); } }); }
function acS(id, s) { const i = find(id); upd(() => { i.st = s; touch(i, 1); }); if (s != 'r') reqChk(acName(i)); }
function acNote(id) { const i = find(id); ask('ملاحظة للمشتري', [{ k: 'n', l: 'مثال: بقي 5 حبات', v: i.note || '' }]).then(v => { if (v) upd(() => { i.note = v.n.trim(); i.by = S.me; }); }); }
function acDel(id) { del('items', id, acName(find(id))); }
function acAdd() {
  PR = null; $('sh').innerHTML = `<div class="bar"></div><h3>إضافة إكسسوار</h3><label>ابحث أولاً (مثلاً: micro أو Sandisk)<input oninput="acF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;
  sheetOpen(v => acDone(v, PR)); acF('');
}
function acF(q) {
  const n = nz(q), m = S.items.filter(i => i.sec == 'acc' && nz(acName(i)).includes(n)).slice(0, 6);
  $('pr').innerHTML = m.map(i => `<button class="card row2" onclick="acForm(find('${i.id}'))"><b>${esc(acName(i))}</b><span class="m">${esc(fmtPr(i.price))}</span></button>`).join('') + `<button class="btn" onclick="acForm({})">+ إكسسوار جديد</button>`;
}
function acEd(id) { const r = find(id); $('sh').innerHTML = ''; sheetOpen(v => acDone(v, r)); acForm(r); }
function acForm(rec) {
  PR = rec; const ed = !!rec.id;
  fsInit([['kind', 'النوع'], ['conn', 'الموصل', () => kc(FS.v.kind).conn && shown('acc', 'conn')], ['tier', 'الفئة (السعر)', () => kc(FS.v.kind).tier && shown('acc', 'tier')], ['pw', 'القدرة (واط)', () => gkc(FS.v.kind).w]],
    { kind: rec.kind || '', conn: rec.conn || '', tier: rec.tier || '', pw: rec.pw || '' }, 'acc', rec);
  $('sh').innerHTML = `<div class="bar"></div><h3>${ed ? 'تعديل' : 'إكسسوار جديد'}</h3><div id="cc"></div><div id="cc2"></div>`
    + `<div id="fx"></div>`
    + `<div class="row2" style="gap:8px;align-items:flex-end"><label style="flex:1;margin-top:8px"${hh('acc', 'price')}>السعر (درهم)<input id="ap" type="tel" value="${esc(rec.price || '')}" placeholder="أو يُؤخذ من الفئة" ${ed && !can('price') ? 'disabled' : ''}></label><label style="flex:1;margin-top:8px"${hh('acc', 'cnt')}>العدد (اختياري)<input id="acn" type="tel" value="${esc(rec.cnt ?? '')}" placeholder="فارغ = متوفر/قليل"></label></div>`
    + `<div class="row2" style="gap:8px;align-items:flex-end"><label style="flex:1;margin-top:8px"${hh('acc', 'brand')}>الماركة (اختياري)<input id="ab" value="${esc(rec.brand || '')}"></label><label style="flex:1;margin-top:8px"${hh('acc', 'lim')}>الحد: «قليل» عند (اختياري)<input id="acl" type="tel" value="${esc(rec.lim ?? '')}"></label></div>`
    + `<label${hh('acc', 'note')}>ملاحظة<textarea id="an">${esc(rec.note || '')}</textarea></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="acSave()">حفظ</button></div>`
    + (ed ? '' : `<button class="btn s" onclick="acSave(2)">حفظ وإضافة مثله (سعة أو فئة أخرى)</button>` + moreBtn('acSave'));
  chipsR();
}
function acSave(more) {
  const kind = FS.v.kind; if (!kind) return toast('اختر النوع');
  const k = kc(kind), c = $('acn').value.trim(), l = $('acl').value.trim();
  finish(fxAtt({ kind, conn: k.conn ? FS.v.conn || '' : '', tier: k.tier ? FS.v.tier || '' : '', pw: gkc(kind).w ? FS.v.pw || '' : '', brand: $('ab').value.trim(), price: $('ap').value.trim() || (k.tier ? FS.v.tier || '' : ''), note: $('an').value.trim(), cnt: c === '' ? undefined : ci(c), lim: l === '' ? undefined : ci(l), _more: more || 0 }));
}
function acDone(v, r) {
  if (!v) return; const more = v._more; delete v._more;
  if (r && r.id && S.items.includes(r)) {
    if (!can('price')) v.price = r.price;
    const cntChg = r.cnt !== v.cnt;
    commit('تم التعديل', () => { Object.assign(r, v); if (cntChg) touch(r, 1); else r.by = S.me; });
    if (cntChg && v.cnt > 0) reqChk(acName(r), 1);
    return;
  }
  const d = S.items.find(i => i.sec == 'acc' && i.kind == v.kind && (i.conn || '') == v.conn && (i.tier || '') == v.tier && (i.brand || '') == v.brand && (i.pw || '') == v.pw && xSig(i) == xSig(v));
  if (d) return toast('موجود مسبقاً: ' + acName(d));
  const o = { id: uid(), sec: 'acc', ...v, st: 'g' }; if (r && r.code) o.code = r.code; touch(o, 1);
  commit('تمت الإضافة', () => S.items.push(o));
  if (more == 2) setTimeout(() => { sheetOpen(x => acDone(x, PR)); acForm({ kind: v.kind, conn: v.conn, brand: v.brand, tier: v.tier, pw: v.pw, price: v.price, lim: v.lim }); }, 350);
  else if (more) setTimeout(acAdd, 350);
  else reqChk(acName(o), 1);
}
function buyA(id) {
  const i = find(id); if (!i) return;
  if (typeof i.cnt == 'number') return qty(acTitle(i), Math.max(1, acLim(i) + 1 - i.cnt), n => { i.cnt += n; touch(i, 1); reqChk(acName(i), 1); });
  commit('تم الشراء', () => { i.st = 'g'; touch(i, 1); }); reqChk(acName(i));
}

/* مجموعات الكابلات والشواحن: الحكم على المجموع (فئة + موصل + قدرة) — سطر واحد رشيق + نافذة تفاصيل */
const gkey = i => [i.kind, i.conn || '', i.tier || '', i.pw || ''].join('|').replace(/\//g, '-');
const AORD = { r: 0, y: 1, g: 2 }, ALB2 = { g: 'متوفر', y: 'قارب النفاد', r: 'نفد' };
function agList() {
  const m = {}, mk = (id, x) => m[id] = m[id] || { id, kind: x.kind, conn: x.conn || '', tier: x.tier || '', pw: x.pw || '', mem: [] };
  S.items.forEach(i => { if (i.sec == 'acc' && gkc(i.kind).g) mk(gkey(i), i).mem.push(i); });
  S.ag.forEach(r => { if (gkc(r.kind).g) mk(r.id, r); });
  return Object.values(m).map(d => {
    const g = S.ag.find(x => x.id == d.id), L = (g && g.lim) ?? gkc(d.kind).lim ?? lim('agl'), M = d.mem.filter(i => typeof i.cnt == 'number'), mt = M.reduce((a, i) => a + i.cnt, 0), mat = M.length ? Math.max(...M.map(i => i.at || 0)) : 0;
    let tot = null, est = false; if (M.length && mat > ((g && g.at) || 0)) tot = mt; else if (g && typeof g.cnt == 'number') { tot = g.cnt; est = true; }
    const st = tot !== null ? (tot <= 0 ? 'r' : tot <= L ? 'y' : 'g') : ((g && g.lv) || 'g');
    const at = Math.max((g && g.at) || 0, ...d.mem.map(i => i.at || 0));
    const cf = Math.max(cfTime(g), ...d.mem.map(cfTime));
    return { ...d, g, lim: L, tot, est, st, at, cf, title: [d.kind, d.conn, d.pw, d.tier && 'فئة ' + d.tier].filter(Boolean).join(' · ') };
  }).sort((a, b) => AORD[a.st] - AORD[b.st] || a.title.localeCompare(b.title));
}
const agD = e => agList().find(x => x.id == decodeURIComponent(e));
function agSet(d, fn, tch = true, cf = false) {
  commit('تم التحديث', () => {
    let g = S.ag.find(x => x.id == d.id);
    if (!g) { g = { id: d.id, kind: d.kind, conn: d.conn, tier: d.tier, pw: d.pw }; S.ag.push(g); }
    fn(g); g.by = S.me;
    if (tch) { if (!g.cf && g.at) g.cf = g.at; g.at = Date.now(); if (cf) g.cf = g.at; }
  });
}
function agCard(d) {
  const e = encodeURIComponent(d.id), cmp = isCmp('acc') && V.v == 'sec';
  const brs = !cmp && d.mem.length ? d.mem.map(i => (i.brand || 'عام') + (typeof i.cnt == 'number' ? ' (' + i.cnt + ')' : '')).join('، ') : '';
  const sub = [d.tot !== null ? 'المجموع ' + (d.est ? '≈' : '') + d.tot : '', 'الحد ' + d.lim, brs].filter(Boolean).join(' · ');
  return cardH(`<div class="row2" style="flex-wrap:wrap;gap:6px"><span class="dotl" style="background:${DT[d.st]}"></span><div class="cmp-main" onclick="agOpen('${e}')"><b>${esc(d.title)}</b>${sub ? `<div class="m">${esc(sub)}</div>` : ''}</div><div class="row2" style="gap:4px">${['g', 'y', 'r'].map(s => `<button class="tag ${d.st == s ? 'on' : ''}" style="margin:0;padding:4px 8px;font-size:.76rem" onclick="agLv('${e}','${s}')">${ALB2[s]}</button>`).join('')}</div></div>`, '', 'cmp');
}
const agGo = (f, e) => { finish(null); setTimeout(() => window[f](e), 380); };
function agOpen(e) {
  const d = agD(e); if (!d) return;
  $('sh').innerHTML = `<div class="bar"></div><div class="row2"><h3>${esc(d.title)}</h3><span class="dotl" style="background:${DT[d.st]}"></span><span class="m">${ALB2[d.st]}</span></div>`
    + `<p class="m" style="margin:2px 0 8px">${d.tot !== null ? 'المجموع ' + (d.est ? '≈' : '') + d.tot + ' · ' : ''}«قارب النفاد» عند ${d.lim} فأقل</p>`
    + `<div class="row2" style="margin:8px 0">${['g', 'y', 'r'].map(s => `<button class="tag ${d.st == s ? 'on' : ''}" style="flex:1;margin:0;min-height:42px" onclick="agLv('${e}','${s}');agOpen('${e}')">${ALB2[s]}</button>`).join('')}</div>`
    + (d.mem.length ? `<label>الماركات المسجلة في هذه المجموعة (اضغط للتعديل)</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px">${d.mem.map(i => `<button class="tag" style="margin:0" onclick="agGo('acEd','${i.id}')">${esc(i.brand || 'بدون ماركة')}${typeof i.cnt == 'number' ? ' · ' + i.cnt : ''}</button>`).join('')}</div>` : '')
    + `<div class="cs-acts">`
    + `<button class="btn s" onclick="agGo('agCnt','${e}')">تحديد المجموع</button>`
    + `<button class="btn s" onclick="agGo('agLimEd','${e}')">تعديل الحد</button>`
    + `<button class="btn s" onclick="agGo('agAddB','${e}')">+ إضافة ماركة</button>`
    + (can('del') ? `<button class="btn s del" onclick="agGo('agDel','${e}')">حذف المجموعة</button>` : '')
    + `</div><div class="acts"><button class="btn" onclick="finish(null)">تم</button></div>`;
  if (!SH) sheetOpen(() => { });
}
const agLv = (e, l) => { const d = agD(e); if (d) { agSet(d, g => { g.lv = l; delete g.cnt; }, true, true); if (l != 'r') reqChk(d.title); } };
const agBuy = e => { const d = agD(e); if (d) { agSet(d, g => { g.lv = 'g'; delete g.cnt; }, true, true); reqChk(d.title); } };
function agCnt(e) { const d = agD(e); if (d) ask('المجموع التقريبي — ' + d.title, [{ k: 'n', l: 'العدد تقريباً', t: 'tel', v: d.tot ?? '' }]).then(v => { if (v && v.n.trim() !== '') { agSet(d, g => { g.cnt = ci(v.n); delete g.lv; }, true, true); if (+dg(v.n) > 0) reqChk(d.title, 1); } }); }
function agLimEd(e) {
  const d = agD(e); if (!d) return; if (!isAdmin()) return toast('للمدير فقط');
  ask('الحد — ' + d.title, [{ k: 'n', l: '«قارب النفاد» عند مجموع فأقل (فارغ = الحد العام)', t: 'tel', v: d.g && d.g.lim != null ? d.g.lim : '' }]).then(v => { if (v) agSet(d, g => { if (v.n.trim() === '') delete g.lim; else g.lim = ci(v.n); }, false); });
}
function agAddB(e) { const d = agD(e); if (!d) return; $('sh').innerHTML = ''; sheetOpen(v => acDone(v, PR)); acForm({ kind: d.kind, conn: d.conn, tier: d.tier, pw: d.pw }); }
function agDel(e) {
  if (!can('del')) return toast('الحذف للمدير فقط');
  const d = agD(e); if (!d) return;
  const msg = d.mem.length ? `حذف مجموعة «${d.title}» مع ${d.mem.length} عناصر تابعة لها؟` : `حذف مجموعة «${d.title}» ؟`;
  sure(msg).then(y => {
    if (!y) return;
    commit('تم حذف المجموعة', () => {
      S.ag = S.ag.filter(x => x.id != d.id);
      if (d.mem.length) {
        const ids = new Set(d.mem.map(m => m.id));
        d.mem.forEach(m => S.trash.push({ id: uid(), coll: 'items', obj: m, label: acName(m), t: Date.now() }));
        S.items = S.items.filter(i => !ids.has(i.id));
      }
    });
  });
}