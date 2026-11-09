/* ============================================================
   users.js — المستخدمون والصلاحيات، تسجيل الدخول والقفل السريع
   يُحمَّل بعد home.js.
   ============================================================ */

/* ---------- المستخدمون والصلاحيات ---------- */
VW.st_users = () => {
  const a = isAdmin();
  return {
    t: 'المستخدمون',
    h: S.users.map((u, i) => `<div class="card row2"><b>${esc(u.name)}</b><span class="m">${u.admin ? 'مدير' : 'موظف' + (u.pin ? '' : ' · بلا رمز')}${u.nr ? ' · بلا تنبيهات' : ''}${u.lkmax ? ' · قفل ≤ ' + lkTxt(u.lkmax) : ''}</span>${a ? `<button class="btn s sm" onclick="uEd(${i})">تعديل</button>` : ''}</div>`).join('')
      + (a ? '<button class="btn" onclick="uAdd()">+ مستخدم</button><button class="btn s" onclick="pinCh()">تغيير رمز المدير</button><h3>الصلاحيات</h3>'
        + Object.keys(PL).map(k => `<div class="card row2"><b>${PL[k]}</b><button class="btn s sm" onclick="pTog('${k}')">${S.perm[k] == 'a' ? 'المدير فقط' : 'الجميع'}</button></div>`).join('')
        : '<p class="m">التعديل للمدير فقط.</p>')
  };
};
const adm = () => S.users.filter(u => u.admin).length;
const noRem = () => !!(S.users.find(u => u.name == S.me) || {}).nr;
const uAdd = needAdm(function () {
  ask('مستخدم جديد', [{ k: 'n', l: 'الاسم' }, { k: 'r', l: 'الدور', t: 'sel', o: ['موظف', 'مدير'], v: 'موظف' }, { k: 'p', l: 'رمز الموظف بالأرقام (إجباري للموظف، 4 على الأقل)', t: 'password' }]).then(v => {
    if (!v || !v.n.trim()) return;
    const isA = v.r == 'مدير';
    if (!isA && !(v.p && v.p.length >= 4)) return toast('رمز الموظف إجباري (4 أرقام على الأقل)');
    upd(() => { const u = { name: v.n.trim(), admin: isA }; if (!isA) u.pin = hs(v.p); S.users.push(u); });
  });
});
const uEd = needAdm(function (i) {
  const u = S.users[i];
  const F = [{ k: 'r', l: 'الدور', t: 'sel', o: ['موظف', 'مدير'], v: u.admin ? 'مدير' : 'موظف' }, { k: 'p', l: 'رمز جديد للموظف (فارغ = بلا تغيير)' + (u.pin ? ' — له رمز حالياً' : ''), t: 'password' }];
  F.push({ k: 'n', l: 'التنبيهات اليومية في الرئيسية (التقرير والتعبئة)', t: 'sel', o: ['تظهر', 'مخفية'], v: u.nr ? 'مخفية' : 'تظهر' });
  F.push({ k: 'lm', l: 'قفل تلقائي إجباري: أقصى مدة قبل القفل (لا يستطيع تجاوزها)', t: 'sel', o: ['بلا حد', ...LKO.filter(o => o[0] >= 90).map(o => o[1])], v: u.lkmax ? lkTxt(u.lkmax) : 'بلا حد' });
  F.push({ k: 'x', l: 'حذف المستخدم؟', t: 'sel', o: ['لا', 'نعم'], v: 'لا' });
  ask(u.name, F).then(v => {
    if (!v) return;
    if ((v.x == 'نعم' || v.r == 'موظف') && u.admin && adm() < 2) return toast('يجب أن يبقى مدير واحد على الأقل');
    if (v.x != 'نعم' && v.r == 'موظف' && v.p && v.p.length < 4) return toast('الرمز 4 أرقام على الأقل');
    if (v.x != 'نعم' && v.r == 'موظف' && !u.pin && !v.p) return toast('رمز الموظف إجباري: اكتب رمزاً جديداً للموظف');
    upd(() => {
      if (v.x == 'نعم') {
        const wasMe = u.name == S.me;
        S.users.splice(i, 1);
        if (wasMe) S.me = (S.users.find(x => x.admin) || S.users[0] || {}).name || '';
      } else {
        u.admin = v.r == 'مدير';
        if (u.admin) delete u.pin;
        else {
          if (v.p) u.pin = hs(v.p);
          if (u.name == S.me) admSet(false);
        }
        if (v.n == 'مخفية') u.nr = 1; else delete u.nr;
        if (v.lm == 'بلا حد') delete u.lkmax; else { const o = LKO.find(x => x[1] == v.lm); if (o) u.lkmax = o[0]; }
      }
    });
  });
});
const pinCh = needAdm(function () { ask('رمز المدير الجديد', [{ k: 'p', l: 'الرمز الجديد', t: 'password' }]).then(v => { if (v && v.p) upd(() => S.pin = hs(v.p)); }); });
function pTog(k) { if (isAdmin()) upd(() => S.perm[k] = S.perm[k] == 'a' ? 'e' : 'a'); }

