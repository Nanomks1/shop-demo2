/* ============================================================
   base.js — النسخة الأساسية: الهواتف، الأنتي كاس، البوشيط، الإكسسوارات
   ============================================================ */
document.head.insertAdjacentHTML('beforeend','<style>.dotl{display:inline-block;width:12px;height:12px;border-radius:50%}.cn{min-width:2.2rem;text-align:center;font-weight:700}.rs{color:#b45309;font-weight:700}.sub{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.sub .btn{margin:0}</style>');
const AL={'ايفون':'iphone','سامسونج':'samsung','سامسونغ':'samsung','شاومي':'xiaomi','ريدمي':'redmi','ريلمي':'realme','هواوي':'huawei','اوبو':'oppo','فيفو':'vivo','تكنو':'tecno','انفنكس':'infinix','انفينيكس':'infinix','ايتل':'itel','نوكيا':'nokia','بوكو':'poco','هونر':'honor','ماكس':'max','برو':'pro','بلس':'plus','بلاس':'plus','الترا':'ultra','لايت':'lite','نوت':'note','سي':'c','اس':'s','تي':'t','اكس':'x','ايه':'a','جي':'g'};
const KS=Object.keys(AL).sort((a,b)=>b.length-a.length);
const nz=s=>{s=String(s||'').toLowerCase().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064B-\u0652]/g,'');for(const k of KS)s=s.split(k).join(AL[k]);return s.replace(/[\s\-_]/g,'')};
const stOf=i=>i.cnt<=0?'r':i.cnt<=(S.cfg.low||1)?'y':'g';
const DT={g:'#16a34a',y:'#d97706',r:'#dc2626'},TX={g:'متوفر',y:'قارب على النفاد',r:'نفد'};
const ph=()=>S.items.filter(i=>i.sec=='phones'),find=id=>S.items.find(i=>i.id==id);
let PF={},PR=null,PQ='';
function card(i){const s=stOf(i),t=[i.color,i.ram,i.cap,i.cond!='جديد'&&i.cond].filter(Boolean).map(esc).join(' · ');
return `<div class="card"><div class="row2"><b>${esc(i.brand+' '+i.name)}</b><span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]}</span></div>${t?`<div class="m">${t}</div>`:''}${i.res?`<div class="rs">محجوز: ${esc(i.res.n)}${i.res.d?' · عربون '+esc(i.res.d):''}</div>`:''}${i.note?`<div class="m">${esc(i.note)}</div>`:''}
<div class="row2" style="margin-top:8px"><b>${esc(i.price)}</b><button class="btn s sm" onclick="phC('${i.id}',-1)">−</button><span class="cn">${i.cnt}</span><button class="btn sm" onclick="phC('${i.id}',1)">+</button></div>
<div class="sub"><button class="btn s sm" onclick="phEd('${i.id}')">تعديل</button><button class="btn s sm" onclick="phRs('${i.id}')">${i.res?'إلغاء الحجز':'حجز'}</button><button class="btn s sm" onclick="phDel('${i.id}')">حذف</button></div></div>`}
function srch(q){const n=nz(q),m=S.items.filter(i=>nz(i.brand+i.name+i.color+i.ram+i.cap+i.note).includes(n)).slice(0,30);return m.map(card).join('')||'<p class="m">لا نتائج</p>'}
sq=function(q){if(q&&!QP){QP=1;history.pushState({V,q:1},'')}Q=q;const r=$('res');if(r)r.innerHTML=q?srch(q):''};
function phC(id,d){const i=find(id);upd(()=>{i.cnt=Math.max(0,i.cnt+d);i.by=S.me;i.at=Date.now()})}
function phDel(id){const i=find(id);del('items',id,i.brand+' '+i.name)}
function phRs(id){const i=find(id);if(i.res)return sure('إلغاء حجز '+i.res.n+' ؟').then(y=>{if(y)commit('أُلغي الحجز',()=>i.res=null)});ask('حجز لزبون',[{k:'n',l:'اسم الزبون'},{k:'d',l:'العربون',t:'tel'}],'حجز').then(v=>{if(v&&v.n.trim())commit('تم الحجز',()=>i.res={n:v.n.trim(),d:v.d.trim()})})}
function phDone(v){if(!v)return;const r=PR;
if(v.add!==undefined){commit('أُضيفت الكمية',()=>{r.cnt+=v.add;r.by=S.me;r.at=Date.now()});return}
if(r&&r.id){commit('تم التعديل',()=>Object.assign(r,v,{by:S.me,at:Date.now()}));return}
const d=ph().find(i=>i.brand==v.brand&&nz(i.name)==nz(v.name)&&i.color==v.color&&i.ram==v.ram&&i.cap==v.cap&&i.cond==v.cond);
commit(d?'أُضيفت الكمية للموجود':'تمت الإضافة',()=>{if(d){d.cnt+=v.cnt;if(v.price)d.price=v.price;d.by=S.me;d.at=Date.now()}else S.items.push({id:uid(),sec:'phones',...v,by:S.me,at:Date.now()})})}
function phAdd(){PR=null;$('sh').innerHTML=`<div class="bar"></div><h3>إضافة هاتف</h3><label>ابحث أولاً: ماركة أو موديل<input id="pf" oninput="phF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;sheetOpen(phDone);phF('')}
function phF(q){PQ=q.trim();const n=nz(q),m=ph().filter(i=>!n||nz(i.brand+i.name+i.color).includes(n)).sort((a,b)=>b.at-a.at).slice(0,6);
$('pr').innerHTML=m.map(i=>`<button class="card row2" onclick="phPick('${i.id}')"><b>${esc(i.brand+' '+i.name)}</b><span class="m">${esc([i.color,i.cap].filter(Boolean).join(' · '))} · ${i.cnt}</span></button>`).join('')+`<button class="btn" onclick="phForm({name:PQ})">+ هاتف جديد${PQ?' «'+esc(PQ)+'»':''}</button>`}
function phPick(id){const i=find(id);PR=i;$('sh').innerHTML=`<div class="bar"></div><h3>${esc(i.brand+' '+i.name)}</h3><p class="m">${esc([i.color,i.ram,i.cap].filter(Boolean).join(' · '))} — الكمية الحالية ${i.cnt}</p><label>كم قطعة وصلت؟<input id="pa" type="number" value="1"></label><div class="acts"><button class="btn s" onclick="phForm(find('${id}'))">تعديل التفاصيل</button><button class="btn" onclick="finish({add:+$('pa').value||0})">إضافة الكمية</button></div>`}
function phEd(id){$('sh').innerHTML='';sheetOpen(phDone);phForm(find(id))}
function phForm(rec){PR=rec;PF={brand:rec.brand||'',color:rec.color||'',ram:rec.ram||'',cap:rec.cap||'',cond:rec.cond||'جديد',_a:''};
$('sh').innerHTML=`<div class="bar"></div><h3>${rec.id?'تعديل هاتف':'هاتف جديد'}</h3><div id="pc"></div><label>الموديل<input id="pm" value="${esc(rec.name||'')}" placeholder="مثال: A07"></label><label>السعر<input id="pp" type="tel" value="${esc(rec.price||'')}" ${rec.id&&!can('price')?'disabled':''}></label><label>العدد<input id="pcnt" type="number" value="${rec.cnt??1}"></label><label>ملاحظة<textarea id="pt">${esc(rec.note||'')}</textarea></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="phSave()">حفظ</button></div>`;pc()}
const GL=[['brand','الماركة'],['color','اللون'],['ram','RAM'],['cap','السعة']];
function pc(){$('pc').innerHTML=GL.map(([g,l])=>`<label>${l}</label><div>${S.tags[g].map((t,j)=>`<button class="tag ${PF[g]==t?'on':''}" onclick="pk('${g}',${j})">${esc(t)}</button>`).join('')}${PF._a==g?`<span class="row2"><input id="pnew" placeholder="الاسم الجديد"><button class="btn sm" onclick="pnOk('${g}')">إضافة</button></span>`:`<button class="tag" onclick="PF._a='${g}';pc()">+ جديد</button>`}</div>`).join('')+`<label>الحالة</label><div>${['جديد','مستعمل'].map(c=>`<button class="tag ${PF.cond==c?'on':''}" onclick="PF.cond='${c}';pc()">${c}</button>`).join('')}</div>`}
function pk(g,j){const v=S.tags[g][j];PF[g]=PF[g]==v?'':v;pc()}
function pnOk(g){const t=$('pnew').value.trim();if(t){if(!S.tags[g].includes(t))S.tags[g].push(t);PF[g]=t;save()}PF._a='';pc()}
function phSave(){const n=$('pm').value.trim();if(!PF.brand||!n)return toast('اختر الماركة واكتب الموديل');finish({brand:PF.brand,name:n,color:PF.color,ram:PF.ram,cap:PF.cap,cond:PF.cond,price:$('pp').value.trim(),cnt:+$('pcnt').value||0,note:$('pt').value.trim()})}
VW.sec=function(){const k=V.k;if(k!='phones')return soon({glass:'الأنتي كاس',case:'البوشيط',acc:'الإكسسوارات'}[k]);
let a=ph().sort((x,y)=>(x.brand+x.name).localeCompare(y.brand+y.name));if(V.f)a=a.filter(i=>stOf(i)!='g');
return{t:'الهواتف',h:`<button class="btn" onclick="phAdd()">+ إضافة هاتف</button><div><button class="tag ${V.f?'':'on'}" onclick="V.f=0;render()">الكل (${ph().length})</button><button class="tag ${V.f?'on':''}" onclick="V.f=1;render()">يحتاج شراء</button></div>`+(a.map(card).join('')||'<p class="m">لا شيء بعد</p>')}};
render();

const ssum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0),GM=()=>S.gg=S.gg||[],gOf=m=>GM().find(g=>g.models.some(x=>nz(x)==nz(m))),gitem=(gid,ty)=>S.items.find(i=>i.sec=='glass'&&i.gid==gid&&i.ty==ty),gst=i=>{const t=ssum(i.stock),m=i.min??(S.cfg.gmin||10);return t<=0?'r':t<m?'y':'g'};
const hay=i=>[i.brand,i.name,i.color,i.ram,i.cap,i.note,i.kind,i.conn,i.tier,(i.v||[]).map(x=>x.g+x.c).join(' ')].join(' ');
let GS={},CS={},CP=[];
function ch(){$('cc').innerHTML=CP.map(([g,l])=>`<label>${l}</label><div>${S.tags[g].map((t,j)=>`<button class="tag ${CS[g]==t?'on':''}" onclick="ck('${g}',${j})">${esc(t)}</button>`).join('')}${CS._a==g?`<span class="row2"><input id="cnew" placeholder="الاسم الجديد"><button class="btn sm" onclick="cok('${g}')">إضافة</button></span>`:`<button class="tag" onclick="CS._a='${g}';ch()">+ جديد</button>`}</div>`).join('')}
function ck(g,j){const v=S.tags[g][j];CS[g]=CS[g]==v?'':v;ch()}
function cok(g){const t=$('cnew').value.trim();if(t){if(!S.tags[g].includes(t))S.tags[g].push(t);CS[g]=t;save()}CS._a='';ch()}
/* ===== الأنتي كاس ===== */
function glV(){const j=V.ty||0;return{t:'الأنتي كاس',h:`<button class="btn" onclick="glAdd()">+ إضافة موديل</button><div>${S.tags.glass.map((t,k)=>`<button class="tag ${k==j?'on':''}" onclick="V.ty=${k};render()">${esc(t)}</button>`).join('')}</div>`+(GM().map(g=>glCard(g,j)).join('')||'<p class="m">أضف أول موديل لتبدأ المجموعات.</p>')}}
function glCard(g,j){const ty=S.tags.glass[j],i=gitem(g.id,ty)||{stock:{}},s=gst(i),min=i.min??(S.cfg.gmin||10);
return `<div class="card"><b>${esc(g.models.join(' / '))}</b><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]} · المجموع ${ssum(i.stock)} · الحد ${min}${i.price?' · '+esc(i.price):''}</span></div>`
+g.models.map((m,k)=>`<div class="row2"><span style="flex:1">${esc(m)}</span><button class="btn s sm" onclick="glC('${g.id}',${j},${k},-1)">−</button><span class="cn">${(i.stock||{})[m]||0}</span><button class="btn sm" onclick="glC('${g.id}',${j},${k},1)">+</button></div>`).join('')
+`<div class="sub"><button class="btn s sm" onclick="glM('${g.id}')">+ موديل مطابق</button><button class="btn s sm" onclick="glMin('${g.id}',${j})">الحد والسعر</button><button class="btn s sm" onclick="glRm('${g.id}')">حذف موديل</button></div></div>`}
function glGet(gid,ty){let i=gitem(gid,ty);if(!i){i={id:uid(),sec:'glass',gid,ty,stock:{},by:S.me,at:Date.now()};S.items.push(i)}return i}
function glC(gid,j,k,d){const m=GM().find(x=>x.id==gid).models[k],i=glGet(gid,S.tags.glass[j]);upd(()=>{i.stock[m]=Math.max(0,(i.stock[m]||0)+d);i.by=S.me;i.at=Date.now()})}
function glMin(gid,j){const ty=S.tags.glass[j],i=gitem(gid,ty)||{};ask('الحد والسعر — '+ty,[{k:'m',l:'الحد الأدنى للمجموعة',t:'tel',v:i.min??(S.cfg.gmin||10)},{k:'p',l:'السعر',t:'tel',v:i.price||''}]).then(v=>{if(!v)return;const r=glGet(gid,ty);upd(()=>{r.min=+v.m||0;if(can('price'))r.price=v.p})})}
function glAdd(){GS={};$('sh').innerHTML=`<div class="bar"></div><h3>موديل جديد</h3><label>اسم الموديل<input id="gn"></label><button class="btn" onclick="glNext()">التالي</button>`;sheetOpen(()=>{})}
function glNext(){const n=$('gn').value.trim();if(!n)return;if(gOf(n))return toast('هذا الموديل مسجل');GS.n=n;$('sh').innerHTML=`<div class="bar"></div><h3>«${esc(n)}» يطابق أي موديل؟</h3><label>ابحث بين الموديلات<input oninput="glS(this.value)"></label><div id="gl"></div><button class="btn s" onclick="glNew()">لا يطابق شيئاً (مجموعة جديدة)</button>`;glS('')}
function glS(q){const k=nz(q);$('gl').innerHTML=GM().flatMap(g=>g.models.map(m=>({g,m}))).filter(x=>!k||nz(x.m).includes(k)).slice(0,8).map(x=>`<button class="card row2" onclick="glJoin('${x.g.id}')"><b>${esc(x.m)}</b><span class="m">${x.g.models.length} موديلات</span></button>`).join('')}
function glJoin(gid){const g=GM().find(x=>x.id==gid);upd(()=>g.models.push(GS.n));finish(null)}
function glNew(){upd(()=>GM().push({id:uid(),models:[GS.n]}));finish(null)}
function glM(gid){const g=GM().find(x=>x.id==gid);ask('موديل مطابق',[{k:'n',l:'الاسم'}]).then(v=>{const n=v&&v.n.trim();if(!n)return;const o=gOf(n);if(o&&o.id==gid)return toast('موجود في المجموعة');if(!o)return upd(()=>g.models.push(n));sure('«'+n+'» في مجموعة أخرى. دمج المجموعتين؟','دمج',false).then(y=>{if(y)upd(()=>glMerge(g,o))})})}
function glMerge(a,b){b.models.forEach(m=>a.models.push(m));S.items=S.items.filter(i=>{if(i.sec!='glass'||i.gid!=b.id)return true;const t=gitem(a.id,i.ty);if(!t){i.gid=a.id;return true}for(const m in i.stock)t.stock[m]=(t.stock[m]||0)+i.stock[m];return false});S.gg=GM().filter(x=>x!=b)}
function glRm(gid){const g=GM().find(x=>x.id==gid);ask('حذف موديل من المجموعة',[{k:'m',l:'الموديل',t:'sel',o:g.models,v:g.models[0]}],'حذف',true).then(v=>{if(!v)return;if(!can('del'))return toast('الحذف للمدير فقط');sure('حذف «'+v.m+'» ؟').then(y=>{if(!y)return;upd(()=>{g.models=g.models.filter(m=>m!=v.m);S.items.filter(i=>i.sec=='glass'&&i.gid==gid).forEach(i=>delete i.stock[v.m]);if(!g.models.length){S.gg=GM().filter(x=>x!=g);S.items=S.items.filter(i=>!(i.sec=='glass'&&i.gid==gid))}})})})}
function glB(g){return `<div class="card"><b>زجاج يطابق: ${esc(g.models.join(' / '))}</b>${S.tags.glass.map(t=>{const i=gitem(g.id,t),s=i?gst(i):'r';return `<div class="row2"><span class="dotl" style="background:${DT[s]}"></span><span style="flex:1">${esc(t)}</span><span class="m">${i?ssum(i.stock):0}</span></div>`}).join('')}</div>`}
/* ===== البوشيط ===== */
const csTot=i=>i.v.reduce((a,x)=>a+x.n,0),csSt=i=>{const t=csTot(i);return t<=0?'r':(i.v.some(x=>x.n<=0)||t<=(S.cfg.cl||3))?'y':'g'};
function csCard(i){const s=csSt(i);return `<div class="card"><div class="row2"><b>${esc(i.name)}</b><span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]} · ${csTot(i)}</span></div>`
+i.v.map(x=>`<div class="row2"><span style="flex:1">${esc([x.g,x.c].filter(Boolean).join(' · ')||'—')}${x.n<=0?' <span class="rs">ناقص</span>':''}</span>${x.n<=0?`<button class="btn s sm" onclick="csX('${i.id}','${x.id}')">×</button>`:''}<button class="btn s sm" onclick="csC('${i.id}','${x.id}',-1)">−</button><span class="cn">${x.n}</span><button class="btn sm" onclick="csC('${i.id}','${x.id}',1)">+</button></div>`).join('')
+`<div class="sub"><button class="btn s sm" onclick="csVar('${i.id}')">+ نوع</button><button class="btn s sm" onclick="csDel('${i.id}')">حذف</button></div></div>`}
function csView(){return{t:'البوشيط',h:`<button class="btn" onclick="csAdd()">+ إضافة موديل</button>`+(S.items.filter(i=>i.sec=='case').sort((a,b)=>a.name.localeCompare(b.name)).map(csCard).join('')||'<p class="m">لا شيء بعد</p>')}}
function csAdd(){ask('موديل بوشيط جديد',[{k:'n',l:'الهاتف (مثال: Samsung A07)'}]).then(v=>{const n=v&&v.n.trim();if(!n)return;const d=S.items.find(i=>i.sec=='case'&&nz(i.name)==nz(n));if(d)return toast('الموديل موجود');const r={id:uid(),sec:'case',name:n,v:[],by:S.me,at:Date.now()};upd(()=>S.items.push(r));csVar(r.id)})}
function csVar(id){PR=find(id);CP=[['gender','الجنس'],['color','اللون']];CS={_a:''};$('sh').innerHTML=`<div class="bar"></div><h3>${esc(PR.name)} — نوع جديد</h3><div id="cc"></div><label>العدد<input id="cq" type="number" value="1"></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({g:CS.gender||'',c:CS.color||'',n:+$('cq').value||0})">حفظ</button></div>`;const r=PR;sheetOpen(v=>{if(!v)return;commit('تمت الإضافة',()=>{const x=r.v.find(y=>y.g==v.g&&y.c==v.c);if(x)x.n+=v.n;else r.v.push({id:uid(),...v});r.by=S.me;r.at=Date.now()})});ch()}
function csC(id,vid,d){const x=find(id).v.find(y=>y.id==vid);upd(()=>x.n=Math.max(0,x.n+d))}
function csX(id,vid){const r=find(id);sure('حذف هذا النوع؟').then(y=>{if(y)commit('تم الحذف',()=>r.v=r.v.filter(x=>x.id!=vid))})}
function csDel(id){del('items',id,find(id).name)}
/* ===== الإكسسوارات ===== */
const acName=i=>[i.kind,i.conn,i.tier&&'فئة '+i.tier,i.brand].filter(Boolean).join(' ');
function acCard(i){const L={g:'متوفر',y:'قليل',r:'نفد'};return `<div class="card"><div class="row2"><b>${esc(acName(i))}</b><span class="dotl" style="background:${DT[i.st]}"></span><b>${esc(i.price)}</b></div>${i.note?`<div class="m">${esc(i.note)}</div>`:''}<div>${['g','y','r'].map(s=>`<button class="tag ${i.st==s?'on':''}" onclick="acS('${i.id}','${s}')">${L[s]}</button>`).join('')}</div><div class="sub"><button class="btn s sm" onclick="acNote('${i.id}')">ملاحظة</button><button class="btn s sm" onclick="acEd('${i.id}')">تعديل</button><button class="btn s sm" onclick="acDel('${i.id}')">حذف</button></div></div>`}
function acView(){const j=V.kk,a=S.items.filter(i=>i.sec=='acc'&&(j==null||i.kind==S.tags.kind[j])).sort((x,y)=>acName(x).localeCompare(acName(y)));
return{t:'الإكسسوارات',h:`<button class="btn" onclick="acAdd()">+ إضافة إكسسوار</button><div><button class="tag ${j==null?'on':''}" onclick="V.kk=null;render()">الكل</button>${S.tags.kind.map((t,k)=>`<button class="tag ${j==k?'on':''}" onclick="V.kk=${k};render()">${esc(t)}</button>`).join('')}</div>`+(a.map(acCard).join('')||'<p class="m">لا شيء بعد</p>')}}
function acS(id,s){const i=find(id);upd(()=>{i.st=s;i.by=S.me;i.at=Date.now()})}
function acNote(id){const i=find(id);ask('ملاحظة للمشتري',[{k:'n',l:'مثال: بقي 5 حبات',v:i.note||''}]).then(v=>{if(v)upd(()=>{i.note=v.n.trim();i.by=S.me;i.at=Date.now()})})}
function acDel(id){del('items',id,acName(find(id)))}
function acAdd(){PR=null;$('sh').innerHTML=`<div class="bar"></div><h3>إضافة إكسسوار</h3><label>ابحث أولاً (مثلاً: micro)<input oninput="acF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;sheetOpen(acDone);acF('')}
function acF(q){const n=nz(q),m=S.items.filter(i=>i.sec=='acc'&&nz(acName(i)).includes(n)).slice(0,6);$('pr').innerHTML=m.map(i=>`<button class="card row2" onclick="acForm(find('${i.id}'))"><b>${esc(acName(i))}</b><span class="m">${esc(i.price)}</span></button>`).join('')+`<button class="btn" onclick="acForm({})">+ إكسسوار جديد</button>`}
function acEd(id){$('sh').innerHTML='';sheetOpen(acDone);acForm(find(id))}
function acForm(rec){PR=rec;CP=[['kind','النوع'],['conn','الموصل'],['tier','الفئة (السعر)']];CS={kind:rec.kind||'',conn:rec.conn||'',tier:rec.tier||'',_a:''};$('sh').innerHTML=`<div class="bar"></div><h3>${rec.id?'تعديل':'إكسسوار جديد'}</h3><div id="cc"></div><label>الماركة (اختياري)<input id="ab" value="${esc(rec.brand||'')}"></label><label>السعر<input id="ap" type="tel" value="${esc(rec.price||'')}"></label><label>ملاحظة<textarea id="an">${esc(rec.note||'')}</textarea></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="acSave()">حفظ</button></div>`;ch()}
function acSave(){if(!CS.kind)return toast('اختر النوع');finish({kind:CS.kind,conn:CS.conn,tier:CS.tier,brand:$('ab').value.trim(),price:$('ap').value.trim()||CS.tier,note:$('an').value.trim()})}
function acDone(v){if(!v)return;const r=PR;if(r&&r.id)return commit('تم التعديل',()=>Object.assign(r,v,{by:S.me,at:Date.now()}));const d=S.items.find(i=>i.sec=='acc'&&i.kind==v.kind&&i.conn==v.conn&&i.tier==v.tier&&(i.brand||'')==v.brand);if(d)return toast('موجود مسبقاً: '+acName(d));commit('تمت الإضافة',()=>S.items.push({id:uid(),sec:'acc',...v,st:'g',by:S.me,at:Date.now()}))}
/* ===== البحث والتقرير ===== */
const _card=card;card=function(i){return i.sec=='case'?csCard(i):i.sec=='acc'?acCard(i):_card(i)};
srch=function(q){const n=nz(q);return GM().filter(g=>g.models.some(m=>nz(m).includes(n))).map(glB).join('')+S.items.filter(i=>i.sec!='glass'&&nz(hay(i)).includes(n)).slice(0,30).map(card).join('')||'<p class="m">لا نتائج</p>'};
const _sec=VW.sec;VW.sec=function(){const k=V.k;return k=='glass'?glV():k=='case'?csView():k=='acc'?acView():_sec()};
function repLines(){const L=[];ph().filter(i=>stOf(i)!='g').forEach(i=>L.push(['الهواتف',[i.brand,i.name,i.color,i.cap].filter(Boolean).join(' ')+' — '+i.cnt,stOf(i)]));
GM().forEach(g=>S.tags.glass.forEach(t=>{const i=gitem(g.id,t);if(i&&gst(i)!='g')L.push(['الأنتي كاس',t+': '+g.models.join(' / ')+' — المجموع '+ssum(i.stock),gst(i)])}));
S.items.filter(i=>i.sec=='case'&&csSt(i)!='g').forEach(i=>{const z=i.v.filter(x=>x.n<=0).map(x=>[x.g,x.c].filter(Boolean).join(' '));L.push(['البوشيط',i.name+(z.length?' — ناقص: '+z.join('، '):'')+' — المتوفر '+csTot(i),csSt(i)])});
S.items.filter(i=>i.sec=='acc'&&i.st!='g').forEach(i=>L.push(['الإكسسوارات',acName(i)+(i.note?' — '+i.note:''),i.st]));return L}
function repTxt(){const L=repLines(),o=[];[...new Set(L.map(x=>x[0]))].forEach(k=>{o.push('*'+k+'*');L.filter(x=>x[0]==k).forEach(x=>o.push((x[2]=='r'?'🔴 ':'🟡 ')+x[1]));o.push('')});return o.join('\n').trim()||'لا نواقص'}
VW.rep=function(){const L=repLines();return{t:'التقرير',h:([...new Set(L.map(x=>x[0]))].map(k=>`<h3>${k}</h3>`+L.filter(x=>x[0]==k).map(x=>`<div class="card row2"><span class="dotl" style="background:${DT[x[2]]}"></span><span style="flex:1">${esc(x[1])}</span></div>`).join('')).join('')||'<p class="m">لا نواقص حالياً.</p>')+`<button class="btn" onclick="location.href='https://wa.me/?text='+encodeURIComponent(repTxt())">إرسال بالواتساب</button><button class="btn s" onclick="navigator.clipboard.writeText(repTxt()).then(()=>toast('تم النسخ'))">نسخ النص</button>`}};
render();

/* ============================================================
   الصيانة (الاستلام، التسليم، الأرشيف، الطلبات)
   ============================================================ */
S.rp=S.rp||[];S.req=S.req||[];
const RK=['شاشة مكسورة','بدون SIM','مطفأ لا يشتغل','البصمة لا تعمل','بدون غطاء'],TB={in:'في المحل',rd:'جاهز',dn:'الأرشيف'},FL=[['all','الكل'],['today','اليوم'],['yest','البارحة'],['week','هذا الأسبوع'],['month','هذا الشهر'],['date','تاريخ']];
let ZP=[],ZK=[],ZI='',ZD=0,ZR={};
const rf=id=>S.rp.find(r=>r.id==id),rnum=t=>{t=String(t||'').replace(/\D/g,'');return t[0]=='0'?'212'+t.slice(1):t},sn1=x=>/^\s*\d+(\.\d+)?\s*$/.test(x||''),d0=t=>{const d=new Date(t);d.setHours(0,0,0,0);return d.getTime()};
const inR=t=>{const f=V.d||'all',n=d0(Date.now());if(f=='all')return 1;if(!t)return 0;if(f=='today')return d0(t)==n;if(f=='yest')return d0(t)==n-864e5;if(f=='week')return d0(t)>=n-((new Date().getDay()+6)%7)*864e5;if(f=='month'){const a=new Date(t),b=new Date();return a.getMonth()==b.getMonth()&&a.getFullYear()==b.getFullYear()}return !V.dt||new Date(t).toLocaleDateString('en-CA')==V.dt};
const tOf=r=>r.st=='dn'?r.t2:r.st=='rd'?(r.t1||r.t0):r.t0;
const PI=s=>{const p=i=>[20+40*(i%3),20+40*Math.floor(i/3)];return(s.length>1?`<polyline fill="none" stroke="#3b82f6" stroke-width="4" points="${s.map(i=>p(i).join(',')).join(' ')}"/>`:'')+[...Array(9).keys()].map(i=>`<circle cx="${p(i)[0]}" cy="${p(i)[1]}" r="${s.includes(i)?7:5}" fill="${s[0]==i?'#22c55e':s.includes(i)?'#3b82f6':'#94a3b8'}"/>`).join('')};
const RES={ok:'تم الإصلاح',fail:'تعذّر الإصلاح',ref:'رفض الإصلاح'};
function rc(r){const n=Math.floor((Date.now()-r.t0)/864e5),w=r.st=='rd'?Math.floor((Date.now()-(r.t1||r.t0))/864e5):0,B=(t,f,p)=>`<button class="btn ${p?'':'s'} sm" onclick="${f}">${t}</button>`,i=r.id;
return `<div class="card"><div class="row2">${r.img?`<img src="${r.img}" style="width:56px;height:56px;object-fit:cover;border-radius:10px">`:''}<div style="flex:1"><b>${esc(r.name)}</b><div class="m">${esc(r.dev)} — ${esc(r.fault)}</div></div>${r.st=='in'&&(r.pat||[]).length>1?`<svg viewBox="0 0 120 120" width="52">${PI(r.pat)}</svg>`:''}</div>
<div class="m"><a href="tel:${esc(r.tel)}">${esc(r.tel)}</a></div><div class="m">استلام: <bdi>${fd(r.t0)}</bdi> · ${esc(r.by)}${n&&r.st!='dn'?' · منذ '+n+' يوم':''}</div>`
+(r.st=='dn'?`<div class="m">تسليم: <bdi>${fd(r.t2)}</bdi> · ${esc(r.dby||'')}</div>`:'')+(r.cap?`<div class="m">السعر المتفق: ${esc(r.cap)}</div>`:'')+(r.dep?`<div class="m">العربون: ${esc(r.dep)}</div>`:'')+(r.st=='dn'?`<div class="m">المقبوض: ${esc(r.paid)}</div>`:'')
+(r.part?`<div class="rs">ينتظر قطعة: ${esc(r.part)}</div>`:'')+((r.chk||[]).length?`<div class="m">${esc(r.chk.join('، '))}</div>`:'')+(r.lock?`<div class="m">PIN: ${esc(r.lock)}</div>`:'')+(w>15?`<div class="rs">منسي منذ ${w} يوم</div>`:'')+((r.calls||[]).length?`<div class="m">اتصالات: ${r.calls.length}</div>`:'')+(r.st!='in'&&r.res?`<div class="m">${RES[r.res]}</div>`:'')+(r.note?`<div class="m">${esc(r.note)}</div>`:'')
+`<div class="sub">${r.st=='in'?B('تم الإصلاح',`rSt('${i}','ok')`,1)+B('تعذّر',`rSt('${i}','fail')`)+B('رفض',`rSt('${i}','ref')`)+B('وصل واتساب',`rWA('${i}',0)`):r.st=='rd'?B('إبلاغ واتساب',`rWA('${i}',1)`,1)+B('اتصلت',`rCL('${i}')`)+B('تسليم',`rDV('${i}')`,1)+B('إرجاع للمحل',`rSt('${i}','in')`):''}${B('تعديل',`rEd('${i}')`)}${B('حذف',`rDel('${i}')`)}</div></div>`}
function rpList(){const q=nz(V.q||''),tab=V.tab||'in',all=V.all&&q;const a=S.rp.filter(r=>(all||r.st==tab)&&inR(tOf(r))&&(!q||nz(r.name+r.tel+r.dev+r.fault+r.note).includes(q))).sort((x,y)=>tOf(y)-tOf(x));return a.map(rc).join('')||'<p class="m">لا شيء</p>'}
function rpL(){$('rl').innerHTML=rpList()}
VW.rp=function(){const tab=V.tab||'in';return{t:'الصيانة',h:`<button class="btn" onclick="rEd(null)">+ استلام هاتف</button><div>${Object.keys(TB).map(k=>`<button class="tag ${tab==k?'on':''}" onclick="V.tab='${k}';render()">${TB[k]} (${S.rp.filter(r=>r.st==k).length})</button>`).join('')}</div><input placeholder="ابحث: اسم، رقم، جهاز، عطل" value="${esc(V.q)}" oninput="V.q=this.value;rpL()"><div>${FL.map(([k,l])=>`<button class="tag ${(V.d||'all')==k?'on':''}" onclick="V.d='${k}';render()">${l}</button>`).join('')}<button class="tag ${V.all?'on':''}" onclick="V.all=!V.all;render()">كل التبويبات</button></div>${V.d=='date'?`<input type="date" value="${V.dt||''}" onchange="V.dt=this.value;render()">`:''}<div id="rl">${rpList()}</div>`}};
function rSt(id,x){const r=rf(id);commit('تم التحديث',()=>{if(x=='in'){r.st='in';r.res=''}else{r.st='rd';r.res=x;r.t1=Date.now()}r.lb=S.me})}
function rCL(id){const r=rf(id);commit('تم تسجيل الاتصال',()=>(r.calls=r.calls||[]).push(fd(Date.now())+' '+S.me))}
function rDel(id){const r=rf(id);del('rp',id,r.name+' — '+r.dev)}
function rDV(id){const r=rf(id),def=r.res=='ok'&&sn1(r.cap)?r.cap.trim():'';ask('تسليم: '+r.name,[{k:'p',l:def?'هل المبلغ المقبوض هو '+def+' ؟ عدّله إن اختلف':'المبلغ المقبوض (0 إن لم يُقبض شيء)',t:'tel',v:def}],'تم التسليم').then(v=>{if(v)commit('تم التسليم',()=>{r.st='dn';r.t2=Date.now();r.dby=S.me;r.paid=v.p.trim()||'0';r.pat=[];r.lock=''})})}
function rWA(id,k){const r=rf(id),c=sn1(r.cap)?' تكلفة الإصلاح: '+r.cap.trim()+(r.dep?'، العربون: '+r.dep:'')+'.':'';const s=k?(r.res=='ok'?`هاتفك ${r.dev} جاهز في المحل.${c}`:r.res=='fail'?`للأسف تعذّر إصلاح هاتفك ${r.dev}. يمكنك استلامه من المحل.`:`هاتفك ${r.dev} جاهز للاستلام بدون إصلاح.`):`استلمنا هاتفك ${r.dev} (${r.fault}).${r.dep?' العربون: '+r.dep+'.':''} سنبلغك عند جاهزيته.`;location.href='https://wa.me/'+rnum(r.tel)+'?text='+encodeURIComponent(`مرحباً ${r.name}، ${s} شكراً لثقتكم.`)}
function rEd(id){$('sh').innerHTML='';sheetOpen(rDone);rForm(id?rf(id):{})}
function rForm(rec){ZR=rec;ZP=[...(rec.pat||[])];ZK=[...(rec.chk||[])];ZI=rec.img||'';const f=(k,l,v,t,o)=>`<label>${l}<input id="r_${k}" ${t?`type="${t}"`:''} ${o||''} value="${esc(v||'')}"></label>`;
$('sh').innerHTML=`<div class="bar"></div><h3>${rec.id?'تعديل':'استلام هاتف'}</h3>${f('n','اسم الزبون',rec.name)}${f('t','رقم الهاتف',rec.tel,'tel','oninput="rH()"')}<div id="rh" class="m"></div>${f('v','نوع الهاتف',rec.dev)}${f('f','العطل (المشكل)',rec.fault)}<label>حالة الجهاز عند الاستلام</label><div id="rk"></div>${f('c','السعر المتفق (رقم، أو: اتصل، أو من 100 إلى 150)',rec.cap)}${f('d','العربون',rec.dep,'tel')}${f('p','ينتظر قطعة (اختياري)',rec.part)}${f('l','رمز PIN (إن وجد)',rec.lock)}<label>نمط القفل (ارسمه بإصبعك)</label><svg id="zsv" viewBox="0 0 120 120" width="150" style="touch-action:none;background:var(--bg);border-radius:12px" onpointerdown="ZD=1;rP(event,1)" onpointermove="if(ZD)rP(event)" onpointerup="ZD=0" onpointercancel="ZD=0">${PI(ZP)}</svg> <button class="btn s sm" onclick="ZP=[];$('zsv').innerHTML=PI(ZP)">مسح</button><label>صورة<input id="r_i" type="file" accept="image/*" onchange="rIM(this.files[0])"></label><img id="r_im" ${ZI?`src="${ZI}"`:'hidden'} style="width:100%;border-radius:10px"><label>ملاحظة<textarea id="r_o">${esc(rec.note||'')}</textarea></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="rSave()">حفظ</button></div>`;rKc();rH()}
function rP(e,d){const b=$('zsv').getBoundingClientRect(),x=(e.clientX-b.left)/b.width*120,y=(e.clientY-b.top)/b.height*120;if(d)ZP=[];for(let i=0;i<9;i++)if(!ZP.includes(i)&&Math.hypot(20+40*(i%3)-x,20+40*Math.floor(i/3)-y)<14)ZP.push(i);$('zsv').innerHTML=PI(ZP)}
function rIM(f){if(!f)return;const im=new Image();im.onload=()=>{const k=Math.min(1,560/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ZI=c.toDataURL('image/jpeg',.55);$('r_im').src=ZI;$('r_im').hidden=false};im.src=URL.createObjectURL(f)}
function rKc(){$('rk').innerHTML=RK.map(k=>`<button class="tag ${ZK.includes(k)?'on':''}" onclick="rKt('${k}')">${k}</button>`).join('')}
function rKt(k){ZK=ZK.includes(k)?ZK.filter(x=>x!=k):[...ZK,k];rKc()}
function rH(){const t=$('r_t').value.replace(/\D/g,''),m=t.length>5?S.rp.filter(r=>r!=ZR&&String(r.tel).replace(/\D/g,'')==t):[];$('rh').textContent=m.length?`زبون سابق: ${m.length} مرة، آخرها ${m[m.length-1].dev}`:''}
function rSave(){const n=$('r_n').value.trim(),f=$('r_f').value.trim();if(!n||!f)return toast('الاسم والعطل مطلوبان');finish({name:n,tel:$('r_t').value.trim(),dev:$('r_v').value.trim(),fault:f,cap:$('r_c').value.trim(),dep:$('r_d').value.trim(),part:$('r_p').value.trim(),lock:$('r_l').value.trim(),pat:ZP,chk:ZK,img:ZI,note:$('r_o').value.trim()})}
function rDone(v){if(!v)return;const r=ZR;if(r.id)return commit('تم التعديل',()=>Object.assign(r,v,{lb:S.me}));commit('تم الاستلام',()=>S.rp.push({id:uid(),st:'in',t0:Date.now(),by:S.me,calls:[],...v}))}
/* طلبات الزبائن والقطع في الرئيسية والتقرير */
const _H=VW.home;VW.home=function(){const r=_H();r.h+=`<button class="btn s" onclick="rq()">زبون سأل ولم نجد</button>`;return r};
function rq(){ask('طلب زبون',[{k:'t',l:'ماذا طلب؟ (مع رقمه إن أمكن)',t:'area'}]).then(v=>{const t=v&&v.t.trim();if(t)commit('تم التسجيل',()=>S.req.push({id:uid(),t,by:S.me,at:Date.now()}))})}
function rqD(id){commit('تم',()=>S.req=S.req.filter(r=>r.id!=id))}
const _R=VW.rep;VW.rep=function(){const o=_R(),p=S.rp.filter(r=>r.st=='in'&&r.part);o.h=(S.req.length||p.length?'<h3>طلبات وقطع</h3>'+S.req.map(r=>`<div class="card row2"><span style="flex:1">${esc(r.t)}</span><button class="btn s sm" onclick="rqD('${r.id}')">تم</button></div>`).join('')+p.map(r=>`<div class="card">قطعة: ${esc(r.part)} <span class="m">(${esc(r.dev)} — ${esc(r.name)})</span></div>`).join(''):'')+o.h;return o};
const _T=repTxt;repTxt=function(){const e=[...S.req.map(r=>'طلب زبون: '+r.t),...S.rp.filter(r=>r.st=='in'&&r.part).map(r=>'قطعة: '+r.part+' ('+r.dev+')')],b=_T();return e.length?(b=='لا نواقص'?'':b+'\n\n')+'*طلبات وقطع*\n'+e.join('\n'):b};
render();

/* ============================================================
   إضافات: إظهار الحقول، الحدود، الجرد اليومي، التذكير بالنسخ
   ============================================================ */
const FLD={phones:[['color','اللون','L:اللون'],['ram','RAM','L:RAM'],['cap','السعة','L:السعة'],['cond','الحالة','L:الحالة'],['price','السعر','I:pp'],['note','الملاحظة','I:pt'],['res','زر الحجز']],acc:[['conn','الموصل','L:الموصل'],['tier','الفئة','L:الفئة (السعر)'],['brand','الماركة','I:ab'],['price','السعر','I:ap'],['note','الملاحظة','I:an']],rp:[['cap','السعر المتفق','I:r_c'],['dep','العربون','I:r_d'],['part','ينتظر قطعة','I:r_p'],['lock','PIN','I:r_l'],['pat','نمط القفل','P'],['img','الصورة','I:r_i'],['chk','حالة الجهاز','L:حالة الجهاز عند الاستلام'],['note','الملاحظة','I:r_o']]};
const SN={phones:'الهواتف',acc:'الإكسسوارات',rp:'الصيانة'},DL0={low:1,gmin:10,cl:3,stale:7};
let PAN=0;
const hd=(s,k)=>((S.cfg.hide||{})[s]||{})[k];
function hideF(s){const sh=$('sh');FLD[s].forEach(([k,l,t])=>{if(!hd(s,k)||!t)return;const m=t[0],x=t.slice(2);
if(m=='I'){const e=$(x);if(e)(e.closest('label')||e).setAttribute('hidden','')}
else if(m=='L'){[...sh.querySelectorAll('label')].filter(e=>e.textContent.trim()==x).forEach(e=>{e.setAttribute('hidden','');if(e.nextElementSibling)e.nextElementSibling.setAttribute('hidden','')})}
else if(m=='P'){[...sh.querySelectorAll('label')].filter(e=>e.textContent.trim().startsWith('نمط القفل')).forEach(e=>e.setAttribute('hidden',''));const v=$('zsv');if(v){v.setAttribute('hidden','');if(v.nextElementSibling)v.nextElementSibling.setAttribute('hidden','')}}})}
const more=(fn)=>{const a=$('sh').querySelector('.acts');if(a)a.insertAdjacentHTML('afterend',`<button class="btn s" onclick="PAN=1;${fn}()">حفظ وإضافة آخر</button>`)};
const _pf=phForm;phForm=function(r){_pf(r);hideF('phones');if(!r.id)more('phSave')};
const _af=acForm;acForm=function(r){_af(r);hideF('acc');if(!r.id)more('acSave')};
const _rf=rForm;rForm=function(r){_rf(r);hideF('rp')};
const _pd=phDone;phDone=function(v){_pd(v);if(PAN&&v){PAN=0;setTimeout(phAdd,400)}else PAN=0};
const _ad=acDone;acDone=function(v){_ad(v);if(PAN&&v){PAN=0;setTimeout(acAdd,400)}else PAN=0};
const _c2=card;card=function(i){let h=_c2(i);if(i.sec=='phones'&&hd('phones','res'))h=h.replace(/<button[^>]*phRs[^>]*>[^<]*<\/button>/,'');return h};
function fTog(s,k){if(!can('fields'))return toast('للمدير فقط');upd(()=>{S.cfg.hide=S.cfg.hide||{};const h=S.cfg.hide[s]=S.cfg.hide[s]||{};h[k]=h[k]?0:1})}
VW.st_fld=()=>({t:'الحقول في النماذج',h:(can('fields')?'<p class="m">الأزرق = ظاهر. اضغط لإخفاء الحقل أو إظهاره.</p>':'<p class="m">التعديل للمدير فقط.</p>')+Object.keys(FLD).map(s=>`<h3>${SN[s]}</h3><div>${FLD[s].map(([k,l])=>`<button class="tag ${hd(s,k)?'':'on'}" onclick="fTog('${s}','${k}')">${l}</button>`).join('')}</div>`).join('')});
const LM=[['low','هاتف: قارب على النفاد عند عدد ≤'],['gmin','أنتي كاس: الحد الأدنى الافتراضي للمجموعة'],['cl','بوشيط: قارب على النفاد عند مجموع ≤'],['stale','الجولة: يُعتبر غير مؤكد بعد (أيام)']];
VW.st_lim=()=>({t:'الحدود والتنبيهات',h:LM.map(([k,l])=>`<button class="card row2" onclick="limEd('${k}')"><b style="flex:1">${l}</b><span>${S.cfg[k]??DL0[k]}</span></button>`).join('')+'<p class="m">حد مجموعة أنتي كاس بعينها يُحدَّد من «الحد والسعر» داخلها.</p>'});
function limEd(k){if(!isAdmin())return toast('للمدير فقط');ask('تعديل القيمة',[{k:'v',l:'القيمة',t:'tel',v:S.cfg[k]??DL0[k]}]).then(v=>{if(v&&v.v.trim()!=='')upd(()=>S.cfg[k]=+v.v)})}
const _st=VW.st;VW.st=function(){const o=_st();o.h+=row('الحدود والتنبيهات',"go('st_lim')")+row('الحقول في النماذج',"go('st_fld')");return o};
const rnd=()=>S.items.filter(i=>i.at&&Date.now()-i.at>(S.cfg.stale??7)*864e5).sort((a,b)=>a.at-b.at);
function gl2(i){const g=GM().find(x=>x.id==i.gid);return g?`<div class="card"><b>زجاج ${esc(i.ty)}: ${esc(g.models.join(' / '))}</b><div class="m">المجموع ${ssum(i.stock)} · آخر تأكيد قبل ${Math.floor((Date.now()-i.at)/864e5)} يوم</div></div>`:''}
function rCf(id){const i=find(id);upd(()=>{i.at=Date.now();i.by=S.me})}
VW.jl=()=>{const a=rnd().slice(0,30);return{t:'الجولة اليومية',h:'<p class="m">أكّد ما لم يتغير وعدّل ما تغيّر. الأقدم أولاً.</p>'+(a.map(i=>`<div>${i.sec=='glass'?gl2(i):card(i)}<button class="btn s" onclick="rCf('${i.id}')">تأكيد: كما هو</button></div>`).join('')||'<p class="m">كل شيء مؤكد حديثاً.</p>')}};
const _bk=BKP;BKP=function(){_bk();S.cfg.lb=Date.now();save();render()};
const _H2=VW.home;VW.home=function(){const r=_H2(),n=rnd().length,old=(S.items.length||S.rp.length)&&Date.now()-(S.cfg.lb||0)>7*864e5;r.h=(old?`<div class="card"><b>احفظ نسخة احتياطية</b><div class="m">لم تُحفظ نسخة منذ أكثر من أسبوع.</div><button class="btn s" onclick="BKP()">حفظ الآن</button></div>`:'')+r.h+(n?`<button class="btn s" onclick="go('jl')">الجولة اليومية (${n})</button>`:'');return r};
render();

