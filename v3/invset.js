/* ============================================================
   invset.js — إعدادات المخزون: الخانات، حدود الأنتي كاس، الألوان، أنواع الإكسسوار، الخانات المخصصة، إدارة الوسوم
   يُحمَّل بعد barcode.js وقبل repair.js.
   ============================================================ */

/* ============================ الإعدادات الخاصة بالمخزون ============================ */
VW.st_fld = () => ({
  t: 'الحقول في النماذج',
  h: (can('fields') ? '<p class="m">الأزرق = ظاهر. اضغط لإخفاء الحقل أو إظهاره.</p>' : '<p class="m">التعديل للمدير فقط.</p>')
    + Object.keys(FLD).map(s => `<h3>${FLDN[s] || s}</h3><div>${FLD[s].map(([k, l]) => `<button class="tag ${hd(s, k) ? '' : 'on'}" onclick="fTog('${s}','${k}')">${l}</button>`).join('')}</div>`).join('')
});

const tg = (l, g) => [l, "go('st_tg',{g:'" + g + "'})", () => S.tags[g].length];
const CATS = {   // ملف الصيانة يضيف CATS.rp
  ph: ['الهواتف', [tg('الماركات', 'brand'), tg('الألوان', 'color'), tg('السعات', 'cap'), tg('RAM', 'ram'), ['حدود الهواتف حسب فئة السعر (أزرار / اقتصادية / متوسطة / عالية)', "go('st_pt')", () => ptCfg().map(x => x[2]).join(' / ')], ['الحد العام (عند عدم وجود سعر): «قارب النفاد» عند عدد', "limEd('low')", () => lim('low') + ' فأقل'], ['ألوان الماركات وحدودها', "go('st_br')"]], 'phones'],
  gl: ['الأنتي كاس', [tg('أنواع الزجاج', 'glass'), ['حد «قارب النفاد» لكل نوع زجاج', "go('st_gl')", () => (lim('gmin') - 1) + ' فأقل'], ['كم تُحسب المستويات (غامق / أخضر / فاتح / قليل)', "go('st_gl2')"]], null],
  cs: ['البوشيط', [tg('الألوان', 'color'), ['الحد العام لكل لون: «قارب النفاد» عند', "limEd('cl')", () => lim('cl') + ' فأقل']], 'case'],
  ac: ['الإكسسوارات', [tg('الأنواع', 'kind'), tg('الموصلات', 'conn'), tg('الفئات السعرية', 'tier'), tg('القدرات (واط)', 'pw'), ['الحد العام للقطع بعدد: «قليل» عند', "limEd('acl')", () => lim('acl') + ' فأقل'], ['الحد العام للمجموعات (كابل/شاحن) عند', "limEd('agl')", () => lim('agl') + ' فأقل'], ['إعداد كل نوع (الخاصيات، العرض، الحد)', "go('st_ak')"]], 'acc']
};
VW.st_c = () => { const c = CATS[V.c] || CATS.ph; return { t: c[0], h: c[1].map(([l, fn, n]) => row(l, fn, n ? n() : '')).join('') + (c[2] ? row('خانات مخصصة لهذا القسم', "go('st_fx',{fs:'" + c[2] + "'})", S.fields.filter(f => f.sec == c[2]).length || '') : '') }; };
MORE.push(
  { g: 'sec', o: 10, l: 'الهواتف', fn: "go('st_c',{c:'ph'})" }, { g: 'sec', o: 20, l: 'الأنتي كاس', fn: "go('st_c',{c:'gl'})" },
  { g: 'sec', o: 30, l: 'البوشيط', fn: "go('st_c',{c:'cs'})" }, { g: 'sec', o: 40, l: 'الإكسسوارات', fn: "go('st_c',{c:'ac'})" },
  { g: 'look', o: 20, l: 'تلوين البطاقات', fn: "go('st_col')" }, { g: 'look', o: 30, l: 'الحقول في النماذج', fn: "go('st_fld')" },
  { g: 'look', o: 40, l: 'الخانات المخصصة', fn: "go('st_fx')", n: () => S.fields.length || '' }
);

