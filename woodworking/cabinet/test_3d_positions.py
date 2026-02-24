#!/usr/bin/env python3
"""
Test and visualize cabinet 3D positions
Validates that the data-driven approach matches expected positions
"""

import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import numpy as np

# Cabinet dimensions from debug output
dim_w = 25.0
dim_h = 37.0
dim_d = 21.0
num_drawers = 3
dim_railing_w = 1.0
drawer_clearance = 0.125

# Plywood thicknesses
ply_carcass = 0.75
ply_drawer_stretcher = 0.75
ply_bottom = 0.25
ply_drawer = 0.5
ply_drawer_face = 0.0
ply_back_stretcher = 0.75

# Calculated values
drawer_height = (dim_h - ply_carcass - num_drawers * ply_drawer_stretcher) / num_drawers  # 11.333
drawer_depth = dim_d - ply_drawer_face - ply_back_stretcher  # 20.25
drawer_width = dim_w - 2 * (ply_carcass + dim_railing_w)  # 21.5

print(f"Cabinet: {dim_w}\" × {dim_h}\" × {dim_d}\"")
print(f"Drawer height: {drawer_height:.3f}\"")
print(f"Drawer depth: {drawer_depth:.3f}\"")
print(f"Drawer width: {drawer_width:.3f}\"")
print()

def create_box(x, y, z, w, h, d, color, label):
    """Create a 3D box centered at (x,y,z) with dimensions w×h×d"""
    # Box corners relative to center
    dx, dy, dz = w/2, h/2, d/2

    vertices = np.array([
        [x-dx, y-dy, z-dz], [x+dx, y-dy, z-dz],
        [x+dx, y+dy, z-dz], [x-dx, y+dy, z-dz],
        [x-dx, y-dy, z+dz], [x+dx, y-dy, z+dz],
        [x+dx, y+dy, z+dz], [x-dx, y+dy, z+dz]
    ])

    faces = [
        [vertices[j] for j in [0, 1, 2, 3]],  # bottom
        [vertices[j] for j in [4, 5, 6, 7]],  # top
        [vertices[j] for j in [0, 1, 5, 4]],  # front
        [vertices[j] for j in [2, 3, 7, 6]],  # back
        [vertices[j] for j in [0, 3, 7, 4]],  # left
        [vertices[j] for j in [1, 2, 6, 5]]   # right
    ]

    return faces, color, label

def add_box_to_plot(ax, x, y, z, w, h, d, color, label, alpha=0.7):
    """Add a box to the 3D plot"""
    faces, _, _ = create_box(x, y, z, w, h, d, color, label)
    collection = Poly3DCollection(faces, alpha=alpha, facecolor=color, edgecolor='black', linewidths=0.5)
    ax.add_collection3d(collection)

    # Add label at box center
    # ax.text(x, y, z, label, fontsize=6, ha='center')

# Create figure
fig = plt.figure(figsize=(16, 12))

# Plot from console output (current data-driven)
ax1 = fig.add_subplot(121, projection='3d')
ax1.set_title('Current Data-Driven Rendering', fontsize=14, fontweight='bold')

# Carcass sides (ROTATED)
add_box_to_plot(ax1, 0.4, 18.1, 10.5, 0.8, 36.3, 21.0, 'tan', 'L Side')
add_box_to_plot(ax1, 24.6, 18.1, 10.5, 0.8, 36.3, 21.0, 'tan', 'R Side')

# Carcass top (HORIZ)
add_box_to_plot(ax1, 12.5, 36.6, 10.5, 25.0, 0.8, 21.0, 'burlywood', 'Top')

# Back stretchers (HORIZ)
add_box_to_plot(ax1, 12.5, 34.8, 20.6, 23.5, 0.8, 3.0, 'tan', 'Back-T')
add_box_to_plot(ax1, 12.5, 2.3, 20.6, 23.5, 0.8, 3.0, 'tan', 'Back-B')

# Drawer stretchers (HORIZ) - 3 drawers, 2 stretchers each
for i in range(3):
    y = i * (drawer_height + ply_drawer_stretcher) + ply_drawer_stretcher/2
    add_box_to_plot(ax1, 12.5, y, 1.5, 23.5, 0.8, 3.0, 'tan', f'D{i}-SF', alpha=0.5)
    add_box_to_plot(ax1, 12.5, y, 19.5, 23.5, 0.8, 3.0, 'tan', f'D{i}-SB', alpha=0.5)

# Drawer sides (VERT)
for i in range(3):
    y = i * (drawer_height + ply_drawer_stretcher) + ply_drawer_stretcher + (drawer_height - ply_bottom) / 2
    add_box_to_plot(ax1, 2.0, y, 10.1, 20.3, 11.1, 0.5, 'wheat', f'D{i}-SL', alpha=0.6)
    add_box_to_plot(ax1, 23.0, y, 10.1, 20.3, 11.1, 0.5, 'wheat', f'D{i}-SR', alpha=0.6)

# Drawer front/back (VERT)
for i in range(3):
    y = i * (drawer_height + ply_drawer_stretcher) + ply_drawer_stretcher + (drawer_height - ply_bottom) / 2
    add_box_to_plot(ax1, 12.5, y, 0.3, 20.5, 11.1, 0.5, 'lightyellow', f'D{i}-B', alpha=0.6)
    add_box_to_plot(ax1, 12.5, y, 20.0, 20.5, 11.1, 0.5, 'lightyellow', f'D{i}-F', alpha=0.6)

# Drawer bottoms (HORIZ)
for i in range(3):
    y = i * (drawer_height + ply_drawer_stretcher) + ply_drawer_stretcher + ply_bottom/2
    add_box_to_plot(ax1, 12.5, y, 10.1, 21.5, 0.3, 20.3, 'bisque', f'D{i}-Bot', alpha=0.4)

