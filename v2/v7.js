/* ===== 1. وسوم الأعطال والماركات + الاقتراح التلقائي للسعر + كشف الجهاز الراجع ===== */
TG.fault = 'أعطال الصيانة';
S.tags.fault = S.tags.fault || ['تغيير شاشة', 'كونكتور الشحن', 'بطارية', 'مشكلة شبكة', 'سقط في الماء', 'صوت / مايك', 'سوفتوير', 'تغيير ظهر'];

const _rForm7 = rForm;
rForm = function(rec) {
  _rForm7(rec);
  const vInp = $('r_v'), fInp = $('r_f'), cInp = $('r_c');
  if (vInp) {
    vInp.insertAdjacentHTML('beforebegin', `<div id="rp_br_tags" style="margin-bottom:6px">${S.tags.brand.map(b => `<button type="button" class="tag" onclick="pickRpBrand('${esc(b)}')">${esc(b)}</button>`).join('')}</div>`);
    vInp.insertAdjacentHTML('afterend', `<div id="rp_dev_hist" class="m" style="color:#d97706;font-weight:700"></div>`);
    vInp.addEventListener('input', () => { checkDeviceHistory(); suggestGuidePrice(); });
  }
  if (fInp) {
    fInp.insertAdjacentHTML('beforebegin', `<div id="rp_fl_tags" style="margin-bottom:6px">${S.tags.fault.map(f => `<button type="button" class="tag" onclick="pickRpFault('${esc(f)}')">${esc(f)}</button>`).join('')}</div>`);
    fInp.addEventListener('input', suggestGuidePrice);
  }
  if (cInp) {
    cInp.insertAdjacentHTML('afterend', `<div id="rp_price_hint" style="margin-top:4px"></div>`);
  }
  checkDeviceHistory();
  suggestGuidePrice();
};

function pickRpBrand(b) {
  const el = $('r_v');
  if (!el) return;
  const cur = el.value.trim();
  el.value = cur ? (cur.startsWith(b) ? cur : b + ' ' + cur) : b + ' ';
  el.focus();
  checkDeviceHistory();
  suggestGuidePrice();
}

function pickRpFault(f) {
  const el = $('r_f');
  if (!el) return;
  let parts = el.value.split('،').map(s => s.trim()).filter(Boolean);
  if (parts.includes(f)) parts = parts.filter(x => x !== f);
  else parts.push(f);
  el.value = parts.join('، ');
  suggestGuidePrice();
}

function suggestGuidePrice() {
  const dev = nz(($('r_v') || {}).value || '');
  const flt = nz(($('r_f') || {}).value || '');
  const box = $('rp_price_hint');
  if (!box) return;
  if (!dev && !flt) { box.innerHTML = ''; return; }

  const matches = (S.guide || []).filter(g => {
    const gm = nz(g.m), gf = nz(g.f);
    const mMatch = dev && (dev.includes(gm) || gm.includes(dev));
    const fMatch = flt && (flt.includes(gf) || gf.includes(flt));
    return (mMatch && fMatch) || (dev.length > 2 && mMatch && !flt);
  }).slice(0, 3);

  if (matches.length) {
    box.innerHTML = matches.map(g =>
      `<button type="button" class="tag on" style="margin-top:4px" onclick="$('r_c').value='${esc(g.p)}'">💡 السعر في الدليل (${esc(g.m)} - ${esc(g.f)}): ${esc(g.p)} د — اضغط لوضعه</button>`
    ).join('');
  } else {
    box.innerHTML = '';
  }
}

function checkDeviceHistory() {
  const dev = nz(($('r_v') || {}).value || '');
  const box = $('rp_dev_hist');
  if (!box) return;
  if (dev.length < 3) { box.textContent = ''; return; }

  const recent = S.rp.filter(r => r != ZR && r.st == 'dn' && nz(r.dev).includes(dev) && (Date.now() - (r.t2 || 0)) < 14 * 864e5);
  if (recent.length) {
    const last = recent[recent.length - 1];
    const days = Math.floor((Date.now() - last.t2) / 864e5);
    box.textContent = `⚠️ تنبيه: جهاز مشابه (${last.dev} — ${last.name}) سُلّم منذ ${days || 'أقل من'} يوم (${last.tst ? 'جُرِّب مع الزبون ✅' : 'بدون توثيق تجربة'})`;
  } else {
    box.textContent = '';
  }
}