/* حدود الأنتي كاس */
function glTyEd(j) {
  if (!isAdmin()) return toast('للمدير فقط'); const t = S.tags.glass[j], c = (S.cfg.gtl || {})[t];
  ask('حد زجاج ' + t, [{ k: 'n', l: `«قارب النفاد» عند مجموع المجموعة (فارغ = الحد العام ${lim('gmin') - 1} فأقل). اكتب 0 للنوع النادر`, t: 'tel', v: c != null ? c - 1 : '' }]).then(v => {
    if (!v) return; const n = dg(v.n).trim();
    upd(() => { S.cfg.gtl = S.cfg.gtl || {}; if (n === '') delete S.cfg.gtl[t]; else S.cfg.gtl[t] = ci(n) + 1; });
  });
}
VW.st_gl = () => ({ t: 'حدود الأنتي كاس', h: '<p class="m">يُحكم على كل مجموعة موديلات بمجموعها: «قارب النفاد» عند العدد المحدد فأقل. الترتيب: حد المجموعة الخاص (زر «الحد والسعر» داخل بطاقتها) ثم حد نوع الزجاج ثم الحد العام.</p>'
  + row('الحد العام لكل الأنواع', "limEd('gmin')", (lim('gmin') - 1) + ' فأقل') + '<h3>حد خاص بنوع زجاج</h3>'
  + S.tags.glass.map((t, j) => { const c = (S.cfg.gtl || {})[t]; return row(t, 'glTyEd(' + j + ')', c != null ? (c - 1) + ' فأقل' : 'العام'); }).join('') });
VW.st_gl2 = () => ({ t: 'مستويات الأنتي كاس', h: '<p class="m">عندما تختار مستوى تقريبياً (غامق / أخضر / فاتح / قليل) بدل عدد دقيق، يحسب التطبيق كل مستوى كعدد القطع الظاهر هنا ليحكم على مجموع المجموعة. غيّرها فقط إن اختلفت تقديراتك.</p>'
  + ['gA', 'gB', 'gC', 'gY'].map(k => row((LM.find(x => x[0] == k) || [, k])[1].replace('أنتي كاس: ', ''), "limEd('" + k + "')", lim(k))).join('') });

