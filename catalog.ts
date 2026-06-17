import type { Camera } from "../data/types";
import { openOrderPanel } from "./orderPanel";

export function renderCatalog(container: HTMLElement, cameras: Camera[]) {
  container.innerHTML = "";

  cameras.forEach((cam, i) => {
    const card = document.createElement("article");
    card.className = "cam-card";
    card.style.setProperty("--accent", cam.color);
    card.style.setProperty("--reveal-delay", `${i * 70}ms`);

    card.innerHTML = `
      <div class="cam-card__swatch" aria-hidden="true">
        <span class="cam-card__lens"></span>
      </div>
      <div class="cam-card__body">
        <p class="eyebrow">${escapeHtml(cam.brand)}</p>
        <h3 class="cam-card__model">${escapeHtml(cam.model)}</h3>
        <p class="cam-card__tagline">${escapeHtml(cam.tagline)}</p>

        <ul class="cam-card__specs">
          <li>${cam.megapixels}MP</li>
          <li>${escapeHtml(cam.zoom)} zoom</li>
          <li>${renderCondition(cam.condition)}</li>
        </ul>

        <div class="cam-card__footer">
          <span class="cam-card__price">${cam.priceJOD} <small>JOD</small></span>
          <button class="btn-order" type="button" ${cam.inStock ? "" : "disabled"}>
            ${cam.inStock ? "Order this body" : "Join waitlist"}
          </button>
        </div>
      </div>
    `;

    card.querySelector(".btn-order")?.addEventListener("click", () => openOrderPanel(cam));
    container.appendChild(card);
  });
}

function renderCondition(level: Camera["condition"]): string {
  const labels = ["", "Fair", "Good", "Very good", "Excellent", "Mint"];
  return `${labels[level]} cond.`;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
