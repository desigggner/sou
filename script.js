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

let activeLevel = 'all';
let activeFormat = 'all';

function normalize(s) {
  return (s || '').toLowerCase().trim();
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

    card.style.display = levelOk && formatOk && termOk ? '' : 'none';
  });
}

levelTabs?.addEventListener('click', (e) => {
  const target = e.target.closest('.tab');
  if (!target) return;

  levelTabs.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('is-active'));
  target.classList.add('is-active');
  activeLevel = target.dataset.level;
  filterPrograms();
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
  filterPrograms();
});

programSearch?.addEventListener('input', filterPrograms);

const reviewToggle = document.getElementById('reviewsToggle');
const reviewsGrid = document.getElementById('reviewsGrid');
reviewToggle?.addEventListener('click', () => {
  if (reviewsGrid.classList.contains('show-all')) return;
  reviewsGrid.classList.add('show-all');
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

leadForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(leadForm);

  const name = normalize(data.get('name'));
  const phone = normalize(data.get('phone'));
  const email = normalize(data.get('email'));
  const agree = data.get('agree');

  if (!name || !phone || !email || !agree) {
    formStatus.textContent = 'Заполните все поля и подтвердите согласие.';
    formStatus.style.color = '#c73636';
    return;
  }

  formStatus.textContent = 'Заявка отправлена. Мы свяжемся с вами.';
  formStatus.style.color = '#1b9647';
  leadForm.reset();
});

const topbar = document.querySelector('.topbar');

if (topbar) {
  const STICKY_OFFSET = 40;

  function updateTopbarSticky() {
    if (window.scrollY > STICKY_OFFSET) {
      topbar.classList.add('topbar--sticky');
    } else {
      topbar.classList.remove('topbar--sticky');
    }
  }

  window.addEventListener('scroll', updateTopbarSticky);
  updateTopbarSticky();
}
