"""
Explore and render the 3 directions for Cevee logo.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

# Direction A: "The Monogram Vertex" (C + V)
# Top is circular arc C, bottom transitions into a 45-degree V chevron.
# Let's write the exact SVG path:
# Canvas: 256 x 256
# Center around (128, 128).
# Outer stroke:
# Start at (184, 64) -> Arc left to (128, 36) -> Arc down to (44, 120)
# Line down to (44, 140)
# Angle down-right to apex (136, 232)
# Angle up-right to (212, 156)
# Terminal: cut perpendicular or horizontal?
# Let's write out and render several clean versions.

variants = {}

# A1: Continuous C-V Monogram
# Top terminal at (184, 56)
# Outer:
# M 184 56
# A 88 88 0 0 0 40 128
# L 40 144
# L 128 232
# L 216 144
# L 176 144
# L 128 192
# L 80 144
# L 80 128
# A 48 48 0 0 1 184 96  (wait, let's make inner concentric!)
# Z
variants["concept_a1.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 184 52
    A 84 84 0 0 0 44 128
    L 44 144
    L 128 228
    L 212 144
    L 174 144
    L 128 190
    L 82 144
    L 82 128
    A 46 46 0 0 1 184 90
    Z
  "/>
</svg>'''

# A2: Symmetrical geometric C with nested crisp V inside
# Outer: Perfect circle C with 45-degree aperture
# Center: (124, 128). Outer R = 92, Inner R = 54.
# Opening on the right.
# Inside opening: A bold V chevron!
# Let's test single-color unified mark:
variants["concept_a2.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Outer C: circular arc with 45° angled terminals -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 188 68
    A 92 92 0 1 0 188 188
    L 162 162
    A 54 54 0 1 1 162 94
    Z
  "/>
  <!-- Nested V: sharp chevron in the aperture -->
  <path fill="#0F172A" d="
    M 176 104
    L 204 104
    L 164 196
    L 124 104
    L 152 104
    L 164 144
    Z
  "/>
</svg>'''

# Direction B: "The Architectural C" (Modern Precision Letterform)
# A bold stadium/hexagonal C with exact 45-degree chamfers and horizontal aperture
# In 256x256:
# Outer bounds: x = 44..212 (width 168), y = 36..220 (height 184)
# Thickness = 42
variants["concept_b1.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 108 36
    H 204
    V 80
    H 124
    C 99.7 80 80 99.7 80 124
    V 132
    C 80 156.3 99.7 176 124 176
    H 204
    V 220
    H 108
    C 59.4 220 20 180.6 20 132
    V 124
    C 20 75.4 59.4 36 108 36
    Z
  "/>
</svg>'''

# Direction B2: "The Calibrated A4 C"
# Ratio 1:1.414, solid with precision horizontal cut forming 'C' and an inner 'V' arrow
variants["concept_b2.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 56 32
    H 188
    C 194.6 32 200 37.4 200 44
    V 92
    H 148
    V 84
    H 112
    V 172
    H 148
    V 164
    H 200
    V 212
    C 200 218.6 194.6 224 188 224
    H 56
    C 49.4 224 44 218.6 44 212
    V 44
    C 44 37.4 49.4 32 56 32
    Z
  "/>
  <!-- Precision center bullet / indicator -->
  <rect x="112" y="116" width="56" height="24" rx="4" fill="#0F172A"/>
</svg>'''

# Direction C: "The Dual Geometric Primitives" (Zendesk / Atlassian spirit)
# Two simple, bold geometric solids:
# Left: A pure solid semicircle or C bracket
# Right: An angled chevron or triangle
variants["concept_c1.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Left element: Thick C crescent arc -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 132 44
    A 84 84 0 0 0 132 212
    V 168
    A 40 40 0 0 1 132 88
    Z
  "/>
  <!-- Right element: Bold geometric chevron V -->
  <path fill="#0F172A" d="
    M 152 68
    L 186 68
    L 214 128
    L 186 188
    L 152 188
    L 180 128
    Z
  "/>
</svg>'''

# Direction C2: Two interlocking 45-degree ribbon folds forming C and V
variants["concept_c2.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Top-Left C element -->
  <path fill="#0F172A" d="
    M 48 128
    L 128 48
    H 184
    L 104 128
    L 184 208
    H 128
    Z
  "/>
  <!-- Right V element -->
  <path fill="#0F172A" d="
    M 148 128
    L 196 80
    H 224
    L 176 128
    L 224 176
    H 196
    Z
  "/>
</svg>'''

for name, content in variants.items():
    p = os.path.join("logo-design", name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    png_path = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
    cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_path} --size 256"
    subprocess.run(cmd, shell=True, check=True)

print("Rendered all exploration variants!")
