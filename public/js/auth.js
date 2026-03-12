document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // We need to fetch profile to know where to redirect
        fetch('/user/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                if (data.user.role === 'admin') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/dashboard.html';
                }
            }
        })
        .catch(err => {
            console.error(err);
            localStorage.removeItem('token');
        });
    }

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const toggleBtn = document.getElementById('toggle-btn');
    const formTitle = document.getElementById('form-title');
    const formSubtitle = document.getElementById('form-subtitle');
    const toggleText = document.getElementById('toggle-text');
    const alertMsg = document.getElementById('alert-message');
    
    let isLogin = true;

    // Toggle forms
    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        
        hideAlert();
        
        if (isLogin) {
            loginForm.classList.remove('hidden');
            signupForm.classList.add('hidden');
            formTitle.textContent = 'Welcome Back';
            formSubtitle.textContent = 'Enter your details to cast your vote';
            toggleText.innerHTML = `Don't have an account? <span class="toggle-link" id="toggle-btn">Sign up</span>`;
        } else {
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            formTitle.textContent = 'Create Account';
            formSubtitle.textContent = 'Register to participate in the election';
            toggleText.innerHTML = `Already have an account? <span class="toggle-link" id="toggle-btn">Log in</span>`;
        }
        
        // RE-attach event listener
        document.getElementById('toggle-btn').addEventListener('click', arguments.callee);
    });

    const showAlert = (message, isError = true) => {
        alertMsg.textContent = message;
        alertMsg.className = `alert show alert-${isError ? 'error' : 'success'}`;
    };

    const hideAlert = () => {
        alertMsg.className = 'alert';
    };

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        const aadharCardNumber = document.getElementById('login-aadhar').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aadharCardNumber, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                showAlert('Login successful! Redirecting...', false);
                setTimeout(() => window.location.reload(), 1000); // Reload will hit the auth check and redirect
            } else {
                showAlert(data.error || 'Login failed');
                btn.disabled = false;
                btn.textContent = 'Login to Vote';
            }
        } catch (err) {
            showAlert('Server error. Please try again.');
            btn.disabled = false;
            btn.textContent = 'Login to Vote';
        }
    });

    // Handle Signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        const btn = e.target.querySelector('button');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Creating Account...';

        const payload = {
            name: document.getElementById('signup-name').value,
            aadharCardNumber: document.getElementById('signup-aadhar').value,
            age: parseInt(document.getElementById('signup-age').value),
            address: document.getElementById('signup-address').value,
            password: document.getElementById('signup-password').value,
            role: 'voter'
        };

        try {
            const res = await fetch('/user/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                showAlert('Account created! Redirecting...', false);
                setTimeout(() => window.location.href = '/dashboard.html', 1000);
            } else {
                showAlert(data.error || 'Signup failed');
                btn.disabled = false;
                btn.textContent = originalText;
            }
        } catch (err) {
            showAlert('Server error. Please try again.');
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
});
