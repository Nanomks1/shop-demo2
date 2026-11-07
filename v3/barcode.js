/* ============================================================
   barcode.js — الباركود و IMEI والبيع السريع المتتالي
   يُحمَّل بعد invround.js.
   ============================================================ */

/* ============================ الباركود و IMEI والبيع السريع المتتالي ============================ */
let BS = null, BI = 0, BCODE = '', BDP = null, BC_AC = null, BC_LAST = { c: '', t: 0 };
const BCX = [], BCM = [];   // ملف الصيانة والمستعمل يضيفان أزراراً (BCX) ونتائج مطابقة (BCM)
function bcStop() { clearInterval(BI); if (BS) { BS.getTracks().forEach(t => t.stop()); BS = null; } }

/* نغمة صوتية قصيرة (Beep) + اهتزاز لمسي خفيف عند المسح بدون ملفات صوتية خارجية */
function bcBeep(ok = true) {
  if (typeof vib == 'function') vib(ok ? 35 : [40, 60, 40]);
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    BC_AC = BC_AC || new Ctx(); if (BC_AC.state === 'suspended') BC_AC.resume();
    const o = BC_AC.createOscillator(), g = BC_AC.createGain();
    o.type = ok ? 'sine' : 'triangle';
    o.frequency.value = ok ? 920 : 320;
    g.gain.setValueAtTime(0.16, BC_AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, BC_AC.currentTime + (ok ? 0.09 : 0.18));
    o.connect(g); g.connect(BC_AC.destination);
    o.start(); o.stop(BC_AC.currentTime + (ok ? 0.09 : 0.18));
  } catch (e) { }
}

