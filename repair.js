D.rp=D.rp||[];
const RK=['شاشة مكسورة','بدون SIM','مطفأ لا يشتغل','البصمة لا تعمل','بدون غطاء'],TB={in:'في المحل',rd:'جاهز',dn:'الأرشيف'};
let ZR,ZP=[],ZK=[],ZI='',ZD=0;
const num=t=>{t=String(t).replace(/\D/g,'');return t[0]=='0'?'212'+t.slice(1):t};
const rem=r=>r.fee&&!isNaN(r.fee)?(+r.fee)-(+r.dep||0):'';
const dd=t=>Math.floor((Date.now()-t)/864e5);
const PI=s=>{const p=i=>[20+40*(i%3),20+40*Math.floor(i/3)];return (s.length>1?`<polyline fill="none" stroke="#3b82f6" stroke-width="4" points="${s.map(i=>p(i).join(',')).join(' ')}"/>`:'')+[...Array(9).keys()].map(i=>`<circle cx="${p(i)[0]}" cy="${p(i)[1]}" r="${s.includes(i)?7:5}" fill="${s[0]==i?'#22c55e':s.includes(i)?'#3b82f6':'#94a3b8'}"/>`).join('')};
document.body.insertAdjacentHTML('beforeend',`<dialog id="zdlg"><div>
<input id="zn" placeholder="اسم الزبون"><input id="zt" type="tel" placeholder="رقم الهاتف" oninput="RH()"><div id="zh" class="m"></div>
<input id="zv" placeholder="نوع الهاتف"><input id="zf" placeholder="العطل (المشكل)">
<div class="m">حالة الجهاز عند الاستلام</div><div id="zk"></div>
<input id="zd" placeholder="العربون"><input id="zc" placeholder="السعر أو السقف المتفق عليه">
<input id="zp" placeholder="ينتظر قطعة (اختياري)"><input id="zfee" placeholder="أجرة الإصلاح النهائية">
<input id="zl" placeholder="رمز PIN (إن وجد)"><div class="m">نمط القفل (ارسمه بإصبعك)</div>
<svg id="zsv" viewBox="0 0 120 120" width="150" style="touch-action:none;background:var(--bg);border-radius:12px" onpointerdown="ZD=1;PH(event,1)" onpointermove="if(ZD)PH(event)" onpointerup="ZD=0" onpointercancel="ZD=0"></svg> <button class="g" onclick="ZP=[];$('zsv').innerHTML=PI(ZP)">مسح</button>
<div style="margin-top:6px"><input id="zi" type="file" accept="image/*" onchange="IM(this.files[0])"><img id="zim" hidden style="width:100%;border-radius:10px"></div>
<textarea id="znt" placeholder="ملاحظة"></textarea>
<select id="zs" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--b);background:var(--c);color:var(--t)"><option value="in">في المحل</option><option value="rd">جاهز</option><option value="dn">الأرشيف</option></select>
<div class="row"><button class="sp" onclick="RV()">حفظ</button><button class="g" onclick="$('zdlg').close()">إلغاء</button><button id="zx" class="g" onclick="RX()">🗑</button></div></div></dialog>`);
function PH(e,d){const s=$('zsv').getBoundingClientRect(),x=(e.clientX-s.left)/s.width*120,y=(e.clientY-s.top)/s.height*120;if(d)ZP=[];for(let i=0;i<9;i++)if(!ZP.includes(i)&&Math.hypot(20+40*(i%3)-x,20+40*Math.floor(i/3)-y)<14)ZP.push(i);$('zsv').innerHTML=PI(ZP)}
function IM(f){if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,560/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ZI=c.toDataURL('image/jpeg',.55);$('zim').src=ZI;$('zim').hidden=false};im.src=URL.createObjectURL(f)}
function ZC(){$('zk').innerHTML=RK.map(k=>`<span class="chip ${ZK.includes(k)?'on':''}" onclick="ZT('${k}')">${k}</span>`).join('')}
function ZT(k){ZK=ZK.includes(k)?ZK.filter(x=>x!=k):[...ZK,k];ZC()}
function RH(){const t=$('zt').value.replace(/\D/g,''),m=t.length>5?D.rp.filter(r=>(!ZR||r.id!=ZR.id)&&String(r.tel).replace(/\D/g,'')==t):[];$('zh').textContent=m.length?`زبون سابق: ${m.length} مرة، آخرها ${m[m.length-1].dev}`:''}
function RE(id){ZR=id?D.rp.find(r=>r.id==id):null;const r=ZR||{};
[['zn','name'],['zt','tel'],['zv','dev'],['zf','fault'],['znt','note'],['zd','dep'],['zc','cap'],['zp','part'],['zfee','fee'],['zl','lock']].forEach(([i,k])=>$(i).value=r[k]||'');
$('zs').value=r.st||'in';ZP=[...(r.pat||[])];ZK=[...(r.chk||[])];ZI=r.img||'';$('zim').src=ZI;$('zim').hidden=!ZI;$('zi').value='';$('zx').hidden=!id;$('zsv').innerHTML=PI(ZP);ZC();RH();$('zdlg').showModal()}
function rt(r){r.at=Date.now();r.lb=D.staff;try{save()}catch(e){alert('الذاكرة ممتلئة: احذف صوراً قديمة')}R()}
function RV(){const n=$('zn').value.trim(),f=$('zf').value.trim();if(!n||!f)return alert('الاسم والعطل مطلوبان');
let r=ZR;if(!r){r={id:uid(),st:'in',t0:Date.now(),by:D.staff,calls:[]};D.rp.push(r)}
Object.assign(r,{name:n,tel:$('zt').value.trim(),dev:$('zv').value.trim(),fault:f,note:$('znt').value,dep:$('zd').value,cap:$('zc').value,fee:$('zfee').value,part:$('zp').value,lock:$('zl').value,pat:ZP,chk:ZK,img:ZI});
const s=$('zs').value;if(s!=r.st){r.st=s;if(s=='rd')r.t1=Date.now()}
$('zdlg').close();rt(r)}
function RX(){if(confirm('حذف هذا الهاتف نهائياً؟')){D.rp=D.rp.filter(r=>r!=ZR);$('zdlg').close();rt({})}}
function RD(id,res){const r=D.rp.find(x=>x.id==id);r.st='rd';r.res=res;r.t1=Date.now();if(res=='ok'){const f=prompt('أجرة الإصلاح؟',r.fee||r.cap||'');if(f!==null)r.fee=f}else r.fee='';rt(r)}
function DV(id){if(!confirm('هل سلّمت الهاتف لصاحبه؟'))return;const r=D.rp.find(x=>x.id==id);r.st='dn';r.t2=Date.now();r.dby=D.staff;r.pat=[];r.lock='';rt(r)}
function CL(id){const r=D.rp.find(x=>x.id==id);(r.calls=r.calls||[]).push(new Date().toLocaleDateString('ar')+' '+D.staff);rt(r)}
function WA(id,k){const r=D.rp.find(x=>x.id==id),m=rem(r);
const s=k?(r.res=='ok'?`هاتفك ${r.dev} جاهز في المحل.${r.fee?' تكلفة الإصلاح: '+r.fee+(r.dep?'، المتبقي: '+m:'')+'.':''}`:r.res=='fail'?`للأسف تعذّر إصلاح هاتفك ${r.dev}. يمكنك استلامه من المحل.`:`هاتفك ${r.dev} جاهز للاستلام بدون إصلاح.`):`استلمنا هاتفك ${r.dev} (${r.fault}).${r.dep?' العربون: '+r.dep+'.':''} سنبلغك عند جاهزيته.`;
location.href='https://wa.me/'+num(r.tel)+'?text='+encodeURIComponent(`مرحباً ${r.name}، `+s+' شكراً لثقتكم.')}
function rc(r){const n=dd(r.t0),w=r.st=='rd'?dd(r.t1||r.t0):0,m=rem(r),B=(t,f,g)=>`<button class="${g?'g':''}" onclick="${f}">${t}</button>`;
return `<div class="card"><div class="row">${r.img?`<img src="${r.img}" style="width:56px;height:56px;object-fit:cover;border-radius:10px">`:''}<div class="sp"><b onclick="RE('${r.id}')">${esc(r.name)}</b><div class="m">${esc(r.dev)} — ${esc(r.fault)}</div></div>${r.st=='in'&&(r.pat||[]).length>1?`<svg viewBox="0 0 120 120" width="56">${PI(r.pat)}</svg>`:''}<button class="g" onclick="RE('${r.id}')">✎</button></div>`
+`<div class="m"><a href="tel:${esc(r.tel)}">${esc(r.tel)}</a> · ${n?'منذ '+n+' يوم':'اليوم'}${r.part?' · ⏳ ينتظر: '+esc(r.part):''}${w>15?' · ⏰ منسي منذ '+w+' يوم':''}${(r.calls||[]).length?' · 📞'+r.calls.length:''}${r.lock?' · 🔑 '+esc(r.lock):''}</div>`
+((r.chk||[]).length?`<div class="m">⚠ ${esc(r.chk.join('، '))}</div>`:'')+(r.dep?`<div class="m">عربون: ${esc(r.dep)}</div>`:'')+(r.cap?`<div class="m">السعر المتفق: ${esc(r.cap)}</div>`:'')
+(r.st!='in'?`<div class="m">${r.res=='ok'?'✔ تم الإصلاح':r.res=='fail'?'✖ تعذّر':r.res=='ref'?'رفض الإصلاح':''}${r.fee?' · الأجرة: '+esc(r.fee):''}${m!==''&&r.st=='rd'?' · المتبقي: '+m:''}</div>`:'')
+(r.note?`<div class="m">${esc(r.note)}</div>`:'')
+`<div class="row" style="flex-wrap:wrap">${r.st=='in'?B('✔ تم الإصلاح',`RD('${r.id}','ok')`)+B('تعذّر',`RD('${r.id}','fail')`,1)+B('رفض',`RD('${r.id}','ref')`,1)+B('وصل واتساب',`WA('${r.id}',0)`,1):r.st=='rd'?B('إبلاغ واتساب',`WA('${r.id}',1)`)+B('📞 اتصلت',`CL('${r.id}')`,1)+B('تم التسليم',`DV('${r.id}')`,1):`<span class="m">سُلِّم: ${esc(r.dby||'')} · ${new Date(r.t2||r.at).toLocaleDateString('ar')}</span>`}</div></div>`}
function RL(){const q=(V.q||'').trim().toLowerCase();$('rl').innerHTML=D.rp.filter(r=>q?(r.name+' '+r.tel+' '+r.dev+' '+r.fault).toLowerCase().includes(q):r.st==V.tab).sort((x,y)=>y.t0-x.t0).map(rc).join('')||'<p class="m">لا شيء</p>'}
function RR(){$('b').hidden=false;$('t').textContent='الصيانة';$('s').textContent='👤 '+D.staff;
$('m').innerHTML=`<input id="rq" placeholder="🔍 اسم، رقم، جهاز، عطل" value="${esc(V.q)}" oninput="V.q=this.value;RL()"><div class="row">${Object.keys(TB).map(k=>`<button class="sp ${V.tab==k?'':'g'}" onclick="V.tab='${k}';V.q='';R()">${TB[k]} (${D.rp.filter(r=>r.st==k).length})</button>`).join('')}</div><button style="width:100%" onclick="RE(0)">+ استلام هاتف</button><div id="rl"></div>`;RL()}
const _R=R,_RS=RS;
R=function(){V.v=='rp'?RR():_R()};
RS=function(){_RS();if(!Q.trim())$('res').insertAdjacentHTML('afterbegin',`<button class="card" style="width:100%;margin:0 0 8px" onclick="V={v:'rp',tab:'in',q:''};R()">🛠️ الصيانة<div class="m">في المحل ${D.rp.filter(r=>r.st=='in').length} · جاهز ${D.rp.filter(r=>r.st=='rd').length}</div></button>`)};
R();