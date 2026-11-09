/* ============================================================
   topup.js — التعبئة: أرصدة هواتف التعبئة (3 لكل شركة) وبطاقات التعبئة (5/10/20/50)
   لشركات IAM و ORANGE و INWI. يُحمَّل بعد core.js مباشرة.
   البيانات: S.tp (سجل لكل رصيد/فئة، يُزامَن) · الحدود: S.cfg.tp.
   ============================================================ */
(() => {
  Object.assign(IC, { topup: '<path d="M5 20v-4M10 20v-8M15 20V8M20 20V4"/>' });

  const OPS = [['IAM', '#2563eb'], ['ORANGE', '#ea580c'], ['INWI', '#9333ea']];
  const CARDS = [5, 10, 20, 50], PH = [1];
  const D0 = { gv: 15, bo: 30, br: 10, cl: { 5: 3, 10: 3, 20: 3, 50: 3 }, rh: 10 };
  const GREY = '#94a3b8', DC = { 5: '#0d9488', 10: '#2563eb', 20: '#7c3aed', 50: '#db2777' };

  const T = () => (S.tp = S.tp || []);
  const cf = () => { const c = (S.cfg && S.cfg.tp) || {}, o = { ...D0, ...c, cl: { ...D0.cl, ...(c.cl || {}) } }; o.gm = {}; CARDS.forEach(n => { o.gm[n] = (c.gm && c.gm[n] != null) ? c.gm[n] : o.gv; }); return o; };
  const okE = () => isAdmin() || !S.users.length;
  const rid = (op, k, n) => 'tp_' + op + '_' + k + n;
  const rec = (op, k, n) => T().find(r => r.id == rid(op, k, n));
  const val = (op, k, n) => { const r = rec(op, k, n); return r && r.val != null ? r.val : null; };
  const num = s => { s = dg(s).replace(',', '.').replace(/[^\d.]/g, ''); const n = parseFloat(s); return isNaN(n) ? null : n; };
  const dm = v => +Number(v).toFixed(2) + ' درهم';
  const isToday = t => !!t && new Date(t).toDateString() == new Date().toDateString();
  const pad = n => String(n).padStart(2, '0');
  const when = t => { const d = new Date(t); return isToday(t) ? 'اليوم ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : fd(t); };

  /* الحالة: u غير مسجَّل · g متوفر · y قارب · r نافد/منخفض */
  const stP = v => v == null ? 'u' : v <= cf().br ? 'r' : v <= cf().bo ? 'y' : 'g';
  const stC = (n, v) => v == null ? 'u' : v <= 0 ? 'r' : v <= cf().cl[n] ? 'y' : 'g';
  const each = fn => OPS.forEach(([op]) => { PH.forEach(n => fn(op, 'p', n, stP(val(op, 'p', n)))); CARDS.forEach(n => fn(op, 'c', n, stC(n, val(op, 'c', n)))); });
  const tally = () => { const t = { r: 0, y: 0, g: 0, u: 0 }; each((a, b, c, s) => t[s]++); return t; };
  const phDone = () => { let n = 0; OPS.forEach(([op]) => PH.forEach(p => { const r = rec(op, 'p', p); if (r && r.val != null && isToday(r.at)) n++; })); return n; };
  const lastPh = () => T().filter(r => r.k == 'p' && r.at).sort((a, b) => b.at - a.at)[0];

  let svT = 0;
  function put(op, k, n, v, est, now) {
    let r = rec(op, k, n);
    if (!r) { r = { id: rid(op, k, n), op, k, n }; T().push(r); }
    r.val = v; r.est = est ? 1 : 0; r.at = r.cf = Date.now(); r.by = S.me || '';
    clearTimeout(svT);
    if (now) save();
    else svT = setTimeout(save, 150);   // الحفظ بعد الرسم حتى لا يتأخر الضغط
  }
  const gvOf = n => Math.max(cf().gm[n], cf().cl[n] + 1);

  /* ---------- أسطر التقرير: [القسم, النص, الحالة, دالة «تم»] ---------- */
  window.tpLines = () => {
    const L = [];
    each((op, k, n, s) => {
      if (s != 'r' && s != 'y') return;
      const v = val(op, k, n), id = rid(op, k, n);
      L.push(['التعبئة', k == 'p' ? op + ' — رصيد الهاتف ' + dm(v) : op + ' — بطاقة ' + n + ' — ' + (v <= 0 ? 'نفد' : (rec(op, k, n) || {}).est ? 'قارب النفاد' : 'باقي ' + v), s, `tpFix('${id}')`]);
    });
    return L;
  };
  /* «تم» في التقرير: هاتف ← الرصيد الجديد · بطاقة ← الكمية التي وصلت (مع حفظ فوري وتراجع) */
  window.tpFix = id => {
    const p = id.split('_'), op = p[1], k = p[2][0], n = +p[2].slice(1);
    const snapTp = () => JSON.stringify(T());
    if (k == 'p') ask(op + ' — الهاتف', [{ k: 'v', l: 'الرصيد الجديد بعد التعبئة (درهم)', t: 'tel' }], 'تم').then(v => {
      const x = v && num(v.v); if (x == null) return;
      const prev = snapTp();
      put(op, 'p', n, x, 0, true); render();
      toast('تم تحديث الرصيد', () => { S.tp = JSON.parse(prev); });
    });
    else ask(op + ' — بطاقة ' + n, [{ k: 'v', l: 'الكمية التي وصلت', t: 'tel' }], 'تم الشراء').then(v => {
      const x = v && num(v.v); if (!(x > 0)) return;
      const prev = snapTp();
      put(op, 'c', n, (val(op, 'c', n) || 0) + Math.round(x), 0, true); render();
      toast('تمت الإضافة', () => { S.tp = JSON.parse(prev); });
    });
  };

  /* ---------- التحديث في مكانه بلا إعادة رسم (حتى لا تُغلق لوحة المفاتيح) ---------- */
  const setT = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  const lastLine = () => {
    const d = phDone(), l = lastPh();
    return d >= OPS.length * PH.length ? ['تم تحديث الأرصدة اليوم' + (l ? ' — ' + when(l.at) + (l.by ? ' — ' + l.by : '') : ''), 0] : ['أرصدة اليوم: ' + d + ' من ' + OPS.length * PH.length + ' (لم تكتمل)', 1];
  };
  function paint() {
    each((op, k, n, s) => {
      const id = op + '_' + k + n, r = $('tpr_' + id); if (!r) return;
      r.className = 'tpr' + (k == 'c' ? ' c' : '') + (s == 'r' || s == 'y' ? ' ' + s : '');
      if (k == 'p') { const d = $('tpd_' + id); if (d) d.style.background = s == 'u' ? GREY : DT[s]; setT('tpt_' + id, s == 'r' ? 'منخفض' : s == 'y' ? 'قارب' : ''); }
      else ['g', 'y', 'r'].forEach(x => { const e = $('tps' + x + '_' + id); if (e) e.classList.toggle('on', s == x); });
    });
    const t = tally(); setT('tps_r', t.r); setT('tps_y', t.y); setT('tps_u', t.u);
    const l = lastLine(), e = $('tpl'); if (e) { e.textContent = l[0]; e.className = 'rsent' + (l[1] ? ' w' : ''); }
    OPS.forEach(([op]) => { const L = T().filter(r => r.op == op && r.at).sort((a, b) => b.at - a.at)[0]; setT('tpu_' + op, L ? when(L.at) : 'لم يُسجَّل بعد'); });
  }
  const tm = {};
  window.tpIn = (op, k, n, el, now) => {
    clearTimeout(tm[el.id]);
    const x = num(el.value); if (el.value.trim() === '' || x == null) return;
    const go1 = () => { put(op, k, n, k == 'c' ? Math.round(x) : x, 0); el.placeholder = '—'; paint(); };
    now ? go1() : (tm[el.id] = setTimeout(go1, 600));
  };
  /* ضغطة حالة على بطاقة التعبئة: متوفر (أكثر من الحد) · قارب · نفد */
  window.tpSt = (op, n, s) => {
    const cur = stC(n, val(op, 'c', n)), el = $('tpi_' + op + '_c' + n); if (!cf() || cur == s) return;
    const v = s == 'g' ? gvOf(n) : s == 'y' ? Math.max(1, cf().cl[n]) : 0;
    put(op, 'c', n, v, s != 'r');
    if (el) { el.value = s == 'r' ? '0' : ''; el.placeholder = s == 'g' ? gvOf(n) + '+' : s == 'y' ? '≈' + v : '—'; }
    paint();
  };

  /* ---------- الشاشة ---------- */
  const row1 = (op, k, n) => {
    const r = rec(op, k, n), v = val(op, k, n), id = op + '_' + k + n, ph = k == 'p', est = r && r.est, s = ph ? stP(v) : stC(n, v);
    if (ph) return `<div class="tpr" id="tpr_${id}"><span class="dotl" id="tpd_${id}"></span><span class="tpn">رصيد الهاتف</span><span class="tpt" id="tpt_${id}"></span>`
      + `<input class="tpi" id="tpi_${id}" inputmode="decimal" placeholder="—" value="${v == null ? '' : esc(v)}" oninput="tpIn('${op}','p',${n},this)" onchange="tpIn('${op}','p',${n},this,1)" onfocus="this.select()"><span class="m tpu">درهم</span></div>`;
    const B = (x, l) => `<button class="tps ${x} ${s == x ? 'on' : ''}" id="tps${x}_${id}" onclick="tpSt('${op}',${n},'${x}')">${l}</button>`;
    return `<div class="tpr c" id="tpr_${id}" style="--dc:${DC[n]}"><span class="tpd">${n}<small>درهم</small></span>` + B('g', gvOf(n) + '+') + B('y', 'قارب') + B('r', 'نفد')
      + `<input class="tpi" id="tpi_${id}" inputmode="numeric" placeholder="${v == null ? '—' : est ? (s == 'g' ? gvOf(n) + '+' : '≈' + v) : '—'}" value="${v == null || est ? '' : esc(v)}" oninput="tpIn('${op}','c',${n},this)" onchange="tpIn('${op}','c',${n},this,1)" onfocus="this.select()"></div>`;
  };
  VW.tp = () => {
    const t = tally(), l = lastLine();
    let h = `<div class="qbar rsum"><div class="qpill al"><div class="qn" id="tps_r">${t.r}</div><div class="ql">نافد / منخفض</div></div><div class="qpill wn"><div class="qn" id="tps_y">${t.y}</div><div class="ql">قارب النفاد</div></div><div class="qpill rp"><div class="qn" id="tps_u">${t.u}</div><div class="ql">غير مسجَّل</div></div></div>`
      + `<div id="tpl" class="rsent ${l[1] ? 'w' : ''}">${esc(l[0])}</div>`;
    OPS.forEach(([op, col]) => {
      h += `<div class="card tpop" style="--oc:${col}"><div class="tpoh"><b>${op}</b><span class="m" id="tpu_${op}"></span></div>`
        + '<div class="tpl">هاتف التعبئة</div>' + PH.map(n => row1(op, 'p', n)).join('')
        + '<div class="tpl">بطاقات التعبئة — اضغط الحالة أو اكتب العدد</div>' + CARDS.map(n => row1(op, 'c', n)).join('') + '</div>';
    });
    h += `<div class="row2" style="margin-top:12px"><button class="btn s" onclick="reportSectionFilter='topup';go('rep')">عرض في التقرير</button></div>`;
    return { t: 'التعبئة', h, a: paint };
  };

  /* ---------- الحدود ---------- */
  const LB = { bo: 'رصيد الهاتف: «قارب» عند ≤ (درهم)', br: 'رصيد الهاتف: «منخفض» عند ≤ (درهم)', gv: 'بطاقات: زر «متوفر» يعني أكثر من (عدد)', rh: 'ساعة بدء تذكير الصباح (0 إلى 23)' };
  window.tpLim = k => {
    if (!okE()) return toast('للمدير فقط');
    const c = cf(), isC = k.startsWith('cl'), isG = k.startsWith('gm'), cur = isC ? c.cl[k.slice(2)] : isG ? c.gm[k.slice(2)] : c[k];
    ask('الحدود', [{ k: 'v', l: isC ? 'بطاقة ' + k.slice(2) + ': «قارب» عند عدد ≤' : isG ? 'بطاقة ' + k.slice(2) + ': زر «متوفر» يعني أكثر من (عدد)' : LB[k], t: 'tel', v: String(cur) }]).then(v => {
      const x = v && num(v.v); if (x == null || (k == 'rh' && x > 23)) return;
      upd(() => { const o = { ...(S.cfg.tp || {}) }; if (isC) o.cl = { ...(o.cl || {}), [k.slice(2)]: x }; else if (isG) o.gm = { ...(o.gm || {}), [k.slice(2)]: x }; else o[k] = x; S.cfg.tp = o; });
    });
  };
  VW.st_tp = () => {
    const c = cf();
    return {
      t: 'حدود التعبئة',
      h: '<p class="m">تحدد متى يصير اللون برتقالياً أو أحمر في شاشة التعبئة والتقرير.</p><h3>رصيد هاتف التعبئة</h3>'
        + row(LB.bo, "tpLim('bo')", c.bo) + row(LB.br, "tpLim('br')", c.br)
        + '<h3>بطاقات التعبئة (الأحمر عند 0 دائماً)</h3><p class="m">لكل فئة حدّان مستقلان: «قارب» (أقل أو يساوي) و«متوفر» (أكثر من).</p>' + CARDS.map(n => row('بطاقة ' + n + ' درهم — «قارب» عند ≤', "tpLim('cl" + n + "')", c.cl[n]) + row('بطاقة ' + n + ' درهم — «متوفر» أكثر من', "tpLim('gm" + n + "')", c.gm[n])).join('')
        + '<h3>التذكير</h3>' + row(LB.rh, "tpLim('rh')", c.rh + ':00')
        + '<div style="margin-top:14px"><button class="btn s" onclick="if(okTpE())upd(()=>{delete S.cfg.tp})">إرجاع الحدود الافتراضية</button></div>'
    };
  };
  window.okTpE = () => okE() || (toast('للمدير فقط'), false);

  /* ---------- الرئيسية والمزيد ---------- */
  window.tpSkip = () => sure('لن تُسجَّل أرصدة التعبئة اليوم؟ سيختفي التذكير حتى الغد.', 'نعم، لا تسجيل اليوم', false).then(ok => {
    if (!ok) return;
    S.cfg.tx = new Date().toDateString(); save(); render();
    toast('أُلغي تذكير التعبئة لليوم', () => { delete S.cfg.tx; });
  });
  HOME.top.push(() => {
    if ((typeof noRem == 'function' && noRem()) || new Date().getHours() < cf().rh || phDone() >= OPS.length * PH.length || S.cfg.tx == new Date().toDateString()) return '';
    return `<div class="card row2">${I('alert')}<span style="flex:1">لم تُسجَّل أرصدة التعبئة اليوم</span><button class="btn sm" onclick="go('tp')">سجّل الآن</button><button class="btn s sm" aria-label="لا تسجيل اليوم" onclick="tpSkip()">✕</button></div>`;
  });
  MORE.push({ g: 'sec', o: 55, l: 'حدود التعبئة', d: 'حدود أرصدة الهواتف وبطاقات التعبئة وتذكير الصباح', fn: "go('st_tp')" });
})();