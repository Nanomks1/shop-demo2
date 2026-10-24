const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const IC={home:'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',sl:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',back:'<path d="M5 12h14M12 5l7 7-7 7"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const TG={brand:'الماركات',color:'الألوان',cap:'السعات',ram:'RAM',gender:'الجنس',kind:'نوع الإكسسوار',conn:'الموصل',tier:'الفئات السعرية',glass:'أنواع الزجاج'};
const PL={del:'الحذف',price:'تعديل الأسعار',tags:'إدارة الوسوم',fields:'إدارة الحقول'};
const DEF={me:'',users:[],pin:'',perm:{del:'a',price:'a',tags:'a',fields:'a'},cfg:{fs:17,th:'a'},tags:{brand:['Samsung','Xiaomi','Redmi','Realme','Oppo','Vivo','Tecno','Infinix','iPhone','Itel'],color:['أسود','أبيض','أزرق','أحمر','أخضر','ذهبي','فضي','وردي'],cap:['32GB','64GB','128GB','256GB','512GB'],ram:['2GB','3GB','4GB','6GB','8GB','12GB'],gender:['رجالي','نسائي'],kind:['كابل','شاحن','رأس شاحن','USB','كارت ميموري','سماعة','باور بانك'],conn:['micro','type-c','lightning'],tier:['10','15','20','25','30','40','50'],glass:['عادي','Super Full Glue','Privacy']},items:[],rp:[],trash:[],req:[]};
function load(){let o={};try{o=JSON.parse(localStorage.getItem('shop3')||'{}')}catch(e){}const d=JSON.parse(JSON.stringify(DEF));return{...d,...o,tags:{...d.tags,...o.tags},perm:{...d.perm,...o.perm},cfg:{...d.cfg,...o.cfg}}}
let S=load(),V={v:'home'},Q='',QP=0,SH=false,SHR=null,ARM=0,TT;
const save=()=>{try{localStorage.setItem('shop3',JSON.stringify(S))}catch(e){toast('الذاكرة ممتلئة')}};
const hs=s=>{let h=5381;for(const c of String(s))h=(h*33^c.charCodeAt(0))>>>0;return h.toString(36)};
const isAdmin=()=>!!(S.users.find(u=>u.name==S.me)||{}).admin;
const can=k=>S.perm[k]=='e'||isAdmin();
const fd=t=>{const d=new Date(t),p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}/${p(d.getMonth()+1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`};
function toast(msg,undo){const t=$('ts');t.innerHTML=`<span>${esc(msg)}</span>`+(undo?'<button id="tu">تراجع</button>':'');t.hidden=false;if(undo)$('tu').onclick=()=>{undo();save();render();t.hidden=true};clearTimeout(TT);TT=setTimeout(()=>t.hidden=true,6000)}
function go(v,p){V={v,...p};Q='';QP=0;history.pushState({V},'');render()}
function sq(q){if(q&&!QP){QP=1;history.pushState({V,q:1},'')}Q=q;const r=$('res');if(r)r.innerHTML=q?`<p class="m">نتائج البحث عن «${esc(q)}» تظهر بعد بناء الأقسام.</p>`:''}
addEventListener('popstate',e=>{const s=e.state||{};if(SH){hideSheet();return}
if(s.root){if(Date.now()-ARM<2500){history.back();return}ARM=Date.now();toast('اضغط رجوع مرة أخرى للخروج');history.pushState({V:{v:'home'}},'');return}
V=s.V||{v:'home'};Q='';QP=0;render()});
history.replaceState({root:1},'');history.pushState({V},'');
function sheetOpen(res){SH=true;SHR={res,val:null};$('ov').hidden=false;history.pushState({V,sh:1},'')}
function hideSheet(){$('ov').hidden=true;SH=false;const r=SHR;SHR=null;r&&r.res(r.val)}
const finish=v=>{if(SHR)SHR.val=v;history.back()};
$('ov').onclick=e=>{if(e.target.id=='ov')finish(null)};
function ask(title,F,ok='حفظ',danger){return new Promise(res=>{
$('sh').innerHTML=`<div class="bar"></div><h3>${esc(title)}</h3>`+F.map(f=>`<label>${esc(f.l)}`+(f.t=='area'?`<textarea id="f_${f.k}">${esc(f.v)}</textarea>`:f.t=='sel'?`<select id="f_${f.k}">${f.o.map(o=>`<option ${o==f.v?'selected':''}>${esc(o)}</option>`).join('')}</select>`:`<input id="f_${f.k}" type="${f.t||'text'}" value="${esc(f.v)}">`)+'</label>').join('')+`<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn ${danger?'d':''}" id="so">${esc(ok)}</button></div>`;
sheetOpen(res);$('so').onclick=()=>{const o={};F.forEach(f=>o[f.k]=$('f_'+f.k).value);finish(o)};const i=$('sh').querySelector('input');if(i&&!i.value)setTimeout(()=>i.focus(),150)})}
function sure(msg,ok='نعم',danger=true){return new Promise(res=>{$('sh').innerHTML=`<div class="bar"></div><h3>${esc(msg)}</h3><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn ${danger?'d':''}" onclick="finish(1)">${esc(ok)}</button></div>`;sheetOpen(res)}).then(v=>!!v)}
function upd(fn){fn();save();render()}
const snap=()=>JSON.stringify({items:S.items,req:S.req,tags:S.tags,rp:S.rp.map(r=>({...r,img:r.img?1:0}))});
function commit(label,fn){const b=snap(),im=Object.fromEntries(S.rp.map(r=>[r.id,r.img]));fn();save();render();toast(label,()=>{const o=JSON.parse(b);S.items=o.items;S.req=o.req;S.tags=o.tags;S.rp=o.rp.map(r=>({...r,img:im[r.id]||''}))})}
function del(coll,id,label){if(!can('del'))return toast('الحذف للمدير فقط');sure('حذف «'+label+'» ؟').then(y=>{if(!y)return;const i=S[coll].findIndex(x=>x.id==id);if(i<0)return;const o=S[coll].splice(i,1)[0],t={id:uid(),coll,obj:o,label,t:Date.now()};S.trash.push(t);save();render();toast('تم الحذف',()=>restore(t.id))})}
function restore(id){const t=S.trash.find(x=>x.id==id);if(!t)return;S.trash=S.trash.filter(x=>x!=t);S[t.coll].push(t.obj);save();render()}
const row=(l,fn,sub)=>`<button class="card row2" onclick="${fn}"><b>${esc(l)}</b><span class="m">${esc(sub||'')}</span></button>`;
const NV=[['home','home','الرئيسية'],['rp','tool','الصيانة'],['rep','list','التقرير'],['st','sl','المزيد']];
const soon=t=>({t,h:'<div class="card"><b>يُبنى في المرحلة القادمة</b><p class="m">هذا القسم لم يُنقل إلى النسخة الجديدة بعد، والنسخة القديمة ما زالت تعمل.</p></div>'});
const VW={
home:()=>({t:'محلنا',h:`<input placeholder="ابحث..." value="${esc(Q)}" oninput="sq(this.value)"><div id="res"></div><h3>الأقسام</h3><div class="grid">${[['phones','الهواتف'],['glass','الأنتي كاس'],['case','البوشيط'],['acc','الإكسسوارات']].map(([k,n])=>`<button class="card" onclick="go('sec',{k:'${k}'})">${n}</button>`).join('')}</div>`,a:()=>sq(Q)}),
sec:()=>soon('قسم'),rp:()=>soon('الصيانة'),rep:()=>soon('التقرير'),
st:()=>({t:'المزيد',h:row('المستخدمون والصلاحيات',"go('st_users')")+row('الوسوم','go(\'st_tags\')')+row('المظهر',"go('st_look')")+row('النسخ الاحتياطي',"go('st_bk')")+row('المحذوفات',"go('st_trash')",S.trash.length||'')}),
st_users:()=>{const a=isAdmin();return{t:'المستخدمون',h:S.users.map((u,i)=>`<div class="card row2"><b>${esc(u.name)}</b><span class="m">${u.admin?'مدير':'موظف'}</span>${a?`<button class="btn s sm" onclick="uEd(${i})">تعديل</button>`:''}</div>`).join('')+(a?`<button class="btn" onclick="uAdd()">+ مستخدم</button><button class="btn s" onclick="pinCh()">تغيير رمز المدير</button><h3>الصلاحيات</h3>`+Object.keys(PL).map(k=>`<div class="card row2"><b>${PL[k]}</b><button class="btn s sm" onclick="pTog('${k}')">${S.perm[k]=='a'?'المدير فقط':'الجميع'}</button></div>`).join(''):'<p class="m">التعديل للمدير فقط.</p>')}},
st_tags:()=>({t:'الوسوم',h:Object.keys(TG).map(g=>row(TG[g],`go('st_tg',{g:'${g}'})`,S.tags[g].length)).join('')}),
st_tg:()=>{const g=V.g;return{t:TG[g],h:(can('tags')?'':'<p class="m">التعديل للمدير فقط.</p>')+`<div>${S.tags[g].map((t,i)=>`<span class="tag">${esc(t)}${can('tags')?`<b onclick="tgDel('${g}',${i})">×</b>`:''}</span>`).join('')}</div>`+(can('tags')?`<button class="btn" onclick="tgAdd('${g}')">+ إضافة</button>`:'')}},
st_look:()=>({t:'المظهر',h:`<h3>حجم الخط</h3>${[[15,'صغير'],[17,'عادي'],[19,'كبير'],[21,'أكبر']].map(([v,l])=>`<button class="tag ${S.cfg.fs==v?'on':''}" onclick="upd(()=>S.cfg.fs=${v})">${l}</button>`).join('')}<h3>المظهر</h3>${[['a','تلقائي'],['l','نهاري'],['d','ليلي']].map(([v,l])=>`<button class="tag ${S.cfg.th==v?'on':''}" onclick="upd(()=>S.cfg.th='${v}')">${l}</button>`).join('')}`}),
st_bk:()=>({t:'النسخ الاحتياطي',h:'<button class="btn" onclick="BKP()">حفظ ملف النسخة</button><label>استعادة من ملف<input type="file" accept=".json" onchange="RST(this.files[0])"></label>'}),
st_trash:()=>({t:'المحذوفات (30 يوماً)',h:S.trash.map(t=>`<div class="card row2"><div style="flex:1"><b>${esc(t.label)}</b><div class="m"><bdi>${fd(t.t)}</bdi></div></div><button class="btn s sm" onclick="restore('${t.id}')">استرجاع</button></div>`).join('')||'<p class="m">لا شيء</p>'})};
function render(){const r=(VW[V.v]||VW.home)();$('ti').textContent=r.t;$('bk').hidden=V.v=='home';$('me').textContent=S.me;$('m').innerHTML=r.h;
$('nv').innerHTML=NV.map(([k,i,l])=>`<button class="${V.v.startsWith(k)?'on':''}" onclick="go('${k}')">${ic(i)}<span>${l}</span></button>`).join('');
document.documentElement.dataset.th=S.cfg.th;document.documentElement.style.setProperty('--fs',S.cfg.fs+'px');r.a&&r.a()}
const adm=()=>S.users.filter(u=>u.admin).length;
function uAdd(){ask('مستخدم جديد',[{k:'n',l:'الاسم'},{k:'r',l:'الدور',t:'sel',o:['موظف','مدير'],v:'موظف'}]).then(v=>{if(v&&v.n.trim())upd(()=>S.users.push({name:v.n.trim(),admin:v.r=='مدير'}))})}
function uEd(i){const u=S.users[i];ask(u.name,[{k:'r',l:'الدور',t:'sel',o:['موظف','مدير'],v:u.admin?'مدير':'موظف'},{k:'x',l:'حذف المستخدم؟',t:'sel',o:['لا','نعم'],v:'لا'}]).then(v=>{if(!v)return;if((v.x=='نعم'||v.r=='موظف')&&u.admin&&adm()<2)return toast('يجب أن يبقى مدير واحد على الأقل');upd(()=>{if(v.x=='نعم')S.users.splice(i,1);else u.admin=v.r=='مدير'})})}
function pTog(k){upd(()=>S.perm[k]=S.perm[k]=='a'?'e':'a')}
function pinCh(){ask('رمز المدير الجديد',[{k:'p',l:'الرمز',t:'password'}]).then(v=>{if(v&&v.p)upd(()=>S.pin=hs(v.p))})}
function who(){ask('من أنت؟',[{k:'u',l:'المستخدم',t:'sel',o:S.users.map(u=>u.name),v:S.me}],'اختيار').then(v=>{if(!v)return;const u=S.users.find(x=>x.name==v.u);if(!u.admin||u.name==S.me)return sw(u.name);ask('رمز المدير',[{k:'p',l:'الرمز',t:'password'}],'دخول').then(p=>{if(p)hs(p.p)==S.pin?sw(u.name):toast('الرمز خاطئ')})})}
const sw=n=>upd(()=>S.me=n);
function tgAdd(g){ask('وسم جديد: '+TG[g],[{k:'t',l:'الاسم'}]).then(v=>{const t=v&&v.t.trim();if(t&&!S.tags[g].includes(t))upd(()=>S.tags[g].push(t))})}
function tgDel(g,i){sure('حذف الوسم «'+S.tags[g][i]+'» ؟').then(y=>{if(!y)return;const o=[...S.tags[g]];upd(()=>S.tags[g].splice(i,1));toast('تم الحذف',()=>{S.tags[g]=o})})}
function BKP(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='shop-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click()}
function RST(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.users)throw 0;sure('استبدال كل البيانات الحالية بالنسخة؟','استعادة').then(y=>{if(y){S={...load(),...d};save();location.reload()}})}catch(e){toast('ملف غير صالح')}};r.readAsText(f)}
function setup(){ask('مرحباً! إعداد المدير',[{k:'n',l:'اسمك'},{k:'p',l:'رمز المدير (يحمي الصلاحيات)',t:'password'}],'ابدأ').then(v=>{if(!v||!v.n.trim()||!v.p)return setup();S.users=[{name:v.n.trim(),admin:true}];S.me=v.n.trim();S.pin=hs(v.p);save();render()})}
$('bk').innerHTML=ic('back');
S.trash=S.trash.filter(t=>Date.now()-t.t<2592e6);
try{navigator.storage.persist()}catch(e){}
render();if(!S.users.length)setup();