/* الألوان */
let CE = {};
window.cePv = () => { const p = $('cpv'); if (p) p.style.borderInlineStartColor = CE.c || 'transparent'; };
function ceR() {
  if ($('blim')) CE.l = $('blim').value;
  const cur = CE.c || '', inP = PAL.includes(cur), hex = /^#[0-9a-f]{6}$/i.test(cur);
  const sw = `<div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">${PAL.map(c => `<button class="sw ${cur == c ? 'on' : ''}" style="background:${c};margin:2px" onclick="CE.c='${c}';ceR()"></button>`).join('')}</div>`
    + `<div class="row2" style="margin-top:8px"><label class="sw ${cur && !inP ? 'on' : ''}" style="display:inline-block;position:relative;overflow:hidden;background:${cur && !inP ? cur : 'conic-gradient(#ef4444,#eab308,#22c55e,#06b6d4,#3b82f6,#d946ef,#ef4444)'}"><input type="color" value="${hex ? cur : '#3b82f6'}" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;padding:0;border:0;cursor:pointer" oninput="CE.c=this.value;cePv()" onchange="ceR()"></label><span class="m" style="flex:1">لون آخر من اللوحة الكاملة</span><button class="tag ${cur ? '' : 'on'}" onclick="CE.c='';ceR()">بدون</button></div>`;
  $('sh').innerHTML = `<div class="bar"></div><h3>${esc(CE.n)}</h3>` + (CE.t == 's' ? `<label>التلوين</label><div>${CE.mo.map(([k, l]) => `<button class="tag ${CE.m == k ? 'on' : ''}" onclick="CE.m='${k}';ceR()">${l}</button>`).join('')}</div>` : '')
    + ((CE.t == 'b' || CE.m == 's') ? `<label>اللون</label><div id="cpv" class="card" style="border-inline-start:8px solid ${cur || 'transparent'};margin:6px 0 10px"><b>${esc(CE.n)}</b> <span class="m">معاينة البطاقة</span></div>${sw}` : '') + (CE.t == 'b' ? `<label>حد «قارب على النفاد» لمجموع هواتف الموديل الواحد في هذه الماركة (فارغ = حسب فئة السعر)</label><input id="blim" type="tel" value="${esc(CE.l)}">` : '')
    + `<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="if($('blim'))CE.l=$('blim').value;finish(CE)">حفظ</button></div>`;
}
function ceOpen(o, cb) { if (!can('tags')) return toast('للمدير فقط'); CE = o; ceR(); sheetOpen(cb); }
function brEd(j) { const b = S.tags.brand[j]; ceOpen({ t: 'b', n: b, c: BC(b), l: (S.cfg.bl || {})[b] ?? '' }, v => { if (!v) return; upd(() => { S.cfg.bcol = S.cfg.bcol || {}; S.cfg.bcol[b] = v.c; S.cfg.bl = S.cfg.bl || {}; const l = dg(v.l).trim(); if (l === '') delete S.cfg.bl[b]; else S.cfg.bl[b] = Math.max(1, +l || 1); }); }); }
function cmEd(s) { ceOpen({ t: 's', n: SN3[s], m: CM(s), c: SCOL(s), mo: s == 'acc' ? [['s', 'لون واحد للقسم'], ['o', 'بدون']] : [['b', 'حسب الماركة'], ['s', 'لون واحد للقسم'], ['o', 'بدون']] }, v => { if (!v) return; upd(() => { S.cfg.cm = S.cfg.cm || {}; S.cfg.cm[s] = v.m; S.cfg.scol = S.cfg.scol || {}; S.cfg.scol[s] = v.c; }); }); }
VW.st_col = () => ({ t: 'الألوان', h: '<p class="m">ألوان خفيفة على خلفية البطاقات للتمييز بسرعة.</p>' + ['phones', 'glass', 'case', 'acc'].map(s => { const m = CM(s), c = m == 's' ? SCOL(s) : ''; return `<button class="card row2" onclick="cmEd('${s}')"><b>${SN3[s]}</b><span class="m">${MN[m]}</span>${c ? `<span class="dotl" style="background:${c}"></span>` : ''}</button>`; }).join('') + row('ألوان الماركات وحدودها', "go('st_br')") });
VW.st_br = () => ({ t: 'ألوان الماركات', h: '<p class="m">اللون + حد «قارب على النفاد» لكل ماركة (اختياري، يتقدم على فئة السعر).</p>' + S.tags.brand.map((b, j) => { const c = BC(b), l = (S.cfg.bl || {})[b]; return `<button class="card row2" onclick="brEd(${j})"><b>${esc(b)}</b><span class="m">${l != null ? 'حد ' + l + ' فأقل' : ''}</span>${c ? `<span class="dotl" style="background:${c}"></span>` : ''}</button>`; }).join('') });

