# Cabinet Maker Pro - Claude Context

## Project Overview

A fully **data-driven** cabinet design tool with 3D visualization, BOM generation, and cut optimization. Everything is driven by JSON configuration files - no hardcoded values.

**Core Principle:** Single source of truth in JSON files. The UI and all calculations read from `panels.json`, `cabinet_styles.json`, `variables.json`, and `inputs.json`.

## Quick Start

```bash
./serve.sh
# Open http://localhost:8000
```

**Important:** Must be served via HTTP (not `file://`) because fetch() API requires it.

## Architecture

### Data Flow

```
User Input (backing_style)
    ↓
cabinet_styles.json → determines active panels
    ↓
panels.json → panel metadata (dimensions, viz3d)
    ↓
variables.json → dimension calculations
    ↓
User changes inputs or plywood assignments
    ↓
calculate() function
    ↓
Updates: BOM → Cut Optimizer → 3D Viz → Calculated Dimensions → Debug
```

### Key Files

**Core Application:**
- `index.html` - Single-file app (~2200 lines): HTML + CSS + JavaScript

**Data Model (`js/` folder):**
- `js/panels.json` - Panel metadata: dimensions (expressions), 3D viz config, quantities
- `js/cabinet_styles.json` - Cabinet styles: panel lists, material assignments per style
- `js/variables.json` - All variables: inputs, plywood thicknesses, calculated values
- `js/inputs.json` - UI configuration: input sections, layouts, conditional visibility
- `js/equations.json` - (Legacy) Still contains calculated dimensions array
- `js/test_configs.json` - Multiple test scenarios (default, large, compact)
- `js/tests.js` - Test suite placeholder

**Utilities:**
- `serve.sh` - HTTP server startup
- `validate_config.py` - Validates JSON files and checks circular dependencies
- `test_3d_positions.py` - Python 3D visualization testing
- `Makefile` - Test automation

## Data Models & Schemas

### Overview

The application uses **4 primary data models** with clean separation of concerns:

| File | Purpose | Contains |
|------|---------|----------|
| `panels.json` | **Panel Metadata** | What panels exist, their dimensions, 3D properties |
| `cabinet_styles.json` | **Style Definitions** | When panels are used, material assignments |
| `variables.json` | **Variables** | How dimensions are calculated (inputs, plywood, calculated) |
| `inputs.json` | **UI Configuration** | How inputs are displayed (sections, layouts, conditions) |

### Panel Schema (`panels.json`)

Defines physical components with dimensions and visualization properties.

**Complete Schema:**
```typescript
interface Panel {
  key: string;              // Unique identifier (same as object key)
  name: string;             // Display name in BOM
  dimensions: {
    width: string;          // Expression: "dim_w - 2 * ply_carcass"
    height: string;         // Expression: "dim_h"
    thickness: string;      // Expression: "ply_carcass"
  };
  quantity: number | string; // Fixed: 2 or expression: "num_drawers * 2"
  applies_to?: string[];    // Optional: ["full", "inlay"] - restricts to styles
  viz3d: {
    color: number;          // Decimal color code: 13808780
    orientation: "horizontal" | "vertical" | "rotated";
    loop?: string;          // Optional: "num_drawers" - repeat instances
    condition?: string;     // Optional: "drawer_face_enabled" - visibility
    instances: Array<{
      x: string;            // Expression: "ply_carcass"
      y: string;            // Expression: "i * drawer_height"
      z: string;            // Expression: "dim_d - ply_back"
      condition?: string;   // Optional: "i > 0" - per-instance condition
    }>;
  };
}
```

**Example:**
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

### Cabinet Style Schema (`cabinet_styles.json`)

Defines which panels are used in each cabinet configuration.

**Complete Schema:**
```typescript
interface CabinetStyles {
  styles: Array<CabinetStyle>;
}

interface CabinetStyle {
  id: string;               // Unique identifier: "full", "inlay", "stretcher", "none"
  label: string;            // Display name: "Full Plywood"
  description: string;      // User-friendly explanation
  panels: Array<string | PanelOverride>;
  material_defaults: Array<MaterialDefault>;
}

interface PanelOverride {
  key: string;              // Panel key to override
  dimensions?: Partial<Dimensions>;  // Override specific dimensions
  quantity?: number | string;        // Override quantity
  viz3d?: Partial<Viz3D>;           // Override 3D properties
}

interface MaterialDefault {
  thickness: number;        // 0.75, 0.5, 0.25, 0
  material?: string;        // Optional: "birch", "maple" (future use)
  components: string[];     // Panel keys: ["carcass_sides", "carcass_top"]
}
```

