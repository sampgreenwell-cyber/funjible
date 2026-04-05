const API_URL = 'https://funjibly-api.proudwater-3e7b001e.eastus.azurecontainerapps.io/api';

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('logoutBtn').addEventListener('click', logout);

// Check if already logged in
chrome.storage.local.get(['funjibly_token', 'funjibly_user'], (result) => {
  if (result.funjibly_token) {
    showLoggedIn(result.funjibly_user);
  }
});

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      chrome.storage.local.set({
        funjibly_token: data.data.token,
        funjibly_user: data.data.user.email
      });

      showLoggedIn(data.data.user.email);
      showStatus('Login successful!', 'success');
    } else {
      showStatus(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    showStatus('Connection error', 'error');
  }
}

function logout() {
  chrome.storage.local.remove(['funjibly_token', 'funjibly_user']);
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('loggedIn').classList.remove('active');
  showStatus('Logged out', 'success');
}

function showLoggedIn(email) {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('loggedIn').classList.add('active');
  document.getElementById('userEmail').textContent = email;
}

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}