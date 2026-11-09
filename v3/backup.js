/* ============================================================
   backup.js — النسخ الاحتياطي والاستعادة والنسخ التلقائي
   يُحمَّل بعد users.js وقبل app.js.
   ============================================================ */

/* ---------- النسخ الاحتياطي ---------- */
const NOADM = { t: 'للمدير فقط', h: '<p class="m">هذه الصفحة للمدير فقط.</p>' };
async function bkKey(pin) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: new TextEncoder().encode('aziz-bk-v1'), iterations: 150000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function bkEncObj(obj, pin) {
  const key = await bkKey(pin), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj))));
  const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
  let s = ''; for (let i = 0; i < out.length; i += 8192)s += String.fromCharCode.apply(null, out.subarray(i, i + 8192));
  return btoa(s);
}
async function bkDecObj(b64, pin) {
  const key = await bkKey(pin), u = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, key, u.subarray(12));
  return JSON.parse(new TextDecoder().decode(pt));
}
async function makeSafeBackupJson(pinOrHash) {
  const copy = bkCopy();
  const resMap = {}, upins = {};
  (copy.items || []).forEach(i => { if (i.res) { resMap[i.id] = i.res; delete i.res; } });
  (copy.users || []).forEach(u => { if (u.pin) { upins[u.name] = u.pin; delete u.pin; } });
  const CC = ['rp', 'used', 'debt'];
  const custData = { rp: copy.rp || [], req: copy.req || [], used: copy.used || [], debt: copy.debt || [], res: resMap, upins, trash: (copy.trash || []).filter(t => CC.includes(t.coll)) };
  copy._at = Date.now(); copy._n = bkSize(copy);
  copy._encCust = await bkEncObj(custData, pinOrHash);
  copy.rp = []; copy.req = []; copy.used = []; copy.debt = []; copy.trash = (copy.trash || []).filter(t => !CC.includes(t.coll));
  delete copy.pin; if (copy.cfg) delete copy.cfg.lk;
  return JSON.stringify(copy);
}

