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


def check_panels_structure(filepath):
    """Check that required fields exist in panels.json"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)

        all_ok = True
        required_fields = ['key', 'name', 'dimensions', 'viz3d']

        for panel_key, panel in data.items():
            # Check required fields
            for field in required_fields:
                if field not in panel:
                    print(f"❌ Panel '{panel_key}' missing field '{field}'")
                    all_ok = False

            # Check dimensions structure
            if 'dimensions' in panel:
                dim_fields = ['width', 'height', 'thickness']
                for dim in dim_fields:
                    if dim not in panel['dimensions']:
                        print(f"❌ Panel '{panel_key}' missing dimension '{dim}'")
                        all_ok = False

            # Check viz3d structure
            if 'viz3d' in panel:
                viz_fields = ['color', 'orientation', 'instances']
                for viz in viz_fields:
                    if viz not in panel['viz3d']:
                        print(f"❌ Panel '{panel_key}' missing viz3d field '{viz}'")
                        all_ok = False

        if all_ok:
            print(f"✅ All panels have required fields")

        return all_ok
    except FileNotFoundError:
        print(f"❌ {filepath} not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ {filepath} invalid JSON: {e}")
        return False


def check_cabinet_styles_structure(filepath, panels_filepath):
    """Check that required fields exist in cabinet_styles.json and references are valid"""
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)

        with open(panels_filepath, 'r') as f:
            panels = json.load(f)

        all_ok = True

        if 'styles' not in data:
            print(f"❌ Missing 'styles' array")
            return False

        for style in data['styles']:
            style_id = style.get('id', 'UNKNOWN')

            # Check required style fields
            required_fields = ['id', 'label', 'description', 'panels', 'material_defaults']
            for field in required_fields:
                if field not in style:
                    print(f"❌ Style '{style_id}' missing field '{field}'")
                    all_ok = False

            # Check panel references
            if 'panels' in style:
                for panel_ref in style['panels']:
                    # Extract panel key (handle both string and object format)
                    panel_key = panel_ref if isinstance(panel_ref, str) else panel_ref.get('key')

                    if panel_key not in panels:
                        print(f"❌ Style '{style_id}' references unknown panel '{panel_key}'")
                        all_ok = False

            # Check material_defaults references
            if 'material_defaults' in style:
                for mat_def in style['material_defaults']:
                    if 'thickness' not in mat_def:
                        print(f"❌ Style '{style_id}' material_default missing 'thickness'")
                        all_ok = False

                    if 'components' not in mat_def:
                        print(f"❌ Style '{style_id}' material_default missing 'components'")
                        all_ok = False
                    else:
                        # Check that all components reference valid panels
                        for component in mat_def['components']:
                            if component not in panels:
                                print(f"❌ Style '{style_id}' material_default references unknown panel '{component}'")
                                all_ok = False

        if all_ok:
            print(f"✅ All styles have required fields and valid references")

        return all_ok
    except FileNotFoundError:
        print(f"❌ {filepath} or {panels_filepath} not found")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False


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

    # Get the parent directory (project root) since script is in tests/ folder
    project_root = Path(__file__).parent.parent

    # Validate JSON files in js/ folder (relative to project root)
    json_files = [
        project_root / 'js/equations.json',
        project_root / 'js/inputs.json',
        project_root / 'js/variables.json',
        project_root / 'js/panels.json',
        project_root / 'js/cabinet_styles.json',
        project_root / 'tests/test_configs.json'
    ]
    json_valid = all(validate_json_file(str(f)) for f in json_files)

    if not json_valid:
        print()
        print("❌ Validation failed due to invalid JSON")
        return 1

    # Check inputs.json structure
    print()
    print("Checking inputs.json structure...")
    inputs_ok = check_required_inputs(str(project_root / 'js/inputs.json'))

    # Check equations.json structure
    print()
    print("Checking equations.json structure...")
    equations_ok = check_equations_structure(str(project_root / 'js/equations.json'))

    # Check panels.json structure
    print()
    print("Checking panels.json structure...")
    panels_ok = check_panels_structure(str(project_root / 'js/panels.json'))

    # Check cabinet_styles.json structure and references
    print()
    print("Checking cabinet_styles.json structure...")
    styles_ok = check_cabinet_styles_structure(
        str(project_root / 'js/cabinet_styles.json'),
        str(project_root / 'js/panels.json')
    )

    # Check for circular dependencies
    print()
    print("Checking for circular dependencies...")
    circular_ok = check_circular_dependencies(str(project_root / 'js/variables.json'))

    # Final result
    print()
    if json_valid and inputs_ok and equations_ok and panels_ok and styles_ok and circular_ok:
        print("✅ Validation complete!")
        return 0
    else:
        print("❌ Validation failed")
        return 1


if __name__ == '__main__':
    sys.exit(main())
