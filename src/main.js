import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./input.css";
import {
  i18n,
  initI18n,
  applyTranslations,
  changeLanguage,
} from "./i18n/index.js";
gsap.registerPlugin(ScrollTrigger);
const updateLanguageButtons = (language) => {
  document.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === language;

    button.setAttribute("aria-pressed", String(isActive));

    button.classList.toggle("bg-ink", isActive);
    button.classList.toggle("text-white", isActive);

    button.classList.toggle("text-ink", !isActive);
    button.classList.toggle("hover:bg-ink/5", !isActive);
  });
};

const initializeLanguage = async () => {
  await initI18n();

  applyTranslations();
  updateLanguageButtons(document.documentElement.lang);

  document.querySelectorAll("button[data-language]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const language = button.dataset.language;

        await changeLanguage(language);
        updateLanguageButtons(language);

        // Refresh the article if its modal is currently open.
        if (currentArticleId && modal && !modal.classList.contains("hidden")) {
          renderArticle(currentArticleId);
        }
      } catch (error) {
        console.error("Failed to change language:", error);
      }
    });
  });
};

await initializeLanguage();

const html = document.documentElement;
const body = document.body;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Mobile navigation
const menuToggle = document.querySelector("#menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
const openIcon = document.querySelector("#menu-open-icon");
const closeIcon = document.querySelector("#menu-close-icon");

function closeMobileMenu() {
  if (!menuToggle || !mobileNav) return;
  mobileNav.classList.add("hidden");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "باز کردن منو");
  openIcon?.classList.remove("hidden");
  closeIcon?.classList.add("hidden");
}

menuToggle?.addEventListener("click", () => {
  if (!mobileNav) return;
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  mobileNav.classList.toggle("hidden", isOpen);
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "باز کردن منو" : "بستن منو");
  openIcon?.classList.toggle("hidden", !isOpen);
  closeIcon?.classList.toggle("hidden", isOpen);
});

mobileNav
  ?.querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMobileMenu));
window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth >= 1024) closeMobileMenu();
  },
  { passive: true },
);

// Current section indicator in the desktop nav.
const navLinks = [...document.querySelectorAll(".nav-link")];
const sectionObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
              const current =
                link.getAttribute("href") === `#${entry.target.id}`;
              link.classList.toggle("is-current", current);
              if (current) link.setAttribute("aria-current", "location");
              else link.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
      )
    : null;

document
  .querySelectorAll("main section[id]")
  .forEach((section) => sectionObserver?.observe(section));

// Multilingual article modal.
const modal = document.querySelector("#article-modal");
const modalTitle = document.querySelector("#modal-title");
const modalCategory = document.querySelector("#modal-category");
const modalBody = document.querySelector("#modal-body");
const modalClose = document.querySelector("#modal-close");

let lastFocusedElement = null;
let currentArticleId = null;

function renderArticle(articleId) {
  const article = i18n.t(`articles.${articleId}`, {
    returnObjects: true,
  });

  if (
    !article ||
    typeof article !== "object" ||
    typeof article.title !== "string" ||
    typeof article.category !== "string" ||
    !Array.isArray(article.paragraphs) ||
    !modalTitle ||
    !modalCategory ||
    !modalBody
  ) {
    console.error(`Invalid article translation: ${articleId}`);
    return false;
  }

  modalTitle.textContent = article.title;

  const categoryLabel = document.createElement("span");
  categoryLabel.className = "kicker-dash";

  modalCategory.replaceChildren(
    categoryLabel,
    document.createTextNode(` ${article.category}`),
  );

  const paragraphs = article.paragraphs.map((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    return p;
  });

  modalBody.replaceChildren(...paragraphs);

  return true;
}

function openArticle(articleId, triggerElement) {
  if (!modal || !modalTitle || !modalCategory || !modalBody) {
    return;
  }

  if (!renderArticle(articleId)) {
    return;
  }

  currentArticleId = articleId;
  lastFocusedElement = triggerElement;

  modal.classList.remove("hidden");
  body.classList.add("modal-open");

  modalClose?.focus();
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  body.classList.remove("modal-open");

  currentArticleId = null;
  lastFocusedElement?.focus();
  lastFocusedElement = null;
}