/* ===== 2. زر اتصال مباشر + توثيق التجربة مع الزبون في البطاقة ===== */
const _rc7 = rc;
rc = function(r) {
  let h = _rc7(r);
  if (r.tel) {
    const callBtn = `<a href="tel:${esc(r.tel)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">📞 اتصال</a>`;
    h = h.replace('<div class="sub">', `<div class="sub">${callBtn}`);
  }
  if (r.st == 'dn') {
    const badge = r.tst
      ? `<div class="m" style="color:#16a34a;font-weight:700">✅ جُرِّب مع الزبون وسُلِّم مصلوحاً (${esc(r.dby || '')})</div>`
      : (r.res == 'ok' ? `<div class="m">سُلِّم بدون توثيق التجربة</div>` : '');
    const dnoteHtml = r.dnote ? `<div class="m">ملاحظة التسليم: ${esc(r.dnote)}</div>` : '';
    h = h.replace('<div class="sub">', badge + dnoteHtml + '<div class="sub">');
  }
  return h;
};

rDV = function(id) {
  const r = rf(id);
  const def = r.res == 'ok' && sn1(r.cap) ? r.cap.trim() : '';
  const fields = [
    { k: 'p', l: def ? 'هل المبلغ المقبوض هو ' + def + ' ؟ عدّله إن اختلف' : 'المبلغ المقبوض (0 إن لم يُقبض شيء)', t: 'tel', v: def }
  ];
  if (r.res == 'ok') {
    fields.unshift({
      k: 'tested',
      l: 'تأكيد التجربة مع الزبون قبل التسليم',
      t: 'sel',
      o: ['نعم، جُرِّب مع الزبون وسُلِّم مصلوحاً وشغالاً', 'سُلِّم بدون تجربة مع الزبون'],
      v: 'نعم، جُرِّب مع الزبون وسُلِّم مصلوحاً وشغالاً'
    });
  }
  fields.push({ k: 'dnote', l: 'ملاحظة عند التسليم (اختياري)', v: r.dnote || '' });

  ask('تسليم الهاتف: ' + r.name, fields, 'تأكيد التسليم', false).then(v => {
    if (!v) return;
    commit('تم التسليم', () => {
      r.st = 'dn';
      r.t2 = Date.now();
      r.dby = S.me;
      r.paid = v.p.trim() || '0';
      r.tst = v.tested && v.tested.startsWith('نعم') ? Date.now() : 0;
      r.dnote = (v.dnote || '').trim();
      r.pat = [];
      r.lock = '';
    });
  });
};

rWA = function(id, k) {
  const r = rf(id);
  const c = sn1(r.cap) ? ' تكلفة الإصلاح: ' + r.cap.trim() + (r.dep ? '، العربون: ' + r.dep : '') + '.' : '';
  const chks = r.chk || [];
  const isDeadOrBroken = chks.includes('مطفأ لا يشتغل') || chks.includes('شاشة مكسورة');
  const legalNote = (!k && isDeadOrBroken)
    ? '\n*(ملاحظة: استُلم الجهاز بشاشة مكسورة/منطفئ مما يتعذر معه فحص باقي الوظائف كالكاميرا والشبكة قبل الإصلاح)*.'
    : '';

  const s = k
    ? (r.res == 'ok' ? `هاتفك ${r.dev} جاهز في المحل.${c}` : r.res == 'fail' ? `للأسف تعذّر إصلاح هاتفك ${r.dev}. يمكنك استلامه من المحل.` : `هاتفك ${r.dev} جاهز للاستلام بدون إصلاح.`)
    : `استلمنا هاتفك ${r.dev} (${r.fault}).${r.dep ? ' العربون: ' + r.dep + '.' : ''} سنبلغك عند جاهزيته.${legalNote}`;

  location.href = 'https://wa.me/' + rnum(r.tel) + '?text=' + encodeURIComponent(`مرحباً ${r.name}، ${s}\nشكراً لثقتكم.`);
};

function buyPart(id) {
  const r = rf(id);
  if (!r) return;
  commit('وصلت القطعة ✓', () => { r.part = ''; r.lb = S.me; });
}

/* ===== 3. قسم التقرير اليومي المنظم والمرتب حسب الأقسام الأربعة المطلوبة ===== */
let reportSectionFilter = 'all';

function getReportData() {
  const phonesOut = ph().filter(p => pst(p) !== 'g');
  
  const glassOut = [];
  GM().forEach(g => S.tags.glass.forEach((t, idx) => {
    const i = gitem(g.id, t);
    if (i && gSt(i, g) !== 'g') glassOut.push({ g, t, i, idx });
  }));

  const pochettesOut = S.items.filter(i => i.sec === 'case' && csSt(i) !== 'g');
  const accOut = S.items.filter(i => i.sec === 'acc' && acSt(i) !== 'g');
  const repairsOut = S.rp.filter(r => r.st === 'in' && r.part);
  const reqOut = S.req;

  return { phonesOut, glassOut, pochettesOut, accOut, repairsOut, reqOut };
}