**Example:**
```json
{
  "styles": [
    {
      "id": "inlay",
      "label": "Routed Inlay",
      "description": "Thin back panel set in routed groove",
      "panels": [
        "carcass_sides",
        "carcass_top",
        {
          "key": "carcass_back",
          "dimensions": {
            "width": "dim_w - 2 * ply_carcass - 0.25",
            "height": "dim_h - 2 * ply_carcass - 0.25"
          }
        },
        "drawer_stretcher",
        ...
      ],
      "material_defaults": [
        {
          "thickness": 0.75,
          "components": ["carcass_sides", "carcass_top", "drawer_stretcher"]
        },
        {
          "thickness": 0.25,
          "components": ["drawer_bottom", "carcass_back"]
        }
      ]
    }
  ]
}
```

### Variable Schema (`variables.json`)

Defines all variables: user inputs, plywood thicknesses, and calculated values.

**Complete Schema:**
```typescript
interface VariablesConfig {
  variables: Array<Variable>;
}

interface Variable {
  id: string;               // Unique identifier: "dim_w", "ply_carcass"
  label: string;            // Display name: "Width", "Carcass Plywood Thickness"
  type: "input" | "plywood" | "calculated";
  value: number | string;   // Default value or expression
  unit: "inch" | "count" | "boolean" | "none";
}
```

**Variable Types:**

| Type | Description | Example |
|------|-------------|---------|
| `input` | User-editable values | `dim_w`, `num_drawers`, `backing_style` |
| `plywood` | Thickness values from material table | `ply_carcass`, `ply_drawer` |
| `calculated` | Computed from expressions | `drawer_width`, `drawer_height` |

**Example:**
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

**Note:** Plywood variables no longer have a `component` field - material assignments come from `cabinet_styles.json`.

### Input Schema (`inputs.json`)

Defines UI sections, layouts, and conditional visibility.

**Complete Schema:**
```typescript
interface InputsConfig {
  sections: Array<Section>;
}

interface Section {
  title: string;            // Section heading: "Cabinet Dimensions"
  type?: "plywood_table";   // Special type for plywood table section
  inputs?: Array<Input>;    // Input field definitions
}

interface Input {
  variable_id: string;      // References variable in variables.json
  type?: "select";          // Optional: for dropdowns
  step?: number;            // Numeric step: 0.125
  min?: number;             // Min value
  max?: number;             // Max value
  layout?: "row2" | "row3"; // Optional: multi-column layout
  condition?: string;       // Optional: "backing_style === 'stretcher'"
  options?: Array<Option>;  // For select inputs
}

interface Option {
  value: string;            // Option value: "full"
  label: string;            // Display label: "Full Plywood"
}
```

