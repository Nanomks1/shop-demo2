/* ============================================================
   features.js — التحسينات المتراكمة فوق base.js (الترتيب مهم)
   ============================================================ */
/* ============================================================
   v3.js — الألوان، الترتيب، فلتر البحث، مستويات الأنتي كاس، بحث البوشيط، تطوير الإكسسوارات
   ============================================================ */
document.head.insertAdjacentHTML('beforeend','<style>.sw{width:42px;height:42px;border-radius:50%;border:3px solid transparent;margin:4px;padding:0}.sw.on{border-color:var(--t)}.lvs{display:flex;gap:6px;margin:6px 0 10px}.lvb{flex:1;min-height:44px;border:2px solid var(--lc);background:transparent;color:var(--t);border-radius:12px;font:inherit;font-size:.85rem;opacity:.6;padding:0}.lvb.on{background:var(--lc);color:var(--lt);opacity:1;font-weight:700}.gm{border-top:1px solid var(--b);padding-top:8px;margin-top:8px}.kvs{display:flex;gap:8px;margin:8px 0}.kv{flex:1;background:var(--bg);border-radius:10px;padding:6px 10px;text-align:center}.kv small{display:block;color:var(--m);font-size:.75rem}.kv b{font-size:1.1rem}</style>');
/* ===== الألوان ===== */
const PAL=['#3b82f6','#f97316','#22c55e','#a855f7','#ec4899','#eab308','#06b6d4','#ef4444','#64748b','#84cc16'];
const DBC={Samsung:'#3b82f6',Redmi:'#f97316',Xiaomi:'#eab308',Realme:'#facc15',Oppo:'#22c55e',Vivo:'#a855f7',Tecno:'#06b6d4',Infinix:'#84cc16',iPhone:'#64748b',Itel:'#ef4444'};
const DSC={glass:'#06b6d4',case:'#a855f7',acc:'#84cc16'},DCM={phones:'b',glass:'s',case:'s',acc:'s'};
const SN3={phones:'الهواتف',glass:'الأنتي كاس',case:'البوشيط',acc:'الإكسسوارات'},MN={b:'حسب الماركة',s:'لون واحد للقسم',o:'بدون'};
const BC=b=>b?((S.cfg.bcol||{})[b]??DBC[b]??''):'',SCc=s=>(S.cfg.scol||{})[s]??DSC[s]??'',CM=s=>(S.cfg.cm||{})[s]??DCM[s];
const brOfName=n=>{const z=nz(n);return [...S.tags.brand].sort((a,b)=>b.length-a.length).find(t=>z.includes(nz(t)))||''};
const tint=(h,c)=>c?h.replace('<div class="card"','<div class="card" style="background:color-mix(in srgb,'+c+' 15%,var(--c))"'):h;
function colOf(i){const s=i.sec;if(!s||s=='glass')return'';const m=CM(s);if(m=='o')return'';if(m=='s')return SCc(s);return BC(s=='phones'?i.brand:s=='case'?brOfName(i.name):'')}
function colG(g){const m=CM('glass');if(m=='o')return'';if(m=='s')return SCc('glass');return BC(Object.values(g.br||{})[0])}
/* ===== ترتيب ===== */
const SOL={phones:[['n','الماركة'],['d','الأحدث'],['l','الأقل']],glass:[['n','الاسم'],['d','الأحدث'],['l','الأقل']],case:[['n','الاسم'],['d','الأحدث'],['l','الأقل']],acc:[['n','الاسم'],['d','الأحدث'],['l','الأقل']]};
const SO=s=>(S.cfg.so||{})[s]||'n';
const sortBar=s=>`<div class="m" style="margin-top:6px">ترتيب:</div><div>${SOL[s].map(([k,l])=>`<button class="tag ${SO(s)==k?'on':''}" onclick="soSet('${s}','${k}')">${l}</button>`).join('')}</div>`;
function soSet(s,k){upd(()=>{S.cfg.so=S.cfg.so||{};S.cfg.so[s]=k})}
const srt=(a,s,nm,lo,at)=>{const k=SO(s);return [...a].sort((x,y)=>k=='d'?(at(y)||0)-(at(x)||0):k=='l'?(lo(x)-lo(y))||String(nm(x)).localeCompare(String(nm(y))):String(nm(x)).localeCompare(String(nm(y))))};
/* ===== الهواتف: حد لكل ماركة + ألوان ===== */
const pst=i=>{const b=(S.cfg.bl||{})[i.brand],l=b??(S.cfg.low||1);return i.cnt<=0?'r':i.cnt<=l?'y':'g'};
const _c3=card;card=function(i){let h;if(i.sec=='phones'){const o=S.cfg.low,b=(S.cfg.bl||{})[i.brand];if(b!=null)S.cfg.low=b;try{h=_c3(i)}finally{S.cfg.low=o}}else h=_c3(i);return tint(h,colOf(i))};
function phView(){let a=srt(ph(),'phones',i=>i.brand+' '+i.name,i=>i.cnt,i=>i.at);if(V.f)a=a.filter(i=>pst(i)!='g');
return{t:'الهواتف',h:`<button class="btn" onclick="phAdd()">+ إضافة هاتف</button><div><button class="tag ${V.f?'':'on'}" onclick="V.f=0;render()">الكل (${ph().length})</button><button class="tag ${V.f?'on':''}" onclick="V.f=1;render()">يحتاج شراء</button></div>`+sortBar('phones')+(a.map(card).join('')||'<p class="m">لا شيء بعد</p>')}}
const _s3=VW.sec;VW.sec=function(){return V.k=='phones'?phView():_s3()};
/* ===== البحث: نطاق ===== */
let SC='';
const scH=()=>[['','الكل'],['phones','هواتف'],['glass','أنتي كاس'],['case','بوشيط'],['acc','إكسسوارات']].map(([k,l])=>`<button class="tag ${SC==k?'on':''}" onclick="scSet('${k}')">${l}</button>`).join('');
function scSet(k){SC=k;const b=$('sc');if(b)b.innerHTML=scH();sq(Q)}
const _H3=VW.home;VW.home=function(){const r=_H3();r.h=r.h.replace('<div id="res"></div>','<div id="sc">'+scH()+'</div><div id="res"></div>');return r};
srch=function(q){const n=nz(q),o=[];
if(!SC||SC=='glass')GM().filter(g=>g.models.some(m=>nz(((g.br||{})[m]||'')+m).includes(n))).forEach(g=>o.push(glB(g)));
S.items.filter(i=>i.sec!='glass'&&(!SC||i.sec==SC)&&nz(hay(i)).includes(n)).slice(0,30).forEach(i=>o.push(card(i)));
return o.join('')||'<p class="m">لا نتائج</p>'};
/* ===== الأنتي كاس: مستويات ===== */
Object.assign(DL0,{gA:30,gB:20,gC:10,gY:5,acl:3});
LM.push(['gA','أنتي كاس: أخضر غامق = أكثر من'],['gB','أنتي كاس: أخضر = أكثر من'],['gC','أنتي كاس: أخضر فاتح = أكثر من'],['gY','أنتي كاس: «قليل» يُحسب كـ'],['acl','إكسسوار بعدد: «قليل» عند عدد ≤']);
const GT=()=>({a:S.cfg.gA??30,b:S.cfg.gB??20,c:S.cfg.gC??10,y:S.cfg.gY??5}),LC={a:'#15803d',b:'#22c55e',c:'#86efac',y:'#d97706',r:'#dc2626'};
const lvN=l=>l=='r'?0:(GT()[l]||0);
const mval=(i,m)=>{const l=(i.lv||{})[m];return l!==undefined?lvN(l):((i.stock||{})[m]||0)};
const gTot=(i,g)=>g.models.reduce((a,m)=>a+mval(i||{},m),0),gEst=(i,g)=>!!i&&g.models.some(m=>(i.lv||{})[m]!==undefined);
const gSt=(i,g)=>{const t=gTot(i,g),m=(i&&i.min)??(S.cfg.gmin??10);return t<=0?'r':t<m?'y':'g'};
function glRow(g,i,j,k,m){const lv=(i.lv||{})[m],ex=lv===undefined&&(i.stock||{})[m]!==undefined,T=GT(),br=(g.br||{})[m];
const dots=[['a',T.a+'+'],['b',T.b+'+'],['c',T.c+'+'],['y','قليل'],['r','نفد']].map(([l,t])=>`<button class="lvb ${lv==l?'on':''}" style="--lc:${LC[l]};--lt:${l=='c'?'#14532d':'#fff'}" onclick="glLv('${g.id}',${j},${k},'${l}')">${t}</button>`).join('');
const hd2=ex?`<button class="btn s sm" onclick="glC('${g.id}',${j},${k},-1)">−</button><span class="cn">${i.stock[m]}</span><button class="btn sm" onclick="glC('${g.id}',${j},${k},1)">+</button>`:`<span class="m">${lv!==undefined?'≈'+lvN(lv):''}</span><button class="btn s sm" onclick="glEx('${g.id}',${j},${k})">عدد دقيق</button>`;
return `<div class="gm"><div class="row2"><span style="flex:1">${esc(m)}${br?` <span class="m">· ${esc(br)}</span>`:''}</span>${hd2}</div><div class="lvs">${dots}</div></div>`}
glCard=function(g,j){const ty=S.tags.glass[j],i=gitem(g.id,ty)||{stock:{}},s=gSt(i,g),min=i.min??(S.cfg.gmin??10);
return tint(`<div class="card"><b>${esc(g.models.join(' / '))}</b><div class="row2"><span class="dotl" style="background:${DT[s]}"></span><span class="m">${TX[s]} · المجموع ${gEst(i,g)?'≈':''}${gTot(i,g)} · الحد ${min}${i.price?' · '+esc(i.price):''}</span></div>`+g.models.map((m,k)=>glRow(g,i,j,k,m)).join('')+`<div class="sub"><button class="btn s sm" onclick="glM('${g.id}')">+ موديل مطابق</button><button class="btn s sm" onclick="glMin('${g.id}',${j})">الحد والسعر</button><button class="btn s sm" onclick="glRm('${g.id}')">حذف موديل</button></div></div>`,colG(g))};
function glLv(gid,j,k,l){const m=GM().find(x=>x.id==gid).models[k],i=glGet(gid,S.tags.glass[j]);upd(()=>{i.lv=i.lv||{};i.lv[m]=l;delete i.stock[m];i.by=S.me;i.at=Date.now()})}
function glEx(gid,j,k){const m=GM().find(x=>x.id==gid).models[k],i0=gitem(gid,S.tags.glass[j])||{};ask('عدد دقيق — '+m,[{k:'n',l:'العدد',t:'tel',v:mval(i0,m)}]).then(v=>{if(!v||v.n.trim()==='')return;const i=glGet(gid,S.tags.glass[j]);upd(()=>{i.stock[m]=Math.max(0,+v.n||0);if(i.lv)delete i.lv[m];i.by=S.me;i.at=Date.now()})})}
glB=function(g){return tint(`<div class="card"><b>زجاج يطابق: ${esc(g.models.join(' / '))}</b>${S.tags.glass.map(t=>{const i=gitem(g.id,t),s=i?gSt(i,g):'r';return `<div class="row2"><span class="dotl" style="background:${DT[s]}"></span><span style="flex:1">${esc(t)}</span><span class="m">${i?(gEst(i,g)?'≈':'')+gTot(i,g):0}</span></div>`}).join('')}</div>`,colG(g))};
glV=function(){const j=V.ty||0,ty=S.tags.glass[j],it=g=>gitem(g.id,ty);
const a=srt(GM(),'glass',g=>g.models[0]||'',g=>{const i=it(g);return i?gTot(i,g):0},g=>{const i=it(g);return i?i.at:0});
return{t:'الأنتي كاس',h:`<button class="btn" onclick="glAdd()">+ إضافة موديل</button><div>${S.tags.glass.map((t,k)=>`<button class="tag ${k==j?'on':''}" onclick="V.ty=${k};render()">${esc(t)}</button>`).join('')}</div>`+sortBar('glass')+(a.map(g=>glCard(g,j)).join('')||'<p class="m">أضف أول موديل لتبدأ المجموعات.</p>')}};
const clrM=n=>S.items.forEach(i=>{if(i.sec=='glass'&&i.lv)delete i.lv[n]});
function glAdd(){GS={};CP=[['brand','الماركة']];CS={_a:''};$('sh').innerHTML=`<div class="bar"></div><h3>موديل جديد</h3><label>اسم الموديل<input id="gn"></label><div id="cc"></div><button class="btn" onclick="glNext()">التالي</button>`;sheetOpen(()=>{});ch()}
function glNext(){const n=$('gn').value.trim();if(!n)return;if(gOf(n))return toast('هذا الموديل مسجل');GS.n=n;GS.b=CS.brand||'';$('sh').innerHTML=`<div class="bar"></div><h3>«${esc(n)}» يطابق أي موديل؟</h3><label>ابحث بين الموديلات<input oninput="glS(this.value)"></label><div id="gl"></div><button class="btn s" onclick="glNew()">لا يطابق شيئاً (مجموعة جديدة)</button>`;glS('')}
function glJoin(gid){const g=GM().find(x=>x.id==gid);upd(()=>{clrM(GS.n);g.models.push(GS.n);if(GS.b){g.br=g.br||{};g.br[GS.n]=GS.b}});finish(null)}
function glNew(){upd(()=>{clrM(GS.n);const g={id:uid(),models:[GS.n]};if(GS.b)g.br={[GS.n]:GS.b};GM().push(g)});finish(null)}
function glM(gid){const g=GM().find(x=>x.id==gid);CP=[['brand','الماركة (اختياري)']];CS={_a:''};$('sh').innerHTML=`<div class="bar"></div><h3>موديل مطابق</h3><label>الاسم<input id="gmn"></label><div id="cc"></div><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({n:$('gmn').value.trim(),b:CS.brand||''})">حفظ</button></div>`;
sheetOpen(v=>{if(!v||!v.n)return;const n=v.n,o=gOf(n);if(o&&o.id==gid)return toast('موجود في المجموعة');const add=()=>{clrM(n);g.models.push(n);if(v.b){g.br=g.br||{};g.br[n]=v.b}};if(!o)return upd(add);sure('«'+n+'» في مجموعة أخرى. دمج المجموعتين؟','دمج',false).then(y=>{if(y)upd(()=>glMerge(g,o))})});ch()}
const _gm=glMerge;glMerge=function(a,b){S.items.filter(i=>i.sec=='glass'&&i.gid==b.id&&i.lv).forEach(i=>{const t=gitem(a.id,i.ty);if(t){t.lv=t.lv||{};Object.assign(t.lv,i.lv)}});if(b.br)a.br=Object.assign(a.br||{},b.br);_gm(a,b)};
gl2=function(i){const g=GM().find(x=>x.id==i.gid);return g?`<div class="card"><b>زجاج ${esc(i.ty)}: ${esc(g.models.join(' / '))}</b><div class="m">المجموع ${gEst(i,g)?'≈':''}${gTot(i,g)} · آخر تأكيد قبل ${Math.floor((Date.now()-i.at)/864e5)} يوم</div></div>`:''};
/* ===== البوشيط: بحث عند الإضافة ===== */
let CQ='';
csView=function(){const a=srt(S.items.filter(i=>i.sec=='case'),'case',i=>i.name,csTot,i=>i.at);return{t:'البوشيط',h:`<button class="btn" onclick="csAdd()">+ إضافة موديل</button>`+sortBar('case')+(a.map(card).join('')||'<p class="m">لا شيء بعد</p>')}};
function csDone(v){if(!v)return;const r=PR;commit('تمت الإضافة',()=>{if(!S.items.includes(r))S.items.push(r);const x=r.v.find(y=>y.g==v.g&&y.c==v.c);if(x)x.n+=v.n;else r.v.push({id:uid(),...v});r.by=S.me;r.at=Date.now()})}
function csVarForm(){CP=[['gender','الجنس'],['color','اللون']];CS={_a:''};$('sh').innerHTML=`<div class="bar"></div><h3>${esc(PR.name)} — نوع جديد</h3><div id="cc"></div><label>العدد<input id="cq" type="number" value="1"></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({g:CS.gender||'',c:CS.color||'',n:+$('cq').value||0})">حفظ</button></div>`;ch()}
csVar=function(id){PR=find(id);csVarForm();sheetOpen(csDone)};
function csAdd(){CQ='';$('sh').innerHTML=`<div class="bar"></div><h3>إضافة بوشيط</h3><label>ابحث أولاً: موديل الهاتف<input oninput="csF(this.value)"></label><div id="pr"></div><button class="btn s" onclick="finish(null)">إلغاء</button>`;sheetOpen(csDone);csF('')}
function csF(q){CQ=q.trim();const n=nz(q),m=S.items.filter(i=>i.sec=='case'&&(!n||nz(i.name).includes(n))).sort((a,b)=>b.at-a.at).slice(0,6);$('pr').innerHTML=m.map(i=>`<button class="card row2" onclick="csPick('${i.id}')"><b>${esc(i.name)}</b><span class="m">${csTot(i)}</span></button>`).join('')+`<button class="btn" onclick="csNew()">+ موديل جديد${CQ?' «'+esc(CQ)+'»':''}</button>`}
function csPick(id){PR=find(id);csVarForm()}
function csNew(){if(!CQ)return toast('اكتب اسم الموديل');const d=S.items.find(i=>i.sec=='case'&&nz(i.name)==nz(CQ));if(d)return csPick(d.id);PR={id:uid(),sec:'case',name:CQ,v:[],by:S.me,at:Date.now()};csVarForm()}
/* ===== الإكسسوارات ===== */
const DKC={'كابل':{conn:1},'شاحن':{conn:1}};
const kc=k=>({conn:0,tier:1,...(DKC[k]||{}),...((S.cfg.kc||{})[k]||{})});
const acLim=i=>i.lim??kc(i.kind).lim??(S.cfg.acl??3);
const acSt=i=>typeof i.cnt=='number'?(i.cnt<=0?'r':i.cnt<=acLim(i)?'y':'g'):i.st;
const acTitle=i=>[i.kind,i.conn,i.brand].filter(Boolean).join(' ');
FLD.acc.push(['cnt','العدد','I:acn'],['lim','الحد','I:acl']);
ch=function(){$('cc').innerHTML=CP.filter(x=>!x[2]||x[2]()).map(([g,l])=>`<label>${l}</label><div>${S.tags[g].map((t,j)=>`<button class="tag ${CS[g]==t?'on':''}" onclick="ck('${g}',${j})">${esc(t)}</button>`).join('')}${CS._a==g?`<span class="row2"><input id="cnew" placeholder="الاسم الجديد"><button class="btn sm" onclick="cok('${g}')">إضافة</button></span>`:`<button class="tag" onclick="CS._a='${g}';ch()">+ جديد</button>`}</div>`).join('')};
acCard=function(i){const s=acSt(i),L={g:'متوفر',y:'قليل',r:'نفد'},cn=typeof i.cnt=='number';
return `<div class="card"><div class="row2"><b>${esc(acTitle(i))}</b><span class="dotl" style="background:${DT[s]}"></span><span class="m">${L[s]}</span></div><div class="kvs"><div class="kv"><small>السعر</small><b>${esc(i.price||'—')}</b></div>${i.tier?`<div class="kv"><small>الفئة</small><b>${esc(i.tier)}</b></div>`:''}${cn?`<div class="kv"><small>العدد</small><b>${i.cnt}</b></div>`:''}</div>${i.note?`<div class="m">${esc(i.note)}</div>`:''}`
+(cn?`<div class="row2"><button class="btn s sm" onclick="acC('${i.id}',-1)">−</button><button class="btn sm" onclick="acC('${i.id}',1)">+</button><span class="m" style="flex:1;text-align:end">الحد ${acLim(i)}</span></div>`:`<div>${['g','y','r'].map(x=>`<button class="tag ${i.st==x?'on':''}" onclick="acS('${i.id}','${x}')">${L[x]}</button>`).join('')}</div>`)
+`<div class="sub"><button class="btn s sm" onclick="acNote('${i.id}')">ملاحظة</button><button class="btn s sm" onclick="acEd('${i.id}')">تعديل</button>${cn?'':`<button class="btn s sm" onclick="acCnt('${i.id}')">+ عدد</button>`}<button class="btn s sm" onclick="acDel('${i.id}')">حذف</button></div></div>`};
function acC(id,d){const i=find(id);upd(()=>{i.cnt=Math.max(0,i.cnt+d);i.by=S.me;i.at=Date.now()})}
function acCnt(id){const i=find(id);ask('عدد القطع',[{k:'n',l:'العدد الحالي',t:'tel',v:''}]).then(v=>{if(v&&v.n.trim()!=='')upd(()=>{i.cnt=Math.max(0,+v.n||0);i.by=S.me;i.at=Date.now()})})}
acView=function(){const j=V.kk,a=srt(S.items.filter(i=>i.sec=='acc'&&(j==null||i.kind==S.tags.kind[j])),'acc',acName,i=>({r:0,y:1,g:2})[acSt(i)],i=>i.at);
return{t:'الإكسسوارات',h:`<button class="btn" onclick="acAdd()">+ إضافة إكسسوار</button><div><button class="tag ${j==null?'on':''}" onclick="V.kk=null;render()">الكل</button>${S.tags.kind.map((t,k)=>`<button class="tag ${j==k?'on':''}" onclick="V.kk=${k};render()">${esc(t)}</button>`).join('')}</div>`+sortBar('acc')+(a.map(card).join('')||'<p class="m">لا شيء بعد</p>')}};
acForm=function(rec){PR=rec;CP=[['kind','النوع'],['conn','الموصل',()=>kc(CS.kind).conn],['tier','الفئة (السعر)',()=>kc(CS.kind).tier]];CS={kind:rec.kind||'',conn:rec.conn||'',tier:rec.tier||'',_a:''};
$('sh').innerHTML=`<div class="bar"></div><h3>${rec.id?'تعديل':'إكسسوار جديد'}</h3><div id="cc"></div><label>الماركة (اختياري)<input id="ab" value="${esc(rec.brand||'')}"></label><label>السعر<input id="ap" type="tel" value="${esc(rec.price||'')}"></label><label>العدد (اختياري — فارغ = متوفر/قليل/نفد)<input id="acn" type="tel" value="${esc(rec.cnt??'')}"></label><label>الحد: «قليل» عند عدد ≤ (اختياري)<input id="acl" type="tel" value="${esc(rec.lim??'')}"></label><label>ملاحظة<textarea id="an">${esc(rec.note||'')}</textarea></label><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="acSave()">حفظ</button></div>`;ch();hideF('acc');if(!rec.id)more('acSave')};
acSave=function(){if(!CS.kind)return toast('اختر النوع');const k=kc(CS.kind),c=$('acn').value.trim(),l=$('acl').value.trim();finish({kind:CS.kind,conn:k.conn?CS.conn:'',tier:k.tier?CS.tier:'',brand:$('ab').value.trim(),price:$('ap').value.trim()||(k.tier?CS.tier:''),note:$('an').value.trim(),cnt:c===''?undefined:Math.max(0,+c||0),lim:l===''?undefined:Math.max(0,+l||0)})};
/* ===== التقرير ===== */
repLines=function(){const L=[];ph().filter(i=>pst(i)!='g').forEach(i=>L.push(['الهواتف',[i.brand,i.name,i.color,i.cap].filter(Boolean).join(' ')+' — '+i.cnt,pst(i)]));
GM().forEach(g=>S.tags.glass.forEach(t=>{const i=gitem(g.id,t);if(i&&gSt(i,g)!='g')L.push(['الأنتي كاس',t+': '+g.models.join(' / ')+' — المجموع '+(gEst(i,g)?'≈':'')+gTot(i,g),gSt(i,g)])}));
S.items.filter(i=>i.sec=='case'&&csSt(i)!='g').forEach(i=>{const z=i.v.filter(x=>x.n<=0).map(x=>[x.g,x.c].filter(Boolean).join(' '));L.push(['البوشيط',i.name+(z.length?' — ناقص: '+z.join('، '):'')+' — المتوفر '+csTot(i),csSt(i)])});
S.items.filter(i=>i.sec=='acc'&&acSt(i)!='g').forEach(i=>L.push(['الإكسسوارات',acName(i)+(typeof i.cnt=='number'?' — العدد '+i.cnt:'')+(i.note?' — '+i.note:''),acSt(i)]));return L};
/* ===== إعدادات: ألوان، ماركات، إكسسوارات ===== */
let CE={},AK={};
function ceR(){if($('blim'))CE.l=$('blim').value;
const sw=`<div>${PAL.map(c=>`<button class="sw ${CE.c==c?'on':''}" style="background:${c}" onclick="CE.c='${c}';ceR()"></button>`).join('')}<button class="tag ${CE.c?'':'on'}" onclick="CE.c='';ceR()">بدون</button></div>`;
$('sh').innerHTML=`<div class="bar"></div><h3>${esc(CE.n)}</h3>`+(CE.t=='s'?`<label>التلوين</label><div>${CE.mo.map(([k,l])=>`<button class="tag ${CE.m==k?'on':''}" onclick="CE.m='${k}';ceR()">${l}</button>`).join('')}</div>`:'')+((CE.t=='b'||CE.m=='s')?`<label>اللون</label>${sw}`:'')+(CE.t=='b'?`<label>حد «قارب على النفاد» لهواتف هذه الماركة (فارغ = الحد العام)</label><input id="blim" type="tel" value="${esc(CE.l)}">`:'')+`<div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="ceOk()">حفظ</button></div>`}
function ceOk(){if($('blim'))CE.l=$('blim').value;finish(CE)}
function ceOpen(o,cb){if(!can('tags'))return toast('للمدير فقط');CE=o;ceR();sheetOpen(cb)}
function brEd(j){const b=S.tags.brand[j];ceOpen({t:'b',n:b,c:BC(b),l:(S.cfg.bl||{})[b]??''},v=>{if(!v)return;upd(()=>{S.cfg.bcol=S.cfg.bcol||{};S.cfg.bcol[b]=v.c;S.cfg.bl=S.cfg.bl||{};const l=String(v.l).trim();if(l==='')delete S.cfg.bl[b];else S.cfg.bl[b]=Math.max(1,+l||1)})})}
function cmEd(s){ceOpen({t:'s',n:SN3[s],m:CM(s),c:SCc(s),mo:s=='acc'?[['s','لون واحد للقسم'],['o','بدون']]:[['b','حسب الماركة'],['s','لون واحد للقسم'],['o','بدون']]},v=>{if(!v)return;upd(()=>{S.cfg.cm=S.cfg.cm||{};S.cfg.cm[s]=v.m;S.cfg.scol=S.cfg.scol||{};S.cfg.scol[s]=v.c})})}
VW.st_col=()=>({t:'الألوان',h:'<p class="m">ألوان خفيفة على خلفية البطاقات للتمييز بسرعة.</p>'+['phones','glass','case','acc'].map(s=>{const m=CM(s),c=m=='s'?SCc(s):'';return `<button class="card row2" onclick="cmEd('${s}')"><b>${SN3[s]}</b><span class="m">${MN[m]}</span>${c?`<span class="dotl" style="background:${c}"></span>`:''}</button>`}).join('')+row('ألوان الماركات وحدودها',"go('st_br')")});
VW.st_br=()=>({t:'ألوان الماركات',h:'<p class="m">اللون + حد «قارب على النفاد» لكل ماركة (اختياري).</p>'+S.tags.brand.map((b,j)=>{const c=BC(b),l=(S.cfg.bl||{})[b];return `<button class="card row2" onclick="brEd(${j})"><b>${esc(b)}</b><span class="m">${l!=null?'حد ≤'+l:''}</span>${c?`<span class="dotl" style="background:${c}"></span>`:''}</button>`}).join('')});
function akEd(j){if(!can('tags'))return toast('للمدير فقط');const k=S.tags.kind[j],c=kc(k);AK={k,conn:c.conn?1:0,tier:c.tier?1:0,lim:c.lim??''};akR();sheetOpen(v=>{if(!v)return;upd(()=>{S.cfg.kc=S.cfg.kc||{};const l=String(v.lim).trim();S.cfg.kc[v.k]={conn:v.conn,tier:v.tier,...(l===''?{}:{lim:Math.max(0,+l||0)})}})})}
function akR(){if($('akl'))AK.lim=$('akl').value;$('sh').innerHTML=`<div class="bar"></div><h3>${esc(AK.k)}</h3><label>ما يظهر عند إضافة هذا النوع</label><div><button class="tag ${AK.conn?'on':''}" onclick="AK.conn=${AK.conn?0:1};akR()">الموصل</button><button class="tag ${AK.tier?'on':''}" onclick="AK.tier=${AK.tier?0:1};akR()">الفئة</button></div><label>حد «قليل» لهذا النوع (فارغ = الحد العام)</label><input id="akl" type="tel" value="${esc(AK.lim)}"><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="if($('akl'))AK.lim=$('akl').value;finish(AK)">حفظ</button></div>`}
VW.st_ak=()=>({t:'الإكسسوارات',h:row('الأنواع',"go('st_tg',{g:'kind'})",S.tags.kind.length)+row('الموصلات',"go('st_tg',{g:'conn'})",S.tags.conn.length)+row('الفئات السعرية',"go('st_tg',{g:'tier'})",S.tags.tier.length)+'<h3>إعدادات كل نوع</h3>'+S.tags.kind.map((k,j)=>{const c=kc(k);return row(k,'akEd('+j+')',(c.conn?'موصل · ':'')+(c.tier?'فئة · ':'')+'حد '+(c.lim??(S.cfg.acl??3)))}).join('')});
const _st3=VW.st;VW.st=function(){const o=_st3();o.h+=row('الألوان',"go('st_col')")+row('الإكسسوارات',"go('st_ak')");return o};
render();

