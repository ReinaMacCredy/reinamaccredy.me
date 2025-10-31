# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website built with **Next.js 16**, **React 19**, and **TypeScript** using static site generation (SSG). Modern React hooks bridge with TypeScript utility modules for features like terminal emulator, scroll animations, and image slideshows.

## Build System

### Runtime: Bun (not npm/Node.js)

Project uses **Bun** as JavaScript runtime and package manager.

**Core Commands:**
```bash
bun run build              # Next.js static export to out/
bun run dev                # Build + serve locally
bun run start              # Next.js production server
bun run serve              # Serve out/ using custom Bun server
bun run clean              # Remove .next and out/
```

### Build Configuration

**Next.js Config:** [next.config.ts](next.config.ts)
- Output: `export` (static site generation)
- Images: Unoptimized (GitHub Pages compatibility)
- Logging: Full URL tracking for fetch requests

**Build Output:** `out/` directory (gitignored)
```
out/
├── _next/static/chunks/     # Next.js bundled JavaScript
├── assets/                  # Images and media from public/
├── css/                     # Global CSS
├── index.html               # Pre-rendered static HTML
├── 404.html
├── CNAME
├── favicon.ico
├── manifest.json
└── robots.txt
```

### Development Server

**Custom Bun Server:** [server.ts](server.ts)
- Auto-finds available port (starts at 3000)
- Serves `out/` directory
- Colored HTTP request logging with timestamps
- Auto-copies local URL to clipboard (macOS)
- MIME type handling for web assets

## Architecture

### Next.js Application

**Root Layout:** [app/layout.tsx](app/layout.tsx)
- Metadata (SEO, Open Graph, Twitter cards)
- Font loading: Inter, Inria Serif, Alexandria, Nothing You Could Do
- Global CSS import
- Initial body class: `is-loading` (removed by lifecycle hook)

**Main Page:** [app/page.tsx](app/page.tsx)
- Client component with all feature orchestration
- Hook initialization order matters:
  1. `useScrollEvents()` first - creates shared instance
  2. Core hooks (`useLifecycle`, `usePlatformFixes`)
  3. Independent features (`useSections`, `useReorder`)
  4. Scroll-dependent features (pass `scrollEvents` parameter)
- Hero element fallback logic (opacity/transform reset at 0ms, 100ms, 600ms)
- Optional legacy port mode via `?enable_legacy_port` URL flag

### React Hooks (Integration Layer)

Located in [app/hooks/](app/hooks/), these bridge React with TypeScript modules:

**Core Hooks:**
- [useScrollEvents.tsx](app/hooks/useScrollEvents.tsx) - Scroll event management (iOS-specific handling)
- [useLifecycle.tsx](app/hooks/useLifecycle.tsx) - Page loading state (`is-loading`, `is-playing`, `is-ready`)
- [usePlatformFixes.tsx](app/hooks/usePlatformFixes.tsx) - Browser/OS-specific CSS fixes

**Feature Hooks (depend on scrollEvents):**
- [useSections.tsx](app/hooks/useSections.tsx) - Section navigation (independent)
- [useOnVisible.tsx](app/hooks/useOnVisible.tsx) - Scroll-triggered animations (uses scrollEvents)
- [useSlideshows.tsx](app/hooks/useSlideshows.tsx) - Image slideshow (uses scrollEvents)
- [useDeferredImages.tsx](app/hooks/useDeferredImages.tsx) - Lazy image loading (uses scrollEvents)
- [useTerminal.tsx](app/hooks/useTerminal.tsx) - Terminal emulator with 1.5s mobile retry (uses scrollEvents)
- [useReorder.tsx](app/hooks/useReorder.tsx) - Responsive element reordering (independent)

**Dependency Chain:**
1. `useScrollEvents()` creates shared scroll event manager instance
2. Feature hooks receive `scrollEvents` parameter (or null if not needed)
3. Each hook imports and calls corresponding TypeScript module from [app/features/](app/features/)
4. All include try-catch error handling and cleanup on unmount

### TypeScript Modules

**Utilities ([app/lib/utils/](app/lib/utils/)):**
- [client.ts](app/lib/utils/client.ts) - Device/browser detection
- [dom.ts](app/lib/utils/dom.ts) - DOM manipulation
- [elements.ts](app/lib/utils/elements.ts) - Element selection
- [onvisible.ts](app/lib/utils/onvisible.ts) - Visibility detection
- [scroll.ts](app/lib/utils/scroll.ts) - Scroll utilities
- [scrollEvents.ts](app/lib/utils/scrollEvents.ts) - Centralized scroll management
- [url.ts](app/lib/utils/url.ts) - URL parameter parsing
- [errors.ts](app/lib/utils/errors.ts) - Error handling

