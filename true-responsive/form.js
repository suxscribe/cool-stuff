document.addEventListener('DOMContentLoaded', function () {
  const authForm = document.getElementById('authForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  authForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Basic validation
    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    // Simulate authentication
    authenticateUser(email, password);
  });

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function authenticateUser(email, password) {
    const submitBtn = authForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, accept any email/password combo
      if (email && password) {
        showMessage('Authentication successful! Welcome back.', 'success');
        setTimeout(() => {
          // Redirect or do something after successful auth
          console.log('User authenticated:', email);
        }, 1500);
      } else {
        showMessage('Invalid credentials. Please try again.', 'error');
      }

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }

  function showMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message mt-4 p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
      type === 'success'
        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`;
    messageDiv.textContent = message;

    authForm.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }
});
