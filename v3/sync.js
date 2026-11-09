/* ============================================================
   sync.js — المزامنة بين الأجهزة (Supabase) + تشفير انتقائي لبيانات الزبائن فقط (rp, req, used, debt ومحجوزات المخزون)
   صور الصيانة والمستعمل تُزامَن كصفوف منفصلة مشفّرة (coll=meta, id=img:معرف السجل) وتُحذف من الخادم بحذفها محلياً بعد مدة الاحتفاظ؛ الأجهزة القديمة تتجاهل صفوف meta. يُحمَّل بعد report.js وقبل app.js.
   ============================================================ */
const SY_URL='https://jvubqqvwuonvgowqwvqa.supabase.co';
const SY_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dWJxcXZ3dW9udmdvd3F3dnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NjU1MjksImV4cCI6MjEwODQ0MTUyOX0.wKnUu_HFa0eByC9ypH7kGyEeIJSUPH87hp56ZhROApw';
const SY_ARR=['items','rp','req','gg','guide','fields','ag','used','debt','tp'],SY_ONE=['tags','perm','users','pin','cfg'],SY_ENC=['rp','req','used','debt'],SY_LOC=['fs','th','fab','cmp','bcQuick','hl','ics','lkp'],syIsEnc=k=>SY_ENC.includes(k.split('/')[0])||k.startsWith('meta/img:')||k=='one/users'||k=='one/pin',SY_E0='1970-01-01T00:00:00+00:00';
const SYM={off:'متوقفة',ok:'متصلة',busy:'جارٍ المزامنة…',offline:'لا يوجد إنترنت (سيُعاد المحاولة)',err:'خطأ'};
let SYS={st:'off',msg:'',busy:false,key:null,last:null,t:0,rr:0,again:0},SYR='first';
const syLS=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
const syCfg=()=>syLS('shopSyncCfg')||{},syStt=()=>syLS('shopSyncSt')||{cur:SY_E0,curM:SY_E0,base:{},dt:{}},syPut2=s=>localStorage.setItem('shopSyncSt',JSON.stringify(s));
const syH=s=>{let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return(4294967296*(2097151&b)+(a>>>0)).toString(36)};

/* التشفير: AES-GCM بمفتاح مشتق من رمز المحل (يُحفظ كمفتاح مشتق JWK في الذاكرة لسرعة فائقة) */
const syB64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const syU8=b=>Uint8Array.from(atob(b),c=>c.charCodeAt(0));
const syDerive=code=>crypto.subtle.importKey('raw',new TextEncoder().encode(code),'PBKDF2',false,['deriveKey']).then(k=>crypto.subtle.deriveKey({name:'PBKDF2',salt:new TextEncoder().encode('shop-sync-v1'),iterations:150000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},true,['encrypt','decrypt']));
async function syGetKey(){
  if(SYS.key)return SYS.key;
  const c=syCfg();
  if(c.jwk){SYS.key=await crypto.subtle.importKey('jwk',c.jwk,{name:'AES-GCM'},false,['encrypt','decrypt']);return SYS.key}
  if(c.code){
    const k=await syDerive(c.code),jwk=await crypto.subtle.exportKey('jwk',k);
    delete c.code;delete c.pass;c.jwk=jwk;
    localStorage.setItem('shopSyncCfg',JSON.stringify(c));
    SYS.key=k;return k;
  }
  const e=new Error('enc');e.code='enc';throw e;
}
async function syEnc(t){const k=await syGetKey(),iv=crypto.getRandomValues(new Uint8Array(12)),c=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(t))),o=new Uint8Array(12+c.length);o.set(iv);o.set(c,12);return syB64(o)}
async function syDec(b){try{const k=await syGetKey(),u=syU8(b);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:u.subarray(0,12)},k,u.subarray(12)))}catch(e){const x=new Error('enc');x.code='enc';throw x}}

