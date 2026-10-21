"""
Build package C efficiently.
"""
import os
import subprocess

DIR_C = "logo-design/package-c"
os.makedirs(DIR_C, exist_ok=True)

SYMBOL_C_D = """
  M 128 44
  H 112
  A 84 84 0 0 0 112 212
  H 128
  V 174
  H 112
  A 46 46 0 0 1 112 82
  H 128
  Z
  M 168 64
  L 224 120
  C 228.4 124.4 228.4 131.6 224 136
  L 168 192
  L 168 148
  L 188 128
  L 168 108
  Z
""".strip()

def get_wordmark(ox=244, color="#0F172A"):
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

    return f'<path fill="{color}" fill-rule="evenodd" d="{c_path} {e1} {v_path} {e2} {e3}"/>'

def build_symbol_svg(path_d, color, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="symbol-title">
  <title id="symbol-title">{title}</title>
  <path fill="{color}" fill-rule="evenodd" d="{path_d}"/>
</svg>'''

def build_horizontal_svg(path_d, sym_color, text_color, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 256" width="600" height="256" role="img" aria-labelledby="lockup-title">
  <title id="lockup-title">{title}</title>
  <g id="symbol" transform="translate(36, 40) scale(0.6875)">
    <path fill="{sym_color}" fill-rule="evenodd" d="{path_d}"/>
  </g>
  <g id="wordmark">
    {get_wordmark(240, text_color)}
  </g>
</svg>'''

def build_stacked_svg(path_d, sym_color, text_color, title):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" role="img" aria-labelledby="stacked-title">
  <title id="stacked-title">{title}</title>
  <g id="symbol" transform="translate(90, 32) scale(0.546875)">
    <path fill="{sym_color}" fill-rule="evenodd" d="{path_d}"/>
  </g>
  <g id="wordmark" transform="translate(-130, 80) scale(0.72)">
    {get_wordmark(240, text_color)}
  </g>
</svg>'''

out_dir = DIR_C
symbols = {
    "cevee-symbol-cobalt.svg": build_symbol_svg(SYMBOL_C_D, "#1E66FF", "Cevee Dual Caliper - Cobalt Symbol"),
    "cevee-symbol-slate.svg": build_symbol_svg(SYMBOL_C_D, "#0F172A", "Cevee Dual Caliper - Slate Symbol"),
    "cevee-symbol-black.svg": build_symbol_svg(SYMBOL_C_D, "#000000", "Cevee Dual Caliper - Black Symbol"),
    "cevee-symbol-white.svg": build_symbol_svg(SYMBOL_C_D, "#FFFFFF", "Cevee Dual Caliper - White Symbol"),
}
for fname, content in symbols.items():
    with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
        f.write(content.strip())

horizontals = {
    "cevee-horizontal-color.svg": build_horizontal_svg(SYMBOL_C_D, "#1E66FF", "#0F172A", "Cevee Dual Caliper - Color Lockup"),
    "cevee-horizontal-slate.svg": build_horizontal_svg(SYMBOL_C_D, "#0F172A", "#0F172A", "Cevee Dual Caliper - Slate Lockup"),
    "cevee-horizontal-black.svg": build_horizontal_svg(SYMBOL_C_D, "#000000", "#000000", "Cevee Dual Caliper - Black Lockup"),
    "cevee-horizontal-white.svg": build_horizontal_svg(SYMBOL_C_D, "#FFFFFF", "#FFFFFF", "Cevee Dual Caliper - White Lockup"),
}
for fname, content in horizontals.items():
    with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
        f.write(content.strip())

stacked = {
    "cevee-stacked-color.svg": build_stacked_svg(SYMBOL_C_D, "#1E66FF", "#0F172A", "Cevee Dual Caliper - Stacked Color Lockup"),
    "cevee-stacked-slate.svg": build_stacked_svg(SYMBOL_C_D, "#0F172A", "#0F172A", "Cevee Dual Caliper - Stacked Slate Lockup"),
    "cevee-stacked-black.svg": build_stacked_svg(SYMBOL_C_D, "#000000", "#000000", "Cevee Dual Caliper - Stacked Black Lockup"),
    "cevee-stacked-white.svg": build_stacked_svg(SYMBOL_C_D, "#FFFFFF", "#FFFFFF", "Cevee Dual Caliper - Stacked White Lockup"),
}
for fname, content in stacked.items():
    with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
        f.write(content.strip())

# Web icons and PNG exports for C
sym_path = os.path.join(out_dir, "cevee-symbol-cobalt.svg")
cmd_sym = [
    "python", ".agents/skills/logo-design/scripts/export_variants.py",
    sym_path,
    "--name", "cevee-symbol",
    "--title", "Cevee Dual Caliper",
    "--mono", "#0F172A",
    "--icon-bg", "#1E66FF",
    "--web-icons",
    "--png", "256", "512",
    "--out-dir", out_dir
]
subprocess.run(cmd_sym, check=True)

# Lockup PNGs
for lockup_file in ["cevee-horizontal-color.svg", "cevee-horizontal-slate.svg", "cevee-horizontal-white.svg"]:
    p = os.path.join(out_dir, lockup_file)
    subprocess.run([
        "python", ".agents/skills/logo-design/scripts/render_png.py",
        p, "--size", "600", "-o", os.path.join(out_dir, lockup_file.replace(".svg", ".png"))
    ], check=True)

for stack_file in ["cevee-stacked-color.svg", "cevee-stacked-slate.svg"]:
    p = os.path.join(out_dir, stack_file)
    subprocess.run([
        "python", ".agents/skills/logo-design/scripts/render_png.py",
        p, "--size", "320", "-o", os.path.join(out_dir, stack_file.replace(".svg", ".png"))
    ], check=True)

print("Package C generated successfully!")