/* ============================================================
   v4.js — دليل أسعار الإصلاح
   ============================================================ */
S.guide=S.guide||[];
const gdCard=g=>`<div class="card"><div class="row2"><b>${esc(g.m)}</b><b style="flex:none;font-size:1.2rem">${esc(g.p)}</b></div><div class="m">${esc(g.f)}${g.n?' · '+esc(g.n):''}</div>${can('price')?`<div class="sub"><button class="btn s sm" onclick="gdEd('${g.id}')">تعديل</button><button class="btn s sm" onclick="gdDel('${g.id}')">حذف</button></div>`:''}</div>`;
const gdList=q=>{const n=nz(q||'');return S.guide.filter(g=>!n||nz(g.m+g.f+(g.n||'')).includes(n)).sort((a,b)=>a.m.localeCompare(b.m)).map(gdCard).join('')||'<p class="m">لا شيء بعد</p>'};
VW.gd=()=>({t:'دليل أسعار الإصلاح',h:(can('price')?'<button class="btn" onclick="gdEd(null)">+ إضافة تسعيرة</button>':'')+`<input placeholder="ابحث: موديل أو عطل" value="${esc(V.q)}" oninput="V.q=this.value;$('gdl').innerHTML=gdList(V.q)"><div id="gdl">${gdList(V.q)}</div>`});
function gdEd(id){if(!can('price'))return toast('للمدير فقط');const g=id?S.guide.find(x=>x.id==id):{};ask(id?'تعديل تسعيرة':'تسعيرة جديدة',[{k:'m',l:'الموديل (مثال: Samsung A12)',v:g.m||''},{k:'f',l:'العطل (مثال: شاشة)',v:g.f||''},{k:'p',l:'السعر',t:'tel',v:g.p||''},{k:'n',l:'ملاحظة (اختياري)',v:g.n||''}]).then(v=>{if(!v)return;if(!v.m.trim()||!v.f.trim()||!v.p.trim())return toast('الموديل والعطل والسعر مطلوبة');upd(()=>{const o={m:v.m.trim(),f:v.f.trim(),p:v.p.trim(),n:v.n.trim()};if(id)Object.assign(g,o);else S.guide.push({id:uid(),...o})})})}
function gdDel(id){const g=S.guide.find(x=>x.id==id);del('guide',id,g.m+' '+g.f)}
const _rp4=VW.rp;VW.rp=function(){const r=_rp4();r.h='<button class="btn s" onclick="go(\'gd\')">دليل أسعار الإصلاح</button>'+r.h;return r};
render();