**Example:**
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
    },
    {
      "title": "Cabinet Style",
      "inputs": [
        {
          "variable_id": "backing_style",
          "type": "select",
          "options": [
            {"value": "none", "label": "None"},
            {"value": "stretcher", "label": "Stretcher Only"},
            {"value": "inlay", "label": "Routed Inlay"},
            {"value": "full", "label": "Full Plywood"}
          ]
        }
      ]
    }
  ]
}
```

## Critical Concepts

### 1. Cabinet Styles and Panel Selection

**Cabinet styles** define which panels are used and their default material assignments:

- **Full Plywood** (`full`) - Solid plywood back panel
- **Routed Inlay** (`inlay`) - Thin back panel in routed groove (smaller dimensions)
- **Stretcher Only** (`stretcher`) - Top/bottom stretchers instead of full back
- **None** (`none`) - No backing

The active style is determined by `backing_style` input. The `getActivePanels(backingStyle)` function:
1. Looks up style in `cabinet_styles.json`
2. Returns panels from `panels.json` for that style
3. Applies style-specific overrides (e.g., inlay back is smaller)

**Panel Keys = Component Names:**
Panel keys in `panels.json` directly correspond to component names used in the plywood table. For example:
- `drawer_stretcher` - Panel key and component name
- `back_stretcher` - Panel key and component name
- `carcass_back` - Used by both `full` and `inlay` styles (with dimension override in inlay)

The code uses panel keys directly - no mapping needed.

### 2. 3D Coordinate System and Orientation

**Coordinate System:**
- **(0, 0, 0)** = **front-left-bottom corner** of the cabinet
- **X axis** = Width (0 = left edge, increases → right)
- **Y axis** = Height (0 = floor, increases → up)
- **Z axis** = Depth (0 = front face, increases → back)

**Panel Positioning:**
- All `(x, y, z)` coordinates in `panels.json` represent the **front-left-bottom corner** of each panel
- `renderInstance()` in `index.html` automatically adds half-dimensions to position the Three.js box (which uses center-based positioning)

**Orientations:**
Three orientations defined in `panels.json` under `viz3d.orientation`:

- **`horizontal`**: Lies flat - BOM(W,H,T) → 3D(X=W, Y=T, Z=H)
  - Examples: carcass_top, drawer_bottom, drawer_stretchers
- **`vertical`**: Stands upright - BOM(W,H,T) → 3D(X=W, Y=H, Z=T)
  - Examples: back_stretchers, drawer_front_back, carcass_back
- **`rotated`**: 90° rotation - BOM(W,H,T) → 3D(X=T, Y=H, Z=W)
  - Examples: carcass_sides, drawer_sides

**Why:** Panels are defined in 2D (BOM dimensions) but rendered in 3D space. Orientation determines axis mapping.

### 3. Expression Evaluation

Dimensions in `panels.json` and `variables.json` are **string expressions** evaluated at runtime:

```json
"width": "dim_w - 2 * ply_carcass"
```

**Functions:**
- `evaluateExpr(expr, user_inputs)` - Evaluates expression, returns number
- `buildEquationString(expr, user_inputs)` - Builds display string with substituted values

**Important:** All expressions are evaluated AFTER `user_inputs` is built with config + calc + plywood data.

### 4. Calculated Dimensions

`equations.calculated` is an **array** of dimension groups:

```json
{
  "key": "overall",
  "label": "Carcass Total (W×H×D)",
  "width": "dim_w",
  "height": "dim_h",
  "depth": "dim_d"
}
```

Results stored as **nested objects** in `user_inputs`:
- `user_inputs.overall.width`
- `user_inputs.interior.height`
- `user_inputs.drawer.depth`

Plus **flat aliases** for backwards compatibility:
- `user_inputs.overall_width`
- `user_inputs.drawer_height`

### 5. Plywood Table Data Structure

```javascript
plywoodData = [
  {
    thickness: 0.75,
    material: 'birch',
    components: ['carcass_sides', 'carcass_top', 'drawer_stretcher']
  }
]
```

**Drag & Drop:**
- Users drag component pills between rows
- `handleDrop()` / `handleDropToAvailable()` update `plywoodData[]`
- Both call `calculate()` to recompute everything

## Common Tasks

### Adding a New Panel

1. Edit `panels.json` → add panel definition:

```json
"my_panel": {
  "key": "my_panel",
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
      {"x": "dim_w / 2", "y": "dim_h / 2", "z": "0"}
    ]
  }
}
```

2. Edit `cabinet_styles.json` → add panel to desired styles:

```json
{
  "id": "full",
  "label": "Full Plywood",
  "panels": [
    "carcass_sides",
    "my_panel",  // Add here
    ...
  ],
  "material_defaults": [
    {
      "thickness": 0.75,
      "components": ["carcass_sides", "my_panel"]  // And here
    }
  ]
}
```

3. UI automatically picks it up - no code changes needed!

### Adding a New Cabinet Style

1. Edit `cabinet_styles.json` → add style definition:

```json
{
  "id": "my_style",
  "label": "My Custom Style",
  "description": "Description of what this style does",
  "panels": [
    "carcass_sides",
    "carcass_top",
    "drawer_stretcher",
    ...
  ],
  "material_defaults": [
    {"thickness": 0.75, "components": ["carcass_sides", "carcass_top"]},
    {"thickness": 0.5, "components": ["drawer_sides"]},
    {"thickness": 0.25, "components": ["drawer_bottom"]},
    {"thickness": 0, "components": ["drawer_face"]}
  ]
}
```

2. Edit `inputs.json` → add option to backing_style dropdown:

```json
{
  "variable_id": "backing_style",
  "type": "select",
  "options": [
    { "value": "my_style", "label": "My Custom Style" },
    ...
  ]
}
```

### Overriding Panel Properties Per Style

To customize a panel for a specific style (e.g., smaller back panel for inlay):

```json
{
  "id": "inlay",
  "panels": [
    "carcass_sides",
    {
      "key": "carcass_back",
      "dimensions": {
        "width": "dim_w - 2 * ply_carcass - 0.25",  // Override width
        "height": "dim_h - 2 * ply_carcass - 0.25"  // Override height
      }
    },
    ...
  ]
}
```

The override is deep-merged with the base panel definition from `panels.json`.

### Adding a New Input

Edit `inputs.json`:

```json
{
  "id": "my_input",
  "label": "My Input (in)",
  "type": "number",
  "value": 1.0,
  "step": 0.125,
  "layout": "row3"  // optional: row2, row3 for grouping
}
```

Conditional visibility:

```json
{
  "id": "dim_back_stretcher",
  "label": "Back Stretcher Height",
  "type": "number",
  "value": 2.0,
  "condition": {
    "field": "backing_style",
    "value": "stretcher"
  }
}
```

### Debugging Tips

**Check load order:**
1. `equations`, `panels`, `cabinetStyles`, `variablesConfig`, and `inputsConfig` must load before `calculate()` is called
2. All major functions check if configs are loaded and bail early if not

**Check console:**
- Look for "not loaded yet" errors
- Use browser DevTools (F12) to inspect `panels`, `cabinetStyles`, `plywoodData`, `user_inputs`

**Validate configs:**
```bash
make test
```

**Always run after editing JSON files** to check for:
- JSON syntax errors
- Missing required fields
- Circular dependencies in variables

## Recent Refactoring History

### Phase 1 - Data-Driven UI (Complete)

1. **Removed hardcoded HTML inputs** → All generated from `inputs.json`
2. **Extracted equations** → Moved to `equations.json` (was inline in HTML)
3. **Made 3D rendering data-driven** → Replaced ~260 lines of procedural code
4. **Config-driven components** → `getAvailableComponents()` reads from config
5. **Removed assembly section** → Simplified UI
6. **Removed test suite UI** → External tests only (tests.js placeholder exists)
7. **Consolidated test configs** → Single `test_configs.json` with multiple scenarios
8. **Unified naming** → Panel keys match component names directly (no mapping layer)

### Phase 2 - Separation of Concerns (Latest)

1. **Created panels.json** → Extracted panel definitions from equations.json
2. **Created cabinet_styles.json** → Style-driven panel selection and material assignments
3. **Updated variables.json** → Removed component field from plywood variables
4. **Eliminated conditional logic** → Panels no longer have conditions, styles define what's active
5. **Panel override system** → Styles can customize panels (e.g., inlay back is smaller)
6. **Centralized material defaults** → Moved from inputs.json to cabinet_styles.json

### Current State

- **~2200 lines** in index.html (was ~2700+)
- **Zero hardcoded component lists** - all config-driven
- **Single source of truth** - panels.json + cabinet_styles.json + variables.json + inputs.json
- **Clean separation of concerns** - Panels (what), Styles (when), Variables (how much)
- **Style-driven architecture** - Easy to add new cabinet configurations
- **Clean file structure** - Only 1 README, no redundant docs

## Known Gotchas

### 1. Panel Keys = Component Names

Panel keys in `panels.json` are used directly as component names in `plywoodData[]`. They must match exactly:

```javascript
// In panels.json
"drawer_stretcher": { ... }

