const FLD={phones:[['color','اللون','L:اللون'],['ram','RAM','L:RAM'],['cap','السعة','L:السعة'],['cond','الحالة','L:الحالة'],['price','السعر','I:pp'],['note','الملاحظة','I:pt'],['res','زر الحجز']],acc:[['conn','الموصل','L:الموصل'],['tier','الفئة','L:الفئة (السعر)'],['brand','الماركة','I:ab'],['price','السعر','I:ap'],['note','الملاحظة','I:an']],rp:[['cap','السعر المتفق','I:r_c'],['dep','العربون','I:r_d'],['part','ينتظر قطعة','I:r_p'],['lock','PIN','I:r_l'],['pat','نمط القفل','P'],['img','الصورة','I:r_i'],['chk','حالة الجهاز','L:حالة الجهاز عند الاستلام'],['note','الملاحظة','I:r_o']]};
const SN={phones:'الهواتف',acc:'الإكسسوارات',rp:'الصيانة'},DL0={low:1,gmin:10,cl:3,stale:7};
let PAN=0;

const hd=(s,k)=>((S.cfg.hide||{})[s]||{})[k];
function hideF(s){
  const sh=$('sh');
  FLD[s].forEach(([k,l,t])=>{
    if(!hd(s,k)||!t)return;
    const m=t[0],x=t.slice(2);
    if(m=='I'){const e=$(x);if(e)(e.closest('label')||e).setAttribute('hidden','')}
    else if(m=='L'){[...sh.querySelectorAll('label')].filter(e=>e.textContent.trim()==x).forEach(e=>{e.setAttribute('hidden','');if(e.nextElementSibling)e.nextElementSibling.setAttribute('hidden','')})}
    else if(m=='P'){[...sh.querySelectorAll('label')].filter(e=>e.textContent.trim().startsWith('نمط القفل')).forEach(e=>e.setAttribute('hidden',''));const v=$('zsv');if(v){v.setAttribute('hidden','');if(v.nextElementSibling)v.nextElementSibling.setAttribute('hidden','')}}
  });
}

const more=(fn)=>{const a=$('sh').querySelector('.acts');if(a)a.insertAdjacentHTML('afterend',`<button class="btn s" onclick="PAN=1;${fn}()">حفظ وإضافة آخر</button>`)};

const _pf=phForm;
phForm=function(r){_pf(r);hideF('phones');if(!r.id)more('phSave')};
const _af=acForm;
acForm=function(r){_af(r);hideF('acc');if(!r.id)more('acSave')};
const _rf=rForm;
rForm=function(r){_rf(r);hideF('rp');if(!r.id)more('rSave')};

const _pd=phDone;
phDone=function(v){_pd(v);if(PAN&&v){PAN=0;setTimeout(phAdd,400)}else PAN=0};
const _ad=acDone;
acDone=function(v){_ad(v);if(PAN&&v){PAN=0;setTimeout(acAdd,400)}else PAN=0};

function fTog(s,k){if(!can('fields'))return toast('للمدير فقط');upd(()=>{S.cfg.hide=S.cfg.hide||{};const h=S.cfg.hide[s]=S.cfg.hide[s]||{};h[k]=h[k]?0:1})}
VW.st_fld=()=>({t:'الحقول في النماذج',h:(can('fields')?'<p class="m">الأزرق = ظاهر. اضغط لإخفاء الحقل أو إظهاره.</p>':'<p class="m">التعديل للمدير فقط.</p>')+Object.keys(FLD).map(s=>`<h3>${SN[s]}</h3><div>${FLD[s].map(([k,l])=>`<button class="tag ${hd(s,k)?'':''}" onclick="fTog('${s}','${k}')">${l}</button>`).join('')}</div>`).join('')});

const LM=[['low','هاتف: قارب على النفاد عند عدد ≤'],['gmin','أنتي كاس: الحد الأدنى الافتراضي للمجموعة'],['cl','بوشيط: قارب على النفاد عند مجموع ≤'],['stale','الجولة: يُعتبر غير مؤكد بعد (أيام)']];
VW.st_lim=()=>({t:'الحدود والتنبيهات',h:LM.map(([k,l])=>`<button class="card row2" onclick="limEd('${k}')"><b style="flex:1">${l}</b><span>${S.cfg[k]??DL0[k]}</span></button>`).join('')+'<p class="m">حد مجموعة أنتي كاس بعينها يُحدَّد من «الحد والسعر» داخلها.</p>'});
function limEd(k){if(!isAdmin())return toast('للمدير فقط');ask('تعديل القيمة',[{k:'v',l:'القيمة',t:'tel',v:S.cfg[k]??DL0[k]}]).then(v=>{if(v&&v.v.trim()!=='')upd(()=>S.cfg[k]=+v.v)})}

const _st=VW.st;
VW.st=function(){const o=_st();o.h+=row('الحدود والتنبيهات',"go('st_lim')")+row('الحقول في النماذج',"go('st_fld')");return o};

const rnd=()=>S.items.filter(i=>i.at&&Date.now()-i.at>(S.cfg.stale??7)*864e5).sort((a,b)=>a.at-b.at);
function gl2(i){const g=GM().find(x=>x.id==i.gid);return g?`<div class="card"><b>زجاج ${esc(i.ty)}: ${esc(g.models.join(' / '))}</b><div class="m">المجموع ${ssum(i.stock)} · آخر تأكيد قبل ${Math.floor((Date.now()-i.at)/864e5)} يوم</div></div>`:''}
function rCf(id){const i=find(id);upd(()=>{i.at=Date.now();i.by=S.me})}

VW.jl=()=>{const a=rnd().slice(0,30);return{t:'الجولة اليومية',h:'<p class="m">أكّد ما لم يتغير وعدّل ما تغيّر. الأقدم أولاً.</p>'+(a.map(i=>`<div>${i.sec=='glass'?gl2(i):card(i)}<button class="btn s" onclick="rCf('${i.id}')">تأكيد: كما هو</button></div>`).join('')||'<p class="m">كل شيء مؤكد حديثاً.</p>')}};

const _bk=BKP;
BKP=function(){_bk();S.cfg.lb=Date.now();save();render()};

const _H2=VW.home;
VW.home=function(){
  const r=_H2(),n=rnd().length,old=(S.items.length||S.rp.length)&&Date.now()-(S.cfg.lb||0)>7*864e5;
  r.h=(old?`<div class="card"><b>احفظ نسخة احتياطية</b><div class="m">لم تُحفظ نسخة منذ أكثر من أسبوع.</div><button class="btn s" onclick="BKP()">حفظ الآن</button></div>`:'')+r.h+(n?`<button class="btn s" onclick="go('jl')">الجولة اليومية (${n})</button>`:'');
  return r;
};

render();
