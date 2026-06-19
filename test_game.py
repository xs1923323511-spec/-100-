import re
path = 'C:\\Users\\Administrator\\Documents\\Codex\\2026-06-19\\files-mentioned-by-the-user-docx\\惊变100天.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

scene_names = re.findall(r"scenes\.(\w+)\s*=\s*\{", content)
print(f'定义场景数: {len(scene_names)}')

next_refs = re.findall(r"next:\s*['\"]([^'\"]+)['\"]", content)
print(f'next引用数: {len(next_refs)}')

scene_set = set(scene_names)
missing = []
for ref in next_refs:
    if ref not in scene_set and '+' not in ref:
        missing.append(ref)
if missing:
    print(f'缺失的场景引用 ({len(missing)}):')
    for m in missing[:20]:
        print(f'  - {m}')
else:
    print('所有场景引用都有效!')

print('\n主要游戏流程:')
flow = ['prologue','intro_choice','pre_outbreak_1','pre_outbreak_2','pre_outbreak_3',
        'day_1','day_2','day_3','day_4','day_5','day_10','day_15','day_20',
        'day_25','day_30','day_35','day_38','day_40','day_45','day_50',
        'day_55','day_60','day_65','day_70','day_75','day_80',
        'day_85_path1','day_90','day_100_ending','finale_main','ending_calc','ending_show',
        'exploration_1','exploration_1a','exploration_1b','exploration_2','exploration_3',
        'exploration_4','exploration_4a','exploration_4c','dawn_camp_menu','dawn_camp_gamble','dawn_camp_result',
        'ending_starvation','ending_death']
for s in flow:
    if s in scene_set:
        print(f'  OK {s}')
    else:
        print(f'  MISSING {s}!')