/* ============================================================
   v5.js — القفل السريع ومسح الباركود
   ============================================================ */
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

/* ============================================================
   v6.js — تأكيد التجربة قبل التسليم، التقرير وزر تم الشراء
   ============================================================ */
/* ===== تأكيد التجربة قبل التسليم ===== */
const _rDV6=rDV;rDV=function(id){const r=rf(id);if(r.res!='ok')return _rDV6(id);sure('هل جُرِّب الإصلاح مع الزبون وهو يعمل؟','نعم، يعمل',false).then(y=>{if(y){r.tst=Date.now();_rDV6(id)}})};
/* ===== التقرير: المتوفر أولاً + تم الشراء ===== */
const stkL=()=>ph().filter(i=>i.cnt>0).sort((a,b)=>(a.brand+a.name).localeCompare(b.brand+b.name));
const stkN=i=>[i.brand,i.name,i.color,i.ram,i.cap].filter(Boolean).join(' ');
repLines=function(){const L=[];
ph().filter(i=>pst(i)!='g').forEach(i=>L.push(['الهواتف الناقصة',[i.brand,i.name,i.color,i.cap].filter(Boolean).join(' ')+' — '+i.cnt,pst(i),`buyP('${i.id}')`]));
GM().forEach(g=>S.tags.glass.forEach(t=>{const i=gitem(g.id,t);if(i&&gSt(i,g)!='g')L.push(['الأنتي كاس',t+': '+g.models.join(' / ')+' — المجموع '+(gEst(i,g)?'≈':'')+gTot(i,g),gSt(i,g),`buyG('${i.id}')`])}));
S.items.filter(i=>i.sec=='case'&&csSt(i)!='g').forEach(i=>{const z=i.v.filter(x=>x.n<=0).map(x=>[x.g,x.c].filter(Boolean).join(' '));L.push(['البوشيط',i.name+(z.length?' — ناقص: '+z.join('، '):'')+' — المتوفر '+csTot(i),csSt(i),`buyC('${i.id}')`])});
S.items.filter(i=>i.sec=='acc'&&acSt(i)!='g').forEach(i=>L.push(['الإكسسوارات',acName(i)+(typeof i.cnt=='number'?' — العدد '+i.cnt:'')+(i.note?' — '+i.note:''),acSt(i),`buyA('${i.id}')`]));return L};
repTxt=function(){const L=repLines(),o=[],s=stkL();if(s.length)o.push('*الهواتف المتوفرة*',...s.map(i=>'• '+stkN(i)+' — العدد '+i.cnt+(i.price?' — '+i.price:'')),'');
[...new Set(L.map(x=>x[0]))].forEach(k=>{o.push('*'+k+'*');L.filter(x=>x[0]==k).forEach(x=>o.push((x[2]=='r'?'🔴 ':'🟡 ')+x[1]));o.push('')});if(!L.length)o.push('لا نواقص');return o.join('\n').trim()};
const _R6=VW.rep;VW.rep=function(){const o=_R6(),s=stkL();
repLines().forEach(x=>{const a=`<div class="card row2"><span class="dotl" style="background:${DT[x[2]]}"></span><span style="flex:1">${esc(x[1])}</span></div>`,b=a.slice(0,-6)+`<button class="btn sm" onclick="${x[3]}">تم الشراء</button></div>`;o.h=o.h.replace(a,()=>b)});
o.h=(s.length?'<h3>الهواتف المتوفرة</h3>'+s.map(i=>`<div class="card row2"><span style="flex:1">${esc(stkN(i))}</span><span class="m">${i.cnt}${i.price?' · '+esc(i.price):''}</span></div>`).join(''):'')+o.h;return o};
function qty(t,d,fn){ask(t,[{k:'n',l:'الكمية التي وصلت',t:'tel',v:d}],'تم الشراء').then(v=>{if(v&&+v.n>0)commit('تم الشراء',()=>fn(+v.n))})}
function buyP(id){const i=find(id);qty(i.brand+' '+i.name,1,n=>{i.cnt+=n;i.by=S.me;i.at=Date.now()})}
function buyC(id){const i=find(id);qty(i.name+' — لكل نوع',3,n=>{const z=i.v.filter(x=>x.n<=0),t=z.length?z:i.v;t.forEach(x=>x.n+=n);i.by=S.me;i.at=Date.now()})}
function buyA(id){const i=find(id);if(typeof i.cnt=='number')return qty(acTitle(i),acLim(i)+3,n=>{i.cnt+=n;i.by=S.me;i.at=Date.now()});commit('تم الشراء',()=>{i.st='g';i.by=S.me;i.at=Date.now()})}
function buyG(id){const i=find(id),g=GM().find(x=>x.id==i.gid);commit('تم الشراء',()=>{i.lv=i.lv||{};for(const l of ['c','b','a']){g.models.forEach(m=>{if(mval(i,m)<lvN(l)){i.lv[m]=l;delete i.stock[m]}});if(gSt(i,g)=='g')break}i.by=S.me;i.at=Date.now()})}
render();

