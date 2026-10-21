"""
Build the 3 polished concepts for Cevee:
1. Concept A: Monogram Vertex (C + V + Checkmark)
2. Concept B: Precision A4 Frame (Architectural Letterform C)
3. Concept C: Dual Caliper (C-Bracket + Forward Chevron)
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------------------
# WORDMARK GENERATOR
# -------------------------------------------------------------------------
def get_wordmark(ox=244):
    c_path = f"""
      M {ox + 56} 108
      C {ox + 50} 96 {ox + 38} 88 {ox + 26} 88
      C {ox + 10} 88 {ox} 103 {ox} 128
      C {ox} 153 {ox + 10} 168 {ox + 26} 168
      C {ox + 38} 168 {ox + 50} 160 {ox + 56} 148
      L {ox + 44} 142
      C {ox + 40} 150 {ox + 33} 154 {ox + 26} 154
      C {ox + 17} 154 {ox + 14} 143 {ox + 14} 128
      C {ox + 14} 113 {ox + 17} 102 {ox + 26} 102
      C {ox + 33} 102 {ox + 40} 106 {ox + 44} 114
      Z
    """

    def e_path(x):
        return f"""
          M {x + 42} 144
          H {x + 13}
          C {x + 14} 152 {x + 20} 156 {x + 29} 156
          C {x + 35} 156 {x + 40} 153 {x + 43} 148
          L {x + 54} 153
          C {x + 49} 162 {x + 40} 168 {x + 29} 168
          C {x + 12} 168 {x} 155 {x} 139
          C {x} 123 {x + 12} 110 {x + 28} 110
          C {x + 44} 110 {x + 55} 123 {x + 55} 139
          C {x + 55} 141 {x + 54} 144 {x + 54} 144
          H {x + 13}
          M {x + 13} 133
          H {x + 42}
          C {x + 41} 125 {x + 36} 121 {x + 28} 121
          C {x + 20} 121 {x + 15} 125 {x + 13} 133
          Z
        """

    vx = ox + 136
    v_path = f"""
      M {vx} 112
      L {vx + 16} 112
      L {vx + 27} 152
      L {vx + 38} 112
      L {vx + 54} 112
      L {vx + 35} 166
      L {vx + 19} 166
      Z
    """

    e1 = e_path(ox + 68)
    e2 = e_path(ox + 200)
    e3 = e_path(ox + 264)

    return f'<path fill="#0F172A" fill-rule="evenodd" d="{c_path} {e1} {v_path} {e2} {e3}"/>'

# -------------------------------------------------------------------------
# CONCEPT A: Monogram Vertex
# Shifted by +8 in x, -2 in y for mathematical centering!
# -------------------------------------------------------------------------
symbol_a_d = """
    M 196 62
    C 176 38 146 26 116 26
    C 69.6 26 32 63.6 32 110
    C 32 136.8 44.4 160.8 63.8 176.6
    L 140 230
    L 224 146
    L 196 118
    L 140 174
    L 94 140
    C 82 131 74 121.4 74 110
    C 74 86.8 92.8 68 116 68
    C 134 68 150 79.2 157.6 95.4
    L 196 62
    Z
