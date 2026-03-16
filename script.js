const scrollButtons = document.querySelectorAll('[data-scroll]');
scrollButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

const levelTabs = document.getElementById('levelTabs');
const formatBtn = document.getElementById('formatBtn');
const formatMenu = document.getElementById('formatMenu');
const programSearch = document.getElementById('programSearch');
const cards = Array.from(document.querySelectorAll('#programGrid > article'));
const linkedCards = Array.from(document.querySelectorAll('.program-card[data-href]'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let activeLevel = 'all';
let activeFormat = 'all';

function normalize(s) {
  return (s || '').toLowerCase().trim();
}

function getCardVisibility(card) {
  const term = normalize(programSearch?.value);
  const level = card.dataset.level;
  const format = card.dataset.format;
  const name = normalize(card.dataset.name);

  const levelOk = activeLevel === 'all' || level === activeLevel;
  const formatOk = activeFormat === 'all' || format === activeFormat;
  const termOk = !term || name.includes(term);

  return levelOk && formatOk && termOk;
}

function animateProgramGrid() {
  if (!cards.length) return;

  const nextVisibility = new Map(cards.map((card) => [card, getCardVisibility(card)]));

  if (prefersReducedMotion) {
    cards.forEach((card) => {
      const isVisible = nextVisibility.get(card);
      card.classList.toggle('is-hidden', !isVisible);
      card.hidden = !isVisible;
      card.setAttribute('aria-hidden', String(!isVisible));
    });
    return;
  }

  const firstRects = new Map();
  cards.forEach((card) => {
    if (!card.hidden) {
      firstRects.set(card, card.getBoundingClientRect());
    }
  });

  cards.forEach((card) => {
    card.classList.add('is-filtering');
    const isVisible = nextVisibility.get(card);
    if (isVisible) {
      card.hidden = false;
      card.classList.remove('is-hidden');
      card.setAttribute('aria-hidden', 'false');
    } else {
      card.classList.add('is-hidden');
      card.setAttribute('aria-hidden', 'true');
    }
  });

  requestAnimationFrame(() => {
    const animations = [];

    cards.forEach((card) => {
      const isVisible = nextVisibility.get(card);
      const firstRect = firstRects.get(card);

      if (isVisible) {
        const lastRect = card.getBoundingClientRect();

        if (firstRect) {
          const deltaX = firstRect.left - lastRect.left;
          const deltaY = firstRect.top - lastRect.top;
          if (deltaX || deltaY) {
            card.animate(
              [
                { transform: `translate(${deltaX}px, ${deltaY}px)` },
                { transform: 'translate(0, 0)' },
              ],
              {
                duration: 420,
                easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
              },
            );
          }
        } else {
          animations.push(
            card.animate(
              [
                { opacity: 0, transform: 'scale(0.94) translateY(18px)', filter: 'blur(6px)' },
                { opacity: 1, transform: 'scale(1) translateY(0)', filter: 'blur(0)' },
              ],
              {
                duration: 320,
                easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                fill: 'both',
              },
            ),
          );
        }
      }
    });

    window.setTimeout(() => {
      cards.forEach((card) => {
        const isVisible = nextVisibility.get(card);
        if (!isVisible) {
          card.hidden = true;
        }
        card.classList.remove('is-filtering');
      });
    }, 240);

    animations.forEach((animation) => {
      animation.onfinish = () => {};
    });
  });
}

function filterPrograms() {
  const term = normalize(programSearch.value);

  cards.forEach((card) => {
    const level = card.dataset.level;
    const format = card.dataset.format;
    const name = normalize(card.dataset.name);

    const levelOk = activeLevel === 'all' || level === activeLevel;
    const formatOk = activeFormat === 'all' || format === activeFormat;
    const termOk = !term || name.includes(term);

    card.hidden = !(levelOk && formatOk && termOk);
  });
}

function openLinkedCard(card) {
  const href = card?.dataset?.href;
  if (href) {
    window.location.assign(href);
  }
}

linkedCards.forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input, label')) return;
    openLinkedCard(card);
  });

  card.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openLinkedCard(card);
  });
});

levelTabs?.addEventListener('click', (e) => {
  const target = e.target.closest('.tab');
  if (!target) return;

  levelTabs.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('is-active'));
  target.classList.add('is-active');
  activeLevel = target.dataset.level;
  animateProgramGrid();
});

formatBtn?.addEventListener('click', () => {
  formatMenu.classList.toggle('is-open');
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.format-filter')) {
    formatMenu?.classList.remove('is-open');
  }
});

formatMenu?.addEventListener('click', (e) => {
  const target = e.target.closest('.format-option');
  if (!target) return;

  formatMenu.querySelectorAll('.format-option').forEach((item) => item.classList.remove('is-active'));
  target.classList.add('is-active');
  activeFormat = target.dataset.format;
  formatMenu.classList.remove('is-open');
  animateProgramGrid();
});