/* ============================================================
   v7.js — تحسينات الصيانة والتقرير حسب الأقسام
   ============================================================ */
/* ===== 1. وسوم الأعطال والماركات + الاقتراح التلقائي للسعر + كشف الجهاز الراجع ===== */
const dh=p=>sn1(p)?String(p).trim()+' درهم':(p||'');
TG.fault = 'أعطال الصيانة';
S.tags.fault = S.tags.fault || ['تغيير شاشة', 'كونكتور الشحن', 'بطارية', 'مشكلة شبكة', 'سقط في الماء', 'صوت / مايك', 'سوفتوير', 'تغيير ظهر'];

const _rForm7 = rForm;
rForm = function(rec) {
  _rForm7(rec);
  const vInp = $('r_v'), fInp = $('r_f'), cInp = $('r_c');
  if (vInp) {
    vInp.insertAdjacentHTML('beforebegin', `<div id="rp_br_tags" style="margin-bottom:6px">${S.tags.brand.map(b => `<button type="button" class="tag" onclick="pickRpBrand('${esc(b)}')">${esc(b)}</button>`).join('')}</div>`);
    vInp.insertAdjacentHTML('afterend', `<div id="rp_dev_hist" class="m" style="color:#d97706;font-weight:700"></div>`);
    vInp.addEventListener('input', () => { checkDeviceHistory(); suggestGuidePrice(); });
  }
  if (fInp) {
    fInp.insertAdjacentHTML('beforebegin', `<div id="rp_fl_tags" style="margin-bottom:6px">${S.tags.fault.map(f => `<button type="button" class="tag" onclick="pickRpFault('${esc(f)}')">${esc(f)}</button>`).join('')}</div>`);
    fInp.addEventListener('input', suggestGuidePrice);
  }
  if (cInp) {
    cInp.insertAdjacentHTML('afterend', `<div id="rp_price_hint" style="margin-top:4px"></div>`);
  }
  checkDeviceHistory();
  suggestGuidePrice();
};

