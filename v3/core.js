/* ============================================================
   core.js — الأساس: الحالة، التخزين، الأمان، النوافذ، التنقل
   لا توجد شاشات هنا. بقية الملفات تسجّل نفسها عبر السجلات:
   VW (الشاشات) · HK (خطّافات الحفظ/الإغلاق) · HOME (أزرار الرئيسية)
   MORE (قائمة المزيد) · SRCH (مصادر البحث) · LM (حدود قابلة للتعديل)
   ============================================================ */

/* ---------- أدوات عامة ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const vib = (ms = 25) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } };
/* أرقام عربية→لاتينية، وتطبيع أرقام الهاتف لواتساب (يقبل 0612…، +212…، 00212…، 612… ) */
const dg = s => String(s ?? '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const waNum = t => { const d = dg(t).replace(/\D/g, ''); if (d.startsWith('00')) return d.slice(2); if (d.startsWith('2120')) return '212' + d.slice(4); if (d[0] == '0') return '212' + d.slice(1); if (d.length == 9 && /^[567]/.test(d)) return '212' + d; return d; };
const fd = t => { const d = new Date(t), p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`; };

/* الأيقونات */
const IC={home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',sl:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',back:'<path d="M5 12h14M12 5l7 7-7 7"/>'};
Object.assign(IC,{lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 7v10M12 7v10M16 7v10"/>',mobile:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',box:'<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12M3.3 7l8.7 5 8.7-5"/>',plug:'<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z"/>',check:'<path d="M20 6 9 17l-5-5"/>',bulb:'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',tag:'<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',chat:'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',send:'<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>'});
Object.assign(IC,{search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'});
const ic = n => (typeof CI != 'undefined' && CI[n]) ? `<svg class="ic ci" viewBox="0 0 100 100" aria-hidden="true">${CI[n]}</svg>` : `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const I = n => ic(n).replace('class="ic', 'class="ic s');

/* ---------- أيقونات SVG إضافية حديثة (بدون إيموجي) ---------- */
Object.assign(IC, {
  plus: '<path d="M12 5v14M5 12h14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  keyboard: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/>',
  hash: '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>'
});

/* ---------- السجلات (تسجّل فيها الملفات الأخرى بدل تعديل بعضها) ---------- */
const VW = {};                                  // الشاشات: VW.name = () => ({t:'العنوان', h:'html', a:()=>{}})
const HK = { save: [], saved: [], hide: [], render: [] };   // save: قبل الحفظ · saved: بعده · hide: عند إغلاق النافذة
const HOME = { top: [], tools: [], after: [] }; // دوال تعيد html لأزرار الرئيسية
const MORE = [];                                // عناصر قائمة المزيد: {g, l, fn, n, o}
const SRCH = [];                                // مصادر البحث: {k, l, run(n) -> [html]}
const ST = { ver: 0, dirty: 0 };                // ver: يتغير مع كل حفظ (ذاكرة البحث) · dirty: يحتاج مزامنة

/* ---------- الثوابت ---------- */
const TG = { brand: 'الماركات', color: 'الألوان', cap: 'السعات', ram: 'RAM', gender: 'الجنس', kind: 'نوع الإكسسوار', conn: 'الموصل', tier: 'الفئات السعرية', glass: 'أنواع الزجاج', pw: 'القدرة (واط)', fault: 'أعطال الصيانة' };
const PL = { del: 'الحذف', price: 'تعديل الأسعار', tags: 'إدارة الوسوم', fields: 'إدارة الحقول' };
const DT = { g: '#16a34a', y: '#d97706', r: '#dc2626' }, TX = { g: 'متوفر', y: 'قارب على النفاد', r: 'نفد' };
const DL0 = { low: 1, gmin: 10, cl: 3, stale: 7, alk: 5 };
const LM = [
  ['low', 'هاتف: «قارب النفاد» عند عدد ≤ (الحد العام)'],
  ['gmin', 'أنتي كاس: «قارب النفاد» عند مجموع ≤ (الحد العام)'],
  ['cl', 'بوشيط: «قارب النفاد» عند مجموع ≤ (الحد العام)'],
  ['stale', 'الجولة: يُعتبر الصنف غير مؤكد بعد (أيام)'],
  ['alk', 'قفل التطبيق والمدير تلقائياً بعد (دقائق بلا استعمال)']
];

/* ---------- البحث: توحيد الكتابة (عربي/إنجليزي/أرقام) ---------- */
const AL={'ايفون':'iphone','سامسونج':'samsung','سامسونغ':'samsung','شاومي':'xiaomi','ريدمي':'redmi','ريلمي':'realme','هواوي':'huawei','اوبو':'oppo','فيفو':'vivo','تكنو':'tecno','انفنكس':'infinix','انفينيكس':'infinix','ايتل':'itel','نوكيا':'nokia','بوكو':'poco','هونر':'honor','تايب سي':'typec','تايبسي':'typec','ميكرو':'micro','لايتننق':'lightning','لايتنينج':'lightning','باور بانك':'powerbank','باوربانك':'powerbank','كارت ميموري':'memorycard','ماكس':'max','برو':'pro','بلس':'plus','بلاس':'plus','الترا':'ultra','لايت':'lite','نوت':'note','سي':'c','اس':'s','تي':'t','اكس':'x','ايه':'a','جي':'g','كابل':'cable','كابلو':'cable','كابلات':'cable','câble':'cable','شاحن':'charger','شارجور':'charger','شارجر':'charger','شارجيور':'charger','chargeur':'charger','سماعة':'headset','سماعات':'headset','ecouteur':'headset','écouteur':'headset','اكوتور':'headset','ايربودز':'airpods','بوشيط':'pochette','بوشيت':'pochette','جراب':'pochette','انتي كاس':'glass','انتيكاس':'glass','زجاج':'glass','verre':'glass','فلاشة':'usb','افيشور':'شاشة','ميموار':'memorycard','باتري':'بطارية','تيربو':'charger','يو اس بي':'usb','جالاكسي':'galaxy','جلاكسي':'galaxy','لايتنينغ':'lightning'};
const KS=Object.keys(AL).sort((a,b)=>b.length-a.length);
const nz=s=>{s=String(s||'').toLowerCase().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064B-\u0652]/g,'');for(const k of KS)s=s.split(k).join(AL[k]);return s.replace(/[\s\-_]/g,'')};
const NZC = new WeakMap();   // ذاكرة مؤقتة خارج البيانات (لا تُحفظ ولا تُزامَن)
const nzOf = (o, fn) => { let c = NZC.get(o); if (!c || c.v !== ST.ver) { c = { v: ST.ver, s: nz(fn(o)) }; NZC.set(o, c); } return c.s; };

