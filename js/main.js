// 主逻辑文件

// 全局变量
let heroScene = null;
let zunyiScene = null;
let artifactScenes = [];
let heroParticles = null;
let spiritParticles = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 初始化应用
function initApp() {
    console.log('贵州红色文化数字化展示平台 - 初始化中...');

    // 初始化导航
    initNavigation();
    initAnchorNavigation();
    initKeyboardNavigation();
    createBackToTopButton();

    // 初始化滚动动画
    initScrollAnimations();
    initCardEffects();

    // 初始化3D场景
    initHeroScene();
    initZunyiScene();
    initArtifactScenes();

    // 初始化粒子系统
    initParticleSystems();

    // 初始化SVG动画
    initSVGAnimations();

    console.log('初始化完成');
}

// 初始化英雄场景
function initHeroScene() {
    const container = document.getElementById('heroCanvas');
    if (container && typeof THREE !== 'undefined') {
        try {
            heroScene = new HeroMonumentScene(container);
            heroScene.init();
            console.log('英雄纪念碑场景初始化成功');
        } catch (error) {
            console.error('英雄场景初始化失败:', error);
        }
    }
}

// 初始化遵义会议场景
function initZunyiScene() {
    const container = document.getElementById('zunyiScene');
    if (container && typeof THREE !== 'undefined') {
        // 使用IntersectionObserver延迟加载
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !zunyiScene) {
                    try {
                        zunyiScene = new ZunyiScene(container);
                        zunyiScene.init();
                        console.log('遵义会议场景初始化成功');
                        observer.unobserve(container);
                    } catch (error) {
                        console.error('遵义场景初始化失败:', error);
                    }
                }
            });
        }, { threshold: 0.1 });

        observer.observe(container);
    }
}

// 初始化文物场景
function initArtifactScenes() {
    const artifactConfigs = [
        { id: 'flagCanvas', type: 'flag', color: 0xC8102E },
        { id: 'lampCanvas', type: 'lamp', color: 0xFFD700 },
        { id: 'mapCanvas', type: 'map', color: 0xCD7F32 },
        { id: 'rifleCanvas', type: 'rifle', color: 0x4A4A4A }
    ];

    artifactConfigs.forEach(config => {
        const container = document.getElementById(config.id);
        if (container && typeof THREE !== 'undefined') {
            // 延迟加载
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        try {
                            const scene = new ArtifactScene(container, config.type, config.color);
                            scene.init();
                            artifactScenes.push(scene);
                            console.log(`文物场景 ${config.type} 初始化成功`);
                            observer.unobserve(container);
                        } catch (error) {
                            console.error(`文物场景 ${config.type} 初始化失败:`, error);
                        }
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(container);
        }
    });
}

// 初始化粒子系统
function initParticleSystems() {
    if (typeof THREE !== 'undefined') {
        // 英雄区域粒子
        const heroContainer = document.getElementById('heroCanvas');
        if (heroContainer) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !heroParticles) {
                        try {
                            heroParticles = createHeroParticles();
                            console.log('英雄区域粒子系统初始化成功');
                            heroObserver.unobserve(heroContainer);
                        } catch (error) {
                            console.error('英雄粒子系统初始化失败:', error);
                        }
                    }
                });
            }, { threshold: 0.1 });

            heroObserver.observe(heroContainer);
        }

        // 精神传承区域粒子
        const spiritContainer = document.getElementById('spiritCanvas');
        if (spiritContainer) {
            const spiritObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !spiritParticles) {
                        try {
                            spiritParticles = createSpiritParticles();
                            console.log('精神传承粒子系统初始化成功');
                            spiritObserver.unobserve(spiritContainer);
                        } catch (error) {
                            console.error('精神粒子系统初始化失败:', error);
                        }
                    }
                });
            }, { threshold: 0.1 });

            spiritObserver.observe(spiritContainer);
        }
    }
}

// 初始化SVG动画
function initSVGAnimations() {
    const routePath = document.querySelector('.route-path');
    if (routePath) {
        // 获取路径长度
        const pathLength = routePath.getTotalLength();
        
        // 设置初始状态
        routePath.style.strokeDasharray = pathLength;
        routePath.style.strokeDashoffset = pathLength;

        // 使用IntersectionObserver触发动画
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 动画绘制路径
                    routePath.style.transition = 'stroke-dashoffset 3s ease-in-out';
                    routePath.style.strokeDashoffset = '0';
                    
                    // 添加标记点动画
                    const markers = document.querySelectorAll('.marker');
                    markers.forEach((marker, index) => {
                        setTimeout(() => {
                            marker.style.animation = 'zoomIn 0.5s ease-out forwards';
                        }, index * 500);
                    });

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(routePath);
    }
}

// WebGL支持检测
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!(gl && gl instanceof WebGLRenderingContext);
    } catch (e) {
        return false;
    }
}

// 性能检测
function detectPerformance() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) return 'low';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // 简单的性能判断
        if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
            return 'high';
        } else if (renderer.includes('Intel')) {
            return 'medium';
        }
    }
    
    return 'medium';
}

// 根据性能调整质量
function adjustQualityByPerformance() {
    const performance = detectPerformance();
    
    if (performance === 'low') {
        // 降低粒子数量
        document.querySelectorAll('.particle-system').forEach(el => {
            el.dataset.count = '500';
        });
    } else if (performance === 'high') {
        // 保持高质量
        console.log('高性能设备，启用完整特效');
    }
}

// 页面可见性处理
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面不可见时暂停动画
        console.log('页面不可见，暂停渲染');
    } else {
        // 页面可见时恢复动画
        console.log('页面可见，恢复渲染');
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('发生错误:', e.error);
});

// 资源加载监控
window.addEventListener('load', () => {
    console.log('页面加载完成');
    
    // 检查Three.js是否加载成功
    if (typeof THREE === 'undefined') {
        console.warn('Three.js未加载，3D功能将被禁用');
        showWebGLWarning();
    }
});

// WebGL不支持提示
function showWebGLWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(200, 16, 46, 0.9);
        color: white;
        padding: 20px 30px;
        border-radius: 10px;
        z-index: 3000;
        max-width: 500px;
        text-align: center;
    `;
    warning.innerHTML = `
        <h3 style="margin-bottom: 10px;">浏览器不支持WebGL</h3>
        <p>您的浏览器不支持WebGL，3D效果将无法正常显示。</p>
        <p>建议使用最新版本的Chrome、Firefox或Edge浏览器。</p>
    `;
    document.body.appendChild(warning);

    setTimeout(() => {
        warning.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => warning.remove(), 500);
    }, 5000);
}

// 预加载关键资源
function preloadCriticalResources() {
    // 预加载数据文件
    const dataFiles = [
        'data/history.json',
        'data/figures.json',
        'data/artifacts.json'
    ];

    dataFiles.forEach(file => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = file;
        document.head.appendChild(link);
    });
}

// 初始化预加载
preloadCriticalResources();

// 导出全局函数
window.initApp = initApp;
window.checkWebGLSupport = checkWebGLSupport;
window.detectPerformance = detectPerformance;
