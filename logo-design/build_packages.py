"""
Package Builder for Concept A and Concept C.
Generates:
- Master symbols (Cobalt, Slate, Black, White)
- Horizontal lockups (Color, Slate, Black, White)
- Stacked lockups (Color, Slate, Black, White)
- Export variants (--web-icons, PNG scales, favicon.ico, etc.)
- Brand guidelines & usage specs
"""
import os
import subprocess

DIR_A = "logo-design/package-a"
DIR_C = "logo-design/package-c"
os.makedirs(DIR_A, exist_ok=True)
os.makedirs(DIR_C, exist_ok=True)

# -------------------------------------------------------------------------
# PATH DATA
# -------------------------------------------------------------------------
# Concept A symbol path (centered in 256x256)
SYMBOL_A_D = """
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

# Concept C symbol path (centered in 256x256)
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
"""

# Wordmark paths
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

# Stacked wordmark path (centered on 320x320 canvas: width 272, centered x=24..296)
def get_stacked_wordmark(ox=24, oy=210, color="#0F172A"):
    # Baseline oy=240, cap height 76
    return get_wordmark(ox, color)

print("Path helpers ready.")