/* إعداد كل نوع إكسسوار: صفحة مستقلة (ما يظهر + خاصيات + العرض + الحد) */
const akProps = k => S.fields.filter(f => f.sec == 'acc' && (f.kinds || []).includes(k));
function akTog(j, key) {
  if (!isAdmin()) return toast('للمدير فقط');
  const k = S.tags.kind[j];
  upd(() => {
    S.cfg.kc = S.cfg.kc || {}; S.cfg.gkc = S.cfg.gkc || {};
    const c = kc(k), g = gkc(k);
    if (key == 'conn' || key == 'tier') S.cfg.kc[k] = { ...(S.cfg.kc[k] || {}), conn: c.conn, tier: c.tier, [key]: c[key] ? 0 : 1 };
    else S.cfg.gkc[k] = { ...(S.cfg.gkc[k] || {}), g: g.g, w: g.w, [key]: g[key] ? 0 : 1 };
  });
}
function akLim(j, w) {
  if (!isAdmin()) return toast('للمدير فقط');
  const k = S.tags.kind[j], grp = w == 'g', cur = grp ? gkc(k).lim : kc(k).lim, gen = lim(grp ? 'agl' : 'acl');
  ask('الحد — ' + k, [{ k: 'n', l: (grp ? '«قارب النفاد» عند مجموع المجموعة' : '«قليل» لكل قطعة من هذا النوع عند') + ' (فارغ = الحد العام ' + gen + ' فأقل)', t: 'tel', v: cur ?? '' }]).then(v => {
    if (!v) return; const n = dg(v.n).trim();
    upd(() => {
      const o = grp ? (S.cfg.gkc = S.cfg.gkc || {}) : (S.cfg.kc = S.cfg.kc || {}), c = kc(k), g = gkc(k);
      o[k] = { ...(o[k] || {}), ...(grp ? { g: g.g, w: g.w } : { conn: c.conn, tier: c.tier }) };
      if (n === '') delete o[k].lim; else o[k].lim = ci(n);
    });
  });
}
VW.st_akk = () => {
  const j = V.kj ?? 0, k = S.tags.kind[j]; if (k == null) return VW.st_ak();
  const c = kc(k), g = gkc(k), P = akProps(k), t = (key, l, on) => `<button class="tag ${on ? 'on' : ''}" onclick="akTog(${j},'${key}')">${l}</button>`;
  return {
    t: k,
    h: '<h3>ما يظهر عند إضافة هذا النوع</h3><div>' + t('conn', 'الموصل', c.conn) + t('tier', 'الفئة (السعر)', c.tier) + t('w', 'القدرة (واط)', g.w) + '</div>'
      + '<h3>خاصيات إضافية</h3><p class="m">مثل السعة (GB أو mAh) أو الطول. تظهر عند الإضافة، وتدخل في اسم القطعة والبحث وتمنع اعتبار قطعتين مختلفتين مكررتين.</p>'
      + P.map(f => row(f.name, `feEd('${f.id}')`, (f.unit ? f.unit + ' · ' : '') + f.opts.length + ' خيار')).join('')
      + `<button class="btn s" onclick="feEd(null,${j})">+ خاصية جديدة</button>`
      + '<h3>طريقة العرض</h3><div>' + t('g', 'مجموعات حسب الفئة', g.g) + '</div><p class="m">للكابلات والشواحن: يُحكم على المجموع بدل كل قطعة.</p>'
      + '<h3>الحد</h3>' + (g.g ? row('«قارب النفاد» عند مجموع المجموعة', `akLim(${j},'g')`, (g.lim ?? lim('agl')) + ' فأقل') : row('«قليل» لكل قطعة من هذا النوع عند', `akLim(${j},'p')`, (c.lim ?? lim('acl')) + ' فأقل'))
  };
};
VW.st_ak = () => ({
  t: 'إعداد أنواع الإكسسوارات',
  h: '<p class="m">اضغط على نوع لضبط ما يظهر عند إضافته، وخاصياته (كالسعة)، وطريقة عرضه، وحده.</p>' + (can('tags') ? '<button class="btn" onclick="tgAdd(\'kind\')">+ نوع جديد</button>' : '')
    + S.tags.kind.map((k, j) => { const c = kc(k), g = gkc(k); return row(k, "go('st_akk',{kj:" + j + "})", [g.g && 'مجموعات', c.conn && 'موصل', c.tier && 'فئة', g.w && 'واط', ...akProps(k).map(f => f.name)].filter(Boolean).join(' · ')); }).join('')
});