/* الاتصال (مع مهلة 20 ثانية) */
const syF=(u,o)=>{const a=new AbortController(),t=setTimeout(()=>a.abort(),20000);return fetch(u,{...o,signal:a.signal}).finally(()=>clearTimeout(t))};
async function syTok(pass){const c=syCfg(),t=syLS('shopSyncTok');if(t&&t.exp>Date.now()+60000&&!pass)return t.at;const H={apikey:SY_KEY,'Content-Type':'application/json'};let r;
if(t&&t.rt&&!pass)r=await syF(SY_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:H,body:JSON.stringify({refresh_token:t.rt})});
if((!r||!r.ok)&&(pass||c.pass))r=await syF(SY_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:H,body:JSON.stringify({email:c.email,password:pass||c.pass})});
if(!r||!r.ok){const e=new Error('auth');e.code='auth';throw e}const j=await r.json();localStorage.setItem('shopSyncTok',JSON.stringify({at:j.access_token,rt:j.refresh_token,exp:Date.now()+j.expires_in*1000}));return j.access_token}
async function syReq(path,opt={}){const at=await syTok(),r=await syF(SY_URL+'/rest/v1/'+path,{...opt,headers:{apikey:SY_KEY,Authorization:'Bearer '+at,'Content-Type':'application/json',...(opt.headers||{})}});if(!r.ok){const e=new Error('http '+r.status);e.code=(r.status==401||r.status==403)?'auth':r.status;throw e}return r.status==204?null:r.json()}

/* قراءة وكتابة السجلات المحلية (شاملة صور الصيانة وصور المستعمل والتعبئة) */
function syCollect(){const m={};SY_ARR.forEach(c=>(S[c]||[]).forEach(r=>{if(r&&r.id!=null)m[c+'/'+r.id]=((c=='rp'||c=='used')&&r.img)?{...r,img:'idb:'+r.id}:r}));SY_ONE.forEach(k=>{let v=S[k];if(k=='cfg'){v={...S.cfg};SY_LOC.forEach(x=>delete v[x])}m['one/'+k]=v});['rp','used'].forEach(c=>(S[c]||[]).forEach(r=>{if(r&&r.id!=null&&IMG[r.id])m['meta/img:'+r.id]=syImgStub(r.id)}));return m}
const syImgStub=id=>({l:IMG[id].length,t:IMG[id].slice(-24)});
function syApplyImg(r,k,val,st,cm){const pid=String(r.id).slice(4),rr=S.rp.find(x=>x.id==pid)||(S.used||[]).find(x=>x.id==pid);
if(val===null){if(IMG[pid]){delete IMG[pid];MEDIA.del(pid).catch(()=>{})}delete cm[k];st.base[k]={h:'',ts:r.ts,d:1};return 1}
IMG[pid]=val;MEDIA.put(pid,val).catch(e=>errLog('حفظ صورة: '+(e&&e.message||e)));if(rr)rr.img='idb:'+pid;
const sb=syImgStub(pid);cm[k]=sb;st.base[k]={h:syH(JSON.stringify(sb)),ts:r.ts};return 1}

/* دمج الوسوم بالجمع عند التزامن المتوازي بين هاتفين */
function syMergeTags(rem, hadLocalChange, tagSnap) {
  if (!rem || typeof rem != 'object') return rem;
  if (!hadLocalChange) return rem;
  const out = { ...rem };
  Object.keys(S.tags || {}).forEach(g => {
    const locArr = Array.isArray(S.tags[g]) ? S.tags[g] : [];
    const remArr = Array.isArray(rem[g]) ? rem[g] : [];
    const baseArr = (tagSnap && Array.isArray(tagSnap[g])) ? tagSnap[g] : [];
    const addedLoc = baseArr.length ? locArr.filter(x => !baseArr.includes(x)) : locArr;
    out[g] = [...new Set([...remArr, ...addedLoc])];
  });
  return out;
}

function syPut(c,id,val,hadLocalChange,st){if(c=='one'){if(id=='cfg'){const l={};SY_LOC.forEach(x=>{if(S.cfg&&x in S.cfg)l[x]=S.cfg[x]});S.cfg={...val,...l}}else if(id=='tags'&&val){S.tags=syMergeTags(val,hadLocalChange,st&&st.tagSnap)}else if(val!==null)S[id]=val;return}
const a=S[c]=S[c]||[],i=a.findIndex(x=>x.id==id);if(val===null){if(i>=0)a.splice(i,1)}else if(i>=0)a[i]=val;else a.push(val)}

