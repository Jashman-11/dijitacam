import "./style.css";
import camerasData from "./data/cameras.json";
import type { Camera } from "./data/types";
import { HeroScene } from "./scene/heroScene";
import { renderCatalog } from "./ui/catalog";

const cameras = camerasData as Camera[];

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="noise" aria-hidden="true"></div>

  <header class="site-header">
    <a class="brand" href="#top">
      <span class="brand__mark" aria-hidden="true"></span>
      DijitaCam
    </a>
    <nav class="site-nav" aria-label="Primary">
      <a href="#catalog">Catalog</a>
      <a href="#trust">Tested &amp; Trusted</a>
      <a href="#contact">Contact</a>
    </nav>
    <a class="btn-ghost" href="https://www.instagram.com/dijitacam/" target="_blank" rel="noopener noreferrer">
      Follow
    </a>
  </header>

  <main id="top">
    <section class="hero" id="hero">
      <div class="hero__canvas" id="hero-canvas" aria-hidden="true"></div>
      <div class="hero__copy">
        <p class="eyebrow">Jordan &middot; used digital cameras</p>
        <h1 class="h1">Frame it with<br />DijitaCam</h1>
        <p class="body-lg">
          Every body tested, cleaned and trusted before it reaches you.
          Drag a camera below to see it from every angle.
        </p>
        <div class="hero__actions">
          <a class="btn-primary" href="#catalog">Shop the catalog</a>
          <a class="btn-ghost" href="https://www.instagram.com/dijitacam/" target="_blank" rel="noopener noreferrer">@dijitacam</a>
        </div>
      </div>
      <p class="hero__hint">Drag a camera to rotate it &darr;</p>
    </section>

    <section class="trust" id="trust">
      <div class="trust__item">
        <span class="trust__num">548+</span>
        <span class="trust__label">followers trust the feed</span>
      </div>
      <div class="trust__item">
        <span class="trust__num">26</span>
        <span class="trust__label">bodies sold &amp; counting</span>
      </div>
      <div class="trust__item">
        <span class="trust__num">100%</span>
        <span class="trust__label">tested before listing</span>
      </div>
    </section>

    <section class="catalog-section" id="catalog">
      <div class="catalog-section__head">
        <p class="eyebrow">The catalog</p>
        <h2 class="h2">Pick your next body</h2>
        <p class="body-lg">Prices in Jordanian Dinar. Stock updates as bodies sell — what you see is what's left.</p>
      </div>
      <div class="catalog-grid" id="catalog-grid"></div>
    </section>

    <section class="contact" id="contact">
      <p class="eyebrow">Get in touch</p>
      <h2 class="h2">Can't find the body you want?</h2>
      <p class="body-lg">DM us your wishlist on Instagram or send a note and we'll hunt it down.</p>
      <a class="btn-primary" href="https://www.instagram.com/dijitacam/" target="_blank" rel="noopener noreferrer">
        Message @dijitacam
      </a>
    </section>
  </main>

  <footer class="site-footer">
    <span>&copy; ${new Date().getFullYear()} DijitaCam &middot; Amman, Jordan</span>
    <div class="site-footer__links">
      <a href="https://www.instagram.com/dijitacam/" target="_blank" rel="noopener noreferrer">Instagram</a>
    </div>
  </footer>
`;

// — mount 3D hero —
const canvasMount = document.querySelector<HTMLDivElement>("#hero-canvas")!;
const heroScene = new HeroScene(canvasMount, cameras.filter((c) => c.inStock));

const heroSection = document.querySelector<HTMLElement>("#hero")!;
function updateScroll() {
  const rect = heroSection.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.9)));
  heroScene.setScrollProgress(progress);
}
window.addEventListener("scroll", updateScroll, { passive: true });
updateScroll();

// — render catalog —
const catalogGrid = document.querySelector<HTMLDivElement>("#catalog-grid")!;
renderCatalog(catalogGrid, cameras);

// — reveal-on-scroll for catalog cards —
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 },
);
document.querySelectorAll(".cam-card").forEach((el) => revealObserver.observe(el));
