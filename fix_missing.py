# -*- coding: utf-8 -*-
import re
with open("C:\\Users\\Administrator\\Documents\\Codex\\2026-06-19\\files-mentioned-by-the-user-docx\\惊变100天.html","r",encoding="utf-8") as f:
    c = f.read()

# 1. Day 1 - Add 3rd choice
c = c.replace(
    "{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:5},rt:'你守住了内心的底线。',next:'d2'}",
    "{t:'（2）不要丧失人性，那与动物有什么区别',eff:{h:10},rt:'你守住了内心的底线。',next:'d2'},\n{t:'（3）真相比什么都重要，我要调查原因',rt:'你记得上一世死亡是在末世爆发的一个月整。你决定到时候一定要再去悬崖看看。',eff:{h:5},next:'d2'}"
)
print("Day1 investigation: OK" if "调查原因" in c else "Day1 FAIL")

# 2. Day 4 - Clean zombies for radio
c = c.replace(
    "{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'}",
    "{t:'（2）外出探索物资',rt:'你搜到了一些物资。',eff:{s:15,a:2},next:'d5'},\n{t:'（3）清理附近丧尸（消耗5弹药·仅一次）',rt:'你清理了附近的丧尸，在丧尸身上发现了一个收音机。收音机里正播放着紧急广播……',eff:{a:-5},next:'d5',cb:()=>{G.radio=true},cond:()=>!G.radio}"
)
print("Day4 radio: OK" if "收音机" in c else "Day4 FAIL")

# 3. 露娜 event for bunker - insert before d10
luna = """
// 露娜事件（防空洞专属）
scenes.luna_event={
day:'防空洞的访客', text:\`今天外面正下着冰冷的雨。你正打算出门，金属门外传来了急促的哀求声。\\n\\n你用防空洞的潜望镜看到门外是一对母女。老母亲浑身湿透，脸色惨白。女儿跪在那里哭着向你求救。远处有黑影在朝这里蹒跚而来。\\n\\n你知道开门意味着风险……\`,
choices:[
{t:'（1）开门接纳',rt:'你将母女接入防空洞。露娜的母亲没能挺过去。露娜悲伤过后决定留下，她懂得种植菌类。',eff:{h:20},p:'露娜',cb:()=>{G.luna=1;addW('善良的人','尼奥救助了无助的母女',200)},next:'d10'},
{t:'（2）拒绝开门',rt:'你听着门外的哭喊声渐行渐远。末世中不能轻易相信任何人。',eff:{h:-15},next:'d10'}
]};
"""
c = c.replace("scenes.d10={\nday:'惊变第十天'", luna + "\nscenes.d10={\nday:'惊变第十天'")
print("露娜: OK" if "luna_event" in c else "露娜 FAIL")

# 4. 防空洞第38天 - mushroom harvest + military base
d38 = """
// 惊变三十八天（防空洞专属）
scenes.d38_bunker={
day:'惊变三十八天', text:\`（不消耗物资。仅防空洞触发。）\\n\\n你种的菌类已经长成，收割获得物资+40。\\n\\n你打算去不远处的军事基地探索。露娜也同你前往。\\n你们在仓库里发现了一些子弹，甚至还有一颗手雷。\\n\\n突然，一只身体很小但嘴巴异常巨大的丧尸惊醒，发出了刺耳的尖叫！\\n\\n"跑！"\\n\\n露娜速度没有你快，被拉在后面。\`,
choices:[
{t:'（1）开枪吸引火力保护露娜（消耗20弹药）',rt:'你开枪吸引丧尸，露娜趁机逃脱。你们安全返回。',eff:{a:-20,s:30,h:15,,-20},next:'d40'},
{t:'（2）抱着露娜逃跑（消耗10弹药）',rt:'你抱着露娜狂奔，逃出了基地。',eff:{a:-10,s:25,h:10},next:'d40'},
{t:'（3）不管了',rt:'你独自逃出。露娜被丧尸拖走……你失去了露娜。',eff:{h:-30},rp:['露娜'],next:'d40',w:{n:'自私的胆小鬼',d:'尼奥抛弃了露娜',s:-200}}
]};
"""
c = c.replace("scenes.d50={day:'惊变五十天'", d38 + "\n\n// ----- WINTER -----\nscenes.d50={day:'惊变五十天'")
print("第38天: OK" if "d38_bunker" in c else "第38天 FAIL")

with open("C:\\Users\\Administrator\\Documents\\Codex\\2026-06-19\\files-mentioned-by-the-user-docx\\惊变100天.html","w",encoding="utf-8") as f:
    f.write(c)
print("All saved!")
