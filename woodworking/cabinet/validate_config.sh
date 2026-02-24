#!/bin/bash

echo "Validating configuration files..."
echo ""

# Validate JSON files
for file in equations.json inputs.json test_configs.json; do
    if [ ! -f "$file" ]; then
        echo "❌ $file - NOT FOUND"
        continue
    fi
    
    if python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "✅ $file - Valid JSON"
    else
        echo "❌ $file - Invalid JSON"
    fi
done

echo ""
echo "Checking inputs.json structure..."

# Check that all required input variable_ids exist
REQUIRED_IDS="dim_w dim_h dim_d num_drawers backing_style"
for id in $REQUIRED_IDS; do
    if grep -q "\"variable_id\": \"$id\"" inputs.json; then
        echo "✅ Input '$id' defined"
    else
        echo "❌ Input '$id' MISSING"
    fi
done

echo ""
echo "Checking equations.json structure..."

# Check required structures exist
if grep -q '"panels"' equations.json; then
    echo "✅ 'panels' section exists"
else
    echo "❌ 'panels' section MISSING"
fi

if grep -q '"calculated"' equations.json; then
    echo "✅ 'calculated' section exists"
else
    echo "❌ 'calculated' section MISSING"
fi

echo ""
echo "Checking for circular dependencies..."

# Check for circular dependencies in variables.json
python3 - <<'EOF'
import json
import re
import sys

# Load variables.json
try:
    with open('variables.json', 'r') as f:
        config = json.load(f)
except FileNotFoundError:
    print("❌ variables.json not found")
    sys.exit(1)
except json.JSONDecodeError as e:
    print(f"❌ variables.json invalid JSON: {e}")
    sys.exit(1)

variables = config.get('variables', [])
all_var_ids = [v['id'] for v in variables]
calculated_vars = [v for v in variables if v.get('type') == 'calculated']

def extract_dependencies(expr):
    """Extract variable names from expression"""
    keywords = {'true', 'false', 'null', 'undefined'}
    pattern = r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
    matches = re.findall(pattern, str(expr))
    # Only return known variables
    return [m for m in matches if m not in keywords and m in all_var_ids]

def has_cycle(var_id, visited, path, dependencies_map):
    """DFS to detect cycles"""
    if var_id in path:
        cycle = ' → '.join(path + [var_id])
        return True, cycle

    if var_id in visited:
        return False, None

    visited.add(var_id)

    if var_id in dependencies_map:
        for dep in dependencies_map[var_id]:
            has_cycle_result, cycle = has_cycle(dep, visited, path + [var_id], dependencies_map)
            if has_cycle_result:
                return True, cycle

    return False, None

# Build dependency map
dependencies_map = {}
for var in calculated_vars:
    var_id = var['id']
    expr = var.get('value', '')
    deps = extract_dependencies(expr)
    dependencies_map[var_id] = deps

# Check each calculated variable for cycles
has_errors = False
for var in calculated_vars:
    var_id = var['id']
    visited = set()
    has_cycle_result, cycle = has_cycle(var_id, visited, [], dependencies_map)

    if has_cycle_result:
        print(f"❌ Circular dependency detected: {cycle}")
        has_errors = True
    else:
        print(f"✅ {var_id}: OK")

if has_errors:
    sys.exit(1)
else:
    print("✓ No circular dependencies detected")

EOF

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Validation failed due to circular dependencies"
    exit 1
fi

echo ""
echo "Validation complete!"
