import { PRODUCTS } from './products.js';

const known = id => PRODUCTS.some(product => product.id === id);
const validQty = qty => Number.isSafeInteger(qty) && qty > 0;
function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
let mode = 'retail';
try { if (localStorage.getItem('snackline.mode') === 'wholesale') mode = 'wholesale'; } catch { /* In-memory fallback. */ }
const savedCart = read('snackline.cart', []);
let cart = [];
if (Array.isArray(savedCart)) {
  for (const line of savedCart) {
    if (line && known(line.id) && validQty(line.qty) && !cart.some(item => item.id === line.id)) cart.push({ id: line.id, qty: line.qty });
  }
}
function changed() {
  try { localStorage.setItem('snackline.mode', mode); } catch { /* In-memory fallback. */ }
  try { localStorage.setItem('snackline.cart', JSON.stringify(cart)); } catch { /* In-memory fallback. */ }
  window.dispatchEvent(new CustomEvent('snackline:change', { detail: { mode, cart: getCart() } }));
}
export const getMode = () => mode;
export function setMode(next, code) {
  if (!['retail', 'wholesale'].includes(next)) return false;
  if (next === mode) return true;
  if (next === 'wholesale' && (typeof code !== 'string' || code.trim().toUpperCase() !== 'WHOLESALE2026')) return false;
  mode = next;
  changed();
  return true;
}
export function tryUnlockWholesale(code) {
  if (typeof code !== 'string' || code.trim().toUpperCase() !== 'WHOLESALE2026') return false;
  return setMode('wholesale', code);
}
export const getCart = () => cart.map(line => ({ ...line }));
export function addToCart(id, qty = 1) {
  if (!known(id) || !validQty(qty)) return;
  const line = cart.find(item => item.id === id);
  if (line && !validQty(line.qty + qty)) return;
  if (line) line.qty += qty;
  else cart.push({ id, qty });
  changed();
}
export function setQty(id, qty) {
  if (!known(id) || !Number.isSafeInteger(qty)) return;
  if (qty <= 0) return removeFromCart(id);
  const line = cart.find(item => item.id === id);
  if (line?.qty === qty) return;
  if (line) line.qty = qty;
  else cart.push({ id, qty });
  changed();
}
export function removeFromCart(id) {
  if (!cart.some(line => line.id === id)) return;
  cart = cart.filter(line => line.id !== id);
  changed();
}
export function clearCart() {
  if (!cart.length) return;
  cart = [];
  changed();
}
export const cartCount = () => cart.reduce((sum, line) => sum + line.qty, 0);
export const unitPrice = (product, pricingMode = getMode()) => pricingMode === 'wholesale' ? product.wholesalePrice : product.retailPrice;
// A line uses the persisted cart shape: { id, qty }.
export function lineTotal(line, pricingMode = getMode()) {
  const product = PRODUCTS.find(item => item.id === line?.id);
  return product && validQty(line.qty) ? Math.round(unitPrice(product, pricingMode) * 100) * line.qty / 100 : 0;
}
export const cartTotal = (pricingMode = getMode()) => cart.reduce((sum, line) => sum + Math.round(lineTotal(line, pricingMode) * 100), 0) / 100;
export const formatPrice = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
