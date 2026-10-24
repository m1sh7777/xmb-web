'use strict';

const categories = [
  { name: 'Settings', icon: 'settings', items: [
    { label: 'Theme Settings', icon: 'display', text: 'Choose a background colour.', theme: true },
    { label: 'Controls', icon: 'info', text: 'Use left and right to change categories, up and down to select, Enter to open, and Escape to go back. You can also click, tap, or swipe the menu.' },
    { label: 'About this recreation', icon: 'info', text: 'An educational recreation of the PSP XrossMediaBar, made with HTML, CSS and vanilla JavaScript. The interface follows a 480 × 272 reference space.' }
  ] },
  { name: 'Photo', icon: 'photo', items: [
    { label: 'Memory Stick', icon: 'storage', text: 'The original PSP could display photographs from removable storage. This showcase demonstrates the menu only; it does not import or display personal photos.' },
    { label: 'About Photo', icon: 'info', text: 'Photo browsing is part of the full version. This simplified project keeps its focus on interface navigation.' }
  ] },
  { name: 'Music', icon: 'music', items: [
    { label: 'Memory Stick', icon: 'storage', text: 'The original PSP played music from removable storage. This showcase demonstrates the menu only; it does not import or play audio.' },
    { label: 'About Music', icon: 'info', text: 'Music playback is part of the full version. This simplified project keeps its focus on interface navigation.' }
  ] },
  { name: 'Video', icon: 'video', items: [
    { label: 'Memory Stick', icon: 'storage', text: 'The original PSP could play videos from removable storage. This showcase demonstrates the menu only; it does not import or play video.' },
    { label: 'About Video', icon: 'info', text: 'Video playback is part of the full version. This simplified project keeps its focus on interface navigation.' }
  ] },
  { name: 'Game', icon: 'game', items: [
    { label: 'Saved Data Utility', icon: 'storage', text: 'On a PSP, this menu managed game saves. This educational recreation does not load games or store saved data.' },
    { label: 'About Game', icon: 'info', text: 'The Game category is included to recreate the XMB layout. No games or emulation are included.' }
  ] },
  { name: 'Network', icon: 'network', items: [
    { label: 'Internet Browser', icon: 'network', text: 'The PSP included a web browser. This menu is an information screen, not an embedded browser or online service.' },
    { label: 'About Network', icon: 'info', text: 'This showcase runs locally. It has no accounts, backend, analytics or external dependencies.' }
  ] }
];

const iconPaths = {
  settings: '<path d="M5 15h38v26H5zM16 15V8h16v7M5 24h38M14 21v8M34 21v8"/>',
  photo: '<path d="M4 14h11l3-6h12l3 6h11v27H4z"/><circle cx="24" cy="27" r="9"/>',
  music: '<path d="M18 36V10l22-5v26M18 17l22-5"/><ellipse cx="11" cy="37" rx="7" ry="5"/><ellipse cx="33" cy="32" rx="7" ry="5"/>',
  video: '<rect x="4" y="10" width="40" height="29" rx="1"/><path d="M11 10v29M37 10v29M4 18h7M4 30h7M37 18h7M37 30h7"/>',
  game: '<path d="M14 14h20c5 0 9 13 10 20s-4 9-9 1l-3-4H16l-3 4c-5 8-10 6-9-1s5-20 10-20zM11 21v10M6 26h10"/><circle cx="34" cy="22" r="1"/><circle cx="39" cy="27" r="1"/>',
  network: '<circle cx="24" cy="24" r="19"/><ellipse cx="24" cy="24" rx="9" ry="19"/><path d="M5 24h38M9 13h30M9 35h30"/>',
  storage: '<path d="M12 8h24v32H12zM17 8v9h14V8M17 25h14M17 31h14"/>',
  display: '<rect x="5" y="9" width="38" height="27"/><path d="M24 36v6M15 42h18"/>',
  info: '<circle cx="24" cy="24" r="19"/><path d="M24 22v13M24 13v2"/>'
};
const themes = [
  { name: 'Ocean blue', color: '#07559e' },
  { name: 'Rose', color: '#9c527c' },
  { name: 'Amber', color: '#94702d' },
  { name: 'Forest', color: '#36765c' }
];

