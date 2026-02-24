.PHONY: setup test test-viz clean force-setup serve

# Python virtual environment directory
VENV_DIR = venv
PORT ?= 8000

# Setup virtual environment and install dependencies (only if needed)
setup:
	@if [ ! -d "$(VENV_DIR)" ]; then \
		echo "Setting up Python virtual environment..."; \
		python3 -m venv $(VENV_DIR); \
		echo "Installing dependencies..."; \
		$(VENV_DIR)/bin/pip install --upgrade pip; \
		$(VENV_DIR)/bin/pip install matplotlib numpy; \
		echo "Setup complete!"; \
	else \
		echo "Virtual environment already exists. Use 'make force-setup' to recreate."; \
	fi

# Force recreation of virtual environment
force-setup: clean setup

# Run all tests (validation + 3D visualization)
test:
	@echo "Running configuration validation..."
	@./validate_config.py
	@echo ""
	@echo "Validation passed! ✅"

# Run the 3D position test visualization
test-viz: setup
	@echo "Running 3D position visualization test..."
	@$(VENV_DIR)/bin/python test_3d_positions.py $(CONFIG)
	@echo "Visualization saved to 3d_comparison.png"

# Clean up virtual environment
clean:
	@echo "Removing virtual environment..."
	rm -rf $(VENV_DIR)
	@echo "Clean complete!"

# Serve the application
serve:
	@echo "Starting Cabinet Maker Pro on http://localhost:$(PORT)"
	@echo "Press Ctrl+C to stop"
	@python3 -m http.server $(PORT)

# Help target
help:
	@echo "Available targets:"
	@echo "  make serve                     - Start HTTP server (default port 8000)"
	@echo "  make serve PORT=3000           - Start HTTP server on custom port"
	@echo "  make test                      - Validate all JSON configuration files"
	@echo "  make test-viz                  - Run 3D position visualization test"
	@echo "  make test-viz CONFIG=file.json - Run visualization with specific config"
	@echo "  make setup                     - Create virtual environment and install dependencies (if needed)"
	@echo "  make force-setup               - Force recreate virtual environment"
	@echo "  make clean                     - Remove virtual environment"
	@echo "  make help                      - Show this help message"
	@echo ""
	@echo "Quick start:"
	@echo "  make serve    # Then open http://localhost:8000"
