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

const leadForm = document.getElementById('leadForm');
const formStatus = document.getElementById('formStatus');
const formFields = Array.from(document.querySelectorAll('#leadForm input[type="text"], #leadForm input[type="tel"], #leadForm input[type="email"]'));
const agreeField = leadForm?.querySelector('input[name="agree"]');
const agreeLine = agreeField?.closest('.check-line');

function showFormStatus(message, color) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.style.color = color;
  formStatus.classList.add('is-visible');
}

function clearInvalidState() {
  formFields.forEach((field) => field.classList.remove('is-invalid'));
  agreeLine?.classList.remove('is-invalid');
  leadForm?.classList.remove('is-success');
}

formFields.forEach((field) => {
  field.classList.add('form-field');
  field.addEventListener('input', () => field.classList.remove('is-invalid'));
});

agreeField?.addEventListener('change', () => {
  agreeLine?.classList.remove('is-invalid');
});

leadForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(leadForm);

  const name = normalize(data.get('name'));
  const phone = normalize(data.get('phone'));
  const email = normalize(data.get('email'));
  const agree = data.get('agree');
  const invalidFields = [];

  clearInvalidState();

  if (!name) invalidFields.push(leadForm.elements.name);
  if (!phone) invalidFields.push(leadForm.elements.phone);
  if (!email) invalidFields.push(leadForm.elements.email);

  if (!name || !phone || !email || !agree) {
    invalidFields.forEach((field) => field?.classList.add('form-field', 'is-invalid'));
    if (!agree) {
      agreeLine?.classList.add('is-invalid');
    }
    if (!prefersReducedMotion) {
      leadForm.classList.remove('is-shaking');
      void leadForm.offsetWidth;
      leadForm.classList.add('is-shaking');
    }
    showFormStatus('Заполните все поля и подтвердите согласие.', '#c73636');
    return;
  }

  leadForm.classList.add('is-success');
  showFormStatus('Заявка отправлена. Мы свяжемся с вами.', '#1b9647');
  leadForm.reset();
});

leadForm?.addEventListener('animationend', (e) => {
  if (e.animationName === 'formShake') {
    leadForm.classList.remove('is-shaking');
  }
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
