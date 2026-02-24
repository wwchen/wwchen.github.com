# Data-Driven 3D Visualization Refactoring

## Current State
`render3DCabinet()` is ~260 lines of procedural code with hardcoded positioning and conditionals.

## Proposed Data-Driven Approach

### 1. Update `equations.panels.*.viz3d` Structure

Add `color` and restructure to support different rendering patterns:

```javascript
viz3d: {
    color: 0xD2B48C,  // Hex color
    instances: [      // Array of static instances
        { x: '...', y: '...', z: '...' },
        { x: '...', y: '...', z: '...' }
    ]
}

// OR for looped components (drawers):
viz3d: {
    color: 0xF5DEB3,
    loop: 'num_drawers',  // Variable to loop over
    instances: [
        { x: '...', y: '...', z: '...' }  // Evaluated for each i
    ]
}

// OR with condition:
viz3d: {
    color: 0xA0826D,
    condition: 'backing_style === "full"',
    instances: [...]
}
```

### 2. Create Helper Function

```javascript
function renderPanel3D(panelKey, panel, user_inputs) {
    const viz = panel.viz3d;
    if (!viz) return;

    // Check condition if present
    if (viz.condition && !evaluateExpr(viz.condition, user_inputs)) {
        return;
    }

    // Evaluate dimensions
    const width = evaluateExpr(panel.dimensions.width, user_inputs);
    const height = evaluateExpr(panel.dimensions.height, user_inputs);
    const depth = evaluateExpr(panel.dimensions.thickness, user_inputs);

    // Handle loop or static instances
    if (viz.loop) {
        const loopCount = user_inputs[viz.loop];
        for (let i = 0; i < loopCount; i++) {
            const loopInputs = { ...user_inputs, i };
            viz.instances.forEach(inst => {
                renderInstance(inst, width, height, depth, viz.color, loopInputs);
            });
        }
    } else {
        viz.instances.forEach(inst => {
            renderInstance(inst, width, height, depth, viz.color, user_inputs);
        });
    }
}

function renderInstance(inst, width, height, depth, color, user_inputs) {
    const x = evaluateExpr(inst.x, user_inputs);
    const y = evaluateExpr(inst.y, user_inputs);
    const z = evaluateExpr(inst.z, user_inputs);

    const box = createPlywoodBox(width, height, depth, depth, color);
    box.position.set(x, y, z);
    cabinetGroup.add(box);
}
```

### 3. Replace render3DCabinet

```javascript
function render3DCabinet(config) {
    // Clear existing
    while(cabinetGroup.children.length > 0) {
        cabinetGroup.remove(cabinetGroup.children[0]);
    }

    // Build user_inputs
    const calc = calculateDimensions(config);
    const user_inputs = buildUserInputs(config, calc);

    // Add calculated values
    for (const [key, expr] of Object.entries(equations.calculated)) {
        user_inputs[key] = evaluateExpr(expr, user_inputs);
    }

    // Render all panels
    for (const [panelKey, panel] of Object.entries(equations.panels)) {
        renderPanel3D(panelKey, panel, user_inputs);
    }

    // Position cabinet
    cabinetGroup.position.set(-user_inputs.dim_w/2, 0, -user_inputs.dim_d/2);
}
```

## Benefits

1. **No hardcoded positions** - all from equations structure
2. **Single source of truth** - positions defined once
3. **Easier to maintain** - change position in data, not code
4. **Testable** - can validate positions match BOM dimensions
5. **Consistent** - BOM, viz3d, and equations all aligned

## Implementation Steps

1. Update all panels in equations.panels with viz3d color and instances
2. Create renderPanel3D and renderInstance helper functions
3. Replace render3DCabinet with data-driven version
4. Test that 3D visualization matches previous behavior
5. Handle special cases (railings, grooves) if needed
