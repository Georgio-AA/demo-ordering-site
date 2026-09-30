import { PRODUCTS } from './products.js';
import { getCart, getMode, setQty, removeFromCart, clearCart, unitPrice, lineTotal, cartTotal, formatPrice } from './store.js';
import { renderChrome, toast } from './ui.js';

renderChrome();
const lines = document.getElementById('cart-lines');
const form = document.getElementById('order-form');
const fields = ['full-name', 'phone', 'email', 'address', 'notes'].map(id => document.getElementById(id));
let confirmed = false;
function render() {
  if (confirmed) return;
  const focusId = lines.contains(document.activeElement) ? document.activeElement.id : '';
  const cart = getCart();
  const wholesale = getMode() === 'wholesale';
  document.getElementById('empty-cart').hidden = cart.length > 0;
  document.getElementById('cart-content').hidden = !cart.length;
  document.getElementById('checkout').hidden = !cart.length;
  document.getElementById('mode-notice').textContent = wholesale ? 'Wholesale prices are per case. Quantities represent cases.' : 'Retail prices are per unit. Quantities represent individual units.';
  lines.innerHTML = cart.map(line => {
    const product = PRODUCTS.find(item => item.id === line.id);
    return `<li class="cart-line"><img src="${product.image}" alt="${product.name} placeholder illustration" width="120" height="90"><div class="cart-product"><h2 class="product-name">${product.name}</h2><p>${wholesale ? `Case of ${product.caseSize} × ${product.unit}` : product.unit}</p><p>${formatPrice(unitPrice(product))} / ${wholesale ? 'case' : 'unit'}</p></div>
      <div><label class="hint" for="qty-${line.id}">Quantity (${wholesale ? 'cases' : 'units'})</label><div class="quantity-stepper"><button id="minus-${line.id}" type="button" data-step="-1" data-id="${line.id}" aria-label="Decrease quantity for ${product.name}" ${line.qty === 1 ? 'disabled' : ''}>−</button><input id="qty-${line.id}" type="number" min="1" step="1" data-qty="${line.id}" value="${line.qty}" aria-label="Quantity for ${product.name}"><button id="plus-${line.id}" type="button" data-step="1" data-id="${line.id}" aria-label="Increase quantity for ${product.name}">+</button></div></div>
      <div class="line-actions"><p class="product-price">Line total: ${formatPrice(lineTotal(line))}</p><button id="remove-${line.id}" class="button secondary" type="button" data-remove="${line.id}" aria-label="Remove ${product.name}">Remove</button></div></li>`;
  }).join('');
  document.getElementById('subtotal').textContent = `Subtotal: ${formatPrice(cartTotal())}`;
  const remaining = Math.max(0, Math.round((150 - cartTotal()) * 100) / 100);
  document.getElementById('minimum-notice').textContent = wholesale ? remaining ? `Wholesale minimum: $150. Add ${formatPrice(remaining)} more to send your demo request.` : 'Wholesale minimum of $150 met.' : 'No minimum order for retail.';
  document.getElementById('submit-order').disabled = !cart.length || (wholesale && remaining > 0);
  if (focusId) {
    const target = document.getElementById(focusId);
    if (target && !target.disabled) target.focus();
    else if (target) document.getElementById(focusId.replace('minus-', 'qty-'))?.focus();
    else (lines.querySelector('input') || document.querySelector('#empty-cart a')).focus();
  }
}
lines.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.remove) { removeFromCart(button.dataset.remove); toast('Item removed from cart.'); }
  if (button.dataset.step) {
    const line = getCart().find(item => item.id === button.dataset.id);
    const next = Math.max(1, line.qty + Number(button.dataset.step));
    if (Number.isSafeInteger(next)) setQty(line.id, next);
  }
});
lines.addEventListener('change', event => {
  if (!event.target.dataset.qty) return;
  const qty = Number(event.target.value);
  if (Number.isSafeInteger(qty) && qty > 0) setQty(event.target.dataset.qty, qty);
  else { render(); toast('Enter a whole quantity of at least 1.'); }
});
document.getElementById('clear-cart').addEventListener('click', () => {
  clearCart(); toast('Cart cleared.'); document.querySelector('#empty-cart a').focus();
});
function validate(field) {
  const value = field.value.trim();
  let message = '';
  if (field.id === 'full-name' && value.length < 2) message = 'Enter your full name (at least 2 characters).';
  if (field.id === 'phone' && (!/^[0-9 +()\-]{7,20}$/.test(value) || !/[0-9]/.test(value))) message = 'Enter a phone number with 7–20 characters using digits, spaces, +, (, ), or -.';
  if (field.id === 'email' && (!value || field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) message = 'Enter a valid email address.';
  if (field.id === 'address' && value.length < 5) message = 'Enter a delivery address (at least 5 characters).';
  if (field.id === 'notes' && field.value.length > 500) message = 'Keep notes to 500 characters or fewer.';
  document.getElementById(`${field.id}-error`).textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}
for (const field of fields) {
  field.addEventListener('blur', () => validate(field));
  field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validate(field);
    if (field.id === 'notes') document.getElementById('notes-count').textContent = `${field.value.length} / 500 characters`;
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const invalid = fields.filter(field => !validate(field));
  if (invalid.length) { invalid[0].focus(); return; }
  const cart = getCart();
  const mode = getMode();
  const total = cartTotal();
  if (!cart.length || (mode === 'wholesale' && total < 150)) { render(); return; }
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  const reference = `SNK-${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  document.getElementById('confirmation-reference').textContent = `Reference: ${reference}`;
  document.getElementById('confirmation-customer').textContent = `Thank you, ${fields[0].value.trim()}.`;
  document.getElementById('confirmation-mode').textContent = `Pricing mode: ${mode === 'wholesale' ? 'Wholesale (cases)' : 'Retail (units)'}`;
  document.getElementById('confirmation-items').replaceChildren(...cart.map(line => {
    const product = PRODUCTS.find(item => item.id === line.id);
    const item = document.createElement('li');
    item.textContent = `${product.name} — ${line.qty} × ${mode === 'wholesale' ? `case of ${product.caseSize} × ${product.unit}` : product.unit} at ${formatPrice(unitPrice(product, mode))}: ${formatPrice(lineTotal(line, mode))}`;
    return item;
  }));
  document.getElementById('confirmation-total').textContent = `Total: ${formatPrice(total)}`;
  confirmed = true;
  document.getElementById('shopping-view').hidden = true;
  document.getElementById('confirmation').hidden = false;
  clearCart(); form.reset();
  document.getElementById('confirmation-title').focus();
});
window.addEventListener('snackline:change', render);
render();
