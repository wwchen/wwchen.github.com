# Cabinet Maker Pro

A data-driven cabinet design and visualization tool with automated bill of materials, cut optimization, and 3D rendering.

## Quick Start

```bash
# Install dependencies (first time only)
make install

# Start development server
make dev
```

Then open **http://localhost:5173** in your browser.

## Features

- **Parametric Design**: Define cabinet dimensions and automatically calculate all component sizes
- **Unequal Drawer Heights**: Per-drawer height inputs with total/available tracking and equalize button
- **Style-Driven Architecture**: Cabinet styles define which panels are used and their thickness assignments
- **Data-Driven Configuration**: All data in JSON files - clean separation of concerns
- **3D Visualization**: Real-time Three.js rendering with proper component orientations
- **Bill of Materials**: Automatic BOM generation with detailed dimensions
- **Cut Optimization**: Smart sheet optimization for plywood cuts
- **Drag & Drop Plywood Assignment**: Assign components to different plywood thicknesses
- **Mobile Responsive**: Fully optimized for desktop, tablet, and mobile devices

## Data Model Architecture

Cabinet Maker Pro uses a **separation of concerns** architecture with 4 core data files:

```
User Input (backing_style)
    ↓
cabinet_styles.json → Defines active panels and thickness defaults
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

Defines cabinet styles with panel lists and thickness assignments:

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
- `material_defaults` - Default thickness assignments per component

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
- `plywood` - Thickness values from plywood table
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

### Unit Tests

```bash
# Run all tests
make test

# Run tests in watch mode (auto-rerun on file changes)
make test-watch

# Run tests with coverage report
make test-coverage
```

Tests cover:
- Expression evaluation and variable resolution
- Panel service and cabinet style loading
- BOM generation and grouping logic
- Data loader functionality

### Code Quality

```bash
# Run type checking
make type-check

# Run linter
make lint

# Format code
make format

# Run all quality checks (type-check + lint + test)
make check
```

**Run `make check` before committing to ensure code quality.**

### Python 3D Visualization Tests (Legacy)

```bash
# Run visualization test with defaults (auto-setup)
make test-viz

# Run with specific test scenario
make test-viz CONFIG=test_configs.json
```

This creates a visual comparison of 3D panel positions using matplotlib.

## File Structure

### Source Code (`src/` folder)
- `main.ts` - Application entry point
- `App.vue` - Root component
- `components/` - Vue components (InputSection, BOMTable, PlywoodTable, etc.)
- `composables/` - Vue composables (useCabinetCalculation, useThreeScene)
- `services/` - Business logic (BOMService, PanelService, ExpressionEvaluator, etc.)
- `types/` - TypeScript type definitions
- `data/` - JSON configuration files

### Data Configuration (`src/data/` folder)
- `panels.json` - Panel metadata (dimensions, quantities, 3D properties)
- `cabinet_styles.json` - Style definitions (panel lists, thickness defaults)
- `variables.json` - All variables (inputs, plywood, calculated)
- `inputs.json` - UI configuration (sections, layouts, conditional visibility)
- `equations.json` - Calculated dimensions array

### Tests (`tests/` folder)
- `unit/` - Vitest unit tests
  - `expressionEvaluator.test.ts` - Expression evaluation tests
  - `panelService.test.ts` - Panel service tests
  - `bomService.test.ts` - BOM generation tests
  - `dataLoader.test.ts` - Data loader tests
- `test_3d_positions.py` - Python 3D visualization (legacy)

### Build & Configuration
- `package.json` - npm dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Test configuration
- `.eslintrc.cjs` - ESLint rules
- `.prettierrc.json` - Prettier formatting
- `Makefile` - Development shortcuts
- `.github/workflows/ci.yml` - CI/CD pipeline

### Documentation
- `CLAUDE.md` - Comprehensive developer documentation
- `README.md` - This file
- `PHASE1-COMPLETE.md` - Phase 1 migration notes
- `PHASE2-STATUS.md` - Phase 2 migration notes

## Troubleshooting

### Development server won't start

```bash
# Kill any process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Build errors

```bash
# Clean and reinstall dependencies
make clean
make install

# Run type check to see specific errors
make type-check
```

### Module not found errors

- Make sure all dependencies are installed: `make install`
- Check import paths use `@/` for src directory
- Verify the file exists at the expected path

### Test failures

```bash
# Run tests in watch mode to see detailed output
make test-watch

# Check for type errors that might cause test failures
make type-check
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
