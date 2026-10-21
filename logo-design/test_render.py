"""
Render and test candidate logo concepts for Cevee.
"""
import os
import subprocess

OUT_DIR = "logo-design/renders"
os.makedirs(OUT_DIR, exist_ok=True)

def test_render():
    candidates = {}

    # Candidate 1: "The Monogram C-V Interlock"
    # Outer geometric C with 45-degree chamfers and nested V chevron
    candidates["cand_1.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Outer C: rounded geometric arc with horizontal terminals -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 192 48
    C 112 48, 48 84, 48 128
    C 48 172, 112 208, 192 208
    L 192 168
    C 132 168, 88 150, 88 128
    C 88 106, 132 88, 192 88
    Z
  "/>
</svg>'''

    # Candidate 2: "Pure Geometric Monogram CV" - single continuous silhouette
    # C and V merged: The C sweeps around, and its core forms a crisp V in negative space or positive stroke.
    # Let's try: A bold geometric square with corner radius 32, with an inner cutout that forms C and V.
    # What if outer is a rounded rectangle, and the cut forms C and V?
    candidates["cand_2.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- A4 proportioned sheet: width 148, height 208 (1 : 1.405) -->
  <!-- Left spine is thick, top and bottom bars, right side has a V-cut in the counter -->
  <path fill="#0F172A" fill-rule="evenodd" d="
    M 68 28
    H 188
    C 194.6 28 200 33.4 200 40
    V 84
    H 156
    V 72
    H 112
    V 184
    H 156
    V 172
    H 200
    V 216
    C 200 222.6 194.6 228 188 228
    H 68
    C 61.4 228 56 222.6 56 216
    V 40
    C 56 33.4 61.4 28 68 28
    Z
  "/>
</svg>'''

    # Candidate 3: Modern Tech Monogram (like Vercel/Linear/Supabase style):
    # Two crisp, interlocking geometric ribbons: C on left, V on right
    candidates["cand_3.svg"] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Left element: Geometric C bracket -->
  <path fill="#0F172A" d="
    M 136 40
    H 88
    C 57 40 32 65 32 96
    V 160
    C 32 191 57 216 88 216
    H 136
    C 142.6 216 148 210.6 148 204
    V 184
    C 148 177.4 142.6 172 136 172
    H 96
    C 78.3 172 64 157.7 64 140
    V 116
    C 64 98.3 78.3 84 96 84
    H 136
    C 142.6 84 148 78.6 148 72
    V 52
    C 148 45.4 142.6 40 136 40
    Z
  "/>
  <!-- Right element: Nested V chevron -->
  <path fill="#0F172A" d="
    M 176 80
    L 204 80
    L 174 176
    L 144 80
    L 172 80
    Z
  "/>
</svg>'''

    for name, content in candidates.items():
        p = os.path.join("logo-design", name)
        with open(p, "w", encoding="utf-8") as f:
            f.write(content)
        # Render PNG
        png_path = os.path.join(OUT_DIR, name.replace(".svg", ".png"))
        cmd = f"python .agents/skills/logo-design/scripts/render_png.py {p} -o {png_path} --size 256"
        subprocess.run(cmd, shell=True, check=True)

test_render()
print("Render complete!")
