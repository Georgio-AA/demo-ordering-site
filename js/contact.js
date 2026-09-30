import { renderChrome } from './ui.js';

renderChrome();
const form = document.getElementById('contact-form');
const fields = ['full-name', 'email', 'message'].map(id => document.getElementById(id));
const success = document.getElementById('contact-success');

function validate(field) {
  const value = field.value.trim();
  let message = '';
  if (field.id === 'full-name' && value.length < 2) message = 'Enter your name (at least 2 characters).';
  if (field.id === 'email' && (!value || field.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) message = 'Enter a valid email address.';
  if (field.id === 'message' && !value) message = 'Enter a message.';
  document.getElementById(`${field.id}-error`).textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}
for (const field of fields) {
  field.addEventListener('blur', () => validate(field));
  field.addEventListener('input', () => {
    success.textContent = '';
    if (field.hasAttribute('aria-invalid')) validate(field);
  });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  success.textContent = '';
  const invalid = fields.filter(field => !validate(field));
  if (invalid.length) { invalid[0].focus(); return; }
  form.reset();
  for (const field of fields) {
    field.removeAttribute('aria-invalid');
    document.getElementById(`${field.id}-error`).textContent = '';
  }
  success.textContent = 'Demo submission complete. This is a demo and nothing was sent. The form has been reset.';
});
document.getElementById('submit-contact').disabled = false;
