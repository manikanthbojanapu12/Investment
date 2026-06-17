document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
});

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors(form);
    let valid = true;
    const required = ["fullName", "email", "phone", "subject", "message"];
    required.forEach((id) => {
      if (!fieldValue(id)) {
        setError(id, "This field is required.");
        valid = false;
      }
    });
    if (fieldValue("email") && !isEmail(fieldValue("email"))) {
      setError("email", "Enter a valid email address.");
      valid = false;
    }
    if (fieldValue("fullName") && !/^[A-Za-z\s]+$/.test(fieldValue("fullName"))) {
      setError("fullName", "Use letters and spaces only.");
      valid = false;
    }
    if (fieldValue("phone") && !isPhone(fieldValue("phone"))) {
      setError("phone", "Use digits only for your phone number.");
      valid = false;
    }
    if (!valid) return;
    const messages = JSON.parse(localStorage.getItem("dm_contact_messages") || "[]");
    messages.push({
      name: fieldValue("fullName"),
      email: fieldValue("email"),
      phone: fieldValue("phone"),
      subject: fieldValue("subject"),
      message: fieldValue("message"),
      date: new Date().toISOString(),
    });
    localStorage.setItem("dm_contact_messages", JSON.stringify(messages));
    form.reset();
    showToast("Your message has been sent successfully.", "success");
  });
}
document.addEventListener('DOMContentLoaded', () => {
  const placeholderMap = [
    { selector: 'input[name*="name"], input[id*="name"]', value: 'Enter your full name' },
    { selector: 'input[type="email"], input[name*="email"], input[id*="email"]', value: 'Enter your email address' },
    { selector: 'input[type="tel"], input[name*="phone"], input[id*="phone"]', value: 'Enter digits only' },
    { selector: 'input[name*="subject"], input[id*="subject"]', value: 'Enter subject' },
    { selector: 'textarea[name*="message"], textarea[id*="message"]', value: 'Write your message' },
  ];

  placeholderMap.forEach(({ selector, value }) => {
    document.querySelectorAll(selector).forEach((field) => {
      if (!field.getAttribute('placeholder')) {
        field.setAttribute('placeholder', value);
      }
    });
  });

  document.querySelectorAll('input[type="tel"], input[data-digits-only="true"]').forEach((field) => {
    field.addEventListener('input', () => {
      const cleaned = field.value.replace(/\D/g, '');
      if (cleaned !== field.value) field.value = cleaned;
    });
  });

  document.querySelectorAll('input[data-letters-only="true"]').forEach((field) => {
    field.addEventListener('input', () => {
      const cleaned = field.value.replace(/[^A-Za-z\s]/g, '');
      if (cleaned !== field.value) field.value = cleaned;
    });
  });
});
