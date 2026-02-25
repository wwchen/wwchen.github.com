# Cabinet Maker Pro

A data-driven cabinet design and visualization tool with automated bill of materials, cut optimization, and 3D rendering.

## Quick Start

```bash
make serve
```

Then open **http://localhost:8000** in your browser.

## Features

- **Parametric Design**: Define cabinet dimensions and automatically calculate all component sizes
- **Unequal Drawer Heights**: Per-drawer height inputs with total/available tracking and equalize button
- **Style-Driven Architecture**: Cabinet styles define which panels are used and their material assignments
- **Data-Driven Configuration**: All data in JSON files - clean separation of concerns
- **3D Visualization**: Real-time Three.js rendering with proper component orientations
- **Bill of Materials**: Automatic BOM generation with detailed dimensions
- **Cut Optimization**: Smart sheet optimization for plywood cuts
- **Drag & Drop Plywood Assignment**: Assign components to different plywood thicknesses and materials
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices

## Data Model Architecture

Cabinet Maker Pro uses a **separation of concerns** architecture with 4 core data files:

```
User Input (backing_style)
    ↓
cabinet_styles.json → Defines active panels and material defaults
    ↓
panels.json → Panel metadata (dimensions, viz3d)
    ↓
variables.json → Calculations and expressions
    ↓
BOM + 3D Rendering + Cut Optimization
```

### Data Flow

1. **User selects backing style** (full, inlay, stretcher, none)
2. **cabinet_styles.json** defines which panels are used
3. **panels.json** provides panel dimensions and 3D properties
4. **variables.json** evaluates expressions using user inputs
5. **Application** generates BOM, 3D view, and cut layouts

## Configuration Files (js/ folder)

### 1. `panels.json` - Panel Metadata

Defines all physical panels with dimensions, quantities, and 3D visualization properties:

```json
{
  "carcass_sides": {
    "key": "carcass_sides",
    "name": "Carcass sides",
    "dimensions": {
      "width": "dim_d",
      "height": "dim_h - ply_carcass",
      "thickness": "ply_carcass"
    },
    "quantity": 2,
    "viz3d": {
      "color": 13808780,
      "orientation": "rotated",
      "instances": [
        {"x": "0", "y": "0", "z": "0"},
        {"x": "dim_w - ply_carcass", "y": "0", "z": "0"}
      ]
    }
  }
}
```

**Schema Fields:**
- `key` - Unique identifier
- `name` - Display name for BOM
- `dimensions` - Width, height, thickness (expressions)
- `quantity` - Number of pieces (number or expression)
- `applies_to` - Optional array of style IDs (if panel is style-specific)
- `viz3d` - 3D visualization properties:
  - `color` - Hex color code
  - `orientation` - `horizontal`, `vertical`, or `rotated`
  - `instances` - Array of `{x, y, z}` positions (expressions)
  - `loop` - Optional: repeat instances (e.g., `"num_drawers"`)
  - `condition` - Optional: visibility condition

**3D Coordinate System:**
- **(0, 0, 0)** = front-left-bottom corner of the cabinet
- **X axis** = Width (left → right)
- **Y axis** = Height (floor → up)
- **Z axis** = Depth (front → back)
- All `(x, y, z)` represent the **front-left-bottom corner** of each panel

**3D Orientations:**
- `horizontal`: Lying flat - BOM(W,H,T) → 3D(X=W, Y=T, Z=H)
- `vertical`: Standing upright - BOM(W,H,T) → 3D(X=W, Y=H, Z=T)
- `rotated`: 90° rotation - BOM(W,H,T) → 3D(X=T, Y=H, Z=W)

### 2. `cabinet_styles.json` - Style Definitions

Defines cabinet styles with panel lists and material assignments:

```json
{
  "styles": [
    {
      "id": "full",
      "label": "Full Plywood",
      "description": "Solid plywood back panel for maximum rigidity",
      "panels": [
        "carcass_sides",
        "carcass_top",
        "carcass_back",
        "drawer_stretcher",
        ...
      ],
      "material_defaults": [
        {
          "thickness": 0.75,
          "components": ["carcass_sides", "carcass_top", "drawer_stretcher"]
        },
        {
          "thickness": 0.5,
          "components": ["drawer_sides", "carcass_back"]
        }
      ]
    }
  ]
}
```

**Schema Fields:**
- `id` - Unique style identifier
- `label` - Display name
- `description` - User-friendly explanation
- `panels` - Array of panel keys (strings) or panel overrides (objects)
- `material_defaults` - Default plywood assignments per thickness

**Panel Override Example:**
```json
{
  "key": "carcass_back",
  "dimensions": {
    "width": "dim_w - 2 * ply_carcass - 0.25",
    "height": "dim_h - 2 * ply_carcass - 0.25"
  }
}
```

### 3. `variables.json` - Variables & Calculations

Defines all variables: inputs, plywood thicknesses, and calculated values:

```json
{
  "variables": [
    {
      "id": "dim_w",
      "label": "Width",
      "type": "input",
      "value": 25.00,
      "unit": "inch"
    },
    {
      "id": "ply_carcass",
      "label": "Carcass Plywood Thickness",
      "type": "plywood",
      "value": 0.75,
      "unit": "inch"
    },
    {
      "id": "drawer_width",
      "label": "Drawer Width",
      "type": "calculated",
      "value": "dim_w - 2 * (ply_carcass + dim_railing_w)",
      "unit": "inch"
    }
  ]
}
```

**Variable Types:**
- `input` - User-editable values (dimensions, counts)
- `plywood` - Thickness values from material assignments
- `calculated` - Computed from expressions
- `array` - Per-element values (e.g., per-drawer heights)

### 4. `inputs.json` - UI Configuration

Defines UI sections, input fields, layouts, and conditional visibility:

```json
{
  "sections": [
    {
      "title": "Cabinet Dimensions",
      "inputs": [
        {
          "variable_id": "dim_w",
          "step": 0.125,
          "layout": "row3"
        },
        {
          "variable_id": "dim_back_stretcher",
          "step": 0.125,
          "condition": "backing_style === 'stretcher'"
        }
      ]
    }
  ]
}
```

### 5. `equations.json` - Calculated Dimensions (Legacy)

Still contains the calculated dimensions array:

```json
{
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

### 6. `test_configs.json` - Test Scenarios

Multiple test configurations:
- **default**: Standard cabinet (25×37×21, 3 drawers)
- **large**: Large cabinet (36×48×24, 4 drawers)
- **compact**: Compact cabinet (18×30×18, 2 drawers)

## Adding New Panels

**Step 1:** Add panel to `js/panels.json`:

```json
{
  "my_new_panel": {
    "key": "my_new_panel",
    "name": "My Panel",
    "dimensions": {
      "width": "dim_w - 2",
      "height": "dim_h / 2",
      "thickness": "ply_carcass"
    },
    "quantity": 2,
    "viz3d": {
      "color": 0xD2B48C,
      "orientation": "vertical",
      "instances": [
        {"x": "ply_carcass", "y": "0", "z": "0"}
      ]
    }
  }
}
```

**Step 2:** Add to desired styles in `js/cabinet_styles.json`:

```json
{
  "id": "full",
  "panels": [
    "carcass_sides",
    "my_new_panel",
    ...
  ],
  "material_defaults": [
    {
      "thickness": 0.75,
      "components": ["carcass_sides", "my_new_panel"]
    }
  ]
}
```

The UI will automatically:
- Calculate dimensions from expressions
- Add to BOM with proper quantity
- Render in 3D with correct position/orientation
- Include in cut optimization
- Show in plywood assignment table

## Adding New Cabinet Styles

Edit `js/cabinet_styles.json`:

```json
{
  "id": "my_custom_style",
  "label": "My Custom Style",
  "description": "Description of what this style does",
  "panels": [
    "carcass_sides",
    "carcass_top",
    ...
  ],
  "material_defaults": [
    {"thickness": 0.75, "components": ["carcass_sides", "carcass_top"]},
    {"thickness": 0.5, "components": ["drawer_sides"]}
  ]
}
```

Then add option to `js/inputs.json`:

```json
{
  "variable_id": "backing_style",
  "type": "select",
  "options": [
    {"value": "my_custom_style", "label": "My Custom Style"},
    ...
  ]
}
```

## Testing

### Python 3D Visualization Tests

```bash
# Run visualization test with defaults (auto-setup)
make test-viz

# Run with specific test scenario
make test-viz CONFIG=test_configs.json

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
make test
```

Validates all JSON files and checks for:
- JSON syntax errors
- Required structures and fields
- Circular dependencies in variables

**Run this after editing any JSON configuration files.**

## File Structure

### Core Application
- `index.html` - Main application (HTML + CSS + JavaScript)

### Data Model (`js/` folder)
- `panels.json` - Panel metadata (dimensions, quantities, 3D properties)
- `cabinet_styles.json` - Style definitions (panel lists, material defaults)
- `variables.json` - All variables (inputs, plywood, calculated)
- `inputs.json` - UI configuration (sections, layouts, conditional visibility)
- `equations.json` - Calculated dimensions array (legacy)
- `test_configs.json` - Test scenarios (default, large, compact)
- `tests.js` - Test suite placeholder

### Tests (`tests/` folder)
- `test_3d_positions.py` - Python 3D visualization test script
- `validate_config.py` - JSON validator with circular dependency check

### Build & Utilities
- `serve.sh` - HTTP server startup script
- `Makefile` - Test automation (uses tests/ folder)
- `CLAUDE.md` - Comprehensive developer documentation
- `README.md` - This file

## Troubleshooting

### "Failed to load configuration files" error

- Make sure you're accessing via HTTP (`http://localhost:8000`)
- Check that the `js/` folder exists with all JSON files
- Check browser console (F12) for specific error details
- Verify file paths in browser network tab

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