/* منع تكرار أرقام تذاكر الصيانة القصيرة (Offline-Safe) وتحديث العداد بعد المزامنة */
function syFixTickets(){
  if(!Array.isArray(S.rp))return;
  const seen=new Set();let maxSeq=+(S.cfg&&S.cfg.tkSeq)||0;
  const parseSeq=tk=>{const m=String(tk||'').match(/^([A-Z])(\d{3})/);return m?(m[1].charCodeAt(0)-65)*899+(+m[2]-100):0};
  S.rp.slice().sort((a,b)=>(a.t0||0)-(b.t0||0)).forEach(r=>{
    if(!r||!r.tk)return;
    const sq=parseSeq(r.tk);if(sq>maxSeq)maxSeq=sq;
    if(!seen.has(r.tk)){seen.add(r.tk);return}
    const base=r.tk.replace(/-\d+$/,'');let n=2;
    while(seen.has(base+'-'+n))n++;
    r.tk=base+'-'+n;seen.add(r.tk);
  });
  if(S.cfg&&maxSeq>(S.cfg.tkSeq||0))S.cfg.tkSeq=maxSeq;
}

/* التحقق من صلاحية المستخدم النشط بعد المزامنة */
function syCheckUser(){
  if(!Array.isArray(S.users)||!S.users.length)return;
  let u=S.users.find(x=>x.name==S.me);
  if(!u){
    u=S.users.find(x=>x.admin)||S.users[0];
    S.me=u?u.name:'';
    if(typeof admSet=='function')admSet(false);
  }else if(!u.admin&&typeof admOk=='function'&&admOk()){
    admSet(false);
  }
}

/* اكتشاف التغييرات المحلية (لا يُستدعى إلا عند وجود تعديل فعلي) */
function syMark(){const c=syCfg();if(!c.on)return;const st=syStt(),cur=syCollect(),n=Date.now();let ch=0;
for(const k in cur){const h=syH(JSON.stringify(cur[k])),b=st.base[k];if(!b||b.h!==h){if(!st.dt[k]){st.dt[k]=n;ch=1}}else if(st.dt[k]){delete st.dt[k];ch=1}}
for(const k in st.base){if(!(k in cur)&&!st.base[k].d&&!st.dt[k]){st.dt[k]=n;ch=1}}if(ch)syPut2(st);return ch}

/* تطبيق صف قادم من الخادم */
async function syApply(r,st,cm,force){const k=r.coll+'/'+r.id,b=st.base[k];if(r.coll=='meta'&&!String(r.id).startsWith('img:'))return 0;if(!force&&b&&b.ts===r.ts)return 0;
const loc=cm[k],lh=loc===undefined?null:syH(JSON.stringify(loc)),hadLoc=b?(lh===null?!b.d:lh!==b.h):lh!==null;
if(!force&&hadLoc&&k!='one/tags')return 0;
let val=null;if(!r.deleted){let js=r.data;if(r.enc)js=await syDec(js);val=JSON.parse(js);if(r.coll=='items'&&val&&val._resEnc){val.res=JSON.parse(await syDec(val._resEnc));delete val._resEnc}}
if(r.coll=='meta')return syApplyImg(r,k,val,st,cm);
syPut(r.coll,r.id,val,hadLoc&&!st.fresh,st);
cm[k]=val===null?undefined:(k=='one/cfg'?(()=>{const v={...S.cfg};SY_LOC.forEach(x=>delete v[x]);return v})():k=='one/tags'?S.tags:val);if(val===null)delete cm[k];
const newH=val===null?'':syH(JSON.stringify(cm[k]));
if(k=='one/tags'){st.tagSnap=JSON.parse(JSON.stringify(S.tags));if(val&&newH!==syH(JSON.stringify(val)))st.dt[k]=Date.now()}
st.base[k]=val===null?{h:'',ts:r.ts,d:1}:{h:k=='one/tags'&&val?syH(JSON.stringify(val)):newH,ts:r.ts};return 1}

