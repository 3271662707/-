// 四渡赤水地图 - 使用Leaflet + 高德地图瓦片（免Key方案）

let mapInstance = null;

function initAMap() {
    try {
        const container = document.getElementById('amapContainer');
        if (!container) {
            console.warn('地图容器未找到');
            return;
        }

        // 确保容器有高度
        container.style.height = '100%';
        container.style.width = '100%';

        // 创建地图实例
        mapInstance = L.map('amapContainer', {
            center: [28.15, 106.30],
            zoom: 9,
            zoomControl: true,
            attributionControl: false,
            scrollWheelZoom: true
        });

        // 高德地图卫星影像瓦片（真实地形）
        const satelliteLayer = L.tileLayer(
            'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
            {
                subdomains: ['1', '2', '3', '4'],
                maxZoom: 18,
                minZoom: 3
            }
        );

        // 高德地图标注瓦片（地名叠加层）
        const labelLayer = L.tileLayer(
            'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
            {
                subdomains: ['1', '2', '3', '4'],
                maxZoom: 18,
                minZoom: 3,
                opacity: 0.7
            }
        );

        mapInstance.addLayer(satelliteLayer);
        mapInstance.addLayer(labelLayer);

        // 四渡赤水关键地点
        const locations = [
            { name: '土城', coords: [28.350, 105.983], order: 1, desc: '一渡赤水起点\n1935年1月28日土城战役' },
            { name: '遵义', coords: [27.725, 106.927], order: 2, desc: '遵义会议旧址\n1935年1月15-17日' },
            { name: '茅台渡口', coords: [27.820, 106.420], order: 3, desc: '三渡赤水渡口\n1935年3月16日' },
            { name: '二郎滩', coords: [28.100, 106.150], order: 4, desc: '四渡赤水渡口\n1935年3月21日' },
            { name: '扎西', coords: [28.050, 105.850], order: 5, desc: '扎西会议\n1935年2月' },
            { name: '娄山关', coords: [27.950, 106.850], order: 6, desc: '娄山关大捷\n1935年2月25日' },
            { name: '贵阳', coords: [26.647, 106.630], order: 7, desc: '攻贵阳\n调动滇军' }
        ];

        // 添加标记点
        locations.forEach((loc) => {
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    width: 36px; 
                    height: 36px; 
                    background: radial-gradient(circle, #FF4444 0%, #C8102E 60%, #8B0000 100%);
                    border: 3px solid #FFD700;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 0 12px rgba(255, 215, 0, 0.7), 0 3px 6px rgba(0,0,0,0.4);
                "><span style="transform: rotate(45deg); color: #FFD700; font-weight: bold; font-size: 14px; font-family: SimSun;">${loc.order}</span></div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
                popupAnchor: [0, -36]
            });

            const marker = L.marker(loc.coords, { icon: customIcon });
            marker.bindPopup(`
                <div style="padding: 8px; min-width: 160px; font-family: 'Noto Sans SC', sans-serif;">
                    <h4 style="margin: 0 0 6px 0; color: #C8102E; font-size: 16px; border-bottom: 2px solid #FFD700; padding-bottom: 4px;">${loc.name}</h4>
                    <p style="margin: 0; color: #333; font-size: 13px; line-height: 1.6; white-space: pre-line;">${loc.desc}</p>
                </div>
            `);
            marker.addTo(mapInstance);
        });

        // 行军路线
        const routePaths = [
            { path: [[28.350, 105.983], [28.200, 106.050], [28.050, 106.150], [27.820, 106.420]], name: '一渡赤水', color: '#FFD700' },
            { path: [[27.820, 106.420], [27.780, 106.600], [27.750, 106.750], [27.725, 106.927]], name: '二渡赤水', color: '#FF6B35' },
            { path: [[27.725, 106.927], [27.850, 106.700], [27.950, 106.500], [28.100, 106.150]], name: '三渡赤水', color: '#FFD700' },
            { path: [[28.100, 106.150], [27.950, 106.300], [27.800, 106.500], [27.725, 106.927], [27.500, 107.100]], name: '四渡赤水', color: '#FF6B35' }
        ];

        routePaths.forEach((route) => {
            // 路线阴影
            L.polyline(route.path, {
                color: '#000000',
                weight: 6,
                opacity: 0.3,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(mapInstance);

            // 路线主体
            L.polyline(route.path, {
                color: route.color,
                weight: 4,
                opacity: 0.9,
                dashArray: '12, 8',
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(mapInstance);

            // 路线箭头（终点方向）
            const lastPoint = route.path[route.path.length - 1];
            const arrowIcon = L.divIcon({
                className: 'route-arrow',
                html: `<div style="
                    width: 0; height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 14px solid ${route.color};
                    filter: drop-shadow(0 0 4px rgba(0,0,0,0.5));
                "></div>`,
                iconSize: [16, 14],
                iconAnchor: [8, 7]
            });
            L.marker(lastPoint, { icon: arrowIcon, interactive: false }).addTo(mapInstance);

            // 路线标签
            const midIndex = Math.floor(route.path.length / 2);
            const labelPos = route.path[midIndex];
            const label = L.divIcon({
                className: 'route-label',
                html: `<div style="
                    background: linear-gradient(135deg, rgba(200,16,46,0.92), rgba(139,0,0,0.92));
                    border: 2px solid #FFD700;
                    border-radius: 6px;
                    padding: 4px 10px;
                    color: #FFD700;
                    font-size: 12px;
                    font-weight: bold;
                    white-space: nowrap;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    font-family: 'Noto Sans SC', sans-serif;
                ">${route.name}</div>`,
                iconSize: [80, 28],
                iconAnchor: [40, 14]
            });
            L.marker(labelPos, { icon: label, interactive: false }).addTo(mapInstance);
        });

        // 赤水河标注
        const riverPoints = [
            [28.500, 105.700], [28.350, 105.900], [28.200, 106.100],
            [28.050, 106.300], [27.900, 106.500], [27.750, 106.700]
        ];

        L.polyline(riverPoints, {
            color: '#4A90E2',
            weight: 5,
            opacity: 0.7,
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(mapInstance);

        const riverLabel = L.divIcon({
            className: 'river-label',
            html: `<div style="
                background: rgba(74, 144, 226, 0.85);
                border: 2px solid #fff;
                border-radius: 6px;
                padding: 4px 12px;
                color: #fff;
                font-size: 14px;
                font-weight: bold;
                font-family: 'Noto Sans SC', sans-serif;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">赤水河</div>`,
            iconSize: [60, 28],
            iconAnchor: [30, 14]
        });
        L.marker([28.100, 106.200], { icon: riverLabel, interactive: false }).addTo(mapInstance);

        // 图例
        const legend = L.control({ position: 'topright' });
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div style="
                    background: rgba(30, 30, 30, 0.92);
                    border: 2px solid #FFD700;
                    border-radius: 10px;
                    padding: 14px 16px;
                    color: #F5F5DC;
                    font-size: 12px;
                    min-width: 150px;
                    font-family: 'Noto Sans SC', sans-serif;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                ">
                    <h4 style="margin: 0 0 10px 0; color: #FFD700; font-size: 14px; text-align: center; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 6px;">四渡赤水战役</h4>
                    <div style="margin: 6px 0; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 24px; height: 3px; background: #FFD700; margin-right: 8px; border-radius: 2px;"></span>
                        <span>一、三渡赤水</span>
                    </div>
                    <div style="margin: 6px 0; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 24px; height: 3px; background: #FF6B35; margin-right: 8px; border-radius: 2px;"></span>
                        <span>二、四渡赤水</span>
                    </div>
                    <div style="margin: 6px 0; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 24px; height: 3px; background: #4A90E2; margin-right: 8px; border-radius: 2px;"></span>
                        <span>赤水河</span>
                    </div>
                    <div style="margin: 6px 0; display: flex; align-items: center;">
                        <span style="display: inline-block; width: 14px; height: 14px; background: radial-gradient(circle, #FF4444, #C8102E); border: 2px solid #FFD700; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); margin-right: 10px;"></span>
                        <span>关键地点</span>
                    </div>
                </div>
            `;
            return div;
        };
        legend.addTo(mapInstance);

        console.log('地图初始化成功（Leaflet + 高德卫星瓦片）');
    } catch (error) {
        console.error('地图初始化失败:', error);
        showMapFallback();
    }
}

function showMapFallback() {
    const container = document.getElementById('amapContainer');
    if (container) {
        container.innerHTML = `
            <div style="
                width: 100%; height: 100%;
                background: linear-gradient(135deg, #1a1a1a 0%, #2C2C2C 100%);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                color: #F5F5DC; text-align: center; padding: 20px;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">🗺️</div>
                <h3 style="color: #FFD700; margin-bottom: 15px;">四渡赤水战役地图</h3>
                <p style="margin-bottom: 10px;">地图加载失败，请检查网络连接</p>
            </div>
        `;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initAMap, 800);
    });
} else {
    setTimeout(initAMap, 800);
}

window.initAMap = initAMap;
