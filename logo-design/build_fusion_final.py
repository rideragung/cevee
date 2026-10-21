"""
Generate exact Fusion AC symbol and lockup.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

# Wordmark generator (same standard)
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

upper_c = """
    M 196 62
    C 176 38 146 26 116 26
    C 69.6 26 32 63.6 32 110
    C 32 124 35.8 137.2 42.4 148.6
    L 55 147
    L 83 119
    C 77.2 116.4 74 113.4 74 110
    C 74 86.8 92.8 68 116 68
    C 134 68 150 79.2 157.6 95.4
    L 196 62
    Z
"""

lower_v = """
    M 68 160
    L 138 230
    L 222 146
    L 194 118
    L 138 174
    L 96 132
    Z
"""

symbol_fusion_d = upper_c.strip() + " " + lower_v.strip()

svg_fusion_symbol = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-fusion">
  <title id="title-fusion">Cevee Fusion Symbol (Caliper Vertex)</title>
  <path fill="#0F172A" d="{upper_c.strip()}"/>
  <path fill="#0F172A" d="{lower_v.strip()}"/>
</svg>'''

svg_fusion_lockup = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 256" width="600" height="256" role="img" aria-labelledby="title-fusion-lockup">
  <title id="title-fusion-lockup">Cevee Logo - Fusion AC</title>
  <g id="symbol" transform="translate(36, 40) scale(0.6875)">
    <path fill="#0F172A" d="{upper_c.strip()}"/>
    <path fill="#0F172A" d="{lower_v.strip()}"/>
  </g>
  <g id="wordmark">
    {get_wordmark(240)}
  </g>
</svg>'''

# Two-tone version (Brand Cobalt + Slate)
svg_fusion_color = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="title-fusion-color">
  <title id="title-fusion-color">Cevee Fusion Symbol (Cobalt Vertex)</title>
  <!-- Upper C Stadium in Dark Slate -->
  <path fill="#0F172A" d="{upper_c.strip()}"/>
  <!-- Lower V Checkmark in Cevee Cobalt -->
  <path fill="#1E66FF" d="{lower_v.strip()}"/>
</svg>'''

files = {
    "concept-fusion-symbol.svg": svg_fusion_symbol,
    "concept-fusion-lockup.svg": svg_fusion_lockup,
    "concept-fusion-color.svg": svg_fusion_color,
}

for name, content in files.items():
    p = os.path.join("logo-design", name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(content.strip())
    png_p = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
    width = 600 if "lockup" in name else 256
    cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_p} --size {width}"
    subprocess.run(cmd, shell=True, check=True)

print("Generated Fusion AC assets!")