/* ---------- الحالة ---------- */
const DEF = {
  me: '', users: [], pin: '',
  perm: { del: 'a', price: 'a', tags: 'a', fields: 'a' },
  cfg: { fs: 18, th: 'b-a' },
  tags: {
    brand: ['Samsung', 'Xiaomi', 'Redmi', 'Realme', 'Oppo', 'Vivo', 'Tecno', 'Infinix', 'iPhone', 'Itel'],
    color: ['أسود', 'أبيض', 'أزرق', 'أحمر', 'أخضر', 'ذهبي', 'فضي', 'وردي'],
    cap: ['32GB', '64GB', '128GB', '256GB', '512GB'],
    ram: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB'],
    gender: ['رجالي', 'نسائي'],
    kind: ['كابل', 'شاحن', 'رأس شاحن', 'USB', 'كارت ميموري', 'سماعة', 'باور بانك'],
    conn: ['micro', 'type-c', 'lightning'],
    tier: ['10', '15', '20', '25', '30', '40', '50'],
    glass: ['عادي', 'Super Full Glue', 'Privacy'],
    pw: ['10W', '18W', '20W', '25W', '33W', '45W', '65W'],
    fault: ['تغيير شاشة', 'كونكتور الشحن', 'بطارية', 'مشكلة شبكة', 'سقط في الماء', 'صوت / مايك', 'سوفتوير', 'تغيير ظهر']
  },
  items: [], rp: [], trash: [], req: [], gg: [], guide: [], ag: [], used: [], debt: [], tp: [], fields: []
};
let LOAD_BAD = 0;   // 1 = ملف بيانات هذا الجهاز تالف عند الإقلاع (يوقف المزامنة ويعرض استعادة نسخة تلقائية)
function load(chk) {
  let o = {};
  try { o = JSON.parse(localStorage.getItem('shop3') || '{}'); } catch (e) { if (chk) LOAD_BAD = 1; }
  const d = JSON.parse(JSON.stringify(DEF));
  return { ...d, ...o, tags: { ...d.tags, ...o.tags }, perm: { ...d.perm, ...o.perm }, cfg: { ...d.cfg, ...o.cfg } };
}
let S = load(1);
let V = { v: 'home' }, Q = '', QP = 0, SH = false, SHR = null, ARM = 0, TT;

