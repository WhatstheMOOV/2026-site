// ===== MOOV Blog scripts =====

// Theme (shared key with main site)
(function () {
    var saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.addEventListener('DOMContentLoaded', function () {
        var toggle = document.getElementById('themeToggle');
        if (!toggle) return;
        toggle.addEventListener('click', function () {
            var cur = document.documentElement.getAttribute('data-theme');
            var next = cur === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
        });
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    // Navbar scroll
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });
    }

    // Mobile menu
    var mobileToggle = document.getElementById('mobileToggle');
    var navLinks = document.getElementById('navLinks');
    if (mobileToggle && navLinks) {
        var ctaLink = document.querySelector('.nav-actions .btn-primary');
        if (ctaLink) {
            var mobileCta = ctaLink.cloneNode(true);
            mobileCta.classList.add('mobile-menu-cta');
            navLinks.appendChild(mobileCta);
        }
        mobileToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // Dropdowns
    document.querySelectorAll('.nav-dropdown-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            var dd = trigger.closest('.nav-dropdown');
            var wasOpen = dd.classList.contains('open');
            document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.classList.remove('open'); });
            if (!wasOpen) dd.classList.add('open');
        });
    });
    document.addEventListener('click', function (e) {
        if (navLinks && navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
        if (!e.target.closest('.nav-dropdown')) {
            document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.classList.remove('open'); });
        }
    });

    // Category filter (index page)
    var chips = document.querySelectorAll('.blog-chip');
    if (chips.length) {
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.classList.remove('active'); });
                chip.classList.add('active');
                var cat = chip.getAttribute('data-cat');
                var feat = document.querySelector('.blog-featured');
                if (feat) {
                    var fcats = (feat.getAttribute('data-cat') || '').split('|');
                    feat.style.display = (cat === 'all' || fcats.indexOf(cat) !== -1) ? '' : 'none';
                }
                document.querySelectorAll('.blog-card[data-cat]').forEach(function (card) {
                    var cats = (card.getAttribute('data-cat') || '').split('|');
                    var show = cat === 'all' || cats.indexOf(cat) !== -1;
                    card.style.display = show ? '' : 'none';
                });
            });
        });
    }
});