function generateReportText(mode = 'all') {
  const d = getReportData();
  const o = [`📋 *تقرير المحل (${new Date().toLocaleDateString('ar-MA')})*`, ''];

  if (mode === 'all' || mode === 'phones') {
    const s = stkL();
    if (s.length && mode === 'all') {
      o.push('*📱 الهواتف المتوفرة حالياً*');
      s.forEach(i => o.push('• ' + stkN(i) + ' — العدد ' + i.cnt + (i.price ? ' (' + i.price + ' د)' : '')));
      o.push('');
    }
    if (d.phonesOut.length || mode === 'phones') {
      o.push('*📱 قسم الهواتف النافدة*');
      if (d.phonesOut.length) d.phonesOut.forEach(p => o.push('🔴 ' + [p.brand, p.name, p.color, p.cap].filter(Boolean).join(' ') + ' — الكمية: ' + p.cnt));
      else o.push('✅ لا توجد هواتف نافدة');
      o.push('');
    }
  }

  if (mode === 'all' || mode === 'glass') {
    o.push('*🛡️ قسم زجاج الحماية (الأنتي كاس)*');
    if (d.glassOut.length) d.glassOut.forEach(x => o.push((x.i.st == 'r' ? '🔴 ' : '🟡 ') + x.t + ': ' + x.g.models.join(' / ') + (x.i.note ? ' — ' + x.i.note : '')));
    else o.push('✅ الأنتي كاس مكتمل');
    o.push('');
  }

  if (mode === 'all' || mode === 'pochette') {
    o.push('*📲 قسم البوشيط (Cases)*');
    if (d.pochettesOut.length) d.pochettesOut.forEach(p => o.push((p.st == 'r' ? '🔴 ' : '🟡 ') + p.name + (p.rem ? ' — باقي: ' + p.rem : '') + (p.need ? ' — خاصنا: ' + p.need : '')));
    else o.push('✅ البوشيط مكتمل');
    o.push('');
  }

  if (mode === 'all' || mode === 'acc') {
    o.push('*🔌 قسم الإكسسوارات الأخرى*');
    if (d.accOut.length || d.repairsOut.length || (mode === 'all' && d.reqOut.length)) {
      if (d.accOut.length) d.accOut.forEach(a => o.push((a.st == 'r' ? '🔴 ' : '🟡 ') + acName(a) + (typeof a.cnt == 'number' ? ' — العدد ' + a.cnt : '') + (a.note ? ' — ' + a.note : '')));
      if (d.repairsOut.length) d.repairsOut.forEach(r => o.push('🔧 قطعة صيانة: ' + r.part + ' (' + r.dev + ')'));
      if (mode === 'all' && d.reqOut.length) d.reqOut.forEach(q => o.push('🗣️ طلب زبون: ' + q.t));
    } else {
      o.push('✅ الإكسسوارات مكتملة');
    }
    o.push('');
  }

  return o.join('\n').trim();
}