document.querySelectorAll("[data-article]").forEach((button) => {
  button.addEventListener("click", () => {
    openArticle(button.dataset.article, button);
  });
});

modalClose?.addEventListener("click", closeModal);

modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// Article category filtering.
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const articleCards = [
  ...document.querySelectorAll(".article-card[data-category]"),
];
const emptyFilterState = document.querySelector("#empty-filter-state");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    articleCards.forEach((card) => {
      const visible = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !visible);
      if (visible) visibleCount += 1;
    });
    emptyFilterState?.classList.toggle("hidden", visibleCount !== 0);
  });
});

// Contact form: UI validation only, no network request is sent.
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity() || !formStatus) return;
  formStatus.textContent =
    "فرم از نظر ظاهری بررسی شد؛ اما اطلاعات هنوز ارسال نشده است. برای دریافت واقعی درخواست‌ها، این فرم را به بک‌اند یا سرویس ایمیل متصل کنید.";
  formStatus.classList.remove("hidden");
});

// Motion and media enhancements: keep the content readable without motion, GSAP, or external media.
const revealTargets = [...document.querySelectorAll("[data-reveal]")];
if (!reducedMotion && "IntersectionObserver" in window) {
  body.classList.add("js-motion");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
  );
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

// Lazy-load below-the-fold images with IntersectionObserver.
// The page ships with a 1px placeholder; a real image is requested only near the viewport.
const lazyImages = [...document.querySelectorAll("img[data-lazy-src]")];
function loadLazyImage(image) {
  const source = image.dataset.lazySrc;
  if (!source) return;
  image.addEventListener("load", () => image.classList.add("is-loaded"), {
    once: true,
  });
  image.addEventListener(
    "error",
    () => {
      image.classList.add("is-loaded", "has-load-error");
      image.removeAttribute("data-lazy-src");
    },
    { once: true },
  );
  image.src = source;
  image.removeAttribute("data-lazy-src");
}
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadLazyImage(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "320px 0px", threshold: 0.01 },
  );
  lazyImages.forEach((image) => imageObserver.observe(image));
} else {
  lazyImages.forEach(loadLazyImage);
}

// Load the provided YouTube video only when the hero is near the viewport.
// It remains muted, loops through the single clip, and pauses when the hero leaves view.
const heroSection = document.querySelector("#home");
const heroVideoFrame = document.querySelector("#hero-background-video");
let heroVideoLoaded = false;
function sendYouTubeCommand(command) {
  if (!heroVideoLoaded || !heroVideoFrame?.contentWindow) return;
  heroVideoFrame.contentWindow.postMessage(
    JSON.stringify({ event: "command", func: command, args: [] }),
    "*",
  );
}
function loadHeroVideo() {
  if (!heroVideoFrame || heroVideoLoaded || reducedMotion) return;
  const source = heroVideoFrame.dataset.videoSrc;
  if (!source) return;
  try {
    const videoURL = new URL(source);
    if (window.location.origin && window.location.origin !== "null")
      videoURL.searchParams.set("origin", window.location.origin);
    heroVideoFrame.src = videoURL.toString();
    heroVideoLoaded = true;
    heroSection?.classList.add("has-background-video");
  } catch (error) {
    console.warn(
      "پس‌زمینه ویدیویی بارگذاری نشد؛ تصویر جایگزین حفظ می‌شود.",
      error,
    );
  }
}
if (
  heroSection &&
  heroVideoFrame &&
  !reducedMotion &&
  "IntersectionObserver" in window
) {
  const heroVideoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadHeroVideo();
          window.setTimeout(() => sendYouTubeCommand("playVideo"), 500);
        } else {
          sendYouTubeCommand("pauseVideo");
        }
      });
    },
    { threshold: 0.08, rootMargin: "120px 0px" },
  );
  heroVideoObserver.observe(heroSection);
} else if (heroSection && heroVideoFrame && !reducedMotion) {
  loadHeroVideo();
}

