// Local Authentication JavaScript
document.addEventListener('DOMContentLoaded', () => {
    const loginToggle = document.getElementById('loginToggle');
    const signupToggle = document.getElementById('signupToggle');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Toggle between Login and Signup
    loginToggle.addEventListener('click', () => {
        loginToggle.classList.add('login-active');
        signupToggle.classList.remove('login-active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    signupToggle.addEventListener('click', () => {
        signupToggle.classList.add('login-active');
        loginToggle.classList.remove('login-active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Password Toggle Visibility
    const togglePasswordLogin = document.getElementById('togglePasswordLogin');
    const loginPassword = document.getElementById('loginPassword');
    togglePasswordLogin.addEventListener('click', () => {
        togglePasswordVisibility(loginPassword, togglePasswordLogin);
    });

    const togglePasswordSignup = document.getElementById('togglePasswordSignup');
    const signupPassword = document.getElementById('signupPassword');
    togglePasswordSignup.addEventListener('click', () => {
        togglePasswordVisibility(signupPassword, togglePasswordSignup);
    });

    // Password Strength Indicator
    signupPassword.addEventListener('input', () => {
        const strength = calculatePasswordStrength(signupPassword.value);
        updatePasswordStrengthUI(strength);
    });

    // Initialize authentication
    initLocalAuth();
});

function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length > 7) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
}

function updatePasswordStrengthUI(strength) {
    const indicator = document.getElementById('passwordStrengthIndicator');
    indicator.style.width = `${strength * 20}%`;

    switch (strength) {
        case 0:
        case 1:
            indicator.style.backgroundColor = 'red';
            break;
        case 2:
        case 3:
            indicator.style.backgroundColor = 'orange';
            break;
        case 4:
        case 5:
            indicator.style.backgroundColor = 'green';
            break;
    }
}

function initLocalAuth() {
    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === hashPassword(password));

            if (user) {
                handleSuccessfulLogin(user);
            } else {
                handleLoginError({ code: 'invalid_credentials' });
            }
        } catch (error) {
            handleLoginError(error);
        }
    });

    // Signup Form Submission
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const neurodivergentType = document.getElementById('neurodivergentType').value;

        try {
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Check if user already exists
            if (users.some(u => u.email === email)) {
                handleSignupError({ code: 'user_exists' });
                return;
            }

            // Create new user
            const newUser = {
                id: generateUniqueId(),
                name: name,
                email: email,
                password: hashPassword(password),
                neurodivergentType: neurodivergentType || 'not_specified'
            };

            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));

            // Automatically log in after signup
            handleSuccessfulLogin(newUser);
        } catch (error) {
            handleSignupError(error);
        }
    });

    // Social Login Simulation (Optional mock handlers)
    const socialLoginButtons = document.querySelectorAll('.social-login-btn');
    socialLoginButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.getAttribute('data-provider');
            simulateSocialLogin(provider)();
        });
    });
}

function handleSuccessfulLogin(user) {
    // Store user info securely in sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify({
        name: user.name,
        email: user.email,
        neurodivergentType: user.neurodivergentType
    }));

    // Redirect to dashboard
    window.location.href = '../xp-hub/xp.html';
}

function handleLoginError(error) {
    console.error('Login Error Details:', error);
    switch(error.code) {
        case 'invalid_credentials':
            alert('Invalid email or password. Please check and try again.');
            break;
        case 'user_not_found':
            alert('No account found. Please sign up or check your email.');
            break;
        default:
            alert('An unexpected error occurred. Please try again later.');
    }
}

function handleSignupError(error) {
    if (error.code === 'user_exists') {
        alert('An account with this email already exists. Please log in.');
    } else if (error.code === 'password_too_weak') {
        alert('Password is too weak. Please choose a stronger password.');
    } else {
        alert('Signup failed. Please try again.');
    }
}

// Simple hash function (Note: This is NOT secure for real-world use!)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

// Generate a unique ID for new users
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Simulate social login (for demonstration)
function simulateSocialLogin(provider) {
    return () => {
        const user = {
            id: generateUniqueId(),
            name: `${provider} User`,
            email: `user@${provider.toLowerCase()}.com`,
            neurodivergentType: 'not_specified'
        };
        handleSuccessfulLogin(user);
    };
}

// Logout function
function logout() {
    // Clear stored user data
    sessionStorage.removeItem('currentUser');
    // Redirect to login page
    window.location.href = 'auth.html';
}

// Check authentication status on page load
function checkAuthStatus() {
    const currentUser = sessionStorage.getItem('currentUser');

    // Prevent infinite redirection loop on the login page
    const isAuthPage = window.location.pathname.includes('auth.html');
    
    if (!currentUser && !isAuthPage) {
        window.location.href = 'auth.html';
    }
}

// Run authentication check when script loads
document.addEventListener('DOMContentLoaded', checkAuthStatus);


// Run authentication check when script loads
document.addEventListener('DOMContentLoaded', checkAuthStatus);