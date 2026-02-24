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

# Check that all required input IDs exist
REQUIRED_IDS="dim_w dim_h dim_d num_drawers backing_style"
for id in $REQUIRED_IDS; do
    if grep -q "\"id\": \"$id\"" inputs.json; then
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
echo "Validation complete!"
