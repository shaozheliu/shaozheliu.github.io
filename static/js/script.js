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
            var current = getCookie('themeState') || 'Dark';
            applyTheme(current === 'Dark' ? 'Light' : 'Dark');
            drawStars();
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

    function resizeStars() {
        if (!starCanvas) return;
        var hero = starCanvas.parentElement;
        var rect = hero.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        starCanvas.width = Math.floor(rect.width * dpr);
        starCanvas.height = Math.floor(rect.height * dpr);
        starCanvas.style.width = rect.width + 'px';
        starCanvas.style.height = rect.height + 'px';
        starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        var count = Math.floor((rect.width * rect.height) / 14000);
        stars = [];
        for (var i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * rect.width,
                y: Math.random() * rect.height,
                r: Math.random() < 0.15 ? 1.6 : Math.random() < 0.4 ? 1.1 : 0.7,
                a: 0.2 + Math.random() * 0.55,
                blue: Math.random() < 0.28
            });
        }
        drawStars();
    }

    function drawStars() {
        if (!starCtx || !starCanvas) return;
        var w = starCanvas.clientWidth;
        var h = starCanvas.clientHeight;
        starCtx.clearRect(0, 0, w, h);
        stars.forEach(function (s) {
            starCtx.beginPath();
            starCtx.fillStyle = s.blue
                ? 'rgba(158, 198, 255,' + s.a + ')'
                : 'rgba(255, 255, 255,' + s.a + ')';
            starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            starCtx.fill();
        });
    }

    function initStars() {
        starCanvas = document.getElementById('starfield');
        if (!starCanvas) return;
        starCtx = starCanvas.getContext('2d');
        resizeStars();
        window.addEventListener('resize', resizeStars);
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
