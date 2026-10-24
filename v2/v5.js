/* ===== قفل سريع ===== */
function lkShow(){if($('lk'))return;document.body.insertAdjacentHTML('beforeend','<div id="lk" style="position:fixed;inset:0;z-index:60;background:var(--bg);display:flex;flex-direction:column;justify-content:center;gap:12px;padding:24px"><h2 style="text-align:center">🔒 التطبيق مقفل</h2><input id="lki" type="tel" placeholder="الرمز" onkeydown="if(event.key===\'Enter\')lkTry()"><button class="btn" onclick="lkTry()">فتح</button></div>')}
function lkTry(){const c=$('lki').value;if(c&&(hs(c)==S.cfg.lk||hs(c)==S.pin)){localStorage.removeItem('shopLock');$('lk').remove()}else{$('lki').value='';$('lki').placeholder='رمز خاطئ'}}
function lkSet(go2){if(!isAdmin())return toast('للمدير فقط');ask('رمز القفل السريع',[{k:'p',l:'رمز بسيط (أرقام)',t:'password'}]).then(v=>{if(v&&v.p){upd(()=>S.cfg.lk=hs(v.p));if(go2===true)lockNow()}})}
function lockNow(){if(!S.cfg.lk)return isAdmin()?lkSet(true):toast('المدير يعيّن رمز القفل من المزيد');try{localStorage.setItem('shopLock','1')}catch(e){}lkShow()}
$('me').insertAdjacentHTML('beforebegin','<button id="lkb" class="ib" onclick="lockNow()">🔒</button>');
const _st5=VW.st;VW.st=function(){const o=_st5();o.h+=row('رمز القفل السريع','lkSet()',S.cfg.lk?'مُعيَّن':'غير مُعيَّن');return o};
/* ===== مسح الباركود ===== */
let BS=null,BI=0,BCODE='';
function bcStop(){clearInterval(BI);if(BS){BS.getTracks().forEach(t=>t.stop());BS=null}}
function bcScan(cb){if(!('BarcodeDetector' in window)||!navigator.mediaDevices)return toast('هذا المتصفح لا يدعم المسح بالكاميرا');
$('sh').innerHTML='<div class="bar"></div><h3>وجّه الكاميرا نحو الباركود</h3><video id="bcv" autoplay playsinline muted style="width:100%;border-radius:14px"></video><button class="btn s" onclick="finish(null)">إلغاء</button>';
sheetOpen(v=>{bcStop();if(v)cb(v)});const d=new BarcodeDetector();
navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(s=>{if(!SH){s.getTracks().forEach(t=>t.stop());return}BS=s;const v=$('bcv');v.srcObject=s;BI=setInterval(()=>{d.detect(v).then(r=>{if(r[0]&&BS){const c=r[0].rawValue;bcStop();finish(c)}}).catch(()=>{})},400)}).catch(()=>{toast('تعذر فتح الكاميرا');if(SH)finish(null)})}
const bcLbl=i=>i.sec=='phones'?i.brand+' '+i.name:i.sec=='case'?i.name:acName(i);
function bcHome(){bcScan(c=>{BCODE=c;const m=S.items.filter(i=>i.code==c&&i.sec!='glass'),r=$('res');if(!r)return;r.innerHTML=m.length?m.map(card).join(''):`<p class="m">رمز غير مسجل: ${esc(c)}</p><button class="btn" onclick="bcLink()">ربطه بعنصر</button>`})}
function bcLink(){$('sh').innerHTML='<div class="bar"></div><h3>ربط الرمز بعنصر</h3><label>ابحث عن العنصر<input oninput="bcF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>';sheetOpen(()=>{});bcF('')}
function bcF(q){const n=nz(q);$('pr').innerHTML=S.items.filter(i=>i.sec!='glass'&&n&&nz(hay(i)).includes(n)).slice(0,8).map(i=>`<button class="card row2" onclick="bcSet('${i.id}')"><b>${esc(bcLbl(i))}</b></button>`).join('')}
function bcSet(id){const i=find(id);upd(()=>{i.code=BCODE});finish(null);toast('تم الربط')}
const _H5=VW.home;VW.home=function(){const r=_H5();r.h=r.h.replace('<div id="res"></div>','<button class="btn s" onclick="bcHome()">📷 مسح باركود</button><div id="res"></div>');return r};
try{if(localStorage.getItem('shopLock')=='1'&&S.cfg.lk)lkShow()}catch(e){}
render();
