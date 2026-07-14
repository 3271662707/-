# 四渡赤水关卡验证
$levels = @(
    @{id=1;gx=9;sx=7;sy=4;ex=1;ey=4;e=@(@(6,2),@(6,6),@(8,3));r=@(@(4,0),@(4,1),@(4,2),@(4,3),@(4,5),@(4,6),@(4,7),@(4,8));m=@(@(3,3),@(3,5),@(5,2),@(5,6))},
    @{id=2;gx=9;sx=1;sy=4;ex=7;ey=4;e=@(@(2,2),@(2,6),@(0,3));r=@(@(4,0),@(4,1),@(4,2),@(4,3),@(4,5),@(4,6),@(4,7),@(4,8));m=@(@(5,3),@(5,5),@(3,2),@(3,6))},
    @{id=3;gx=9;sx=7;sy=2;ex=1;ey=6;e=@(@(6,1),@(6,5),@(8,3));r=@(@(3,0),@(3,1),@(3,2),@(3,3),@(3,4),@(3,5),@(3,7),@(3,8));m=@(@(2,3),@(2,5),@(4,1),@(4,7))},
    @{id=4;gx=9;sx=4;sy=1;ex=4;ey=7;e=@(@(1,0),@(7,0),@(4,0));r=@(@(0,4),@(1,4),@(2,4),@(3,4),@(5,4),@(6,4),@(7,4),@(8,4));m=@(@(3,3),@(5,3),@(3,5),@(5,5))}
)

$d=@(@(0,-1,'up'),@(0,1,'down'),@(-1,0,'left'),@(1,0,'right'))

function IB($x,$y,$l){
    if($x-lt0-or$x-ge$l.gx-or$y-lt0-or$y-ge$l.gx){return 1}
    foreach($r in$l.r){if($r[0]-eq$x-and$r[1]-eq$y){return 1}}
    foreach($m in$l.m){if($m[0]-eq$x-and$m[1]-eq$y){return 1}}
    return 0
}

function ME($px,$py,$es,$l){
    $r=@()
    foreach($e in$es){
        $dx=$px-$e[0];$dy=$py-$e[1];$nx=$e[0];$ny=$e[1]
        if([Math]::Abs($dx)-gt[Math]::Abs($dy)){
            $tx=$e[0]+[Math]::Sign($dx)
            if(-not(IB$tx$e[1]$l)){$nx=$tx}
            elseif($dy-ne0){$ty=$e[1]+[Math]::Sign($dy);if(-not(IB$e[0]$ty$l)){$ny=$ty}}
        }elseif($dy-ne0){
            $ty=$e[1]+[Math]::Sign($dy)
            if(-not(IB$e[0]$ty$l)){$ny=$ty}
            elseif($dx-ne0){$tx=$e[0]+[Math]::Sign($dx);if(-not(IB$tx$e[1]$l)){$nx=$tx}}
        }
        $r+=,@($nx,$ny)
    }
    return,$r
}

function SK($px,$py,$es){$k="$px,$py";foreach($e in$es){$k+="|$($e[0]),$($e[1])"};return$k}

function S($l){
    if($l.sx-e$l.ex-and$l.sy-e$l.ey){return@{o=1;s=0;p=''}}
    $v=@{};$se=$l.e;$v[(SK$l.sx$l.sy$se)]=1
    $q=[System.Collections.Queue]::new();$q.Enqueue(@($l.sx,$l.sy,$se,''))
    while($q.Count-gt0){
        $c=$q.Dequeue();$px=$c[0];$py=$c[1];$es=$c[2];$p=$c[3]
        foreach($d in$d){
            $nx=$px+$d[0];$ny=$py+$d[1]
            if(IB$nx$ny$l){continue}
            if($nx-e$l.ex-and$ny-e$l.ey){return@{o=1;s=$p.Length+1;p=$p+$d[2]}}
            $ne=ME$nx$ny$es$l;$cl=0
            foreach($e in$ne){if($e[0]-eq$nx-and$e[1]-eq$ny){$cl=1;break}}
            if($cl){continue}
            $k=SK$nx$ny$ne
            if(-not$v.ContainsKey($k)){$v[$k]=1;$q.Enqueue(@($nx,$ny,$ne,$p+$d[2]))}
        }
    }
    return@{o=0;s=-1;p='NO_PATH'}
}

Write-Host'=== 四渡赤水关卡验证 ==='-ForegroundColor Yellow
foreach($l in$levels){
    Write-Host"`n--- 第$($l.id)关 ---"-ForegroundColor Cyan
    Write-Host"起点:($($l.sx),$($l.sy)) 终点:($($l.ex),$($l.ey))"
    $sw=[System.Diagnostics.Stopwatch]::StartNew();$r=S$l;$sw.Stop()
    if($r.o){Write-Host"结果: SUCCESS"-ForegroundColor Green;Write-Host"步数: $($r.s)";Write-Host"路径: $($r.p)"-ForegroundColor Yellow}
    else{Write-Host"结果: FAIL"-ForegroundColor Red}
    Write-Host"耗时: $($sw.ElapsedMilliseconds)ms"
}