function pickRpBrand(b) {
  const el = $('r_v');
  if (!el) return;
  const cur = el.value.trim();
  el.value = cur ? (cur.startsWith(b) ? cur : b + ' ' + cur) : b + ' ';
  el.focus();
  checkDeviceHistory();
  suggestGuidePrice();
}

function pickRpFault(f) {
  const el = $('r_f');
  if (!el) return;
  let parts = el.value.split('،').map(s => s.trim()).filter(Boolean);
  if (parts.includes(f)) parts = parts.filter(x => x !== f);
  else parts.push(f);
  el.value = parts.join('، ');
  suggestGuidePrice();
}

function suggestGuidePrice() {
  const dev = nz(($('r_v') || {}).value || '');
  const flt = nz(($('r_f') || {}).value || '');
  const box = $('rp_price_hint');
  if (!box) return;
  if (!dev && !flt) { box.innerHTML = ''; return; }

  const matches = (S.guide || []).filter(g => {
    const gm = nz(g.m), gf = nz(g.f);
    const mMatch = dev && (dev.includes(gm) || gm.includes(dev));
    const fMatch = flt && (flt.includes(gf) || gf.includes(flt));
    return (mMatch && fMatch) || (dev.length > 2 && mMatch && !flt);
  }).slice(0, 3);

  if (matches.length) {
    box.innerHTML = matches.map(g =>
      `<button type="button" class="tag on" style="margin-top:4px" onclick="$('r_c').value='${esc(g.p)}'">💡 السعر في الدليل (${esc(g.m)} - ${esc(g.f)}): ${esc(dh(g.p))} — اضغط لوضعه</button>`
    ).join('');
  } else {
    box.innerHTML = '';
  }
}

