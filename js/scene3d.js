// 3D场景管理模块

// 英雄纪念碑3D场景
class HeroMonumentScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.monument = null;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    init() {
        // 场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

        // 相机
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 14);
        this.camera.lookAt(0, 2.5, 0);

        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // 光照
        this.setupLights();

        // 创建纪念碑
        this.createMonument();

        // 创建地面
        this.createGround();

        // 创建星星粒子
        this.createStars();

        // 鼠标交互
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // 窗口大小变化
        window.addEventListener('resize', () => this.onResize());

        // 开始动画
        this.animate();
    }

    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // 主方向光（模拟月光）
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add(dirLight);

        // 金色点光源
        const pointLight1 = new THREE.PointLight(0xFFD700, 1.5, 20);
        pointLight1.position.set(0, 5, 0);
        this.scene.add(pointLight1);

        // 红色点光源
        const pointLight2 = new THREE.PointLight(0xC8102E, 1, 15);
        pointLight2.position.set(-3, 2, 3);
        this.scene.add(pointLight2);

        // 底部暖光
        const bottomLight = new THREE.PointLight(0xFFD700, 0.5, 10);
        bottomLight.position.set(0, -1, 0);
        this.scene.add(bottomLight);
    }

    createMonument() {
        this.monument = new THREE.Group();

        // 基座
        const baseGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4A4A4A,
            specular: 0x222222,
            shininess: 30
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        base.receiveShadow = true;
        this.monument.add(base);

        // 第二层基座
        const base2Geometry = new THREE.CylinderGeometry(1.5, 2, 0.3, 8);
        const base2 = new THREE.Mesh(base2Geometry, baseMaterial);
        base2.position.y = 0.65;
        base2.castShadow = true;
        this.monument.add(base2);

        // 碑身 - 主体
        const bodyGeometry = new THREE.BoxGeometry(1, 4, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xC8102E,
            specular: 0xFFD700,
            shininess: 50,
            emissive: 0x330000
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 2.8;
        body.castShadow = true;
        this.monument.add(body);

        // 碑顶 - 五角星
        const starShape = new THREE.Shape();
        const outerRadius = 0.6;
        const innerRadius = 0.25;
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) starShape.moveTo(x, y);
            else starShape.lineTo(x, y);
        }
        starShape.closePath();

        const extrudeSettings = { depth: 0.2, bevelEnabled: false };
        const starGeometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
        const starMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5,
            specular: 0xffffff,
            shininess: 100
        });
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.y = 5.2;
        star.position.z = -0.1;
        star.castShadow = true;
        this.monument.add(star);

        // 装饰环
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.05, 8, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 1;
        ring.rotation.x = Math.PI / 2;
        this.monument.add(ring);

        this.scene.add(this.monument);
    }

    createGround() {
        const groundGeometry = new THREE.CircleGeometry(15, 64);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            specular: 0x111111,
            shininess: 10
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 20 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.cos(phi) + 10;
            positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 相机跟随鼠标
        this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouseY * 1 + 2 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 1.5, 0);

        // 纪念碑轻微旋转
        if (this.monument) {
            this.monument.rotation.y += 0.002;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

// 遵义会议场景
class ZunyiScene {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a1a);

        this.camera = new THREE.PerspectiveCamera(
            50,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 1, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // 光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const warmLight = new THREE.PointLight(0xFFD700, 1.5, 15);
        warmLight.position.set(0, 4, 0);
        warmLight.castShadow = true;
        this.scene.add(warmLight);

        // 创建建筑
        this.createBuilding();

        // 创建桌子
        this.createTable();

        // 创建马灯
        this.createLamp();

        window.addEventListener('resize', () => this.onResize());
        this.animate();
    }

    createBuilding() {
        // 墙壁
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,
            specular: 0x222222,
            shininess: 10
        });

        // 后墙
        const backWall = new THREE.Mesh(
            new THREE.BoxGeometry(8, 4, 0.3),
            wallMaterial
        );
        backWall.position.set(0, 2, -3);
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // 左墙
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 4, 6),
            wallMaterial
        );
        leftWall.position.set(-4, 2, 0);
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        // 右墙
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 4, 6),
            wallMaterial
        );
        rightWall.position.set(4, 2, 0);
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);

        // 地板
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(8, 0.2, 6),
            new THREE.MeshPhongMaterial({ color: 0x654321 })
        );
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createTable() {
        const tableMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x654321,
            specular: 0x333333,
            shininess: 20
        });

        // 桌面
        const tableTop = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.1, 1.5),
            tableMaterial
        );
        tableTop.position.set(0, 1, 0);
        tableTop.castShadow = true;
        this.scene.add(tableTop);

        // 桌腿
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
        const positions = [
            [-1.3, 0.5, -0.6],
            [1.3, 0.5, -0.6],
            [-1.3, 0.5, 0.6],
            [1.3, 0.5, 0.6]
        ];
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, tableMaterial);
            leg.position.set(...pos);
            leg.castShadow = true;
            this.scene.add(leg);
        });

        // 椅子
        const chairMaterial = new THREE.MeshPhongMaterial({ color: 0x4A3728 });
        for (let i = 0; i < 5; i++) {
            const chair = new THREE.Group();
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.05, 0.4),
                chairMaterial
            );
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.5, 0.05),
                chairMaterial
            );
            back.position.set(0, 0.25, -0.175);
            chair.add(seat);
            chair.add(back);
            
            const angle = (i / 5) * Math.PI - Math.PI / 2;
            chair.position.set(
                Math.cos(angle) * 2,
                0.5,
                Math.sin(angle) * 1.2
            );
            chair.lookAt(0, 0.5, 0);
            this.scene.add(chair);
        }
    }

    createLamp() {
        // 马灯
        const lampGroup = new THREE.Group();
        
        // 灯座
        const lampBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.12, 0.05, 16),
            new THREE.MeshPhongMaterial({ color: 0xCD7F32 })
        );
        lampGroup.add(lampBase);

        // 灯身
        const lampBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.2, 16),
            new THREE.MeshPhongMaterial({ 
                color: 0xFFD700,
                transparent: true,
                opacity: 0.6,
                emissive: 0xFFD700,
                emissiveIntensity: 0.5
            })
        );
        lampBody.position.y = 0.125;
        lampGroup.add(lampBody);

        // 灯顶
        const lampTop = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.08, 16),
            new THREE.MeshPhongMaterial({ color: 0xCD7F32 })
        );
        lampTop.position.y = 0.265;
        lampGroup.add(lampTop);

        // 灯光
        const lampLight = new THREE.PointLight(0xFFD700, 1, 5);
        lampLight.position.y = 0.15;
        lampGroup.add(lampLight);

        lampGroup.position.set(0, 1.1, 0);
        this.scene.add(lampGroup);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