/* إدارة الخانات المخصصة */
let FE = {};
VW.st_fx = () => ({ t: 'الخانات المخصصة', h: '<p class="m">خانة إضافية بخيارات تظهر في نموذج القسم وعلى البطاقة وتدخل في البحث.</p>' + (can('fields') ? '<button class="btn" onclick="feEd(null)">+ إضافة خانة</button>' : '') + Object.keys(SECN).filter(s => !V.fs || V.fs == s).map(s => `<h3>${SECN[s]}</h3>` + (S.fields.filter(f => f.sec == s).map(f => `<button class="card row2" onclick="feEd('${f.id}')"><b style="flex:1">${esc(f.name)}</b><span class="m">${f.kinds && f.kinds.length ? esc(f.kinds.join('، ')) : 'الكل'} · ${f.multi ? 'عدة قيم' : 'قيمة'} · ${f.opts.length}</span></button>`).join('') || '<p class="m">لا شيء</p>')).join('') });
function feR() {
  if ($('fen')) { FE.name = $('fen').value; FE.opts = $('feo').value; FE.unit = $('feu').value; }
  const kl = FE.sec == 'phones' ? S.tags.brand : FE.sec == 'acc' ? S.tags.kind : null;
  $('sh').innerHTML = `<div class="bar"></div><h3>${FE.id ? 'تعديل خانة' : 'خانة جديدة'}</h3><label>اسم الخانة (مثال: الموصل)</label><input id="fen" value="${esc(FE.name)}"><label>الوحدة (اختياري: GB أو mAh — تُلحق تلقائياً بالأرقام التي تكتبها)</label><input id="feu" value="${esc(FE.unit || '')}"><label>القسم</label><div>${Object.keys(SECN).map(s => `<button class="tag ${FE.sec == s ? 'on' : ''}" onclick="FE.sec='${s}';FE.kinds=[];feR()">${SECN[s]}</button>`).join('')}</div>`
    + (kl ? `<label>تظهر لـ ${FE.sec == 'phones' ? 'ماركات' : 'أنواع'} محددة (بدون اختيار = الكل)</label><div>${kl.map((k, j) => `<button class="tag ${FE.kinds.includes(k) ? 'on' : ''}" onclick="feK(${j})">${esc(k)}</button>`).join('')}</div>` : '')
    + `<label>طريقة الاختيار</label><div><button class="tag ${FE.multi ? '' : 'on'}" onclick="FE.multi=false;feR()">قيمة واحدة</button><button class="tag ${FE.multi ? 'on' : ''}" onclick="FE.multi=true;feR()">عدة قيم</button></div><label>الخيارات (واحد في كل سطر)<textarea id="feo">${esc(FE.opts)}</textarea></label>`
    + `<div class="acts">${FE.id ? '<button class="btn d" onclick="finish({del:1})">حذف</button>' : ''}<button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="feOk()">حفظ</button></div>`;
}
function feK(j) { const k = (FE.sec == 'phones' ? S.tags.brand : S.tags.kind)[j]; FE.kinds = FE.kinds.includes(k) ? FE.kinds.filter(x => x != k) : [...FE.kinds, k]; feR(); }
function feOk() { FE.name = $('fen').value.trim(); FE.opts = $('feo').value; FE.unit = $('feu').value.trim(); if (!FE.name) return toast('اكتب اسم الخانة'); finish({ ok: 1 }); }
function feEd(id, kj) {
  if (!can('fields')) return toast('للمدير فقط'); const f = id ? S.fields.find(x => x.id == id) : null;
  FE = f ? { id: f.id, name: f.name, sec: f.sec, kinds: [...(f.kinds || [])], multi: !!f.multi, unit: f.unit || '', opts: f.opts.join('\n') } : { id: '', name: '', sec: kj != null ? 'acc' : V.fs || 'acc', kinds: kj != null ? [S.tags.kind[kj]] : [], multi: false, unit: '', opts: '' };
  feR();
  sheetOpen(v => {
    if (!v) return;
    upd(() => {
      if (v.del) { S.fields = S.fields.filter(x => x.id != FE.id); return; }
      const o = { name: FE.name, sec: FE.sec, kinds: FE.kinds, multi: FE.multi, unit: FE.unit, opts: FE.opts.split('\n').map(s => fxNorm(s, FE.unit)).filter(Boolean) };
      if (FE.id) Object.assign(S.fields.find(x => x.id == FE.id), o); else S.fields.push({ id: uid(), ...o });
    });
  });
}