function checkDeviceHistory() {
  const dev = nz(($('r_v') || {}).value || '');
  const box = $('rp_dev_hist');
  if (!box) return;
  if (dev.length < 3) { box.textContent = ''; return; }

  const recent = S.rp.filter(r => r != ZR && r.st == 'dn' && nz(r.dev).includes(dev) && (Date.now() - (r.t2 || 0)) < 14 * 864e5);
  if (recent.length) {
    const last = recent[recent.length - 1];
    const days = Math.floor((Date.now() - last.t2) / 864e5);
    box.textContent = `⚠️ تنبيه: جهاز مشابه (${last.dev} — ${last.name}) سُلّم منذ ${days || 'أقل من'} يوم (${last.tst ? 'جُرِّب مع الزبون ✅' : 'بدون توثيق تجربة'})`;
  } else {
    box.textContent = '';
  }
}

/* ===== 2. زر اتصال مباشر + توثيق التجربة مع الزبون في البطاقة ===== */
const _rc7 = rc;
rc = function(r) {
  let h = _rc7(r);
  if (r.tel) {
    const callBtn = `<a href="tel:${esc(r.tel)}" class="btn s sm" style="text-decoration:none;display:inline-flex;align-items:center">📞 اتصال</a>`;
    h = h.replace('<div class="sub">', `<div class="sub">${callBtn}`);
  }
  if (r.st == 'dn') {
    const badge = r.tst
      ? `<div class="m" style="color:#16a34a;font-weight:700">✅ جُرِّب مع الزبون وسُلِّم مصلوحاً (${esc(r.dby || '')})</div>`
      : (r.res == 'ok' ? `<div class="m">سُلِّم بدون توثيق التجربة</div>` : '');
    const dnoteHtml = r.dnote ? `<div class="m">ملاحظة التسليم: ${esc(r.dnote)}</div>` : '';
    h = h.replace('<div class="sub">', badge + dnoteHtml + '<div class="sub">');
  }
  return h;
};

const DVO=['— اختر —','جُرِّب مع الزبون وهو يعمل','سُلِّم بدون تجربة مع الزبون'];
rDV = function(id, pre) {
  const r = rf(id), pr = pre || {};
  const def = r.res == 'ok' && sn1(r.cap) ? r.cap.trim() : '';
  const fields = [
    { k: 'p', l: def ? 'هل المبلغ المقبوض هو ' + def + ' ؟ عدّله إن اختلف' : 'المبلغ المقبوض (0 إن لم يُقبض شيء)', t: 'tel', v: pr.p ?? def }
  ];
  if (r.res == 'ok') {
    fields.unshift({ k: 'tested', l: (pr.err ? '⚠️ اختر أحد الخيارين: ' : '') + 'تجربة الإصلاح مع الزبون قبل التسليم (إجباري)', t: 'sel', o: DVO, v: DVO[0] });
  }
  fields.push({ k: 'dnote', l: 'ملاحظة عند التسليم (اختياري)', v: pr.dnote ?? (r.dnote || '') });
  ask('تسليم الهاتف: ' + r.name, fields, 'تأكيد التسليم', false).then(v => {
    if (!v) return;
    if (r.res == 'ok' && v.tested == DVO[0]) return rDV(id, { p: v.p, dnote: v.dnote, err: 1 });
    commit('تم التسليم', () => {
      r.st = 'dn';
      r.t2 = Date.now();
      r.dby = S.me;
      r.paid = v.p.trim() || '0';
      r.tst = v.tested == DVO[1] ? Date.now() : 0;
      r.dnote = (v.dnote || '').trim();
      r.pat = [];
      r.lock = '';
    });
  });
};

rWA = function(id, k) {
  const r = rf(id);
  const c = sn1(r.cap) ? ' تكلفة الإصلاح: ' + r.cap.trim() + (r.dep ? '، العربون: ' + r.dep : '') + '.' : '';
  const chks = r.chk || [];
  const isDeadOrBroken = chks.includes('مطفأ لا يشتغل') || chks.includes('شاشة مكسورة');
  const legalNote = (!k && isDeadOrBroken)
    ? '\n*(ملاحظة: استُلم الجهاز بشاشة مكسورة/منطفئ مما يتعذر معه فحص باقي الوظائف كالكاميرا والشبكة قبل الإصلاح)*.'
    : '';

  const s = k
    ? (r.res == 'ok' ? `هاتفك ${r.dev} جاهز في المحل.${c}` : r.res == 'fail' ? `للأسف تعذّر إصلاح هاتفك ${r.dev}. يمكنك استلامه من المحل.` : `هاتفك ${r.dev} جاهز للاستلام بدون إصلاح.`)
    : `استلمنا هاتفك ${r.dev} (${r.fault}).${r.dep ? ' العربون: ' + r.dep + '.' : ''} سنبلغك عند جاهزيته.${legalNote}`;

  location.href = 'https://wa.me/' + rnum(r.tel) + '?text=' + encodeURIComponent(`مرحباً ${r.name}، ${s}\nشكراً لثقتكم.`);
};

/* ===== 3. التقرير اليومي حسب الأقسام ===== */
let reportSectionFilter = 'all';
const idOf = x => (String(x[3] || '').match(/'([^']+)'/) || [])[1];
const repL7 = () => repLines().map(x => {
  if (x[0] == 'البوشيط') { const i = find(idOf(x)); if (i && (i.rem || i.need)) return [x[0], x[1] + (i.rem ? ' — باقي: ' + i.rem : '') + (i.need ? ' — خاصنا: ' + i.need : ''), x[2], x[3]]; }
  return x;
});
const RTABS = [['all', '📋 التقرير الشامل'], ['phones', '📱 الهواتف'], ['glass', '🛡️ الأنتي كاس'], ['pochette', '📲 البوشيط'], ['acc', '🔌 الإكسسوارات']];
const RSEC = { phones: ['الهواتف الناقصة', '📱 قسم الهواتف النافدة', 'لا هواتف نافدة'], glass: ['الأنتي كاس', '🛡️ قسم زجاج الحماية (الأنتي كاس)', 'الأنتي كاس مكتمل'], pochette: ['البوشيط', '📲 قسم البوشيط', 'البوشيط مكتمل'], acc: ['الإكسسوارات', '🔌 قسم الإكسسوارات وقطع الصيانة', 'الإكسسوارات مكتملة'] };
const rSecs = m => m == 'all' ? ['phones', 'glass', 'pochette', 'acc'] : [m];

function generateReportText(mode = 'all') {
  const L = repL7(), o = [`📋 *تقرير المحل (${new Date().toLocaleDateString('ar-MA')})*`, ''];
  if (mode == 'all' || mode == 'phones') {
    const s = stkL();
    if (s.length) { o.push('*📱 الهواتف المتوفرة حالياً*'); s.forEach(i => o.push('• ' + stkN(i) + ' — العدد ' + i.cnt + (i.price ? ' (' + dh(i.price) + ')' : ''))); o.push(''); }
  }
  rSecs(mode).forEach(k => {
    const [key, title, none] = RSEC[k], ls = L.filter(x => x[0] == key);
    o.push('*' + title + '*');
    ls.forEach(x => o.push((x[2] == 'r' ? '🔴 ' : '🟡 ') + x[1]));
    if (k == 'acc') {
      S.rp.filter(r => r.st == 'in' && r.part).forEach(r => o.push('🔧 قطعة صيانة: ' + r.part + ' (' + r.dev + ')'));
      if (mode == 'all') S.req.forEach(q => o.push('🗣️ طلب زبون: ' + q.t));
    }
    if (!ls.length && !(k == 'acc' && (S.rp.some(r => r.st == 'in' && r.part) || (mode == 'all' && S.req.length)))) o.push('✅ ' + none);
    o.push('');
  });
  return o.join('\n').trim();
}

