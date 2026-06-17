document.addEventListener("DOMContentLoaded", () => {
  initSignup();
  initLogin();
  initPasswordToggles();
  clearAutofilledLoginFields();
});

function getUsers() {
  return JSON.parse(localStorage.getItem("dm_users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("dm_users", JSON.stringify(users));
}

function initSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;
  initSignupInputFilters();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);
    let valid = true;
    const fields = ["signupName", "signupUsername", "signupEmail", "signupPhone", "signupPassword", "confirmPassword", "signupRole"];
    fields.forEach((id) => {
      if (!fieldValue(id)) {
        setError(id, "This field is required.");
        valid = false;
      }
    });
    if (fieldValue("signupEmail") && !isEmail(fieldValue("signupEmail"))) {
      setError("signupEmail", "Enter a valid email address.");
      valid = false;
    }
    if (fieldValue("signupName") && !/^[A-Za-z\s]+$/.test(fieldValue("signupName"))) {
      setError("signupName", "Use letters and spaces only.");
      valid = false;
    }
    if (fieldValue("signupUsername") && !/^[A-Za-z]+$/.test(fieldValue("signupUsername"))) {
      setError("signupUsername", "Use letters only.");
      valid = false;
    }
    if (fieldValue("signupPhone") && !isPhone(fieldValue("signupPhone"))) {
      setError("signupPhone", "Use digits only for your phone number.");
      valid = false;
    }
    if (fieldValue("signupPassword") && !isStrongPassword(fieldValue("signupPassword"))) {
      setError("signupPassword", "Use 8+ chars with uppercase, lowercase, number, and symbol.");
      valid = false;
    }
    if (fieldValue("confirmPassword") !== fieldValue("signupPassword")) {
      setError("confirmPassword", "Passwords must match.");
      valid = false;
    }
    if (!document.getElementById("terms").checked) {
      setError("terms", "You must accept the terms.");
      valid = false;
    }
    const users = getUsers();
    if (users.some((user) => user.email.toLowerCase() === fieldValue("signupEmail").toLowerCase())) {
      setError("signupEmail", "An account with this email already exists.");
      valid = false;
    }
    if (users.some((user) => user.username.toLowerCase() === fieldValue("signupUsername").toLowerCase())) {
      setError("signupUsername", "This username is already taken.");
      valid = false;
    }
    if (!valid) return;
    users.push({
      name: fieldValue("signupName"),
      username: fieldValue("signupUsername"),
      email: fieldValue("signupEmail"),
      phone: fieldValue("signupPhone"),
      password: fieldValue("signupPassword"),
      role: fieldValue("signupRole"),
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);
    showToast("Account created successfully. Please login.", "success");
    setTimeout(() => (location.href = "login.html"), 1200);
  });
}

function initSignupInputFilters() {
  const nameInput = document.getElementById("signupName");
  const usernameInput = document.getElementById("signupUsername");
  const phoneInput = document.getElementById("signupPhone");

  if (nameInput) {
    nameInput.addEventListener("input", () => {
      const cleaned = nameInput.value.replace(/[^A-Za-z\s]/g, "");
      if (cleaned !== nameInput.value) nameInput.value = cleaned;
    });
  }

  if (usernameInput) {
    usernameInput.addEventListener("input", () => {
      const cleaned = usernameInput.value.replace(/[^A-Za-z]/g, "");
      if (cleaned !== usernameInput.value) usernameInput.value = cleaned;
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const cleaned = phoneInput.value.replace(/\D/g, "");
      if (cleaned !== phoneInput.value) phoneInput.value = cleaned;
    });
  }
}

function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);
    let valid = true;
    ["loginEmail", "loginPassword", "loginRole"].forEach((id) => {
      if (!fieldValue(id)) {
        setError(id, "This field is required.");
        valid = false;
      }
    });
    if (fieldValue("loginEmail") && !isEmail(fieldValue("loginEmail"))) {
      setError("loginEmail", "Enter a valid email address.");
      valid = false;
    }
    if (!valid) return;
    const enteredEmail = fieldValue("loginEmail");
    const enteredRole = fieldValue("loginRole");
    const enteredPassword = fieldValue("loginPassword");
    const user = getUsers().find((item) => item.email.toLowerCase() === enteredEmail.toLowerCase());
    if (user && user.password !== enteredPassword) {
      setError("loginPassword", "Invalid email or password.");
      return;
    }
    if (user && user.role !== enteredRole) {
      setError("loginRole", "Selected role does not match this account.");
      return;
    }
    const sessionUser = user || {
      name: enteredEmail.split("@")[0].replace(/[._-]+/g, " ") || "Dashboard User",
      username: enteredEmail.split("@")[0],
      email: enteredEmail,
      phone: "",
      password: enteredPassword,
      role: enteredRole,
    };
    if (document.getElementById("rememberMe").checked) {
      localStorage.setItem("dm_remember_email", sessionUser.email);
    } else {
      localStorage.removeItem("dm_remember_email");
    }
    localStorage.setItem(
      "dm_session",
      JSON.stringify({
        name: sessionUser.name,
        username: sessionUser.username,
        email: sessionUser.email,
        role: sessionUser.role,
        createdAt: sessionUser.createdAt || new Date().toISOString(),
        loggedInAt: new Date().toISOString(),
      })
    );
    showToast("Login Successful", "success");
    setTimeout(() => (location.href = "dashboard.html"), 1000);
  });
}

function initPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
      button.innerHTML = input.type === "password" ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });
  });
}

function clearAutofilledLoginFields() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  if (emailInput) {
    emailInput.value = "";
  }
  if (passwordInput) {
    passwordInput.value = "";
  }
}
