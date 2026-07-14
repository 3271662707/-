// 交互处理模块

// 滚动触发动画
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // 观察需要动画的元素
    const animatedElements = document.querySelectorAll(
        '.history-card, .figure-card, .artifact-card, .value-card'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
}

// 弹窗控制
let currentModal = null;

function showModal(content) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = content;
    modal.classList.add('active');
    currentModal = modal;
    
    // 阻止背景滚动
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (currentModal) {
        currentModal.classList.remove('active');
        currentModal = null;
        
        // 恢复背景滚动
        document.body.style.overflow = '';
    }
}

// 点击弹窗外部关闭
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// ESC键关闭弹窗
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) {
        closeModal();
    }
});

// 显示历史事件详情
function showDetail(eventId) {
    fetch('data/history.json')
        .then(response => response.json())
        .then(data => {
            const event = data.events.find(e => e.id === eventId);
            if (event) {
                const content = `
                    <h2 style="font-family: var(--font-serif); color: var(--primary-gold); margin-bottom: 20px;">
                        ${event.title}
                    </h2>
                    <p style="color: rgba(245, 245, 220, 0.7); margin-bottom: 10px;">
                        <strong>时间：</strong>${event.date}
                    </p>
                    <p style="color: rgba(245, 245, 220, 0.7); margin-bottom: 10px;">
                        <strong>地点：</strong>${event.location}
                    </p>
                    <p style="line-height: 1.8; margin-bottom: 20px;">
                        ${event.description}
                    </p>
                    <p style="line-height: 1.8; margin-bottom: 20px;">
                        ${event.details}
                    </p>
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 10px; border-left: 3px solid var(--primary-gold);">
                        <strong style="color: var(--primary-gold);">历史意义：</strong>
                        <p style="margin-top: 10px;">${event.significance}</p>
                    </div>
                `;
                showModal(content);
            }
        })
        .catch(error => console.error('加载数据失败:', error));
}

// 显示人物详情
function showFigureDetail(figureId) {
    fetch('data/figures.json')
        .then(response => response.json())
        .then(data => {
            const figure = data.figures.find(f => f.id === figureId);
            if (figure) {
                const quotesHtml = figure.quotes.map(q => 
                    `<blockquote style="font-family: var(--font-serif); font-style: italic; color: var(--primary-gold); padding: 15px 20px; border-left: 3px solid var(--primary-gold); margin: 15px 0; background: rgba(255, 215, 0, 0.05); border-radius: 0 10px 10px 0;">"${q}"</blockquote>`
                ).join('');

                const content = `
                    <div style="display: flex; gap: 30px; align-items: flex-start;">
                        <div style="flex-shrink: 0; width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #C8102E, #FFD700); display: flex; align-items: center; justify-content: center; font-family: var(--font-serif); font-size: 48px; color: var(--light-beige);">
                            ${figure.name.charAt(0)}
                        </div>
                        <div style="flex: 1;">
                            <h2 style="font-family: var(--font-serif); color: var(--primary-gold); margin-bottom: 10px;">
                                ${figure.name}
                            </h2>
                            <p style="color: rgba(245, 245, 220, 0.8); margin-bottom: 5px;">
                                ${figure.title}
                            </p>
                            <p style="color: rgba(245, 245, 220, 0.6); margin-bottom: 20px;">
                                ${figure.birthYear} - ${figure.deathYear}
                            </p>
                            <p style="line-height: 1.8; margin-bottom: 20px;">
                                ${figure.bio}
                            </p>
                            <div style="background: rgba(200, 16, 46, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                                <strong style="color: var(--primary-gold);">与贵州的渊源：</strong>
                                <p style="margin-top: 10px; line-height: 1.8;">${figure.guizhouConnection}</p>
                            </div>
                            <h3 style="color: var(--primary-gold); margin-bottom: 15px;">经典语录</h3>
                            ${quotesHtml}
                        </div>
                    </div>
                `;
                showModal(content);
            }
        })
        .catch(error => console.error('加载数据失败:', error));
}

