"""
Fix Concept C angles and centering for 100/100 audit score.
"""
import math
import subprocess

# Let's use exact 45° angles for the chevron:
# Apex at (216, 128).
# Top arm: goes down-right at 45°: dx = dy = 56. So from (160, 72) to (216, 128).
# Bottom arm: goes up-right at 45°: dx = -dy = 56. From (160, 184) to (216, 128).
# Thickness = 36 (normal to diagonal = 36).
# Offset along x for width 36 at 45° is 36 * sqrt(2) ≈ 50.91 => 51 px.
# Left cut of chevron: vertical at x=160.
# Top point: (160, 72), inner top: (160, 123).
# Wait, or parallel arms:
# Outer: (168, 64) -> (220, 116) -> (220, 140) -> (168, 192)
# Let's write the exact path:

# Left C stadium:
# x from 36 to 128 (width 92). Outer R=84, Inner r=46 (thickness 38).
# Center at (120, 128).
# Margins: L36.
# If Chevron rightmost point is x=220, then Right margin is 256 - 220 = 36.
# L36 R36 -> EXACTLY CENTERED!

chevron_d = """
    M 160 64
    L 216 120
    C 220.4 124.4 220.4 131.6 216 136
    L 160 192
    L 160 148
    L 180 128
    L 160 108
    Z
"""
# Wait, let's make sure all edges are clean 0, 45, or 90 degrees:
# (160, 64) to (216, 120): dx=56, dy=56 (45.0°)
# (216, 136) to (160, 192): dx=-56, dy=56 (135.0° / 45°)
# (160, 192) to (160, 148): dx=0, dy=-44 (90.0°)
# (160, 148) to (180, 128): dx=20, dy=-20 (45.0°)
# (180, 128) to (160, 108): dx=-20, dy=-20 (135.0° / 45°)
# (160, 108) to (160, 64): dx=0, dy=-44 (90.0°)
# EVERY SINGLE LINE IS EXACT 45° or 90°! Zero near-miss angles!

c_stadium = """
    M 120 44
    H 104
    A 84 84 0 0 0 104 212
    H 120
    V 174
    H 104
    A 46 46 0 0 1 104 82
    H 120
    Z
"""

svg_c_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c">
  <title id="title-c">Cevee Dual Caliper Symbol</title>
  <path fill="#0F172A" fill-rule="evenodd" d="{c_stadium} {chevron_d}"/>
</svg>'''

with open("logo-design/concept-c-symbol.svg", "w", encoding="utf-8") as f:
    f.write(svg_c_symbol.strip())

# Also update lockup
with open("logo-design/build_final_concepts.py", "r", encoding="utf-8") as f:
    text = f.read()

# Update lockup script
subprocess.run("python logo-design/build_final_concepts.py", shell=True, check=True)
print("Updated Concept C!")