const home = document.querySelector('#home');
const categoryBar = document.querySelector('#categories');
const menu = document.querySelector('#menu');
const panel = document.querySelector('#panel');
const themeList = document.querySelector('#themes');
const canvas = document.querySelector('#waves');
const context = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const portraitTouch = matchMedia('(hover: none) and (pointer: coarse) and (orientation: portrait)');
let category = 2;
let selections = [0, 0, 0, 0, 0, 0];
let theme = themes[0].color;
let waveFrame = null;
let waveTime = 0;
let lastFrame = 0;

function icon(name) {
  return `<svg viewBox="0 0 48 48" aria-hidden="true">${iconPaths[name]}</svg>`;
}

function renderCategories() {
  categoryBar.innerHTML = categories.map((item, index) =>
    `<button class="category" data-category="${index}" aria-label="${item.name}">${icon(item.icon)}<span>${item.name}</span></button>`
  ).join('');
}

function renderMenu() {
  menu.setAttribute('aria-label', categories[category].name);
  menu.innerHTML = categories[category].items.map((item, index) =>
    `<button class="menu-item" role="menuitem" data-item="${index}">${icon(item.icon)}<span>${item.label}</span></button>`
  ).join('');
  updateSelection();
}

function updateSelection() {
  categoryBar.style.transform = `translateX(${-category * 82}px)`;
  categoryBar.querySelectorAll('button').forEach((button, index) => {
    button.classList.toggle('active', index === category);
    button.setAttribute('aria-current', String(index === category));
  });
  menu.querySelectorAll('button').forEach((button, index) => {
    const distance = index - selections[category];
    const center = distance < 0 ? 24 + (distance + 1) * 64 : 137 + distance * 64;
    button.style.transform = `translateY(${center - 24}px)`;
    button.classList.toggle('active', distance === 0);
    button.tabIndex = distance === 0 ? 0 : -1;
  });
}

function changeCategory(direction) {
  const next = Math.max(0, Math.min(categories.length - 1, category + direction));
  if (next === category) return;
  category = next;
  renderMenu();
}

function moveItem(direction) {
  selections[category] = Math.max(0, Math.min(categories[category].items.length - 1, selections[category] + direction));
  updateSelection();
}

function openItem() {
  const item = categories[category].items[selections[category]];
  home.hidden = true;
  panel.hidden = false;
  document.querySelector('#panel-title').textContent = item.label;
  document.querySelector('#panel-description').textContent = item.text;
  themeList.hidden = !item.theme;
  document.querySelector('#back').focus({ preventScroll: true });
}

function goBack() {
  if (panel.hidden) return;
  panel.hidden = true;
  home.hidden = false;
  menu.querySelector('.active').focus({ preventScroll: true });
}

function applyTheme(color) {
  theme = color;
  document.documentElement.style.setProperty('--theme', color);
  document.querySelector('meta[name="theme-color"]').content = color;
  themeList.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === color)));
  try { localStorage.setItem('psp-xmb-theme', color); } catch (_) { /* Local preferences are optional. */ }
}

categoryBar.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (button) changeCategory(Number(button.dataset.category) - category);
});
menu.addEventListener('click', event => {
  const button = event.target.closest('[data-item]');
  if (!button) return;
  selections[category] = Number(button.dataset.item);
  updateSelection();
  openItem();
});
themeList.addEventListener('click', event => {
  const button = event.target.closest('[data-color]');
  if (button) applyTheme(button.dataset.color);
});
document.querySelector('#enter').addEventListener('click', () => { if (panel.hidden) openItem(); });
document.querySelector('#back').addEventListener('click', goBack);
document.addEventListener('keydown', event => {
  if (portraitTouch.matches || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === 'Escape') { goBack(); event.preventDefault(); return; }
  if (!panel.hidden) return;
  const actions = { ArrowLeft: () => changeCategory(-1), ArrowRight: () => changeCategory(1), ArrowUp: () => moveItem(-1), ArrowDown: () => moveItem(1), Enter: openItem };
  if (actions[event.key]) { event.preventDefault(); actions[event.key](); }
});

