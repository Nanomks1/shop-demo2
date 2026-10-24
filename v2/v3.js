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