/* ============================ إدارة الوسوم الموحدة (بدون تكرار + حماية الزجاج والسلة) ============================ */
function tgCount(g, val) {
  let n = 0;
  if (['brand', 'color', 'cap', 'ram', 'kind', 'conn', 'tier', 'pw'].includes(g)) {
    S.items.forEach(i => {
      if (i[g] === val) n++;
      else if (g == 'color' && i.sec == 'case' && (i.v || []).some(x => x.c === val)) n++;
    });
  }
  if (g == 'brand') S.gg.forEach(x => { if (Object.values(x.br || {}).includes(val)) n++; });
  if (g == 'glass') S.items.forEach(i => { if (i.sec == 'glass' && i.ty === val && (sumv(i.stock) > 0 || Object.keys(i.lv || {}).length > 0)) n++; });
  if (g == 'fault') {
    (S.rp || []).forEach(r => { if ((r.fault || '').split('،').map(s => s.trim()).includes(val)) n++; });
    (S.guide || []).forEach(d => { if (d.f === val) n++; });
  }
  return n;
}
function tgReplace(g, oldV, newV) {
  if (oldV === newV) return;
  if (['brand', 'color', 'cap', 'ram', 'kind', 'conn', 'tier', 'pw'].includes(g)) {
    S.items.forEach(i => {
      if (i[g] === oldV) i[g] = newV;
      if (g == 'color' && i.sec == 'case') (i.v || []).forEach(x => { if (x.c === oldV) x.c = newV; });
    });
  }
  if (g == 'brand') {
    S.gg.forEach(x => { if (x.br) Object.keys(x.br).forEach(m => { if (x.br[m] === oldV) { if (newV) x.br[m] = newV; else delete x.br[m]; } }); });
    S.fields.forEach(f => { if (f.sec == 'phones' && Array.isArray(f.kinds)) f.kinds = [...new Set(f.kinds.map(k => k === oldV ? newV : k).filter(Boolean))]; });
    ['bcol', 'bl'].forEach(c => { const o = S.cfg && S.cfg[c]; if (o && o[oldV] !== undefined) { if (newV && o[newV] === undefined) o[newV] = o[oldV]; delete o[oldV]; } });
  }
  if (g == 'kind') {
    S.fields.forEach(f => { if (f.sec == 'acc' && Array.isArray(f.kinds)) f.kinds = [...new Set(f.kinds.map(k => k === oldV ? newV : k).filter(Boolean))]; });
    ['kc', 'gkc'].forEach(c => { const o = S.cfg && S.cfg[c]; if (o && o[oldV] !== undefined) { if (newV && o[newV] === undefined) o[newV] = o[oldV]; delete o[oldV]; } });
  }
  if (['kind', 'conn', 'tier', 'pw'].includes(g)) {
    (S.ag || []).forEach(a => { if (a[g] === oldV) { a[g] = newV; a.id = gkey(a); } });
    const seenAg = {};   // دمج المجموعات التي صار لها نفس المعرّف بعد إعادة التسمية
    S.ag = (S.ag || []).filter(a => { const p = seenAg[a.id]; if (!p) { seenAg[a.id] = a; return true; } if ((a.at || 0) > (p.at || 0)) Object.assign(p, a); return false; });
  }
  if (g == 'glass') {
    const o = S.cfg && S.cfg.gtl;
    if (o && o[oldV] !== undefined) { if (newV && o[newV] === undefined) o[newV] = o[oldV]; delete o[oldV]; }
    if (!newV) {
      S.items.filter(i => i.sec == 'glass' && i.ty === oldV).forEach(i => S.trash.push({ id: uid(), coll: 'items', obj: i, label: 'أنتي كاس: ' + oldV, t: Date.now() }));
      S.items = S.items.filter(i => !(i.sec == 'glass' && i.ty === oldV));
    } else {
      S.items = S.items.filter(i => {
        if (i.sec != 'glass' || i.ty !== oldV) return true;
        const t = gitem(i.gid, newV);
        if (!t || t === i) { i.ty = newV; return true; }
        t.stock = t.stock || {}; for (const m in (i.stock || {})) t.stock[m] = (t.stock[m] || 0) + i.stock[m];
        if (i.lv) { t.lv = t.lv || {}; Object.assign(t.lv, i.lv); }
        if (t.min == null && i.min != null) t.min = i.min;
        if (!t.price && i.price) t.price = i.price;
        return false;
      });
    }
  }
  if (g == 'fault') {
    (S.rp || []).forEach(r => {
      if (!r.fault) return;
      const pts = r.fault.split('،').map(s => s.trim()).filter(Boolean);
      if (pts.includes(oldV)) r.fault = [...new Set(pts.map(x => x === oldV ? newV : x).filter(Boolean))].join('، ');
    });
    (S.guide || []).forEach(d => { if (d.f === oldV && newV) d.f = newV; });
  }
}
window.tgRen = (g, i) => {
  if (!can('tags')) return toast('للمدير فقط');
  const oldV = S.tags[g][i]; if (oldV == null) return;
  const cnt = tgCount(g, oldV);
  ask('تعديل اسم الوسم', [{ k: 't', l: 'الاسم الجديد' + (cnt ? ' (سيُحدّث ' + cnt + ' موضع تلقائياً)' : ''), v: oldV }]).then(v => {
    const t = v && v.t.trim(); if (!t || t === oldV) return;
    if (S.tags[g].includes(t)) {
      sure(`«${t}» موجود مسبقاً. هل تريد دمج «${oldV}» فيه؟`, 'دمج', false).then(y => {
        if (y) commit(`تم دمج «${oldV}» في «${t}»`, () => { S.tags[g].splice(i, 1); tgReplace(g, oldV, t); if (typeof tagFix == 'function') tagFix(); });
      });
      return;
    }
    commit('تم تعديل الوسم إلى «' + t + '»', () => { S.tags[g][i] = t; tgReplace(g, oldV, t); if (typeof tagFix == 'function') tagFix(); });
  });
};
window.tgDel = (g, i) => {
  if (!can('tags')) return toast('للمدير فقط');
  const val = S.tags[g][i]; if (val == null) return;
  const cnt = tgCount(g, val), others = S.tags[g].filter((_, idx) => idx !== i);
  if (g == 'glass' && !others.length) return toast('لا يمكن حذف آخر نوع زجاج');
  if (!cnt) {
    sure('حذف الوسم «' + val + '» ؟ (غير مستعمل في أي قطعة)').then(y => {
      if (y) commit('تم حذف الوسم', () => { S.tags[g].splice(i, 1); tgReplace(g, val, ''); });
    });
    return;
  }
  const clearOpt = '— مسح الوسم من القطع دون بديل —';
  const opts = g == 'glass' ? others : [clearOpt, ...others];
  ask(`«${val}» مستعمل في ${cnt} موضع`, [
    { k: 'm', l: g == 'glass' ? 'انقل مخزونه إلى نوع زجاج آخر قبل الحذف:' : 'اختر وسماً بديلاً لنقل/دمج القطع إليه قبل الحذف:', t: 'sel', o: opts, v: others[0] || opts[0] }
  ], 'دمج وحذف', true).then(v => {
    if (!v) return;
    const target = v.m === clearOpt ? '' : v.m;
    commit(target ? `تم دمج «${val}» في «${target}»` : `تم حذف «${val}»`, () => {
      S.tags[g].splice(i, 1);
      tgReplace(g, val, target);
      if (typeof tagFix == 'function') tagFix();
    });
  });
};
VW.st_tg = () => {
  const g = V.g, ed = can('tags');
  return {
    t: TG[g],
    h: (ed ? '<p class="m">اضغط على الاسم لتعديله في كل القطع، أو × لحذفه/دمجه.</p>' : '<p class="m">التعديل للمدير فقط.</p>')
      + `<div>${S.tags[g].map((t, i) => {
        const c = tgCount(g, t);
        return `<span class="tag">${ed ? `<span onclick="tgRen('${g}',${i})">${esc(t)}</span>` : esc(t)}${c ? `<small class="m" style="font-size:.75rem">(${c})</small>` : ''}${ed ? `<b onclick="tgDel('${g}',${i})" style="padding-inline-start:4px">×</b>` : ''}</span>`;
      }).join('')}</div>`
      + (ed ? `<button class="btn" onclick="tgAdd('${g}')">+ إضافة</button>` : '')
  };
};

