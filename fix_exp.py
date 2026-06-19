# -*- coding: utf-8 -*-
import re

path = r"C:\Users\Administrator\Documents\Codex\2026-06-19\files-mentioned-by-the-user-docx\惊变100天.html"

with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Replace exp_discover entirely - only original locations
i = c.find("scenes.exp_discover={")
j = c.find("]};", i) + 3
old_block = c[i:j]

new_block = """scenes.exp_discover={
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
]};"""

c = c.replace(old_block, new_block)
print("exp_discover replaced:", old_block != new_block)

# 2. Remove fake scenes: exp5, exp6, exp7 (废弃学校, 废弃学校2, 黎明者营地废墟)
for name in ['exp5','exp6','exp7']:
    si = c.find("scenes." + name + "=")
    if si > 0:
        ei = c.find("];", si) + 2
        c = c[:si].rstrip() + c[ei:]
        print("Removed scenes." + name)
    else:
        print(name + " not found (already removed)")

# 3. Remove exp4 (大型超市 - not in original) - keep exp4a and exp4c as they're伊芙琳心动事件 sub-scenes
# Actually, look at what exp4 is. Let me check...
si = c.find("scenes.exp4=")
if si > 0:
# Keep exp4 (伊芙琳超市心动事件 - from original) - just not in exp_discover menu
    print("exp4 kept (伊芙琳心动事件, not in exploration menu)")

# 4. Verify no fake locations remain
fake_names = ["黎明者营地废墟","废弃学校","废弃医院", "大型超市"]
for n in fake_names:
    count = c.count(n)
    if count > 0:
        print(f"WARNING: '{n}' still appears {count}x")

# 5. Check防空洞专属 events
checks = ["luna_event","d38_bunker","G.shelter==='bunker'"]
for ch in checks:
    count = c.count(ch)
    print(f"防空洞专属 '{ch}'': {count}")

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("\nBraces:", c.count("{"), c.count("}"))
print("OK" if c.count("{") == c.count("}") else "FAIL")

# Export _test.js
m = re.search(r"<script>([\s\S]*?)</script>", c)
if m:
    with open(r"C:\Users\Administrator\Documents\Codex\2026-06-19\files-mentioned-by-the-user-docx\_test.js", "w", encoding="utf-8") as f:
        f.write(m.group(1))
print("_test.js updated")
print("DONE!")
