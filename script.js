// Enquiry form: client-side validation + FormSubmit AJAX submit.
// Without JS the form still posts natively to FormSubmit (their hosted thank-you page).
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var form = document.getElementById("enquiry-form");
  if (!form || !window.fetch || !window.FormData) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn.textContent;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var PHONE_RE = /^[0-9+()\s-]{8,20}$/;
  var submitting = false;

  var rules = {
    name: function (v) { return v ? "" : "Enter your name."; },
    business: function (v) { return v ? "" : "Enter your business name."; },
    email: function (v) {
      if (!v) return "Enter your email address.";
      return EMAIL_RE.test(v) ? "" : "Enter an email address like name@business.com.au.";
    },
    phone: function (v) {
      if (!v) return "";
      return PHONE_RE.test(v) ? "" : "Enter a phone number using digits only, like 0412 345 678.";
    },
    message: function (v) { return v ? "" : "Tell us a little about your business."; }
  };

  function showFieldError(input, message) {
    var errorEl = document.getElementById(input.id + "-error");
    if (message) {
      input.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
      errorEl.hidden = true;
    }
  }

  function validateField(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var message = rule(input.value.trim());
    showFieldError(input, message);
    return !message;
  }

  function validateAll() {
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    return firstInvalid;
  }

  function setStatus(type, message) {
    statusEl.className = "form__status" + (type ? " form__status--" + type : "");
    statusEl.textContent = message;
  }

  // Re-validate on blur only once a field has been flagged, so we don't nag mid-typing.
  form.addEventListener("focusout", function (e) {
    if (e.target.getAttribute && e.target.getAttribute("aria-invalid") === "true") {
      validateField(e.target);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitting) return;

    var firstInvalid = validateAll();
    if (firstInvalid) {
      setStatus("error", "Some details need fixing before we can send this.");
      firstInvalid.focus();
      return;
    }

    var endpoint = form.getAttribute("data-ajax-action");
    if (!endpoint) {
      // No AJAX endpoint configured: fall back to a normal form post.
      form.submit();
      return;
    }

    submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    setStatus("", "");

    var payload = {};
    new FormData(form).forEach(function (value, key) { payload[key] = String(value).trim(); });

    var controller = window.AbortController ? new AbortController() : null;
    var timeout = setTimeout(function () { if (controller) controller.abort(); }, 15000);

    fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, status: res.status, data: data };
        });
      })
      .then(function (result) {
        // FormSubmit returns success as the string "true"/"false".
        if (result.ok && result.data && String(result.data.success) === "true") {
          var firstName = form.elements.name.value.trim().split(/\s+/)[0];
          form.reset();
          setStatus("success", "Thanks, " + firstName + ". Your chat request is in. We'll be in touch within one business day to book a time.");
          statusEl.focus();
          return;
        }
        // FormSubmit reports problems (e.g. "This form needs Activation") in data.message with HTTP 200.
        var reason = result.data && result.data.message ? result.data.message : "no message";
        console.error("Enquiry form: FormSubmit rejected the submission (HTTP " + result.status + "): " + reason);
        setStatus("error", "Your enquiry didn't send. Try again, or email hello@sortedsites.com.au.");
      })
      .catch(function (err) {
        console.error("Enquiry form: network error", err);
        setStatus("error", err && err.name === "AbortError"
          ? "Sending took too long. Check your connection and try again, or email hello@sortedsites.com.au."
          : "Your enquiry didn't send. Check your connection and try again, or email hello@sortedsites.com.au.");
      })
      .then(function () {
        clearTimeout(timeout);
        submitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      });
  });
})();
