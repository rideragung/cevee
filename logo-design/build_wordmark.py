"""
Build Cevee wordmark path and test lockups.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

def generate_wordmark_path(offset_x=248, baseline=166):
    """
    Constructs clean, outlined path data for the wordmark 'Cevee'.
    Cap-height: 76 (y = 90..166)
    x-height: 54 (y = 112..166)
    All curves mathematically calculated and smooth.
    """
    # Letter C: x from offset_x to offset_x + 58
    # e1: x from offset_x + 68 to offset_x + 114
    # v:  x from offset_x + 124 to offset_x + 172
    # e2: x from offset_x + 182 to offset_x + 228
    # e3: x from offset_x + 238 to offset_x + 284
    ox = offset_x
    
    # Path for C (Cap height 76, y: 90..166):
    # Outer: M ox+56 106 C ...
    # Let's write out precise SVG path:
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

    # Helper for lowercase 'e':
    def e_path(x):
        # x-height: y from 112 to 166. Middle bar at y=138.
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

    # Lowercase 'v':
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

# Test lockup
test_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 256" width="640" height="256">
  <rect width="640" height="256" fill="#F8FAFC"/>
  <!-- Symbol placeholder -->
  <circle cx="128" cy="128" r="64" fill="#0F172A"/>
  <!-- Wordmark -->
  {generate_wordmark_path(240, 166)}
</svg>'''

with open("logo-design/test_wordmark.svg", "w", encoding="utf-8") as f:
    f.write(test_svg)

cmd = "python .agents/skills/logo-design/scripts/render_png.py logo-design/test_wordmark.svg -o logo-design/renders/test_wordmark.png --size 640"
subprocess.run(cmd, shell=True, check=True)
print("Rendered test_wordmark.png")