// Typewriter: cycles through positioning statements, but leaves a useful static fallback for reduced motion.

const typewriter = document.querySelector("[data-typewriter]");

if (typewriter && !reducedMotion) {
  let words = [];
  let wordIndex = 0;
  let characters = [];
  let characterIndex = 0;
  let deleting = false;
  let typeTimer = 0;

  const loadWords = () => {
    try {
      const parsedWords = JSON.parse(typewriter.dataset.words || "[]");
      words = Array.isArray(parsedWords) ? parsedWords : [];
    } catch {
      words = [];
    }

    wordIndex = 0;
    characters = Array.from(words[wordIndex] || "");
    characterIndex = 0;
    deleting = false;
    typewriter.textContent = characters.length ? "" : "";
  };

  const tick = () => {
    if (document.hidden) {
      typeTimer = window.setTimeout(tick, 500);
      return;
    }

    if (!words.length) return;

    characters = Array.from(words[wordIndex]);

    if (!deleting) {
      characterIndex = Math.min(characterIndex + 1, characters.length);
      typewriter.textContent = characters.slice(0, characterIndex).join("");

      if (characterIndex >= characters.length) {
        deleting = true;
        typeTimer = window.setTimeout(tick, 1650);
        return;
      }

      typeTimer = window.setTimeout(tick, 78);
    } else {
      characterIndex = Math.max(0, characterIndex - 1);
      typewriter.textContent = characters.slice(0, characterIndex).join("");

      if (characterIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeTimer = window.setTimeout(tick, 320);
        return;
      }

      typeTimer = window.setTimeout(tick, 38);
    }
  };

  const restartTypewriter = () => {
    window.clearTimeout(typeTimer);
    loadWords();
    typeTimer = window.setTimeout(tick, 250);
  };

  loadWords();
  typeTimer = window.setTimeout(tick, 1700);

  document.addEventListener("visibilitychange", () => {
    window.clearTimeout(typeTimer);

    if (!document.hidden) {
      typeTimer = window.setTimeout(tick, 250);
    }
  });

  // Watch for changes to the translated data-words attribute.
  const observer = new MutationObserver(() => {
    restartTypewriter();
  });

  observer.observe(typewriter, {
    attributes: true,
    attributeFilter: ["data-words"],
  });
}

function updateFramework(progress) {
  const index = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  const stepNumber = index + 1;

  document.querySelectorAll("[data-step]").forEach((step) => {
    step.classList.toggle(
      "is-active",
      Number(step.dataset.step) === index
    );
  });

  const title = document.querySelector("#framework-caption-title");
  const desc = document.querySelector("#framework-caption-desc");

  const translatedTitle = i18n.t(
    `framework.captionStep${stepNumber}Title`
  );
  const translatedDesc = i18n.t(
    `framework.captionStep${stepNumber}Desc`
  );

  if (title && title.textContent !== translatedTitle) {
    title.textContent = translatedTitle;
  }

  if (desc && desc.textContent !== translatedDesc) {
    desc.textContent = translatedDesc;
  }
}

function updateStoryCopy(progress) {
  const index = progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2;
  const stepNumber = index + 1;

  const translatedTitle = i18n.t(
    `story.captionStep${stepNumber}Title`
  );
  const translatedSubtitle = i18n.t(
    `story.captionStep${stepNumber}Subtitle`
  );

  const title = document.querySelector("#story-caption-title");
  const subtitle = document.querySelector("#story-caption-subtitle");
  const videoTitle = document.querySelector("#story-video-title");

  if (title && title.textContent !== translatedTitle) {
    title.textContent = translatedTitle;
  }

  if (subtitle && subtitle.textContent !== translatedSubtitle) {
    subtitle.textContent = translatedSubtitle;
  }

  if (videoTitle && videoTitle.textContent !== translatedTitle) {
    videoTitle.textContent = translatedTitle;
  }
}