**Features ([app/features/](app/features/)):**
- [terminalCore.ts](app/features/terminalCore.ts) - Terminal emulator implementation (43KB, largest module)
- [terminalContainer.ts](app/features/terminalContainer.ts) - Terminal container DOM setup
- [sections.ts](app/features/sections.ts) - Page section navigation (13KB)
- [slideshow.ts](app/features/slideshow.ts) - Slideshow animation logic (13KB)
- [slideshowRegister.ts](app/features/slideshowRegister.ts) - Slideshow DOM registration
- [lifecycle.ts](app/features/lifecycle.ts) - Page lifecycle state management
- [platformFixes.ts](app/features/platformFixes.ts) - Platform-specific CSS workarounds
- [deferredImages.ts](app/features/deferredImages.ts) - Lazy image loading logic
- [reorder.ts](app/features/reorder.ts) - Responsive element reordering
- [onvisibleRegister.ts](app/features/onvisibleRegister.ts) - Scroll-triggered effect registration (7KB)
- [onvisiblePageRegister.ts](app/features/onvisiblePageRegister.ts) - Page-level visibility effects

**Compatibility ([app/lib/compat/](app/lib/compat/)):**
- [globals.ts](app/lib/compat/globals.ts) - Legacy global variables
- [legacyPort.ts](app/lib/compat/legacyPort.ts) - Diagnostic legacy port (optional)

## Development Workflow

### Local Development
1. Edit source files in `app/`, `public/`, or config files
2. Build: `bun run build` (Next.js static export to `out/`)
3. Test locally: `bun run serve` (custom Bun server on port 3000+)
4. Verify in browser before committing
5. Check console for any errors (all features have error handling)

### Mobile Testing Considerations
- Terminal has 1.5s retry logic for mobile devices (see [useTerminal.tsx](app/hooks/useTerminal.tsx))
- iOS gets special scroll event handling in [scrollEvents.ts](app/lib/utils/scrollEvents.ts)
- Client detection in [client.ts](app/lib/utils/client.ts) applies mobile-specific fixes
- Error handling prevents page breakage on mobile browsers
- Test on both iOS Safari and Chrome for Android

### Adding New Features
1. Create TypeScript module in [app/features/](app/features/) or [app/lib/utils/](app/lib/utils/)
2. Create React hook wrapper in [app/hooks/](app/hooks/) if needed
   - Pass `scrollEvents` parameter if feature needs scroll interaction
   - Independent features (sections, reorder) don't need scrollEvents
3. Import and call hook in [app/page.tsx](app/page.tsx)
4. Include error handling (try-catch) and cleanup (return cleanup function)
5. Test with `bun run dev` before committing

### Debugging Build Issues
- Check `.next/` cache: Run `bun run clean` to remove stale build artifacts
- Verify `out/` directory structure matches expected output after build
- Test production build locally with `bun run serve` before pushing
- Check browser console for runtime errors (all features log errors without breaking)

## Deployment

**GitHub Actions:** [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- Triggers: Push to main or PR
- Process: Checkout → Setup Bun → Install → Build → Deploy
- Target: `https://reinamaccredy.me` (custom domain via CNAME)
- Artifacts: 30-day retention

**Manual Deploy:**
```bash
bun run build
git add .
git commit -m "feat: add feature"
git push origin main
```

## Commit Convention

Follow conventional commits:
```
<type>[scope]: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructuring
- update: Enhancement
- docs: Documentation
- style: Formatting
- build: Build system
- chore: Maintenance
```

## Important Notes

### Technology Stack
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Runtime:** Bun
- **Architecture:** Static site generation (SSG)

### Error Handling
- All features include try-catch blocks
- Mobile gets terminal retry logic
- Console errors logged without breaking functionality
- Hero element has visibility fallback

### Performance
- Next.js static export minimizes runtime
- Image optimization disabled (GitHub Pages compatibility)
- CSS bundled at app level

## Asset Management

**Public Directory:** [public/](public/)
- Served as static files
- Reference with absolute paths: `/assets/images/...`
- Contains: images, media, favicon, manifest

**CSS:**
- Global: [app/globals.css](app/globals.css)
- No-JS fallback: `public/css/noscript.css`

## Module Size Reference

**Largest TypeScript modules by size:**
1. [terminalCore.ts](app/features/terminalCore.ts) - 43KB (interactive terminal emulator)
2. [sections.ts](app/features/sections.ts) - 13KB (section navigation)
3. [slideshow.ts](app/features/slideshow.ts) - 13KB (slideshow animations)
4. [onvisibleRegister.ts](app/features/onvisibleRegister.ts) - 7KB (scroll effects)
5. [deferredImages.ts](app/features/deferredImages.ts) - 4KB (lazy loading)

**Note:** When modifying these modules, be mindful of code size impact on bundle.

## Type Definitions

**Core Types ([app/types/core.ts](app/types/core.ts)):**
- `ScrollEvents` - Scroll event manager interface with `init()`, `handler()`, `add()` methods
- Used throughout hooks and features for scroll-based interactions

## Dependencies

**Main Dependencies:**
- `next` (^16.0.1) - React framework with SSG
- `react` (^19.2.0) - UI library
- `react-dom` (^19.2.0) - React DOM renderer
- `gsap` (^3.13.0) - Animation library for scroll effects
- `split-type` (^0.3.4) - Text splitting utility

**Dev Dependencies:**
- `typescript` (^5.9.3) - Type checking
- `@types/*` - TypeScript definitions
