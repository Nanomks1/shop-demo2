/* ============================================================
   app.js — الإقلاع فقط (يبدأ التطبيق ويستعيد البيانات)
   يُحمَّل آخر ملف.
   ============================================================ */

/* ---------- الإقلاع ---------- */
$('bk').innerHTML = ic('back'); $('srb').innerHTML = ic('search'); $('lkb').innerHTML = I('lock'); $('syb').innerHTML = I('cloud');
S.trash = S.trash.filter(t => Date.now() - t.t < 2592e6);
try { navigator.storage.persist(); } catch (e) { }
startHistory();
render();
function boot2() {
  if (!S.users.length) { admSet(true); setup(); }
  else if (S.pin && ((isAdmin() && !admOk()) || !S.users.some(u => u.name == S.me))) lgShow();
  try {
    const last = +localStorage.getItem('shopLast') || 0;   // آخر نشاط: إن أغلقه أندرويد وفُتح بعد المدة نفسها نقفل
    if (lkNeeded() && !$('lg') && (localStorage.getItem('shopLock') == '1' || (last && Date.now() - last > lkSecs() * 1000))) lkShow();
  } catch (e) { }
}
function bkBest() {
  return AUTOBK.all().then(all => {
    let b = null;
    Object.keys(all).forEach(k => { const r = all[k]; if (r && r.data && (r.data.users || []).length) { const z = bkSize(r.data); if (!b || z > b.z || (z == b.z && r.at > b.rec.at)) b = { k, rec: r, z }; } });
    return b;
  });
}
function bootRescue() {
  const go2 = () => { LOAD_BAD = 0; boot2(); };
  if (!(LOAD_BAD || !S.users.length)) return boot2();
  bkBest().then(b => {
    if (!b) return go2();
    sure('لا توجد بيانات سليمة على هذا الجهاز، لكن وُجدت نسخة تلقائية بتاريخ ' + fd(b.rec.at) + ' فيها ' + b.z + ' سجلاً. استعادتها؟', 'استعادة', false).then(y => {
      if (!y) return go2();
      LOAD_BAD = 0; S = { ...load(), ...b.rec.data }; save(); location.reload();
    });
  }).catch(go2);
}
bootRescue();
imgInit();

