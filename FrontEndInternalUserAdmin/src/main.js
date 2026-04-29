// ==========================================
// Admin Authentication Script
// ==========================================

//const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://fullstackpodcastwebapp.onrender.com';

/**
 * Get stored token from localStorage or sessionStorage
 */
function getToken() {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
}

/**
 * Store token securely
 */
function storeToken(token, rememberMe = false) {
    if (rememberMe) {
        localStorage.setItem('adminToken', token);
        sessionStorage.removeItem('adminToken');
    } else {
        sessionStorage.setItem('adminToken', token);
        localStorage.removeItem('adminToken');
    }
}

/**
 * Clear all tokens and logout
 */
function logout() {
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
    window.location.replace('./index.html');
}

// ==========================================
// Tab Switching
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    // Industry Standard: If logged in, redirect from login page to dashboard
    const token = getToken();
    if (token) {
        console.log('✅ User already logged in, redirecting to upload page');
        window.location.replace('./upload.html');
        return;
    }

    const toggleButtons = document.querySelectorAll('.btn-toggle');
    const forms = document.querySelectorAll('.auth-form');

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update button states
            toggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                }
            });
            
            // Hide message
            hideMessage();
        });
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register Form Submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// ==========================================
// Login Handler
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    hideMessage();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me')?.checked || false;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store token using centralized function
            storeToken(data.access_token, rememberMe);
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect immediately with location.replace (no history)
            setTimeout(() => {
                window.location.replace('./upload.html');
            }, 500);
        } else {
            showMessage(data.detail || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Unable to connect to server. Please check if backend is running.', 'error');
    }
}

// ==========================================
// Register Handler
// ==========================================
async function handleRegister(e) {
    e.preventDefault();
    hideMessage();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email, 
                password,
                full_name: name 
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Registration successful! Please sign in.', 'success');
            
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
        } else {
            showMessage(data.detail || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showMessage('Unable to connect to server. Please check if backend is running.', 'error');
    }
}

// ==========================================
// Utility Functions
// ==========================================
function showMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `alert mt-3 alert-${type === 'success' ? 'success' : 'error'}`;
        messageEl.classList.remove('d-none');
    }
}

function hideMessage() {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.classList.add('d-none');
    }
}

// Export logout for global access (called from onclick in HTML)
window.logout = logout;