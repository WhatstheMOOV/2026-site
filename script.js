// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');
const topRibbon = document.getElementById('topRibbon');

window.addEventListener('scroll', () => {
    const down = window.scrollY > 20;
    navbar.classList.toggle('scrolled', down);
    if (topRibbon) topRibbon.classList.toggle('hidden', down);
});

// ===== "See how it works" video reveal =====
// ===== Pinned intro: single video shrinks into the ID card as you scroll =====
(function () {
    const section = document.getElementById('introScroll');
    const sticky = document.getElementById('introSticky');
    if (!section || !sticky) return;
    const card = document.getElementById('tapCard');
    const tapFace = document.getElementById('tapFace');
    const tapFaceLogo = document.querySelector('#tapFace .tap-face-logo');
    if (card) {
        card.addEventListener('click', function () {
            if (window.openVimeoLightbox) window.openVimeoLightbox('1204987693');
        });
        const tapIframe = document.getElementById('tapCardIframe');
        const revealVideo = function () { card.classList.add('is-playing'); };
        if (tapIframe && window.Vimeo && window.Vimeo.Player) {
            try {
                new window.Vimeo.Player(tapIframe).on('play', revealVideo);
            } catch (e) { setTimeout(revealVideo, 1200); }
        } else {
            setTimeout(revealVideo, 1200);
        }
    }
    let faceTimer = null;
    const line = document.getElementById('tapLine');
    const opening = document.getElementById('introOpening');
    const title = sticky.querySelector('.hero-title');
    const actions = sticky.querySelector('.hero-actions');
    const tapText = sticky.querySelector('.tap-text');
    const floatCards = Array.prototype.slice.call(sticky.querySelectorAll('.float-card'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    const lerp = function (a, b, t) { return a + (b - a) * t; };
    const REST = 0.087;
    let BIG = 1.3, dx = 0, dy = 0, ticking = false;
    const setOpacity = function (el, v) { if (el) el.style.opacity = v; };
    function settleFloaters() { floatCards.forEach(function (c) { c.classList.add('in'); }); }

    function noPin() {
        section.classList.add('no-pin');
        sticky.classList.remove('intro');
        if (card) { card.style.transition = 'none'; card.style.transform = ''; }
        if (opening) { setOpacity(opening, 0); opening.style.display = 'none'; }
        [title, actions, tapText].forEach(function (el) { setOpacity(el, 1); });
        settleFloaters();
    }

    function measure() {
        const topEl = opening.querySelector('.intro-top');
        const mobile = window.innerWidth <= 768;
        if (topEl) topEl.style.transform = '';
        card.style.transition = 'none';
        card.style.transform = '';

        if (mobile && topEl) {
            // Center [headline + 1rem gap + video] together as one group on the screen.
            const headlineH = topEl.getBoundingClientRect().height;
            BIG = clamp((window.innerWidth * 0.88) / 460, 0.5, 1.45);
            const cardH = 288 * BIG;
            const gap = 32; // 1rem base + 1rem extra between headline and video
            const groupH = headlineH + gap + cardH;
            const groupTop = Math.max(window.innerHeight * 0.1, (window.innerHeight - groupH) / 2);
            topEl.style.transform = 'translateY(' + groupTop + 'px)';
            const bandCenter = groupTop + headlineH + gap + cardH / 2;
            const r = card.getBoundingClientRect();
            dx = window.innerWidth / 2 - (r.left + r.width / 2);
            dy = bandCenter - (r.top + r.height / 2);
            return;
        }

        const gapTop = topEl ? topEl.getBoundingClientRect().bottom : window.innerHeight * 0.2;
        const bandTop = gapTop + window.innerHeight * 0.04;
        const bandBot = window.innerHeight * 0.9;
        const bandH = Math.max(150, bandBot - bandTop);
        // cap by both the vertical band and the viewport width so the 460px card never overflows a phone
        BIG = clamp(Math.min(bandH / 288, (window.innerWidth * 0.9) / 460), 0.5, 1.45);
        const r = card.getBoundingClientRect();
        dx = window.innerWidth / 2 - (r.left + r.width / 2);
        dy = (bandTop + bandBot) / 2 - (r.top + r.height / 2);
    }

    function frame() {
        ticking = false;
        const rect = section.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const raw = clamp(-rect.top / total, 0, 1);
        // morph completes over most of the scrub; the logo turns blue near the end, then the
        // pin releases right after so the page continues down without a long dead buffer.
        const p = clamp(raw / 0.62, 0, 1);
        const rot = 90 * p;
        card.style.transform = 'translate(' + (dx * (1 - p)) + 'px, ' + (dy * (1 - p)) + 'px) scale(' + lerp(BIG, REST, p) + ') rotate(' + rot + 'deg)';
        // gently round the corners as the card shrinks so the final state matches the MOOV reader's
        // squared-with-soft-corners look (~10% of width), not a pill
        card.style.borderRadius = lerp(16, 44, p) + 'px';
        if (tapFaceLogo) tapFaceLogo.style.transform = 'rotate(' + (-rot) + 'deg)';
        setOpacity(opening, clamp(1 - p / 0.5, 0, 1));
        const rev = clamp((p - 0.5) / 0.4, 0, 1);
        [title, actions, tapText].forEach(function (el) { setOpacity(el, rev); });
        if (title) title.style.transform = 'translateY(' + ((1 - rev) * 16) + 'px)';
        floatCards.forEach(function (c, i) { c.classList.toggle('in', p > 0.5 + i * 0.02); });
        const green = raw > 0.72;
        if (tapFace) {
            tapFace.style.opacity = green ? 1 : 0;
            if (green) {
                if (!faceTimer && !tapFace.classList.contains('tapped')) {
                    faceTimer = setTimeout(function () {
                        tapFace.classList.add('tapped');
                        line.classList.add('tapped');
                        faceTimer = null;
                    }, 550);
                }
            } else {
                if (faceTimer) { clearTimeout(faceTimer); faceTimer = null; }
                tapFace.classList.remove('tapped');
                line.classList.remove('tapped');
            }
        }
    }

    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

    function initHover() {
        floatCards.forEach(function (fc) {
            const inner = fc.querySelector('.float-card-inner');
            const img = inner && inner.querySelector('img[data-poster]');
            if (img) img.src = img.getAttribute('data-poster');
            const vid = inner && inner.getAttribute('data-vimeo');
            if (!vid || inner.querySelector('iframe')) return;
            const f = document.createElement('iframe');
            f.src = 'https://player.vimeo.com/video/' + vid + '?background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0';
            f.allow = 'autoplay; fullscreen; picture-in-picture';
            f.setAttribute('frameborder', '0');
            inner.appendChild(f);
            // click to watch full-size with sound + controls
            fc.style.cursor = 'pointer';
            fc.addEventListener('click', function () {
                if (window.openVimeoLightbox) window.openVimeoLightbox(vid);
            });
        });
    }

    function start() {
        sticky.classList.remove('intro');
        initHover();
        if (reduce || !card) { noPin(); return; }
        [title, actions, tapText].forEach(function (el) { if (el) el.style.transition = 'none'; });
        card.style.transition = 'none';
        measure();
        frame();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', function () {
            section.classList.remove('no-pin');
            if (opening) opening.style.display = '';
            measure();
            frame();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

// ===== Opening coverflow: quote cards rotate =====
(function () {
    const cfVideo = document.getElementById('cfVideo');
    const quoteEl = document.getElementById('cfQuote');
    const whoEl = document.getElementById('cfWho');
    const nameEl = document.getElementById('cfName');
    const avatarEl = document.getElementById('cfAvatar');
    const prevImg = document.getElementById('cfPrev');
    const nextImg = document.getElementById('cfNext');
    const flow = document.getElementById('coverflow');
    if (!quoteEl) return;
    const T = [
        { id: '1204987693', quote: 'Attendance is at the forefront of their thinking every time they tap in.', name: 'Charlie Rizzuto', role: 'Assistant Principal \u00b7 Islip High School', logo: 'images/logo-islip.png' },
        { id: '1204908940', quote: 'It makes our lives just 10 times easier.', name: 'Joel Sutherland', role: 'Math Teacher \u00b7 Comsewogue High School', logo: 'images/logo-comsewogue.png' },
        { id: '1204907329', quote: 'It helps everyone understand where a student is supposed to be.', name: 'Jamal Walcott', role: 'Principal \u00b7 Bayport-Blue Point HS', logo: 'images/logo-bayport.png' },
        { id: '1204907328', quote: 'It cuts attendance from two minutes to ten seconds.', name: 'Justin Schwartz', role: 'Science Teacher \u00b7 JFK Middle School', logo: 'images/logo-comsewogue.png' },
        { id: '1204907330', quote: 'My frequent fliers list is literally my home screen.', name: "Ra'Ven Pritchard", role: 'Assistant Principal \u00b7 Comsewogue HS', logo: 'images/logo-comsewogue.png' }
    ];
    const n = T.length;
    let idx = 0;
    const poster = function (id) { return 'https://vumbnail.com/' + id + '.jpg'; };
    function fallback(img) { img.onerror = function () { if (!/moov-logo/.test(img.src)) img.src = 'images/moov-logo.png'; }; }
    fallback(avatarEl);
    const player = (cfVideo && window.Vimeo) ? new Vimeo.Player(cfVideo) : null;
    if (player) player.setMuted(true);
    function paintMeta() {
        const t = T[idx];
        quoteEl.textContent = '\u201C' + t.quote + '\u201D';
        nameEl.textContent = t.name;
        whoEl.textContent = t.role;
        avatarEl.src = t.logo;
        prevImg.src = poster(T[(idx - 1 + n) % n].id);
        nextImg.src = poster(T[(idx + 1) % n].id);
    }
    paintMeta();
    function rotate() {
        if (flow) flow.classList.add('rotating');
        setTimeout(function () {
            idx = (idx + 1) % n;
            paintMeta();
            if (player) player.loadVideo(parseInt(T[idx].id, 10)).then(function () { player.setMuted(true); return player.play(); }).catch(function () {});
            if (flow) flow.classList.remove('rotating');
        }, 720);
    }
    setInterval(rotate, 6500);
})();
function revealFeature() {}
window.revealFeature = revealFeature;

// ===== "See it in action" click-to-expand lightbox =====
(function () {
    const lb = document.getElementById('demoLightbox');
    if (!lb) return;
    const lbVideo = lb.querySelector('video');
    const closeBtn = lb.querySelector('.demo-lightbox-close');
    function open(src) {
        lbVideo.src = src;
        lbVideo.load();
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lbVideo.play().catch(function () {});
    }
    function close() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        lbVideo.pause();
        lbVideo.removeAttribute('src');
        lbVideo.load();
    }
    document.querySelectorAll('.inline-demo-media').forEach(function (m) {
        m.addEventListener('click', function () {
            const source = m.querySelector('source');
            const src = source && source.getAttribute('src');
            if (src) open(src);
        });
    });
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
})();

// ===== Floating testimonial videos: click to watch full-size =====
(function () {
    const lb = document.getElementById('vimeoLightbox');
    if (!lb) return;
    const embed = lb.querySelector('.vimeo-embed');
    const closeBtn = lb.querySelector('.demo-lightbox-close');
    function open(vid) {
        embed.innerHTML = '<iframe src="https://player.vimeo.com/video/' + vid +
            '?autoplay=1&title=0&byline=0&portrait=0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen frameborder="0"></iframe>';
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        embed.innerHTML = '';
    }
    window.openVimeoLightbox = open;
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
})();

// ===== Mobile Menu Toggle =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');

// Add CTA button to mobile menu
const ctaLink = document.querySelector('.nav-actions .btn-primary');
if (ctaLink) {
    const mobileCta = ctaLink.cloneNode(true);
    mobileCta.classList.add('mobile-menu-cta');
    navLinks.appendChild(mobileCta);
}

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// ===== Nav Dropdowns (tap to expand on mobile) =====
document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const dd = trigger.closest('.nav-dropdown');
        const wasOpen = dd.classList.contains('open');
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        if (!wasOpen) dd.classList.add('open');
    });
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !mobileToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
});

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('active');
        });

        // Open clicked (if it wasn't already open)
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ===== Scroll Reveal Animations =====
function createObserver() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        '.feature-card, .district-card, .testimonial-card, ' +
        '.stat-item, .showcase-content, .showcase-visual, ' +
        '.section-header, .step-card, .faq-item'
    );

    animateElements.forEach(el => {
        el.classList.add('fade-up');
        observer.observe(el);
    });
}

