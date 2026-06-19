# -*- coding: utf-8 -*-
f=open("C:\\Users\\Administrator\\Documents\\Codex\\2026-06-19\\files-mentioned-by-the-user-docx\\惊变100天.html","r",encoding="utf-8")
c=f.read()
f.close()

# Fix d38 syntax: h:15,,-20 -> h:-20
c=c.replace("h:15,,-20}","h:-20}")

# Upgrade d60 with John
old="scenes.d60={day:'惊变六十天',text:`消耗20物资。\\n你发现一个废弃科研营地，有丧尸病毒研究报告。`,choices:[{t:'（1）研究报告',rt:'你了解了丧尸的弱点。',eff:{h:5,s:-20},next:'d65'},{t:'（2）搜刮物资',rt:'你找到了一批物资和药品。',eff:{s:30,a:5},next:'d65'},{t:'（3）黎明者营地',next:'camp'}]};"
new="scenes.d60={day:'惊变六十天',text:`消耗20物资。\\n\\n你发现一个废弃的科研营地。一个穿白大褂的男人正在翻找资料——他自称约翰博士，正在研究丧尸病毒血清。\\n\\n\"你是……幸存者？我需要帮助！\"`,choices:[{t:'（1）帮助约翰博士',rt:'你帮约翰搜集研究资料。他感激地告诉你，有需要可以找他。',eff:{h:15,s:-15},next:'d65',cb:()=>{G.john=1;addP('约翰博士')}},{t:'（2）搜刮物资不管他',rt:'你拿走了物资，留下约翰博士。',eff:{s:30,a:5},next:'d65'},{t:'（3）邀请回庇护所',rt:'约翰带着研究资料跟你回了庇护所。',eff:{h:10,s:-10},next:'d65',cb:()=>{G.john=1;addP('约翰博士')}},{t:'（4）黎明者营地',next:'camp'}]};"
if old in c:
    c=c.replace(old,new)
    print("John OK")
else:
    print("John FAIL - checking d60")
    idx=c.find("scenes.d60=")
    if idx>0:
        end=c.find("]};",idx)+3
        print("Found at",idx,":",c[idx:end])

with open("C:\\Users\\Administrator\\Documents\\Codex\\2026-06-19\\files-mentioned-by-the-user-docx\\惊变100天.html","w",encoding="utf-8") as f:
    f.write(c)
print("Done! Braces:", c.count("{"), c.count("}"))
print("John in file:", "约翰博士" in c)