/* سحب سريع: السجلات النصية بدفعات كبيرة (200) والصور بدفعات خفيفة (12) */
async function syPull(st,force){
  let n=0;const cm=syCollect();
  if(!st.curM)st.curM=st.cur||SY_E0;
  for(;;){
    const rows=await syReq('records?coll=neq.meta&srv=gt.'+encodeURIComponent(st.cur)+'&order=srv.asc&limit=200');
    for(const r of rows)n+=await syApply(r,st,cm,force);
    if(rows.length)st.cur=rows[rows.length-1].srv;
    syPut2(st);
    if(rows.length<200)break;
  }
  for(;;){
    const rows=await syReq('records?coll=eq.meta&srv=gt.'+encodeURIComponent(st.curM)+'&order=srv.asc&limit=12');
    for(const r of rows)n+=await syApply(r,st,cm,force);
    if(rows.length)st.curM=rows[rows.length-1].srv;
    syPut2(st);
    if(rows.length<12)break;
  }
  return n;
}

/* دورة المزامنة */
async function syNow(){const c=syCfg();if(!c.on||LOAD_BAD)return;if(SYS.busy){SYS.again=1;return}
if(typeof navigator!='undefined'&&navigator.onLine===false){syStat('offline');return}
SYS.busy=true;syStat('busy');try{await syGetKey();let st=syStt(),chg=0;
if(st.fresh){chg+=await syPull(st,true);delete st.fresh;syPut2(st)}
if(!syCfg().eu){const s0=syStt();delete s0.base['one/users'];delete s0.base['one/pin'];syPut2(s0);const c0=syCfg();c0.eu=1;localStorage.setItem('shopSyncCfg',JSON.stringify(c0))}
syMark();st=syStt();
if(st.dt['one/tags']){const g=await syReq('records?coll=eq.one&id=eq.tags');if(g[0]&&(!st.base['one/tags']||g[0].ts!==st.base['one/tags'].ts)){const cm0=syCollect();chg+=await syApply(g[0],st,cm0,true)}}
const cur=syCollect(),rows=[],n=Date.now();
for(const k in cur){const h=syH(JSON.stringify(cur[k]));if(!st.base[k]||st.base[k].h!==h){const[cc,id]=k.split('/'),enc=syIsEnc(k);let obj=cc=='meta'?IMG[id.slice(4)]:cur[k];if(cc=='meta'&&!obj)continue;if(cc=='items'&&obj&&obj.res){obj={...obj,_resEnc:await syEnc(JSON.stringify(obj.res))};delete obj.res}const js=JSON.stringify(obj);rows.push({coll:cc,id,data:enc?await syEnc(js):js,enc,deleted:false,ts:st.dt[k]||n,who:S.me||'',_k:k,_h:h})}}
for(const k in st.base){if(!(k in cur)&&!st.base[k].d){const[cc,id]=k.split('/');rows.push({coll:cc,id,data:null,enc:false,deleted:true,ts:st.dt[k]||n,who:S.me||'',_k:k,_h:'',_d:1})}}
const dl=rows.filter(r=>r.deleted&&r.coll!='meta').length,tot=Object.keys(st.base).filter(k=>!st.base[k].d&&!k.startsWith('meta/')).length;
if(dl>=10&&dl>tot*0.5&&!SYS.okDel){SYS.big=dl;SYS.busy=false;syStat('err','توقفت المزامنة حمايةً: اختفى '+dl+' سجلاً من هذا الجهاز');return}
SYS.big=0;
const lost=[];const BT=[];{let cb=[],sz=0;for(const r of rows){const l=(r.data||'').length;if(cb.length&&(cb.length>=40||sz+l>300000)){BT.push(cb);cb=[];sz=0}cb.push(r);sz+=l}if(cb.length)BT.push(cb)}
for(const b of BT){const res=await syReq('records?on_conflict=coll,id&select=coll,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(b.map(({_k,_h,_d,...r})=>r))}),ok=new Set(res.map(x=>x.coll+'/'+x.id));
for(const r of b){st.base[r._k]=r._d?{h:'',ts:r.ts,d:1}:{h:r._h,ts:r.ts};if(r._k=='one/tags')st.tagSnap=JSON.parse(JSON.stringify(S.tags));delete st.dt[r._k];if(!ok.has(r._k))lost.push(r)}syPut2(st)}
const cm=syCollect();for(const r of lost){const g=await syReq('records?coll=eq.'+encodeURIComponent(r.coll)+'&id=eq.'+encodeURIComponent(r.id));if(g[0])chg+=await syApply(g[0],st,cm,true)}
chg+=await syPull(st,false);for(const k in st.base){if(k.startsWith('meta/img:')&&st.base[k].d&&n-st.base[k].ts>90*864e5)delete st.base[k]}syPut2(st);
if(chg){syFixTickets();syCheckUser();if(typeof glDedup=='function')glDedup();if(typeof cleanOldRpMedia=='function')cleanOldRpMedia();save();window._syDirty=0;syRender()}
SYS.okDel=0;SYS.last=Date.now();syStat('ok')}catch(e){syStat(e.code=='auth'?'err':((e instanceof TypeError||e.name=='AbortError')?'offline':'err'),e.code=='auth'?'انتهت الجلسة أو بيانات الدخول خاطئة (أعد إدخال كلمة السر)':e.code=='enc'?'رمز التشفير لا يطابق رمز المحل':(e instanceof TypeError||e.name=='AbortError')?'':'تعذّرت المزامنة ('+(e.code||e.message)+')')}
SYS.busy=false;if(SYS.again){SYS.again=0;syKick()}}
function syKick(now){clearTimeout(SYS.t);SYS.t=setTimeout(syNow,now===true?0:1500)}
function syOkBig(){if(!isAdmin())return toast('للمدير فقط');SYS.okDel=1;SYS.big=0;syKick(true)}
function syRender(){const a=(document.activeElement||{}).tagName||'';if(SH||/INPUT|TEXTAREA|SELECT/.test(a)){SYS.rr=1;return}SYS.rr=0;render()}
function syStat(s,m){SYS.st=s;SYS.msg=m||'';const d=$('syb');if(d){d.hidden=!syCfg().on;d.style.color={ok:'#16a34a',busy:'#d97706',offline:'#d97706',err:'#dc2626',off:'#94a3b8'}[s]||'#94a3b8'}if(V.v=='st_sync'&&!SH)render()}

/* الإعداد */
function syR(r){SYR=r;['first','extra'].forEach(k=>{const b=$('syr_'+k);if(b)b.classList.toggle('on',k==r)});const p=$('syn');if(p)p.textContent=r=='extra'?'سيُستبدل ما على هذا الجهاز ببيانات المحل.':'ارفع بيانات هذا الجهاز لتصير بيانات المحل.'}
function syForm(){const c=syCfg();$('sh').innerHTML=`<div class="bar"></div><h3>إعداد المزامنة</h3><label>بريد حساب المحل<input id="sye" type="email" value="${esc(c.email||'')}"></label><label>كلمة سر الحساب<input id="syp" type="password" value="" placeholder="أدخل كلمة سر الحساب"></label><label>رمز تشفير بيانات الزبائن (لا يُرفع أبداً، احفظه جيداً)<input id="syc" type="password" value="" placeholder="أدخل رمز التشفير"></label><label>هذا الجهاز</label><div><button id="syr_first" class="tag ${SYR=='first'?'on':''}" onclick="syR('first')">أول جهاز (يرفع بياناته)</button><button id="syr_extra" class="tag ${SYR=='extra'?'on':''}" onclick="syR('extra')">جهاز إضافي (يحمّل بيانات المحل)</button></div><p id="syn" class="m">${SYR=='extra'?'سيُستبدل ما على هذا الجهاز ببيانات المحل.':'ارفع بيانات هذا الجهاز لتصير بيانات المحل.'}</p><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({e:$('sye').value.trim(),p:$('syp').value,c:$('syc').value,r:SYR})">حفظ وبدء</button></div>`}
function syOpen(){if(!isAdmin())return toast('للمدير فقط');needAdm(()=>{SYR=(S.items.length||S.rp.length)?'first':'extra';syForm();sheetOpen(v=>{if(v)syStart(v)})})()}
async function syStart(v){if(!v.e||!v.p||!v.c)return toast('أكمل الحقول الثلاثة');const old=localStorage.getItem('shopSyncCfg'),oldTok=localStorage.getItem('shopSyncTok');
syStat('busy');
try{
  const k=await syDerive(v.c),jwk=await crypto.subtle.exportKey('jwk',k);
  SYS.key=k;
  localStorage.setItem('shopSyncCfg',JSON.stringify({email:v.e,jwk,on:1}));
  localStorage.removeItem('shopSyncTok');
  await syTok(v.p);
  const m=await syReq('records?coll=eq.meta&id=eq.check');
  if(m.length){if(await syDec(m[0].data)!=='ok')throw 0}else await syReq('records?on_conflict=coll,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates'},body:JSON.stringify([{coll:'meta',id:'check',data:await syEnc('ok'),enc:true,deleted:false,ts:Date.now(),who:S.me||''}])});
  /* حماية: إن كان في الخادم بيانات للمحل، لا يُسمح لجهاز فارغ برفع بياناته فوقها */
  const has=await syReq('records?coll=neq.meta&limit=1');
  if(has.length&&v.r!='extra'){
    if(!S.items.length&&!S.rp.length&&!(S.req||[]).length&&!(S.gg||[]).length){v={...v,r:'extra'};toast('المحل يحتوي بيانات: سيُحمَّل هذا الجهاز كجهاز إضافي')}
    else if(!(await sure('المحل يحتوي بيانات سابقة. رفع بيانات هذا الجهاز قد يستبدل الموظفين ورمز المدير والإعدادات على كل الأجهزة. هل تريد المتابعة؟','متابعة والرفع',false)))throw 'cancel';
  }
  if(v.r=='extra'){await snapPre();SY_ARR.forEach(c=>{S[c]=[]})}syPut2({cur:SY_E0,curM:SY_E0,base:{},dt:{},fresh:v.r=='extra'?1:0,tagSnap:JSON.parse(JSON.stringify(S.tags))});save();syKick(true);toast('بدأت المزامنة بأمان')
}catch(e){
  if(old)localStorage.setItem('shopSyncCfg',old);else localStorage.removeItem('shopSyncCfg');
  if(oldTok)localStorage.setItem('shopSyncTok',oldTok);
  SYS.key=null;syStat('off');
  toast(e==='cancel'?'أُلغي الإعداد':e&&e.code=='auth'?'بيانات الدخول خاطئة':e&&e.code=='enc'||e===0?'رمز التشفير لا يطابق رمز المحل':'تعذّر الاتصال');
}}
function syOff(){if(!isAdmin())return toast('للمدير فقط');sure('إيقاف المزامنة على هذا الجهاز؟ تبقى البيانات المحلية كما هي.','إيقاف').then(y=>{if(y){const c=syCfg();c.on=0;localStorage.setItem('shopSyncCfg',JSON.stringify(c));syStat('off');render()}})}
VW.st_sync=()=>{const c=syCfg();return{t:'المزامنة',h:c.on?`<div class="card"><b>${SYM[SYS.st]||''}</b><div class="m">${esc(SYS.msg)}${SYS.last?' · آخر مزامنة '+new Date(SYS.last).toLocaleTimeString('ar-MA'):''}</div></div>${SYS.big?`<button class="btn d" onclick="syOkBig()">اعتماد حذف ${SYS.big} سجلاً من كل الأجهزة</button>`:''}<button class="btn" onclick="syKick(true)">مزامنة الآن</button><button class="btn s" onclick="syOpen()">تغيير الإعداد</button><button class="btn s" onclick="syOff()">إيقاف المزامنة</button><p class="m">تشفير انتقائي: بيانات الزبائن (الصيانة، المستعمل، الديون، الطلبات، الحجوزات) مشفّرة على الجهاز قبل الرفع، بينما يبقى المخزون العام خفيفاً وسريعاً.</p>`:`<p class="m">بيانات المحل تصير واحدة على كل الأجهزة. بيانات الزبائن الحساسة تُشفَّر على الجهاز قبل الرفع.</p><button class="btn" onclick="syOpen()">إعداد المزامنة</button>`}};
MORE.push({g:'data',o:10,l:'المزامنة بين الأجهزة',fn:"go('st_sync')",n:()=>syCfg().on?SYM[SYS.st]:'متوقفة'});
HK.saved.push(()=>{window._syDirty=1});

/* مراقبة ذكية خفيفة جداً بدون استهلاك المعالج في الفحص المتكرر */
setInterval(()=>{
  if(window._syDirty){window._syDirty=0;if(syCfg().on&&!SYS.busy&&syMark())syKick()}
  if(SYS.rr&&!SH)syRender();
},2000);
setInterval(()=>{if(syCfg().on)syKick()},25000);
addEventListener('online',()=>syKick(true));addEventListener('visibilitychange',()=>{if(!document.hidden&&syCfg().on)syKick(true)});
syStat('off');if(syCfg().on)syKick(true);