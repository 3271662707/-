// 导航控制模块

// 平滑滚动到指定区域
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.getElementById('mainNav').offsetHeight;
        const sectionTop = section.offsetTop - navHeight;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// 导航高亮控制
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const navHeight = document.getElementById('mainNav').offsetHeight;

    // 点击导航链接
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // 更新活跃状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 滚动时更新导航高亮
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // 导航栏滚动效果
    let lastScrollY = 0;
    const nav = document.getElementById('mainNav');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// 锚点导航
function initAnchorNavigation() {
    // 监听URL hash变化
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            scrollToSection(hash);
        }
    });

    // 初始加载时检查hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        setTimeout(() => scrollToSection(hash), 100);
    }
}

// 键盘导航
function initKeyboardNavigation() {
    const sections = ['home', 'history', 'figures', 'artifacts', 'spirit'];
    let currentSectionIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            currentSectionIndex = Math.min(currentSectionIndex + 1, sections.length - 1);
            scrollToSection(sections[currentSectionIndex]);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            currentSectionIndex = Math.max(currentSectionIndex - 1, 0);
            scrollToSection(sections[currentSectionIndex]);
        }
    });
}

// 返回顶部按钮
function createBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '↑';
    button.onclick = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // 添加样式
    button.style.cssText = `
        position: fixed;
        bottom: 40px;
        right: 40px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #C8102E, #8B0000);
        color: #F5F5DC;
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 20px rgba(200, 16, 46, 0.4);
    `;

    document.body.appendChild(button);

    // 滚动时显示/隐藏
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.style.opacity = '1';
            button.style.transform = 'scale(1)';
        } else {
            button.style.opacity = '0';
            button.style.transform = 'scale(0.8)';
        }
    });

    // 悬停效果
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 30px rgba(200, 16, 46, 0.6)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 20px rgba(200, 16, 46, 0.4)';
    });
}

// 导出
window.scrollToSection = scrollToSection;
window.initNavigation = initNavigation;
window.initAnchorNavigation = initAnchorNavigation;
window.initKeyboardNavigation = initKeyboardNavigation;
window.createBackToTopButton = createBackToTopButton;