/* ---------- مخازن IndexedDB (الصور + النسخة التلقائية) ---------- */
function kvStore(db, store) {
  let p = null;
  const open = () => p || (p = new Promise((res, rej) => {
    const r = indexedDB.open(db, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(store);
    r.onsuccess = () => res(r.result);
    r.onerror = () => { p = null; rej(r.error); };
  }));
  const run = (mode, fn) => open().then(d => new Promise((res, rej) => {
    const t = d.transaction(store, mode), q = fn(t.objectStore(store));
    t.oncomplete = () => res(q && q.result);
    t.onerror = t.onabort = () => rej(t.error);
  }));
  return {
    get: k => run('readonly', s => s.get(k)),
    put: (k, v) => run('readwrite', s => s.put(v, k)),
    del: k => run('readwrite', s => s.delete(k)),
    all: () => open().then(d => new Promise((res, rej) => {
      const o = {}, c = d.transaction(store, 'readonly').objectStore(store).openCursor();
      c.onsuccess = () => { const x = c.result; if (x) { o[x.key] = x.value; x.continue(); } else res(o); };
      c.onerror = () => rej(c.error);
    }))
  };
}
const MEDIA = kvStore('AzizShopMedia', 'imgs'), AUTOBK = kvStore('AzizShopAutoBackup', 'bk');

/* خزنة الصور: الصورة تعيش في IndexedDB، والسجل في الذاكرة وlocalStorage يحمل الوسم 'idb:المعرّف' فقط */
const IMG = {};
const putImg = (id, d) => { if (!id || !d) return; IMG[id] = d; MEDIA.put(id, d).catch(e => errLog('حفظ صورة: ' + (e && e.message || e))); };
const delImg = id => { if (!id || !(id in IMG)) return; delete IMG[id]; MEDIA.del(id).catch(e => errLog('حذف صورة: ' + (e && e.message || e))); };
function imgReplacer(k, v) {
  if (k === 'img' && this && this.id && (typeof this.st === 'string' || typeof this.dev === 'string')) {
    if (typeof v === 'string' && v.startsWith('data:image')) { putImg(this.id, v); this.img = 'idb:' + this.id; return this.img; }
    if (!v && IMG[this.id]) delImg(this.id);
  }
  return v;
}
function imgInit() {
  let moved = 0;
  [...(S.rp || []), ...(S.used || [])].forEach(r => {
    if (r && r.id && typeof r.img === 'string' && r.img.startsWith('data:image')) {
      putImg(r.id, r.img); r.img = 'idb:' + r.id; moved = 1;
    }
  });
  MEDIA.all().then(all => {
    const valid = new Set([
      ...(S.rp || []).map(r => r && r.id),
      ...(S.used || []).map(u => u && u.id),
      ...(S.trash || []).filter(t => t.coll == 'rp' || t.coll == 'used').map(t => t.obj && t.obj.id)
    ]);
    Object.keys(all).forEach(id => {
      if (!valid.has(id)) MEDIA.del(id).catch(() => {});
      else IMG[id] = all[id];
    });
    let ch = 0;
    [...(S.rp || []), ...(S.used || [])].forEach(r => {
      if (r && r.id && IMG[r.id]) {
        if (!r.img || r.img.startsWith('data:image')) r.img = 'idb:' + r.id;
        ch = 1;
      }
    });
    if (moved) save();
    if (ch) render();
  }).catch(e => errLog('قراءة الصور: ' + (e && e.message || e)));
}

/* ---------- الحفظ ---------- */
function save() {
  try {
    HK.save.forEach(f => { try { f(); } catch (e) { } });
    const j = JSON.stringify(S, imgReplacer);
    localStorage.setItem('shop3', j);
    ST.dirty = 1; ST.ver++;
    HK.saved.forEach(f => { try { f(); } catch (e) { } });
    stWarn(j.length);
  } catch (e) { ST.dirty = 1; ST.ver++; toast('الذاكرة ممتلئة: خذ نسخة احتياطية وأرشف الصيانات القديمة', null, 10000); }
}
/* تنبيه مرة في اليوم عند اقتراب ذاكرة المتصفح (نحو 5 ملايين حرف) من الامتلاء، دون أن يحجب زر «تراجع» */
function stWarn(n) {
  if (n < 4e6) return;
  try {
    const t = $('ts'); if (t && !t.hidden) return;
    const d = new Date().toLocaleDateString('en-CA');
    if (localStorage.getItem('shopWarnSz') == d) return;
    localStorage.setItem('shopWarnSz', d);
    toast('المساحة ' + Math.round(n / 5e4) + '% من الحد: خذ نسخة احتياطية وأرشف الصيانات القديمة', null, 9000);
  } catch (e) { }
}

/* ---------- الأخطاء ---------- */
const errLog = m => { try { const a = JSON.parse(localStorage.getItem('shopErr') || '[]'); a.unshift(new Date().toLocaleString('ar-MA') + ' — ' + String(m).slice(0, 160)); localStorage.setItem('shopErr', JSON.stringify(a.slice(0, 8))); } catch (e) { } };
let ERT = 0;
const errUi = m => { errLog(m); if (Date.now() - ERT < 4000) return; ERT = Date.now(); toast(/quota|storage/i.test(m) ? 'المساحة ممتلئة: خذ نسخة احتياطية الآن' : 'حدث خطأ غير متوقع، بياناتك محفوظة'); };
addEventListener('error', e => errUi(e.message || e));
addEventListener('unhandledrejection', e => errUi((e.reason && e.reason.message) || e.reason));

/* ---------- الرموز السرية (SHA-256 مملّحة؛ القديمة تُقبل ثم تُحدَّث تلقائياً) ---------- */
const hsL=s=>{let h=5381;for(const c of String(s))h=(h*33^c.charCodeAt(0))>>>0;return h.toString(36)};
const SHK=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
function sha256(m){const l=m.length,n=((l+9+63)>>6)<<6,b=new Uint8Array(n);b.set(m);b[l]=128;const dv=new DataView(b.buffer);dv.setUint32(n-8,Math.floor(l*8/4294967296));dv.setUint32(n-4,(l*8)>>>0);
let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];const w=new Uint32Array(64);
for(let o=0;o<n;o+=64){for(let i=0;i<16;i++)w[i]=dv.getUint32(o+i*4);
for(let i=16;i<64;i++){const x=w[i-15],y=w[i-2];w[i]=(w[i-16]+(((x>>>7)|(x<<25))^((x>>>18)|(x<<14))^(x>>>3))+w[i-7]+(((y>>>17)|(y<<15))^((y>>>19)|(y<<13))^(y>>>10)))|0}
let [a,bb,cc,d,e,f,g,h]=H;
for(let i=0;i<64;i++){const t1=(h+(((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7)))+((e&f)^(~e&g))+SHK[i]+w[i])|0,t2=((((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10)))+((a&bb)^(a&cc)^(bb&cc)))|0;h=g;g=f;f=e;e=(d+t1)|0;d=cc;cc=bb;bb=a;a=(t1+t2)|0}
H=[H[0]+a,H[1]+bb,H[2]+cc,H[3]+d,H[4]+e,H[5]+f,H[6]+g,H[7]+h].map(v=>v|0)}
const r=new Uint8Array(32),rv=new DataView(r.buffer);H.forEach((v,i)=>rv.setUint32(i*4,v>>>0));return r}
let _hc=null,_hr='';
const hs=s=>{s=String(s??'');if(s===_hc)return _hr;const E=new TextEncoder(),salt=E.encode('aziz-shop-pin-v2|');let m=sha256(E.encode('aziz-shop-pin-v2|'+s));
for(let i=0;i<3000;i++){const x=new Uint8Array(m.length+salt.length);x.set(m);x.set(salt,m.length);m=sha256(x)}
_hc=s;_hr='h2:'+Array.from(m,v=>v.toString(16).padStart(2,'0')).join('');return _hr};
/* hv: يتحقق من الرمز (جديد أو قديم) وإن كان قديماً يحدّثه إلى الجديد في كل مكان خُزّن فيه */
const hv=(p,st)=>{if(!st)return false;p=String(p??'');if(st===hs(p))return true;
if(st===hsL(p)){const n=hs(p);let ch=0;if(S.pin===st){S.pin=n;ch=1}if(S.cfg&&S.cfg.lk===st){S.cfg.lk=n;ch=1}(S.users||[]).forEach(u=>{if(u.pin===st){u.pin=n;ch=1}});if(ch)save();return true}return false};

