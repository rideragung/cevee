"""
Mathematical refinement of Concept A: The Monogram Vertex (C + V + Checkmark)
"""
import math
import subprocess
import os

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

def build_refined_monogram(thickness=38, R_out=88, R_in=50, cx=120, cy=112):
    # Outer circle: center (cx, cy), radius R_out.
    # Bottom V vertex: (vx, vy). Let vx = 132, vy = 228.
    # Right arm of V goes up-right at 45 deg to (212, 148).
    # Perpendicular cut of width `thickness`:
    # dx = -thickness * cos(45), dy = -thickness * sin(45)
    # Let's compute exact geometric points:
    pass

# Let's test a clean geometric script that writes SVG and renders it
code = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Concept A: Precision Monogram Vertex -->
  <!-- Top terminal: horizontal at x=196, y=72 -->
  <!-- Arc sweeps counter-clockwise from (196, 72) around (120, 116) to (36, 116) -->
  <!-- Tangent transition into 45° diagonal to (132, 232) -->
  <!-- Ascends at 45° to (216, 148) -->
  <!-- Perpendicular end-cap to (188, 120) -->
  <!-- Descends at 45° to inner vertex (132, 176) -->
  <!-- Ascends at 45° to meet inner circular arc tangent -->
  <!-- Inner arc sweeps to (196, 110) -->
  <!-- Vertical cut to (196, 72) -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 196 68
    C 176 44 148 32 116 32
    C 69.6 32 32 69.6 32 116
    C 32 142.5 44.3 166.1 63.6 181.6
    L 132 232
    L 216 148
    L 188 120
    L 132 176
    L 88 144
    C 77 136 70 126.8 70 116
    C 70 90.6 90.6 70 116 70
    C 134 70 149.6 80.4 157.2 95.6
    L 196 68
    Z
  "/>
</svg>'''

with open("logo-design/refined_a.svg", "w", encoding="utf-8") as f:
    f.write(code)

cmd = "python .agents/skills/logo-design/scripts/render_png.py logo-design/refined_a.svg -o logo-design/renders/refined_a.png --size 256"
subprocess.run(cmd, shell=True, check=True)
print("Rendered refined_a.png")