let BDX = null;
function loadPoly() {   // ماسح بديل (للمتصفحات التي لا تدعم المسح الأصلي مثل Brave)
  if (window.BarcodeDetectorPolyfill) return Promise.resolve(true);
  if (BDP) return BDP;
  return BDP = new Promise(res => {
    const s = document.createElement('script'); s.src = 'https://fastly.jsdelivr.net/npm/barcode-detector@2.3.1/dist/iife/pure.min.js';
    s.onload = () => res(!!window.BarcodeDetectorPolyfill); s.onerror = () => { BDP = null; res(false); }; document.head.appendChild(s);
  });
}
async function bdNew() {   // الأصلي إن كان يعمل فعلاً، وإلا البديل
  if (BDX) return BDX;
  if ('BarcodeDetector' in window && !window.BarcodeDetectorPolyfill) {
    try { const t = new window.BarcodeDetector(), c = document.createElement('canvas'); c.width = c.height = 8; await t.detect(c); return BDX = t; } catch (e) { }
  }
  if (await loadPoly()) { try { return BDX = new window.BarcodeDetectorPolyfill(); } catch (e) { } }
  return null;
}
function camErr(e) {   // سبب فشل الكاميرا بكلام مفهوم
  const n = (e && e.name) || '';
  if (!window.isSecureContext) return 'الكاميرا تحتاج رابطاً آمناً (https)';
  if (n == 'NotAllowedError' || n == 'SecurityError' || n == 'PermissionDeniedError') return 'الكاميرا محظورة: اسمح بها من إعدادات الموقع في المتصفح، ومن إعدادات أندرويد ← التطبيقات ← المتصفح ← الأذونات ← الكاميرا';
  if (n == 'NotFoundError' || n == 'OverconstrainedError') return 'لم يتم العثور على كاميرا في هذا الجهاز';
  if (n == 'NotReadableError' || n == 'AbortError') return 'الكاميرا مشغولة بتطبيق آخر، أغلقه وأعد المحاولة';
  return 'تعذر فتح الكاميرا' + (n ? ' (' + n + ')' : '');
}
async function bcScan(cb, onContinuous) {
  if (!BDX) toast('جارٍ تجهيز ماسح الباركود...');
  const d = await bdNew();
  if (!d || !navigator.mediaDevices) return toast('تعذّر تجهيز ماسح الباركود: تحقق من الاتصال بالإنترنت ثم أعد المحاولة', 0, 12000);
  BC_LAST = { c: '', t: 0 };
  const qMode = bcQ();
  $('sh').innerHTML = `<div class="bar"></div><h3>${qMode ? I('zap') + ' البيع السريع المتتالي (−1)' : 'وجّه الكاميرا نحو الباركود'}</h3>`
    + (qMode ? `<div class="m" style="margin-bottom:6px">تبقى الكاميرا مفتوحة لخصم عدة سلع متتالية</div>` : '')
    + `<video id="bcv" autoplay playsinline muted style="width:100%;border-radius:14px"></video><div id="bc_log" style="margin-top:8px"></div><button class="btn s" onclick="finish(null)">إغلاق</button>`;
  sheetOpen(v => { bcStop(); if (v) cb(v); });
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
    if (!SH) { s.getTracks().forEach(t => t.stop()); return; } BS = s; const v = $('bcv'); v.srcObject = s;
    BI = setInterval(() => {
      d.detect(v).then(r => {
        if (!r[0] || !BS) return;
        const c = String(r[0].rawValue || '').trim(); if (!c) return;
        if (BC_LAST.c === c && Date.now() - BC_LAST.t < 2200) return;   // منع تكرار المسح لنفس العلبة خلال ثانيتين
        BC_LAST = { c, t: Date.now() };
        if (onContinuous && onContinuous(c)) return;   // استمرار الكاميرا في وضع البيع السريع
        bcStop(); finish(c);
      }).catch(() => { });
    }, 350);
  }).catch(e => { if (SH) finish(null); toast(camErr(e), 0, 15000); });
}
let INL = null, INT = 0;
function stopInlineScan() { clearInterval(INT); if (INL) { INL.getTracks().forEach(t => t.stop()); INL = null; } const b = $('inline_bc_box'); if (b) b.remove(); }
async function scanIntoInput(inputId) {   // مسح داخل نموذج مفتوح (حقل IMEI)
  if ($('inline_bc_box')) return stopInlineScan(); const inp = $(inputId); if (!inp) return;
  const det = await bdNew(); if (!det || !navigator.mediaDevices) return toast('تعذّر تجهيز ماسح الباركود: تحقق من الاتصال بالإنترنت ثم أعد المحاولة', 0, 12000);
  (inp.closest('label') || inp.parentElement).insertAdjacentHTML('afterend', '<div id="inline_bc_box" class="card" style="margin:8px 0;padding:10px;text-align:center"><div class="m" style="margin-bottom:6px">وجّه الكاميرا نحو باركود IMEI على العلبة أو الشاشة (*#06#)</div><video id="inline_bcv" autoplay playsinline muted style="width:100%;max-height:190px;object-fit:cover;border-radius:10px"></video><button type="button" class="btn s sm" style="margin-top:8px;width:100%" onclick="stopInlineScan()">إلغاء المسح</button></div>');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(st => {
    const v = $('inline_bcv'); if (!v) { st.getTracks().forEach(t => t.stop()); return; } INL = st; v.srcObject = st;
    INT = setInterval(() => { det.detect(v).then(c => { if (c && c[0] && INL) { const val = String(c[0].rawValue || '').trim(); if (val) { const cur = inp.value.trim(); inp.value = cur && !cur.includes(val) ? cur + ' · ' + val : val; bcBeep(true); stopInlineScan(); toast('تم التقاط الرمز: ' + val); } } }).catch(() => { }); }, 350);
  }).catch(e => { stopInlineScan(); toast(camErr(e), 0, 15000); });
}
HK.hide.push(() => { stopInlineScan(); bcStop(); });
const bcLbl = i => i.sec == 'phones' ? i.brand + ' ' + i.name : i.sec == 'case' ? i.name : acName(i);
const isImei = c => /^\d{14,17}$/.test(c);