// 文物3D展示
class ArtifactScene {
    constructor(container, artifactType, color) {
        this.container = container;
        this.artifactType = artifactType;
        this.color = color || 0xC8102E;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.artifact = null;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
    }

    init() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            50,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            100
        );
        this.camera.position.set(0, 0, 4);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // 光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(3, 5, 3);
        this.scene.add(dirLight);

        const pointLight = new THREE.PointLight(this.color, 0.5, 10);
        pointLight.position.set(-2, 2, 2);
        this.scene.add(pointLight);

        // 创建文物模型
        this.createArtifact();

        // 鼠标交互
        this.setupInteraction();

        window.addEventListener('resize', () => this.onResize());
        this.animate();
    }

    createArtifact() {
        this.artifact = new THREE.Group();
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            specular: 0x333333,
            shininess: 30
        });

        switch (this.artifactType) {
            case 'flag':
                // 精致旗杆
                const poleMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x8B4513,
                    specular: 0x4A2511,
                    shininess: 40
                });
                
                // 旗杆主体
                const pole = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.04, 3.2, 16),
                    poleMaterial
                );
                pole.position.x = -1.2;
                this.artifact.add(pole);
                
                // 旗杆顶部装饰球
                const poleTop = new THREE.Mesh(
                    new THREE.SphereGeometry(0.08, 16, 16),
                    new THREE.MeshPhongMaterial({ 
                        color: 0xFFD700,
                        specular: 0xFFFFFF,
                        shininess: 100,
                        emissive: 0xFFD700,
                        emissiveIntensity: 0.2
                    })
                );
                poleTop.position.set(-1.2, 1.65, 0);
                this.artifact.add(poleTop);
                
                // 旗杆底座
                const poleBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.1, 0.15, 16),
                    poleMaterial
                );
                poleBase.position.set(-1.2, -1.55, 0);
                this.artifact.add(poleBase);

                // 旗帜主体（带波浪效果 + 真实红军战旗图片）
                const flagGeometry = new THREE.PlaneGeometry(2.2, 1.4, 20, 15);
                const positions = flagGeometry.attributes.position.array;
                
                // 添加波浪效果
                for (let i = 0; i < positions.length; i += 3) {
                    const x = positions[i];
                    const y = positions[i + 1];
                    positions[i + 2] = Math.sin(x * 2) * 0.1 + Math.cos(y * 1.5) * 0.05;
                }
                flagGeometry.computeVertexNormals();
                
                // 用Canvas绘制红一方面军旗帜纹理（1930年式样：红底、中央白五星内嵌黑镰锤、上方标语、右侧白布条番号）
                const flagCanvas = document.createElement('canvas');
                flagCanvas.width = 512;
                flagCanvas.height = 340;
                const fctx = flagCanvas.getContext('2d');

                // 红色旗面
                fctx.fillStyle = '#C8102E';
                fctx.fillRect(0, 0, 512, 340);

                // 旗面做旧质感
                for (let i = 0; i < 3000; i++) {
                    const px = Math.random() * 512;
                    const py = Math.random() * 340;
                    fctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
                    fctx.fillRect(px, py, 1 + Math.random(), 1);
                }

                // 中央白色大五角星
                function drawStar5(cx, cy, outerR, innerR, color) {
                    fctx.fillStyle = color;
                    fctx.beginPath();
                    for (let i = 0; i < 10; i++) {
                        const r = i % 2 === 0 ? outerR : innerR;
                        const angle = (i * Math.PI) / 5 - Math.PI / 2;
                        const x = cx + r * Math.cos(angle);
                        const y = cy + r * Math.sin(angle);
                        if (i === 0) fctx.moveTo(x, y);
                        else fctx.lineTo(x, y);
                    }
                    fctx.closePath();
                    fctx.fill();
                }
                drawStar5(240, 180, 70, 28, '#FFFFFF');

                // 星内黑色镰刀锤子
                fctx.fillStyle = '#1a1a1a';
                fctx.strokeStyle = '#1a1a1a';
                fctx.lineWidth = 6;
                fctx.lineCap = 'round';

                // 锤子
                fctx.save();
                fctx.translate(240, 180);
                fctx.rotate(-Math.PI / 4);
                fctx.fillRect(-3, -8, 6, 45);
                fctx.fillRect(-14, -18, 28, 12);
                fctx.restore();

                // 镰刀
                fctx.save();
                fctx.translate(240, 180);
                fctx.rotate(Math.PI / 4);
                fctx.beginPath();
                fctx.arc(0, 0, 22, -Math.PI * 0.75, Math.PI * 0.25);
                fctx.lineWidth = 6;
                fctx.stroke();
                fctx.fillRect(-3, 14, 6, 22);
                fctx.restore();

                // 左侧白布条番号
                fctx.fillStyle = '#F0F0F0';
                fctx.fillRect(0, 0, 62, 340);
                fctx.fillStyle = '#1a1a1a';
                fctx.font = 'bold 18px SimSun, serif';
                fctx.textAlign = 'center';
                fctx.save();
                fctx.translate(31, 170);
                fctx.rotate(Math.PI / 2);
                fctx.fillText('中国工农红军第一方面军', 0, 0);
                fctx.restore();

                // 旗面边缘磨损
                fctx.strokeStyle = 'rgba(80,0,0,0.25)';
                fctx.lineWidth = 2;
                fctx.strokeRect(1, 1, 510, 338);

                const flagTexture = new THREE.CanvasTexture(flagCanvas);
                flagTexture.needsUpdate = true;
                
                const flagMaterial = new THREE.MeshPhongMaterial({ 
                    map: flagTexture,
                    side: THREE.DoubleSide,
                    emissive: 0x330000,
                    emissiveIntensity: 0.1,
                    specular: 0x440000,
                    shininess: 10
                });
                
                const flag = new THREE.Mesh(flagGeometry, flagMaterial);
                flag.position.set(0, 0.8, 0);
                this.artifact.add(flag);
                break;

            case 'lamp':
                // 精致马灯
                const bronzeMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0xCD7F32,
                    specular: 0xFFD700,
                    shininess: 60
                });
                
                // 底座（更复杂）
                const lampBase = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.35, 0.38, 0.08, 24),
                    bronzeMaterial
                );
                this.artifact.add(lampBase);
                
                // 底座装饰环
                const baseRing = new THREE.Mesh(
                    new THREE.TorusGeometry(0.36, 0.02, 8, 24),
                    bronzeMaterial
                );
                baseRing.position.y = 0.04;
                baseRing.rotation.x = Math.PI / 2;
                this.artifact.add(baseRing);
                
                // 灯柱
                const lampPillar = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.06, 0.15, 16),
                    bronzeMaterial
                );
                lampPillar.position.y = 0.115;
                this.artifact.add(lampPillar);

                // 灯罩主体（玻璃效果）
                const lampBody = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.28, 0.32, 0.7, 24),
                    new THREE.MeshPhongMaterial({ 
                        color: 0xFFF8DC,
                        transparent: true,
                        opacity: 0.4,
                        emissive: 0xFFD700,
                        emissiveIntensity: 0.4,
                        specular: 0xFFFFFF,
                        shininess: 100
                    })
                );
                lampBody.position.y = 0.54;
                this.artifact.add(lampBody);
                
                // 灯罩内部火焰
                const flame = new THREE.Mesh(
                    new THREE.ConeGeometry(0.08, 0.2, 12),
                    new THREE.MeshPhongMaterial({ 
                        color: 0xFF6600,
                        emissive: 0xFF6600,
                        emissiveIntensity: 0.8,
                        transparent: true,
                        opacity: 0.7
                    })
                );
                flame.position.y = 0.5;
                this.artifact.add(flame);
                
                // 火焰光晕
                const flameGlow = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 16, 16),
                    new THREE.MeshPhongMaterial({ 
                        color: 0xFFAA00,
                        emissive: 0xFFAA00,
                        emissiveIntensity: 0.5,
                        transparent: true,
                        opacity: 0.3
                    })
                );
                flameGlow.position.y = 0.5;
                this.artifact.add(flameGlow);

                // 灯罩顶部
                const lampTop = new THREE.Mesh(
                    new THREE.ConeGeometry(0.32, 0.25, 24),
                    bronzeMaterial
                );
                lampTop.position.y = 1.015;
                this.artifact.add(lampTop);
                
                // 顶部装饰
                const topDecor = new THREE.Mesh(
                    new THREE.SphereGeometry(0.06, 16, 16),
                    bronzeMaterial
                );
                topDecor.position.y = 1.17;
                this.artifact.add(topDecor);
                
                // 提手
                const handleCurve = new THREE.CatmullRomCurve3([
                    new THREE.Vector3(-0.25, 1.1, 0),
                    new THREE.Vector3(-0.2, 1.35, 0),
                    new THREE.Vector3(0, 1.45, 0),
                    new THREE.Vector3(0.2, 1.35, 0),
                    new THREE.Vector3(0.25, 1.1, 0)
                ]);
                const handleGeometry = new THREE.TubeGeometry(handleCurve, 20, 0.02, 8, false);
                const handle = new THREE.Mesh(handleGeometry, bronzeMaterial);
                this.artifact.add(handle);
                
                // 灯罩框架
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const frame = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8),
                        bronzeMaterial
                    );
                    frame.position.set(
                        Math.cos(angle) * 0.3,
                        0.54,
                        Math.sin(angle) * 0.3
                    );
                    this.artifact.add(frame);
                }
                break;

            case 'map':
                // 军事地图（真实四渡赤水地图纹理）
                const mapCanvas = document.createElement('canvas');
                mapCanvas.width = 1024;
                mapCanvas.height = 768;
                const mctx = mapCanvas.getContext('2d');

                // 泛黄纸张底色
                mctx.fillStyle = '#E8D5A3';
                mctx.fillRect(0, 0, 1024, 768);

                // 纸张做旧质感
                for (let i = 0; i < 5000; i++) {
                    const px = Math.random() * 1024;
                    const py = Math.random() * 768;
                    mctx.fillStyle = `rgba(120,100,60,${Math.random() * 0.08})`;
                    mctx.fillRect(px, py, 1 + Math.random() * 2, 1);
                }

                // 等高线（模拟地形）
                mctx.strokeStyle = 'rgba(139,115,85,0.3)';
                mctx.lineWidth = 1;
                for (let r = 50; r < 400; r += 30) {
                    mctx.beginPath();
                    mctx.ellipse(300, 350, r * 1.2, r * 0.8, 0.3, 0, Math.PI * 2);
                    mctx.stroke();
                }
                for (let r = 40; r < 300; r += 25) {
                    mctx.beginPath();
                    mctx.ellipse(700, 400, r * 0.9, r * 1.1, -0.2, 0, Math.PI * 2);
                    mctx.stroke();
                }

                // 赤水河（蓝色曲线）
                mctx.strokeStyle = '#4A90E2';
                mctx.lineWidth = 4;
                mctx.beginPath();
                mctx.moveTo(200, 100);
                mctx.bezierCurveTo(350, 200, 300, 400, 450, 500);
                mctx.bezierCurveTo(550, 580, 500, 650, 600, 720);
                mctx.stroke();

                // 乌江
                mctx.strokeStyle = '#3A7BD5';
                mctx.lineWidth = 3;
                mctx.beginPath();
                mctx.moveTo(500, 50);
                mctx.bezierCurveTo(520, 200, 600, 350, 650, 500);
                mctx.bezierCurveTo(700, 600, 750, 650, 800, 750);
                mctx.stroke();

                // 山脉标注
                mctx.fillStyle = 'rgba(80,100,60,0.5)';
                mctx.font = 'bold 16px SimSun';
                mctx.textAlign = 'center';
                mctx.fillText('大娄山', 300, 350);
                mctx.fillText('娄山关', 320, 380);

                // 城镇标注
                const towns = [
                    { x: 280, y: 480, name: '遵义' },
                    { x: 180, y: 200, name: '土城' },
                    { x: 420, y: 520, name: '贵阳' },
                    { x: 150, y: 350, name: '古蔺' },
                    { x: 350, y: 150, name: '扎西' },
                    { x: 300, y: 530, name: '茅台' },
                    { x: 550, y: 600, name: '乌江' }
                ];

                towns.forEach(t => {
                    mctx.fillStyle = '#C8102E';
                    mctx.beginPath();
                    mctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
                    mctx.fill();
                    mctx.fillStyle = '#1a1a1a';
                    mctx.font = 'bold 14px SimSun';
                    mctx.textAlign = 'center';
                    mctx.fillText(t.name, t.x, t.y - 12);
                });

                // 四渡赤水行军路线（红色虚线箭头）
                mctx.strokeStyle = '#C8102E';
                mctx.lineWidth = 3;
                mctx.setLineDash([8, 5]);

                // 一渡：土城→古蔺
                mctx.beginPath();
                mctx.moveTo(180, 200);
                mctx.lineTo(150, 350);
                mctx.stroke();

                // 二渡：古蔺→遵义
                mctx.beginPath();
                mctx.moveTo(150, 350);
                mctx.bezierCurveTo(200, 400, 250, 450, 280, 480);
                mctx.stroke();

                // 三渡：遵义→茅台
                mctx.beginPath();
                mctx.moveTo(280, 480);
                mctx.lineTo(300, 530);
                mctx.stroke();

                // 四渡：茅台→乌江→贵阳方向
                mctx.beginPath();
                mctx.moveTo(300, 530);
                mctx.bezierCurveTo(400, 560, 450, 580, 420, 520);
                mctx.stroke();

                mctx.setLineDash([]);

                // 路线标注
                mctx.fillStyle = '#C8102E';
                mctx.font = 'bold 12px SimSun';
                mctx.fillText('一渡', 155, 270);
                mctx.fillText('二渡', 210, 420);
                mctx.fillText('三渡', 280, 510);
                mctx.fillText('四渡', 370, 560);

                // 图例
                mctx.fillStyle = 'rgba(0,0,0,0.05)';
                mctx.fillRect(750, 50, 250, 200);
                mctx.strokeStyle = 'rgba(0,0,0,0.2)';
                mctx.strokeRect(750, 50, 250, 200);
                mctx.fillStyle = '#1a1a1a';
                mctx.font = 'bold 14px SimSun';
                mctx.textAlign = 'left';
                mctx.fillText('图例', 770, 75);
                mctx.fillStyle = '#C8102E';
                mctx.beginPath();
                mctx.arc(770, 100, 5, 0, Math.PI * 2);
                mctx.fill();
                mctx.fillStyle = '#1a1a1a';
                mctx.font = '12px SimSun';
                mctx.fillText('重要城镇', 785, 104);
                mctx.strokeStyle = '#4A90E2';
                mctx.lineWidth = 3;
                mctx.beginPath();
                mctx.moveTo(765, 125);
                mctx.lineTo(785, 125);
                mctx.stroke();
                mctx.fillStyle = '#1a1a1a';
                mctx.fillText('河流', 790, 129);
                mctx.strokeStyle = '#C8102E';
                mctx.setLineDash([6, 4]);
                mctx.beginPath();
                mctx.moveTo(765, 150);
                mctx.lineTo(785, 150);
                mctx.stroke();
                mctx.setLineDash([]);
                mctx.fillStyle = '#1a1a1a';
                mctx.fillText('行军路线', 790, 154);

                // 标题
                mctx.fillStyle = '#1a1a1a';
                mctx.font = 'bold 20px SimSun';
                mctx.textAlign = 'center';
                mctx.fillText('四渡赤水行军路线图', 512, 30);

                // 指北针
                mctx.save();
                mctx.translate(920, 680);
                mctx.fillStyle = '#1a1a1a';
                mctx.beginPath();
                mctx.moveTo(0, -20);
                mctx.lineTo(-8, 10);
                mctx.lineTo(0, 5);
                mctx.lineTo(8, 10);
                mctx.closePath();
                mctx.fill();
                mctx.fillStyle = '#C8102E';
                mctx.beginPath();
                mctx.moveTo(0, -20);
                mctx.lineTo(-8, 10);
                mctx.lineTo(0, 5);
                mctx.closePath();
                mctx.fill();
                mctx.fillStyle = '#1a1a1a';
                mctx.font = 'bold 12px SimSun';
                mctx.textAlign = 'center';
                mctx.fillText('N', 0, -25);
                mctx.restore();

                const mapTexture = new THREE.CanvasTexture(mapCanvas);
                mapTexture.needsUpdate = true;

                // 地图主体（带折痕效果）
                const mapGeometry = new THREE.PlaneGeometry(2.2, 1.6, 30, 20);
                const mapPositions = mapGeometry.attributes.position.array;
                
                for (let i = 0; i < mapPositions.length; i += 3) {
                    const x = mapPositions[i];
                    const y = mapPositions[i + 1];
                    mapPositions[i + 2] = Math.sin(x * 3) * 0.02 + Math.cos(y * 2) * 0.015;
                }
                mapGeometry.computeVertexNormals();
                
                const mapMaterial = new THREE.MeshPhongMaterial({ 
                    map: mapTexture,
                    side: THREE.DoubleSide,
                    specular: 0x8B7355,
                    shininess: 15
                });
                
                const mapPlane = new THREE.Mesh(mapGeometry, mapMaterial);
                this.artifact.add(mapPlane);
                break;

            case 'rifle':
                // 精致步枪模型
                const metalMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x4A4A4A,
                    specular: 0x888888,
                    shininess: 60
                });
                
                const woodMaterial2 = new THREE.MeshPhongMaterial({ 
                    color: 0x8B4513,
                    specular: 0x4A2511,
                    shininess: 30
                });
                
                // 枪管
                const barrel = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.035, 0.035, 2.8, 16),
                    metalMaterial
                );
                barrel.rotation.z = Math.PI / 2;
                barrel.position.x = 0.2;
                this.artifact.add(barrel);
                
                // 枪管前端（准星座）
                const frontSight = new THREE.Mesh(
                    new THREE.BoxGeometry(0.04, 0.08, 0.04),
                    metalMaterial
                );
                frontSight.position.set(1.6, 0.06, 0);
                this.artifact.add(frontSight);
                
                // 枪管套筒
                const sleeve = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16),
                    metalMaterial
                );
                sleeve.rotation.z = Math.PI / 2;
                sleeve.position.x = 1.2;
                this.artifact.add(sleeve);

                // 机匣
                const receiver = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.12, 0.1),
                    metalMaterial
                );
                receiver.position.set(-0.3, 0, 0);
                this.artifact.add(receiver);
                
                // 枪机
                const bolt = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.025, 0.025, 0.15, 12),
                    metalMaterial
                );
                bolt.rotation.z = Math.PI / 2;
                bolt.position.set(-0.2, 0.08, 0);
                this.artifact.add(bolt);
                
                // 扳机护圈
                const triggerGuard = new THREE.Mesh(
                    new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI),
                    metalMaterial
                );
                triggerGuard.position.set(-0.5, -0.08, 0);
                triggerGuard.rotation.y = Math.PI / 2;
                this.artifact.add(triggerGuard);

                // 扳机
                const trigger = new THREE.Mesh(
                    new THREE.BoxGeometry(0.03, 0.1, 0.04),
                    metalMaterial
                );
                trigger.position.set(-0.5, -0.05, 0);
                this.artifact.add(trigger);

                // 枪托（木质，更符合人体工学）
                const stockShape = new THREE.Shape();
                stockShape.moveTo(0, 0);
                stockShape.lineTo(0.8, 0);
                stockShape.lineTo(0.85, -0.05);
                stockShape.lineTo(0.8, -0.15);
                stockShape.lineTo(0, -0.12);
                stockShape.lineTo(0, 0);
                
                const stockExtrudeSettings = { depth: 0.08, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01 };
                const stockGeometry = new THREE.ExtrudeGeometry(stockShape, stockExtrudeSettings);
                const stock = new THREE.Mesh(stockGeometry, woodMaterial2);
                stock.position.set(-1.2, 0.06, -0.04);
                this.artifact.add(stock);
                
                // 枪托底板
                const buttPlate = new THREE.Mesh(
                    new THREE.BoxGeometry(0.02, 0.15, 0.09),
                    metalMaterial
                );
                buttPlate.position.set(-1.2, -0.01, 0);
                this.artifact.add(buttPlate);
                
                // 背带环
                const slingRing1 = new THREE.Mesh(
                    new THREE.TorusGeometry(0.04, 0.01, 8, 16),
                    metalMaterial
                );
                slingRing1.position.set(1.4, -0.05, 0);
                slingRing1.rotation.y = Math.PI / 2;
                this.artifact.add(slingRing1);
                
                const slingRing2 = slingRing1.clone();
                slingRing2.position.set(-0.9, -0.1, 0);
                this.artifact.add(slingRing2);
                
                // 准星和照门
                const rearSight = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06, 0.06, 0.05),
                    metalMaterial
                );
                rearSight.position.set(-0.1, 0.09, 0);
                this.artifact.add(rearSight);
                break;
        }

        this.scene.add(this.artifact);
    }

    createStar(size) {
        const starShape = new THREE.Shape();
        const outerRadius = size;
        const innerRadius = size * 0.4;
        for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) starShape.moveTo(x, y);
            else starShape.lineTo(x, y);
        }
        starShape.closePath();

        const geometry = new THREE.ExtrudeGeometry(starShape, { depth: 0.02, bevelEnabled: false });
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.3
        });
        return new THREE.Mesh(geometry, material);
    }

    setupInteraction() {
        this.container.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.container.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            if (this.artifact) {
                this.artifact.rotation.y += deltaX * 0.01;
                this.artifact.rotation.x += deltaY * 0.01;
            }

            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });

        this.container.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.container.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        // 触摸支持
        this.container.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        });

        this.container.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
            const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

            if (this.artifact) {
                this.artifact.rotation.y += deltaX * 0.01;
                this.artifact.rotation.x += deltaY * 0.01;
            }

            this.previousMousePosition = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        });

        this.container.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // 自动旋转（非拖拽时）
        if (!this.isDragging && this.artifact) {
            this.artifact.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

// 导出
window.HeroMonumentScene = HeroMonumentScene;
window.ZunyiScene = ZunyiScene;
window.ArtifactScene = ArtifactScene;