programSearch?.addEventListener('input', animateProgramGrid);

const reviewToggle = document.getElementById('reviewsToggle');
const reviewsGrid = document.getElementById('reviewsGrid');
reviewToggle?.addEventListener('click', () => {
  if (reviewsGrid.classList.contains('show-all')) return;
  reviewsGrid.classList.add('show-all');
  const extraCards = Array.from(reviewsGrid.querySelectorAll('.review-card.is-extra'));
  extraCards.forEach((card, index) => {
    card.style.display = 'block';
    if (prefersReducedMotion) return;

    card.animate(
      [
        { opacity: 0, transform: 'translateY(24px) scale(0.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ],
      {
        duration: 380,
        delay: index * 90,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        fill: 'both',
      },
    );
  });
  reviewToggle.textContent = 'Показано всё';
  reviewToggle.disabled = true;
});

const faqList = document.getElementById('faqList');
faqList?.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const item = btn.closest('.faq-item');
  const alreadyOpen = item.classList.contains('is-open');

  faqList.querySelectorAll('.faq-item').forEach((node) => node.classList.remove('is-open'));
  if (!alreadyOpen) item.classList.add('is-open');
});

const leadForms = Array.from(document.querySelectorAll('[data-lead-form]'));

function getFormStatusNode(form) {
  return form.querySelector('.form-status');
}

function showFormStatus(form, message, color) {
  const statusNode = getFormStatusNode(form);
  if (!statusNode) return;
  statusNode.textContent = message;
  statusNode.style.color = color;
  statusNode.classList.add('is-visible');
}

function clearFormStatus(form) {
  const statusNode = getFormStatusNode(form);
  if (!statusNode) return;
  statusNode.textContent = '';
  statusNode.classList.remove('is-visible');
}

function clearInvalidState(form, fields, agreeLineNode) {
  fields.forEach((field) => field.classList.remove('is-invalid'));
  agreeLineNode?.classList.remove('is-invalid');
  form.classList.remove('is-success');
}