// ===== Stagger Animation Delays =====
function addStaggerDelays() {
    const groups = [
        '.features-grid .feature-card',
        '.district-grid .district-card',
        '.testimonials-grid .testimonial-card',
        '.stats-grid .stat-item',
        '.faq-list .faq-item'
    ];

    groups.forEach(selector => {
        const items = document.querySelectorAll(selector);
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 100}ms`;
        });
    });
}

// ===== Smooth Scroll for Nav Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
            document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        }
    });
});

// ===== Counter Animation for Stats =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const match = text.match(/(\d+)/);
                if (match) {
                    const target = parseInt(match[0]);
                    const idx = text.indexOf(match[0]);
                    const prefix = text.substring(0, idx);
                    const suffix = text.substring(idx + match[0].length);
                    let current = 0;
                    const increment = target / 40;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = prefix + Math.floor(current) + suffix;
                    }, 30);
                }
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ===== Attendance Row Animation =====
function animateAttendanceRows() {
    const rows = document.querySelectorAll('.attendance-row');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-10px)';
        row.style.transition = 'all 0.4s ease';

        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, 1500 + (index * 400));
    });
}

// ===== Parallax for Hero Orbs =====
function initParallax() {
    const orbs = document.querySelectorAll('.hero-orb');

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 15;
            orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
}

// ===== Theme Toggle =====
function initThemeToggle() {
    // Dark mode removed — site is always light.
    document.documentElement.setAttribute('data-theme', 'light');
}

// ===== Video Preview =====
function initVideoPreview() {
    const preview = document.getElementById('videoPreview');
    if (!preview) return;

    const overlay = preview.querySelector('.video-preview-overlay');
    const iframe = document.getElementById('videoIframe');

    function playVideo() {
        iframe.src = 'https://player.vimeo.com/video/1095601750?autoplay=1&title=0&byline=0&portrait=0';
        preview.classList.add('playing');
    }

    overlay.addEventListener('click', playVideo);

    const watchDemoBtn = document.getElementById('watchDemoBtn');
    if (watchDemoBtn) {
        watchDemoBtn.addEventListener('click', () => {
            preview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(playVideo, 600);
        });
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    createObserver();
    addStaggerDelays();
    animateCounters();
    animateAttendanceRows();
    initParallax();
    initVideoPreview();
});
