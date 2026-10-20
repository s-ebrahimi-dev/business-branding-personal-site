# Personal Branding Website — Motion Edition v2

A Persian, right-to-left (RTL) website concept for introducing a university professor and consultant specializing in brand strategy, brand architecture, and business design. The structure and content showcase are conceptually inspired by author and entrepreneur websites, without directly copying any specific website.

## Getting Started

**Requirement:** A Node.js version compatible with Vite 8.

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

To build the project and preview the production build:

```bash
npm run build
npm run preview
```

## Technologies and Features

- Semantic HTML with `dir="rtl"`
- Tailwind CSS v4 and Vite
- JavaScript and GSAP/ScrollTrigger
- A user-provided YouTube video embedded in the hero background, featuring muted autoplay, looping, blur, and a dark overlay. The video is embedded from YouTube and is not downloaded or bundled with the project.
- Visible parallax effects for the hero background, the About section image, and the speaking portrait
- Hero text entrance animation and a typewriter effect for the positioning statement
- Animated section headings, expertise rows, book mockups, article cards, and contact elements
- `IntersectionObserver` for progressive content reveals, lazy-loading images, loading iframes and local videos near the viewport, and detecting the active navigation section
- A locally hosted motion graphic in the "From Ideas to Execution" section, with video frames controlled by scrolling
- Article filtering, an article-reading modal, and a mobile navigation menu
- Support for `prefers-reduced-motion`: automatic motion effects and hero background video loading are disabled when reduced motion is preferred.

## Key Files

- `index.html`: Page structure
- `src/input.css`: Styling, motion states, and responsive styles
- `src/main.js`: Event handling, lazy loading, typewriter effect, GSAP, and ScrollTrigger
- `vite.config.js`: Vite configuration and Tailwind integration
- `package.json`: Scripts and dependencies
- `public/videos/brand-story.mp4`: Local motion graphic used for scroll-scrub animation
- `public/images/brand-story-poster.jpg`: Poster image displayed as a fallback for the motion graphic

## Important Considerations for Production Deployment

1. Replace sample names, portraits, biographies, professional experience, portfolio items, and placeholder copy with accurate, verified information about the actual professor.
2. The hero uses the following embed URL: `https://www.youtube-nocookie.com/embed/U1-tNfr9P8k`. Before publishing, verify that embedding is permitted and that the copyright holder agrees to this use. If the video is removed, restricted, or unavailable, a thumbnail image and background color are displayed as fallbacks.
3. Autoplay may be restricted depending on browser policies, data-saving settings, or video permissions. The video intentionally plays without sound, and the implementation attempts to pause it when the hero leaves the viewport.
4. Article, workspace, and speaking images are loaded from Unsplash as sample content. Before production deployment, review image licensing, optimization, and hosting arrangements.
5. The contact form currently provides client-side validation only. Actual form submission requires a backend, an email service, or a form-handling service.
6. Payment processing, order management, and digital product delivery have not been implemented in this project.

## Motion Design and Accessibility

Animations are used to guide attention and clarify the content journey, not to hide information. When the operating system indicates a reduced-motion preference, the hero and text return to static states. All content should remain readable and accessible even when animations are disabled.