VW.rep = function() {
  const L = repL7(), s = stkL();
  let h = `<div style="margin-bottom:12px;display:flex;gap:6px;overflow-x:auto">${RTABS.map(([k, l]) => `<button class="tag ${reportSectionFilter === k ? 'on' : ''}" onclick="reportSectionFilter='${k}';render()">${l}</button>`).join('')}</div>`;
  if ((reportSectionFilter == 'all' || reportSectionFilter == 'phones') && s.length)
    h += '<h3>📱 الهواتف المتوفرة حالياً</h3>' + s.map(i => `<div class="card row2"><span style="flex:1">${esc(stkN(i))}</span><span class="m">${i.cnt}${i.price ? ' · ' + esc(dh(i.price)) : ''}</span></div>`).join('');
  rSecs(reportSectionFilter).forEach(k => {
    const [key, title, none] = RSEC[k], ls = L.filter(x => x[0] == key);
    let b = ls.map(x => `<div class="card row2"><span class="dotl" style="background:${DT[x[2]]}"></span><span style="flex:1">${esc(x[1])}</span><button class="btn sm" onclick="${x[3]}">تم الشراء</button></div>`).join('');
    if (k == 'acc') {
      b += S.rp.filter(r => r.st == 'in' && r.part).map(r => `<div class="card row2"><span class="dotl" style="background:#f59e0b"></span><span style="flex:1">🔧 قطعة صيانة: <b>${esc(r.part)}</b> <span class="m">(${esc(r.dev)})</span></span></div>`).join('');
      if (reportSectionFilter == 'all') b += S.req.map(q => `<div class="card row2"><span style="flex:1">🗣️ طلب زبون: <b>${esc(q.t)}</b></span><button class="btn s sm" onclick="rqD('${q.id}')">مسح</button></div>`).join('');
    }
    h += `<h3>${title}</h3>` + (b || `<p class="m">${none}</p>`);
  });
  h += `<div style="margin-top:20px;display:flex;gap:10px"><button class="btn" style="flex:1" onclick="location.href='https://wa.me/?text='+encodeURIComponent(generateReportText(reportSectionFilter))">📲 إرسال القسم بالواتساب</button><button class="btn s" onclick="navigator.clipboard.writeText(generateReportText(reportSectionFilter)).then(()=>toast('تم النسخ'))">نسخ النص</button></div>`;
  return { t: 'التقرير اليومي', h };
};

/* ===== 4. ملاحظة سريعة للبوشيط (شنو باقي / شنو خاصنا) ===== */
const _csCard7 = csCard;
csCard = function(i) {
  let h = _csCard7(i);
  const info = (i.rem ? `<div class="m">🟢 باقي: ${esc(i.rem)}</div>` : '') + (i.need ? `<div class="rs">🔴 خاصنا: ${esc(i.need)}</div>` : '');
  h = h.replace('<div class="sub">', info + `<div class="sub"><button class="btn s sm" onclick="csQuickNote('${i.id}')">باقي / خاصنا</button>`);
  return h;
};

function csQuickNote(id) {
  const i = find(id);
  ask('بوشيط ' + i.name, [
    { k: 'rem', l: 'شنو باقي عندنا فالمحل؟ (مثال: غير النسائي)', v: i.rem || '' },
    { k: 'need', l: 'شنو خاص يجيب المعلم؟ (مثال: ألوان رجالية / كحل)', v: i.need || '' }
  ]).then(v => {
    if (!v) return;
    commit('تم التحديث', () => {
      i.rem = v.rem.trim();
      i.need = v.need.trim();
      i.by = S.me;
      i.at = Date.now();
    });
  });
}

render();

/* ============================================================
   v8.js — الخانات المخصصة وتقسيم الإعدادات
   ============================================================ */
