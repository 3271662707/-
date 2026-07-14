# -*- coding: utf-8 -*-
"""
四渡赤水游戏关卡验证器
使用 BFS 算法验证 4 个关卡的可通关性
"""

from collections import deque
import time

LEVELS = [
    {
        'id': 1,
        'gridSize': 9,
        'playerStart': {'x': 7, 'y': 4},
        'goal': {'x': 1, 'y': 4},
        'enemies': [{'x': 6, 'y': 2}, {'x': 6, 'y': 6}, {'x': 8, 'y': 3}],
        'river': [{'x':4,'y':0},{'x':4,'y':1},{'x':4,'y':2},{'x':4,'y':3},
                  {'x':4,'y':5},{'x':4,'y':6},{'x':4,'y':7},{'x':4,'y':8}],
        'mountains': [{'x':3,'y':3},{'x':3,'y':5},{'x':5,'y':2},{'x':5,'y':6}]
    },
    {
        'id': 2,
        'gridSize': 9,
        'playerStart': {'x': 1, 'y': 4},
        'goal': {'x': 7, 'y': 4},
        'enemies': [{'x': 2, 'y': 2}, {'x': 2, 'y': 6}, {'x': 0, 'y': 3}],
        'river': [{'x':4,'y':0},{'x':4,'y':1},{'x':4,'y':2},{'x':4,'y':3},
                  {'x':4,'y':5},{'x':4,'y':6},{'x':4,'y':7},{'x':4,'y':8}],
        'mountains': [{'x':5,'y':3},{'x':5,'y':5},{'x':3,'y':2},{'x':3,'y':6}]
    },
    {
        'id': 3,
        'gridSize': 9,
        'playerStart': {'x': 7, 'y': 2},
        'goal': {'x': 1, 'y': 6},
        'enemies': [{'x': 6, 'y': 1}, {'x': 6, 'y': 5}, {'x': 8, 'y': 3}],
        'river': [{'x':3,'y':0},{'x':3,'y':1},{'x':3,'y':2},{'x':3,'y':3},{'x':3,'y':4},{'x':3,'y':5},
                  {'x':3,'y':7},{'x':3,'y':8}],
        'mountains': [{'x':2,'y':3},{'x':2,'y':5},{'x':4,'y':1},{'x':4,'y':7}]
    },
    {
        'id': 4,
        'gridSize': 9,
        'playerStart': {'x': 4, 'y': 1},
        'goal': {'x': 4, 'y': 7},
        'enemies': [{'x': 1, 'y': 0}, {'x': 7, 'y': 0}, {'x': 4, 'y': 0}],
        'river': [{'x':0,'y':4},{'x':1,'y':4},{'x':2,'y':4},{'x':3,'y':4},
                  {'x':5,'y':4},{'x':6,'y':4},{'x':7,'y':4},{'x':8,'y':4}],
        'mountains': [{'x':3,'y':3},{'x':5,'y':3},{'x':3,'y':5},{'x':5,'y':5}]
    }
]

DIRS = {
    '上': (0, -1),
    '下': (0, 1),
    '左': (-1, 0),
    '右': (1, 0)
}

def is_blocked(x, y, level):
    """检查位置是否被阻挡"""
    if x < 0 or x >= level['gridSize'] or y < 0 or y >= level['gridSize']:
        return True
    for r in level['river']:
        if r['x'] == x and r['y'] == y:
            return True
    for m in level['mountains']:
        if m['x'] == x and m['y'] == y:
            return True
    return False

def move_enemies(player_pos, enemies, level):
    """移动敌军向玩家追击"""
    new_enemies = []
    for enemy in enemies:
        dx = player_pos['x'] - enemy['x']
        dy = player_pos['y'] - enemy['y']
        nx, ny = enemy['x'], enemy['y']

        if abs(dx) > abs(dy):
            try_x = enemy['x'] + (1 if dx > 0 else -1)
            if not is_blocked(try_x, enemy['y'], level):
                nx = try_x
            elif dy != 0:
                try_y = enemy['y'] + (1 if dy > 0 else -1)
                if not is_blocked(enemy['x'], try_y, level):
                    ny = try_y
        elif dy != 0:
            try_y = enemy['y'] + (1 if dy > 0 else -1)
            if not is_blocked(enemy['x'], try_y, level):
                ny = try_y
            elif dx != 0:
                try_x = enemy['x'] + (1 if dx > 0 else -1)
                if not is_blocked(try_x, enemy['y'], level):
                    nx = try_x

        new_enemies.append({'x': nx, 'y': ny})
    return new_enemies

def state_key(px, py, enemies):
    """生成状态键用于去重"""
    return f"{px},{py}|" + "|".join(f"{e['x']},{e['y']}" for e in enemies)

def solve_level(level):
    """使用 BFS 求解关卡"""
    start_x = level['playerStart']['x']
    start_y = level['playerStart']['y']
    goal_x = level['goal']['x']
    goal_y = level['goal']['y']
    start_enemies = [{'x': e['x'], 'y': e['y']} for e in level['enemies']]

    # 检查是否已在终点
    if start_x == goal_x and start_y == goal_y:
        return {'success': True, 'steps': 0, 'path': ''}

    visited = set([state_key(start_x, start_y, start_enemies)])
    queue = deque([(start_x, start_y, start_enemies, '')])
    iterations = 0

    while queue:
        iterations += 1
        if iterations > 1000000:
            return {'success': False, 'steps': -1, 'path': '超时', 'states': len(visited)}

        px, py, enemies, path = queue.popleft()

        for dir_name, (dx, dy) in DIRS.items():
            npx = px + dx
            npy = py + dy

            if is_blocked(npx, npy, level):
                continue

            # 先检查是否到达终点（在敌军移动之前）
            if npx == goal_x and npy == goal_y:
                return {'success': True, 'steps': len(path) + 1, 'path': path + dir_name}

            # 移动敌军
            new_enemies = move_enemies({'x': npx, 'y': npy}, enemies, level)

            # 检查碰撞
            collision = False
            for e in new_enemies:
                if e['x'] == npx and e['y'] == npy:
                    collision = True
                    break
            if collision:
                continue

            key = state_key(npx, npy, new_enemies)
            if key not in visited:
                visited.add(key)
                queue.append((npx, npy, new_enemies, path + dir_name))

    return {'success': False, 'steps': -1, 'path': '无解', 'states': len(visited)}

def main():
    print("=" * 60)
    print("四渡赤水 · 关卡可通关性验证")
    print("=" * 60)
    print()

    for level in LEVELS:
        print(f"--- 第{level['id']}关 ---")
        print(f"起点: ({level['playerStart']['x']}, {level['playerStart']['y']})")
        print(f"终点: ({level['goal']['x']}, {level['goal']['y']})")
        print(f"敌军: {', '.join(f\"({e['x']},{e['y']})\" for e in level['enemies'])}")
        print(f"河流: {len(level['river'])}格 | 山脉: {len(level['mountains'])}格")

        start_time = time.time()
        result = solve_level(level)
        elapsed = (time.time() - start_time) * 1000

        if result['success']:
            print(f"结果: ✅ 可通关")
            print(f"最少步数: {result['steps']}步")
            print(f"最短路径: {result['path']}")
        else:
            print(f"结果: ❌ 无法通关")
            print(f"原因: {result['path']}")
            if 'states' in result:
                print(f"已探索状态数: {result['states']}")

        print(f"耗时: {elapsed:.1f}ms")
        print()

if __name__ == '__main__':
    main()
