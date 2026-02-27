/**
 * CleanUp - Create Account Page JavaScript
 * Gère l'UI : sélection du type de compte, force du mot de passe,
 * validations visuelles, etc. La soumission vers l'API est gérée
 * dans register.js.
 */

// ========================================
// ACCOUNT TYPE SELECTION
// ========================================

/**
 * Selects an account type (customer or cleaner)
 * @param {string} type - The account type ('customer' or 'cleaner')
 * @param {HTMLElement} element - The clicked element
 */
function selectAccountType(type, element) {
  // Remove active class from all options
  document
    .querySelectorAll(".type-option")
    .forEach((opt) => opt.classList.remove("active"));

  // Add active class to selected option
  element.classList.add("active");

  // Update hidden input value
  const hiddenInput = document.getElementById("accountType");
  if (hiddenInput) {
    hiddenInput.value = type; // "customer" ou "cleaner"
  }

  console.log("Account type sélectionné :", type);
}

// ========================================
// PASSWORD VISIBILITY TOGGLE
// ========================================

/**
 * Toggles password visibility for a given field
 * @param {string} fieldId - The ID of the password input field
 */
function togglePassword(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  if (!passwordInput) return;

  const currentType = passwordInput.getAttribute("type");
  const newType = currentType === "password" ? "text" : "password";
  passwordInput.setAttribute("type", newType);
}

// ========================================
// PASSWORD STRENGTH CHECKER
// ========================================

/**
 * Calculates and displays password strength
 */
const passwordInput = document.getElementById("password");
if (passwordInput) {
  passwordInput.addEventListener("input", function (e) {
    const password = e.target.value;
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");
    if (!strengthFill || !strengthText) return;

    // Calculate strength score (0-4)
    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;

    // Mixed case check
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;

    // Number check
    if (password.match(/[0-9]/)) strength++;

    // Special character check
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    // Strength indicator colors and labels
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#059669"];
    const texts = ["Weak", "Fair", "Good", "Strong"];
    const widths = ["25%", "50%", "75%", "100%"];

    // Handle empty password
    if (password.length === 0) {
      strengthFill.style.width = "0";
      strengthText.textContent = "Password strength: Weak";
      strengthText.style.color = "#EF4444";
      return;
    }

    // Update strength indicator
    strengthFill.style.width = widths[strength - 1] || "25%";
    strengthFill.style.background = colors[strength - 1] || colors[0];
    strengthText.textContent = `Password strength: ${
      texts[strength - 1] || "Weak"
    }`;
    strengthText.style.color = colors[strength - 1] || colors[0];
  });
}

// ========================================
// CONFIRM PASSWORD VALIDATION
// ========================================

/**
 * Validates that confirm password matches password
 */
const confirmPasswordInput = document.getElementById("confirmPassword");
if (confirmPasswordInput) {
  confirmPasswordInput.addEventListener("input", function (e) {
    const password = document.getElementById("password")?.value || "";
    const confirmPassword = e.target.value;

    // Clear validation if empty
    if (confirmPassword.length === 0) {
      this.classList.remove("error", "success");
      return;
    }

    // Check if passwords match
    if (password === confirmPassword) {
      this.classList.remove("error");
      this.classList.add("success");
    } else {
      this.classList.remove("success");
      this.classList.add("error");
    }
  });
}

// ========================================
// EMAIL VALIDATION (visuelle seulement)
// ========================================

let emailTimeout;
const emailInput = document.getElementById("email");

if (emailInput) {
  emailInput.addEventListener("input", function (e) {
    clearTimeout(emailTimeout);
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Clear previous validation
    this.classList.remove("error", "success");

    // Exit if email doesn't match basic format
    if (!emailRegex.test(email)) return;

    // Simulate API check with debounce (500ms delay)
    emailTimeout = setTimeout(() => {
      // Ici on fait juste une indication visuelle
      this.classList.add("success");
    }, 500);
  });
}

// ========================================
// SOCIAL SIGNUP HANDLERS (démo)
// ========================================

/**
 * Handles social media signup
 * @param {string} provider - The social media provider ('google' or 'facebook')
 */
function signupWith(provider) {
  console.log("Signing up with", provider);
  alert(`Redirecting to ${provider} signup... (This is a demo)`);
}

// ========================================
// INPUT ERROR REMOVAL ON TYPE
// ========================================

/**
 * Remove error state when user starts typing
 */
document.querySelectorAll(".input").forEach((input) => {
  input.addEventListener("input", function () {
    this.classList.remove("error");
  });
});

// ========================================
// FORM INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("CleanUp Create Account page loaded");

  // Set focus on first name field
  document.getElementById("firstName")?.focus();

  // Log current account type
  console.log(
    "Default account type:",
    document.getElementById("accountType")?.value
  );
});