function showFormSuccess(form) {
  const title = form.dataset.successTitle || 'Заявка отправлена';
  const message = form.dataset.successMessage || 'Мы получили вашу заявку и скоро свяжемся с вами.';

  form.innerHTML = `
    <div class="form-success" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}

leadForms.forEach((form) => {
  const formMode = form.dataset.formMode || 'all';
  const successMode = form.dataset.successMode || 'status';
  const fields = Array.from(form.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]'));
  const nameField = form.querySelector('input[name="name"]');
  const phoneField = form.querySelector('input[name="phone"]');
  const emailField = form.querySelector('input[name="email"]');
  const agreeFieldNode = form.querySelector('input[name="agree"]');
  const agreeLineNode = agreeFieldNode?.closest('.check-line');

  fields.forEach((field) => {
    field.classList.add('form-field');
    field.addEventListener('input', () => {
      field.classList.remove('is-invalid');
      clearFormStatus(form);
    });
  });

  agreeFieldNode?.addEventListener('change', () => {
    agreeLineNode?.classList.remove('is-invalid');
    clearFormStatus(form);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = normalize(nameField?.value);
    const phone = normalize(phoneField?.value);
    const email = normalize(emailField?.value);
    const agree = Boolean(agreeFieldNode?.checked);
    const invalidFields = [];
    const requiresOneContact = formMode === 'contact-one';
    const hasOneContact = Boolean(phone || email);

    clearInvalidState(form, fields, agreeLineNode);

    if (!name) {
      invalidFields.push(nameField);
    }

    if (requiresOneContact) {
      if (!hasOneContact) {
        invalidFields.push(phoneField, emailField);
      }
    } else {
      if (!phone) invalidFields.push(phoneField);
      if (!email) invalidFields.push(emailField);
    }

    if (!name || !agree || (requiresOneContact ? !hasOneContact : !phone || !email)) {
      invalidFields.forEach((field) => field?.classList.add('form-field', 'is-invalid'));
      if (!agree) {
        agreeLineNode?.classList.add('is-invalid');
      }
      if (!prefersReducedMotion) {
        form.classList.remove('is-shaking');
        void form.offsetWidth;
        form.classList.add('is-shaking');
      }
      showFormStatus(
        form,
        requiresOneContact
          ? 'Укажите имя, телефон или электронную почту и подтвердите согласие.'
          : 'Заполните все поля и подтвердите согласие.',
        '#c73636',
      );
      return;
    }

    if (successMode === 'replace') {
      showFormSuccess(form);
      return;
    }

    form.classList.add('is-success');
    form.reset();
    showFormStatus(form, 'Заявка отправлена. Мы свяжемся с вами.', '#1b9647');
  });

  form.addEventListener('animationend', (e) => {
    if (e.animationName === 'formShake') {
      form.classList.remove('is-shaking');
    }
  });
});

const topbar = document.querySelector('.topbar');
const heroInner = document.querySelector('.hero-inner');

if (topbar && heroInner) {
  const STICKY_OFFSET = 56;
  const stickySentinel = document.createElement('span');
  stickySentinel.setAttribute('aria-hidden', 'true');
  Object.assign(stickySentinel.style, {
    position: 'absolute',
    top: `${STICKY_OFFSET}px`,
    left: '0',
    width: '1px',
    height: '1px',
    pointerEvents: 'none',
  });
  heroInner.prepend(stickySentinel);

  if ('IntersectionObserver' in window) {
    const stickyObserver = new IntersectionObserver(
      ([entry]) => {
        const shouldBeSticky = !entry.isIntersecting;
        topbar.classList.toggle('topbar--sticky', shouldBeSticky);
      },
      {
        threshold: 0,
      },
    );

    stickyObserver.observe(stickySentinel);
  } else {
    function updateTopbarStickyFallback() {
      const shouldBeSticky = (window.scrollY || window.pageYOffset || 0) > STICKY_OFFSET;
      topbar.classList.toggle('topbar--sticky', shouldBeSticky);
    }

    window.addEventListener('scroll', updateTopbarStickyFallback, { passive: true });
    updateTopbarStickyFallback();
  }
}

const scrollGallerySections = Array.from(document.querySelectorAll('[data-scroll-gallery]'));

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

if (scrollGallerySections.length) {
  const scrollGalleries = scrollGallerySections
    .map((section) => {
      const sticky = section.querySelector('.management-gallery-sticky');
      const viewport = section.querySelector('.management-gallery-viewport');
      const track = section.querySelector('[data-scroll-gallery-track]');

      if (!sticky || !viewport || !track) return null;

      return {
        section,
        sticky,
        viewport,
        track,
        distance: 0,
        start: 0,
        interactive: false,
      };
    })
    .filter(Boolean);

  let scrollGalleryFrame = 0;

  function measureScrollGalleries() {
    scrollGalleries.forEach((gallery) => {
      const stickyTop = Number.parseFloat(window.getComputedStyle(gallery.sticky).top) || 0;
      const canPin = !prefersReducedMotion && window.innerWidth > 960;

      gallery.interactive = canPin;
      gallery.section.style.height = '';
      gallery.track.style.removeProperty('--gallery-offset');

      if (!canPin) {
        gallery.distance = 0;
        gallery.start = 0;
        return;
      }

      const distance = Math.max(gallery.track.scrollWidth - gallery.viewport.clientWidth, 0);
      const stickyHeight = gallery.sticky.offsetHeight;
      const sectionTop = gallery.section.getBoundingClientRect().top + window.scrollY;

      gallery.distance = distance;
      gallery.start = sectionTop - stickyTop;
      gallery.section.style.height = `${Math.ceil(stickyHeight + stickyTop + distance)}px`;
    });

    updateScrollGalleries();
  }

  function updateScrollGalleries() {
    scrollGalleries.forEach((gallery) => {
      if (!gallery.interactive || !gallery.distance) {
        gallery.track.style.setProperty('--gallery-offset', '0px');
        return;
      }

      const progress = clamp((window.scrollY - gallery.start) / gallery.distance, 0, 1);
      const offset = -gallery.distance * progress;
      gallery.track.style.setProperty('--gallery-offset', `${offset}px`);
    });
  }

  function requestScrollGalleryUpdate() {
    if (scrollGalleryFrame) return;
    scrollGalleryFrame = window.requestAnimationFrame(() => {
      scrollGalleryFrame = 0;
      updateScrollGalleries();
    });
  }

  window.addEventListener('scroll', requestScrollGalleryUpdate, { passive: true });
  window.addEventListener('resize', measureScrollGalleries);
  window.addEventListener('load', measureScrollGalleries);
  measureScrollGalleries();
}

const advMotionTargets = Array.from(document.querySelectorAll('.adv-card-icon img, .adv-online-actions img'));

function triggerAdvantageNudge() {
  if (prefersReducedMotion || !advMotionTargets.length) return;
  const target = advMotionTargets[Math.floor(Math.random() * advMotionTargets.length)];
  if (!target || target.classList.contains('is-nudging')) return;

  target.classList.add('is-nudging');
  window.setTimeout(() => target.classList.remove('is-nudging'), 820);
}

if (advMotionTargets.length && !prefersReducedMotion) {
  window.setInterval(triggerAdvantageNudge, 2200);
}

const tiltCards = Array.from(document.querySelectorAll('.adv-card-wide'));
tiltCards.forEach((card) => {
  if (prefersReducedMotion) return;

  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const tiltY = ((px - 0.5) * 8).toFixed(2);
    const tiltX = ((0.5 - py) * 6).toFixed(2);
    card.style.setProperty('--tilt-x', `${tiltX}deg`);
    card.style.setProperty('--tilt-y', `${tiltY}deg`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});