/* ---------- الصلاحيات ---------- */
const admOk = () => { try { return sessionStorage.getItem('admOk') == '1'; } catch (e) { return false; } };
const admSet = v => { try { v ? sessionStorage.setItem('admOk', '1') : sessionStorage.removeItem('admOk'); } catch (e) { } };
const isAdmin = () => !!(S.users.find(u => u.name == S.me) || {}).admin && (!S.pin || admOk());
const can = k => S.perm[k] == 'e' || isAdmin();
const needAdm = f => function (...a) {
  if (!isAdmin()) return toast('للمدير فقط');
  ask('تأكيد: رمز المدير', [{ k: 'p', l: 'الرمز', t: 'password' }], 'تأكيد').then(v => {
    if (!v) return;
    if (hv(v.p, S.pin)) f.apply(null, a); else toast('الرمز خاطئ');
  });
};

/* ---------- الإشعار ---------- */
function toast(msg, undo, ms) {
  const t = $('ts');
  t.innerHTML = `<span>${esc(msg)}</span>` + (undo ? '<button id="tu">تراجع</button>' : '');
  t.hidden = false;
  if (undo) $('tu').onclick = () => { undo(); save(); render(); t.hidden = true; };
  clearTimeout(TT); TT = setTimeout(() => t.hidden = true, ms || 6000);
}

