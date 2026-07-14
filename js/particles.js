// 粒子系统模块

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            count: options.count || 1000,
            size: options.size || 0.005,
            color: options.color || 0xFFD700,
            speed: options.speed || 0.02,
            spread: options.spread || 10,
            ...options
        };
        this.particles = [];
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particleSystem = null;
    }

    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // 创建粒子
        this.createParticles();

        // 添加光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFFD700, 1, 100);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);

        // 开始动画
        this.animate();

        // 监听窗口大小变化
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.options.count * 3);
        const velocities = [];

        for (let i = 0; i < this.options.count; i++) {
            const i3 = i * 3;
            
            // 随机位置
            positions[i3] = (Math.random() - 0.5) * this.options.spread;
            positions[i3 + 1] = (Math.random() - 0.5) * this.options.spread;
            positions[i3 + 2] = (Math.random() - 0.5) * this.options.spread;

            // 随机速度
            velocities.push({
                x: (Math.random() - 0.5) * this.options.speed,
                y: (Math.random() - 0.5) * this.options.speed,
                z: (Math.random() - 0.5) * this.options.speed
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: this.options.size,
            color: this.options.color,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);

        // 保存速度数据
        this.velocities = velocities;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 更新粒子位置
        const positions = this.particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < this.options.count; i++) {
            const i3 = i * 3;
            const vel = this.velocities[i];

            positions[i3] += vel.x;
            positions[i3 + 1] += vel.y;
            positions[i3 + 2] += vel.z;

            // 边界检测
            const halfSpread = this.options.spread / 2;
            if (Math.abs(positions[i3]) > halfSpread) vel.x *= -1;
            if (Math.abs(positions[i3 + 1]) > halfSpread) vel.y *= -1;
            if (Math.abs(positions[i3 + 2]) > halfSpread) vel.z *= -1;
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;

        // 旋转粒子系统
        this.particleSystem.rotation.y += 0.001;

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    dispose() {
        if (this.renderer) {
            this.container.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
    }
}

// 创建英雄区域粒子系统
function createHeroParticles() {
    const container = document.getElementById('heroCanvas');
    if (!container) return;

    const particles = new ParticleSystem(container, {
        count: 2000,
        size: 0.008,
        color: 0xFFD700,
        speed: 0.03,
        spread: 15
    });

    particles.init();
    return particles;
}

// 创建精神传承区域粒子系统
function createSpiritParticles() {
    const container = document.getElementById('spiritCanvas');
    if (!container) return;

    const particles = new ParticleSystem(container, {
        count: 1500,
        size: 0.006,
        color: 0xC8102E,
        speed: 0.02,
        spread: 12
    });

    particles.init();
    return particles;
}

// 导出
window.ParticleSystem = ParticleSystem;
window.createHeroParticles = createHeroParticles;
window.createSpiritParticles = createSpiritParticles;