function who() {
  ask('من أنت؟', [{ k: 'u', l: 'المستخدم', t: 'sel', o: S.users.map(u => u.name), v: S.me }], 'اختيار').then(v => {
    if (!v) return;
    const u = S.users.find(x => x.name == v.u); if (!u) return;
    if (!u.admin) {
      const go2 = () => { admSet(false); upd(() => { S.me = u.name; }); };
      if (u.name == S.me) return;
      if (u.pin) return ask('رمز الموظف: ' + u.name, [{ k: 'p', l: 'الرمز السري', t: 'password' }], 'دخول').then(p => { if (p) (hv(p.p, u.pin) || hv(p.p, S.pin)) ? go2() : toast('الرمز خاطئ'); });
      return go2();
    }
    if (u.name == S.me && admOk()) return;
    ask('رمز المدير', [{ k: 'p', l: 'الرمز', t: 'password' }], 'دخول').then(p => { if (p) hv(p.p, S.pin) ? (admSet(true), upd(() => { S.me = u.name; })) : toast('الرمز خاطئ'); });
  });
}
function setup() {
  ask('مرحباً في محل عزيز! إعداد المدير', [{ k: 'n', l: 'اسمك' }, { k: 'p', l: 'رمز المدير (لحماية الصلاحيات)', t: 'password' }], 'ابدأ').then(v => {
    if (!v || !v.n.trim() || !v.p) return setup();
    S.users = [{ name: v.n.trim(), admin: true }]; S.me = v.n.trim(); S.pin = hs(v.p); admSet(true); save(); render();
  });
}

/* ---------- القفل: تسجيل الدخول (#lg) والقفل السريع (#lk) ---------- */
/* ---------- القفل التلقائي: مدة شخصية (الافتراضي 90 ث) + سقف إجباري يحدده المدير لكل مستخدم ---------- */
let LAST = Date.now();
['touchstart', 'click', 'keydown'].forEach(e => addEventListener(e, () => { LAST = Date.now(); }, true));
const lkStore = () => { try { localStorage.setItem('shopLast', String(LAST)); } catch (e) { } };
setInterval(lkStore, 5000);
const LKO = [[30, '30 ثانية'], [90, '90 ثانية'], [180, '3 دقائق'], [300, '5 دقائق'], [600, '10 دقائق'], [1800, '30 دقيقة'], [3600, 'ساعة']];
const lkMe = () => S.users.find(x => x.name == S.me) || null;
const lkCap = () => (lkMe() || {}).lkmax || 0;   // السقف (ثوانٍ) الذي حدده المدير لهذا المستخدم، 0 = بلا سقف
const lkSecs = () => { const p = +S.cfg.lkp || 90, c = lkCap(); return c ? Math.min(p, c) : p; };
const lkTxt = s => (LKO.find(o => o[0] == s) || [0, s + ' ثانية'])[1];
function lkNeeded() {
  if (!S.users.length || !S.pin) return false;
  const u = lkMe();
  return !(u && !u.admin && !u.pin);   // موظف بلا رمز لا يستطيع فتح القفل، فلا نقفل عليه
}
function lkEd() {
  const c = lkCap(), O = LKO.filter(o => !c || o[0] <= c);
  ask('القفل التلقائي', [{ k: 't', l: 'يقفل التطبيق بعد' + (c ? ' (الحد الأقصى حدّده المدير)' : ''), t: 'sel', o: O.map(o => o[1]), v: lkTxt(lkSecs()) }]).then(v => {
    const o = v && O.find(x => x[1] == v.t); if (o) upd(() => { S.cfg.lkp = o[0]; });
  });
}
const TRIES = {};
function tryBlocked(k, m, pad) { const t = TRIES[k] || (TRIES[k] = { n: 0, until: 0 }); if (Date.now() < t.until) { if (m) m.textContent = 'انتظر 10 ثوانٍ ثم أعد المحاولة'; pkTap(pad, 'C'); return true; } return false; }
function tryFail(k, m, pad, txt) { const t = TRIES[k]; t.n++; pkTap(pad, 'C'); if (t.n >= 5) { t.n = 0; t.until = Date.now() + 10000; if (m) m.textContent = 'محاولات كثيرة! انتظر 10 ثوانٍ'; } else if (m) m.textContent = txt; }

