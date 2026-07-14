# 四渡赤水游戏关卡验证器
# 使用 BFS 算法验证 4 个关卡的可通关性

# 定义关卡数据
$levels = @(
    @{
        id = 1
        gridSize = 9
        playerStart = @{x=7; y=4}
        goal = @{x=1; y=4}
        enemies = @(@{x=6;y=2}, @{x=6;y=6}, @{x=8;y=3})
        river = @(@{x=4;y=0},@{x=4;y=1},@{x=4;y=2},@{x=4;y=3},@{x=4;y=5},@{x=4;y=6},@{x=4;y=7},@{x=4;y=8})
        mountains = @(@{x=3;y=3},@{x=3;y=5},@{x=5;y=2},@{x=5;y=6})
    },
    @{
        id = 2
        gridSize = 9
        playerStart = @{x=1; y=4}
        goal = @{x=7; y=4}
        enemies = @(@{x=2;y=2}, @{x=2;y=6}, @{x=0;y=3})
        river = @(@{x=4;y=0},@{x=4;y=1},@{x=4;y=2},@{x=4;y=3},@{x=4;y=5},@{x=4;y=6},@{x=4;y=7},@{x=4;y=8})
        mountains = @(@{x=5;y=3},@{x=5;y=5},@{x=3;y=2},@{x=3;y=6})
    },
    @{
        id = 3
        gridSize = 9
        playerStart = @{x=7; y=2}
        goal = @{x=1; y=6}
        enemies = @(@{x=6;y=1}, @{x=6;y=5}, @{x=8;y=3})
        river = @(@{x=3;y=0},@{x=3;y=1},@{x=3;y=2},@{x=3;y=3},@{x=3;y=4},@{x=3;y=5},@{x=3;y=7},@{x=3;y=8})
        mountains = @(@{x=2;y=3},@{x=2;y=5},@{x=4;y=1},@{x=4;y=7})
    },
    @{
        id = 4
        gridSize = 9
        playerStart = @{x=4; y=1}
        goal = @{x=4; y=7}
        enemies = @(@{x=1;y=0}, @{x=7;y=0}, @{x=4;y=0})
        river = @(@{x=0;y=4},@{x=1;y=4},@{x=2;y=4},@{x=3;y=4},@{x=5;y=4},@{x=6;y=4},@{x=7;y=4},@{x=8;y=4})
        mountains = @(@{x=3;y=3},@{x=5;y=3},@{x=3;y=5},@{x=5;y=5})
    }
)

# 方向定义
$directions = @{
    'up' = @{dx=0; dy=-1}
    'down' = @{dx=0; dy=1}
    'left' = @{dx=-1; dy=0}
    'right' = @{dx=1; dy=0}
}

# 检查位置是否被阻挡
function Test-Blocked {
    param($x, $y, $level)
    
    if ($x -lt 0 -or $x -ge $level.gridSize -or $y -lt 0 -or $y -ge $level.gridSize) {
        return $true
    }
    
    foreach ($r in $level.river) {
        if ($r.x -eq $x -and $r.y -eq $y) {
            return $true
        }
    }
    
    foreach ($m in $level.mountains) {
        if ($m.x -eq $x -and $m.y -eq $y) {
            return $true
        }
    }
    
    return $false
}

# 移动敌军
function Move-Enemies {
    param($playerPos, $enemies, $level)
    
    $newEnemies = @()
    foreach ($enemy in $enemies) {
        $dx = $playerPos.x - $enemy.x
        $dy = $playerPos.y - $enemy.y
        $newX = $enemy.x
        $newY = $enemy.y
        
        if ([Math]::Abs($dx) -gt [Math]::Abs($dy)) {
            # 优先追击 X 方向
            $tryX = $enemy.x + [Math]::Sign($dx)
            if (-not (Test-Blocked $tryX $enemy.y $level)) {
                $newX = $tryX
            } elseif ($dy -ne 0) {
                # X 方向被阻挡，尝试 Y 方向
                $tryY = $enemy.y + [Math]::Sign($dy)
                if (-not (Test-Blocked $enemy.x $tryY $level)) {
                    $newY = $tryY
                }
            }
        } elseif ($dy -ne 0) {
            # 优先追击 Y 方向
            $tryY = $enemy.y + [Math]::Sign($dy)
            if (-not (Test-Blocked $enemy.x $tryY $level)) {
                $newY = $tryY
            } elseif ($dx -ne 0) {
                # Y 方向被阻挡，尝试 X 方向
                $tryX = $enemy.x + [Math]::Sign($dx)
                if (-not (Test-Blocked $tryX $enemy.y $level)) {
                    $newX = $tryX
                }
            }
        }
        
        $newEnemies += ,@{x=$newX; y=$newY}
    }
    
    return ,$newEnemies
}