/* ---------- التنقل وزر الرجوع ---------- */
function go(v, p) {
  V = { v, ...p }; Q = ''; QP = 0; history.pushState({ V }, ''); render();
  scrollTo(0, 0);
}
addEventListener('popstate', e => {
  const s = e.state || {};
  if (SH) { hideSheet(); return; }
  if (s.root) {   // وصلنا لأسفل المكدّس: اضغط مرتين للخروج
    if (Date.now() - ARM < 2500) { history.back(); return; }
    ARM = Date.now(); toast('اضغط رجوع مرة أخرى للخروج'); history.pushState({ V: { v: 'home' } }, ''); return;
  }
  V = s.V || { v: 'home' }; Q = ''; QP = 0; render();
});
function startHistory() { history.replaceState({ root: 1 }, ''); history.pushState({ V }, ''); }

/* ---------- النافذة السفلية ---------- */
function sheetOpen(res) { SH = true; SHR = { res, val: null }; $('ov').hidden = false; history.pushState({ V, sh: 1 }, ''); }
function hideSheet() {
  HK.hide.forEach(f => { try { f(); } catch (e) { } });
  $('ov').hidden = true; SH = false;
  const r = SHR; SHR = null; r && r.res(r.val);
}
const finish = v => { if (!SHR) return; SHR.val = v; history.back(); };

