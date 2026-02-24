.PHONY: setup test clean force-setup

# Python virtual environment directory
VENV_DIR = venv

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
	@$(VENV_DIR)/bin/python test_3d_positions.py
	@echo "Visualization saved to 3d_comparison.png"

# Clean up virtual environment
clean:
	@echo "Removing virtual environment..."
	rm -rf $(VENV_DIR)
	@echo "Clean complete!"

# Help target
help:
	@echo "Available targets:"
	@echo "  make setup        - Create virtual environment and install dependencies (if needed)"
	@echo "  make force-setup  - Force recreate virtual environment"
	@echo "  make test         - Run 3D position visualization test"
	@echo "  make clean        - Remove virtual environment"
	@echo "  make help         - Show this help message"
