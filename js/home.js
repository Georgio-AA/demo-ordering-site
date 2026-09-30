import { PRODUCTS } from './products.js';
import { addToCart, formatPrice, getMode, unitPrice } from './store.js';
import { renderChrome, toast } from './ui.js';

renderChrome();
const grid = document.getElementById('featured-products');
grid.innerHTML = PRODUCTS.filter(product => product.featured).map(product => `
  <article class="card"><div class="card-image"><img src="${product.image}" alt="${product.name} placeholder illustration" width="320" height="240" loading="lazy"></div><div class="card-body">
    <span class="eyebrow">${product.category}</span><h3>${product.name}</h3><p>${product.description}</p>
    <p class="product-price" data-price="${product.id}"></p><button class="button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to cart">Add to cart <span aria-hidden="true">+</span></button>
  </div></article>`).join('');
function refreshPrices() {
  for (const product of PRODUCTS.filter(item => item.featured)) {
    grid.querySelector(`[data-price="${product.id}"]`).textContent = `${formatPrice(unitPrice(product))} / ${getMode() === 'wholesale' ? `case of ${product.caseSize}` : product.unit}`;
  }
}
grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = PRODUCTS.find(item => item.id === button.dataset.add);
  addToCart(product.id);
  toast(`${product.name}: 1 ${getMode() === 'wholesale' ? 'case' : 'unit'} added to cart.`);
});
window.addEventListener('snackline:change', refreshPrices);
refreshPrices();
