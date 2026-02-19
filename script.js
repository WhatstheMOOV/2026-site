// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu Toggle =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
const navActions = document.querySelector('.nav-actions');

mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navActions.classList.toggle('active');
    mobileToggle.classList.toggle('active');
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
            navActions.classList.remove('active');
            mobileToggle.classList.remove('active');
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
                    const suffix = text.replace(match[0], '');
                    let current = 0;
                    const increment = target / 40;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current) + suffix;
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
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const saved = localStorage.getItem('theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });
}

// ===== Video Preview =====
function initVideoPreview() {
    const preview = document.getElementById('videoPreview');
    if (!preview) return;

    const overlay = preview.querySelector('.video-preview-overlay');
    const iframe = document.getElementById('videoIframe');

    overlay.addEventListener('click', () => {
        iframe.src = 'https://player.vimeo.com/video/1095601750?autoplay=1&title=0&byline=0&portrait=0';
        preview.classList.add('playing');
    });
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