// 显示文物详情
function showArtifactDetail(artifactId) {
    fetch('data/artifacts.json')
        .then(response => response.json())
        .then(data => {
            const artifact = data.artifacts.find(a => a.id === artifactId);
            if (artifact) {
                const content = `
                    <h2 style="font-family: var(--font-serif); color: var(--primary-gold); margin-bottom: 20px;">
                        ${artifact.name}
                    </h2>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                            <strong style="color: var(--primary-gold);">年代：</strong>
                            <p>${artifact.era}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                            <strong style="color: var(--primary-gold);">材质：</strong>
                            <p>${artifact.material}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                            <strong style="color: var(--primary-gold);">尺寸：</strong>
                            <p>${artifact.dimensions}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 10px;">
                            <strong style="color: var(--primary-gold);">馆藏地点：</strong>
                            <p>${artifact.location}</p>
                        </div>
                    </div>
                    <p style="line-height: 1.8; margin-bottom: 20px;">
                        ${artifact.description}
                    </p>
                    <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 10px; border-left: 3px solid var(--primary-gold);">
                        <strong style="color: var(--primary-gold);">历史价值：</strong>
                        <p style="margin-top: 10px; line-height: 1.8;">${artifact.historicalValue}</p>
                    </div>
                `;
                showModal(content);
            }
        })
        .catch(error => console.error('加载数据失败:', error));
}

// 留言功能
function submitMessage() {
    const input = document.getElementById('messageInput');
    const messagesDisplay = document.getElementById('messagesDisplay');
    const message = input.value.trim();

    if (message) {
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item';
        messageItem.style.animation = 'fadeInUp 0.5s ease-out';
        messageItem.innerHTML = `
            <p>${message}</p>
            <span class="message-author">— 参观者 ${new Date().toLocaleDateString('zh-CN')}</span>
        `;
        
        messagesDisplay.insertBefore(messageItem, messagesDisplay.firstChild);
        input.value = '';

        // 显示成功提示
        showToast('留言提交成功！');
    } else {
        showToast('请输入留言内容');
    }
}

// Toast提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 215, 0, 0.9);
        color: var(--dark-gray);
        padding: 15px 30px;
        border-radius: 30px;
        font-weight: 600;
        z-index: 3000;
        animation: fadeInUp 0.3s ease-out;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// 卡片悬停效果增强
function initCardEffects() {
    const cards = document.querySelectorAll('.figure-card, .artifact-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// 打开游戏（全屏iframe）
function openGame() {
    const gameFrame = document.getElementById('gameFrame');
    if (!gameFrame) return;
    
    // 创建全屏游戏遮罩
    let overlay = document.getElementById('gameOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gameOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;display:flex;align-items:center;justify-content:center;';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '× 返回平台';
        closeBtn.style.cssText = 'position:absolute;top:15px;right:20px;background:rgba(200,16,46,0.9);color:#ffd700;border:2px solid #ffd700;border-radius:20px;padding:8px 20px;font-size:1rem;cursor:pointer;z-index:10000;font-weight:bold;';
        closeBtn.onclick = () => overlay.style.display = 'none';
        
        const fullFrame = document.createElement('iframe');
        fullFrame.src = '网页游戏/game.html';
        fullFrame.frameBorder = '0';
        fullFrame.style.cssText = 'width:100%;height:100%;border:none;';
        
        overlay.appendChild(closeBtn);
        overlay.appendChild(fullFrame);
        document.body.appendChild(overlay);
    } else {
        overlay.style.display = 'flex';
    }
}

// 导出
window.showDetail = showDetail;
window.showFigureDetail = showFigureDetail;
window.showArtifactDetail = showArtifactDetail;
window.submitMessage = submitMessage;
window.closeModal = closeModal;
window.initScrollAnimations = initScrollAnimations;
window.initCardEffects = initCardEffects;
window.openGame = openGame;
