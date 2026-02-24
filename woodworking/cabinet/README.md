# Cabinet Maker Pro

A data-driven cabinet design and visualization tool with automated bill of materials, cut optimization, and 3D rendering.

## Quick Start

```bash
./serve.sh
```

Then open **http://localhost:8000** in your browser.

### Why HTTP Server?

This app loads configuration files (`equations.json`, `inputs.json`) using JavaScript fetch(), which requires HTTP protocol.

- ❌ **Won't work:** Opening `index.html` directly (`file://`)
- ✅ **Will work:** Serving via HTTP (`http://localhost:8000`)

### Alternative Methods

```bash
# Python's built-in server
python3 -m http.server 8000

# Different port
./serve.sh 3000

# PHP (if installed)
php -S localhost:8000

# Node.js http-server (if installed)
npx http-server -p 8000
```

## Features

- **Parametric Design**: Define cabinet dimensions and automatically calculate all component sizes
- **Data-Driven Architecture**: All calculations driven by `equations.json` - single source of truth
- **3D Visualization**: Real-time Three.js rendering with proper component orientations
- **Bill of Materials**: Automatic BOM generation with detailed dimensions
- **Cut Optimization**: Smart sheet optimization for plywood cuts
- **Drag & Drop Plywood Assignment**: Assign components to different plywood thicknesses and materials

## Configuration Files

### `equations.json` - Calculation Engine

Defines all panel dimensions, BOM data, and 3D visualization properties:

```json
{
  "panels": {
    "carcass_sides": {
      "dimensions": {
        "width": "dim_d",
        "height": "dim_h - ply_carcass",
        "thickness": "ply_carcass"
      },
      "bom": {
        "item": "Carcass sides",
        "quantity": 2
      },
      "viz3d": {
        "color": 0xD2B48C,
        "orientation": "rotated",
        "instances": [...]
      }
    }
  },
  "calculated": [
    {
      "key": "overall",
      "label": "Carcass Total (W×H×D)",
      "width": "dim_w",
      "height": "dim_h",
      "depth": "dim_d"
    }
  ]
}
```

**3D Coordinate System:**
- **(0, 0, 0)** = front-left-bottom corner of the cabinet
- **X axis** = Width (left → right)
- **Y axis** = Height (floor → up)
- **Z axis** = Depth (front → back)
- All `(x, y, z)` in `instances` represent the **front-left-bottom corner** of each panel

**3D Orientations:**
- `horizontal`: Components lying flat (carcass_top, drawer_bottom, drawer_stretchers)
- `vertical`: Components standing upright (back_stretchers, drawer_front_back, carcass_back)
- `rotated`: Components rotated 90° (carcass_sides, drawer_sides)

### `inputs.json` - UI Configuration

Defines all input fields, labels, defaults, and layout:

```json
{
  "sections": [
    {
      "title": "Cabinet Dimensions",
      "inputs": [
        {
          "id": "dim_w",
          "label": "Width (in)",
          "type": "number",
          "value": 25.00,
          "step": 0.125,
          "layout": "row3"
        }
      ]
    }
  ]
}
```

### `test_configs.json` - Test Scenarios

Multiple test configurations:
- **default**: Standard cabinet (25×37×21, 3 drawers)
- **large**: Large cabinet (36×48×24, 4 drawers)
- **compact**: Compact cabinet (18×30×18, 2 drawers)

## Adding New Panels

Edit `equations.json` to add a new panel:

```json
{
  "panels": {
    "my_new_panel": {
      "dimensions": {
        "width": "dim_w - 2",
        "height": "dim_h / 2",
        "thickness": "ply_carcass"
      },
      "bom": {
        "item": "My Panel",
        "quantity": 2
      },
      "viz3d": {
        "color": 0xD2B48C,
        "orientation": "vertical",
        "instances": [
          {
            "x": "ply_carcass",
            "y": "0",
            "z": "0"
          }
        ]
      }
    }
  }
}
```

The UI will automatically:
- Calculate dimensions
- Add to BOM
- Render in 3D
- Include in cut optimization
- Show in plywood assignment

## Testing

### Python 3D Visualization Tests

```bash
# Run test with defaults (auto-setup)
make test

# Run with specific test scenario
make test CONFIG=test_configs.json

# Clean up
make clean
```

**Manual execution:**

```bash
# Setup (one time)
python3 -m venv venv
source venv/bin/activate
pip install matplotlib numpy

# Run test (uses test_configs.json)
python test_3d_positions.py

# View output
open 3d_comparison.png
```

### Configuration Validation

```bash
./validate_config.sh
```

Validates all JSON files and checks for required structures.

## File Structure

### Core Application
- `index.html` - Main application (HTML + CSS + JavaScript)
- `equations.json` - Calculation engine (panels, dimensions, formulas)
- `inputs.json` - UI configuration (input definitions, labels, defaults)

### Configuration & Tests
- `test_configs.json` - Multiple test scenarios (default, large, compact)
- `test_3d_positions.py` - Python 3D visualization test script

### Build & Utilities
- `serve.sh` - HTTP server startup script
- `validate_config.sh` - JSON configuration validator
- `Makefile` - Test automation

## Troubleshooting

### "Failed to load configuration files" error

- Make sure you're accessing via HTTP (`http://localhost:8000`)
- Check that `equations.json` and `inputs.json` exist in the directory
- Check browser console (F12) for specific error details

### Port already in use

```bash
./serve.sh 8001  # Use different port
```

### Components not updating in plywood table

- Refresh the page to ensure all configs are loaded
- Check browser console for errors
- Verify component names match between `equations.json` panels and plywood table

## Architecture Benefits

- **Single Source of Truth**: All calculations and UI driven by JSON configs
- **No Hardcoded Values**: Everything parameterized and data-driven
- **Easily Testable**: JSON can be loaded by any language
- **UI and Tests Share Same Equations**: Ensures consistency
- **Change Labels/Defaults Without Code Changes**: Edit JSON files only

## License

MIT