/* اختيار سريع للون/نوع البوشيط عند البيع السريع بالباركود إذا كان له عدة ألوان متوفرة */
function bcPickCsVar(it) {
  const avs = (it.v || []).filter(x => x.n > 0);
  if (!avs.length) return toast('نفد هذا البوشيط بالفعل');
  setTimeout(() => {
    $('sh').innerHTML = `<div class="bar"></div><h3>بيع سريع (−1): بوشيط ${esc(it.name)}</h3><p class="m">اختر النوع/اللون الذي بيع:</p>`
      + avs.map(x => `<button class="btn s" onclick="finish('${x.id}')">${esc([x.g, x.c].filter(Boolean).join(' · ') || 'عام')} (المتوفر: ${x.n})</button>`).join('')
      + `<button class="btn s" onclick="finish(null)">إلغاء</button>`;
    sheetOpen(vid => {
      if (!vid) return;
      const v = (it.v || []).find(x => x.id == vid); if (!v || v.n <= 0) return;
      const lbl = [v.g, v.c].filter(Boolean).join(' · ') || 'عام';
      commit(`بيع سريع (−1): بوشيط ${it.name} (${lbl})`, () => { v.n = Math.max(0, v.n - 1); touch(it); S.cfg.bcQuick = Date.now(); });
    });
  }, 180);
}

/* تنفيذ البيع السريع (-1) عند مسح باركود صنف واحد موجود */
function bcQuickSell(it) {
  if (it.sec == 'phones') {
    if (av(it) <= 0) return !toast('لا توجد قطع متاحة للبيع من ' + bcLbl(it));
    commit('بيع سريع (−1): ' + bcLbl(it) + ' ← بقي ' + (it.cnt - 1), () => { it.cnt = Math.max(0, it.cnt - 1); touch(it); });
    return true;
  } else if (it.sec == 'acc') {
    if (typeof it.cnt == 'number') {
      if (it.cnt <= 0) return !toast('العدد 0 بالفعل في ' + bcLbl(it));
      commit('بيع سريع (−1): ' + bcLbl(it) + ' ← بقي ' + (it.cnt - 1), () => { it.cnt = Math.max(0, it.cnt - 1); touch(it); });
      return true;
    } else {
      toast('هذا الإكسسوار بدون عدد رقمي — حُدِّثت البطاقة أمامك');
    }
  } else if (it.sec == 'case' && (it.v || []).length) {
    const avs = it.v.filter(x => x.n > 0);
    if (!avs.length) return !toast('نفد هذا البوشيط بالفعل');
    if (avs.length > 1) { bcPickCsVar(it); return true; }
    const v = avs[0];
    commit('بيع سريع (−1): بوشيط ' + it.name, () => { v.n = Math.max(0, v.n - 1); touch(it); });
    return true;
  }
  return false;
}