function closeOverlaysForLock() {   // نغطي النافذة المفتوحة بشاشة القفل ولا نغلقها، فلا يضيع ما كتبته
  const a = document.activeElement; if (a && a.blur) a.blur();
  sugClose();
  const t = $('ts'); if (t) t.hidden = true;
}

function lgShow() {
  if ($('lg')) return;
  closeOverlaysForLock();
  admSet(false);
  const emp = S.users.filter(u => !u.admin), ads = S.users.filter(u => u.admin);
  document.body.insertAdjacentHTML('beforeend', `<div id="lg" class="lockscr"><div class="lockbox"><h2>${I('lock')} تسجيل الدخول — محل عزيز</h2>`
    + (emp.length ? '<p class="m c">دخول كموظف</p>' + emp.map((u, i) => `<button class="btn s" onclick="lgEmp(${i})">${esc(u.name)}${u.pin ? ' ' + I('lock') : ''}</button>`).join('') : '')
    + `<p class="m c">دخول كمدير</p><select id="lga">${ads.map(u => `<option>${esc(u.name)}</option>`).join('')}</select><div id="lgm" class="m c"></div>${pinPadHtml('lgp', 'رمز المدير', 'lgAdm()')}<button class="btn" onclick="lgAdm()">دخول المدير</button></div></div>`);
}
function lgEmp(i) {
  const u = S.users.filter(x => !x.admin)[i], done = () => { upd(() => { S.me = u.name; }); $('lg').remove(); };
  if (!u.pin) return done();
  ask('رمز ' + u.name, [{ k: 'p', l: 'الرمز بالأرقام', t: 'password' }], 'دخول').then(p => { if (p) hv(p.p, u.pin) ? done() : toast('الرمز خاطئ'); });
}
function lgAdm() {
  const p = $('lgp'), m = $('lgm');
  if (tryBlocked('lg', m, 'lgp')) return;
  if (p && hv(p.value, S.pin)) { TRIES.lg = null; admSet(true); LAST = Date.now(); const n = $('lga').value; upd(() => { S.me = n; }); $('lg').remove(); }
  else tryFail('lg', m, 'lgp', 'رمز خاطئ');
}
function lkShow() {
  if ($('lk')) return;
  closeOverlaysForLock();
  document.body.insertAdjacentHTML('beforeend', `<div id="lk" class="lockscr"><div class="lockbox"><h2>${I('lock')} محل عزيز مقفل</h2><p id="lkm" class="m c">${lkMe() && !lkMe().admin ? 'أدخل رمزك' : 'أدخل رمز المدير'}</p>${pinPadHtml('lki', 'رمز الفتح', 'lkTry()')}<button class="btn" onclick="lkTry()">فتح التطبيق</button></div></div>`);
}
function lkTry() {
  const m = $('lkm'), el = $('lki');
  if (tryBlocked('lk', m, 'lki')) return;
  const c = el ? el.value : '', u = S.users.find(x => x.name == S.me);
  if (c && ((u && u.pin && hv(c, u.pin)) || hv(c, S.pin))) { TRIES.lk = null; localStorage.removeItem('shopLock'); $('lk').remove(); LAST = Date.now(); lkStore(); }
  else tryFail('lk', m, 'lki', 'الرمز خاطئ، حاول مرة أخرى');
}
function lockNow() {
  if (!S.pin) return toast('لم يُعيَّن رمز المدير بعد');
  if (!lkNeeded()) return toast('لا رمز لك بعد: اطلب من المدير تعيين رمز لك');
  try { localStorage.setItem('shopLock', '1'); } catch (e) { }
  lkShow();
}
const lkDue = () => lkNeeded() && !$('lk') && !$('lg') && Date.now() - LAST > lkSecs() * 1000;
addEventListener('visibilitychange', () => { if (document.hidden) lkStore(); else if (lkDue()) lockNow(); });
setInterval(() => {
  if ([...document.querySelectorAll('video')].some(v => v.srcObject && !v.paused)) LAST = Date.now();   // أثناء مسح الكاميرا لا نقفل
  if (!lkDue()) return;
  if (isAdmin()) lgShow(); else lockNow();
}, 5000);