import { PRODUCTS, CATEGORIES } from './products.js';
import { addToCart, formatPrice, getMode, unitPrice } from './store.js';
import { renderChrome, toast } from './ui.js';

renderChrome();
const search = document.getElementById('search');
const sort = document.getElementById('sort');
const categories = document.getElementById('categories');
const grid = document.getElementById('products');
const requested = new URLSearchParams(window.location.search).get('category');
let category = CATEGORIES.includes(requested) ? requested : 'All';
const quantities = new Map();
categories.innerHTML = ['All', ...CATEGORIES].map((name, index) => `<button class="category-chip" type="button" data-category="${index}" aria-pressed="${name === category}">${name}</button>`).join('');
function render() {
  const focusId = grid.contains(document.activeElement) ? document.activeElement.id : '';
  const query = search.value.trim().toLowerCase();
  const products = PRODUCTS.filter(product => (category === 'All' || product.category === category) && `${product.name} ${product.description}`.toLowerCase().includes(query));
  products.sort((a, b) => sort.value === 'low' ? unitPrice(a) - unitPrice(b) : sort.value === 'high' ? unitPrice(b) - unitPrice(a) : sort.value === 'name' ? a.name.localeCompare(b.name) : Number(b.featured) - Number(a.featured));
  const wholesale = getMode() === 'wholesale';
  grid.innerHTML = products.map(product => {
    const qty = quantities.get(product.id) || 1;
    return `<article class="card"><div class="card-image"><img src="${product.image}" alt="${product.name} placeholder illustration" width="320" height="240" loading="lazy"></div><div class="card-body">
      <span class="eyebrow">${product.category}</span><h2 class="product-name">${product.name}</h2><p>${product.description}</p><p>${wholesale ? `Case of ${product.caseSize} × ${product.unit}` : product.unit}</p><p class="product-price">${formatPrice(unitPrice(product))} / ${wholesale ? 'case' : 'unit'}</p>
      <label class="hint" for="qty-${product.id}">Quantity (${wholesale ? 'cases' : 'units'})</label><div class="quantity-stepper"><button id="minus-${product.id}" type="button" data-step="-1" data-id="${product.id}" aria-label="Decrease quantity for ${product.name}" ${qty === 1 ? 'disabled' : ''}>−</button><input id="qty-${product.id}" data-qty="${product.id}" type="number" min="1" step="1" value="${qty}"><button id="plus-${product.id}" type="button" data-step="1" data-id="${product.id}" aria-label="Increase quantity for ${product.name}">+</button></div>
      <button id="add-${product.id}" class="button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">Add to cart <span aria-hidden="true">+</span></button></div></article>`;
  }).join('');
  document.getElementById('result-count').textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'} found`;
  document.getElementById('empty-results').hidden = products.length !== 0;
  if (focusId) {
    const target = document.getElementById(focusId);
    if (target?.disabled) document.getElementById(focusId.replace('minus-', 'qty-'))?.focus();
    else target?.focus();
  }
}
categories.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = ['All', ...CATEGORIES][Number(button.dataset.category)];
  for (const chip of categories.children) chip.setAttribute('aria-pressed', String(chip === button));
  render();
});
search.addEventListener('input', render);
sort.addEventListener('change', render);
document.getElementById('clear-filters').addEventListener('click', () => {
  search.value = ''; sort.value = 'featured'; categories.firstElementChild.click(); search.focus();
});
grid.addEventListener('change', event => {
  const id = event.target.dataset.qty;
  if (!id) return;
  const qty = Number(event.target.value);
  quantities.set(id, Number.isSafeInteger(qty) && qty > 0 ? qty : 1);
  event.target.value = quantities.get(id);
  document.getElementById(`minus-${id}`).disabled = quantities.get(id) === 1;
});
grid.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.step) {
    const next = (quantities.get(button.dataset.id) || 1) + Number(button.dataset.step);
    const id = button.dataset.id;
    if (Number.isSafeInteger(next)) quantities.set(id, Math.max(1, next));
    document.getElementById(`qty-${id}`).value = quantities.get(id);
    const minus = document.getElementById(`minus-${id}`);
    minus.disabled = quantities.get(id) === 1;
    if (minus.disabled && document.activeElement === minus) document.getElementById(`qty-${id}`).focus();
  }
  if (button.dataset.add) {
    const product = PRODUCTS.find(item => item.id === button.dataset.add);
    const qty = quantities.get(product.id) || 1;
    addToCart(product.id, qty);
    toast(`${product.name}: ${qty} ${getMode() === 'wholesale' ? 'case(s)' : 'unit(s)'} added to cart.`);
  }
});
let lastMode = getMode();
window.addEventListener('snackline:change', () => { if (getMode() !== lastMode) { lastMode = getMode(); render(); } });
render();