// In plywoodData
components: ['drawer_stretcher']  // Must match panel key
```

### 2. Must Call calculate() After Changes

Any change to inputs or plywood data must call `calculate()` to update everything:
- BOM table
- 3D visualization
- Calculated dimensions
- Cut optimizer
- Debug output

Already wired up for:
- ✅ Input changes (input/change event listeners)
- ✅ Plywood drag/drop (`handleDrop`, `handleDropToAvailable`)
- ✅ Plywood thickness/material changes (`updatePlywoodRow`)
- ✅ Backing style changes (triggers plywood table update)

### 3. Expression Evaluation Timing

Expressions reference variables in `user_inputs`, which is built from:
1. Config values (from input fields)
2. Calculated dimensions (from `calculateDimensions()`)
3. Plywood thicknesses (from `plywoodData[]`)

**Must evaluate in order:**
```javascript
const config = getInputValues();
const calc = calculateDimensions(config);
const user_inputs = buildUserInputs(config, calc);
evaluateCalculatedValues(equations.calculated, user_inputs);
// Now user_inputs is complete
```

### 4. Three.js Cabinet Positioning

Cabinet group is positioned at the origin with (0,0,0) at the front-left-bottom corner:

```javascript
cabinetGroup.position.set(0, 0, 0);
```

**Panel positioning:**
- Panel `(x, y, z)` in `panels.json` = **front-left-bottom corner** position
- Three.js boxes are positioned by their center, so `renderInstance()` adds half-dimensions:
  ```javascript
  box.position.set(x + boxWidth/2, y + boxHeight/2, z + boxDepth/2);
  ```

### 5. Fetch Requires HTTP

The app loads JSON via `fetch()` which requires HTTP protocol:
- ❌ `file:///path/to/index.html` - Won't work
- ✅ `http://localhost:8000` - Works

If configs don't load, user gets clear error message with instructions.

## Function Reference

### Core Functions