if (!reducedMotion) {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero entrance: text moves in with a short stagger over the blurred, looping video.
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(".hero-eyebrow", { y: 22, autoAlpha: 0, duration: 0.55 })
      .from(
        ".hero-title-inner",
        { yPercent: 118, autoAlpha: 0, duration: 0.82, stagger: 0.13 },
        "-=0.18",
      )
      .from(
        ".hero-description, .hero-actions, .hero-credentials",
        { y: 24, autoAlpha: 0, duration: 0.62, stagger: 0.12 },
        "-=0.3",
      )
      .from(
        ".hero-bottom-row",
        { y: 18, autoAlpha: 0, duration: 0.55 },
        "-=0.25",
      );

    // Stronger, observable parallax on the full-bleed video backdrop.
    gsap.to(".hero-video-parallax", {
      yPercent: 13,
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: 0.75,
      },
    });
    gsap.to(".hero-orb-one", {
      yPercent: 46,
      xPercent: -10,
      rotation: 18,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });
    gsap.to(".hero-orb-two", {
      yPercent: -35,
      xPercent: 12,
      rotation: -22,
      ease: "none",
      scrollTrigger: {
        trigger: "#home",
        start: "top top",
        end: "bottom top",
        scrub: 1.1,
      },
    });

    // Real image parallax: taller media moves inside a clipped frame, so the layout doesn't jump.
    gsap.to(".about-image-wrap img", {
      yPercent: -12,
      scale: 1.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-visual",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.75,
      },
    });
    gsap.to(".voice-photo-wrap img", {
      yPercent: -10,
      scale: 1.12,
      ease: "none",
      scrollTrigger: {
        trigger: ".voice-visual",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
    gsap.to(".story-poster", {
      scale: 1.14,
      yPercent: -3,
      transformOrigin: "center center",
      ease: "none",
      scrollTrigger: {
        trigger: "#story",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.9,
      },
    });

    // Section headings have a separate, scroll-triggered text entrance.
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.from(title, {
        y: 34,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: title, start: "top 88%", once: true },
      });
    });

    gsap.from(".authority-item", {
      y: 24,
      autoAlpha: 0,
      stagger: 0.14,
      duration: 0.65,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".authority-strip",
        start: "top 85%",
        once: true,
      },
    });
    gsap.from(".expertise-row", {
      x: 34,
      autoAlpha: 0,
      stagger: 0.14,
      duration: 0.72,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".expertise-list",
        start: "top 82%",
        once: true,
      },
    });
    gsap.from(".book-main", {
      y: 55,
      rotateZ: -4,
      rotateY: -24,
      autoAlpha: 0,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: { trigger: ".book-stage", start: "top 78%", once: true },
    });
    gsap.from(".book-back-one", {
      x: 36,
      rotateZ: -13,
      autoAlpha: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: ".book-stage", start: "top 78%", once: true },
    });
    gsap.from(".book-back-two", {
      x: -35,
      rotateZ: 14,
      autoAlpha: 0,
      duration: 0.85,
      delay: 0.08,
      ease: "power3.out",
      scrollTrigger: { trigger: ".book-stage", start: "top 78%", once: true },
    });
    gsap.from(".article-card", {
      y: 42,
      autoAlpha: 0,
      stagger: 0.12,
      duration: 0.72,
      ease: "power3.out",
      scrollTrigger: { trigger: "#article-grid", start: "top 85%", once: true },
    });
    gsap.from(".voice-offers > div", {
      x: 24,
      autoAlpha: 0,
      stagger: 0.1,
      duration: 0.58,
      ease: "power2.out",
      scrollTrigger: { trigger: ".voice-offers", start: "top 88%", once: true },
    });

    // Scrubbed visual narrative with timeline labels and a progress line.
    const storyTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#story",
        start: "top 70%",
        end: "bottom 35%",
        scrub: 0.7,
        onUpdate: (self) => {
          updateStoryCopy(self.progress);
          const progressBar = document.querySelector("#story-progress-bar");
          if (progressBar) progressBar.style.width = `${self.progress * 100}%`;
        },
      },
    });
    storyTimeline
      .to(
        ".shape-a",
        { scale: 0.75, rotation: 38, transformOrigin: "center", ease: "none" },
        0,
      )
      .to(
        ".shape-b",
        {
          scale: 1.55,
          xPercent: -16,
          yPercent: 12,
          rotation: -32,
          ease: "none",
        },
        0,
      )
      .to(
        ".shape-c",
        { scale: 2.4, xPercent: 40, yPercent: -15, ease: "none" },
        0,
      )
      .to(
        ".story-giant-word",
        { xPercent: -12, yPercent: -12, scale: 1.18, ease: "none" },
        0,
      )
      .to(
        ".story-lines span",
        {
          scaleY: 0.45,
          stagger: 0.05,
          transformOrigin: "center",
          ease: "none",
        },
        0,
      );

    // Diagram transitions from insight to alignment to action as the user scrolls.
    const frameworkTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#framework",
        start: "top 65%",
        end: "bottom 30%",
        scrub: 0.75,
        onUpdate: (self) => updateFramework(self.progress),
      },
    });
    frameworkTimeline
      .to(
        ".orbit-a",
        { rotation: 110, transformOrigin: "300px 300px", ease: "none" },
        0,
      )
      .to(
        ".orbit-b",
        { rotation: -65, transformOrigin: "300px 300px", ease: "none" },
        0,
      )
      .to(
        ".orbit-c",
        { scale: 1.18, transformOrigin: "300px 300px", ease: "none" },
        0,
      )
      .to(".orbit-path", { strokeDashoffset: -150, ease: "none" }, 0)
      .to(
        ".framework-core",
        { scale: 1.08, transformOrigin: "300px 300px", ease: "none" },
        0,
      );

    // Scroll-scrub the locally bundled story video; it is independent from the YouTube hero.
    const brandFilm = document.querySelector("#brand-film");
    const filmSource = brandFilm?.dataset.videoSrc?.trim();
    if (brandFilm && filmSource) {
      const initScrubVideo = () => {
        if (brandFilm.dataset.scrubReady === "true") return;
        brandFilm.dataset.scrubReady = "true";
        brandFilm.src = filmSource;
        brandFilm.classList.add("is-enabled");
        document
          .querySelector("#story-video-overlay")
          ?.classList.add("is-visible");
        brandFilm.addEventListener(
          "loadedmetadata",
          () => {
            if (!Number.isFinite(brandFilm.duration) || brandFilm.duration <= 0)
              return;
            ScrollTrigger.refresh();
            gsap.to(brandFilm, {
              currentTime: brandFilm.duration,
              ease: "none",
              scrollTrigger: {
                trigger: "#story",
                start: "top 75%",
                end: "bottom 25%",
                scrub: 0.4,
                onUpdate: () => {
                  if (brandFilm.readyState >= 2) brandFilm.pause();
                },
              },
            });
          },
          { once: true },
        );
        brandFilm.addEventListener(
          "error",
          () => {
            brandFilm.classList.remove("is-enabled");
            document
              .querySelector("#story-video-overlay")
              ?.classList.remove("is-visible");
          },
          { once: true },
        );
      };
      if ("IntersectionObserver" in window) {
        const filmObserver = new IntersectionObserver(
          (entries, observer) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            initScrubVideo();
            observer.disconnect();
          },
          { rootMargin: "240px 0px" },
        );
        filmObserver.observe(
          document.querySelector("#story-frame") || brandFilm,
        );
      } else {
        initScrubVideo();
      }
    }

    // Refresh measurements after lazy images receive their intrinsic dimensions.
    lazyImages.forEach((image) =>
      image.addEventListener("load", () => ScrollTrigger.refresh(), {
        once: true,
      }),
    );
    window.addEventListener("load", () => ScrollTrigger.refresh(), {
      once: true,
    });
    return () => intro.kill();
  });
}

document
  .querySelector("#current-year")
  ?.replaceChildren(document.createTextNode(String(new Date().getFullYear())));
