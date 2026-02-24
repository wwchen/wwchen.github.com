.PHONY: setup test clean force-setup validate serve

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

# Run the 3D position test visualization
test: setup
	@echo "Running 3D position visualization test..."
	@$(VENV_DIR)/bin/python test_3d_positions.py $(CONFIG)
	@echo "Visualization saved to 3d_comparison.png"

# Run test with custom config file
# Usage: make test-config CONFIG=my_config.json
test-config: setup
	@if [ -z "$(CONFIG)" ]; then \
		echo "Error: CONFIG variable not set."; \
		echo "Usage: make test-config CONFIG=my_config.json"; \
		exit 1; \
	fi
	@echo "Running 3D position test with config: $(CONFIG)..."
	@$(VENV_DIR)/bin/python test_3d_positions.py $(CONFIG)
	@echo "Visualization saved to 3d_comparison.png"

# Clean up virtual environment
clean:
	@echo "Removing virtual environment..."
	rm -rf $(VENV_DIR)
	@echo "Clean complete!"

# Validate configuration files
validate:
	@./validate_config.sh

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
	@echo "  make validate                  - Validate all JSON configuration files"
	@echo "  make setup                     - Create virtual environment and install dependencies (if needed)"
	@echo "  make force-setup               - Force recreate virtual environment"
	@echo "  make test                      - Run 3D position visualization test with defaults"
	@echo "  make test CONFIG=config.json   - Run test with specific config file"
	@echo "  make clean                     - Remove virtual environment"
	@echo "  make help                      - Show this help message"
	@echo ""
	@echo "Quick start:"
	@echo "  make serve    # Then open http://localhost:8000"
