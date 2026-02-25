# Cabinet Maker Pro

A fully **data-driven** cabinet design tool with 3D visualization, BOM generation, and cut optimization.

Built with **TypeScript + Vue 3 + Vite**.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Development

```bash
# Install dependencies
npm install

# Start dev server (with hot module replacement)
npm run dev

# Open browser to http://localhost:5173
```

### Available Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm test             # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report
npm run lint         # Lint and fix code
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## 📁 Project Structure

```
cabinet/
├── .github/workflows/  # GitHub Actions CI/CD
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Vue components
│   ├── composables/    # Vue composables (hooks)
│   ├── data/           # JSON config files
│   │   ├── panels.json
│   │   ├── cabinet_styles.json
│   │   ├── variables.json
│   │   ├── inputs.json
│   │   └── equations.json
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── services/       # Business logic
│   ├── App.vue         # Root component
│   ├── main.ts         # Entry point
│   └── style.css       # Global styles
├── tests/
│   ├── unit/           # Vitest unit tests
│   └── fixtures/       # Test data
├── public/             # Static assets (copied as-is)
├── index-new.html      # New Vite entry point
├── index.html          # Original app (still working)
└── package.json
```

## 🧪 Testing

Tests run automatically:
- On every commit (pre-commit hook)
- On every push (GitHub Actions)

```bash
npm test              # Run tests in watch mode
npm run test:ui       # Open interactive test UI
npm run test:coverage # Generate coverage report
```

## 🚀 Deployment

**Automatic:** Pushing to `main` branch triggers GitHub Actions to deploy to GitHub Pages.

**Manual:** Run `npm run build` and deploy the `dist/` folder.

## 📚 Architecture

### Data Flow

```
User Input → JSON Configs → Expression Evaluation → Vue Reactivity → 3D Viz + BOM
```

### Core Principles

1. **Single Source of Truth:** All data in JSON config files
2. **Data-Driven:** No hardcoded values, everything configurable
3. **Type-Safe:** TypeScript strict mode enforced
4. **Tested:** Comprehensive unit tests with Vitest
5. **Modern Stack:** Vue 3 Composition API + TypeScript + Vite

### Key Technologies

- **Vue 3:** Reactive UI framework with Composition API
- **TypeScript:** Type-safe JavaScript
- **Three.js:** 3D visualization
- **Vite:** Fast build tool with HMR
- **Vitest:** Fast unit testing
- **ESLint + Prettier:** Code quality
- **GitHub Actions:** CI/CD pipeline

## 📖 Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## 🔄 Migration Status

### ✅ Phase 1: Infrastructure Setup (Complete)
- Vite + Vue 3 + TypeScript project structure
- ESLint, Prettier, Husky pre-commit hooks
- Vitest testing framework
- GitHub Actions CI/CD
- JSON configs moved to src/data/

### ⏳ Phase 2: Code Migration (In Progress)
- TypeScript interfaces for all data structures
- Expression evaluator service (replace eval())
- Vue 3 Composition API components
- Three.js integration with Vue lifecycle
- Comprehensive unit tests (>80% coverage)

## 🤝 Contributing

1. Make changes in a feature branch
2. Run `npm run lint` and `npm test` before committing
3. Pre-commit hooks will auto-format and lint
4. Push to GitHub - CI will run tests
5. Create pull request

## 📝 License

MIT

## 🆘 Troubleshooting

**Issue:** `npm install` fails
- **Fix:** Make sure you have Node.js 20+ installed

**Issue:** Vite dev server won't start
- **Fix:** Delete `node_modules` and run `npm install` again

**Issue:** Tests failing
- **Fix:** Run `npm run type-check` to see TypeScript errors

**Issue:** Pre-commit hook not running
- **Fix:** Run `npm run prepare` to set up Husky

## 🎯 Future Improvements

- [ ] End-to-end tests (Playwright)
- [ ] Visual regression tests for 3D rendering
- [ ] Performance profiling and optimization
- [ ] State persistence (localStorage)
- [ ] Export/import config feature
- [ ] Undo/redo functionality
- [ ] 3D camera presets (front/side/top views)
- [ ] Measurement tools in 3D view
