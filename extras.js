const AL={'ايفون':'iphone','سامسونج':'samsung','سامسونغ':'samsung','شاومي':'xiaomi','ريدمي':'redmi','ريلمي':'realme','هواوي':'huawei','اوبو':'oppo','فيفو':'vivo','تكنو':'tecno','انفنكس':'infinix','انفينيكس':'infinix','ايتل':'itel','نوكيا':'nokia'};
const nz=s=>{s=String(s||'').toLowerCase().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064B-\u0652]/g,'');for(const k in AL)s=s.split(k).join(AL[k]);return s.replace(/[\s\-_]/g,'')};
const TH={l:'--bg:#f4f6f8;--c:#fff;--t:#1a202c;--m:#718096;--b:#e2e8f0;--p:#2563eb',d:'--bg:#0f172a;--c:#1e293b;--t:#f1f5f9;--m:#94a3b8;--b:#334155;--p:#3b82f6'};
D.cfg=D.cfg||{fs:16,th:'a'};D.staffs=D.staffs||[D.staff];D.req=D.req||[];
$('s').insertAdjacentHTML('beforebegin','<button id="ud" class="g" hidden onclick="UN()">↩</button>');
function AP(){document.body.style.fontSize=D.cfg.fs+'px';let s=$('thm');if(!s){s=document.createElement('style');s.id='thm';document.head.appendChild(s)}s.textContent=TH[D.cfg.th]?`:root{${TH[D.cfg.th]}}`:''}
const sn=()=>JSON.stringify({i:D.items,r:D.rp.map(r=>({...r,img:r.img?1:0})),q:D.req});
let LAST=sn(),U=[];
function chg(){const j=sn();if(j!=LAST){U.push(LAST);if(U.length>15)U.shift();LAST=j}$('ud').hidden=!U.length}
function UN(){if(!U.length)return;const o=D.rp,s=JSON.parse(U.pop());D.items=s.i;D.req=s.q;D.rp=s.r.map(r=>({...r,img:(o.find(x=>x.id==r.id)||{}).img||''}));LAST=sn();save();R()}
function CF(id){const i=find(id);i.at=Date.now();i.by=D.staff;save();R()}
function RQ(){const t=(prompt('ماذا طلب الزبون ولم نجده؟ (مع رقمه إن أمكن)')||'').trim();if(t){D.req.push({id:uid(),t,by:D.staff});save();R()}}
function RQD(id){D.req=D.req.filter(r=>r.id!=id);save();R()}
function SF(v){D.cfg.fs=+v;save();AP();R()}
function SH(v){D.cfg.th=v;save();AP();R()}
function SS(j){D.staff=D.staffs[j];save();R()}
function SA(){const n=(prompt('اسم الموظف')||'').trim();if(n){D.staffs.push(n);D.staff=n;save();R()}}
function BKP(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D)],{type:'application/json'}));a.download='shop-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click()}
function RST(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.items)throw 0;if(confirm('استبدال كل البيانات الحالية بالنسخة؟')){D=d;D.rp=D.rp||[];save();location.reload()}}catch(e){alert('ملف غير صالح')}};r.readAsText(f)}
const rec=()=>[...D.items.filter(i=>i.at).map(i=>({t:i.at,s:S[i.sec]+' › '+pth(i),b:i.by})),...D.rp.filter(r=>r.at).map(r=>({t:r.at,s:'صيانة › '+r.name,b:r.lb||r.by}))].sort((a,b)=>b.t-a.t).slice(0,15).map(e=>`<div class="m">${esc(e.s)} — ${esc(e.b)} · ${new Date(e.t).toLocaleString('ar',{dateStyle:'short',timeStyle:'short'})}</div>`).join('')||'<p class="m">لا شيء</p>';
const ch=(a,cur,fn)=>a.map(([v,l])=>`<span class="chip ${cur==v?'on':''}" onclick="${fn}('${v}')">${l}</span>`).join('');
function ST(){$('b').hidden=false;$('t').textContent='الإعدادات';$('s').textContent='👤 '+D.staff;
$('m').innerHTML=`<div class="card"><b>الموظف الحالي</b><div>${D.staffs.map((n,j)=>`<span class="chip ${n==D.staff?'on':''}" onclick="SS(${j})">${esc(n)}</span>`).join('')}<span class="chip" onclick="SA()">+ جديد</span></div></div>
<div class="card"><b>حجم الخط</b><div>${ch([[14,'صغير'],[16,'عادي'],[18,'كبير'],[20,'أكبر']],D.cfg.fs,'SF')}</div><b>المظهر</b><div>${ch([['a','تلقائي'],['l','نهاري'],['d','ليلي']],D.cfg.th,'SH')}</div></div>
<div class="card"><b>نسخة احتياطية</b><div class="row"><button class="sp" onclick="BKP()">⬇ حفظ ملف النسخة</button></div><input type="file" accept=".json" onchange="RST(this.files[0])"><div class="m">اختر ملف نسخة لاستعادتها</div></div>
<div class="card"><b>آخر التعديلات</b>${rec()}</div>`}
function JL(){$('b').hidden=false;$('t').textContent='الجولة اليومية';$('s').textContent='👤 '+D.staff;
const a=D.items.filter(i=>i.at).sort((x,y)=>x.at-y.at).slice(0,30).map(i=>`<div>${item(i,true)}<button class="g" style="width:100%" onclick="CF('${i.id}')">✔ كما هو</button></div>`).join('');
$('m').innerHTML='<p class="m">الأقدم تأكيداً أولاً: اضغط ✔ إن كانت الحالة كما هي، أو غيّر اللون.</p>'+(a||'<p class="m">لا شيء</p>')}
const _R2=R,_RS2=RS,_rep=rep,_txt=txt;
R=function(){chg();V.v=='jl'?JL():V.v=='st'?ST():_R2()};
RS=function(){_RS2();const q=nz(Q);
if(!q){$('res').insertAdjacentHTML('beforeend','<div class="row" style="margin-top:8px"><button class="sp g" onclick="V={v:\'jl\'};R()">✔ الجولة</button><button class="sp g" onclick="RQ()">👤 زبون سأل</button><button class="sp g" onclick="V={v:\'st\'};R()">⚙</button></div>');return}
const m=D.items.filter(i=>nz(i.name+' '+(i.models||'')+' '+i.note+' '+pth(i)).includes(q)),g=m.filter(i=>i.sec=='glass'&&i.par),p=D.rp.filter(r=>nz(r.name+r.tel+r.dev+r.fault).includes(q));
$('res').innerHTML=(g.length?`<div class="card"><b>🔎 زجاج يطابق:</b>${g.map(i=>`<div>${EM[i.st]} ${esc(find(i.par).name)} — ${esc(i.name)}${i.models?' ('+esc(i.models)+')':''}</div>`).join('')}</div>`:'')+list(m.filter(i=>!(i.sec=='glass'&&i.par)).slice(0,40),true)+(p.length?'<h4>🛠️ صيانة</h4>'+p.map(rc).join(''):'')};
rep=function(){const p=D.rp.filter(r=>r.st=='in'&&r.part);return (D.req.length||p.length?'<h3>👤 طلبات وقطع</h3>'+D.req.map(r=>`<div class="card row"><b class="sp">${esc(r.t)}</b><span class="m">${esc(r.by)}</span><button class="g" onclick="RQD('${r.id}')">✔</button></div>`).join('')+p.map(r=>`<div class="card">⏳ قطعة: ${esc(r.part)} <span class="m">(${esc(r.dev)} — ${esc(r.name)})</span></div>`).join(''):'')+_rep()};
txt=function(){const e=[...D.req.map(r=>'👤 '+r.t),...D.rp.filter(r=>r.st=='in'&&r.part).map(r=>`⏳ ${r.part} (${r.dev})`)],b=_txt();return e.length?(b=='لا نواقص'?'':b+'\n\n')+'*طلبات وقطع*\n'+e.join('\n'):b};
AP();R();