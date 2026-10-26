
import './input.css';
import { translatePage } from './page-translations.js';
import i18next from './i18n.js';
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
const themeIcon = document.getElementById('theme-icon');
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('site-nav');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

// Theme management
const savedTheme = localStorage.getItem('business-mansion-theme');
const systemPrefersDark = window.matchMedia?.(
  '(prefers-color-scheme: dark)'
).matches;

function setTheme(theme) {
  const isDark = theme === 'dark';

  root.dataset.theme = isDark ? 'dark' : 'light';

  if (themeLabel) {
    themeLabel.textContent = isDark ? 'Light theme' : 'Dark theme';
  }

  themeToggle?.setAttribute(
    'aria-label',
    isDark ? 'Switch to light theme' : 'Switch to dark theme'
  );

  if (themeIcon) {
    themeIcon.innerHTML = isDark
      ? '<path d="M20.5 15.2A8.7 8.7 0 0 1 8.8 3.5 8.8 8.8 0 1 0 20.5 15.2Z"/>'
      : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>';
  }

  themeColorMeta?.setAttribute(
    'content',
    isDark ? '#102427' : '#dce8e1'
  );

  localStorage.setItem(
    'business-mansion-theme',
    isDark ? 'dark' : 'light'
  );
}

setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

themeToggle?.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

// Language management
const languageToggle = document.getElementById('language-toggle');


function updateLanguage(language) {
  const isPersian = language === 'fa';

  document.documentElement.lang = language;
  document.documentElement.dir = isPersian ? 'rtl' : 'ltr';
translatePage(i18next, language);
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    const translation = i18next.t(key, { lng: language });

    if (translation !== key) {
      element.textContent = translation;
    } else {
      console.warn(`Missing translation: ${language} → ${key}`);
    }
  });

  languageToggle?.setAttribute(
    'aria-label',
    isPersian ? 'Switch to English' : 'تغییر به فارسی'
  );

  if (languageToggle) {
    languageToggle.textContent = isPersian ? 'EN' : 'FA';
  }

  localStorage.setItem('business-mansion-language', language);
}


await i18next.changeLanguage(
  localStorage.getItem('business-mansion-language') || 'fa'
);

updateLanguage(i18next.language);

languageToggle?.addEventListener('click', async () => {
  const nextLanguage = i18next.language === 'fa' ? 'en' : 'fa';

  await i18next.changeLanguage(nextLanguage);
  updateLanguage(nextLanguage);
});

/* Mobile navigation */
const mobileNav = document.getElementById('mobile-nav');
const menuLabel = document.getElementById('menu-label');
const desktopBreakpoint = window.matchMedia('(min-width: 961px)');

function setMenuOpen(isOpen) {
  if (!mobileNav || !menuToggle) return;

  mobileNav.classList.toggle('hidden', !isOpen);
  mobileNav.classList.toggle('grid', isOpen);

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute(
    'aria-label',
    isOpen ? 'بستن منو' : 'باز کردن منو'
  );

  if (menuLabel) {
    menuLabel.textContent = isOpen ? 'بستن' : 'منو';
  }
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  setMenuOpen(isOpen);
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

desktopBreakpoint.addEventListener('change', (event) => {
  if (event.matches) {
    setMenuOpen(false);
  }
});


// Dynamic copyright year
const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Scroll reveal animations
const revealElements = document.querySelectorAll('[data-reveal]');
const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => {
    element.classList.add('is-visible');
  });
}
