# Cabinet Maker Pro - Claude Context

## Project Overview

A fully **data-driven** cabinet design tool with 3D visualization, BOM generation, and cut optimization. Everything is driven by JSON configuration files - no hardcoded values.

**Core Principle:** Single source of truth in JSON files. The UI and all calculations read from `equations.json` and `inputs.json`.

## Quick Start

```bash
./serve.sh
# Open http://localhost:8000
```

**Important:** Must be served via HTTP (not `file://`) because fetch() API requires it.

## Architecture

### Data Flow

```
equations.json + inputs.json
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
- `equations.json` - ALL panel definitions, dimensions (expressions), 3D viz config, calculated dimensions
- `inputs.json` - ALL input definitions, labels, defaults, layout hints, conditional visibility

**Configuration:**
- `test_configs.json` - Multiple test scenarios (default, large, compact)

**Utilities:**
- `serve.sh` - HTTP server startup
- `validate_config.sh` - Validates JSON files
- `test_3d_positions.py` - Python 3D visualization testing
- `Makefile` - Test automation

## Critical Concepts

### 1. Panel Key vs Component Name Mapping

**Problem:** `equations.json` uses plural panel keys (e.g., `drawer_stretchers`, `back_stretchers`) but the plywood table stores singular component names (e.g., `drawer_stretcher`, `back_stretcher`).

**Solution:** `getPanelComponentName()` function maps between them:

```javascript
// Panel key → Component name
'drawer_stretchers' → 'drawer_stretcher'
'back_stretchers' → 'back_stretcher'
'drawer_front_back' → 'drawer_sides'
'drawer_faces' → 'drawer_face'
```

Used by:
- `getAvailableComponents()` - For plywood table UI
- `generateBOM()` - For looking up plywood thickness/material

### 2. 3D Coordinate System and Orientation

**Coordinate System:**
- **(0, 0, 0)** = **front-left-bottom corner** of the cabinet
- **X axis** = Width (0 = left edge, increases → right)
- **Y axis** = Height (0 = floor, increases → up)
- **Z axis** = Depth (0 = front face, increases → back)

**Panel Positioning:**
- All `(x, y, z)` coordinates in `equations.json` represent the **front-left-bottom corner** of each panel
- `renderInstance()` in `index.html` automatically adds half-dimensions to position the Three.js box (which uses center-based positioning)

**Orientations:**
Three orientations defined in `equations.json` under `viz3d.orientation`:

- **`horizontal`**: Lies flat - BOM(W,H,T) → 3D(X=W, Y=T, Z=H)
  - Examples: carcass_top, drawer_bottom, drawer_stretchers
- **`vertical`**: Stands upright - BOM(W,H,T) → 3D(X=W, Y=H, Z=T)
  - Examples: back_stretchers, drawer_front_back, carcass_back
- **`rotated`**: 90° rotation - BOM(W,H,T) → 3D(X=T, Y=H, Z=W)
  - Examples: carcass_sides, drawer_sides

**Why:** Panels are defined in 2D (BOM dimensions) but rendered in 3D space. Orientation determines axis mapping.

### 3. Expression Evaluation

Dimensions in `equations.json` are **string expressions** evaluated at runtime:

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

1. Edit `equations.json` → add to `panels` object:

```json
"my_panel": {
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
      {"x": "dim_w / 2", "y": "dim_h / 2", "z": "0"}
    ]
  }
}
```

2. If new component name, add to `getPanelComponentName()` mapping if needed

3. UI automatically picks it up - no code changes needed!

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
1. `equations` and `inputsConfig` must load before `calculate()` is called
2. All major functions check: `if (!equations || !equations.panels)` and bail early

**Check console:**
- Look for "equations not loaded yet" errors
- Use browser DevTools (F12) to inspect `equations`, `plywoodData`, `user_inputs`

**Validate configs:**
```bash
./validate_config.sh
```

## Recent Refactoring History

### What Was Done

1. **Removed hardcoded HTML inputs** → All generated from `inputs.json`
2. **Extracted equations** → Moved to `equations.json` (was inline in HTML)
3. **Made 3D rendering data-driven** → Replaced ~260 lines of procedural code
4. **Config-driven components** → `getAvailableComponents()` reads from equations.json
5. **Removed assembly section** → Simplified UI
6. **Removed test suite UI** → External tests only (tests.js placeholder exists)
7. **Consolidated test configs** → Single `test_configs.json` with multiple scenarios
8. **Fixed panel key mapping** → Created `getPanelComponentName()` to handle plural→singular

### Current State

- **~2200 lines** in index.html (was ~2700+)
- **Zero hardcoded component lists** - all config-driven
- **Single source of truth** - equations.json + inputs.json
- **Clean file structure** - Only 1 README, no redundant docs

## Known Gotchas

### 1. Plywood Component Names Must Match

The component names in `plywoodData[]` must match what `getAvailableComponents()` returns (after mapping through `getPanelComponentName()`).

**Wrong:**
```javascript
components: ['drawer_stretchers']  // Panel key
```

**Right:**
```javascript
components: ['drawer_stretcher']  // Component name
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
- Panel `(x, y, z)` in `equations.json` = **front-left-bottom corner** position
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

**`renderPanel3D(panelKey, panel, user_inputs)`** - Renders one panel type
- Evaluates dimensions from expressions
- Loops through instances (including `loop` if present)
- Calls `renderInstance()` for each

**`renderInstance(inst, width, height, depth, color, user_inputs, panelKey, orientation)`**
- Maps BOM dimensions to 3D based on orientation
- Creates Three.js box and adds to scene

**`getAvailableComponents(backingStyle)`** - Returns component list for plywood table
- Iterates `equations.panels`
- Filters by backing style conditions
- Maps panel keys to component names
- Deduplicates

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

**`getPanelComponentName(panelKey)`** - Maps panel key to component name
```javascript
getPanelComponentName('drawer_stretchers') // → 'drawer_stretcher'
```

**`getPlywoodForComponent(component)`** - Finds plywood row for component
```javascript
getPlywoodForComponent('drawer_stretcher')
// → {thickness: 0.75, material: 'birch'}
```

## Testing

### Validate Configs
```bash
./validate_config.sh
```

### Python 3D Tests
```bash
make test
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

1. **Always check if configs are loaded** before accessing `equations` or `inputsConfig`
2. **Use getPanelComponentName()** when working with plywood table mappings
3. **Call calculate()** after any data changes
4. **Remember the orientation system** when debugging 3D issues
5. **Check browser console** - defensive checks log helpful errors
6. **Run validate_config.sh** after editing JSON files
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
