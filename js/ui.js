import { cartCount, getMode, setMode, tryUnlockWholesale } from './store.js';

const links = [['index.html', 'Home'], ['catalogue.html', 'Catalogue'], ['about.html', 'About'], ['contact.html', 'Contact'], ['cart.html', 'Cart']];
let toastTimer;
export function toast(msg) {
  const region = document.getElementById('toast');
  if (!region) return;
  clearTimeout(toastTimer);
  region.textContent = msg;
  region.classList.add('visible');
  toastTimer = setTimeout(() => { region.classList.remove('visible'); region.textContent = ''; }, 4000);
}
export function renderChrome() {
  if (document.getElementById('site-header')) return;
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="demo-banner">Demo project — not a real store</div>
    <header id="site-header" class="site-header"><div class="container header-inner">
      <a class="logo" href="index.html">Snackline <span>Demo</span></a>
      <button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">☰ <span>Menu</span></button>
      <nav id="main-nav" aria-label="Main navigation">${links.map(([href, label]) => `<a href="${href}" ${page === href ? 'aria-current="page"' : ''}>${label}${label === 'Cart' ? ' <span class="badge" id="cart-count" aria-live="polite" aria-atomic="true"></span>' : ''}</a>`).join('')}</nav>
      <button type="button" class="mode-control" id="mode-control" aria-haspopup="dialog"></button>
    </div></header>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer class="site-footer"><div class="container footer-grid"><div><a class="logo" href="index.html">Snackline Demo</a><p>A fictional snack & beverage distributor.</p><p>Demo project built by Georgio Abi Aad</p></div>
      <nav aria-label="Footer navigation">${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</nav>
      <address>123 Demo Street, Example City<br><a href="mailto:hello@snackline.example">hello@snackline.example</a><br>+000 00 000 000</address></div></footer>
    <dialog id="wholesale-dialog" aria-labelledby="wholesale-title" aria-describedby="wholesale-description"><form id="wholesale-form">
      <h2 id="wholesale-title">Try wholesale pricing</h2><p id="wholesale-description">Order by the case. The wholesale minimum is $150 at checkout. Your cart quantities will represent cases.</p>
      <label for="wholesale-code">Demo access code</label><input id="wholesale-code" name="code" type="text" aria-describedby="code-hint code-error" autocomplete="off" required><p id="code-hint" class="hint">Demo code: WHOLESALE2026</p>
      <p id="code-error" class="error" role="alert"></p><div class="button-row"><button type="submit" class="button">Unlock wholesale</button><button type="button" class="button secondary" id="close-dialog">Cancel</button></div>
    </form></dialog><div id="toast" class="toast" role="status" aria-live="polite" aria-atomic="true"></div>`);
  const menu = document.querySelector('.menu-toggle');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    document.getElementById('main-nav').classList.toggle('is-open', open);
  });
  document.getElementById('main-nav').addEventListener('keydown', event => {
    if (event.key === 'Escape') { menu.setAttribute('aria-expanded', 'false'); event.currentTarget.classList.remove('is-open'); menu.focus(); }
  });
  const control = document.getElementById('mode-control');
  const dialog = document.getElementById('wholesale-dialog');
  const input = document.getElementById('wholesale-code');
  const error = document.getElementById('code-error');
  function refresh() {
    document.getElementById('cart-count').textContent = cartCount();
    control.innerHTML = `<span class="mode-prefix">Pricing: </span>${getMode() === 'retail' ? 'Retail' : 'Wholesale'}`;
    control.setAttribute('aria-label', `${control.textContent}. Switch to ${getMode() === 'retail' ? 'wholesale' : 'retail'}`);
    if (getMode() === 'retail') control.setAttribute('aria-haspopup', 'dialog');
    else control.removeAttribute('aria-haspopup');
  }
  control.addEventListener('click', () => {
    if (getMode() === 'wholesale') { setMode('retail'); toast('Retail pricing enabled. Cart quantities are units.'); return; }
    input.value = ''; error.textContent = ''; input.removeAttribute('aria-invalid'); dialog.showModal(); input.focus();
  });
  document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
  document.getElementById('wholesale-form').addEventListener('submit', event => {
    event.preventDefault();
    if (tryUnlockWholesale(input.value)) { dialog.close(); toast('Wholesale pricing enabled. Cart quantities are cases.'); }
    else { error.textContent = 'That code is incorrect. Try WHOLESALE2026.'; input.setAttribute('aria-invalid', 'true'); input.focus(); }
  });
  window.addEventListener('snackline:change', refresh);
  refresh();
}