**`calculate()`** - Main orchestrator, calls everything in order
- `getInputValues()` → get form data
- `calculateDimensions(config)` → compute dimensions
- `generateBOM(config, calc)` → build bill of materials
- `optimizeCuts(bom, config)` → layout cuts on sheets
- `render3DCabinet(config)` → update 3D view
- `renderDimensionsDisplay(user_inputs)` → update dimensions section
- `generateDebugOutput()` → update debug section

**`getActivePanels(backingStyle)`** - Returns active panels for current cabinet style
- Looks up style in `cabinet_styles.json`
- Retrieves panel definitions from `panels.json`
- Applies style-specific overrides using `deepMerge()`
- Returns object mapping panel keys to panel definitions

**`deepMerge(base, override)`** - Deep merges panel override with base definition
- Creates deep copy of base panel
- Recursively merges override properties
- Used by `getActivePanels()` for style-specific customizations

**`generateBOM(context, equations, variablesList)`** - Builds bill of materials
- Calls `getActivePanels()` to get panels for current style
- Evaluates dimensions using recursive expression evaluation
- Returns array of BOM entries with dimensions and quantities

**`render3DCabinet(context)`** - Renders 3D visualization
- Calls `getActivePanels()` to get panels for current style
- Iterates through active panels and calls `renderPanel3D()` for each
- Positions cabinet at origin (0,0,0)

**`renderPanel3D(panelKey, panel, user_inputs)`** - Renders one panel type
- Evaluates dimensions from expressions
- Loops through instances (including `loop` if present)
- Calls `renderInstance()` for each

**`renderInstance(inst, width, height, depth, color, user_inputs, panelKey, orientation)`**
- Maps BOM dimensions to 3D based on orientation
- Creates Three.js box and adds to scene

**`getAvailableComponents(backingStyle)`** - Returns component list for plywood table
- Calls `getActivePanels()` to get panels for current style
- Filters out panels without quantity (visualization-only)
- Returns array of panel keys

### Helper Functions

**`evaluateExpr(expr, vars)`** - Evaluates string expression
```javascript
evaluateExpr("dim_w - 2", {dim_w: 25}) // → 23
```

**`buildEquationString(expr, vars)`** - Builds display string
```javascript
buildEquationString("dim_w - 2", {dim_w: 25})
// → "dim_w - 2 = 25 - 2 = 23.00"
```

**`getPlywoodForComponent(component)`** - Finds plywood row for component
```javascript
getPlywoodForComponent('drawer_stretcher')
// → {thickness: 0.75, material: 'birch'}
```

## Testing

### Validate Configs
```bash
make test
```

Checks for JSON syntax errors, missing required fields, and circular dependencies.

### Python 3D Visualization Tests
```bash
make test-viz
```

### Manual Testing Checklist
- [ ] Change cabinet dimensions → BOM updates
- [ ] Drag component between plywood rows → BOM thickness changes
- [ ] Change backing style → Shows/hides relevant components
- [ ] 3D viz updates when inputs change
- [ ] Calculated dimensions update
- [ ] Cut optimizer shows updated layouts

## Future Improvements (Optional)

1. **Migrate test suite** - tests.js is currently a placeholder
2. **Add more test scenarios** - Expand test_configs.json
3. **Export/Import configs** - Save user configurations
4. **Better error messages** - More specific validation errors
5. **Component dependencies** - Auto-assign dependent components

## Tips for Claude

When resuming work on this project:

1. **Always check if configs are loaded** before accessing `panels`, `cabinetStyles`, `variablesConfig`, or `inputsConfig`
2. **Use getActivePanels()** - Don't iterate `panels` directly, use the style resolver
3. **Panel keys are component names** - use them directly, no mapping needed
4. **Call calculate()** after any data changes
5. **Remember the orientation system** when debugging 3D issues
5. **Check browser console** - defensive checks log helpful errors
6. **Run `make test`** after editing JSON files (checks syntax + circular deps)
7. **Test plywood drag/drop** - it's the most complex interaction

## Questions to Ask User

When unclear about changes:
- "Should this update the 3D viz / BOM / calculated dimensions?"
- "Is this component assigned to plywood or standalone?"
- "What backing style should this apply to?" (stretcher / full / inlay)
- "Should this be an expression (string) or a fixed value (number)?"

## Project Status

✅ **Complete & Working:**
- Data-driven architecture
- 3D visualization
- BOM generation
- Cut optimization
- Plywood assignment (drag & drop)
- Calculated dimensions
- Config validation
- HTTP server setup

⚠️ **Placeholder:**
- tests.js (external test suite not yet migrated)

🎯 **Clean & Consolidated:**
- Single README.md
- Single test_configs.json
- No redundant documentation
- All hardcoded values eliminated
