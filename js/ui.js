// Shared UI helpers for showing feedback to the user.

// Inline message on an element (existing pattern used by pages)
export function showMessage(el, text, type = 'error') {
  if (!el) return;
  el.textContent = text;
  el.className = 'message ' + type;
}

export function clearMessage(el) {
  if (!el) return;
  el.textContent = '';
  el.className = 'message';
}

export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// Global toast notification container (created on demand)
function ensureToastContainer() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// Show a floating toast. type: 'error' | 'success' | 'info'
export function toast(message, type = 'info', duration = 4000) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;

  const text = document.createElement('span');
  text.className = 'toast-text';
  text.textContent = message;

  const close = document.createElement('button');
  close.className = 'toast-close';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '×';
  close.addEventListener('click', () => removeToast(el));

  el.appendChild(text);
  el.appendChild(close);
  container.appendChild(el);

  requestAnimationFrame(() => el.classList.add('toast-visible'));

  if (duration > 0) {
    setTimeout(() => removeToast(el), duration);
  }
  return el;
}

function removeToast(el) {
  if (!el) return;
  el.classList.remove('toast-visible');
  setTimeout(() => el.remove(), 200);
}

// Convenience helpers
export const errorToast = (message) => toast(message, 'error');
export const successToast = (message) => toast(message, 'success');
export const infoToast = (message) => toast(message, 'info');

// Handle a failed API result: show inline message (if element provided) and/or a toast
export function handleApiError(result, inlineEl = null, showToast = false) {
  const message = (result && result.error) || 'Something went wrong. Please try again.';
  if (inlineEl) {
    showMessage(inlineEl, message, 'error');
  }
  if (showToast || !inlineEl) {
    errorToast(message);
  }
  return message;
}

// If the session expired (401) or network failed, redirect to login where relevant
export function handleAuthFailure(result, redirectTo = '../index.html') {
  if (result && (result.status === 401 || result.status === 0)) {
    if (result.status === 401) {
      sessionExpired(redirectTo);
      return true;
    }
  }
  return false;
}

export function sessionExpired(redirectTo = '../index.html') {
  errorToast('Your session has expired. Redirecting to login...');
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  } catch (e) {
    /* ignore */
  }
  setTimeout(() => {
    window.location.href = redirectTo;
  }, 1500);
}

// Open an image URL in a full-screen lightbox overlay
export function openLightbox(src) {
  if (!src) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Post image';
  box.appendChild(img);

  const close = () => {
    box.classList.remove('lightbox-visible');
    setTimeout(() => box.remove(), 200);
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };

  box.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('lightbox-visible'));
}

export function formatTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleString();
  } catch (e) {
    return timestamp;
  }
}