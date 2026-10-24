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

// التحسين (2): الربط التلقائي بين "دليل أسعار الإصلاح" و"استلام هاتف"
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

// التحسين (4): كشف الجهاز الراجع (نفس الموديل سُلّم مؤخراً)
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
  // التحسين (1): زر اتصال مباشر واضح بجانب أزرار التحكم
  if (r.tel) {
    const callBtn = `<a href="tel:${esc(r.tel)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">📞 اتصال</a>`;
    h = h.replace('<div class="sub">', `<div class="sub">${callBtn}`);
  }
  // شارة التجربة عند التسليم
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

/* ===== 3. التحسين (6): تنبيه قانوني تلقائي في وصل الواتساب للهاتف المنطفئ أو المكسور ===== */
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

/* ===== 4. التحسين (3) و (5): فلاتر نسخ التقرير حسب تاجر الجملة + زر تم الشراء الفوري ===== */
// جعل شراء البوشيط في التقرير بضغطة واحدة أو عدد اختياري، وتفعيل شراء قطع الصيانة
function buyPart(id) {
  const r = rf(id);
  if (!r) return;
  commit('وصلت القطعة ✓', () => { r.part = ''; r.lb = S.me; });
}

function repTxtBySupplier(mode) {
  // mode: 'all' | 'parts' (تاجر البياس والشاشات) | 'acc' (تاجر الأنتي كاس والبوشيط والإكسسوارات) | 'phones' (تاجر الهواتف)
  const L = repLines(), o = [];
  if (mode == 'all' || mode == 'phones') {
    const s = stkL();
    if (s.length && mode == 'all') o.push('*الهواتف المتوفرة*', ...s.map(i => '• ' + stkN(i) + ' — العدد ' + i.cnt + (i.price ? ' — ' + i.price : '')), '');
    const phOut = L.filter(x => x[0] == 'الهواتف الناقصة');
    if (phOut.length) {
      o.push('*الهواتف الناقصة*');
      phOut.forEach(x => o.push((x[2] == 'r' ? '🔴 ' : '🟡 ') + x[1]));
      o.push('');
    }
  }
  if (mode == 'all' || mode == 'parts') {
    const parts = S.rp.filter(r => r.st == 'in' && r.part).map(r => '🔧 ' + r.part + ' (' + r.dev + ')');
    if (parts.length) {
      o.push('*قطع غيار الصيانة المطلوبة*');
      o.push(...parts, '');
    }
  }
  if (mode == 'all' || mode == 'acc') {
    ['الأنتي كاس', 'البوشيط', 'الإكسسوارات'].forEach(k => {
      const sub = L.filter(x => x[0] == k);
      if (sub.length) {
        o.push('*' + k + '*');
        sub.forEach(x => o.push((x[2] == 'r' ? '🔴 ' : '🟡 ') + x[1]));
        o.push('');
      }
    });
  }
  if (mode == 'all' && S.req.length) {
    o.push('*طلبات الزبائن*');
    S.req.forEach(r => o.push('🗣️ ' + r.t));
  }
  return o.join('\n').trim() || 'لا توجد نواقص في هذا القسم';
}

function copySupplierReport(mode, label) {
  const txt = repTxtBySupplier(mode);
  navigator.clipboard.writeText(txt).then(() => toast('تم نسخ: ' + label));
}

const _rep7 = VW.rep;
VW.rep = function() {
  const o = _rep7();
  // إضافة زر "تم الشراء" لقطع غيار الصيانة
  S.rp.filter(r => r.st == 'in' && r.part).forEach(r => {
    const oldHtml = `<div class="card">قطعة: ${esc(r.part)} <span class="m">(${esc(r.dev)} — ${esc(r.name)})</span></div>`;
    const newHtml = `<div class="card row2"><span style="flex:1">🔧 قطعة: <b>${esc(r.part)}</b> <span class="m">(${esc(r.dev)} — ${esc(r.name)})</span></span><button class="btn sm" onclick="buyPart('${r.id}')">تم الشراء</button></div>`;
    o.h = o.h.replace(oldHtml, () => newHtml);
  });

  // أزرار النسخ السريع حسب تاجر الجملة في أعلى التقرير
  const supplierBtns = `
    <div class="card">
      <b>📋 نسخ مخصص حسب تاجر الجملة:</b>
      <div class="sub">
        <button class="btn s sm" onclick="copySupplierReport('parts','قائمة قطع الصيانة')">🔧 تاجر البياس (قطع الصيانة)</button>
        <button class="btn s sm" onclick="copySupplierReport('acc','قائمة الزجاج والبوشيط والإكسسوار')">📲 تاجر الأنتي كاس والإكسسوار</button>
        <button class="btn s sm" onclick="copySupplierReport('phones','قائمة الهواتف الناقصة')">📱 تاجر الهواتف</button>
      </div>
    </div>`;
  o.h = supplierBtns + o.h;
  return o;
};

/* ===== 5. ملاحظة سريعة للبوشيط (شنو باقي / شنو خاصنا) ===== */
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
