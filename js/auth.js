import { signup, login, storeAuthData, parseJwt, getUserId, getToken, setUserName } from './api.js';
import { showMessage, clearMessage, errorToast, successToast } from './ui.js';

function initAuth() {
  // Redirect if already logged in
  const token = getToken();
  if (token) {
    const payload = parseJwt(token);
    const userId = getUserId();
    if (payload && payload.sub && userId) {
      window.location.href = './pages/feed.html';
      return;
    }
  }

  const showLoginBtn = document.getElementById('showLogin');
  const showSignupBtn = document.getElementById('showSignup');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');

  showLoginBtn.addEventListener('click', () => {
    showLoginBtn.classList.add('active');
    showSignupBtn.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    clearMessages();
  });

  showSignupBtn.addEventListener('click', () => {
    showSignupBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
    clearMessages();
  });

  loginBtn.addEventListener('click', handleLogin);
  signupBtn.addEventListener('click', handleSignup);

  // Allow Enter key
  document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('signupPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSignup();
  });
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const messageEl = document.getElementById('loginMessage');
  clearMessage(messageEl);

  if (!email || !password) {
    showMessage(messageEl, 'Please fill in all fields', 'error');
    return;
  }

  const loginBtn = document.getElementById('loginBtn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    const res = await login(email, password);
    if (res.success && res.data && res.data.accessToken) {
      const pendingName = localStorage.getItem('pendingLoginName') || '';
      storeAuthData(res.data.accessToken, res.data.userEmail, null, pendingName);
      localStorage.removeItem('pendingLoginName');
      localStorage.removeItem('pendingLoginEmail');
      showMessage(messageEl, 'Login successful! Redirecting...', 'success');
      successToast('Welcome back!');
      setTimeout(() => {
        window.location.href = './pages/feed.html';
      }, 1000);
    } else {
      showMessage(messageEl, res.error || 'Login failed. Please check your email and password.', 'error');
      errorToast(res.error || 'Login failed');
    }
  } catch (e) {
    showMessage(messageEl, e.message || 'Login failed', 'error');
    errorToast(e.message || 'Login failed');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
}

async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  const messageEl = document.getElementById('signupMessage');
  clearMessage(messageEl);

  if (!name || !email || !password) {
    showMessage(messageEl, 'Please fill in all fields', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage(messageEl, 'Please enter a valid email address', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage(messageEl, 'Password must be at least 6 characters', 'error');
    return;
  }

  const signupBtn = document.getElementById('signupBtn');
  signupBtn.disabled = true;
  signupBtn.textContent = 'Signing up...';

  try {
    const res = await signup(name, email, password);
    if (res.success) {
      const data = res.data || {};
      const finalName = data.name || name;
      setUserName(finalName);
      localStorage.setItem('pendingLoginEmail', email);
      localStorage.setItem('pendingLoginName', finalName);
      showMessage(messageEl, 'Sign up successful! Please login.', 'success');
      successToast('Account created. Please log in.');
      // Switch to login after a delay, pre-fill credentials
      setTimeout(() => {
        document.getElementById('showLogin').click();
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = password;
      }, 1500);
    } else {
      showMessage(messageEl, res.error || 'Sign up failed', 'error');
      errorToast(res.error || 'Sign up failed');
    }
  } catch (e) {
    showMessage(messageEl, e.message || 'Sign up failed', 'error');
    errorToast(e.message || 'Sign up failed');
  } finally {
    signupBtn.disabled = false;
    signupBtn.textContent = 'Sign Up';
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearMessages() {
  clearMessage(document.getElementById('loginMessage'));
  clearMessage(document.getElementById('signupMessage'));
}

document.addEventListener('DOMContentLoaded', initAuth);