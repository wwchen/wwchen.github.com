wwchen.github.com
=================

Personal website and project portfolio hosted on GitHub Pages.

Multi-page Vite application with two separate Vue apps:
- **Homepage**: Personal landing page with social links
- **Cabinet Maker Pro**: Full-featured cabinet design tool with 3D visualization

## Repository Structure

```
/
├── index.html                      # Homepage entry point
├── woodworking/cabinet/
│   └── index.html                  # Cabinet app entry point
│
├── src/                            # Shared source code
│   ├── views/
│   │   ├── Home.vue                # Homepage component
│   │   └── Cabinet.vue             # Cabinet app component
│   ├── components/                 # Shared Vue components
│   ├── composables/                # Vue composables (Cabinet app)
│   ├── data/                       # JSON configuration files
│   ├── services/                   # Business logic services
│   ├── types/                      # TypeScript type definitions
│   ├── main.ts                     # Homepage bootstrap
│   ├── cabinet.ts                  # Cabinet app bootstrap
│   └── style.css                   # Shared styles
│
├── tests/                          # Test files
│   └── unit/                       # Vitest unit tests
│
├── woodworking/cabinet/            # Project documentation
│   ├── legacy/                     # Pre-migration files
│   └── README.md                   # Documentation index
│
├── CLAUDE.md                       # Architecture documentation
├── package.json                    # npm dependencies
├── vite.config.ts                  # Vite multi-page configuration
├── tsconfig.json                   # TypeScript configuration
├── .eslintrc.cjs                   # ESLint configuration
├── .prettierrc.json                # Prettier configuration
├── Makefile                        # Development automation
└── .github/workflows/ci.yml        # CI/CD pipeline
```

## Deployment Structure

Vite builds a multi-page application deployed to GitHub Pages via `gh-pages` branch:

```
dist/ (deployed to gh-pages branch):
/
├── index.html                      # Homepage
├── woodworking/cabinet/
│   └── index.html                  # Cabinet app
└── assets/                         # Shared JS/CSS bundles
    ├── main-*.js                   # Homepage bundle
    ├── cabinet-*.js                # Cabinet app bundle
    └── *.css                       # Stylesheets
```

**Live URLs:**
- `https://will.iamchen.com/` (or `https://wwchen.github.io/`)
  - Personal homepage with GitHub and LinkedIn links
- `https://will.iamchen.com/woodworking/cabinet/`
  - Cabinet Maker Pro application

## Architecture

### Multi-Page Vite Setup

This project uses Vite's multi-page app configuration with two separate entry points:

1. **Homepage** (`index.html` → `src/main.ts` → `Home.vue`)
   - Minimal Vue app
   - Static landing page
   - Google Analytics & Posthog tracking

2. **Cabinet App** (`woodworking/cabinet/index.html` → `src/cabinet.ts` → `Cabinet.vue`)
   - Full Vue 3 application
   - PrimeVue UI components
   - Three.js 3D visualization
   - Complex state management with composables

**Benefits:**
- Each page gets its own `index.html` (proper server-side routing)
- Direct URL access works on GitHub Pages
- Shared code between apps (components, services)
- Separate bundles with code splitting

## Development

### Prerequisites
- Node.js 20+
- npm 10+

### Available Commands

```bash
# Quick Start
make install              # Install npm dependencies
make dev                  # Start development server (http://localhost:5173)
make test                 # Run all tests
make build                # Build for production

# Development
make preview              # Preview production build locally

# Testing
make test-watch           # Run tests in watch mode
make test-coverage        # Run tests with coverage report

# Code Quality
make lint                 # Run ESLint
make type-check           # Run TypeScript type checking
make format               # Format code with Prettier
make check                # Run all quality checks (type-check + lint + test)

# Cleanup
make clean                # Remove all build artifacts and dependencies
make clean-build          # Remove only build artifacts (keep node_modules)
```

### Local Development

```bash
# Start dev server
make dev

# Visit pages:
# - http://localhost:5173/ → Homepage
# - http://localhost:5173/woodworking/cabinet/ → Cabinet app
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `master`:

1. **Test & Lint**
   - TypeScript type checking
   - ESLint linting
   - Vitest unit tests

2. **Build & Deploy** (on master branch only)
   - Build both apps with Vite multi-page config
   - Deploy `dist/` to `gh-pages` branch
   - GitHub Pages serves from `gh-pages` branch

### GitHub Pages Configuration

**Settings → Pages:**
- **Source**: Deploy from a branch
- **Branch**: `gh-pages`
- **Folder**: `/ (root)`

## Project: Cabinet Maker Pro

The Cabinet Maker Pro app is a fully data-driven cabinet design tool:

**Features:**
- 🪚 Data-driven configuration (JSON files)
- 📐 3D visualization with Three.js
- 📋 Automatic Bill of Materials generation
- 📊 Plywood area summaries
- 🎨 PrimeVue UI components
- 📱 Mobile responsive design

**Tech Stack:**
- TypeScript + Vue 3 Composition API
- Vite build system
- Three.js for 3D rendering
- PrimeVue component library
- Vitest for unit testing

See `CLAUDE.md` for detailed architecture documentation.