VW.rep = function() {
  const d = getReportData();
  const tabs = [
    ['all', '📋 التقرير الشامل'],
    ['phones', '📱 الهواتف'],
    ['glass', '🛡️ الأنتي كاس'],
    ['pochette', '📲 البوشيط'],
    ['acc', '🔌 الإكسسوارات']
  ];

  let contentHtml = '';

  // فلتر الأقسام العلوي داخل التقرير
  const filterBar = `<div style="margin-bottom:12px; display:flex; gap:6px; overflow-x:auto">${tabs.map(([k, l]) => `<button class="tag ${reportSectionFilter === k ? 'on' : ''}" onclick="reportSectionFilter='${k}';render()">${l}</button>`).join('')}</div>`;

  if (reportSectionFilter === 'all' || reportSectionFilter === 'phones') {
    const s = stkL();
    if (s.length && reportSectionFilter === 'all') {
      contentHtml += `<h3>📱 الهواتف المتوفرة حالياً</h3>` + s.map(i => `<div class="card row2"><span style="flex:1">${esc(stkN(i))}</span><span class="m">${i.cnt}${i.price ? ' · ' + esc(i.price) : ''}</span></div>`).join('');
    }
    contentHtml += `<h3>📱 قسم الهواتف النافدة</h3>` + (d.phonesOut.map(p => `
      <div class="card row2">
        <span class="dotl" style="background:${DT[pst(p)]}"></span>
        <span style="flex:1"><b>${esc([p.brand, p.name, p.color, p.cap].filter(Boolean).join(' '))}</b> — العدد: ${p.cnt}</span>
        <button class="btn sm" onclick="buyP('${p.id}')">تم الشراء</button>
      </div>
    `).join('') || '<p class="m">لا هواتف نافدة.</p>');
  }

  if (reportSectionFilter === 'all' || reportSectionFilter === 'glass') {
    contentHtml += `<h3>🛡️ قسم زجاج الحماية (الأنتي كاس)</h3>` + (d.glassOut.map(x => `
      <div class="card row2">
        <span class="dotl" style="background:${DT[x.i.st]}"></span>
        <span style="flex:1"><b>${esc(x.t)}</b>: ${esc(x.g.models.join(' / '))} ${x.i.note ? '— ' + esc(x.i.note) : ''}</span>
        <button class="btn sm" onclick="buyG('${x.i.id}')">تم الشراء</button>
      </div>
    `).join('') || '<p class="m">الأنتي كاس مكتمل.</p>');
  }

  if (reportSectionFilter === 'all' || reportSectionFilter === 'pochette') {
    contentHtml += `<h3>📲 قسم البوشيط</h3>` + (d.pochettesOut.map(p => `
      <div class="card row2">
        <span class="dotl" style="background:${DT[p.st]}"></span>
        <span style="flex:1"><b>بوشيط ${esc(p.name)}</b> ${p.rem ? '— باقي: ' + esc(p.rem) : ''} ${p.need ? '<br><span class="rs">خاصنا: ' + esc(p.need) + '</span>' : ''}</span>
        <button class="btn sm" onclick="buyC('${p.id}')">تم الشراء</button>
      </div>
    `).join('') || '<p class="m">البوشيط مكتمل.</p>');
  }

  if (reportSectionFilter === 'all' || reportSectionFilter === 'acc') {
    contentHtml += `<h3>🔌 قسم الإكسسوارات وقطع الصيانة</h3>` + (
      d.accOut.map(a => `
        <div class="card row2">
          <span class="dotl" style="background:${DT[a.st]}"></span>
          <span style="flex:1"><b>${esc(acName(a))}</b> ${a.note ? '— ' + esc(a.note) : ''}</span>
          <button class="btn sm" onclick="buyA('${a.id}')">تم الشراء</button>
        </div>
      `).join('') +
      d.repairsOut.map(r => `
        <div class="card row2">
          <span class="dotl" style="background:#f59e0b"></span>
          <span style="flex:1">🔧 قطعة صيانة: <b>${esc(r.part)}</b> <span class="m">(${esc(r.dev)})</span></span>
          <button class="btn sm" onclick="buyPart('${r.id}')">تم الشراء</button>
        </div>
      `).join('') +
      (reportSectionFilter === 'all' ? d.reqOut.map((req, idx) => `
        <div class="card row2">
          <span style="flex:1">🗣️ طلب زبون: <b>${esc(req.t)}</b></span>
          <button class="btn s sm" onclick="db.requests.splice(${idx},1);save();render()">مسح</button>
        </div>
      `).join('') : '') || '<p class="m">الإكسسوارات والصيانة مكتملة.</p>'
    );
  }

  return {
    t: 'التقرير اليومي',
    h: filterBar + contentHtml + `
      <div style="margin-top:20px; display:flex; gap:10px;">
        <button class="btn" style="flex:1" onclick="location.href='https://wa.me/?text='+encodeURIComponent(generateReportText(reportSectionFilter))">📲 إرسال القسم بالواتساب</button>
        <button class="btn s" onclick="navigator.clipboard.writeText(generateReportText(reportSectionFilter)).then(()=>toast('تم النسخ'))">نسخ النص</button>
      </div>
    `
  };
};

/* ===== 4. ملاحظة سريعة للبوشيط (شنو باقي / شنو خاصنا) ===== */
const _csCard7 = csCard;
csCard = function(i) {
  let h = _csCard7(i);
  const info = (i.rem ? `<div class="m">🟢 باقي: ${esc(i.rem)}</div>` : '') + (i.need ? `<div class="rs">🔴 خاصنا: ${esc(i.need)}</div>` : '');
  h = h.replace('<div class="sub">', info + `<div class="sub"><button class="btn s sm" onclick="csQuickNote('${i.id}')">باقي / خاصنا</button>`);
  return h;
};

function csQuickNote(id) {
  const i = find(id);
  ask('بوشيط ' + i.name, [
    { k: 'rem', l: 'شنو باقي عندنا فالمحل؟ (مثال: غير النسائي)', v: i.rem || '' },
    { k: 'need', l: 'شنو خاص يجيب المعلم؟ (مثال: ألوان رجالية / كحل)', v: i.need || '' }
  ]).then(v => {
    if (!v) return;
    commit('تم التحديث', () => {
      i.rem = v.rem.trim();
      i.need = v.need.trim();
      i.by = S.me;
      i.at = Date.now();
    });
  });
}

render();
