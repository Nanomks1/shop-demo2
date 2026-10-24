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