/* ---------- لوحة الأرقام (مع التبديل إلى لوحة الحروف) ---------- */
function pinPadHtml (id, ph = 'أدخل الرمز', onEnter = '') {
  return `<div class="pin-wrap" id="${id}_wrap"><input id="${id}" type="hidden" value="" autocomplete="off" ${onEnter ? `onkeydown="if(event.key==='Enter')${onEnter}"` : ''}><div id="${id}_pad"><div id="${id}_dots" class="pin-dots" data-ph="${esc(ph)}"><span class="pin-ph">${esc(ph)}</span></div><div class="pin-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button type="button" class="pkb" onclick="pkTap('${id}','${n}')">${n}</button>`).join('')}<button type="button" class="pkb fn" onclick="pkTap('${id}','C')">مسح</button><button type="button" class="pkb" onclick="pkTap('${id}','0')">0</button><button type="button" class="pkb fn" onclick="pkTap('${id}','B')">⌫</button></div></div><button type="button" id="${id}_sw" class="pin-sw" onclick="pkMode('${id}')">${I('keyboard')} الرمز فيه حروف؟ اضغط هنا للكتابة</button></div>`;
}
function pkTap(id, k) {
  const el = $(id); if (!el) return;
  if (k == 'C') el.value = '';
  else if (k == 'B') el.value = el.value.slice(0, -1);
  else if (el.value.length < 24) el.value += k;
  const d = $(id + '_dots');
  if (d) {
    const ph = d.getAttribute('data-ph') || 'أدخل الرمز';
    d.innerHTML = el.value.length ? Array(el.value.length).fill('<span class="pin-dot"></span>').join('') : `<span class="pin-ph">${esc(ph)}</span>`;
  }
}
function pkMode (id) {
  const el = $(id), pad = $(id + '_pad'), sw = $(id + '_sw'), d = $(id + '_dots');
  if (!el || !pad || !sw) return;
  const ph = (d && d.getAttribute('data-ph')) || 'أدخل الرمز';
  if (el.type === 'hidden') {
    pad.hidden = true; el.type = 'password'; el.placeholder = ph + ' (حروف وأرقام)'; el.style.marginBottom = '8px';
    sw.innerHTML = I('hash') + ' العودة للوحة الأرقام السريعة'; setTimeout(() => el.focus(), 50);
  } else {
    el.type = 'hidden'; pad.hidden = false; sw.innerHTML = I('keyboard') + ' الرمز فيه حروف؟ اضغط هنا للكتابة'; pkTap(id, '');
  }
}

/* ---------- نماذج الإدخال والتأكيد ---------- */
function ask(title, F, ok = 'حفظ', danger) {
  return new Promise(res => {
    $('sh').innerHTML = `<div class="bar"></div><h3>${esc(title)}</h3>` + F.map(f => `<label>${esc(f.l)}` + (
      f.t == 'area' ? `<textarea id="f_${f.k}">${esc(f.v)}</textarea>`
        : f.t == 'sel' ? `<select id="f_${f.k}">${f.o.map(o => `<option ${o == f.v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`
          : f.t == 'password' ? pinPadHtml('f_' + f.k, f.ph || 'أدخل الرمز', "document.getElementById('so').click()")
            : `<input id="f_${f.k}" type="${f.t || 'text'}" value="${esc(f.v)}">`) + '</label>').join('')
      + `<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn ${danger ? 'd' : ''}" id="so">${esc(ok)}</button></div>`;
    sheetOpen(res);
    $('so').onclick = () => { const o = {}; F.forEach(f => o[f.k] = $('f_' + f.k).value); finish(o); };
    const i = $('sh').querySelector('input:not([type=hidden])');
    if (i && !i.value) setTimeout(() => i.focus(), 150);
  });
}
function sure(msg, ok = 'نعم', danger = true) {
  return new Promise(res => {
    $('sh').innerHTML = `<div class="bar"></div><h3>${esc(msg)}</h3><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn ${danger ? 'd' : ''}" onclick="finish(1)">${esc(ok)}</button></div>`;
    sheetOpen(res);
  }).then(v => !!v);
}

/* ---------- التعديل مع التراجع والحذف والاسترجاع ---------- */
function upd(fn) { fn(); save(); render(); }
const snap = () => JSON.stringify({ items: S.items, req: S.req, tags: S.tags, cfg: S.cfg, gg: S.gg, guide: S.guide, ag: S.ag, debt: S.debt, tp: S.tp, fields: S.fields, used: (S.used || []).map(u => ({ ...u, img: u.img ? 1 : 0 })), rp: S.rp.map(r => ({ ...r, img: r.img ? 1 : 0 })) });
function commit(label, fn) {
  const b = snap(), im = Object.fromEntries([...S.rp, ...(S.used || [])].map(r => [r.id, [r.img, IMG[r.id]]]));
  fn(); save(); render();
  toast(label, () => {
    const o = JSON.parse(b);
    S.items = o.items; S.req = o.req; S.tags = o.tags; S.cfg = o.cfg || S.cfg; S.gg = o.gg; S.guide = o.guide; S.ag = o.ag; S.debt = o.debt || S.debt; S.tp = o.tp || S.tp; S.fields = o.fields || S.fields;
    const fixIm = r => {
      const m = im[r.id];
      if (m && m[1]) { if (IMG[r.id] !== m[1]) putImg(r.id, m[1]); }
      else if (IMG[r.id]) delImg(r.id);
      return { ...r, img: m && m[0] ? 'idb:' + r.id : '' };
    };
    S.used = (o.used || []).map(fixIm);
    S.rp = o.rp.map(fixIm);
    const keep = new Set([...S.rp.map(r => r.id), ...S.used.map(u => u.id), ...(S.trash || []).map(t => t.obj && t.obj.id)]);
    Object.keys(IMG).forEach(id => { if (!keep.has(id)) delImg(id); });
  });
}
function del(coll, id, label) {
  if (!can('del')) return toast('الحذف للمدير فقط');
  sure('حذف «' + label + '» ؟').then(y => {
    if (!y) return;
    const i = S[coll].findIndex(x => x.id == id); if (i < 0) return;
    const o = S[coll].splice(i, 1)[0], t = { id: uid(), coll, obj: o, label, t: Date.now() };
    S.trash.push(t); save(); render(); toast('تم الحذف', () => restore(t.id));
  });
}
function restore(id) {
  const t = S.trash.find(x => x.id == id); if (!t) return;
  S.trash = S.trash.filter(x => x != t);
  if (t.coll == 'used' && t.obj && t.obj.repOf) {
    const it = S.items.find(x => x.id == t.obj.repOf);
    if (it && it.cnt > 0) it.cnt = Math.max(0, it.cnt - 1);
  }
  S[t.coll] = S[t.coll] || []; S[t.coll].push(t.obj); save(); render();
}
const row = (l, fn, sub) => `<button class="card row2" onclick="${fn}"><b>${esc(l)}</b><span class="m">${esc(sub || '')}</span></button>`;

