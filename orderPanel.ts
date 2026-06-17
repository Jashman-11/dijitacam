import type { Camera } from "../data/types";

/**
 * Free form handling: Formspree's free tier accepts POSTs from a plain
 * <form> with no backend or API key required (50 submissions/month).
 * Replace FORMSPREE_ENDPOINT with your own form id from formspree.io —
 * until then this falls back to a mailto: link so the form never breaks.
 */
const FORMSPREE_ENDPOINT = ""; // e.g. "https://formspree.io/f/abc123xy"
const STORE_EMAIL = "hello@dijitacam.example";

let activePanel: HTMLDivElement | null = null;

export function openOrderPanel(cam: Camera) {
  closeOrderPanel();

  const overlay = document.createElement("div");
  overlay.className = "order-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", `Order ${cam.brand} ${cam.model}`);

  overlay.innerHTML = `
    <div class="order-panel">
      <button class="order-close" aria-label="Close order form" type="button">&times;</button>
      <p class="eyebrow">Reserve this body</p>
      <h3 class="order-title">${escapeHtml(cam.brand)} ${escapeHtml(cam.model)}</h3>
      <p class="order-price">${cam.priceJOD} JOD &middot; ${cam.inStock ? "In stock" : "Waitlist"}</p>

      ${
        FORMSPREE_ENDPOINT
          ? `<form class="order-form" id="order-form">
              <input type="hidden" name="camera" value="${escapeHtml(cam.brand)} ${escapeHtml(cam.model)}" />
              <label class="field">
                <span>Your name</span>
                <input type="text" name="name" required autocomplete="name" />
              </label>
              <label class="field">
                <span>Phone or Instagram handle</span>
                <input type="text" name="contact" required placeholder="+962… or @yourhandle" />
              </label>
              <label class="field">
                <span>Note (optional)</span>
                <textarea name="note" rows="2" placeholder="Pickup city, color preference, anything else"></textarea>
              </label>
              <button type="submit" class="btn-primary">Send order request</button>
              <p class="order-status" aria-live="polite"></p>
            </form>`
          : `<p class="order-fallback-note">Email us directly to reserve this camera — we reply fast.</p>
            <a class="btn-primary" href="mailto:${STORE_EMAIL}?subject=${encodeURIComponent(
              `Order: ${cam.brand} ${cam.model}`,
            )}&body=${encodeURIComponent(
              `Hi DijitaCam,\n\nI'd like to order the ${cam.brand} ${cam.model} (${cam.priceJOD} JOD).\n\nName:\nPhone/Instagram:\nPickup city:\n`,
            )}">Email to order</a>`
      }
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  activePanel = overlay;

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeOrderPanel();
  });
  overlay.querySelector(".order-close")?.addEventListener("click", closeOrderPanel);

  const form = overlay.querySelector<HTMLFormElement>("#order-form");
  if (form && FORMSPREE_ENDPOINT) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = overlay.querySelector(".order-status")!;
      const submitBtn = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
      submitBtn.disabled = true;
      status.textContent = "Sending…";

      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (res.ok) {
          status.textContent = "Request sent — we'll reach out shortly.";
          form.reset();
        } else {
          throw new Error("Form submission failed");
        }
      } catch {
        status.textContent = "Couldn't send. Try the email link instead, or DM us on Instagram.";
        submitBtn.disabled = false;
      }
    });
  }

  requestAnimationFrame(() => overlay.classList.add("is-open"));

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeOrderPanel();
  };
  window.addEventListener("keydown", escHandler, { once: true });
}

export function closeOrderPanel() {
  if (!activePanel) return;
  activePanel.remove();
  activePanel = null;
  document.body.style.overflow = "";
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
