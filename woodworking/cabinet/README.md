# Cabinet Maker Pro Documentation

This directory contains documentation and development artifacts for the Cabinet Maker Pro project.

## Contents

- **CLAUDE.md** - Comprehensive project documentation and architecture guide
- **legacy/** - Pre-migration files from the original monolithic implementation
- **Makefile** - Development automation scripts
- **validate_config.sh** - Configuration validation tool
- **refactor_viz3d.md** - 3D visualization refactoring notes
- **3d_comparison.png** - Visual comparison artifact

## Application Location

The Cabinet Maker Pro application source code is located at the repository root:

- **Source**: `/src/` 
- **Tests**: `/tests/`
- **Config**: `/package.json`, `/vite.config.ts`, etc.
- **Live app**: https://wwchen.github.io/woodworking/cabinet/

## Development

```bash
# Navigate to repository root
cd ../..

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

See the main `/README.md` for full development documentation.
