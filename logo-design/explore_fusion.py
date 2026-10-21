"""
Explore fusion of Concept A and Concept C.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

fusions = {}

# -------------------------------------------------------------------------
# Fusion 1: "The Split Monogram" (Concept A split with precision 20px gap)
# Concept A's dynamic form, but split into two interlocking pieces:
# Piece 1: The upper/left sweeping C
# Piece 2: The sharp 45° V-chevron at the bottom
# -------------------------------------------------------------------------
# Let's calculate:
# Cut through Concept A at y = 148 with an angle of 45° or horizontal.
# Left element: C arc from (196, 62) to (50, 160).
# Right/Bottom element: The V chevron from (64, 180) to (140, 230) to (224, 146).
fusions["fusion_1_split_vertex.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Fusion 1 - Split Vertex</title>
  <!-- Element 1: Upper C Stadium/Arc -->
  <path fill="#0F172A" d="
    M 196 62
    C 176 38 146 26 116 26
    C 69.6 26 32 63.6 32 110
    C 32 131.2 39.8 150.6 52.8 165.4
    L 82 136.2
    C 77 128.6 74 119.6 74 110
    C 74 86.8 92.8 68 116 68
    C 134 68 150 79.2 157.6 95.4
    L 196 62
    Z
  "/>
  <!-- Element 2: Lower 45° V-Chevron -->
  <path fill="#0F172A" d="
    M 68 181
    L 140 230
    L 224 146
    L 196 118
    L 140 174
    L 96 144
    C 92 148 88 152 84 156
    L 68 181
    Z
  "/>
</svg>'''

# -------------------------------------------------------------------------
# Fusion 2: "The Caliper V" (Concept C's stadium C + Concept A's sharp V)
# In Concept C, the right element was pointing right (>).
# What if the right element is a sharp V (pointing DOWN), nested in the aperture of C?
# Left: Stadium C.
# Right/Center: A precision V chevron (thickness 36px, same as C).
# -------------------------------------------------------------------------
fusions["fusion_2_caliper_v.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Fusion 2 - Caliper V</title>
  <!-- Left element: Stadium C Bracket -->
  <path fill="#0F172A" d="
    M 124 44
    H 104
    A 84 84 0 0 0 104 212
    H 124
    V 174
    H 104
    A 46 46 0 0 1 104 82
    H 124
    Z
  "/>
  <!-- Center/Right element: Sharp V Chevron pointing down -->
  <path fill="#0F172A" d="
    M 148 76
    H 186
    L 186 96
    L 167 170
    L 148 96
    Z
  "/>
</svg>'''

# -------------------------------------------------------------------------
# Fusion 3: "The Chevron Monogram" (C Stadium whose lower arm BECOMES the V chevron)
# Pure unified geometry:
# Top arm: horizontal stadium bar.
# Spine: circular arc.
# Bottom arm: turns 45° into the forward chevron of Concept C!
# Notice: C's curve + C's forward chevron joined as a single stroke!
# -------------------------------------------------------------------------
fusions["fusion_3_forward_vertex.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Fusion 3 - Forward Vertex</title>
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 188 44
    H 112
    A 84 84 0 0 0 46 160
    L 112 212
    L 204 128
    L 176 100
    L 112 160
    L 82 136
    A 46 46 0 0 1 112 82
    H 188
    Z
  "/>
</svg>'''

# -------------------------------------------------------------------------
# Fusion 4: "The Interlocking Caliper" (C Bracket + Nested 45° Checkmark)
# Two distinct elements with mathematical 20px gap:
# Element 1: C bracket on the left.
# Element 2: Checkmark V (from Concept A) nestled inside the aperture.
# -------------------------------------------------------------------------
fusions["fusion_4_interlock_check.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>Cevee Fusion 4 - Interlocking Check</title>
  <!-- Element 1: C Stadium bracket -->
  <path fill="#0F172A" d="
    M 116 44
    H 96
    A 84 84 0 0 0 96 212
    H 116
    V 174
    H 96
    A 46 46 0 0 1 96 82
    H 116
    Z
  "/>
  <!-- Element 2: V-Checkmark nestled inside (45° angle) -->
  <path fill="#0F172A" d="
    M 132 136
    L 164 168
    L 220 92
    L 194 72
    L 164 114
    L 152 102
    Z
  "/>
</svg>'''

for name, content in fusions.items():
    p = os.path.join("logo-design", name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip())
    png_p = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
    cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_p} --size 256"
    subprocess.run(cmd, shell=True, check=True)

print("Rendered all fusion candidates!")