/* ===== الخانات المخصصة ===== */
S.fields=S.fields||[];
const SECN={phones:'الهواتف',acc:'الإكسسوارات',case:'البوشيط',rp:'الصيانة'};
let FX={},FXSEC='',FXA='',FE={};
const fxList=(sec,key)=>(S.fields||[]).filter(f=>f.sec==sec&&(!f.kinds||!f.kinds.length||f.kinds.includes(key)));
const fxKey=()=>FXSEC=='acc'?CS.kind:FXSEC=='phones'?PF.brand:'';
const fxVal=(i,f)=>[].concat((i.x||{})[f.id]||[]).filter(Boolean);
const fxTxt=i=>(S.fields||[]).map(f=>fxVal(i,f).length?f.name+' '+fxVal(i,f).join(' '):'').join(' ');
const fxShow=i=>{const p=(S.fields||[]).map(f=>fxVal(i,f).length?f.name+': '+fxVal(i,f).join('، '):'').filter(Boolean);return p.length?`<div class="m">🏷 ${esc(p.join(' · '))}</div>`:''};
const fxIns=(h,t)=>!t?h:h.includes('<div class="sub">')?h.replace('<div class="sub">',()=>t+'<div class="sub">'):h.replace(/<\/div>\s*$/,()=>t+'</div>');
function fxR(){const b=$('fx');if(!b)return;b.innerHTML=fxList(FXSEC,fxKey()).map(f=>{const v=[].concat(FX[f.id]||[]);return `<label>${esc(f.name)}</label><div>${f.opts.map((o,j)=>`<button type="button" class="tag ${v.includes(o)?'on':''}" onclick="fxT('${f.id}',${j})">${esc(o)}</button>`).join('')}${FXA==f.id?`<span class="row2"><input id="fxn" placeholder="خيار جديد"><button type="button" class="btn sm" onclick="fxN('${f.id}')">إضافة</button></span>`:`<button type="button" class="tag" onclick="FXA='${f.id}';fxR()">+ جديد</button>`}</div>`}).join('')}
function fxT(id,j){const f=S.fields.find(x=>x.id==id),o=f.opts[j],a=[].concat(FX[id]||[]);FX[id]=f.multi?(a.includes(o)?a.filter(x=>x!=o):[...a,o]):(a[0]==o?'':o);fxR()}
function fxN(id){const f=S.fields.find(x=>x.id==id),v=($('fxn').value||'').trim();FXA='';if(v&&!f.opts.includes(v)){f.opts.push(v);save()}if(v){const a=[].concat(FX[id]||[]);FX[id]=f.multi?[...a,v]:v}fxR()}
function fxOpen(sec,rec){const a=$('sh').querySelector('.acts');if(!a||!(S.fields||[]).some(f=>f.sec==sec))return;FXSEC=sec;FX={...(rec.x||{})};FXA='';a.insertAdjacentHTML('beforebegin','<div id="fx"></div>');fxR()}
function fxEd(id){const i=find(id);$('sh').innerHTML='<div class="bar"></div><h3>خانات: '+esc(i.name||'')+'</h3><div id="fx"></div><div class="acts"><button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="finish({})">حفظ</button></div>';sheetOpen(v=>{if(v)upd(()=>{i.x={...FX}})});FXSEC='case';FX={...(i.x||{})};FXA='';fxR()}
const _so8=sheetOpen;sheetOpen=function(r){FXSEC='';_so8(r)};
const fxAtt=v=>{if(FXSEC&&v&&typeof v=='object')v.x={...FX};return v};
const _pd8=phDone;phDone=function(v){_pd8(fxAtt(v))};
const _ad8=acDone;acDone=function(v){_ad8(fxAtt(v))};
const _rd8=rDone;rDone=function(v){_rd8(fxAtt(v))};
const _ch8=ch;ch=function(){_ch8();if(FXSEC=='acc'&&$('fx'))fxR()};
if(typeof pc=='function'){const _pc8=pc;pc=function(){_pc8.apply(this,arguments);if(FXSEC=='phones'&&$('fx'))fxR()}}
const _pf8=phForm;phForm=function(rec){_pf8(rec);fxOpen('phones',rec)};
const _af8=acForm;acForm=function(rec){_af8(rec);fxOpen('acc',rec)};
const _rf8=rForm;rForm=function(rec){_rf8(rec);fxOpen('rp',rec)};
const _c8=card;card=function(i){let h=_c8(i);if(i.sec=='case'&&(S.fields||[]).some(f=>f.sec=='case'))h=h.replace('<div class="sub">',()=>`<div class="sub"><button class="btn s sm" onclick="fxEd('${i.id}')">خانات</button>`);return fxIns(h,fxShow(i))};
const _rc8=rc;rc=function(r){return fxIns(_rc8(r),fxShow(r))};
srch=function(q){const n=nz(q),o=[];
if(!SC||SC=='glass')GM().filter(g=>g.models.some(m=>nz(((g.br||{})[m]||'')+m).includes(n))).forEach(g=>o.push(glB(g)));
S.items.filter(i=>i.sec!='glass'&&(!SC||i.sec==SC)&&nz(hay(i)+' '+fxTxt(i)).includes(n)).slice(0,30).forEach(i=>o.push(card(i)));
return o.join('')||'<p class="m">لا نتائج</p>'};
rpList=function(){const q=nz(V.q||''),tab=V.tab||'in',all=V.all&&q;const a=S.rp.filter(r=>(all||r.st==tab)&&inR(tOf(r))&&(!q||nz(r.name+r.tel+r.dev+r.fault+r.note+' '+fxTxt(r)).includes(q))).sort((x,y)=>tOf(y)-tOf(x));return a.map(rc).join('')||'<p class="m">لا شيء</p>'};
/* إدارة الخانات */
VW.st_fx=()=>({t:'الخانات المخصصة',h:'<p class="m">خانة إضافية بخيارات تظهر في نموذج القسم وعلى البطاقة وتدخل في البحث.</p>'+(can('tags')?'<button class="btn" onclick="feEd(null)">+ إضافة خانة</button>':'')+Object.keys(SECN).filter(s=>!V.fs||V.fs==s).map(s=>`<h3>${SECN[s]}</h3>`+((S.fields||[]).filter(f=>f.sec==s).map(f=>`<button class="card row2" onclick="feEd('${f.id}')"><b style="flex:1">${esc(f.name)}</b><span class="m">${f.kinds&&f.kinds.length?esc(f.kinds.join('، ')):'الكل'} · ${f.multi?'عدة قيم':'قيمة'} · ${f.opts.length}</span></button>`).join('')||'<p class="m">لا شيء</p>')).join('')});
function feR(){if($('fen')){FE.name=$('fen').value;FE.opts=$('feo').value}
const kl=FE.sec=='phones'?S.tags.brand:FE.sec=='acc'?S.tags.kind:null;
$('sh').innerHTML=`<div class="bar"></div><h3>${FE.id?'تعديل خانة':'خانة جديدة'}</h3><label>اسم الخانة (مثال: الموصل)<input id="fen" value="${esc(FE.name)}"></label><label>القسم</label><div>${Object.keys(SECN).map(s=>`<button class="tag ${FE.sec==s?'on':''}" onclick="FE.sec='${s}';FE.kinds=[];feR()">${SECN[s]}</button>`).join('')}</div>`+(kl?`<label>تظهر لـ ${FE.sec=='phones'?'ماركات':'أنواع'} محددة (بدون اختيار = الكل)</label><div>${kl.map((k,j)=>`<button class="tag ${FE.kinds.includes(k)?'on':''}" onclick="feK(${j})">${esc(k)}</button>`).join('')}</div>`:'')+`<label>طريقة الاختيار</label><div><button class="tag ${FE.multi?'':'on'}" onclick="FE.multi=false;feR()">قيمة واحدة</button><button class="tag ${FE.multi?'on':''}" onclick="FE.multi=true;feR()">عدة قيم</button></div><label>الخيارات (واحد في كل سطر)<textarea id="feo">${esc(FE.opts)}</textarea></label><div class="acts">${FE.id?'<button class="btn d" onclick="finish({del:1})">حذف</button>':''}<button class="btn s" onclick="finish(null)">إلغاء</button><button class="btn" onclick="feOk()">حفظ</button></div>`}
function feK(j){const k=(FE.sec=='phones'?S.tags.brand:S.tags.kind)[j];FE.kinds=FE.kinds.includes(k)?FE.kinds.filter(x=>x!=k):[...FE.kinds,k];feR()}
function feOk(){FE.name=$('fen').value.trim();FE.opts=$('feo').value;if(!FE.name)return toast('اكتب اسم الخانة');finish({ok:1})}
function feEd(id){if(!can('tags'))return toast('للمدير فقط');const f=id?S.fields.find(x=>x.id==id):null;FE=f?{id:f.id,name:f.name,sec:f.sec,kinds:[...(f.kinds||[])],multi:!!f.multi,opts:f.opts.join('\n')}:{id:'',name:'',sec:V.fs||'acc',kinds:[],multi:false,opts:''};feR();
sheetOpen(v=>{if(!v)return;upd(()=>{S.fields=S.fields||[];if(v.del){S.fields=S.fields.filter(x=>x.id!=FE.id);return}const o={name:FE.name,sec:FE.sec,kinds:FE.kinds,multi:FE.multi,opts:FE.opts.split('\n').map(s=>s.trim()).filter(Boolean)};if(FE.id)Object.assign(S.fields.find(x=>x.id==FE.id),o);else S.fields.push({id:uid(),...o})})})}
/* ===== ترتيب الإعدادات في أقسام ===== */
const tg=(l,g)=>[l,"go('st_tg',{g:'"+g+"'})",()=>S.tags[g].length];
const CATS={ph:['الهواتف',[tg('الماركات','brand'),tg('الألوان','color'),tg('السعات','cap'),tg('RAM','ram'),['حدود النفاد',"go('st_lim')"],['ألوان وحدود الماركات',"go('st_br')"]],'phones'],
gl:['الأنتي كاس',[tg('أنواع الزجاج','glass'),['المستويات والحدود',"go('st_lim')"]],null],
cs:['البوشيط',[tg('الجنس','gender'),tg('الألوان','color')],'case'],
ac:['الإكسسوارات',[tg('الأنواع','kind'),tg('الموصلات','conn'),tg('الفئات السعرية','tier'),['إعداد كل نوع (الموصل والفئة والحد)',"go('st_ak')"]],'acc'],
rp:['الصيانة',[tg('أعطال الصيانة','fault'),['دليل أسعار الإصلاح',"go('gd')"]],'rp']};
VW.st_c=()=>{const c=CATS[V.c]||CATS.ph;return{t:c[0],h:c[1].map(([l,fn,n])=>row(l,fn,n?n():'')).join('')+(c[2]?row('خانات مخصصة لهذا القسم',"go('st_fx',{fs:'"+c[2]+"'})",(S.fields||[]).filter(f=>f.sec==c[2]).length||''):'')}};
VW.st=()=>({t:'المزيد',h:Object.keys(CATS).map(k=>row(CATS[k][0],"go('st_c',{c:'"+k+"'})")).join('')+'<h3>عام</h3>'+row('الخانات المخصصة',"go('st_fx')",(S.fields||[]).length||'')+row('تلوين البطاقات',"go('st_col')")+row('الحقول في النماذج',"go('st_fld')")+row('المستخدمون والصلاحيات',"go('st_users')")+row('المظهر',"go('st_look')")+row('رمز القفل السريع','lkSet()',S.cfg.lk?'مُعيَّن':'غير مُعيَّن')+row('النسخ الاحتياطي والاستعادة',"go('st_bk')")+row('المحذوفات',"go('st_trash')",S.trash.length||'')+row('كل الوسوم (قائمة كاملة)',"go('st_tags')")});
render();

