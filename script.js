/* ════════════════════════════════════════════════════════════════
   Studio — js/script.js
   All JavaScript for the portfolio website
   ════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. SMOOTH SCROLL ─────────────────────────────────────────
     Intercept all internal anchor clicks and scroll smoothly,
     offset by nav height so sections aren't hidden behind the bar.
  ─────────────────────────────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var navH = document.getElementById('site-nav').offsetHeight;
        var top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ── 2. NAV — scroll shadow + mobile menu ─────────────────────
     • Adds .scrolled class when page is scrolled past 24px
     • Highlights the active section link while scrolling
     • Toggles the mobile hamburger menu
  ─────────────────────────────────────────────────────────────── */
  function initNav() {
    var nav       = document.getElementById('site-nav');
    var toggle    = document.getElementById('nav-toggle');
    var mobileMenu= document.getElementById('nav-mobile');
    var links     = document.querySelectorAll('.nav__link:not(.nav__link--cta)');
    var sections  = [];

    // Collect target sections from nav links
    links.forEach(function (link) {
      var id  = link.getAttribute('href').replace('#', '');
      var sec = document.getElementById(id);
      if (sec) sections.push({ link: link, section: sec });
    });

    // Scroll handler
    function onScroll() {
      var scrollY = window.scrollY;
      var navH    = nav.offsetHeight;

      // Shadow
      nav.classList.toggle('scrolled', scrollY > 24);

      // Active link highlight
      var current = '';
      sections.forEach(function (item) {
        if (item.section.offsetTop - navH - 80 <= scrollY) {
          current = item.link.getAttribute('href');
        }
      });
      links.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === current);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // Mobile menu
    if (toggle && mobileMenu) {
      toggle.addEventListener('click', function () {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        mobileMenu.classList.toggle('open', !expanded);
        mobileMenu.setAttribute('aria-hidden', String(expanded));
      });

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.setAttribute('aria-expanded', 'false');
          mobileMenu.classList.remove('open');
          mobileMenu.setAttribute('aria-hidden', 'true');
        });
      });

      // Close on outside click
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && mobileMenu.classList.contains('open')) {
          toggle.setAttribute('aria-expanded', 'false');
          mobileMenu.classList.remove('open');
          mobileMenu.setAttribute('aria-hidden', 'true');
        }
      });
    }
  }

  /* ── 3. SCROLL REVEAL ─────────────────────────────────────────
     Adds .visible to .reveal / .reveal-left / .reveal-right
     elements as they enter the viewport. Staggered delay is
     applied per sibling index inside a grid/list.
  ─────────────────────────────────────────────────────────────── */
  function initReveal() {
    var elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if (!elements.length) return;

    // Apply stagger delays to siblings inside a grid container
    var grids = document.querySelectorAll(
      '.services__grid, .portfolio__grid, .why__cards, .process__track'
    );
    grids.forEach(function (grid) {
      var children = grid.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 0.1) + 's';
      });
    });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

      elements.forEach(function (el) { io.observe(el); });
    } else {
      // Fallback: show everything immediately
      elements.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ── 4. PROCESS TRACK FILL ────────────────────────────────────
     Animates the horizontal connecting line in the Process section
     once the timeline scrolls into view.
  ─────────────────────────────────────────────────────────────── */
  function initProcessTrack() {
    var fill = document.getElementById('track-fill');
    if (!fill) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          fill.classList.add('filled');
          io.disconnect();
        }
      }, { threshold: 0.4 });
      io.observe(fill.parentElement);
    } else {
      fill.classList.add('filled');
    }
  }

  /* ── 5. PORTFOLIO FILTER ──────────────────────────────────────
     Filters project cards by data-category attribute.
     Uses a fade + scale animation for show/hide.
  ─────────────────────────────────────────────────────────────── */
  function initPortfolioFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    var cards   = document.querySelectorAll('.p-card[data-category]');

    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Update active button
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter') || 'all';

        cards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          var show     = filter === 'all' || category === filter;

          if (show) {
            card.style.display = '';
            // Trigger reflow so transition fires
            card.offsetHeight; // eslint-disable-line no-unused-expressions
            card.style.opacity  = '';
            card.style.scale    = '';
          } else {
            card.style.opacity = '0';
            card.style.scale   = '0.96';
            // Hide after transition
            card.addEventListener('transitionend', function handler() {
              if (card.style.opacity === '0') card.style.display = 'none';
              card.removeEventListener('transitionend', handler);
            });
          }
        });
      });
    });
  }

  /* ── 6. CONTACT FORM VALIDATION ──────────────────────────────
     Validates required fields on submit, shows inline errors,
     then shows a success state.
  ─────────────────────────────────────────────────────────────── */
  function initContactForm() {
    var form    = document.getElementById('contact-form');
    var success = document.getElementById('form-success');
    if (!form) return;

    function showError(inputEl, errorId) {
      var err = document.getElementById(errorId);
      inputEl.classList.add('error');
      if (err) err.classList.add('visible');
    }

    function clearError(inputEl, errorId) {
      var err = document.getElementById(errorId);
      inputEl.classList.remove('error');
      if (err) err.classList.remove('visible');
    }

    // Real-time clear on typing
    var nameInput  = document.getElementById('name');
    var phoneInput = document.getElementById('phone');
    var phoneWrap  = document.getElementById('phone-wrap');

    if (nameInput) {
      nameInput.addEventListener('input', function () {
        clearError(nameInput, 'name-error');
      });
    }
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        if (phoneWrap) phoneWrap.classList.remove('error');
        clearError(phoneInput, 'phone-error');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      // Name
      if (nameInput && nameInput.value.trim().length < 2) {
        showError(nameInput, 'name-error');
        valid = false;
      } else if (nameInput) {
        clearError(nameInput, 'name-error');
      }

      // Phone — basic: at least 7 digits
      if (phoneInput) {
        var digits = phoneInput.value.replace(/\D/g, '');
        if (digits.length < 7) {
          if (phoneWrap) phoneWrap.classList.add('error');
          var phoneErr = document.getElementById('phone-error');
          if (phoneErr) phoneErr.classList.add('visible');
          valid = false;
        } else {
          if (phoneWrap) phoneWrap.classList.remove('error');
          var phoneErrEl = document.getElementById('phone-error');
          if (phoneErrEl) phoneErrEl.classList.remove('visible');
        }
      }

      if (!valid) return;

      // Simulate submission
      var submitBtn  = document.getElementById('form-submit');
      var submitText = submitBtn && submitBtn.querySelector('.submit-text');
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitText) submitText.textContent = 'Sending…';
      }

      setTimeout(function () {
        form.style.display = 'none';
        if (success) success.classList.add('visible');
      }, 900);
    });
  }

  /* ── 7. FOOTER YEAR ───────────────────────────────────────────
     Inserts the current year into the copyright line.
  ─────────────────────────────────────────────────────────────── */
  function initFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── 8. CARD TILT (subtle, desktop only) ──────────────────────
     Applies a very gentle 3D perspective tilt to portfolio cards
     on mouse move — adds premium feel without being distracting.
  ─────────────────────────────────────────────────────────────── */
  function initCardTilt() {
    // Only on pointer-capable devices
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var cards = document.querySelectorAll('.p-card, .service-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect   = card.getBoundingClientRect();
        var x      = e.clientX - rect.left;
        var y      = e.clientY - rect.top;
        var cx     = rect.width  / 2;
        var cy     = rect.height / 2;
        var rotX   = ((y - cy) / cy) * -4;  // max ±4deg
        var rotY   = ((x - cx) / cx) *  4;

        card.style.transform =
          'translateY(-6px) perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform .5s var(--ease-expo), box-shadow .45s, border-color .25s';
      });

      card.addEventListener('mouseenter', function () {
        // Faster response on enter
        card.style.transition = 'transform .1s, box-shadow .45s, border-color .25s';
      });
    });
  }

  /* ── 9. CTA SECTION ENTRANCE ──────────────────────────────────
     The dark CTA card uses a slightly different reveal animation
     (scale + fade) for extra impact.
  ─────────────────────────────────────────────────────────────── */
  function initCtaEntrance() {
    var card = document.getElementById('cta-card');
    if (!card) return;

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          card.classList.add('visible');
          io.disconnect();
        }
      }, { threshold: 0.15 });
      io.observe(card);
    } else {
      card.classList.add('visible');
    }
  }

  /* ── 10. SCROLL PROGRESS BAR ──────────────────────────────────
     Thin accent-coloured progress bar at the very top of the page
     showing how far the user has scrolled.
  ─────────────────────────────────────────────────────────────── */
  function initScrollProgress() {
    var bar = document.createElement('div');
    bar.id  = 'scroll-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Page scroll progress');
    bar.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'height:2px',
      'width:0%',
      'background:var(--accent)',
      'z-index:200',
      'transition:width .1s linear',
      'pointer-events:none'
    ].join(';');

    document.body.prepend(bar);

    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      var total    = document.documentElement.scrollHeight - window.innerHeight;
      var pct      = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
    }, { passive: true });
  }

  /* ── 11. BACK TO TOP BUTTON ───────────────────────────────────
     Appears after scrolling past the fold; smooth-scrolls to top.
  ─────────────────────────────────────────────────────────────── */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.id  = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.style.cssText = [
      'position:fixed',
      'bottom:1.75rem',
      'right:1.75rem',
      'z-index:90',
      'width:40px',
      'height:40px',
      'border-radius:50%',
      'background:var(--ink)',
      'color:#fff',
      'border:none',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'box-shadow:0 4px 16px rgba(0,0,0,.18)',
      'opacity:0',
      'translate:0 8px',
      'transition:opacity .3s,translate .3s,background .2s,transform .2s',
      'pointer-events:none'
    ].join(';');

    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      var show = window.scrollY > window.innerHeight * 0.6;
      btn.style.opacity       = show ? '1' : '0';
      btn.style.translate      = show ? '0 0' : '0 8px';
      btn.style.pointerEvents  = show ? 'auto' : 'none';
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btn.addEventListener('mouseenter', function () {
      btn.style.background = 'var(--accent)';
      btn.style.transform  = 'scale(1.1)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.background = 'var(--ink)';
      btn.style.transform  = 'scale(1)';
    });
  }

  /* ── 12. INIT ─────────────────────────────────────────────────
     Run everything once the DOM is ready.
  ─────────────────────────────────────────────────────────────── */
  function init() {
    initScrollProgress();
    initSmoothScroll();
    initNav();
    initReveal();
    initProcessTrack();
    initPortfolioFilter();
    initContactForm();
    initFooterYear();
    initCardTilt();
    initCtaEntrance();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
