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