"""

svg_a_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-a">
  <title id="title-a">Cevee Monogram Vertex Symbol</title>
  <path fill="#0F172A" fill-rule="evenodd" d="{symbol_a_d}"/>
</svg>'''

# Scaled down to 144x144 for lockup, centered at (120, 128)
# scale = 144/256 = 0.5625. translate = (48, 48)
svg_a_lockup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 256" width="600" height="256" role="img" aria-labelledby="title-a-lockup">
  <title id="title-a-lockup">Cevee Logo - Monogram Vertex</title>
  <g id="symbol" transform="translate(36, 40) scale(0.6875)">
    <path fill="#0F172A" fill-rule="evenodd" d="{symbol_a_d}"/>
  </g>
  <g id="wordmark">
    {get_wordmark(240)}
  </g>
</svg>'''

# -------------------------------------------------------------------------
# CONCEPT B: Precision A4 Frame (Architectural Letterform)
# Clean, bold C with A4 proportions (144 x 204), no middle E-bar!
# Chamfered 45° top-right corner to evoke document sheet, 24px inner corner radii.
# Width = 144 (x from 56 to 200). Height = 204 (y from 26 to 230).
# Margins: L56 R56 T26 B26 -> Perfectly Centered!
# -------------------------------------------------------------------------
symbol_b_d = """
    M 84 26
    H 176
    L 200 50
    V 86
    C 200 92.6 194.6 98 188 98
    H 124
    C 113 98 104 107 104 118
    V 138
    C 104 149 113 158 124 158
    H 188
    C 194.6 158 200 163.4 200 170
    V 218
    C 200 224.6 194.6 230 188 230
    H 84
    C 68.5 230 56 217.5 56 202
    V 54
    C 56 38.5 68.5 26 84 26
    Z
"""

svg_b_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-b">
  <title id="title-b">Cevee Precision Frame Symbol</title>
  <path fill="#0F172A" fill-rule="evenodd" d="{symbol_b_d}"/>
</svg>'''

svg_b_lockup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 256" width="600" height="256" role="img" aria-labelledby="title-b-lockup">
  <title id="title-b-lockup">Cevee Logo - Precision Frame</title>
  <g id="symbol" transform="translate(36, 40) scale(0.6875)">
    <path fill="#0F172A" fill-rule="evenodd" d="{symbol_b_d}"/>
  </g>
  <g id="wordmark">
    {get_wordmark(240)}
  </g>
</svg>'''

# -------------------------------------------------------------------------
# CONCEPT C: Dual Caliper (C-Stadium + 45° Chevron)
# Centered horizontally:
# C spans x=36 to 120. Chevron spans x=160 to 220.
# Margins: L36 R36 T44 B44 -> Perfectly Centered!
# All angles strictly 0°, 45°, 90°.
# -------------------------------------------------------------------------
symbol_c_c_part = """
    M 128 44
    H 112
    A 84 84 0 0 0 112 212
    H 128
    V 174
    H 112
    A 46 46 0 0 1 112 82
    H 128
    Z
"""

symbol_c_v_part = """
    M 168 64
    L 224 120
    C 228.4 124.4 228.4 131.6 224 136
    L 168 192
    L 168 148
    L 188 128
    L 168 108
    Z
"""

symbol_c_d = symbol_c_c_part + " " + symbol_c_v_part

svg_c_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-c">
  <title id="title-c">Cevee Dual Caliper Symbol</title>
  <path fill="#0F172A" fill-rule="evenodd" d="{symbol_c_d}"/>
</svg>'''

svg_c_lockup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 256" width="600" height="256" role="img" aria-labelledby="title-c-lockup">
  <title id="title-c-lockup">Cevee Logo - Dual Caliper</title>
  <g id="symbol" transform="translate(36, 40) scale(0.6875)">
    <path fill="#0F172A" fill-rule="evenodd" d="{symbol_c_d}"/>
  </g>
  <g id="wordmark">
    {get_wordmark(240)}
  </g>
</svg>'''

# Save all files
targets = {
    "concept-a-symbol.svg": svg_a_symbol,
    "concept-a-lockup.svg": svg_a_lockup,
    "concept-b-symbol.svg": svg_b_symbol,
    "concept-b-lockup.svg": svg_b_lockup,
    "concept-c-symbol.svg": svg_c_symbol,
    "concept-c-lockup.svg": svg_c_lockup,
}

for name, content in targets.items():
    p = os.path.join("logo-design", name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip())
    # Also render png
    png_p = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
    width = 600 if "lockup" in name else 256
    cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_p} --size {width}"
    subprocess.run(cmd, shell=True, check=True)

print("Generated all final SVGs and PNGs!")
