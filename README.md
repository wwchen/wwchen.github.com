wwchen.github.com
=================

Personal website and project portfolio hosted on GitHub Pages.

## Repository Structure

```
/
├── index-static.html          # Static homepage (deployed as index.html)
├── css/                       # Static site stylesheets
├── img/                       # Static site images
├── js/                        # Static site JavaScript
│
├── src/                       # Vite app source code
│   ├── components/            # Vue components
│   ├── composables/           # Vue composables
│   ├── data/                  # JSON configuration files
│   ├── services/              # Business logic services
│   ├── types/                 # TypeScript type definitions
│   ├── App.vue                # Root Vue component
│   ├── main.ts                # App entry point
│   └── style.css              # App styles
│
├── tests/                     # Test files
│   └── unit/                  # Vitest unit tests
│
├── woodworking/cabinet/       # Project documentation
│   ├── CLAUDE.md              # Architecture documentation
│   ├── legacy/                # Pre-migration files
│   └── README.md              # Documentation index
│
├── package.json               # npm dependencies
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── .eslintrc.cjs              # ESLint configuration
├── .prettierrc.json           # Prettier configuration
├── Makefile                   # Development automation
└── .github/workflows/ci.yml   # CI/CD pipeline
```

## Deployment Structure

The CI/CD pipeline deploys to GitHub Pages with this structure:

```
gh-pages branch:
/
├── index.html                 # Static homepage (from index-static.html)
├── css/
├── img/
├── js/
└── woodworking/cabinet/       # Vite app build output
    ├── index.html
    └── assets/
```

**Live URLs:**
- `https://wwchen.github.io/` - Static homepage
- `https://wwchen.github.io/woodworking/cabinet/` - Cabinet Maker Pro (Vite app)

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

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `main`/`master`:

1. **Test & Lint**
   - TypeScript type checking
   - ESLint linting
   - Vitest unit tests

2. **Build & Deploy** (on main branch only)
   - Build Vite app
   - Prepare deployment directory:
     - Copy static site files to root
     - Copy Vite build to subdirectory (from `vite.config.ts` base path)
   - Deploy to `gh-pages` branch

## Configuration

- **Vite base path**: Set in `vite.config.ts` (`base` option)
- **Deployment path**: Automatically extracted from Vite config by CI/CD
- **Static files**: Listed explicitly in CI/CD workflow

## Project: Cabinet Maker Pro

The main Vite application is a data-driven cabinet design tool with:
- 3D visualization (Three.js)
- Bill of Materials generation
- TypeScript + Vue 3 + Vite architecture
- Comprehensive test coverage

See `/woodworking/cabinet/CLAUDE.md` for detailed documentation.