function bcHome() {
  bcScan(c => {
    BCODE = String(c || '').trim(); const nc = nz(BCODE), r = $('res'); if (!r) return;
    const m = S.items.filter(i => i.sec != 'glass' && (i.code == BCODE || (i.imei && nz(i.imei).includes(nc)))), x = BCM.map(f => f(BCODE)).join('');
    if (m.length || x) {
      bcBeep(true);
      const r2 = $('res') || r;
      r2.innerHTML = m.map(itemCard).join('') + x;
      if (bcQ() && m.length == 1 && !x && m[0].sec == 'case' && (m[0].v || []).filter(v => v.n > 0).length > 1) bcPickCsVar(m[0]);
      return;
    }
    bcBeep(false);
    const im = isImei(BCODE), B = (fn, ic2, l, p) => `<button class="btn ${p ? '' : 's'} sm" onclick="${fn}()">${I(ic2)} ${l}</button>`;
    r.innerHTML = `<div class="card"><div class="m">${im ? 'رقم IMEI غير مسجل' : 'باركود غير مسجل'}: <bdi><b>${esc(BCODE)}</b></bdi></div><div class="m" style="margin-top:4px">اختر ما تريد فعله بهذا الرمز:</div><div class="sub" style="margin-top:8px">`
      + (im ? B('bcNewPh', 'mobile', '+ هاتف جديد', 1) + B('bcNewAcc', 'plug', '+ إكسسوار') + B('bcNewCs', 'box', '+ بوشيط') : B('bcNewAcc', 'plug', '+ إكسسوار جديد', 1) + B('bcNewCs', 'box', '+ بوشيط جديد', 1) + B('bcNewPh', 'mobile', '+ هاتف جديد'))
      + BCX.map(f => f(BCODE, im)).join('') + `</div><button class="btn s sm" style="width:100%;margin-top:8px" onclick="bcLink()">ربطه بصنف موجود في المخزون</button></div>`;
  }, c => {
    /* المعالج المستمر عندما يكون وضع البيع السريع مفعلاً */
    if (!bcQ()) return false;
    const nc = nz(c), m = S.items.filter(i => i.sec != 'glass' && (i.code == c || (i.imei && nz(i.imei).includes(nc)))), x = BCM.map(f => f(c)).join('');
    if (m.length == 1 && !x) {
      const it = m[0];
      if (it.sec == 'case' && (it.v || []).filter(v => v.n > 0).length > 1) return false;   // نخرج من الكاميرا لاختيار اللون المباع
      const ok = bcQuickSell(it);
      bcBeep(ok);
      if (ok) {
        S.cfg.bcQuick = Date.now();
        const rem = it.sec == 'case' ? csTot(it) : it.cnt;
        const lg = $('bc_log');
        if (lg) lg.innerHTML = `<div class="card rp-ok" style="margin:0;padding:8px 12px"><b>${I('check')} خُصم 1: ${esc(bcLbl(it))}</b><div class="m">المتبقي: ${rem} — وجّه الكاميرا للسلعة التالية</div></div>`;
        const r2 = $('res'); if (r2) r2.innerHTML = itemCard(it);
        return true;   // تبقى الكاميرا مفتوحة
      }
      return true;
    }
    return false;   // باركود غير مسجل أو له عدة نتائج: نخرج من الكاميرا لعرض الخيارات
  });
}
function bcNewPh() { $('sh').innerHTML = ''; sheetOpen(v => phDone(v, PR)); phForm({ imei: isImei(BCODE) ? BCODE : '', code: BCODE, cnt: 1 }); }
function bcNewAcc() { $('sh').innerHTML = ''; sheetOpen(v => acDone(v, PR)); acForm({ code: BCODE }); }
function bcNewCs() { CSCODE = BCODE; csAdd(); }
function bcLink() { $('sh').innerHTML = '<div class="bar"></div><h3>ربط الرمز بعنصر</h3><label>ابحث عن العنصر<input oninput="bcF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>'; sheetOpen(() => { }); bcF(''); }
function bcF(q) { const n = nz(q); $('pr').innerHTML = S.items.filter(i => i.sec != 'glass' && n && nz(hay(i)).includes(n)).slice(0, 8).map(i => `<button class="card row2" onclick="bcSet('${i.id}')"><b>${esc(bcLbl(i))}</b></button>`).join(''); }
function bcSet(id) {
  const i = find(id); if (!i) return;
  upd(() => { if (i.sec == 'phones' && isImei(BCODE)) i.imei = i.imei ? (i.imei.includes(BCODE) ? i.imei : i.imei + ' · ' + BCODE) : BCODE; i.code = i.code || BCODE; i.by = S.me; });
  finish(null); toast('تم ربط الباركود بنجاح');
}
HOME.tools.push(() => `<div class="row2" style="margin:8px 0"><button class="btn s" style="flex:1;margin:0" onclick="bcHome()">${I('scan')} مسح باركود</button><button class="btn ${bcQ() ? '' : 's'} sm" style="min-height:50px" onclick="upd(()=>S.cfg.bcQuick=bcQ()?0:Date.now())" title="خصم قطعة تلقائياً عند المسح (15 دقيقة)">${I('zap')} ${bcQ() ? 'البيع السريع مفعّل' : 'بيع سريع −1'}</button></div>`);