# 生成状态键
function Get-StateKey {
    param($px, $py, $enemies)
    
    $key = "$px,$py|"
    foreach ($e in $enemies) {
        $key += "$($e.x),$($e.y)|"
    }
    return $key
}

# BFS 求解关卡
function Solve-Level {
    param($level)
    
    $startX = $level.playerStart.x
    $startY = $level.playerStart.y
    $goalX = $level.goal.x
    $goalY = $level.goal.y
    $startEnemies = $level.enemies
    
    # 检查是否已在终点
    if ($startX -eq $goalX -and $startY -eq $goalY) {
        return @{success=$true; steps=0; path=''}
    }
    
    # BFS 队列
    $queue = [System.Collections.Queue]::new()
    $queue.Enqueue(@{
        x = $startX
        y = $startY
        enemies = $startEnemies
        path = ''
    })
    
    # 已访问状态集合
    $visited = @{}
    $startKey = Get-StateKey $startX $startY $startEnemies
    $visited[$startKey] = $true
    
    $iterations = 0
    $maxIterations = 1000000
    
    while ($queue.Count -gt 0 -and $iterations -lt $maxIterations) {
        $iterations++
        $current = $queue.Dequeue()
        
        # 尝试 4 个方向
        foreach ($dirName in $directions.Keys) {
            $dir = $directions[$dirName]
            $newX = $current.x + $dir.dx
            $newY = $current.y + $dir.dy
            
            # 检查是否被阻挡
            if (Test-Blocked $newX $newY $level) {
                continue
            }
            
            # 检查是否到达终点（在敌军移动之前检查）
            if ($newX -eq $goalX -and $newY -eq $goalY) {
                return @{success=$true; steps=$current.path.Length + 1; path=$current.path + $dirName}
            }
            
            # 移动敌军
            $newPlayerPos = @{x=$newX; y=$newY}
            $newEnemies = Move-Enemies $newPlayerPos $current.enemies $level
            
            # 检查碰撞
            $collision = $false
            foreach ($enemy in $newEnemies) {
                if ($enemy.x -eq $newX -and $enemy.y -eq $newY) {
                    $collision = $true
                    break
                }
            }
            
            if ($collision) {
                continue
            }
            
            # 生成状态键
            $stateKey = Get-StateKey $newX $newY $newEnemies
            
            # 检查是否已访问
            if (-not $visited.ContainsKey($stateKey)) {
                $visited[$stateKey] = $true
                $queue.Enqueue(@{
                    x = $newX
                    y = $newY
                    enemies = $newEnemies
                    path = $current.path + $dirName
                })
            }
        }
    }
    
    return @{success=$false; steps=-1; path='无解'}
}

# 主程序
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "四渡赤水 · 关卡可通关性验证" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($level in $levels) {
    Write-Host "--- 第 $($level.id) 关 ---" -ForegroundColor Yellow
    Write-Host "起点: ($($level.playerStart.x), $($level.playerStart.y))"
    Write-Host "终点: ($($level.goal.x), $($level.goal.y))"
    Write-Host "敌军位置: " -NoNewline
    foreach ($e in $level.enemies) {
        Write-Host "($($e.x),$($e.y)) " -NoNewline
    }
    Write-Host ""
    Write-Host "河流: $($level.river.Count) 格 | 山脉: $($level.mountains.Count) 格"
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $result = Solve-Level $level
    $stopwatch.Stop()
    
    if ($result.success) {
        Write-Host "结果: 可通关 (SUCCESS)" -ForegroundColor Green
        Write-Host "最少步数: $($result.steps) 步"
        Write-Host "最短路径: $($result.path)" -ForegroundColor Cyan
    } else {
        Write-Host "结果: 无法通关 (FAIL)" -ForegroundColor Red
        Write-Host "原因: $($result.path)"
    }
    
    Write-Host "耗时: $($stopwatch.ElapsedMilliseconds) ms"
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "验证完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
