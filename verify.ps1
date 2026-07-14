# 四渡赤水关卡验证器 - 简化版

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

$dirs = @(@{name='up';dx=0;dy=-1},@{name='down';dx=0;dy=1},@{name='left';dx=-1;dy=0},@{name='right';dx=1;dy=0})

function IsBlocked($x, $y, $lvl) {
    if ($x -lt 0 -or $x -ge $lvl.gridSize -or $y -lt 0 -or $y -ge $lvl.gridSize) { return $true }
    foreach ($r in $lvl.river) { if ($r.x -eq $x -and $r.y -eq $y) { return $true } }
    foreach ($m in $lvl.mountains) { if ($m.x -eq $x -and $m.y -eq $y) { return $true } }
    return $false
}

function MoveEnemies($px, $py, $enemies, $lvl) {
    $result = @()
    foreach ($e in $enemies) {
        $dx = $px - $e.x; $dy = $py - $e.y
        $nx = $e.x; $ny = $e.y
        if ([Math]::Abs($dx) -gt [Math]::Abs($dy)) {
            $tx = $e.x + [Math]::Sign($dx)
            if (-not (IsBlocked $tx $e.y $lvl)) { $nx = $tx }
            elseif ($dy -ne 0) { $ty = $e.y + [Math]::Sign($dy); if (-not (IsBlocked $e.x $ty $lvl)) { $ny = $ty } }
        } elseif ($dy -ne 0) {
            $ty = $e.y + [Math]::Sign($dy)
            if (-not (IsBlocked $e.x $ty $lvl)) { $ny = $ty }
            elseif ($dx -ne 0) { $tx = $e.x + [Math]::Sign($dx); if (-not (IsBlocked $tx $e.y $lvl)) { $nx = $tx } }
        }
        $result += ,@($nx, $ny)
    }
    return ,$result
}

function StateKey($px, $py, $enemies) {
    $key = "$px,$py"
    foreach ($e in $enemies) { $key += "|$($e[0]),$($e[1])" }
    return $key
}

function Solve($lvl) {
    $sx = $lvl.playerStart.x; $sy = $lvl.playerStart.y
    $gx = $lvl.goal.x; $gy = $lvl.goal.y
    $se = @(); foreach ($e in $lvl.enemies) { $se += ,@($e.x, $e.y) }
    
    if ($sx -eq $gx -and $sy -eq $gy) { return @{ok=$true;steps=0;path=''} }
    
    $visited = @{}; $visited[(StateKey $sx $sy $se)] = $true
    $queue = [System.Collections.Queue]::new()
    $queue.Enqueue(@($sx, $sy, $se, ''))
    $iter = 0
    
    while ($queue.Count -gt 0 -and $iter -lt 500000) {
        $iter++; $cur = $queue.Dequeue()
        $px = $cur[0]; $py = $cur[1]; $enemies = $cur[2]; $path = $cur[3]
        
        foreach ($d in $dirs) {
            $nx = $px + $d.dx; $ny = $py + $d.dy
            if (IsBlocked $nx $ny $lvl) { continue }
            if ($nx -eq $gx -and $ny -eq $gy) { return @{ok=$true;steps=$path.Length+1;path=$path+$d.name} }
            
            $ne = MoveEnemies $nx $ny $enemies $lvl
            $coll = $false
            foreach ($e in $ne) { if ($e[0] -eq $nx -and $e[1] -eq $ny) { $coll = $true; break } }
            if ($coll) { continue }
            
            $key = StateKey $nx $ny $ne
            if (-not $visited.ContainsKey($key)) {
                $visited[$key] = $true
                $queue.Enqueue(@($nx, $ny, $ne, $path + $d.name))
            }
        }
    }
    return @{ok=$false;steps=-1;path='NO_PATH'}
}

Write-Host "=== 四渡赤水关卡验证 ===" -ForegroundColor Yellow
foreach ($lvl in $levels) {
    Write-Host "`n--- 第$($lvl.id)关 ---" -ForegroundColor Cyan
    Write-Host "起点:($($lvl.playerStart.x),$($lvl.playerStart.y)) 终点:($($lvl.goal.x),$($lvl.goal.y))"
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Solve $lvl
    $sw.Stop()
    
    if ($res.ok) {
        Write-Host "结果: SUCCESS" -ForegroundColor Green
        Write-Host "步数: $($res.steps)" -ForegroundColor Green
        Write-Host "路径: $($res.path)" -ForegroundColor Yellow
    } else {
        Write-Host "结果: FAIL" -ForegroundColor Red
    }
    Write-Host "耗时: $($sw.ElapsedMilliseconds)ms"
}
