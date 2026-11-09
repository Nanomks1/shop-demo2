/* ============================================================
   invcolor.js — الألوان: اقتراح ألوان الموديل أولاً + قراءة اللون من الصورة (كاميرا داخل التطبيق)
   يُحمَّل بعد barcode.js (يستعمل camErr) ويعتمد على csHex من invpochette.js.
   ============================================================ */

/* ---------- اقتراح الألوان لكل موديل (تظهر أولاً بعلامة ★) ---------- */
const colTop = cnt => Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 4);
function colSugPh() {   // الهواتف: ألوان نفس الموديل المسجلة سابقاً، وإلا الأكثر استعمالاً
  const el = $('pm'), n = nz(el ? el.value : ''), b = FS.v.brand, mine = {}, all = {};
  ph().forEach(i => {
    if (!i.color) return;
    all[i.color] = (all[i.color] || 0) + 1;
    if (n && nz(i.name) == n && (!b || i.brand == b)) mine[i.color] = (mine[i.color] || 0) + 1;
  });
  const m = colTop(mine);
  return m.length ? { t: 'سبق لهذا الموديل', a: m } : { t: 'الأكثر استعمالاً', a: colTop(all) };
}
function colSugCs(id) {   // البوشيط: ألوان الموديل (الأقل مخزوناً أولاً)، وإلا الأكثر استعمالاً
  const i = id ? find(id) : null, own = i ? (csN(i).v || []).filter(x => x.c).sort((a, b) => a.n - b.n).map(x => x.c) : [];
  if (own.length) return { t: 'ألوان هذا الموديل', a: own };
  const all = {};
  S.items.forEach(x => { if (x.sec == 'case') (x.v || []).forEach(y => { if (y.c) all[y.c] = (all[y.c] || 0) + 1; }); });
  return { t: 'الأكثر استعمالاً', a: colTop(all) };
}
let CRT = 0;
function colRef() { clearTimeout(CRT); CRT = setTimeout(() => { if ($('cc')) chipsR(); }, 250); }   // تحديث الاقتراح أثناء كتابة الموديل

/* ---------- اللون من الصورة ---------- */
const COL_BASE = ['أسود', 'أبيض', 'فضي', 'رمادي', 'أزرق', 'كحلي', 'سماوي', 'تركوازي', 'أخضر', 'أصفر', 'ذهبي', 'برتقالي', 'أحمر', 'وردي', 'بنفسجي', 'ليلكي', 'بني', 'بيج'];
function colLab(c) {
  const f = v => { v /= 255; return v > .04045 ? Math.pow((v + .055) / 1.055, 2.4) : v / 12.92; };
  const R = f(c[0]), G = f(c[1]), B = f(c[2]), h = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const x = h((R * .4124 + G * .3576 + B * .1805) / .95047), y = h(R * .2126 + G * .7152 + B * .0722), z = h((R * .0193 + G * .1192 + B * .9505) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}
const colRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
/* أقرب 3 ألوان لقيمة RGB: من ألوان المحل المعروفة، ومن الأساسية الجديدة إن سُمح بإضافة وسوم */
function colNear(rgb) {
  const L0 = colLab(rgb), seen = new Set(), out = [];
  const add = (n, isNew) => {
    const h = csHex(n), k = nz(n);
    if (!/^#[0-9a-f]{6}$/i.test(h) || seen.has(k)) return; seen.add(k);
    const L1 = colLab(colRgb(h)), d = Math.hypot(.6 * (L0[0] - L1[0]), L0[1] - L1[1], L0[2] - L1[2]);
    out.push({ n, h, d, isNew });
  };
  S.tags.color.forEach(n => add(n, false));
  if (can('tags')) COL_BASE.forEach(n => add(n, true));
  return out.sort((a, b) => a.d - b.d).slice(0, 3);
}
let CCS = null, COLC = [];
function colCamStop() { if (CCS) { CCS.getTracks().forEach(t => t.stop()); CCS = null; } const o = $('colcam'); if (o) o.remove(); }
HK.hide.push(colCamStop);
function colCam() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return toast('الكاميرا غير متاحة في هذا المتصفح');
  colCamStop();
  const o = document.createElement('div'); o.id = 'colcam'; o.className = 'colcam';
  o.innerHTML = `<div class="cc-box"><video id="colv" autoplay playsinline muted></video><div class="cc-aim"></div></div>`
    + `<div class="cc-res" id="colres"><p class="m">ضع لون الهاتف أو الغطاء داخل المربع، ثم اضغط «التقاط اللون». تجنّب انعكاس الضوء.</p></div>`
    + `<div class="cc-acts"><button type="button" class="btn s" onclick="colCamStop()">إغلاق</button><button type="button" class="btn" onclick="colShot()">التقاط اللون</button></div>`;
  document.body.appendChild(o);
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
    if (!$('colcam')) { s.getTracks().forEach(t => t.stop()); return; }
    CCS = s; $('colv').srcObject = s;
  }).catch(e => { colCamStop(); toast(camErr(e), 0, 15000); });
}
function colShot() {
  const v = $('colv'), aim = document.querySelector('#colcam .cc-aim');
  if (!v || !aim || !v.videoWidth) return toast('الكاميرا لم تجهز بعد');
  const vr = v.getBoundingClientRect(), ar = aim.getBoundingClientRect();
  const sc = Math.max(vr.width / v.videoWidth, vr.height / v.videoHeight), side = Math.max(8, Math.round(ar.width / sc));
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(v, v.videoWidth / 2 - side / 2, v.videoHeight / 2 - side / 2, side, side, 0, 0, 16, 16);
  const d = x.getImageData(0, 0, 16, 16).data, px = [];
  for (let k = 0; k < d.length; k += 4) px.push([d[k], d[k + 1], d[k + 2], d[k] * .299 + d[k + 1] * .587 + d[k + 2] * .114]);
  px.sort((p, q) => p[3] - q[3]);
  const use = px.slice(0, Math.ceil(px.length * .85)), rgb = [0, 1, 2].map(k => Math.round(use.reduce((s, p) => s + p[k], 0) / use.length));   // نتجاهل ألمع 15% (انعكاس الضوء)
  COLC = colNear(rgb);
  $('colres').innerHTML = `<div class="row2" style="gap:10px"><span class="cc-sw" style="background:rgb(${rgb.join(',')})"></span><b style="flex:1">اللون الملتقط — اختر الأقرب:</b></div>`
    + (COLC.length ? `<div>${COLC.map((c, k) => `<button type="button" class="tag" onclick="colPick(${k})"><span class="cc-sw s" style="background:${c.h}"></span>${esc(c.n)}${c.isNew ? ' (جديد)' : ''}</button>`).join('')}</div>` : '<p class="m">لا توجد ألوان معروفة للمقارنة: أضف ألواناً بأسماء شائعة (أسود، أبيض، أزرق...) من الإعدادات.</p>');
}
function colPick(k) {
  const c = COLC[k]; if (!c) return;
  if (!S.tags.color.includes(c.n)) {
    if (!can('tags')) return toast('إضافة لون جديد للمدير فقط');
    S.tags.color.push(c.n); if (typeof tagSort == 'function') tagSort(S.tags.color, 'color'); save();
  }
  FS.v.color = c.n; colCamStop(); chipsR();
}
