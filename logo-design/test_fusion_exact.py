"""
Mathematical refinement of Fusion AC: The Split Caliper-Vertex
"""
import math
import subprocess

# Let's derive exact coordinates for Fusion AC:
# Canvas: 256 x 256
# Center: cx = 128, cy = 120
# Outer radius of C = 84, inner radius = 48 (thickness = 36).
# The V chevron at bottom:
# Apex at (140, 230).
# Right arm goes up-right at 45° to (224, 146).
# Right terminal cut perpendicular to (196, 118).
# Inner right diagonal down-left to (140, 174).
# Inner left diagonal goes up-left to (88, 122).
# Outer left diagonal goes up-left to (56, 154).
# Slit angle: 45° line! (perpendicular to stroke: stroke goes down-right at -45°, so cut is at 45° or 135°!)
# Let's check:
# Left stroke goes down-right: dx = +k, dy = +k (angle -45° or 45° down).
# A cut perpendicular to that stroke has angle 135° / -45°: dx = -m, dy = +m.
# Slit width = 16px.
# Top piece ends along line L1.
# Bottom piece starts along line L2, parallel to L1 with distance 16px!

# Let's calculate:
# Line 1 (bottom of upper piece):
# Normal vector: (1/sqrt(2), 1/sqrt(2)).
# Points on line 1:
# Outer edge point: (58, 156)
# Inner edge point: (84, 130)
# Vector from (58, 156) to (84, 130) is dx=26, dy=-26 -> EXACT 45.0°!
# Length = 26 * sqrt(2) ≈ 36.77px (exact stroke thickness 36.8px!).

# Line 2 (top of lower piece):
# Shift by 14px in dx and 14px in dy (distance = 14*sqrt(2) = 19.8px ≈ 20px gap!):
# Outer edge point: (58 + 14, 156 + 14) = (72, 170)
# Inner edge point: (84 + 14, 130 + 14) = (98, 144)
# Vector from (72, 170) to (98, 144): dx=26, dy=-26 -> EXACT 45.0°!
# Both cuts are 100% parallel, exact 45° angle, gap is exactly 19.8px!

upper_piece = """
    M 196 62
    C 176 38 146 26 116 26
    C 69.6 26 32 63.6 32 110
    C 32 127 37 142.8 45.6 156
    L 58 156
    L 84 130
    L 84 122
    C 77.8 118.6 74 114.6 74 110
    C 74 86.8 92.8 68 116 68
    C 134 68 150 79.2 157.6 95.4
    L 196 62
    Z
"""

# Let's smooth the transition into the cut:
# Upper piece:
# Starts at (196, 62)
# Outer arc around (116, 110) with R=84 down to (52, 162).
# Cut from (52, 162) to (78, 136).
# Inner arc from (78, 136) up around (116, 110) with r=48 to (157.6, 95.4).
# Cut to (196, 62).
# That is pure circle arc + exact 45° cut!

# Lower piece:
# Starts at (66, 176) [gap from (52, 162) is dx=14, dy=14, distance=19.8px!]
# Down-right at 45° to apex (140, 230).
# Up-right at 45° to (224, 146).
# Perpendicular cut to (196, 118).
# Down-left at 45° to inner apex (140, 174).
# Up-left at 45° to (92, 150) [gap from (78, 136) is dx=14, dy=14, distance=19.8px!].
# Parallel cut from (92, 150) to (66, 176) [dx=-26, dy=+26 -> exact 45°!].
# Z!

lower_piece = """
    M 66 176
    L 140 230
    L 224 146
    L 196 118
    L 140 174
    L 92 150
    Z
"""

svg_fusion = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-f">
  <title id="title-f">Cevee Fusion Symbol - Caliper Vertex</title>
  <path fill="#0F172A" d="{upper_piece.strip()}"/>
  <path fill="#0F172A" d="{lower_piece.strip()}"/>
</svg>'''

with open("logo-design/concept-fusion-symbol.svg", "w", encoding="utf-8") as f:
    f.write(svg_fusion)

subprocess.run("python .agents/skills/logo-design/scripts/svg_audit.py logo-design/concept-fusion-symbol.svg", shell=True)
subprocess.run("python .agents/skills/logo-design/scripts/render_png.py logo-design/concept-fusion-symbol.svg -o logo-design/renders/concept-fusion-symbol.png --size 256", shell=True)