/* ---------- المظهر: وضع (تلقائي/نهاري/ليلي) × لون (أزرق/أخضر/بنفسجي/برتقالي) ---------- */
const TH_OLD = { a: 'b-a', l: 'b-l', d: 'b-d', g: 'g-l', v: 'v-d', w: 'o-l' }, FS_OLD = { 15: 16, 17: 18, 19: 20, 21: 22 };
function thGet() {
  const v = TH_OLD[S.cfg.th] || S.cfg.th || 'b-a', p = String(v).split('-');
  return [['b', 'g', 'v', 'o'].includes(p[0]) ? p[0] : 'b', ['a', 'l', 'd'].includes(p[1]) ? p[1] : 'a'];
}
function thApply(de) {
  const [ac, md] = thGet(); let dark = md == 'd';
  if (md == 'a') { try { dark = matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { } }
  de.dataset.ac = ac; de.dataset.md = dark ? 'd' : 'l';
  de.style.setProperty('--fs', (FS_OLD[S.cfg.fs] || S.cfg.fs || 18) + 'px');
  try { const m = document.querySelector('meta[name=color-scheme]'); if (m) m.content = dark ? 'dark' : 'only light'; } catch (e) { }
}
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (thGet()[1] == 'a') render(); }); } catch (e) { }

/* ---------- الرسم ---------- */
const NV = [['home', 'chome', 'الرئيسية'], ['rp', 'crepair', 'الصيانة'], ['rep', 'creport', 'التقرير'], ['st', 'cmore', 'المزيد']];
function render() {
  let r;
  try { r = (VW[V.v] || VW.home)(); }
  catch (e) { errUi((e && e.message) || e); r = { t: 'خطأ', h: '<div class="card"><b>تعذّر عرض هذه الشاشة</b><p class="m">بياناتك سليمة. ارجع للرئيسية وحاول مجدداً.</p></div>' }; }
  $('ti').textContent = r.t; $('bk').hidden = V.v == 'home'; $('me').textContent = S.me; $('m').innerHTML = r.h;
  const nvh = NV.map(([k, i, l]) => `<button class="${V.v.startsWith(k) ? 'on' : ''}" onclick="go('${k}')">${ic(i)}<span>${l}</span></button>`).join('');
  if ($('nv').dataset.h !== nvh) { $('nv').innerHTML = nvh; $('nv').dataset.h = nvh; }
  const de = document.documentElement;
  thApply(de);
  try { const m = document.querySelector('meta[name=theme-color]'); if (m) { const tc = getComputedStyle(de).getPropertyValue('--c').trim(); if (tc && m.content !== tc) m.content = tc; } } catch (e) { }
  r.a && r.a();
  HK.render.forEach(f => { try { f(); } catch (e) { } });   // بعد كل رسم (مثل الزر العائم)
}
$('ov').onclick = e => { if (e.target.id == 'ov') finish(null); };