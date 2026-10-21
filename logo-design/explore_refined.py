"""
Refined exploration of Cevee logo concepts.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

variants = {}

# Variant 1: "The Monogram Vertex" (Continuous ribbon C + V)
# Hexagonal/chamfered geometry where bottom forms a true V chevron.
variants["v1_monogram_vertex.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 196 48
    H 104
    C 66.4 48 36 78.4 36 116
    V 140
    C 36 156.4 41.8 171.4 51.5 183.2
    L 128 228
    L 204 152
    L 174 122
    L 128 168
    L 86 142.8
    C 84.7 138.8 84 134.5 84 130
    V 116
    C 84 105 93 96 104 96
    H 196
    Z
  "/>
</svg>'''

# Variant 2: "The Interlocking CV" (Clean, high-end tech aesthetic)
# Element 1: Precision C-arc on left (180° rounded stadium with horizontal tabs)
# Element 2: Sharp V-chevron on right, aligned with the C opening, perfectly balanced.
variants["v2_interlocking_cv.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Outer C: stadium arc from top to bottom -->
  <path fill="#0F172A" d="
    M 148 44
    H 96
    A 84 84 0 0 0 96 212
    H 148
    V 168
    H 104
    A 40 40 0 0 1 104 88
    H 148
    Z
  "/>
  <!-- Sharp V chevron: pointing down, perfectly centered in height, 44px thick -->
  <path fill="#0F172A" d="
    M 152 84
    H 196
    L 168 184
    L 140 84
    H 152
    Z
  "/>
</svg>'''

# Let's refine V2 so V is a true chevron (not filled solid triangle):
variants["v2b_chevron_cv.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- C Bracket on left: outer R=84, inner r=44 (thickness 40) -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 136 44
    H 96
    A 84 84 0 0 0 96 212
    H 136
    V 170
    H 100
    A 42 42 0 0 1 100 86
    H 136
    Z
  "/>
  <!-- V Chevron on right: thickness 40, matching C -->
  <path fill="#0F172A" d="
    M 144 80
    L 182 80
    L 214 128
    L 182 176
    L 144 176
    L 176 128
    Z
  "/>
</svg>'''

# Variant 3: "The Pure Monogram C-V (Negative Space)"
# A bold modern tile or shape where C wraps around a negative V.
# What if a single solid shape has a negative space V carved through it?
# Let's try: A solid bold geometric C, and inside its body a crisp V cut:
variants["v3_negative_v.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 128 32
    C 75 32 32 75 32 128
    C 32 181 75 224 128 224
    C 176 224 216 189 223 143
    H 174
    C 168 163 149 178 128 178
    C 100.4 178 78 155.6 78 128
    C 78 100.4 100.4 78 128 78
    C 149 78 168 93 174 113
    H 223
    C 216 67 176 32 128 32
    Z
    M 128 88
    L 156 144
    H 138
    L 128 120
    L 118 144
    H 100
    Z
  "/>
</svg>'''

# Variant 4: "The Precision A4 Gauge (Architectural C)"
# An A4 rectangle with exact ratio 1 : 1.414 (w=148, h=209).
# Left edge is spine, top and bottom are bars, opening in center forms C.
# Inside is a single clean horizontal precision gauge bar.
variants["v4_a4_gauge.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 64 24
    H 184
    C 192.8 24 200 31.2 200 40
    V 84
    H 148
    V 68
    H 108
    V 188
    H 148
    V 172
    H 200
    V 216
    C 200 224.8 192.8 232 184 232
    H 64
    C 55.2 232 48 224.8 48 216
    V 40
    C 48 31.2 55.2 24 64 24
    Z
  "/>
</svg>'''

# Variant 5: "The Diagonal Fold CV" - Minimalist Monoline / Geometric Ribbon
# Inspired by Linear and Supabase: simple, ultra-confident, modern.
# Two parallel 45° diagonal bands connecting into a C and V.
# Let's test a clean stroke / ribbon:
variants["v5_diagonal_ribbon.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Top bar of C -->
  <path fill="#0F172A" d="
    M 64 48
    H 192
    V 88
    H 104
    L 64 48
    Z
  "/>
  <!-- Left diagonal / vertical spine -->
  <path fill="#0F172A" d="
    M 64 48
    L 104 88
    V 168
    L 64 208
    Z
  "/>
  <!-- Bottom chevron V -->
  <path fill="#0F172A" d="
    M 64 208
    L 104 168
    H 136
    L 168 208
    L 208 148
    H 236
    L 176 236
    L 124 168
    H 104
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

print("Rendered all refined variants!")
