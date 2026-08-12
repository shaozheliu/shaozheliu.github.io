/**
 * i18n — Chinese / English language switcher
 * Stores preference in localStorage, defaults to zh.
 */
(function () {
    'use strict';

    var dict = {
        'page.title':     { zh: 'Hello, I\'m Shaozhe Liu',  en: 'Hello, I\'m Shaozhe Liu' },

        // sidebar
        'left.location':  { zh: '广东 深圳',          en: 'Shenzhen, China' },
        'left.school':    { zh: '北京大学',            en: 'Peking University' },
        'left.tag1':      { zh: '音乐达人',            en: 'Music Lover' },
        'left.tag2':      { zh: '独立开发者',          en: 'Indie Developer' },
        'left.tag3':      { zh: '股市选手',            en: 'Stock Trader' },
        'left.tag4':      { zh: '游泳爱好者',          en: 'Swimming Enthusiast' },
        'left.tl1':       { zh: 'To be continued',    en: 'To be continued' },
        'left.tl2':       { zh: '开启Chords & Keys Cookbook 专项', en: 'Launched Chords & Keys Cookbook' },
        'left.tl3':       { zh: 'Switched to new homepage', en: 'Switched to new homepage' },
        'left.tl4':       { zh: 'Built my blog',       en: 'Built my blog' },

        // header
        'header.welcome': { zh: 'Hello, I\'m <span class="gradientText">刘劭喆</span>', en: 'Hello, I\'m <span class="gradientText">Shaozhe Liu</span>' },
        'header.desc1':   { zh: '👦 <span class="purpleText">Vibe coding</span> 重度患者', en: '👦 A heavy <span class="purpleText">Vibe coding</span> user' },
        'header.desc2':   { zh: '📝 爱我所爱, 行我所行, 听从我心, <span class="purpleText">无问西东</span>', en: '📝 Follow your heart, <span class="purpleText">no regrets</span>' },

        // tabs
        'tab.projects':   { zh: '项目清单', en: 'Projects' },
        'tab.about':      { zh: '个人介绍', en: 'Introduction' },
        'tab.faq':        { zh: 'FAQ',       en: 'FAQ' },

        // tab1 — projects
        'proj.opensource': { zh: '开源经验', en: 'Open Source' },
        'proj.chords.desc':{ zh: '钢琴弹唱Handbook — 从和弦到伴奏的系统指南', en: 'Piano Sing-Along Handbook — from chords to accompaniment' },
        'proj.products':   { zh: '产品清单', en: 'Products' },
        'proj.zquant.desc':{ zh: 'A powerful NCM Downloader that supports built-in metadata', en: 'A powerful NCM Downloader that supports built-in metadata' },
        'proj.homepage.desc': { zh: 'An elegant personal homepage', en: 'An elegant personal homepage' },
        'proj.kiraai.desc':   { zh: 'KiraAI, a modular, multi-platform AI virtual being that connects LLMs and social media', en: 'KiraAI, a modular, multi-platform AI virtual being that connects LLMs and social media' },
        'proj.device.desc':   { zh: 'An elegant web page that displays your devices\' status', en: 'An elegant web page that displays your devices\' status' },
        'proj.skills':    { zh: 'Skills', en: 'Skills' },

        // tab2 — about
        'about.abtme':    { zh: 'About Me', en: 'About Me' },
        'about.bio':      {
            zh: 'Graduate student from the Academy of Advanced Interdisciplinary Studies at <strong>Peking University</strong>, specializing in Data Science. My research interests encompass <span class="highlight-text">Human-Computer Interaction</span>, <span class="highlight-text">Machine Learning</span>, and health applications utilizing physiological time series data. I am particularly intrigued by the development and construction of multi-agent systems. If my work aligns with your interests, feel free to reach out via <a class="highlight-link" href="mailto:liushaozhe@pku.org.cn">email</a>.',
            en: 'Graduate student from the Academy of Advanced Interdisciplinary Studies at <strong>Peking University</strong>, specializing in Data Science. My research interests encompass <span class="highlight-text">Human-Computer Interaction</span>, <span class="highlight-text">Machine Learning</span>, and health applications utilizing physiological time series data. I am particularly intrigued by the development and construction of multi-agent systems. If my work aligns with your interests, feel free to reach out via <a class="highlight-link" href="mailto:liushaozhe@pku.org.cn">email</a>.'
        },
        'about.news':     { zh: 'News', en: 'News' },
        'about.news1':    { zh: 'Three papers are accepted by ICASSP 2026', en: 'Three papers are accepted by ICASSP 2026' },
        'about.news2':    { zh: 'One paper is accepted by ICASSP 2025', en: 'One paper is accepted by ICASSP 2025' },
        'about.news3':    { zh: 'One paper is accepted by IJCAI-workshop 2024', en: 'One paper is accepted by IJCAI-workshop 2024' },
        'about.news4':    { zh: 'One paper is accepted by SMC 2023', en: 'One paper is accepted by SMC 2023' },
        'about.pub':      { zh: 'Publications', en: 'Publications' },
        'about.honors':   { zh: 'Honors &amp; Awards', en: 'Honors &amp; Awards' },
        'about.honor1':   { zh: 'Kaggle: Density Forecasting — Bronze Medal', en: 'Kaggle: Density Forecasting — Bronze Medal' },
        'about.honor2':   { zh: 'Kaggle: American Express Default Prediction — Gold Medal (9th Place)', en: 'Kaggle: American Express Default Prediction — Gold Medal (9th Place)' },
        'about.honor3':   { zh: 'Academic Scholarship, Peking University', en: 'Academic Scholarship, Peking University' },
        'about.honor4':   { zh: 'Outstanding Student Scholarship, Zhongnan University of Economics and Law', en: 'Outstanding Student Scholarship, Zhongnan University of Economics and Law' },
        'about.edu':      { zh: 'Education', en: 'Education' },
        'about.edu1':     { zh: 'M.Sc. in Data Science, Peking University, Beijing', en: 'M.Sc. in Data Science, Peking University, Beijing' },
        'about.edu2':     { zh: 'B.Eng., Zhongnan University of Economics and Law, Wuhan', en: 'B.Eng., Zhongnan University of Economics and Law, Wuhan' },
        'about.service':  { zh: 'Professional Service', en: 'Professional Service' },
        'about.svc.desc': { zh: '<strong>Conference Reviewer:</strong> ICASSP · IJCNN · SMC · MLSP', en: '<strong>Conference Reviewer:</strong> ICASSP · IJCNN · SMC · MLSP' },

        // tab3 — faq
        'faq.title':      { zh: 'FAQ', en: 'FAQ' },
        'faq.q1':         { zh: 'When did you start programming?', en: 'When did you start programming?' },
        'faq.a1':         { zh: 'I started programming with <span class="highlight-text">Scratch</span> when I was in elementary school (unfortunately all the projects I had made got lost :(. and learned <span class="highlight-text">Python</span> &amp; <span class="highlight-text">Frontend</span> during the summer vacation before entering middle school. Deployed my first ever website on Sep. 20, 2021 (it was a blog)', en: 'I started programming with <span class="highlight-text">Scratch</span> when I was in elementary school (unfortunately all the projects I had made got lost :(. and learned <span class="highlight-text">Python</span> &amp; <span class="highlight-text">Frontend</span> during the summer vacation before entering middle school. Deployed my first ever website on Sep. 20, 2021 (it was a blog)' },
        'faq.q2':         { zh: 'How can I contact you?', en: 'How can I contact you?' },
        'faq.a2':         { zh: 'You can reach me through GitHub and Email', en: 'You can reach me through GitHub and Email' },
        'faq.q3':         { zh: 'How did you fall into the rabbit hole of language learning?', en: 'How did you fall into the rabbit hole of language learning?' },
        'faq.a3':         { zh: 'inspired by <a class="highlight-link" target="_blank" href="https://www.bilibili.com/video/BV1ns4y1A7fj/">this vid</a> &amp; yt vids related to comprehensible input', en: 'inspired by <a class="highlight-link" target="_blank" href="https://www.bilibili.com/video/BV1ns4y1A7fj/">this vid</a> &amp; yt vids related to comprehensible input' },

        // footer
        'footer.source':  { zh: 'SourceCode', en: 'SourceCode' },
        'footer.copy':    { zh: '© 2024-2025 Caleb XXY', en: '© 2024-2025 Caleb XXY' },
    };

    var currentLang = localStorage.getItem('lang') || 'zh';

    function applyLang(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var key = els[i].getAttribute('data-i18n');
            if (dict[key] && dict[key][lang]) {
                els[i].innerHTML = dict[key][lang];
            }
        }
        // Toggle button active state
        var btnZh = document.getElementById('lang-zh');
        var btnEn = document.getElementById('lang-en');
        if (btnZh) { btnZh.classList.toggle('lang-active', lang === 'zh'); }
        if (btnEn) { btnEn.classList.toggle('lang-active', lang === 'en'); }
    }

    window.toggleLang = function(lang) {
        applyLang(lang);
    };

    // Apply saved language on page load (before DOMContentLoaded)
    // Keep the HTML's default zh text for SSR / no-JS, then swap on init
    document.addEventListener('DOMContentLoaded', function () {
        if (currentLang !== 'zh') {
            applyLang(currentLang);
        } else {
            // Ensure buttons are in sync
            var btnZh = document.getElementById('lang-zh');
            var btnEn = document.getElementById('lang-en');
            if (btnZh) btnZh.classList.add('lang-active');
            if (btnEn) btnEn.classList.remove('lang-active');
        }
    });

})();
