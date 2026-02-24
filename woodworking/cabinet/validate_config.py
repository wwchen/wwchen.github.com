#!/usr/bin/env python3
"""
Cabinet Maker Pro - Configuration Validator

Validates JSON configuration files and checks for circular dependencies
in variable definitions.
"""

import json
import re
import sys
from pathlib import Path


def validate_json_file(filepath):
    """Validate that a file contains valid JSON"""
    try:
        with open(filepath, 'r') as f:
            json.load(f)
        print(f"✅ {filepath} - Valid JSON")
        return True
    except FileNotFoundError:
        print(f"❌ {filepath} - NOT FOUND")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ {filepath} - Invalid JSON: {e}")
        return False


def check_required_inputs(filepath):
    """Check that all required input variable_ids exist"""
    required_ids = ['dim_w', 'dim_h', 'dim_d', 'num_drawers', 'backing_style']

    try:
        with open(filepath, 'r') as f:
            content = f.read()

        all_ok = True
        for var_id in required_ids:
            if f'"variable_id": "{var_id}"' in content:
                print(f"✅ Input '{var_id}' defined")
            else:
                print(f"❌ Input '{var_id}' MISSING")
                all_ok = False

        return all_ok
    except FileNotFoundError:
        return False


def check_equations_structure(filepath):
    """Check that required sections exist in equations.json"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)

        all_ok = True

        if 'panels' in data:
            print("✅ 'panels' section exists")
        else:
            print("❌ 'panels' section MISSING")
            all_ok = False

        if 'calculated' in data:
            print("✅ 'calculated' section exists")
        else:
            print("❌ 'calculated' section MISSING")
            all_ok = False

        return all_ok
    except FileNotFoundError:
        return False


def extract_dependencies(expr, all_var_ids):
    """Extract variable names from expression"""
    keywords = {'true', 'false', 'null', 'undefined'}
    pattern = r'\b[a-zA-Z_][a-zA-Z0-9_]*\b'
    matches = re.findall(pattern, str(expr))
    # Only return known variables
    return [m for m in matches if m not in keywords and m in all_var_ids]


def has_cycle(var_id, visited, path, dependencies_map):
    """DFS to detect cycles in dependency graph"""
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


def check_circular_dependencies(filepath):
    """Check for circular dependencies in variables.json"""
    try:
        with open(filepath, 'r') as f:
            config = json.load(f)
    except FileNotFoundError:
        print(f"❌ {filepath} not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ {filepath} invalid JSON: {e}")
        return False

    variables = config.get('variables', [])
    all_var_ids = [v['id'] for v in variables]
    calculated_vars = [v for v in variables if v.get('type') == 'calculated']

    # Build dependency map
    dependencies_map = {}
    for var in calculated_vars:
        var_id = var['id']
        expr = var.get('value', '')
        deps = extract_dependencies(expr, all_var_ids)
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

    if not has_errors:
        print("✓ No circular dependencies detected")

    return not has_errors


def main():
    """Main validation routine"""
    print("Validating configuration files...")
    print()

    # Validate JSON files
    json_files = ['equations.json', 'inputs.json', 'test_configs.json']
    json_valid = all(validate_json_file(f) for f in json_files)

    if not json_valid:
        print()
        print("❌ Validation failed due to invalid JSON")
        return 1

    # Check inputs.json structure
    print()
    print("Checking inputs.json structure...")
    inputs_ok = check_required_inputs('inputs.json')

    # Check equations.json structure
    print()
    print("Checking equations.json structure...")
    equations_ok = check_equations_structure('equations.json')

    # Check for circular dependencies
    print()
    print("Checking for circular dependencies...")
    circular_ok = check_circular_dependencies('variables.json')

    # Final result
    print()
    if json_valid and inputs_ok and equations_ok and circular_ok:
        print("Validation complete!")
        return 0
    else:
        print("❌ Validation failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())
