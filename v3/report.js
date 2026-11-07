/* ============================================================
   report.js — التقرير اليومي: شاشة التقرير، نص الواتساب، وإعدادات التقرير.
   يعتمد على invLines() من invreport.js و stkL() من invphones.js، و dh/rqTel/rqWA من repair.js.
   ============================================================ */
(() => {
  const RTABS = [['all', 'الشامل'], ['topup', 'التعبئة'], ['phones', 'الهواتف'], ['glass', 'الأنتي كاس'], ['pochette', 'البوشيط'], ['acc', 'الإكسسوارات']];
  const RSEC = { topup: ['التعبئة', '📶 التعبئة'], phones: ['الهواتف الناقصة', '📱 الهواتف'], glass: ['الأنتي كاس', '🛡️ الأنتي كاس'], pochette: ['البوشيط', '🅿️ البوشيط'], acc: ['الإكسسوارات', '🔌 الإكسسوارات'] };
  const SCOL = { topup: '#0891b2', phones: '#2563eb', glass: '#0d9488', pochette: '#db2777', acc: '#7c3aed', req: '#64748b' };
  const RD = { lv: 'a', tt: 'تقرير محل عزيز', dt: 1, st: 1, pr: 0, rq: 1, pn: 1, em: 0, ft: '', hs: [], rr: 0, rd: 0, rm: 1, nd: [], rh: 16, qb: 0 };
  const rcf = () => ({ ...RD, ...(S.cfg.rc || {}) });
  const okEdit = () => isAdmin() || !S.users.length;
  const rSecs = m => m == 'all' ? ['topup', 'phones', 'glass', 'pochette', 'acc'] : [m];
  window.reportSectionFilter = 'all'; window.RLV = null;

  window.rcSet = o => { if (!okEdit()) return toast('للمدير فقط'); upd(() => { S.cfg.rc = { ...(S.cfg.rc || {}), ...o }; }); };
  window.rcHide = k => { const h = rcf().hs.slice(), i = h.indexOf(k); i < 0 ? h.push(k) : h.splice(i, 1); rcSet({ hs: h }); };
  window.rcTt = () => { if (!okEdit()) return toast('للمدير فقط'); ask('عنوان التقرير', [{ k: 't', l: 'العنوان (فارغ = بدون عنوان)', v: rcf().tt }]).then(v => { if (v) rcSet({ tt: v.t.trim() }); }); };
  window.rcFt = () => { if (!okEdit()) return toast('للمدير فقط'); ask('عبارة آخر التقرير', [{ k: 't', l: 'مثال: شكراً — فارغ = بدون عبارة', v: rcf().ft }]).then(v => { if (v) rcSet({ ft: v.t.trim() }); }); };

  /* إدخال كمية مخصصة يدوياً (#) للأنتي كاس ومجموعات الإكسسوارات من التقرير */
  window.rcManual = (fnName, arg) => {
    if (fnName == 'agBuy' && typeof agCnt == 'function') return agCnt(arg);
    if (fnName == 'buyG') {
      const i0 = find(arg), g = i0 ? S.gg.find(x => x.id == i0.gid) : S.gg.find(x => x.id == arg);
      if (!g) return;
      const ty = i0 ? i0.ty : ((S.tags.glass && S.tags.glass[0]) || 'عادي');
      ask('شراء أنتي كاس ' + ty + ' — ' + g.models.join(' / '), [{ k: 'n', l: 'الكمية الإجمالية التي وصلت للمجموعة', t: 'tel', v: String(gLim(i0 || gitem(g.id, ty), ty)) }], 'تم الشراء').then(v => {
        const n = v && ci(v.n); if (!n) return;
        commit('تم شراء أنتي كاس (+' + n + ')', () => {
          const i = i0 || glGet(g.id, ty), m0 = g.models[0];
          i.stock = i.stock || {};
          g.models.forEach(m => { if (i.lv) delete i.lv[m]; });
          i.stock[m0] = (i.stock[m0] || 0) + n;
          touch(i, 1);
        });
        if (typeof reqChk == 'function') reqChk(g.models.join(' '), 1);
      });
      return;
    }
    if (typeof window[fnName] == 'function') window[fnName](arg);
  };

  /* الشراء السريع بضغطة واحدة من التقرير (عند تفعيل خيار qb في إعدادات التقرير) */
  window.rcQuick = (fnName, arg) => {
    if (fnName == 'buyP') {
      const i = find(arg); if (!i) return;
      const add = Math.max(1, phLim(i) + 1 - av(i));
      commit('تم الشراء (+' + add + '): ' + i.brand + ' ' + i.name, () => { i.cnt += add; touch(i, 1); });
      if (typeof reqChk == 'function') reqChk(i.brand + ' ' + i.name);
    } else if (fnName == 'buyC') {
      const i = find(arg); if (!i) return;
      const badG = typeof csGStats == 'function' ? csGStats(i).filter(x => x.st != 'g') : [];
      commit('تم شراء بوشيط ' + i.name + ' (+3)', () => {
        if (badG.length && badG[0].g != 'عام') {
          badG.forEach(b => {
            const vars = (i.v || []).filter(x => x.g == b.g);
            if (!vars.length) { i.v = i.v || []; i.v.push({ id: uid(), g: b.g, c: '', n: 3 }); }
            else {
              const z = vars.filter(x => x.n <= 0);
              (z.length ? z : [vars[0]]).forEach(x => x.n += 3);
            }
          });
        } else {
          const z = (i.v || []).filter(x => x.n <= 0), t = z.length ? z : (i.v || []);
          t.forEach(x => x.n += 3);
        }
        i.need = ''; touch(i, 1);
      });
      if (typeof reqChk == 'function') reqChk('بوشيط ' + i.name);
    } else if (fnName == 'buyA') {
      const i = find(arg); if (!i) return;
      if (typeof i.cnt == 'number') {
        const add = Math.max(1, acLim(i) + 2 - i.cnt);
        commit('تم الشراء (+' + add + '): ' + acTitle(i), () => { i.cnt += add; touch(i, 1); });
      } else {
        commit('تم الشراء: ' + acTitle(i), () => { i.st = 'g'; touch(i, 1); });
      }
      if (typeof reqChk == 'function') reqChk(acName(i));
    } else if (fnName == 'tpFix') {
      const p = String(arg || '').split('_'), op = p[1], k = p[2] ? p[2][0] : '', n = p[2] ? +p[2].slice(1) : 0;
      if (k == 'c') {
        const c = (S.cfg && S.cfg.tp) || {}, cl = (c.cl && c.cl[n]) ?? 3, gm = (c.gm && c.gm[n]) ?? (c.gv ?? 15);
        const v = Math.max(gm, cl + 1);
        S.tp = S.tp || [];
        let r = S.tp.find(x => x.id == arg);
        const prev = r ? JSON.stringify(r) : null;
        if (!r) { r = { id: arg, op, k: 'c', n }; S.tp.push(r); }
        r.val = v; r.est = 1; r.at = r.cf = Date.now(); r.by = S.me || '';
        save(); render();
        toast('تم توفير بطاقة ' + n + ' (' + op + ')', () => {
          if (prev) Object.assign(r, JSON.parse(prev));
          else S.tp = S.tp.filter(x => x.id != arg);
        });
      } else if (typeof tpFix == 'function') tpFix(arg);
    } else if (fnName == 'buyG' && typeof buyG == 'function') buyG(arg);
    else if (fnName == 'agBuy' && typeof agBuy == 'function') agBuy(arg);
  };

  const lines = () => { const c = rcf(); let L = invLines(!!c.pn).concat(typeof tpLines == 'function' ? tpLines() : []); if ((window.RLV || c.lv) == 'r') L = L.filter(x => x[2] == 'r'); return L; };
  const secs = m => rSecs(m).filter(k => !rcf().hs.includes(k));
  const dstr = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear(); };
  const rpLine = () => {
    const i = S.rp.filter(x => x.st == 'in').length, d = S.rp.filter(x => x.st == 'rd');
    const ok = d.filter(x => x.res != 'fail' && x.res != 'ref').length, nf = d.length - ok;
    const late = d.filter(x => Date.now() - (x.t1 || x.t0) > 15 * 864e5).length;
    return i || d.length ? 'الصيانة: ' + i + ' في المحل · ' + ok + ' جاهز للتسليم' + (nf ? ' · ' + nf + ' لم يصلح' : '') + (late ? ' (منسي ' + late + ')' : '') : '';
  };
  const dbLine = () => { const n = (S.debt || []).filter(x => !x.paid).length; return n ? 'ديون مفتوحة: ' + n : ''; };
  const sentToday = () => { const x = S.cfg.rs; return !!(x && x.t && new Date(x.t).toDateString() == new Date().toDateString()); };
  window.rcMark = () => { S.cfg.rs = { t: Date.now(), by: S.me }; save(); };
  window.rcSend = () => { rcMark(); location.href = 'https://wa.me/?text=' + encodeURIComponent(generateReportText(window.reportSectionFilter)); };
  window.rcCopy = () => navigator.clipboard.writeText(generateReportText(window.reportSectionFilter)).then(() => { rcMark(); render(); toast('تم النسخ'); }).catch(() => toast('تعذّر النسخ'));
  const sentLine = () => { const x = S.cfg.rs; if (!x || !x.t) return ['لم يُرسل التقرير بعد', 1]; const t = sentToday(), d = new Date(x.t), p = n => String(n).padStart(2, '0'); return ['آخر إرسال: ' + (t ? 'اليوم ' + p(d.getHours()) + ':' + p(d.getMinutes()) : fd(x.t)) + (x.by ? ' — ' + x.by : ''), !t]; };
  const cnt = (a, n) => n == '0' ? ' — نفد' : ' — العدد ' + a + n;
  const fmtT = x => {
    let s = x[1].replace(/\s—\s(?:العدد |المجموع |المتوفر )(≈?)(\d+)/, (m, a, n) => cnt(a, n)).replace(/\s—\s(\d+)$/, (m, n) => cnt('', n));
    if (x[2] == 'r' && !/نفد/.test(s)) s += ' — نفد'; return s;
  };
  const blocks = mode => {
    const c = rcf(), L = lines(), out = [];
    secs(mode).forEach(k => {
      const ls = L.filter(x => x[0] == RSEC[k][0]).sort((a, b) => (a[2] == 'r' ? 0 : 1) - (b[2] == 'r' ? 0 : 1));
      out.push({ k, t: RSEC[k][1], ls: ls.map(x => ({ r: x[2] == 'r', s: k == 'topup' ? x[1] : fmtT(x), x })) });
    });
    if (c.rq && mode == 'all') out.push({ k: 'req', t: 'طلبات الزبائن', ls: S.req.map(q => ({ r: 0, s: q.t, id: q.id })) });
    return out;
  };
  const bd = s => {
    if (!/[A-Za-z]/.test(s)) return s;
    const w = s.replace(/[A-Za-z0-9][A-Za-z0-9+\-\/.#&' ]*/g, m => { if (!/[A-Za-z]/.test(m)) return m; const q = m.replace(/\s+$/, ''); return '\u200E' + q + '\u200E' + m.slice(q.length); });
    return s.charAt(0) == '*' ? w : '\u200F' + w + '\u200F';
  };
  window.generateReportText = function (mode = 'all') {
    const c = rcf(), B = blocks(mode), o = [], N = B.filter(b => b.k != 'req');
    const need = N.reduce((a, b) => a + b.ls.length, 0), red = N.reduce((a, b) => a + b.ls.filter(x => x.r).length, 0);
    const head = [c.tt ? '*' + c.tt + '*' : '', c.dt ? dstr() : ''].filter(Boolean).join(' — '); if (head) o.push(head);
    o.push(need ? 'المطلوب: ' + need + (red ? ' (نافد ' + red + ')' : '') : 'لا يوجد نقص حالياً');
    { const W = N.filter(b => b.ls.length); if (W.length > 1) o.push(W.map(b => b.t.split(' ')[0] + b.ls.length).join('  ·  ')); }
    if (c.rr) { const x = rpLine(); if (x) o.push(x); }
    if (c.rd) { const x = dbLine(); if (x) o.push(x); }
    { const stl = rnd().length; if (stl) o.push('تنبيه: ' + stl + ' صنف لم يُؤكَّد منذ أكثر من ' + lim('stale') + ' أيام'); }
    B.forEach(b => { if (!b.ls.length && !c.em) return; o.push(''); o.push('*' + b.t + '*'); if (b.ls.length) b.ls.forEach(x => o.push((b.k == 'req' ? '- ' : x.r ? '🔴 ' : '🟠 ') + x.s)); else o.push('- لا نقص'); });
    if ((mode == 'all' || mode == 'phones') && c.st && !c.hs.includes('phones')) {
      const s = stkL();
      if (s.length) { o.push(''); o.push('*الهواتف المتوفرة*'); s.forEach(i => o.push('- ' + stkN(i) + ' — ' + i.cnt + (rsQ(i) ? ' (محجوز ' + rsQ(i) + ')' : '') + (c.pr && i.price ? ' — ' + dh(i.price) : ''))); }
    }
    if (c.ft) { o.push(''); o.push(c.ft); }
    return o.map(bd).join('\n');
  };

  /* ---------- شاشة التقرير ---------- */
  const nwCnt = h => h.replace(/((?:—\s*)?العدد\s*[0-9٠-٩]+)\s*$/, '<span style="white-space:nowrap">$1</span>');
  const SECI = { topup: 'ctopup', phones: 'cphone', glass: 'cglass', pochette: 'ccase', acc: 'cacc' };
  const secT = b => (SECI[b.k] ? I(SECI[b.k]) + ' ' : '') + esc(String(b.t).replace(/^[^\u0600-\u06FFA-Za-z0-9]+/, ''));
  const rrow = l => {
    const c = rcf(), act = l.x[3] || '';
    const m = act.match(/^([a-zA-Z]+)\('([^']*)'\)$/);
    const fn = m ? m[1] : '', arg = m ? m[2] : '';
    const isGrp = fn == 'buyG' || fn == 'agBuy';
    const hasPrompt = fn == 'buyP' || fn == 'buyC' || fn == 'buyA' || isGrp || (fn == 'tpFix' && arg.includes('_c'));
    const mainClick = c.qb && hasPrompt ? `rcQuick('${fn}','${arg}')` : act;
    const showNumBtn = isGrp || (c.qb && hasPrompt);
    const askBtn = showNumBtn ? `<button class="rck s" title="إدخال الكمية يدوياً" onclick="rcManual('${fn}','${arg}')">${I('hash')}</button>` : '';
    return `<div class="rrow ${l.x[2] == 'r' ? 'r' : ''}"><span class="dotl" style="background:${DT[l.x[2]]}"></span><span class="rt">${nwCnt(esc(l.s))}</span>${askBtn}<button class="rck" aria-label="تم الشراء" onclick="${mainClick}">${I('check')}</button></div>`;
  };
  VW.rep = () => {
    const c = rcf(), s = stkL(), lv = window.RLV || c.lv, f = window.reportSectionFilter;
    const tabs = RTABS.filter(([k]) => k == 'all' || !c.hs.includes(k));
    if (!tabs.some(([k]) => k == f)) window.reportSectionFilter = 'all';
    const F = window.reportSectionFilter, B = blocks(F);
    const AL = invLines(!!c.pn).concat(typeof tpLines == 'function' ? tpLines() : []).filter(x => secs('all').some(k => RSEC[k][0] == x[0])), red = AL.filter(x => x[2] == 'r').length, yel = AL.length - red, sl = sentLine();
    let h = `<div class="qbar rsum"><div class="qpill al"><div class="qn">${red}</div><div class="ql">نافد</div></div><div class="qpill wn"><div class="qn">${yel}</div><div class="ql">قارب النفاد</div></div><div class="qpill ${S.req.length ? 'rp' : 'ok'}"><div class="qn">${S.req.length}</div><div class="ql">طلبات الزبائن</div></div></div>`
      + `<div class="rsent ${sl[1] ? 'w' : ''}">${esc(sl[0])}</div>`;
    if (c.rr) { const x = rpLine(); if (x) h += `<div class="card row2">${I('tool')}<span style="flex:1">${esc(x)}</span><button class="btn s sm" onclick="go('rp')">افتح</button></div>`; }
    if (c.rd) { const x = dbLine(); if (x) h += `<div class="card row2">${I('wallet')}<span style="flex:1">${esc(x)}</span><button class="btn s sm" onclick="go('dbt')">افتح</button></div>`; }
    h += `<div class="sec-panel">`
      + `<div class="sec-tags">${tabs.map(([k, l]) => `<button class="tag ${F === k ? 'on' : ''}" onclick="reportSectionFilter='${k}';render()">${l}</button>`).join('')}</div>`
      + `<div class="sec-toolbar"><div class="seg-group"><button type="button" class="seg-btn ${lv == 'a' ? 'on' : ''}" onclick="RLV='a';render()">نافد وقارب</button><button type="button" class="seg-btn ${lv == 'r' ? 'on' : ''}" onclick="RLV='r';render()">نافد فقط</button></div><button type="button" class="tool-pill" onclick="go('st_rep')">${I('sl')} تخصيص</button></div>`
      + `</div>`;
    { const stl = rnd().length; if (stl) h += `<div class="card row2"><span style="flex:1">${I('alert')} ${stl} صنف لم يُؤكَّد منذ أكثر من ${lim('stale')} أيام</span><button class="btn sm" onclick="go('jl')">افتح الجولة</button></div>`; }
    B.forEach(b => {
      let x = '';
      if (b.k == 'req') x = b.ls.map(l => {
        const ph = typeof rqTel == 'function' ? rqTel(l.s) : '';
        return `<div class="rrow col"><div class="row2"><span class="rt">${esc(l.s)}</span><button class="btn s sm" onclick="rqD('${l.id}')">مسح</button></div>${ph ? `<div class="sub"><a href="tel:${esc(ph)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">${I('phone')} اتصال</a><button class="btn sm" onclick="rqWA('${l.id}')">${I('send')} إبلاغ واتساب</button></div>` : ''}</div>`;
      }).join('');
      else {
        const ex = EXP['r_' + b.k], L = !ex && b.ls.length > 6 ? b.ls.slice(0, 5) : b.ls;
        x = L.map(rrow).join('') + (b.ls.length > 6 ? `<button class="tag" style="width:100%;justify-content:center;margin:6px 0 0" onclick="toggleExp('r_${b.k}')">${ex ? 'طيّ ▴' : 'عرض الباقي (+' + (b.ls.length - 5) + ') ▾'}</button>` : '');
      }
      if (x) h += `<h3 class="sch" style="--sc:${SCOL[b.k] || '#64748b'}">${secT(b)} <span class="m">(${b.ls.length})</span></h3><div class="card rlist sx" style="--sc:${SCOL[b.k] || '#64748b'}">${x}</div>`; else if (c.em) h += `<h3>${secT(b)}</h3><p class="m">لا نقص</p>`;
    });
    if ((F == 'all' || F == 'phones') && c.st && !c.hs.includes('phones') && s.length)
      h += '<h3>الهواتف المتوفرة</h3><div class="card rlist">' + s.map(i => `<div class="rrow"><span class="rt">${esc(stkN(i))}</span><span class="m">${i.cnt}${rsQ(i) ? ' (محجوز ' + rsQ(i) + ')' : ''}${c.pr && i.price ? ' · ' + esc(dh(i.price)) : ''}</span></div>`).join('') + '</div>';
    if (!h.includes('<h3')) h += emptyBox('لا يوجد نقص في المخزون حالياً ✓', 'جميع الأصناف متوفرة فوق الحد المطلوب');
    h += `<details class="card" style="margin-top:14px"><summary><b>معاينة النص</b></summary><div style="white-space:pre-wrap;margin-top:8px;line-height:1.8">${esc(generateReportText(F))}</div></details>`
      + `<div class="rbar"><button class="btn" onclick="rcSend()">${I('send')} إرسال بالواتساب</button><button class="btn s" onclick="rcCopy()">نسخ</button></div>`;
    return { t: 'التقرير اليومي', h };
  };

  /* ---------- إعدادات التقرير ---------- */
  const yn = v => v ? 'نعم' : 'لا', tog = (l, k) => row(l, 'rcSet({' + k + ':' + (rcf()[k] ? 0 : 1) + '})', yn(rcf()[k]));
  window.rcRh = () => { if (!okEdit()) return toast('للمدير فقط'); ask('ساعة بدء التذكير', [{ k: 'h', l: 'من 0 إلى 23 (مثال: 16)', v: String(rcf().rh) }]).then(v => { const h = v && parseInt(v.h, 10); if (h >= 0 && h <= 23) rcSet({ rh: h }); }); };
  window.rcNd = i => { const n = rcf().nd.slice(), k = n.indexOf(i); k < 0 ? n.push(i) : n.splice(k, 1); rcSet({ nd: n }); };
  VW.st_rep = () => {
    const c = rcf();
    return {
      t: 'إعدادات التقرير', h: '<p class="m">هذه الإعدادات تحدد ما يظهر في التقرير ونصّ الواتساب، وتنطبق على كل الأجهزة.</p>'
        + '<h3>استلام السلعة من التقرير</h3>'
        + tog('زر (✓) في التقرير: شراء سريع بضغطة واحدة', 'qb')
        + '<p class="m" style="margin:2px 8px 12px;font-size:.8rem">عند تفعيله: ضغطة واحدة على (✓) تعتمد الكمية الافتراضية فوراً، ويظهر بجانبه زر (#) لمن أراد كتابة عدد مخصص.</p>'
        + '<h3>العنوان والتوقيع</h3>' + row('عنوان التقرير', 'rcTt()', c.tt || 'بدون') + tog('إظهار التاريخ بجانب العنوان', 'dt') + row('عبارة في آخر التقرير', 'rcFt()', c.ft || 'بدون')
        + '<h3>ما الذي يُدرج</h3>' + tog('قائمة الهواتف المتوفرة', 'st') + tog('أسعار الهواتف المتوفرة', 'pr') + tog('طلبات الزبائن', 'rq') + tog('ملاحظات البوشيط (باقي / خاصنا)', 'pn') + tog('إظهار الأقسام التي لا نقص فيها', 'em')
        + '<h3>أسطر إضافية في التقرير</h3>' + tog('سطر الصيانة (في المحل / جاهز / لم يصلح / منسي)', 'rr') + tog('سطر الديون المفتوحة', 'rd')
        + '<h3>تذكير الإرسال</h3>' + tog('تذكير في الرئيسية إن لم يُرسل التقرير اليوم', 'rm') + row('ساعة بدء التذكير', 'rcRh()', c.rh + ':00')
        + '<p class="m">أيام بلا تذكير:</p><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">' + ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((n, i) => `<button class="tag ${c.nd.includes(i) ? 'on' : ''}" onclick="rcNd(${i})">${n}</button>`).join('') + '</div>'
        + '<h3>الجولة اليومية</h3>' + row('يُعتبر الصنف غير مؤكد بعد (أيام)', "limEd('stale')", lim('stale') + ' يوم')
        + '<h3>المستوى الافتراضي</h3><div style="display:flex;gap:6px;margin-bottom:10px"><button class="tag ' + (c.lv == 'a' ? 'on' : '') + '" onclick="rcSet({lv:\'a\'})">النافد وقارب النفاد</button><button class="tag ' + (c.lv == 'r' ? 'on' : '') + '" onclick="rcSet({lv:\'r\'})">النافد فقط</button></div>'
        + '<h3>الأقسام الظاهرة في التقرير</h3>' + RTABS.filter(([k]) => k != 'all').map(([k, l]) => row(l, "rcHide('" + k + "')", yn(!c.hs.includes(k)))).join('')
        + `<div style="margin-top:14px"><button class="btn s" onclick="rcSet({lv:'a',tt:'تقرير محل عزيز',dt:1,st:1,pr:0,rq:1,pn:1,em:0,ft:'',hs:[],rr:0,rd:0,rm:1,nd:[],rh:16,qb:0})">إرجاع الإعدادات الافتراضية</button></div>`
    };
  };
  window.rcSkip = () => sure('لن يُرسل تقرير اليوم؟ سيختفي التذكير حتى الغد.', 'نعم، لا تقرير اليوم', false).then(ok => {
    if (!ok) return;
    S.cfg.rx = new Date().toDateString(); save(); render();
    toast('أُلغي تذكير اليوم', () => { delete S.cfg.rx; });
  });
  HOME.top.push(() => {
    const c = rcf(), d = new Date();
    if (!c.rm || (typeof noRem == 'function' && noRem()) || sentToday() || c.nd.includes(d.getDay()) || d.getHours() < c.rh || S.cfg.rx == d.toDateString()) return '';
    return `<div class="card row2">${I('alert')}<span style="flex:1">لم يُرسل تقرير اليوم بعد</span><button class="btn sm" onclick="go('rep')">افتح التقرير</button><button class="btn s sm" aria-label="لا تقرير اليوم" onclick="rcSkip()">✕</button></div>`;
  });
  MORE.push({ g: 'rep', o: 10, l: 'إعدادات التقرير', d: 'ما يظهر في التقرير ونص الواتساب، الشراء السريع، وتذكير الإرسال', fn: "go('st_rep')" });
})();
