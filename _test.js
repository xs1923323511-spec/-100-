
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp5={
day:'废弃医院', text:`药房里有抗生素。二楼传来声响。`,
choices:[
{t:'（1）小心搜索药房',rt:'你找到一批抗生素和绷带。',eff:{s:15,h:5},next:'__ret'},
{t:'（2）上楼查看',rt:'发现一个受伤幸存者。治疗后他告诉你一个秘密物资点。',eff:{s:25,h:15},next:'__ret'},
{t:'（3）放火烧掉医院',rt:'你清理潜在威胁，但内心不安。',eff:{a:-3,h:-10},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp5={
day:'废弃医院', text:`药房里有抗生素。二楼传来声响。`,
choices:[
{t:'（1）小心搜索药房',rt:'你找到一批抗生素和绷带。',eff:{s:15,h:5},next:'__ret'},
{t:'（2）上楼查看',rt:'发现一个受伤幸存者。治疗后他告诉你一个秘密物资点。',eff:{s:25,h:15},next:'__ret'},
{t:'（3）放火烧掉医院',rt:'你清理潜在威胁，但内心不安。',eff:{a:-3,h:-10},next:'__ret'}
]};
scenes.exp6={
day:'废弃学校', text:`操场上有几只被铁链拴住的丧尸——有人用它们警戒。`,
choices:[
{t:'（1）潜入教学楼',rt:'你在教室找到罐头和教材（可作燃料）。',eff:{s:20},next:'__ret'},
{t:'（2）调查丧尸',rt:'丧尸被改造过，有编号。附近可能有实验室。',eff:{h:5},next:'__ret'},
{t:'（3）快速搜刮',rt:'你拿了些东西就走。',eff:{s:12,a:2},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp5={
day:'废弃医院', text:`药房里有抗生素。二楼传来声响。`,
choices:[
{t:'（1）小心搜索药房',rt:'你找到一批抗生素和绷带。',eff:{s:15,h:5},next:'__ret'},
{t:'（2）上楼查看',rt:'发现一个受伤幸存者。治疗后他告诉你一个秘密物资点。',eff:{s:25,h:15},next:'__ret'},
{t:'（3）放火烧掉医院',rt:'你清理潜在威胁，但内心不安。',eff:{a:-3,h:-10},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>惊变100天 - 末日生存互动游戏</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Noto Sans SC',sans-serif;background:#0a0a0a;color:#d4d4d4;overflow-x:hidden}
.gc{max-width:800px;margin:0 auto;padding:10px;min-height:100vh;display:flex;flex-direction:column}
header{background:linear-gradient(180deg,#1a1a2e,#16213e);border:1px solid #2a2a4a;border-radius:10px;padding:12px;margin-bottom:10px}
.title{text-align:center;font-size:1.5em;color:#e94560;font-weight:700;text-shadow:0 0 10px rgba(233,69,96,.5);letter-spacing:4px;cursor:pointer;user-select:none}
.stats{display:flex;justify-content:space-around;flex-wrap:wrap;gap:6px;margin-top:8px}
.stat{text-align:center;padding:5px 10px;border-radius:6px;min-width:72px}
.st-h{background:rgba(46,204,113,.15);border:1px solid #2ecc71}
.st-s{background:rgba(241,196,15,.15);border:1px solid #f1c40f}
.st-a{background:rgba(231,76,60,.15);border:1px solid #e74c3c}
.st-d{background:rgba(52,152,219,.15);border:1px solid #3498db}
.stat .l{font-size:10px;opacity:.7}
.stat .v{font-size:17px;font-weight:700}
.st-h .v{color:#2ecc71}.st-s .v{color:#f1c40f}.st-a .v{color:#e74c3c}.st-d .v{color:#3498db}
.tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px;justify-content:center}
.tag-p{border:1px solid #9b59b6;border-radius:12px;padding:1px 9px;font-size:11px;color:#bb8fce;background:rgba(155,89,182,.12)}
.tag-w{border:1px solid #e67e22;border-radius:10px;padding:1px 7px;font-size:10px;color:#f0b27a;background:rgba(230,126,34,.1)}
.prog{height:3px;background:#2a2a4a;border-radius:2px;margin:5px 0}
.pf{height:100%;background:linear-gradient(90deg,#e94560,#e67e22);border-radius:2px;transition:width .5s}
#main{flex:1;background:rgba(20,20,40,.85);border:1px solid #2a2a4a;border-radius:10px;padding:20px;overflow-y:auto;min-height:280px;max-height:52vh;line-height:1.8;font-size:15px}
.badge{background:#e94560;color:#fff;padding:2px 12px;border-radius:4px;font-size:12px;display:inline-block;margin-bottom:8px}
.narr{white-space:pre-wrap;margin-bottom:10px}
.narr .eff{color:#f0b27a;display:block;margin-top:6px;font-size:14px}
.result-box{background:rgba(255,255,255,.04);border-left:3px solid #e94560;padding:12px 16px;margin:10px 0;border-radius:4px;line-height:1.7}
.ch-area{margin-top:12px;border-top:1px solid #2a2a4a;padding-top:10px}
.ch{display:block;width:100%;text-align:left;padding:11px 14px;margin-bottom:7px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid #3a3a5a;border-radius:8px;color:#d4d4d4;font-size:14px;cursor:pointer;transition:.2s;font-family:inherit}
.ch:hover{background:linear-gradient(135deg,#2a2a4e,#1a2a4e);border-color:#e94560;transform:translateX(4px)}
.ch .h{display:block;font-size:10px;color:#888;margin-top:3px}
.ch-s{border-color:#e94560;background:linear-gradient(135deg,#2a1a2e,#1a1a3e)}
.ch:disabled{opacity:.4;cursor:not-allowed;transform:none!important}
.btn-cont{display:block;width:100%;padding:12px;background:linear-gradient(135deg,#e94560,#c0392b);border:none;border-radius:8px;color:#fff;font-size:16px;cursor:pointer;font-family:inherit;margin-top:10px;transition:.2s}
.btn-cont:hover{background:linear-gradient(135deg,#ff6b81,#e74c3c);transform:translateY(-2px)}
.modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:999;justify-content:center;align-items:center}
.modal.on{display:flex}
.modal-b{background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #e67e22;border-radius:12px;padding:28px;max-width:500px;width:90%;text-align:center;animation:ps 2s infinite}
@keyframes ps{0%,100%{box-shadow:0 0 20px rgba(230,126,34,.3)}50%{box-shadow:0 0 40px rgba(230,126,34,.6)}}
.modal-b .mt{font-size:22px;color:#e67e22;font-weight:700;margin-bottom:6px}
.modal-b .md{font-size:14px;color:#bbb;margin-bottom:12px;line-height:1.6}
.modal-b .ms{font-size:12px;color:#888}
.modal-b button{background:#e67e22;border:none;padding:8px 28px;border-radius:6px;color:#fff;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit}
.modal-b button:hover{background:#d35400}
.modal-e .modal-b{border-color:#e94560}
.modal-e .mt{color:#e94560;font-size:26px}
.modal-e .r{font-size:42px;margin:10px 0;color:#f1c40f}
.modal-e .sf{font-size:18px;color:#f1c40f;font-weight:700}
@keyframes fi{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.fi{animation:fi .4s ease}
.reset-btn{display:block;margin:10px auto 0;background:rgba(255,255,255,.04);border:1px solid #3a3a5a;color:#777;padding:5px 14px;border-radius:4px;cursor:pointer;font-size:11px;font-family:inherit}
.reset-btn:hover{background:rgba(255,255,255,.1);color:#aaa}
.cheat-bar{display:none;background:#1a0a0a;border:1px solid #e94560;border-radius:6px;padding:10px;margin-bottom:8px;flex-wrap:wrap;gap:6px}
.cheat-bar.on{display:flex}
.cheat-btn{background:#2a1a1a;border:1px solid #e94560;color:#e94560;padding:5px 12px;border-radius:4px;cursor:pointer;font-size:12px;font-family:inherit;transition:.2s}
.cheat-btn:hover{background:#3a1a1a;border-color:#ff6b81}
footer{text-align:center;padding:6px;color:#444;font-size:10px;margin-top:auto}
@media(max-width:600px){
.gc{padding:4px}header{padding:8px}.title{font-size:1.2em}.stat{min-width:56px;padding:3px 6px}.stat .v{font-size:14px}#main{padding:12px;font-size:14px;max-height:45vh}.ch{padding:9px 11px;font-size:13px}
}
</style>
</head>
<body>
<div class="gc">
<header>
<div class="title" id="titleEl" onclick="clickTitle()">☠ 惊变100天</div>
<div class="cheat-bar" id="cheatBar">
<button class="cheat-btn" onclick="cheat(50)">🧍人性+50</button>
<button class="cheat-btn" onclick="cheat(200)">📦物资+200</button>
<button class="cheat-btn" onclick="cheat(0,50)">🔫弹药+50</button>
<button class="cheat-btn" onclick="cheat(0,0,10)">📅跳到第50天</button>
<button class="cheat-btn" onclick="cheat(0,0,0,'伊芙琳')">👩添加伊芙琳</button>
<button class="cheat-btn" onclick="cheat(0,0,0,0,['恋人','别墅的主人','复仇者','末世之王','救世主','善良的人'])">🏆全词条</button>
</div>
<div class="stats">
<div class="stat st-d"><div class="l">天数</div><div class="v" id="sDay">-</div></div>
<div class="stat st-h"><div class="l">人性值</div><div class="v" id="sHum">50</div></div>
<div class="stat st-s"><div class="l">物资</div><div class="v" id="sSup">0</div></div>
<div class="stat st-a"><div class="l">弹药</div><div class="v" id="sAmm">0</div></div>
</div>
<div class="tags" id="partnerTags"></div>
<div class="tags" id="wordTags"></div>
<div class="prog"><div class="pf" id="prog" style="width:0%"></div></div>
</header>
<div id="main"><div class="narr fi">加载中...</div></div>
<footer>《惊变100天》末日生存互动文字游戏</footer>
</div>

<div class="modal" id="mWord">
<div class="modal-b">
<div class="mt" id="mwTitle">★ 获得词条</div>
<div class="md" id="mwDesc"></div>
<div class="ms" id="mwScore"></div>
<button onclick="closeModal('mWord')">确认</button>
</div>
</div>

<div class="modal modal-e" id="mEnd">
<div class="modal-b">
<div class="mt" id="meTitle">大结局</div>
<div class="md" id="meDesc"></div>
<div class="r" id="meRating">-</div>
<div class="sf" id="meScore">-</div>
<div id="meDetail" style="font-size:13px;color:#888;margin:8px 0;white-space:pre-wrap"></div>
<button onclick="restartGame()">重新开始</button>
</div>
</div>

<div class="modal" id="mCheatPwd">
<div class="modal-b" style="animation:none;border-color:#e94560">
<div class="mt" style="color:#e94560">🔐 输入密码</div>
<input type="password" id="cheatPwdInput" style="width:80%;padding:8px;margin:10px 0;border:1px solid #3a3a5a;border-radius:4px;background:#0a0a0a;color:#fff;font-size:16px;text-align:center;font-family:inherit" placeholder="输入密码" maxlength="20">
<div id="cheatPwdErr" style="color:#e74c3c;font-size:12px;display:none">密码错误</div>
<button onclick="checkCheatPwd()" style="background:#e94560">确认</button>
</div>
</div>

<script>
// ====== SOUND EFFECTS ======
let audioCtx = null;
function playClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = 800;
    o.type = 'sine';
    g.gain.setValueAtTime(0.15, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    o.start(audioCtx.currentTime);
    o.stop(audioCtx.currentTime + 0.08);
  } catch(e) { /* silent fallback */ }
}
function playWord() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.12, audioCtx.currentTime + i*0.1);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.1 + 0.12);
      o.start(audioCtx.currentTime + i*0.1);
      o.stop(audioCtx.currentTime + i*0.1 + 0.12);
    });
  } catch(e) {}
}
function playEnding() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [392,440,523,659,784,1047].forEach((f,i)=>{
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = f;
      o.type = 'triangle';
      g.gain.setValueAtTime(0.1, audioCtx.currentTime + i*0.15);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.15 + 0.25);
      o.start(audioCtx.currentTime + i*0.15);
      o.stop(audioCtx.currentTime + i*0.15 + 0.25);
    });
  } catch(e) {}
}

// ====== CHEAT MENU ======
let titleClicks = 0;
let cheatOpen = false;
function clickTitle() {
  playClick();
  if (cheatOpen) return;
  titleClicks++;
  if (titleClicks >= 10) {
    titleClicks = 0;
    document.getElementById('cheatPwdInput').value = '';
    document.getElementById('cheatPwdErr').style.display = 'none';
    document.getElementById('mCheatPwd').classList.add('on');
  }
}
function checkCheatPwd() {
  const pwd = document.getElementById('cheatPwdInput').value;
  if (pwd === 'xs0426') {
    document.getElementById('mCheatPwd').classList.remove('on');
    cheatOpen = true;
    document.getElementById('cheatBar').classList.add('on');
    playWord();
  } else {
    document.getElementById('cheatPwdErr').style.display = 'block';
    setTimeout(()=>document.getElementById('cheatPwdErr').style.display='none',2000);
  }
}
function cheat(h, s, a, partner, words) {
  if (h) G.h = Math.min(999, G.h + h);
  if (s) G.s = Math.min(99999, G.s + s);
  if (a!==undefined && a!==null && a!==false) G.a = Math.min(9999, G.a + a);
  if (partner) addP(partner);
  if (words) words.forEach(w=>{if(!hasW(w))addW(w,w,100)});
  if (a === 10) { // jump to day 50
    G.dayN = 49;
  }
  // Handle "跳到第50天" - special case
  if (arguments.length === 3 && a === 10 && h === 0 && s === 0) {
    // skip - already handled above
  }
  rend();
  // Refresh current scene
  if (cur) render(cur);
  playClick();
}
// Fix cheat function - the jump day needs special handling
const _cheat = cheat;
cheat = function() {
  if (arguments.length >= 4 && typeof arguments[3] === 'number' && arguments[3] === 10) {
    // Jump to day 50: go to d50 scene
    G.dayN = 50;
    rend();
    go('d50');
    playClick();
    return;
  }
  if (arguments[3] === '伊芙琳') {
    addP('伊芙琳');
    G.evelyn = 1;
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[4]) {
    const arr = arguments[4];
    arr.forEach(w => { if(!hasW(w)) addW(w, w, 100); });
    rend();
    if (cur) render(cur);
    playClick();
    return;
  }
  if (arguments[0]) G.h = Math.min(999, G.h + arguments[0]);
  if (arguments[1]) G.s = Math.min(99999, G.s + arguments[1]);
  if (arguments[2] && arguments[2] <= 50) G.a = Math.min(9999, G.a + arguments[2]);
  rend();
  if (cur) render(cur);
  playClick();
};

// ====== GAME STATE ======
let G = {};
function initG() {
  G = {
    h:50, s:0, a:0,
    day:'序幕', dayN:0,
    shelter:null,
    partners:[], words:[],
    dead:false, converted:false,
    exploreCount:0,
    black:0, evelyn:0, luna:0, lemu:0, john:0,
    heating:false, radio:false, lover:false,
    lastScene:null, route:'normal', usedEvents:{}, currentEvent:null
  };
}
initG();

function hasW(n){return G.words.some(w=>w.n===n)}
function addW(n,d,s){
  if(!hasW(n)){G.words.push({n,d,s});showWord(n,d,s);playWord()}
}
function hasP(n){return G.partners.includes(n)}
function addP(n){if(!hasP(n))G.partners.push(n)}
function rmP(n){G.partners=G.partners.filter(x=>x!==n)}
function mod(k,v){
  if(k==='h')G.h=Math.max(-999,Math.min(999,G.h+v));
  else if(k==='s')G.s=Math.max(0,Math.min(99999,G.s+v));
  else if(k==='a')G.a=Math.max(0,Math.min(9999,G.a+v));
}
function applyE(e){
  let r='';
  for(let k in e){let v=e[k];if(v!==0){mod(k,v);r+=`<span style="color:${v>0?'#2ecc71':'#e74c3c'};font-weight:700">${k==='h'?'🧍人性':k==='s'?'📦物资':'🔫弹药'} ${v>0?'+':''}${v}</span> `}}
  return r;
}

// ====== UI ======
function rend(){
  document.getElementById('sHum').textContent=G.h;
  document.getElementById('sSup').textContent=G.s;
  document.getElementById('sAmm').textContent=G.a;
  document.getElementById('sDay').textContent=G.day;
  document.getElementById('prog').style.width=Math.min(100,Math.round(G.dayN/100*100))+'%';
  document.getElementById('partnerTags').innerHTML=G.partners.map(n=>`<span class="tag-p">${n}</span>`).join('');
  document.getElementById('wordTags').innerHTML=G.words.map(w=>`<span class="tag-w">《${w.n}》</span>`).join('');
}

function showWord(n,d,s){
  document.getElementById('mwTitle').textContent=`★ 获得词条：《${n}》`;
  document.getElementById('mwDesc').textContent=d;
  document.getElementById('mwScore').textContent=`评分：${s>0?'+':''}${s}`;
  document.getElementById('mWord').classList.add('on');
}
function closeModal(id){
  document.getElementById(id).classList.remove('on');
  if(window._afterModal)window._afterModal();
}

function showEnd(title,desc,rating,score,detail){
  playEnding();
  document.getElementById('meTitle').textContent=title;
  document.getElementById('meDesc').textContent=desc;
  document.getElementById('meRating').textContent=rating;
  document.getElementById('meScore').textContent=`最终分数：${score}`;
  document.getElementById('meDetail').textContent=detail;
  document.getElementById('mEnd').classList.add('on');
}
function restartGame(){document.getElementById('mEnd').classList.remove('on');initG();go('prologue')}

// ====== SCENE ENGINE ======
let cur=null, hist=[];
let _nextScene = null; // queued next scene after result display

function go(id){
  playClick();
  hist.push(id);
  let sc=scenes[id];
  if(!sc){render({text:`场景丢失: ${id}`,reset:true});return}
  if(sc.day&&sc.day.includes('惊变')){
    let m=sc.day.match(/\d+/);
    if(m)G.dayN=parseInt(m[0]);
  }
  if(id==='ending_show'){
    render({text:'',reset:true});
    calcEnding();
    return;
  }
  render(sc);
}

function render(sc){
  cur=sc;
  rend();
  let el=document.getElementById('main');
  if(!sc){el.innerHTML='<div class="narr">[错误]</div>';return}
  let h='';
  if(sc.day)h+=`<div class="badge">${sc.day}</div>`;
  if(sc.text)h+=`<div class="narr fi">${sc.text}</div>`;
  if(sc.choices&&sc.choices.length>0){
    h+='<div class="ch-area">';
    sc.choices.forEach((c,i)=>{
      let dis=c.cond&&!c.cond()?'disabled':'';
      let ext=c.sp?'ch-s':'';
      let ehText=typeof c.eh==='function'?c.eh():c.eh||'';h+=`<button class="ch ${ext}" ${dis} onclick="pick(${i})">${c.t}${ehText?`<span class="h">${ehText}</span>`:''}</button>`;
    });
    h+='</div>';
  }
  if(sc.reset)h+=`<button class="reset-btn" onclick="restartGame()">重新开始</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

// Show result and continue button
function showResult(rt, eh, next) {
  let el=document.getElementById('main');
  let h=`<div class="narr fi"><div class="result-box">${rt}</div>`;
  if(eh) h+=`<div class="eff" style="color:#888;font-size:13px">${eh}</div>`;
  h+=`</div><button class="btn-cont" onclick="go('${next}')">继续 ▶</button>`;
  el.innerHTML=h;
  el.scrollTop=0;
}

function pick(idx){
  if(!cur||!cur.choices||idx>=cur.choices.length)return;
  let c=cur.choices[idx];
  if(c.cond&&!c.cond())return;
  playClick();

  if(c.exp)G.lastScene=hist[hist.length-1];
  if(c.eventId)G.currentEvent=c.eventId;
  let eh=applyE(c.effects||{});
  if(c.w){addW(c.w.n,c.w.d,c.w.s)}
  if(c.p)addP(c.p);
  if(c.rp)c.rp.forEach(n=>rmP(n));
  if(c.cb)c.cb();
  let rtText = typeof c.rt === 'function' ? c.rt() : (c.rt || '');
  // Death check
  if(c.d){G.dead=true;go('ending_death');return}

  // Supply check
  if(G.s<=0&&G.dayN>1){
    if(G.partners.length>0&&!G.converted){
      let pn=G.partners[0];
      if(confirm(`物资耗尽！将${pn}转化为物资继续生存？`)){
        G.s+=30;G.converted=true;rmP(pn);applyE({h:-10});
        if(!hasW('自私的胆小鬼'))addW('自私的胆小鬼','尼奥为生存将同伴转化为物资',-200);
        rend();
      }else{go('ending_starvation');return}
    }else{go('ending_starvation');return}
  }

  let nxt = c.next;
  // Handle __ret
  if(nxt==='__ret'&&G.lastScene){if(G.currentEvent)G.usedEvents[G.currentEvent]=true;G.currentEvent=null;nxt=_nextDay[G.lastScene]||G.lastScene;G.lastScene=null}

  if(rtText){
    // Show result text first, then advance
    showResult(rtText, eh, nxt);
  }else if(nxt){
    go(nxt);
  }
}

// ====== ENDING CALC ======
function calcEnding(){
  if(!G.converted&&!hasW('人性的光芒'))addW('人性的光芒','尼奥在末世中坚守了作为人才有的底线',450);
  if(G.exploreCount>=7&&!hasW('末世之王'))addW('末世之王','尼奥从未懈怠，一直在探索与冒险的路上',300);
  let ws=G.words.reduce((s,w)=>s+w.s,0);
  let base=G.h*10+ws;
  let multi=hasW('真正的救世主')?1.5:hasW('尼奥之死')?1.2:1;
  let total=Math.round(base*multi);
  let rating='X';
  if(total<0)rating='X级';
  else if(total<1000)rating='C级';
  else if(total<2000)rating='B级';
  else if(total<3000)rating='A级';
  else if(total<5000)rating='S级';
  else if(total<7000)rating='SS级';
  else rating='SSS级';
  let em={'X级':'💀','C级':'😞','B级':'😐','A级':'😊','S级':'🌟','SS级':'⭐⭐','SSS级':'👑⭐⭐⭐'};
  let desc=G.lover?'你与伊芙琳在末日中相爱，共同面对了100天的惊变。':'你孤独地在末世中生存了100天。';
  let det=`人性值×10 = ${G.h}×10 = ${G.h*10}分\n词条总分：${ws}分\n基础分：${G.h*10+ws}\n大结局倍率：×${multi}\n━━━━━━━━━━━━━━\n最终分数：${total}分`;
  showEnd('大结局',desc,`${em[rating]||''} ${rating}`,total,det);
}

const _nextDay = {
  'd5':'d10','d10':'d15','d15':'d20','d20':'d25','d25':'d30',
  'd35':'d40','d40':'d45','d45':'d50','d50':'d55','d55':'d60',
  'd60':'d65','d65':'d70','d70':'d75','d75':'d80','d80':'d85','d85':'d90','d90':'d100'
};

// ====== SCENES ======
const scenes={};

// ----- PROLOGUE -----
scenes.prologue={
day:'序幕', text:`《惊变100天》\n\n上一世，丧尸病毒爆发。你苟延残喘地生存到正好一个月时，遭遇亲人背叛。尸潮把你追堵在绝境，你为了不被感染，跳下悬崖结束了生命。\n\n没想到你重生了，回到了丧尸病毒爆发前的6小时。冥冥之中有一种直觉——"一定要生存到第100天。"\n\n这一世，你将把你失去的全部拿回来。\n\n你叫尼奥。在这个末世中，你需要管理好人性和物资，做出正确的选择。`,
choices:[{t:'▶ 开始游戏',next:'intro'}]
};
scenes.intro={
day:'爆发前6小时', text:`主持人话术：你将扮演男主角尼奥。不同的选择将会触发不同的结局。\n\n本期共三种数值：人性值、物资、弹药。\n人性值初始为50点。\n\n接下来，游戏开始。`,
choices:[{t:'▶ 开始末世之旅',next:'pre1'}]
};

// ----- PRE-OUTBREAK -----
scenes.pre1={
day:'爆发前5小时', text:`时间紧迫，不足以囤积大量物资。你决定优先找一处带着物资的庇护所，这样最节省时间。\n\n你记得有两处相对安全的地点，请选择：`,
choices:[
{t:'（1）山中别墅',rt:'这是一位富豪打造的末世堡垒。四面环山，配有发电机、冷库、过滤系统、水循环、电力防护网。院内还有改装越野车。冷库有物资和手枪。',eff:{s:50,a:5},cb:()=>{G.shelter='villa';if(!hasW('别墅的主人'))addW('别墅的主人','尼奥占据了一处豪华末世堡垒',100)},next:'pre2'},
{t:'（2）城郊防空洞',rt:'外部水泥浇筑包裹金属，配有电力新风、净水器、防毒通道、改装防弹车。洞口隐蔽配金属密码门。仓库有冷藏食物和左轮手枪。',eff:{s:40,a:10},cb:()=>{G.shelter='bunker'},next:'pre2'}
]};
scenes.pre2={
day:'爆发前2小时', text:`你决定再做一些准备……`,
choices:[
{t:'（1）继续囤积食物',rt:'你购买了大量的马铃薯、白菜、方便面、压缩饼干、牛肉和水果。',eff:{s:70},next:'pre3'},
{t:'（2）购买一些药品',rt:'你购买了各种药物和维生素，甚至搞来了一针肾上腺素。',eff:{s:40},next:'pre3',w:{n:'异能',d:'肾上腺素——面临死亡时可强行存活一次',s:100}},
{t:'（3）囤积武器弹药',rt:'你用前世的记忆找到地下枪贩，用积蓄换了一批武器弹药。',eff:{s:-10,a:20},next:'pre3'}
]};
scenes.pre3={
day:'爆发前', text:`距离末世爆发不到一小时。你隐隐感受到一种直觉——你重生了。`,
choices:[{t:'▶ 迎接末世降临',cb:()=>{addW('穿越者','尼奥带着前世记忆重生',200);G.radio=true},next:'pre4'}]
};

// ----- DAY 1-5 -----
scenes.d1={
day:'惊变第一天', text:`你在庇护所哪也没敢去。天黑了，你看着胳膊上的伤疤久久不能入睡。这是上一世你在躲避尸潮时意外划伤的。\n\n你内心开始动摇：`,
choices:[
{t:'（1）不择手段，活着比什么都重要',eff:{h:-10},rt:'你坚定了信念：末世之中，生存高于一切。',next:'d2'},
{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},
{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}
]};;
scenes.pre4={
day:'末日降临', text:`商场里传来一声惨叫。几只丧尸正在啃咬路人。你知道——末世爆发了。

你急忙开车赶回庇护所。街道上乱作一团，尖叫声与嘶吼声冲击着你的神经。

你走神时撞到了一只带着项圈的狗，它无法行走了。如果你现在直接走掉，它可能会丧命。`,
choices:[
{t:'（1）带回庇护所救治（消耗3弹药）',rt:'你救治了狗狗，给它起名莱姆。它将是你在末世中最值得信任的伙伴！',eff:{a:-3,h:10},p:'莱姆',cb:()=>{G.lemu=1;addW('伙伴','尼奥与莱姆在末日中相依为命',100)},next:'d1'},
{t:'（2）无视它',rt:'身处末世，仁慈就是对自己的残忍。',eff:{h:-5},next:'d1'},
{t:'（3）转化为物资',rt:'这不是狗，这是储备粮。你结束了它的痛苦。',eff:{s:10,h:-30},next:'d1',w:{n:'自私的胆小鬼',d:'尼奥将狗转化为了物资',s:-100}}
]};
scenes.d2={
day:'惊变第二天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'庇护所很安全。你煮了一份红烧牛肉面，感觉很幸福。',eff:{h:5,s:-5},next:'d3'},
{t:'（2）外出探索物资',rt:'你在附近探索，找到了一些物资和弹药。',eff:{s:15,a:2},next:'d3'}
]};
scenes.d3={
day:'惊变第三天', text:`消耗5物资。你决定……`,
choices:[
{t:'（1）苟在家里',rt:'你煮了一份老坛酸菜面，感到很幸福。',eff:{h:5,s:-5},next:'d4'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些可用物资。',eff:{s:15,a:1},next:'d4'}
]};
scenes.d4={
day:'惊变第四天', text:`消耗5物资。\n${G.shelter==='villa'?'作为别墅主人，今天有特殊事件……':'你看着防空洞的天花板有些无聊。'}`,
choices:[
{t:'（1）苟在家里',rt:G.shelter==='villa'?'门外有动静。一个满身是伤的男人倒在门口——他叫布莱克，别墅原主人。他请求你收留。':'你看着天花板开始emo了。',eff:G.shelter==='villa'?{h:5}:{h:-5,s:-5},next:G.shelter==='villa'?'d4_villa':'d5'},
{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},
{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}
]};
scenes.d4_villa={
day:'惊变第四天 - 别墅', text:`布莱克虚弱地向你道谢。他告诉你这座别墅原本是他的，他外出寻找物资时遭遇了丧尸袭击。\n\n"兄弟，收留我吧。我可以帮你守夜，我知道这附近哪里能找到物资。弹药我也都给你。"\n\n他真诚地看着你，等你答复。`,
choices:[
{t:'（1）收留他',rt:'布莱克成为了你的伙伴。他熟悉这一带。',eff:{a:10,h:10},p:'布莱克',next:'d5'},
{t:'（2）拒绝他',rt:'你冷酷地关上了门。末世之中不能轻信任何人。',eff:{h:-10},next:'d5',w:{n:'自私的胆小鬼',d:'尼奥拒绝了需要帮助的人',s:-100},cb:()=>{G.black=3}}
]};
scenes.d5={
day:'惊变第五天', text:`消耗5物资。${G.shelter==='bunker'?'（防空洞主人，今天有特殊发现）':''}`,
choices:[
{t:'（1）苟在家里',rt:'你犒劳自己，做了一份意大利面。',eff:{h:5,s:-5},next:'d10'},
{t:'（2）外出探索物资',rt:G.shelter==='bunker'?'你在防空洞附近发现隐藏地下室，里面有武器和物资。':'你找到了一些物资。',eff:G.shelter==='bunker'?{s:20,a:5,h:5}:{s:15,a:2},next:'d10'},
{t:'（3）探索未知区域',rt:'你决定深入探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};

// ----- DAY 10-75 quick progression -----

// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\n\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\n\n你知道开门意味着风险……`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};

scenes.d10={
day:'惊变第十天', text:`全球电力系统瘫痪，天空异常灰暗。\n\n物资消耗+10，期间消耗15物资。\n\n远处传来广播声。`,
choices:[
{t:'（1）苟在家里',rt:'你待在庇护所观望。',eff:{h:5,s:-15},next:'d15'},
{t:'（2）外出探索物资',rt:'你在废墟中找到了一些罐头和弹药。',eff:{s:20,a:5},next:'d15'},
{t:'（3）收听收音机',rt:'收音机："请保护好自己！约翰博士正在研究丧尸病毒血清。"',cond:()=>G.radio,next:'d15',cb:()=>{G.radio=false}},
{t:'（4）探索未知区域',rt:'你决定外出探索这片区域……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d15={
day:'惊变十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外消耗）':''}。\n你决定……`,
choices:[
{t:'（1）苟在家里',rt:hasP('布莱克')?'布莱克催促你外出，你懒得理会。':'你放松休息了一天。',eff:{h:hasP('布莱克')?0:5,s:-15},next:'d20'},
{t:'（2）外出探索物资',rt:'你进行了一次区域探索。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d20'},
{t:'（3）探索未知区域',rt:'你决定去更远的地方探索……',next:'exp_discover',sp:true,exp:true}
]};
scenes.d20={
day:'惊变二十天', text:`根据前世记忆，郊外有黎明者营地，可以交易物资。\n消耗15物资。`,
choices:[
{t:'（1）苟在家里',rt:'你看着天花板开始emo。',eff:{h:-5,s:-15},next:'d25'},
{t:'（2）外出探索物资',rt:'你搜集了一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d25'},
{t:'（3）前往黎明者营地',rt:'天台上的幸存者市场，可交易物资。',next:'camp',sp:true},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.camp={
day:'黎明者营地', text:`热闹的交易市场。`,
choices:[
{t:'（1）物资换弹药（10:5）',rt:'你用10物资换5弹药。',eff:{s:-10,a:5},next:'camp'},
{t:'（2）弹药换物资（5:10）',rt:'你用5弹药换10物资。',eff:{a:-5,s:10},next:'camp'},
{t:'（3）"以大搏小"游戏（押10或20物资）',next:'camp_gamble'},
{t:'（4）赌命游戏（50天后）',rt:'左轮一发子弹，对自己开枪。中4则死。赢奖100物资。',cond:()=>G.dayN>=50,next:'camp',sp:true},
{t:'（5）回家',next:'d25'}
]};
scenes.camp_gamble={
day:'以大搏小', text:`押注10/20物资，投掷4次骰子。无重复则赢一半（押注返还），有重复则输。`,
choices:[
{t:'押10物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=5}else{G.s-=10}},next:'camp'},
{t:'押20物资',rt:'赌一把！看运气了。',cb:()=>{let r=[...Array(4)].map(_=>Math.random()*6|0);let win=new Set(r).size===4;if(win){G.s+=10}else{G.s-=20}},next:'camp'},
{t:'不玩了',rt:'你收好物资离开赌桌。',next:'camp'}
]};
scenes.d25={
day:'惊变二十五天', text:`消耗15物资${G.partners.length>0?'（伙伴额外计算）':''}。`,
choices:[
{t:'（1）苟在家里',rt:'休息一天。',eff:{h:5,s:-15},next:'d30'},
{t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20,a:5},cb:()=>{G.exploreCount++},next:'d30'},
{t:'（3）黎明者营地',next:'camp'},
{t:'（4）探索未知区域',next:'exp_discover',sp:true,exp:true}
]};
scenes.d30={
day:'惊变第三十天', text:`消耗15物资。\n你听到远处传来求救声。一个年轻女性被丧尸围困在车后。`,
choices:[
{t:'（1）开枪救她（消耗3弹药）',rt:'你击毙了丧尸。"我叫伊芙琳。"',eff:{a:-3,h:10},next:'d30_ev'},
{t:'（2）用铁管冲上去',rt:'你与丧尸搏斗救下她。"你够勇的。"',eff:{h:15,s:-5},next:'d30_ev'},
{t:'（3）绕道离开',rt:'你转身离开，但内心有些不安。',eff:{h:-10},next:'d35'}
]};
scenes.d30_ev={
day:'惊变第三十天', text:`"我叫伊芙琳。"她伸出手。\n\n"我知道附近有个超市，一起去吗？"`,
choices:[
{t:'（1）一起去超市',rt:'你们配合默契，搜集了大量物资。',eff:{s:30,a:3,h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（2）邀请她回庇护所',rt:'伊芙琳看了看："条件不错，我住下了。"',eff:{h:10},p:'伊芙琳',cb:()=>{G.evelyn=1},next:'d35'},
{t:'（3）就此别过',rt:'伊芙琳有些失望，但尊重你的决定。',eff:{h:-5},next:'d35'}
]};

// Day 35-75 helper
function makeDay(n,consume,extra){
  let labels={35:'三十五',40:'四十',45:'四十五',50:'五十',55:'五十五',60:'六十',65:'六十五',70:'七十',75:'七十五'};
  let label='惊变'+(labels[n]||'');
  let hText=`${label}天`;
  if(consume<=15)hText+=` 消耗${consume}物资`;
  else hText+=` 消耗${consume}物资${G.heating||G.partners.length>0?'（额外计算）':''}`;
  hText+=`。\n${extra||''}`;
  return {
    day:hText, text:`你决定……`,
    choices:[
      {t:'（1）苟在家里',rt:'休息了一天。',eff:{h:5,s:-consume},next:'d'+(n+5-n%5)},
      {t:'（2）外出探索',rt:'搜集了一些物资。',eff:{s:20+Math.floor(n/10),a:3},cb:()=>{G.exploreCount++},next:'d'+(n+5-n%5)},
      {t:'（3）黎明者营地',next:'camp'}
    ]
  };
}
scenes.d35=makeDay(35,15);
scenes.d40=makeDay(40,15);
scenes.d45=makeDay(45,15);

// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:`（不消耗物资。仅防空洞触发。）\n\n你种的菌类已经长成，收割获得物资+40。\n\n你打算去不远处的军事基地探索。露娜也同你前往。\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\n\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\n\n"跑！"\n\n露娜速度没有你快，被拉在后面。`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};


// ----- WINTER -----
scenes.d50={day:'惊变五十天',text:`冬天来了！消耗20物资。\n庇护所温度急剧下降。`,choices:[
{t:'（1）烧物资取暖',rt:'你烧掉一些物资取暖。',eff:{s:-30},next:'d55',cb:()=>{G.heating=false}},
{t:'（2）找取暖设备',rt:'你在废弃商店找到了便携取暖装置！',eff:{s:10,a:2},next:'d55',cb:()=>{G.heating=true}},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d55={day:'惊变五十五天',text:`消耗20物资。`,choices:[
{t:'（1）苟在家里',rt:'度过了寒冷的一天。',eff:{h:5,s:-20},next:'d60'},
{t:'（2）外出探索',rt:'在雪地找到一些物资。',eff:{s:20,a:3},cb:()=>{G.exploreCount++},next:'d60'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d60={day:'惊变六十天',text:`消耗20物资。\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[
{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},
{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},
{t:'（3）黎明者营地',next:'camp'}
]};
scenes.d65=makeDay(65,20);
scenes.d70=makeDay(70,20);
scenes.d75={
day:'惊变七十五天', text:`消耗20物资。\n你在庇护所外发现一个熟悉的身影——上一世背叛你的人！`,
choices:[
{t:'（1）冲上去复仇！',rt:'你满腔怒火制服了他。',eff:{h:-10,a:-3},next:'d80',w:{n:'复仇者',d:'尼奥制裁了背叛者',s:150}},
{t:'（2）冷静问他来意',rt:'他非常虚弱。你给了些食物打发他走。',eff:{h:10,s:-10},next:'d80'},
{t:'（3）无视他',rt:'你选择不去面对过去。',eff:{h:5},next:'d80'}
]};

// ----- DAY 80-100 -----
scenes.d80={
day:'惊变八十天', text:`消耗20物资。${hasW('穿越者')?'你记得今天会有掠夺者。':'你感觉心神不宁。'}${hasP('伊芙琳')?'伊芙琳握紧武器。':''}`,
choices:[
{t:'（1）做好防御准备',rt:'你布置了陷阱。掠夺者来袭！你们成功击退。',eff:{a:-5,s:30,h:10},next:'d85'},
{t:'（2）主动出击',rt:'你主动清理威胁。',eff:{a:-8,s:25,h:5},next:'d85'},
{t:'（3）躲起来',rt:'掠夺者没找到你，但你感到憋屈。',eff:{h:-5},next:'d85'}
]};
scenes.d85={
day:'惊变八十五天', text:`消耗20物资。${hasP('伊芙琳')?'你与伊芙琳的感情在末日中升温。':'你独自一人挣扎求生。'}`,
choices:[
{t:'（1）继续努力生存',rt:'你调整状态继续前行。',next:'d90'},
{t:'（2）外出探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d90={
day:'惊变九十天', text:hasP('伊芙琳')?'晚上伊芙琳找到你："喂尼奥，我们的关系应该进一步了。"':'你独自度过平静的几天。',
choices:hasP('伊芙琳')?[
{t:'（1）同意',rt:'"伊芙琳，我也喜欢你。"伊芙琳亲吻了你的脸颊。',eff:{h:20},next:'d100',w:{n:'恋人',d:'尼奥与伊芙琳成为恋人',s:300},cb:()=>{G.lover=true}},
{t:'（2）委婉拒绝',rt:'"现在不是时候。"伊芙琳点头但眼神黯淡。',eff:{h:-5},next:'d100'}
]:[
{t:'（1）继续前行',rt:'你调整好状态。',next:'d100'},
{t:'（2）冒险探索',next:'exp_discover',sp:true,exp:true}
]};
scenes.d100={
day:'惊变100天', text:G.lover?`尼奥外出回来，发现大门敞开！\n丧尸站在房间，伊芙琳恐惧地看向你。\n丧尸缓缓转身——它的面容和你一模一样！\n"你是……我？"\n"因果……循环……"`:`一只丧尸走向庇护所大门——它知道密码。\n\n它吃力地说："因……果……"\n然后冲过来袭击了你。你倒了下去……`,
choices:[{t:'（1）接受命运',rt:'一切走向终点。',next:'finale'}]
};
scenes.finale={
text:G.lover?`获得大结局词条：《真正的救世主》\n\n你明白了——那只丧尸是未来的你。因果循环。但这一次有了伊芙琳的爱，你们改写了命运。`:`获得大结局词条：《尼奥之死》\n\n惊变100天。冥冥之中，一切都是注定的。`,
choices:[{t:'▶ 查看结局评分',next:'ending_show'}]
};

// Special endings
scenes.ending_starvation={
text:`获得词条：《尽头》\n\n【尼奥终究没能坚持到最后，死在了这里】\n物资耗尽，你无法继续生存。`,
w:{n:'尽头',d:'尼奥没能坚持到最后',s:-300},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};
scenes.ending_death={
text:`你倒在了末世之中……\n\n获得大结局词条：《尼奥之死》`,
w:{n:'尼奥之死',d:'惊变100天，尼奥走向了死亡',s:1.2},
choices:[{t:'▶ 查看结局',next:'ending_show'}]
};

// ====== EXPLORATION EVENTS ======
scenes.exp1={
day:'第五大道', text:`你发现一个受伤昏迷的司机，面包车上有"黎明者营地"物资。`,
choices:[
{t:'（1）救助他',rt:'你带他回庇护所救治，但他没挺住。你将他安葬，留下了物资。',eff:{s:30,h:10},next:'exp1a'},
{t:'（2）扔下车，带物资走',rt:'你冷酷地将重伤司机扔下车。',eff:{s:30,h:-10},next:'exp1b'}
]};
scenes.exp1a={
day:'第五大道', text:`你发现这些"物资"其实是……人肉。\n你决定：`,
choices:[
{t:'（1）留下"物资"',rt:'你放进冷库。人性与道德一起被封存。',eff:{h:-30},next:'__ret',w:{n:'底线',d:'尼奥抛弃了一切标准',s:-300}},
{t:'（2）安葬"物资"',rt:'你埋葬了它们，立下墓碑。保住了底线。',eff:{s:-30,h:15},next:'__ret',w:{n:'人性的墓碑',d:'尼奥为牺牲者立下无名墓碑',s:200}}
]};
scenes.exp1b={
day:'第五大道', text:`"黎明者营地队长！发现你拿了我们的物资！"\n\n面对来势汹汹的几人：`,
choices:[
{t:'（1）"我要说不呢！"（消耗5弹药）',rt:'你歼灭了他们，但被黎明者营地拉入黑名单。',eff:{a:-5,h:5},next:'__ret'},
{t:'（2）"我这就去拿。"',rt:'你交出物资。他们撤退，但你暴露了位置。',eff:{s:-30,h:-5},next:'__ret'}
]};
scenes.exp2={
day:'罐头加工厂', text:`一个衣衫褴褛的男人正在翻找物资。`,
choices:[
{t:'（1）友好合作',rt:'你们一起搜索，找到大量罐头。',eff:{s:30,h:10},next:'__ret'},
{t:'（2）用枪赶走他',rt:'男人逃走，你独自搜刮。',eff:{s:25,a:-1,h:-10},next:'__ret'},
{t:'（3）转身离开',rt:'你不接触陌生人。',eff:{s:5},next:'__ret'}
]};
scenes.exp3={
day:'幼儿园', text:`尸潮分两路冲向医院和幼儿园。医生在做手术，园长护着五个孩子。\n你有一颗声波手雷：`,
choices:[
{t:'（1）医院（救孩子）',rt:'"孩子才是未来！"你引开尸潮，带园长和孩子撤离。',eff:{a:-1,s:20,h:15},next:'__ret',w:{n:'善良的人',d:'尼奥拯救了无辜的孩子',s:200}},
{t:'（2）幼儿园（救医生）',rt:'医生得救了，但孩子们……你为不能救所有人而难过。',eff:{a:-1,s:30,h:10},next:'__ret'},
{t:'（3）引向自己',rt:'你朝相反方向引爆。濒死——消耗物资复活。',eff:{a:-1,s:-30,h:20},next:'__ret',w:{n:'救世主',d:'尼奥牺牲自己拯救他人',s:400},d:true}
]};
scenes.exp4={
day:'超市', text:`超市物资丰富但丧尸众多。突然一群丧尸围了过来！`,
choices:[
{t:'（1）躲进帐篷',rt:'你们的背部紧贴，心跳加速。声音逐渐远去。',eff:{s:hasP('伊芙琳')?30:20},next:'exp4a'},
{t:'（2）合作突围（消耗3弹药）',rt:'你们背靠背射击杀了出去。',eff:{a:-3,s:40,h:10},next:'__ret'},
{t:'（3）冒险引开（消耗5弹药）',rt:'你制造声响引开丧尸。',eff:{a:-5},next:'exp4c'}
]};
scenes.exp4a={
day:'超市', text:hasP('伊芙琳')?'伊芙琳的背部紧贴着你的胸膛。危机解除后她向你表示感谢。':'你们在狭小空间里等待。',
choices:[
{t:'（1）"安全了，快离开。"',rt:hasP('伊芙琳')?'伊芙琳眼里的光芒稍微黯淡。你们整理物资回去。':'你们离开了。',eff:{s:30},next:'__ret'},
{t:'（2）"下次出门小心点。"',rt:hasP('伊芙琳')?'"你怕了吗？"伊芙琳从不示弱。':'你们安全返回。',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp4c={
day:'超市', text:hasP('伊芙琳')?'伊芙琳眉头紧锁地走来："谁让你自作主张当英雄的！"':'你在约定地点等待。',
choices:[
{t:'（1）"因为你对我很重要！"',rt:hasP('伊芙琳')?'伊芙琳揪着你衣领的手缓缓松开。她拍了拍你肩膀。':'你们一起返回。',eff:{s:40,h:20},next:'__ret',w:{n:'搭档',d:'尼奥和伊芙琳是最佳搭档',s:150}},
{t:'（2）"这是合理的战术选择。"',rt:hasP('伊芙琳')?'伊芙琳眼里变成失望。':'你们默默返回。',eff:{s:20},next:'__ret',w:{n:'战略失误',d:'尼奥忘记了伊芙琳的心',s:-50}},
{t:'（3）"对不起，让你担心了。"',rt:'她叹了口气："下次别这么做。"',eff:{s:40,h:10},next:'__ret'}
]};
scenes.exp5={
day:'废弃医院', text:`药房里有抗生素。二楼传来声响。`,
choices:[
{t:'（1）小心搜索药房',rt:'你找到一批抗生素和绷带。',eff:{s:15,h:5},next:'__ret'},
{t:'（2）上楼查看',rt:'发现一个受伤幸存者。治疗后他告诉你一个秘密物资点。',eff:{s:25,h:15},next:'__ret'},
{t:'（3）放火烧掉医院',rt:'你清理潜在威胁，但内心不安。',eff:{a:-3,h:-10},next:'__ret'}
]};
scenes.exp6={
day:'废弃学校', text:`操场上有几只被铁链拴住的丧尸——有人用它们警戒。`,
choices:[
{t:'（1）潜入教学楼',rt:'你在教室找到罐头和教材（可作燃料）。',eff:{s:20},next:'__ret'},
{t:'（2）调查丧尸',rt:'丧尸被改造过，有编号。附近可能有实验室。',eff:{h:5},next:'__ret'},
{t:'（3）快速搜刮',rt:'你拿了些东西就走。',eff:{s:12,a:2},next:'__ret'}
]};
scenes.exp7={
day:'营地废墟', text:`一个被摧毁的营地，散落大量物资。可能有伏击。`,
choices:[
{t:'（1）冒险搜索',rt:'找到好东西！但突然有狙击手开枪——你狼狈逃窜。',eff:{s:35,a:8,h:-5},next:'__ret'},
{t:'（2）谨慎观察',rt:'确认安全后才搜索。找到一些物资。',eff:{s:20,a:3},next:'__ret'},
{t:'（3）放弃离开',rt:'你感觉太危险，转身离开。',next:'__ret'}
]};

// 农户家
scenes.exp_farm={
day:'农户家', text:`你在一个农户家发现了一对老夫妻。他们老旧冰箱里存放着为数不多的食物。

老妇人颤抖着跪下："求求你，这是我们最后的东西，拿走它们，我们只能等死……"

老头紧紧搂着她："我们……可以和你分享晚餐，只求能留下我们的命。"`,
choices:[
{t:'（1）拿走全部食物',rt:'你冷血地拿走了所有食物，不顾老人的哀求。',eff:{s:25,h:-20},next:'__ret',w:{n:'自私的胆小鬼',d:'尼奥夺走了老人最后的食物',s:-100}},
{t:'（2）留下够他们吃的',rt:'你只拿走了一部分，留下了足够老人维生的食物。',eff:{s:15,h:15},next:'__ret'},
{t:'（3）转身离开,不动他们的食物',rt:'你选择了善良。什么都没有拿就走了。',eff:{h:20},next:'__ret',w:{n:'善良的人',d:'尼奥保护了无助的老人',s:200}}
]};
// 商业街（婴儿）
scenes.exp_street={
day:'商业街', text:`你刚出门就在门口看到了一个破旧的襁褓。里面是一个看起来刚满月的婴儿。襁褓中塞着一张纸条：\"我知道你可能不会救他，但外面太危险了，求求你，给他一条生路。\"

看着眼前的婴儿，你决定：`,
choices:[
{t:'（1）收养他',rt:'你无法眼睁睁看着一个无辜生命消逝。你迅速将婴儿抱回屋内，小心翼翼喂养他。',eff:{h:20},next:'exp_street_a',p:'婴儿',w:{n:'婴儿',d:'尼奥守护了人类文明的火种',s:450}},
{t:'（2）不收养',rt:'末世第一法则就是生存。不过你还是将孩子放在相对安全的地方，至于他能否活下来交给命运。',eff:{h:-10},next:'exp_street_a'}
]};
scenes.exp_street_a={
day:'商业街', text:`你知道有两处地方可能有物资。你的选择是：`,
choices:[
{t:'（1）快餐店（消耗5弹药）',rt:'发现了大量土豆！土豆在末世可是宝贵的财富！',eff:{s:20,a:-5},next:'__ret'},
{t:'（2）KTV',rt:'KTV地上有尸体，看来刚经历恶战。不过你搜到了一把手枪和五发弹药。',eff:{a:5},next:'__ret'}
]};
// 医院
scenes.exp_hospital={
day:'医院', text:`你在药局找到了一些抗生素。正要离开时，发现丧尸群向你的方向走来。你急忙躲到医生办公室，发现这里还有一个抱着婴儿的女人。

女人怀中的婴儿啼哭不止，门外的丧尸越来越多。你决定：`,
choices:[
{t:'（1）开枪清路冲出去（消耗5弹药）',rt:'你开枪清理了道路，带着女人和孩子冲了出去。',eff:{a:-5,s:15,h:15},next:'__ret'},
{t:'（2）从后窗悄悄逃走',rt:'你独自翻窗逃走。女人和孩子……你不敢想他们的命运。',eff:{h:-15},next:'__ret'},
{t:'（3）制造噪音引开丧尸',rt:'你故意制造声响将丧尸引开，为女人和孩子争取了逃生时间。',eff:{a:-2,h:20},next:'__ret',w:{n:'善良的人',d:'尼奥牺牲自己保护了陌生母子',s:200}}
]};
// 教堂
scenes.exp_church={
day:'教堂', text:`在教堂中发现了奄奄一息的神父。你决定……`,
choices:[
{t:'（1）帮助神父',rt:'你用仅剩的药物救助神父。神父感激地为你祈祷，并告诉你教堂地下有一批物资。',eff:{s:-10,h:20},next:'__ret'},
{t:'（2）搜刮教堂',rt:'你翻遍了教堂，找到了一些捐款箱里的零钱和食物。神父默默看着你，叹了口气。',eff:{s:15,h:-15},next:'__ret'}
]};
// 希望酒吧
scenes.exp_bar={
day:'希望酒吧', text:`你发现一个名为"希望"的酒吧。酒吧内有一个女人，这是她的庇护所。

她说她叫瑟琳娜，她在等她的丈夫。她祈求你不要拿走太多物资。`,
choices:[
{t:'（1）拿走一部分物资',rt:'你只拿走了一部分。"末世不易，你保重。"',eff:{s:20,h:5},next:'__ret'},
{t:'（2）邀请加入你的庇护所',rt:'瑟琳娜摇了摇头："谢谢，但我不能走，不然我的丈夫就找不到我了。"',eff:{h:10},next:'__ret'},
{t:'（3）拿走全部物资',rt:'你无视她的祈求，拿走了所有物资。',eff:{s:35,h:-20},next:'__ret'}
]};
// 便利店
scenes.exp_shop={
day:'便利店', text:`你听到便利店门口传来激烈的搏斗声。一个幸存者被丧尸包围了。他的弹药似乎已经耗尽，行李包塞得异常地满。`,
choices:[
{t:'（1）开枪救他（消耗3弹药）',rt:'你击毙丧尸救下了他。他感激涕零，将包里的物资分给了你。',eff:{a:-3,s:25,h:15},next:'__ret'},
{t:'（2）开车送他回庇护所',rt:'你开车送他回去。他感激地将物资分给了你。',eff:{s:20,h:10},next:'__ret'},
{t:'（3）等他被干掉后捡物资',rt:'你躲在暗处，等他被丧尸解决后捡走了他的行李。',eff:{s:35,h:-25},next:'__ret',w:{n:'自私的胆小鬼',d:'尼奥见死不救，夺走了死者的物资',s:-100}}
]};
// 旅店（需伊芙琳）
scenes.exp_inn={
day:'旅店', text:`伊芙琳发现了一个上锁的房间，门上写着物资。她听到里面传来微弱的呼救声。

你透过缝隙看到三名被铁链锁住的人。"砰！"一声枪响打断了你的思考。

旅店店主正拿着枪站在你的身后，他脸上挂着扭曲的笑容。`,
choices:[
{t:'（1）和店主枪战（消耗5弹药）',rt:'一场激烈的枪战！你和伊芙琳完美的配合成功制服了他。三人得救。你们在仓库发现了很多弹药！',eff:{a:-5,s:10,a2:10,h:20},next:'__ret'},
{t:'（2）假意答应店主，然后黑吃黑',rt:'你答应了店主，但在背后开枪结果了他。伊芙琳看到后震惊了。伊芙琳因此与你分道扬镳。',eff:{s:50,h:-30},next:'__ret',rp:['伊芙琳'],w:{n:'自私的胆小鬼',d:'尼奥黑吃黑失去了伊芙琳',s:-200}},
{t:'（3）假装离开',rt:'你拉着伊芙琳离开，但店主开枪射中了你。濒死——消耗30物资跳过本天。',eff:{s:-30},next:'__ret',d:true}
]};
// 图书馆（需伊芙琳）
scenes.exp_lib={
day:'图书馆', text:`你们被一个绝望的母亲拦住。

"求求你们！救救我的女儿！那些东西把她困在里面了！"

她颤抖着掏出一个弹药袋子："一共十五发，只要你们能带她回来，全都给你们！"

你看了一眼伊芙琳决定……`,
choices:[
{t:'（1）接受委托救人',rt:'你们冲进图书馆，发现女孩已被感染。你结束了她的痛苦，伊芙琳沉默地赞同。你将发卡交给母亲。',eff:{a:-5,s:15,h:10},next:'__ret'},
{t:'（2）骗走弹药离开',rt:'你假装接受委托，骗走了弹药后开车离开。伊芙琳不同意你的做法，离开了你。',eff:{a:5,h:-30},next:'__ret',rp:['伊芙琳'],w:{n:'自私的胆小鬼',d:'尼奥欺骗了绝望的母亲，失去了伊芙琳',s:-200}},
{t:'（3）拒绝',rt:'你婉拒了母亲的请求。伊芙琳沉默不语。',eff:{h:-10},next:'__ret'}
]};

scenes.exp_discover={
day:'外出探索', text:`去哪里探索？`,
choices:[
{t:'第五大道',next:'exp1',eventId:'exp1',cond:()=>!G.usedEvents['exp1'],eh:()=>G.usedEvents['exp1']?'(已探索)':''},
{t:'罐头加工厂',next:'exp2',eventId:'exp2',cond:()=>!G.usedEvents['exp2'],eh:()=>G.usedEvents['exp2']?'(已探索)':''},
{t:'农户家',next:'exp_farm',eventId:'exp_farm',cond:()=>!G.usedEvents['exp_farm'],eh:()=>G.usedEvents['exp_farm']?'(已探索)':''},
{t:'商业街',next:'exp_street',eventId:'exp_street',cond:()=>!G.usedEvents['exp_street'],eh:()=>G.usedEvents['exp_street']?'(已探索)':''},
{t:'幼儿园',next:'exp3',eventId:'exp3',cond:()=>!G.usedEvents['exp3'],eh:()=>G.usedEvents['exp3']?'(已探索)':''},
{t:'医院',next:'exp_hospital',eventId:'exp_hospital',cond:()=>!G.usedEvents['exp_hospital'],eh:()=>G.usedEvents['exp_hospital']?'(已探索)':''},
{t:'教堂',next:'exp_church',eventId:'exp_church',cond:()=>!G.usedEvents['exp_church'],eh:()=>G.usedEvents['exp_church']?'(已探索)':''},
{t:'希望酒吧',next:'exp_bar',eventId:'exp_bar',cond:()=>!G.usedEvents['exp_bar'],eh:()=>G.usedEvents['exp_bar']?'(已探索)':''},
{t:'便利店',next:'exp_shop',eventId:'exp_shop',cond:()=>!G.usedEvents['exp_shop'],eh:()=>G.usedEvents['exp_shop']?'(已探索)':''},
{t:'旅店(需伊芙琳)',next:'exp_inn',eventId:'exp_inn',cond:()=>hasP('伊芙琳')&&!G.usedEvents['exp_inn'],eh:()=>G.usedEvents['exp_inn']?'(已探索)':(!hasP('伊芙琳')?'(需伊芙琳)':'')},
{t:'图书馆(需伊芙琳)',next:'exp_lib',eventId:'exp_lib',cond:()=>hasP('伊芙琳')&&!G.usedEvents['exp_lib'],eh:()=>G.usedEvents['exp_lib']?'(已探索)':(!hasP('伊芙琳')?'(需伊芙琳)':'')},
{t:'返回庇护所',next:'__ret'}
]};

// ====== START ======
go('prologue');
