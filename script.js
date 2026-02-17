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

    // Select all elements that should animate in
    const animateElements = document.querySelectorAll(
        '.feature-card, .district-card, .testimonial-card, .pricing-card, ' +
        '.security-badge-card, .stat-item, .showcase-content, .showcase-visual, ' +
        '.raina-content, .raina-visual, .security-content, .security-badges, ' +
        '.section-header'
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
        '.pricing-grid .pricing-card',
        '.security-badges .security-badge-card',
        '.stats-grid .stat-item'
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

// ===== Typing Effect for Mockup =====
function initTypingEffect() {
    const fields = document.querySelectorAll('.input-field');
    fields.forEach((field, index) => {
        const text = field.textContent;
        field.textContent = '';
        field.style.borderColor = 'var(--purple-300)';

        setTimeout(() => {
            let charIndex = 0;
            const typeTimer = setInterval(() => {
                if (charIndex < text.length) {
                    field.textContent += text[charIndex];
                    charIndex++;
                } else {
                    clearInterval(typeTimer);
                    field.style.borderColor = '';
                }
            }, 50);
        }, 1500 + (index * 800));
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

// ===== Initialize on DOM Load =====
document.addEventListener('DOMContentLoaded', () => {
    createObserver();
    addStaggerDelays();
    animateCounters();
    initTypingEffect();
    initParallax();
});