let AB_T = 0, AB_FH = null;
function bkCopy() { return JSON.parse(JSON.stringify(S, function (k, v) { return (k === 'img' && typeof v === 'string' && v.startsWith('data:') && this.id) ? 'idb:' + this.id : v; })); }
const bkSize = d => (d.items || []).length + (d.rp || []).length + (d.gg || []).length + (d.tp || []).length + (d.used || []).length + (d.debt || []).length;
function bkPrune(pre, n) { AUTOBK.all().then(all => Object.keys(all).filter(k => k.startsWith(pre)).sort().reverse().slice(n).forEach(k => AUTOBK.del(k))).catch(() => { }); }
function snapPre() {
  if (!S.users.length) return Promise.resolve();
  return AUTOBK.put('pre:' + Date.now(), { at: Date.now(), data: bkCopy() }).then(() => bkPrune('pre:', 3)).catch(() => { });
}
function schedAutoBk() {
  clearTimeout(AB_T);
  AB_T = setTimeout(async () => {
    try {
      if (!S.users.length) return;
      const rec = { at: Date.now(), data: bkCopy() }, d = new Date(), p = n => String(n).padStart(2, '0');
      await AUTOBK.put('latest', rec);
      const k = 'd:' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
      if (!(await AUTOBK.get(k))) { await AUTOBK.put(k, rec); bkPrune('d:', 7); }
      if (AB_FH && S.pin) { const w = await AB_FH.createWritable(); await w.write(await makeSafeBackupJson(S.pin)); await w.close(); }
    } catch (e) { errLog('نسخة تلقائية: ' + (e && e.message || e)); }
  }, 5000);
}
HK.saved.push(schedAutoBk);
async function linkAutoFile() {
  if (!isAdmin()) return toast('للمدير فقط');
  if (!window.showSaveFilePicker) return toast('متصفحك يعتمد الحفظ التلقائي الداخلي');
  try {
    AB_FH = await window.showSaveFilePicker({ suggestedName: 'aziz-shop-auto-backup.json', types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
    AUTOBK.put('fh', AB_FH).catch(() => {});
    schedAutoBk(); render(); toast('تم ربط ملف الحفظ التلقائي بنجاح');
  } catch (e) { }
}
AUTOBK.get('fh').then(async h => {
  if (h && h.queryPermission && (await h.queryPermission({ mode: 'readwrite' })) === 'granted') AB_FH = h;
}).catch(() => {});

function restSnap(key) {
  if (!isAdmin()) return toast('للمدير فقط');
  AUTOBK.get(key).then(rec => {
    if (!rec || !rec.data) return toast('لا توجد هذه النسخة');
    sure('استعادة نسخة ' + fd(rec.at) + ' (' + bkSize(rec.data) + ' سجلاً)؟ يُحفظ وضعك الحالي أولاً كنسخة «قبل استعادة».', 'استعادة').then(y => {
      if (y) snapPre().then(() => { LOAD_BAD = 0; S = { ...load(), ...rec.data }; save(); location.reload(); });
    });
  }).catch(() => toast('تعذر قراءة النسخة'));
}
VW.st_snap = () => !isAdmin() ? NOADM : ({ t: 'النسخ التلقائية', h: '<p class="m">نسخ داخل الهاتف تُحفظ تلقائياً. الصور لا تدخل فيها. لا تغني عن ملف النسخة الأسبوعي.</p><div id="snl" class="m">جارٍ التحميل…</div>', a: snapList });
function snapList() {
  AUTOBK.all().then(all => {
    const L = Object.keys(all).filter(k => all[k] && all[k].data).sort((x, y) => all[y].at - all[x].at);
    const nm = k => k == 'latest' ? 'آخر حفظ' : k.startsWith('d:') ? 'يومية' : 'قبل استعادة';
    const el = $('snl'); if (!el) return;
    el.innerHTML = L.map(k => { const r = all[k]; return `<div class="card row2"><div style="flex:1"><b>${nm(k)}</b><div class="m"><bdi>${fd(r.at)}</bdi> · ${bkSize(r.data)} سجلاً</div></div><button class="btn s sm" onclick="restSnap('${k}')">استعادة</button></div>`; }).join('') || 'لا توجد نسخ بعد';
  }).catch(() => { const el = $('snl'); if (el) el.textContent = 'تعذر قراءة النسخ'; });
}
function BKP() {
  if (!isAdmin()) return toast('النسخ الاحتياطي للمدير فقط');
  ask('تأكيد رمز المدير لتشفير بيانات الزبائن', [{ k: 'p', l: 'رمز المدير (سيُستخدم لتشفير بيانات الزبائن في النسخة)', t: 'password' }], 'حفظ النسخة').then(async v => {
    if (!v || !v.p) return;
    if (!hv(v.p, S.pin)) return toast('رمز المدير خاطئ');
    try {
      const js = await makeSafeBackupJson(v.p), a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([js], { type: 'application/json' }));
      a.download = 'aziz-shop-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click(); S.cfg.lb = Date.now(); save(); render();
    } catch (e) { toast('تعذر إنشاء النسخة'); }
  });
}
function RST(f) {
  if (!f) return;
  if (!isAdmin()) return toast('الاستعادة للمدير فقط');
  const r = new FileReader();
  r.onload = async () => {
    let d;
    try { d = JSON.parse(r.result); if (!d.users) throw 0; } catch (e) { return toast('ملف غير صالح'); }
    let w = '';
    try {
      const lt = await AUTOBK.get('latest'), fa = d._at || f.lastModified || 0, la = (lt && lt.at) || 0, nc = bkSize(S);
      if (fa && la && fa < la - 36e5) w += ' ⚠ هذه النسخة أقدم من بيانات الجهاز (نسخة ' + fd(fa) + ' · آخر تعديل هنا ' + fd(la) + ') وسيضيع كل ما أُضيف بعدها.';
      if (d._n != null && d._n < nc) w += ' ⚠ النسخة فيها ' + d._n + ' سجلاً والجهاز فيه ' + nc + '.';
    } catch (e) { }
    if (!(await sure('استبدال كل البيانات الحالية بالنسخة؟' + w + ' تُحفظ بياناتك الحالية أولاً كنسخة «قبل استعادة».', 'استعادة'))) return;
    const pre = snapPre();
    if (!d._encCust) { await pre; S = { ...load(), ...d }; save(); location.reload(); return; }
    const v = await ask('فك تشفير بيانات الزبائن', [{ k: 'p', l: 'أدخل رمز المدير الذي حُفظت به النسخة', t: 'password' }], 'فك التشفير والاستعادة');
    if (!v || !v.p) return;
    try {
      let cust;
      try { cust = await bkDecObj(d._encCust, v.p); } catch (e1) { try { cust = await bkDecObj(d._encCust, hs(v.p)); } catch (e2) { cust = await bkDecObj(d._encCust, hsL(v.p)); } }
      delete d._encCust;
      d.rp = cust.rp || []; d.req = cust.req || []; d.used = cust.used || []; d.debt = cust.debt || [];
      (d.items || []).forEach(i => { if (cust.res && cust.res[i.id]) i.res = cust.res[i.id]; });
      if (cust.upins) (d.users || []).forEach(u => { if (cust.upins[u.name]) u.pin = cust.upins[u.name]; });
      d.trash = [...(d.trash || []), ...(cust.trash || [])];
      d.pin = d.pin || S.pin;
      if (S.cfg && S.cfg.lk) d.cfg = { ...(d.cfg || {}), lk: S.cfg.lk };
      await pre; S = { ...load(), ...d }; save(); location.reload();
    } catch (e) { toast('الرمز خاطئ، تعذر فك تشفير بيانات الزبائن'); }
  };
  r.readAsText(f);
}
function abStatus() {
  AUTOBK.get('latest').then(r => {
    const el = $('st_ab'); if (!el) return;
    const old = !r || Date.now() - r.at > 2 * 864e5;
    el.innerHTML = r ? (old ? I('alert') + ' آخر نسخة تلقائية قديمة: <bdi>' + fd(r.at) + '</bdi>' : I('check') + ' آخر نسخة تلقائية: <bdi>' + fd(r.at) + '</bdi>') : I('alert') + ' لا توجد نسخة تلقائية بعد';
    if (old) el.style.color = '#dc2626';
  }).catch(() => { const el = $('st_ab'); if (el) { el.innerHTML = I('alert') + ' تعذر قراءة النسخ التلقائية'; el.style.color = '#dc2626'; } });
}
VW.st_bk = () => {
  if (!isAdmin()) return NOADM;
  const n = (localStorage.getItem('shop3') || '').length, p = Math.round(n / 5e4), er = JSON.parse(localStorage.getItem('shopErr') || '[]');
  return {
    t: 'النسخ الاحتياطي',
    h: '<p class="m">يتم تشفير بيانات الزبائن الحساسة (الصيانة، الطلبات، الحجوزات، ورموز الموظفين) داخل ملف النسخة الاحتياطية لحمايتها من التسريب.</p>'
      + '<button class="btn" onclick="BKP()">حفظ ملف النسخة في الهاتف (محمي)</button>'
      + (window.showSaveFilePicker ? `<button class="btn s" onclick="linkAutoFile()">${AB_FH ? I('check') + ' مرتبط بملف تلقائي (اضغط لتغييره)' : 'ربط ملف حفظ تلقائي مباشر بالهاتف'}</button>` : '')
      + '<button class="btn s" onclick="go(\'st_snap\')">النسخ التلقائية الداخلية (آخر 7 أيام)</button>'
      + '<button class="btn s" onclick="$(\'rst_f\').click()">استعادة من ملف خارجي</button><input id="rst_f" type="file" accept=".json,application/json" hidden onchange="RST(this.files[0]);this.value=\'\'">'
      + `<h3>المساحة المستعملة</h3><div class="card"><div class="row2"><b>${p}%</b><span class="m">${(n / 1e6).toFixed(1)} مليون حرف من نحو 5</span></div><div class="meter"><div style="width:${Math.min(100, p)}%;background:${p > 70 ? '#dc2626' : 'var(--p)'}"></div></div>${p > 70 ? '<p class="m">اقتربت المساحة من الامتلاء. خذ نسخة احتياطية الآن.</p>' : ''}</div>`
      + `<div class="card"><b>خزنة الصور (IndexedDB)</b><div class="m">صور الصيانة والمستعمل المحفوظة خارج ذاكرة المتصفح الضيقة: <b>${Object.keys(IMG).length}</b> (لا تستهلك من حد الـ 5 ميجابايت).</div></div>`
      + '<div id="st_ab" class="m" style="margin:8px 0"></div>'
      + (er.length ? '<h3>آخر الأخطاء (للتشخيص)</h3>' + er.map(x => `<div class="m">${esc(x)}</div>`).join('') : '')
    , a: abStatus
  };
};

