"""
Develop Concept B and Concept C variants.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

# Concept B: "The A4 Precision Frame" (Architectural C)
# Proportions: 1 : 1.414 (A4). Width 140, Height 198.
# Canvas 256x256. Center x=128, y=128.
# x from 58 to 198. y from 29 to 227.
# Left spine thickness = 38. Top & bottom arms = 38.
# Outer corners: top-left & bottom-left have rx=20.
# Top-right & bottom-right have rx=8.
# Inner opening has an elegant chamfer or step.
svg_b = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 84 28
    H 188
    C 194.6 28 200 33.4 200 40
    V 84
    H 146
    C 142 84 138 88 138 92
    V 98
    H 104
    C 100 98 96 102 96 106
    V 150
    C 96 154 100 158 104 158
    H 138
    V 164
    C 138 168 142 172 146 172
    H 200
    V 216
    C 200 222.6 194.6 228 188 228
    H 84
    C 62 228 44 210 44 188
    V 68
    C 44 46 62 28 84 28
    Z
  "/>
</svg>'''

# Concept C: "The Precision Caliper" (C-Bracket + Downward V)
# Concentric geometry:
# Center at (128, 128)
# Left element: C-bracket curving from 60° to 300° (outer R=92, inner r=54, thickness=38)
# Right element: Crisp V chevron, centered, pointing down.
svg_c1 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- C Bracket (outer arc from top-right around to bottom-right) -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 152 48
    A 92 92 0 1 0 152 208
    H 116
    A 54 54 0 1 1 116 86
    H 152
    V 48
    Z
  "/>
  <!-- Downward V Chevron in the aperture -->
  <path fill="#0F172A" d="
    M 148 96
    H 186
    L 164 168
    L 142 96
    Z
  "/>
</svg>'''

# What if in Concept C, the V chevron is hollow/ribbon (true V, not filled triangle)?
svg_c2 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- C Bracket on left: centered at (116, 128), outer R=88, inner r=50 -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 140 40
    H 116
    A 88 88 0 0 0 116 216
    H 140
    V 178
    H 116
    A 50 50 0 0 1 116 78
    H 140
    Z
  "/>
  <!-- V Chevron on right: centered at (180, 128) -->
  <path fill="#0F172A" d="
    M 160 84
    L 186 84
    L 214 156
    L 186 156
    L 174 124
    L 162 156
    L 134 156
    Z
  "/>
</svg>'''

# What if Concept C is two interlocking chevrons that form C and V:
# Symmetrical, modern, razor sharp:
svg_c3 = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Outer C frame: 3 sides of a 45° hexagon -->
  <path fill="#0F172A" d="
    M 192 44
    L 108 44
    L 44 108
    V 148
    L 108 212
    L 192 212
    L 164 174
    L 120 174
    L 82 136
    V 120
    L 120 82
    L 164 82
    Z
  "/>
  <!-- Inner V chevron nestled inside: -->
  <path fill="#0F172A" d="
    M 144 100
    L 172 100
    L 196 156
    L 168 156
    L 158 132
    L 148 156
    L 120 156
    Z
  "/>
</svg>'''

files = {
    "test_b.svg": svg_b,
    "test_c1.svg": svg_c1,
    "test_c2.svg": svg_c2,
    "test_c3.svg": svg_c3
}

for name, content in files.items():
    p = os.path.join("logo-design", name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    png_path = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
    cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_path} --size 256"
    subprocess.run(cmd, shell=True, check=True)

print("Rendered test B and C files!")
