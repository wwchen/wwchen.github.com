# Test Suite Documentation

## Running Tests

### JavaScript Tests (Browser)
Open `index.html` in a browser and click "Run All Tests" in the Debug section.

**New Test Cases Added:**
- **Test 16**: Validates `equations.calculated` is an array with required fields (label, width, height, depth)
- **Test 17**: Verifies nested dimension objects exist in `user_inputs` (overall, interior, drawer)
- **Test 18**: Checks backward compatibility flat aliases (drawer_width, interior_width, etc.)
- **Test 19**: Validates interior dimensions are calculated correctly
- **Test 20**: Confirms drawer dimensions account for railing width
- **Test 21**: Verifies 3D orientation flags are set correctly (horizontal, vertical, rotated)
- **Test 22**: Ensures all viz3d panels have orientation defined

### Python 3D Visualization Tests

The Python script `test_3d_positions.py` generates a side-by-side comparison of the current data-driven 3D rendering vs expected correct positions.

**Using Makefile:**

```bash
# Run test (will setup environment automatically)
make test

# Just setup environment
make setup

# Clean up virtual environment
make clean

# Show help
make help
```

**Manual execution:**

```bash
# Setup (one time)
python3 -m venv venv
source venv/bin/activate
pip install matplotlib numpy

# Run test
python test_3d_positions.py

# View output
open 3d_comparison.png
```

## Test Coverage

### Data Structure Tests
- ✅ Calculated array structure with label, width, height, depth
- ✅ Nested dimension objects (overall.width, interior.height, drawer.depth)
- ✅ Backward compatibility flat aliases (drawer_width, drawer_height, etc.)
- ✅ Interior dimension calculations
- ✅ Drawer dimension calculations with railings

### 3D Rendering Tests
- ✅ Orientation flags (horizontal, vertical, rotated)
- ✅ Component orientation correctness:
  - Horizontal: carcass_top, drawer_stretchers, drawer_bottom
  - Vertical: back_stretchers, carcass_back_full, carcass_back_inlay, drawer_front_back
  - Rotated: carcass_sides, drawer_sides
- ✅ All panels have orientation defined

### Visual Validation
- ✅ Python script generates 3D comparison visualization
- ✅ Side-by-side current vs expected rendering
- ✅ Validates dimensions and positions match expected values

## Architecture Changes Tested

1. **Unified Data Structure**: `equations.calculated` is now an array containing dimension groups with expressions and labels
2. **No Duplication**: Display configuration removed - label and equations defined once in calculated array
3. **Parameterized Orientation**: 3D component orientation driven by `viz3d.orientation` field, not hardcoded arrays
4. **Nested Objects**: Dimensions stored as `{width, height, depth}` objects with flat aliases for compatibility