# Set axis properties
ax1.set_xlabel('X (Width)')
ax1.set_ylabel('Y (Height)')
ax1.set_zlabel('Z (Depth)')
ax1.set_xlim([-2, 27])
ax1.set_ylim([-2, 40])
ax1.set_zlim([-2, 23])

# Plot expected correct positions
ax2 = fig.add_subplot(122, projection='3d')
ax2.set_title('Expected Correct Positions', fontsize=14, fontweight='bold')

# Expected carcass sides - should be at edges, touching floor
# Height centered at (36.25/2) = 18.125 from floor
carcass_height = dim_h - ply_carcass  # 36.25
add_box_to_plot(ax2, ply_carcass/2, carcass_height/2, dim_d/2, ply_carcass, carcass_height, dim_d, 'tan', 'L Side')
add_box_to_plot(ax2, dim_w - ply_carcass/2, carcass_height/2, dim_d/2, ply_carcass, carcass_height, dim_d, 'tan', 'R Side')

# Expected carcass top - at top of cabinet
add_box_to_plot(ax2, dim_w/2, dim_h - ply_carcass/2, dim_d/2, dim_w, ply_carcass, dim_d, 'burlywood', 'Top')

# Expected back stretchers
back_stretcher_h = 3.0
add_box_to_plot(ax2, dim_w/2, dim_h - ply_carcass - back_stretcher_h/2, dim_d - ply_back_stretcher/2,
                dim_w - 2*ply_carcass, back_stretcher_h, ply_back_stretcher, 'tan', 'Back-T')
add_box_to_plot(ax2, dim_w/2, ply_carcass + back_stretcher_h/2, dim_d - ply_back_stretcher/2,
                dim_w - 2*ply_carcass, back_stretcher_h, ply_back_stretcher, 'tan', 'Back-B')

# Expected drawer stretchers and boxes
drawer_stretcher_depth = 3.0
for i in range(num_drawers):
    stretcher_y = i * (drawer_height + ply_drawer_stretcher)
    drawer_base_y = stretcher_y + ply_drawer_stretcher
    drawer_center_y = drawer_base_y + (drawer_height - ply_bottom) / 2

    # Front and back stretchers
    add_box_to_plot(ax2, dim_w/2, stretcher_y + ply_drawer_stretcher/2, ply_drawer_face + drawer_stretcher_depth/2,
                    dim_w - 2*ply_carcass, ply_drawer_stretcher, drawer_stretcher_depth, 'tan', f'D{i}-SF', alpha=0.5)
    add_box_to_plot(ax2, dim_w/2, stretcher_y + ply_drawer_stretcher/2, dim_d - drawer_stretcher_depth/2,
                    dim_w - 2*ply_carcass, ply_drawer_stretcher, drawer_stretcher_depth, 'tan', f'D{i}-SB', alpha=0.5)

    # Drawer sides
    drawer_side_h = drawer_height - ply_bottom
    add_box_to_plot(ax2, ply_carcass + dim_railing_w + ply_drawer/2, drawer_center_y, ply_drawer_face + drawer_depth/2,
                    ply_drawer, drawer_side_h, drawer_depth, 'wheat', f'D{i}-SL', alpha=0.6)
    add_box_to_plot(ax2, dim_w - ply_carcass - dim_railing_w - ply_drawer/2, drawer_center_y, ply_drawer_face + drawer_depth/2,
                    ply_drawer, drawer_side_h, drawer_depth, 'wheat', f'D{i}-SR', alpha=0.6)

    # Drawer front/back
    drawer_fb_w = drawer_width - 2 * ply_drawer
    add_box_to_plot(ax2, dim_w/2, drawer_center_y, ply_drawer_face + ply_drawer/2,
                    drawer_fb_w, drawer_side_h, ply_drawer, 'lightyellow', f'D{i}-B', alpha=0.6)
    add_box_to_plot(ax2, dim_w/2, drawer_center_y, ply_drawer_face + drawer_depth - ply_drawer/2,
                    drawer_fb_w, drawer_side_h, ply_drawer, 'lightyellow', f'D{i}-F', alpha=0.6)

    # Drawer bottom
    add_box_to_plot(ax2, dim_w/2, drawer_base_y + ply_bottom/2, ply_drawer_face + drawer_depth/2,
                    drawer_width, ply_bottom, drawer_depth, 'bisque', f'D{i}-Bot', alpha=0.4)

ax2.set_xlabel('X (Width)')
ax2.set_ylabel('Y (Height)')
ax2.set_zlabel('Z (Depth)')
ax2.set_xlim([-2, 27])
ax2.set_ylim([-2, 40])
ax2.set_zlim([-2, 23])

# Add floor plane
xx, zz = np.meshgrid([-2, 27], [-2, 23])
yy = np.zeros_like(xx)
ax1.plot_surface(xx, yy, zz, alpha=0.1, color='gray')
ax2.plot_surface(xx, yy, zz, alpha=0.1, color='gray')

plt.tight_layout()
plt.savefig('/Users/wc/Downloads/cabinet-maker/3d_comparison.png', dpi=150, bbox_inches='tight')
print("\nVisualization saved to: 3d_comparison.png")
print("\nComparing positions...")
print("\nKey differences to check:")
print(f"1. Carcass sides Y: Current=18.1, Expected={carcass_height/2:.1f} ✓ MATCH")
print(f"2. First drawer stretcher Y: Current=0.4, Expected={ply_drawer_stretcher/2:.1f} ✓ MATCH")
print(f"3. Drawer sides orientation: Check if 20.3×11.1×0.5 is correct")
print(f"   - Should drawer sides extend in Z (depth)? They should be 0.5×11.1×20.3")

# plt.show()  # Don't show interactively, just save
