(function () {
    'use strict';

    var THEME_KEY = 'portfolio-theme';
    var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ----- Theme toggle -----
    function getStoredTheme() {
        try {
            return localStorage.getItem(THEME_KEY) || 'dark';
        } catch (e) {
            return 'dark';
        }
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {}
        var toggles = document.querySelectorAll('.theme-toggle');
        toggles.forEach(function (btn) {
            if (btn && btn.textContent !== undefined) btn.textContent = theme === 'light' ? 'Dark' : 'Light';
        });
    }

    function initTheme() {
        var theme = getStoredTheme();
        setTheme(theme);
        document.querySelectorAll('.theme-toggle').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var current = document.documentElement.getAttribute('data-theme');
                setTheme(current === 'light' ? 'dark' : 'light');
            });
        });
    }

    // ----- Mobile nav toggle -----
    function initNavToggle() {
        var nav = document.querySelector('.nav');
        var toggle = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.nav-menu');
        if (!nav || !toggle || !menu) return;

        var menuId = menu.id || 'primary-nav-menu';
        menu.id = menuId;
        toggle.setAttribute('aria-controls', menuId);
        toggle.setAttribute('aria-expanded', 'false');

        var backdrop = document.querySelector('.nav-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.appendChild(backdrop);
        }

        function isMobileNav() {
            return window.matchMedia('(max-width: 768px)').matches;
        }

        function closeMenu() {
            menu.classList.remove('is-open');
            document.body.classList.remove('nav-open');
            if (backdrop) backdrop.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            menu.classList.add('is-open');
            document.body.classList.add('nav-open');
            if (backdrop) backdrop.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');
        }

        function syncMenuParent() {
            if (isMobileNav()) {
                if (menu.parentNode !== document.body) {
                    document.body.appendChild(menu);
                    menu.classList.add('nav-menu--body');
                }
            } else {
                menu.classList.remove('nav-menu--body');
                if (menu.parentNode === document.body) {
                    nav.appendChild(menu);
                }
                closeMenu();
            }
        }

        syncMenuParent();
        window.addEventListener('resize', function () {
            syncMenuParent();
        });

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!isMobileNav()) return;
            if (menu.classList.contains('is-open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        backdrop.addEventListener('click', function () {
            closeMenu();
        });

        document.addEventListener('click', function (e) {
            if (!isMobileNav() || !menu.classList.contains('is-open')) return;
            if (menu.contains(e.target) || toggle.contains(e.target)) return;
            closeMenu();
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMobileNav()) closeMenu();
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // ----- Footer year -----
    function setFooterYear() {
        var el = document.getElementById('year');
        if (el) el.textContent = new Date().getFullYear();
    }

    // ----- Contact form validation -----
    function showError(inputId, errorId, message) {
        var input = document.getElementById(inputId);
        var errorEl = document.getElementById(errorId);
        if (input) input.classList.add('invalid');
        if (errorEl) errorEl.textContent = message;
    }

    function clearError(inputId, errorId) {
        var input = document.getElementById(inputId);
        var errorEl = document.getElementById(errorId);
        if (input) input.classList.remove('invalid');
        if (errorEl) errorEl.textContent = '';
    }

    function validateContactForm() {
        var name = document.getElementById('name');
        var email = document.getElementById('email');
        var message = document.getElementById('message');
        var form = document.getElementById('contact-form');
        if (!form) return;

        function validateName() {
            var val = name && name.value ? name.value.trim() : '';
            if (val.length === 0) {
                showError('name', 'name-error', 'Name is required.');
                return false;
            }
            clearError('name', 'name-error');
            return true;
        }

        function validateEmail() {
            var val = email && email.value ? email.value.trim() : '';
            if (val.length === 0) {
                showError('email', 'email-error', 'Email is required.');
                return false;
            }
            if (!EMAIL_REGEX.test(val)) {
                showError('email', 'email-error', 'Please enter a valid email address.');
                return false;
            }
            clearError('email', 'email-error');
            return true;
        }

        function validateMessage() {
            var val = message && message.value ? message.value.trim() : '';
            if (val.length === 0) {
                showError('message', 'message-error', 'Message is required.');
                return false;
            }
            clearError('message', 'message-error');
            return true;
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var okName = validateName();
            var okEmail = validateEmail();
            var okMessage = validateMessage();
            if (okName && okEmail && okMessage) {
                var successEl = document.getElementById('form-success');
                if (successEl) {
                    successEl.classList.add('visible');
                    successEl.setAttribute('aria-live', 'polite');
                    setTimeout(function () {
                        successEl.classList.remove('visible');
                    }, 5000);
                } else {
                    alert('Thank you! Your message has been sent. (This is a demo — no server is configured.)');
                }
                form.reset();
                clearError('name', 'name-error');
                clearError('email', 'email-error');
                clearError('message', 'message-error');
                if (name) name.classList.remove('invalid');
                if (email) email.classList.remove('invalid');
                if (message) message.classList.remove('invalid');
            }
        });

        if (name) name.addEventListener('blur', validateName);
        if (email) email.addEventListener('blur', validateEmail);
        if (message) message.addEventListener('blur', validateMessage);
    }

    // ----- Skill bar animation -----
    function initSkillBars() {
        var bars = document.querySelectorAll('.skill-fill');
        if (!bars.length) return;

        function animateBars() {
            bars.forEach(function (bar) {
                var pct = bar.getAttribute('data-pct');
                if (pct !== null) bar.style.setProperty('--fill-width', pct + '%');
                bar.classList.add('animated');
            });
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateBars();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.2, rootMargin: '0px' });

        var first = bars[0];
        if (first && first.parentElement) observer.observe(first.parentElement);
    }

    // ----- Scroll reveal -----
    function initScrollReveal() {
        var elements = document.querySelectorAll('.reveal');
        if (!elements.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(function (el) {
            observer.observe(el);
        });
    }

    // ----- Button ripple -----
    function createRipple(e, btn) {
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        btn.appendChild(ripple);
        setTimeout(function () {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 500);
    }

    function initRipples() {
        document.querySelectorAll('.btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                createRipple(e, this);
            });
        });
    }

    // ----- Scroll to top -----
    function initScrollTop() {
        var btn = document.querySelector('.scroll-top');
        if (!btn) return;
        function updateVisibility() {
            if (window.scrollY > 200) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }
        window.addEventListener('scroll', updateVisibility, { passive: true });
        updateVisibility();
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ----- Page load animation & loading screen (first visit only) -----
    function initPageLoad() {
        var alreadyShown = sessionStorage.getItem('loaderShown');
        function hideLoader() {
            document.body.classList.add('page-loaded');
        }
        if (alreadyShown) {
            document.documentElement.classList.add('loader-already-shown');
            hideLoader();
            return;
        }
        var minLoaderTime = 600;
        var start = Date.now();
        function hideLoaderFirstTime() {
            sessionStorage.setItem('loaderShown', '1');
            hideLoader();
        }
        var elapsed = Date.now() - start;
        if (elapsed >= minLoaderTime) {
            hideLoaderFirstTime();
        } else {
            setTimeout(hideLoaderFirstTime, minLoaderTime - elapsed);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPageLoad);
    } else {
        initPageLoad();
    }

    // ----- Hero role typewriter -----
    function initHeroRoleRotator() {
        var el = document.getElementById('hero-role-text');
        if (!el) return;

        var roles = [
            'AI & IOT Systems Dev',
            'ML & Embedded Enthusiast',
            'Full-Stack Dev',
            'Visual Storyteller',
        ];

        var index = 0;
        var typeSpeed = 90;
        var deleteSpeed = 50;
        var pauseAtEnd = 1800;
        var pauseAtStart = 600;

        function typeWriter() {
            var fullText = roles[index];
            var i = 0;

            function type() {
                if (i < fullText.length) {
                    el.textContent += fullText.charAt(i);
                    i++;
                    setTimeout(type, typeSpeed);
                } else {
                    setTimeout(deleteText, pauseAtEnd);
                }
            }

            function deleteText() {
                var current = el.textContent;
                if (current.length > 0) {
                    el.textContent = current.slice(0, -1);
                    setTimeout(deleteText, deleteSpeed);
                } else {
                    index = (index + 1) % roles.length;
                    setTimeout(typeWriter, pauseAtStart);
                }
            }

            type();
        }

        setTimeout(typeWriter, 1200);
    }

    // ----- Run all -----
    initTheme();
    initNavToggle();
    setFooterYear();
    validateContactForm();
    initSkillBars();
    initScrollReveal();
    initRipples();
    initScrollTop();
    initHeroRoleRotator();
})();
