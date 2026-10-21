"""
Generate final three candidate symbols and check them.
"""
import subprocess
import os

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# CONCEPT A: "The Monogram Vertex" (Continuous C + V Ribbon)
# -------------------------------------------------------------
# We refine the geometry so every coordinate, angle, and curve is mathematically sound.
# Center of the circular portion: cx = 120, cy = 112.
# Outer R = 84, Inner R = 48. (Thickness = 36).
# Top terminal at x = 184, y = 68.
# Lower diagonal: starts at tangent, goes down-right at 45° to apex (136, 228).
# Right arm rises at 45° to (208, 156).
# Right terminal cuts perpendicular to (182.5, 130.5).
# Inner diagonal goes down-left at 45° to inner apex (136, 177.2).
# Inner left diagonal rises at 45° to meet inner circle tangent at (86, 127).
# Inner circle curves around to top terminal.
concept_a_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Monogram Vertex</title>
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 188 64
    C 168 40 138 28 108 28
    C 61.6 28 24 65.6 24 112
    C 24 138.8 36.4 162.8 55.8 178.6
    L 132 232
    L 216 148
    L 188 120
    L 132 176
    L 86 142
    C 74 133 66 123.4 66 112
    C 66 88.8 84.8 70 108 70
    C 126 70 142 81.2 149.6 97.4
    L 188 64
    Z
  "/>
</svg>'''

# -------------------------------------------------------------
# CONCEPT B: "The Precision A4 Frame" (Architectural Letterform)
# -------------------------------------------------------------
# Proportions: A4 Sheet ratio 1 : 1.414.
# Width = 144, Height = 204.
# Centered at (128, 128).
# x from 56 to 200. y from 26 to 230.
# Left spine: width 40 (x=56 to 96).
# Top bar: y=26 to 66 (thickness 40).
# Bottom bar: y=190 to 230 (thickness 40).
# Opening in middle: x=96 to 200, y=66 to 190.
# Inside opening: An elegant, central precision indicator / rule at y=116..140 (thickness 24),
# forming the resume section anchor and turning the silhouette into a crisp, refined architectural C.
concept_b_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Precision Frame</title>
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 80 26
    H 188
    C 194.6 26 200 31.4 200 38
    V 78
    C 200 84.6 194.6 90 188 90
    H 136
    C 131.6 90 128 93.6 128 98
    V 106
    H 176
    C 182.6 106 188 111.4 188 118
    V 138
    C 188 144.6 182.6 150 176 150
    H 128
    V 158
    C 128 162.4 131.6 166 136 166
    H 188
    C 194.6 166 200 171.4 200 178
    V 218
    C 200 224.6 194.6 230 188 230
    H 80
    C 66.8 230 56 219.2 56 206
    V 50
    C 56 36.8 66.8 26 80 26
    Z
  "/>
</svg>'''

# -------------------------------------------------------------
# CONCEPT C: "The Dual Caliper" (Bracket C + Forward Chevron)
# -------------------------------------------------------------
# Left element: Semicircular stadium C.
# Outer R = 88, Inner R = 48. Thickness = 40.
# x from 36 to 124. y from 40 to 216. Center at (124, 128).
# Right element: Sharp chevron facing right (ATS prompt / forward progress).
# Thickness = 40. Height = 120 (from y=68 to y=188).
# x apex at 220, y=128.
# Gap between C and chevron is a uniform 24px.
concept_c_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Dual Caliper</title>
  <!-- Left element: Geometric C Stadium Arc -->
  <path fill="#0F172A" d="
    M 124 40
    H 108
    A 88 88 0 0 0 108 216
    H 124
    C 130.6 216 136 210.6 136 204
    V 180
    C 136 173.4 130.6 168 124 168
    H 108
    A 40 40 0 0 1 108 88
    H 124
    C 130.6 88 136 82.6 136 76
    V 52
    C 136 45.4 130.6 40 124 40
    Z
  "/>
  <!-- Right element: Forward Chevron Arrow -->
  <path fill="#0F172A" d="
    M 152 74
    C 152 67.4 157.4 62 164 62
    H 182
    C 186.2 62 190.2 64.2 192.6 67.8
    L 225.4 121.8
    C 228.6 125.6 228.6 130.4 225.4 134.2
    L 192.6 188.2
    C 190.2 191.8 186.2 194 182 194
    H 164
    C 157.4 194 152 188.6 152 182
    C 152 178.6 153.4 175.4 155.8 173
    L 182.8 128
    L 155.8 83
    C 153.4 80.6 152 77.4 152 74
    Z
  "/>
</svg>'''

files = {
    "concept-a-symbol.svg": concept_a_svg,
    "concept-b-symbol.svg": concept_b_svg,
    "concept-c-symbol.svg": concept_c_svg,
}

for name, content in files.items():
    p = os.path.join("logo-design", name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    png_path = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
    cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_path} --size 256"
    subprocess.run(cmd, shell=True, check=True)

print("Saved and rendered all 3 candidate symbols!")
