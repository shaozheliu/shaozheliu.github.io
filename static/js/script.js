(function () {
    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    }

    function applyTheme(state) {
        var isLight = state === 'Light';
        document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
        setCookie('themeState', state, 365);
    }

    function initThemeToggle() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;

        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme');
            applyTheme(current === 'light' ? 'Dark' : 'Light');
        });
    }

    function initNav() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
        var sections = links
            .map(function (link) {
                var id = link.getAttribute('href');
                return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
            })
            .filter(Boolean);

        function setActive() {
            var scrollY = window.scrollY + 120;
            var current = sections[0];
            sections.forEach(function (section) {
                if (section.offsetTop <= scrollY) current = section;
            });
            links.forEach(function (link) {
                var href = link.getAttribute('href');
                link.classList.toggle('is-active', current && href === '#' + current.id);
            });
        }

        window.addEventListener('scroll', setActive, { passive: true });
        setActive();
    }

    var starCanvas = null;
    var starCtx = null;
    var stars = [];
    var meteors = [];
    var rafId = null;
    var nextMeteorAt = 0;

    /* ── 可配置参数 ── */
    var CONFIG = {
        star: {
            density: 9000,          // 星空密度系数，值越小星星越密
            twinkleSpeed: 0.015,    // 闪烁速度，越大闪烁越快
            twinkleDepth: 0.3,      // 闪烁幅度，越大明暗变化越明显
            colors: [               // 恒星色温分布 [颜色RGB, 权重]
                ['255, 255, 255', 0.62],  // 白
                ['158, 198, 255', 0.16],  // 蓝白
                ['255, 235, 200', 0.12],  // 微黄
                ['255, 200, 180', 0.10]   // 微红
            ]
        },
        meteor: {
            minInterval: 1500,    // 流星最小生成间隔 (ms)
            maxInterval: 3500,    // 流星最大生成间隔 (ms)
            firstDelay: 1000,     // 首颗流星延迟 (ms)
            firstDelayJitter: 2000, // 首颗流星随机抖动 (ms)
            minSpeed: 1,          // 最小速度 (px/帧)
            maxSpeed: 5,          // 最大速度 (px/帧)
            minLength: 100,       // 最小拖尾长度 (px)
            maxLength: 200,       // 最大拖尾长度 (px)
            minAlpha: 0.55,       // 最小亮度
            maxAlpha: 0.85,       // 最大亮度
            blueRatio: 0.2,       // 蓝色流星占比
            tailWidth: 1.6,      // 拖尾线宽 (px)
            headRadius: 1.4,      // 头部光点半径 (px)
            fadeStart: 0.7,       // 生命周期多少比例后开始淡出
            fadeDecay: 0.965,    // 淡出衰减率 (越小衰减越快)
            maxLife: 400          // 最大寿命 (帧)
        }
    };

    function pickStarColor() {
        var r = Math.random();
        var acc = 0;
        var colors = CONFIG.star.colors;
        for (var i = 0; i < colors.length; i++) {
            acc += colors[i][1];
            if (r < acc) return colors[i][0];
        }
        return colors[0][0];
    }

    function resizeStars() {
        if (!starCanvas) return;
        var w = window.innerWidth;
        var h = window.innerHeight;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        starCanvas.width = Math.floor(w * dpr);
        starCanvas.height = Math.floor(h * dpr);
        starCanvas.style.width = w + 'px';
        starCanvas.style.height = h + 'px';
        starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var total = Math.floor((w * h) / CONFIG.star.density);
        stars = [];
        for (var i = 0; i < total; i++) {
            // 三层：远(60%) 中(30%) 近(10%)
            var layer = Math.random();
            var r, a, size;
            if (layer < 0.6) {
                // 远层：小、暗、多
                r = 0.4 + Math.random() * 0.4;
                a = 0.15 + Math.random() * 0.25;
                size = 0;
            } else if (layer < 0.9) {
                // 中层：中、中
                r = 0.8 + Math.random() * 0.5;
                a = 0.3 + Math.random() * 0.35;
                size = 1;
            } else {
                // 近层：大、亮、少
                r = 1.3 + Math.random() * 0.6;
                a = 0.5 + Math.random() * 0.4;
                size = 2;
            }
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: r,
                baseA: a,                   // 基础亮度
                twinklePhase: Math.random() * Math.PI * 2,  // 闪烁相位
                twinkleSpeed: 0.5 + Math.random() * 1.5,     // 个体闪烁速度倍率
                color: pickStarColor(),
                size: size
            });
        }
    }

    function spawnMeteor(w, h) {
        var C = CONFIG.meteor;
        // 随机角度：以对角线方向为主，±15°~30° 偏移
        var baseAngle = Math.PI / 4; // 45°
        var angle = baseAngle + (Math.random() - 0.5) * Math.PI / 3;
        // 随机方向：左上→右下 或 右上→左下
        var dirX = Math.random() < 0.5 ? 1 : -1;
        var speed = C.minSpeed + Math.random() * (C.maxSpeed - C.minSpeed);
        var vx = Math.cos(angle) * speed * dirX;
        var vy = Math.sin(angle) * speed;

        // 从上边缘或侧边缘进入
        var x, y;
        if (dirX > 0) {
            // 左上→右下：从上边缘或左边缘进入
            if (Math.random() < 0.6) {
                x = Math.random() * w * 0.4;
                y = -20;
            } else {
                x = -20;
                y = Math.random() * h * 0.4;
            }
        } else {
            // 右上→左下：从上边缘或右边缘进入
            if (Math.random() < 0.6) {
                x = w - Math.random() * w * 0.4;
                y = -20;
            } else {
                x = w + 20;
                y = Math.random() * h * 0.4;
            }
        }

        meteors.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            length: C.minLength + Math.random() * (C.maxLength - C.minLength),
            alpha: C.minAlpha + Math.random() * (C.maxAlpha - C.minAlpha),
            blue: Math.random() < C.blueRatio,
            life: 0,
            maxLife: C.maxLife
        });
    }

    function drawMeteor(m) {
        var C = CONFIG.meteor;
        // 拖尾方向：反于运动方向
        var tailX = m.x - m.vx * m.length / 5;
        var tailY = m.y - m.vy * m.length / 5;

        var grad = starCtx.createLinearGradient(m.x, m.y, tailX, tailY);
        var color = m.blue ? '180, 200, 255' : '255, 255, 255';
        grad.addColorStop(0, 'rgba(' + color + ',' + m.alpha + ')');
        grad.addColorStop(0.4, 'rgba(' + color + ',' + (m.alpha * 0.5) + ')');
        grad.addColorStop(1, 'rgba(' + color + ',0)');

        starCtx.beginPath();
        starCtx.strokeStyle = grad;
        starCtx.lineWidth = C.tailWidth;
        starCtx.lineCap = 'round';
        starCtx.moveTo(m.x, m.y);
        starCtx.lineTo(tailX, tailY);
        starCtx.stroke();

        // 头部光点
        starCtx.beginPath();
        starCtx.fillStyle = 'rgba(' + color + ',' + m.alpha + ')';
        starCtx.arc(m.x, m.y, C.headRadius, 0, Math.PI * 2);
        starCtx.fill();
    }

    function animateStars() {
        if (!starCtx || !starCanvas) return;
        var w = starCanvas.clientWidth;
        var h = starCanvas.clientHeight;

        starCtx.clearRect(0, 0, w, h);

        // 绘制星空（带闪烁）
        var twinkleSpeed = CONFIG.star.twinkleSpeed;
        var twinkleDepth = CONFIG.star.twinkleDepth;
        stars.forEach(function (s) {
            // 闪烁：baseA ± depth，用正弦波
            var twinkle = Math.sin(s.twinklePhase) * twinkleDepth * s.baseA;
            var a = Math.max(0.02, s.baseA + twinkle);
            s.twinklePhase += twinkleSpeed * s.twinkleSpeed;

            starCtx.beginPath();
            starCtx.fillStyle = 'rgba(' + s.color + ',' + a + ')';
            starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            starCtx.fill();

            // 近层亮星：加十字光芒
            if (s.size === 2 && a > 0.55) {
                var spike = s.r * 3;
                starCtx.strokeStyle = 'rgba(' + s.color + ',' + (a * 0.25) + ')';
                starCtx.lineWidth = 0.5;
                starCtx.beginPath();
                starCtx.moveTo(s.x - spike, s.y);
                starCtx.lineTo(s.x + spike, s.y);
                starCtx.moveTo(s.x, s.y - spike);
                starCtx.lineTo(s.x, s.y + spike);
                starCtx.stroke();
            }
        });

        // 流星生成
        var now = performance.now();
        if (now >= nextMeteorAt) {
            spawnMeteor(w, h);
            var C = CONFIG.meteor;
            nextMeteorAt = now + C.minInterval + Math.random() * (C.maxInterval - C.minInterval);
        }

        // 更新并绘制流星
        for (var i = meteors.length - 1; i >= 0; i--) {
            var m = meteors[i];
            m.x += m.vx;
            m.y += m.vy;
            m.life++;

            // 流星淡出（生命末期逐渐变暗）
            if (m.life > m.maxLife * CONFIG.meteor.fadeStart) {
                m.alpha *= CONFIG.meteor.fadeDecay;
            }

            // 出界或太暗则移除
            if (m.alpha < 0.02 || m.x < -m.length || m.x > w + m.length || m.y > h + m.length) {
                meteors.splice(i, 1);
                continue;
            }

            drawMeteor(m);
        }

        rafId = requestAnimationFrame(animateStars);
    }

    function initStars() {
        starCanvas = document.getElementById('starfield');
        if (!starCanvas) return;
        starCtx = starCanvas.getContext('2d');
        resizeStars();
        var C = CONFIG.meteor;
        nextMeteorAt = performance.now() + C.firstDelay + Math.random() * C.firstDelayJitter;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animateStars);
        window.addEventListener('resize', resizeStars);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            } else {
                if (!rafId) {
                    nextMeteorAt = performance.now() + CONFIG.meteor.firstDelay + Math.random() * CONFIG.meteor.firstDelayJitter;
                    rafId = requestAnimationFrame(animateStars);
                }
            }
        });
    }

    var PROJECTS = [
        {
            title: 'Chords & Keys Cookbook',
            href: 'https://shaozheliu.github.io/chords-keys-cookbook/#/',
            desc: '钢琴弹唱 Cookbook，从和弦走到伴奏。',
            tags: ['音乐', '钢琴'],
            cover: '#172033',
            image: './static/img/project-chords.png',
            icon: './static/img/music.svg',
            featured: true,
            visible: true
        },
        {
            title: 'JianYing Editor Skill',
            href: 'https://github.com/luoluoluo22/jianying-editor-skill',
            desc: '剪映AI剪辑',
            tags: ['开源贡献'],
            cover: '#1A1030',
            image: './static/img/project-jianying.jpg',
            featured: true,
            visible: true
        },
        {
            title: 'KiraAI',
            href: 'https://github.com/xxynet/KiraAI',
            desc: '把大模型和社交平台接在一起的多智能体角色。',
            tags: ['AI', '多智能体'],
            cover: '#241F14',
            icon: './static/img/star.svg',
            featured: true,
            visible: false
        },
        {
            title: 'ZQuant',
            href: 'https://github.com/xxynet/NCM-Downloader',
            desc: '支持写入元数据的 NCM 下载工具。',
            tags: ['工具', '下载'],
            cover: '#1A1E2C',
            icon: './static/img/blog.svg',
            featured: false,
            visible: false
        },
        {
            title: 'HomePage',
            href: 'https://github.com/xxynet/HomePage',
            desc: '一个干净的个人主页。',
            tags: ['主页', '开源'],
            cover: '#241C16',
            icon: './static/img/home.svg',
            featured: false,
            visible: false
        },
        {
            title: 'device-status',
            href: 'https://github.com/xxynet/device-status',
            desc: '用来看设备状态的小页面。',
            tags: ['设备', '状态'],
            cover: '#142028',
            icon: './static/img/info.svg',
            featured: false,
            visible: false
        }
    ];

    function createProjectCard(project) {
        var card = document.createElement('a');
        card.className = 'project-card' + (project.featured ? ' project-card--lg' : '');
        card.href = project.href;
        card.target = '_blank';
        card.rel = 'noopener';

        var cover = document.createElement('div');
        cover.className = 'project-cover';
        cover.style.setProperty('--cover', project.cover || '#18181B');

        if (project.image) {
            var shot = document.createElement('img');
            shot.className = 'project-shot';
            shot.src = project.image;
            shot.alt = '';
            cover.appendChild(shot);
        } else if (project.icon) {
            var icon = document.createElement('img');
            icon.className = 'project-icon';
            icon.src = project.icon;
            icon.alt = '';
            icon.width = project.featured ? 40 : 36;
            icon.height = project.featured ? 40 : 36;
            cover.appendChild(icon);
        }

        if (project.tags && project.tags.length) {
            var tags = document.createElement('div');
            tags.className = 'project-tags';
            project.tags.forEach(function (label) {
                var tag = document.createElement('span');
                tag.textContent = label;
                tags.appendChild(tag);
            });
            cover.appendChild(tags);
        }

        var copy = document.createElement('div');
        copy.className = 'project-copy';
        var title = document.createElement('h3');
        title.textContent = project.title;
        var desc = document.createElement('p');
        desc.textContent = project.desc;
        copy.appendChild(title);
        copy.appendChild(desc);

        card.appendChild(cover);
        card.appendChild(copy);
        return card;
    }

    function initProjects() {
        var featured = document.getElementById('project-featured');
        var gallery = document.getElementById('project-gallery');
        if (!featured || !gallery) return;

        PROJECTS.forEach(function (project) {
            if (!project.visible) return;
            var host = project.featured ? featured : gallery;
            host.appendChild(createProjectCard(project));
        });

        gallery.hidden = gallery.children.length === 0;
    }

    document.addEventListener('DOMContentLoaded', function () {
        initThemeToggle();
        initNav();
        initStars();
        initProjects();
    });
})();
