.PHONY: install dev build preview test test-viz lint type-check format clean help

# Install npm dependencies
install:
	@echo "Installing npm dependencies..."
	@npm install
	@echo "Installation complete! ✅"

# Start development server with HMR
dev:
	@echo "Starting Cabinet Maker Pro development server..."
	@echo "Open http://localhost:5173 in your browser"
	@echo "Press Ctrl+C to stop"
	@npm run dev

# Build for production
build:
	@echo "Building for production..."
	@npm run build
	@echo "Build complete! Output in dist/ directory ✅"

# Preview production build
preview:
	@echo "Starting production preview server..."
	@npm run preview

# Run all tests
test:
	@echo "Running tests..."
	@npm test -- --run
	@echo "Tests complete! ✅"

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	@npm test

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@npm run test:coverage

# Run linter
lint:
	@echo "Running ESLint..."
	@npm run lint
	@echo "Linting complete! ✅"

# Run TypeScript type checking
type-check:
	@echo "Running TypeScript type checking..."
	@npm run type-check
	@echo "Type checking complete! ✅"

# Format code with Prettier
format:
	@echo "Formatting code..."
	@npm run format
	@echo "Formatting complete! ✅"

# Run all quality checks (type-check, lint, test)
check: type-check lint test
	@echo "All quality checks passed! ✅"

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/
	@rm -rf node_modules/
	@rm -rf venv/
	@rm -rf .vite/
	@echo "Clean complete! ✅"

# Clean only build artifacts (keep dependencies)
clean-build:
	@echo "Cleaning build artifacts..."
	@rm -rf dist/
	@rm -rf .vite/
	@echo "Build artifacts cleaned! ✅"

# Help target
help:
	@echo "Available targets:"
	@echo ""
	@echo "Development:"
	@echo "  make install              - Install npm dependencies"
	@echo "  make dev                  - Start development server (http://localhost:5173)"
	@echo "  make build                - Build for production"
	@echo "  make preview              - Preview production build locally"
	@echo ""
	@echo "Testing:"
	@echo "  make test                 - Run all tests once"
	@echo "  make test-watch           - Run tests in watch mode"
	@echo "  make test-coverage        - Run tests with coverage report"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint                 - Run ESLint"
	@echo "  make type-check           - Run TypeScript type checking"
	@echo "  make format               - Format code with Prettier"
	@echo "  make check                - Run all quality checks (type-check + lint + test)"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean                - Remove all build artifacts and dependencies"
	@echo "  make clean-build          - Remove only build artifacts (keep node_modules)"
	@echo ""
	@echo "Quick start:"
	@echo "  make install              # Install dependencies (first time only)"
	@echo "  make dev                  # Start development server"
	@echo ""
	@echo "Before committing:"
	@echo "  make check                # Run all quality checks"
	@echo ""

# Default target
.DEFAULT_GOAL := help
