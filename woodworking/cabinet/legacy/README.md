# Legacy Files

This directory contains the original pre-migration application files preserved for reference.

## Contents

### `index-old.html`
The original monolithic 2,689-line HTML/CSS/JavaScript application that was used before the TypeScript + Vue 3 migration. This was a fully functional single-file app that loaded configuration from JSON files and rendered everything client-side.

**Key features:**
- Vanilla JavaScript (no build step)
- CDN-loaded Three.js
- Manual DOM manipulation
- Single HTML file with embedded CSS and JS
- Used Python HTTP server for local development

### `js/` folder
Original JSON configuration files used by the legacy application:

- **`panels.json`** - Panel definitions with dimensions, quantities, and 3D properties
- **`cabinet_styles.json`** - Cabinet style definitions (full, inlay, stretcher, none)
- **`variables.json`** - Variable definitions (inputs, plywood, calculated)
- **`inputs.json`** - UI input configuration
- **`equations.json`** - Calculated dimension formulas
- **`tests.js`** - Test suite placeholder (never fully implemented)

**Note:** These JSON files have been migrated to `src/data/` with some structural updates for the new Vue 3 application.

### `serve.sh`
Simple bash script that started a Python HTTP server on port 8000 for local development of the legacy app.

```bash
./serve.sh [port]  # Default port: 8000
```

## Why These Files Were Replaced

### Problems with the Legacy App:
- **Maintainability**: 2,689 lines in a single file made it hard to find and fix issues
- **No Type Safety**: Runtime-only error checking with `eval()` for expressions
- **No Testing**: No automated tests for JavaScript code
- **Manual Dependency Management**: CDN-based libraries (Three.js)
- **Security**: Used `eval()` for expression evaluation
- **No Build Optimization**: Shipped unminified code
- **No Code Quality Tools**: No linting, formatting, or type checking

### Current Application (TypeScript + Vue 3 + Vite):
- ✅ Modular architecture (~15 files, <200 lines each)
- ✅ TypeScript strict mode with full type safety
- ✅ 35+ unit tests with Vitest
- ✅ Safe expression evaluator (no `eval()`)
- ✅ Optimized production builds with Vite
- ✅ ESLint + Prettier + pre-commit hooks
- ✅ CI/CD with GitHub Actions
- ✅ Automatic GitHub Pages deployment
- ✅ PrimeVue UI components for consistency

## Using Legacy Files

### To Run the Legacy App:

1. Start a local HTTP server:
   ```bash
   cd legacy
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000/index-old.html

3. The app will load JSON files from the `js/` folder

**Note:** The legacy app expects JSON files in `js/` folder relative to the HTML file. You may need to adjust paths or copy JSON files.

## Migration Date

Files moved to legacy: February 25, 2026
Migration completed: Phase 2 (TypeScript + Vue 3 + Vite)

## Can These Be Deleted?

These files are safe to delete once:
- [ ] The new application has been thoroughly tested in production
- [ ] All features from the legacy app are working in the new app
- [ ] Team members are comfortable with the new codebase
- [ ] No one needs to reference the old implementation

**Recommendation:** Keep for 3-6 months post-deployment, then archive or delete.
