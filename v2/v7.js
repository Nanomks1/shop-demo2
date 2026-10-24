/* ===== 1. وسوم الأعطال والماركات السريعة في استلام الصيانة ===== */
TG.fault = 'أعطال الصيانة';
S.tags.fault = S.tags.fault || ['تغيير شاشة', 'كونكتور الشحن', 'بطارية', 'مشكلة شبكة', 'سقط في الماء', 'صوت / مايك', 'سوفتوير', 'تغيير ظهر'];

const _rForm7 = rForm;
rForm = function(rec) {
  _rForm7(rec);
  const vInp = $('r_v'), fInp = $('r_f');
  if (vInp) {
    vInp.insertAdjacentHTML('beforebegin', `<div id="rp_br_tags" style="margin-bottom:6px">${S.tags.brand.map(b => `<button type="button" class="tag" onclick="pickRpBrand('${esc(b)}')">${esc(b)}</button>`).join('')}</div>`);
  }
  if (fInp) {
    fInp.insertAdjacentHTML('beforebegin', `<div id="rp_fl_tags" style="margin-bottom:6px">${S.tags.fault.map(f => `<button type="button" class="tag" onclick="pickRpFault('${esc(f)}')">${esc(f)}</button>`).join('')}</div>`);
  }
};

function pickRpBrand(b) {
  const el = $('r_v');
  if (!el) return;
  const cur = el.value.trim();
  el.value = cur ? (cur.startsWith(b) ? cur : b + ' ' + cur) : b + ' ';
  el.focus();
}

function pickRpFault(f) {
  const el = $('r_f');
  if (!el) return;
  let parts = el.value.split('،').map(s => s.trim()).filter(Boolean);
  if (parts.includes(f)) parts = parts.filter(x => x !== f);
  else parts.push(f);
  el.value = parts.join('، ');
}

/* ===== 2. توثيق التجربة مع الزبون وتسليمه مصلوحاً في الأرشيف ===== */
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

const _rc7 = rc;
rc = function(r) {
  let h = _rc7(r);
  if (r.st == 'dn') {
    const badge = r.tst
      ? `<div class="m" style="color:#16a34a;font-weight:700">✅ جُرِّب مع الزبون وسُلِّم مصلوحاً (${esc(r.dby || '')})</div>`
      : (r.res == 'ok' ? `<div class="m">سُلِّم بدون توثيق التجربة</div>` : '');
    const dnoteHtml = r.dnote ? `<div class="m">ملاحظة التسليم: ${esc(r.dnote)}</div>` : '';
    h = h.replace('<div class="sub">', badge + dnoteHtml + '<div class="sub">');
  }
  return h;
};

/* ===== 3. زر "تم الشراء" لقطع غيار الصيانة داخل التقرير ===== */
const _rep7 = VW.rep;
VW.rep = function() {
  const o = _rep7();
  S.rp.filter(r => r.st == 'in' && r.part).forEach(r => {
    const oldHtml = `<div class="card">قطعة: ${esc(r.part)} <span class="m">(${esc(r.dev)} — ${esc(r.name)})</span></div>`;
    const newHtml = `<div class="card row2"><span style="flex:1">🔧 قطعة: <b>${esc(r.part)}</b> <span class="m">(${esc(r.dev)} — ${esc(r.name)})</span></span><button class="btn sm" onclick="buyPart('${r.id}')">تم الشراء</button></div>`;
    o.h = o.h.replace(oldHtml, () => newHtml);
  });
  return o;
};

function buyPart(id) {
  const r = rf(id);
  if (!r) return;
  commit('وصلت القطعة', () => { r.part = ''; r.lb = S.me; });
}

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