let touchStart = null;
let lastSwipe = -Infinity;
home.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
home.addEventListener('touchcancel', () => { touchStart = null; });
home.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 35) return;
  lastSwipe = performance.now();
  if (Math.abs(dx) > Math.abs(dy)) changeCategory(dx < 0 ? 1 : -1);
  else moveItem(dy < 0 ? 1 : -1);
}, { passive: true });
home.addEventListener('click', event => {
  if (performance.now() - lastSwipe < 350) { event.preventDefault(); event.stopPropagation(); }
}, true);

function drawWaves(timestamp) {
  waveFrame = null;
  if (document.hidden || !context) return;
  if (lastFrame) waveTime += Math.min(timestamp - lastFrame, 50) / 1000;
  lastFrame = timestamp;
  const width = canvas.width, height = canvas.height;
  context.clearRect(0, 0, width, height);
  for (let layer = 0; layer < 3; layer++) {
    context.beginPath();
    for (let point = 0; point <= 80; point++) {
      const x = point / 80;
      const y = height * (.57 + layer * .025) + Math.sin(x * 4 + waveTime * (.1 + layer * .02) + layer * .3) * height * .08;
      if (point === 0) context.moveTo(0, y); else context.lineTo(x * width, y);
    }
    context.strokeStyle = 'rgba(225,245,255,.10)';
    context.lineWidth = 1.5;
    context.stroke();
    context.lineTo(width, height);
    context.lineTo(0, height);
    const gradient = context.createLinearGradient(0, height * .45, 0, height);
    gradient.addColorStop(0, 'rgba(225,245,255,.035)');
    gradient.addColorStop(1, 'rgba(225,245,255,0)');
    context.fillStyle = gradient;
    context.fill();
  }
  if (!reducedMotion.matches) waveFrame = requestAnimationFrame(drawWaves);
}

function restartWaves() {
  cancelAnimationFrame(waveFrame);
  lastFrame = 0;
  waveFrame = requestAnimationFrame(drawWaves);
}

function resize() {
  const available = document.querySelector('#viewport').getBoundingClientRect();
  document.querySelector('#console').style.setProperty('--scale', Math.min(available.width / 480, available.height / 272, 2));
  document.querySelector('#console').inert = portraitTouch.matches;
  touchStart = null;
  const resolution = Math.min(devicePixelRatio || 1, 1.25, 1280 / innerWidth, 800 / innerHeight);
  canvas.width = Math.round(innerWidth * resolution);
  canvas.height = Math.round(innerHeight * resolution);
  restartWaves();
}

function updateClock() {
  const now = new Date();
  const clock = document.querySelector('#clock');
  clock.dateTime = now.toISOString();
  clock.textContent = `${now.getMonth() + 1}/${now.getDate()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

themeList.innerHTML = themes.map(item => `<button class="theme" data-color="${item.color}" style="--swatch:${item.color}">${item.name}</button>`).join('');
try {
  const saved = localStorage.getItem('psp-xmb-theme');
  if (themes.some(item => item.color === saved)) theme = saved;
} catch (_) { /* The menu also works when browser storage is disabled. */ }
renderCategories();
renderMenu();
applyTheme(theme);
resize();
updateClock();
setInterval(updateClock, 30000);
window.addEventListener('resize', resize);
window.visualViewport?.addEventListener('resize', resize);
portraitTouch.addEventListener('change', resize);
reducedMotion.addEventListener('change', restartWaves);
document.addEventListener('visibilitychange', restartWaves);
