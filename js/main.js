/**
 * Arte & Pintura — navigation + lead form
 *
 * Default: FormSubmit.co (static-friendly) → email to Clebert.
 * First real submit: FormSubmit sends a confirmation link to that inbox — click once.
 * Optional: set FORMSPREE_ENDPOINT to use Formspree instead.
 *
 * LP forms may set:
 *   data-subject="Lead LP Natal"
 *   data-next="/obrigado.html"
 *   data-campaign="natal"
 */
(function () {
  "use strict";

  var LEAD_EMAIL = "clebertsfigueiredo@gmail.com";
  var FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/" + LEAD_EMAIL;
  var FORMSPREE_ENDPOINT = "";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  /** (11) 98888-7777 or (11) 3333-4444 */
  function maskBrazilPhone(value) {
    var d = onlyDigits(value).slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) {
      return (
        "(" +
        d.slice(0, 2) +
        ") " +
        d.slice(2, 6) +
        "-" +
        d.slice(6)
      );
    }
    return (
      "(" +
      d.slice(0, 2) +
      ") " +
      d.slice(2, 7) +
      "-" +
      d.slice(7)
    );
  }

  function isValidBrazilPhone(value) {
    var d = onlyDigits(value);
    return d.length === 10 || d.length === 11;
  }

  document.querySelectorAll('[name="telefone"]').forEach(function (input) {
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "tel");
    input.setAttribute("maxlength", "15");
    input.setAttribute("placeholder", "(87) 99999-0000");

    input.addEventListener("input", function () {
      var start = input.selectionStart;
      var before = input.value;
      input.value = maskBrazilPhone(input.value);
      if (document.activeElement === input) {
        var pos = input.value.length;
        if (before.length > input.value.length && start != null) {
          pos = Math.min(start, input.value.length);
        }
        try {
          input.setSelectionRange(pos, pos);
        } catch (e) {}
      }
    });

    input.addEventListener("blur", function () {
      if (input.value) input.value = maskBrazilPhone(input.value);
    });
  });

  document.querySelectorAll("[data-lead-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var nome = ((form.querySelector('[name="nome"]') || {}).value || "").trim();
      var telefoneInput = form.querySelector('[name="telefone"]');
      var telefone = ((telefoneInput || {}).value || "").trim();
      var cidadeEl =
        form.querySelector('[name="cidade"]:checked') ||
        form.querySelector('[name="cidade"]');
      var cidade = ((cidadeEl || {}).value || "").trim();
      var resumo = ((form.querySelector('[name="resumo"]') || {}).value || "").trim();
      var statusEl = form.querySelector(".form-status");
      var btn = form.querySelector('[type="submit"]');
      var customSubject = form.getAttribute("data-subject");
      var nextUrl = form.getAttribute("data-next") || "/obrigado.html";
      var campaign = form.getAttribute("data-campaign") || "";

      if (telefoneInput) {
        telefoneInput.value = maskBrazilPhone(telefone);
        telefone = telefoneInput.value;
      }

      if (!nome || !telefone || !cidade || !resumo) {
        showStatus(statusEl, "Preencha todos os campos.", true);
        return;
      }

      if (!isValidBrazilPhone(telefone)) {
        showStatus(
          statusEl,
          "Informe um telefone válido com DDD, ex.: (87) 99999-0000.",
          true
        );
        if (telefoneInput) telefoneInput.focus();
        return;
      }

      var endpoint = FORMSPREE_ENDPOINT || FORMSUBMIT_ENDPOINT;
      if (btn) btn.disabled = true;
      showStatus(statusEl, "Enviando…", false);

      var subject =
        customSubject ||
        "Orçamento Arte & Pintura — " + nome + " (" + cidade + ")";

      var payload = {
        nome: nome,
        telefone: telefone,
        cidade: cidade,
        resumo: resumo,
        _subject: subject,
        _template: "table",
      };
      if (campaign) payload.campanha = campaign;

      fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            if (!res.ok) throw new Error((data && data.message) || "Falha no envio");
            return data;
          });
        })
        .then(function () {
          window.location.href = nextUrl;
        })
        .catch(function () {
          showStatus(
            statusEl,
            "Não foi possível enviar agora. Tente de novo em instantes ou escreva para " +
              LEAD_EMAIL +
              ".",
            true
          );
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  });

  function showStatus(el, msg, isError) {
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    el.classList.toggle("is-error", !!isError);
    el.classList.toggle("is-ok", !isError);
  }
})();
